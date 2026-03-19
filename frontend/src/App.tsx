import { useState, useRef, useEffect, FormEvent } from "react";
import { Search, X, RefreshCw, Activity, ChevronDown } from "lucide-react";
import { useSearch, useIndexers } from "@/hooks/useSearch";
import { useSearchStore } from "@/store/search.store";
import { ResultsTable } from "@/components/ResultsTable";
import { Pagination } from "@/components/Pagination";
import { LogoIcon } from "@/components/LogoIcon";
import { TORRENT_CATEGORIES } from "@/types";

const APP_NAME = "Searchboxarr";

const SORT_OPTIONS: {
  key: "seeders" | "size" | "publishDate";
  label: string;
}[] = [
  { key: "seeders", label: "Seeds" },
  { key: "size", label: "Size" },
  { key: "publishDate", label: "Date" },
];

export default function App() {
  const {
    query,
    categories,
    indexerIds,
    setQuery,
    toggleCategory,
    toggleIndexer,
    toggleSort,
    sortField,
    sortDir,
    perPage,
    setPerPage,
  } = useSearchStore();

  const [inputValue, setInputValue] = useState(query);
  const [showIndexers, setShowIndexers] = useState(false);
  const hasSearched = query.trim().length > 0;

  const { results, total, isLoading, isFetching, error, refetch } = useSearch();
  const { data: indexers = [] } = useIndexers();

  const inputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  // Sync external query back to local input
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) setQuery(trimmed);
  };

  const handleClear = () => {
    setInputValue("");
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="app-wrapper">
      {/* ── STICKY HEADER (shown after first search) ── */}
      {hasSearched && (
        <header className="header">
          <div className="header-inner">
            <a
              href="/"
              className="logo"
              onClick={(e) => {
                e.preventDefault();
                setQuery("");
                setInputValue("");
              }}
            >
              <LogoIcon size={28} />
              <span className="logo-text">
                Search<span>box</span>arr
              </span>
            </a>

            <form
              className="header-search-wrap"
              onSubmit={(e) => {
                e.preventDefault();
                const v = (headerInputRef.current?.value ?? "").trim();
                if (v) {
                  setInputValue(v);
                  setQuery(v);
                }
              }}
            >
              <Search size={14} className="header-search-icon" />
              <input
                ref={headerInputRef}
                type="search"
                defaultValue={query}
                key={query}
                className="header-search-field"
                placeholder="Search torrents…"
                autoComplete="off"
              />
              <button
                type="submit"
                className="header-search-btn"
                aria-label="Search"
              >
                <Search size={13} />
              </button>
            </form>

            <div className="nav-links">
              <button
                className="nav-link"
                onClick={() => refetch()}
                title="Refresh results"
              >
                <RefreshCw
                  size={14}
                  style={{ color: isFetching ? "var(--accent)" : undefined }}
                />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="main-content">
        {/* ── HERO (shown before first search) ── */}
        {!hasSearched && (
          <section className="hero">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <LogoIcon size={64} />
            </div>
            <h1 className="hero-title">
              Search<span>box</span>arr
            </h1>
            <p className="hero-sub">
              Powered by Prowlarr · Search torrents across all your indexers
            </p>

            <form className="search-wrap" onSubmit={handleSubmit}>
              <Search size={18} className="search-icon" />
              <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="search-field"
                placeholder="Search movies, TV, music, games, apps…"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
              {inputValue && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={handleClear}
                  aria-label="Clear"
                >
                  <X size={15} />
                </button>
              )}
              <button type="submit" className="search-btn" aria-label="Search">
                <Search size={16} />
              </button>
            </form>

            {/* Category pills */}
            <div className="cat-bar">
              {TORRENT_CATEGORIES.map((cat) => {
                const isAll = cat.id === 0;
                const active = isAll
                  ? categories.length === 0
                  : categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    className={`cat-pill${active ? " active" : ""}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── RESULTS AREA ── */}
        {hasSearched && (
          <div className="results-wrap">
            {/* Category bar (compact) */}
            <div
              className="cat-bar"
              style={{ justifyContent: "flex-start", margin: "20px 0 16px" }}
            >
              {TORRENT_CATEGORIES.map((cat) => {
                const isAll = cat.id === 0;
                const active = isAll
                  ? categories.length === 0
                  : categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    className={`cat-pill${active ? " active" : ""}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div className="toolbar">
              <div className="toolbar-left">
                {!isLoading && !error && (
                  <span className="result-count">
                    <strong>{total.toLocaleString()}</strong> result
                    {total !== 1 ? "s" : ""} for <strong>"{query}"</strong>
                    {isFetching && (
                      <span
                        style={{
                          color: "var(--accent)",
                          marginLeft: 8,
                          fontSize: "0.75rem",
                        }}
                      >
                        refreshing…
                      </span>
                    )}
                  </span>
                )}

                {/* Indexer filter dropdown */}
                {indexers.length > 0 && (
                  <div style={{ position: "relative" }}>
                    <button
                      className="sort-btn"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "5px 10px",
                      }}
                      onClick={() => setShowIndexers(!showIndexers)}
                    >
                      <Activity size={12} />
                      Indexers{" "}
                      {indexerIds.length > 0 ? `(${indexerIds.length})` : ""}
                      <ChevronDown
                        size={11}
                        style={{
                          marginLeft: 2,
                          transform: showIndexers ? "rotate(180deg)" : "none",
                          transition: "150ms",
                        }}
                      />
                    </button>

                    {showIndexers && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: 0,
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          padding: "6px",
                          zIndex: 50,
                          minWidth: 200,
                          maxHeight: 280,
                          overflowY: "auto",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                      >
                        {indexers.map((idx) => {
                          const active = indexerIds.includes(idx.id);
                          return (
                            <button
                              key={idx.id}
                              onClick={() => toggleIndexer(idx.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                width: "100%",
                                padding: "7px 10px",
                                background: active
                                  ? "var(--accent-glow)"
                                  : "none",
                                border: "none",
                                borderRadius: "5px",
                                color: active
                                  ? "var(--accent)"
                                  : "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                textAlign: "left",
                                transition: "all 150ms",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: active
                                    ? "var(--accent)"
                                    : "var(--text-dim)",
                                  flexShrink: 0,
                                }}
                              />
                              {idx.name}
                            </button>
                          );
                        })}
                        {indexerIds.length > 0 && (
                          <button
                            onClick={() => {
                              useSearchStore.getState().setIndexerIds([]);
                              setShowIndexers(false);
                            }}
                            style={{
                              width: "100%",
                              marginTop: 4,
                              padding: "6px 10px",
                              background: "none",
                              border: "1px solid var(--border)",
                              borderRadius: "5px",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            Clear filter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="toolbar-right">
                <div className="sort-group">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      className={`sort-btn${sortField === s.key ? " active" : ""}`}
                      onClick={() => toggleSort(s.key)}
                    >
                      {s.label}
                      {sortField === s.key && (
                        <span style={{ fontSize: "0.65rem" }}>
                          {sortDir === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <select
                  className="indexer-select"
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  aria-label="Results per page"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="state-box state-error">
                <div className="state-icon">⚠️</div>
                <div className="state-title">Search Failed</div>
                <p className="state-sub">
                  {error instanceof Error
                    ? error.message
                    : "Could not reach Prowlarr. Check your configuration."}
                </p>
                <button
                  onClick={() => refetch()}
                  style={{
                    marginTop: 16,
                    padding: "8px 20px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!error && (
              <>
                <ResultsTable
                  results={results}
                  isLoading={isLoading}
                  isFetching={isFetching && !isLoading}
                />
                <Pagination total={total} />
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <span>
          {APP_NAME} · Powered by{" "}
          <a
            href="https://prowlarr.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prowlarr
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/Prowlarr/Prowlarr"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </span>
      </footer>
    </div>
  );
}
