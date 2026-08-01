# test-035 — Evaluaciones A/B/C: barajado de preguntas y opciones

> Pruebas manuales de `spec-035-evaluaciones-barajado.md`.
> Un caso por criterio de aceptación.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint / herramienta de creación | Identificador | Eliminado |
|---|---|---|---|
| Estudiante A | `students-mcp` → `create_student` | `{{id}}` | ⬜ |
| Estudiante B | `students-mcp` → `create_student` | `{{id}}` | ⬜ |
| Matrícula A | `students-mcp` → `enroll_student` | `{{enrollment_id}}` | ⬜ |
| Matrícula B | `students-mcp` → `enroll_student` | `{{enrollment_id}}` | ⬜ |
| Preguntas MC (≥4 opciones) | `question-bank-mcp` → `create_question` | `{{ids}}` | ⬜ |
| Pregunta abierta (`open_text`) | `question-bank-mcp` → `create_question` | `{{id}}` | ⬜ |
| Grupo G-BARAJA (`max_attempts: 2`) | `assignment-mcp` → `create_assignment_group` | `{{group_id}}` | ⬜ |
| Variantes A/B/C de G-BARAJA | `assignment-mcp` → `replace_variant_questions` | `{{ids}}` | ⬜ |
| Envíos generados en la ronda | (generados al resolver en la UI) | `{{ids}}` | ⬜ |

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab` vía túnel SSH — ver CLAUDE.md → "Base de datos"). **Nunca producción.**
**Fecha de la ronda:** {{pendiente}}

### Preparación específica de esta ronda

1. El grupo debe crearse con **`max_attempts: 2`** (criterio 3, TC-035-003) y
   `show_feedback_on: "submit"` (para que la página de resultados muestre
   feedback y se pueda contrastar el orden en TC-035-004).
2. Al menos una variante debe combinar **preguntas multiple_choice con ≥4
   opciones** (para que un barajado sea visualmente evidente) y **una pregunta
   abierta** (TC-035-008).
3. **Los dos estudiantes deben quedar asignados a la MISMA variante.** El
   sorteo lo hace `getOrAllocateVariant` y no es controlable desde la UI:
   verificar con `assignment-mcp` → `get_variant_allocations` tras el primer
   ingreso de cada uno. Si cayeron en variantes distintas, crear un tercer
   estudiante hasta obtener una coincidencia y anotar los descartados en esta
   tabla para eliminarlos igual.
4. Anotar antes de empezar el **orden canónico** de cada variante
   (`assignment-mcp` → `get_assignment_group`, que numera por `order_index`):
   es la referencia contra la que se comparan todos los casos.

---

## Casos de prueba

### TC-035-001 — Con `shuffle_choices`, dos estudiantes ven las opciones en orden distinto
**Criterio de aceptación:** 1
**Precondición:** G-BARAJA con `shuffle_choices: true`, `shuffle_questions: false`, publicado. Estudiantes A y B en la misma variante.
**Datos de prueba usados:** credenciales de A y B, `{{group_id}}`
**Pasos:**
1. Iniciar sesión como estudiante A y abrir la evaluación.
2. Anotar, para la primera pregunta multiple_choice, el orden exacto de las opciones.
3. Cerrar sesión. Iniciar sesión como estudiante B y abrir la misma evaluación.
4. Anotar el orden de las opciones de esa misma pregunta.
**Resultado esperado:** los dos órdenes difieren. Ambos contienen exactamente las mismas opciones (ninguna repetida ni faltante).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-002 — Con `shuffle_questions`, dos estudiantes ven las preguntas en orden distinto
**Criterio de aceptación:** 2
**Precondición:** G-BARAJA con `shuffle_questions: true`. Estudiantes A y B en la misma variante, sin intentos previos (crear estudiantes nuevos si ya resolvieron).
**Pasos:**
1. Como estudiante A, abrir la evaluación y anotar el orden de los enunciados.
2. Como estudiante B, abrir la misma evaluación y anotar el orden.
**Resultado esperado:** los órdenes difieren. Ambos incluyen todas las preguntas de la variante, sin repetidas ni faltantes, y la numeración mostrada es correlativa (1, 2, 3…) en los dos casos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-003 — El orden es estable durante todo el intento
**Criterio de aceptación:** 3
**Precondición:** G-BARAJA con ambos flags en `true`. Estudiante A con intento en curso.
**Pasos:**
1. Como estudiante A, abrir la evaluación y anotar el orden de preguntas y el de opciones de la primera.
2. Responder dos preguntas y esperar a ver "✓ Guardado".
3. Recargar la página (F5). Comparar ambos órdenes.
4. Navegar a otra ruta (p. ej. `/cuenta/cursos`) y volver a la evaluación. Comparar.
5. Cerrar sesión, volver a iniciar sesión y reabrir la evaluación (recupera el `in_progress`). Comparar.
**Resultado esperado:** el orden de preguntas y de opciones es idéntico en los cuatro momentos. Las respuestas ya dadas siguen marcadas en las preguntas correctas.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-004 — Resultados coincide con lo que se vio en el jugador
**Criterio de aceptación:** 4
**Precondición:** viene de TC-035-003, con el orden anotado. `show_feedback_on: "submit"`.
**Pasos:**
1. Terminar de responder y enviar la evaluación.
2. En la página de resultados, comparar el orden de las preguntas y el de las opciones dentro de cada una contra lo anotado en TC-035-003.
**Resultado esperado:** coinciden exactamente. Cada respuesta marcada corresponde a la que el estudiante eligió, y la retroalimentación señala la opción correcta en la posición en que la ve.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-005 — Sin flags activos, el orden es el canónico (no regresión)
**Criterio de aceptación:** 5
**Precondición:** un grupo con `shuffle_questions: false` y `shuffle_choices: false` (el default). Puede usarse un grupo preexistente del entorno.
**Pasos:**
1. Como estudiante, abrir la evaluación.
2. Comparar el orden de preguntas y opciones contra el orden canónico anotado en la preparación (`get_assignment_group`).
**Resultado esperado:** coinciden exactamente. Ninguna diferencia respecto al comportamiento anterior al spec.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-006 — Los dos flags actúan de forma independiente
**Criterio de aceptación:** 6
**Precondición:** poder alternar los flags con `assignment-mcp` → `update_assignment_group` entre pasos.
**Pasos:**
1. `shuffle_questions: true`, `shuffle_choices: false` → abrir como estudiante A y verificar: preguntas barajadas, opciones en orden canónico.
2. `shuffle_questions: false`, `shuffle_choices: true` → verificar: preguntas canónicas, opciones barajadas.
3. Ambos `true` → verificar: las dos cosas barajadas.
4. Ambos `false` → verificar: todo canónico.
**Resultado esperado:** cada combinación produce exactamente lo descrito, sin efectos cruzados.
**Estado:** ⬜ Pendiente
**Hallazgos:**
> Nota: cambiar los flags a mitad de un intento en curso reordena la vista de
> ese estudiante. Es esperable (los flags son configuración del docente, no
> estado del intento) y no debe reportarse como fallo — pero anotar si se
> observa algo peor que un reordenamiento limpio.

### TC-035-007 — La calificación es correcta con el orden barajado
**Criterio de aceptación:** 7
**Precondición:** G-BARAJA con ambos flags en `true`, estudiante nuevo sin intentos.
**Pasos:**
1. Abrir la evaluación y responder **a propósito**: en unas preguntas la opción correcta, en otras una incorrecta. Anotar cuáles.
2. Enviar y revisar el puntaje en la página de resultados.
3. Como docente, abrir la revisión del envío en el panel admin y contrastar respuesta por respuesta.
**Resultado esperado:** el puntaje refleja exactamente los aciertos y errores anotados. Cada respuesta quedó asociada a su pregunta (ninguna corrida de posición).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-008 — Preguntas sin opciones con barajado activo
**Criterio de aceptación:** 8
**Precondición:** variante con al menos una pregunta `open_text` (u otro tipo abierto), ambos flags en `true`.
**Pasos:**
1. Abrir la evaluación como estudiante y localizar la pregunta abierta.
2. Escribir una respuesta, esperar el guardado y recargar la página.
**Resultado esperado:** la pregunta abierta se renderiza sin error, participa del barajado de preguntas (puede aparecer en cualquier posición) y su texto se conserva tras la recarga. Sin errores en la consola del navegador.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-009 — La vista del docente conserva el orden canónico
**Criterio de aceptación:** 9
**Precondición:** al menos un envío hecho con ambos flags en `true` (viene de TC-035-007).
**Pasos:**
1. Como docente, abrir la ficha del grupo en el panel admin y anotar el orden de las preguntas de la variante.
2. Abrir la revisión del envío del estudiante y anotar el orden de las respuestas y el de las opciones dentro de cada una.
**Resultado esperado:** ambos coinciden con el orden canónico anotado en la preparación, no con el que vio el estudiante.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-010 — `order_index` no cambia en base de datos
**Criterio de aceptación:** 10
**Precondición:** orden canónico anotado en la preparación, antes de ejecutar ningún caso.
**Pasos:**
1. Tras completar los casos anteriores, volver a consultar `assignment-mcp` → `get_assignment_group`.
2. Comparar contra lo anotado en la preparación.
**Resultado esperado:** idéntico. El barajado no escribió nada: es solo de presentación.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-011 — No regresión del flujo de resolución y revisión
**Criterio de aceptación:** 11
**Precondición:** ninguna adicional.
**Pasos:**
1. Repasar los casos principales de `test-019` (resolución: autoguardado, contador de tiempo, confirmación de envío, límite de intentos) y de `test-020` (revisión: calificar respuesta abierta, finalizar calificación, propagación a la libreta) sobre G-BARAJA.
**Resultado esperado:** todo se comporta como en aquellas rondas. El barajado no altera ningún otro aspecto del flujo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-012 — La autoevaluación de cierre sigue intacta tras mover el helper
**Criterio de aceptación:** 12
**Precondición:** una lección con autoevaluación publicada y un estudiante que ya la haya respondido antes de este spec, si es posible.
**Pasos:**
1. Como estudiante, abrir una lección con autoevaluación de cierre y anotar el orden de las opciones.
2. Recargar y verificar que el orden se mantiene.
3. Responder, enviar y usar "Reintentar".
**Resultado esperado:** todo se comporta como tras spec-034: orden estable por estudiante, resumen del intento previo y "Reintentar" funcionando. Si el estudiante ya tenía un orden conocido de antes, es el mismo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-035-013 — El panel admin advierte la consecuencia de barajar preguntas
**Criterio de aceptación:** 13
**Precondición:** acceso docente a la ficha del grupo.
**Pasos:**
1. Con `shuffle_questions: true`, abrir la ficha del grupo en el panel admin.
2. Observar el campo "Mezclar preguntas".
3. Cambiar a `shuffle_questions: false` y recargar la ficha.
4. Verificar en modo claro y en modo oscuro.
**Resultado esperado:** con el flag activo aparece una nota breve advirtiendo que cada estudiante ve las preguntas en un orden propio y que la numeración de esta ficha no coincide con la que ellos ven. Con el flag inactivo la nota no aparece. Legible en ambos modos y sin romper el layout de la grilla.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Resumen de la ronda

- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 13
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente

### Orden de limpieza (inverso a la creación)

1. Envíos generados en la ronda (si no los borra en cascada el grupo).
2. Grupo G-BARAJA (`assignment-mcp` → `delete_assignment_group`) — borra sus variantes.
3. Preguntas creadas (`question-bank-mcp` → `delete_question`).
4. Desmatricular A y B (`students-mcp` → `unenroll_student`).
5. Eliminar estudiantes A, B y los descartados del paso 3 de la preparación
   (`students-mcp` → `delete_student`). Devuelve `409` si hay entregas: en ese
   caso eliminar primero los envíos y reintentar; si sigue fallando, reportar el
   id exacto al usuario **sin borrar nada directamente en base de datos**.
6. Verificar cada eliminación (consulta que devuelva `404` o lista vacía) y
   marcar la columna "Eliminado" de la tabla de datos de prueba.
