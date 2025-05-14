import { baseUrl } from "@/lib/gen/base-url";
import { proxy, ref } from "valtio";
import type { OrgState } from "shared/lib/org";
import type * as ai_tasks from "backend/ai/ai-tasks";

export const onboard = proxy({
  step: "first_form" as "first_form" | keyof typeof ai_tasks,
  agent: {
    step: 0,
    goal: `Initializing`,
    done: false,
    result: null as any,
    ts: 0,
  },
  org: {
    entry: {
      name: "Deep Learning Intelligence",
      state: "Florida",
    },
  } as OrgState,
  
  async do_task(task: keyof typeof ai_tasks) {
    return {} as any;
  },

  sync: ref({
    ws: null as null | WebSocket,
    init(org: OrgState) {
      return new Promise<void>((done) => {
        if (this.ws) return;

        onboard.org = org;

        this.ws = new WebSocket(`${baseUrl.default}/ws/agent/${org.client_id}`);
        this.ws.onopen = () => {
          this.ws?.send(JSON.stringify({ type: "init", state: onboard.org }));
        };

        this.ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.type === "init") {
            if (msg.state) {
              for (const [k, v] of Object.entries(msg.state)) {
                onboard.org[k] = v;
              }
              done();
            }
            if (msg.running) {
              const found = msg.running.find(
                (e: any) => e.name === "search_by_name_state"
              );
              if (found) {
                onboard.step = "search_by_name_state";
                onboard.agent.goal = found.goal;
                onboard.agent.step = found.step;
              }
            }
          } else if (msg.type === "step") {
            onboard.agent.step = msg.step;
            onboard.agent.goal = msg.goal;
            onboard.agent.done = false;
          } else if (msg.type === "done") {
            onboard.agent.step = 0;
            onboard.agent.goal = "";
            onboard.agent.done = true;
            onboard.agent.result = msg.result;
          }
        };
      });
    },
    send(arg: { task: keyof typeof ai_tasks } | { task: "cancel" }) {
      if (!this.ws) {
        console.error("WebSocket is not initialized");
        return;
      }
      const send = (opt?: any) => {
        this.ws.send(
          JSON.stringify({
            ...opt,
            state: onboard.org,
            type: "action",
            action: arg.task,
          })
        );
      };

      onboard.agent.ts = Date.now();
      send();
    },
  }),
});
