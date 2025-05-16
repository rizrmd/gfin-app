import type { AIState } from "./state";

export const aiSync = (arg: { state: AIState }) => {
  const sync = {
    init() {
      if (!sync.ws || sync.ws.readyState === WebSocket.CLOSED) {
        sync.ws = new WebSocket("ws://localhost:8080");
        if (sync.ws) {
          sync.ws.onopen = () => {
            console.log("WebSocket connection opened");
          };
          sync.ws.onmessage = (event) => {
            console.log("Message from server: ", event.data);
          };
          sync.ws.onclose = () => {
            console.log("WebSocket connection closed");
          };
        }
      }
    },
    ws: null as WebSocket | null,
  };
  return sync;
};


export type AISync = ReturnType<typeof aiSync>;