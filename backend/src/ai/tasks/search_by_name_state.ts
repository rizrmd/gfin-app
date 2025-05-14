import { sampleOrg, type OrgState } from "shared/lib/org";
import { stateBizUrl } from "../helper/state_biz_url";

export const search_by_name_state = {
  prompt: (org: OrgState) => {
    const url = stateBizUrl.find((e) => {
      return e.state === org.entry.state;
    });

    const name = org.entry.name;
    const state = org.entry.state;
    const output = JSON.stringify(sampleOrg);

    return `
Search for organizations with name "${name}" in state "${state} in google
"${url ? `, prioritize visting url with ${url.website}` : ""}.

Return the result in JSON format with the following fields:
${output}
`;
  },
};
