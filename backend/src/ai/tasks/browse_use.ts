import type { SerializableAgentState } from "r-agent/browser_use/agent/serializable_views";
import { usBizUrl } from "shared/lib/biz_url";
import { blankOrg } from "shared/lib/client_state";
import { taskWorker } from "../lib/task-worker";

export default taskWorker<
  { step: SerializableAgentState },
  { orgName: string; state: string },
  typeof blankOrg
>({
  name: "search_org",
  desc: "Finding organizations",
  async execute({ agent, progress, resumeFrom, db, input }) {
    const name = input.orgName;
    const us_state = input.state;
    const url = usBizUrl.find((e) => {
      return e.state === us_state;
    });

    const prompt = `
    Search google for organizations with name "${name}" in ${us_state} 
    ${url ? `, prioritize visting url with ${url.website}` : ""}.

    Return the result in JSON format with the following fields:
    ${JSON.stringify(blankOrg)}
        `;

    const maxSteps = 10;
    
    const res = await agent.browser({
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

    return res as typeof blankOrg;
  },
});
