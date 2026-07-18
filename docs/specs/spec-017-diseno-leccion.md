# spec-017 — [DONE] Rediseño del cierre de lección y bloqueo por autoevaluación

## Contexto

La página de lección `/[courseSlug]/[lessonSlug]` acumula funcionalidad de tres
specs previos (spec-009 progreso, spec-010 asistencia, spec-011 autoevaluación)
que se fueron apilando dentro de `LessonClosure`. El resultado presenta cuatro
problemas visibles y una carencia pedagógica:

1. **Bloques de código con doble contenedor.** En `lib/mdx/components.tsx` el
   mapping de `code` (líneas 132-137) aplica el estilo de *inline code*
   (`rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5`) a **todos** los
   `<code>`, incluidos los que rehype-pretty-code coloca dentro del `<pre>` ya
   estilado en las líneas 126-131 (`border` + `bg-gray-50` + `p-4`). Se ven dos
   cajas anidadas con dos fondos distintos. Además la fuente `text-sm` resulta
   pequeña para leer código en pantalla de escritorio.

2. **Orden del cierre poco pedagógico.** Hoy
   (`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:57-84`) el flujo es
   contenido → paginación → `LessonClosure`{ botón Completar → Asistencia →
   Autoevaluación }. El estudiante encuentra el botón de "Completar lección"
   *antes* de haber hecho la autoevaluación, y la navegación a la siguiente
   lección queda separada del cierre.

3. **Autoevaluación fragmentada.** `SelfAssessmentSection` está limitada a
   `max-w-2xl` (línea 96) y cada pregunta es una tarjeta con borde propio
   (línea 109): visualmente son N bloques sueltos en media columna, no un
   ejercicio unitario.

4. **Sin señal de avance global.** El sidebar (`LessonSidebar`) marca lecciones
   completadas una a una, pero el estudiante no ve cuánto lleva del curso. El
   layout ya calcula `completedLessonSlugs`
   (`app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx:23-28`), así que el dato
   ya está disponible sin consultas adicionales.

5. **La autoevaluación es opcional de facto.** Nada impide marcar la lección como
   completada sin haberla respondido, con lo que el instrumento formativo pierde
   su función. Se introduce la regla: **una lección con autoevaluación publicada
   no puede marcarse como completada hasta haberla enviado.**

El punto 5 obliga a revertir una decisión de spec-011 (ver
"Decisiones de arquitectura → Decisión D1"): la autoevaluación pasa a **persistir
en base de datos**, porque una regla de negocio server-side no puede apoyarse en
estado efímero de cliente.

---

## Alcance

### Incluye

- **Render de código MDX:** separar el estilo de código inline del de bloque en
  `lib/mdx/components.tsx` y `app/globals.css`; dejar un único contenedor con
  bordes redondeados y subir el tamaño de fuente del bloque.
- **Reordenamiento del cierre de lección:** contenido → Autoevaluación →
  Asistencia → Finalizar lección + navegación a la siguiente lección.
- **Aplanado de `LessonClosure`:** las tres secciones de cierre pasan a ser
  hermanas renderizadas por `page.tsx`, no hijas de `LessonClosure`.
- **Rediseño de `SelfAssessmentSection`:** un solo contenedor a ancho completo de
  la columna de contenido, con las preguntas como divisiones internas.
- **Alineación de anchos** de `AttendanceSection` y `LessonClosure` al mismo
  ancho de la columna de contenido.
- **Barra de progreso del curso** en `LessonSidebar` (cubre escritorio y el
  drawer móvil, que reutiliza el mismo componente).
- **Regla de negocio de bloqueo** con persistencia en BD: nueva tabla
  `self_assessment_attempts`, migración, políticas RLS, nueva Server Action de
  envío y validación server-side en `markLessonCompleted`.

### No incluye

- **Bloquear la copia del código** (`user-select: none`, deshabilitar el menú
  contextual o similar). Decisión explícita del usuario: **no se implementa**.
  Justificación en "Decisiones de arquitectura → Decisión D2".
- **Persistir respuesta por respuesta.** El intento se registra de forma agregada
  (cuántas preguntas, cuántas respondidas, cuántas correctas). Una tabla
  `self_assessment_attempt_answers` con el detalle por opción queda para un spec
  futuro si aparece la necesidad analítica.
- **Nota o calificación.** La autoevaluación sigue siendo formativa: el criterio
  de "terminada" es haber respondido y enviado, no acertar.
- **Vista docente de intentos de autoevaluación** (quién respondió, qué falló).
  La política RLS de lectura se limita al propio estudiante y a `admin`; la
  visibilidad para el docente del curso se difiere.
- **Backfill de datos históricos.** Las lecciones ya completadas antes de esta
  regla no se tocan ni se recalculan.
- **Rediseño de `LessonPagination`** más allá de moverla de posición.
- **Cambios en el banco de preguntas** (`lib/questions`, panel de docente) ni en
  la asistencia más allá del ancho del contenedor.

---

## Impacto en el sistema

### Rutas y páginas

| Archivo | Cambio |
|---|---|
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Reordenar el árbol de render (líneas 57-84); aplanar `LessonClosure`; leer el estado de autoevaluación y pasarlo como prop |
| `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx` | Pasar el conteo de lecciones completadas/total a `LessonSidebar` (el `Set` ya existe, líneas 23-28) |

### Componentes

