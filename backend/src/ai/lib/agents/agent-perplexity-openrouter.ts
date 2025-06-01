// src/lib/createPerplexityAgent.ts
import {
  BaseMessage,
  ChatOpenRouterAI,
  HumanMessage,
  StructuredTool,
  SystemMessage,
} from "r-agent";
import type { RequestParams } from "r-agent/browser_use/models/langchain";

export const createPerplexityOpenRouterAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
    tools?: StructuredTool[];
    tool_choice?: RequestParams["tool_choice"];
  }) => {
    // Inisialisasi LLM Perplexity dengan model "sonar"
    const llm = new ChatOpenRouterAI({
      modelName: "sonar-deep-research",
      apiKey: process.env.PERPLEXITY_API_KEY!,
      temperature: 0.0, // deterministik untuk search
      timeout: 60000,
      baseUrl: "https://api.perplexity.ai/",
    });

    // Bangun array pesan
    const messages: BaseMessage[] = [
      opt.system ? new SystemMessage({ content: opt.system }) : undefined,
      new HumanMessage({ content: opt.prompt }),
    ].filter(Boolean) as BaseMessage[];

    // Kirim ke Perplexity dan tunggu jawaban
    const res = await llm.invoke(messages);

    return res as T;
  };
};
