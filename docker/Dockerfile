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

# Workspace pruned to $APP and the internal packages it depends on, so installs only change when they do
FROM base AS pruner
ARG APP
WORKDIR /repo
RUN npm install -g turbo@2.11.8
COPY . .
RUN turbo prune "${APP}" --docker

FROM base AS deps
WORKDIR /repo
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .

# Dev: builds the internal packages, then runs their watchers alongside the app's dev server.
# Loose env mode passes the container's environment (DB URLs, secrets, DEV_HTTPS…) through to the tasks.
FROM deps AS dev
ARG APP
ENV APP=${APP}
CMD pnpm turbo run dev --filter="${APP}..." --env-mode=loose

FROM deps AS build
ARG APP
RUN pnpm turbo run build --filter="${APP}"

FROM build AS prod
ARG APP
ENV APP=${APP} NODE_ENV=production
CMD pnpm --filter "${APP}" start
