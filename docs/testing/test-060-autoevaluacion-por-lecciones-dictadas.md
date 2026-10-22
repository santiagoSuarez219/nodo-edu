# test-060 — Nota de autoevaluaciones calculada sobre las lecciones dictadas por el docente

> Spec: `docs/specs/spec-060-autoevaluacion-por-lecciones-dictadas.md`.
> El paso nuevo de `class-material-prep` (D16) no tiene caso propio: es
> documentación de la skill y usa las mismas herramientas que TC-MCP-060-03/08.
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
| Grupo **B** (mismo `course_slug`, mismo docente) | **UI** `/admin/courses/new` (spec-036) como `dev@nodo.local`: nombre `Test-060 Grupo B`, código `T060-B`, `course_slug = estructuras-de-datos`, código de matrícula `T60B2026`. No existe endpoint de API para crear cursos académicos; si el usuario prefiere no usar la UI, inserción vía `service_role` **solo con su autorización explícita** | `{{academic_course_id_B}}` | ✅ Creado por script con `service_role` y eliminado (2026-10-22) |
| Grupo **C** sin `course_slug` (estado vacío de TC-060-13) | UI `/admin/courses/new`, sin contenido asociado, código de matrícula `T60C2026` | `{{academic_course_id_C}}` | ✅ Creado por script con `service_role` y eliminado (2026-10-22) |
| Estudiante **E1** | ya existe — `seed:dev`: `dev-estudiante1@nodo.local` / `DevStudent2026!` — activo en Grupo A | `{{student_id_E1}}`, matrícula `{{enrollment_E1_A}}` | N/A |
| Estudiante **E2** (en A **y** en B) | ya existe en A (`dev-estudiante2@nodo.local` / `DevStudent2026!`); `students-mcp` → `enroll_student` con `enrollment_code: T60B2026` | `{{student_id_E2}}`, matrículas `{{enrollment_E2_A}}`, `{{enrollment_E2_B}}` | ✅ Matrícula en B eliminada (2026-10-22) |
| Estudiante **E4** (solo en B) | `students-mcp` → `create_student` (`test060-e4@nodo.local` / `Test060E4!`) + `enroll_student` (`T60B2026`) | `{{student_id_E4}}` | ✅ Eliminado (2026-10-22) |
| Preguntas `multiple_choice` publicadas: **5 por lección en L1, L2, L3 y L4 (20)** | `question-bank-mcp` → `create_question` + `publish_question` + `mount_question_in_lesson`. Antes, `list_lesson_questions` en L1–L4: si ya tienen preguntas montadas en `nodo-dev`, anotar el número real y ajustar los valores esperados | ver tabla "Preguntas creadas" | N/A (se usaron las preguntas existentes de `nodo-dev`; no se crearon) |
| Marcas de `taught_lessons` | se crean y borran en los propios casos (UI / `courses-mcp`) | — | ✅ 0 filas verificadas (2026-10-22) |
| Docente secundario **D2** (solo TC-060-14) | Admin API vía `service_role` (no hay endpoint de alta de docentes, DEBT-076), autorizado por el usuario 2026-10-22 | `ceefd873-d9a6-4a10-b077-45b9d403225e` — `docente2.test060@nodo.local` / `Test060Docente2!` | ✅ Eliminado con la Admin API (2026-10-22) |

### Preguntas creadas

| Lección | IDs | Respuesta correcta (para el guion de respuestas) |
|---|---|---|
| L1 | `{{q_L1_1..5}}` | `{{...}}` |
| L2 | `{{q_L2_1..5}}` | `{{...}}` |
| L3 | `{{q_L3_1..5}}` | `{{...}}` |
| L4 | `{{q_L4_1..5}}` | `{{...}}` |

### Recursos creados en la ronda del 2026-10-22

> Grupos B y C creados por inserción con `service_role` (script desechable), por autorización del usuario; destino verificado: `nodo-dev` (`amkghsjjrmfjjvxuzadm`).

