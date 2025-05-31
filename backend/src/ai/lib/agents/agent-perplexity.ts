// src/lib/createPerplexityAgent.ts
import {
  BaseMessage,
  ChatOpenRouterAI,
  HumanMessage,
  SystemMessage,
  StructuredTool,
} from "r-agent";
import type { RequestParams } from "r-agent/browser_use/models/langchain";

export const createPerplexityAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
    tools?: StructuredTool[];
    tool_choice?: RequestParams["tool_choice"];
  }) => {
    // Inisialisasi LLM Perplexity dengan model "sonar"
    const llm = new ChatOpenRouterAI({
      modelName:   "sonar-deep-research",                         
      apiKey:      process.env.OPEN_ROUTER_API_KEY!, 
      temperature: 0.0,                             // deterministik untuk search
      timeout:     60000,
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
