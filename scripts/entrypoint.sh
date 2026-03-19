#!/bin/sh
set -e

# Path to the config file in the volume
CONFIG_FILE="/config/config.yml"

# FIX: Added /app prefix to match the Dockerfile WORKDIR
TEMPLATE_FILE="/app/defaults/config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration at $CONFIG_FILE..."
    mkdir -p "$(dirname "$CONFIG_FILE")"
    cp "$TEMPLATE_FILE" "$CONFIG_FILE"
fi

# Execute the CMD passed from Dockerfile or Compose
exec "$@"