# syntax=docker/dockerfile:1

# ---- Builder ----------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies against the lockfile. .npmrc (legacy-peer-deps) is copied
# so npm ci resolves the React 19 / next 15 peer range cleanly.
COPY apps/web/package.json apps/web/package-lock.json* apps/web/.npmrc* ./
RUN npm ci

# Build the standalone output (next.config.ts sets output: 'standalone';
# the postbuild step folds public/ and .next/static into .next/standalone).
COPY apps/web/ ./
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner -----------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Listen on all interfaces inside the container so the reverse proxy can reach it.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Run as an unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# The standalone bundle already contains the minimal node_modules, public/ and
# .next/static (assembled by the postbuild script).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
