import { newAIState } from "./state";
import { aiSync } from "./sync";

const aiClient = () => {
  const aiState = newAIState();
  return {
    state: aiState,
    sync: aiSync({ state: aiState }),
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
