import { GalleryVerticalEnd } from "lucide-react";
import type { FC } from "react";

export const AppLogo: FC<{
  text?: boolean;
  small?: boolean;
  className?: string;
}> = ({ text, small, className }) => {
  return (
    <div className={cn("flex items-center gap-2 font-medium select-none", className)}>
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg">
        <img draggable={false} src={"/img/logo-gram.svg"} alt="" className="h-full w-full" />
      </div>
      <span className="bg-gradient-to-r from-[#9747FF] to-[#0A0A89] bg-clip-text text-2xl font-extrabold text-transparent">
        GoFundItNow
      </span>
    </div>
  );
};
