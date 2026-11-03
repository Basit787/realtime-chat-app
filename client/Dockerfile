# Chat client (React + Vite). Build context: this folder. Stages: `dev` (Vite with HMR) and `prod` (built, served by vite preview).
ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --store-dir /pnpm/store
COPY . .

FROM deps AS dev
CMD ["pnpm", "dev"]

FROM deps AS build
# VITE_* values are baked into the bundle at build time
ARG VITE_LEGAL_URL=""
ENV VITE_LEGAL_URL=$VITE_LEGAL_URL
RUN pnpm build

FROM build AS prod
ENV NODE_ENV=production
CMD ["pnpm", "start"]
