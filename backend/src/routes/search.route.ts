import { Router, Request, Response } from "express";
import { ProwlarrService } from "../services/prowlarr.service";
import { AppConfig } from "../types/prowlarr";
import { getLogger } from "../logger";

export function createSearchRouter(
  prowlarr: ProwlarrService,
  config: AppConfig,
): Router {
  const router = Router();

  // GET /api/search
  router.get("/", async (req: Request, res: Response) => {
    const query = ((req.query.query as string) ?? "").trim();

    if (!query) {
      res.status(400).json({ error: "Query parameter is required" });
      return;
    }

    const categoriesRaw = req.query.categories;
    const indexerIdsRaw = req.query.indexerIds;

    const categories = parseIntArray(categoriesRaw);
    const indexerIds = parseIntArray(indexerIdsRaw);

    const limit = Math.min(
      parseInt(
        (req.query.limit as string) ?? String(config.search.maxResults),
        10,
      ) || config.search.maxResults,
      config.search.maxResults,
    );
    const offset = parseInt((req.query.offset as string) ?? "0", 10) || 0;
    const type = (req.query.type as string) || "search";

    try {
      const results = await prowlarr.search({
        query,
        categories,
        indexerIds,
        limit,
        offset,
        type,
      });

      const perPage = config.search.resultsPerPage;
      const page = Math.floor(offset / perPage) + 1;
      const paginated = results.slice(0, perPage);

      res.json({
        results: paginated,
        total: results.length,
        page,
        perPage,
        offset,
        hasMore: results.length === limit,
        query,
        categories,
        indexerIds,
      });
    } catch (err: unknown) {
      getLogger().error("[Search] Error:", err);
      const axiosErr = err as { response?: { status: number; data: unknown } };
      if (axiosErr.response?.status === 401) {
        res.status(502).json({
          error: "Prowlarr authentication failed. Check your API key.",
        });
        return;
      }
      if (axiosErr.response?.status === 404) {
        res.status(502).json({
          error: "Prowlarr endpoint not found. Check your Prowlarr URL.",
        });
        return;
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(502).json({ error: `Prowlarr request failed: ${message}` });
    }
  });

  // GET /api/search/download - proxy torrent file download
  router.get("/download", async (req: Request, res: Response) => {
    const downloadUrl = req.query.url as string;
    const filename = (req.query.filename as string) || "download.torrent";

    if (!downloadUrl) {
      res.status(400).json({ error: "url parameter is required" });
      return;
    }

    // Only allow URLs that start with the configured Prowlarr URL for security
    if (!downloadUrl.startsWith(config.prowlarr.url)) {
      res
        .status(403)
        .json({ error: "Download URL not from configured Prowlarr instance" });
      return;
    }

    try {
      const result = await prowlarr.getTorrentFile(downloadUrl);

      if (result.type === "magnet") {
        // Prowlarr resolved this as a magnet link — tell the frontend to open it
        res.json({ type: "magnet", magnetUrl: result.magnetUrl });
        return;
      }

      // Normal torrent file — stream it as a download
      res.setHeader("Content-Type", result.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );
      res.send(result.data);
    } catch (err) {
      getLogger().error("[Download] Error:", err);
      res
        .status(502)
        .json({ error: "Failed to download torrent file from Prowlarr" });
    }
  });

  return router;
}

function parseIntArray(raw: unknown): number[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((v) => parseInt(v.trim(), 10))
      .filter((n) => !isNaN(n));
  }
  if (Array.isArray(raw)) {
    return (raw as string[])
      .map((v) => parseInt(v, 10))
      .filter((n) => !isNaN(n));
  }
  return [];
}
