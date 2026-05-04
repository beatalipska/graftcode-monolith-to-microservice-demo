#!/bin/zsh
set -euo pipefail

for name in \
  architecture_evolution_monolith_gateway \
  architecture_evolution_app_gateway \
  architecture_evolution_pricing_gateway
do
  if docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
    echo "[stop] removing $name"
    docker rm -f "$name" >/dev/null
  fi
done

if docker network inspect architecture_evolution_demo >/dev/null 2>&1; then
  echo "[stop] removing architecture_evolution_demo network"
  docker network rm architecture_evolution_demo >/dev/null
fi

echo "[stop] demo containers stopped"
