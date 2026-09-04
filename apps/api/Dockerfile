# Base image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy pnpm workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma Client & Build NestJS
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# Production image
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3001
CMD ["node", "dist/main"]