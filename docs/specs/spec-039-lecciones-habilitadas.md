# spec-039 — [TESTING] Habilitar y deshabilitar lecciones vía MCP

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

El catálogo de lecciones vive en TypeScript estático versionado en git
(`lib/courses/data/*.ts`, tipo `Lesson` en `lib/courses/types.ts`). Una lección
existe en el catálogo desde que se planifica el curso, aunque su artículo MDX
todavía no esté escrito: en ese caso `articleSlug` está ausente y la lección se
lista pero no es navegable (`isNavigable`, `lib/courses/nodes.ts:7`), mostrando
el placeholder "Apuntes en preparación".

Ese es el único mecanismo de "todavía no" que existe hoy, y no cubre el caso
real del docente: **una lección cuyo contenido ya está escrito y commiteado,
pero que aún no debe abrirse al grupo**. Ejemplos concretos:

- La lección de la semana 7 ya está en `main` porque se escribió con
  anticipación, pero el grupo va por la semana 5 y no debe adelantarse.
- Una guía de laboratorio cuyo enunciado no debe verse antes de la sesión
  presencial.
- Una lección que se retira temporalmente porque tiene un error detectado en
  clase y se corregirá antes de reabrirla.

Hoy la única forma de conseguirlo es borrar la entrada del catálogo (o vaciar
`articleSlug`), commitear y desplegar — un ciclo de git + Vercel para una
decisión pedagógica que el docente toma sobre la marcha, a veces en mitad de
una clase.

Este spec introduce un **estado de habilitación por lección**, gobernable desde
un agente vía MCP, sin tocar código ni desplegar. Una lección deshabilitada
**sigue apareciendo** en el índice del curso —el estudiante ve que existe y que
viene más adelante— pero no puede abrirse, ni marcarse como vista, ni marcarse
como completada.

### Restricción arquitectónica que motiva el diseño

La app corre en Vercel con **filesystem de solo lectura**: un servidor MCP no
puede editar `lib/courses/data/*.ts` en runtime. El estado habilitado/
deshabilitado **tiene que vivir en Supabase** y componerse con el catálogo
estático en cada lectura. Esta es la primera vez en el proyecto que un atributo
de una lección es mutable en runtime, y el diseño de abajo (tabla de presencia +
composición por intersección) está pensado para que el catálogo siga siendo la
única fuente de verdad de *qué lecciones existen*, y Supabase la única fuente de
verdad de *cuáles están cerradas*.

### Granularidad: global por curso (decisión del usuario, 2026-08-01)

El estado es **global por `(course_slug, lesson_slug)`**: deshabilitar una
lección la cierra para **todos los grupos y semestres** de ese curso a la vez,
no por `academic_course`. El docente principal dicta el mismo curso a varios
grupos con el mismo cronograma; llevar el estado por grupo multiplicaría el
trabajo de gestión sin beneficio real hoy. Si en el futuro dos grupos necesitan
ritmos distintos, será otro spec (ver "Decisiones de diseño → D2").

## Alcance

**Incluye:**

- Tabla `public.disabled_lessons` en Supabase, con RLS: lectura para quien tiene
  acceso al curso, escritura solo para el docente dueño, admin o `service_role`.
- Una función de lectura reutilizable, `getDisabledLessonSlugs(courseSlug)`, que
  devuelve un resultado discriminado (`ok` / `unavailable`) — **contrato público
  de este spec, consumido por spec-040** (ver "Contrato para spec-040").
- Bloqueo de la página de lección para el estudiante: la lección deshabilitada
  se renderiza con un bloque "Lección no disponible" en lugar del artículo, sin
  redirect.
- El **docente dueño y el admin sí pueden entrar** a una lección deshabilitada,
  con un aviso visible de que está cerrada para los estudiantes. La prepara y la
  revisa antes de abrirla.
- Marcado visual en el índice lateral (`LessonSidebar` / `LessonSidebarItem`):
  la lección sigue listada, sin enlace, con la etiqueta "No disponible".
- Rechazo en servidor de `markLessonViewed` y `markLessonCompleted` sobre
  lecciones deshabilitadas, **fallando cerrado** ante infraestructura no
  disponible (precedente D8 de spec-037).
- Exclusión de las lecciones deshabilitadas de los conteos de progreso
  (`CourseProgressBar` en el sidebar y "N de M lecciones completadas" en
  `app/cuenta/cursos/[enrollmentId]/page.tsx`), tanto del numerador como del
  denominador.
- Exclusión de las lecciones deshabilitadas del redirect de reanudación de
  `app/(cursos)/[courseSlug]/page.tsx` (`resolveResumeLessonSlug`).
- API de servicio `/api/courses/lessons/*` y un MCP nuevo, `courses-mcp`, con
  herramientas de lectura y escritura del estado (ver "Evaluación MCP").

**No incluye:**

- **Ninguna UI de docente para habilitar/deshabilitar.** El único punto de
  escritura en este spec es el MCP. Un toggle en la vista docente de la lección
  es un candidato natural para un spec posterior; el diseño de datos y de RLS de
  aquí lo deja preparado (la política de escritura ya contempla al docente
  dueño autenticado, no solo a `service_role`).
- Granularidad por `academic_course` / por grupo (ver D2).
- Programación temporal ("habilitar automáticamente el 2026-09-01"). El estado
  es binario y manual; una fecha de apertura sería otro spec (ver D9).
- Borrar o alterar el progreso ya registrado de una lección que se deshabilita.
  El historial se conserva íntegro (ver D5).
- Ocultar la lección del índice. El requisito explícito del usuario es que
  **siga apareciendo**: el estudiante debe ver que el curso continúa.
- Deshabilitar cursos completos, o preguntas / evaluaciones asociadas a una
  lección deshabilitada. Un `assignment` sigue su propio ciclo de vida
  (spec-018); este spec no lo toca (ver "Riesgos → R3").

## Impacto en el sistema

### Base de datos

| Objeto | Acción |
|---|---|
| `public.disabled_lessons` | Crear — tabla de presencia `(course_slug, lesson_slug)` |
| `public.has_course_slug_access(uuid, text)` | Crear — helper `security definer`, espejo de `public.has_role` |
| `public.is_course_slug_teacher(uuid, text)` | Crear — helper `security definer` para la política de escritura |
| Políticas RLS de `disabled_lessons` | Crear — select / insert / delete |

### Backend y librerías

| Archivo | Acción |
|---|---|
| `lib/courses/availability.ts` | **Crear** — `getDisabledLessonSlugs`, `isLessonDisabled`, tipos `DisabledLessonsResult` |
| `lib/courses/service.ts` | **Crear** — lecturas/escrituras con `service_role` para las API routes (espejo de `lib/attendance/service.ts`) |
| `lib/courses/index.ts` | Modificar — re-exportar lo anterior; `resolveResumeLessonSlug` acepta `disabledLessonSlugs` |
| `lib/courses/nodes.ts` | Modificar — `buildCourseOutline` marca `isDisabled` en cada `OutlineNode`; `countProgressibleLessons` acepta el set de deshabilitadas |
| `lib/progress/index.ts` | Modificar — `markLessonViewed` y `markLessonCompleted` rechazan lecciones deshabilitadas |
| `lib/progress/types.ts` | Modificar — nuevas razones `lesson_disabled` y `availability_unavailable` en `MarkLessonCompletedResult` |

### Rutas y componentes