| Recurso | Identificador | Eliminado |
|---|---|---|
| Grupo A (dato base) | `9f423f49-dbe5-4d73-89f8-9f27ac5fe068` | N/A |
| Grupo B `Test-060 Grupo B` (`T060-B`, matrícula `T60B2026` — se cambió desde `T060B2026`, que tiene 9 caracteres; `estructuras-de-datos`) | `34fd7612-5017-4afd-aed8-e445228f188f` | ✅ Eliminado (2026-10-22) |
| Grupo C `Test-060 Grupo C` (`T060-C`, `T060C2026`, sin slug) | `f27189d8-06ac-4756-9f6c-9a2a0c43b5f7` | ✅ Eliminado (2026-10-22) |
| E1 `dev-estudiante1@nodo.local` | `88db2cf9-792b-49eb-b5e0-2abf53ba465d` | N/A |
| E2 `dev-estudiante2@nodo.local` (en A) | `65c0a5b7-7723-4a2e-9fb3-dd6762095e6b` | N/A |
| Matrícula de E2 en B | `cfd1eceb-67f0-44c5-a7ef-8419476f4dab` | ✅ Eliminada con `service_role` (2026-10-22, por instrucción del usuario) |
| E4 `test060-e4@nodo.local` / `Test060E4!` (solo en B) | `4bb7edda-4b0e-4d41-821d-6c4ce10e3626`, matrícula `6c25534d-7612-4aa4-aac2-69261572628e` | ✅ Eliminado con `delete_student` (2026-10-22) |
| Marcas en A: #20, #23, #24 | `lista-doblemente-enlazada-y-lista-circular`, `fundamentos-de-archivos`, `lectura-escritura-y-modificacion` | ✅ Desmarcadas por `courses-mcp` (0 filas en `taught_lessons`) |

**Estado inicial común:** ninguna lección marcada en ningún grupo; L1–L4
abiertas (`courses-mcp` → `list_course_lessons` sin `is_disabled`); ningún
estudiante con intentos en L1–L4.

**Entorno de pruebas:** desarrollo — Supabase cloud `nodo-dev`, `npm run dev`
en el puerto **3002**, `courses-mcp` / `students-mcp` / `question-bank-mcp` en
su variante **local**. Ningún caso se ejecuta contra producción.
**Fecha de la ronda:** 2026-10-21 y 2026-10-22

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
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado 2026-10-21 en Chrome, `nodo-dev`. Pestaña activa, guías ausentes, cabecera "0 lecciones marcadas · 0 cuentan para la nota", interruptores apagados. El catálogo real de nodo-dev difiere de la precondición del test: solo las lecciones #20, #23 y #24 tienen preguntas (6, 6 y 5); el resto muestra "Sin autoevaluación". Solo se revisó el modo oscuro.


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
**Estado:** ✅ Aprobado
**Hallazgos:** Con E1 abrió la lección #20 sin responder: se creó `lesson_progress` y la nota siguió en 2.08 (sin recálculo).


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
**Estado:** ✅ Aprobado (adaptado)
**Hallazgos:** Marcadas #20, #23 y #24 una a una: aviso "Se recalcularon las notas de 2 estudiantes", "Marcada el 21 de oct de 2026", cabecera "3 marcadas · 3 cuentan". Libreta sin pulsar Recalcular: E2 = 0.00; E1 = 1.47 (5/17) tras sembrar un intento 5/6 en #23 vía service_role (no por UI).


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
**Estado:** ✅ Aprobado (adaptado)
**Hallazgos:** Tarjeta de E1: 2.08, 5/12, #20 "Sin responder — 0/6" con enlace Responder, #23 5/6, texto de la regla nuevo. Las lecciones no marcadas no aparecen.


