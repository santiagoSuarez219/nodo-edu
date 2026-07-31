# test-034 — Autoevaluación de cierre: barajado de opciones por estudiante

Casos manuales de `spec-034-autoevaluacion-barajado-opciones.md`.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint / herramienta de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico de prueba | ⚠️ `INSERT` directo en `academic_courses` de dev (ver nota) | `{{id}}` / código `{{code}}` | ⬜ |
| Estudiante A | `students-mcp` → `create_student` | `{{id}}` / `{{email}}` / `{{password}}` | ⬜ |
| Estudiante B | `students-mcp` → `create_student` | `{{id}}` / `{{email}}` / `{{password}}` | ⬜ |
| Estudiante C | `students-mcp` → `create_student` | `{{id}}` / `{{email}}` / `{{password}}` | ⬜ |
| Pregunta con 5 opciones | `question-bank-mcp` → `create_question` + `publish_question` | `{{id}}` | ⬜ |
| Pregunta con 4 opciones | `question-bank-mcp` → `create_question` + `publish_question` | `{{id}}` | ⬜ |
| Pregunta con 4 opciones (2 correctas) | `question-bank-mcp` → `create_question` + `publish_question` | `{{id}}` | ⬜ |

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab`, ver CLAUDE.md → "Base de datos")
**Fecha de la ronda:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-034-002 — La correcta ya no está siempre primera
**Precondición:** `TC-034-001` ejecutado, con las tres secuencias anotadas.
**Datos de prueba usados:** las secuencias del caso anterior.
**Pasos:**
1. Revisar, en las tres secuencias anotadas, en qué posición quedó la opción
   correcta (todas las preguntas se crearon con la correcta en `order_index = 0`).
**Resultado esperado:** la opción correcta **no** aparece en primera posición
para los tres estudiantes. Al menos uno la ve en otra posición.
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda

- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 7
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