| Archivo | Acción |
|---|---|
| `app/(cursos)/[courseSlug]/page.tsx` | Modificar — pasar el set de deshabilitadas a `resolveResumeLessonSlug` |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Modificar — gate de disponibilidad antes de renderizar el artículo; aviso para owner/admin |
| `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx` | Modificar — leer las deshabilitadas y propagarlas al sidebar |
| `components/courses/LessonSidebar.tsx` | Modificar — recibir `disabledLessonSlugs`, ajustar el conteo del progreso |
| `components/courses/LessonSidebarItem.tsx` | Modificar — render "No disponible" (sin `Link`) |
| `components/courses/LessonUnavailable.tsx` | **Crear** — bloque que sustituye al artículo para el estudiante |
| `app/cuenta/cursos/[enrollmentId]/page.tsx` | Modificar — `totalCount` y `completedCount` sobre lecciones habilitadas |
| `components/courses/LessonClosure.tsx` | Modificar — nuevos `blockedReason` (`lesson_disabled`, `availability_unavailable`) y sus mensajes (Fase 3) |
| `components/courses/LessonClosureFlow.tsx` | Modificar — propagar el tipo ampliado de `blockedReason` (Fase 3) |

### API y MCP

| Archivo | Acción |
|---|---|
| `app/api/courses/[courseSlug]/lessons/route.ts` | **Crear** — `GET` (listar el catálogo de un curso con su estado) |
| `app/api/courses/[courseSlug]/lessons/[lessonSlug]/route.ts` | **Crear** — `GET` (estado de una lección) y `PATCH` (habilitar / deshabilitar) |
| `mcp-servers/courses-mcp/` | **Crear** — servidor MCP (src/index.ts, src/tools.ts, src/api.ts, package.json, tsconfig.json, .env.example) |
| `mcp-servers/run-local-mcp.sh` | Modificar — mapear variables de `courses-mcp` |
| `mcp-servers/run-prod-mcp.sh` | Modificar — ídem para la variante de producción |
| `.mcp.json` | Modificar — registrar `courses-mcp` y `courses-mcp-prod` |
| `.env.example` | Modificar — declarar `COURSES_ADMIN_API_KEY` (ver M2) |
| `docs/mcps/README.md` | Modificar — nueva fila en el inventario |
| `docs/mcps/courses-agent.system-prompt.md` | **Crear** |
| `CLAUDE.md` | Modificar — inventario de MCPs y tabla de variables de entorno |

### Fuera de impacto (verificado)

- `lib/courses/content.ts` y la resolución de MDX: la disponibilidad se decide
  **antes** de leer el artículo; el contenido nunca se carga para una lección
  bloqueada, así que no viaja en el payload RSC.
- `sitemap.ts` / `getCourseLessonSlugPairs`: son rutas privadas tras
  `requireCourseAccess`; el sitemap no cambia.
- `lib/self-assessment/*`: la autoevaluación solo se monta dentro del bloque
  `enrolled` de la página de lección, que queda cortado por el gate.

## Evaluación MCP

**¿Aplica MCP?** Sí.

| Pregunta | Respuesta |
|---|---|
| ¿Expone datos que un agente podría necesitar consultar? | **Sí.** Qué lecciones de un curso están abiertas es justo lo que un agente docente necesita para responder "¿por dónde va el grupo?" y para no producir material de una lección cerrada. |
| ¿Permite acciones que un agente debería poder ejecutar? | **Sí.** Habilitar/deshabilitar **es** la funcionalidad pedida por el usuario, y el MCP es su único punto de escritura en este spec. |
| ¿Ya existe un MCP que cubra un dominio relacionado? | **No** (justificación abajo). |
| ¿Hay un agente en `docs/mcps/` que se beneficie? | Sí, indirectamente: el agente de `assignment-mcp` y los subagentes de autoría de lecciones. Se documenta la relación, pero no se modifican sus system prompts. |

- **MCP nuevo a crear:** `courses-mcp` — cliente de la API `/api/courses/*` para
  consultar el catálogo de lecciones de un curso con su estado de habilitación,
  y abrir/cerrar lecciones.
- **MCP existente a modificar:** ninguno.
- **System prompt afectado:** `docs/mcps/courses-agent.system-prompt.md` (nuevo).
- **Fase de MCP en este spec:** Fase 5.

> Sección revisada por **@mcp-builder** (2026-08-01) sobre el borrador de
> `@architect`. El diseño de abajo es el **contrato cerrado** que la Fase 5 debe
> implementar tal cual: nombres de herramientas, esquemas, rutas, códigos de
> error y variables de entorno. Lo que quede fuera de aquí no se improvisa en
> la fase; se propone al usuario como cambio de scope.

### M1 — MCP nuevo, no extensión (decisión confirmada)

`CLAUDE.md` pide preferir extender. Se revisaron los cuatro MCPs activos y su
código en `mcp-servers/`; ninguno puede absorber este dominio sin romperse:

`CLAUDE.md` pide preferir extender. Se evaluaron los cuatro MCPs activos y
ninguno cubre el dominio:

| MCP | Dominio | Por qué no |
|---|---|---|
| `question-bank-mcp` | `/api/questions/*` — preguntas de evaluación | Nada que ver con el catálogo de lecciones. Una lección es el *contenedor*, no un ítem del banco. |
| `assignment-mcp` | `/api/assignments/*` — evaluaciones A/B/C | Ídem; su modelo mental es "grupo de variantes", no "curso → lección". |
| `attendance-mcp` | `/api/attendance/*` — **solo lectura** | Añadirle escritura rompe su contrato explícito de solo lectura, declarado en el inventario y en su system prompt. |
| `students-mcp` | `/api/students/*` — personas, `service_role` de admin | Dominio de identidad/matrícula, con una clave de API distinta y de mayor privilegio. Mezclar contenido con administración de personas confunde el ámbito de esa clave. |

El catálogo de cursos y lecciones es un **dominio nuevo** sin MCP. Dos razones
adicionales que refuerzan la decisión:

- **Ámbito de clave.** Cada MCP hereda el alcance de la clave con la que
  autentica. `attendance-mcp`, `assignment-mcp` y `question-bank-mcp` comparten
  hoy `QUESTION_BANK_API_KEY`; meter escritura de disponibilidad de contenido
  ahí ampliaría el poder de esa clave sin poder revocarlo por separado (ver M2).
- **Crecimiento previsto.** `courses-mcp` es el sitio natural para futuras
  herramientas de lectura del catálogo (temas, guías, cronograma) que hoy los
  subagentes de autoría resuelven leyendo `lib/courses/data/*.ts` del disco.
  Crear el servidor aquí paga esa deuda en vez de deformar un MCP existente.

**Decisión: se confirma `courses-mcp` como MCP nuevo.**

### M2 — Clave de API: `COURSES_ADMIN_API_KEY` propia (cierra R5)

**Decisión firme: clave propia `COURSES_ADMIN_API_KEY`.** No se reutiliza
`QUESTION_BANK_API_KEY`. Justificación:

1. **Radio de impacto asimétrico.** `QUESTION_BANK_API_KEY` ya cubre tres
   dominios (`/api/questions`, `/api/assignments`, `/api/attendance`), todos de
   trastienda docente. `/api/courses/lessons` es el primero que puede **cerrar
   contenido a estudiantes reales en producción de forma instantánea**. Una
   clave que hace ambas cosas no se puede revocar ni rotar sin apagar también
   el banco de preguntas.
2. **Precedente explícito del proyecto.** `STUDENTS_ADMIN_API_KEY` se separó por
   exactamente este razonamiento (spec-027; ver el comentario en `.env.example`
   y la nota del inventario en `docs/mcps/README.md`). Repetir el patrón
   mantiene una regla legible: *un dominio con permisos elevados, una clave*.
