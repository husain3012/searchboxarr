# ╔═══════════════════════════════════════════════════════╗
# ║            Searchboxarr — Multi-stage Build           ║
# ╚═══════════════════════════════════════════════════════╝

# ── Stage 1: Build frontend ──────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci --prefer-offline

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend ────────────────────────────────
FROM node:22-alpine AS backend-builder

WORKDIR /build/backend

COPY backend/package*.json ./
RUN npm ci --prefer-offline

COPY backend/ ./
RUN npm run build

# ── Stage 3: Production image ─────────────────────────────
FROM node:22-alpine AS production

# Labels following OCI spec + Linuxserver conventions
LABEL org.opencontainers.image.title="Searchboxarr" \
      org.opencontainers.image.description="Prowlarr-powered torrent search UI" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.source="https://github.com/yourorg/searchboxarr" \
      org.opencontainers.image.licenses="MIT"

# Create non-root user following Linuxserver pattern
RUN addgroup -g 1001 searchboxarr && \
    adduser -u 1001 -G searchboxarr -s /bin/sh -D searchboxarr

WORKDIR /app
COPY defaults/config.yml ./defaults/config.yml

# 2. Add the entrypoint script
COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy backend build + deps
COPY --from=backend-builder /build/backend/dist ./backend/dist
COPY --from=backend-builder /build/backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --prefer-offline && cd ..

# Copy frontend build
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Config volume
RUN mkdir -p /config && chown 1001:1001 /config

# ── Environment defaults (all overridable) ──
ENV NODE_ENV=production \
    SEARCHARR_PORT=9797 \
    SEARCHARR_BASE_URL=/ \
    PROWLARR_URL=http://prowlarr:9696 \
    PROWLARR_API_KEY="" \
    PROWLARR_TIMEOUT=30000 \
    CACHE_ENABLED=true \
    CACHE_TTL=300 \
    CACHE_MAX_SIZE=500 \
    CACHE_SEARCH_TTL=120 \
    CACHE_INDEXERS_TTL=600 \
    RATE_LIMIT_ENABLED=true \
    RATE_LIMIT_WINDOW_MS=60000 \
    RATE_LIMIT_MAX=60 \
    AUTH_ENABLED=false \
    AUTH_USERNAME=searchboxarr \
    AUTH_PASSWORD="" \
    RESULTS_PER_PAGE=25 \
    MAX_RESULTS=100 \
    LOG_LEVEL=info \
    LOG_FORMAT=short \
    CONFIG_PATH=/config/config.yml \
    TRUST_PROXY=false

# Health check

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]


HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${SEARCHARR_PORT}/api/health || exit 1

EXPOSE 9797

VOLUME ["/config"]

USER searchboxarr

CMD ["node", "backend/dist/index.js"]
