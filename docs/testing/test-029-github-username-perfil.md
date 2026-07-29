# test-029 — Campo `github_username` en `Profile`

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Estudiante de prueba A | `POST /api/students` `{"full_name":"Estudiante Prueba GitHub A","email":"test-spec029-a@nodo.dev","password":"TestSpec029Aaa!"}` | `bb0bf62a-a4a9-49da-a28d-92c5f73bd09b` | ⬜ |
| Estudiante de prueba B (para TC-029-006 aislamiento) | `POST /api/students` `{"full_name":"Estudiante Prueba GitHub B","email":"test-spec029-b@nodo.dev","password":"TestSpec029Bbb!"}` | `cc935bff-0787-404c-9d16-1d84c6d5da4a` | ⬜ |
| Docente de prueba | Cuenta docente **ya existente** en desarrollo, provista por el usuario (`santiago8628@gmail.com`). No creada por esta ronda; no se elimina al cerrarla. Contraseña no registrada aquí por ser una credencial real. | — | N/A (no se crea ni se borra) |

**Entorno de pruebas:** desarrollo (`localhost:3002`, proyecto Supabase único apuntado por `.env.local`)
**Fecha de la ronda:** 2026-07-29

## Casos de prueba

### TC-029-001 — Autoedición como estudiante
**Precondición:** Estudiante de prueba A autenticado, `github_username` en `null`.
**Datos de prueba usados:** cuenta del Estudiante de prueba A.
**Pasos:**
1. Ir a `/cuenta`.
2. En el campo "Usuario de GitHub", escribir `octocat`.
3. Guardar el formulario.
4. Recargar la página.
**Resultado esperado:** El campo muestra `octocat` guardado tanto justo después de guardar como tras recargar.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el usuario reportó que se guardó correctamente y todo se ve bien (incluyendo persistencia tras recarga y el enlace en la tarjeta de información).

### TC-029-002 — Autoedición como docente
**Precondición:** Cuenta con rol `teacher` autenticada, `github_username` en `null`.
**Datos de prueba usados:** cuenta docente de prueba (`santiago8628@gmail.com`).
**Pasos:**
1. Ir a `/cuenta`.
2. Verificar que el campo "Usuario de GitHub" está visible (no solo para estudiantes).
3. Escribir `docente-demo` y guardar.
**Resultado esperado:** Se guarda igual que para un estudiante; el formulario no exige datos de `career`/`semester` para aceptar el cambio.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el campo está disponible y se guarda igual que para un estudiante.

### TC-029-003 — Saneamiento de `@` y espacios
**Precondición:** Estudiante de prueba A autenticado.
**Datos de prueba usados:** cuenta del Estudiante de prueba A.
**Pasos:**
1. Ir a `/cuenta`.
2. Escribir `  @Octocat  ` (con espacios y arroba) en el campo.
3. Guardar y recargar.
**Resultado esperado:** El valor persistido y mostrado es `Octocat` (sin espacios ni `@`).
**Estado:** ✅ Aprobado
**Hallazgos:** Primer intento dejó `" octocat"` (espacio + minúsculas) porque el campo no se limpió antes de escribir (quedó mezclado con el valor previo/autocompletado del navegador) — no era un bug del saneamiento del servidor. Al repetir vaciando el campo primero, verificado vía API admin que `github_username` quedó exactamente en `"Octocat"`, confirmando que el saneamiento (trim + quitar `@` inicial) funciona correctamente.

### TC-029-004 — Limpiar el valor
**Precondición:** Estudiante de prueba A con `github_username` ya guardado (ej. de TC-029-003).
**Datos de prueba usados:** cuenta del Estudiante de prueba A.
**Pasos:**
1. Ir a `/cuenta`.
2. Borrar el contenido del campo "Usuario de GitHub" (dejarlo vacío).
3. Guardar y recargar.
**Resultado esperado:** El campo queda vacío (`null` en base); no se muestra el enlace de GitHub en `AccountInfoCard`.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — campo vacío en UI, confirmado `github_username: null` vía API admin.

