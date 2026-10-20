# test-060 — Nota de autoevaluaciones calculada sobre las lecciones dictadas por el docente

> Spec: `docs/specs/spec-060-autoevaluacion-por-lecciones-dictadas.md`.
> Casos manuales de flujos con UI (`TC-060-NN`) y de las herramientas MCP
> nuevas o modificadas (`TC-MCP-060-NN`). Los casos de RPC/SQL (A1–A13) están
> en el spec, sección "Pruebas asociadas".

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.
> Base: `npm run seed:teacher && npm run seed:dev` sobre `nodo-dev`.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente de desarrollo (dueño de los grupos) | ya existe — `npm run seed:teacher` | `dev@nodo.local` / `TEACHER_PASSWORD` de `.env.local` | N/A (cuenta base) |
| Curso del catálogo usado en la ronda | contenido versionado en git | `estructuras-de-datos` | N/A |
| Lección **L1** | contenido existente | `fundamentos-control-de-versiones` | N/A |
| Lección **L2** | contenido existente | `github-flujo-de-trabajo-con-ramas` | N/A |
| Lección **L3** | contenido existente | `sintaxis-de-java` | N/A |
| Lección **L4** (la "no marcada" de TC-060-02 / TC-060-06) | contenido existente | `repaso-de-clases-y-objetos` | N/A |
| Guía **G1** (no debe aparecer ni poder marcarse) | contenido existente | `ejercicios-sintaxis-de-java` (`kind: "guide"`) | N/A |
| Grupo **A** | ya existe — `npm run seed:dev` | curso `DEV — Estructuras de Datos`, código `DEVEDD2026`, `{{academic_course_id_A}}` | N/A (dato base) |
| Grupo **B** (mismo `course_slug`, mismo docente) | **UI** `/admin/courses/new` (spec-036) como `dev@nodo.local`: nombre `Test-060 Grupo B`, código `T060-B`, `course_slug = estructuras-de-datos`, código de matrícula `T060B2026`. No existe endpoint de API para crear cursos académicos; si el usuario prefiere no usar la UI, inserción vía `service_role` **solo con su autorización explícita** | `{{academic_course_id_B}}` | ⬜ |
| Grupo **C** sin `course_slug` (estado vacío de TC-060-13) | UI `/admin/courses/new`, sin contenido asociado, código de matrícula `T060C2026` | `{{academic_course_id_C}}` | ⬜ |
| Estudiante **E1** | ya existe — `seed:dev`: `dev-estudiante1@nodo.local` / `DevStudent2026!` — activo en Grupo A | `{{student_id_E1}}`, matrícula `{{enrollment_E1_A}}` | N/A |
| Estudiante **E2** (en A **y** en B) | ya existe en A (`dev-estudiante2@nodo.local` / `DevStudent2026!`); `students-mcp` → `enroll_student` con `enrollment_code: T060B2026` | `{{student_id_E2}}`, matrículas `{{enrollment_E2_A}}`, `{{enrollment_E2_B}}` | ⬜ (desmatricular de B) |
| Estudiante **E4** (solo en B) | `students-mcp` → `create_student` (`test060-e4@nodo.local` / `Test060E4!`) + `enroll_student` (`T060B2026`) | `{{student_id_E4}}` | ⬜ |
| Preguntas `multiple_choice` publicadas: **5 por lección en L1, L2, L3 y L4 (20)** | `question-bank-mcp` → `create_question` + `publish_question` + `mount_question_in_lesson`. Antes, `list_lesson_questions` en L1–L4: si ya tienen preguntas montadas en `nodo-dev`, anotar el número real y ajustar los valores esperados | ver tabla "Preguntas creadas" | ⬜ |
| Marcas de `taught_lessons` | se crean y borran en los propios casos (UI / `courses-mcp`) | — | ⬜ (verificar 0 filas al final) |
| Docente secundario **D2** (solo TC-060-14, opcional) | Admin API vía `service_role` (no hay endpoint de alta de docentes, DEBT-076) — **requiere autorización explícita del usuario** | `{{teacher_id_D2}}` | ⬜ |