3. **Quién la porta.** Los subagentes de autoría de lecciones consumen
   `question-bank-mcp` con frecuencia. Si esa clave pudiera cerrar lecciones,
   un agente de autoría tendría de facto el permiso, aunque su system prompt no
   se lo mencione. Separar la clave hace del permiso algo que hay que
   **configurar**, no algo que se hereda por descuido.
4. **Coste real de separar: bajo.** Es una variable más en Vercel y en dos
   archivos `.env` no versionados; el patrón de wrapper ya existe y solo hay que
   copiarlo del bloque de `students-mcp`.

Contrapartida aceptada: una variable de entorno más que mantener sincronizada
entre local, `.env.prod-mcp` y Vercel. Si falta, la ruta responde `500`
`configuration_error` (nunca `401`), igual que `/api/students`.

**Qué hay que tocar para materializarlo** (lista cerrada, se ejecuta en Fase 5):

| Archivo / lugar | Cambio |
|---|---|
| `.env.example` | Añadir `COURSES_ADMIN_API_KEY=` en el bloque de variables de la APP, con el comentario de por qué es propia; y `COURSES_API_BASE_URL=http://localhost:3000/api/courses` en el bloque de clientes MCP (opcional: el wrapper lo deriva). |
| `.env.local` (no versionado) | Generar un valor de desarrollo, distinto del de producción. |
| `.env.prod-mcp` (no versionado) | Generar un valor de producción, **distinto** del local (misma regla que spec-026 Fase 4). |
| Vercel → Production env vars | Cargar `COURSES_ADMIN_API_KEY` con el valor de producción antes de desplegar; sin ella la ruta responde `500`. |
| `mcp-servers/run-local-mcp.sh` | Nueva rama en el `case`: `courses-mcp)` → `API_BASE_URL=${COURSES_API_BASE_URL:-$API_ORIGIN/api/courses}`, `API_KEY=$COURSES_ADMIN_API_KEY`. |
| `mcp-servers/run-prod-mcp.sh` | Rama equivalente (misma forma, credenciales de `.env.prod-mcp`). |
| `.mcp.json` | Dos entradas: `courses-mcp` → `run-local-mcp.sh`, `courses-mcp-prod` → `run-prod-mcp.sh`. |
| `CLAUDE.md` | Fila en la tabla de "Variables de entorno" describiendo la clave y su ámbito; fila en el "Inventario de MCPs"; fila en la tabla de "Configuración actual de MCPs locales" (Claude Desktop). |
| `docs/mcps/README.md` | Fila de inventario + mención en el bloque local vs. producción. |

**Convención de nombres dentro del servidor:** `courses-mcp` lee los genéricos
`API_BASE_URL` / `API_KEY` (como `attendance-mcp` y `students-mcp`), no nombres
propios. Son los wrappers quienes mapean `COURSES_ADMIN_API_KEY` → `API_KEY`.
Así el servidor no conoce el nombre de la clave y una rotación no lo toca.

### M3 — Rutas HTTP que respaldan las herramientas

Se corrige el anidamiento propuesto en el borrador: el `course_slug` va en la
**ruta**, no en query/body. Un `lesson_slug` solo es único **dentro** de un
curso, así que `/api/courses/lessons/[lessonSlug]` sería ambiguo. El anidamiento
sigue el patrón ya usado en `/api/attendance/courses/[courseId]/summary` y
`/api/assignments/groups/[groupId]/variants/[assignmentId]`.

| Método y ruta | Respalda a | Respuesta 200 |
|---|---|---|
| `GET /api/courses/[courseSlug]/lessons` | `list_course_lessons` | `{ data: { course_slug, course_title, lessons: LessonAvailability[] }, meta: { total, disabled_count, orphan_disabled_slugs } }` |
| `GET /api/courses/[courseSlug]/lessons/[lessonSlug]` | `get_lesson_availability` | `{ data: LessonAvailability }` |
| `PATCH /api/courses/[courseSlug]/lessons/[lessonSlug]` | `set_lesson_availability` | `{ data: LessonAvailability, meta: { changed: boolean } }` |

Forma de `LessonAvailability` (única en toda la API, para que las tres
herramientas devuelvan lo mismo):

```jsonc
{
  "course_slug": "estructuras-de-datos",
  "lesson_slug": "arboles-binarios",
  "title": "Árboles binarios de búsqueda",
  "order": 12,
  "kind": "lesson",            // "lesson" | "guide" (ausente en el catálogo ⇒ "lesson")
  "has_article": true,          // `articleSlug` presente Y el archivo existe en disco
  "is_disabled": true,
  "disabled_at": "2026-08-01T14:03:00.000Z", // null si is_disabled=false
  "disabled_reason": "Se abre tras la sesión del jueves" // null si no se dio o si está habilitada
}
```

`disabled_by` **no se expone**: las escrituras del MCP van con `service_role` y
siempre lo dejan en `null` (D10), y es un `uuid` de `auth.users` — exponerlo
sería filtrar identidad sin ningún uso para el agente (least privilege).

`meta.orphan_disabled_slugs` resuelve el punto que R4 dejaba "a criterio de la
Fase 5": **sí se reporta**. Son filas de `disabled_lessons` cuyo `lesson_slug`
ya no existe en el catálogo (lección renombrada o borrada en git). No se borran
automáticamente — solo se informan, para que el docente detecte la deriva.

**Autenticación y errores** (mismo esqueleto que `app/api/students/route.ts`):

| Situación | Código | Cuerpo |
|---|---|---|
| Falta o es inválida la cabecera `x-api-key` | `401` | `unauthorizedError(...)` |
| `COURSES_ADMIN_API_KEY` no configurada en el servidor | `500` | `configurationError("Servicio mal configurado.")` — nunca `401`, para no filtrar el motivo a un llamador no autenticado |
| `courseSlug` que no existe en el catálogo estático | `404` | `notFoundError("Curso no encontrado: <slug>")` |
| `lessonSlug` que no existe en ese curso | `404` | `notFoundError("Lección no encontrada en <curso>: <slug>")` |
| JSON malformado en el `PATCH` | `400` | `apiError("bad_request", "JSON malformado")` |
| Cuerpo que no cumple el esquema (`enabled` ausente o no booleano, `reason` > 280 chars, `reason` con `enabled: true`) | `422` | `validationError(fieldErrors)` |
| Fallo de Supabase | `500` | `internalError()` |

- La validación contra el catálogo ocurre **antes** de tocar Supabase: un slug
  mal escrito nunca crea una fila ni devuelve una falsa sensación de éxito.
- `reason` junto a `enabled: true` es `422`, no un campo ignorado en silencio:
  indica que el agente se equivocó de dirección y conviene que lo sepa.
- No existe `DELETE`: rehabilitar es `PATCH { "enabled": true }`. Una sola
  operación de escritura, un solo camino de auditoría.

### M4 — Contrato de las herramientas

| Herramienta | Tipo | Ruta que llama |
|---|---|---|
| `list_course_lessons` | Lectura | `GET /api/courses/{course_slug}/lessons` |
| `get_lesson_availability` | Lectura | `GET /api/courses/{course_slug}/lessons/{lesson_slug}` |
| `set_lesson_availability` | Escritura | `PATCH /api/courses/{course_slug}/lessons/{lesson_slug}` |

#### `list_course_lessons`

