# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend ./backend/
COPY frontend ./frontend/
COPY tsconfig.json ./

# Build
RUN pnpm prisma:generate
RUN pnpm --filter backend build
RUN pnpm --filter frontend build

# Production stage
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy built files
COPY --from=builder /app/backend/dist ./backend/dist/
COPY --from=builder /app/frontend/dist ./frontend/dist/
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# Copy package files
COPY backend/package.json ./backend/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "backend/dist/server.js"]