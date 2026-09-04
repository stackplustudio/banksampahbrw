FROM node:20-alpine

# Install OpenSSL (dibutuhkan oleh Prisma di Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Salin seluruh file proyek
COPY . .

# Hapus lockfile bawaan Windows agar pnpm membuat ulang versi Linux, lalu install
RUN rm -f pnpm-lock.yaml && pnpm install

# Generate Prisma Client
RUN pnpm --filter database dlx prisma generate

# Build API backend
RUN pnpm --filter api build

# Ekspos port
EXPOSE 3001

# Perintah untuk menjalankan server
CMD ["pnpm", "--filter", "api", "start:prod"]