### TC-060-05 — Responder una lección marcada sube la nota sin acción del docente
**Precondición:** TC-060-04.
**Pasos:**
1. Como E1, pulsar "Responder" en L2 y enviar la autoevaluación con **4/5**.
2. Volver a `/cuenta/cursos/{{enrollment_E1_A}}`.
**Resultado esperado:** nota **3.00** (`9/15 × 5`), L2 "Respondida 4/5". La
libreta del docente muestra el mismo 3.00.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22, navegador autorizado por el usuario, `nodo-dev`. Adaptado: E1 respondió #20 con 5/6 (una incorrecta a propósito). Antes 0/17; después **1.47** (5/17 × 5) en "Mis cursos" y en la tarjeta, sin acción del docente. #23 y #24 aparecen "Sin responder — 0/N" con enlace Responder. No se revisó la libreta del docente (sesión de docente no abierta en el navegador).


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
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22. Adaptado: #24 hace de L4; se desmarcó en A por `courses-mcp` (el marcado por UI ya está probado en TC-060-03). E1 respondió #24 con 5/5: la nota quedó en **2.08** (5/12) y #24 no aparece en la tarjeta (si contara sería 10/12 = 4.17). Tras marcarla por `courses-mcp`: **2.94** (10/17), #24 "5/5". No se revisó la libreta del docente ni se marcó desde la pestaña Contenido.

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
**Estado:** ✅ Aprobado (adaptado)
**Hallazgos:** Desmarcar #24: la confirmación avisa de los 2 estudiantes; Cancelar deja el interruptor activo; Confirmar → cabecera "2 marcadas", E1 = 2.08 (5/12).


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
**Estado:** ✅ Aprobado
**Hallazgos:** Con todas desmarcadas la libreta muestra "–" (sin nota) en E1 y E2, no 2.08 ni 0.00. Re-marcar restituyó 2.08.


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
**Estado:** ✅ Aprobado (adaptado)
**Hallazgos:** Cerrar #23 vía API de disponibilidad: Contenido muestra "Cerrada" + la advertencia; cabecera "2 marcadas · 1 cuentan"; E1 = 0.00 con #23 fuera. Reabrir: 2.08 sin pulsar Recalcular.


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
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: #20, #23, #24). Con A marcada (3) y B marcada (3), se desmarcaron #23 y #24 en B desde la pestaña Contenido, con confirmación inline ("deja de contar para la nota de los 2 estudiantes del grupo"): B pasó a "1 lección marcada · 1 cuenta". Libreta de B: E2 = 5.00, E4 = 0.00. Libreta de A sin cambios (E2 = 1.76, E1 = 2.94; acumulados 0.18 y 0.29 con peso 10 %). Las marcas de A no aparecen en B. Salvedad: B no partió sin marcas (ya tenía las del lote de TC-MCP-060-08).

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
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22, sesión de E2 en el navegador. Adaptado: en B solo #20 marcada; en A, #20, #23 y #24. E2 respondió #20 con 6/6. Grupo A: **1.76** (6/17), #20 "6/6", #23 y #24 "Sin responder". Grupo B: **5.00** (6/6), solo #20. "Mis notas" muestra cada nota en su curso sin cruzarlas. Un único intento cuenta en ambos grupos, como indica D2.

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
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: la marca huérfana es `lista-doblemente-enlazada-y-lista-circular`). Al asociar B a `analisis-de-algoritmos`, Contenido lista ese catálogo sin marcas y muestra "Marcas sin lección en el catálogo" con el slug y botón Desmarcar. Tras desmarcar, la sección desaparece. Al reasociar a `estructuras-de-datos`, #20 ya no figura marcada ("0 lecciones marcadas"). **Hallazgo:** el primer intento de guardar falló con "El código de matrícula debe tener 8 caracteres": el código de B del guion, `T060B2026`, tiene 9. Se cambió a `T60B2026` desde el propio formulario. El guion tiene el mismo error en el Grupo C (`T060C2026`).

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
**Estado:** ✅ Aprobado
**Hallazgos:** Grupo sin course_slug: "Este curso no tiene contenido asociado" con enlace Editar curso. Ayuda de la libreta actualizada ("lecciones marcadas como vistas en clase"); el desglose del docente de E1 (5/17, luego 5/12) coincide con la tarjeta.


### TC-060-14 — Un docente no dueño no puede marcar (opcional)
**Precondición:** D2 creado con autorización del usuario; no es dueño de A.
**Datos de prueba usados:** `{{credenciales_D2}}`.
**Pasos:**
1. Como D2, navegar a `/admin/courses/{{academic_course_id_A}}/contenido`.
**Resultado esperado:** no ve el grupo (404 / sin acceso) o, si la página
carga, cualquier intento de marcar falla con un mensaje de permiso y ninguna
nota del Grupo A cambia.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22. D2 (`docente2.test060@nodo.local`, rol `teacher` sin `admin`, creado con `service_role` por autorización del usuario) abrió `/admin/courses/{A}/contenido` y recibió **404** "This page could not be found". Las marcas de A no cambiaron (3). No se probó marcar por RPC con el JWT de D2 (casos A9/A10 del spec, por SQL).

