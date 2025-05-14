"use client";

import * as React from "react";

import { AppLogo } from "@/components/app/logo";
import { Nav } from "@/components/app/nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem
            className={cn(
              state === "collapsed" ? "pl-1 pt-2" : "pl-2 pt-2",
              css``
            )}
          >
            <AppLogo text={state === "collapsed" ? false : true} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Nav />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavBottom user_data={local.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
