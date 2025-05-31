import { StructuredTool } from "r-agent";
import { z } from "zod";
import { SamGovAPI } from "../lib/api/sam-gov-api";

/**
 * SAM.gov Government Contracting Tool
 *
 * This tool provides access to government contracting opportunities from SAM.gov,
 * the official U.S. government system for procurement and award data.
 *
 * Features:
 * - Search federal contracts and procurement opportunities
 * - Filter by location, industry codes (NAICS), set-aside types
 * - Access detailed opportunity information including deadlines and requirements
 * - Support for pagination and result limiting
 *
 * @example
 * ```typescript
 * // Search for software development contracts in California
 * const result = await samGovTool.action({
 *   query: "software development",
 *   state: "CA",
 *   limit: 20,
 *   ptype: ["o"], // solicitations only
 *   status: "active"
 * });
 * ```
 */
export const samGovTool = new StructuredTool({
  name: "sam_gov_search",
  description: `Search for government contracting opportunities on SAM.gov. 
    Use this tool to find federal contracts, grants, and procurement opportunities. 
    You can search by various criteria like title, location, NAICS codes, dates, organization info, 
    response deadlines, procurement types, set-aside types, and more. Supports advanced filtering 
    with department names, organization codes, classification codes, and status filters.`,
  schema: z.object({
    query: z
      .string()
      .optional()
      .describe(
        "Full-text search term for opportunity titles and descriptions"
      ),
    postedFrom: z
      .string()
      .optional()
      .describe("Start date for posting range in MM/DD/YYYY format"),
    postedTo: z
      .string()
      .optional()
      .describe("End date for posting range in MM/DD/YYYY format"),
    state: z
      .string()
      .optional()
      .describe(
        "State abbreviation for place of performance (e.g., 'CA', 'NY')"
      ),
    zip: z.string().optional().describe("ZIP code for place of performance"),
    ncode: z
      .string()
      .optional()
      .describe("NAICS code for industry classification"),
    typeOfSetAside: z
      .string()
      .optional()
      .describe("Set-aside type (e.g., 'SBA', 'WOSB', 'SDVOSB')"),
    solnum: z
      .string()
      .optional()
      .describe("Solicitation number if searching for specific opportunity"),
    limit: z
      .number()
      .optional()
      .describe("Number of results to return (max 1000, default 100)"),
    offset: z.number().optional().describe("Offset for pagination (default 0)"),
    ptype: z
      .array(z.string())
      .optional()
      .describe(
        "Procurement types array (e.g., ['o', 'k'] for solicitations and awards)"
      ),
    noticeid: z
      .string()
      .optional()
      .describe("Notice ID for specific opportunity"),
    title: z
      .string()
      .optional()
      .describe("Full-text search on opportunity title (separate from query)"),
    deptname: z.string().optional().describe("Department name filter"),
    subtier: z.string().optional().describe("Subtier organization filter"),
    organizationCode: z
      .string()
      .optional()
      .describe("Organization code filter"),
    organizationName: z
      .string()
      .optional()
      .describe("Organization name filter"),
    typeOfSetAsideDescription: z
      .string()
      .optional()
      .describe("Set-aside type description filter"),
    ccode: z.string().optional().describe("Classification code filter"),
    rdlfrom: z
      .string()
      .optional()
      .describe("Response deadline from date in MM/DD/YYYY format"),
    rdlto: z
      .string()
      .optional()
      .describe("Response deadline to date in MM/DD/YYYY format"),
    status: z
      .string()
      .optional()
      .describe("Status filter (e.g., 'active', 'inactive')"),
  }),

  async action(args: {
    query?: string;
    postedFrom?: string;
    postedTo?: string;
    state?: string;
    zip?: string;
    ncode?: string;
    typeOfSetAside?: string;
    solnum?: string;
    limit?: number;
    offset?: number;
    ptype?: string[];
    noticeid?: string;
    title?: string;
    deptname?: string;
    subtier?: string;
    organizationCode?: string;
    organizationName?: string;
    typeOfSetAsideDescription?: string;
    ccode?: string;
    rdlfrom?: string;
    rdlto?: string;
    status?: string;
  }) {
    try {
      // Set default date range if not provided (last 11 months to today)
      const today = new Date();
      const elevenMonthsAgo = new Date();
      elevenMonthsAgo.setMonth(today.getMonth() - 11);

      const formatDate = (date: Date) => {
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
          .getDate()
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      };

      const searchParams = {
        query: args.query || "contracts",
        postedFrom: args.postedFrom || formatDate(elevenMonthsAgo),
        postedTo: args.postedTo || formatDate(today),
        state: args.state || "",
        zip: args.zip || "",
        ncode: args.ncode || "",
        typeOfSetAside: args.typeOfSetAside || "",
        solnum: args.solnum || "",
        limit: args.limit || 100,
        offset: args.offset || 0,
        ptype: args.ptype || [],
        noticeid: args.noticeid || "",
        title: args.title || "",
        deptname: args.deptname || "",
        subtier: args.subtier || "",
        organizationCode: args.organizationCode || "",
        organizationName: args.organizationName || "",
        typeOfSetAsideDescription: args.typeOfSetAsideDescription || "",
        ccode: args.ccode || "",
        rdlfrom: args.rdlfrom || "",
        rdlto: args.rdlto || "",
        status: args.status || "",
      };

      const samAPI = new SamGovAPI({
        apiKey: process.env.SAM_API_KEY!,
      });

      const opportunities = await samAPI.searchOpportunities(searchParams);

      return {
        success: true,
        count: opportunities.length,
        opportunities: opportunities.map((opp) => ({
          noticeId: opp.noticeId,
          title: opp.title,
          solicitationNumber: opp.solicitationNumber,
          description: opp.description,
          postedDate: opp.postedDate,
          responseDeadLine: opp.responseDeadLine,
          type: opp.type,
          organizationType: opp.organizationType,
          naicsCode: opp.naicsCode,
          typeOfSetAsideDescription: opp.typeOfSetAsideDescription,
          officeAddress: opp.officeAddress,
          placeOfPerformance: opp.placeOfPerformance,
          uiLink: opp.uiLink,
        })),
      };
    } catch (error) {
      console.error("SAM.gov search error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        opportunities: [],
      };
    }
  },
});
