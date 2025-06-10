// tasks/sam_gov.ts
import { taskWorker } from "../lib/task-worker";
// import { SamGovAPI } from "../lib/sam-gov-api";

// Input tetap sama
type SamGovInput = {
  prompt: string;
  system?: string;
};

// Semua parameter request API, dipakai sebagai hasil parse LLM
interface LlmParsed {
  ptype: string[]; // kosong [] kalau tidak disebut
  solnum: string;
  noticeid: string;
  title: string;
  query: string;
  postedFrom: string; // MM/DD/YYYY
  postedTo: string; // MM/DD/YYYY
  deptname: string;
  subtier: string;
  state: string;
  zip: string;
  organizationCode: string;
  organizationName: string;
  typeOfSetAside: string;
  typeOfSetAsideDescription: string;
  ncode: string;
  ccode: string;
  rdlfrom: string;
  rdlto: string;
  status: string;
  limit: number;
  offset: number;
}

// Output juga menambahkan results, plus semua parameter
type SamGovOutput =
  // LlmParsed &
  {
    results: any[];
  };

const system = `You are an assistant whose SOLE JOB is to prepare a query for the SAM.gov Opportunities Search API (endpoint: https://api.sam.gov/opportunities/v2/search).
  You understand that:
  - All dates must be in MM/DD/YYYY format.
  - “title” corresponds to a full-text search on the opportunity title.
  - If the user does not provide a “query” field, default to "contracts".
  - If the user does not provide any other field, still include the key with an empty string as its value.
  - If the user doesnt provide a time range, use today for postedTo
  - If the user doesnt provide a time range, Compute postedFrom as the date exactly eleven months before today’s date (MM/DD/YYYY)
  - If the user provides a time range, use those dates.
  Available request parameters (all optional except where noted):
  - ptype (Array<String>)
  - solnum (String)
  - noticeid (String)
  - title (String)
  - query (String)
  - postedFrom (String, MM/DD/YYYY, required)
  - postedTo (String, MM/DD/YYYY, required)
  - deptname (String)
  - subtier (String)
  - state (String)
  - zip (String)
  - organizationCode (String)
  - organizationName (String)
  - typeOfSetAside (String)
  - typeOfSetAsideDescription (String)
  - ncode (String)
  - ccode (String)
  - rdlfrom (String, MM/DD/YYYY)
  - rdlto (String, MM/DD/YYYY)
  - status (String)
  - limit (Integer)
  - offset (Integer)

  From the user’s input, extract values for **every** parameter above. If the user doesn’t mention a parameter, set its value to an empty string ("") for strings, or an empty array ([]) for arrays, or 0 for integers. Use today’s date (05/28/2025) if the user says “now” for postedTo.

  Return a single JSON object with all keys exactly as listed above. **No comments, no extra keys, no markdown.**`;

export default taskWorker<{}, SamGovInput, SamGovOutput>({
  name: "sam_gov",
  desc: "LLM-powered search for SAM.gov",
  async execute({ agent, input }) {
    const res = await agent.oneshot({ system, ...input });
    const parsed = JSON.parse(res.content) as LlmParsed;

    console.log(parsed);
    // panggil API
    const sam = new SamGovAPI({ apiKey: process.env.SAM_API_KEY! });
    const results = await sam.searchOpportunities(parsed);
    return {
      // ...parsed,
      results,
    };
  },
});

// "Error: LLM response missing required fields: {"query":"","postedFrom":"01/01/2025","postedTo":"05/28/2025"}
// at execute (C:\Users\Asus\Documents\New folder\gfin-app\backend\src\ai\tasks\sam_gov.ts:66:17)
// at processTicksAndRejections (native:7:39)"