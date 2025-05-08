import { pageModules } from "@/lib/gen/routes";
import {
  basePath,
  getDomainKeyByPort,
  matchRoute,
  ParamsContext,
  parsePattern,
  type Params,
} from "@/lib/router";
import { useContext, useEffect } from "react";
import raw_config from "../../../../config.json";
import { useLocal } from "./use-local";

interface SiteConfig {
  domains?: string[];
  [key: string]: any;
}

interface Config {
  sites: Record<string, SiteConfig>;
  [key: string]: any;
}

const config = raw_config as Config;

// Get domain key from hostname (for non-localhost environments)
function getDomainKeyByHostname(hostname: string): string | null {
  // For other domains, check the normal mappings
  for (const [domain, cfg] of Object.entries(config.sites)) {
    if (cfg.domains && Array.isArray(cfg.domains)) {
      if (cfg.domains.includes(hostname)) {
        return domain;
      }
    }
  }
  return null;
}

const router = {
  currentPath: window.location.pathname,
  currentFullPath: window.location.pathname + window.location.hash,
  params: {} as Params,
  hash: {} as Record<string, string>,
};

function parseHash(hash: string): Record<string, string> {
  if (!hash || hash === '#') return {};
  
  // Remove the leading '#' character
  const hashContent = hash.substring(1);
  const params: Record<string, string> = {};
  
  // Split by & to get key-value pairs
  const pairs = hashContent.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[key] = value || '';
    }
  }
  
  return params;
}

export function useRoot() {
  const local = useLocal({
    Page: null as React.ComponentType | null,
    routePath: "",
    isLoading: true,
  });
  useEffect(() => {
    const handlePathChange = () => {
      router.currentPath = window.location.pathname;
      router.currentFullPath = window.location.pathname + window.location.hash;
      router.hash = parseHash(window.location.hash);
      setTimeout(local.render);
    };

    window.addEventListener("popstate", handlePathChange);
    // Also handle initial hash
    router.hash = parseHash(window.location.hash);
    return () => window.removeEventListener("popstate", handlePathChange);
  }, []);

  useEffect(() => {
    const logRouteChange = async (path: string) => {
      // api.logRoute(path, user?.id);
    };

    const loadPage = async () => {
      // Always strip basePath if it exists, since the route definitions don't include it
      const withoutBase =
        basePath !== "/" && router.currentPath.startsWith(basePath)
          ? router.currentPath.slice(basePath.length)
          : router.currentPath;
      // Ensure path starts with slash and handle trailing slashes
      const path =
        (withoutBase.startsWith("/") ? withoutBase : "/" + withoutBase).replace(
          /\/$/,
          ""
        ) || "/";

      await logRouteChange(path);

      const hostname = window.location.hostname;
      const isFirebaseStudio = hostname.endsWith('.github.dev')
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
      let domainKey: null | string = null;

      // Determine the domain key based on environment
      if (isFirebaseStudio) {
        const parts = hostname.split("-");
        const lastPart = parts[parts.length - 1]!.split(
          "."
        );
        const port = lastPart[0];
        domainKey = getDomainKeyByPort(port);
      } else if (isLocalhost) {
        // For localhost, use port number to determine domain
        const port = window.location.port;
        domainKey = getDomainKeyByPort(port);
      } else {
        // For non-localhost, use hostname to determine domain
        domainKey = getDomainKeyByHostname(hostname);
      }

      let pageLoader =
        pageModules[
        domainKey ? `/${domainKey}${path === "/" ? "" : path}` : path
        ];
      let matchedParams = {};

      // If no exact match, check if we're on localhost with a specific port
      if (!pageLoader && domainKey) {
        // Try to match with domain-specific route
        const domainPageLoader = pageModules[path];

        if (domainPageLoader) {
          // We found a match for domain-specific path
          pageLoader = domainPageLoader;
          matchedParams = {};
        }
      }

      // If still no match, try parameterized routes
      if (!pageLoader) {
        for (const [pattern, loader] of Object.entries(pageModules)) {
          const routePattern = parsePattern(pattern);
          const params = matchRoute(path, routePattern);
          if (params) {
            pageLoader = loader;
            matchedParams = params;
            break;
          }
        }
      }

      if (pageLoader) {
        try {
          const module = await pageLoader();
          local.routePath = path;
          local.Page = module.default;
          router.params = matchedParams;
          local.isLoading = false;
          local.render();
        } catch (err) {
          console.error("Failed to load page:", err);
          local.Page = null;
          local.routePath = "";
          router.params = {};
          local.isLoading = false;
          local.render();
        }
      } else {
        // Load 404 page
        try {
          const module = await pageModules["/404"]?.();
          local.routePath = path;
          local.Page = module.default;
          router.params = {};
          local.isLoading = false;
          local.render();
        } catch {
          local.Page = null;
          local.routePath = "";
          router.params = {};
          local.isLoading = false;
          local.render();
        }
      }
    };

    loadPage();
  }, [router.currentPath]);

  return {
    Page: local.Page ? local.Page : null,
    currentPath: router.currentPath,
    params: router.params,
    isLoading: local.isLoading,
  };
}

export function useRouter() {
  return router;
}

export function useParams<T extends Record<string, string>>() {
  return {
    params: useContext(ParamsContext) as T,
    hash: router.hash,
  };
}
