import { type TaskName, type Tasks } from "backend/ai/tasks";
import { gzipSync } from "fflate";
import { pack } from "msgpackr";
import { useEffect } from "react";
import { v6 } from "uuid";
import { aiState } from "./state";
import { aiSync } from "./sync";

const aiClient = () => {
  const state = aiState();
  const sync = aiSync();

  const onProgress = {} as Record<string, Set<any>>;

  const taskPromises = {} as Record<
    string,
    { id: string; reject: (error: any) => void; resolve: (arg: any) => void }
  >;

  sync.onmessage = (msg: {
    type: "taskInit" | "taskComplete" | "taskProgress" | "taskError";
    task_id: string;
    name: string;
    percentComplete: number;
    description: string;
    error?: { message: string; stack?: string };
    output?: any;
    init_id?: string;
  }) => {
    console.log(msg);
    if (msg.type === "taskInit") {
      if (!msg.init_id) {
        console.error("Task init message without init_id", msg);
        return;
      } else {
        if (taskPromises[msg.init_id]) {
          taskPromises[msg.init_id].id = msg.task_id;
          taskPromises[msg.task_id] = taskPromises[msg.init_id!];
          delete taskPromises[msg.init_id!];
        } else {
          console.error("Task promises without init_id", msg, taskPromises);
        }
      }
    } else if (msg.type === "taskProgress") {
      for (const callback of onProgress[msg.name] || []) {
        callback(msg);
      }
    } else if (msg.type === "taskComplete") {
      if (taskPromises[msg.task_id]) {
        taskPromises[msg.task_id].resolve(msg.output);
        delete taskPromises[msg.task_id];
      }
    } else if (msg.type === "taskError") {
      if (taskPromises[msg.task_id]) {
        taskPromises[msg.task_id].reject(msg.error);
        delete taskPromises[msg.task_id];
      }
    }
  };

  return {
    state,
    sync,
    task: {
      active: {} as Record<string, any>,
      do: async <Name extends TaskName>(
        name: Name,
        input: Tasks[Name]["input"]
      ): Promise<Tasks[Name]["output"]> => {
        return new Promise<Tasks[Name]["output"]>(async (resolve, reject) => {
          const init_id = v6();
          taskPromises[init_id] = {
            id: "",
            reject,
            resolve,
          };
          if (!sync.ws || sync.ws.readyState !== WebSocket.OPEN) {
            await new Promise<void>((resolve) => {
              const ival = setInterval(() => {
                if (sync.ws && sync.ws.readyState === WebSocket.OPEN) {
                  clearInterval(ival);
                  resolve();
                }
              }, 100);
            });
          }

          sync.ws?.send(
            gzipSync(pack({ type: "doTask", name, input, init_id: init_id }))
          );
        });
      },
      onProgress,
    },
  };
};

const w = window as unknown as {
  ai_client: ReturnType<typeof aiClient>;
};

if (!w.ai_client) {
  w.ai_client = aiClient();
}

export const useAI = (arg?: {
  progress?: Record<
    TaskName,
    (opt: {
      task_id: string;
      percentComplete: number;
      description: string;
    }) => void
  >;
}) => {
  w.ai_client.sync.init();

  useEffect(() => {
    if (arg) {
      if (arg.progress) {
        for (const [name, callback] of Object.entries(arg.progress)) {
          if (!w.ai_client.task.onProgress[name]) {
            w.ai_client.task.onProgress[name] = new Set();
          }
          w.ai_client.task.onProgress[name].add(callback);
        }
      }
      return () => {
        if (arg.progress) {
          for (const [name, callback] of Object.entries(arg.progress)) {
            if (w.ai_client.task.onProgress[name]) {
              w.ai_client.task.onProgress[name].delete(callback);
            }
          }
        }
      };
    }
  }, []);

  return w.ai_client;
};
