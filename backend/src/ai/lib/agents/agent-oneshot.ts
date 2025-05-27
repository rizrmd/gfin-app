import {
  BaseMessage,
  ChatGroqAI,
  ChatOpenRouterAI,
  HumanMessage,
  SystemMessage,
} from "r-agent";

export const createOneShotAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
  }) => {
    const llm = new ChatGroqAI({
      modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
      apiKey: process.env.GROQ_API_KEY,
    });

    const messages: BaseMessage[] = [
      opt.system ? new SystemMessage({ content: opt.system }) : undefined,
      new HumanMessage({ content: opt.prompt }),
    ].filter(Boolean) as BaseMessage[];

    const res = await llm.invoke(messages);

    return res as T;
  };
};