### TC-MCP-060-01 — `list_course_groups`
**Herramienta probada:** `list_course_groups` en `courses-mcp`
**Precondición:** Grupos A y B existen.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos" }`; luego
`{ "course_slug": "no-existe" }`.
**Output esperado:** A y B con `academic_course_id`, `name`, `code`,
`is_active` y `active_student_count` (A = matrículas activas sembradas, B = 2).
El slug inexistente → `404`. El Grupo C (sin slug) no aparece.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22, `nodo-dev`. Con A y B creados, `list_course_groups` devuelve ambos con `active_student_count` 2 (B: E2 y E4); C (sin slug) no aparece. `no-existe` → `404`. Observación: el guion espera "A = matrículas sembradas"; en `nodo-dev` A tiene 2.

### TC-MCP-060-02 — `list_taught_lessons`
**Herramienta probada:** `list_taught_lessons` en `courses-mcp`
**Precondición:** L1–L4 marcadas en A.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos", "academic_course_id": "{{A}}" }`;
luego con `course_slug: "analisis-de-algoritmos"` y el mismo id.
**Output esperado:** solo lecciones `kind: "lesson"` (G1 no está); L1–L4 con
`is_taught: true`, `taught_at`, `question_count: 5`, `counts_for_grade: true`;
`meta.taught_count: 4`, `meta.counted_count: 4`, `orphan_taught_slugs: []`.
Con el `course_slug` que no corresponde al grupo → `404`.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: #20, #23 y #24 en lugar de L1–L4). Con las 3 marcadas en A: `taught_count 3`, `counted_count 3`, `orphan_taught_slugs []` (por HTTP). Sin marcas, las 3 salían `counts_for_grade: false`. Solo `kind: "lesson"` (sin guías). `course_slug` que no corresponde al grupo → `404`.

### TC-MCP-060-03 — `set_lessons_taught` con una sola lección marca y recalcula
**Herramienta probada:** `set_lessons_taught` en `courses-mcp`
**Precondición:** L2 no marcada en B.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos", "academic_course_id": "{{B}}", "lesson_slugs": ["github-flujo-de-trabajo-con-ramas"], "taught": true }`
**Output esperado:** `data.lessons` con L2 `is_taught: true`;
`meta.changed_slugs: ["github-flujo-de-trabajo-con-ramas"]`,
`unchanged_slugs: []`, `recalculated_count: 2`, `warnings: []`. En la UI, la
libreta de B refleja el nuevo denominador.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: #23 en B en lugar de L2). `changed_slugs [#23]`, `unchanged_slugs []`, `recalculated_count 2`, `warnings []`, `is_taught true`.

### TC-MCP-060-04 — `set_lessons_taught` es idempotente y reversible
**Herramienta probada:** `set_lessons_taught` en `courses-mcp`
**Input de prueba:** repetir el input de TC-MCP-060-03; luego el mismo con
`"taught": false`.
**Output esperado:** la repetición devuelve `changed_slugs: []`,
`unchanged_slugs: ["github-flujo-de-trabajo-con-ramas"]`, `taught_at` igual
al anterior y `recalculated_count: 0`. Con `false`: L2 en `changed_slugs`,
`is_taught: false`.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: #23 en B). Repetir → `changed_slugs []`, `unchanged_slugs [#23]`, `taught_at` idéntico, `recalculated_count 0`. Con `taught: false` → `changed_slugs [#23]`, `is_taught false`, `taught_at null`, `recalculated_count 2`.

