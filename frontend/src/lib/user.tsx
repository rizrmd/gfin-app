import type { FC, ReactNode } from "react";
import { navigate } from "./router";
import type { clients, organizations } from "shared/models";
import type { blankOrg, blankProfile } from "shared/lib/client_state";

export const user = {
  status: "loading" as "loading" | "logged-in" | "logged-out",
  get fullName() {
    return `${this.client.profile?.firstName} ${this.client.profile?.lastName}`;
  },
  client: {} as Partial<
    Omit<clients, "profile"> & { profile: typeof blankProfile }
  >,
  organization: {} as Partial<
    Omit<organizations, "data"> & { data: typeof blankOrg }
  >,
  init: (res?: {
    client: Partial<clients>;
    organization: Partial<organizations>;
  }) => {
    if (localStorage.getItem("gfin_ses") !== null) {
      user.status = "logged-in";
      const ses = JSON.parse(localStorage.getItem("gfin_ses") || "{}");
      if (ses.client) {
        user.client = ses.client;
      }
      if (ses.organization) {
        user.organization = ses.organization;
      }
    }
    if (res?.client) {
      user.client = res.client as any;
    }
    if (res?.organization) {
      user.organization = res.organization as any;
    }

    if (res) {
      localStorage.setItem("gfin_ses", JSON.stringify(res));
    }
  },
  logout: () => {
    localStorage.removeItem("gfin_ses");
    navigate("/");
  },
};

export const Protected: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("gfin_ses") === null) {
    user.status = "logged-out";
    navigate("/");
  }

  return children;
};

export const PublicOnly: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("gfin_ses") !== null) {
    user.init();
    navigate("/onboard/");
  }

  return children;
};
