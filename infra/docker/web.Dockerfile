FROM node:20-alpine AS base

WORKDIR /app

# Dependencies
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

# Build
COPY apps/web/ ./
COPY apps/web/.env.local .env.local 2>/dev/null || true

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
