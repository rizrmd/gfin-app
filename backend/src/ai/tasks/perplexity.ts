import { taskWorker } from "../lib/task-worker";
import { samGovTool } from "../tools";

export default taskWorker<
  {},
  { prompt: string; system?: string },
  { answer: string }
>({
  name: "perplexity",
  desc: "Asking",
  async execute({ agent, input }) {
    const res = await agent.perplexity_openrouter({
      system: input.system
        ? input.system
        : `You are an assistant that will generate a message in this json format: { answer: string }`,
      prompt: input.prompt,
      tools: [samGovTool],
      tool_choice: "auto",
    });

    try {
      const parsed = JSON.parse(res.content);
      return parsed;
    } catch (e) {
      console.error(e);
    }
    return res;
  },
});
