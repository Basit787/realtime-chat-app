.PHONY: up

.DEFAULT_GOAL := up

up: ## Build and start all containers
	docker compose up --build -d
