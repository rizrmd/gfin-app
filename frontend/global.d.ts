import { css as gooberCSS } from "goober";
import { cn as cssCN } from "./src/lib/utils";

declare global {
  const css: typeof gooberCSS;
  const cn: typeof cssCN;
}
