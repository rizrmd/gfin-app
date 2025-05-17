/// <reference lib="webworker" />

import type { ClientState } from "shared/lib/client_state";

// Generic progress state. Each worker will define its own specific ProgressState.
export interface ProgressState {
  percentComplete: number;
  description: string;
}

// Message types from main thread to worker
export interface WorkerInitMessage<IN, TProgressState extends ProgressState> {
  type: "init";
  taskId: string;
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

export type MainToWorkerMessage<IN, TProgressState extends ProgressState> =
  | WorkerInitMessage<IN, TProgressState>
  | MainToWorkerStateUpdateMessage;

// Message types from worker to main thread
export interface WorkerProgressMessage<TProgressState extends ProgressState> {
  type: "progress";
  taskId: string;
  percent: number; // Added percent
  currentProgress: TProgressState; // This is effectively 'details'
  state?: Partial<ClientState>; // Optional: For global client state updates during progress
}

export interface WorkerCompleteMessage<OUT> {
  type: "complete";
  taskId: string;
  output: OUT;
  state?: Partial<ClientState>; // Optional: For final global client state update
}

export interface WorkerErrorMessage {
  type: "error";
  taskId: string;
  message: string;
  stack?: string;
}

export type WorkerToMainMessage<OUT, TProgressState extends ProgressState> = {
  clientId: string;
} & (
  | WorkerProgressMessage<TProgressState>
  | WorkerCompleteMessage<OUT>
  | WorkerErrorMessage
);

export abstract class AITaskWorker<
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState = ProgressState // Default to base ProgressState
> {
  protected taskId!: string;
  protected input!: IN;
  protected currentState!: ClientState;

  constructor() {
    self.onmessage = async (
      event: MessageEvent<MainToWorkerMessage<IN, TProgressState>>
    ) => {
      const message = event.data;
      if (message.type === "init") {
        this.taskId = message.taskId;
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
    resumeFrom?: TProgressState
  ): Promise<OUT>;

  // Updated to include percent
  protected postProgress(
    percent: number,
    currentProgress: TProgressState,
    stateUpdate?: Partial<ClientState>
  ): void {
    const message: WorkerProgressMessage<TProgressState> = {
      type: "progress",
      taskId: this.taskId,
      percent,
      currentProgress,
      state: stateUpdate,
    };
    self.postMessage(message);
  }

  protected postCompletion(
    output: OUT,
    stateUpdate?: Partial<ClientState>
  ): void {
    const message: WorkerCompleteMessage<OUT> = {
      type: "complete",
      taskId: this.taskId,
      output,
      state: stateUpdate,
    };
    self.postMessage(message);
  }

  protected postError(message: string, stack?: string): void {
    const errorMessage: WorkerErrorMessage = {
      type: "error",
      taskId: this.taskId,
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
  IN extends object,
  OUT extends object,
  TProgressState extends ProgressState = ProgressState
>(arg: {
  name: string;
  execute: (opt: {
    input: IN;
    state: ClientState;
    progress: (progressInfo: {
      percent: number;
      details: TProgressState;
      state?: Partial<ClientState>;
    }) => void;
    resumeFrom?: TProgressState;
    taskId: string;
  }) => Promise<OUT>;
  // getCallbacksProvider removed
}) => {
  if (!import.meta.main) {
    return { name, file: import.meta.file };
  }

  let taskId: string;
  let currentInput: IN;
  let currentState: ClientState;

  // Helper to post progress messages
  const postProgress = (
    currentTaskId: string,
    percent: number,
    details: TProgressState,
    stateUpdate?: Partial<ClientState>
  ): void => {
    const message: WorkerProgressMessage<TProgressState> = {
      type: "progress",
      taskId: currentTaskId,
      percent,
      currentProgress: details,
      state: stateUpdate,
    };
    self.postMessage(message);
  };

  // Helper to post completion messages
  const postCompletion = (
    currentTaskId: string,
    output: OUT,
    stateUpdate?: Partial<ClientState>
  ): void => {
    const message: WorkerCompleteMessage<OUT> = {
      type: "complete",
      taskId: currentTaskId,
      output,
      state: stateUpdate,
    };
    self.postMessage(message);
  };

  // Helper to post error messages
  const postError = (
    currentTaskId: string,
    errorMsg: string,
    stack?: string
  ): void => {
    const errorMessage: WorkerErrorMessage = {
      type: "error",
      taskId: currentTaskId,
      message: errorMsg,
      stack,
    };
    self.postMessage(errorMessage);
  };

  self.onmessage = async (
    event: MessageEvent<MainToWorkerMessage<IN, TProgressState>>
  ) => {
    const message = event.data;

    if (message.type === "init") {
      taskId = message.taskId;
      currentInput = message.input;
      currentState = message.initialState;
      const resumeFromProgress = message.resumeFromProgress;

      try {
        const result = await arg.execute({
          input: currentInput,
          state: currentState,
          progress: ({ percent, details, state: progressStateUpdate }) => {
            // Ensure details conforms to TProgressState, which it should by execute's signature
            postProgress(taskId, percent, details, progressStateUpdate);
          },
          resumeFrom: resumeFromProgress,
          taskId: taskId,
        });
        postCompletion(taskId, result);
      } catch (error: any) {
        postError(taskId, error.message, error.stack);
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