| Archivo | Cambio |
|---|---|
| `components/courses/LessonClosure.tsx` | Deja de renderizar `AttendanceSection` y `SelfAssessmentSection` (líneas 100-116); pasa a ser solo el bloque "Finalizar lección"; nuevas props de bloqueo; quitar `max-w-2xl` (línea 53) |
| `components/courses/SelfAssessmentSection.tsx` | Contenedor único (quitar `max-w-2xl` línea 96 y el borde por pregunta línea 109); envío único con todas las respuestas; validación de "todas respondidas"; estado de "ya enviada" |
| `components/courses/AttendanceSection.tsx` | Quitar `max-w-2xl` (líneas 98, 140, 176); envolver como tarjeta coherente con las demás |
| `components/courses/LessonSidebar.tsx` | Montar `CourseProgressBar` entre el bloque de título (línea 33) y el `<ol>` (línea 34) |
| `components/courses/CourseProgressBar.tsx` | **Nuevo.** Server Component sin JS de cliente |
| `components/courses/LessonPagination.tsx` | Sin cambios internos; solo cambia su posición en `page.tsx` |
| `components/courses/LessonSidebarMobile.tsx` | **Sin cambios.** Recibe `LessonSidebar` como `children` desde el layout (líneas 43-49), así que hereda la barra automáticamente |

### Render de MDX

| Archivo | Cambio |
|---|---|
| `lib/mdx/components.tsx` | Dividir el mapping de `code` (líneas 132-137) en inline vs. bloque; ajustar `pre` (líneas 126-131): tamaño de fuente y contenedor único |
| `app/globals.css` | Consolidar la regla `code[data-inline-code]` (líneas 73-77) para que no duplique lo que ya define el componente; verificar la cascada con el bloque shiki (líneas 55-71) |

### Lógica de dominio

| Archivo | Cambio |
|---|---|
| `lib/progress/index.ts` | `markLessonCompleted` (líneas 64-87) valida la autoevaluación server-side y cambia su firma de `Promise<void>` a un resultado tipado |
| `lib/progress/types.ts` | Nuevo tipo `MarkLessonCompletedResult` |
| `lib/self-assessment/index.ts` | Nueva acción `submitSelfAssessment`; nueva lectura `getSelfAssessmentStatus`; se retira `checkSelfAssessmentAnswer` (líneas 78-161), cuyo único consumidor es `SelfAssessmentSection.tsx:71` |
| `lib/self-assessment/types.ts` | Nuevos tipos `SelfAssessmentStatus`, `SubmitSelfAssessmentResult`, `QuestionFeedback` (hoy declarado localmente en `SelfAssessmentSection.tsx:17-22`) |

### Base de datos

| Archivo | Cambio |
|---|---|
| `supabase/migrations/20260718000000_init_self_assessment_attempts.sql` | **Nuevo.** Tabla `self_assessment_attempts` + índices |
| `supabase/migrations/20260718000001_rls_self_assessment_attempts.sql` | **Nuevo.** `enable row level security` + políticas |

Tabla `public.self_assessment_attempts`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `user_id` | `uuid not null` | `references auth.users(id) on delete cascade` |
| `course_slug` | `text not null` | |
| `lesson_slug` | `text not null` | |
| `submitted_at` | `timestamptz not null` | `default now()` |
| `question_count` | `int not null` | preguntas publicadas al momento del envío |
| `answered_count` | `int not null` | debe igualar a `question_count` (constraint) |
| `correct_count` | `int not null` | informativo, sin efecto en la nota |

- Índice: `(user_id, course_slug, lesson_slug)` — sostiene la única consulta de
  lectura (`¿existe algún intento?`).
- Índice: `(user_id, course_slug)` — para futuras vistas de curso.
- `check (answered_count = question_count and question_count > 0)`: la tabla no
  admite intentos parciales ni intentos de lecciones sin preguntas.
- **Sin `unique`**: es una bitácora de intentos, se permite reintentar.

### Auth / Storage

Sin cambios. No se introducen nuevos roles ni buckets. Todas las escrituras
ocurren con la sesión del propio estudiante (clave publishable + RLS); no
interviene `SUPABASE_SERVICE_ROLE_KEY`.

---

## Evaluación MCP

**¿Aplica MCP?** Sí, en principio — pero se **recomienda diferir** su implementación a un spec propio en lugar de incluirla en spec-017 (ver recomendación final).

### Análisis por criterio (`CLAUDE.md` → "Criterios para evaluar si una funcionalidad requiere MCP")

1. **¿Expone datos nuevos que un agente podría necesitar consultar?** Sí. `self_assessment_attempts` registra, por primera vez de forma persistente, *quién terminó la autoevaluación de qué lección y con qué desempeño*. Es exactamente el tipo de dato de seguimiento que spec-011 anticipó como candidato a MCP ("si en el futuro se decide **persistir** resultados de autoevaluación… esa lectura sí sería candidata a MCP"). El paralelo con `attendance-mcp` es directo: ambas son tablas de seguimiento por estudiante/lección-sesión, ambas se consultarían en solo lectura para reportes docentes (¿quién completó su autoevaluación?, ¿qué % de aciertos tiene el curso?, ¿qué estudiantes no la han hecho?).
2. **¿Permite acciones que un agente debería poder ejecutar?** No. El *registro* del intento lo genera el flujo del propio estudiante (Server Action de autoevaluación), no una acción que un agente docente dispararía. Ningún agente necesita "crear" o "mutar" un intento; como mucho, **leerlos**.
3. **¿Ya existe un MCP de un dominio relacionado?** Sí, dos candidatos:
   - `attendance-mcp` — dominio de **seguimiento de estudiantes por lección/sesión**, hoy 100% lectura. Es el más afín: "¿quién asistió?" y "¿quién completó su autoevaluación?" son la misma clase de pregunta (seguimiento, no contenido).
   - `question-bank-mcp` — dominio de **CRUD del banco de preguntas** (autoría docente), no de resultados de estudiantes. Extenderlo mezclaría "gestionar el banco" con "consultar quién lo respondió", dos audiencias y niveles de riesgo distintos.

   **Conclusión:** si se construye, la extensión natural es **`attendance-mcp`**. No se justifica un MCP nuevo: el patrón de herramientas de lectura (listar, filtrar por curso/lección, resumir por estudiante) ya existe y es reutilizable.
