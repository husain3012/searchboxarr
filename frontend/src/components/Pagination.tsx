import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchStore } from "@/store/search.store";

interface Props {
  total: number;
}

export function Pagination({ total }: Props) {
  const { page, perPage, setPage } = useSearchStore();
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (totalPages <= 1) return null;

  const getPageNums = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav className="pagination" aria-label="Results pagination">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {getPageNums().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            style={{
              color: "var(--text-dim)",
              padding: "0 4px",
              fontSize: "0.8rem",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn${p === page ? " active" : ""}`}
            onClick={() => setPage(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
