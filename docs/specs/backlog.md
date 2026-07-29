# Backlog — Deuda técnica y pendientes

Registro de ítems que no se abordan en su spec original pero que deben
resolverse antes de salir a producción o en una iteración posterior.

---

## DEBT-010 — Error de consola "script tag while rendering" en el init de tema (Next 16)

**Origen:** Reportado por el usuario durante la ronda de pruebas de `test-020-assignment-review.md`, ajeno al scope de spec-020
**Prioridad:** Media — error de consola en toda la app; relacionado con DEBT-008

Next.js 16.2.4 (Turbopack) reporta en consola:

```
Console Error
Encountered a script tag while rendering React component. Scripts inside React
components are never executed when rendering on the client. Consider using
template tag instead.
    at script (<anonymous>:null:null)
    at RootLayout (app/layout.tsx:47:9)
```

Apunta a `<Script id="theme-init" strategy="beforeInteractive" ...>` en
`app/layout.tsx:47`, el mismo mecanismo de aplicación de tema documentado en
**[[DEBT-008]]** (saltos perceptibles entre modo claro/oscuro). No se investigó
la causa raíz todavía; podría deberse a un cambio de comportamiento de
`next/script` con `strategy="beforeInteractive"` fuera de `<Head>` en Next 16,
o a una interacción con Turbopack/Cache Components.

**Acción:** Investigar en la misma iteración de temas/DESIGN.md prevista para
DEBT-008 — revisar si `next/script` con `beforeInteractive` sigue siendo la
API correcta en Next 16 para este caso, o si corresponde moverlo a
`app/layout.tsx` `<head>` explícito o a un mecanismo distinto (ver skill
`next-upgrade`).

---

## DEBT-009 — Redirigir al listado de envíos tras finalizar una calificación

**Origen:** spec-020 (TC-009), reportado por el usuario durante la ronda de pruebas manuales
**Prioridad:** Baja — mejora de UX, no bloquea funcionalidad

Al finalizar la calificación de un envío en `SubmissionReviewPanel`, el panel
permanece en la misma vista (con la calificación final mostrada arriba y los
campos deshabilitados). El usuario propuso que, en su lugar, redirija
automáticamente al listado de envíos (`.../review`), para no tener que
navegar manualmente de vuelta y ver el envío ya reflejado en "calificados".

**Acción:** Evaluar el cambio en `finalizeGrading`/`SubmissionReviewPanel.tsx`
(`components/admin/SubmissionReviewPanel.tsx`) para redirigir tras un
finalizado exitoso. Fuera del scope aprobado de spec-020; abordar como tarea
propia o como ajuste de scope explícitamente aprobado en una próxima sesión.

---

## DEBT-008 — Saltos perceptibles entre modo claro/oscuro en algunos casos

**Origen:** spec-019 (TC-034), detectado al probar el jugador de evaluaciones
**Prioridad:** Baja — cosmético, no bloquea funcionalidad

Durante la ronda de pruebas de `test-019-assignment-solving.md` (TC-034) se
reportó que, en algunos casos, hay un salto/parpadeo perceptible al cambiar
entre modo claro y oscuro. El mecanismo de tema (`app/layout.tsx` con un
script inline `beforeInteractive` + `components/ThemeInit.tsx` que además
escucha cambios en vivo de `prefers-color-scheme`) es compartido por **toda
la app**, no algo introducido por spec-019 — fuera de su alcance.

**Acción:** investigar el origen del salto (posible doble aplicación del
tema entre el script inline y `ThemeInit` al hidratar, o ausencia de
transición CSS) en una iteración dedicada a temas/DESIGN.md.

---

## DEBT-007 — `assignment_questions` no trae el enunciado de la pregunta en el flujo de resolución del estudiante

**Estado:** ✅ Resuelto en spec-019 (2026-07-24) — ver nota al final de este ítem.
**Origen:** spec-018 (TC-003), detectado al probar la UI admin de solo lectura
**Prioridad:** Alta — bloquea que un estudiante pueda resolver una evaluación

