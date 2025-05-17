import fs from "fs";
import path, { join } from "path";
import {
  AITaskStatus as AiTaskStatus,
  type ai_task as PersistedAITask,
} from "shared/models"; // Corrected path and AITaskStatus import, aliased ai_task
import type { TaskName } from "../tasks";
import {
  getClient,
  taskCallback,
  type ClientId,
  type TaskCallback,
} from "./client";
import {
  type ProgressState,
  type WorkerCompleteMessage,
  type WorkerErrorMessage,
  type WorkerInitMessage,
  type WorkerProgressMessage,
  type WorkerToMainMessage,
} from "./task-worker";

export type TaskId = string;
export type AiTask<
  Progress extends ProgressState<any> = ProgressState<any>,
  InputArg extends object = {},
  OutputResult extends object = {}
> = {
  id: TaskId;
  desc: string;
  status: AiTaskStatus; // This status is now AITaskStatus from Prisma
  input: InputArg;
  output: OutputResult | null;
  worker: {
    process: Worker;
    scriptPath: string;
  };
  callbacks: TaskCallback<Progress, OutputResult>;
};

function isValidWorkerPath(scriptPath: string): boolean {
  // Assuming scriptPath is relative to the project root or a known base directory.
  // For this example, let's assume it's relative to 'backend/src/ai/tasks/'
  // This might need adjustment based on actual project structure and how paths are stored.
  const basePath = path.resolve(__dirname, "../tasks"); // Adjust if worker scripts are elsewhere
  const fullPath = path.resolve(basePath, scriptPath);

  // Security: Ensure the path doesn't try to escape the intended directory
  if (!fullPath.startsWith(basePath)) {
    return false;
  }

  return fs.existsSync(fullPath);
}

async function handleWorkerMessage<
  OutputResult extends object,
  Progress extends ProgressState<any>
>(
  event: MessageEvent<WorkerToMainMessage<OutputResult, Progress>>
): Promise<void> {
  const message = event.data;
  const client = getClient(message.client_id);
  const managedTask = client.activeTasks.get(message.task_id);

  if (!managedTask) {
    console.error(
      `[TaskOrchestrator] Received message for unknown taskId: ${message.task_id}`
    );
    return;
  }

  try {
    switch (message.type) {
      case "dbRequest":
        try {
          const table = (db as any)[message.tableName];
          if (!table) {
            managedTask.worker.process.postMessage({
              type: "dbResponse",
              id: message.task_id,
              task_id: message.task_id,
              client_id: message.client_id,
              error: `Table ${message.tableName} not found`,
            });
            return;
          }

          const method = await table[message.method];

          if (!method) {
            managedTask.worker.process.postMessage({
              type: "dbResponse",
              id: message.task_id,
              task_id: message.task_id,
              client_id: message.client_id,
              error: `Method ${message.tableName}.${message.method} not found`,
            });
            return;
          }
          const dbResponse = await method(...message.args);

          managedTask.worker.process.postMessage({
            type: "dbResponse",
            id: message.id,
            client_id: message.client_id,
            task_id: message.task_id,
            result: dbResponse,
          });
        } catch (error: any) {
          managedTask.worker.process.postMessage({
            type: "dbResponse",
            id: message.id,
            client_id: message.client_id,
            task_id: message.task_id,
            error: error.message,
          });
        }
        break;
      case "progress":
        const progressMessage = message as WorkerProgressMessage<Progress>;
        await db.ai_task.update({
          // Use new model name
          where: { id: managedTask.id },
          data: {
            last_progress: progressMessage.progress as any, // Cast to any for Prisma Json type, use new field name
            updated_at: new Date(), // use new field name
          },
        });
        managedTask.callbacks.onProgress?.(progressMessage.progress);
        // TODO: Handle global client state update (message.state) if necessary
        break;

      case "complete":
        const completeMessage = message as WorkerCompleteMessage<OutputResult>;
        await db.ai_task.update({
          // Use new model name
          where: { id: managedTask.id },
          data: {
            status: AiTaskStatus.COMPLETED,
            output: completeMessage.output as any, // Cast to any for Prisma Json type, use new field name
            updated_at: new Date(), // use new field name
          },
        });
        managedTask.callbacks.onComplete?.(completeMessage.output);
        // TODO: Handle global client state update (message.state) if necessary
        client.activeTasks.delete(managedTask.id);
        managedTask.worker.process.terminate();
        break;

      case "error":
        const errorMessage = message as WorkerErrorMessage;
        await db.ai_task.update({
          // Use new model name
          where: { id: managedTask.id },
          data: {
            status: AiTaskStatus.FAILED,
            last_error: {
              message: errorMessage.message,
              stack: errorMessage.stack,
            } as any, // Cast to any, use new field name
            updated_at: new Date(), // use new field name
          },
        });
        managedTask.callbacks.onError?.({
          message: errorMessage.message,
          stack: errorMessage.stack,
        });
        client.activeTasks.delete(managedTask.id);
        managedTask.worker.process.terminate();
        break;
    }
  } catch (dbError) {
    console.error(
      `[TaskOrchestrator] Database error while handling worker message for task ${managedTask.id}:`,
      dbError
    );
    // Potentially try to update task status to FAILED if not already
    managedTask.callbacks.onError?.({
      message: "Internal orchestrator error during worker message handling.",
    });
    client.activeTasks.delete(managedTask.id);
    managedTask.worker.process.terminate();
  }
}

