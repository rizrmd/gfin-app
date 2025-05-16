import type { Worker } from "bun";
import type { ClientState } from "shared/lib/client_state";

export type AITaskID = string;

export type AITask<IN extends object = {}, OUT extends object = {}> = {
  id: AITaskID;
  status: "pending" | "running" | "completed" | "failed";
  input: IN;
  output: OUT | null;
  worker: Worker;
  onProgress: (
    progress: object & { percent: number; state?: Partial<ClientState> }
  ) => void;
  onComplete: (result: { output: OUT; state?: Partial<ClientState> }) => void;
  onError: (error: Error) => void;
};
