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
    // Handle data from login/register flow
    if (res?.token) {
      localStorage.setItem("gfin-token", res.token);
      user.status = "logged-in";
    }

    if (res?.user) {
      user.client = res.user as any;
    }

    if (res?.organization) {
      user.organization = res.organization as any;
      localStorage.setItem("gfin-org", JSON.stringify(res.organization));
    }

    const sessionToken = localStorage.getItem("gfin-token");

    if (!!sessionToken) {
      try {
        user.status = "loading";
        // Verify token with backend
        const sessionResponse = await api.auth_verify_session({
          token: sessionToken,
        });

        if (sessionResponse?.success && sessionResponse.user) {
          user.status = "logged-in";
          user.client = sessionResponse.user as any;
          user.organization = sessionResponse.organization as any;
        } else {
          // Invalid session, clean up
          user.status = "logged-out";
          localStorage.removeItem("gfin-token");
          localStorage.removeItem("gfin-org");
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        user.status = "logged-out";
        localStorage.removeItem("gfin-token");
        localStorage.removeItem("gfin-org");
      }
    } else {
      user.status = "logged-out";
    }
  },
  logout: async () => {
    const token = localStorage.getItem("gfin-token");
    if (token) {
      try {
        // Call logout API to invalidate the session on the server
        await api.auth_logout({ token });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }

    // Clear local storage regardless of API response
    localStorage.removeItem("gfin-token");
    localStorage.removeItem("gfin-org");
    user.status = "logged-out";
    user.client = {} as any;
    user.organization = {} as any;

    navigate("/");
  },
};

export const Protected: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("gfin-token") === null) {
    user.status = "logged-out";
    navigate("/");
  }

  return children;
};

export const PublicOnly: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("gfin-token") !== null) {
    // navigate("/onboard");
    navigate("/onboard/unused/old");
  }

  return children;
};
