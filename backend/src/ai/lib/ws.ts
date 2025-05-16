import { gunzipSync, gzipSync, type ServerWebSocket } from "bun";
import type { ClientState } from "shared/lib/client_state";
import type { AITask } from "./task";
import { pack, unpack } from "msgpackr";
import { proxy, subscribe } from "valtio";

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
    tasks: [] as AITask[],
    state: proxy({}) as ClientState,
    connections: new Set<ServerWebSocket<WSAIData>>(),
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
