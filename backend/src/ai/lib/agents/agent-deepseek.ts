import {
  BaseMessage,
  ChatGroqAI,
  ChatOpenRouterAI,
  HumanMessage,
  StructuredTool,
  SystemMessage,
} from "r-agent";
import type { RequestParams } from "r-agent/browser_use/models/langchain";

export const createDeepseekAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
    tools?: StructuredTool[];
    tool_choice?: RequestParams["tool_choice"];
  }) => {
    const llm = new ChatOpenRouterAI({
      modelName: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      timeout: 5 * 60 * 1000, // 5 minutes
    });

    const messages: BaseMessage[] = [
      opt.system ? new SystemMessage({ content: opt.system }) : undefined,
      new HumanMessage({ content: opt.prompt }),
    ].filter(Boolean) as BaseMessage[];

    const res = await llm.invoke(messages);
    console.log("Deepseek response:", res);

    return res as T;
  };
};
