# test-037 — Manejo de errores: boundaries y señalización honesta de fallos de infraestructura

> Casos derivados de los criterios de aceptación de
> `docs/specs/spec-037-manejo-de-errores.md`. Nacen en ⬜ Pendiente y se ponen en
> verde con la implementación.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico de prueba (con `course_slug` válido) | `students-mcp` / panel admin | `{{pendiente}}` | ⬜ |
| Estudiante A — matriculado, para los casos de asistencia | `students-mcp` → `create_student` + `enroll_student` | `{{pendiente}}` | ⬜ |
| Estudiante B — para el gate de autoevaluación (lección **con** preguntas publicadas, sin intento previo) | `students-mcp` → `create_student` + `enroll_student` | `{{pendiente}}` | ⬜ |
| Lección con autoevaluación publicada (≥1 pregunta) | `question-bank-mcp` → `publish_question` | `{{pendiente}}` | ⬜ |

**Entorno de pruebas:** desarrollo (`.env.local` → instancia local en `mirp-lab`
vía túnel SSH). **Nunca ejecutar esta ronda contra producción**: varios casos
requieren dejar la base de datos inalcanzable a propósito.

**Fecha de la ronda:** {{pendiente}}

---

## Procedimiento transversal — cortar y restaurar la base de datos

La mayoría de los casos requieren la BD inalcanzable. Es el mismo método que
originó `TC-007` de `test-fix-attendance-panel-flicker.md`.

**Cortar** (Claude lo ejecuta a petición del usuario):
```bash
pkill -f "ssh.*-L 54321.*mirp-lab"
```

**Restaurar:**
```bash
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
  -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab
```

> ⚠️ **Al cerrar la ronda hay que verificar que el túnel quedó restaurado** y que
> `npm run dev` vuelve a conectar. No cerrar la sesión de pruebas con el entorno
> de desarrollo roto.

Los casos `TC-037-005` y `TC-037-006` requieren además **provocar una excepción
en el código a propósito**. Anotar aquí la línea exacta modificada y **revertirla
al terminar**:

| Caso | Archivo y línea modificados | Revertido |
|---|---|---|
| TC-037-005 | `{{pendiente}}` | ⬜ |
| TC-037-006 | `{{pendiente}}` | ⬜ |

---

## Casos de prueba

### TC-037-001 — Abrir sesión de asistencia con la BD caída no desmonta la lección
> Criterio de aceptación 1. Es el caso que originó la deuda (`TC-007`).

**Precondición:** sesión iniciada como docente, en la página de una lección del
curso de prueba, con el panel docente visible. Túnel SSH **cortado**.
**Datos de prueba usados:** curso de prueba, cuenta docente `dev@nodo.local`.
**Pasos:**
1. Con el túnel ya cortado, pulsar "Abrir sesión de asistencia".
2. Observar el panel y el resto de la página.

