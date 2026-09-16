FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.1.0 --activate
WORKDIR /app

FROM base AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy secrets for build-time compilation
ENV PAYLOAD_SECRET=build-placeholder-secret-32-chars-long
ENV BETTER_AUTH_SECRET=build-placeholder-secret-32-chars-long
ENV NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
# GA4 measurement ID — inlined into the client bundle at build time. Passed
# as a build arg by the deploy workflows (from the GitHub Actions variable).
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
# Build-only database connection (a throwaway Postgres is started by the
# workflow and exposed on 127.0.0.1 via `docker build --network=host`).
# `next build` prerenders pages that query Payload, so a reachable DB is
# required; migrations are applied here but the runner stage deliberately
# has no DATABASE_URL baked in — runtime gets it from the compose env_file.
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN (pnpm exec payload generate:types || true) && \
    pnpm exec payload migrate && \
    pnpm exec better-auth migrate --config src/lib/auth.ts -y && \
    pnpm exec next build

FROM base AS runner
# Version baked at build time (e.g. v1.1.0 from semantic-release).
# Read at runtime by GET /api/version.
ARG APP_VERSION=latest
ENV APP_VERSION=$APP_VERSION
RUN apk add --no-cache vips-cpp curl
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
    pnpm rebuild sharp && \
    pnpm store prune
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/components.json ./components.json

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["pnpm", "start"]
