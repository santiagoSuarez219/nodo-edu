# spec-005 — Banco de preguntas (schema + dominio + API HTTP + MCP)

> **Estado:** Planificado — pendiente de implementación. La implementación de referencia
> existe en el tag `backup/feat-question-bank` y se portará al implementar este spec.

---

## Contexto

La plataforma ya gestiona contenido de lectura (MDX) y el ciclo académico básico
(matrículas y calificaciones vía **spec-003**). Para habilitar evaluaciones y ejercicios
interactivos se necesita, como pieza fundacional, un **banco de preguntas**: una colección
de preguntas maestras reutilizables de cinco tipos —selección múltiple, texto abierto,
ejercicios sobre fragmentos de código, escritura de código y —en fase futura— problemas de
programación con pruebas automatizadas.

Este spec es la **base** sobre la que se montan la creación de evaluaciones (**spec-006**),
la resolución por el estudiante (**spec-007**) y la revisión manual del docente
(**spec-008**). Aquí se define exclusivamente el banco: su schema, su capa de dominio, y el
mecanismo por el que se puebla.

**Giro de producto — sin UI de creación.** El banco **no se poblará mediante formularios en
el front**. La creación, modificación, borrado, lectura y publicación de preguntas se hace
**exclusivamente a través de una API HTTP** autenticada con una API key de servicio (sin
sesión de usuario), que consume un **MCP** (Model Context Protocol). Un agente de IA usa ese
MCP para poblar y mantener el banco. Esto implica tres frentes:

1. **Exponer el dominio de preguntas como API REST** autenticada con API key de servicio.
2. **Crear el primer MCP del proyecto** (`question-bank-mcp`), cliente de esa API.
3. **Preparar la lectura del banco desde sesión** (`getQuestionsByTeacher`) que consumirá el
   selector del `NewAssignmentForm` de **spec-006** — único consumidor de lectura del banco
   desde la app; aquí no se construye ninguna UI, solo se expone la función.

El reto técnico central es que las funciones de dominio dependen de la **sesión** del
usuario (`auth.getUser()` + RLS por usuario). La API con API key **no tiene sesión**, por lo
que hay que desacoplar el dominio para que acepte un **actor explícito** (el id del docente
designado) y opere con un cliente Supabase de servicio, sin perder las validaciones de
negocio que antes garantizaba RLS.

La ejecución automatizada de código (`coding_challenge`) se modela en la base de datos desde
el principio pero queda **deshabilitada** (stub `runCode` → `{ status: 'disabled' }`) hasta
una decisión de infraestructura posterior, fuera del alcance de este spec.

---

## Alcance

### Incluye

- **Schema del banco:** tablas `questions`, `question_choices`, `question_rubrics`,
  `coding_challenge_tests`, con políticas RLS y migraciones SQL.
- **Capa de dominio TypeScript del banco:** `lib/questions/{types,schemas,index}.ts`
  refactorizado a **contexto por actor** `{ supabase, actorId }`, conservando wrappers de
  sesión (`getQuestionsByTeacher`, etc.) para el consumidor de lectura de spec-006.
- **Cliente Supabase de servicio** server-only reutilizable (`lib/auth/service.ts`,
  `createServiceSupabaseClient()`).
- **Contexto de servicio del banco:** `lib/questions/service.ts`
  (`getServiceQuestionsContext()` con `QUESTION_BANK_AGENT_TEACHER_ID`) que scopea toda
  lectura/escritura por `created_by = actorId`.
- **Utilidades HTTP:** helper de autenticación por API key (`lib/api/auth.ts`) y formato de
  error uniforme + mapa de códigos HTTP (`lib/api/errors.ts`).
- **Stub `lib/code-runner/index.ts`** (`runCode` → `{ status: 'disabled' }`) para modelar
  `coding_challenge` desde el inicio; lo consumirá spec-007.
- **API REST bajo `app/api/questions/`:** list, create, get, update, delete, publish, con
  validación por los Zod schemas del dominio y códigos HTTP consistentes.
- **Primer MCP del proyecto** `question-bank-mcp` (servidor stdio, TypeScript) con 6
  herramientas que envuelven la API, más su system prompt e inventario en `docs/mcps/` y su
  registro en `CLAUDE.md`.
- **Prerrequisito de datos:** seed del docente principal (`scripts/seed-teacher.mjs`,
  `npm run seed:teacher`) cuya cuenta es propietaria (`created_by`) de las preguntas.
- **Nuevas variables de entorno** documentadas en `.env.example`.

### No incluye

- **Cualquier UI de creación/edición de preguntas.** El banco no tiene UI: se puebla solo vía
  API + MCP. La única lectura desde la app es la función `getQuestionsByTeacher`, que el
  selector del `NewAssignmentForm` de **spec-006** consumirá (ese componente pertenece a
  spec-006, no a este spec).
- **Asignaciones, submissions y revisión** — tablas `assignments`, `assignment_questions`,
  `submissions`, `answers` y su dominio pertenecen a **spec-006**, **spec-007** y
  **spec-008**. Aquí solo se referencian.
