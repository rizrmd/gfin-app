/// <reference lib="webworker" />

import { PrismaClient } from "shared/models";
import { createAgentBrowser } from "./agents/agent-browser";
import { createDeepseekAgent } from "./agents/agent-deepseek";
import { createGroqAgent } from "./agents/agent-groq";
import { createPerplexityOpenRouterAgent } from "./agents/agent-perplexity-openrouter";
import { createPerplexitySdkAgent } from "./agents/agent-perplexity-sdk";
import type { ClientId } from "./client";
import type { TaskId } from "./task-main";

// Generic progress state. Each worker will define its own specific ProgressState.
export type ProgressState<T extends object> = {
  percentComplete: number;
  description: string;
  data: T;
};

// Message types from main thread to worker
export interface WorkerInitMessage<
  IN,
  TProgressState extends ProgressState<any>
> {
  client_id: ClientId;
  type: "init";
  task_id: TaskId;
  input: IN;
  resumeFromProgress?: TProgressState;
}

export interface MainToWorkerDBResultMessage {
  type: "dbResult";
  id: string;
  result?: any;
  error?: any;
}

export type MainToWorkerMessage<
  IN,
  TProgressState extends ProgressState<any>
> = WorkerInitMessage<IN, TProgressState> | MainToWorkerDBResultMessage;

// Message types from worker to main thread
export interface WorkerProgressMessage<Progress extends ProgressState<any>> {
  client_id: ClientId;
  task_id: TaskId;
  type: "progress";
  progress: Progress; // This is effectively 'details'
}

export interface WorkerCompleteMessage<OUT> {
  client_id: ClientId;
  type: "complete";
  task_id: TaskId;
  output: OUT;
}

export interface WorkerErrorMessage {
  client_id: ClientId;
  type: "error";
  task_id: TaskId;
  message: string;
  stack?: string;
}

export interface WorkerDBRequestMessage {
  client_id: ClientId;
  type: "dbRequest";
  id: TaskId;
  task_id: TaskId;
  tableName: string;
  method: string;
  args: any[];
}

export type WorkerToMainMessage<
  OUT,
  TProgressState extends ProgressState<any>
> =
  | WorkerProgressMessage<TProgressState>
  | WorkerCompleteMessage<OUT>
  | WorkerErrorMessage
  | WorkerDBRequestMessage;

export abstract class AITaskWorker<
  IN extends object,
  OUT extends object,
  Progress extends ProgressState<any>
> {
  protected clientId!: string;
  protected taskId!: string;
  protected input!: IN;

  constructor() {
    self.onmessage = async (
      event: MessageEvent<MainToWorkerMessage<IN, Progress>>
    ) => {
      const message = event.data;
      if (message.type === "init") {
        this.clientId = message.client_id;
        this.taskId = message.task_id;
        this.input = message.input;
        try {
          const output = await this.execute(
            this.input,
            message.resumeFromProgress
          );
          this.postCompletion(output);
        } catch (error: any) {
          this.postError(error.message, error.stack);
        }
      }
    };
  }

  protected abstract execute(input: IN, resumeFrom?: Progress): Promise<OUT>;

  // Updated to include percent
  protected postProgress(currentProgress: Progress): void {
    const message: WorkerProgressMessage<Progress> = {
      client_id: this.clientId,
      type: "progress",
      task_id: this.taskId,
      progress: currentProgress,
    };
    self.postMessage(message);
  }

  protected postCompletion(output: OUT): void {
    const message: WorkerCompleteMessage<OUT> = {
      client_id: this.clientId,
      type: "complete",
      task_id: this.taskId,
      output,
    };
    self.postMessage(message);
  }

  protected postError(message: string, stack?: string): void {
    const errorMessage: WorkerErrorMessage = {
      client_id: this.clientId,
      type: "error",
      task_id: this.taskId,
      message,
      stack,
    };
    self.postMessage(errorMessage);
  }
}

