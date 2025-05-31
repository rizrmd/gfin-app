import groq from "./tasks/groq";
import deepseek from "./tasks/deepseek";

export const tasks = {
  groq,
  deepseek,
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
