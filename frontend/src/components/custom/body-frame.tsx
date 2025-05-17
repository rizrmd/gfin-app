import type React from "react";
import { DotPattern } from "./dot-pattern";

export const BodyFrame = (opt: {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex min-h-screen bg-white items-stretch",

        css`
          background-image: url("/img/onboard/ilustr.png");
          background-position-x: center;
          background-position-y: bottom;
          background-size: 956px 200px;
          background-repeat: repeat-x;
        `
      )}
    >
      {/* Right Content Area */}
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
