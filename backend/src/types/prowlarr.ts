export interface ProwlarrCategory {
  id: number;
  name: string;
  subCategories?: ProwlarrCategory[];
}

export interface ProwlarrSearchResult {
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
  categories: ProwlarrCategory[];
  seeders?: number;
  leechers?: number;
  imdbId?: number;
  tmdbId?: number;
  tvdbId?: number;
  protocol: "torrent" | "usenet";
  age?: number;
  ageHours?: number;
  ageMinutes?: number;
  quality?: {
    quality: { name: string };
    revision: { version: number };
  };
}

export interface ProwlarrIndexer {
  id: number;
  name: string;
  description: string;
  language: string;
  privacy: string;
  capabilities: {
    categories: ProwlarrCategory[];
    searchParams: string[];
  };
  protocol: string;
  supportsRss: boolean;
  supportsSearch: boolean;
  enable: boolean;
  status?: {
    lastRssSyncTime?: string;
    lastSearchTime?: string;
    mostRecentFailure?: string;
    numberOfConsecutiveFailures?: number;
  };
}

export interface SearchQuery {
  query: string;
  categories?: number[];
  indexerIds?: number[];
  limit?: number;
  offset?: number;
  type?: string;
}

export interface AppConfig {
  server: {
    port: number;
    baseUrl: string;
    trustProxy: boolean;
  };
  prowlarr: {
    url: string;
    apiKey: string;
    timeout: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    searchTtl: number;
    indexersTtl: number;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
  };
  auth: {
    enabled: boolean;
    username: string;
    password: string;
  };
  search: {
    resultsPerPage: number;
    maxResults: number;
    defaultCategories: number[];
  };
  logging: {
    level: string;
    format: string;
  };
}