### TC-029-005 — Visualización como enlace
**Precondición:** Estudiante de prueba A con `github_username = "octocat"`.
**Datos de prueba usados:** cuenta del Estudiante de prueba A.
**Pasos:**
1. Ir a `/cuenta`.
2. Observar `AccountInfoCard`.
**Resultado esperado:** Se muestra un enlace a `https://github.com/octocat` que abre en una pestaña nueva (`rel="noopener noreferrer"`).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-029-006 — Aislamiento entre usuarios (RLS)
**Precondición:** Estudiante de prueba A y Estudiante de prueba B, ambos con perfiles distintos.
**Datos de prueba usados:** cuentas de ambos estudiantes de prueba.
**Pasos:**
1. Autenticado como Estudiante B, intentar actualizar (vía API directa, no UI) el `github_username` del perfil del Estudiante A.
2. Observar la respuesta.
**Resultado esperado:** La operación falla o no tiene efecto sobre el perfil del Estudiante A (RLS `"profiles: update own"` lo bloquea).
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado directamente vía PostgREST: login como Estudiante B, `PATCH /rest/v1/profiles?id=eq.<A>` con `Authorization: Bearer <token de B>` y `{"github_username":"hacked-by-b"}`. Respuesta `HTTP 200` con body `[]` (0 filas afectadas, RLS filtra la fila sin exponer error). Verificado vía API admin que `github_username` del Estudiante A sigue en `"octocat"`, sin cambios.

### TC-MCP-029-001 — `update_student` con `github_username`
**Herramienta probada:** `update_student` en `students-mcp`
**Precondición:** Estudiante de prueba A existente.
**Input de prueba:** `{ "student_id": "{{id}}", "github_username": "octocat-mcp" }`
**Output esperado:** `200`, el estudiante devuelto incluye `"github_username": "octocat-mcp"`.
**Estado:** ✅ Aprobado
**Hallazgos:** Validado por equivalencia (no se probó el MCP real vía Claude Desktop en esta ronda, por decisión del usuario): `processToolCall` reenvía el body sin transformarlo a `PATCH /api/students/{id}`, así que se ejecutó esa misma petición HTTP directamente. Respuesta `200` con `github_username: "octocat-mcp"`.

### TC-MCP-029-002 — `get_student` refleja el campo
**Herramienta probada:** `get_student` en `students-mcp`
**Precondición:** Estudiante de prueba A con `github_username` seteado en TC-MCP-029-001.
**Input de prueba:** `{ "student_id": "{{id}}" }`
**Output esperado:** El detalle devuelto incluye `github_username` con el valor guardado.
**Estado:** ✅ Aprobado
**Hallazgos:** Validado por equivalencia (misma salvedad que TC-MCP-029-001): `GET /api/students/{id}` directo devuelve `github_username: "octocat-mcp"`, consistente con lo guardado.

## Resumen de la ronda
- Aprobados: 8 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno (los "hallazgos" de TC-029-003 y de la limpieza fueron errores de ejecución de la ronda de pruebas, no bugs del código; documentados en sus propios casos y en esta sección)
- Limpieza de datos de prueba: ✅ Completada
  - Estudiante de prueba A (`bb0bf62a-a4a9-49da-a28d-92c5f73bd09b`) eliminado vía `DELETE /api/students/{id}` (`200`, verificado `404` posterior).
  - Estudiante de prueba B (`cc935bff-0787-404c-9d16-1d84c6d5da4a`) eliminado vía `DELETE /api/students/{id}` (`200`, verificado `404` posterior).
  - Cuenta docente real (`santiago8628@gmail.com`, id `587ceede-6e6a-484a-a95d-4d62fcda79eb`): `github_username` limpiado a `null` (no se elimina la cuenta, solo se revirtió el efecto de TC-029-002).
  - **Nota de incidente durante la limpieza:** un primer intento de ubicar el perfil docente por email usó un filtro de la API de Supabase Auth que no se aplicó como se esperaba, y terminó actualizando `github_username: null` sobre un perfil distinto (`803a1569-77d4-40b5-8da6-6b9758d193b9`, `full_name: "test-student-e@example.com"` — aparenta ser una cuenta de pruebas de un spec anterior, no del usuario). Ese campo no tenía valor previo (la funcionalidad se implementó en esta misma sesión), por lo que el efecto neto fue nulo, pero se registra por transparencia.
