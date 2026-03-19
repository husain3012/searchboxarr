# 🔍 Searchboxarr

> **Prowlarr-powered torrent search UI** — A clean, fast, dark-themed search interface inspired by the \*arr stack.

![Searchboxarr](https://img.shields.io/badge/stack-Node.js%20%2B%20React%20%2B%20TypeScript-00d4ff?style=flat-square)
![Docker](https://img.shields.io/badge/docker-ready-0db7ed?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

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
- **🐳 Docker-ready** — single container, multi-stage build
- **⚙️ Config via env vars or YAML** — full \*arr-style configuration

---

## Quick Start

### Docker Compose (recommended)

```bash
# 1. Clone / download the project
git clone https://github.com/husain3012/searchboxarr
cd searchboxarr

# 2. Configure
cp .env.example .env
nano .env   # Set PROWLARR_API_KEY and PROWLARR_URL

# 3. Start
docker compose up -d

# 4. Open in browser
open http://localhost:9797
```

### Environment Variables

| Variable                 | Default                | Description                 |
| ------------------------ | ---------------------- | --------------------------- |
| `PROWLARR_API_KEY`       | _(required)_           | Your Prowlarr API key       |
| `PROWLARR_URL`           | `http://prowlarr:9696` | Prowlarr instance URL       |
| `PROWLARR_TIMEOUT`       | `30000`                | Request timeout (ms)        |
| `SEARCHBOXARR_HOST_PORT` | `9797`                 | Host port to expose         |
| `SEARCHARR_BASE_URL`     | `/`                    | Base URL sub-path           |
| `TRUST_PROXY`            | `false`                | Trust reverse-proxy headers |
| `CACHE_ENABLED`          | `true`                 | Enable result caching       |
| `CACHE_TTL`              | `300`                  | Default cache TTL (seconds) |
| `CACHE_SEARCH_TTL`       | `120`                  | Search result TTL (seconds) |
| `CACHE_INDEXERS_TTL`     | `600`                  | Indexer list TTL (seconds)  |
| `CACHE_MAX_SIZE`         | `500`                  | Max cached entries          |
| `RATE_LIMIT_ENABLED`     | `true`                 | Enable rate limiting        |
| `RATE_LIMIT_MAX`         | `60`                   | Max requests/min/IP         |
| `AUTH_ENABLED`           | `false`                | Enable HTTP Basic Auth      |
| `AUTH_USERNAME`          | `searchboxarr`         | Basic auth username         |
| `AUTH_PASSWORD`          | ``                     | Basic auth password         |
| `RESULTS_PER_PAGE`       | `25`                   | Results per page            |
| `MAX_RESULTS`            | `100`                  | Max results per query       |
| `LOG_LEVEL`              | `info`                 | Log level                   |
| `TZ`                     | `UTC`                  | Timezone                    |

### Config File

You can also configure via `/config/config.yml` (mounted as a volume):

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

Environment variables always take priority over the config file.

---

## Reverse Proxy

### Nginx

```nginx
location /searchboxarr/ {
    proxy_pass http://localhost:9797/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
}
```

Set `SEARCHARR_BASE_URL=/searchboxarr` and `TRUST_PROXY=true`.

### Traefik

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.searchboxarr.rule=Host(`search.example.com`)"
  - "traefik.http.services.searchboxarr.loadbalancer.server.port=9797"
```

---

## Joining an Existing \*arr Network

If your Prowlarr runs in a Docker network (e.g. `arr_network`):

```yaml
# docker-compose.yml
services:
  searchboxarr:
    networks:
      - arr_network
      - searchboxarr_net

networks:
  arr_network:
    external: true
    name: arr_network
```

Then set `PROWLARR_URL=http://prowlarr:9696`.

---

## API Reference

| Endpoint                                         | Description                |
| ------------------------------------------------ | -------------------------- |
| `GET /api/search?query=...`                      | Search torrents            |
| `GET /api/search?query=...&categories=2000,5000` | Filtered search            |
| `GET /api/search?query=...&indexerIds=1,2`       | Specific indexers          |
| `GET /api/search/download?url=...&filename=...`  | Download .torrent          |
| `GET /api/indexers`                              | List enabled indexers      |
| `GET /api/health`                                | Health check + cache stats |
| `GET /api/config/public`                         | Public configuration       |
| `DELETE /api/cache`                              | Flush cache                |

---

## Development

```bash
# Backend
cd backend
npm install
npm run dev   # starts on :9797

# Frontend (separate terminal)
cd frontend
npm install
npm run dev   # starts on :5173, proxies /api → :9797
```

---

## License

MIT — See [LICENSE](LICENSE)

---

_Searchboxarr is an independent project and is not affiliated with the Prowlarr or \*arr teams._