- **Ejecución automatizada de código** (`coding_challenge`): se modela en DB pero no se
  ejecuta (stub). La ejecución real es futura.
- **Banco privado por docente:** todas las preguntas publicadas son visibles para todos los
  docentes.
- Importación/exportación masiva (CSV, QTI, Moodle XML); tipos "emparejamiento",
  "arrastrar y soltar"; notificaciones; estadísticas por pregunta.
- Autenticación por usuario/OAuth para la API: se usa **solo API key de servicio**.
- Rate limiting, versionado de API (`/v1`) o paginación por cursor (se usa `limit`/`offset`
  simple).
- Exposición del MCP como servicio remoto multiusuario (transport `stdio` local; migrable a
  HTTP+SSE en el futuro sin cambiar el catálogo de herramientas).
- Herramientas MCP sobre otros dominios (usuarios, cursos, matrículas): el MCP se acota
  estrictamente al banco de preguntas.

---

## Dependencias

- **spec-003 (course-enrollment)** `[DONE]` — base académica: tablas `academic_courses`,
  `enrollments`, `grade_items`, `student_grades` con RLS; middleware de protección `/admin`
  y verificación de rol; helper `requireRole(role)` en `lib/auth/session.ts`; dashboard del
  estudiante. También aporta los clientes Supabase en `lib/auth/`
  (`server.ts`, `middleware.ts`, `browser.ts`, `session.ts`) que este spec extiende con
  `service.ts`. **Este spec no reescribe ese fundamento.**

Este spec es **prerrequisito** de la cadena de evaluaciones:

- **spec-006 (assignment-authoring)** — consume la lectura del banco (`getQuestionsByTeacher`)
  para el selector del `NewAssignmentForm`.
- **spec-007 (assignment-solving)** — consume el stub `lib/code-runner` y las preguntas del
  banco al renderizar/resolver.
- **spec-008 (assignment-review)** — depende indirectamente vía spec-007.

Cadena completa: `spec-003` → **spec-005** → spec-006 → spec-007 → spec-008.

---

## Impacto en el sistema

### Base de datos

Cuatro tablas nuevas en Supabase Postgres, RLS habilitado en todas. El tipo
`coding_challenge` se modela desde el inicio para evitar migraciones destructivas. Las tablas
de asignaciones y submissions (specs 006–008) **no** se crean aquí.

| Tabla | Propósito |
|---|---|
| `questions` | Pregunta maestra en el banco (discriminante `type`) |
| `question_choices` | Opciones de respuesta para `multiple_choice` |
| `question_rubrics` | Rúbrica opcional para revisión de `open_text` y `code_write` |
| `coding_challenge_tests` | Casos de prueba automatizados para `coding_challenge` (futuro) |

Migraciones de referencia (en `backup/feat-question-bank`):
`20260625000005_init_questions.sql`, `20260625000008_rls_questions.sql`,
`20260703000000_fix_questions_author_fk.sql`,
`20260703000001_profiles_visible_for_published_authors.sql`.

### Rutas (API)

Todas las route handlers son **server-only**, corren en Node runtime
(`runtime = "nodejs"`, `dynamic = "force-dynamic"`) y validan la API key antes de tocar el
dominio.

| Archivo | Métodos | Propósito |
|---|---|---|
| `app/api/questions/route.ts` | `GET`, `POST` | Listar (con filtros + paginación) y crear preguntas |
| `app/api/questions/[questionId]/route.ts` | `GET`, `PATCH`, `DELETE` | Leer, actualizar (reemplazo total) y eliminar una pregunta |
| `app/api/questions/[questionId]/publish/route.ts` | `POST` | Publicar una pregunta |

> No hay rutas bajo `app/admin/` en este spec: el banco no tiene UI. Las primeras rutas
> admin de la feature aparecen en **spec-006**.

### Módulos `lib/`

| Archivo | Acción | Detalle |
|---|---|---|
| `lib/auth/service.ts` | **Crear** | `createServiceSupabaseClient()` — cliente con `SUPABASE_SERVICE_ROLE_KEY`, server-only, sin persistencia de sesión. Bypasa RLS. |
| `lib/questions/types.ts` | **Crear** | Tipos del dominio (`Question`, `QuestionWithDetails`, `QuestionType`, contexto `{ supabase, actorId }`). |
| `lib/questions/schemas.ts` | **Crear** | Zod schemas — discriminated union `QuestionSchema` por `type`; schema de filtros de listado. |
| `lib/questions/index.ts` | **Crear** | Lógica del dominio que recibe un **contexto `{ supabase, actorId }`**; expone wrappers de sesión con firma estable (`getQuestionsByTeacher`, etc.) para que spec-006 los consuma sin conocer el refactor. |
| `lib/questions/service.ts` | **Crear** | `getServiceQuestionsContext()` (service client + `QUESTION_BANK_AGENT_TEACHER_ID`) y funciones de servicio que scopean por `created_by = actorId`. |
| `lib/api/auth.ts` | **Crear** | `authenticateServiceRequest(req)` — valida el header `x-api-key` con comparación de tiempo constante; `401` en fallo. |
| `lib/api/errors.ts` | **Crear** | Helper de respuesta de error uniforme (`apiError(code, message, status, details?)`) + mapa de códigos HTTP. |
| `lib/code-runner/index.ts` | **Crear** | Stub `runCode` → `{ status: 'disabled' }`. Consumido por spec-007. Ejecución real fuera de alcance. |

