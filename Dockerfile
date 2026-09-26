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
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
# GA4 measurement ID — inlined into the client bundle at build time. Passed
# as a build arg by the deploy workflows (from the GitHub Actions variable).
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_FB_PIXEL_ID
ENV NEXT_PUBLIC_FB_PIXEL_ID=$NEXT_PUBLIC_FB_PIXEL_ID
# Staging-only media wiring. images.remotePatterns in next.config.ts is
# evaluated at build time, so these must be present while `next build` runs or
# the optimizer rejects every media URL with "url parameter is not allowed".
# Unset on main/production builds, which keeps the production allowlist at
# exactly its existing https/Cloudflare entries.
ARG MEDIA_PUBLIC_BASE
ENV MEDIA_PUBLIC_BASE=$MEDIA_PUBLIC_BASE
ARG STAGING_MEDIA_HOST
ENV STAGING_MEDIA_HOST=$STAGING_MEDIA_HOST
ARG STAGING_MEDIA_PORT
ENV STAGING_MEDIA_PORT=$STAGING_MEDIA_PORT
ARG STAGING_MEDIA_PUBLIC_PORT
ENV STAGING_MEDIA_PUBLIC_PORT=$STAGING_MEDIA_PUBLIC_PORT
# Staging-only: the image optimizer refuses upstream hosts that resolve to a
# private IP, which the in-stack RustFS does. Unset on main/production.
ARG NEXT_UNOPTIMIZED_IMAGES
ENV NEXT_UNOPTIMIZED_IMAGES=$NEXT_UNOPTIMIZED_IMAGES
# Staging-only. Forces all outbound mail to the in-stack Mailpit rather than
# Resend, so staging cannot email real customers. Unset on main.
ARG EMAIL_TRANSPORT
ENV EMAIL_TRANSPORT=$EMAIL_TRANSPORT
ARG MAILPIT_SMTP_HOST
ENV MAILPIT_SMTP_HOST=$MAILPIT_SMTP_HOST
ARG MAILPIT_SMTP_PORT
ENV MAILPIT_SMTP_PORT=$MAILPIT_SMTP_PORT
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
    pnpm exec better-auth migrate --config src/lib/auth.ts -y && \
    pnpm exec payload migrate && \
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