### TC-MCP-060-05 — `set_lessons_taught` rechaza entradas inválidas
**Herramienta probada:** `set_lessons_taught` en `courses-mcp`
**Input de prueba:** (a) sin `taught`; (b) `lesson_slugs: []`;
(c) `lesson_slugs` con un slug repetido; (d) `academic_course_id` del Grupo C
con `course_slug: "estructuras-de-datos"`.
**Output esperado:** (a), (b) y (c) → `422`; (d) → `404`. Ningún caso crea
filas (`list_taught_lessons` sin cambios).
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22. (a) sin `taught` y (b) `lesson_slugs: []` → `422` (verificados por HTTP: el esquema del MCP los bloquea antes de enviar). (c) slug repetido → `422` "no admite duplicados". (d) `academic_course_id` del Grupo C con `estructuras-de-datos` → `404`. Clave incorrecta → `401`. Ningún caso dejó filas (A siguió con 3 marcadas).

### TC-MCP-060-06 — Lección cerrada: `warnings` y recálculo al abrir/cerrar
**Herramientas probadas:** `set_lesson_availability` y `set_lessons_taught` en `courses-mcp`
**Precondición:** L3 marcada en A, abierta; no marcada en B.
**Input de prueba:** `set_lesson_availability { course_slug: "estructuras-de-datos", lesson_slug: "sintaxis-de-java", enabled: false }`;
luego `set_lessons_taught` en B con `lesson_slugs: ["sintaxis-de-java"]`,
`taught: true`; finalmente reabrir L3.
**Output esperado:** el cierre devuelve `meta.recalculated_groups` ≥ 1 y la
nota de A baja (L3 fuera); el marcado en B devuelve
`meta.warnings: [{ lesson_slug: "sintaxis-de-java", code: "lesson_disabled" }]`
y `counts_for_grade: false`; al reabrir, las notas de A y B incluyen L3 sin
recálculo manual.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: #20 como L3). Cerrar #20 → `recalculated_groups 2` (A y B). Marcarla en B cerrada → `warnings [{lesson_slug, code: "lesson_disabled"}]`, `counts_for_grade false`. Mientras estuvo cerrada, E2 en B pasó a 6 preguntas y en A a 11 (la lección fuera de ambas). Reabrir → `recalculated_groups 2`; ambos grupos vuelven a 17 sin recalcular a mano.

