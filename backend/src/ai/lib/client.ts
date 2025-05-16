import type { ServerWebSocket } from "bun";
import { gunzipSync, gzipSync } from "bun";
import { pack, unpack } from "msgpackr";
import type { ClientState } from "shared/lib/client_state";
import { proxy, snapshot, subscribe } from "valtio";
import {
  submitTask,
  type AITask,
  type AITaskID,
  type AITaskCallbacks,
} from "./task-main";
import type { ProgressState } from "./task-worker"; // Keep for TProgressState generic constraint

export type WSAIData = {
  client_id: CLIENT_ID;
  url: string;
};

export type CLIENT_ID = string;

const g = global as unknown as {
  ai_clients: Record<CLIENT_ID, ReturnType<typeof newClient>>;
};

if (!g.ai_clients) {
  g.ai_clients = {};
}

export const clients = g.ai_clients;

// Helper to map task-main's onError to client's onError
function adaptError(
  taskMainError: { message: string; stack?: string },
  clientOnError: (error: Error) => void
) {
  clientOnError(
    new Error(
      taskMainError.message +
        (taskMainError.stack ? `\nStack: ${taskMainError.stack}` : "")
    )
  );
}

const newClient = (client_id: CLIENT_ID) => {
  const send = (ws: ServerWebSocket<WSAIData>, msg: any) => {
    try {
      ws.send(gzipSync(pack(msg)));
    } catch (e) {
      // console.error(`Failed to send message to client ${client_id}:`, e);
    }
  };

  const client = {
    client_id,
    // activeTasks will store tasks using the ID returned by submitTask
    // Allow any TProgressState for tasks stored here
    activeTasks: {} as Record<AITaskID, Partial<AITask<any, any, any>>>, // Simplified type for storage
    state: proxy({ client_id } as ClientState), // Initialize with client_id
    connections: new Set<ServerWebSocket<WSAIData>>(),

    startTask: async <
      IN extends object,
      OUT extends object,
      TProgressState extends ProgressState
    >(taskDetails: {
      taskType: string;
      workerPath: string;
      input: IN;
      onProgress: (progress: {
        percent: number;
        details?: TProgressState;
        state?: Partial<ClientState>;
      }) => void;
      onComplete: (result: {
        output: OUT;
        state?: Partial<ClientState>;
      }) => void;
      onError: (error: Error) => void;
    }): Promise<AITask<IN, OUT, TProgressState> | null> => {

      // This object will be returned to the caller of startTask.
      // Its properties (id, status, output) will be updated by the orchestrator's callbacks.
      const finalReturnedTask: AITask<IN, OUT, TProgressState> = {
        id: "", // Placeholder, will be set by submitTask's result
        status: "pending",
        input: taskDetails.input,
        output: null,
        // These are the original onProgress, onComplete, onError methods provided by the caller of startTask.
        // They will be invoked by the finalOrchestratorCallbacks.
        onProgress: taskDetails.onProgress,
        onComplete: taskDetails.onComplete,
        onError: taskDetails.onError,
      };
      
      const clientStateSnapshot = snapshot(client.state) as ClientState;

      // These callbacks are passed to task-main's submitTask.
      // They will update the finalReturnedTask object and the client's global state.
      const finalOrchestratorCallbacks: AITaskCallbacks<IN, OUT, TProgressState> = {
        onProgress: ({ details, percent, clientStateUpdate }) => {
          finalReturnedTask.status = "running"; 
          if (clientStateUpdate) {
            Object.assign(client.state, clientStateUpdate);
          }
          // Call the original onProgress (now a method of finalReturnedTask)
          finalReturnedTask.onProgress({ percent, details, state: clientStateUpdate });
        },
        onComplete: (output, clientStateUpdate) => {
          finalReturnedTask.status = "completed";
          finalReturnedTask.output = output;
          if (clientStateUpdate) {
            Object.assign(client.state, clientStateUpdate);
          }
          finalReturnedTask.onComplete({ output, state: clientStateUpdate });
          // Clean up from activeTasks
          if (finalReturnedTask.id && client.activeTasks[finalReturnedTask.id]) {
            delete client.activeTasks[finalReturnedTask.id];
          }
        },
        onError: (error) => {
          finalReturnedTask.status = "failed";
          // Adapt and call the original onError (now a method of finalReturnedTask)
          adaptError(error, finalReturnedTask.onError);
          // Clean up from activeTasks
          if (finalReturnedTask.id && client.activeTasks[finalReturnedTask.id]) {
            delete client.activeTasks[finalReturnedTask.id];
          }
        },
      };

      // Call submitTask from task-main.ts ONCE.
      const orchestratorTaskId = await submitTask<IN, OUT, TProgressState>(
        taskDetails.taskType,
        taskDetails.workerPath,
        taskDetails.input,
        clientStateSnapshot,
        finalOrchestratorCallbacks 
      );

      if (!orchestratorTaskId) {
        // If submission fails, call the original onError.
        taskDetails.onError(new Error("Failed to submit task to orchestrator."));
        return null;
      }

      // Submission was successful, update the finalReturnedTask with the actual ID.
      finalReturnedTask.id = orchestratorTaskId;
      finalReturnedTask.status = "running"; // Set initial status

      // Store in activeTasks. Using 'as any' to simplify type compatibility for the collection,
      // as the primary type safety is for the returned 'finalReturnedTask'.
      client.activeTasks[orchestratorTaskId] = finalReturnedTask as any; 
      
      return finalReturnedTask;
    },
    sync: {
      send,
      broadcastState() {
        for (const ws of client.connections) {
          send(ws, { type: "state", state: client.state });
        }
      },
      onMessage(ws: ServerWebSocket<WSAIData>, raw: any) {
        const data = unpack(gunzipSync(raw));
        console.log("Received message:", data);
        // Handle client messages if any (e.g., cancel task)
        // This part is not implemented in the original code.
      },
    },
  };

  const timeout = {
    change: null as any, // Consider using NodeJS.Timeout or Bun.Timer
  };

  subscribe(client.state, () => {
    clearTimeout(timeout.change);
    timeout.change = setTimeout(() => {
      client.sync.broadcastState();
    }, 300);
  });

  return client;
};

export const getClient = (client_id: CLIENT_ID) => {
  if (!clients[client_id]) {
    clients[client_id] = newClient(client_id);
  }
  return clients[client_id];
};
