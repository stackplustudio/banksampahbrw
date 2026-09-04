FROM node:20-alpine

# Install OpenSSL (dibutuhkan oleh Prisma di Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Salin seluruh file proyek
COPY . .

# Install dependencies dengan flag untuk mengabaikan lockfile OS-mismatch
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter database dlx prisma generate

# Build API backend
RUN pnpm --filter api build

# Ekspos port
EXPOSE 3001

# Perintah untuk menjalankan server
CMD ["pnpm", "--filter", "api", "start:prod"]