### Preguntas creadas

| Lección | IDs | Respuesta correcta (para el guion de respuestas) |
|---|---|---|
| L1 | `{{q_L1_1..5}}` | `{{...}}` |
| L2 | `{{q_L2_1..5}}` | `{{...}}` |
| L3 | `{{q_L3_1..5}}` | `{{...}}` |
| L4 | `{{q_L4_1..5}}` | `{{...}}` |

**Estado inicial común:** ninguna lección marcada en ningún grupo; L1–L4
abiertas (`courses-mcp` → `list_course_lessons` sin `is_disabled`); ningún
estudiante con intentos en L1–L4.

**Entorno de pruebas:** desarrollo — Supabase cloud `nodo-dev`, `npm run dev`
en el puerto **3002**, `courses-mcp` / `students-mcp` / `question-bank-mcp` en
su variante **local**. Ningún caso se ejecuta contra producción.
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-060-01 — La pestaña "Contenido" lista las lecciones del grupo
**Precondición:** estado inicial común.
**Datos de prueba usados:** `dev@nodo.local`, Grupo A.
**Pasos:**
1. Entrar a `/admin/courses/{{academic_course_id_A}}`.
2. Pulsar la pestaña **Contenido**.
**Resultado esperado:** la pestaña existe y queda activa. La tabla lista las
lecciones de `estructuras-de-datos` en orden, **sin** guías (G1 no aparece).
L1–L4 muestran "Abierta" y "5 preguntas"; las lecciones sin preguntas,
"Sin autoevaluación". Ningún interruptor "Vista en clase" activo. Cabecera:
"0 lecciones marcadas · 0 cuentan para la nota". Se ve bien en modo claro y
oscuro.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-02 — Abrir una lección como estudiante no cambia la nota
**Precondición:** E1 responde L1 con **5/5** (cualquier lección, sin marcar);
nota previa de E1 en Grupo A registrada (esperado: "Sin nota").
**Datos de prueba usados:** `dev-estudiante1@nodo.local`.
**Pasos:**
1. Como E1, abrir L4 sin responder su autoevaluación.
2. Ir a `/cuenta/cursos/{{enrollment_E1_A}}`.
3. Como docente, abrir la libreta del Grupo A.
**Resultado esperado:** la nota de autoevaluaciones de E1 sigue en
"Sin nota" (ninguna lección marcada); abrir L4 no la mueve. La tarjeta del
estudiante muestra el estado vacío "Tu docente aún no ha marcado lecciones
como vistas en clase…". Responder L1 tampoco creó nota (L1 no está marcada).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-03 — Marcar lecciones recalcula el grupo
**Precondición:** TC-060-02 completado (E1 respondió L1 con 5/5; E2 sin
intentos).
**Pasos:**
1. Como docente, en Contenido del Grupo A, activar "Vista en clase" en L1, L2
   y L3, una a una.
