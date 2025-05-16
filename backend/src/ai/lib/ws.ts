import type { BunMessageEvent, ServerWebSocket } from "bun";
import { gunzipSync, gzipSync } from "bun"; // Alias the Worker class constructor
import { pack, unpack } from "msgpackr";
import type { ClientState } from "shared/lib/client_state";
import { proxy, snapshot, subscribe } from "valtio";
import type {
  MainToWorkerStateUpdateMessage,
  WorkerInitMessage,
  WorkerToMainMessage,
} from "./task-worker";
import type { AITask, AITaskID } from "./task"; // IBunWorker is `type Worker from "bun"`

export type CLIENT_ID = string;

export type WSAIData = {
  client_id: CLIENT_ID;
  url: string;
};

const newClient = (client_id: CLIENT_ID) => {
  const send = (ws: ServerWebSocket<WSAIData>, msg: any) => {
    try {
      ws.send(gzipSync(pack(msg)));
    } catch (e) {}
  };

  const client = {
    client_id,
    tasks: {} as Record<AITaskID, AITask<any, any>>,
    state: proxy({}) as ClientState,
    connections: new Set<ServerWebSocket<WSAIData>>(),
    startTask: <IN extends object, OUT extends object>(taskDetails: {
      id: AITaskID;
      workerPath: string; // Relative path from this file (ws.ts) to the worker script
      input: IN;
      onProgress: AITask<IN, OUT>["onProgress"];
      onComplete: AITask<IN, OUT>["onComplete"];
      onError: AITask<IN, OUT>["onError"];
    }): AITask<IN, OUT> => {
      // Ensure workerPath is resolved correctly relative to the current file's directory
      const workerURL = new URL(taskDetails.workerPath, import.meta.url).href;
      const worker = new Worker(workerURL); // Construct with aliased class, type with IBunWorker

      const task: AITask<IN, OUT> = {
        id: taskDetails.id,
        status: "pending",
        input: taskDetails.input,
        output: null,
        worker,
        onProgress: taskDetails.onProgress,
        onComplete: taskDetails.onComplete,
        onError: taskDetails.onError,
      };
      client.tasks[task.id] = task;

      worker.addEventListener("message", (event) => {
        const message = event.data;
        const currentTask = client.tasks[task.id] as AITask<IN, OUT>;
        if (!currentTask) return;

        switch (message.type) {
          case "progress":
            currentTask.status = "running";
            if (message.state) {
              Object.assign(client.state, message.state);
              // Broadcast state update to other active workers
              for (const otherTaskId in client.tasks) {
                if (otherTaskId !== task.id) {
                  const otherTask = client.tasks[otherTaskId];
                  if (
                    otherTask &&
                    otherTask.status === "running" &&
                    otherTask.worker
                  ) {
                    const stateUpdateMessage: MainToWorkerStateUpdateMessage = {
                      type: "stateUpdate",
                      updatedStateSlice: message.state,
                    };
                    otherTask.worker.postMessage(stateUpdateMessage);
                  }
                }
              }
            }
            currentTask.onProgress({
              percent: message.percent,
              details: message.details,
              state: message.state,
            });
            break;
          case "complete":
            currentTask.status = "completed";
            currentTask.output = message.output;
            if (message.state) {
              Object.assign(client.state, message.state);
              // Broadcast state update to other active workers
              for (const otherTaskId in client.tasks) {
                if (otherTaskId !== task.id) {
                  const otherTask = client.tasks[otherTaskId];
                  if (
                    otherTask &&
                    otherTask.status === "running" &&
                    otherTask.worker
                  ) {
                    const stateUpdateMessage: MainToWorkerStateUpdateMessage = {
                      type: "stateUpdate",
                      updatedStateSlice: message.state,
                    };
                    otherTask.worker.postMessage(stateUpdateMessage);
                  }
                }
              }
            }
            currentTask.onComplete({
              output: message.output,
              state: message.state,
            });
            worker.terminate();
            // Consider if task should be removed or kept with 'completed' status
            delete client.tasks[task.id];
            break;
          case "error":
            currentTask.status = "failed";
            currentTask.onError(
              new Error(
                message.message +
                  (message.stack ? `\nStack: ${message.stack}` : "")
              )
            );
            worker.terminate();
            // Consider if task should be removed or kept with 'failed' status
            delete client.tasks[task.id];
            break;
        }
      });

      worker.onerror = (
        errEvent: Error | { message?: string; stack?: string } | Event
      ) => {
        // Add type for errEvent
        const currentTask = client.tasks[task.id] as AITask<IN, OUT>;
        if (currentTask) {
          currentTask.status = "failed";
          let errorToReport: Error;
          if (errEvent instanceof Error) {
            errorToReport = errEvent;
          } else if (
            typeof errEvent === "object" &&
            errEvent !== null &&
            "message" in errEvent
          ) {
            errorToReport = new Error(
              String(errEvent.message) +
                (errEvent.stack ? `\nStack: ${errEvent.stack}` : "")
            );
          } else {
            errorToReport = new Error(String(errEvent));
          }
          currentTask.onError(errorToReport);
          // delete client.tasks[task.id];
        }
        worker.terminate(); // Ensure termination on error
      };

      const initMessage: WorkerInitMessage<IN> = {
        type: "init",
        input: task.input,
        initialState: snapshot(client.state) as ClientState, // Send a snapshot
      };
      worker.postMessage(initMessage);
      task.status = "running";
      return task;
    },
    sync: {
      send,
      broadcastState() {
        for (const ws of client.connections) {
          send(ws, { type: "state", state: client.state });
        }
      },
      onMessage(ws: ServerWebSocket<WSAIData>, raw: any) {
        const data = unpack(gunzipSync(raw));
        console.log(data);
      },
    },
  };

  const timeout = {
    change: null as any,
  };

  subscribe(client.state, (e) => {
    clearTimeout(timeout.change);
    timeout.change = setTimeout(() => {
      client.sync.broadcastState();
    }, 300);
  });

  return client;
};

export const getClient = (client_id: CLIENT_ID) => {
  if (!clients[client_id]) {
    clients[client_id] = newClient(client_id);
  }
  return clients[client_id];
};

const g = global as unknown as {
  ai_clients: Record<CLIENT_ID, ReturnType<typeof newClient>>;
};

if (!g.ai_clients) {
  g.ai_clients = {};
}

export const clients = g.ai_clients;
