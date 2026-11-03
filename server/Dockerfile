# Chat server (NestJS + Prisma). Build context: this folder. Stages: `dev` (watch mode) and `prod` (built output).
ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS base
# Prisma's query engine needs OpenSSL
RUN apk add --no-cache openssl && corepack enable pnpm
WORKDIR /app

# Reinstalls only when the lockfile or the Prisma schema change; postinstall generates the Prisma client
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --store-dir /pnpm/store
COPY . .

# `prisma db push` creates the collections' indexes (MongoDB has no migrations)
FROM deps AS dev
CMD ["sh", "-c", "pnpm exec prisma db push --skip-generate && pnpm dev"]

FROM deps AS build
RUN pnpm build

FROM build AS prod
ENV NODE_ENV=production
CMD ["sh", "-c", "pnpm exec prisma db push --skip-generate && pnpm start"]
