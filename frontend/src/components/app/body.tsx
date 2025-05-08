import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { css } from "goober";

export default function AppBody({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "app-body relative overflow-auto flex-1",
        css`
          background:
      /* Shadow Cover TOP */ linear-gradient(
                white 30%,
                rgba(255, 255, 255, 0)
              )
              center top,
            /* Shadow Cover BOTTOM */
              linear-gradient(rgba(255, 255, 255, 0), white 70%) center bottom,
            /* Shadow TOP */
              radial-gradient(
                farthest-side at 50% 0,
                rgba(0, 0, 0, 0.2),
                rgba(0, 0, 0, 0)
              )
              center top,
            /* Shadow BOTTOM */
              radial-gradient(
                farthest-side at 50% 100%,
                rgba(0, 0, 0, 0.2),
                rgba(0, 0, 0, 0)
              )
              center bottom;

          background-repeat: no-repeat;
          background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
          background-attachment: local, local, scroll, scroll;
        `
      )}
    >
      <div className="absolute inset-0  flex flex-col gap-4 p-4 pt-0 ">
        {children}
      </div>
    </div>
  );
}
