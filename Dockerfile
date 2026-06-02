# syntax=docker/dockerfile:1

# ---- Build stage: install everything, build client + server ----
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Vite builds the client into server/public; tsc compiles the server into server/dist.
RUN npm run build

# ---- Runtime stage: prod deps + built output + static game assets ----
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled server, built client, and the audio/img/video/sm assets the
# server streams at runtime (app.ts reads these from process.cwd()).
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/public ./server/public
COPY --from=builder /app/browser ./browser

EXPOSE 3000
CMD ["node", "server/dist/main.js"]
