import search_by_name_state from "./tasks/search_by_name_state";

export const tasks = [search_by_name_state.file] as const;
export type TaskName = (typeof tasks)[number];
