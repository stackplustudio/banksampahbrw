FROM node:20-alpine

# Install OpenSSL (dibutuhkan oleh Prisma di Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Salin seluruh file proyek
COPY . .

# Hapus field packageManager di package.json yang menyebabkan konflik verifikasi OS
RUN npm pkg delete packageManager

# Hapus lockfile bawaan Windows
RUN rm -f pnpm-lock.yaml

# Install pnpm secara global
RUN npm install -g pnpm

# Install dependencies untuk Linux Alpine
RUN pnpm install

# Generate Prisma Client
RUN pnpm --filter database dlx prisma generate

# Build API backend
RUN pnpm --filter api build

# Ekspos port
EXPOSE 3001

# Perintah untuk menjalankan server
CMD ["pnpm", "--filter", "api", "start:prod"]