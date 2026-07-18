# spec-020 — Revisión y calificación manual del docente

> **Estado:** Planificado — pendiente de implementación. La implementación de referencia
> existe en el tag `backup/feat-question-bank` y se portará al implementar este spec.

---

## Contexto

Cuando un estudiante envía una asignación (spec-019), el sistema calcula automáticamente
el `auto_score` de las preguntas **objetivas** (`multiple_choice`), pero las preguntas
**abiertas** (`open_text`, `code_write`, `coding_challenge`) no pueden calificarse de forma
automática: requieren el criterio del docente. Estas quedan a la espera de revisión manual.

Este spec cubre el último tramo del ciclo de evaluación: el docente dueño del curso abre la
lista de envíos de una asignación, revisa cada respuesta abierta apoyándose en la rúbrica de
la pregunta, asigna un `manual_score` con notas de retroalimentación, y **finaliza** la
calificación. Al finalizar, el sistema combina los puntajes automáticos y manuales en un
`final_score` definitivo y —si la asignación está vinculada a un `grade_item` de spec-003—
propaga ese puntaje al `student_grade` correspondiente, cerrando el vínculo con la libreta
de calificaciones académica.

No se crean tablas ni columnas nuevas: todo el estado de revisión se persiste en columnas ya
definidas en spec-019 (`answers.manual_score`, `answers.reviewer_notes`,
`answers.reviewed_at`, `submissions.final_score`, `submissions.status`,
`submissions.graded_at`).

---

## Alcance

### Incluye

- **Listado de envíos por asignación** para el docente dueño del curso, separando envíos
  **pendientes de revisión** (`status = 'submitted'`) de los ya **calificados**
  (`status = 'graded'`).
- **Panel de revisión de un envío**: muestra cada respuesta del estudiante con el contexto
  de la pregunta (enunciado, código, opciones marcadas, rúbrica y puntaje máximo por
  pregunta). Las respuestas objetivas se muestran ya resueltas; las abiertas
  (`open_text`, `code_write`, `coding_challenge`) exponen los controles de calificación.
- **Calificación por respuesta**: el docente asigna `manual_score` (validado en el rango
  `0..points` de la pregunta en la asignación) y `reviewer_notes` opcionales; se persiste
  `reviewed_at`.
- **Finalización de la calificación**: recalcula el `final_score` sumando, por respuesta, el
  `auto_score` (objetivas) o el `manual_score` (abiertas); marca el envío como `graded`,
  fija `graded_at`, y **propaga** el `final_score` a `student_grades` (upsert por
  `enrollment_id + grade_item_id`) si la asignación tiene `grade_item_id` vinculado.
- **Aislamiento por curso**: un docente solo lista y revisa envíos de asignaciones de sus
  propios cursos académicos (garantizado por RLS de `submissions`/`answers` de spec-019 y
  por la protección de rol de las rutas `/admin`).

### No incluye

- Cambios de esquema de base de datos: las tablas y columnas ya existen (spec-019).
- Cálculo del `auto_score` ni la lógica de envío del estudiante: viven en spec-019
  (`app/api/submissions/[submissionId]/submit/route.ts`).
- Ejecución automatizada de código para `coding_challenge`: el runner está deshabilitado
  (stub de spec-005); estas respuestas se califican **manualmente** como cualquier otra
  respuesta abierta. La ejecución real es una fase futura del banco.
- Reapertura de un envío ya calificado, recalificación masiva, o notificaciones al
  estudiante al finalizar.
- Estadísticas agregadas por pregunta o por asignación, exportación de resultados.
- Cualquier UI de creación/edición de asignaciones (spec-018) o de resolución (spec-019).

---

## Dependencias

- **spec-019 (assignment-solving)** — provee las tablas `submissions` y `answers` con sus
  columnas de revisión (`manual_score`, `reviewer_notes`, `reviewed_at`, `final_score`,
  `status`, `graded_at`) y sus políticas RLS; la capa de dominio `lib/submissions/`
  (tipos y funciones de lectura de envíos); y el cálculo previo de `auto_score` al enviar.
  Este spec **consume** ese estado y añade solo las funciones de revisión y su UI.
- **spec-018 (assignment-authoring)** — provee `assignments` y `assignment_questions`
  (de donde se lee `points`, el puntaje máximo por respuesta) y el vínculo opcional
  `grade_item_id`.
- **spec-003 (course-enrollment)** — provee `academic_courses`, `enrollments`, `grade_items`
  y `student_grades` (destino de la propagación); el middleware de protección de `/admin`;
  y los helpers de sesión/rol en `lib/auth/session.ts` (`requireAnyRole`).

> Cadena de dependencias: `spec-003` → `spec-005` → `spec-018` → `spec-019` → **spec-020**.

---

## Impacto en el sistema

### Base de datos

**Sin cambios de esquema.** Se leen y escriben columnas ya existentes (spec-019):

