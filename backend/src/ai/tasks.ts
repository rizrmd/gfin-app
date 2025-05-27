import ask from "./tasks/ask";
import search_org from "./tasks/search_org";
import perplexity from "./tasks/perplexity";

export const tasks = {
  search_org,
  ask,
  perplexity,
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
