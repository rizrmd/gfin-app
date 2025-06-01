import { createPerplexitySdkAgent } from "../lib/agents/agent-perplexity-sdk";
import { taskWorker } from "../lib/task-worker";

const detailList = {
  company_name: "" as string,
  grant_amount: "" as string,
  fields_of_work: [] as string[],
  application_types: [] as string[],
  overview: "" as string,
  funding_uses: "" as string,
  location_of_projects: "" as string,
  location_of_residence: "" as string,
  url: "" as string,
  contact_information: {
    address: "" as string,
    email: "" as string,
    phone: "" as string,
  },
  key_people: [] as {
    name: string;
    title: string;
    email: string;
  }[],
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
  typeof detailList
>({
  name: "opportunity_detail",
  desc: "Asking",
  async execute({ input, agent }) {
    const context = `
      You are an intelligent assistant tasked with retrieving and extracting detailed, accurate information about a specific funding opportunity.

      Your job is to fill in the following detail fields based on all available and reliable sources. Perform a thorough search by repeating the process 4 to 5 times using different query variations to maximize data coverage and accuracy. Only include confirmed information—do not assume or fabricate.

      Output must be a valid JSON object and nothing else. Do NOT include any tags like <think>, <reasoning>, or explanation. Just return a raw JSON object starting with { and ending with }.

      For each field, ensure the value is a complete, well-formed sentence or list with specific, factual information. Avoid vague or generic phrases. For example, do NOT just answer "yes", "available", or "applicable". Each value must be clearly understandable without requiring external context.

      If a field is a string, it must be a full sentence or informative phrase. If a field is a list, it must contain specific items. Do not leave any field blank — if you find no information, use a single dash "-" to indicate that.

      Do not repeat the field names or explain what you’re doing. Just return the JSON object with populated values.

      Here are the detail fields you must populate: ${JSON.stringify(
        detailList
      )}
    `;

    const sdk = agent.perplexity_sdk;

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
          const cleaned = extractJsonFromContent(res.content);
          if (!cleaned) {
            console.error(
              `Response ${i + 1} does not contain JSON object:\n`,
              res.content.slice(0, 100)
            );
            return null;
          }
          return JSON.parse(cleaned);
        } catch (e) {
          console.error(
            `Failed to parse JSON from response ${i + 1}:`,
            e,
            "\nContent:",
            res.content
          );
          return null;
        }
      })
      .filter(Boolean);

    function countValidFields(obj: any): number {
      let count = 0;

      for (const key in detailList) {
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
