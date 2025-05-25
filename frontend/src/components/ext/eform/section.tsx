import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Section = function (
  this: any,
  {
    title,
    description,
    children,
    className,
    gridCols = 2,
    noGrid = false,
  }: {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    gridCols?: 1 | 2 | 3 | 4;
    noGrid?: boolean;
  }
) {
  return (
    <div className={cn("space-y-4 mb-8", className)}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {noGrid ? (
        <div>{children}</div>
      ) : (
        <div className={cn(
          "grid gap-4",
          gridCols === 1 && "grid-cols-1",
          gridCols === 2 && "grid-cols-1 md:grid-cols-2",
          gridCols === 3 && "grid-cols-1 md:grid-cols-3",
          gridCols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
          {children}
        </div>
      )}
    </div>
  );
};