> **Descripción (texto exacto para el `Tool`):** "Lista todas las lecciones y
> guías del catálogo de un curso, en orden, indicando cuáles están
> deshabilitadas para los estudiantes. Úsala **antes** de abrir o cerrar una
> lección para confirmar el `lesson_slug` exacto y el estado actual."

```jsonc
{
  "type": "object",
  "properties": {
    "course_slug": {
      "type": "string",
      "description": "Slug del curso (p. ej. 'estructuras-de-datos'). Debe existir en el catálogo."
    }
  },
  "required": ["course_slug"]
}
```

- **Output:** el `data` + `meta` del `GET` de lista, tal cual.
- **Sin paginación ni filtros:** el curso más grande tiene decenas de lecciones;
  paginar añadiría estado sin beneficio, y filtrar es responsabilidad del
  consumidor (mismo compromiso #2 de "Contrato para spec-040").
- **Errores:** `course_slug` inexistente → mensaje de `404` propagado como error
  de herramienta.

#### `get_lesson_availability`

> **Descripción:** "Consulta si una lección concreta está disponible para los
> estudiantes, con la fecha y el motivo por el que se cerró, si aplica."

```jsonc
{
  "type": "object",
  "properties": {
    "course_slug": { "type": "string", "description": "Slug del curso." },
    "lesson_slug": { "type": "string", "description": "Slug de la lección dentro de ese curso." }
  },
  "required": ["course_slug", "lesson_slug"]
}
```

- **Output:** un `LessonAvailability`.
- **Errores:** curso o lección inexistentes → `404`. Nunca devuelve
  `is_disabled: false` para un slug que no existe: eso sería afirmar que una
  lección inexistente está abierta.

#### `set_lesson_availability`

> **Descripción:** "Abre (`enabled: true`) o cierra (`enabled: false`) una
> lección para los estudiantes. **Afecta a todos los grupos y semestres de ese
> curso a la vez.** El efecto es inmediato, sin desplegar. Confirma siempre con
> el docente antes de usarla."

```jsonc
{
  "type": "object",
  "properties": {
    "course_slug": { "type": "string", "description": "Slug del curso." },
    "lesson_slug": { "type": "string", "description": "Slug de la lección dentro de ese curso." },
    "enabled": {
      "type": "boolean",
      "description": "true = visible para los estudiantes; false = cerrada. Sin valor por defecto: siempre explícito."
    },
    "reason": {
      "type": "string",
      "maxLength": 280,
      "description": "Motivo del cierre, para el registro del docente (no se muestra al estudiante). Solo válido con enabled=false."
    }
  },
  "required": ["course_slug", "lesson_slug", "enabled"]
}
```

- **Output:** el `LessonAvailability` resultante + `meta.changed`.
- **`enabled` no tiene default a propósito.** Un default convertiría un olvido
  del agente en una acción sobre estudiantes reales.
- **Una sola herramienta con flag booleano**, en vez de `enable_lesson` /
  `disable_lesson`: menos superficie y el agente no puede equivocarse de
  dirección al elegir la herramienta (se confirma la decisión del borrador).
- **Idempotencia** (comportamiento exacto):

  | Estado previo | Petición | Resultado |
  |---|---|---|
  | Habilitada | `enabled: false` | `200`, se inserta la fila, `changed: true` |
  | Deshabilitada | `enabled: false` sin `reason` | `200`, fila intacta (`disabled_at` original), `changed: false` |
  | Deshabilitada | `enabled: false` con `reason` distinto | `200`, se reemplaza `reason` y se refresca `disabled_at`, `changed: true` |
  | Deshabilitada | `enabled: true` | `200`, se borra la fila, `changed: true` |
  | Habilitada | `enabled: true` | `200`, no se toca nada, `changed: false` |

  Nunca `409`: pedir el estado en el que ya se está no es un conflicto, es un
  no-op. `changed` le dice al agente si su acción tuvo efecto, para que no
  informe al docente de un cambio que no ocurrió.

### M5 — Documentación de agentes

**`docs/mcps/courses-agent.system-prompt.md` (nuevo).** Esbozo de secciones
—el archivo final se escribe en la Fase 5, siguiendo la estructura mínima de
`CLAUDE.md`:

- **Rol y propósito:** asistente del docente principal para gobernar qué
  lecciones están abiertas al grupo; no redacta contenido ni evalúa.
- **MCP(s) disponibles:** `courses-mcp` con las tres herramientas y para qué
  sirve cada una.
- **Capacidades:** consultar el catálogo y el estado; abrir y cerrar lecciones;
  reportar filas huérfanas (`orphan_disabled_slugs`) cuando aparezcan.
- **Restricciones** (las importantes, en este orden):
  1. Cerrar/abrir afecta a **todos los grupos y semestres** del `course_slug`
     (D2). Debe decirlo antes de escribir.
  2. **Confirmación explícita del docente antes de cada `set_lesson_availability`**,
     nombrando curso, lección y dirección. Nunca en lote sin repasar la lista.
  3. Llamar primero a `list_course_lessons` para confirmar el slug exacto: no
     inventar slugs ni deducirlos del título.
  4. No toca contenido, matrículas, progreso, asistencia ni evaluaciones — esos
     dominios son de otros MCPs.
  5. Deshabilitar **no borra** el progreso del estudiante (D5), pero sí lo saca
     de los conteos mientras dure; debe explicarlo si el docente pregunta por
     qué "bajó" una barra de progreso.
  6. Distinguir "deshabilitada" (decisión del docente) de "sin artículo"
     (`has_article: false`, todavía no escrita): son estados distintos y no
     debe confundirlos en sus respuestas.
- **Tono y formato:** español, breve, orientado a la acción; tras escribir,
  confirmar el estado resultante y si hubo cambio real (`changed`).

**System prompts existentes:** ninguno se modifica en este spec. `assignment-mcp`
y los subagentes de autoría tienen relación con el dominio (R3), pero
actualizarlos sin una herramienta nueva de por medio sería tocar
`docs/mcps/*.system-prompt.md` fuera de la fase que los cubre.

**Fila para `docs/mcps/README.md`** (texto propuesto):

> | `courses-mcp` | Cliente de la API `/api/courses/*` para que un agente docente consulte el catálogo de lecciones de un curso y abra o cierre lecciones a los estudiantes sin desplegar (spec-039). El estado es global por `course_slug`: afecta a todos los grupos. Autenticado con `COURSES_ADMIN_API_KEY`, propia de este dominio. | Activo | `docs/mcps/courses-agent.system-prompt.md` | `mcp-servers/courses-mcp/` |

Además, actualizar en ese README la tabla "local vs. producción" para incluir
`courses-mcp` / `courses-mcp-prod` y su credencial.

### M6 — Variantes local y `-prod`

**Se registran ambas**, `courses-mcp` y `courses-mcp-prod`, por coherencia con
los cuatro MCPs existentes: sin la variante local no se puede probar la feature
contra `npm run dev`, y sin la de producción la funcionalidad no sirve para
nada — el caso de uso real es cerrar una lección del semestre en curso.

Sobre el riesgo de escribir en producción, la valoración honesta es:

- **Es visible al instante y afecta a personas reales.** Un `enabled: false`
  equivocado deja a un grupo sin acceso a una lección hasta que alguien lo note.
- **Pero es totalmente reversible y no destruye datos.** Deshacer es un `PATCH`
  con `enabled: true`; el progreso de los estudiantes se conserva íntegro (D5) y
  el contenido nunca se toca (vive en git). No es comparable a borrar un
  estudiante o una evaluación.

Salvaguardas, por tanto, **procedimentales y de configuración**, no técnicas en
el servidor:

1. Clave de producción distinta de la local en `.env.prod-mcp` (M2).
2. El system prompt exige confirmación explícita por cada escritura y nombrar el
   entorno (M5). El sufijo `-prod` del nombre del servidor es la señal visible
   de contra qué se está operando.
3. La herramienta devuelve `changed`, de modo que el agente puede reportar con
   exactitud qué pasó y detectar un no-op inesperado.

**No** se añade un modo solo-lectura ni un `dry_run` a la variante de
producción: sería un mecanismo nuevo sin precedente en el repo (los cuatro MCPs
actuales ya escriben en producción con el mismo grado de confianza), y la
reversibilidad de esta acción no lo justifica. Si la práctica demuestra lo
contrario, es un spec posterior.

## Decisiones de diseño

### D1 — Tabla de presencia (`disabled_lessons`), no columna `enabled`

La alternativa era una tabla `lesson_settings(course_slug, lesson_slug, enabled)`
con una fila por lección. Se descarta:

- Requeriría un backfill inicial y un proceso de sincronización cada vez que se
  añade, renombra o borra una lección del catálogo en git — exactamente el
  acoplamiento que este spec quiere evitar.
- El 95% de las filas diría `enabled = true`, el valor por defecto.
- Una tabla de presencia es **autolimpiante**: si una lección desaparece del
  catálogo, su fila queda inerte, porque el estado se compone por intersección
  con el catálogo al leer (`catálogo ∩ ¬deshabilitadas`) y nunca se consulta un
  slug que el catálogo no tenga.

**Semántica: la fila existe ⇒ la lección está deshabilitada.** El default es
"habilitada", que es el comportamiento actual — el spec no cambia nada hasta que
alguien escriba la primera fila.

### D2 — Estado global por curso, no por `academic_course`

Decisión del usuario (2026-08-01), no se re-abre. Consecuencia de diseño a
registrar: la clave primaria es `(course_slug, lesson_slug)` sin
`academic_course_id`. Si el día de mañana hiciera falta por grupo, la migración
sería añadir una columna nullable `academic_course_id` con `null` = "todos los
grupos" y reemplazar la PK — camino viable, pero no se prepara ahora
(YAGNI: la tabla estaría vacía de esa dimensión).

### D3 — Gate en la página, no redirect

El estudiante que abre `/curso/leccion-7` deshabilitada **se queda en la ruta**
y ve un bloque "Lección no disponible" donde iría el artículo, con el título de
la lección visible y el sidebar intacto. No hay `redirect()` ni `notFound()`:

- Un redirect a la lección anterior desorienta (la URL cambia sin explicación) y
  choca con el redirect de reanudación de `/[courseSlug]`, que podría rebotar.
- Un `notFound()` **miente**: la lección existe, y el estudiante la está viendo
  listada en el sidebar en ese mismo momento. Sería exactamente el tipo de
  señalización deshonesta que spec-037 corrige.

El bloque reutiliza el lenguaje visual de `PreparationPlaceholder` (borde
punteado) pero con copy distinto: "Esta lección todavía no está disponible" +
"Tu docente la abrirá cuando corresponda". Se muestran los `topics` previstos,
como ya hace el placeholder, porque saber de qué tratará es útil y no adelanta
contenido.

**El artículo MDX no se carga** cuando el gate bloquea: `getLessonArticle` queda
detrás del gate, así que el contenido no viaja al cliente. No es solo un
ocultamiento visual.

### D4 — El docente dueño y el admin nunca son bloqueados

`hasCourseAccess` ya distingue `owner` / `admin` / `enrolled`
(`lib/enrollments/access.ts:11`). El gate aplica **solo** a `reason === "enrolled"`.
Owner y admin ven la lección completa, con un aviso destacado en la cabecera:
"Lección deshabilitada — los estudiantes no pueden abrirla". Es el caso de uso
que motiva la feature: el docente prepara y revisa la lección cerrada antes de
abrirla.

### D5 — Progreso previo de una lección que se deshabilita: se conserva, se descuenta

Una lección puede deshabilitarse **después** de que algunos estudiantes ya la
completaron (p. ej. se detecta un error y se cierra para corregirla).

- Las filas de `lesson_progress` **no se tocan**. Borrarlas destruiría trabajo
  real del estudiante y sería irreversible; y si la lección se reabre, el
  progreso debe reaparecer intacto.
- Pero mientras está deshabilitada, la lección **sale de los conteos**: se
  excluye del denominador *y* del numerador. Contarla solo en el numerador
  rompería el invariante `completadas ≤ total` y podría mostrar "8 de 7".
- Consecuencia visible y aceptada: a un estudiante que ya la había completado la
  barra de progreso le puede *bajar* el numerador al deshabilitarse (de 5/10 a
  4/9). Es coherente: el curso "activo" se encogió. Al reabrirla vuelve a 5/10.

### D6 — Fallar cerrado, con mensaje distinto de "deshabilitada"

`getDisabledLessonSlugs` devuelve un resultado discriminado, no un `Set` a secas:

```ts
type DisabledLessonsResult =
  | { status: "ok"; slugs: Set<string> }
  | { status: "unavailable" };
```

Ante `unavailable` (fallo de Supabase), siguiendo D8 de spec-037:

| Punto | Comportamiento |
|---|---|
| `markLessonCompleted` | **Deniega** — `{ ok: false, reason: "availability_unavailable" }` |
| `markLessonViewed` | **No escribe** (retorno silencioso, como ya hace sin usuario) |
| Página de lección (estudiante) | **Bloquea**, con copy distinto: "No pudimos verificar la disponibilidad de esta lección. Intenta de nuevo en unos minutos." — nunca el copy de "deshabilitada", que sería una explicación falsa |
| Página de lección (owner/admin) | **No bloquea**; el aviso de estado se omite |
| Sidebar | **No marca nada** como no disponible; renderiza como hoy |
| `resolveResumeLessonSlug` | Trata el set como vacío (no filtra) |

La asimetría es deliberada: el sidebar y el redirect son **navegación**, y
degradarlos en cascada durante una caída solo produce ruido; el gate real está
en la página y en las server actions, que sí fallan cerrado. En la práctica el
coste extra de bloquear la página es nulo, porque una caída de Supabase ya rompe
antes `requireCourseAccess`, que redirige al login.

### D7 — `resolveResumeLessonSlug` salta las deshabilitadas

Firma nueva: `resolveResumeLessonSlug(lessons, completedLessonSlugs, disabledLessonSlugs)`.

- La búsqueda de "primera lección sin completar" **salta** las deshabilitadas.
  Sin esto, el redirect de `/[courseSlug]` aterrizaría siempre en la primera
  lección cerrada y el curso quedaría inutilizable desde su URL raíz — el peor
  fallo posible de esta feature.
- La rama "todas completas → última lección" devuelve la última lección
  **habilitada**.
- Si **todas** las lecciones navegables están deshabilitadas, devuelve `null` y
  la página hace `notFound()`, como ya ocurre hoy con un curso sin lecciones
  navegables. Es un estado degenerado que solo se alcanza cerrando el curso
  entero a mano; queda registrado como R2.

### D8 — El bloqueo se aplica en el servidor, no en la UI

`markLessonViewed` y `markLessonCompleted` son server actions (`"use server"`)
invocables directamente desde el cliente. Ocultar el botón no es un control.
Ambas consultan la disponibilidad **en el servidor** antes de escribir. En
`markLessonCompleted` la comprobación va **antes** que la de autoevaluación:
es más barata y más determinante ("esta lección está cerrada" gana sobre
"te falta la autoevaluación").

### D9 — Sin programación temporal

Una columna `enabled_at timestamptz` que abriera la lección sola es tentadora,
pero exige decidir zona horaria, quién la evalúa (¿cada render? ¿un cron?) y qué
pasa si el docente quiere retrasarla. El usuario pidió un interruptor. Se deja
fuera y se anota como extensión futura: sería una columna nullable en la misma
tabla, sin romper nada de lo de aquí.

### D10 — Migración propuesta (diseño; **no se aplica en esta fase**)

Archivo previsto: `supabase/migrations/20260801000000_init_disabled_lessons.sql`

```sql
-- spec-039: estado de habilitación de lecciones.
-- La presencia de una fila significa que la lección está DESHABILITADA.
-- Ausencia = habilitada (el default y el comportamiento previo al spec).
-- El catálogo de lecciones sigue viviendo en git (lib/courses/data/*.ts);
-- esta tabla solo guarda el estado que debe ser mutable en runtime, porque
-- el filesystem de Vercel es de solo lectura.

create table public.disabled_lessons (
  course_slug   text        not null,
  lesson_slug   text        not null,
  disabled_at   timestamptz not null default now(),
  disabled_by   uuid        references auth.users(id) on delete set null,
  reason        text,

  primary key (course_slug, lesson_slug)
);

-- Sin índices adicionales: la única consulta de lectura es
--   select lesson_slug from disabled_lessons where course_slug = $1
-- y la PK (course_slug, lesson_slug) ya la sirve por prefijo.
-- `disabled_by` es nullable a propósito: las escrituras vía service_role
-- (MCP) no tienen un auth.uid() asociado.

comment on table public.disabled_lessons is
  'spec-039: lecciones cerradas al estudiante. La fila existe => deshabilitada.';
```

Archivo previsto: `supabase/migrations/20260801000001_rls_disabled_lessons.sql`

```sql
-- Helpers de acceso por course_slug. Espejo de public.has_role
-- (20260623000002_rls_policies.sql): security definer + search_path fijo,
-- para que la política no dependa de las políticas de las tablas que consulta.

create or replace function public.has_course_slug_access(uid uuid, slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.has_role(uid, 'admin')
    or exists (
      select 1 from public.academic_courses ac
      where ac.course_slug = slug and ac.teacher_id = uid
    )
    or exists (
      select 1
      from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where ac.course_slug = slug
        and e.student_id = uid
        and e.status = 'active'
    );
$$;

create or replace function public.is_course_slug_teacher(uid uuid, slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.has_role(uid, 'admin')
    or exists (
      select 1 from public.academic_courses ac
      where ac.course_slug = slug and ac.teacher_id = uid
    );
$$;

alter table public.disabled_lessons enable row level security;

-- SELECT: cualquiera con acceso al curso (estudiante matriculado activo,
-- docente dueño o admin). Un visitante no autenticado no lee nada: las rutas
-- de curso ya son privadas tras requireCourseAccess, y esto es defensa en
-- profundidad, no el control primario.
create policy "disabled_lessons_select_course_access" on public.disabled_lessons
  for select
  to authenticated
  using (public.has_course_slug_access(auth.uid(), course_slug));

-- INSERT / DELETE: solo docente dueño del course_slug o admin.
-- No hay política de UPDATE: el estado es binario y se modela como
-- presencia/ausencia de fila; "rehabilitar" es un DELETE, no un UPDATE.
-- Cambiar `reason` de una lección ya cerrada = delete + insert.
create policy "disabled_lessons_insert_teacher" on public.disabled_lessons
  for insert
  to authenticated
  with check (public.is_course_slug_teacher(auth.uid(), course_slug));

create policy "disabled_lessons_delete_teacher" on public.disabled_lessons
  for delete
  to authenticated
  using (public.is_course_slug_teacher(auth.uid(), course_slug));

-- service_role bypasa RLS: es la vía que usan las API routes de
-- /api/courses/lessons/* (autenticadas con x-api-key), igual que el resto
-- de rutas de servicio del proyecto.
```

> Recordatorio de proceso: la migración se prueba primero en la instancia de
> desarrollo de `mirp-lab` (`rsync` + `supabase db reset`) y solo se aplica a
> producción con confirmación explícita del usuario. Ver `CLAUDE.md` →
> "Base de datos".

## Contrato para spec-040

spec-040 (nota de autoevaluaciones) calcula un promedio cuyo **denominador son
las lecciones habilitadas que el estudiante ya vio**. Este spec expone para ello:

```ts
// lib/courses/availability.ts
export type DisabledLessonsResult =
  | { status: "ok"; slugs: Set<string> }
  | { status: "unavailable" };

export async function getDisabledLessonSlugs(
  courseSlug: string
): Promise<DisabledLessonsResult>;

export async function isLessonDisabled(
  courseSlug: string,
  lessonSlug: string
): Promise<{ status: "ok"; disabled: boolean } | { status: "unavailable" }>;
```

Compromisos que spec-039 asume frente a spec-040:

1. `getDisabledLessonSlugs` se envuelve en `cache()` de React (igual que
   `hasCourseAccess`), así que llamarla varias veces dentro del mismo render no
   multiplica consultas. spec-040 puede invocarla libremente.
2. Devuelve **todos** los slugs deshabilitados del curso, sean lecciones o
   guías, sin filtrar por `kind`. Filtrar es responsabilidad del consumidor.
3. Nunca lanza: los fallos se codifican en `status: "unavailable"`. spec-040
   debe decidir explícitamente qué hacer en ese caso — la recomendación es
   **no calcular la nota** y señalarlo, en lugar de calcularla sobre un
   denominador posiblemente inflado.
4. La firma no cambia sin actualizar spec-040. Si spec-040 necesita además la
   fecha (`disabled_at`), se añade una función nueva, no se modifica esta.

## Fases de implementación

### Fase 1 — Esquema y RLS

- [x] Crear `supabase/migrations/20260801000000_init_disabled_lessons.sql` con
      el DDL de D10.
- [x] Crear `supabase/migrations/20260801000001_rls_disabled_lessons.sql` con
      los helpers y las políticas de D10.
- [x] `rsync` de ambas migraciones a `mirp-lab` y `supabase db reset` allá;
      verificar que el esquema queda íntegro y que los `GRANT`s de
      `anon`/`authenticated`/`service_role` siguen presentes (ver nota de
      mantenimiento del CLI en `CLAUDE.md`) — se repitieron a mano, como la
      nota anticipaba: la instancia recién reseteada no los otorgó solos.
- [ ] Verificar RLS a mano en desarrollo: un estudiante matriculado lee la
      tabla; un estudiante de otro curso no; ningún estudiante puede insertar.
      **Diferido a la Fase 6** (`TC-016`–`TC-019` de `test-039`): la base recién
      reseteada no tiene datos de prueba y montarlos aquí duplicaría el trabajo
      de la ronda manual. Verificado en su lugar, de forma estática: las tres
      políticas (`select`/`insert`/`delete`) y los dos helpers `security
      definer` existen tal como los define D10 (`pg_policies`, `pg_proc`).

### Fase 2 — Capa de lectura y composición con el catálogo

- [x] Crear `lib/courses/availability.ts` con `DisabledLessonsResult`,
      `getDisabledLessonSlugs` (envuelta en `cache()`) e `isLessonDisabled`.
- [x] Extender `OutlineNode` con `isDisabled: boolean` y hacer que
      `buildCourseOutline(course, disabledLessonSlugs?)` lo calcule.
- [x] Extender `countProgressibleLessons(course, disabledLessonSlugs?)` para
      excluir las deshabilitadas.
- [x] Extender `resolveResumeLessonSlug` con el tercer parámetro
      `disabledLessonSlugs` según D7.
- [x] Re-exportar lo nuevo desde `lib/courses/index.ts`.
- [x] Confirmar que los tres consumidores actuales de `buildCourseOutline` y
      `countProgressibleLessons` siguen compilando (parámetro opcional).

### Fase 3 — Bloqueo en servidor (server actions)

- [x] Añadir `lesson_disabled` y `availability_unavailable` a
      `MarkLessonCompletedResult` en `lib/progress/types.ts`.
- [x] `markLessonCompleted`: comprobar disponibilidad **antes** que la
      autoevaluación; fallar cerrado según D6/D8.
- [x] `markLessonViewed`: no escribir si la lección está deshabilitada o si la
      disponibilidad no se puede verificar.
- [x] Revisar `markLessonUncompleted`: **sí** debe seguir permitida sobre una
      lección deshabilitada (deshacer nunca se bloquea; documentarlo con un
      comentario en el código, porque el *por qué* no es obvio).
- [x] Propagar los nuevos `reason` a los mensajes de `LessonClosureFlow`.

### Fase 4 — UI: página de lección, sidebar y conteos

- [x] Crear `components/courses/LessonUnavailable.tsx` con los dos copies de D6
      (deshabilitada / no verificable) y la lista de `topics`.
- [x] `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`: aplicar el gate solo a
      `reason === "enrolled"`; no cargar el artículo cuando bloquea; cortar
      `markLessonViewed`, autoevaluación y asistencia; mostrar el aviso de
      "deshabilitada" a owner/admin.
- [x] `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx`: leer las
      deshabilitadas y pasarlas al sidebar (ambas instancias, escritorio y
      móvil).
- [x] `LessonSidebar` / `LessonSidebarItem`: render sin `Link`, etiqueta
      "No disponible", `aria-disabled`; distinguirlo visualmente del actual
      "Próximamente" (lección sin artículo), que es otra cosa.
- [x] Ajustar el conteo de `CourseProgressBar` según D5.
- [x] `app/(cursos)/[courseSlug]/page.tsx`: pasar las deshabilitadas a
      `resolveResumeLessonSlug`.
- [x] `app/cuenta/cursos/[enrollmentId]/page.tsx`: `totalCount` y
      `completedCount` sobre lecciones habilitadas (hoy `totalCount` usa
      `course.lessons.length`, que además incluye guías — corregirlo aquí
      entra en scope porque el conteo se toca de todos modos).
- [x] Revisar `DESIGN.md` y usar tokens semánticos; no introducir valores crudos
      de la paleta.

### Fase 5 — MCP: crear `courses-mcp`

> Ejecutada por **@mcp-builder** sobre el contrato cerrado de "Evaluación MCP"
> (M1–M6). Cualquier desviación de ese contrato se consulta con el usuario antes
> de implementarla.

**5.1 — Credencial y configuración de entorno (M2)**

- [x] Añadir `COURSES_ADMIN_API_KEY=` a `.env.example` (bloque de variables de
      la APP) con el comentario de por qué es una clave propia, y
      `COURSES_API_BASE_URL=http://localhost:3000/api/courses` en el bloque de
      clientes MCP.
- [x] Generar el valor de desarrollo en `.env.local` (no versionado).
- [x] Generar el valor de producción, **distinto**, en `.env.prod-mcp`
      (no versionado); dejar anotado que debe cargarse en Vercel → Production
      antes de desplegar el spec.
- [x] Añadir la rama `courses-mcp)` al `case` de `mcp-servers/run-local-mcp.sh`
      (`API_BASE_URL` derivada de `$API_ORIGIN/api/courses`, `API_KEY` desde
      `COURSES_ADMIN_API_KEY`) y la equivalente en `run-prod-mcp.sh`.

**5.2 — Capa de servicio y API (M3)**

- [x] Crear `lib/courses/service.ts` (`service_role`, espejo de
      `lib/attendance/service.ts`) con: composición catálogo × `disabled_lessons`
      para un curso, lectura de una lección y escritura idempotente según la
      tabla de M4; y la detección de `orphan_disabled_slugs`.
- [x] Crear `app/api/courses/[courseSlug]/lessons/route.ts` (`GET`).
- [x] Crear `app/api/courses/[courseSlug]/lessons/[lessonSlug]/route.ts`
      (`GET` + `PATCH`), con `authenticateServiceRequest(req,
      "COURSES_ADMIN_API_KEY")`, esquema Zod del cuerpo del `PATCH` y los
      helpers de `lib/api/errors.ts`; `runtime = "nodejs"` y
      `dynamic = "force-dynamic"` como el resto de rutas de servicio.
- [x] Verificar que la validación contra el catálogo estático ocurre **antes**
      de cualquier consulta a Supabase.

**5.3 — Servidor MCP**

- [x] Crear `mcp-servers/courses-mcp/` (`src/index.ts`, `src/tools.ts`,
      `src/api.ts`, `package.json`, `tsconfig.json`, `.env.example`) copiando la
      estructura de `students-mcp`; el servidor lee los genéricos
      `API_BASE_URL` / `API_KEY` y hace `exit(1)` si faltan.
- [x] Implementar las tres herramientas con los `inputSchema` literales de M4.
- [x] `npm install && npm run build` dentro del servidor.
- [x] Registrar `courses-mcp` y `courses-mcp-prod` en `.mcp.json`.

**5.4 — Documentación (M5)**

- [x] Añadir la fila de `courses-mcp` al inventario de `docs/mcps/README.md` y
      actualizar allí la tabla "local vs. producción".
- [x] Crear `docs/mcps/courses-agent.system-prompt.md` con las secciones
      esbozadas en M5, incluyendo las seis restricciones tal como están
      enumeradas.
- [x] Actualizar `CLAUDE.md`: inventario de MCPs, tabla de variables de entorno
      (`COURSES_ADMIN_API_KEY`) y tabla de MCPs locales de Claude Desktop.

**5.5 — Verificación (todos los checks deben pasar antes de cerrar la fase)**

- [x] `./mcp-servers/run-local-mcp.sh courses-mcp </dev/null` arranca e imprime
      la línea de inicio sin errores de variables faltantes.
- [x] Con `npm run dev` corriendo, `list_course_lessons` sobre un curso real
      devuelve todas sus lecciones en orden, con `is_disabled: false`.
- [x] `set_lesson_availability { enabled: false, reason: "..." }` responde
      `changed: true`, y `get_lesson_availability` confirma `is_disabled: true`
      con ese `disabled_reason`.
- [x] Repetir la misma llamada sin `reason` → `200` con `changed: false`
      (idempotencia), y `disabled_at` sin cambios.
- [x] `set_lesson_availability { enabled: true }` reabre y `changed: true`;
      repetirlo → `changed: false`.
- [x] `lesson_slug` inexistente → error `404` y **cero** filas nuevas en
      `disabled_lessons` (verificar en la base de desarrollo).
- [x] `course_slug` inexistente → error `404`.
- [x] `reason` junto a `enabled: true` → `422`.
- [x] Petición sin `x-api-key`, o con `QUESTION_BANK_API_KEY` en su lugar →
      `401` (confirma que la separación de claves de M2 es efectiva).
- [x] Fila huérfana simulada (insertar un `lesson_slug` que no está en el
      catálogo) → aparece en `meta.orphan_disabled_slugs` y **no** rompe
      `list_course_lessons`; borrarla al terminar.

**Criterios de aceptación de la fase**

- Las tres herramientas responden exactamente el contrato de M3/M4 (forma de
  `LessonAvailability`, códigos de error, `changed`).
- `/api/courses/*` autentica **solo** con `COURSES_ADMIN_API_KEY`; ninguna otra
  clave del proyecto abre esas rutas.
- `docs/mcps/README.md`, `docs/mcps/courses-agent.system-prompt.md` y `CLAUDE.md`
  describen el MCP tal como quedó implementado, sin herramientas fantasma.
- Ningún system prompt existente de `docs/mcps/` fue modificado.
- La fase queda cerrada **antes** de la Fase 6, para que `@tester` pueda cubrir
  los casos `TC-MCP-039-*`.

### Fase 6 — Pruebas

- [ ] Ejecutar los casos manuales de `docs/testing/test-039-lecciones-habilitadas.md`
      con el usuario, siguiendo el protocolo de pruebas asistidas.
- [ ] Invocar `@tester` para las pruebas automáticas (cuando exista framework).
- [ ] Registrar hallazgos y limpiar los datos de prueba (borrar las filas de
      `disabled_lessons` creadas durante la ronda).

## Criterios de aceptación

**Estudiante**

1. Una lección deshabilitada **sigue apareciendo** en el índice lateral del
   curso, con su número de clase, marcada como "No disponible" y sin enlace.
2. Al navegar directamente a la URL de una lección deshabilitada, el estudiante
   permanece en esa ruta y ve el bloque "Lección no disponible" — no un 404, no
   un redirect — con los temas previstos y sin el contenido del artículo.
3. El contenido del artículo MDX de una lección deshabilitada **no aparece** en
   el HTML ni en el payload RSC que recibe el estudiante.
4. Una lección deshabilitada no puede marcarse como completada: aunque se invoque
   la server action directamente, devuelve `{ ok: false, reason: "lesson_disabled" }`
   y no se escribe ninguna fila en `lesson_progress`.
5. Visitar una lección deshabilitada no crea ni actualiza su `viewed_at`.
6. La barra de progreso y el "N de M lecciones completadas" del detalle de
   matrícula excluyen las lecciones deshabilitadas del numerador y del
   denominador; `N ≤ M` siempre.
7. Entrar a `/[courseSlug]` redirige a la primera lección **habilitada** sin
   completar, saltando las deshabilitadas.
8. Una lección que ya estaba completada y luego se deshabilita conserva su fila
   en `lesson_progress`; al volver a habilitarse reaparece como completada.

**Docente / admin**

9. El docente dueño del curso y el admin pueden abrir una lección deshabilitada
   y ven su contenido completo, con un aviso de que está cerrada para los
   estudiantes.

**Resiliencia**

10. Si la consulta de disponibilidad falla, el estudiante no puede completar la
    lección y ve un mensaje que dice que **no se pudo verificar** la
    disponibilidad — distinto del mensaje de "lección deshabilitada".

**MCP**

11. `list_course_lessons` con un `course_slug` válido devuelve el catálogo
    ordenado con el campo `is_disabled` correcto para cada lección.
12. `set_lesson_availability` con `enabled: false` cierra la lección, y el efecto
    es visible para el estudiante sin desplegar ni reiniciar la app.
13. `set_lesson_availability` con `enabled: true` sobre una lección ya habilitada
    devuelve éxito (idempotente), no un error.
14. `set_lesson_availability` con un `lesson_slug` inexistente en el catálogo
    devuelve `404` y **no** crea ninguna fila.
15. Deshabilitar una lección afecta a todos los grupos del mismo `course_slug`
    a la vez.
16. `set_lesson_availability` informa en `meta.changed` si la operación cambió
    algo: `true` la primera vez, `false` al repetirla sin variar el `reason`.
17. `list_course_lessons` reporta en `meta.orphan_disabled_slugs` las filas de
    `disabled_lessons` cuyo slug ya no existe en el catálogo, sin fallar (R4).

**Seguridad**

18. Un estudiante autenticado no puede insertar ni borrar filas en
    `disabled_lessons` (RLS lo rechaza), ni siquiera para su propio curso.
19. Un estudiante no puede leer las filas de `disabled_lessons` de un curso en el
    que no está matriculado.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver `CLAUDE.md` → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-039-lecciones-habilitadas.md` — 19 casos
  `TC-001`–`TC-019` (flujos de UI: sidebar, gate de la página, progreso, vista
  docente, seguridad/RLS, resiliencia) y 13 casos `TC-MCP-001`–`TC-MCP-013`
  (las tres herramientas de `courses-mcp`, siguiendo la nomenclatura de
  `CLAUDE.md` → "Pruebas manuales — estructura del archivo"). Escrito, con
  todos los casos en ⬜ Pendiente de ejecución (Fase 6).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-039-lecciones-habilitadas.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio (cuando exista
  framework de testing). Candidatos naturales a prueba unitaria pura, sin
  navegador: `resolveResumeLessonSlug` con lecciones deshabilitadas (D7) y la
  composición de conteos de D5.

## Riesgos y puntos abiertos

- **R1 — Coste de lectura por render.** Cada render del layout y de la página de
  lección añade una consulta a `disabled_lessons`. Mitigado con `cache()` de
  React (una consulta por request, no por componente). Las rutas ya son
  `force-dynamic` y hacen varias consultas a Supabase, así que el delta es
  marginal; aun así, conviene medirlo en la ronda de pruebas.
- **R2 — Curso completamente cerrado.** Si se deshabilitan todas las lecciones
  navegables, `/[courseSlug]` responde `notFound()`. Es coherente con el
  comportamiento actual de un curso sin lecciones navegables, pero es un 404
  poco informativo. Se acepta en este spec; si molesta en la práctica, un spec
  posterior puede darle una pantalla propia.
- **R3 — Evaluaciones huérfanas.** Una lección deshabilitada puede tener un
  `assignment` publicado apuntando a su `lesson_slug`. Este spec **no** toca el
  ciclo de vida de las evaluaciones: el estudiante podría llegar a la evaluación
  por la ruta de evaluaciones aunque la lección esté cerrada. Fuera de scope,
  pero debe registrarse en `docs/specs/backlog.md` al implementar.
- **R4 — Deriva de slugs.** Si una lección se renombra en git mientras está
  deshabilitada, la fila queda huérfana y la lección reaparece habilitada con su
  slug nuevo, en silencio. Es la contrapartida aceptada de D1. Mitigación: la
  herramienta `list_course_lessons` compone contra el catálogo, así que el
  docente ve el estado real. **Resuelto en M3:** el `GET` de lista reporta las
  filas huérfanas en `meta.orphan_disabled_slugs`; no se borran automáticamente,
  solo se informan.
- **R5 — Ámbito de la clave de API. CERRADO (2026-08-01, @mcp-builder).**
  `courses-mcp` usa una `COURSES_ADMIN_API_KEY` **propia**; no reutiliza
  `QUESTION_BANK_API_KEY`. Justificación completa y lista de archivos a tocar en
  "Evaluación MCP → M2". Riesgo residual: una variable de entorno más que
  sincronizar entre `.env.local`, `.env.prod-mcp` y Vercel; si falta en
  producción, las rutas responden `500 configuration_error` (no `401`), lo que
  hace el fallo diagnosticable.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-01
