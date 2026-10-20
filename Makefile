COMPOSE_DEV := bash docker/compose.sh dev
COMPOSE_PROD := bash docker/compose.sh prod

.PHONY: up down prod logs rebuild

.DEFAULT_GOAL := up

up: ## Start dev stack with live reload
	$(COMPOSE_DEV) up --build -d

down: ## Stop all containers
	$(COMPOSE_DEV) down

prod: ## Start production build (no live reload)
	$(COMPOSE_PROD) up --build -d

APPS := auth chat-app-backend chat-app-frontend home link-shortener

logs: ## Follow app container logs
	$(COMPOSE_DEV) logs -f $(APPS)

rebuild: ## Rebuild dev images after dependency changes
	$(COMPOSE_DEV) build --no-cache $(APPS)
	$(COMPOSE_DEV) up -d $(APPS)
