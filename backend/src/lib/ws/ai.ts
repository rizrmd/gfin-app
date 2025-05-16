import { clients, getClient, type WSAIData } from "backend/ai/lib/ws";
import type { Server, WebSocketHandler } from "bun";

export const ws_ai: WebSocketHandler<WSAIData> & {
  upgrade: (opt: { req: Request; server: Server }) => any | Promise<any>;
} = {
  upgrade({ req, server }) {
    const url = new URL(req.url);
    const client_id = url.pathname.split("/").pop()!;
    return {
      client_id,
    };
  },
  async message(ws, raw) {
    const client = getClient(ws.data.client_id);
    client.sync.onMessage(ws, raw);
  },
  open(ws) {
    const client = getClient(ws.data.client_id);
    client.connections.add(ws);
    client.sync.send(ws, { type: "state", state: client.state });
  },
  close(ws) {
    const client = getClient(ws.data.client_id);
    client.connections.delete(ws);
  },
};
