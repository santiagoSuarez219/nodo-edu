#!/usr/bin/env bash
# Levanta el túnel SSH hacia asus y confirma que el stack de Supabase de
# desarrollo esté corriendo, antes de que `npm run dev` intente conectarse a
# localhost:54321. Ver CLAUDE.md → "Base de datos" para el procedimiento manual.
set -euo pipefail

TUNNEL_PATTERN="ssh.*-L 54321.*asus"
REMOTE_DIR="~/services/nodo-dev-db"
REMOTE_NVM='export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'

log() {
  echo "[ensure-dev-db] $1"
}

if pgrep -f "$TUNNEL_PATTERN" > /dev/null 2>&1; then
  log "Túnel SSH a asus ya activo."
else
  log "Levantando túnel SSH a asus..."
  ssh -f -N \
    -L 54321:localhost:54321 \
    -L 54322:localhost:54322 \
    -L 54323:localhost:54323 \
    -L 54324:localhost:54324 \
    asus

  for _ in $(seq 1 10); do
    pgrep -f "$TUNNEL_PATTERN" > /dev/null 2>&1 && break
    sleep 0.5
  done

  if ! pgrep -f "$TUNNEL_PATTERN" > /dev/null 2>&1; then
    log "ERROR: no se pudo establecer el túnel SSH a asus."
    exit 1
  fi
  log "Túnel SSH establecido."
fi

log "Verificando stack de Supabase en asus..."
if ssh asus "cd $REMOTE_DIR && $REMOTE_NVM && npx supabase status" > /dev/null 2>&1; then
  log "Stack de Supabase ya corriendo en asus."
else
  log "Stack de Supabase caído, levantándolo (puede tardar unos segundos)..."
  if ! ssh asus "cd $REMOTE_DIR && $REMOTE_NVM && npx supabase start"; then
    log "ERROR: no se pudo levantar el stack de Supabase en asus."
    exit 1
  fi
  log "Stack de Supabase levantado."
fi

log "Entorno de desarrollo listo."