> `SUPABASE_SERVICE_ROLE_KEY` solo se importa desde `lib/auth/service.ts` y se consume desde
> route handlers / `lib/**` server-only. **Nunca** desde `components/` ni desde código con
> `"use client"`.

### Componentes

Ninguno. Este spec no crea UI. El `NewAssignmentForm` que leerá el banco pertenece a
**spec-006**.

### Código del MCP (fuera de la app Next.js)

| Ruta | Propósito |
|---|---|
| `mcp-servers/question-bank-mcp/` | Servidor MCP TypeScript (proceso Node independiente, transport stdio) que consume la API HTTP. No es importado por la app. Estructura de referencia: `src/{index,api,tools}.ts`, `package.json`, `tsconfig.json`, `.env.example`. |
| `docs/mcps/README.md` | Inventario de MCPs del proyecto (se crea aquí; es el primero). |
| `docs/mcps/question-bank-agent.system-prompt.md` | System prompt del agente docente que usa el MCP. |
| `CLAUDE.md` (sección "MCPs del proyecto") | Registro del MCP en la fuente de verdad del proyecto. |

### Prerrequisito de datos — docente sembrado

| Archivo / comando | Propósito |
|---|---|
| `scripts/seed-teacher.mjs` | Crea/asegura la cuenta del **docente principal** a partir de `TEACHER_EMAIL`, con roles `teacher` + `admin`. |
| `npm run seed:teacher` | Script en `package.json` que ejecuta el seed (`node --env-file-if-exists=.env.local scripts/seed-teacher.mjs`). |

Esa cuenta es la propietaria (`created_by`) de las preguntas que cree el agente vía API. Su
id debe coincidir con `QUESTION_BANK_AGENT_TEACHER_ID`.

### Variables de entorno nuevas

| Variable | Ámbito | Descripción |
|---|---|---|
| `QUESTION_BANK_API_KEY` | App + MCP | Clave secreta que el MCP envía en cada request (header `x-api-key`); las route handlers la validan. Solo server-side. |
| `QUESTION_BANK_AGENT_TEACHER_ID` | App | UUID del docente principal (sembrado por la Fase 0) usado como `created_by` de las preguntas del agente. |
| `QUESTION_BANK_API_BASE_URL` | MCP | URL base de la API para el proceso MCP (ej. `http://localhost:3000/api/questions` en dev). |

`SUPABASE_SERVICE_ROLE_KEY` ya existe; se reutiliza. Se documentan las tres nuevas en
`.env.example` (y las dos del proceso MCP en `mcp-servers/question-bank-mcp/.env.example`).

---

## Schema de base de datos

> Referencia de las cuatro tablas del banco. Las tablas de otros specs se referencian, no se
> definen aquí.

### Tabla `questions`

Pregunta maestra del banco. Propiedad del docente que la creó; visible por todos los docentes
una vez publicada.

- `id uuid primary key default gen_random_uuid()`
- `created_by uuid not null references auth.users(id) on delete restrict` — docente autor.
- `course_slug text` — referencia débil al slug del curso de contenido MDX (sin FK).
- `lesson_slug text` — referencia débil a la lección.
- `topic_title text` — referencia débil al topic (string libre). **DEBT:** a resolver con
  Payload CMS cuando el contenido migre a base de datos.
- `type text not null check (type in ('multiple_choice','open_text','code_snippet','code_write','coding_challenge'))` — discriminante.
- `stem text not null` — enunciado (Markdown, KaTeX, código inline con Shiki).
- `code_snippet text` — fragmento a mostrar. Aplica a `code_snippet` y `coding_challenge`.
- `code_language text` — lenguaje del snippet para Shiki.
- `difficulty smallint not null default 1 check (difficulty between 1 and 5)`.
- `tags text[]` — etiquetas libres para filtrar.
- `is_published boolean not null default false` — si `true`, visible en el banco compartido.
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Índices: `(created_by)`, `(course_slug, lesson_slug)`, `(type)`.

### Tabla `question_choices`

Opciones para `multiple_choice` (una o varias correctas).

- `id uuid primary key default gen_random_uuid()`
- `question_id uuid not null references questions(id) on delete cascade`
- `body text not null` — texto de la opción (Markdown).
- `is_correct boolean not null default false`
- `order_index smallint not null default 0`

Restricción: `unique (question_id, order_index)`.

### Tabla `question_rubrics`

Rúbrica opcional para revisión manual de `open_text` y `code_write`.

- `id uuid primary key default gen_random_uuid()`
- `question_id uuid not null references questions(id) on delete cascade` — unique (una por pregunta).
- `criteria jsonb not null` — array `[{ label, points, description }]`. La suma de `points` iguala `max_score`.
- `max_score numeric(5,2) not null check (max_score > 0 and max_score <= 5)`.

### Tabla `coding_challenge_tests`

