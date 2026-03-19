import { useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown as ArrowDown2,
  Magnet,
  Download,
  ExternalLink,
  ChevronRight,
  Loader,
} from "lucide-react";
import { SearchResult, SortField } from "@/types";
import { formatBytes, formatDate, formatNumber } from "@/utils/format";
import { resolveMagnet, openMagnet } from "@/api/search.api";
import { useSearchStore } from "@/store/search.store";
import { ResultModal } from "./ResultModal";
import { useToast } from "./Toast";

interface Props {
  results: SearchResult[];
  isLoading: boolean;
  isFetching: boolean;
}

const SORT_COLS: { key: SortField; label: string; className?: string }[] = [
  { key: "title", label: "Name" },
  { key: "seeders", label: "SE" },
  { key: "leechers", label: "LE", className: "col-leech" },
  { key: "size", label: "Size", className: "col-size" },
  { key: "publishDate", label: "Age", className: "col-date" },
];

export function ResultsTable({ results, isLoading, isFetching }: Props) {
  const { sortField, sortDir, toggleSort } = useSearchStore();
  const [selected, setSelected] = useState<SearchResult | null>(null);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown size={11} style={{ opacity: 0.4 }} />;
    return sortDir === "desc" ? (
      <ArrowDown2 size={11} style={{ color: "var(--accent)" }} />
    ) : (
      <ArrowUp size={11} style={{ color: "var(--accent)" }} />
    );
  };

  if (isLoading) {
    return (
      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SE</th>
              <th className="col-leech">LE</th>
              <th className="col-size">Size</th>
              <th className="col-date">Age</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td>
                  <div
                    className="skeleton skeleton-line"
                    style={{ width: `${55 + ((i * 7) % 35)}%` }}
                  />
                  <div
                    className="skeleton skeleton-line"
                    style={{
                      width: `${25 + ((i * 5) % 20)}%`,
                      height: 10,
                      marginTop: 6,
                    }}
                  />
                </td>
                <td className="td-num">
                  <div
                    className="skeleton skeleton-num"
                    style={{ marginLeft: "auto" }}
                  />
                </td>
                <td className="td-num col-leech">
                  <div
                    className="skeleton skeleton-num"
                    style={{ marginLeft: "auto" }}
                  />
                </td>
                <td className="td-num col-size">
                  <div
                    className="skeleton skeleton-num"
                    style={{ marginLeft: "auto", width: 55 }}
                  />
                </td>
                <td className="td-num col-date">
                  <div
                    className="skeleton skeleton-num"
                    style={{ marginLeft: "auto", width: 60 }}
                  />
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="state-box">
        <div className="state-icon">🔍</div>
        <div className="state-title">No Results Found</div>
        <p className="state-sub">
          Try different keywords, expand categories, or check your indexers.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="results-table-wrap"
        style={{ opacity: isFetching ? 0.7 : 1, transition: "opacity 200ms" }}
      >
        <table className="results-table">
          <thead>
            <tr>
              {SORT_COLS.map((col) => (
                <th
                  key={col.key}
                  className={[
                    col.className,
                    sortField === col.key ? "sorted" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleSort(col.key)}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {col.label} <SortIcon field={col.key} />
                  </span>
                </th>
              ))}
              <th style={{ width: 116 }} />
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <ResultRow
                key={r.guid}
                result={r}
                onClick={() => setSelected(r)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <ResultModal result={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function ResultRow({
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  const primaryCat = result.categories?.[0];
  const { toast } = useToast();
  const [dlState, setDlState] = useState<"idle" | "resolving">("idle");

  // Torrent button: downloadUrl that resolves to an actual .torrent OR magnet redirect
  const onTorrentClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dlState !== "idle" || !result.downloadUrl) return;
    setDlState("resolving");
    try {
      const magnet = await resolveMagnet(
        undefined,
        result.downloadUrl,
        result.title,
      );
      if (magnet) {
        openMagnet(magnet);
        toast("Opening magnet link…", "success");
      } else {
        toast("Download failed", "error");
      }
    } finally {
      setDlState("idle");
    }
  };

  return (
    <tr onClick={onClick}>
      <td className="td-title">
        <div className="result-title">{result.title}</div>
        <div className="result-meta">
          {primaryCat && (
            <span className="meta-badge cat">{primaryCat.name}</span>
          )}
          <span className="meta-badge indexer">{result.indexer}</span>
        </div>
      </td>
      <td className="td-num">
        <span className="seeds">{formatNumber(result.seeders)}</span>
      </td>
      <td className="td-num col-leech">
        <span className="leechs">{formatNumber(result.leechers)}</span>
      </td>
      <td className="td-num col-size">
        <span className="size-val">{formatBytes(result.size)}</span>
      </td>
      <td className="td-num col-date">
        <span className="date-val">{formatDate(result.publishDate)}</span>
      </td>

      <td className="td-actions">
        <div className="action-group">
          {/* Magnet — only shown when magnetUrl is directly available */}
          {result.magnetUrl && (
            <a
              href={result.magnetUrl}
              className="action-btn action-btn--magnet"
              title="Open Magnet Link"
              onClick={(e) => e.stopPropagation()}
            >
              <Magnet size={14} />
            </a>
          )}

          {/* Torrent — only shown when downloadUrl is available */}
          {result.downloadUrl && (
            <button
              className={`action-btn action-btn--torrent${dlState === "resolving" ? " action-btn--resolving" : ""}`}
              title={
                dlState === "resolving" ? "Opening…" : "Download / Open Torrent"
              }
              onClick={onTorrentClick}
              disabled={dlState === "resolving"}
            >
              {dlState === "resolving" ? (
                <Loader size={14} className="spin" />
              ) : (
                <Download size={14} />
              )}
            </button>
          )}

          {/* Open on indexer */}
          {result.infoUrl ? (
            <a
              href={result.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn action-btn--open"
              title="View on Indexer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          ) : (
            <span
              className="action-btn action-btn--disabled"
              title="No info page"
            >
              <ExternalLink size={14} />
            </span>
          )}

          {/* Details modal */}
          <button
            className="action-btn action-btn--details"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
