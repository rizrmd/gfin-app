import type { ServerWebSocket } from "bun";
import { gunzipSync, gzipSync } from "bun";
import { pack, unpack } from "msgpackr";
import { submitTask, type AiTask, type TaskId } from "./task-main";

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
        console.log(data);
        if (data.type === "doTask") {
          submitTask({ client_id, name: data.name, input: data.input });
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