4. **¿Hay un agente en `docs/mcps/` que se beneficiaría?** Sí, el **Attendance Agent** (`docs/mcps/attendance-agent.system-prompt.md`) ganaría una vista más completa del seguimiento del estudiante en la lección — pero su system prompt está delimitado explícitamente a asistencia, por lo que extenderlo requeriría revisar su alcance declarado, no solo agregarle una herramienta.

### Por qué NO se incluye la fase de MCP en spec-017

- **El alcance de spec-017 es de diseño/UI** más una regla de negocio server-side puntual. Añadir la construcción de herramientas MCP desbordaría ese alcance y mezclaría dos tipos de cambio con distinto ritmo de aprobación.
- El esquema exacto de `self_assessment_attempts` (qué se guarda del intento, RLS, migración) **se está definiendo en este mismo spec**. Construir un MCP sobre un esquema aún no estabilizado es prematuro.
- No hay necesidad inmediata declarada de que un agente consuma este dato hoy, a diferencia de `attendance-mcp`, que nació junto a un caso de uso docente concreto.

### Si se aprueba diferir (recomendado)

- **MCP existente a modificar (en spec futuro):** `attendance-mcp` — agregar herramientas de lectura, p. ej. `get_self_assessment_summary(course_slug, lesson_slug?)` → estudiantes con `submitted_at`, aciertos/total; y `list_self_assessment_attempts` filtrable por curso/lección/estudiante. Firmas exactas y contrato de output se diseñarán en ese spec.
- **System prompt afectado (en spec futuro):** `docs/mcps/attendance-agent.system-prompt.md` — ampliar su "Rol y propósito" más allá de asistencia pura, o evaluar un agente de seguimiento más amplio si el scope crece.
- **Registrar en `docs/specs/backlog.md`:** "Exponer resultados de autoevaluación (`self_assessment_attempts`) vía MCP de seguimiento docente — extender `attendance-mcp` o evaluar un agente de seguimiento más amplio, una vez la tabla y su RLS estén estables (post spec-017)."

**Recomendación explícita:** no incluir fase de MCP en spec-017; registrar la extensión de `attendance-mcp` en `docs/specs/backlog.md` para evaluarla en un spec propio una vez la tabla `self_assessment_attempts` y su RLS estén en `[DONE]`.

---

## Decisiones de arquitectura

### Decisión D1 — La autoevaluación pasa a persistir en BD (revierte spec-011)

`spec-011-autoevaluacion-cierre.md` decidió explícitamente **no persistir nada**
(ver su "Alcance → No incluye" y su "Decisión 9 — Persistencia efímera"): las
respuestas vivían solo en el estado del cliente y la corrección era un cálculo
server-side sin escritura.

Esa decisión se revierte conscientemente en este spec. Motivo: la nueva regla de
negocio ("no se puede completar la lección sin haber enviado la autoevaluación")
es una condición de autorización sobre una escritura (`markLessonCompleted`), y
una condición de autorización **no puede depender de estado que solo existe en el
navegador** — sería trivialmente evitable invocando la Server Action
directamente.

El propio spec-011 anticipó este camino: *"Si en el futuro se decide persistir
resultados de autoevaluación […] se evaluará en el spec que introduzca esa
persistencia"* (líneas 175-177). Este es ese spec.

`spec-011` **no se edita**: queda como registro histórico de la decisión vigente
en su momento. Esta sección es la referencia cruzada que documenta el cambio.

Se persiste el **intento agregado**, no la respuesta por respuesta: es lo mínimo
que sostiene la regla de negocio, y evita comprometerse con un esquema de
respuestas antes de saber qué análisis se necesitará.

### Decisión D2 — No se bloquea la copia del código

Se evaluó impedir que el estudiante copie los bloques de código
(`user-select: none`, bloqueo de `copy`/`contextmenu`). **No se implementa.**

Razones:

- **Es un disuasor débil, no un control.** El contenido llega al navegador como
  texto plano en el HTML: se lee desde "ver código fuente", desde devtools, desde
  el DOM en consola, o desde el propio repositorio de contenido MDX en Git. Un
  bloqueo de selección solo detiene a quien no tenía intención de saltárselo.
- **Rompe accesibilidad.** `user-select: none` impide la selección con teclado y
  degrada el comportamiento de lectores de pantalla y de herramientas de
  traducción o de aumento. Contradice el compromiso de accesibilidad del
  proyecto y falla WCAG 2.2 en navegación por teclado.
- **Es hostil al caso de uso legítimo.** El material es de programación: copiar
  un fragmento para ejecutarlo es exactamente lo que se quiere que el estudiante
  haga.
- **Coste de mantenimiento sin retorno.** Requiere manejar excepciones (inline
  code, tablas, KaTeX) y se rompe con cada cambio del pipeline de MDX.

