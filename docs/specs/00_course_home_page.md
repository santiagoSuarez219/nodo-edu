# Análisis Técnico: Página de Inicio de Curso

## Problema

Actualmente el navbar expone tres rutas (`/estructuras-de-datos`, `/programacion-cientifica`, `/analisis-de-algoritmos`) que devuelven 404 porque no existen páginas asociadas. Se requiere implementar una **página de inicio de curso** que, para cada uno de los tres cursos iniciales, muestre:

1. Título del curso (y descripción / metadata mínima de contexto).
2. Listado de clases que componen el curso.
3. Temas (subtemas) que cubre cada clase.

Restricciones de la fase actual:

- Sólo el docente principal genera contenido; el flujo de edición es vía Git (no hay panel admin).
- El stack actual es Next 16.2.4 + React 19 + Tailwind 4. No hay MDX, ni `contentlayer`, ni Payload, ni Supabase instalados.
- El acceso es público: estudiantes y visitantes ven la página en lectura.
- La feature debe quedar lista para los **3 cursos** del navbar simultáneamente.

Restricciones a futuro (fases 2 y 3):

- En Fase 2 el contenido se moverá a Payload + Postgres; el frontend público no debería reescribirse.
- En Fase 3 cada clase tendrá un cuerpo (artículo MDX, video, notebook, evaluación). La página de inicio del curso debe ser el "índice" desde el que se entra a cada clase.

---

## Impacto Arquitectural

### Frontend público

- Se crean **rutas nuevas** bajo `app/` para representar los cursos. Decisión de routing pendiente (ver "Decisiones abiertas").
- Se crea una **plantilla de página de curso** (Server Component) reutilizable, y componentes de presentación específicos: encabezado de curso, lista de clases, item de clase con sus temas.
- No se modifica el layout raíz ni el `Navbar`; sólo se vuelven funcionales los enlaces existentes.
- La home (`app/page.tsx`) podría más adelante listar cursos disponibles, pero queda fuera del alcance de este spec.

### Capa de datos / contenido

- Se introduce una **capa de dominio** (`lib/courses/`) que expone una API estable (`getCourseBySlug`, `getAllCourses`, etc.) para el frontend. Es el contrato que sobrevivirá a la migración de fase 2.
- Se introduce un **proveedor de contenido** (en fase 1: módulo TypeScript; en fase 2: cliente Payload). El frontend nunca importa el proveedor directamente; sólo consume la capa de dominio.
- No se toca base de datos, Auth ni Storage en esta feature.

### Admin / CMS

- Sin impacto en fase 1 (no hay panel). El docente edita en archivos versionados.
- En fase 2, los mismos tipos de dominio (`Course`, `Lesson`, `Topic`) serán los que devuelva Payload, manteniendo el contrato.

### Base de datos / Auth / Storage

- Sin impacto en fase 1.
- En fase 2, las entidades `Course`, `Lesson`, `Topic` se mapearán a colecciones Payload sobre Postgres. Las políticas RLS no aplican aún porque el contenido es público; se introducirán cuando aparezcan estudiantes y evaluaciones.

---

## Decisiones Abiertas y Recomendación

### 1. Formato del contenido: MDX vs. estructuras TS planas

| Aspecto | MDX (`/content/cursos/<curso>/index.mdx`) | TS plano (`/lib/courses/data/*.ts`) |
|---|---|---|
| Caso de uso ideal | Cuerpo largo de artículos con código y fórmulas | Metadata estructurada y listas finitas |
| Encaja con "título + listado + temas" | Forzado: requiere frontmatter para datos estructurados y MDX para una porción casi vacía | Natural: es exactamente una estructura `Course → Lesson[] → Topic[]` |
| Dependencias nuevas en fase 1 | `next-mdx-remote` o `contentlayer`, parser de frontmatter, Shiki, KaTeX | Ninguna |
| Migración a Payload (fase 2) | Hay que parsear MDX y trasladar a colecciones | Mapeo directo objeto → colección |
| Edición por docente (fase 1) | Markdown, requiere disciplina con frontmatter | TS tipado: el editor avisa errores de schema en el momento |

