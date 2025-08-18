########################
# Build stage
########################
FROM node:24 AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

########################
# Runtime stage
########################
FROM node:24-slim AS runtime
WORKDIR /app

COPY --from=build /app/dist ./dist
ENV NODE_ENV=production
CMD ["node", "dist/index.mjs"]
