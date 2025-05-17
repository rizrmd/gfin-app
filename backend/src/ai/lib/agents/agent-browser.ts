import { BrowserAgent, ChatGroqAI } from "r-agent";
import type { SerializableAgentState } from "r-agent/browser_use/agent/serializable_views";
import { AgentState } from "r-agent/browser_use/agent/views";

export const createAgentBrowser = () => {
  return async <T extends object>(opt: {
    prompt: string;
    maxSteps?: number;
    restore?: SerializableAgentState;
    onStep?: (opt: {
      restore: SerializableAgentState;
      current: {
        step: number;
        memory: string;
        nextGoal: string;
        lastEval: string;
      };
    }) => void;
  }) => {
    const { prompt, onStep } = opt;
    const maxSteps = opt.maxSteps || 10; // default 10
    return new Promise<T>((resolve, reject) => {
      const llm = new ChatGroqAI({
        modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
        apiKey: process.env.GROQ_API_KEY,
      });

      let agentState = opt.restore
        ? AgentState.fromSerializable(opt.restore)
        : undefined;

      const agent = new BrowserAgent(prompt, llm, {
        pageExtractionLLM: llm,
        injectedAgentState: agentState,
        registerNewStepCallback({ state, modelOutput, step }) {
          if (onStep) {
            onStep({
              restore: state.toSerializable(),
              current: {
                lastEval: modelOutput.current_state.evaluation_previous_goal,
                nextGoal: modelOutput.current_state.next_goal,
                memory: modelOutput.current_state.memory,
                step,
              },
            });
          }
        },
        registerDoneCallback(history) {
          try {
            if (history.is_successful()) {
              const parsed = JSON.parse(history.final_result() || "{}");

              if (parsed && typeof parsed === "object" && parsed.data) {
                resolve(parsed.data as T);
                return;
              }
              resolve(parsed as T);
            } else {
              reject(history.errors());
            }
          } catch (error) {
            console.error("Error parsing final result:", error);
            reject(error);
          }
        },
      });

      agent.run(maxSteps);
    });
  };
};