| Tabla | Columnas usadas en este spec | Uso |
|---|---|---|
| `submissions` | `status`, `auto_score`, `final_score`, `graded_at`, `assignment_id`, `enrollment_id` | Filtrado pendiente/calificada; recálculo y cierre de la calificación |
| `answers` | `manual_score`, `reviewer_notes`, `reviewed_at`, `auto_score`, `is_correct` | Calificación manual de respuestas abiertas |
| `assignment_questions` | `points` | Puntaje máximo por respuesta (cota superior de `manual_score`) |
| `assignments` | `grade_item_id` | Decide si se propaga a `student_grades` |
| `student_grades` | `enrollment_id`, `grade_item_id`, `score` | Destino de la propagación (upsert) |

> La propagación replica el mismo patrón que el submit del estudiante (spec-019): upsert
> con `onConflict: "enrollment_id,grade_item_id"`. Si la asignación no tiene
> `grade_item_id`, no se toca la libreta.

### Rutas (admin)

| Archivo | Propósito |
|---|---|
| `app/admin/courses/[academicCourseId]/assignments/[assignmentId]/review/page.tsx` | Lista de envíos de la asignación (pendientes + calificados), protegida con `requireAnyRole(["teacher","admin"])` |
| `app/admin/courses/[academicCourseId]/assignments/[assignmentId]/review/[submissionId]/page.tsx` | Panel de revisión de un envío concreto |

> Ambas rutas viven bajo `app/admin/...` (no en un route group `app/(admin)/`), coherente
> con la resolución de la colisión de rutas admin/multi-rol ya aplicada en el proyecto.

### Módulos `lib/`

| Archivo | Acción | Detalle |
|---|---|---|
| `lib/submissions/index.ts` | **Editar** | Añadir `getSubmissionForReview(submissionId)`, `gradeAnswer(answerId, score, notes)`, `finalizeGrading(submissionId)` y el helper interno `propagateToGradeItem(...)`. Reutiliza `getSubmissionsByAssignment(assignmentId)` (lectura de spec-019) para el listado. |
| `lib/submissions/actions.ts` | **Editar** | Añadir Server Actions `gradeAnswerAction(...)` y `finalizeGradingAction(...)` que envuelven las funciones anteriores, verifican sesión (`requireUser`) y hacen `revalidatePath` de las rutas de revisión y detalle de la asignación. |
| `lib/submissions/types.ts` | **Editar** | Añadir los tipos `SubmissionForReview` y `AnswerForReview` (respuesta + contexto de pregunta: `question_type`, `question_stem`, `question_code_snippet`, `question_code_language`, `question_choices`, `question_rubric`, `max_points`). |

> Las funciones de revisión usan el cliente Supabase de **sesión** (`createServerSupabaseClient`),
> por lo que el aislamiento por curso lo garantiza RLS: un docente solo puede leer/actualizar
> envíos y respuestas de sus cursos. No se usa el cliente de servicio aquí.
>
> `gradeAnswer` valida en código que `0 ≤ score ≤ points`, donde `points` proviene de
> `assignment_questions` (fallback 5). `finalizeGrading` decide, por respuesta, si suma el
> `manual_score` (tipos `open_text`/`code_write`/`coding_challenge`) o el `auto_score`
> (resto), redondea a 2 decimales, y solo entonces cierra el envío y propaga.

### Componentes (`components/admin/`)

| Componente | Tipo | Propósito |
|---|---|---|
| `SubmissionList` | Server (sin estado) | Renderiza la tabla de envíos con `status`, estudiante, fechas y enlace al panel de revisión de cada uno |
| `SubmissionReviewPanel` | Client (`"use client"`) | Formulario de revisión: por cada respuesta abierta, inputs de `score` y `notes` que invocan `gradeAnswerAction`; botón "Finalizar calificación" que invoca `finalizeGradingAction`. Muestra respuestas objetivas ya resueltas y la rúbrica como guía |

> `SubmissionReviewPanel` mantiene estado local de borradores por respuesta (score, notes,
> guardado, error) y usa `useTransition` para el guardado; no usa `useEffect` para fetch.
> Las respuestas objetivas se muestran en solo lectura. Se respetan los tokens semánticos de
> `DESIGN.md`, modo claro/oscuro y tipografía JetBrains Mono.

### Variables de entorno

Ninguna nueva.

---

## Fases de implementación

### Fase 1 — Tipos y funciones de dominio de revisión
- [ ] En `lib/submissions/types.ts`, definir `AnswerForReview` (respuesta + contexto de la
      pregunta: tipo, enunciado, snippet/lenguaje, opciones ordenadas, rúbrica, `max_points`)
      y `SubmissionForReview` (envío + estudiante + `answers: AnswerForReview[]`).
