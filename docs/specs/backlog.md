# Backlog — Deuda técnica y pendientes

Registro de ítems que no se abordan en su spec original pero que deben
resolverse antes de salir a producción o en una iteración posterior.

---

## RESUELTO — Colisión de numeración en spec-006 (2026-07-18)

**Origen:** `spec-006-lecciones-privadas-navbar.md` (`[DONE]`, creado 2026-07-10)
y `spec-006-assignment-authoring.md` (planificado, creado 2026-07-15) compartían
el número `006`. Este último arrastraba también a `spec-007-assignment-solving`
y `spec-008-assignment-review` en la misma cadena de dependencias.

**Resolución:** se renumeró el track de evaluaciones planificado, sin tocar el
track de lecciones (ya `[DONE]`):
- `spec-006-assignment-authoring.md` → `spec-018-assignment-authoring.md`
- `spec-007-assignment-solving.md` → `spec-019-assignment-solving.md`
- `spec-008-assignment-review.md` → `spec-020-assignment-review.md`
- Sus `test-NNN` correspondientes se renombraron igual.
- Se actualizaron las referencias cruzadas en `spec-005-question-bank.md`,
  `spec-009-progreso-leccion.md` y `spec-011-autoevaluacion-cierre.md`.

**Pendiente menor:** `spec-013-home-grilla-cursos.md` tiene una mención
ambigua ("protegido por matrícula desde spec-006/007") que no se pudo
atribuir con certeza al track de asignaciones (spec-007 nunca se implementó,
por lo que no puede proveer protección de ruta); se dejó sin tocar. Revisar
si es una errata y corregir a solo `spec-006` cuando se retome esa área.

---

## DEBT-006 — Temas opcionales de los 3 cursos sin lección asignada

**Origen:** Reorganización de `content/cursos/` a partir del contenido real de
`courses/01-estructura-de-datos`, `courses/02-analisis-de-algoritmos` y
`courses/03-programacion-cientifica` (2026-07-18). Decisión explícita del
usuario: dejar fuera por ahora los temas sin semana asignada en el cronograma.
**Prioridad:** Baja — no bloquea producción

Cada curso tiene una sección "Temas opcionales" en su `info.md` sin semana
asignada en el cronograma, que no se creó como lección:

- **Estructuras de datos:** Tablas Hash, Grafos.
- **Análisis de algoritmos:** Grafos, Análisis amortizado, Introducción a
  NP-completitud.
- **Programación científica:** Consumo de APIs de datos abiertos,
  Introducción a scikit-learn.

**Acción:** Si se decide incorporarlos, crear su `.mdx` en
`content/cursos/<curso>/` y su entrada en `lib/courses/data/<curso>.ts` con
`order` posterior a la última lección regular del curso.

---

## DEBT-005 — MDX huérfanos en `estructuras-de-datos` sin lección asociada [RESUELTO]

**Origen:** Fix ad-hoc durante spec-016 (redirect de curso a lección) — el
usuario eliminó `bienvenida-al-curso.mdx` por no ser necesario, lo que expuso
que 4 lecciones (`pilas-y-colas`, `arboles`, `tablas-hash`, `grafos`)
referenciaban `articleSlug` sin archivo `.mdx` en disco, rompiendo el build.

**Resuelto el 2026-07-18:** la reorganización completa de `content/cursos/`
reemplazó las lecciones genéricas de los 3 cursos (incluidas las que
originaron este ítem) por la estructura real derivada de
`courses/01-estructura-de-datos`, `courses/02-analisis-de-algoritmos` y
`courses/03-programacion-cientifica`. Los `.mdx` huérfanos
(`configuracion-entorno-de-trabajo.mdx`, `java.mdx`, `poo-clases.mdx`) se
eliminaron por instrucción del usuario ("solo fueron una prueba"); toda
lección nueva tiene su `.mdx` correspondiente.

---

## DEBT-004 — Sin acción de eliminar/desactivar curso en el panel admin

**Origen:** Consulta del usuario sobre cómo eliminar un curso (2026-07-16)
**Prioridad:** Media — no bloquea producción, pero es una operación admin básica ausente

`AcademicCourseList.tsx` y el detalle de curso (`app/(admin)/admin/courses/[academicCourseId]/`)
no exponen ningún botón de eliminar ni desactivar. Ya existe
`deactivateCourseAction` en `lib/academic-courses/actions.ts` (soft delete vía
`is_active: false`), pero no está conectado a ningún componente de la UI. No
existe una acción de borrado definitivo (hard delete).

**Acción:** Diseñar spec para exponer en la UI:
1. Desactivar curso (usa `deactivateCourseAction` ya existente).
2. Evaluar si además se requiere borrado definitivo, y si debe hacerse en
   cascada (asistencia, notas, matrículas asociadas).

---

## DEBT-003 — `course_slug` de `academic_courses` sin validación ni selector

**Origen:** Revisión manual durante spec-006 (lecciones privadas)
**Prioridad:** Media — no bloquea producción, pero genera cursos "huérfanos"

En `AcademicCourseForm` (`components/admin/AcademicCourseForm.tsx`), el campo
`course_slug` es un input de texto libre: el docente debe escribir a mano el
slug del curso de contenido MDX que quiere vincular. `AcademicCourseSchema`
(`lib/academic-courses/schemas.ts`) no valida su formato ni su existencia, y
no hay FK en base de datos (el contenido vive en `lib/courses/data/` + MDX en
disco, fuera de Postgres — ver spec-003, línea 136). Si el docente teclea un
slug inexistente o con un typo, el `academic_course` se crea igual, sin
ningún error, y las lecciones del curso nunca se resuelven (404 vía el gate
de spec-006).

**Acción:** Reemplazar el input libre por un selector poblado con los slugs
reales de `lib/courses/index.ts` (o al menos validar contra esa lista en el
server action antes de persistir), para evitar cursos académicos sin
contenido asociado.

---

## DEBT-002 — Definir marca canónica: "Semillero SITAIM" vs "nodo"

**Origen:** spec-004 (landing home)
**Prioridad:** Media — impacto visual pero no funcional

El Navbar global muestra "Semillero SITAIM" mientras la landing home (spec-004)
usa "nodo" en el hero y footer. No se unificó en spec-004 para no bloquear.

**Acción:** Decidir marca canónica y aplicarla consistentemente en:
- Navbar (`components/navbar/`)
- Landing footer (`components/landing/LandingFooter.tsx`)
- Metadata global y títulos de página
- Assets de marca (logo, favicon — si aplica)

**Nota:** Esta decisión afecta la identidad visual de toda la plataforma.

---

## DEBT-001 — Configurar SMTP propio en Supabase

**Origen:** spec-002 / test-002 (TC-011, TC-012, TC-014)
**Prioridad:** Alta — requerido antes de producción

El plan gratuito de Supabase limita a 3 emails de auth por hora. Las pruebas
TC-011 (recuperación de contraseña), TC-012 (correo no registrado) y TC-014
(reenvío de confirmación) quedaron sin ejecutar por este límite.

**Acción:** Configurar SMTP externo en Supabase → Project Settings → Auth →
SMTP Settings. Proveedor recomendado: **Resend** (plan gratuito 3.000
emails/mes, configuración simple con Supabase).

Una vez configurado, ejecutar y aprobar TC-011, TC-012 y TC-014 en
`docs/testing/test-002-student-auth-supabase.md`.

---
