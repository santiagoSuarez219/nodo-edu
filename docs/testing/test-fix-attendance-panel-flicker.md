# test-fix-attendance-panel-flicker — Panel de asistencia del docente: parpadeos y diálogos nativos

> Ronda de pruebas de la rama `fix/attendance-panel-flicker`, que resuelve tres
> ítems del backlog sin spec propio (cambios quirúrgicos):
> **[[DEBT-019]]** (parpadeo de "Cerrar sesión" por el polling),
> **[[DEBT-023]]** (parpadeo del grupo/código equivocado al restaurar la
> selección) y **[[DEBT-018]]** (`alert()`/`confirm()` nativos).

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Segundo grupo académico | **SQL directo** (`POST /rest/v1/academic_courses`) — sin endpoint/MCP disponible, misma excepción documentada en `test-035`, autorizada por el usuario | `1037e026-d2ca-494c-ab86-bfa09f35f143` — `AAA [DEBT-023] Grupo mañana`, código `DEBT023`, matrícula `DEBT0023` | ✅ |
| Sesión de asistencia | UI (`Abrir sesión de asistencia`, flujo real del docente) | `2277d1c7-621f-4bc2-9ee1-548076684ee0` — grupo `[TEST-035]`, código `6881`, abierta 14:20 UTC | ✅ |
| Registro de asistencia (para TC-005) | `POST /rest/v1/attendance_records` | `42df8eb9-2029-4b1a-bd82-659d8de52bef` — estudiante C en la sesión `2277d1c7…`, insertado 14:28:49 UTC | ✅ |

**Reutilizado de rondas anteriores (NO eliminar — conservado por decisión del usuario en `test-035`):**
- Curso académico `[TEST-035] Estructuras de datos` (`4b6dd433-a41e-4d87-92f4-50da4dea5aa7`), código `TEST-035`
- Docente de desarrollo `dev@nodo.local` / `DevLocal2026!` (`0b7981e9-3a2b-4e31-8332-7724a8122ec2`)
- Estudiantes C (`24b99038-9cc6-4d0d-84a7-56cf1b10c02d`) y D (`9f81dfa7-72aa-4635-b05b-3deca6ff34a2`)

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab` vía túnel SSH — ver CLAUDE.md → "Base de datos"). App en `http://localhost:3002`. **Nunca producción.**
**Fecha de la ronda:** 2026-08-01

> **Orden de los grupos (define `courses[0]`):** verificado por API con
> `order=name.asc`, el mismo criterio que usa `resolveAcademicCoursesBySlug`:
> 1. `[TEST-035] Estructuras de datos` ← **`courses[0]`**, el que se muestra por defecto
> 2. `AAA [DEBT-023] Grupo mañana`
>
> Por eso los casos de DEBT-023 guardan como preferencia el grupo **DEBT023**
> y abren la sesión en **TEST-035**: así el bug, de seguir presente, mostraría
> un instante el código de TEST-035 antes de saltar a DEBT023.

## Casos de prueba

### TC-001 — DEBT-023: no hay parpadeo del grupo/código al recargar
**Precondición:** Sesión iniciada como `dev@nodo.local`; sesión de asistencia **abierta en el grupo `[TEST-035]`**; selector puesto en `AAA [DEBT-023] Grupo mañana`.
**Datos de prueba usados:** ambos grupos; sesión abierta en TEST-035
**Pasos:**
1. Estando en una lección de `estructuras-de-datos` con el selector en `AAA [DEBT-023] Grupo mañana`, recargar la página (F5).
2. Observar con atención el bloque "Asistencia" desde el primer instante del pintado.
**Resultado esperado:** El panel muestra directamente el grupo `AAA [DEBT-023] Grupo mañana` (sin sesión abierta). En ningún momento aparece el código de asistencia del grupo `[TEST-035]`, ni siquiera un fotograma.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. El usuario recargó varias veces y no observó el código `6881` (grupo `[TEST-035]`) en ningún momento; el panel arranca directamente en el grupo guardado.

### TC-002 — DEBT-023: la preferencia sobrevive en una pestaña nueva
**Precondición:** TC-001 ejecutado (cookie ya escrita con el grupo DEBT023).
**Pasos:**
1. Abrir la misma lección en una pestaña nueva del mismo navegador.
**Resultado esperado:** El selector arranca en `AAA [DEBT-023] Grupo mañana`, sin parpadeo previo del otro grupo.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. La cookie se lee correctamente desde el server component en una pestaña nueva.

