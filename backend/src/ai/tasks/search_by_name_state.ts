import type { SerializableAgentState } from "r-agent/browser_use/agent/serializable_views";
import { taskWorker } from "../lib/task-worker";

export default taskWorker<{ step: SerializableAgentState }>({
  name: "search_by_name_state",
  async execute({ state, agent, progress, resumeFrom, updateState }) {
    // progress({})

    return {};
  },
});