const agents = {
  browser: createAgentBrowser(),
  groq: createGroqAgent(),
  deepseek: createDeepseekAgent(),
  perplexity_openrouter: createPerplexityOpenRouterAgent(),
  perplexity_sdk: createPerplexitySdkAgent(),
};

export const taskWorker = <
  T extends object,
  InputParams extends object = {},
  OutputParams extends object = {},
  Progress extends ProgressState<T> = {
    percentComplete: number;
    description: string;
    data: T;
  }
>(arg: {
  name: string;
  desc: string;
  execute: (opt: {
    input: InputParams;
    progress: (progressInfo: Progress) => void;
    resumeFrom?: Progress;
    taskId: string;
    db: PrismaClient;
    agent: typeof agents;
  }) => Promise<OutputParams>;
  // getCallbacksProvider removed
}) => {
  const result = {
    name: arg.name,
    desc: arg.desc,
    file: import.meta.file,
    input: {} as InputParams,
    output: {} as OutputParams,
  };

  if (Bun.isMainThread) {
    return result;
  }

  let clientId: string;
  let taskId: string;
  let currentInput: InputParams;

  // Helper to post progress messages
  const postProgress = (
    currentClientId: string,
    currentTaskId: string,
    currentProgress: Progress
  ): void => {
    const message: WorkerProgressMessage<Progress> = {
      client_id: currentClientId,
      type: "progress",
      task_id: currentTaskId,
      progress: currentProgress,
    };
    self.postMessage(message);
  };

  // Helper to post completion messages
  const postCompletion = (
    currentClientId: string,
    currentTaskId: string,
    output: OutputParams
  ): void => {
    const message: WorkerCompleteMessage<OutputParams> = {
      client_id: currentClientId,
      type: "complete",
      task_id: currentTaskId,
      output,
    };
    self.postMessage(message);
  };

  // Helper to post error messages
  const postError = (
    currentClientId: string,
    currentTaskId: string,
    errorMsg: string,
    stack?: string
  ): void => {
    const errorMessage: WorkerErrorMessage = {
      client_id: currentClientId,
      type: "error",
      task_id: currentTaskId,
      message: errorMsg,
      stack,
    };
    self.postMessage(errorMessage);
  };

  const dbPromises = {} as Record<
    string,
    { resolve: (data: any) => void; reject: (err: any) => void }
  >;

  self.onmessage = async (
    event: MessageEvent<MainToWorkerMessage<InputParams, Progress>>
  ) => {
    const message = event.data;

    if (message.type === "dbResult") {
      const { id, result, error } = message;
      const dbPromise = dbPromises[id];

      if (dbPromise) {
        if (error) {
          dbPromise.reject(error);
        } else {
          dbPromise.resolve(result);
        }
        delete dbPromises[id];
      }
    }

    if (message.type === "init") {
      clientId = message.client_id;
      taskId = message.task_id;
      currentInput = message.input;
      const resumeFromProgress = message.resumeFromProgress;

      try {
        const result = await arg.execute({
          input: currentInput,
          progress: (progressState) => {
            // Ensure details conforms to TProgressState, which it should by execute's signature
            postProgress(clientId, taskId, progressState);
          },
          resumeFrom: resumeFromProgress,
          taskId: taskId,
          db: new Proxy(
            {},
            {
              get(target, tableName, receiver) {
                return new Proxy(
                  {},
                  {
                    get(target, method, receiver) {
                      return (...args: any[]) => {
                        const id = Bun.randomUUIDv7();
                        const promise = new Promise<any>((resolve, reject) => {
                          dbPromises[id] = {
                            resolve,
                            reject,
                          };
                        });
                        postMessage({
                          type: "dbRequest",
                          client_id: clientId,
                          id,
                          task_id: taskId,
                          tableName,
                          method,
                          args,
                        });
                        return promise;
                      };
                    },
                  }
                );
              },
            }
          ) as any,
          agent: agents,
        });
        postCompletion(clientId, taskId, result);
      } catch (error: any) {
        postError(clientId, taskId, error.message, error.stack);
      }
    }
  };

  // Return taskType for the calling module to export
  return result;
};
