import { createPerplexitySdkAgent } from "../lib/agents/agent-perplexity-sdk";
import { taskWorker } from "../lib/task-worker";

const opportunityList = {
  funder: "" as string,
  amount: {
    from: "" as string,
    to: "" as string,
  },
  deadline: "" as string,
  link: "" as string,
  categories: [] as string[],
};

// Helper to extract valid JSON object from model output
function extractJsonFromContent(content: string): string | null {
  const firstBrace = content.indexOf("{");
  if (firstBrace === -1) return null;
  const possibleJson = content.slice(firstBrace).trim();
  return possibleJson;
}

export default taskWorker<
  {},
  { prompt: string; system?: string },
  typeof opportunityList
>({
  name: "opportunity_list",
  desc: "Asking",
  async execute({ input, agent }) {
    const context = `
      You are an intelligent assistant tasked with retrieving a list of current, publicly available funding opportunities based on a user's query.

      Your job is to search and extract multiple relevant funding opportunities. Perform a thorough search by using 4 to 5 query variations to ensure broad and accurate results. Only include verified, factual information—do not assume or fabricate.

      Your response must be a valid JSON array of objects. Do NOT include any text outside the JSON—no explanation, no tags, and no wrapping. The output must start with [ and end with ].

      Each object in the array must follow this structure:
      ${JSON.stringify(opportunityList, null, 2)}

      Guidelines:
      - Ensure each field contains complete and informative content.
      - Use "-" if information is not available.
      - Do not return partial or vague entries.
      - Include at least 3–5 opportunities if possible.
    `;

    const sdk = agent.deepseek;

    const responses = await Promise.all(
      Array.from({ length: 1 }).map(() =>
        sdk({
          system: input.system
            ? input.system
            : `You are an assistant that will generate a message in this JSON format: { answer: string }`,
          prompt: `${context}\n\n${input.prompt}`,
        })
      )
    );

    const parsedResults = responses
      .map((res, i) => {
        try {
          return JSON.parse(res.content);
        } catch (e) {
          try {
            const cleaned = extractJsonFromContent(res.content);
            if (!cleaned) {
              console.error(`Response is null`);
            }
            return JSON.parse(cleaned as string);
          } catch (e) {
            return null;
          }
        }
      })
      .filter(Boolean);

    function countValidFields(obj: any): number {
      let count = 0;

      for (const key in opportunityList) {
        const val = obj[key];
        if (typeof val === "string") {
          if (val.trim() !== "-") count++;
        } else if (Array.isArray(val)) {
          if (val.length > 0) count++;
        } else if (typeof val === "object" && val !== null) {
          for (const subKey in val) {
            if (val[subKey] && val[subKey].trim() !== "-") count++;
          }
        }
      }

      return count;
    }

    const bestResult = parsedResults.reduce((best, current) => {
      if (!best) return current;
      return countValidFields(current) > countValidFields(best)
        ? current
        : best;
    }, null);

    return bestResult;
  },
});