Si en el futuro aparece una necesidad real de control de integridad académica, el
camino correcto es evaluar el ejercicio (tests, revisión), no ocultar el texto.

### Decisión D3 — El estado de bloqueo viaja por el servidor, no por estado compartido de cliente

Al aplanar `LessonClosure`, `SelfAssessmentSection` y `LessonClosure` dejan de
tener relación padre-hijo, así que `LessonClosure` ya no puede leer por props si
la autoevaluación se completó.

Se descarta levantar el estado a un contexto de cliente. En su lugar: `page.tsx`
(Server Component) lee `getSelfAssessmentStatus` y pasa a `LessonClosure` un
booleano derivado del servidor. Tras enviar la autoevaluación, la Server Action
llama a `revalidatePath` y el cliente hace `router.refresh()`; el servidor
vuelve a renderizar y `LessonClosure` recibe el nuevo valor.

Esto es posible precisamente porque ahora hay persistencia (D1). Ventaja
adicional: la fuente de verdad de la UI y la de la validación server-side son la
misma consulta, así que no pueden divergir.

Nota: `router.refresh()` **conserva** el estado de los Client Components, de modo
que el feedback por pregunta que `SelfAssessmentSection` guarda en `useState` no
se pierde al refrescar. Esto elimina la objeción que llevó a spec-011 a evitar
`router.refresh()` (su Decisión 9).

### Decisión D4 — El contenedor único del bloque de código queda en el `pre`

rehype-pretty-code emite esta estructura:

```
figure[data-rehype-pretty-code-figure]
└── pre[data-theme][data-language]
    └── code[data-theme][data-language]
        └── span[data-line] …
```

y para código inline emite `code[data-inline-code]` sin `pre` ni `figure`.

Se evaluó mover el contenedor visual (borde + radio + fondo) al `figure` y dejar
el `pre` desnudo. Se descarta: obligaría a añadir un mapping de `figure` en
`lib/mdx/components.tsx` condicionado a `data-rehype-pretty-code-figure`, para un
elemento que hoy no aporta nada. Se verificó que **ningún MDX del proyecto usa
`title=` en sus cercas de código**, así que no se emite `figcaption` y el
`figure` no tiene contenido propio que estilar.

El `figure` se deja como envoltorio transparente (el preflight de Tailwind ya
anula su margen por defecto) y el contenedor sigue siendo el `pre`. La corrección
del "doble contenedor" se logra entonces con un solo cambio: que el `<code>`
dentro del `pre` **no reciba estilos de píldora**.

Discriminador: `data-inline-code` está presente **solo** en el código inline
(ya se usa en `app/globals.css:74`). El mapping de `code` se bifurca con ese
atributo — el inline conserva su píldora, el de bloque no recibe fondo, padding
ni radio.

### Decisión D5 — El tamaño de fuente del bloque de código sube de forma responsiva

Medición del ancho disponible con JetBrains Mono (avance ≈ `0.6em`):

| Viewport | Ancho útil dentro del `pre` | Caracteres a `text-sm` (14px) | Caracteres a `text-base` (16px) |
|---|---|---|---|
| Escritorio (`max-w-7xl`, sidebar 280px, `p-4`) | ≈ 864 px | ≈ 102 | ≈ 90 |
| Móvil (375 px, `px-4` + `p-4`) | ≈ 311 px | ≈ 37 | ≈ 32 |

En escritorio el paso a `text-base` es cómodo: 90 columnas superan las 80 de la
convención habitual de ancho de línea de código. En móvil, en cambio, bajar de 37
a 32 caracteres empeora de forma apreciable el desbordamiento horizontal.

Decisión: **`text-sm md:text-base`**. Se gana legibilidad donde se lee de verdad
el material (escritorio) sin degradar móvil. El `pre` conserva
`overflow-x-auto`, así que el desbordamiento sigue confinado al bloque y nunca
provoca scroll horizontal de la página. `leading-6` sube a `leading-7` para
acompañar el cuerpo mayor.

### Decisión D6 — Denominador del progreso: solo lecciones con artículo publicado

`course.lessons` incluye lecciones sin `articleSlug` (ver commit `c881ea5`, que
desvinculó lecciones cuyo artículo no existe). Esas lecciones no son navegables ni
completables: incluirlas en el denominador haría que el progreso nunca llegara al
100 %.

- Denominador: `course.lessons.filter(l => l.articleSlug !== null).length`.
- Numerador: intersección de `completedLessonSlugs` con ese mismo conjunto — no
  el `size` del `Set`. Así, si un `lesson_progress` histórico apunta a una
  lección que ya no está en el curso, no infla el numerador ni produce > 100 %.
- Si el denominador es `0`, no se renderiza la barra.

### Decisión D7 — Ancho: los bloques de cierre ocupan la columna de contenido

Los tres bloques de cierre usan hoy `max-w-2xl` (≈ 672 px) mientras el artículo
ocupa la columna completa (≈ 896 px en escritorio), lo que produce un escalón
visual a media página. Se retira `max-w-2xl` de los tres y pasan a ocupar el
ancho de la columna.

Excepción: el **campo de código de asistencia** (`AttendanceSection.tsx:246-257`,
`text-2xl text-center tracking-widest`) se vería absurdo a ancho completo. El
*contenedor* va a ancho completo, pero el input se limita (`max-w-xs`) y se
alinea. La regla es "los contenedores comparten ancho", no "todo control se
estira".

---

## Fases de implementación

