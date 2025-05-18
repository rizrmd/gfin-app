import { GalleryVerticalEnd } from "lucide-react";
import type { FC } from "react";

export const AppLogo: FC<{
  text?: boolean;
  large?: boolean;
  className?: string;
}> = ({ text, large, className }) => {
  return (
    <div
      className={cn(
        "flex items-center font-medium select-none",
        large ? "gap-1" : "gap-2",
        className
      )}
    >
      <div
        className={cn(
          "flex  items-center justify-center rounded-lg",
          large ? "h-[30px] w-[30px]" : "h-[25px] w-[25px]"
        )}
      >
        <img
          draggable={false}
          src={"/img/logo-gram.svg"}
          alt=""
          className="h-full w-full"
        />
      </div>
      <span
        className={cn(
          "bg-gradient-to-r from-[#9747FF] to-[#0A0A89] bg-clip-text  font-extrabold text-transparent",
          !large ? "text-base" : "text-2xl"
        )}
      >
        GoFundItNow
      </span>
    </div>
  );
};