Casos de prueba para `coding_challenge`. Modelados desde el inicio; **ejecución futura**.

- `id uuid primary key default gen_random_uuid()`
- `question_id uuid not null references questions(id) on delete cascade`
- `input text not null` — stdin o parámetros serializados.
- `expected_output text not null` — stdout esperado.
- `is_hidden boolean not null default false` — si `true`, el estudiante solo ve `passed/failed`.
- `order_index smallint not null default 0`

### Políticas RLS de alto nivel (dominio de sesión)

- **`questions`** — `select`: el docente ve las propias siempre + las publicadas de otros.
  `insert`: solo `teacher`/`admin`, `created_by` forzado a `auth.uid()`. `update`/`delete`:
  solo el autor o admin.
- **`question_choices` / `question_rubrics` / `coding_challenge_tests`** — acceso derivado de
  la pertenencia a la `questions` padre.

> **Nota sobre la API de servicio.** El cliente de service role **bypasa RLS**. Por eso las
> funciones de servicio (`lib/questions/service.ts`) deben **replicar en código** la frontera
> de propiedad (`created_by = actorId`): RLS deja de ser la única línea de defensa para el
> camino de la API. Ver "Diseño de la API → Actor de servicio".

---

## Diseño de la API

### Autenticación

- Todos los endpoints exigen el header **`x-api-key: <QUESTION_BANK_API_KEY>`**.
- El helper `authenticateServiceRequest(req)`:
  - Rechaza con `401` si el header falta o el valor no coincide.
  - Usa comparación de tiempo constante (`crypto.timingSafeEqual`) para evitar timing attacks.
  - No hay sesión de usuario: la request se ejecuta como **servicio**, con permisos de
    docente. El actor efectivo es siempre `QUESTION_BANK_AGENT_TEACHER_ID`.

> Se eligió `x-api-key` (en vez de `Authorization: Bearer`) para no colisionar con el flujo de
> sesión de Supabase. Es intercambiable si se prefiere el estándar Bearer.

### Actor de servicio y `created_by`

- Las operaciones de escritura fuerzan `created_by = QUESTION_BANK_AGENT_TEACHER_ID`. El
  cuerpo del request **no puede** sobrescribir `created_by` (se ignora si se envía).
- El id proviene de `QUESTION_BANK_AGENT_TEACHER_ID`, validado en el handler: si está ausente
  o no es UUID → `500 configuration_error` (fallo de configuración del servidor, no de
  credencial del cliente).
  - **DEBT (no bloqueante):** la Fase 0 siembra al docente por `TEACHER_EMAIL` (no por id
    fijo), así que el id puede variar entre entornos. Alternativa a futuro: extender
    `seed:teacher` para **emitir** el id resuelto, o resolverlo en runtime desde
    `TEACHER_EMAIL` con caché. Para este spec basta la env var; queda documentado el riesgo
    de drift.
- Como el service client **bypasa RLS**, toda lectura/escritura por id se scopea con
  `created_by = actorId`. Un `questionId` de otro autor devuelve `404` (no fuga de recursos
  ajenos).

### Contratos por endpoint

**`GET /api/questions`** — filtros por query string (todos opcionales, combinables):

| Query param | Tipo | Filtro |
|---|---|---|
| `course_slug` | string | igualdad |
| `lesson_slug` | string | igualdad |
| `type` | `QuestionType` | igualdad (uno de los 5 tipos) |
| `difficulty` | 1–5 | igualdad |
| `tag` | string | pertenencia en `tags[]` |
| `is_published` | `true`/`false` | igualdad |
| `q` | string | búsqueda parcial en `stem` (ilike) |
| `limit` | int (default 50, máx 100) | paginación |
| `offset` | int (default 0) | paginación |

Query params inválidos (p. ej. `difficulty=9`, `type=foo`) → `422 validation_error`.

```jsonc
// 200 OK
{
  "data": [ /* QuestionWithDetails, con choices/rubric/challenge_tests/author_name */ ],
  "meta": { "total": 128, "limit": 50, "offset": 0 }
}
```

**`POST /api/questions`** — cuerpo validado con el discriminated union `QuestionSchema`
(base: `stem` req, `difficulty` 1–5, `tags[]`, `course_slug?`, `lesson_slug?`,
`topic_title?`; reglas por `type`: `multiple_choice` → `choices[]` ≥2 con ≥1 correcta;
`open_text`/`code_write` → `rubric?` con `max_score` 0.01–5 y `criteria[]`; `code_snippet` →
`code_snippet` + `code_language` req; `coding_challenge` → `code_language` req +
`challenge_tests[]` ≥1).

```jsonc
// Request
{
  "type": "multiple_choice",
  "stem": "¿Cuál es la complejidad de la búsqueda binaria?",
  "difficulty": 2,
  "tags": ["algoritmos", "complejidad"],
  "course_slug": "estructura-de-datos",
  "choices": [
    { "body": "O(log n)", "is_correct": true,  "order_index": 0 },
    { "body": "O(n)",     "is_correct": false, "order_index": 1 }
  ]
}
// 201 Created
{ "data": { "id": "…", "created_by": "<agent-teacher-id>", "is_published": false, /* … */ } }
```

