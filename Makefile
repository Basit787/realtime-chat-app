COMPOSE_DEV := bash docker/compose.sh dev
COMPOSE_PROD := bash docker/compose.sh prod

.PHONY: up down prod logs rebuild infra clean watch

.DEFAULT_GOAL := up

up: ## Start dev stack with live reload
	$(COMPOSE_DEV) up --build -d
	@echo "Home: http://localhost:3000"

watch: ## Dev stack in the foreground; rebuilds images by itself when dependencies change (Ctrl+C stops)
	$(COMPOSE_DEV) up --build --watch

infra: ## Start only the databases and storage, for `pnpm dev` outside Docker
	$(COMPOSE_DEV) up -d mongo minio minio-init postgres redis coturn

down: ## Stop all containers
	$(COMPOSE_DEV) down

prod: ## Start production build (no live reload)
	$(COMPOSE_PROD) up --build -d
	@echo "Home: http://localhost:3000"

APPS := auth chat-app-backend chat-app-frontend home link-shortener image-upload-backend image-upload-frontend

logs: ## Follow app container logs
	$(COMPOSE_DEV) logs -f $(APPS)

rebuild: ## Rebuild dev images after dependency changes
	$(COMPOSE_DEV) build --no-cache $(APPS)
	$(COMPOSE_DEV) up -d $(APPS)

clean: ## Delete everything git ignores and installs/builds regenerate (run `pnpm install` after)
	find . -type d \( -name node_modules -o -name dist -o -name .next -o -name .turbo -o -name .tanstack \) -prune -exec rm -rf {} +
	find . -name "*.tsbuildinfo" -delete
	rm -rf apps/image-upload-backend/src/generated

install:
	pnpm i && pnpm build
