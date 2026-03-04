type Props = {
  pageIndex: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  rowsPerPageLabel?: string;
  pageSummaryLabel?: string;
  resultsLabel?: string;
  ofLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  previousPageAriaLabel?: string;
  nextPageAriaLabel?: string;
  pageSuffixLabel?: string;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

function getPageItems(pageIndex: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, pageIndex - 1);
  const end = Math.min(totalPages - 1, pageIndex + 1);

  if (start > 2) pages.push("...");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export function Pagination({
  pageIndex,
  totalPages,
  totalCount,
  onPageChange,
  rowsPerPageLabel,
  pageSummaryLabel,
  resultsLabel = "Results",
  ofLabel = "of",
  prevLabel = "PREV",
  nextLabel = "NEXT",
  previousPageAriaLabel = "Previous page",
  nextPageAriaLabel = "Next page",
  pageSuffixLabel = "page",
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: Props) {
  const safeTotalPages = Math.max(1, totalPages);
  const items = getPageItems(pageIndex, safeTotalPages);
  const resolvedPageSize = typeof pageSize === "number" ? pageSize : undefined;
  const hasTotalCount = typeof totalCount === "number";
  const startItem =
    hasTotalCount && totalCount > 0 && resolvedPageSize
      ? (pageIndex - 1) * resolvedPageSize + 1
      : hasTotalCount && totalCount > 0
        ? 1
        : 0;
  const endItem =
    hasTotalCount && totalCount > 0 && resolvedPageSize
      ? Math.min(pageIndex * resolvedPageSize, totalCount)
      : hasTotalCount && totalCount > 0
        ? totalCount
        : 0;
  const buttonClass = "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors";
  const summaryText =
    pageSummaryLabel ??
    (hasTotalCount
      ? `${resultsLabel}: ${startItem}-${endItem} ${ofLabel} ${totalCount}`
      : `Page ${pageIndex} of ${safeTotalPages}`);

  return (
    <div className="mt-3 rounded-2xl border border-[#d8e2f3] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(30,74,148,0.06)]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="truncate text-sm font-semibold uppercase tracking-[0.06em] text-[#637595]">
          {summaryText}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, pageIndex - 1))}
            disabled={pageIndex <= 1}
            className={`${buttonClass} text-[#9aa5b6] hover:text-[#3b4d6d] disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={previousPageAriaLabel}
          >
            {prevLabel}
          </button>

          {items.map((item, idx) =>
            item === "..." ? (
              <span key={`ellipsis-${idx}`} className={`${buttonClass} text-[#6b7b95]`}>
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`${buttonClass} ${
                  item === pageIndex
                    ? "bg-[#0f1f3a] text-white"
                    : "text-[#223455] hover:bg-[#f2f6ff]"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(safeTotalPages, pageIndex + 1))}
            disabled={pageIndex >= safeTotalPages}
            className={`${buttonClass} text-[#223455] hover:text-[#0f1f3a] disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={nextPageAriaLabel}
          >
            {nextLabel}
          </button>
        </div>

        <div className="justify-self-end">
          {typeof pageSize === "number" && onPageSizeChange ? (
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-10 min-w-24 rounded-xl border border-[#d8e2f3] bg-[#f7faff] px-3 text-sm font-semibold text-[#223455] outline-none ring-[#245ce2] focus:ring-2"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}/{rowsPerPageLabel ?? pageSuffixLabel}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>
    </div>
  );
}
