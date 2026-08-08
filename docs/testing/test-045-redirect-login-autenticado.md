# test-045 — Redirigir `/login` a `/` cuando ya hay sesión iniciada

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Usuario de prueba con sesión válida | Ya existente (`dev@nodo.local`) o `students-mcp` | `{{email}}` | ⬜ / ✅ |

**Entorno de pruebas:** desarrollo (`mirp-lab`, ver `CLAUDE.md` → Base de datos)
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-001 — Usuario autenticado navega a `/login`
**Precondición:** sesión iniciada con un usuario válido.
**Datos de prueba usados:** `{{email}}`
**Pasos:**
1. Iniciar sesión.
2. Navegar manualmente a `/login`.
**Resultado esperado:** redirige de inmediato a `/`, sin mostrar el
formulario de login en ningún momento.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — Usuario sin sesión navega a `/login`
**Precondición:** sesión cerrada.
**Pasos:**
1. Cerrar sesión (o usar una ventana de incógnito).
2. Navegar a `/login`.
**Resultado esperado:** se muestra el formulario de login, sin cambios
respecto al comportamiento anterior a este spec.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Mensaje de error de callback sigue funcionando sin sesión
**Precondición:** sesión cerrada.
**Pasos:**
1. Navegar a `/login?error=auth_callback_failed`.
**Resultado esperado:** se muestra el mensaje "El enlace de confirmación no
es válido o ha expirado.", igual que antes de este spec.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — `redirectTo` se ignora cuando hay sesión activa
**Precondición:** sesión iniciada.
**Pasos:**
1. Con sesión activa, navegar a `/login?redirectTo=/alguna-ruta`.
**Resultado esperado:** redirige a `/`, no a `/alguna-ruta`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: {{n}}
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
