# 🔍 Searchboxarr

> **Prowlarr-powered torrent search UI** — A clean, fast, dark-themed search interface inspired by the *arr stack.

![Searchboxarr](https://img.shields.io/badge/stack-Node.js%20%2B%20React%20%2B%20TypeScript-00d4ff?style=flat-square)
![Docker](https://img.shields.io/badge/docker-ready-0db7ed?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
- [Configuration](#configuration)
- [Docker Deployment](#docker-deployment)
- [Reverse Proxy Setup](#reverse-proxy)
- [Networking](#networking)
- [API Reference](#api-reference)
- [Development](#development)
- [License](#license)

---

## Features

- **⚡ Fast search** across all your Prowlarr indexers simultaneously
- **🧲 Magnet links** — click to open directly in your torrent client
- **📦 .torrent downloads** — proxied securely through the backend
- **🎯 Category filtering** — Movies, TV, Music, Games, Apps, Books
- **🔌 Indexer filtering** — limit search to specific indexers
- **📊 Sort by** seeders, size, or date
- **💾 In-memory caching** — fast repeat searches, configurable TTL
- **🚦 Rate limiting** — protects your Prowlarr from abuse
- **🔒 Optional Basic Auth** — lock down public deployments
- **🐳 Docker-ready** — multi-stage build, optimized image
- **⚙️ Config via env vars or YAML** — full *arr-style configuration
- **🏥 Health checks** — automatic container monitoring

---

## Quick Start

### Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/husain3012/searchboxarr
cd searchboxarr

# 2. Configure environment
cp .env.example .env
nano .env   # Set PROWLARR_API_KEY and PROWLARR_URL

# 3. Start the service
docker compose up -d

# 4. Check logs
docker compose logs -f

# 5. Open in browser
open http://localhost:9797
```

### Docker Run (Single Container)

```bash
docker run -d \
  --name searchboxarr \
  --restart unless-stopped \
  -p 9797:9797 \
  -e PROWLARR_API_KEY=your_api_key \
  -e PROWLARR_URL=http://prowlarr:9696 \
  -v searchboxarr_config:/config \
  husain3012/searchboxarr:latest
```

---

## Installation Methods

### Option 1: Docker Compose (Full Stack)

**Pros:** Easiest setup, includes networking, volume management, environment variables
**Best for:** Most users, production deployments, integrated *arr stacks

### Option 2: Docker CLI

**Pros:** Minimal footprint, quick testing
**Best for:** Advanced users, single deployments

### Option 3: Native Installation (Node.js)

```bash
# Backend
cd backend
npm install
npm run build

# Frontend (separate terminal)
cd frontend
npm install
npm run build

# Start backend
npm run start
```

---

## Configuration

See .env.example for all variables. Environment variables override config file.

### Key variables

- PROWLARR_API_KEY (required)
- PROWLARR_URL (default http://prowlarr:9696)
- PROWLARR_TIMEOUT (ms, default 30000)
- SEARCHBOXARR_HOST_PORT (host port to expose, default 9797)
- SEARCHARR_BASE_URL (base path for reverse proxy, default /)
- TRUST_PROXY (set true when behind a proxy)
- CACHE_ENABLED, CACHE_TTL, CACHE_SEARCH_TTL, CACHE_INDEXERS_TTL, CACHE_MAX_SIZE
- RATE_LIMIT_ENABLED, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
- AUTH_ENABLED, AUTH_USERNAME, AUTH_PASSWORD
- RESULTS_PER_PAGE, MAX_RESULTS
- LOG_LEVEL, LOG_FORMAT, TZ

### Config file

You can mount a YAML at /config/config.yml. Example:

```yaml
prowlarr:
  url: http://prowlarr:9696
  apiKey: your_api_key_here
  timeout: 30000

cache:
  enabled: true
  searchTtl: 120

rateLimit:
  max: 120
```

---

## Docker Deployment

### Building locally

```bash
docker build -f Dockerfile -t searchboxarr:latest .

# Run
docker run -d \
  --name searchboxarr \
  -p 9797:9797 \
  -e PROWLARR_API_KEY="your_key" \
  searchboxarr:latest
```

### Docker Compose example

(See repository docker-compose.yml for full example.)

---

## Reverse Proxy

### Nginx

```nginx
location /searchboxarr/ {
    proxy_pass http://localhost:9797/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
}
```

Set SEARCHARR_BASE_URL=/searchboxarr and TRUST_PROXY=true.

### Traefik

Add labels to your service to route to port 9797.

---

## Networking

If Prowlarr runs in a docker network, join that network and set PROWLARR_URL=http://prowlarr:9696.

---

## API Reference

GET /api/search?query=...  - search
GET /api/indexers           - list indexers
GET /api/health             - health + cache stats
DELETE /api/cache           - flush cache

---

## Development

```bash
# Backend
cd backend
npm install
npm run dev   # starts on :9797

# Frontend
cd frontend
npm install
npm run dev   # starts on :5173
```

---

## License

MIT — See LICENSE

---

_Searchboxarr is an independent project and is not affiliated with the Prowlarr or *arr teams._
