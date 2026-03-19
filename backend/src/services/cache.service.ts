import NodeCache from "node-cache";
import { AppConfig } from "../types/prowlarr";
import { getLogger } from "../logger";

export class CacheService {
  private cache: NodeCache;
  private enabled: boolean;
  private defaultTtl: number;
  private hits = 0;
  private misses = 0;

  constructor(config: AppConfig) {
    this.enabled = config.cache.enabled;
    this.defaultTtl = config.cache.ttl;

    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: Math.max(60, config.cache.ttl / 5),
      maxKeys: config.cache.maxSize,
      useClones: false,
    });

    if (this.enabled) {
      getLogger().info(
        `[Cache] Initialized — TTL: ${config.cache.ttl}s, MaxKeys: ${config.cache.maxSize}`,
      );
    } else {
      getLogger().info("[Cache] Disabled");
    }
  }

  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hits++;
      return value;
    }
    this.misses++;
    return undefined;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (!this.enabled) return false;
    return this.cache.set(key, value, ttl ?? this.defaultTtl);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
    getLogger().info("[Cache] Flushed all keys");
  }

  stats() {
    const keys = this.cache.getStats();
    return {
      enabled: this.enabled,
      hits: this.hits,
      misses: this.misses,
      hitRate:
        this.hits + this.misses > 0
          ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + "%"
          : "0%",
      keys: keys.keys,
      ksize: keys.ksize,
      vsize: keys.vsize,
    };
  }

  buildSearchKey(
    query: string,
    categories: number[],
    indexerIds: number[],
    offset: number,
  ): string {
    return `search:${query.toLowerCase().trim()}:cats=${categories.sort().join(",")}:idx=${indexerIds.sort().join(",")}:off=${offset}`;
  }

  buildIndexersKey(): string {
    return "indexers:all";
  }
}
