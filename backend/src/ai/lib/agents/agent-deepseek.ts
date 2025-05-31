import {
  BaseMessage,
  ChatGroqAI,
  ChatOpenRouterAI,
  HumanMessage,
  SystemMessage,
} from "r-agent";

export const createDeepseekAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
  }) => {
    const llm = new ChatOpenRouterAI({
      modelName: "deepseek/deepseek-r1-0528:online",
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      timeout: 5 * 60 * 1000, // 5 minutes
    });

    const messages: BaseMessage[] = [
      opt.system ? new SystemMessage({ content: opt.system }) : undefined,
      new HumanMessage({ content: opt.prompt }),
    ].filter(Boolean) as BaseMessage[];

    const res = await llm.invoke(messages);

    return res as T;
  };
};
