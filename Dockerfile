FROM node:20-alpine

# Install OpenSSL (wajib untuk Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Salin seluruh file proyek termasuk workspace packages
COPY . .

# Hapus validasi OS Windows dan lockfile lama agar ter-generate ulang dengan benar untuk Linux
RUN npm pkg delete packageManager
RUN rm -f pnpm-lock.yaml

# Install pnpm versi terbaru
RUN npm install -g pnpm

# Install semua dependencies workspace secara penuh (tanpa ignore-scripts agar class-validator ikut terpasang)
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client versi 5
RUN npx prisma@5 generate --schema=packages/database/prisma/schema.prisma

# Build API NestJS
RUN pnpm --filter api build

# Ekspos port backend
EXPOSE 3001

# Jalankan server
CMD ["pnpm", "--filter", "api", "start:prod"]