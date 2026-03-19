import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { loadConfig } from "./config";
import { createLogger } from "./logger";
import { CacheService } from "./services/cache.service";
import { ProwlarrService } from "./services/prowlarr.service";
import { createSearchRouter } from "./routes/search.route";
import { createIndexersRouter } from "./routes/indexers.route";
import { createAuthMiddleware } from "./middleware/auth.middleware";

async function bootstrap() {
  const config = loadConfig();
  const logger = createLogger(config);

  logger.info("╔══════════════════════════════════════╗");
  logger.info("║         Searcharr v1.0.0             ║");
  logger.info("║    Prowlarr Search UI Backend        ║");
  logger.info("╚══════════════════════════════════════╝");
  logger.info(`[Config] Prowlarr URL: ${config.prowlarr.url}`);
  logger.info(`[Config] Port: ${config.server.port}`);
  logger.info(
    `[Config] Cache: ${config.cache.enabled ? `enabled (TTL: ${config.cache.ttl}s)` : "disabled"}`,
  );
  logger.info(`[Config] Auth: ${config.auth.enabled ? "enabled" : "disabled"}`);

  const cache = new CacheService(config);
  const prowlarr = new ProwlarrService(config, cache);

  const app = express();

  if (config.server.trustProxy) {
    app.set("trust proxy", 1);
  }

  // Security & middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    }),
  );
  app.use(compression());
  app.use(cors({ origin: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use(
    morgan(config.logging.format, {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }),
  );

  // Rate limiting
  if (config.rateLimit.enabled) {
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          error: "Too many requests. Please slow down.",
        });
      },
    });
    app.use("/api/", limiter);
  }

  // Auth middleware
  const authMiddleware = createAuthMiddleware(config);
  app.use(authMiddleware);

  // Base URL prefix support
  const baseUrl = config.server.baseUrl.replace(/\/$/, "");
  const apiPrefix = `${baseUrl}/api`;

  // API routes
  app.use(`${apiPrefix}/search`, createSearchRouter(prowlarr, config));
  app.use(`${apiPrefix}/indexers`, createIndexersRouter(prowlarr));

  // Health & info endpoints
  app.get(`${baseUrl}/api/health`, async (_req, res) => {
    const prowlarrStatus = await prowlarr.healthCheck();
    res.json({
      status: prowlarrStatus.status === "ok" ? "healthy" : "degraded",
      version: "1.0.0",
      prowlarr: prowlarrStatus,
      cache: cache.stats(),
      uptime: process.uptime(),
    });
  });

  app.get(`${baseUrl}/api/config/public`, (_req, res) => {
    res.json({
      resultsPerPage: config.search.resultsPerPage,
      maxResults: config.search.maxResults,
      defaultCategories: config.search.defaultCategories,
      cacheEnabled: config.cache.enabled,
    });
  });

  app.delete(`${baseUrl}/api/cache`, (_req, res) => {
    cache.flush();
    res.json({ message: "Cache cleared successfully" });
  });

  // Serve frontend static files
  const frontendPath = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendPath, { maxAge: "1d", etag: true }));

  // SPA fallback — send index.html for any non-API route
  app.get("*", (_req, res) => {
    const indexPath = path.join(frontendPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        res
          .status(404)
          .json({ error: "Frontend not built. Run the build step first." });
      }
    });
  });

  const server = app.listen(config.server.port, () => {
    logger.info(
      `[Server] Listening on http://0.0.0.0:${config.server.port}${baseUrl}`,
    );
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info("[Server] Shutting down gracefully...");
    server.close(() => {
      logger.info("[Server] Closed.");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});
