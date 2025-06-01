// src/lib/perplexity-sdk-wrapper.ts
import { generateText } from "ai";
import { createPerplexity } from "@ai-sdk/perplexity";

const perplexity = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai",
});

export const perplexitySdkWrapper = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
  }) => {
    const model = perplexity("sonar-deep-research");

    const fullPrompt = opt.system
      ? `${opt.system}\n\n${opt.prompt}`
      : opt.prompt;

    const result = await generateText({
      model,
      prompt: fullPrompt,
      temperature: 0.0,
    });

    return {
      role: "assistant",
      content: result.text,
    } as T;
  };
};
