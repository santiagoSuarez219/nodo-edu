# test-035 — Evaluaciones A/B/C: barajado de preguntas y opciones

> Pruebas manuales de `spec-035-evaluaciones-barajado.md`.
> Un caso por criterio de aceptación.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint / herramienta de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico de prueba | **SQL directo** (`POST /rest/v1/academic_courses`) — sin endpoint/MCP disponible, ver nota abajo | `4b6dd433-a41e-4d87-92f4-50da4dea5aa7` (código matrícula `TEST0035`) | ⬜ |
| Estudiante A | `students-mcp` → `create_student` | `2caf011e-4d89-49bc-adf0-719e0b099677` (`spec035-a@nodo-test.local` / `Test035Pass!`) | ⬜ |
| Estudiante B | `students-mcp` → `create_student` | `d1c0ecbe-16c1-41cd-9fd3-cf29551dd480` (`spec035-b@nodo-test.local` / `Test035Pass!`) | ⬜ |
| Matrícula A | `students-mcp` → `create_student` (`enrollment_code`) | `445916da-af4b-4ab0-abcb-a029744be8e0` | ⬜ |
| Matrícula B | `students-mcp` → `create_student` (`enrollment_code`) | `6f58584e-ffdb-4b5d-a0e3-facc0097d504` | ⬜ |
| Pregunta MC — complejidad arreglo dinámico | `question-bank-mcp` → `create_question` | `54495bfa-d135-4562-a0be-428b8ab6667d` | ⬜ |
| Pregunta MC — LIFO / Pila | `question-bank-mcp` → `create_question` | `fdad9014-74d6-4440-979a-86d4e0565c28` | ⬜ |
| Pregunta MC — búsqueda en tabla hash | `question-bank-mcp` → `create_question` | `0fa8c72a-86b6-4104-b7a1-ae14c02fdb2f` | ⬜ |
| Pregunta MC — recorrido preorden | `question-bank-mcp` → `create_question` | `c72ec245-e463-48c7-bb8b-484471713c5e` | ⬜ |
| Pregunta abierta — listas enlazadas | `question-bank-mcp` → `create_question` | `21f7bbe9-84c9-4ea9-99ac-c677f8ef1e5f` | ⬜ |
| Grupo G-BARAJA (`max_attempts: 2`, `show_feedback_on: submit`) | `assignment-mcp` → `create_assignment_group` | `d86ee011-8211-4c80-afda-09a46fa79519` | ⬜ |
| Variante A (5 preguntas, 5 pts) | `assignment-mcp` → `create_assignment_group` | `a3f14d43-4dd1-4775-becd-df0b0eea353b` | ⬜ |
| Variante B (5 preguntas, 5 pts) | `assignment-mcp` → `create_assignment_group` | `7e8573c4-a352-4a73-9831-c5c2a56bdb10` | ⬜ |
| Variante C (5 preguntas, 5 pts) | `assignment-mcp` → `create_assignment_group` | `7ffcabcf-cf71-46ba-b3cc-ba31f7fa4b7c` | ⬜ |
| Estudiante C (par de comparación — variante A) | `students-mcp` → `create_student` | `24b99038-9cc6-4d0d-84a7-56cf1b10c02d` (`spec035-c@nodo-test.local` / `Test035Pass!`), matrícula `0ce3b4b0-a850-4a6b-9278-3e4670b37a03` | ⬜ |
| Estudiante D (par de comparación — variante A) | `students-mcp` → `create_student` | `9f81dfa7-72aa-4635-b05b-3deca6ff34a2` (`spec035-d@nodo-test.local` / `Test035Pass!`), matrícula `a8c0e340-823c-43a0-bdb0-ce0c84b28321` | ⬜ |
| Envíos generados en la ronda | (generados al resolver en la UI) | `{{a completar durante la ronda}}` | ⬜ |

