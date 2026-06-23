FROM node:20-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/dist ./dist
COPY vite.config.ts ./
ENV API_PROXY_TARGET=http://server:3004
EXPOSE 80
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "80"]
