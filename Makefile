# ╔══════════════════════════════════════════════════════╗
# ║              Searchboxarr — Makefile                 ║
# ╚══════════════════════════════════════════════════════╝

.PHONY: help install build dev docker-build docker-up docker-down docker-logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install --prefix backend
	npm install --prefix frontend

build: ## Build frontend + backend
	npm run build --prefix frontend
	npm run build --prefix backend

dev-backend: ## Start backend in dev mode (port 9797)
	npm run dev --prefix backend

dev-frontend: ## Start frontend dev server (port 5173)
	npm run dev --prefix frontend

docker-build: ## Build Docker image
	docker build -t searchboxarr:latest .

docker-up: ## Start via Docker Compose
	docker compose up -d

docker-down: ## Stop Docker Compose stack
	docker compose down

docker-logs: ## Follow Docker Compose logs
	docker compose logs -f searchboxarr

docker-rebuild: ## Rebuild and restart
	docker compose up -d --build

clean: ## Remove build artifacts
	rm -rf backend/dist frontend/dist backend/node_modules frontend/node_modules

lint: ## Run linters
	npm run lint --prefix backend
	npm run lint --prefix frontend

typecheck: ## Run TypeScript type checks
	npm run typecheck --prefix backend
	npm run typecheck --prefix frontend
