export class SamGovAPI {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(params: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }) {
    this.apiKey  = params.apiKey;
    // Default to the v2 “search” endpoint
    this.baseUrl = params.baseUrl || 
      "https://api.sam.gov/opportunities/v2/search";
    this.timeout = params.timeout ?? 30000;
  }

  /**
   * Search for opportunities on SAM.gov
   * 
   * @param title      Full-text filter on the “title” field
   * @param options    Required date range + optional filters
   */
  async searchOpportunities(
    title: string,
    options: {
      postedFrom: string;                // MM/dd/yyyy (required)
      postedTo:   string;                // MM/dd/yyyy (required)
      limit?:     number;                // defaults to 5, max 1000
      offset?:    number;                // defaults to 0
      ptype?:     string[];              // procurement types
      solnum?:    string;                // solicitation number
      noticeid?:  string;                // notice ID
      state?:     string;                // place of performance – state
      zip?:       string;                // place of performance – zip
      typeOfSetAside?:            string;
      typeOfSetAsideDescription?: string;
      ncode?:     string;                // NAICS code
      ccode?:     string;                // classification code
      rdlfrom?:   string;                // response deadline from
      rdlto?:     string;                // response deadline to
      status?:    string;                // active|inactive|…
      organizationCode?: string;
      organizationName?: string;
    }
  ) {
    const url = new URL(this.baseUrl);
    url.searchParams.set("api_key", this.apiKey);
    // full-text search on title
    url.searchParams.set("title", title);
    // required date range
    url.searchParams.set("postedFrom", options.postedFrom);
    url.searchParams.set("postedTo",   options.postedTo);
    // pagination
    url.searchParams.set("limit",  (options.limit  ?? 5).toString());
    url.searchParams.set("offset", (options.offset ?? 0).toString());

    // all other optional filters
    if (options.ptype) {
      options.ptype.forEach(p => url.searchParams.append("ptype", p));
    }
    if (options.solnum)                      url.searchParams.set("solnum", options.solnum);
    if (options.noticeid)                    url.searchParams.set("noticeid", options.noticeid);
    if (options.state)                       url.searchParams.set("state", options.state);
    if (options.zip)                         url.searchParams.set("zip", options.zip);
    if (options.typeOfSetAside)              url.searchParams.set("typeOfSetAside", options.typeOfSetAside);
    if (options.typeOfSetAsideDescription)   url.searchParams.set("typeOfSetAsideDescription", options.typeOfSetAsideDescription);
    if (options.ncode)                       url.searchParams.set("ncode", options.ncode);
    if (options.ccode)                       url.searchParams.set("ccode", options.ccode);
    if (options.rdlfrom)                     url.searchParams.set("rdlfrom", options.rdlfrom);
    if (options.rdlto)                       url.searchParams.set("rdlto", options.rdlto);
    if (options.status)                      url.searchParams.set("status", options.status);
    if (options.organizationCode)            url.searchParams.set("organizationCode", options.organizationCode);
    if (options.organizationName)            url.searchParams.set("organizationName", options.organizationName);

    // abort controller for timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url.toString(), {
        method:  "GET",
        signal:  controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text();
        console.error(`SAM.gov API error ${res.status}:`, text);
        throw new Error(`Request failed: ${res.status}`);
      }

      const json = await res.json();
      // v2 returns under "opportunitiesData"
      return json.opportunitiesData as any[];
    } catch (err) {
      console.error("Error fetching SAM.gov data:", err);
      throw err;
    }
  }
}
