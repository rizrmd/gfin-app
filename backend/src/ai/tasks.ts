import groq from "./tasks/groq";
import deepseek from "./tasks/deepseek";
import perplexity from "./tasks/perplexity";
import update_org_profile from "./tasks/update_org_profile";
import opportunity_detail from "./tasks/opportunity_detail";
import search_sam_gov from "./tasks/search_sam_gov";
import opportunity_list from "./tasks/opportunity_list";

export const tasks = {
  groq,
  deepseek,
  perplexity,
  update_org_profile,
  opportunity_detail,
  search_sam_gov,
  opportunity_list,
} as const;

export type Tasks = typeof tasks;
export type TaskName = keyof typeof tasks;