**Recomendación**: para la **página de inicio de curso** (este spec) usar **estructuras TypeScript tipadas** en `lib/courses/data/`. MDX se introducirá cuando se implementen los **artículos / cuerpo de clase** (otro spec posterior), donde sí aporta. Justificación:

- El payload de esta página es metadata, no prosa. MDX sería sobre-ingeniería.
- Se evita instalar parsers MDX antes de tiempo y se mantiene el bundle limpio.
- Tipos compartidos entre fase 1 y fase 2: el día de Payload, basta con cambiar la implementación del proveedor sin tocar componentes ni rutas.

### 2. Routing: dynamic segment `[curso]` vs. rutas estáticas separadas

| Aspecto | Dynamic `app/[curso]/page.tsx` | Rutas estáticas (`/estructuras-de-datos/page.tsx`, etc.) |
|---|---|---|
| Una sola plantilla | Sí | Triplicación de archivos |
| `generateStaticParams` y SSG | Trivial | No aplica (ya son estáticas) |
| Riesgo de colisión con futuras rutas top-level (`/login`, `/admin`, `/api`) | Alto si no se aísla | Nulo |
| Escalable a N cursos | Sí | No |

**Recomendación**: usar un segmento dinámico **aislado en un grupo de rutas**: `app/(cursos)/[courseSlug]/page.tsx`, con `generateStaticParams` alimentado por la capa de dominio. Esto:

- Evita colisión con `/login`, `/admin`, `/api` y cualquier ruta de fase futura.
- Mantiene los slugs visibles (los del navbar siguen siendo `/estructuras-de-datos`, sin prefijo).
- Permite añadir un cuarto curso editando sólo `lib/courses/data/`.

### 3. Dónde vive el modelo de datos

`lib/courses/` con esta separación de responsabilidades:

- `lib/courses/types.ts` — tipos de dominio (`Course`, `Lesson`, `Topic`). Contrato estable.
- `lib/courses/data/*.ts` — un archivo por curso con la metadata, clases y temas.
- `lib/courses/index.ts` — funciones de acceso: `getAllCourses()`, `getCourseBySlug(slug)`, `getCourseSlugs()`. Es la única superficie que consumen rutas y componentes.
- En fase 2, se sustituye la implementación de `index.ts` por llamadas a Payload; los consumidores no cambian.

### 4. Reutilización para fases futuras

- Los tipos `Lesson` / `Topic` deben permitir desde ya un campo opcional `slug` y `articleSlug` para enlazar a la futura página de la clase, aunque aún no apunten a ningún sitio.
- La capa de dominio expone funciones, no estructuras crudas: facilita migrar a `async` cuando el origen sea Postgres sin cambiar firmas externas (se usa `async` desde el día uno aunque la implementación devuelva sincrónicamente).
- Server Components por defecto: cuando la fuente sea Payload, las consultas siguen siendo server-side sin refactor.

---

## Propuesta de Solución

### Modelo de dominio (resumen conceptual)

- **Course**: `slug`, `title`, `summary`, `audience`, `level`, `lessons[]`.
- **Lesson**: `id` (slug interno), `order`, `title`, `summary` opcional, `topics[]`, `articleSlug` opcional (para fase posterior).
- **Topic**: `title`, `description` opcional.

Los `slug` de curso son los que ya están en el navbar (`estructuras-de-datos`, `programacion-cientifica`, `analisis-de-algoritmos`).

### Estructura de carpetas final

```
app/
  (cursos)/
    [courseSlug]/
      page.tsx           # Server Component, render principal
      not-found.tsx      # 404 amigable cuando el slug no existe
lib/
  courses/
    types.ts             # Course, Lesson, Topic
    data/
      estructuras-de-datos.ts
      programacion-cientifica.ts
      analisis-de-algoritmos.ts
    index.ts             # API pública: getAllCourses, getCourseBySlug, getCourseSlugs
components/
  courses/
    CourseHeader.tsx     # título + summary + metadata
    LessonList.tsx       # contenedor de clases
    LessonCard.tsx       # una clase + sus temas
    TopicList.tsx        # lista de temas dentro de una clase
```

