# =========================================================================
# Dashmesh Properties - Autonomous AI Suite & 24/7 GBP Growth Daemon
# Production Dockerfile (Ultra-Lightweight Node.js 20 Alpine)
# =========================================================================

FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install curl for healthchecks
RUN apk add --no-cache curl python3 py3-pip

# Copy package files (if any) and install dependencies
COPY package*.json ./
RUN if [ -f package.json ]; then npm install --omit=dev; fi

# Copy application source code
COPY . .

# Ensure data directory exists with write permissions
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Expose HTTP port
EXPOSE 3000

# Health check to ensure 24/7 daemon is operational
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the lightweight autonomous Node.js server
CMD ["node", "server.js"]
