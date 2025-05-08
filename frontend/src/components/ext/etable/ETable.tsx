import { type ColumnDef } from "@tanstack/react-table";
import { useEffect, useRef, type ReactElement, type ReactNode } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import { css } from "goober";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ETableState<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export const ETable = <
  T extends Record<string, any>,
  COL extends Exclude<keyof T, symbol | number>
>(opt: {
  data: T[];
  columns: (
    | COL
    | {
        name: COL;
        header?: ReactNode;
        render?: (opt: {
          table: ETableState<T>;
          row: T;
          index: number;
          el: {
            tbody: { current: HTMLTableSectionElement | null };
            container: { current: HTMLDivElement | null };
          };
        }) => ReactElement;
      }
  )[];
}) => {
  const write = useRef(
    proxy({
      data: opt.data,
      columns: [] as ColumnDef<T>[],
      height: 0,
      rob: null as null | ResizeObserver,
    })
  ).current;
  const read = useSnapshot(write);
  const table = useReactTable({
    data: read.data as any,
    columns: read.columns as any,
    getCoreRowModel: getCoreRowModel(),
  });
  const div = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const tbody = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!div.current) return;
    write.height = div.current.clientHeight;

    write.rob = ref(
      new ResizeObserver((entries) => {
        for (const entry of entries) {
          write.height = entry.contentRect.height;
        }
      })
    );

    write.rob.observe(div.current);

    return () => {
      if (write.rob) {
        write.rob.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    write.columns = opt.columns.map((col) => {
      const colName = typeof col === "string" ? col : col.name;
      return {
        accessorFn: (row) => row[colName],
        id: colName,
        header: typeof col === "string" ? col : col.header || col.name,
        cell(props) {
          const cell = props.getValue();
          if (typeof col === "string") {
            return cell;
          }
          if (col.render) {
            return col.render({
              table: write as any,
              row: props.row.original,
              index: props.row.index,
              el: {
                tbody: tbody,
                container: container,
              },
            });
          }
          return cell;
        },
      } as ColumnDef<T>;
    });
  }, [opt.columns]);

  return (
    <div
      className={cn("flex flex-1 relative border rounded-lg overflow-hidden")}
      ref={div}
    >
      <div
        className={cn(
          "absolute inset-0 flex-1 flex",
          css`
            height: ${read.height}px;
          `
        )}
      >
        {read.columns.length > 0 && (
          <Table
            ref={container}
            className={cn(!read.height ? "hidden" : "w-full")}
          >
            <TableHeader className="sticky top-0 z-10 bg-background w-full h-11 outline-1 outline-border ">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="flex-1 overflow-auto" ref={tbody}>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={read.columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
