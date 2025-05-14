import type { FC, ReactNode } from "react";
import { navigate } from "./router";

export const user = {
  status: "loading" as "loading" | "logged-in" | "logged-out",
  init: () => {},
};

export const Protected: FC<{ children: ReactNode }> = ({ children }) => {
  if (localStorage.getItem("client_id") === null) {
    user.status = "logged-out";
    navigate("/register");
  }

  return children;
};
