import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  const pageNumbers = [];
  for (let p = Math.max(1, page - 1); p <= Math.min(pages, page + 1); p++) pageNumbers.push(p);
  if (!pageNumbers.includes(1)) pageNumbers.unshift(1);
  if (!pageNumbers.includes(pages)) pageNumbers.push(pages);

  return (
    <nav className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row" aria-label="Pagination">
      <p className="text-sm text-slate-500">Showing {from}-{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button className="icon-btn disabled:opacity-40" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        {pageNumbers.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && p - pageNumbers[i - 1] > 1 && <span className="px-1 text-slate-500">...</span>}
            <button
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium ${p === page ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >{p}</button>
          </span>
        ))}
        <button className="icon-btn disabled:opacity-40" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </nav>
  );
}
