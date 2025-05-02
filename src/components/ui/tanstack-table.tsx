"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"

// Add row selection metadata to RowData
declare module "@tanstack/react-table" {
  // We need to use TData to match the interface definition in the library
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

// Base table component props
interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  className?: string
  onRowClick?: (row: TData) => void
  columnResizeMode?: ColumnResizeMode
}

// Table components
export function TanStackTable<TData>({
  columns,
  data,
  className,
  onRowClick,
  columnResizeMode = "onChange",
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 80, // Min column size
      size: 150,   // Default column size
      maxSize: 1000, // Max column size
    },
    // We don't need columnResizeDirection when unconstrained
    // as each column can grow/shrink independently
  })

  return (
    <div className={cn("relative w-full overflow-auto", className)}>
      <div className="w-full overflow-x-auto">
        <table className="border-collapse" style={{ width: "max-content" }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      position: "relative",
                    }}
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none z-10",
                          header.column.getIsResizing()
                            ? "bg-primary opacity-60"
                            : "opacity-0 hover:opacity-30 hover:bg-gray-400"
                        )}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                  onRowClick && "cursor-pointer"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                    }}
                    className="border border-gray-200 p-4 align-middle [&:has([role=checkbox])]:pr-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