Al probar `TC-003` en `test-018-assignment-authoring.md` se descubrió que
`AssignmentGroupDetail.tsx` mostraba `question_id` truncado en vez del
enunciado real de la pregunta. La causa: `_getGroupByIdForActor` en
`lib/assignments/index.ts` (y su equivalente en `service.ts`,
`getGroupDetail`) seleccionaban `assignment_questions` con `select("*")`, sin
`join` a `questions` para traer `stem`/`type`. **Ya corregido** para el path
admin (`_getGroupByIdForActor` y `getGroupDetail`) durante spec-018.

Quedan sin corregir, mismo problema, en `lib/assignments/index.ts`:
- `_getActiveAssignmentsByEnrollmentForActor`
- `_getStudentAssignmentForActor`
- `_getOrAllocateVariantForActor`

Estas tres funciones alimentan el flujo de **resolución de examen del
estudiante** (spec-019, aún no implementado), fuera del alcance de spec-018.
Sin este fix, un estudiante vería IDs en vez de preguntas al intentar
resolver una evaluación.

**Acción prevista:** aplicar el mismo `select("*, question:questions(id, stem, type)")`
en las tres funciones listadas arriba.

**Resolución real (2026-07-24):** el join propuesto no alcanzaba, porque además
del `select("*")` había un problema más profundo: RLS de `questions`/
`question_choices` (`created_by = auth.uid() OR is_published`) bloquea la fila
completa cuando el estudiante no es el autor y la pregunta es un borrador del
docente (`is_published` significa "compartida en el banco", no "usada en una
evaluación" — spec-018 nunca lo exige al componer variantes). El mismo join
también habría fallado silenciosamente para el cálculo de `auto_score` en
`submitSubmission` (necesita `question_choices.is_correct`).
En vez de tocar el join de las tres funciones de `lib/assignments/index.ts`
(ni su RLS, fuera del alcance de spec-019), se resolvió con dos funciones
`security definer` acotadas por `assignment_variant_allocations`, nuevas en
spec-019 (`20260724000002_variant_question_content_rpcs.sql`):
`get_variant_question_details` (contenido para renderizar, con `is_correct`
gateado por `show_feedback_on`/estado del intento) y `get_variant_answer_key`
(clave de respuestas sin gating, uso interno en `submitSubmission`). Las tres
funciones originales de `lib/assignments/index.ts` quedan sin modificar —
spec-019 las reemplaza para su propio flujo de lectura con
`lib/submissions/getVariantQuestionDetails`.

---

## DEBT-006 — `course.lessons` mezcla dos tipos de nodo; guard de dominio en progreso

**Origen:** spec-021 (guías de laboratorio)
**Prioridad:** Baja — no bloquea, es limpieza estructural

Tres deudas quedaron documentadas en spec-021 y no se abordaron por estar
fuera de su alcance:

1. **`course.lessons` contiene nodos de dos tipos** (`kind: "lesson" | "guide"`)
   pese a llamarse `lessons`. Renombrar a `nodes` y migrar el `kind` opcional
   a una unión discriminada (`type CourseNode = Lesson | Guide`) tocaría ~10
   archivos sin beneficio funcional inmediato — se pospone a cuando llegue
   Payload CMS (Fase 2 del proyecto), momento natural para remodelar el tipo.
2. **`markLessonViewed` / `markLessonCompleted`** (`lib/progress/index.ts`) no
   rechazan slugs que no correspondan a una lección navegable; confían en que
   el llamador filtre guías antes de invocarlas. No hay FK de
   `lesson_progress` al catálogo de contenido que lo impida en base de datos.
3. **Código muerto:** `PreparationPlaceholder` y el estado "bloqueada /
   Próximamente" del sidebar (`LessonSidebarItem.tsx`) no tienen ningún caso
   real hoy — las 60+ lecciones/guías declaradas siempre tienen `articleSlug`.

**Acción:** Revisar en el spec que introduzca Payload CMS o el siguiente que
toque `lib/progress/`.

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
