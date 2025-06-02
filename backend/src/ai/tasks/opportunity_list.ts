import { createPerplexitySdkAgent } from "../lib/agents/agent-perplexity-sdk";
import { taskWorker } from "../lib/task-worker";

const opportunityList = [{
  funder: "" as string,
  amount: {
    from: "" as string,
    to: "" as string,
  },
  deadline: "" as string,
  link: "" as string,
  categories: [] as string[],
}];

// Hilangkan tag <think> ... </think> dari string
function stripThinkTags(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// Ekstrak JSON array dari string setelah pembersihan
function extractJsonFromContent(content: string): string {
  const startIndex = content.indexOf("[");
  const endIndex = content.lastIndexOf("]");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Failed to locate JSON array in content.");
  }

  return content.slice(startIndex, endIndex + 1).trim();
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

      Your response must be a valid JSON array of objects and ONLY JSON ARRAY starts with [ and ends with ]. no need to include any reasoning, explanation, or additional text outside the JSON structure.

      no need to add any tags like <think>, <reasoning>, or explanation. Just return a raw JSON array starting with [ and ending with ].

      Each object in the array must follow this structure:
      ${JSON.stringify(opportunityList, null, 2)}

      Guidelines:
      - Ensure each field contains complete and informative content.
      - Use "-" if information is not available.
      - Do not return partial or vague entries.
    `;

    const sdk = agent.perplexity_sdk;

    const responses = await Promise.all(
      Array.from({ length: 1 }).map(() =>
        sdk({
          system: input.system
            ? input.system
            : `You are an assistant that will generate a message in this JSON array format: [{ answer: string }]`,
          prompt: `${context}\n\n${input.prompt}`,
        })
      )
    );
    console.log("Responses:", responses);

    const parsedResults = responses
      .map((res, i) => {
        try {
          const cleanedContent = stripThinkTags(res.content);
          const jsonPart = extractJsonFromContent(cleanedContent);
          return JSON.parse(jsonPart);
        } catch (err) {
          console.error(`❌ Failed to parse response[${i}]:`, res.content);
          throw new Error(`JSON parsing failed on response[${i}]: ${err}`);
        }
      })
      .flat();

    function countValidFields(obj: any): number {
      let count = 0;

      for (const key in opportunityList[0]) {
        const val = obj[key];
        if (typeof val === "string" && val.trim() !== "-") {
          count++;
        } else if (Array.isArray(val) && val.length > 0) {
          count++;
        } else if (typeof val === "object" && val !== null) {
          for (const subKey in val) {
            if (val[subKey]?.trim?.() !== "-") {
              count++;
            }
          }
        }
      }

      return count;
    }

    const bestResult = parsedResults.reduce((best, current) => {
      return !best || countValidFields(current) > countValidFields(best)
        ? current
        : best;
    });

    console.log("Best result:", bestResult);
    return parsedResults;
  },
});