### TC-MCP-060-07 — `get_student_self_assessment_summary` por grupo
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** E2 en A y B con notas distintas (TC-060-11).
**Input de prueba:** (a) `{ student_id: "{{E2}}", academic_course_id: "{{A}}" }`;
(b) ídem con `{{B}}`; (c) `{ student_id: "{{E2}}", course_slug: "estructuras-de-datos" }`;
(d) `{ student_id: "{{E1}}", course_slug: "estructuras-de-datos" }`.
**Output esperado:** (a) y (b) devuelven notas y desgloses distintos, solo
con lecciones dictadas del grupo; (c) `409` con la lista de los dos grupos;
(d) se resuelve al Grupo A (única matrícula activa) y devuelve su resumen.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22, por HTTP (el esquema cacheado de la herramienta en la sesión de Claude no ofrecía `academic_course_id`; el `dist/` sí). (a)/(b): E2 en A → **1.76** (6/17, #20 respondida, #23 y #24 sin responder); E2 en B → **5.00** (6/6, solo #20): notas y desgloses distintos. (c) `course_slug` con E2 en A y B → `409` con los dos grupos. (d) E1 con `course_slug` → se resuelve a A. Ambos parámetros o ninguno → `422`.

### TC-MCP-060-08 — Lote de varias lecciones: un solo recálculo y reporte de cambios
**Herramienta probada:** `set_lessons_taught` en `courses-mcp`
**Precondición:** en B, dejar marcada **solo** L1: los casos previos dejan L1
sin marcar (TC-060-12) y L3 marcada (TC-MCP-060-06), así que antes
desmarcar L3 y marcar L1 con `set_lessons_taught` y confirmar con
`list_taught_lessons`. Anotar la nota actual de E2 y E4 en B.
**Input de prueba:** `{ "course_slug": "estructuras-de-datos", "academic_course_id": "{{B}}", "lesson_slugs": ["fundamentos-control-de-versiones", "github-flujo-de-trabajo-con-ramas", "repaso-de-clases-y-objetos"], "taught": true }`
**Output esperado:** `changed_slugs` = L2 y L4; `unchanged_slugs` = L1;
`recalculated_count: 2` (las 2 matrículas activas de B, **una** pasada, no una
por lección). En la libreta de B el denominador pasa a 15 de una vez: E2 =
1.67 (`5/15`, si respondió L1 con 5/5 en TC-060-11), E4 = 0.00. En
Contenido de B, L1, L2 y L4 aparecen marcadas.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 (adaptado: lote de #20, #23, #24 en B). Con solo #20 marcada en B, el lote devolvió `changed_slugs [#23, #24]`, `unchanged_slugs [#20]`, `recalculated_count 2` (una pasada, 2 matrículas), `warnings []`. Libreta de B tras el lote: E2 = 1.76 (6/17), E4 = 0.00: el denominador pasó a 17 de una vez.

### TC-MCP-060-09 — Lote atómico: un slug inválido no marca ninguno
**Herramienta probada:** `set_lessons_taught` en `courses-mcp`
**Precondición:** en A, L1–L4 marcadas; elegir dos lecciones de
`estructuras-de-datos` sin marcar en A (`{{slug_X}}`, `{{slug_Y}}`, con
`list_taught_lessons`).
**Input de prueba:** (a) `lesson_slugs: ["{{slug_X}}", "no-existe", "{{slug_Y}}"]`, `taught: true`;
(b) `lesson_slugs: ["{{slug_X}}", "ejercicios-sintaxis-de-java"]`, `taught: true`.
**Output esperado:** (a) `422` con `error.details.invalid_slugs: [{ lesson_slug: "no-existe", reason: "not_found" }]`;
(b) `422` con `invalid_slugs: [{ lesson_slug: "ejercicios-sintaxis-de-java", reason: "is_guide" }]`.
En ambos, `list_taught_lessons` de A muestra `{{slug_X}}` y `{{slug_Y}}`
**sin marcar** y las notas de A no cambian.
**Estado:** ✅ Aprobado (adaptado; confirmado por el usuario 2026-10-22)
**Hallazgos:** 2026-10-22 en A. Decisión del usuario: el campo es `lesson_slug`. Se corrigió `findInvalidTaughtSlugs` (`lib/courses/service.ts`), el spec (D14) y el system prompt de courses-agent. Verificado por HTTP tras el cambio: (a) `[herencia, no-existe, polimorfismo]` → `422`, `invalid_slugs: [{lesson_slug: "no-existe", reason: "not_found"}]`; (b) `[herencia, ejercicios-sintaxis-de-java]` → `422`, `reason: "is_guide"`. En ambos A sigue con 3 marcadas (herencia y polimorfismo sin marcar). `tsc --noEmit` sin errores.

## Resumen de la ronda
- Aprobados: 23 de 23 (la mayoría adaptados al catálogo de `nodo-dev`: #20, #23, #24 en lugar de L1–L4) — Fallidos: 0 — Pendientes: 0
- Decisión del usuario (2026-10-22): `error.details.invalid_slugs[]` usa `lesson_slug`. Se corrigió el código (`lib/courses/service.ts`), el spec (D14) y el system prompt de courses-agent.
- Hallazgos menores (sin escalar al backlog): columnas de la tabla Contenido cambian de ancho al aparecer una advertencia; el enlace "Responder" lleva al inicio de la lección, no a la autoevaluación.
- Hallazgo del guion: los códigos de matrícula `T060B2026` y `T060C2026` tienen 9 caracteres y el formulario de edición exige 8 (B se cambió a `T60B2026`). Guion corregido a `T60B2026` y `T60C2026`.
- Limpieza de datos de prueba: ✅ Completada (2026-10-22). Marcas de A desmarcadas (0 filas en `taught_lessons`), E4 eliminado por `delete_student`, los 3 intentos de esta ronda (E1: #20 y #24; E2: #20) borrados con `service_role`, y por instrucción expresa del usuario la matrícula retirada de E2 en B, los Grupos B y C y el docente D2 (verificado: 0 grupos, 0 matrículas, 0 marcas, D2 sin roles ni usuario). Quedan 3 filas de `lesson_progress` de E1/E2 por haber abierto lecciones (no se tocaron; no afectan a la nota).
