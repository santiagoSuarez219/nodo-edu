#!/bin/sh
# Lanza un servidor MCP local del proyecto cargando las credenciales de .env.local.
#
# Los servidores de mcp-servers/ no usan dotenv: leen process.env y hacen
# exit(1) si falta una variable. Claude Code, a diferencia de Claude Desktop,
# no recibe las claves por configuracion manual, asi que este wrapper las
# inyecta desde .env.local (que nunca se commitea).
#
# Uso: run-local-mcp.sh <nombre-del-servidor>
#   p. ej. run-local-mcp.sh question-bank-mcp

set -e

SERVER_NAME="$1"
if [ -z "$SERVER_NAME" ]; then
  echo "Uso: run-local-mcp.sh <nombre-del-servidor>" >&2
  exit 1
fi

REPO_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="$REPO_DIR/.env.local"
ENTRY="$REPO_DIR/mcp-servers/$SERVER_NAME/dist/index.js"

if [ ! -f "$ENV_FILE" ]; then
  echo "No se encontro $ENV_FILE. Copia .env.example y completa las claves." >&2
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

# Origen de la app (esquema + host + puerto) derivado de la unica URL de API
# que .env.local declara siempre, para no hardcodear el puerto de `npm run dev`.
API_ORIGIN="$(printf '%s' "${QUESTION_BANK_API_BASE_URL:-http://localhost:3000/api/questions}" | sed 's#/api/.*$##')"

# Las rutas de /api/assignments autentican con QUESTION_BANK_API_KEY
# (authenticateServiceRequest usa ese nombre por defecto), asi que la clave
# de assignment-mcp debe ser la misma. .env.local no declara ASSIGNMENT_*.
ASSIGNMENT_API_BASE_URL="${ASSIGNMENT_API_BASE_URL:-$API_ORIGIN/api/assignments}"
ASSIGNMENT_API_KEY="${ASSIGNMENT_API_KEY:-$QUESTION_BANK_API_KEY}"
export ASSIGNMENT_API_BASE_URL ASSIGNMENT_API_KEY

# attendance-mcp, students-mcp y courses-mcp usan los nombres genericos
# API_BASE_URL / API_KEY: el servidor no conoce el nombre de su credencial,
# asi que rotarla no lo toca (spec-039 M2).
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
