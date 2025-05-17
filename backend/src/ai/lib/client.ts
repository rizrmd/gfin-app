import type { ServerWebSocket } from "bun";
import { gunzipSync, gzipSync } from "bun";
import { pack, unpack } from "msgpackr";
import { submitTask, type AiTask, type TaskId } from "./task-main";
import type { ProgressState } from "./task-worker";

export type WSAIData = {
  client_id: ClientId;
  url: string;
};

export type ClientId = string;

const g = global as unknown as {
  ai_clients: Record<ClientId, ReturnType<typeof newClient>>;
};

if (!g.ai_clients) {
  g.ai_clients = {};
}

export const clients = g.ai_clients;

const newClient = (client_id: ClientId) => {
  const send = (ws: ServerWebSocket<WSAIData>, msg: any) => {
    try {
      ws.send(gzipSync(pack(msg)));
    } catch (e) {
      // console.error(`Failed to send message to client ${client_id}:`, e);
    }
  };

  const client = {
    id: client_id,
    connections: new Set<ServerWebSocket<WSAIData>>(),
    activeTasks: new Map<TaskId, AiTask>(),
    sync: {
      send,
      broadcast(arg: {}) {
        for (const ws of client.connections) {
          send(ws, arg);
        }
      },
      onMessage(ws: ServerWebSocket<WSAIData>, raw: any) {
        const data = unpack(gunzipSync(raw));
        if (data.type === "doTask") {
          submitTask({
            client_id,
            name: data.name,
            input: data.input,
            initialized: (task_id) => {
              client.sync.broadcast({
                type: "taskInit",
                task_id,
                init_id: data.init_id,
                name: data.name,
                percentComplete: 0,
                description: "Initializing",
              });
            },
          });
        }
      },
    },
  };

  return client;
};

export const getClient = (client_id: ClientId) => {
  if (!clients[client_id]) {
    clients[client_id] = newClient(client_id);
  }
  return clients[client_id];
};

// Callbacks for a managed task
export interface TaskCallback<
  Progress extends ProgressState<any>,
  OutputResult extends object = {}
> {
  onProgress?: (args: Progress) => void;
  onComplete?: (output: OutputResult) => void;
  onError?: (error: { message: string; stack?: string }) => void;
}

export const taskCallback = <
  Progress extends ProgressState<any>,
  OutputResult extends object = {}
>(
  client_id: ClientId,
  task_id: string,
  name: string
) => {
  return {
    onError: (error) => {
      const client = getClient(client_id);
      if (client) {
        client.sync.broadcast({
          type: "taskError",
          task_id: task_id,
          name,
          percentComplete: 100,
          description: "Error",
          error,
        });
      }
    },
    onProgress: (progress) => {
      const client = getClient(client_id);
      if (client) {
        client.sync.broadcast({
          type: "taskProgress",
          task_id: task_id,
          name,
          percentComplete: progress.percentComplete,
          description: progress.description,
        });
      }
    },
    onComplete(output) {
      const client = getClient(client_id);
      if (client) {
        client.sync.broadcast({
          type: "taskComplete",
          task_id: task_id,
          name,
          percentComplete: 100,
          description: "Completed",
          output,
        });
      }
    },
  } as TaskCallback<Progress, OutputResult>;
};
