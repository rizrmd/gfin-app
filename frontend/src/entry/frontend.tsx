import "./globals.css";
import { css } from "goober";
import { cn } from "../lib/utils";

(window as any).css = css;
(window as any).cn = cn;

import { createRoot } from "react-dom/client";
import { Root } from "@/components/app/root";

const elem = document.getElementById("root")!;
const app = <Root />;

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
