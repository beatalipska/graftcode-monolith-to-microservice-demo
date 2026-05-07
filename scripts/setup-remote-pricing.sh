#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE_NAME="architecture-evolution-pricing-gateway"
CONTAINER_NAME="architecture_evolution_pricing_gateway"
NETWORK_NAME="architecture_evolution_demo"
HOST_WS_PORT="19090"
HOST_VISION_PORT="19091"
PACKAGE_NAME="@graft/npm-architecture-evolution-pricing@1.0.0"
APP_SERVICE_DIR="$ROOT_DIR/app-service"

cd "$ROOT_DIR"

if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  echo "[setup] creating docker network $NETWORK_NAME"
  docker network create "$NETWORK_NAME" >/dev/null
fi

echo "[setup] building pricing gateway image"
docker build --platform linux/amd64 -t "$IMAGE_NAME" -f pricing-service/Dockerfile .

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "[setup] removing old pricing gateway container"
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

echo "[setup] starting pricing gateway container"
docker run -d \
  --platform linux/amd64 \
  --network "$NETWORK_NAME" \
  --name "$CONTAINER_NAME" \
  -p "$HOST_WS_PORT:$HOST_WS_PORT" \
  -p "$HOST_VISION_PORT:$HOST_VISION_PORT" \
  "$IMAGE_NAME" >/dev/null

echo "[setup] waiting for graft install command"
INSTALL_CMD=""
for _ in {1..60}; do
  if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "npm install --registry"; then
    INSTALL_CMD="$(docker logs "$CONTAINER_NAME" 2>&1 | grep "npm install --registry" | tail -n 1)"
    break
  fi
  sleep 1
done

if [[ -z "$INSTALL_CMD" ]]; then
  echo "[setup] did not find generated npm install command in gateway logs"
  exit 1
fi

echo "[setup] generated graft install command:"
echo "$INSTALL_CMD"
echo "$INSTALL_CMD" > .generated-graft-install-command.txt

echo "[setup] making sure app-service base dependencies are present"
(cd "$APP_SERVICE_DIR" && npm install --no-audit --no-fund)

echo "[setup] removing previous generated client from app-service if present"
(cd "$APP_SERVICE_DIR" && npm remove @graft/npm-architecture-evolution-pricing >/dev/null 2>&1 || true)

echo "[setup] installing generated graft into app-service"
if ! (cd "$APP_SERVICE_DIR" && eval "$INSTALL_CMD"); then
  echo ""
  echo "[setup] graft install failed."
  echo "[setup] The pricing gateway is still running and the install command was saved to:"
  echo "[setup]   $ROOT_DIR/.generated-graft-install-command.txt"
  echo "[setup] We have seen ETARGET here in local alpha, including on the older js-energy-platform sample."
  echo "[setup] If you just want to inspect the architecture flow for now, use:"
  echo "[setup]   npm run distributed:standin"
  exit 1
fi

echo "[setup] pricing gateway is running"
echo "[setup] websocket port on host: $HOST_WS_PORT"
echo "[setup] vision ui on host: http://localhost:$HOST_VISION_PORT/GV"
echo "[setup] installed package: $PACKAGE_NAME"
