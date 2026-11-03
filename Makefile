.PHONY: up down install clean

.DEFAULT_GOAL := up

up: ## Start the stack with live reload
	docker compose up --build -d
	@echo "Client: http://localhost:3000   API docs: http://localhost:3001/api/docs"

down: ## Stop all containers
	docker compose down

install: ## Install dependencies of both apps on this machine (also generates the Prisma client)
	cd server && pnpm install
	cd client && pnpm install

clean: ## Delete installs and builds (run `make install` after)
	rm -rf server/node_modules server/dist client/node_modules client/dist client/.tanstack
	find . -name "*.tsbuildinfo" -not -path "*/node_modules/*" -delete
