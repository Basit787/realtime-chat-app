COMPOSE_DEV := docker compose -f docker-compose.dev.yml
COMPOSE_PROD := docker compose -f docker-compose.prod.yml

.PHONY: up down prod logs rebuild

.DEFAULT_GOAL := up

up: ## Start dev stack with live reload
	$(COMPOSE_DEV) up --build -d

down: ## Stop all containers
	$(COMPOSE_DEV) down

prod: ## Start production build (no live reload)
	$(COMPOSE_PROD) up --build -d

logs: ## Follow container logs
	$(COMPOSE_DEV) logs -f server client

rebuild: ## Rebuild dev images after dependency changes
	$(COMPOSE_DEV) build --no-cache server client
	$(COMPOSE_DEV) up -d server client
