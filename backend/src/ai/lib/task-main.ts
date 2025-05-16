import type { ClientState } from "shared/lib/client_state";
// Corrected path to Prisma client and type-only imports
import {
  PrismaClient,
  AITaskStatus,
  type ai_task as PersistedAITask,
} from "../../../../shared/models"; // Corrected path and AITaskStatus import, aliased ai_task
import {
  type ProgressState,
  type WorkerInitMessage,
  type WorkerToMainMessage,
  type WorkerProgressMessage,
  type WorkerCompleteMessage,
  type WorkerErrorMessage,
  AITaskWorker, // AITaskWorker is a class, so it's not a type-only import
} from "./task-worker";
import fs from "fs";
import path from "path";

// Access the global Prisma client instance
const prisma = (global as any).db as PrismaClient;

export type AITaskID = string;

// Callbacks for a managed task
export interface AITaskCallbacks<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState // This is 'details'
> {
  onProgress?: (args: {
    details: TProgressState;
    percent: number;
    clientStateUpdate?: Partial<ClientState>;
  }) => void;
  onComplete?: (output: OUT, clientStateUpdate?: Partial<ClientState>) => void;
  onError?: (error: { message: string; stack?: string }) => void;
}

// In-memory representation of a task managed by the orchestrator
interface ManagedAITask<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState
> {
  dbId: AITaskID;
  taskType: string;
  workerScriptPath: string;
  worker: Worker;
  callbacks: AITaskCallbacks<IN, OUT, TProgressState>;
  input: IN;
  clientStateOnStart: ClientState;
}

// Store for active tasks managed by this orchestrator instance
const allActiveTasks = new Map<AITaskID, ManagedAITask<any, any, any>>();

// Registry for providing callbacks for resumed tasks
type TaskLogicProvider<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState
> = (
  persistedTask: PersistedAITask
) => AITaskCallbacks<IN, OUT, TProgressState>;

const taskLogicProviders = new Map<string, TaskLogicProvider<any, any, any>>();

/**
 * Registers a function that provides the business logic (callbacks) for a given task type.
 * This is used when resuming tasks on startup to re-attach their specific logic.
 * @param taskType The type of the task (e.g., "search_by_name_state").
 * @param provider A function that takes persisted task data and returns AITaskCallbacks.
 */
export function registerTaskLogicProvider<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState
>(
  taskType: string,
  provider: TaskLogicProvider<IN, OUT, TProgressState>
): void {
  if (taskLogicProviders.has(taskType)) {
    console.warn(
      `[TaskOrchestrator] Overwriting task logic provider for taskType: ${taskType}`
    );
  }
  taskLogicProviders.set(taskType, provider);
}

function isValidWorkerScriptPath(scriptPath: string): boolean {
  // Assuming scriptPath is relative to the project root or a known base directory.
  // For this example, let's assume it's relative to 'backend/src/ai/tasks/'
  // This might need adjustment based on actual project structure and how paths are stored.
  const basePath = path.resolve(__dirname, "../tasks"); // Adjust if worker scripts are elsewhere
  const fullPath = path.resolve(basePath, scriptPath);

  // Security: Ensure the path doesn't try to escape the intended directory
  if (!fullPath.startsWith(basePath)) {
    console.error(
      `[TaskOrchestrator] Invalid worker script path (directory traversal attempt): ${scriptPath}`
    );
    return false;
  }

  return fs.existsSync(fullPath);
}

async function handleWorkerMessage<
  OUT extends object,
  TProgressState extends ProgressState
