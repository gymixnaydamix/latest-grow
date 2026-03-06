# ── GROW YouR NEED — Frontend Dockerfile ──
# Multi-stage build: (1) install + build, (2) serve via nginx

# ─── Stage 1: Build ───
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install deps first (cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source & build
COPY . .
RUN pnpm frontend:build

# ─── Stage 2: Serve ───
FROM nginx:1.27-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: send all non-file requests to index.html
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
