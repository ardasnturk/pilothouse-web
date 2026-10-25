#!/usr/bin/env bash
# Refreshes the icons in assets/ from the app repository's docs/icon.png.
#
#   scripts/sync-from-app.sh        # expects the app at ../remote-code, or REMOTECODE_APP=/path
set -euo pipefail
cd "$(dirname "$0")/.."

APP="${REMOTECODE_APP:-../remote-code}"
ICON="$APP/docs/icon.png"
[[ -f "$ICON" ]] || { echo "Missing $ICON — set REMOTECODE_APP to the app repository" >&2; exit 1; }

sips -Z 512 "$ICON" --out assets/icon-512.png >/dev/null
sips -Z 180 "$ICON" --out assets/apple-touch-icon.png >/dev/null
sips -Z 64 "$ICON" --out assets/favicon.png >/dev/null
echo "✓ Icons updated from $ICON"