>(
  event: MessageEvent<WorkerToMainMessage<OUT, TProgressState>>
): Promise<void> {
  const message = event.data;
  const managedTask = allActiveTasks.get(message.taskId);

  if (!managedTask) {
    console.error(
      `[TaskOrchestrator] Received message for unknown taskId: ${message.taskId}`
    );
    return;
  }

  try {
    switch (message.type) {
      case "progress":
        const progressMessage =
          message as WorkerProgressMessage<TProgressState>;
        await prisma.ai_task.update({
          // Use new model name
          where: { id: managedTask.dbId },
          data: {
            last_known_progress_json: progressMessage.currentProgress as any, // Cast to any for Prisma Json type, use new field name
            updated_at: new Date(), // use new field name
          },
        });
        managedTask.callbacks.onProgress?.({
          details: progressMessage.currentProgress,
          percent: progressMessage.percent,
          clientStateUpdate: progressMessage.state,
        });
        // TODO: Handle global client state update (message.state) if necessary
        break;

      case "complete":
        const completeMessage = message as WorkerCompleteMessage<OUT>;
        await prisma.ai_task.update({
          // Use new model name
          where: { id: managedTask.dbId },
          data: {
            status: AITaskStatus.COMPLETED,
            output_json: completeMessage.output as any, // Cast to any for Prisma Json type, use new field name
            updated_at: new Date(), // use new field name
          },
        });
        managedTask.callbacks.onComplete?.(
          completeMessage.output,
          completeMessage.state
        );
        // TODO: Handle global client state update (message.state) if necessary
        allActiveTasks.delete(managedTask.dbId);
        managedTask.worker.terminate();
        break;

      case "error":
        const errorMessage = message as WorkerErrorMessage;
        await prisma.ai_task.update({
          // Use new model name
          where: { id: managedTask.dbId },
          data: {
            status: AITaskStatus.FAILED,
            last_error_json: {
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
        allActiveTasks.delete(managedTask.dbId);
        managedTask.worker.terminate();
        break;
    }
  } catch (dbError) {
    console.error(
      `[TaskOrchestrator] Database error while handling worker message for task ${managedTask.dbId}:`,
      dbError
    );
    // Potentially try to update task status to FAILED if not already
    managedTask.callbacks.onError?.({
      message: "Internal orchestrator error during worker message handling.",
    });
    allActiveTasks.delete(managedTask.dbId);
    managedTask.worker.terminate();
  }
}

async function spawnAndInitWorker<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState
>(
  persistedTask: PersistedAITask,
  callbacks: AITaskCallbacks<IN, OUT, TProgressState>,
  resumeFromProgress?: TProgressState
): Promise<void> {
  // Construct the full path to the worker script.
  // This assumes workerScriptPath is relative to a known directory, e.g., 'backend/src/ai/tasks/'
  // Adjust this path construction as per your project's structure.
  const workerScriptFullPath = path.resolve(
    __dirname,
    "../tasks",
    persistedTask.worker_script_path
  ); // use new field name

  const worker = new Worker(workerScriptFullPath); // Bun uses file paths directly for Workers

  // Prisma's Json type is already parsed, no need for JSON.parse
  const input = persistedTask.input_json as IN; // use new field name
  const clientStateOnStart =
    persistedTask.client_state_on_start_json as ClientState; // use new field name

  const managedTask: ManagedAITask<IN, OUT, TProgressState> = {
    dbId: persistedTask.id,
    taskType: persistedTask.task_type, // use new field name
    workerScriptPath: persistedTask.worker_script_path, // use new field name
    worker,
    callbacks,
    input,
    clientStateOnStart,
  };
  allActiveTasks.set(persistedTask.id, managedTask);

  worker.onmessage = handleWorkerMessage;
  worker.onerror = async (err) => {
    console.error(
      `[TaskOrchestrator] Worker error for task ${persistedTask.id}:`,
      err.message
    );
    await prisma.ai_task.update({
      // Use new model name
      where: { id: persistedTask.id },
      data: {
        status: AITaskStatus.FAILED,
        last_error_json: {
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
    allActiveTasks.delete(persistedTask.id);
    // Worker might have already terminated or be in an unstable state.
  };

  const initMessage: WorkerInitMessage<IN, TProgressState> = {
    type: "init",
    taskId: persistedTask.id,
    input,
    initialState: clientStateOnStart,
    resumeFromProgress,
  };
  worker.postMessage(initMessage);

  await prisma.ai_task.update({
    // Use new model name
    where: { id: persistedTask.id },
    data: { status: AITaskStatus.RUNNING, updated_at: new Date() }, // use new field name
  });
}

export async function submitTask<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState
>(
  taskType: string,
  workerScriptPath: string, // e.g., "search_by_name_state_worker.ts"
  input: IN,
  clientStateOnStart: ClientState,
  callbacks: AITaskCallbacks<IN, OUT, TProgressState>
): Promise<AITaskID | null> {
  if (!isValidWorkerScriptPath(workerScriptPath)) {
    console.error(
      `[TaskOrchestrator] Submission failed: Invalid worker script path: ${workerScriptPath}`
    );
    callbacks.onError?.({
      message: `Invalid worker script path: ${workerScriptPath}`,
    });
    return null;
  }

  try {
    const persistedTask = await prisma.ai_task.create({
      // Use new model name
      data: {
        task_type: taskType, // use new field name
        worker_script_path: workerScriptPath, // use new field name
        status: AITaskStatus.PENDING,
        input_json: input as any, // Cast to any for Prisma Json type, use new field name
        client_state_on_start_json: clientStateOnStart as any, // Cast to any for Prisma Json type, use new field name
        id_client: clientStateOnStart.client_id,
      },
    });

    await spawnAndInitWorker(persistedTask, callbacks);
    return persistedTask.id;
  } catch (error: any) {
    console.error("[TaskOrchestrator] Error submitting task:", error);
    callbacks.onError?.({
      message: "Failed to submit task to orchestrator.",
      stack: error.stack,
    });
    return null;
  }
}

export async function resumeTasksOnStartup(): Promise<void> {
  console.log("[TaskOrchestrator] Resuming tasks on startup...");
  try {
    const tasksToResume = await prisma.ai_task.findMany({
      // Use new model name
      where: {
        OR: [
          { status: AITaskStatus.RUNNING },
          { status: AITaskStatus.PENDING },
          { status: AITaskStatus.INTERRUPTED }, // Assuming INTERRUPTED implies it was running
        ],
      },
    });

    if (tasksToResume.length === 0) {
      console.log("[TaskOrchestrator] No tasks to resume.");
      return;
    }

    console.log(
      `[TaskOrchestrator] Found ${tasksToResume.length} tasks to resume.`
    );

    for (const task of tasksToResume) {
      if (!isValidWorkerScriptPath(task.worker_script_path)) {
        // use new field name
        console.error(
          `[TaskOrchestrator] Cannot resume task ${task.id}: Invalid worker script path: ${task.worker_script_path}`
        ); // use new field name
        await prisma.ai_task.update({
          // Use new model name
          where: { id: task.id },
          data: {
            status: AITaskStatus.INVALID_WORKER_PATH,
            last_error_json: {
              message: `Invalid worker script path: ${task.worker_script_path}`,
            } as any, // Cast to any, use new field name
            updated_at: new Date(), // use new field name
          },
        });
        continue;
      }

      // For resumed tasks, try to get callbacks from the registry.
      let callbacks: AITaskCallbacks<any, any, any>;
      const logicProvider = taskLogicProviders.get(task.task_type);

      if (logicProvider) {
        try {
          callbacks = logicProvider(task);
        } catch (e: any) {
          console.error(
            `[TaskOrchestrator] Error getting callbacks from provider for taskType ${task.task_type}, task ID ${task.id}: ${e.message}`
          );
          // Fallback to default logging callbacks if provider fails
          callbacks = getDefaultResumedTaskCallbacks(task.id);
        }
      } else {
        console.warn(
          `[TaskOrchestrator] No logic provider registered for taskType: ${task.task_type}. Resuming task ${task.id} with default logging callbacks.`
        );
        callbacks = getDefaultResumedTaskCallbacks(task.id);
      }

      let resumeFromProgress: ProgressState | undefined = undefined;
      if (task.last_known_progress_json) {
        // use new field name
        // Prisma's Json type is already parsed
        resumeFromProgress = task.last_known_progress_json as ProgressState; // use new field name
        // No try-catch needed for parsing, but you might want one for type assertion validation if necessary
        // For simplicity, assuming the stored JSON matches ProgressState structure.
      }

      // If task.last_known_progress_json was null or undefined, resumeFromProgress remains undefined.
      // This check might be redundant if the above handles nulls correctly, but kept for clarity.
      if (!task.last_known_progress_json) {
        // use new field name
        console.warn(
          `[TaskOrchestrator] last_known_progress_json is null for task ${task.id}. Resuming without progress.`
        ); // use new field name
        resumeFromProgress = undefined;
      } else {
        try {
          // Validate if the parsed JSON actually conforms to ProgressState, if needed.
          // This is a placeholder for potential deeper validation.
          // For now, we assume it's correctly structured.
        } catch (e) {
          console.error(
            `[TaskOrchestrator] Failed to validate lastKnownProgressJson structure for task ${task.id}:`,
            e
          );
          // Optionally, mark task as FAILED or attempt to start without progress
        }
      }

      // If task was PENDING, it means it never started, so no progress to resume from.
      if (task.status === AITaskStatus.PENDING) {
        resumeFromProgress = undefined;
      }

      console.log(
        `[TaskOrchestrator] Resuming task ${task.id} (${task.task_type})`
      ); // use new field name
      try {
        await spawnAndInitWorker(task, callbacks, resumeFromProgress);
      } catch (spawnError: any) {
        console.error(
          `[TaskOrchestrator] Failed to spawn worker for resumed task ${task.id}:`,
          spawnError
        );
        await prisma.ai_task.update({
          // Use new model name
          where: { id: task.id },
          data: {
            status: AITaskStatus.FAILED,
            last_error_json: {
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

function getDefaultResumedTaskCallbacks(
  taskId: string
): AITaskCallbacks<any, any, any> {
  return {
    onProgress: ({ details, percent, clientStateUpdate }) =>
      console.log(
        `[DefaultResumedTask-${taskId}] Progress: ${percent}%`,
        details,
        "ClientStateUpdate:",
        clientStateUpdate
      ),
    onComplete: (output, clientStateUpdate) =>
      console.log(
        `[DefaultResumedTask-${taskId}] Complete:`,
        output,
        "ClientStateUpdate:",
        clientStateUpdate
      ),
    onError: (error) =>
      console.error(`[DefaultResumedTask-${taskId}] Error:`, error),
  };
}

// Example of how to call resumeTasksOnStartup (e.g., in your main application file)
// (async () => {
//   await resumeTasksOnStartup();
// })();

export type AITask<
  IN extends object = {},
  OUT extends object = {},
  TProgressState extends ProgressState = ProgressState
> = {
  id: AITaskID;
  status: "pending" | "running" | "completed" | "failed"; // This status is now AITaskStatus from Prisma
  input: IN;
  output: OUT | null;
  // worker: Worker; // Worker management is now internal to the orchestrator
  onProgress: (
    progress: {
      percent: number;
      state?: Partial<ClientState>;
      details?: TProgressState; // Changed from object to TProgressState
    }
  ) => void;
  onComplete: (result: { output: OUT; state?: Partial<ClientState> }) => void;
  onError: (error: Error) => void; // Error is now { message: string; stack?: string }
};
