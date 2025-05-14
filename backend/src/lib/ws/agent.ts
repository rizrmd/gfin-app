import * as tasks from "backend/ai/ai-tasks";
import { agents, newAgent, type WSAgentData } from "backend/lib/new-agent";
import type { Server, WebSocketHandler } from "bun";
import type { OrgState } from "shared/lib/org";

export const agent: WebSocketHandler<WSAgentData> & {
  upgrade: (opt: { req: Request; server: Server }) => any | Promise<any>;
} = {
  upgrade({ req, server }) {
    const url = new URL(req.url);
    const client_id = url.pathname.split("/").pop()!;
    return {
      client_id,
    };
  },
  async message(ws, raw) {
    const msg = JSON.parse(raw as string) as
      | { type: "init"; state: OrgState }
      | ({ type: "action"; state: OrgState } & {
          action: string;
        });

    if (msg.type === "init") {
      const state = agents.get(ws.data.client_id);

      if (state) {
        state.state = msg.state;
      }
    } else if (msg.type === "action") {
      const agent = agents.get(ws.data.client_id);
      if (agent) {
        agent.state = msg.state;
        if (msg.action === "cancel") {
          const running = Object.keys(agent.running)[0];
          if (running) {
            agent.running[running]!.agent.stop();
            delete agent.running[running];
          }
        } else {
          const action = msg.action as keyof typeof tasks;
          const { name, state } = msg.state.entry;
          if (name && state) {
            const prompt = tasks[action].prompt(msg.state);
            if (prompt) {
              agent.running[action] = {
                agent: await newAgent({
                  taskName: action,
                  prompt,
                  ws,
                }),
                current: { step: 0, goal: "" },
              };
            } else {
              console.error("Task not found");
            }
          }
        }
      }
    }
  },
  open(ws) {
    if (agents.has(ws.data.client_id)) {
      const agent = agents.get(ws.data.client_id);
      if (agent) {
        ws.send(
          JSON.stringify({
            type: "init",
            state: agent.state,
            running: Object.entries(agent.running).map(([name, a]) => ({
              name: name,
              step: a.current.step,
              goal: a.current.goal,
            })),
          })
        );
      }
    } else {
      agents.set(ws.data.client_id, {
        state: { client_id: "", entry: {}, final: {} },
        running: {},
      });
    }
  },
  close(ws) {},
};
