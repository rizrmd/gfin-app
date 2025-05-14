import type { ServerWebSocket } from "bun";
import type { BrowserAgent } from "r-agent";
import type { OrgState } from "shared/lib/org";

export type WSAgentData = { user_id: string; url: URL };

if (!(global as any).ai_agents) {
  (global as any).ai_agents = new Map();
}
export const agents = (global as any).ai_agents as Map<
  string,
  {
    state: OrgState;
    running: Record<
      string,
      { agent: BrowserAgent; current: { step: number; goal: string } }
    >;
  }
>;

export const newAgent = async <T>(opt: {
  taskName: string;
  prompt: string;
  output?: T;
  ws: ServerWebSocket<WSAgentData>;
}) => {
  const { BrowserAgent, ChatGroqAI } = await import("r-agent");

  const llm = new ChatGroqAI({
    modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
    apiKey: process.env.GROQ_API_KEY,
  });

  const agent = new BrowserAgent(
    opt.prompt.replaceAll("[output]", JSON.stringify(opt.output)),
    llm,
    {
      pageExtractionLLM: llm,
      registerNewStepCallback(state, modelOutput, step) {
        const found = agents.get(opt.ws.data.user_id)?.running[opt.taskName];
        if (found) {
          found.current.step = step;
          found.current.goal = modelOutput.current_state.next_goal;
        }
        opt.ws.send(
          JSON.stringify({
            type: "step",
            step,
            goal: modelOutput.current_state.next_goal,
          })
        );
      },
      registerDoneCallback(history) {
        let result = JSON.parse(history.final_result() || "{}");
        if (result && typeof result.data === "string") {
          const found = agents.get(opt.ws.data.user_id)?.running[opt.taskName];
          if (found) {
            found.current.step = 0;
            found.current.goal = "";
          }
          try {
            const parsedData = JSON.parse(result.data);
            result = parsedData;
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
        opt.ws.send(
          JSON.stringify({
            type: "done",
            result,
          })
        );
      },
    }
  );

  agent.run(10);

  return agent;
};
