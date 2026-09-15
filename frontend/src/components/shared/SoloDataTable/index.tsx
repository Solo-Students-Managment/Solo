"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

type SoloDataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  className?: string;
  emptyLabel?: string;
};

export function SoloDataTable<T>({
  data,
  columns,
  className,
  emptyLabel = "No rows",
}: SoloDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const memoColumns = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data,
    columns: memoColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return (
      <p role="status" className="text-muted text-sm">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "border-border overflow-x-auto rounded-md border",
        className,
      )}
    >
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead className="bg-sunken text-start">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-border border-b px-3 py-2 font-medium"
                >
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-border border-b last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
