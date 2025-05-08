import { GalleryVerticalEnd } from "lucide-react";
import type { FC } from "react";

export const AppLogo: FC<{ text?: boolean; small?: boolean }> = ({
  text,
  small,
}) => {
  return (
    <a href="#" className="flex items-center gap-2 font-medium">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GalleryVerticalEnd className="size-4" />
      </div>
      {text !== false && <>GoFundItNow</>}
    </a>
  );
};
