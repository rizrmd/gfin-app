import { taskWorker } from "../lib/task-worker";

export default taskWorker<
  {},
  { prompt: string; system?: string },
  { answer: string }
>({
  name: "ask",
  desc: "Asking",
  async execute({ agent, progress, resumeFrom, db, input }) {
    const res = await agent.oneshot({
      system: input.system ? input.system : `You are an assistant that will generate a message in this json format: { answer: string }`,
      prompt: input.prompt,
    });

    try {
      const parsed = JSON.parse(res.content);
      return parsed;
    } catch (e) {}
    return res;
  },
});