**`GET /api/questions/{questionId}`** — `200` con `QuestionWithDetails`; `404` si no existe o
no pertenece al docente designado.

**`PATCH /api/questions/{questionId}`** — mismo schema que `POST` (semántica de **reemplazo
total** de choices/rubric/challenge_tests). `200` con el recurso actualizado; `404` si no
existe/no es del actor; `422` si el payload no valida.

> **Nota de contrato (PATCH vs "actualización parcial" del MCP):** a nivel HTTP `PATCH`
> reemplaza el recurso completo con el `QuestionSchema` enviado. La herramienta MCP
> `update_question` se describe como "parcial" en el sentido de que el agente envía solo los
> campos a cambiar, pero **el MCP debe releer la pregunta con `get_question` y componer el
> payload completo** antes de llamar a `PATCH` (no cambia el `type`). El reemplazo total de
> colecciones anidadas es intencional y evita estados inconsistentes.

**`DELETE /api/questions/{questionId}`** — `200` si se elimina; **`409 conflict`** si la
pregunta está referenciada en `assignment_questions` (tabla de spec-006; preserva la
validación de negocio); `404` si no existe/no es del actor.

**`POST /api/questions/{questionId}/publish`** — `200` si publica; **`422`** si es
`multiple_choice` sin opción correcta; `404` si no existe/no es del actor.

### Formato de error uniforme

```jsonc
{
  "error": {
    "code": "validation_error",       // string estable, machine-readable
    "message": "El cuerpo no cumple el esquema de la pregunta.",
    "details": { "fieldErrors": { "choices": ["Debe haber al menos una opción correcta."] } }
  }
}
```

### Tabla de códigos HTTP

| Código | Cuándo |
|---|---|
| `200` | GET / PATCH / DELETE / publish con éxito |
| `201` | POST con éxito |
| `400` | JSON malformado o body ausente donde se requiere (`bad_request`) |
| `401` | Falta API key o es inválida (`unauthorized`) |
| `404` | Recurso inexistente o no perteneciente al docente designado (`not_found`) |
| `405` | Método no permitido en la ruta (`method_not_allowed`) |
| `409` | Conflicto de negocio: eliminar pregunta en uso (`conflict`) |
| `422` | Fallo de validación Zod o de regla de negocio (publish sin correcta) (`validation_error`) |
| `500` | Configuración inválida o error inesperado (`configuration_error` / `internal_error`) |

---

## Diseño del MCP `question-bank-mcp`

**¿Aplica MCP?** Sí — es el **primer MCP del proyecto**.

- **Propósito:** exponer el CRUD del banco (`/api/questions/*`) como herramientas invocables
  por un agente de IA, para que un agente docente pueda listar, crear, actualizar, eliminar y
  publicar preguntas sin pasar por formularios de UI. El MCP es un cliente HTTP de la API del
  proyecto; no accede a Supabase directamente ni gestiona autenticación de usuarios.
- **System prompt:** `docs/mcps/question-bank-agent.system-prompt.md` (nuevo; ver Apéndice A).

### Decisiones técnicas

- **Runtime:** TypeScript sobre Node.js, con `@modelcontextprotocol/sdk` (dependencia nueva —
  se confirma con el usuario antes de instalar; no está en el `package.json` de la app; el MCP
  tiene su propio `package.json` en `mcp-servers/question-bank-mcp/`).
- **Transport:** **stdio**. El MCP se usa localmente por un cliente MCP para administrar el
  banco, no como servicio de red multiusuario. Migrable a HTTP+SSE sin cambiar el catálogo.
- **Config (env del proceso MCP):** `QUESTION_BANK_API_BASE_URL` y `QUESTION_BANK_API_KEY`,
  leídas al inicio con *fail-fast* (si falta alguna, no arranca; log a stderr, nunca a stdout
  —reservado al protocolo).
- **Helper único `callQuestionBankApi`:** adjunta `x-api-key` + `Content-Type`; `2xx` → JSON;
  `4xx` → error de herramienta con el mensaje de la API **tal cual**; `5xx`/red → error
  genérico "API no disponible" **sin reintentos** (para no duplicar creaciones). Nunca expone
  la API key en logs ni en outputs.

### Catálogo de herramientas

| Herramienta | Tipo | Descripción (orientada al agente) | Input | Output |
|---|---|---|---|---|
| `list_questions` | lectura | Lista preguntas con filtros opcionales (type, course_slug, lesson_slug, difficulty, is_published, tags, search, limit, offset). Úsala para explorar antes de crear y evitar duplicados. | filtros opcionales | `{ questions: QuestionSummary[], total }` |
| `get_question` | lectura | Obtiene una pregunta completa por `id` (con choices/rubric/challenge_tests). Úsala antes de actualizar. | `{ id }` | `Question` completo |
| `create_question` | escritura | Crea una pregunta. SIEMPRE como borrador (`is_published=false`). Campos requeridos según `type`. | `QuestionInput` | `Question` creado |
| `update_question` | escritura | Actualiza una pregunta (el agente envía solo los campos a cambiar; el MCP relee y compone el payload completo). No cambia el `type`. Reemplaza choices/rubric/tests si se envían. | `{ id, ...campos }` | `Question` actualizado |
| `delete_question` | destructiva | Elimina permanentemente. Falla (`409`) si está en uso en una asignación. | `{ id }` | `{ deleted: true, id }` |
| `publish_question` | acción | Publica (`is_published=true`). La API valida ≥1 opción correcta en `multiple_choice`. | `{ id }` | `Question` publicado |