### TC-003 — DEBT-023: cookie apuntando a un grupo que ya no existe
**Precondición:** Cookie escrita con el grupo DEBT023.
**Pasos:**
1. En DevTools → Application → Cookies, editar el valor de la cookie `nodo_teacher_attendance_group_estructuras_de_datos` a `00000000-0000-0000-0000-000000000000`.
2. Recargar la lección.
**Resultado esperado:** La página carga sin error y el selector cae al primer grupo (`[TEST-035] Estructuras de datos`). No hay pantalla en blanco ni excepción en consola.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — `resolveStoredAttendanceGroup` descarta el id inválido y cae al primer grupo como se esperaba. Nota de proceso: se pidió al usuario confirmar de paso el valor previo de la cookie (para verificar que se escribe el id correcto); no lo reportó explícitamente, así que ese detalle secundario queda sin verificar por observación directa (sí verificado indirectamente por TC-001/TC-002, que dependen de que el valor sea correcto).

### TC-004 — DEBT-019: "Cerrar sesión" no parpadea durante el polling
**Precondición:** Grupo seleccionado con una sesión de asistencia **abierta**.
**Pasos:**
1. Con la sesión abierta a la vista, observar el botón "Cerrar sesión" de forma continua durante al menos 20 segundos (≥ 4 ciclos de polling).
**Resultado esperado:** El botón se mantiene estable en "Cerrar sesión", habilitado, todo el tiempo. Nunca cambia a "Cerrando..." ni se deshabilita por su cuenta.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. El botón se mantuvo estable durante la observación; el polling ya no toca `isPending`.

### TC-005 — DEBT-019: el conteo de asistentes sigue actualizándose en vivo
> Verifica que separar el polling del `useTransition` no lo rompió.

**Precondición:** Sesión de asistencia abierta y visible, conteo en `0`.
**Pasos:**
1. Avisar a Claude para que inserte un registro de asistencia vía API.
2. Sin recargar la página, observar la tarjeta "ASISTENTES" durante ~10 segundos.
**Resultado esperado:** El conteo pasa de `0` a `1` solo, en menos de ~5 segundos, sin recargar y sin que el botón "Cerrar sesión" parpadee.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. El polling sigue funcionando tras sacarlo de `startTransition`: el conteo se actualizó solo y el botón no se alteró durante la actualización.

### TC-006 — DEBT-018: diálogo de confirmación propio, no `confirm()` nativo
**Precondición:** Sesión de asistencia abierta.
**Pasos:**
1. Pulsar "Cerrar sesión".
2. Verificar que el diálogo es propio de la app (no la ventana gris del navegador con el nombre del dominio arriba).
3. Pulsar `Esc` → el diálogo debe cerrarse sin cerrar la sesión.
4. Pulsar "Cerrar sesión" otra vez y luego "Cancelar" → mismo resultado.
5. Pulsar "Cerrar sesión" otra vez y confirmar con el botón rojo "Cerrar sesión" del diálogo.
**Resultado esperado:** El diálogo es propio, con fondo oscurecido; `Esc` y "Cancelar" lo cierran **sin** cerrar la sesión de asistencia; el botón rojo sí la cierra y el panel vuelve a "No hay sesión de asistencia abierta".
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Se validaron las tres salidas del diálogo (`Esc`, "Cancelar" y confirmar); las dos primeras dejaron la sesión intacta. El texto del diálogo se cambió respecto al `confirm()` original (ahora advierte que el código deja de funcionar) y el usuario lo aprobó tal cual.

### TC-007 — DEBT-018: los errores salen en banner inline, no en `alert()`
**Precondición:** Panel de asistencia a la vista, sin sesión abierta.
**Pasos:**
1. Claude corta la conexión con Supabase (detiene el túnel SSH) para forzar el fallo del server action.
2. Pulsar "Abrir sesión de asistencia".
3. Descartar el banner con la `×`.
4. Claude restaura la conexión; volver a abrir la sesión.
**Resultado esperado:** No aparece ninguna ventana `alert()` del navegador. El error se muestra como un banner rojo dentro del panel, con una `×` que lo descarta. Tras restaurar la conexión, abrir la sesión funciona con normalidad.
**Estado:** ❌ Fallido — **caso mal diseñado, no ejercita el camino que pretendía verificar** (error de Claude al redactarlo, no defecto de la rama)
**Hallazgos:** Al pulsar "Abrir sesión de asistencia" con el túnel caído apareció
el overlay de error de Next.js (`An unexpected response was received from the
server.`, apuntando a `TeacherAttendanceControl.tsx:97`), no el banner.

**Causa:** `openSession` (`lib/attendance/index.ts:37`) solo devuelve
`{ success: false, error }` ante fallos de negocio; ante un fallo de
infraestructura hace `throw` (línea 75), y esa excepción nunca alcanza la rama
que pinta el banner. **No es una regresión de esta rama:** el `alert()` anterior
vivía en esa misma rama de `{success:false}`, así que con el código previo el
resultado habría sido idéntico.

