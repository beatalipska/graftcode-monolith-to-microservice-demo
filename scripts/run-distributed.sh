#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NETWORK_NAME="architecture_evolution_demo"
APP_IMAGE_NAME="architecture-evolution-app-gateway"
APP_CONTAINER_NAME="architecture_evolution_app_gateway"
APP_HOST_WS_PORT="28080"
APP_HOST_VISION_PORT="28081"
GENERATED_PACKAGE_NAME="@graft/npm-architecture-evolution-pricing"
GRAFT_CONFIG_VALUE="name=@graft/npm-architecture-evolution-pricing;modules=./modules;runtime=nodejs;host=ws://architecture_evolution_pricing_gateway:90/ws"

cd "$ROOT_DIR"

echo "[distributed] making sure shared docker network exists"
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  docker network create "$NETWORK_NAME" >/dev/null
fi

echo "[distributed] starting pricing service and trying to install the generated graft"
./scripts/setup-remote-pricing.sh

echo "[distributed] making sure app-service base dependencies are installed"
(cd app-service && npm install --no-audit --no-fund)

if [[ ! -d "$ROOT_DIR/app-service/node_modules/$GENERATED_PACKAGE_NAME" ]]; then
  echo "[distributed] generated pricing graft was not installed into app-service/node_modules"
  echo "[distributed] current alpha blocker is still in the package install step"
  echo "[distributed] see $ROOT_DIR/.generated-graft-install-command.txt"
  exit 1
fi

echo "[distributed] building app gateway image"
docker build --platform linux/amd64 -t "$APP_IMAGE_NAME" -f app-service/Dockerfile .

if docker ps -a --format '{{.Names}}' | grep -qx "$APP_CONTAINER_NAME"; then
  echo "[distributed] removing old app gateway container"
  docker rm -f "$APP_CONTAINER_NAME" >/dev/null
fi

echo "[distributed] starting app gateway"
docker run -d \
  --platform linux/amd64 \
  --network "$NETWORK_NAME" \
  --name "$APP_CONTAINER_NAME" \
  -e "PRICING_MODE=remote" \
  -e "GRAFT_CONFIG=$GRAFT_CONFIG_VALUE" \
  -p "$APP_HOST_WS_PORT:80" \
  -p "$APP_HOST_VISION_PORT:81" \
  "$APP_IMAGE_NAME" >/dev/null

echo "[distributed] app gateway is running"
echo "[distributed] app service port on host: $APP_HOST_WS_PORT"
echo "[distributed] app vision ui on host: http://localhost:$APP_HOST_VISION_PORT/GV"
echo "[distributed] pricing vision ui on host: http://localhost:19091/GV"
echo "[distributed] try OrdersService.createOrder from the app Vision"
