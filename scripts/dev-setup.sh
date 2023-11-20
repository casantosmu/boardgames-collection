#!/bin/bash

# Download and install PNPM
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Install dependencies
pnpm install

# Run docker services
docker compose -f docker/dev/docker-compose.yaml up -d postgres nginx

# Add env files for development if files are missing
cp -n packages/web/.env.example packages/web/.env
cp -n packages/db-main-kysely/.env.example packages/db-main-kysely/.env
cp -n packages/api/.env.example packages/api/.env

# Add db schemas and seeds
pnpm migrate
pnpm seed

# Run apps in dev
pnpm build
pnpm dev
