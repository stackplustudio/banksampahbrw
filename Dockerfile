FROM node:20-alpine

# Install OpenSSL (wajib untuk Prisma di Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Salin seluruh file proyek
COPY . .

# Hapus properti packageManager dan lockfile bawaan Windows
RUN npm pkg delete packageManager
RUN rm -f pnpm-lock.yaml

# Install pnpm versi terbaru secara global
RUN npm install -g pnpm

# Install seluruh dependencies (termasuk class-validator) dengan mengabaikan script native yang memicu error
RUN pnpm install --ignore-scripts --no-frozen-lockfile

# Generate Prisma Client versi 5 secara lokal
RUN npx prisma@5 generate --schema=packages/database/prisma/schema.prisma

# Build API NestJS
RUN pnpm --filter api build

# Ekspos port backend
EXPOSE 3001

# Jalankan server produksi
CMD ["pnpm", "--filter", "api", "start:prod"]