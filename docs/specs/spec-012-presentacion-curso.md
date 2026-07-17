# spec-012 — [DONE] Página de presentación de curso

## Contexto

Nodo necesita una página de presentación por curso (importada del diseño aprobado
"Nodo Course Detail" de claude.ai Design) que funcione como vitrina introductoria:
temario, prerrequisitos, herramientas, esquema de evaluación, fechas y condiciones,
con un CTA de matrícula.

Esta página cumple dos propósitos:
1. **Vista previa para el docente** dentro del panel admin, en el tab
   "Presentación del curso" que hoy es un stub con placeholder.
2. **Superficie pre-matrícula para el estudiante**: un usuario autenticado pero
   NO matriculado debe poder leer la presentación y decidir matricularse. Esto
   contrasta con `/[courseSlug]` (contenido), que sí exige `requireCourseAccess`.

Toda la información se renderiza desde un archivo `.ts` por curso (mismo patrón que
`lib/courses/data/*.ts`), nunca escrita de forma estática en el JSX, para permitir
la futura migración a Payload/Postgres sin reescribir el frontend.

## Alcance

### Incluye
- Nuevo módulo de datos `lib/course-presentations/` (tipos + registro + primer curso).
- Primer archivo de datos `estructuras-de-datos.ts` con el contenido exacto del diseño.
- Un componente compartido de presentación (solo el contenido: hero + secciones),
  sin navbar/footer/toggle (los aporta el shell global de `app/layout.tsx`).
- Montaje del componente en el tab admin (reemplazando el placeholder) como vista
  previa, con CTA **no funcional**.
- Nueva ruta de estudiante `/[courseSlug]/presentacion` protegida con `requireUser`
  (cualquier autenticado, matriculado o no), con CTA que enlaza al flujo de
  matrícula existente.
- Reserva del slug `"presentacion"` en `RESERVED_LESSON_SLUGS`.
- Soporte responsive, dark mode y accesibilidad, usando tokens semánticos de DESIGN.md.

### No incluye
- Edición de la presentación desde el panel admin (el tab es solo vista previa; los
  datos se editan en el archivo `.ts`). La edición vía UI/CMS es Fase 2.
- Persistencia en base de datos / Payload; los datos viven en archivos `.ts`.
- Implementar o modificar el flujo de matrícula (`enrollByCode`, `enrollment_code`,
  `EnrollmentForm`). El CTA de estudiante solo **enlaza** al flujo existente
  (`/cuenta/cursos`); la matrícula real queda fuera de este spec.
- Archivos de presentación para el resto de cursos (`programacion-cientifica`,
  `analisis-de-algoritmos`); solo se crea el de `estructuras-de-datos`.
- Vincular `academic_courses.course_slug` con el contenido (ya existe); solo se
  consume.

## Impacto en el sistema

### Archivos nuevos
- `lib/course-presentations/types.ts` — tipo `CoursePresentation` y subtipos
  (`SyllabusUnit`, `EvaluationItem`, `ImportantDate`).
- `lib/course-presentations/data/estructuras-de-datos.ts` — datos del primer curso,
  keyed por el slug `estructuras-de-datos`.
- `lib/course-presentations/index.ts` — registro y
  `getCoursePresentationBySlug(slug): Promise<CoursePresentation | null>` (firma
  async desde el inicio, espejo de `lib/courses/index.ts`).
- `components/course-presentations/CoursePresentation.tsx` — componente
  presentacional (Server Component) que recibe los datos y un slot de CTA; renderiza
  hero + todas las secciones. Las subsecciones (Hero, Prerequisitos, Temario,
  Herramientas, Evaluación+Fechas, Condiciones, CTA final) se colocan como
  subcomponentes internos o archivos hermanos en la misma carpeta.
- `app/(cursos)/[courseSlug]/presentacion/page.tsx` — ruta de estudiante.
- `docs/testing/test-012-presentacion-curso.md` — casos manuales.

### Archivos editados
- `app/(admin)/admin/courses/[academicCourseId]/presentacion/page.tsx` — reemplazar
  el bloque placeholder por el componente compartido en modo vista previa,
  conservando breadcrumb y tabs existentes.
- `lib/courses/index.ts` — agregar `"presentacion"` a `RESERVED_LESSON_SLUGS`.

### No afectado (confirmado)
- Base de datos / migraciones: ninguna. Auth/Storage: sin cambios (solo se consumen
  `requireUser` / `requireAnyRole` existentes). `middleware.ts`: sin cambios (ya
  exige sesión global; la ruta encaja en ese modelo).

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación: la presentación de curso es contenido estático file-based
(`lib/course-presentations/data/*.ts`), sin API ni tablas de base de datos, igual
que `lib/courses/data`. No expone datos dinámicos consultables ni acciones
ejecutables que un agente deba invocar; el único dato dinámico tocado
(`academic_courses.course_slug`) ya se consume vía helpers existentes y no se crea
endpoint nuevo. Ningún agente definido en `docs/mcps/` (question-bank, attendance)
se beneficia de estos datos. Por tanto no se añade fase de MCP.

## Decisión de routing

Ruta de estudiante: **`app/(cursos)/[courseSlug]/presentacion/page.tsx` → URL
`/[courseSlug]/presentacion`**. En el grupo `(cursos)` no hay `layout.tsx` a nivel de
`[courseSlug]` (el gate `requireCourseAccess` vive dentro de `page.tsx`, no en un
layout), por lo que la ruta hermana `presentacion/` no hereda ese gate y usa su propio
`requireUser`. El segmento estático `presentacion` tiene precedencia sobre
`[lessonSlug]`, por lo que se reserva `"presentacion"` en `RESERVED_LESSON_SLUGS`
(`lib/courses/index.ts`) para que `validate()` impida que una lección con ese slug
quede silenciosamente ensombrecida. Se mantiene el namespace por-curso ya usado por
`/[courseSlug]` y `/[courseSlug]/[lessonSlug]`.

