import type { Worker } from "bun";

export type AITask<IN extends object = {}, OUT extends object = {}> = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  input: IN;
  output: OUT | null;
  worker: Worker;
};
