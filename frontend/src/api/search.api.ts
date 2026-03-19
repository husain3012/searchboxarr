import axios from "axios";
import { SearchResponse, Indexer, PublicConfig } from "@/types";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

export interface SearchParams {
  query: string;
  categories?: number[];
  indexerIds?: number[];
  limit?: number;
  offset?: number;
}

export async function searchTorrents(
  params: SearchParams,
): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>("/search", {
    params: {
      query: params.query,
      categories: params.categories?.join(","),
      indexerIds: params.indexerIds?.join(","),
      limit: params.limit,
      offset: params.offset,
    },
  });
  return data;
}

export async function fetchIndexers(): Promise<Indexer[]> {
  const { data } = await api.get<Indexer[]>("/indexers");
  return data;
}

export async function fetchPublicConfig(): Promise<PublicConfig> {
  const { data } = await api.get<PublicConfig>("/config/public");
  return data;
}

export async function fetchHealth() {
  const { data } = await api.get("/health");
  return data;
}

/**
 * Resolve a magnet URI from either a direct magnetUrl or a downloadUrl
 * that Prowlarr will redirect to magnet:.
 * Returns the magnet URI string, or null on failure.
 */
export async function resolveMagnet(
  magnetUrl: string | undefined,
  downloadUrl: string | undefined,
  filename: string,
): Promise<string | null> {
  // Direct magnet — use immediately, no round-trip needed
  if (magnetUrl) return magnetUrl;

  // downloadUrl → ask backend to resolve (it handles the 301→magnet redirect)
  if (downloadUrl) {
    try {
      const url = `/api/search/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(filename)}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const ct = resp.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = (await resp.json()) as {
          type?: string;
          magnetUrl?: string;
        };
        if (json.type === "magnet" && json.magnetUrl) return json.magnetUrl;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Open a magnet URI via an invisible <a> click — the only cross-browser
 * reliable way to trigger protocol handlers from JS.
 */
export function openMagnet(magnetUri: string): void {
  const a = document.createElement("a");
  a.href = magnetUri;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { api };
