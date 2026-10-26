# spec-064 — [DONE] Resultados de evaluaciones accesibles tras el cierre y retroalimentación completa

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.
>
> **Cierre (2026-10-26):** ronda manual en `nodo-dev` con 11 casos aprobados
> (`test-064-resultados-evaluaciones-cerradas.md`; TC-064-007 parcial por no
> haber un estudiante retirado en el entorno). Marcado `[DONE]` por decisión
> explícita del usuario. Quedan dos puntos conocidos y aceptados: (1) el
> fixture `[TEST-064] G-limite` de TC-064-011 sigue en `nodo-dev`, pendiente de
> limpieza; (2) la limitación de revelado de la RPC descrita en "Limitaciones
> conocidas".
>
> Resuelve **[[DEBT-085]]** y el hallazgo de `code_snippet` en `SubmissionResult`
> (2026-10-24). Rama: `feat/resultados-evaluaciones-cerradas`.

## Contexto

Hoy un estudiante ve la retroalimentación de un quiz únicamente en
`/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/resultados`
(`components/student/SubmissionResult.tsx`): nota, detalle por pregunta,
opciones correctas/incorrectas (según `show_feedback_on`) y las notas del
docente en preguntas abiertas. Esa vista tiene dos defectos:

1. **Inaccesible tras el cierre (DEBT-085).** `_getStudentAssignmentForActor`
   (`lib/assignments/index.ts`) descarta el grupo si `closes_at <= now`, y
   `resultados/page.tsx` hace `notFound()`. El listado
   `evaluaciones/page.tsx` también filtra por ventana. Consecuencias:
   - el estudiante no puede repasar su quiz después de que cierra;
   - `show_feedback_on = "close"` es **inalcanzable** (se libera justo cuando
     la página deja de existir), lo que anula la palanca que [[DEBT-035]]
     recomienda contra la memorización entre intentos.
2. **Notas del docente ocultas en `code_snippet`.** `SubmissionResult` define
   `needsManual` con `open_text`, `code_write` y `coding_challenge`, pero
   spec-020 incorporó `code_snippet` como tipo abierto
   (`OPEN_QUESTION_TYPES` en `lib/submissions/index.ts`). Si el docente deja
   notas en una pregunta `code_snippet`, el estudiante no las ve.

La RLS no impide la lectura histórica: `student_sees_published_groups` solo
exige grupo publicado y matrícula `active`; y la RPC
`get_variant_question_details` no consulta la ventana, solo el reparto y el
estado del último envío. El bloqueo es exclusivamente de la aplicación.

## Alcance

### Incluye

- La página de **resultados** se puede abrir con la ventana cerrada, siempre
  que la matrícula esté `active`, el grupo esté publicado y el estudiante tenga
  al menos un envío **no `in_progress`** de ese grupo.
- El listado de evaluaciones añade una sección **"Cerradas"** con los grupos
  cerrados donde el estudiante tiene un envío entregado; cada ítem enlaza solo
  a `resultados` (nunca al jugador).
- Con la ventana cerrada, la página de resultados **no ofrece** "Iniciar nuevo
  intento".
- `show_feedback_on = "close"` pasa a ser alcanzable: tras `closes_at` el
  estudiante ve las opciones correctas.
- `SubmissionResult` muestra la retroalimentación del docente también en
  `code_snippet`, usando un único criterio compartido de "tipo abierto".
- **Caso límite (hallazgo de la ronda manual, 2026-10-26):** si el último
  intento quedó `in_progress` y la ventana cerró, `resultados` muestra el
  último intento **entregado** en vez de dar 404, y "Cerradas" etiqueta cada
  grupo con el estado de ese intento entregado (no con "En progreso").

### No incluye

- Notificaciones al estudiante cuando el docente finaliza la calificación
  (excluido en spec-020).
- Explicaciones por pregunta o por opción (requeriría columna nueva en
  `questions`; se evalúa en un spec aparte si el docente lo pide).
- Cambios al jugador (`.../evaluaciones/[groupId]/page.tsx`): sigue limitado a
  la ventana abierta.
- Cambios de esquema, RLS o RPC.
- Cambios en la tarjeta de acceso de spec-055 (ver "Preguntas abiertas").

## Impacto en el sistema

### Base de datos

**Sin cambios** (sin migraciones, sin cambios de RLS ni de RPC).

### Módulos `lib/`

| Archivo | Acción | Detalle |
|---|---|---|
| `lib/assignments/index.ts` | Editar | Nueva `getStudentAssignmentForResults(groupId, enrollmentId)`: igual que `getStudentAssignment` pero **sin** verificar `opens_at`/`closes_at`; exige grupo publicado, matrícula `active` y reparto existente. Nueva `getClosedAssignmentGroupsWithSubmissions(academicCourseId, enrollmentId)` (ordenada por `closes_at` descendente, nunca lanza): grupos publicados con `closes_at <= now` y al menos un envío no `in_progress` de la matrícula. `getStudentAssignment` y `getOpenAssignmentGroupsForStudent` no cambian. |
| `lib/submissions/index.ts` | Editar | `getSubmissionByStudent` acepta `{ delivered: true }` (último intento `submitted`/`graded`). Nuevo módulo `lib/submissions/question-types.ts` con `isOpenQuestionType` (sin imports de servidor, usable desde Client Components) para que `SubmissionResult`, `SubmissionReviewPanel` y `finalizeGrading` no diverjan. |

### Rutas

