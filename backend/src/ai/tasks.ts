import groq from "./tasks/groq";
import deepseek from "./tasks/deepseek";
import perplexity from "./tasks/perplexity";

export const tasks = {
  groq,
  deepseek,
  perplexity,
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
