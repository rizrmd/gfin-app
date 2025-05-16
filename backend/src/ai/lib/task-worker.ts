/// <reference lib="webworker" />

import type { ClientState } from "shared/lib/client_state";

// Message types from main thread to worker
export interface WorkerInitMessage<IN> {
  type: "init";
  input: IN;
  initialState: ClientState;
}

export interface MainToWorkerStateUpdateMessage {
  type: "stateUpdate";
  updatedStateSlice: Partial<ClientState>;
}

export type MainToWorkerMessage<IN> =
  | WorkerInitMessage<IN>
  | MainToWorkerStateUpdateMessage;

// Message types from worker to main thread
export interface WorkerProgressMessage {
  type: "progress";
  percent: number;
  state?: Partial<ClientState>;
  details?: object;
}

export interface WorkerCompleteMessage<OUT> {
  type: "complete";
  output: OUT;
  state?: Partial<ClientState>;
}

export interface WorkerErrorMessage {
  type: "error";
  message: string;
  stack?: string;
}

export type WorkerToMainMessage<OUT> =
  | WorkerProgressMessage
  | WorkerCompleteMessage<OUT>
  | WorkerErrorMessage;

export abstract class AITaskWorker<IN extends object, OUT extends object> {
  protected input!: IN;
  protected currentState!: ClientState;

  constructor() {
    self.onmessage = async (event: MessageEvent<MainToWorkerMessage<IN>>) => {
      const message = event.data;
      if (message.type === "init") {
        this.input = message.input;
        this.currentState = message.initialState;
        try {
          const output = await this.execute(this.input, this.currentState);
          this.postCompletion(output);
        } catch (error: any) {
          this.postError(error.message, error.stack);
        }
      } else if (message.type === "stateUpdate") {
        this.updateWorkerState(message.updatedStateSlice);
      }
    };
  }

  protected abstract execute(input: IN, state: ClientState): Promise<OUT>;

  protected postProgress(arg: {
    percent: number;
    details?: object;
    state?: Partial<ClientState>;
  }): void {
    const message: WorkerProgressMessage = {
      type: "progress",
      percent: arg.percent,
      details: arg.details,
      state: arg.state,
    };
    self.postMessage(message);
  }

  protected postCompletion(
    output: OUT,
    stateUpdate?: Partial<ClientState>
  ): void {
    const message: WorkerCompleteMessage<OUT> = {
      type: "complete",
      output,
      state: stateUpdate,
    };
    self.postMessage(message);
  }

  protected postError(message: string, stack?: string): void {
    const errorMessage: WorkerErrorMessage = { type: "error", message, stack };
    self.postMessage(errorMessage);
  }

  protected updateWorkerState(newStateSlice: Partial<ClientState>): void {
    this.currentState = { ...this.currentState, ...newStateSlice };
    // Optionally, trigger any internal re-evaluation if the worker's logic
    // needs to react to these external state changes immediately.
  }
}
