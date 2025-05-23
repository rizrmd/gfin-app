import { AppLogo } from "@/components/app/logo";
import { Badge } from "@/components/ui/badge";
import type React from "react";
import { HeaderRight } from "../ai/header-right";
import { DotPattern } from "./dot-pattern";
import { user } from "@/lib/user";

export const BodyFrame = (opt: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex min-h-screen bg-white items-stretch flex-col",

        css`
          background-image: url("/img/onboard/ilustr.png");
          background-position-x: center;
          background-position-y: bottom;
          background-size: 956px 200px;
          background-repeat: repeat-x;
        `
      )}
    >
      {user.organization?.name && (
        <div className="border-b h-[50px] flex items-center justify-between px-2 relative">
          <>
            <AppLogo className="hidden md:flex" />
            <div className="md:absolute pointer-events-none inset-0 flex items-center justify-center">
              <Badge variant={"outline"} className="text-base font-semibold">
                bun {user.organization.name}
              </Badge>
            </div>
            <HeaderRight />
          </>
        </div>
      )}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
        {/* Background Illustration */}
        <img
          src={"/img/onboard/circles.png"} // Use the new background SVG
          alt=""
          className="absolute bottom-0 left-0 w-full object-cover" // Changed to object-cover
        />
        {/* Decorative Elements */}
        <DotPattern
          className="right-20 top-20 z-0 opacity-50"
          color="#FFD700"
        />{" "}
        {/* Yellow dots top-right */}
        <DotPattern
          className="left-20 top-1/2 z-0 -translate-y-1/2 opacity-50"
          color="#9747FF"
        />{" "}
        <div className="absolute right-0 top-1/2 z-0 h-60 w-60 -translate-y-1/2 translate-x-1/2 rounded-full border-[20px] border-yellow-300 opacity-40"></div>{" "}
        {/* Adjusted size, border, opacity */}
        {/* Main Content Box */}
        <div
          className={cn(
            "relative z-10 flex flex-col flex-1 w-full h-full",
            opt.className
          )}
        >
          {opt.children}
        </div>
      </div>
    </div>
  );
};
