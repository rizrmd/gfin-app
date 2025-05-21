import type { FC, ReactNode } from "react";
import { navigate } from "./router";
import type { clients, organizations } from "shared/models";
import type { blankOrg, blankProfile } from "shared/lib/client_state";

import { api } from "./gen/api";

export const user = {
  status: "loading" as "loading" | "logged-in" | "logged-out",
  get fullName() {
    return `${this.client.profile?.firstName} ${this.client.profile?.lastName}`;
  },
  get initials() {
    return `${this.client.profile?.firstName?.charAt(
      0
    )}${this.client.profile?.lastName?.charAt(0)}`;
  },
  client: {} as Partial<
    Omit<clients, "profile"> & { profile: typeof blankProfile }
  >,
  organization: {} as Partial<
    Omit<organizations, "data"> & { data: typeof blankOrg }
  >,
  init: async (res?: {
    token?: string;
    user?: Partial<clients>;
    organization?: Partial<organizations>;
  }) => {
    const sessionToken = localStorage.getItem("gfin_token");
    
    if (sessionToken) {
      try {
        user.status = "loading";
        // Verify token with backend
        const sessionResponse = await api.auth_verify_session({ token: sessionToken });
        
        if (sessionResponse?.success && sessionResponse.user) {
          user.status = "logged-in";
          user.client = sessionResponse.user as any;
          
          // If we have organization data from a previous session
          const orgData = localStorage.getItem("gfin_org");
          if (orgData) {
            try {
              user.organization = JSON.parse(orgData);
            } catch (e) {
              console.error("Failed to parse organization data", e);
            }
          }
        } else {
          // Invalid session, clean up
          user.status = "logged-out";
          localStorage.removeItem("gfin_token");
          localStorage.removeItem("gfin_org");
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        user.status = "logged-out";
        localStorage.removeItem("gfin_token");
        localStorage.removeItem("gfin_org");
      }
    } else {
      user.status = "logged-out";
    }
    
    // Handle data from login/register flow
    if (res?.token) {
      localStorage.setItem("gfin_token", res.token);
      user.status = "logged-in";
    }
    
    if (res?.user) {
      user.client = res.user as any;
    }
    
    if (res?.organization) {
      user.organization = res.organization as any;
      localStorage.setItem("gfin_org", JSON.stringify(res.organization));
    }
  },
  logout: async () => {
    const token = localStorage.getItem("gfin_token");
    if (token) {
      try {
        // Call logout API to invalidate the session on the server
        await api.auth_logout({ token });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
    
    // Clear local storage regardless of API response
    localStorage.removeItem("gfin_token");
    localStorage.removeItem("gfin_org");
    user.status = "logged-out";
    user.client = {} as any;
    user.organization = {} as any;
    
    navigate("/");
  },
};

export const Protected: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("gfin_token") === null) {
    user.status = "logged-out";
    navigate("/");
  }

  return children;
};

export const PublicOnly: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("gfin_token") !== null) {
    user.init();
    navigate("/onboard/");
  }

  return children;
};
