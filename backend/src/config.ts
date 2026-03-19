import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { AppConfig } from "./types/prowlarr";

const CONFIG_PATH =
  process.env.CONFIG_PATH ||
  path.join(process.cwd(), "..", "config", "config.yml");

function loadYamlConfig(): Partial<AppConfig> {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      return (yaml.load(raw) as Partial<AppConfig>) || {};
    } else {
      throw new Error(`Config file not found: ${CONFIG_PATH}`);
    }
  } catch (err) {
    console.warn(
      `[Config] Could not load YAML config from ${CONFIG_PATH}:`,
      err,
    );
  }
  return {};
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function toInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const n = parseInt(value, 10);
  return isNaN(n) ? fallback : n;
}

export function loadConfig(): AppConfig {
  const yaml_cfg = loadYamlConfig();

  const config: AppConfig = {
    server: {
      port: toInt(process.env.SEARCHARR_PORT, yaml_cfg.server?.port ?? 9797),
      baseUrl:
        process.env.SEARCHARR_BASE_URL ?? yaml_cfg.server?.baseUrl ?? "/",
      trustProxy: toBool(
        process.env.TRUST_PROXY,
        yaml_cfg.server?.trustProxy ?? false,
      ),
    },
    prowlarr: {
      url:
        process.env.PROWLARR_URL ??
        yaml_cfg.prowlarr?.url ??
        "http://localhost:9696",
      apiKey: process.env.PROWLARR_API_KEY ?? yaml_cfg.prowlarr?.apiKey ?? "",
      timeout: toInt(
        process.env.PROWLARR_TIMEOUT,
        yaml_cfg.prowlarr?.timeout ?? 30000,
      ),
    },
    cache: {
      enabled: toBool(
        process.env.CACHE_ENABLED,
        yaml_cfg.cache?.enabled ?? true,
      ),
      ttl: toInt(process.env.CACHE_TTL, yaml_cfg.cache?.ttl ?? 300),
      maxSize: toInt(
        process.env.CACHE_MAX_SIZE,
        yaml_cfg.cache?.maxSize ?? 500,
      ),
      searchTtl: toInt(
        process.env.CACHE_SEARCH_TTL,
        yaml_cfg.cache?.searchTtl ?? 120,
      ),
      indexersTtl: toInt(
        process.env.CACHE_INDEXERS_TTL,
        yaml_cfg.cache?.indexersTtl ?? 600,
      ),
    },
    rateLimit: {
      enabled: toBool(
        process.env.RATE_LIMIT_ENABLED,
        yaml_cfg.rateLimit?.enabled ?? true,
      ),
      windowMs: toInt(
        process.env.RATE_LIMIT_WINDOW_MS,
        yaml_cfg.rateLimit?.windowMs ?? 60000,
      ),
      max: toInt(process.env.RATE_LIMIT_MAX, yaml_cfg.rateLimit?.max ?? 60),
      skipSuccessfulRequests: toBool(
        process.env.RATE_LIMIT_SKIP_SUCCESS,
        yaml_cfg.rateLimit?.skipSuccessfulRequests ?? false,
      ),
    },
    auth: {
      enabled: toBool(
        process.env.AUTH_ENABLED,
        yaml_cfg.auth?.enabled ?? false,
      ),
      username:
        process.env.AUTH_USERNAME ?? yaml_cfg.auth?.username ?? "searcharr",
      password: process.env.AUTH_PASSWORD ?? yaml_cfg.auth?.password ?? "",
    },
    search: {
      resultsPerPage: toInt(
        process.env.RESULTS_PER_PAGE,
        yaml_cfg.search?.resultsPerPage ?? 25,
      ),
      maxResults: toInt(
        process.env.MAX_RESULTS,
        yaml_cfg.search?.maxResults ?? 100,
      ),
      defaultCategories: yaml_cfg.search?.defaultCategories ?? [],
    },
    logging: {
      level: process.env.LOG_LEVEL ?? yaml_cfg.logging?.level ?? "info",
      format: process.env.LOG_FORMAT ?? yaml_cfg.logging?.format ?? "combined",
    },
  };

  if (!config.prowlarr.apiKey) {
    console.warn(
      "[Config] WARNING: PROWLARR_API_KEY is not set. API calls will fail.",
    );
  }

  return config;
}
