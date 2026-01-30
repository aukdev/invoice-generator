# ==============================================
# INVOICE GENERATOR - PRODUCTION DOCKERFILE
# ==============================================
# Optimized multi-stage build for Next.js 14
# Final image: ~150MB with security hardening
# ==============================================

# ---------------------------------------------
# Stage 1: Dependencies Installation
# ---------------------------------------------
FROM node:20-alpine AS deps

# Install required system packages for node-gyp
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (dev + prod needed for build)
RUN npm ci

# ---------------------------------------------
# Stage 2: Build Application
# ---------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build-time environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build arguments for Supabase URLs (can be overridden at build time)
ARG NEXT_PUBLIC_SUPABASE_URL=http://kong:8000
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Build the application
RUN npm run build

# ---------------------------------------------
# Stage 3: Production Runner
# ---------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Set hostname to accept connections from any interface
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/company || exit 1

# Start the application
CMD ["node", "server.js"]
