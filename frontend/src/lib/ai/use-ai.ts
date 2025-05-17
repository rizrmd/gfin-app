import { subscribe } from "valtio";
import { aiState } from "./state";
import { aiSync } from "./sync";

const aiClient = () => {
  const state = aiState();
  const sync = aiSync();

  subscribe(state, () => {});

  return {
    state,
    sync,
  };
};

const w = window as unknown as {
  ai_client: ReturnType<typeof aiClient>;
};

if (!w.ai_client) {
  w.ai_client = aiClient();
}

export const useAI = () => {
  w.ai_client.sync.init();

  return w.ai_client;
};
