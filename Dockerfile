FROM node:20-alpine

# Install OpenSSL (wajib untuk Prisma di OS Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Salin seluruh file
COPY . .

# Hapus validasi OS Windows
RUN npm pkg delete packageManager
RUN rm -f pnpm-lock.yaml

# Install pnpm
RUN npm install -g pnpm

# MATIKAN fitur security strict pnpm secara global
RUN pnpm config set ignore-scripts true

# Install dependencies (akan menggunakan versi di package.json milikmu dengan aman)
RUN pnpm install

# Generate Prisma menggunakan versi LOKAL (bukan dlx yang mendownload versi Beta)
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build API
RUN pnpm --filter api build

# Ekspos port
EXPOSE 3001

# Jalankan aplikasi
CMD ["pnpm", "--filter", "api", "start:prod"]