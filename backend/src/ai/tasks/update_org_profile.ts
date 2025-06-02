import { taskWorker } from "../lib/task-worker";
import { samGovTool } from "../tools";
import { usBizUrl } from "shared/lib/biz_url";
import { blankOrg } from "shared/lib/client_state";

export default taskWorker<
  {},
  { id_org: string; prompt: string; system?: string },
  { answer: string }
>({
  name: "update_org_profile",
  desc: "Asking",
  async execute({ agent, input, db }) {
    const org = await db.organizations.findFirst({
      where: { id: input.id_org },
      select: {
        data: true,
        client: {
          select: {
            profile: true,
          },
        },
      },
    });

    const orgData = org?.data;
    const clientProfile = org?.client?.profile;

    const context = `You are an intelligent assistant tasked with accurately gathering verified information about a specific organization using multiple online sources. Your task: 1. Search using the provided official business URL as a reference point. 2. Use multiple (4–5) searches with variations of the organization name and URL to ensure data accuracy and completeness. 3. Fill the provided JSON fields only with verified information (no assumptions or placeholders). 4. If a specific field is not publicly available or verifiable, use a dash "-" to denote that. 5. Your response must be in valid JSON format only, with no additional text or explanation outside the JSON structure. 6. Include only relevant and up-to-date information — do not include outdated, placeholder, or speculative data. Reference business URL: ${usBizUrl} Organization fields to fill: ${JSON.stringify(
      { ...blankOrg},
    )}. 
    current available data : ${JSON.stringify(
      {...(orgData as any), ...(clientProfile as any) },
    )} Search thoroughly and carefully, using multiple reputable sources to cross-verify your findings before responding.`;

    const responses = await Promise.all(
      Array.from({ length: 2 }).map(() =>
        agent.perplexity_openrouter({
          system: input.system
            ? input.system
            : `You are an assistant that will generate a message in this JSON format: { answer: string }`,
          prompt: `${context}\n\n${input.prompt}`,
          tools: [samGovTool],
          tool_choice: "auto",
        })
      )
    );

    const parsedResults = responses
      .map((res) => {
        try {
          const parsed = JSON.parse(res.content);
          return parsed;
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          return null;
        }
      })
      .filter(Boolean);

    // Helper function to count non-empty fields
    function countValidFields(obj: Record<string, any>): number {
      return Object.values(obj).reduce(
        (count, val) =>
          val !== "-" && val !== "" && val !== null ? count + 1 : count,
        0
      );
    }

    // Select the result with the most non-dash values
    const bestResult = parsedResults.reduce((best, current) => {
      if (!best) return current;
      return countValidFields(current) > countValidFields(best)
        ? current
        : best;
    }, null);

    await db.organizations.update({
      where: { id: input.id_org },
      data: {
        data: bestResult as any,
      },
    });

    return bestResult ?? { answer: "-" };
  },
});
