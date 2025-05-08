import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navigate } from "@/lib/router";
import type { ReactNode } from "react";

export default function AppHeader({
  items,
  actions,
}: {
  items: { label: string; url?: string }[];
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 flex-1 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx < items.length - 1 ? (
                  <BreadcrumbItem key={idx} className="hidden md:block">
                    <BreadcrumbLink
                      href={item.url}
                      onClick={(e) => {
                        if (item.url) {
                          e.preventDefault();
                          navigate(item.url);
                        }
                      }}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem key={idx}>
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
                {idx < items.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-4">{actions}</div>
    </header>
  );
}
