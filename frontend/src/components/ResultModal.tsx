import { useState, useEffect } from "react";
import {
  X,
  Magnet,
  Download,
  ExternalLink,
  Users,
  ArrowDown,
  HardDrive,
  Calendar,
  Globe,
  Tag,
  Copy,
  Loader,
} from "lucide-react";
import { SearchResult } from "@/types";
import {
  formatBytes,
  formatDate,
  formatDateFull,
  formatNumber,
} from "@/utils/format";
import { resolveMagnet, openMagnet } from "@/api/search.api";
import { useToast } from "./Toast";

interface Props {
  result: SearchResult;
  onClose: () => void;
}

export function ResultModal({ result, onClose }: Props) {
  const { toast } = useToast();
  const [dlState, setDlState] = useState<"idle" | "resolving">("idle");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const copyMagnet = () => {
    if (result.magnetUrl) {
      navigator.clipboard.writeText(result.magnetUrl).then(() => {
        toast("Magnet link copied!", "success");
      });
    }
  };

  const onTorrentClick = async () => {
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
        toast("Could not resolve download link", "error");
      }
    } finally {
      setDlState("idle");
    }
  };

  const primaryCategory = result.categories?.[0];

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{result.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">
                <Users
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Seeders
              </div>
              <div className="detail-value seeds">
                {formatNumber(result.seeders ?? 0)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <ArrowDown
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Leechers
              </div>
              <div className="detail-value leechs">
                {formatNumber(result.leechers ?? 0)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <HardDrive
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Size
              </div>
              <div className="detail-value big">{formatBytes(result.size)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <Calendar
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Added
              </div>
              <div
                className="detail-value"
                title={formatDateFull(result.publishDate)}
              >
                {formatDate(result.publishDate)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <Globe
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Indexer
              </div>
              <div
                className="detail-value"
                style={{ color: "#a78bfa", fontSize: "0.85rem" }}
              >
                {result.indexer}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <Tag size={10} style={{ display: "inline", marginRight: 4 }} />
                Category
              </div>
              <div className="detail-value" style={{ fontSize: "0.85rem" }}>
                {primaryCategory?.name ?? "—"}
              </div>
            </div>
            {(result.files ?? 0) > 0 && (
              <div className="detail-item">
                <div className="detail-label">Files</div>
                <div className="detail-value">{result.files}</div>
              </div>
            )}
            {(result.grabs ?? 0) > 0 && (
              <div className="detail-item">
                <div className="detail-label">Grabs</div>
                <div className="detail-value">{formatNumber(result.grabs)}</div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            {/* Magnet — when magnetUrl is directly available */}
            {result.magnetUrl && (
              <a href={result.magnetUrl} className="modal-btn primary">
                <Magnet size={18} />
                Open Magnet Link
              </a>
            )}
            {result.magnetUrl && (
              <button onClick={copyMagnet} className="modal-btn ghost">
                <Copy size={16} />
                Copy Magnet Link
              </button>
            )}

            {/* Torrent — when downloadUrl is available */}
            {result.downloadUrl && (
              <button
                onClick={onTorrentClick}
                disabled={dlState === "resolving"}
                className="modal-btn secondary"
              >
                {dlState === "resolving" ? (
                  <>
                    <Loader size={16} className="spin" /> Opening…
                  </>
                ) : (
                  <>
                    <Download size={18} /> Download / Open Torrent
                  </>
                )}
              </button>
            )}

            {result.infoUrl && (
              <a
                href={result.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-btn ghost"
              >
                <ExternalLink size={16} />
                View on Indexer
              </a>
            )}

            {!result.magnetUrl && !result.downloadUrl && !result.infoUrl && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                No links available for this result.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
