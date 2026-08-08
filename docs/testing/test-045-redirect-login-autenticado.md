# test-045 — Redirigir `/login` a `/` cuando ya hay sesión iniciada

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Usuario de prueba con sesión válida | Ya existente (`dev@nodo.local`) — no se creó nada nuevo | `dev@nodo.local` | N/A (recurso preexistente) |

**Entorno de pruebas:** desarrollo (`mirp-lab`, app en `http://localhost:3002`)
**Fecha de la ronda:** 2026-08-08

## Casos de prueba

### TC-001 — Usuario autenticado navega a `/login`
**Precondición:** sesión iniciada con un usuario válido.
**Datos de prueba usados:** `{{email}}`
**Pasos:**
1. Iniciar sesión.
2. Navegar manualmente a `/login`.
**Resultado esperado:** redirige de inmediato a `/`, sin mostrar el
formulario de login en ningún momento.
**Estado:** ✅ Aprobado
**Hallazgos:** Redirigió a `/` sin mostrar el formulario en ningún momento. Sin observaciones.

### TC-002 — Usuario sin sesión navega a `/login`
**Precondición:** sesión cerrada.
**Pasos:**
1. Cerrar sesión (o usar una ventana de incógnito).
2. Navegar a `/login`.
**Resultado esperado:** se muestra el formulario de login, sin cambios
respecto al comportamiento anterior a este spec.
**Estado:** ✅ Aprobado
**Hallazgos:** Se ve normal, sin cambios respecto al comportamiento anterior. Sin observaciones.

### TC-003 — Mensaje de error de callback sigue funcionando sin sesión
**Precondición:** sesión cerrada.
**Pasos:**
1. Navegar a `/login?error=auth_callback_failed`.
**Resultado esperado:** se muestra el mensaje "El enlace de confirmación no
es válido o ha expirado.", igual que antes de este spec.
**Estado:** ✅ Aprobado
**Hallazgos:** Se ve el mensaje de error correctamente. Sin observaciones.

### TC-004 — `redirectTo` se ignora cuando hay sesión activa
**Precondición:** sesión iniciada.
**Pasos:**
1. Con sesión activa, navegar a `/login?redirectTo=/alguna-ruta`.
**Resultado esperado:** redirige a `/`, no a `/alguna-ruta`.
**Estado:** ✅ Aprobado
**Hallazgos:** Redirigió a `/`, ignorando `redirectTo` como se esperaba. Sin observaciones.

## Resumen de la ronda
- Aprobados: 4 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno
- Limpieza de datos de prueba: ✅ Completada (no se creó ningún recurso nuevo; solo se usó la cuenta de desarrollo ya sembrada)
