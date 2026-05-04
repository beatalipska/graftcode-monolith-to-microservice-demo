#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE_NAME="architecture-evolution-monolith-gateway"
CONTAINER_NAME="architecture_evolution_monolith_gateway"
HOST_WS_PORT="18080"
HOST_VISION_PORT="18081"

cd "$ROOT_DIR"

echo "[monolith] building monolith gateway image"
docker build --platform linux/amd64 -t "$IMAGE_NAME" -f monolith-service/Dockerfile .

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "[monolith] removing old monolith container"
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

echo "[monolith] starting monolith gateway"
docker run -d \
  --platform linux/amd64 \
  --name "$CONTAINER_NAME" \
  -p "$HOST_WS_PORT:80" \
  -p "$HOST_VISION_PORT:81" \
  "$IMAGE_NAME" >/dev/null

echo "[monolith] monolith gateway is running"
echo "[monolith] service port on host: $HOST_WS_PORT"
echo "[monolith] vision ui on host: http://localhost:$HOST_VISION_PORT/GV"
echo "[monolith] try OrdersService.createOrder from Vision"
