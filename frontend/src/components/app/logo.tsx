import { GalleryVerticalEnd } from "lucide-react";
import type { FC } from "react";

export const AppLogo: FC<{
  text?: boolean;
  small?: boolean;
  className?: string;
}> = ({ text, small, className }) => {
  return (
    <a
      href="#"
      className={cn("flex items-center gap-2 font-medium", className)}
    >
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg">
        <img
          src={"/images/onboarding/logo-dark.png"}
          alt=""
          className="h-full w-full"
        />
      </div>
      <span className="bg-gradient-to-r from-[#9747FF] to-[#0A0A89] bg-clip-text text-2xl font-extrabold text-transparent">
        GoFundItNow
      </span>
    </a>
  );
};
