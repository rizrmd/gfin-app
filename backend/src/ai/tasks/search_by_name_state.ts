/// <reference lib="webworker" />
import { AITaskWorker, type ProgressState } from "../lib/task-worker"; // Import ProgressState as type
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

// Define a specific ProgressState for this worker
export interface SearchByNameProgressState extends ProgressState {
  processedItemsCount: number;
  currentQuery: string;
  intermediateResults: Array<{ id: string; name: string; details: any }>;
  phase: 'starting' | 'fetching' | 'processing' | 'finalizing' | 'done';
}

class SearchByNameStateTaskWorker extends AITaskWorker<
  SearchByNameStateInput,
  SearchByNameStateOutput,
  SearchByNameProgressState // Specify the progress state type
> {
  protected async execute(
    input: SearchByNameStateInput,
    state: ClientState,
    resumeFrom?: SearchByNameProgressState // Add resumeFrom parameter
  ): Promise<SearchByNameStateOutput> {
    let currentProgress: SearchByNameProgressState;

    if (resumeFrom) {
      console.log(`Worker: Resuming SearchByNameStateTask from:`, resumeFrom);
      currentProgress = resumeFrom;
    } else {
      console.log(`Worker: Starting SearchByNameStateTask with input:`, input);
      currentProgress = {
        processedItemsCount: 0,
        currentQuery: input.query,
        intermediateResults: [],
        phase: 'starting',
      };
    }
    console.log(`Worker: Current client state:`, state);

    // Phase: Starting
    if (currentProgress.phase === 'starting') {
      currentProgress.phase = 'fetching';
      // Assuming 'starting' is 0% and 'fetching' is beginning, let's say 10%
      this.postProgress(10, currentProgress, { /* potential client state update */ });
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate initial setup
    }

    // Phase: Fetching
    if (currentProgress.phase === 'fetching') {
      // Simulate API call or DB query
      console.log(`Worker: Fetching data for query: ${currentProgress.currentQuery}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      
      if (currentProgress.intermediateResults.length === 0) {
        currentProgress.intermediateResults = [
          { id: "1", name: `${currentProgress.currentQuery} - Result 1`, details: { info: "abc" } },
          { id: "2", name: `${currentProgress.currentQuery} - Result 2`, details: { info: "xyz" } },
        ];
      }
      currentProgress.processedItemsCount = currentProgress.intermediateResults.length;
      currentProgress.phase = 'processing';
      // After fetching, let's say 50%
      this.postProgress(50, currentProgress);
    }

    // Phase: Processing
    if (currentProgress.phase === 'processing') {
      console.log(`Worker: Processing ${currentProgress.processedItemsCount} items.`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      currentProgress.phase = 'finalizing';
      // After processing, let's say 80%
      this.postProgress(80, currentProgress);
    }
    
    // Phase: Finalizing
    if (currentProgress.phase === 'finalizing') {
      console.log("Worker: Finalizing results...");
      await new Promise((resolve) => setTimeout(resolve, 500)); 
      currentProgress.phase = 'done';
      // Final progress before completion, 100%
      this.postProgress(100, currentProgress);
    }

    // Example of proposing a client state update (can be done with any progress or completion)
    const clientStateUpdate: Partial<ClientState> = {
      // Example: Update a property in the shared client state
      // lastSearchQuery: currentProgress.currentQuery,
      // searchResultsCount: currentProgress.intermediateResults.length,
    };

    const finalOutput: SearchByNameStateOutput = {
      results: currentProgress.intermediateResults,
      statusMessage: "Search complete!",
    };
    
    // Post completion with the final output and any client state update
    this.postCompletion(finalOutput, clientStateUpdate);

    return finalOutput; // This return is for the internal promise of execute
  }
}

// Instantiate the worker. This is crucial for Bun workers.
// The file itself acts as the worker script.
new SearchByNameStateTaskWorker();

// --- Logic for re-attaching callbacks to resumed tasks ---
// Provider function will be exported for the registry
import type { AITaskCallbacks } from "../lib/task-main";
import type { ai_task as PersistedAITask } from "../../../../shared/models"; // For PersistedAITask type

export const TASK_TYPE_SEARCH_BY_NAME_STATE = "search_by_name_state";

export function getSearchByNameStateCallbacksProvider( // Exported
  persistedTask: PersistedAITask
): AITaskCallbacks<SearchByNameStateInput, SearchByNameStateOutput, SearchByNameProgressState> {
  // In a real application, you might use persistedTask.id_client to fetch
  // the specific client's state or context if needed.
  // For now, these callbacks will primarily log.

  console.log(
    `[TaskLogicProvider-${TASK_TYPE_SEARCH_BY_NAME_STATE}] Re-attaching logic for task ID: ${persistedTask.id}, Client ID: ${persistedTask.id_client}`
  );

  return {
    onProgress: ({ details, percent, clientStateUpdate }) => {
      console.log(
        `[ResumedTask-${persistedTask.id}-${TASK_TYPE_SEARCH_BY_NAME_STATE}] Progress: ${percent}%`,
        "Details:", details,
        "ClientStateUpdate:", clientStateUpdate
      );
      // Here, you could potentially try to get the client via getClient(persistedTask.id_client)
      // and update its state if it's active.
      // For example:
      // if (clientStateUpdate && persistedTask.id_client) {
      //   const client = getClient(persistedTask.id_client); // Assuming getClient is accessible
      //   if (client) {
      //     Object.assign(client.state, clientStateUpdate);
      //   }
      // }
    },
    onComplete: (output, clientStateUpdate) => {
      console.log(
        `[ResumedTask-${persistedTask.id}-${TASK_TYPE_SEARCH_BY_NAME_STATE}] Complete. Output:`, output,
        "ClientStateUpdate:", clientStateUpdate
      );
      // Similar logic for client state update on completion.
    },
    onError: (error) => {
      console.error(
        `[ResumedTask-${persistedTask.id}-${TASK_TYPE_SEARCH_BY_NAME_STATE}] Error: ${error.message}`,
        "Stack:", error.stack
      );
    },
  };
}

// Registration will be handled by a dedicated registry module.
