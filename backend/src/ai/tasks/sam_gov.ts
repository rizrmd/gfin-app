import type { SerializableAgentState } from "r-agent/browser_use/agent/serializable_views";
import { taskWorker } from "../lib/task-worker";

export default taskWorker<{ step: SerializableAgentState }, {}>({
  name: "perplexity",
  desc: "Search the web and provide answers with sources using Perplexity AI",
  async execute({ progress, resumeFrom, agent }) {
    return {};
  },
});
