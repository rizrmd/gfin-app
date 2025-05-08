import { useLocalSet } from "@/lib/hooks/use-local-set";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { css } from "goober";

export type SortParams = {
  key: string;
  dir: "asc" | "desc";
};

export const DataTable = <Item extends Record<string, any>>({
  storageKey,
  columns,
  data,
  loading,
  onSort,
  checkColumnKey,
  checkedRowKeys,
  onCheckRow,
}: {
  columns: {
    accessorKey: string;
    header: string;
    size?: number;
    cell?: ColumnDef<Item>["cell"];
  }[];
  data?: Item[] | readonly Item[];
  loading?: boolean;
  storageKey?: string;
  sort?:
    | { key: string; dir: "asc" | "desc" }
    | { readonly key: string; readonly dir: "asc" | "desc" };
  onSort?: (sort: { key: string; dir: "asc" | "desc" }) => void;
  checkColumnKey?: string;
  checkedRowKeys?: string[] | readonly string[];
  onCheckRow?: (key: string) => void;
}) => {
  const ref = useRef({
    resize_lock: false,
    resize_lock_timeout: 0 as any,
    loading_timeout: 0 as any,
    loading: false,
    table: null as HTMLTableElement | null,
    height: 0,
    rob: null as null | ResizeObserver,
    top: 0,
  }).current;

  const render = useState({})[1];
  const local = useLocalSet(() => ({
    status: "init" as "init" | "ready",
    columns: [] as ColumnDef<Item>[],
  }));

  useEffect(() => {
    if (ref.table && !ref.rob) {
      ref.rob = new ResizeObserver(() => {
        if (ref.table) {
          const height = ref.table.offsetHeight;
          if (ref.height !== height) {
            ref.height = height;
            render({});
          }
        }
      });
      ref.rob.observe(ref.table);
    }

    return () => {
      if (ref.rob) {
        ref.rob.disconnect();
        ref.rob = null;
      }
    };
  }, []);

  useEffect(() => {
    if (loading) {
      clearTimeout(ref.loading_timeout);
      ref.loading_timeout = setTimeout(() => {
        if (loading) {
          ref.loading = true;
          render({});
        }
      }, 150);
    } else {
      clearTimeout(ref.loading_timeout);
      ref.loading = false;
      render({});
    }
  }, [loading]);

  useEffect(() => {
    local.set((data) => {
      data.columns = columns.map((e) => ({
        enableResizing: true,
        ...e,
      }));
      data.status = "ready";
    });

    if (storageKey) {
      const stored_size = localStorage.getItem(`table_${storageKey}`);

      if (col_resizing === false && stored_size) {
        try {
          const sizing = JSON.parse(stored_size);
          table.setColumnSizing(sizing);
        } catch (e) {}
      }
    }
  }, [columns]);

  const table = useReactTable({
    data: (data as any) || [],
    columns: local.columns as ColumnDef<Item>[],
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  const state = table.getState();
  const col_resizing = state.columnSizingInfo.isResizingColumn;
  useEffect(() => {
    if (col_resizing) {
      clearTimeout(ref.resize_lock_timeout);
      ref.resize_lock_timeout = setTimeout(() => {
        if (col_resizing) {
          ref.resize_lock = true;
          render({});
        }
      }, 200);
    } else {
      if (ref.resize_lock_timeout) {
        const sizing = table.getState().columnSizing;
        localStorage.setItem(`table_${storageKey}`, JSON.stringify(sizing));
      }
      clearTimeout(ref.resize_lock_timeout);
      ref.resize_lock = false;
      render({});
    }
  }, [col_resizing, local.status]);

  return (
    <>
      {ref.resize_lock && (
        <div
          onMouseUp={() => {
            ref.resize_lock = false;
            render({});

            const sizing = table.getState().columnSizing;
            localStorage.setItem(`table_${storageKey}`, JSON.stringify(sizing));
          }}
          className="fixed inset-0 cursor-ew-resize z-10"
        ></div>
      )}
      <div
        className={cn(
          "rounded-md border relative overflow-x-auto overflow-y-visible transition-all duration-300",
          css`
            opacity: ${!ref.height ? 0.2 : 1};
            height: ${ref.height + 3}px;
          `
        )}
      >
        <div className="absolute inset-0">
          <Table
            ref={(el) => {
              ref.table = el as HTMLTableElement;
            }}
          >
            <TableHeader
              className={cn(
                "bg-white z-10",
                !col_resizing &&
                  css`
                    .resizer {
                      opacity: 0;
                    }
                    &:hover {
                      .resizer {
                        opacity: 1;
                      }
                    }
                  `
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {checkColumnKey && onCheckRow && (
                    <TableHead
                      className={cn(
                        "sticky top-0 h-12 text-left align-middle font-medium text-muted-foreground w-[50px] ml-0 px-0"
                      )}
                    >
                      <label className="flex items-center justify-center h-full w-full select-none">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={checkedRowKeys?.length === data?.length}
                          onChange={(e) => {
                            if (data) {
                              data.forEach((row) => {
                                const key = row[checkColumnKey]?.toString();
                                if (key) onCheckRow(key);
                              });
                            }
                          }}
                        />
                      </label>
                    </TableHead>
                  )}
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      defaultclassname={false || undefined}
                      className={cn(
                        "sticky top-0 h-12 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                        css`
                          width: ${header.getSize()}px;
                        `
                      )}
                    >
                      <div className="flex items-stretch h-full w-full select-none pl-4">
                        <div
                          className="flex flex-1 items-center cursor-pointer"
                          onClick={() => {
                            header.column.toggleSorting(
                              header.column.getIsSorted() === "asc"
                                ? true
                                : header.column.getIsSorted() === "desc"
                                ? undefined
                                : false
                            );

                            if (onSort) {
                              onSort({
                                key: header.column.id,
                                dir:
                                  header.column.getIsSorted() === "asc"
                                    ? "desc"
                                    : "asc",
                              });
                            }
                          }}
                        >
                          <div className="whitespace-nowrap">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </div>
                          {{
                            asc: <ArrowUp className="ml-2 h-4 w-4" />,
                            desc: <ArrowDown className="ml-2 h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {headerGroup.headers.length - 1 !== header.index && (
                          <div
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              header.column.resetSize();

                              localStorage.removeItem(`table_${storageKey}`);
                            }}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              `resizer cursor-ew-resize border-r pl-4 h-full self-stretch transition-all ${
                                table.options.columnResizeDirection
                              } ${
                                header.column.getIsResizing()
                                  ? "isResizing border-r-2 border-blue-500"
                                  : "hover:border-blue-200"
                              }`
                            )}
                          />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {ref.loading &&
                Array(1)
                  .fill(0)
                  .map((_, row) => (
                    <TableRow key={row}>
                      {checkColumnKey && onCheckRow && (
                        <TableCell>
                          <Skeleton className="w-4 h-4 mx-auto" />
                        </TableCell>
                      )}
                      {columns.map((_, i) => (
                        <TableCell key={i}>
                          <Skeleton className={cn("w-full h-4")} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {checkColumnKey && onCheckRow && (
                    <TableCell className="p-0">
                      <label className="flex p-4 h-full justify-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={checkedRowKeys?.includes(
                            row.original[checkColumnKey]?.toString()
                          )}
                          onChange={() => {
                            const key =
                              row.original[checkColumnKey]?.toString();
                            if (key) onCheckRow(key);
                          }}
                        />
                      </label>
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