### Fase 1 — Render de bloques de código MDX

- [ ] En `lib/mdx/components.tsx`, bifurcar el mapping de `code`
      (líneas 132-137) según la presencia del atributo `data-inline-code`:
      inline conserva fondo, padding y radio; bloque no recibe ninguno de los
      tres y hereda color y fondo del `pre`.
- [ ] Tipar la lectura de ese atributo sin `any` (los props de MDX incluyen
      atributos `data-*` como propiedades desconocidas; usar un tipo de props
      extendido, no una aserción laxa).
- [ ] En `lib/mdx/components.tsx`, ajustar `pre` (líneas 126-131): mantener
      `overflow-x-auto`, borde, radio y `p-4`; subir a `text-sm md:text-base` y
      `leading-7` (Decisión D5).
- [ ] En `app/globals.css`, revisar la regla `code[data-inline-code]`
      (líneas 73-77): eliminar la duplicación de `padding` y `border-radius` que
      ahora define el componente, dejando en CSS solo lo que no puede expresarse
      como utilidad (variables de shiki).
- [ ] Verificar la cascada entre las reglas sin capa de `globals.css`
      (líneas 55-71, que fijan `background-color` desde `--shiki-*-bg`) y las
      utilidades de Tailwind del `pre`: las reglas sin capa ganan a
      `@layer utilities`, así que el fondo efectivo del bloque es el de shiki.
      Confirmar que el resultado es un único fondo coherente en claro y oscuro.
- [ ] Verificar visualmente: bloque con lenguaje, bloque sin lenguaje
      (`defaultLang: 'plaintext'`), código inline dentro de un párrafo, código
      inline dentro de un ítem de lista, y bloque de línea muy larga
      (desbordamiento contenido en el bloque, sin scroll horizontal de página).

### Fase 2 — Barra de progreso del curso en el sidebar

- [ ] Crear `components/courses/CourseProgressBar.tsx` (Server Component, sin
      `'use client'`), con props `completed: number` y `total: number`.
- [ ] Calcular el porcentaje como `Math.round((completed / total) * 100)`;
      devolver `null` si `total === 0` (Decisión D6).
- [ ] Marcado siguiendo el patrón de *progress bar* de Flowbite (riel
      `bg-gray-200 dark:bg-gray-700 rounded-full h-2` + relleno
      `bg-brand h-2 rounded-full` con `width` en estilo inline). No se instala
      `flowbite-react`: el proyecto usa Flowbite como referencia de patrón sobre
      Tailwind, no como dependencia de React.
- [ ] Accesibilidad: contenedor con `role="progressbar"`,
      `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}` y
      `aria-labelledby` apuntando al id del texto visible; el relleno lleva
      `aria-hidden`. Texto visible **`{completed} de {total} · {pct}%`** — no se
      confía solo en el color ni solo en el ancho de la barra.
- [ ] Respetar los tokens del sistema de diseño y la tabla claro/oscuro de
      `DESIGN.md`; sin valores crudos de la paleta.
- [ ] En `components/courses/LessonSidebar.tsx`, derivar `completed` y `total`
      desde `course.lessons` y `completedLessonSlugs` según la Decisión D6, y
      montar `CourseProgressBar` entre el bloque de título (hasta la línea 33) y
      el `<ol>` de lecciones (línea 34).
- [ ] Verificar que el drawer móvil hereda la barra sin tocar
      `LessonSidebarMobile.tsx`: el layout le pasa el mismo `LessonSidebar` como
      `children` (`layout.tsx:43-49`).

### Fase 3 — Persistencia de la autoevaluación (BD + RLS)

- [ ] Crear `supabase/migrations/20260718000000_init_self_assessment_attempts.sql`
      con la tabla `public.self_assessment_attempts`, sus columnas, el `check`
      de integridad y los dos índices descritos en "Impacto en el sistema".
- [ ] Crear `supabase/migrations/20260718000001_rls_self_assessment_attempts.sql`
      siguiendo el estilo de `20260715000001_rls_questions.sql` y
      `20260716000001_rls_attendance.sql`:
  - [ ] `alter table public.self_assessment_attempts enable row level security;`
  - [ ] `select`: `user_id = auth.uid() or public.has_role(auth.uid(), 'admin')`
        — mismo criterio que `lesson_progress`
        (`20260623000002_rls_policies.sql:63-68`).
  - [ ] `insert`: `with check (user_id = auth.uid())`. La escritura ocurre desde
        la Server Action con la sesión del estudiante; no se usa RPC
        `security definer` porque, a diferencia de la asistencia, aquí no hay
        secreto que proteger ni riesgo de suplantación entre estudiantes.
  - [ ] **Sin políticas de `update` ni de `delete`**: la tabla es una bitácora
        append-only; un intento enviado no se edita ni se borra. Documentarlo
        como comentario en la migración, al estilo del comentario final de
        `20260716000001_rls_attendance.sql:87-89`.
- [ ] Aplicar ambas migraciones **solo en local** y verificar en el
      `Table Editor` que RLS quedó activo y que un estudiante no ve intentos
      ajenos.

### Fase 4 — Server Actions de autoevaluación y validación del bloqueo

- [ ] En `lib/self-assessment/types.ts`, añadir:
  - [ ] `SelfAssessmentStatus` — `{ questionCount: number; hasAttempt: boolean; requiresAttempt: boolean }`.
  - [ ] `SubmitSelfAssessmentResult` — unión discriminada por `ok`, con motivos
        `'not_enrolled' | 'incomplete' | 'no_questions' | 'error'` y, en el caso
        `ok: true`, el feedback por pregunta.
  - [ ] Mover aquí el tipo `QuestionFeedback` hoy declarado localmente en
        `components/courses/SelfAssessmentSection.tsx:17-22`.