## Fases de implementación

### Fase 1 — Modelo de datos (`lib/course-presentations/`)
- [ ] Crear `types.ts` con `CoursePresentation` y subtipos `SyllabusUnit`
      (`{ n: number; title: string; topics: string[] }`), `EvaluationItem`
      (`{ name: string; pct: number }`), `ImportantDate` (`{ date: string; label: string }`).
      Campos de `CoursePresentation`: `name, desc, program, level, credits(number),
      hours(string), classesCount(number), spots(number), startDate(string),
      enrollDeadline(string), prereqs(string[]), tools(string[]),
      syllabus(SyllabusUnit[]), evaluation(EvaluationItem[]), dates(ImportantDate[]),
      conditions(string[])`.
- [ ] Crear `data/estructuras-de-datos.ts` con el named export tipado y el contenido
      exacto del diseño "Estructuras de Datos".
- [ ] Crear `index.ts`: registro `readonly` keyed por slug + validación de slugs
      duplicados + `getCoursePresentationBySlug(slug)` async; re-exportar tipos.

### Fase 2 — Componente compartido (`components/course-presentations/`)
- [ ] Leer `DESIGN.md` y aplicar tokens semánticos (nada de valores crudos de paleta).
- [ ] Crear `CoursePresentation.tsx` (Server Component) que reciba
      `presentation: CoursePresentation` y un slot de CTA (`cta: ReactNode`) reutilizado
      en la tarjeta del hero y en el CTA final; sin nav/footer/toggle propios.
- [ ] Implementar secciones en orden del diseño: Hero (2 columnas + tarjeta
      "Matrícula abierta" con `startDate`, `enrollDeadline`, meta `credits/hours/
      classesCount/spots`), Prerrequisitos (chips), Temario (unidades numeradas),
      Herramientas (chips), columnas Evaluación (barras con %) + Fechas importantes,
      Condiciones, CTA final ("¿Listo para empezar?" con `spots`).
- [ ] Sin estado cliente ni `useEffect`; mantener todo como Server Component.

### Fase 3 — Montaje en tab admin (vista previa)
- [ ] Editar `presentacion/page.tsx` del admin: obtener `course.course_slug` vía
      `getAcademicCourseById`; si `course_slug` es `null` o no hay presentación para
      ese slug, mostrar un estado vacío informativo dentro del tab (no `notFound`).
- [ ] Si hay presentación, renderizar `CoursePresentation` conservando breadcrumb y
      tabs actuales; pasar un CTA **no funcional** (botón deshabilitado / `aria-disabled`,
      sin acción) por ser vista previa.

### Fase 4 — Ruta de estudiante (`/[courseSlug]/presentacion`)
- [ ] Agregar `"presentacion"` a `RESERVED_LESSON_SLUGS` en `lib/courses/index.ts`.
- [ ] Crear `app/(cursos)/[courseSlug]/presentacion/page.tsx`: `requireUser` con
      `redirectTo` a la propia ruta; obtener presentación por `courseSlug`; `notFound()`
      si no existe.
- [ ] Pasar un CTA funcional mínimo: enlace (`<Link>`) a `/cuenta/cursos` (entrada del
      flujo de matrícula por código existente). La matrícula real queda fuera de scope.
- [ ] `generateMetadata` usando `presentation.name`.

### Fase 5 — Pulido responsive / dark / accesibilidad
- [ ] Verificar layout responsive del hero y las columnas (móvil apila, desktop 2 cols).
- [ ] Verificar dark mode (`dark:`) en todas las secciones con tokens semánticos.
- [ ] Accesibilidad: jerarquía de headings correcta, barras de evaluación con texto de
      % legible (no solo color), chips y CTAs con contraste y foco visibles.

## Criterios de aceptación
- Toda la información de la presentación proviene de `lib/course-presentations/data/*.ts`;
  no hay texto de contenido hardcodeado en el JSX del componente.
- `getCoursePresentationBySlug("estructuras-de-datos")` devuelve el objeto del diseño.
- El tab admin "Presentación del curso" muestra la presentación como vista previa con
  CTA no funcional; si el curso no tiene `course_slug` o presentación, muestra un estado
  vacío informativo (no un 404).
- Un usuario autenticado NO matriculado puede abrir `/[courseSlug]/presentacion` y ver la
  presentación (sin `requireCourseAccess`).
- El CTA de la ruta de estudiante lleva al flujo de matrícula existente (`/cuenta/cursos`).
- Un `courseSlug` sin archivo de presentación produce `notFound()` en la ruta de estudiante.
- Un usuario no autenticado es redirigido a `/login` al intentar abrir la ruta de estudiante.
- Un lessonSlug `"presentacion"` es rechazado por la validación de `lib/courses/index.ts`.
- El componente respeta tokens semánticos de DESIGN.md, funciona en claro/oscuro y es
  responsive; no reimplementa navbar/footer/toggle.

## Pruebas asociadas
> Estos archivos se crean junto con el spec.
- **Manuales:** `docs/testing/test-012-presentacion-curso.md` — casos `TC-012` (flujos
  con UI: vista admin, vista estudiante no matriculado, CTA, estados vacíos/404,
  dark/responsive).
- **Automáticas (e2e/unit):** framework de testing por definir (ver CLAUDE.md → Testing);
  se describen aquí y su archivo se crea cuando exista framework.
