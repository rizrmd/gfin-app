import {
  BaseMessage,
  ChatGroqAI,
  ChatOpenRouterAI,
  HumanMessage,
  StructuredTool,
  SystemMessage,
} from "r-agent";
import type { ToolCallingMethod } from "r-agent/browser_use/agent/views";
import type { RequestParams } from "r-agent/browser_use/models/langchain";

export const createGroqAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
    tools?: StructuredTool[];
    tool_choice?: RequestParams["tool_choice"];
  }) => {
    let llm = new ChatGroqAI({
      modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
      apiKey: process.env.GROQ_API_KEY,
    });

    const messages: BaseMessage[] = [
      opt.system ? new SystemMessage({ content: opt.system }) : undefined,
      new HumanMessage({ content: opt.prompt }),
    ].filter(Boolean) as BaseMessage[];

    if (opt.tools && opt.tools.length > 0) {
      const result = await llm
        .withTools(opt.tools, { tool_choice: opt.tool_choice })
        .invoke(messages);

      if (Array.isArray(result)) {
        return result[result.length - 1] as unknown as T;
      }
    }
    return (await llm.invoke(messages)) as T;
  };
};
