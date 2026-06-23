# Multi-stage build for NestJS Backend in Workspaces Monorepo
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Copy root configs and package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies (links workspaces)
RUN npm ci

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Generate Prisma Client
RUN cd backend && DATABASE_URL=mysql://localhost:3306/dummy npx prisma generate

# Build shared first
RUN npm run build -w @starpointapp/shared

# Build backend
RUN npm run build -w backend

# Prune dev dependencies
RUN npm prune --omit=dev

# Production stage
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy built code and dependencies
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/shared ./shared
COPY --from=build /usr/src/app/backend/package*.json ./backend/
COPY --from=build /usr/src/app/backend/dist ./backend/dist
COPY --from=build /usr/src/app/backend/prisma ./backend/prisma
COPY --from=build /usr/src/app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=build /usr/src/app/backend/node_modules ./backend/node_modules

# Set environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "backend/dist/src/main"]
