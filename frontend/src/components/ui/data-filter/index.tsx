import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocalSet } from "@/lib/hooks/use-local-set";
import { Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { chrono } from "shared/lib/chrono";
import { FilterActions } from "./filter-actions";
import { FilterField } from "./filter-field";

export type FilterValue = {
  [key: string]:
    | {
        contains?: string;
        mode?: "insensitive";
        gte?: string | Date;
        gt?: string | Date;
        lte?: string | Date;
        lt?: string | Date;
      }
    | string;
};

interface DataFilterPrismaProps {
  columns: {
    accessorKey: string;
    header: string;
    filter?: {
      type: "text" | "dropdown" | "date";
      options?: { value: string; label: string }[];
    };
  }[];
  onFilter: (values: Record<string, any>) => void;
}

export function DataFilter({ columns, onFilter }: DataFilterPrismaProps) {
  const local = useLocalSet(() => ({
    filter_active: false,
    active_filters: {} as Record<string, string>,
    sheet_open: false,
  }));

  // Create default values based on columns
  const defaultValues = columns.reduce((acc, column) => {
    if (column.filter) {
      acc[column.accessorKey] = "";
    }
    return acc;
  }, {} as Record<string, string>);

  const form = useForm({
    defaultValues,
  });

  const onSubmit = (values: Record<string, string>) => {
    const filterValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (!value) return acc;

      const column = columns.find((col) => col.accessorKey === key);
      if (!column?.filter) return acc;

      if (column.filter.type === "date") {
        const date = chrono.now(value);
        const nextDate = chrono.now(value);
        nextDate.setDate(date.getDate() + 1);
        nextDate.setHours(0, 0, 0, 0);

        date.setHours(0, 0, 0, 0);

        acc[key] = {
          gte: date,
          lte: nextDate,
        };
      } else if (column.filter.type === "dropdown") {
        acc[key] = value;
      } else {
        // For text and dropdown fields, use case-insensitive contains
        acc[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
      return acc;
    }, {} as FilterValue);

    // Update active filters state
    const activeFilters = Object.entries(values).reduce((acc, [key, value]) => {
      if (!value) return acc;
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    local.set("active_filters", activeFilters);
    local.set("filter_active", Object.keys(filterValues).length > 0);
    onFilter(filterValues);
    local.set("sheet_open", false);
  };

  const handleClearFilter = (): void => {
    form.reset();
    // local.set("filter_active", false);
    // local.set("sheet_open", false);
    // local.set("active_filters", {});
    onFilter({});
  };

  const handleRemoveFilter = (key: string) => {
    form.setValue(key, "");
    const values = form.getValues();
    const { [key]: _, ...restActiveFilters } = local.active_filters;
    local.set("active_filters", restActiveFilters);
    onSubmit(values);
    local.set("sheet_open", false);
  };

  const activeFilterCount = Object.keys(local.active_filters).length;

  return (
    <Sheet
      open={local.sheet_open}
      onOpenChange={(open) => local.set("sheet_open", open)}
    >
      <div className="flex items-center gap-2 mt-1">
        <SheetTrigger asChild>
          <Button variant="outline" size={"sm"} className="gap-2">
            <Search className="h-4 w-4" />
            Pencarian {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </SheetTrigger>
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(local.active_filters).map(([key, value]) => {
              const column = columns.find((col) => col.accessorKey === key);
              if (!column) return null;

              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="gap-1 flex items-center"
                >
                  <span
                    onClick={() => {
                      // Open the sheet
                      local.set("sheet_open", true);

                      // Focus the input after sheet is opened
                      setTimeout(() => {
                        document
                          .querySelector<HTMLInputElement>(`[name="${key}"]`)
                          ?.focus();
                      }, 100);
                    }}
                  >
                    {column.header}: {value}
                  </span>
                  <div
                    className="ml-1 "
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent sheet from opening
                      handleRemoveFilter(key);
                    }}
                  >
                    <X />
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>
      <SheetContent side="right" className="w-[450px] sm:w-[540px]">
        <SheetHeader className="pb-5">
          <SheetTitle>
            Pencarian {activeFilterCount > 0 && `(${activeFilterCount})`}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="h-full flex flex-col"
          >
            <div className="flex-1 overflow-auto mb-4">
              <div className="flex flex-col gap-4 py-4">
                {columns.map(
                  (column) =>
                    column.filter && (
                      <FormField
                        key={column.accessorKey}
                        control={form.control}
                        name={column.accessorKey}
                        render={({ field }) => (
                          <FilterField field={field} column={column} />
                        )}
                      />
                    )
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-background py-4 border-t">
              <FilterActions
                isFilterActive={local.filter_active}
                onClearFilter={handleClearFilter}
              />
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
