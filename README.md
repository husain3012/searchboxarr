# 🔍 Searchboxarr

> **Prowlarr-powered torrent search UI** — A clean, fast, dark-themed search interface inspired by the \*arr stack.

[![Searchboxarr](https://img.shields.io/badge/stack-Node.js%20%2B%20React%20%2B%20TypeScript-00d4ff?style=flat-square)](https://github.com/husain3012/searchboxarr)
[![Docker](https://img.shields.io/badge/docker-ready-0db7ed?style=flat-square)](https://hub.docker.com/r/husain3012/searchboxarr)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/husain3012/searchboxarr/blob/main/LICENSE)

## Application Setup

Searchboxarr is a lightweight frontend + backend UI for Prowlarr search. It lets you search across all configured indexers, copy magnet links, download .torrent files, and proxy requests securely through the backend.

Access the webui at `<your-ip>:9797`, for more information check out [Searchboxarr](https://github.com/husain3012/searchboxarr).

### Features

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
- **⚙️ Config via env vars or YAML** — full \*arr-style configuration
- **🏥 Health checks** — automatic container monitoring

## Supported Architectures

This image supports x86-64 and arm64 architectures. The correct image will be automatically selected based on your platform when using the `latest` tag.

| Architecture | Available | Tag    |
| :----------: | :-------: | ------ |
|    x86-64    |    ✅     | latest |
|    arm64     |    ✅     | latest |

## Version Tags

|  Tag   | Available | Description           |
| :----: | :-------: | --------------------- |
| latest |    ✅     | Latest stable release |

## Usage

To help you get started creating a container from this image you can either use docker-compose or the docker cli.

### docker-compose (recommended)

```yaml
---
services:
  searchboxarr:
    image: husain3012/searchboxarr:latest
    container_name: searchboxarr
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - PROWLARR_URL=http://prowlarr:9696
      - PROWLARR_API_KEY=your_api_key_here
    volumes:
      - /path/to/searchboxarr/data:/config
    ports:
      - 9797:9797
    restart: unless-stopped
```

### docker cli

```bash
docker run -d \
  --name=searchboxarr \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PROWLARR_URL=http://prowlarr:9696 \
  -e PROWLARR_API_KEY=your_api_key_here \
  -p 9797:9797 \
  -v ./config:/config \
  --restart unless-stopped \
  husain3012/searchboxarr:latest
```

## Parameters

|                Parameter                | Function                                    |
| :-------------------------------------: | ------------------------------------------- |
|             `-p 9797:9797`              | The port for the Searchboxarr web interface |
|             `-e PUID=1000`              | for UserID - see below for explanation      |
|             `-e PGID=1000`              | for GroupID - see below for explanation     |
|             `-e TZ=Etc/UTC`             | specify a timezone to use                   |
| `-e PROWLARR_URL=http://prowlarr:9696`  | URL of your Prowlarr instance               |
| `-e PROWLARR_API_KEY=your_api_key_here` | API key for your Prowlarr instance          |
|              `-v /config`               | Database and searchboxarr configs           |

### Environment variables from files (Docker secrets)

You can set any environment variable from a file by using a special prepend `FILE__`.

As an example:

```bash
-e FILE__PROWLARR_API_KEY=/run/secrets/prowlarr_api_key
```

Will set the environment variable `PROWLARR_API_KEY` based on the contents of the `/run/secrets/prowlarr_api_key` file.

### User / Group Identifiers

When using volumes (`-v` flags), permissions issues can arise between the host OS and the container. We avoid this issue by allowing you to specify the user `PUID` and group `PGID`.

Ensure any volume directories on the host are owned by the same user you specify and any permissions issues will vanish like magic.

In this instance `PUID=1000` and `PGID=1000`, to find yours use `id your_user` as below:

```bash
id your_user
```

Example output:

```
uid=1000(your_user) gid=1000(your_user) groups=1000(your_user)
```

## Configuration

### Required Environment Variables

|      Variable      | Description                                                     |
| :----------------: | --------------------------------------------------------------- |
| `PROWLARR_API_KEY` | API key for your Prowlarr instance                              |
|   `PROWLARR_URL`   | URL of your Prowlarr instance (default: `http://prowlarr:9696`) |

### Optional Environment Variables

|        Variable        | Description                       |    Default     |
| :--------------------: | --------------------------------- | :------------: |
|   `PROWLARR_TIMEOUT`   | Request timeout in milliseconds   |    `30000`     |
|  `SEARCHARR_BASE_URL`  | Base path for reverse proxy       |      `/`       |
|     `TRUST_PROXY`      | Trust proxy headers               |    `false`     |
|    `CACHE_ENABLED`     | Enable in-memory caching          |     `true`     |
|      `CACHE_TTL`       | Cache TTL in seconds              |     `300`      |
|    `CACHE_MAX_SIZE`    | Maximum cache size                |     `500`      |
|  `RATE_LIMIT_ENABLED`  | Enable rate limiting              |     `true`     |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds |    `60000`     |
|    `RATE_LIMIT_MAX`    | Maximum requests per window       |      `60`      |
|     `AUTH_ENABLED`     | Enable basic authentication       |    `false`     |
|    `AUTH_USERNAME`     | Basic auth username               | `searchboxarr` |
|    `AUTH_PASSWORD`     | Basic auth password               |       ``       |
|   `RESULTS_PER_PAGE`   | Results per page                  |      `25`      |
|     `MAX_RESULTS`      | Maximum total results             |     `100`      |
|      `LOG_LEVEL`       | Logging level                     |     `info`     |
|      `LOG_FORMAT`      | Log format                        |    `short`     |
|          `TZ`          | Timezone                          |     `UTC`      |

### Configuration File

You can mount a YAML config file at `/config/config.yml`:

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

## API Reference

|        Endpoint         | Method | Description                |
| :---------------------: | :----: | -------------------------- |
| `/api/search?query=...` |  GET   | Search for torrents        |
|     `/api/indexers`     |  GET   | List configured indexers   |
|      `/api/health`      |  GET   | Health check + cache stats |
|      `/api/cache`       | DELETE | Flush cache                |

## Support Info

### Shell access whilst the container is running

```bash
docker exec -it searchboxarr /bin/bash
```

### To monitor the logs of the container in realtime

```bash
docker logs -f searchboxarr
```

### Container version number

```bash
docker inspect -f '{{ index .Config.Labels "build_version" }}' searchboxarr
```

### Image version number

```bash
docker inspect -f '{{ index .Config.Labels "build_version" }}' husain3012/searchboxarr:latest
```

## Updating Info

The container requires an image update and container recreation to update the app inside.

### Via Docker Compose

**Update the image:**

```bash
docker-compose pull searchboxarr
```

**Recreate the container:**

```bash
docker-compose up -d searchboxarr
```

### Via Docker Run

**Update the image:**

```bash
docker pull husain3012/searchboxarr:latest
```

**Stop and remove the current container:**

```bash
docker stop searchboxarr
docker rm searchboxarr
```

**Recreate with the same parameters:**

```bash
docker run -d \
  --name=searchboxarr \
  -e PROWLARR_URL=http://prowlarr:9696 \
  -e PROWLARR_API_KEY=your_api_key_here \
  -p 9797:9797 \
  -v /path/to/searchboxarr/data:/config \
  --restart unless-stopped \
  husain3012/searchboxarr:latest
```

## Building locally

If you want to make local modifications to these images for development purposes or just to customize the logic:

```bash
git clone https://github.com/husain3012/searchboxarr.git
cd searchboxarr
docker build \
  --no-cache \
  --pull \
  -t husain3012/searchboxarr:latest .
```

## Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Versions

- **1.0.0:** Initial release

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

> Searchboxarr is independent and not affiliated with Prowlarr or the \*arr teams.