### Render

- `app/(cursos)/[courseSlug]/page.tsx`: Server Component que:
  1. Lee `params.courseSlug`.
  2. Llama `getCourseBySlug(slug)`.
  3. Si no existe, dispara `notFound()`.
  4. Renderiza `CourseHeader` + `LessonList`.
- Genera `generateStaticParams` desde `getCourseSlugs()` para SSG.
- Genera `generateMetadata` con título y descripción del curso.

### Estilos

- Usar exclusivamente tokens semánticos de `globals.css` y la tabla claro/oscuro de `CLAUDE.md`.
- Componentes Flowbite (Card, List) como base; shadcn/ui sólo si Flowbite no cubre.
- Sin emojis, JetBrains Mono ya se hereda del layout.

### Accesibilidad

- Encabezados jerárquicos (`h1` curso, `h2` clase, `h3` opcional para subgrupo de temas).
- Listas semánticas (`ol` para clases ordenadas, `ul` para temas).
- Contraste verificado en ambos temas vía tokens.

---

## Plan de Implementación por Fases

### Fase A — Fundamentos del modelo de datos (sin UI)

**Objetivo**: tener la capa de dominio operativa y tipada antes de tocar rutas.

1. Crear `lib/courses/types.ts` con los tipos `Course`, `Lesson`, `Topic`. Incluir campos opcionales orientados a fases futuras (`articleSlug`, `durationMinutes`, `publishedAt`) aunque no se usen aún.
2. Crear `lib/courses/data/estructuras-de-datos.ts` con un esqueleto realista: 4–8 clases de ejemplo, cada una con 2–5 temas. Marcar el archivo como fuente de verdad editable por el docente.
3. Replicar el patrón en `lib/courses/data/programacion-cientifica.ts` y `lib/courses/data/analisis-de-algoritmos.ts`.
4. Crear `lib/courses/index.ts` con `getAllCourses`, `getCourseBySlug`, `getCourseSlugs`. Firmas `async` desde el inicio, aun si internamente son síncronas. Validar unicidad de slugs y de `lesson.id` por curso (validación en tiempo de import).

**Archivos creados**: `lib/courses/types.ts`, `lib/courses/data/estructuras-de-datos.ts`, `lib/courses/data/programacion-cientifica.ts`, `lib/courses/data/analisis-de-algoritmos.ts`, `lib/courses/index.ts`.
**Archivos editados**: ninguno.

### Fase B — Componentes de presentación

**Objetivo**: piezas UI puras, sin acoplarse a rutas, listas para reutilizarse.

1. Crear `components/courses/CourseHeader.tsx`: recibe `Course`, renderiza título, summary y badges (audiencia, nivel). Server Component.
2. Crear `components/courses/TopicList.tsx`: recibe `topics: Topic[]`, renderiza `<ul>` con título y descripción opcional.
3. Crear `components/courses/LessonCard.tsx`: recibe `Lesson`, renderiza encabezado de clase + `TopicList`. Preparado para envolverse en `<Link>` cuando exista la página de clase (placeholder con `aria-disabled` por ahora).
4. Crear `components/courses/LessonList.tsx`: recibe `lessons: Lesson[]`, ordena por `order`, mapea a `LessonCard`.
5. Verificar visualmente en una página de prueba descartable, o con Storybook si se decide más adelante (no es bloqueante).

**Archivos creados**: 4 archivos en `components/courses/`.
**Archivos editados**: ninguno.

### Fase C — Ruta dinámica y wiring

**Objetivo**: las URLs del navbar dejan de ser 404.

