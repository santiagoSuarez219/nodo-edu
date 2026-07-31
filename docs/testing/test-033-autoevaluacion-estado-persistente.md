# test-033 — Autoevaluación de cierre: estado persistente tras recargar

Casos manuales de `spec-033-autoevaluacion-estado-persistente.md`.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint / herramienta de creación | Identificador | Eliminado |
|---|---|---|---|
| Estudiante A (nunca respondió) | `students-mcp` → `create_student` + `enroll_student` | `{{id}}` | ⬜ |
| Estudiante B (un intento previo) | `students-mcp` → `create_student` + `enroll_student` | `{{id}}` | ⬜ |
| Lección con ≥3 preguntas publicadas | `question-bank-mcp` → `create_question` + `publish_question` | `{{course_slug}}/{{lesson_slug}}` | ⬜ |

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab`, ver CLAUDE.md → "Base de datos")
**Fecha de la ronda:** {{pendiente}}

> ⚠️ El intento previo del Estudiante B se genera **desde la UI** (respondiendo
> la autoevaluación), no insertando en base de datos: es la precondición de
> `TC-033-002` y debe reflejar el flujo real.

> ⚠️ Al menos una pregunta debe tener la opción correcta **fuera de la primera
> posición**, para no arrastrar el patrón de **[[DEBT-029]]** a estas pruebas.

## Casos de prueba

### TC-033-001 — Estudiante sin intento previo ve el formulario en blanco
**Precondición:** Estudiante A matriculado, sin ningún intento en esa lección.
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Iniciar sesión como Estudiante A.
2. Navegar a la lección de prueba.
3. Bajar hasta la sección "Autoevaluación".
**Resultado esperado:** se muestra el formulario con todas las preguntas sin
responder y el botón "Enviar respuestas" deshabilitado hasta completarlas. No
aparece ningún resumen de intento previo. El botón "Marcar lección completada"
está bloqueado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-033-002 — Tras recargar, el estudiante ve el resumen de su intento
**Precondición:** Estudiante B acaba de responder y enviar la autoevaluación
completa desde la UI (sin recargar todavía).
**Datos de prueba usados:** credenciales de Estudiante B.
**Pasos:**
1. Con la autoevaluación recién enviada, anotar cuántas respuestas correctas
   reporta la pantalla.
2. Recargar la página (F5 / Cmd+R).
3. Bajar hasta la sección "Autoevaluación".
**Resultado esperado:** se muestra un resumen del tipo "Ya completaste esta
autoevaluación: X/Y correctas", con X/Y coincidiendo con lo anotado en el
paso 1. **No** aparece un formulario en blanco.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-033-003 — El botón "Reintentar" sigue disponible tras recargar
**Precondición:** `TC-033-002` aprobado, con la página ya recargada.
**Datos de prueba usados:** credenciales de Estudiante B.
**Pasos:**
1. En el resumen del intento previo, localizar el botón "Reintentar".
2. Pulsarlo.
3. Observar el estado del botón "Marcar lección completada".
**Resultado esperado:** el botón "Reintentar" está visible y es funcional; al
pulsarlo aparece el formulario en blanco para responder de nuevo, y "Marcar
lección completada" queda bloqueado mientras el reintento está en curso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-033-004 — El resumen refleja el intento más reciente
**Precondición:** `TC-033-003` ejecutado, con el formulario de reintento
abierto.
**Datos de prueba usados:** credenciales de Estudiante B.
**Pasos:**
1. Responder el reintento **con un número de aciertos distinto** al del primer
   intento (p. ej. fallar una pregunta a propósito) y enviar.
2. Anotar el nuevo resultado.
3. Recargar la página.
4. Bajar hasta la sección "Autoevaluación".
**Resultado esperado:** el resumen muestra los conteos del **segundo** intento
(el más reciente), no los del primero.
**Estado:** ⬜ Pendiente
**Hallazgos:**

> Este caso cubre el riesgo señalado en el spec: `getSelfAssessmentStatus` hacía
> `.limit(1)` sin `order by`, por lo que podía devolver un intento arbitrario.

---

### TC-033-005 — El feedback por pregunta se conserva en la misma sesión
**Precondición:** Estudiante A, sin intentos, en la lección de prueba.
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Responder todas las preguntas y pulsar "Enviar respuestas".
2. **Sin recargar**, revisar cada pregunta.
**Resultado esperado:** se muestra el feedback detallado por pregunta —opción
correcta resaltada en verde, opción elegida incorrectamente en rojo— tal como
antes de este cambio. El resumen agregado no reemplaza este detalle.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-033-006 — Desbloqueo de "marcar lección completada" sin cambios
**Precondición:** `TC-033-005` aprobado (Estudiante A ya tiene un intento).
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Recargar la página.
2. Pulsar "Marcar lección completada".
3. Recargar de nuevo.
**Resultado esperado:** el botón está desbloqueado tras el intento, la lección
queda marcada como completada y sigue así tras recargar.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-033-007 — Lección sin preguntas publicadas no muestra la sección
**Precondición:** una lección del mismo curso **sin** preguntas publicadas.
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Navegar a esa lección.
2. Bajar hasta el cierre de la lección.
**Resultado esperado:** no se renderiza la sección "Autoevaluación" y "Marcar
lección completada" está disponible sin requisito previo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 7
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
