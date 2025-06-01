import { generateText } from "ai";
import { createPerplexity } from "@ai-sdk/perplexity";

export const createPerplexitySdkAgent = () => {
  return async <T extends { role: string; content: string }>(opt: {
    prompt: string;
    system?: string;
  }) => {
    const perplexity = createPerplexity({
      apiKey: process.env.PERPLEXITY_API_KEY!,
    });

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
