import { BaseMessage, ChatGroqAI, HumanMessage, SystemMessage } from "r-agent";

export const createOneShotAgent = () => {
  return async <T extends object>(opt: { prompt: string; system?: string }) => {
    const llm = new ChatGroqAI({
      modelName: "meta-llama/llama-4-scout-17b-16e-instruct",
      apiKey: process.env.GROQ_API_KEY,
    });

    const messages: BaseMessage[] = [
      opt.system ? new SystemMessage({ content: opt.system }) : undefined,
      new HumanMessage({ content: opt.prompt }),
    ].filter(Boolean) as BaseMessage[];

    return await llm.invoke(messages);
  };
};