**Sobre el discriminated union por `type`:** JSON Schema puro no valida bien el `required`
dinámico por `type`. Se mantiene el input schema **permisivo** (required mínimo: `type`,
`stem`, `difficulty`) con **descripciones por campo**, y la validación estricta ocurre
**server-side** en la API, que devuelve errores legibles por campo que el MCP relaya sin
reformular.

### Seguridad del MCP

- Solo habla HTTP con `QUESTION_BANK_API_BASE_URL`; no importa clientes de Supabase ni lee
  `SUPABASE_SERVICE_ROLE_KEY`.
- `QUESTION_BANK_API_KEY` vive únicamente en el entorno del proceso MCP; no se loguea, no se
  incluye en outputs, no se persiste.
- Least privilege: solo herramientas del banco de preguntas; nada de usuarios, cursos,
  matrículas o progreso.

El borrador del system prompt y la entrada de `docs/mcps/README.md` están en el **Apéndice A**
y se materializan en la Fase 5.

---

## Fases de implementación

### Fase 0 — Prerrequisito de datos: docente principal sembrado
- [ ] Portar `scripts/seed-teacher.mjs`: crea/asegura la cuenta del docente principal a partir
      de `TEACHER_EMAIL`, con roles `teacher` + `admin`.
- [ ] Añadir el script `seed:teacher` a `package.json`
      (`node --env-file-if-exists=.env.local scripts/seed-teacher.mjs`).
- [ ] Ejecutar `npm run seed:teacher` en local y registrar el id resuelto del docente.
- [ ] Fijar `QUESTION_BANK_AGENT_TEACHER_ID` en `.env.local` con ese id.
- [ ] Documentar el **DEBT** de drift del id entre entornos (seed por email, no por id fijo)
      en `docs/specs/backlog.md`.

### Fase 1 — Schema del banco y migraciones
- [ ] Portar migraciones `20260625000005_init_questions.sql` (tablas `questions`,
      `question_choices`, `question_rubrics`, `coding_challenge_tests` + índices) y
      `20260625000008_rls_questions.sql` (políticas RLS por rol/autor).
- [ ] Portar los fixes `20260703000000_fix_questions_author_fk.sql` y
      `20260703000001_profiles_visible_for_published_authors.sql`.
- [ ] `supabase db reset` sin conflictos; las cuatro tablas con RLS habilitado.
- [ ] Verificar políticas RLS por rol (autor ve propias + publicadas ajenas; insert solo
      teacher/admin con `created_by` forzado).

### Fase 2 — Cliente de servicio y dominio del banco por actor
- [ ] Crear `lib/auth/service.ts` con `createServiceSupabaseClient()` (service role,
      server-only, sin persistencia de sesión).
- [ ] Crear `lib/questions/{types,schemas}.ts` (tipos + Zod discriminated union
      `QuestionSchema` y schema de filtros).
- [ ] Crear `lib/questions/index.ts`: lógica que recibe un contexto `{ supabase, actorId }` y
      wrappers de sesión con firma estable (`getQuestionsByTeacher`, etc.) para que spec-006
      consuma la lectura sin conocer el refactor.
- [ ] Crear `lib/questions/service.ts` con `getServiceQuestionsContext()` (service client +
      `QUESTION_BANK_AGENT_TEACHER_ID`) y funciones de servicio que scopean toda
      lectura/escritura por `created_by = actorId`.
- [ ] Preservar en código las validaciones que RLS cubría: `created_by` forzado, ownership por
      `actorId` (404 cross-autor), ≥1 correcta al publicar, rechazo de borrado si está en uso.
- [ ] Validar que `QUESTION_BANK_AGENT_TEACHER_ID` es UUID; si no, `500 configuration_error`.
- [ ] Crear `lib/code-runner/index.ts` (stub `runCode` → `{ status: 'disabled' }`).

### Fase 3 — Autenticación por API key y utilidades HTTP
- [ ] Añadir `QUESTION_BANK_API_KEY`, `QUESTION_BANK_AGENT_TEACHER_ID` y
      `QUESTION_BANK_API_BASE_URL` a `.env.example`.
- [ ] Crear `lib/api/auth.ts` con `authenticateServiceRequest(req)` (header `x-api-key`,
      comparación de tiempo constante, `401` en fallo).
- [ ] Crear `lib/api/errors.ts` con el helper de error uniforme y el mapa de códigos HTTP.

### Fase 4 — Route handlers REST
- [ ] `app/api/questions/route.ts`: `GET` (parseo/validación de filtros + paginación) y `POST`
      (validación con `QuestionSchema`, create de servicio, `201`).