async function spawnAndInitWorker<
  InputParams extends object,
  OutputResult extends object,
  Progress extends ProgressState<any>
>(
  clientId: ClientId,
  persistedTask: PersistedAITask,
  callbacks: TaskCallback<Progress, OutputResult>,
  resumeFromProgress?: Progress
): Promise<void> {
  const workerScriptFullPath = path.resolve(
    __dirname,
    "../tasks",
    persistedTask.worker_script_path
  );

  if (!isValidWorkerPath(workerScriptFullPath)) {
    console.error(
      `[TaskOrchestrator] Invalid worker script path: ${workerScriptFullPath}`
    );
    callbacks.onError?.({
      message: `Invalid worker script path: ${workerScriptFullPath}`,
    });
    return;
  }

  const client = getClient(clientId);
  if (!client) {
    console.error(
      `[TaskOrchestrator] Client not found for clientId: ${clientId}`
    );
    return;
  }

  const worker = new Worker(workerScriptFullPath, { env: process.env as any });
  const input = persistedTask.input as InputParams; // use new field name
  const managedTask: AiTask = {
    id: persistedTask.id,
    desc: persistedTask.name,
    worker: { process: worker, scriptPath: workerScriptFullPath },
    callbacks: taskCallback(client.id, persistedTask.id, persistedTask.name),
    input,
    output: null,
    status: "PENDING",
  };
  client.activeTasks.set(persistedTask.id, managedTask);

  worker.onmessage = handleWorkerMessage;
  worker.onerror = async (err) => {
    console.error(
      `[TaskOrchestrator] Worker error for task ${persistedTask.id}:`,
      err.message
    );
    await db.ai_task.update({
      // Use new model name
      where: { id: persistedTask.id },
      data: {
        status: AiTaskStatus.FAILED,
        last_error: {
          message: "Worker crashed or unhandled error",
          details: err.message,
        } as any, // Cast to any, use new field name
        updated_at: new Date(), // use new field name
      },
    });
    managedTask.callbacks.onError?.({
      message: "Worker crashed or unhandled error",
      stack: err.message,
    });
    client.activeTasks.delete(persistedTask.id);
    // Worker might have already terminated or be in an unstable state.
  };

  const initMessage: WorkerInitMessage<InputParams, Progress> = {
    client_id: clientId,
    type: "init",
    task_id: persistedTask.id,
    input,
    resumeFromProgress,
  };
  worker.postMessage(initMessage);

  await db.ai_task.update({
    where: { id: persistedTask.id },
    data: { status: AiTaskStatus.RUNNING, updated_at: new Date() },
  });
}

