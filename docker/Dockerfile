# One image definition for every app in apps/. Pick the app with the APP build arg (its package name)
# and the stage with `target`: `dev` (watch mode) or `prod` (built output). Build context: repo root.
#
#   docker build -f docker/Dockerfile --build-arg APP=@chat/chat-app-backend --target prod .
#
# Each app defines how it runs through its own package.json scripts: `dev`, `build` and `start`.
ARG NODE_IMAGE=node:20-alpine

FROM ${NODE_IMAGE} AS base
RUN corepack enable pnpm
ENV TURBO_TELEMETRY_DISABLED=1

# Every package.json plus the lockfile: the install below reruns only when dependencies change
FROM base AS manifests
WORKDIR /repo
COPY . .
RUN mkdir /out \
  && find . -name package.json -not -path "*/node_modules/*" | tar -cf - -T - | tar -xf - -C /out \
  && cp pnpm-lock.yaml pnpm-workspace.yaml /out/

# One install for the whole workspace, shared by every app's image (APP is only set after it);
# the cache mount keeps downloaded packages between builds
FROM base AS deps
WORKDIR /repo
COPY --from=manifests /out/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --store-dir /pnpm/store
COPY . .
# Shared packages built once here; containers then start from turbo's cache instead of each rebuilding them
RUN pnpm turbo run build --filter="./packages/*"

# Dev: runs only the app's own dev server; the `packages` service (docker/packages.dev.yml) watches the shared packages
FROM deps AS dev
ARG APP
ENV APP=${APP}
CMD pnpm --filter "${APP}" dev

FROM deps AS build
ARG APP
RUN pnpm turbo run build --filter="${APP}"

FROM build AS prod
ARG APP
ENV APP=${APP} NODE_ENV=production
CMD pnpm --filter "${APP}" start
