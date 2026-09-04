FROM node:20-alpine

# Install OpenSSL (dibutuhkan oleh Prisma di Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Salin seluruh file proyek
COPY . .

# Install dependencies
RUN pnpm install

# Generate Prisma Client
RUN pnpm --filter database dlx prisma generate

# Build API backend
RUN pnpm --filter api build

# Ekspos port yang akan digunakan
EXPOSE 3001

# Perintah untuk menjalankan server
CMD ["pnpm", "--filter", "api", "start:prod"]