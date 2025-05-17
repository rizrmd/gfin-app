import { gunzipSync } from "fflate";
import { unpack } from "msgpackr";
import { baseUrl } from "../gen/base-url";

export const aiSync = () => {
  const sync = {
    init() {
      if (!sync.ws || sync.ws.readyState === WebSocket.CLOSED) {
        const url = new URL(`${baseUrl.app_gfin}/ws/ai`);

        if (location.protocol === "https:") {
          url.protocol = "wss:";
        }

        sync.ws = new WebSocket(url);
        if (sync.ws) {
          sync.ws.onopen = () => {};
          sync.ws.onmessage = async (event) => {
            const buf = await event.data.arrayBuffer();
            const msg = unpack(gunzipSync(new Uint8Array(buf)));
            console.log(msg);
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