**Resultado esperado:** aparece un banner de error inline **dentro del recuadro
del panel**, en español y sin jerga técnica. El artículo de la lección, el
sidebar de navegación y el selector de grupo **siguen visibles y utilizables**.
**No** aparece el overlay de Turbopack ("An unexpected response was received
from the server") ni la pantalla genérica de Next.js.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-002 — El contador de asistentes no cae a 0 al perder la conexión
> Criterio de aceptación 2. Es el número que se proyecta ante el curso.

**Precondición:** sesión de asistencia **abierta** y con al menos 1 asistente ya
marcado (usar el Estudiante A). Túnel SSH **activo** al empezar.
**Datos de prueba usados:** Estudiante A.
**Pasos:**
1. Confirmar que el contador muestra un valor mayor que 0 (p. ej. `1`).
2. Cortar el túnel SSH.
3. Esperar al menos dos ciclos de polling (~10 s) observando el contador.

**Resultado esperado:** el contador **conserva el último valor conocido** y
aparece una indicación discreta de que está desactualizado. **Nunca** muestra
`0`. No aparece un banner de error nuevo en cada tick del polling (~5 s).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-003 — Un código correcto no se reporta como "código incorrecto"
> Criterio de aceptación 3. Hoy el estudiante recibe la culpa de un fallo ajeno.

**Precondición:** sesión de asistencia abierta, con su código anotado. Iniciar
sesión como Estudiante A en la página de la lección. Túnel SSH **cortado**
justo antes de enviar.
**Datos de prueba usados:** Estudiante A + el código real de la sesión abierta.
**Pasos:**
1. Con la sesión abierta y el código a la vista, cortar el túnel SSH.
2. Como Estudiante A, escribir el código **correcto** y enviarlo.

**Resultado esperado:** el mensaje indica un fallo de conexión / que no se pudo
verificar el código, y **no culpa al estudiante**. **No** aparece "Código no
válido" ni equivalente.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-004 — "Sin sesión activa" no se muestra cuando la consulta falló
> Criterio de aceptación 4.

**Precondición:** **sin** sesión de asistencia abierta. Túnel SSH **cortado**.
Iniciar sesión como Estudiante A.
**Datos de prueba usados:** Estudiante A.
**Pasos:**
1. Con el túnel cortado, cargar la página de la lección como Estudiante A.
2. Observar la sección de asistencia.

**Resultado esperado:** la sección indica que **no se pudo consultar** el estado
de asistencia. **No** afirma "Sin sesión de asistencia activa", que sería
indistinguible del caso legítimo.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-005 — `error.tsx` de la lección conserva el layout y "Reintentar" funciona
> Criterio de aceptación 5. Requiere provocar una excepción a propósito.

**Precondición:** túnel SSH **activo**. Introducir temporalmente un `throw new
Error("test-037")` en el render en servidor de
`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, **anotando la línea en la
tabla de arriba**.
**Datos de prueba usados:** curso de prueba.
**Pasos:**
1. Cargar la página de la lección.
2. Observar qué se renderiza.
3. Retirar el `throw` introducido y pulsar "Reintentar".

**Resultado esperado:** en el paso 2 se muestra el `error.tsx` del segmento, en
español, **enmarcado por el layout de lección** (no una pantalla desnuda). En el
paso 3, `reset()` recupera la página sin necesidad de recargar a mano.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-006 — `global-error.tsx` se muestra legible ante un fallo del root layout
> Criterio de aceptación 6. Es el único boundary que cubre `app/layout.tsx`.

**Precondición:** túnel SSH activo. Introducir temporalmente un `throw` en
`app/layout.tsx` (p. ej. antes del `return`), **anotando la línea**. Probar en
modo oscuro del sistema operativo.
**Pasos:**
1. Cargar cualquier página de la app.
2. Observar el resultado, prestando atención al fondo durante la carga.
3. Retirar el `throw` introducido.

**Resultado esperado:** se renderiza `global-error.tsx` con texto legible en
español y `<html lang="es">` propio. **Sin flash blanco** al cargar en modo
oscuro (el script de tema se reinyecta — decisión D2 del spec). Se acepta que
la tipografía sea la del sistema y no JetBrains Mono.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-007 — Un fallo de BD NO permite completar una lección con autoevaluación pendiente
> Criterio de aceptación 7. **Es el caso más importante de la ronda**: hoy el
> gate se abre ante un fallo y deja completar sin responder.

**Precondición:** Estudiante B matriculado, en una lección **con autoevaluación
publicada** y **sin intento previo** (verificar que el botón de completar está
bloqueado con el túnel activo). Luego cortar el túnel.
**Datos de prueba usados:** Estudiante B + lección con preguntas publicadas.
**Pasos:**
1. Con el túnel **activo**, confirmar que "marcar lección completada" está
   bloqueado por la autoevaluación pendiente.
2. Cortar el túnel SSH.
3. Recargar e intentar marcar la lección como completada.

**Resultado esperado:** el completado **se deniega**. El mensaje distingue "no
pudimos verificar tu autoevaluación ahora" de "te falta la autoevaluación". Al
restaurar el túnel, el comportamiento vuelve al del paso 1 sin intervención.
**Regresión que este caso vigila:** que el gate **no** se abra por fallar.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-008 — Un `upsert` fallido no reporta éxito
> Criterio de aceptación 8.

**Precondición:** Estudiante A, en una lección **sin** autoevaluación (o con
intento ya registrado, para que el gate no interfiera). Túnel SSH **cortado**.
**Datos de prueba usados:** Estudiante A.
**Pasos:**
1. Con el túnel cortado, pulsar "marcar lección completada".
2. Observar el mensaje.
3. Restaurar el túnel y recargar la página.

**Resultado esperado:** en el paso 2 se informa que **no se pudo guardar**. En el
paso 3, la lección aparece **como no completada** — coherente con lo informado.
**Regresión que este caso vigila:** que la UI no cante éxito de una escritura
que nunca ocurrió.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-009 — Los mensajes de negocio siguen intactos con la app sana
> Criterio de aceptación 12. Verifica que el Frente 2 no rompió lo que funcionaba.

**Precondición:** túnel SSH **activo**, todo funcionando con normalidad.
**Datos de prueba usados:** Estudiante A, sesión de asistencia abierta.
**Pasos:**
1. Enviar un código **incorrecto** → debe decir que el código no es válido.
2. Enviar el código **correcto** → debe marcar asistencia correctamente.
3. Reenviar el mismo código correcto → debe indicar que ya se marcó.
4. Con la sesión **cerrada**, intentar marcar → debe indicar que no hay sesión.
5. Intentar abrir una segunda sesión en el mismo curso → "Ya hay una sesión
   abierta en este curso".

**Resultado esperado:** los cinco mensajes son los mismos que antes del spec.
Ninguno menciona fallos de conexión.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-010 — El panel admin de asistencia no sufre regresión
> Verifica que el Frente 2 no rompió el otro punto de montaje del panel, y que se
> conservan los arreglos de **[[DEBT-018]]**, **[[DEBT-019]]** y **[[DEBT-023]]**.

**Precondición:** docente con **más de un grupo** en el curso. Túnel activo.
**Pasos:**
1. Ir a `/admin/courses/<id>/attendance`, abrir y cerrar una sesión.
2. Con una sesión abierta, observar el botón "Cerrar sesión" durante ~15 s.
3. En la vista docente de lección, cambiar de grupo y recargar la página.

**Resultado esperado:** paso 1, abre y cierra sin `alert()`/`confirm()` nativos
(diálogo propio, DEBT-018). Paso 2, el botón **no parpadea** a "Cerrando..." con
el polling (DEBT-019). Paso 3, tras recargar aparece **directamente** el grupo
elegido, sin parpadeo del grupo equivocado (DEBT-023).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-011 — Un fallo del panel docente no tumba la lección proyectada
> Criterio de aceptación 1, vía el boundary de componente (Fase 3).

**Precondición:** docente en la página de una lección, panel visible. Provocar un
fallo de render **dentro** del panel (túnel cortado + interacción, o un `throw`
temporal en `AdminAttendancePanel`, anotándolo).
**Pasos:**
1. Provocar el fallo del panel.
2. Observar el resto de la página.
3. Usar el enlace/botón de recuperación del boundary, si se ofrece.

**Resultado esperado:** solo el **recuadro del panel** se sustituye por el estado
de error. El artículo, el sidebar y el **selector de grupo** siguen en pantalla y
son utilizables. La clase puede continuar.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-037-012 — Verificación visual en claro y oscuro
> Fase 1. La ejecuta el usuario; Claude no valida apariencia por su cuenta.

**Precondición:** cualquiera de los estados de error de los casos anteriores.
**Pasos:**
1. Reproducir un estado de error con el SO en **modo claro**.
2. Cambiar el SO a **modo oscuro** y repetir.
3. Revisar contraste del texto, del borde y del botón de reintento.

**Resultado esperado:** el estado de error es legible en ambos modos, coherente
con la tabla de `DESIGN.md`, y consistente con el banner ya existente del panel
de asistencia. El `digest` (si se muestra) es discreto y **no** se muestra el
mensaje crudo de la excepción.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

## Verificaciones por CLI
> Criterios 9, 10 y 11. Claude las ejecuta; no requieren UI.

| # | Comando | Esperado | Estado |
|---|---|---|---|
| V1 | `npm run build` | Sin errores | ⬜ |
| V2 | `npm run lint` | Sin errores | ⬜ |
| V3 | `grep -n "createServerSupabaseClient" lib/attendance/index.ts` | Las 6 llamadas dentro de su `try` | ⬜ |
| V4 | `grep -rn "any" lib/attendance/ lib/progress/ lib/self-assessment/` | Ningún `any` nuevo | ⬜ |
| V5 | `./mcp-servers/run-local-mcp.sh attendance-mcp </dev/null` + `list_sessions` | El MCP responde igual que antes | ⬜ |

---

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 12
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Excepciones provocadas a propósito revertidas: ⬜ Pendiente
- Túnel SSH a `mirp-lab` restaurado y `npm run dev` reconectado: ⬜ Pendiente
- Limpieza de datos de prueba: ⬜ Pendiente
