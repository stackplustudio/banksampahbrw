FROM node:20-alpine

# Install OpenSSL (wajib untuk Prisma)
WORKDIR /app
RUN apk add --no-cache openssl

# Salin seluruh file proyek
COPY . .

# Hapus validasi OS Windows dan lockfile lama
RUN npm pkg delete packageManager
RUN rm -f pnpm-lock.yaml

# Install pnpm versi terbaru secara global dengan hak akses penuh
RUN npm install -g pnpm --unsafe-perm=true

# Izinkan pnpm mengeksekusi semua script native packages (seperti parcel/watcher) tanpa diblokir
RUN pnpm config set supported-architectures --json '{"os": ["linux"], "cpu": ["x64"]}'

# Install dependencies secara penuh agar class-validator dan seluruh workspace terbawa
RUN pnpm install --no-frozen-lockfile --shamefully-hoist

# Generate Prisma Client versi 5
RUN npx prisma@5 generate --schema=packages/database/prisma/schema.prisma

# Build API NestJS
RUN pnpm --filter api build

# Ekspos port backend
EXPOSE 3001

# Jalankan server
CMD ["pnpm", "--filter", "api", "start:prod"]