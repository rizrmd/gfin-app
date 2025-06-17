// tasks/sam_gov.ts
import { taskWorker } from "../lib/task-worker";
import { SamGovAPI } from "../lib/api/sam-gov-api";

function stripThinkTags(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function extractJsonFromContent(content: string): string {
  const startIndex = content.indexOf("{");
  const endIndex = content.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("Failed to locate JSON array in content.");
  }

  return content.slice(startIndex, endIndex + 1).trim();
}

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

// Output is just the validated request object for SAM.gov API
type SamGovOutput = LlmParsed;

const system = `
You are an API request formatter for SAM.gov. Your task is to convert natural language search requests into a structured JSON format that can be directly used with the SAM.gov API.

Convert the user's search requirements into a JSON request with this structure: { "request": object }. Do not search or fetch results - just create the request JSON.

The request object MUST have these fields (exact names and types):

{
  "ptype": [],                           // Array of string codes, or empty array if missing.
  "solnum": "",                          // String, empty if missing.
  "noticeid": "",                        // String, empty if missing.
  "title": "",                           // String, empty if missing. Do NOT use boolean operators like "OR".
  "query": "contracts",                  // String, default "contracts" if missing. Do NOT use "OR".
  "postedTo": "MM/DD/YYYY",              // String, MM/DD/YYYY format. If missing use today date.
  "postedFrom": "MM/DD/YYYY",            // String, MM/DD/YYYY format. If missing use 11 month before postedTo.
  "deptname": "",                        // String, empty if missing.
  "subtier": "",                         // String, empty if missing.
  "state": "",                           // String, empty if missing.
  "zip": "",                             // String, empty if missing.
  "organizationCode": "",                // String, empty if missing.
  "organizationName": "",                // String, empty if missing.
  "typeOfSetAside": "",                  // String, use ONE set aside code (ex: "SBA" or "8A"), or empty if missing.
  "typeOfSetAsideDescription": "",       // String, empty if missing.
  "ncode": "",                           // String, ONE NAICS code (ex: "541511"), or empty if missing.
  "ccode": "",                           // String, empty if missing.
  "rdlfrom": "",                         // String, MM/DD/YYYY or empty.
  "rdlto": "",                           // String, MM/DD/YYYY or empty.
  "status": "",                          // String, empty if missing.
  "limit": 0,                            // Integer, use 10 if missing.
  "offset": 0                            // Integer, use 0 if missing.
}

Rules:
1. Always output every field above, even if empty.
2. Use empty string ("") for missing string fields.
3. Use empty array ([]) for ptype if missing.
4. Use zero (0) for missing number fields (limit/offset).
5. Dates must be in MM/DD/YYYY format.
6. If query is missing, default to "contracts".
7. For typeOfSetAside, ONLY ONE code as a string (not an array). Example: "SBA", "8A", "HZC", or "".
8. For ncode, ONLY ONE NAICS code as a string. Example: "541511" or "".
9. Do not use boolean operators like "OR" in any string field such as title, query, deptname, etc.
10. Do not output any arrays except ptype.

Allowed ptype codes (array of strings):  
"u" = J&A,  
"p" = Pre-solicitation,  
"a" = Award Notice,  
"r" = Sources Sought,  
"s" = Special Notice,  
"o" = Solicitation,  
"g" = Surplus,  
"k" = Combined Synopsis/Solicitation,  
"i" = Bundle.

Output only the JSON object in this structure, no extra fields, comments, or explanation.

Here is an example:

User: find me the latest AI contracts in California

Output:
{
  "request": {
    "ptype": [],
    "solnum": "",
    "noticeid": "",
    "title": "AI",
    "query": "contracts",
    "postedFrom": "07/11/2024",
    "postedTo": "06/11/2025",
    "deptname": "",
    "subtier": "",
    "state": "CA",
    "zip": "",
    "organizationCode": "",
    "organizationName": "",
    "typeOfSetAside": "",
    "typeOfSetAsideDescription": "",
    "ncode": "541511",
    "ccode": "",
    "rdlfrom": "",
    "rdlto": "",
    "status": "",
    "limit": 10,
    "offset": 0
  }
}
`;

function validateRequest(obj: any): LlmParsed {
  if (!obj || typeof obj !== 'object') {
    throw new Error("Invalid response format: expected an object");
  }

  // If the response is wrapped in a request object, unwrap it
  const request = obj.request || obj;

  // Check all required fields and provide defaults
  const today = new Date();
  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(today.getMonth() - 11);
  const validated: LlmParsed = {
    ptype: Array.isArray(request.ptype) ? request.ptype : [],
    solnum: request.solnum || "",
    noticeid: request.noticeid || "",
    // Combine title and query into the title field since that's what the API expects
    title: request.title || request.query || "contracts",
    query: "", // Not used by API
    postedFrom: request.postedFrom || elevenMonthsAgo.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}),
    postedTo: request.postedTo || today.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}),
    deptname: request.deptname || "",
    subtier: request.subtier || "",
    state: request.state || "",
    zip: request.zip || "",
    organizationCode: request.organizationCode || "",
    organizationName: request.organizationName || "",
    typeOfSetAside: request.typeOfSetAside || "",
    typeOfSetAsideDescription: request.typeOfSetAsideDescription || "",
    ncode: request.ncode || "",
    ccode: request.ccode || "",
    rdlfrom: request.rdlfrom || "",
    rdlto: request.rdlto || "",
    status: request.status || "",
    limit: typeof request.limit === 'number' ? request.limit : 10,
    offset: typeof request.offset === 'number' ? request.offset : 0
  };

  return validated;
}

export default taskWorker<{}, SamGovInput, SamGovOutput>({
  name: "sam_gov",
  desc: "LLM-powered search for SAM.gov",
  async execute({ agent, input }) {
    const res = await agent.perplexity_openrouter({
      system: system,
      prompt: input.prompt,
    });
    
    console.log("Raw LLM response:", res.content);
    
    try {
      const cleanedContent = stripThinkTags(res.content);
      const jsonPart = extractJsonFromContent(cleanedContent);
      const parsed = JSON.parse(jsonPart);
      console.log("Parsed JSON:", parsed);
      
      // Validate and normalize the request object
      const request = validateRequest(parsed);
      console.log("Validated request:", request);
      
      // Call SAM.gov API with the request
      const sam = new SamGovAPI({ apiKey: process.env.SAM_API_KEY! });
      console.log("Calling SAM.gov API...");
      const results = await sam.searchOpportunities(request);
      console.log("SAM.gov API response:", JSON.stringify(results, null, 2));
      
      return request;
    } catch (error) {
      console.error("Parse error:", error);
      console.error("Response that caused error:", res.content);
      throw error;
    }
  },
});