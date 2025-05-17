/// <reference lib="webworker" />

import type { ClientState } from "shared/lib/client_state";
import type { ClientId } from "./client";
import type { TaskId } from "./task-main";
import type { SerializableAgentState } from "../../../../../r-agent/browser_use/agent/serializable_views";
import { createAgentBrowser } from "./agents/agent-browser";

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
  initialState: ClientState;
  resumeFromProgress?: TProgressState;
}

export interface MainToWorkerStateUpdateMessage {
  type: "stateUpdate";
  // taskId might be relevant here if multiple tasks share a worker instance,
  // but typically one worker instance per task.
  updatedStateSlice: Partial<ClientState>;
}

export type MainToWorkerMessage<
  IN,
  TProgressState extends ProgressState<any>
> = WorkerInitMessage<IN, TProgressState> | MainToWorkerStateUpdateMessage;

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
  state?: Partial<ClientState>; // Optional: For final global client state update
}

export interface WorkerErrorMessage {
  client_id: ClientId;
  type: "error";
  task_id: TaskId;
  message: string;
  stack?: string;
}

export interface WorkerStateUpdateMessage {
  client_id: ClientId;
  type: "stateUpdate";
  task_id: TaskId;
  updatedStateSlice: Partial<ClientState>;
}

export type WorkerToMainMessage<
  OUT,
  TProgressState extends ProgressState<any>
> =
  | WorkerProgressMessage<TProgressState>
  | WorkerCompleteMessage<OUT>
  | WorkerErrorMessage
  | WorkerStateUpdateMessage;

export abstract class AITaskWorker<
  IN extends object,
  OUT extends object,
  Progress extends ProgressState<any>
> {
  protected clientId!: string;
  protected taskId!: string;
  protected input!: IN;
  protected currentState!: ClientState;

  constructor() {
    self.onmessage = async (
      event: MessageEvent<MainToWorkerMessage<IN, Progress>>
    ) => {
      const message = event.data;
      if (message.type === "init") {
        this.clientId = message.client_id;
        this.taskId = message.task_id;
        this.input = message.input;
        this.currentState = message.initialState;
        try {
          const output = await this.execute(
            this.input,
            this.currentState,
            message.resumeFromProgress
          );
          this.postCompletion(output);
        } catch (error: any) {
          this.postError(error.message, error.stack);
        }
      } else if (message.type === "stateUpdate") {
        this.updateWorkerState(message.updatedStateSlice);
      }
    };
  }

  protected abstract execute(
    input: IN,
    state: ClientState,
    resumeFrom?: Progress
  ): Promise<OUT>;

  // Updated to include percent
  protected postProgress(
    percent: number,
    currentProgress: Progress,
    stateUpdate?: Partial<ClientState>
  ): void {
    const message: WorkerProgressMessage<Progress> = {
      client_id: this.clientId,
      type: "progress",
      task_id: this.taskId,
      progress: currentProgress,
    };
    self.postMessage(message);
  }

  protected postCompletion(
    output: OUT,
    stateUpdate?: Partial<ClientState>
  ): void {
    const message: WorkerCompleteMessage<OUT> = {
      client_id: this.clientId,
      type: "complete",
      task_id: this.taskId,
      output,
      state: stateUpdate,
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

  protected updateWorkerState(newStateSlice: Partial<ClientState>): void {
    this.currentState = { ...this.currentState, ...newStateSlice };
    // Optionally, trigger any internal re-evaluation if the worker's logic
    // needs to react to these external state changes immediately.
  }
}

export const taskWorker = <
  T extends object,
  Progress extends ProgressState<T> = {
    percentComplete: number;
    description: string;
    data: T;
  },
  InputParams extends object = {},
  OutputParams extends object = {}
>(arg: {
  name: string;
  execute: (opt: {
    input: InputParams;
    state: ClientState;
    updateState: (state: Partial<ClientState>) => void;
    progress: (progressInfo: Progress) => void;
    resumeFrom?: Progress;
    taskId: string;
    agent: {
      browser: ReturnType<typeof createAgentBrowser>;
    };
  }) => Promise<OutputParams>;
  // getCallbacksProvider removed
}) => {
  if (!import.meta.main) {
    return { name, file: import.meta.file };
  }

  let clientId: string;
  let taskId: string;
  let currentInput: InputParams;
  let currentState: ClientState;

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
    output: OutputParams,
    stateUpdate?: Partial<ClientState>
  ): void => {
    const message: WorkerCompleteMessage<OutputParams> = {
      client_id: currentClientId,
      type: "complete",
      task_id: currentTaskId,
      output,
      state: stateUpdate,
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

  // Helper to post state update messages
  const postUpdateState = (
    currentClientId: string,
    currentTaskId: string,
    updatedStateSlice: Partial<ClientState>
  ): void => {
    const message: WorkerStateUpdateMessage = {
      client_id: currentClientId,
      type: "stateUpdate",
      task_id: currentTaskId,
      updatedStateSlice,
    };
    self.postMessage(message);
  };

  self.onmessage = async (
    event: MessageEvent<MainToWorkerMessage<InputParams, Progress>>
  ) => {
    const message = event.data;

    if (message.type === "init") {
      clientId = message.client_id;
      taskId = message.task_id;
      currentInput = message.input;
      currentState = message.initialState;
      const resumeFromProgress = message.resumeFromProgress;

      try {
        const result = await arg.execute({
          input: currentInput,
          state: currentState,
          progress: (progressState) => {
            // Ensure details conforms to TProgressState, which it should by execute's signature
            postProgress(clientId, taskId, progressState);
          },
          resumeFrom: resumeFromProgress,
          taskId: taskId,
          agent: {
            browser: createAgentBrowser(),
          },
          updateState: (stateSlice) => {
            postUpdateState(clientId, taskId, stateSlice);
          },
        });
        postCompletion(clientId, taskId, result);
      } catch (error: any) {
        postError(clientId, taskId, error.message, error.stack);
      }
    } else if (message.type === "stateUpdate") {
      // Update the worker's understanding of the client state
      currentState = { ...currentState, ...message.updatedStateSlice };
    }
  };

  // Return taskType for the calling module to export
  return {
    name: arg.name,
    file: import.meta.file,
  };
};
