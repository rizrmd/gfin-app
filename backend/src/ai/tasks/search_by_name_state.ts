import type { SerializableAgentState } from "r-agent/browser_use/agent/serializable_views";
import { taskWorker } from "../lib/task-worker";
import { usBizUrl } from "shared/lib/biz_url";

export default taskWorker<{ step: SerializableAgentState }>({
  name: "search_by_name_state",
  async execute({ state, agent, progress, resumeFrom, updateState }) {
    const name = state.organization.entityInformation.entityName;
    const us_state = state.organization.filingInformation.state;
    const url = usBizUrl.find((e) => {
      return e.state === us_state;
    });

    const prompt = `
Search for organizations with name "${name}" in state "${state} in google
"${url ? `, prioritize visting url with ${url.website}` : ""}.

Return the result in JSON format with the following fields:
${JSON.stringify(state.organization)}
`;

    const maxSteps = 10;
    await agent.browser({
      prompt,
      restore: resumeFrom?.data.step,
      maxSteps,
      onStep({ restore, current }) {
        progress({
          data: { step: restore },
          description: current.nextGoal,
          percentComplete: (current.step / maxSteps) * 100,
        });
      },
    });

    return {};
  },
});
