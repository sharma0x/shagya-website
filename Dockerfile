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

RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN (pnpm exec payload generate:types || true) && pnpm exec next build

FROM base AS runner
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