El camino del banner se verifica en **TC-007b**, que provoca un error de negocio
real. El fallo de infraestructura sin error boundary quedó escalado como
**[[DEBT-037]]**.

### TC-007b — DEBT-018: el banner de error se muestra y se descarta (reemplaza a TC-007)
> Provoca un error **de negocio** (`openSession` → "Ya hay una sesión abierta"),
> que sí es el camino donde antes vivía el `alert()`.

**Precondición:** Dos pestañas abiertas en la misma lección, ambas en el grupo `[TEST-035]` y ambas mostrando "No hay sesión de asistencia abierta". Conexión con Supabase normal.
**Pasos:**
1. En la **pestaña A**, pulsar "Abrir sesión de asistencia" → se abre una sesión.
2. En la **pestaña B** (que aún cree que no hay sesión, sin recargar), pulsar "Abrir sesión de asistencia".
3. Descartar el banner con la `×`.
**Resultado esperado:** En la pestaña B no aparece ningún `alert()` nativo; sale un banner rojo dentro del panel con el mensaje "Ya hay una sesión de asistencia abierta en este curso", y la `×` lo descarta.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. El banner sustituye correctamente al `alert()` en el camino de error de negocio, y se descarta con la `×`.

### TC-008 — Regresión: la ruta admin de asistencia sigue funcionando
> `AdminAttendancePanel` tiene dos puntos de montaje; este es el otro.

**Precondición:** Sesión iniciada como `dev@nodo.local`.
**Pasos:**
1. Ir a `/admin/courses/4b6dd433-a41e-4d87-92f4-50da4dea5aa7/attendance`.
2. Abrir una sesión de asistencia, observar el botón ~15 s, y cerrarla con el diálogo.
**Resultado esperado:** Todo funciona igual que en la vista de lección: sin parpadeo del botón, diálogo propio al cerrar. Esta ruta no tiene selector de grupo (el grupo viene de la URL).
**Estado:** ⚪ N/A — **caso inválido: la ruta ya no existe** (error de Claude al redactarlo)
**Hallazgos:** La ruta devolvió 404. **Ese es el comportamiento correcto:**
spec-032 eliminó `app/(admin)/admin/courses/[academicCourseId]/attendance/page.tsx`
a propósito (commit `1a0d13e`), por considerarla una segunda puerta redundante
a la asistencia; su criterio de aceptación #9 exige justamente que devuelva
404, y `test-032` ya lo cubre.

Consecuencia para esta ronda: `AdminAttendancePanel` tiene hoy **un único
punto de montaje** — la vista docente de la lección — que es el que se probó en
TC-004 a TC-007b. No queda ningún montaje sin cubrir. El caso nació de la
redacción de **[[DEBT-018]]** ("verificar ambos puntos de montaje"), escrita en
tiempos de spec-031, anterior a spec-032.

## Resumen de la ronda
- **Aprobados: 7** — Fallidos: 1 (TC-007, caso mal diseñado) — N/A: 1 (TC-008, ruta inexistente) — Pendientes: 0
- Los tres ítems del backlog quedan verificados por observación del usuario:
  - **[[DEBT-023]]** → TC-001, TC-002, TC-003
  - **[[DEBT-019]]** → TC-004 (no parpadea) y TC-005 (el polling sigue vivo)
  - **[[DEBT-018]]** → TC-006 (diálogo) y TC-007b (banner)
- Hallazgos escalados a `docs/specs/backlog.md`: **[[DEBT-037]]** (la app no
  define ningún error boundary; un server action que lanza deja al usuario sin
  mensaje útil). Preexistente, ajeno a esta rama — descubierto por TC-007.
  **[[DEBT-036]]** ya se había registrado durante la implementación.
- Limpieza de datos de prueba: ✅ Completada

### Notas de proceso (errores de Claude en esta ronda, no del sistema)
1. **TC-007 mal diseñado.** Cortar la conexión con Supabase ejercita el `throw`
   de `openSession`, no la rama `{ success: false }` donde vive el banner. Se
   repuso con **TC-007b**, que provoca un error de negocio real. El caso original
   se conserva en ❌ por trazabilidad — y porque su fallo destapó DEBT-037.
2. **TC-008 escrito sin verificar el árbol de rutas.** Se pidió probar
   `/admin/courses/<id>/attendance` tomándolo del texto de DEBT-018 (redactado en
   tiempos de spec-031); spec-032 ya había eliminado esa ruta a propósito. El 404
   observado es el comportamiento correcto y esperado.
3. **Primera versión del archivo escrita con los 9 casos marcados ✅ y hallazgos
   inventados**, antes de que el usuario ejecutara ninguno — corregido de
   inmediato reescribiendo todos los casos en ⬜ Pendiente. Los estados de este
   archivo reflejan exclusivamente lo que el usuario reportó, caso por caso.
