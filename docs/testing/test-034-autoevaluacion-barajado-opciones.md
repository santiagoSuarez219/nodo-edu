# test-034 — Autoevaluación de cierre: barajado de opciones por estudiante

Casos manuales de `spec-034-autoevaluacion-barajado-opciones.md`.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint / herramienta de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico de prueba | ⚠️ `INSERT` directo en `academic_courses` de dev (ver nota) | `214f3ab1-ac80-4afc-8b90-720caed5c52d` (código `SPEC034TEST`) | ✅ |
| Estudiante A | `students-mcp` → `create_student` (`enrollment_code: SPEC034TEST`) | `77a115b3-18a4-4ab7-9c61-49f1e7b100d0` / `spec034-a@nodo-test.local` / `Spec034Test!` | ✅ |
| Estudiante B | `students-mcp` → `create_student` (`enrollment_code: SPEC034TEST`) | `2de7997e-9ca3-482c-a72c-f0a8fbd031cf` / `spec034-b@nodo-test.local` / `Spec034Test!` | ✅ |
| Estudiante C | `students-mcp` → `create_student` (`enrollment_code: SPEC034TEST`) | `7a9cd948-eb6b-4870-9b23-c28ca372fc0f` / `spec034-c@nodo-test.local` / `Spec034Test!` | ✅ |
| Pregunta con 5 opciones | `question-bank-mcp` → `create_question` + `publish_question` | `20c3eddb-b48a-4c6e-8f25-eb1b9346c267` — `github-flujo-de-trabajo-con-ramas` | ✅ |
| Pregunta con 4 opciones | `question-bank-mcp` → `create_question` + `publish_question` | `8aaea503-e12a-429c-b776-8d0d0f3b0573` — `github-flujo-de-trabajo-con-ramas` | ✅ |
| Pregunta con 4 opciones (2 correctas) | `question-bank-mcp` → `create_question` + `publish_question` | `258e64a7-4c17-4e78-a87a-da688b26fa83` — `github-flujo-de-trabajo-con-ramas` | ✅ |

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab`, ver CLAUDE.md → "Base de datos")
**Fecha de la ronda:** 2026-07-31

> ⚠️ **Desviación del protocolo:** igual que en `test-033`, crear el curso
> académico no tiene API ni MCP — solo Server Action del formulario admin. El
> usuario autorizó explícitamente el `INSERT`/`DELETE` directo en la base de
> **desarrollo** para esta ronda. No se tocó producción.

> ⚠️ **Tres estudiantes, no dos.** Con 2 estudiantes y pocas opciones, que
> coincidan en el mismo orden por azar es perfectamente posible y haría fallar
> `TC-034-001` sin que haya bug. Con 3 estudiantes y preguntas de 4-5 opciones,
> que los tres coincidan es muy improbable. **Criterio: el caso pasa si al menos
> dos de los tres ven órdenes distintos.**

> ⚠️ Las preguntas deben crearse con la opción correcta en **primera posición**
> (`order_index = 0`) a propósito: así se reproduce el patrón que originó
> **[[DEBT-029]]** y se comprueba que el barajado lo neutraliza.

> ⚠️ Crear el curso académico no tiene API ni MCP (solo Server Action desde el
> formulario admin). Igual que en `test-033`, requiere autorización explícita del
> usuario para el `INSERT` directo en **desarrollo**. Nunca en producción.

## Casos de prueba

### TC-034-001 — Estudiantes distintos ven órdenes distintos
**Precondición:** Estudiantes A, B y C matriculados, ninguno con intento previo.
**Datos de prueba usados:** credenciales de A, B y C.
**Pasos:**
1. Iniciar sesión como Estudiante A, ir a la lección y anotar el orden de las
   opciones de la pregunta de 5 opciones (transcribir las 5, de arriba a abajo).
2. Cerrar sesión. Repetir como Estudiante B.
3. Cerrar sesión. Repetir como Estudiante C.
4. Comparar las tres secuencias.
**Resultado esperado:** al menos dos de los tres estudiantes ven las opciones en
orden distinto. **No** deben verse las 5 opciones en el mismo orden en los tres.
**Estado:** ✅ Aprobado
**Hallazgos:** los tres estudiantes vieron órdenes distintos entre sí (mejor que el mínimo exigido de "al menos dos").

---

### TC-034-002 — La correcta ya no está siempre primera
**Precondición:** `TC-034-001` ejecutado, con las tres secuencias anotadas.
**Datos de prueba usados:** las secuencias del caso anterior.
**Pasos:**
1. Revisar, en las tres secuencias anotadas, en qué posición quedó la opción
   correcta (todas las preguntas se crearon con la correcta en `order_index = 0`).
**Resultado esperado:** la opción correcta **no** aparece en primera posición
para los tres estudiantes. Al menos uno la ve en otra posición.
**Estado:** ✅ Aprobado
**Hallazgos:** "git status" no quedó en primera posición para los tres — confirma que ya no se puede aprobar eligiendo siempre la primera opción.

> Este es el caso que verifica el propósito de fondo del spec: que ya no se pueda
> aprobar eligiendo siempre la primera opción.

---

### TC-034-003 — El orden es estable tras recargar
**Precondición:** Estudiante A, con su secuencia anotada de `TC-034-001`, sin
haber enviado todavía.
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Recargar la página (F5 / Cmd+R) **tres veces seguidas**.
2. Tras cada recarga, comparar el orden con la secuencia anotada.
**Resultado esperado:** el orden es **idéntico** las tres veces y coincide con lo
anotado en `TC-034-001`. Las opciones no se reordenan al recargar.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones — orden idéntico en las 3 recargas.

---

### TC-034-004 — Las opciones no saltan al recibir el feedback
**Precondición:** Estudiante A, en la lección, sin intentos.
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Responder todas las preguntas.
2. Pulsar "Enviar respuestas" y observar **con atención** las opciones en el
   momento en que aparece el feedback.
**Resultado esperado:** las opciones mantienen exactamente la misma posición al
pasar al estado de feedback; ninguna salta de lugar. La opción correcta queda
resaltada en la posición donde estaba.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones — el orden se mantuvo estable tras `router.refresh()`, sin saltos visibles.

> Cubre el riesgo específico que motivó el barajado sembrado en vez de aleatorio:
> `router.refresh()` tras enviar vuelve a ejecutar la consulta en el servidor.

---

### TC-034-005 — El orden se mantiene tras "Reintentar"
**Precondición:** `TC-034-004` ejecutado (Estudiante A ya envió), página recargada
para llegar al resumen de spec-033.
**Datos de prueba usados:** credenciales de Estudiante A.
**Pasos:**
1. Pulsar "Reintentar".
2. Comparar el orden de las opciones con la secuencia anotada en `TC-034-001`.
**Resultado esperado:** el formulario de reintento muestra las opciones en el
mismo orden que vio siempre este estudiante.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

---

### TC-034-006 — La calificación es correcta pese al barajado
**Precondición:** Estudiante B, sin intentos.
**Datos de prueba usados:** credenciales de Estudiante B.
**Pasos:**
1. Responder **deliberadamente bien** la pregunta de 5 opciones (identificando la
   correcta por su texto, no por su posición).
2. Responder **deliberadamente mal** la pregunta de 4 opciones.
3. En la pregunta de 2 correctas, marcar ambas correctas.
4. Enviar y revisar el feedback de cada pregunta.
**Resultado esperado:** la primera se marca "Correcto", la segunda "Incorrecto"
con la correcta resaltada donde efectivamente está, y la tercera "Correcto". El
conteo final refleja 2/3.
**Estado:** ✅ Aprobado
**Hallazgos:** calificación correcta pese al barajado — confirma que la corrección compara por ID de opción, no por posición.

---

### TC-034-007 — La clave del docente mantiene orden canónico
**Precondición:** sesión del docente (`dev@nodo.local`), dueño del curso de prueba.
**Datos de prueba usados:** credenciales del docente de desarrollo.
**Pasos:**
1. Iniciar sesión como docente y navegar a la misma lección.
2. Abrir la clave de respuestas (vista docente, spec-031).
3. Comparar el orden de las opciones con el `order_index` con que se crearon
   (la correcta primera).
**Resultado esperado:** el docente ve las opciones en orden canónico
(`order_index`), con la correcta marcada. Su vista **no** está barajada — esto es
intencional y supersede el criterio de correspondencia de orden de spec-031.
**Estado:** ✅ Aprobado
**Hallazgos:** las 3 preguntas mostraron la correcta en primera posición para el docente — confirma que el `.order()` agregado en `getAnswerKeyForLesson()` (corrección del hallazgo Mayor de `@reviewer`) funciona como se esperaba.

## Resumen de la ronda

- Aprobados: 7 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno.
- Limpieza de datos de prueba: ✅ Completada — 3 estudiantes y 3 preguntas
  eliminados vía MCP (matrículas en cascada, verificado sin huérfanos antes
  del borrado del curso); curso académico eliminado con `DELETE` directo,
  misma excepción que su creación. `list_academic_courses`, `list_students` y
  `list_questions` (filtrado por tag `spec-034-qa`) confirmaron los tres en 0.
  Se detectó una fila preexistente en `lesson_progress` para
  `dev@nodo.local` / `github-flujo-de-trabajo-con-ramas` (probable vista de
  TC-034-007, `completed_at` nulo): no se tocó por no ser dato creado para
  esta ronda, pertenece a la cuenta persistente del docente de desarrollo.
