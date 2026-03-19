export interface Category {
  id: number;
  name: string;
  subCategories?: Category[];
}

export interface SearchResult {
  guid: string;
  indexerId: number;
  indexer: string;
  title: string;
  sortTitle: string;
  size: number;
  files?: number;
  grabs?: number;
  downloadUrl?: string;
  magnetUrl?: string;
  infoUrl?: string;
  publishDate: string;
  categories: Category[];
  seeders?: number;
  leechers?: number;
  imdbId?: number;
  tmdbId?: number;
  tvdbId?: number;
  protocol: "torrent" | "usenet";
  age?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  perPage: number;
  offset: number;
  hasMore: boolean;
  query: string;
  categories: number[];
  indexerIds: number[];
}

export interface Indexer {
  id: number;
  name: string;
  description: string;
  language: string;
  privacy: string;
  protocol: string;
  supportsRss: boolean;
  supportsSearch: boolean;
  enable: boolean;
  capabilities: {
    categories: Category[];
    searchParams: string[];
  };
}

export interface PublicConfig {
  resultsPerPage: number;
  maxResults: number;
  defaultCategories: number[];
  cacheEnabled: boolean;
}

export type SortField =
  | "seeders"
  | "leechers"
  | "size"
  | "publishDate"
  | "title";
export type SortDir = "asc" | "desc";

export interface SearchState {
  query: string;
  categories: number[];
  indexerIds: number[];
  sortField: SortField;
  sortDir: SortDir;
  page: number;
  perPage: number;
}

export const TORRENT_CATEGORIES = [
  { id: 0, name: "All", icon: "⬡" },
  { id: 2000, name: "Movies", icon: "🎬" },
  { id: 5000, name: "TV", icon: "📺" },
  { id: 3000, name: "Music", icon: "🎵" },
  { id: 1000, name: "Games", icon: "🎮" },
  { id: 4000, name: "Apps", icon: "💻" },
  { id: 7000, name: "Books", icon: "📚" },
  { id: 8000, name: "Other", icon: "📦" },
] as const;
