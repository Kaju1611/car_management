# syntax=docker/dockerfile:1

# ---------- Stage 1: install all deps (needed to run tsc) ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: build TypeScript -> dist/ ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Stage 3: production runtime, deps-only, no build tools ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install only production dependencies (skips typescript, ts-node-dev, @types/*)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy only the compiled output — no src/, no .ts files ship in the final image
COPY --from=builder /app/dist ./dist

# Run as a non-root user (alpine node images ship a "node" user/group by default)
USER node

EXPOSE 5000

# Basic container-level health check against your existing /health route
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]