- [ ] En `lib/submissions/index.ts`, implementar `getSubmissionForReview(submissionId)`:
      carga el envío con `enrollment → student(full_name)` y sus `answers` con el contexto de
      cada pregunta (`type`, `stem`, `code_snippet`, `code_language`, `choices`, `rubric`) y
      el `points` de `assignment_questions`; normaliza la rúbrica (objeto único) y ordena las
      opciones por `order_index`.
- [ ] Implementar `gradeAnswer(answerId, score, notes)`: lee `points` de la
      `assignment_question` asociada, valida `0 ≤ score ≤ points` (error legible si no), y
      persiste `manual_score`, `reviewer_notes`, `reviewed_at`.
- [ ] Implementar `finalizeGrading(submissionId)`: recorre las `answers`, suma
      `manual_score` (tipos abiertos) o `auto_score` (resto), redondea a 2 decimales, marca
      el envío `graded` con `final_score` y `graded_at`, y llama a `propagateToGradeItem`.
- [ ] Implementar el helper interno `propagateToGradeItem(...)`: si la asignación tiene
      `grade_item_id`, hace upsert en `student_grades` por `enrollment_id + grade_item_id`.

### Fase 2 — Server Actions
- [ ] En `lib/submissions/actions.ts`, añadir `gradeAnswerAction(answerId, score, notes,
      submissionId, academicCourseId, assignmentId)`: `requireUser`, llama a `gradeAnswer`,
      y `revalidatePath` de las rutas `.../review` y `.../[assignmentId]`.
- [ ] Añadir `finalizeGradingAction(submissionId, academicCourseId, assignmentId)`:
      `requireUser`, llama a `finalizeGrading`, revalida las mismas rutas y devuelve el
      `final_score` resultante.

### Fase 3 — Rutas y componentes de UI
- [ ] Crear `SubmissionList` en `components/admin/` (tabla con estado, estudiante, fechas y
      enlace a la revisión de cada envío).
- [ ] Crear `SubmissionReviewPanel` en `components/admin/` (`"use client"`): controles de
      `score`/`notes` por respuesta abierta que invocan `gradeAnswerAction`, respuestas
      objetivas en solo lectura, rúbrica como guía, y botón "Finalizar calificación"
      (`finalizeGradingAction`).
- [ ] Crear la ruta `.../assignments/[assignmentId]/review/page.tsx`: `requireAnyRole`,
      carga curso, asignación y `getSubmissionsByAssignment`, separa pendientes/calificadas y
      renderiza `SubmissionList`.
- [ ] Crear la ruta `.../review/[submissionId]/page.tsx`: `requireAnyRole`, carga curso,
      asignación y `getSubmissionForReview`, y renderiza `SubmissionReviewPanel`.
- [ ] Enlazar la revisión desde la página de detalle de la asignación
      (`.../assignments/[assignmentId]`).

### Fase 4 — Pulido y validación
- [ ] Verificar aislamiento por curso: un docente no lista ni abre envíos de cursos ajenos
      (RLS + `requireAnyRole`).
- [ ] Tokens semánticos de `DESIGN.md`, modo claro/oscuro, JetBrains Mono, sin valores crudos
      de paleta.
- [ ] `npm run lint` y `tsc --noEmit` sin errores nuevos.
- [ ] Crear/actualizar `docs/testing/test-020-assignment-review.md` con los casos manuales.

---

## Criterios de aceptación

- El docente dueño del curso ve, para cada asignación, la lista de envíos separada en
  **pendientes de revisión** (`submitted`) y **calificados** (`graded`).
- Al abrir un envío, ve cada respuesta con el contexto de su pregunta; las respuestas
  objetivas aparecen resueltas y las abiertas (`open_text`, `code_write`,
  `coding_challenge`) exponen los controles de calificación con la rúbrica como guía.
- El docente asigna `manual_score` (rechazado si queda fuera de `0..points`) y
  `reviewer_notes`; el sistema persiste `reviewed_at`.
- Al **finalizar**, el `final_score` combina `auto_score` (objetivas) y `manual_score`
  (abiertas), el envío pasa a `graded` con `graded_at`, y —si la asignación tiene
  `grade_item_id`— el puntaje se propaga a `student_grades` (upsert por
  `enrollment_id + grade_item_id`).
- **Aislamiento:** un docente no lista ni revisa envíos de cursos que no le pertenecen.
- Lint y typecheck pasan sin errores nuevos; UI consistente con `DESIGN.md` (modo
  claro/oscuro, JetBrains Mono, tokens semánticos).

---

## Pruebas asociadas

- **Manuales:** `docs/testing/test-020-assignment-review.md` — casos `TC-*` de los flujos con
  UI: listado de envíos (pendientes/calificados), revisión de respuestas abiertas con
  asignación de `manual_score`/`reviewer_notes`, validación del rango de puntaje,
  finalización con cálculo de `final_score`, propagación a `student_grades` cuando hay
  `grade_item` vinculado y ausencia de propagación cuando no lo hay, y verificación del
  aislamiento por curso. El archivo de test lo crea el orquestador, no este spec.