- [ ] `app/api/questions/[questionId]/route.ts`: `GET`, `PATCH` (validación + reemplazo total),
      `DELETE` (con chequeo de uso → `409`).
- [ ] `app/api/questions/[questionId]/publish/route.ts`: `POST` (validación de negocio → `422`).
- [ ] Cada handler: autentica primero, resuelve el contexto de servicio, mapea errores de
      dominio a códigos HTTP, responde con el formato uniforme.
- [ ] Fijar `runtime = "nodejs"` y `dynamic = "force-dynamic"` en cada archivo.

### Fase 5 — MCP `question-bank-mcp` y documentación
- [ ] Confirmar con el usuario la dependencia `@modelcontextprotocol/sdk` antes de instalar.
- [ ] Crear el servidor MCP en `mcp-servers/question-bank-mcp/` (TypeScript, transport stdio):
      `src/{index,api,tools}.ts`, `package.json`, `tsconfig.json`, `.env.example`.
- [ ] Implementar `callQuestionBankApi` (auth por `QUESTION_BANK_API_KEY`, manejo uniforme de
      errores 4xx/5xx, sin reintentos en escritura, sin filtrar la API key).
- [ ] Implementar las 6 herramientas: `list_questions`, `get_question`, `create_question`,
      `update_question`, `delete_question`, `publish_question`.
- [ ] Documentar env del proceso MCP en `mcp-servers/question-bank-mcp/.env.example`.
- [ ] Crear `docs/mcps/README.md` (inventario canónico, ver Apéndice A.1) y
      `docs/mcps/question-bank-agent.system-prompt.md` (ver Apéndice A.2).
- [ ] Registrar el MCP en la sección "MCPs del proyecto" de `CLAUDE.md`.
- [ ] MCP compila sin errores; herramientas definidas con schemas completos.

### Fase 6 — Pruebas
- [ ] Ejecutar los casos manuales de `docs/testing/test-005-question-bank.md`:
  - [ ] Seguridad API (`x-api-key`): `401` sin key / con key inválida.
  - [ ] CRUD completo (create/get/list con filtros/update/delete/publish) vía `curl` o cliente
        HTTP.
  - [ ] `created_by` forzado; `404` cross-autor; `409` al borrar pregunta en uso; `422` al
        publicar `multiple_choice` sin correcta.
  - [ ] Herramientas del MCP (`TC-MCP-*`) contra la API local.
- [ ] Confirmar que `getQuestionsByTeacher` (sesión) queda expuesta y funcional para el
      consumidor de spec-006.
- [ ] `npm run lint` y `tsc --noEmit` sin errores nuevos.

> **Fuera de ciclo:** automatizar los criterios de la API en suite e2e/unit cuando el proyecto
> adopte un framework de testing (hoy "por definir" en `CLAUDE.md`). Su ausencia no bloquea el
> `[DONE]` de este spec.

---

## Criterios de aceptación

### Funcionales (API)
- Se puede **listar** preguntas del docente designado vía `GET /api/questions`, con filtros y
  paginación `limit`/`offset`.
- Se puede **crear** una pregunta de los 5 tipos vía `POST /api/questions`; un payload inválido
  devuelve `422` con `fieldErrors`.
- Se puede **leer**, **actualizar** (reemplazo de choices/rubric/tests) y **eliminar** una
  pregunta por id.
- **Publicar** un `multiple_choice` sin opción correcta devuelve `422` con mensaje claro.
- **Eliminar** una pregunta usada en `assignment_questions` (spec-006) devuelve `409`.
- La función de lectura `getQuestionsByTeacher` queda **expuesta y funcional** para el selector
  del `NewAssignmentForm` de spec-006.

### Seguridad
- Request **sin** header `x-api-key` → `401`. Request con API key **inválida** → `401`.
- En toda escritura, `created_by` queda **forzado** a `QUESTION_BANK_AGENT_TEACHER_ID`; un
  `created_by` enviado en el body se ignora.
- Un `questionId` que no pertenece al docente designado → `404`, pese a que el service client
  bypasa RLS.
- `SUPABASE_SERVICE_ROLE_KEY` no aparece en ningún bundle de cliente; solo se importa en
  `lib/auth/service.ts` y se consume server-only.

### MCP
- El agente puede invocar `list_questions`, `get_question`, `create_question`,
  `update_question`, `delete_question` y `publish_question`, y obtener/mutar preguntas a través
  de la API con los resultados esperados.
- Un error de la API (validación, conflicto, no encontrado) se relaya al agente como error de
  herramienta con el mensaje original, sin ocultar el fallo.
- El MCP nunca expone la API key ni credenciales del proyecto.

### Calidad
- Lint y typecheck pasan sin errores nuevos. Sin valores crudos de paleta (aunque este spec no
  crea UI, cualquier documentación o mensaje sigue las convenciones del proyecto).

---

## Pruebas asociadas

- **Manuales:** `docs/testing/test-005-question-bank.md` — casos `TC-API-*` (seguridad `401`,
  CRUD, `422`/`409`, `created_by` forzado, `404` cross-autor) verificados vía `curl`/cliente
  HTTP, y `TC-MCP-*` para las 6 herramientas del MCP. El archivo de test lo crea el
  orquestador, no este spec.