- [ ] En `lib/self-assessment/index.ts`, añadir `getSelfAssessmentStatus(courseSlug, lessonSlug)`:
      cuenta las preguntas `multiple_choice` publicadas de la lección y consulta
      si existe al menos un intento del usuario. `requiresAttempt` es
      `questionCount > 0`. Devuelve valores seguros (sin bloquear) si no hay
      usuario autenticado.
- [ ] En `lib/self-assessment/index.ts`, añadir la Server Action
      `submitSelfAssessment(courseSlug, lessonSlug, answers)` que, en un solo
      viaje al servidor:
  - [ ] valide la entrada con Zod (mismo estilo que
        `checkSelfAssessmentAnswer`, líneas 85-101);
  - [ ] reverifique matrícula con `hasCourseAccess` (líneas 104-107);
  - [ ] recupere las preguntas publicadas de la lección **desde el servidor**
        (nunca confiar en el conteo que envíe el cliente);
  - [ ] rechace con `reason: 'incomplete'` si alguna pregunta publicada quedó sin
        responder (criterio de "terminada": **todas respondidas y enviadas**,
        con independencia de los aciertos);
  - [ ] corrija todas las preguntas reutilizando la lógica de comparación de
        `checkSelfAssessmentAnswer` (líneas 138-149);
  - [ ] inserte una fila en `self_assessment_attempts` con `question_count`,
        `answered_count` y `correct_count`;
  - [ ] llame a `revalidatePath` de la ruta de la lección para que `page.tsx`
        recalcule el estado de bloqueo (Decisión D3);
  - [ ] devuelva el feedback por pregunta para pintar la corrección.
- [ ] Retirar `checkSelfAssessmentAnswer` (`lib/self-assessment/index.ts:78-161`)
      una vez migrado su único consumidor
      (`components/courses/SelfAssessmentSection.tsx:71`). No dejar la función
      exportada sin uso.
- [ ] En `lib/progress/types.ts`, añadir `MarkLessonCompletedResult` — unión
      discriminada por `ok`, con motivos
      `'not_authenticated' | 'not_enrolled' | 'self_assessment_pending'`.
- [ ] En `lib/progress/index.ts`, modificar `markLessonCompleted`
      (líneas 64-87): tras la comprobación de matrícula existente (líneas 71-72)
      y **antes** del `upsert`, consultar `getSelfAssessmentStatus`; si
      `requiresAttempt && !hasAttempt`, devolver
      `{ ok: false, reason: 'self_assessment_pending' }` sin escribir. Cambiar el
      retorno de `Promise<void>` a `Promise<MarkLessonCompletedResult>`.
- [ ] Confirmar que `markLessonUncompleted` (líneas 89-112) **no** se modifica:
      desmarcar sigue siendo libre y **no borra** intentos de autoevaluación
      (la tabla es append-only, Fase 3).
- [ ] Actualizar el único consumidor de la firma cambiada,
      `components/courses/LessonClosure.tsx:35`.

### Fase 5 — Reordenamiento y aplanado del cierre de lección

- [ ] En `components/courses/LessonClosure.tsx`, eliminar el render de
      `AttendanceSection` y `SelfAssessmentSection` (líneas 100-116) y sus
      imports (líneas 6-7) y props `attendance` / `selfAssessment`
      (líneas 15-16). `LessonClosure` queda reducido al bloque
      "Finalizar lección".
- [ ] Añadir a `LessonClosure` las props `canComplete: boolean` y
      `blockedReason?: 'self_assessment_pending'`; cuando esté bloqueado,
      deshabilitar el botón "Completar lección" (línea 89-95) y mostrar un
      mensaje explicativo asociado al botón vía `aria-describedby`
      (deshabilitar sin explicar es un antipatrón de accesibilidad).
- [ ] Manejar el resultado de `markLessonCompleted` en el handler
      (líneas 30-39): si devuelve `ok: false`, mostrar el motivo en vez de
      asumir éxito. Cubre la carrera en que el servidor rechaza aunque el cliente
      creyera poder completar.
