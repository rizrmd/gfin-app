import { subscribe } from "valtio";
import { aiState } from "./state";
import { aiSync } from "./sync";
import { type TaskName, type Tasks } from "backend/ai/tasks";
import { pack } from "msgpackr";
import { gzipSync } from "fflate";
import { user } from "../user";
const aiClient = () => {
  const state = aiState();
  const sync = aiSync();

  subscribe(state, () => {});

  return {
    state,
    sync,
    task: {
      active: {} as Record<string, any>,
      do: async <Name extends TaskName>(
        name: Name,
        input: Tasks[Name]["input"]
      ): Promise<Tasks[Name]["output"]> => {
        return new Promise<Tasks[Name]["output"]>((resolve, reject) => {
          sync.ws?.send(gzipSync(pack({ type: "doTask", name, input })));
        });
      },
    },
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