2. Tras cada cambio, observar el aviso.
3. Abrir la libreta del Grupo A.
**Resultado esperado:** cada cambio muestra "Se recalcularon las notas de N
estudiantes" (N = matrículas activas de A) y "Marcada el <fecha>" bajo el
interruptor. Cabecera: "3 lecciones marcadas · 3 cuentan para la nota". En la
libreta: E1 = **1.67** (`5/15 × 5`), E2 = **0.00** (`0/15`) — 0.00 aquí es
correcto: hay preguntas evaluables y no respondió ninguna. Sin pulsar
"Recalcular autoevaluaciones".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-04 — La tarjeta del estudiante muestra solo lecciones dictadas
**Precondición:** TC-060-03.
**Datos de prueba usados:** `dev-estudiante1@nodo.local`.
**Pasos:**
1. Como E1, abrir `/cuenta/cursos/{{enrollment_E1_A}}`.
2. Revisar la tarjeta "Autoevaluaciones".
**Resultado esperado:** nota 1.67, acumulado `5/15`. Desglose con L1
"Respondida 5/5", L2 y L3 "Sin responder — 0/5" con enlace "Responder". L4
**no** aparece aunque E1 la abrió. Texto de la regla: "Cuentan las lecciones
que tu docente ya marcó como vistas en clase… todavía puedes responderla y tu
nota se actualizará."
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-05 — Responder una lección marcada sube la nota sin acción del docente
**Precondición:** TC-060-04.
**Pasos:**
1. Como E1, pulsar "Responder" en L2 y enviar la autoevaluación con **4/5**.
2. Volver a `/cuenta/cursos/{{enrollment_E1_A}}`.
**Resultado esperado:** nota **3.00** (`9/15 × 5`), L2 "Respondida 4/5". La
libreta del docente muestra el mismo 3.00.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-06 — Lección respondida pero no marcada no cuenta hasta marcarla
**Precondición:** TC-060-05.
**Pasos:**
1. Como E1, responder L4 (no marcada) con **5/5**.
2. Revisar la tarjeta: nota sin cambios (3.00).
3. Como docente, marcar L4 en Contenido del Grupo A.
4. Revisar de nuevo la tarjeta de E1 y la libreta.
**Resultado esperado:** tras el paso 1 la nota sigue en 3.00 y L4 no aparece.
Tras el paso 3: nota **3.50** (`14/20 × 5`), L4 "Respondida 5/5"; E2 = 0.00
(`0/20`).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-07 — Desmarcar pide confirmación y baja el denominador
**Precondición:** TC-060-06 (L1–L4 marcadas en A).
**Pasos:**
1. Como docente, desactivar "Vista en clase" en L3.
2. En la confirmación inline, pulsar **Cancelar**.
3. Repetir y **confirmar**.
4. Revisar la libreta y la tarjeta de E1.
**Resultado esperado:** la confirmación avisa que deja de contar para los N
estudiantes del grupo; cancelar deja el interruptor activo y la nota intacta.
Al confirmar: E1 = **4.67** (`14/15 × 5`), L3 desaparece de su desglose.
Cabecera "3 lecciones marcadas".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-08 — Desmarcar todas deja la nota en "Sin nota"
**Precondición:** TC-060-07.
**Pasos:**
1. Desmarcar L1, L2 y L4 en el Grupo A (confirmando cada una).
2. Revisar la libreta y la tarjeta de E1 y E2.
**Resultado esperado:** la columna "Autoevaluaciones" sigue en la libreta pero
E1 y E2 muestran "sin nota" (no 4.67 ni 0.00). La tarjeta de E1 muestra el
estado vacío. Los intentos de E1 no se pierden: volver a marcar L1, L2, L4
reproduce 3.50 → **dejar L1–L4 marcadas de nuevo** para los casos siguientes
(E1 = 3.50).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-09 — Lección marcada y cerrada: advertencia y no cuenta
**Precondición:** TC-060-08 (L1–L4 marcadas en A, E1 = 3.50).
**Pasos:**
1. Cerrar L4 con `courses-mcp` → `set_lesson_availability { enabled: false }`.
2. Como docente, recargar Contenido del Grupo A.
3. Revisar la tarjeta de E1.
4. Reabrir L4 (`enabled: true`) y revisar de nuevo.
**Resultado esperado:** L4 muestra "Cerrada" con la advertencia "Esta lección
está cerrada a los estudiantes: no cuenta para la nota hasta que la abras";
el interruptor sigue activo; cabecera "4 marcadas · 3 cuentan". E1 = **3.00**
(`9/15`), L4 fuera del desglose. Tras reabrir: E1 = 3.50 sin pulsar
"Recalcular".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-10 — Aislamiento entre grupos del mismo curso
**Precondición:** Grupo B creado; E2 en A y B; E4 solo en B; L1–L4 marcadas
en A, ninguna en B.
**Pasos:**
1. Como docente, abrir Contenido del Grupo B.
2. Abrir la libreta del Grupo B.
3. Marcar L1 en el Grupo B.
4. Revisar las libretas de A y B.
**Resultado esperado:** en B ninguna lección aparece marcada (las marcas de A
no se ven). Antes del paso 3, E2 y E4 en B: "sin nota". Tras marcar L1 en B:
E2 y E4 en B = 0.00 (`0/5`); las notas del Grupo A **no cambian** (E1 = 3.50,
E2 = 0.00 sobre 20).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-11 — Mismo estudiante, dos grupos, notas distintas
**Precondición:** TC-060-10.
**Datos de prueba usados:** `dev-estudiante2@nodo.local`.
**Pasos:**
1. Como E2, responder L1 con **5/5**.
2. Abrir `/cuenta/cursos/{{enrollment_E2_A}}` y `/cuenta/cursos/{{enrollment_E2_B}}`.
3. Abrir "Mis notas" (spec-056).
**Resultado esperado:** Grupo A: **1.25** (`5/20`), desglose con L1–L4. Grupo
B: **5.00** (`5/5`), desglose solo con L1. "Mis notas" muestra cada nota en
su curso, sin cruzarlas.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-12 — Marcas huérfanas al cambiar el `course_slug` del grupo
**Precondición:** TC-060-11 (L1 marcada en B).
**Pasos:**
1. Como docente, editar el Grupo B (`/admin/courses/{{academic_course_id_B}}/edit`)
   y cambiar su contenido asociado a `analisis-de-algoritmos`.