| Archivo | Acción | Detalle |
|---|---|---|
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/resultados/page.tsx` | Editar | Usar `getStudentAssignmentForResults`; calcular `isClosed` y ocultar "Iniciar nuevo intento" si el grupo cerró. Mantiene la redirección al jugador si el envío está `in_progress` **y** la ventana está abierta; con ventana cerrada y envío `in_progress` → `notFound()`. |
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/page.tsx` | Editar | Añadir sección "Cerradas" con `getClosedAssignmentGroupsWithSubmissions`, mostrando título, fecha de cierre, estado (`SUBMISSION_STATUS_LABELS`) y enlace a `resultados`. Texto de vacío solo si no hay abiertas **ni** cerradas. |

### Componentes

| Archivo | Acción | Detalle |
|---|---|---|
| `components/student/SubmissionResult.tsx` | Editar | Reemplazar la lista local `needsManual` por el criterio compartido (incluye `code_snippet`). |
| `components/admin/SubmissionReviewPanel.tsx` | Editar (mínimo) | Importar el mismo criterio compartido en lugar de su copia local `OPEN_TYPES`. |

UI: tokens semánticos de `DESIGN.md`, modo claro/oscuro, JetBrains Mono,
Flowbite primero. La sección "Cerradas" reutiliza el estilo de las tarjetas del
listado actual.

## Evaluación MCP

**¿Aplica MCP?** No.

- No expone datos ni acciones nuevas a agentes: es una vista del estudiante
  bajo su propia RLS, sin endpoints `/api/*` nuevos.
- Los MCPs de evaluación (`assignment-mcp`, `question-bank-mcp`) cubren el lado
  docente y no cambian. No se modifica ningún system prompt de `docs/mcps/`.

## Decisiones de diseño

- **D1 — Criterio "histórico".** Un grupo cerrado aparece solo si el
  estudiante tiene ≥1 envío `submitted` o `graded`. Evita listar evaluaciones
  que nunca intentó.
- **D2 — Sin reapertura.** Cerrar la ventana bloquea intentos nuevos y la
  continuación de envíos `in_progress`; solo se permite lectura de lo
  entregado.
- **D3 — La visibilidad la sigue decidiendo la RPC.** No se agrega ningún flag
  de "revelar" en la aplicación: `show_feedback_on` y `closes_at` los resuelve
  `get_variant_question_details`, como hasta ahora.
- **D4 — Un solo criterio de tipo abierto.** Se centraliza para que no vuelva
  a divergir entre revisión docente, cierre de calificación y vista del
  estudiante.

- **D5 — Tarjeta de spec-055 sin cambios** (decidido 2026-10-24). La tarjeta
  "Evaluaciones" del detalle de matrícula sigue contando solo las abiertas;
  las cerradas se alcanzan desde el listado.
- **D6 — Orden de "Cerradas"** (decidido 2026-10-24): por `closes_at`
  descendente (las que cerraron más recientemente primero).

## Limitaciones conocidas

- En el caso límite (último intento `in_progress`), la RPC
  `get_variant_question_details` decide el revelado según el estado del
  **último** intento, así que no marca las opciones correctas aunque
  `show_feedback_on` lo permita. Se ven nota, respuestas y notas del docente.
  Corregirlo exige cambiar la RPC (migración), fuera de este spec.

## Preguntas abiertas

Ninguna.

## Fases de implementación

### Fase 1 — Dominio
- [x] `getStudentAssignmentForResults` en `lib/assignments/index.ts`.
- [x] `getClosedAssignmentGroupsWithSubmissions` en `lib/assignments/index.ts`.
- [x] Criterio compartido de tipo abierto en `lib/submissions/question-types.ts`.

### Fase 2 — Resultados
- [x] Ajustar `resultados/page.tsx` (ventana cerrada, sin reintento).
- [x] Corregir `SubmissionResult` (`code_snippet`) y alinear
      `SubmissionReviewPanel`.

### Fase 3 — Listado
- [x] Sección "Cerradas" en `evaluaciones/page.tsx`.

### Fase 4 — Validación
- [x] `npm run lint` y `tsc --noEmit` sin errores nuevos.
- [x] Verificar con la RLS del estudiante: no lee envíos de otra matrícula (TC-064-007).
- [x] Ronda manual `docs/testing/test-064-resultados-evaluaciones-cerradas.md`.

## Criterios de aceptación

1. Con la ventana de una evaluación cerrada, un estudiante `active` con un
   envío `submitted` o `graded` abre `.../resultados` (UI y URL directa) y ve
   nota, detalle y retroalimentación.
2. Con `show_feedback_on = "close"`: antes de `closes_at` no ve las opciones
   correctas; después de `closes_at` sí.
3. Con `show_feedback_on = "never"` nunca ve las opciones correctas, abierta o
   cerrada la ventana.
4. El listado muestra la sección "Cerradas" solo con grupos cerrados donde
   tiene un envío entregado; enlazan solo a `resultados`.
5. Con la ventana cerrada, `resultados` no muestra "Iniciar nuevo intento",
   aunque le queden intentos.
6. Un grupo cerrado sin ningún envío entregado (solo `in_progress`) responde
   404 en `resultados` y no aparece en "Cerradas".
6b. Si hay un intento entregado y uno posterior `in_progress`, con la ventana
    cerrada `resultados` muestra el intento entregado (nota y retroalimentación
    del docente) y "Cerradas" lo etiqueta con el estado de ese intento.
7. Un estudiante `withdrawn` o de otra matrícula recibe 404.
8. Las notas del docente se muestran en `open_text`, `code_snippet`,
   `code_write` y `coding_challenge`.
9. El jugador sigue inaccesible con la ventana cerrada.
10. Lint y typecheck sin errores nuevos; UI coherente con `DESIGN.md` en modo
    claro y oscuro.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-064-resultados-evaluaciones-cerradas.md`.
- **Automáticas (e2e/unit):** por definir (sin framework de testing, ver
  `CLAUDE.md`); un caso por criterio de aceptación cuando exista el framework.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-10-24