1. Crear el grupo de rutas `app/(cursos)/` (no añade segmento a la URL).
2. Crear `app/(cursos)/[courseSlug]/page.tsx`: Server Component que llama `getCourseBySlug`, dispara `notFound()` si no existe, y compone `CourseHeader` + `LessonList`.
3. Implementar `generateStaticParams` para SSG de los 3 cursos.
4. Implementar `generateMetadata` con título y descripción del curso.
5. Crear `app/(cursos)/[courseSlug]/not-found.tsx`: página 404 estilizada con tokens del sistema (mensaje en español, link a home).
6. Probar manualmente las 3 rutas del navbar y un slug inexistente para validar `not-found`.

**Archivos creados**: `app/(cursos)/[courseSlug]/page.tsx`, `app/(cursos)/[courseSlug]/not-found.tsx`.
**Archivos editados**: ninguno (el navbar ya apunta a los slugs correctos).

### Fase D — Pulido y consistencia visual

**Objetivo**: asegurar paridad claro/oscuro, accesibilidad y responsive.

1. Revisar todos los componentes de `components/courses/` contra la tabla claro/oscuro de `CLAUDE.md`. Reemplazar cualquier color crudo por tokens.
2. Validar jerarquía de headings y roles ARIA en `LessonCard` / `LessonList`.
3. Validar comportamiento responsive (mobile-first) y respeto del `pt-16 lg:pt-20` del layout para no quedar bajo el navbar fijo.
4. Lint + typecheck (`npm run lint`, `tsc --noEmit`).

**Archivos creados**: ninguno.
**Archivos editados**: los componentes de `components/courses/` que necesiten ajuste.

### Fase E — Preparación para fases siguientes (no bloqueante, opcional)

**Objetivo**: dejar señalizado el siguiente spec sin implementarlo.

1. En cada `Lesson`, dejar el campo `articleSlug` documentado en `types.ts` con un comentario que indique que será el ancla a la futura página de clase (Fase 1.5: artículos MDX).
2. Documentar en `lib/courses/index.ts` (con un comentario corto) que la firma `async` está pensada para sustituirse por consultas a Payload en Fase 2.
3. No instalar `next-mdx-remote`, `contentlayer`, Shiki ni KaTeX hasta que arranque el spec de artículos.

**Archivos creados**: ninguno.
**Archivos editados**: `lib/courses/types.ts`, `lib/courses/index.ts` (sólo comentarios).

---

## Criterios de Aceptación

- Las tres rutas del navbar (`/estructuras-de-datos`, `/programacion-cientifica`, `/analisis-de-algoritmos`) responden con 200 y muestran título, lista de clases y temas por clase.
- Un slug inválido (`/curso-inexistente`) renderiza el `not-found.tsx` del grupo `(cursos)`, no el 404 global.
- Las páginas se generan estáticamente (`generateStaticParams` en `next build`).
- El frontend público no importa archivos de `lib/courses/data/*` directamente; sólo consume `lib/courses/index.ts`.
- Modo claro y oscuro consistentes con la tabla de `CLAUDE.md`; ningún color crudo fuera de los tokens.
- Lint y typecheck pasan sin warnings nuevos.

## Riesgos y Mitigaciones

- **Riesgo**: el segmento dinámico `[courseSlug]` colisiona con futuras rutas top-level. **Mitigación**: aislarlo en el grupo `(cursos)` y reservar nombres de cursos no chocantes con `/login`, `/admin`, `/api`.
- **Riesgo**: el día de Payload el contrato `Course` cambia y rompe componentes. **Mitigación**: la capa de dominio (`lib/courses/index.ts`) es la frontera; los componentes consumen tipos, no datos crudos. Se versiona la forma de `Course` ahí.
- **Riesgo**: el docente añade un curso y olvida actualizar el navbar (que tiene los slugs hardcoded). **Mitigación**: en un spec posterior, alimentar el navbar desde `getAllCourses()`. Fuera de alcance aquí, pero anotado.

## Fuera de Alcance

- Página de cuerpo de cada clase (artículo MDX) — spec posterior.
- Búsqueda, filtros o paginación de cursos.
- Autenticación, roles, RLS.
- Carga de contenido desde Payload o Supabase.
- Listado de cursos en la home pública.
- Internacionalización; el contenido es exclusivamente en español.
