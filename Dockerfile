FROM oven/bun:1 AS builder

# Install build dependencies
RUN apt-get update && \
    apt-get install -y git build-essential wget && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin semua file project
COPY . .

# Hapus node_modules jika ada
RUN rm -rf node_modules */node_modules

# Install dependensi termasuk Prisma CLI
RUN bun install

# Generate Prisma Client untuk Linux (debian-openssl-1.1.x)
RUN bunx prisma generate --schema=./shared/prisma/schema.prisma

# Ekspos port (ubah sesuai kebutuhan)
EXPOSE 4550

# Perintah untuk menjalankan produksi
CMD ["bun", "prod"]
