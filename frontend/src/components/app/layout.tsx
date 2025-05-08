import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/sidebar";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { user } from "@/lib/user";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLogo } from "@/components/app/logo";
import { navigate } from "@/lib/router";

export const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const render = useState({})[1];
  const is_auth = location.pathname.split("/").filter((e) => e)[0] === "auth";

  useEffect(() => {
    user.reload().then(() => {
      if (is_auth && user.status === "active") {
        navigate("/dashboard");
      }
      render({});
    });
  }, []);

  if (user.status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AppLogo />
          <Skeleton className="w-[150px] h-[10px] rounded-lg" />
          <Skeleton className="w-[160px] h-[10px] rounded-lg" />
          <Skeleton className="w-[120px] h-[10px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};
