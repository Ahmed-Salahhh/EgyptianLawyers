import { ReactNode } from "react";

type Column = {
  key: string;
  header: ReactNode;
  className?: string;
};

type Row = {
  key: string;
  cells: ReactNode[];
};

type DataTableProps = {
  columns: Column[];
  rows: Row[];
  emptyText?: ReactNode;
};

export function DataTable({
  columns,
  rows,
  emptyText = "No data available.",
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8e2f3] bg-white shadow-[0_10px_24px_rgba(30,74,148,0.08)]">
      <table className="w-full text-sm">
        <thead className="bg-[#eef4ff] text-[#5d6f8f]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 font-medium ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e7edf8] bg-white text-[#314866]">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={Math.max(1, columns.length)}
                className="px-4 py-6 text-center text-sm text-[#7082a0]"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className="transition-colors hover:bg-[#f8fbff]">
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${columns[index]?.key ?? index}`}
                    className={`px-4 py-3 text-center ${columns[index]?.className ?? ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