> **Nota — descarte de A y B para el par de comparación:** Estudiante A cayó en
> variante B y Estudiante B cayó en variante C (sorteo aleatorio de
> `getOrAllocateVariant`, no controlable). Se creó C y luego D hasta lograr una
> coincidencia: **C y D cayeron ambos en variante A** y son el par usado en
> TC-035-001, TC-035-002, TC-035-003, TC-035-006 (comparaciones entre dos
> estudiantes de la misma variante). A y B quedan con su intento `in_progress`
> huérfano — se eliminan igual en la limpieza final.

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab` vía túnel SSH — ver CLAUDE.md → "Base de datos"). **Nunca producción.**
**Fecha de la ronda:** 2026-08-01

> **Nota sobre el curso académico:** el entorno de desarrollo estaba recién
> reseteado (sin ningún `academic_course`) y no existe endpoint ni herramienta
> MCP para crear uno (`createCourseAction` es un Server Action del panel
> admin, atado a sesión). Se insertó vía SQL directo contra la instancia local
> de `mirp-lab`, con confirmación explícita del usuario — excepción puntual a
> la regla de no manipular la base directamente. Se elimina de la misma forma
> al cerrar la ronda.

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

   **Orden canónico real de esta ronda** (idéntico en las 3 variantes A/B/C):
   1. ¿Cuál es la complejidad temporal de insertar... (MC, 4 opciones, correcta: "O(1) amortizado")
   2. ¿Qué estructura de datos usa el principio LIFO...? (MC, 4 opciones, correcta: "Pila (Stack)")
   3. ¿Cuál es la complejidad temporal promedio de buscar... tabla hash? (MC, 4 opciones, correcta: "O(1) promedio")
   4. ¿Qué recorrido de un árbol binario visita primero la raíz...? (MC, 4 opciones, correcta: "Preorden")
   5. Explica la diferencia entre lista enlazada simple y doblemente enlazada (open_text, sin opciones)

---

## Casos de prueba

### TC-035-001 — Con `shuffle_choices`, dos estudiantes ven las opciones en orden distinto
**Criterio de aceptación:** 1
**Precondición:** G-BARAJA con `shuffle_choices: true`, `shuffle_questions: false`, publicado. Estudiantes C y D en la misma variante (A).
**Datos de prueba usados:** credenciales de C y D, grupo `d86ee011-8211-4c80-afda-09a46fa79519`
**Pasos:**
1. Iniciar sesión como estudiante C y abrir la evaluación.
2. Anotar, para la primera pregunta multiple_choice, el orden exacto de las opciones.
3. Cerrar sesión. Iniciar sesión como estudiante D y abrir la misma evaluación.
4. Anotar el orden de las opciones de esa misma pregunta.
**Resultado esperado:** los dos órdenes difieren. Ambos contienen exactamente las mismas opciones (ninguna repetida ni faltante).
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario: los órdenes difieren entre C y D. Sin observaciones adicionales.

### TC-035-002 — Con `shuffle_questions`, dos estudiantes ven las preguntas en orden distinto
**Criterio de aceptación:** 2
**Precondición:** G-BARAJA actualizado a `shuffle_questions: true` (y `shuffle_choices: true`) vía `assignment-mcp` → `update_assignment_group`, con C y D ya con intento abierto de antes (recargaron tras el cambio de flag).
**Pasos:**
1. Como estudiante C, recargar la evaluación y anotar el orden de los enunciados.
2. Como estudiante D, recargar la misma evaluación y anotar el orden.
**Resultado esperado:** los órdenes difieren. Ambos incluyen todas las preguntas de la variante, sin repetidas ni faltantes, y la numeración mostrada es correlativa (1, 2, 3…) en los dos casos.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario: los órdenes de las preguntas difieren entre C y D. Sin observaciones adicionales.

### TC-035-003 — El orden es estable durante todo el intento
**Criterio de aceptación:** 3
**Precondición:** G-BARAJA con ambos flags en `true`. Estudiante C con intento en curso.
**Pasos:**
1. Como estudiante C, abrir la evaluación y anotar el orden de preguntas y el de opciones de la primera.
2. Responder dos preguntas y esperar a ver "✓ Guardado".
3. Recargar la página (F5). Comparar ambos órdenes.
4. Navegar a otra ruta (p. ej. `/cuenta/cursos`) y volver a la evaluación. Comparar.
5. Cerrar sesión, volver a iniciar sesión y reabrir la evaluación (recupera el `in_progress`). Comparar.
**Resultado esperado:** el orden de preguntas y de opciones es idéntico en los cuatro momentos. Las respuestas ya dadas siguen marcadas en las preguntas correctas.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario, sin observaciones adicionales.

### TC-035-004 — Resultados coincide con lo que se vio en el jugador
**Criterio de aceptación:** 4
**Precondición:** viene de TC-035-003, con el orden anotado. `show_feedback_on: "submit"`. Estudiante C.
**Pasos:**
1. Terminar de responder y enviar la evaluación.
2. En la página de resultados, comparar el orden de las preguntas y el de las opciones dentro de cada una contra lo anotado en TC-035-003.
**Resultado esperado:** coinciden exactamente. Cada respuesta marcada corresponde a la que el estudiante eligió, y la retroalimentación señala la opción correcta en la posición en que la ve.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario, sin observaciones adicionales. Estudiante C tiene ahora un intento `submitted`/`graded` (attempt_number 1) — el criterio 3 quedó cubierto sobre el intento 1; el reintento (attempt_number 2, `max_attempts: 2`) puede aprovecharse para TC-035-006/007 si hace falta un segundo intento en pruebas posteriores.

### TC-035-005 — Sin flags activos, el orden es el canónico (no regresión)
**Criterio de aceptación:** 5
**Precondición:** G-BARAJA actualizado a `shuffle_questions: false`, `shuffle_choices: false` vía `update_assignment_group`. Estudiante A (variante B, sin respuestas dadas).
**Pasos:**
1. Como estudiante A, abrir la evaluación.
2. Comparar el orden de preguntas y opciones contra el orden canónico.
**Resultado esperado:** coinciden exactamente. Ninguna diferencia respecto al comportamiento anterior al spec.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario: el orden coincide exactamente con el canónico. Sin observaciones.

### TC-035-006 — Los dos flags actúan de forma independiente
**Criterio de aceptación:** 6
**Precondición:** flags alternados con `assignment-mcp` → `update_assignment_group` entre pasos, verificadas las 4 combinaciones a lo largo de la ronda (no en un único caso aislado):
1. `shuffle_choices: true`, `shuffle_questions: false` → cubierto en TC-035-001 (Estudiantes C/D): opciones barajadas, preguntas canónicas.
2. Ambos `true` → cubierto en TC-035-002/003/004 (Estudiante C): las dos cosas barajadas.
3. Ambos `false` → cubierto en TC-035-005 (Estudiante A): todo canónico.
4. `shuffle_questions: true`, `shuffle_choices: false` → verificado acá (Estudiante B): preguntas barajadas, opciones canónicas.
**Resultado esperado:** cada combinación produce exactamente lo descrito, sin efectos cruzados.
**Estado:** ✅ Aprobado
**Hallazgos:** Las 4 combinaciones confirmadas por el usuario a lo largo de la ronda, sin efectos cruzados entre flags. El reordenamiento de la vista de un estudiante al cambiar los flags a mitad de la ronda (esperado, ver nota original) no presentó ningún comportamiento distinto a un reordenamiento limpio — consistente con **[[DEBT-035]]**, ya registrada en el backlog como refinamiento futuro.

### TC-035-007 — La calificación es correcta con el orden barajado
**Criterio de aceptación:** 7
**Precondición:** G-BARAJA con ambos flags en `true`, Estudiante D sin intentos previos (variante A).
**Datos de prueba usados:** submission `f0e05623-7c7b-44d8-a8ae-7c2cee85dda7`
**Pasos:**
1. Abrir la evaluación y responder **a propósito**: en unas preguntas la opción correcta, en otras una incorrecta. Anotar cuáles.
2. Enviar y revisar el puntaje en la página de resultados.
**Resultado esperado:** el puntaje refleja exactamente los aciertos y errores anotados. Cada respuesta quedó asociada a su pregunta (ninguna corrida de posición).
**Estado:** ✅ Aprobado
**Hallazgos:** Patrón real de respuesta distinto al planeado (3 correctas / 1 incorrecta de las 4 MC, en vez de 2/2 — error del usuario al marcar, no del sistema). Verificado por API: `auto_score: 3.00`, matemáticamente consistente con 3 aciertos de 1 punto cada uno. Confirma que la calificación es correcta independientemente del orden barajado en pantalla — el cálculo se ata a `question_id`/conjuntos de `choice_id`, no a la posición mostrada.

### TC-035-008 — Preguntas sin opciones con barajado activo
**Criterio de aceptación:** 8
**Precondición:** Estudiante D, segundo intento (`max_attempts: 2`), ambos flags en `true`.
**Pasos:**
1. Abrir la evaluación como estudiante y localizar la pregunta abierta.
2. Escribir una respuesta, esperar el guardado y recargar la página.
**Resultado esperado:** la pregunta abierta se renderiza sin error, participa del barajado de preguntas (puede aparecer en cualquier posición) y su texto se conserva tras la recarga. Sin errores en la consola del navegador.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario: sin errores en consola, texto conservado tras recarga.

### TC-035-009 — La vista del docente conserva el orden canónico
**Criterio de aceptación:** 9
**Precondición:** envío de Estudiante D (`f0e05623-7c7b-44d8-a8ae-7c2cee85dda7`) hecho con ambos flags en `true` (TC-035-007).
**Pasos:**
1. Como docente (`dev@nodo.local`), abrir la ficha del grupo en el panel admin y anotar el orden de las preguntas de la variante.
2. Abrir la revisión del envío del estudiante y anotar el orden de las respuestas y el de las opciones dentro de cada una.
**Resultado esperado:** ambos coinciden con el orden canónico anotado en la preparación, no con el que vio el estudiante.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario: ficha del grupo y revisión del envío muestran orden canónico (1-5), pese a que Estudiante D vio un orden distinto al resolver.

### TC-035-010 — `order_index` no cambia en base de datos
**Criterio de aceptación:** 10
**Precondición:** orden canónico anotado en la preparación, antes de ejecutar ningún caso.
**Pasos:**
1. Tras completar los casos anteriores, volver a consultar `assignment-mcp` → `get_assignment_group`.
2. Comparar contra lo anotado en la preparación.
**Resultado esperado:** idéntico. El barajado no escribió nada: es solo de presentación.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado por Claude vía `assignment-mcp` → `get_assignment_group` (no requirió interacción del usuario): `order_index` 0-4 idéntico en las 3 variantes, sin cambios pese a toda la actividad de la ronda (múltiples aperturas, envíos, cambios de flags).

### TC-035-011 — No regresión del flujo de resolución y revisión
**Criterio de aceptación:** 11
**Precondición:** ninguna adicional.
**Pasos:**
1. Repasar los casos principales de `test-019` (resolución: autoguardado, contador de tiempo, confirmación de envío, límite de intentos) y de `test-020` (revisión: calificar respuesta abierta, finalizar calificación, propagación a la libreta) sobre G-BARAJA.
**Resultado esperado:** todo se comporta como en aquellas rondas. El barajado no altera ningún otro aspecto del flujo.
**Estado:** ✅ Aprobado
**Hallazgos:** Cubierto a lo largo de la ronda: autoguardado (TC-035-003), confirmación de envío (TC-035-004/007/008), segundo intento vía `max_attempts: 2` (TC-035-008), calificación manual de la pregunta abierta y finalización de calificación (verificado explícitamente acá). Sin `time_limit_minutes` configurado en G-BARAJA, así que el contador de tiempo no se ejercitó — no forma parte del alcance de spec-035 (no toca esa lógica) y no se considera un hueco de esta ronda.

### TC-035-012 — La autoevaluación de cierre sigue intacta tras mover el helper
**Criterio de aceptación:** 12
**Precondición:** el entorno de desarrollo no tenía ninguna pregunta de autoevaluación con `lesson_slug` asignado (base recién reseteada). Se creó y publicó una pregunta puntual (`b5868bd5-59a6-4192-a51f-7e82d96a1334`) vinculada a la lección `estructuras-de-datos/encapsulamiento`.
**Pasos:**
1. Como estudiante (A), abrir la lección `estructuras-de-datos/encapsulamiento` y anotar el orden de las opciones.
2. Recargar y verificar que el orden se mantiene.
3. Responder, enviar y usar "Reintentar".
**Resultado esperado:** todo se comporta como tras spec-034: orden estable por estudiante, resumen del intento previo y "Reintentar" funcionando.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario. El movimiento de `seededShuffle` de `lib/self-assessment/shuffle.ts` a `lib/shuffle.ts` no alteró el comportamiento de la autoevaluación.

### TC-035-013 — El panel admin advierte la consecuencia de barajar preguntas
**Criterio de aceptación:** 13
**Precondición:** acceso docente a la ficha del grupo.
**Pasos:**
1. Con `shuffle_questions: true`, abrir la ficha del grupo en el panel admin.
2. Observar el campo "Mezclar preguntas".
3. Cambiar a `shuffle_questions: false` y recargar la ficha.
4. Verificar en modo claro y en modo oscuro.
**Resultado esperado:** con el flag activo aparece una nota breve advirtiendo que cada estudiante ve las preguntas en un orden propio y que la numeración de esta ficha no coincide con la que ellos ven. Con el flag inactivo la nota no aparece. Legible en ambos modos y sin romper el layout de la grilla.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario: con el flag en `false` la ficha muestra "No" sin la nota; con el flag en `true` aparece la nota junto al "Sí". Legible en modo oscuro sin romper el layout.

---

## Resumen de la ronda

- Aprobados: 13 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno nuevo. **[[DEBT-035]]** ya se había registrado durante la implementación (no un hallazgo de esta ronda), y quedó confirmado en TC-035-006 (el reordenamiento al cambiar flags a mitad de ronda se comportó como se esperaba, sin sorpresas).
- Nota de proceso: en TC-035-007 el usuario marcó 3 respuestas correctas en vez de las 2 planeadas al seguir la guía — no es un hallazgo del sistema, la calificación (`auto_score: 3.00`) fue matemáticamente consistente con lo realmente respondido, verificado por API.
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
