# spec-014 — [IN PROGRESS] Cards de home enlazan a la presentación del curso

> Estado `[IN PROGRESS]`: implementación iniciada.

## Contexto

spec-013 (`[DONE]`) creó la home `/` como grilla de cards de cursos
(`components/home/HomeCourseCard.tsx`), cada una enlazando directo a
`/[courseSlug]` (contenido/lecciones), que exige matrícula activa vía
`requireCourseAccess`. spec-012 (`[DONE]`) creó por separado la página de
presentación de curso (`/[courseSlug]/presentacion`), pensada como vitrina
pre-matrícula accesible a cualquier usuario autenticado (matriculado o no),
pero solo implementó los datos de presentación para 1 de los 3 cursos del
catálogo (`estructuras-de-datos`).

Este spec conecta ambas piezas: las cards de home deben llevar primero a la
presentación (vitrina con temario, prerrequisitos, evaluación, CTA), no
directo al contenido gateado. Para que esto funcione en los 3 cursos, hay
que completar los datos de presentación que faltan. También se ajusta la
página de presentación para incluir el footer (hoy solo tiene Navbar +
Contenido) y para que el CTA sea consciente de si el usuario visitante ya
está matriculado.

## Alcance

### Incluye

- Cambiar el `href` de `components/home/HomeCourseCard.tsx` de
  `/${course.slug}` a `/${course.slug}/presentacion`.
- Crear `lib/course-presentations/data/programacion-cientifica.ts` y
  `lib/course-presentations/data/analisis-de-algoritmos.ts` (mismo shape
  `CoursePresentation` que `estructuras-de-datos.ts`), derivando el
  `syllabus` del contenido real de `lib/courses/data/*.ts` de cada curso y
  completando el resto de campos (créditos, cupos, fechas, evaluación,
  condiciones) siguiendo el mismo tono/formato del archivo existente.
- Registrar ambas presentaciones nuevas en `lib/course-presentations/index.ts`.
- Agregar `LandingFooter` (mismo componente y datos `FOOTER_LINKS` que usa
  `app/page.tsx`) a `app/(cursos)/[courseSlug]/presentacion/page.tsx`, para
  que la página quede como Navbar (global) + Contenido + Footer.
- Hacer el CTA de la presentación consciente de la matrícula: usar
  `hasCourseAccess(courseSlug)` (`lib/enrollments/access.ts`, ya existente)
  para mostrar "Ir al curso" (→ `/[courseSlug]`) cuando el usuario ya tiene
  acceso (matriculado, docente dueño o admin), y mantener "Matricular este
  curso" (→ `/cuenta/cursos`) cuando no lo tiene.

### No incluye

- Cambios en `app/(cursos)/[courseSlug]/page.tsx` (contenido) ni en su gate
  `requireCourseAccess`: sigue siendo la ruta protegida a la que llega un
  estudiante matriculado, ya sea desde el nuevo CTA "Ir al curso" o desde
  `/cuenta/cursos`.
- Cambios en el flujo de matrícula (`EnrollmentForm`, `enrollByCode`).
- Cambios en la vista previa admin
  (`app/(admin)/admin/courses/[academicCourseId]/presentacion/page.tsx`):
  se beneficia automáticamente de los nuevos archivos de datos sin tocar
  código; solo se verifica manualmente que sigue funcionando.
- Sincronizar `spots`/`startDate`/`enrollDeadline` con datos reales de
  `academic_courses` en Supabase: siguen siendo datos estáticos de
  contenido, igual que en `estructuras-de-datos.ts` (mismo criterio ya
  aceptado en spec-012).
- Reserva de `"presentacion"` en `RESERVED_LESSON_SLUGS`: ya existe desde
  spec-012, sin cambios.

## Impacto en el sistema

**Home / cards**
- `components/home/HomeCourseCard.tsx` — 1 línea: `href` de
  `/${course.slug}` a `/${course.slug}/presentacion`.

**Ruta de presentación**
- `app/(cursos)/[courseSlug]/presentacion/page.tsx`:
  - Agregar `import { LandingFooter } from "@/components/landing"` y
    `import { FOOTER_LINKS } from "@/lib/landing"`.
  - Renderizar `<LandingFooter links={FOOTER_LINKS} />` como hermano del
    `<main>` existente (mismo patrón que `app/page.tsx`), preservando el
    `sticky footer` del `body` flex-col del layout raíz.
  - Reemplazar el CTA estático por lógica condicionada a
    `hasCourseAccess(courseSlug)`: si `access.ok`, botón "Ir al curso" →
    `/${courseSlug}`; si no, botón "Matricular este curso" → `/cuenta/cursos`
    (comportamiento actual, sin cambios visuales).

