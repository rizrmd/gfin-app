import { AppLogo } from "@/components/app/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { user } from "@/lib/user";
import { useEffect, useState, type FC, type ReactNode } from "react";

export const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const render = useState({})[1];

  useEffect(() => {
    user.init().then(() => {
      render({});
    });
  }, []);

  if (user.status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <AppLogo />
          <Skeleton className="w-[150px] h-[10px] rounded-lg" />
          <Skeleton className="w-[160px] h-[10px] rounded-lg" />
          <Skeleton className="w-[120px] h-[10px] rounded-lg" />
        </div>
      </div>
    );
  }

  return children;
};
