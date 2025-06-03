import { taskWorker } from "../lib/task-worker";
import { samGovTool } from "../tools";
// import { usBizUrl } from "shared/lib/biz_url";
// import { blankOrg } from "shared/lib/client_state";

export default taskWorker<
  {},
  { id_org: string; prompt: string; system?: string },
  { answer: string }
>({
  name: "check_requirement",
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

    const context = `You are an intelligent assistant tasked with identifying all the necessary information, documents, and qualifications required to register or apply for a specific opportunity using multiple online sources. Your task: 
    1. Use the provided official opportunity URL as a reference point.
    2. Perform multiple (4–5) searches using variations of the opportunity name and URL to ensure data completeness and accuracy.
    3. Identify all the required fields, documents, qualifications, or eligibility criteria needed to apply for the opportunity.
    4. Compare the identified requirements with the current available data.
    5. Return all required fields in a valid JSON format. Fill in any fields that can be completed using the current data. For fields that cannot be filled with the current data use a dash "-" as the value.
    6. Do not make assumptions or use placeholder data.
    7. Your response must be in valid JSON format only, with no additional explanation or text.
    8. Include only accurate and up-to-date information — do not include outdated or speculative data.

    Current available data: ${JSON.stringify(
    { ...(orgData as any), ...(clientProfile as any) },
    )}  
    Search thoroughly and carefully using multiple reputable sources to cross-verify your findings before responding.`;



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