**Datos de presentación**
- Nuevo `lib/course-presentations/data/programacion-cientifica.ts`.
- Nuevo `lib/course-presentations/data/analisis-de-algoritmos.ts`.
- `lib/course-presentations/index.ts` — agregar las 2 tuplas nuevas al
  arreglo `entries`; la validación de slugs duplicados (`Map`) ya existe y
  no cambia de lógica.

**Admin (sin cambios de código)**
- `app/(admin)/admin/courses/[academicCourseId]/presentacion/page.tsx` —
  consume `getCoursePresentationBySlug`; se verifica manualmente que un
  curso académico con `course_slug` igual a los 2 nuevos slugs ya muestra la
  vista previa completa en vez del estado vacío.

**Middleware / Auth**
- Sin cambios. `/[courseSlug]/presentacion` ya usa `requireUser` (spec-012);
  `hasCourseAccess` ya existe en `lib/enrollments/access.ts` y es de solo
  lectura (no se modifica su firma ni su lógica).

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación según los criterios de `CLAUDE.md`:

- *¿Expone datos que un agente consultaría?* No: los nuevos archivos de
  presentación son contenido estático file-based, mismo criterio que
  spec-012; no se introduce API ni tabla nueva.
- *¿Permite acciones que un agente ejecutaría?* No: no hay escritura nueva;
  `hasCourseAccess` ya existe y es de solo lectura interna.
- *¿Existe un MCP relacionado que extender?* No. `question-bank-mcp` y
  `attendance-mcp` cubren dominios distintos.
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No.

No se añade fase de MCP.

## Fases de implementación

### Fase 1 — Datos de presentación faltantes
- [x] Crear `lib/course-presentations/data/programacion-cientifica.ts`
      (`syllabus` derivado de `lib/courses/data/programacion-cientifica.ts`).
- [x] Crear `lib/course-presentations/data/analisis-de-algoritmos.ts`
      (`syllabus` derivado de `lib/courses/data/analisis-de-algoritmos.ts`).
- [x] Registrar ambas en `lib/course-presentations/index.ts` (`entries`).
- [ ] Verificar manualmente `/programacion-cientifica/presentacion` y
      `/analisis-de-algoritmos/presentacion`, y la vista previa admin para
      cursos académicos vinculados a esos slugs.

### Fase 2 — Footer en la ruta de presentación
- [x] Editar `presentacion/page.tsx` para incluir `LandingFooter` con
      `FOOTER_LINKS`, replicando el patrón de `app/page.tsx`.
- [ ] Verificar Navbar + Contenido + Footer en los 3 cursos, claro/oscuro,
      responsive.

### Fase 3 — Link de card de home
- [x] Editar `components/home/HomeCourseCard.tsx` (`href`) para apuntar a
      `/${course.slug}/presentacion`.
- [ ] Verificar que las 3 cards de `/` navegan a su presentación.

### Fase 4 — CTA consciente de matrícula
- [x] En `presentacion/page.tsx`, llamar `hasCourseAccess(courseSlug)` y
      renderizar "Ir al curso" (`/${courseSlug}`) si `access.ok`, o
      "Matricular este curso" (`/cuenta/cursos`) si no.
- [ ] Verificar con un usuario matriculado y uno no matriculado.

## Criterios de aceptación

- Las 3 cards de `/` (Estructuras de datos, Programación científica,
  Análisis de algoritmos) navegan a `/[courseSlug]/presentacion`.
- `getCoursePresentationBySlug("programacion-cientifica")` y
  `getCoursePresentationBySlug("analisis-de-algoritmos")` devuelven datos
  completos (no `null`).
- `/[courseSlug]/presentacion` muestra Navbar (global) + Contenido de la
  presentación + Footer, para los 3 cursos.
- Un usuario autenticado NO matriculado en un curso ve el CTA "Matricular
  este curso" en su presentación, enlazando a `/cuenta/cursos`.
- Un usuario autenticado matriculado (o docente dueño, o admin) en un curso
  ve el CTA "Ir al curso" en su presentación, enlazando a `/[courseSlug]`.
- La vista previa admin de presentación sigue funcionando para los 3 cursos
  vinculados por `course_slug`.
- `npm run build` y `npm run lint` pasan sin errores.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-014-cards-home-a-presentacion.md` — casos
  `TC-001` a `TC-009`.
- **Automáticas (e2e/unit):** no aplica — framework de testing automático
  aún "por definir" (ver sección "Testing" de `CLAUDE.md`).