2. Abrir Contenido del Grupo B.
3. En "Marcas sin lección en el catálogo", pulsar **Desmarcar** en
   `fundamentos-control-de-versiones` y confirmar.
4. Volver a asociar el Grupo B a `estructuras-de-datos`.
**Resultado esperado:** en el paso 2 la tabla lista el catálogo de
`analisis-de-algoritmos` sin marcas y aparece la sección de advertencia con el
slug huérfano. Tras desmarcar, la sección desaparece. Tras el paso 4, L1 ya no
figura marcada en B.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-13 — Grupo sin contenido asociado y texto de ayuda de la libreta
**Precondición:** Grupo C sin `course_slug`.
**Pasos:**
1. Abrir Contenido del Grupo C.
2. Abrir la libreta del Grupo A y leer la ayuda de "Recalcular
   autoevaluaciones"; expandir el desglose de E1.
**Resultado esperado:** Grupo C muestra "Este curso no tiene contenido
asociado" con enlace a editarlo, sin tabla. La ayuda de la libreta habla de
"lecciones marcadas como vistas en clase" (no "que ya vio"). El desglose del
docente para E1 coincide con la tarjeta del estudiante.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-060-14 — Un docente no dueño no puede marcar (opcional)
**Precondición:** D2 creado con autorización del usuario; no es dueño de A.
**Datos de prueba usados:** `{{credenciales_D2}}`.
**Pasos:**
1. Como D2, navegar a `/admin/courses/{{academic_course_id_A}}/contenido`.
**Resultado esperado:** no ve el grupo (404 / sin acceso) o, si la página
carga, cualquier intento de marcar falla con un mensaje de permiso y ninguna
nota del Grupo A cambia.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-01 — `list_course_groups`
**Herramienta probada:** `list_course_groups` en `courses-mcp`
**Precondición:** Grupos A y B existen.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos" }`; luego
`{ "course_slug": "no-existe" }`.
**Output esperado:** A y B con `academic_course_id`, `name`, `code`,
`is_active` y `active_student_count` (A = matrículas activas sembradas, B = 2).
El slug inexistente → `404`. El Grupo C (sin slug) no aparece.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-02 — `list_taught_lessons`
**Herramienta probada:** `list_taught_lessons` en `courses-mcp`
**Precondición:** L1–L4 marcadas en A.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos", "academic_course_id": "{{A}}" }`;
luego con `course_slug: "analisis-de-algoritmos"` y el mismo id.
**Output esperado:** solo lecciones `kind: "lesson"` (G1 no está); L1–L4 con
`is_taught: true`, `taught_at`, `question_count: 5`, `counts_for_grade: true`;
`meta.taught_count: 4`, `meta.counted_count: 4`, `orphan_taught_slugs: []`.
Con el `course_slug` que no corresponde al grupo → `404`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-03 — `set_lesson_taught` marca y recalcula
**Herramienta probada:** `set_lesson_taught` en `courses-mcp`
**Precondición:** L2 no marcada en B.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos", "academic_course_id": "{{B}}", "lesson_slug": "github-flujo-de-trabajo-con-ramas", "taught": true }`
**Output esperado:** lección con `is_taught: true`; `meta.changed: true`,
`meta.recalculated_count: 2`. En la UI, la libreta de B refleja el nuevo
denominador.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-04 — `set_lesson_taught` es idempotente y reversible
**Herramienta probada:** `set_lesson_taught` en `courses-mcp`
**Input de prueba:** repetir el input de TC-MCP-060-03; luego con
`"taught": false`.
**Output esperado:** primera repetición `meta.changed: false`, `taught_at`
igual al anterior, `recalculated_count: 0`. Con `false`: `changed: true`,
`is_taught: false`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-05 — `set_lesson_taught` rechaza entradas inválidas
**Herramienta probada:** `set_lesson_taught` en `courses-mcp`
**Input de prueba:** (a) `lesson_slug: "ejercicios-sintaxis-de-java"` (guía);
(b) `lesson_slug: "no-existe"` con `taught: true`; (c) sin `taught`;
(d) `academic_course_id` del Grupo C con `course_slug: "estructuras-de-datos"`.
**Output esperado:** (a) `422`; (b) `404`; (c) `422`; (d) `404`. Ningún caso
crea filas (`list_taught_lessons` sin cambios).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-06 — Lección cerrada: `warning` y recálculo al abrir/cerrar
**Herramientas probadas:** `set_lesson_availability` y `set_lesson_taught` en `courses-mcp`
**Precondición:** L3 marcada en A, abierta.
**Input de prueba:** `set_lesson_availability { course_slug: "estructuras-de-datos", lesson_slug: "sintaxis-de-java", enabled: false }`;
luego `set_lesson_taught` sobre L3 en B con `taught: true`; finalmente reabrir L3.
**Output esperado:** el cierre devuelve `meta.recalculated_groups` ≥ 1 y la
nota de A baja (L3 fuera); el marcado en B devuelve
`meta.warning: "lesson_disabled"` y `counts_for_grade: false`; al reabrir,
las notas de A y B incluyen L3 sin recálculo manual.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-060-07 — `get_student_self_assessment_summary` por grupo
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** E2 en A y B con notas distintas (TC-060-11).
**Input de prueba:** (a) `{ student_id: "{{E2}}", academic_course_id: "{{A}}" }`;
(b) ídem con `{{B}}`; (c) `{ student_id: "{{E2}}", course_slug: "estructuras-de-datos" }`;
(d) `{ student_id: "{{E1}}", course_slug: "estructuras-de-datos" }`.
**Output esperado:** (a) y (b) devuelven notas y desgloses distintos, solo
con lecciones dictadas del grupo; (c) `409` con la lista de los dos grupos;
(d) se resuelve al Grupo A (única matrícula activa) y devuelve su resumen.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: 0 — Fallidos: 0 — Pendientes: 21
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente — orden inverso: marcas de
  `taught_lessons` (desmarcar vía `courses-mcp`), preguntas de L1–L4
  (desmontar + eliminar vía `question-bank-mcp`), E4 (`delete_student`), E2
  de B (`unenroll_student`), Grupos B y C (UI de eliminar curso, spec-036),
  D2 si se creó. Intentos de autoevaluación de E1/E2: no hay endpoint para
  borrarlos (intento único, spec-040) — reportar los IDs al usuario en vez de
  borrarlos en base de datos.
