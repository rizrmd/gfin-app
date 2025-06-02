import { taskWorker } from "../lib/task-worker";

export default taskWorker<
  {},
  { prompt: string; system?: string },
  { answer: string }
>({
  name: "deepseek",
  desc: "Asking",
  async execute({ agent, input,db }) {
    db.clients
    
    const res = await agent.deepseek({
      system: input.system
        ? input.system
        : `You are an assistant that will generate a message in this json format: { answer: string }`,
      prompt: input.prompt,
    });

    try {
      const parsed = JSON.parse(res.content);
      return parsed;
    } catch (e) {}
    return res;
  },
});
