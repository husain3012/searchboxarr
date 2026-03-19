#!/bin/sh
set -e

# Use provided PUID/PGID or default to 1001
USER_ID=${PUID:-1001}
GROUP_ID=${PGID:-1001}

echo "Updating searchboxarr user to UID $USER_ID and GID $GROUP_ID..."
sed -i "s/^searchboxarr:x:1001:1001/searchboxarr:x:$USER_ID:$GROUP_ID/" /etc/passwd
sed -i "s/^searchboxarr:x:1001:/searchboxarr:x:$GROUP_ID:/" /etc/group

# Ensure /config and /app are owned by the requested user
chown -R $USER_ID:$GROUP_ID /config /app

CONFIG_FILE="/config/config.yml"
TEMPLATE_FILE="/app/defaults/config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration at $CONFIG_FILE..."
    su-exec searchboxarr cp "$TEMPLATE_FILE" "$CONFIG_FILE"
fi

# Run the app as the requested user
exec su-exec searchboxarr "$@"