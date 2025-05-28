// tasks/sam_gov.ts
import { taskWorker } from "../lib/task-worker";
import { SamGovAPI } from "../lib/sam-gov-api";

type SamGovInput = {
  prompt: string;
  system?: string;
};

interface LlmParsed {
  query: string;
  postedFrom: string;  // MM/DD/YYYY
  postedTo: string;    // MM/DD/YYYY
}

type SamGovOutput = {
  query: string;
  postedFrom: string;
  postedTo: string;
  results: any[];
};

export default taskWorker<{}, SamGovInput, SamGovOutput>({
  name: "sam_gov",
  desc: "LLM-powered search for SAM.gov",
  async execute({ agent, input }) {
    const res = await agent.oneshot({
      system: `
        You are an assistant whose SOLE JOB is to prepare a query for the SAM.gov API (endpoint: https://api.sam.gov/opportunities/v2/search). 
        You understand that:
        - The API uses dates in MM/DD/YYYY format.
        - The “title” parameter is the full-text search on the opportunity title.
        From the user’s prompt, extract exactly these three fields:
        {
          "query":     "<search keywords as a single string>",
          "postedFrom": "MM/DD/YYYY",
          "postedTo":   "MM/DD/YYYY"
        }
        If the user says “now” for postedTo, substitute today’s date (05/28/2025). 
        **Output strictly valid JSON**—no comments, no extra keys, no markdown.`,
      ...input,
    });

    let parsed: LlmParsed;
    try {
      parsed = JSON.parse(res.content) as LlmParsed;
      console.log("✅ Parsed LLM JSON:", parsed);
    } catch (err) {
      console.error("❌ Failed to parse LLM JSON:", res.content);
      throw new Error("LLM did not return valid JSON");
    }
    if (!parsed.query || !parsed.postedFrom || !parsed.postedTo) {
      throw new Error(
        `LLM response missing required fields: ${JSON.stringify(parsed)}`
      );
    }

    const sam = new SamGovAPI({
      apiKey: process.env.SAM_API_KEY!,
    });
    const results = await sam.searchOpportunities(parsed.query, {
      postedFrom: parsed.postedFrom,
      postedTo:   parsed.postedTo,
    });

    // console.log(
    //   `🔍 SAM.gov search for "${parsed.query}" from ${parsed.postedFrom} to ${parsed.postedTo} returned ${results.length} results`
    // );

    return {
      query: parsed.query,
      postedFrom: parsed.postedFrom,
      postedTo: parsed.postedTo,
      results,
    };
  },
});