- [ ] Quitar `max-w-2xl` (línea 53) — Decisión D7.
- [ ] En `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, reordenar el bloque
      de render (líneas 57-84) al nuevo orden:
      1. `LessonArticle` (contenido)
      2. `SelfAssessmentSection`
      3. `AttendanceSection`
      4. `LessonClosure`
      5. `LessonPagination`
- [ ] Mover `LessonPagination` (hoy en la línea 73, antes del cierre) al final,
      después de `LessonClosure`, para que "finalizar lección" y "siguiente
      lección" queden juntos.
- [ ] Envolver las secciones 2-4 en un único guard
      `access.ok && access.reason === 'enrolled'` (hoy en la línea 74), ahora que
      son hermanas y no hijas. `LessonPagination` queda **fuera** del guard: la
      navegación entre lecciones no depende de la matrícula.
- [ ] Añadir en `page.tsx` la lectura de `getSelfAssessmentStatus` junto a las
      lecturas existentes (líneas 50-55) y pasar el booleano derivado a
      `LessonClosure` (Decisión D3).
- [ ] Mantener el render condicional de `SelfAssessmentSection` solo cuando haya
      preguntas publicadas (hoy `LessonClosure.tsx:110`), ahora en `page.tsx`.
- [ ] Verificar los separadores: al pasar de secciones anidadas a hermanas, los
      `border-t … pt-8` de cada `<section>` pueden duplicarse. Unificar el
      espaciado vertical entre bloques de cierre en un solo lugar.

### Fase 6 — Rediseño visual de la autoevaluación y alineación de anchos

- [ ] En `components/courses/SelfAssessmentSection.tsx`, quitar el `max-w-2xl`
      (línea 96) para ocupar el ancho de la columna de contenido.
- [ ] Convertir la sección en **un solo contenedor** con bordes redondeados:
      envoltorio con borde, radio y fondo de tarjeta (según la tabla claro/oscuro
      de `DESIGN.md`) más `overflow-hidden` para que los hijos no desborden las
      esquinas.
- [ ] Quitar el borde, radio y fondo por pregunta (línea 109) y separar las
      preguntas con divisores internos (`divide-y`), no con tarjetas
      independientes.
- [ ] Colocar el encabezado "Autoevaluación" (líneas 97-99) dentro del
      contenedor, como cabecera con divisor inferior.
- [ ] Colocar el botón "Enviar respuestas" (líneas 267-273) en un pie dentro del
      mismo contenedor, con divisor superior; que no quede suelto fuera de la
      tarjeta.
- [ ] Ajustar el estilo de las opciones (líneas 143-160) al nuevo contexto sin
      borde de tarjeta: los estados de acierto/error deben seguir distinguiéndose
      por icono y texto, **no solo por color** (WCAG 2.2, uso del color).
- [ ] Sustituir el `max-w-2xl` de `AttendanceSection` (líneas 98, 140 y 176) por
      el ancho de columna, limitando el input de código (líneas 246-257) con
      `max-w-xs` — Decisión D7.
- [ ] Homogeneizar el tratamiento de tarjeta de los tres bloques de cierre
      (Autoevaluación, Asistencia, Finalizar lección) para que compartan borde,
      radio y espaciado.
- [ ] Revisar los colores hexadecimales crudos presentes en los estados de éxito
      y error (`SelfAssessmentSection.tsx:149,152,218-219`,
      `AttendanceSection.tsx:144,186-187`, `LessonClosure.tsx:59`): si al tocar
      esos bloques resulta directo, migrarlos a tokens semánticos; si no,
      registrarlos en `docs/specs/backlog.md` con un comentario `// DEBT:` en vez
      de ampliar el alcance de este spec.

### Fase 7 — Comportamiento de la autoevaluación en el cliente

- [ ] En `components/courses/SelfAssessmentSection.tsx`, sustituir el bucle de
      llamadas por pregunta (líneas 55-87) por una sola invocación de
      `submitSelfAssessment` con todas las respuestas.
- [ ] Hacer el schema de Zod (líneas 34-45) **requerido** por pregunta, en lugar
      de `.optional()`, para que "todas respondidas" se valide también en el
      cliente. La validación del cliente es ergonomía; la del servidor (Fase 4)
      es la que manda.
- [ ] Deshabilitar el botón "Enviar respuestas" mientras falten preguntas por
      responder e indicar cuántas faltan; no dejar que el usuario descubra el
      requisito por un error tras enviar.
- [ ] Eliminar el `continue` que saltaba preguntas sin respuesta
      (líneas 67-69): ya no es un caso alcanzable.
- [ ] Tras un envío correcto, llamar a `router.refresh()` para que
      `LessonClosure` reciba el nuevo estado de bloqueo desde el servidor. El
      feedback en `useState` (líneas 30-32) sobrevive al refresco
      (Decisión D3).
- [ ] Estado de "autoevaluación ya enviada" (el estudiante vuelve a la lección
      en otra sesión): la sección debe indicar que ya fue enviada y permitir
      **reintentar**. Un reintento inserta un nuevo registro en la bitácora; el
      bloqueo, una vez abierto, no vuelve a cerrarse.
- [ ] Manejar `ok: false` de `submitSelfAssessment` mostrando el motivo, en lugar
      de dejar el formulario en un estado ambiguo.

### Fase 8 — Casos borde y verificación de la regla de negocio

- [ ] **Lección sin preguntas publicadas:** `requiresAttempt === false`;
      `SelfAssessmentSection` no se renderiza, el botón "Completar lección" no se
      bloquea nunca y no se inserta ningún intento. Este es el caso mayoritario
      del contenido actual: **no debe introducir ninguna fricción**.
- [ ] **Lección completada antes de esta regla:** las filas existentes de
      `lesson_progress` con `completed_at` no se tocan; no hay backfill ni
      desmarcado automático. La lección sigue mostrándose como completada y
      cuenta para la barra de progreso aunque no exista intento.
- [ ] **Desmarcar y volver a marcar una lección antigua:** tras desmarcar, la
      regla nueva aplica al volver a marcar, de modo que una lección con
      autoevaluación publicada exigirá enviarla. Es consecuencia aceptada de que
      la validación vive en la escritura; documentarlo en el mensaje de la UI
      para que no se perciba como un fallo.
- [ ] **Desmarcar no borra intentos:** `markLessonUncompleted` no toca
      `self_assessment_attempts`; volver a marcar no exigirá repetir la
      autoevaluación si ya existe un intento.
- [ ] **El docente publica preguntas nuevas después de un intento:** el bloqueo
      comprueba *existencia* de intento, no cobertura del conjunto actual de
      preguntas. Una lección ya desbloqueada permanece desbloqueada. Decisión
      consciente: reevaluar retroactivamente desmarcaría progreso ya ganado.
