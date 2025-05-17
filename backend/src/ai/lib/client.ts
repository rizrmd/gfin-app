import type { ServerWebSocket } from "bun";
import { gunzipSync, gzipSync } from "bun";
import { pack, unpack } from "msgpackr";
import type { ClientState } from "shared/lib/client_state";
import { proxy, snapshot, subscribe } from "valtio";
import {
  submitTask,
  type AiTask,
  type TaskId,
  type TaskCallback,
} from "./task-main";
import type { ProgressState } from "./task-worker"; // Keep for TProgressState generic constraint

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

// Helper to map task-main's onError to client's onError
function adaptError(
  taskMainError: { message: string; stack?: string },
  clientOnError: (error: Error) => void
) {
  clientOnError(
    new Error(
      taskMainError.message +
        (taskMainError.stack ? `\nStack: ${taskMainError.stack}` : "")
    )
  );
}

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
    state: proxy({ client_id } as ClientState), // Initialize with client_id
    connections: new Set<ServerWebSocket<WSAIData>>(),
    activeTasks: new Map<TaskId, AiTask>(),
    sync: {
      send,
      broadcast(arg: { type: "state"; state: ClientState }) {
        for (const ws of client.connections) {
          send(ws, arg);
        }
      },
      onMessage(ws: ServerWebSocket<WSAIData>, raw: any) {
        const data = unpack(gunzipSync(raw));
      },
    },
  };

  const timeout = {
    state_changed: null as null | Timer,
  };

  subscribe(client.state, () => {
    if (timeout.state_changed) clearTimeout(timeout.state_changed);
    timeout.state_changed = setTimeout(() => {
      client.sync.broadcast({
        type: "state",
        state: snapshot(client.state) as ClientState,
      });
    }, 300);
  });

  return client;
};

export const getClient = (client_id: ClientId) => {
  if (!clients[client_id]) {
    clients[client_id] = newClient(client_id);
  }
  return clients[client_id];
};
