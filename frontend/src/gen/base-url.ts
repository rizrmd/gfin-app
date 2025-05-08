  import { defineBaseUrl, type SiteConfig } from "rlib/server";
  import raw_config from "../../../config.json";
  
  const config = raw_config satisfies SiteConfig;
  export const baseUrl = defineBaseUrl(config);
  