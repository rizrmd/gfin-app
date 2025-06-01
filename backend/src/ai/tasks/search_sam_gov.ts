import { taskWorker } from "../lib/task-worker";
import { samGovTool } from "../tools";

const tasksPrompt = `
You are an assistant that generates a valid JSON payload for querying the sam.gov API based on a user-provided prompt.
You must combine your understanding of the user's intent with the correct sam.gov API structure.

Your output must be a **pure JSON object**, not wrapped in any additional fields like "answer".

Guidelines:
- Respond with only the sam.gov-compatible JSON object, no explanations or extra fields.
- Use fields such as "keywords", "noticeType", "placeOfPerformance", "naics", "date", etc., depending on what is relevant from the user's prompt.
- Do not include any text outside the JSON.
- Ensure the final result is a valid JSON object that can be sent directly to the sam.gov API.
`;

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
        : tasksPrompt,
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


