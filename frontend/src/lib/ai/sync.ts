import { gunzipSync } from "fflate";
import { unpack } from "msgpackr";
import { baseUrl } from "../gen/base-url";
import { user } from "../user";

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
        const url = new URL(`${baseUrl.app_gfin}/ws/ai/${user.client.id}`);

        if (location.protocol === "https:") {
          url.protocol = "wss:";
        }

        sync.ws = new WebSocket(url);
        if (sync.ws) {
          sync.ws.onopen = () => {};
          sync.ws.onmessage = async (event) => {
            const buf = await event.data.arrayBuffer();
            const msg = unpack(gunzipSync(new Uint8Array(buf)));
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