- [ ] **Reintentos:** permitidos y sin límite; cada envío añade una fila.
- [ ] **Elusión de la UI:** invocar `markLessonCompleted` directamente sin haber
      enviado la autoevaluación debe ser rechazado por el servidor. Es el
      criterio que justifica toda la Fase 3.
- [ ] **Estudiante no matriculado / visitante:** ninguna de las tres secciones de
      cierre se renderiza (guard de la Fase 5); las acciones siguen reverificando
      matrícula en el servidor.

### Fase 9 — Verificación transversal

- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Revisar la página completa en modo claro y oscuro contra la tabla de
      `DESIGN.md`: bloques de código, las tres tarjetas de cierre, la barra de
      progreso y la paginación.
- [ ] Revisar en móvil (375 px), tablet y escritorio: legibilidad del bloque de
      código, ancho de las tarjetas de cierre y barra de progreso en el drawer.
- [ ] Recorrido completo por teclado: opciones de la autoevaluación, envío,
      botón de completar (incluido su estado deshabilitado con explicación
      asociada) y paginación. Foco visible en todos los puntos.
- [ ] Verificar que la barra de progreso se anuncia correctamente en un lector de
      pantalla (valor y etiqueta).
- [ ] Confirmar que ningún cambio introduce `SUPABASE_SERVICE_ROLE_KEY` en
      `app/` ni en `components/`.

---

## Criterios de aceptación

**Render de código**

- Un bloque de código MDX se muestra con **un único contenedor** con bordes
  redondeados, sin caja anidada ni doble fondo, en modo claro y oscuro.
- El código de bloque usa `text-sm` en móvil y `text-base` desde `md`; el código
  inline conserva su estilo de píldora.
- Una línea de código más ancha que la columna desborda **dentro** del bloque, sin
  provocar scroll horizontal de la página.
- El código sigue siendo seleccionable y copiable con ratón y con teclado.

**Orden del cierre**

- El orden vertical de la lección es: contenido → Autoevaluación → Asistencia →
  Finalizar lección → navegación a la lección siguiente.
- Un visitante o un estudiante no matriculado no ve ninguna de las tres secciones
  de cierre, pero sí la paginación.

**Autoevaluación**

- La autoevaluación se muestra como **un solo contenedor** con bordes redondeados
  que ocupa todo el ancho de la columna de contenido; las preguntas son
  divisiones internas sin tarjeta propia.
- El botón "Enviar respuestas" permanece deshabilitado hasta que todas las
  preguntas están respondidas, e indica cuántas faltan.
- Al enviar, el sistema corrige en el servidor, muestra el feedback por pregunta
  y registra el intento.
- Al recargar la página, la autoevaluación se muestra como ya enviada y permite
  reintentar.
- Las tarjetas de Autoevaluación, Asistencia y Finalizar lección comparten ancho
  y tratamiento visual.

**Regla de bloqueo**

- En una lección **con** autoevaluación publicada, el botón "Completar lección"
  está deshabilitado y acompañado de una explicación mientras la autoevaluación
  no se haya enviado.
- Tras enviar la autoevaluación, el botón queda habilitado sin necesidad de
  recargar manualmente.
- El bloqueo se aplica con independencia de los aciertos: responder todo y enviar
  desbloquea aunque todas las respuestas sean incorrectas.
- Invocar `markLessonCompleted` sin intento registrado devuelve
  `{ ok: false, reason: 'self_assessment_pending' }` y **no** escribe
  `completed_at`.
- En una lección **sin** preguntas publicadas, el botón "Completar lección"
  funciona sin ninguna fricción adicional.
- Una lección ya completada antes de esta regla sigue mostrándose completada y no
  se desmarca.
- Desmarcar una lección no elimina el intento de autoevaluación registrado.

**Barra de progreso**

- El sidebar muestra una barra con el avance del curso y el texto
  `X de N · NN%`, tanto en escritorio como en el drawer móvil.
- El porcentaje refleja solo lecciones con artículo publicado y nunca supera el
  100 %.
- La barra expone `role="progressbar"` con `aria-valuenow`, `aria-valuemin`,
  `aria-valuemax` y una etiqueta accesible.
- Al completar una lección, el porcentaje se actualiza sin recarga manual.

**Base de datos**

- La tabla `self_assessment_attempts` tiene RLS activo; un estudiante solo lee
  sus propios intentos.
- La tabla no admite `update` ni `delete` desde el cliente.
- Un intento con `answered_count != question_count` es rechazado por el `check`
  de la tabla.

---

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md,
> "Artefactos que acompañan al spec").

- **Manuales:** `docs/testing/test-017-diseno-leccion.md` — casos `TC-017-NNN`
  (y `TC-MCP-017-NNN` si la sección "Evaluación MCP" resulta afirmativa),
  cubriendo como mínimo: doble contenedor de código resuelto, orden del cierre,
  contenedor único de la autoevaluación, bloqueo del botón de completar, lección
  sin preguntas, lección completada antes de la regla, reintento de
  autoevaluación, barra de progreso en escritorio y en móvil, y recorrido por
  teclado.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-017-diseno-leccion.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio. Pendiente de que
  se defina el framework de testing del proyecto (ver CLAUDE.md → "Testing"). El
  caso de elusión de la UI (invocación directa de `markLessonCompleted`) es
  prioritario en esta suite, porque no es verificable desde una prueba manual con
  interfaz.
