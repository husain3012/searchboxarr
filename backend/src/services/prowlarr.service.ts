import axios, { AxiosInstance } from "axios";
import * as httpLib from "http";
import * as httpsLib from "https";
import {
  AppConfig,
  ProwlarrSearchResult,
  ProwlarrIndexer,
  SearchQuery,
} from "../types/prowlarr";
import { CacheService } from "./cache.service";
import { getLogger } from "../logger";

export class ProwlarrService {
  private client: AxiosInstance;
  private cache: CacheService;
  private config: AppConfig;

  constructor(config: AppConfig, cache: CacheService) {
    this.config = config;
    this.cache = cache;

    this.client = axios.create({
      baseURL: `${config.prowlarr.url.replace(/\/$/, "")}/api/v1`,
      timeout: config.prowlarr.timeout,
      headers: {
        "X-Api-Key": config.prowlarr.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.client.interceptors.request.use((req) => {
      getLogger().debug(
        `[Prowlarr] → ${req.method?.toUpperCase()} ${req.url}`,
        {
          params: req.params,
        },
      );
      return req;
    });

    this.client.interceptors.response.use(
      (res) => {
        getLogger().debug(`[Prowlarr] ← ${res.status} ${res.config.url}`);
        return res;
      },
      (err) => {
        const status = err.response?.status;
        const url = err.config?.url;
        getLogger().error(`[Prowlarr] ✗ ${status ?? "ERR"} ${url}`, {
          message: err.message,
        });
        return Promise.reject(err);
      },
    );
  }

  async search(query: SearchQuery): Promise<ProwlarrSearchResult[]> {
    const cacheKey = this.cache.buildSearchKey(
      query.query,
      query.categories ?? [],
      query.indexerIds ?? [],
      query.offset ?? 0,
    );

    const cached = this.cache.get<ProwlarrSearchResult[]>(cacheKey);
    if (cached) {
      getLogger().debug(`[Cache] HIT: ${cacheKey}`);
      return cached;
    }

    const params: Record<string, unknown> = {
      query: query.query,
      limit: Math.min(
        query.limit ?? this.config.search.maxResults,
        this.config.search.maxResults,
      ),
      offset: query.offset ?? 0,
      type: query.type ?? "search",
    };

    if (query.categories && query.categories.length > 0) {
      params["categories"] = query.categories;
    }

    if (query.indexerIds && query.indexerIds.length > 0) {
      params["indexerIds"] = query.indexerIds;
    }

    const { data } = await this.client.get<ProwlarrSearchResult[]>("/search", {
      params,
    });

    const results = Array.isArray(data) ? data : [];

    this.cache.set(cacheKey, results, this.config.cache.searchTtl);
    getLogger().debug(`[Cache] SET: ${cacheKey} (${results.length} results)`);

    return results;
  }

  async getIndexers(): Promise<ProwlarrIndexer[]> {
    const cacheKey = this.cache.buildIndexersKey();
    const cached = this.cache.get<ProwlarrIndexer[]>(cacheKey);
    if (cached) return cached;

    const { data } = await this.client.get<ProwlarrIndexer[]>("/indexer");
    const indexers = Array.isArray(data) ? data.filter((i) => i.enable) : [];

    this.cache.set(cacheKey, indexers, this.config.cache.indexersTtl);
    return indexers;
  }

  async getIndexer(id: number): Promise<ProwlarrIndexer> {
    const { data } = await this.client.get<ProwlarrIndexer>(`/indexer/${id}`);
    return data;
  }

  /**
   * Download a torrent file from Prowlarr.
   * Uses native http/https (not axios) so we can safely intercept 301 → magnet:
   * redirects that axios/follow-redirects cannot handle.
   */
  getTorrentFile(
    downloadUrl: string,
  ): Promise<
    | { type: "torrent"; data: Buffer; contentType: string }
    | { type: "magnet"; magnetUrl: string }
  > {
    return new Promise((resolve, reject) => {
      const apiKey = this.config.prowlarr.apiKey;
      const timeout = this.config.prowlarr.timeout;
      const parsedUrl = new URL(downloadUrl);
      const transport = parsedUrl.protocol === "https:" ? httpsLib : httpLib;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
          "User-Agent": "Searchboxarr/1.0",
        },
        timeout,
      };

      const req = transport.request(options, (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers["location"] ?? "";

        // Prowlarr redirects magnet-only torrents to a magnet: URI
        if (status >= 300 && status < 400) {
          res.resume(); // drain body
          if (location.startsWith("magnet:")) {
            getLogger().info(
              `[Download] 301→magnet detected, forwarding magnet link`,
            );
            resolve({ type: "magnet", magnetUrl: location });
          } else {
            reject(new Error(`Unexpected redirect to: ${location}`));
          }
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`Prowlarr returned HTTP ${status}`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            type: "torrent",
            data: Buffer.concat(chunks),
            contentType:
              res.headers["content-type"] ?? "application/x-bittorrent",
          });
        });
        res.on("error", reject);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Torrent download request timed out"));
      });
      req.on("error", reject);
      req.end();
    });
  }

  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      const { data } = await this.client.get("/system/status");
      return { status: "ok", version: data?.version };
    } catch {
      return { status: "error" };
    }
  }
}
