#!/bin/sh
# Lanza un servidor MCP del proyecto contra PRODUCCION, cargando las
# credenciales de .env.prod-mcp (perfil separado de .env.local, ver spec-026
# Fase 8: no sobrescribe la config local para no perder la capacidad de
# trabajar contra npm run dev).
#
# Los servidores de mcp-servers/ no usan dotenv: leen process.env y hacen
# exit(1) si falta una variable. Este wrapper las inyecta desde
# .env.prod-mcp (que nunca se commitea).
#
# Uso: run-prod-mcp.sh <nombre-del-servidor>
#   p. ej. run-prod-mcp.sh question-bank-mcp

set -e

SERVER_NAME="$1"
if [ -z "$SERVER_NAME" ]; then
  echo "Uso: run-prod-mcp.sh <nombre-del-servidor>" >&2
  exit 1
fi

REPO_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="$REPO_DIR/.env.prod-mcp"
ENTRY="$REPO_DIR/mcp-servers/$SERVER_NAME/dist/index.js"

if [ ! -f "$ENV_FILE" ]; then
  echo "No se encontro $ENV_FILE. Ver spec-026 Fase 8 / Fase 4 para generarlo." >&2
  exit 1
fi

if [ ! -f "$ENTRY" ]; then
  echo "No se encontro $ENTRY. Compila con: cd mcp-servers/$SERVER_NAME && npm install && npm run build" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

# Origen de la app de producción, derivado de QUESTION_BANK_API_BASE_URL
# igual que en run-local-mcp.sh.
API_ORIGIN="$(printf '%s' "${QUESTION_BANK_API_BASE_URL:?falta QUESTION_BANK_API_BASE_URL en .env.prod-mcp}" | sed 's#/api/.*$##')"

# Las rutas de /api/assignments autentican con QUESTION_BANK_API_KEY
# (authenticateServiceRequest usa ese nombre por defecto).
ASSIGNMENT_API_BASE_URL="${ASSIGNMENT_API_BASE_URL:-$API_ORIGIN/api/assignments}"
ASSIGNMENT_API_KEY="${ASSIGNMENT_API_KEY:-$QUESTION_BANK_API_KEY}"
export ASSIGNMENT_API_BASE_URL ASSIGNMENT_API_KEY

# attendance-mcp, students-mcp y courses-mcp usan los nombres genericos
# API_BASE_URL / API_KEY (spec-039 M2).
case "$SERVER_NAME" in
  attendance-mcp)
    API_BASE_URL="${API_BASE_URL:-$API_ORIGIN/api}"
    API_KEY="${API_KEY:-$QUESTION_BANK_API_KEY}"
    export API_BASE_URL API_KEY
    ;;
  students-mcp)
    API_BASE_URL="${API_BASE_URL:-$STUDENTS_ADMIN_API_BASE_URL}"
    API_KEY="${API_KEY:-$STUDENTS_ADMIN_API_KEY}"
    export API_BASE_URL API_KEY
    ;;
  courses-mcp)
    API_BASE_URL="${API_BASE_URL:-${COURSES_API_BASE_URL:-$API_ORIGIN/api/courses}}"
    API_KEY="${API_KEY:-$COURSES_ADMIN_API_KEY}"
    export API_BASE_URL API_KEY
    ;;
esac

exec node "$ENTRY"
