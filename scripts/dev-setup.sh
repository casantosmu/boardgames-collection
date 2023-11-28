#!/bin/bash

log() {
  echo "[dev-setup] $1"
}

check_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log "Error: $1 is not installed. Please install it before running this script."
        exit 1
    fi
}

copy_env_file() {
    ENV_FILE="$1/.env"
    ENV_EXAMPLE_FILE="$1/.env.example"

    if [ ! -f "$ENV_FILE" ]; then
        cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
        log "Copied $ENV_EXAMPLE_FILE to $ENV_FILE for development."
    else
        log "Development environment file $ENV_FILE already exists."
    fi
}

log "Verifying required tools..."
check_command node
check_command docker
check_command pnpm

log "Installing project dependencies..."
pnpm install

log "Starting Docker services..."
docker compose -f docker/dev/docker-compose.yaml up -d postgres nginx redis

copy_env_file apps/web
copy_env_file packages/db-main-kysely
copy_env_file apps/api

log "Applying database schemas and seeds..."
pnpm migrate
pnpm seed

log "Building and running applications in development mode..."
pnpm build:packages
pnpm dev

log "Development environment is set up successfully."
