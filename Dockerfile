FROM node:20-alpine

# Install OpenSSL (wajib untuk Prisma di OS Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Salin seluruh file
COPY . .

# Hapus validasi packageManager OS Windows
RUN npm pkg delete packageManager

# Hapus lockfile Windows
RUN rm -f pnpm-lock.yaml

# Install pnpm versi terbaru
RUN npm install -g pnpm

# Install dependencies dan ABAIKAN script pihak ketiga (Solusi Error Parcel)
RUN pnpm install --ignore-scripts

# Generate Prisma Client
RUN pnpm --filter database dlx prisma generate

# Build API
RUN pnpm --filter api build

# Ekspos port
EXPOSE 3001

# Jalankan aplikasi
CMD ["pnpm", "--filter", "api", "start:prod"]