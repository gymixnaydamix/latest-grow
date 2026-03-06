# ── GROW YouR NEED — Backend Dockerfile ──
# Lean production image for the Express/Prisma backend

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Workspace root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install all deps (needed for prisma generate)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy backend source + prisma schema
COPY backend/ ./backend/

# Generate Prisma client & compile TypeScript
RUN pnpm --filter ./backend generate
RUN pnpm --filter ./backend build

# ─── Production stage ───
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma

# Prisma needs its generated client at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production
EXPOSE 4000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
