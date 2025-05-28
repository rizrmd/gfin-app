import ask from "./tasks/ask";
import search_org from "./tasks/search_org";
import perplexity from "./tasks/perplexity";
import sam_gov from "./tasks/sam_gov";

export const tasks = {
  search_org,
  ask,
  perplexity,
  sam_gov
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