export async function submitTask<
  InputParams extends object,
  OutputResult extends object,
  Progress extends ProgressState<any>
>(opt: {
  client_id: ClientId;
  name: TaskName;
  input: InputParams;
  initialized: (task_id: string) => void;
}): Promise<TaskId | null> {
  const { name, input, client_id } = opt;

  const path = join(__dirname, "../tasks", name + ".ts");
  if (!isValidWorkerPath(path)) {
    console.error(
      `[TaskOrchestrator] Submission failed: Invalid worker script path: ${path}`
    );
    return null;
  }

  try {
    const persistedTask = await db.ai_task.create({
      data: {
        name, // use new field name
        worker_script_path: path, // use new field name
        status: AiTaskStatus.PENDING,
        input: input as any, // Cast to any for Prisma Json type, use new field name
        id_client: client_id,
      },
    });

    opt.initialized(persistedTask.id); // Call the initialized callback with the task ID

    let callbacks = taskCallback(
      client_id,
      persistedTask.id,
      persistedTask.name
    );
    await spawnAndInitWorker(client_id, persistedTask, callbacks);
    return persistedTask.id;
  } catch (error: any) {
    console.error("[TaskOrchestrator] Error submitting task:", error);
    return null;
  }
}

export async function resumeTasksOnStartup(): Promise<void> {
  try {
    const tasksToResume = await db.ai_task.findMany({
      // Use new model name
      where: {
        OR: [
          { status: AiTaskStatus.RUNNING },
          { status: AiTaskStatus.PENDING },
          { status: AiTaskStatus.INTERRUPTED }, // Assuming INTERRUPTED implies it was running
        ],
      },
    });

    if (tasksToResume.length === 0) {
      return;
    }

    console.log(
      `[TaskOrchestrator] Found ${tasksToResume.length} tasks to resume.`
    );

    for (const task of tasksToResume) {
      if (!isValidWorkerPath(task.worker_script_path)) {
        console.error(
          `[TaskOrchestrator] Cannot resume task ${task.id}: Invalid worker script path: ${task.worker_script_path}`
        );
        await db.ai_task.update({
          where: { id: task.id },
          data: {
            status: AiTaskStatus.INVALID_WORKER_PATH,
            last_error: {
              message: `Invalid worker script path: ${task.worker_script_path}`,
            } as any,
            updated_at: new Date(),
          },
        });
        continue;
      }

      // For resumed tasks, try to get callbacks from the registry.
      let callbacks = taskCallback(task.id_client, task.id, task.name);

      let resumeFromProgress: ProgressState<any> | undefined = undefined;
      if (task.last_progress) {
        resumeFromProgress =
          task.last_progress as unknown as ProgressState<any>;
      }

      if (!task.last_progress) {
        console.warn(
          `[TaskOrchestrator] last_progress is null for task ${task.id}. Resuming without progress.`
        ); // use new field name
        resumeFromProgress = undefined;
      }

      // If task was PENDING, it means it never started, so no progress to resume from.
      if (task.status === AiTaskStatus.PENDING) {
        resumeFromProgress = undefined;
      }

      console.log(`[TaskOrchestrator] Resuming task ${task.id} (${task.name})`); // use new field name
      try {
        await spawnAndInitWorker(
          task.id_client,
          task,
          callbacks,
          resumeFromProgress
        );
      } catch (spawnError: any) {
        console.error(
          `[TaskOrchestrator] Failed to spawn worker for resumed task ${task.id}:`,
          spawnError
        );
        await db.ai_task.update({
          // Use new model name
          where: { id: task.id },
          data: {
            status: AiTaskStatus.FAILED,
            last_error: {
              message: "Failed to spawn worker on resume.",
              stack: spawnError.stack,
            } as any, // Cast to any, use new field name
            updated_at: new Date(), // use new field name
          },
        });
      }
    }
  } catch (error) {
    console.error("[TaskOrchestrator] Error during task resumption:", error);
  }
}
