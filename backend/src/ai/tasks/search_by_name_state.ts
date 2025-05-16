/// <reference lib="webworker" />
import { AITaskWorker } from "../lib/task-worker";
import type { ClientState } from "shared/lib/client_state";

// Define specific input and output types for this task
export interface SearchByNameStateInput {
  query: string;
  // other input fields relevant to searching by name and affecting state
}

export interface SearchByNameStateOutput {
  results: Array<{ id: string; name: string; details: any }>;
  statusMessage: string;
  // other output fields
}

class SearchByNameStateTaskWorker extends AITaskWorker<
  SearchByNameStateInput,
  SearchByNameStateOutput
> {
  protected async execute(
    input: SearchByNameStateInput,
    state: ClientState
  ): Promise<SearchByNameStateOutput> {
    console.log(`Worker: Executing SearchByNameStateTask with input:`, input);
    console.log(`Worker: Current client state:`, state);

    this.postProgress({
      percent: 10,
      details: { message: `Starting search for: ${input.query}` },
    });

    // Simulate some async work (e.g., API call, database query)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate finding results
    const mockResults = [
      { id: "1", name: `${input.query} - Result 1`, details: { info: "abc" } },
      { id: "2", name: `${input.query} - Result 2`, details: { info: "xyz" } },
    ];

    this.postProgress({
      percent: 50,
      details: { message: "Processing results..." },
    });

    // Simulate more async work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Example of proposing a state update
    const stateUpdate: Partial<ClientState> = {
      // Example: Update a property in the shared client state
      // lastSearchQuery: input.query,
      // searchResultsCount: mockResults.length,
      // ui: { ...state.ui, searchLoading: false } // if ui is part of ClientState
    };
    // If you want to send the state update with the final completion:
    // this.postCompletion({ results: mockResults, statusMessage: "Search complete!" }, stateUpdate);

    // Or send progress with state update before completion:
    this.postProgress({
      percent: 90,
      details: { message: "Finalizing results..." }, // State update moved to postCompletion
    });

    // The main stateUpdate for this operation is now tied to postCompletion.
    // Other intermediate state updates via postProgress could still occur earlier if needed.

    const finalOutput: SearchByNameStateOutput = {
      results: mockResults,
      statusMessage: "Search complete!",
    };
    this.postCompletion(finalOutput, stateUpdate);

    return finalOutput;
  }
}

// Instantiate the worker. This is crucial for Bun workers.
// The file itself acts as the worker script.
new SearchByNameStateTaskWorker();
