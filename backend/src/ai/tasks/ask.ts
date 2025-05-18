import type { SerializableAgentState } from "r-agent/browser_use/agent/serializable_views";
import { taskWorker } from "../lib/task-worker";
import { usBizUrl } from "shared/lib/biz_url";
import { blankOrg } from "shared/lib/client_state";

export default taskWorker<
  {},
  { prompt: string; system?: string },
  { answer: string }
>({
  name: "ask",
  desc: "Asking",
  async execute({ agent, progress, resumeFrom, db, input }) {
    const res = await agent.oneshot({
      system: `You are an assistant that will generate a message in this json format: { answer: string }`,
      ...input,
    });

    try {
      return JSON.parse(res.content);
    } catch (e) {}
    return res;
  },
});