- **Automáticas (e2e/unit) — fuera de ciclo:** los mismos criterios se automatizan cuando el
  proyecto adopte un framework de testing (hoy "por definir" en `CLAUDE.md`). Su ausencia no
  bloquea el `[DONE]` de este spec.

---

## Apéndice A — Artefactos de `docs/mcps/` (se materializan en Fase 5)

### A.1 — Entrada para `docs/mcps/README.md`

```md
# MCPs del proyecto

Índice de servidores MCP (Model Context Protocol) activos en Nodo. Cada MCP
expone herramientas a agentes de IA; su system prompt asociado vive en este
mismo directorio.

| MCP | Propósito | Estado | System prompt | Código |
|---|---|---|---|---|
| `question-bank-mcp` | Cliente de la API `/api/questions/*` para que un agente docente liste, cree, actualice, elimine y publique preguntas del banco de evaluaciones (multiple_choice, open_text, code_snippet, code_write, coding_challenge). | Activo | `docs/mcps/question-bank-agent.system-prompt.md` | `mcp-servers/question-bank-mcp/` |
```

### A.2 — `docs/mcps/question-bank-agent.system-prompt.md`

```md
# System prompt — Question Bank Agent

## Rol y propósito

Eres el agente docente encargado de administrar el banco de preguntas de
evaluación de Nodo. Trabajas para el docente principal de la plataforma: tu
objetivo es crear, mantener y curar preguntas de alta calidad para cursos de
programación e inteligencia artificial (multiple_choice, open_text,
code_snippet, code_write, coding_challenge), listas para ser usadas en
asignaciones a estudiantes.

No tienes acceso a la base de datos ni a la app Next.js directamente: toda tu
interacción con el banco ocurre a través del MCP `question-bank-mcp`, que a su
vez llama a la API `/api/questions/*` del proyecto con una API key de servicio.

## MCP(s) disponibles

- `question-bank-mcp`: expone `list_questions`, `get_question`,
  `create_question`, `update_question`, `delete_question` y `publish_question`
  para leer y mutar preguntas del banco vía la API HTTP del proyecto.

## Capacidades

- Explorar el banco existente con `list_questions` (por curso, lección, tipo,
  dificultad, tags o texto libre) antes de crear contenido nuevo, para evitar
  duplicados.
- Inspeccionar una pregunta completa con `get_question` antes de editarla.
- Redactar preguntas nuevas con `create_question`, respetando estrictamente los
  campos requeridos según el `type`:
  - `multiple_choice`: mínimo 2 `choices`, al menos una con `is_correct: true`.
  - `open_text` / `code_write`: `rubric` opcional pero recomendado
    (`max_score`, `criteria`) para guiar la corrección.
  - `code_snippet`: requiere `code_snippet` y `code_language`.
  - `coding_challenge`: requiere `code_language` y `challenge_tests[]`
    (marcar `is_hidden` los tests que no deben mostrarse al estudiante).
- Actualizar preguntas existentes con `update_question` de forma parcial, sin
  cambiar su `type`.
- Publicar preguntas revisadas con `publish_question` solo cuando estén
  completas y correctas.
- Eliminar preguntas obsoletas o erróneas con `delete_question`, entendiendo que
  puede fallar si la pregunta está en uso.

## Restricciones

- Toda pregunta nueva se crea como **borrador** (`is_published: false`). Nunca
  publiques automáticamente al crear: publica solo tras revisión explícita del
  contenido o cuando el usuario lo pida directamente.
- **Nunca inventes `course_slug` ni `lesson_slug`.** Si no conoces el slug
  exacto, pregúntalo o infiérelo con `list_questions`; no adivines.
- No cambies el `type` de una pregunta existente vía `update_question`; si el
  tipo es incorrecto, elimina y crea una nueva (con confirmación si ya tenía uso).
- Antes de `delete_question`, confirma si la intención es eliminar o solo
  despublicar (no hay `unpublish` en el MCP actual; si se necesita, repórtalo).
- No tienes acceso a credenciales, usuarios, cursos, matrículas ni progreso de
  estudiantes. Tu dominio es exclusivamente el banco de preguntas.
- Si una herramienta devuelve un error (validación, conflicto, no encontrado),
  muestra el mensaje tal cual lo reporta la API; no lo reinterpretes ni asumas
  éxito parcial.
- No repitas una operación de escritura automáticamente tras un error 5xx o de
  red; repórtalo y espera indicación.

## Tono y formato de respuesta

- Comunícate en español, con tono profesional y pedagógico.
- Al crear o proponer una pregunta, muestra primero el contenido completo
  (enunciado, opciones/rubric/tests) para revisión antes de invocar
  `create_question`, salvo aprobación previa explícita del usuario.
- Al reportar resultados, sé conciso: confirma la operación, el `id` afectado y
  el estado (`is_published`), sin volcar el JSON crudo salvo que se pida.
- Ante ambigüedad sobre curso, lección o tipo, pregunta antes de actuar.
```
