import { gunzipSync } from "fflate";
import { unpack } from "msgpackr";
import { baseUrl } from "../gen/base-url";
import { user } from "../user";
import { api } from "../gen/api";

export const aiSync = () => {
  const sync = {
    init() {
      if (!sync.ws || sync.ws.readyState === WebSocket.CLOSED) {
        if (!user.client?.id) {
          user.init();

          if (!user.client?.id) {
            return;
          }
        }
        const url = new URL(location.href);
        url.pathname = `/ws/ai/${user.client.id}`;

        sync.ws = new WebSocket(url);
        if (sync.ws) {
          sync.ws.onopen = async () => {
            const tasks = await api.ai_tasks("unfinished");
            console.log("Unfinished tasks", tasks);
          };
          sync.ws.onmessage = async (event) => {
            const buf = await event.data.arrayBuffer();
            const msg = unpack(gunzipSync(new Uint8Array(buf)));
            sync.onmessage(msg);
          };
          sync.ws.onclose = () => {
            console.log("WebSocket connection closed");
          };
        }
      }
    },
    ws: null as WebSocket | null,
    onmessage(msg: any) {}, // will be overridden,
  };
  return sync;
};

export type AISync = ReturnType<typeof aiSync>;
