import groq from "./tasks/groq";
import deepseek from "./tasks/deepseek";
import perplexity from "./tasks/perplexity";
import search_org from "./tools/search_org";
import opportunity_detail from "./tasks/opportunity_detail";

export const tasks = {
  groq,
  deepseek,
  perplexity,
  search_org,
  opportunity_detail,
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
