#!/usr/bin/env bash
# Levanta el túnel SSH hacia mirp-lab y confirma que el stack de Supabase de
# desarrollo esté corriendo, antes de que `npm run dev` intente conectarse a
# localhost:54321. Ver CLAUDE.md → "Base de datos" para el procedimiento manual.
set -euo pipefail

TUNNEL_PATTERN="ssh.*-L 54321.*mirp-lab"
REMOTE_DIR="/home/sosagro4c/proyectos/nodo-dev-db"
REMOTE_ENV="NODE_OPTIONS=--dns-result-order=ipv4first"

log() {
  echo "[ensure-dev-db] $1"
}

if pgrep -f "$TUNNEL_PATTERN" > /dev/null 2>&1; then
  log "Túnel SSH a mirp-lab ya activo."
else
  log "Levantando túnel SSH a mirp-lab..."
  ssh -f -N \
    -L 54321:localhost:54321 \
    -L 54322:localhost:54322 \
    -L 54323:localhost:54323 \
    -L 54324:localhost:54324 \
    mirp-lab

  for _ in $(seq 1 10); do
    pgrep -f "$TUNNEL_PATTERN" > /dev/null 2>&1 && break
    sleep 0.5
  done

  if ! pgrep -f "$TUNNEL_PATTERN" > /dev/null 2>&1; then
    log "ERROR: no se pudo establecer el túnel SSH a mirp-lab."
    exit 1
  fi
  log "Túnel SSH establecido."
fi

log "Verificando stack de Supabase en mirp-lab..."
if ssh mirp-lab "cd $REMOTE_DIR && env $REMOTE_ENV npx supabase status" > /dev/null 2>&1; then
  log "Stack de Supabase ya corriendo en mirp-lab."
else
  log "Stack de Supabase caído, levantándolo (puede tardar unos segundos)..."
  if ! ssh mirp-lab "cd $REMOTE_DIR && env $REMOTE_ENV npx supabase start"; then
    log "ERROR: no se pudo levantar el stack de Supabase en mirp-lab."
    exit 1
  fi
  log "Stack de Supabase levantado."
fi

log "Entorno de desarrollo listo."
