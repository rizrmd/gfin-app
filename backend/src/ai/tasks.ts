import search_org from "./tasks/search_org";

export const tasks = {
  search_org: search_org,
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
