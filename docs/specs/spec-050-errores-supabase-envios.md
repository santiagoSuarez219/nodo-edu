# spec-050 — [TESTING] Fallos de infraestructura en envíos y control de acceso: dejar de escribir notas falsas

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

**[[DEBT-040]]** registra ~40 sitios de `lib/` donde el `error` de Supabase se
descarta al destructurar (`const { data } = await supabase…`) y el valor
degradado (`null`, `[]`, `0`) se vuelve indistinguible de un caso legítimo de
negocio. Este spec **no aborda la deuda completa** — ataca el subconjunto donde
la consecuencia no es confundir al usuario sino **corromper la nota de un
estudiante de forma silenciosa e irreversible**.

Al verificar el código el 2026-08-14 se confirmó que el impacto real es mayor
que el que describía el backlog. La entrada decía *"escribe `auto_score = 0`
como si fuera una nota real"*. Lo que hace `submitSubmission`
(`lib/submissions/index.ts:189-280`) es:

```ts
const { data: answers } = await supabase.from("answers")…        // error descartado
const { data: variantQuestions } = await supabase…               // error descartado
const { data: answerKeyRows } = await supabase.rpc(…)            // error descartado

for (const answer of answers ?? []) { … }                        // no itera → autoScore = 0

const hasOpenQuestions = (variantQuestions ?? []).some(…)        // [] → false

if (!hasOpenQuestions) {
  await propagateToGradeItem(supabase, submissionId);            // → libreta
  await supabase.from("submissions").update({
    status: "graded", final_score: roundedScore, …               // 0
  })
}
```

Si esas lecturas fallan, la evaluación no queda con un `auto_score` provisional
a la espera de revisión: se marca **`status: 'graded'`, `final_score: 0`, y se
propaga al ítem de calificación** del estudiante. Una evaluación **con preguntas
abiertas** —que debía ir a revisión manual del docente— se autocierra en cero,
porque un `answerKey` vacío hace que `hasOpenQuestions` sea `false`. Ninguno de
los `update` posteriores verifica `error`.

El mismo patrón produce dos corrupciones más, en el camino del **docente**:

- `finalizeGrading` (`:451`) obtiene los tipos de pregunta vía
  `getReviewContextByAssignmentQuestionId` (`:348`), que descarta `error` y
  devuelve un `Map` vacío. Con el mapa vacío, `type` es `""`, ninguna pregunta
  entra en `OPEN_QUESTION_TYPES`, y el bucle suma `auto_score` en vez de
  `manual_score`: **las notas que el docente acaba de poner a mano se ignoran
  en silencio** y el estudiante recibe un final más bajo.
- `getMaxPossiblePoints` (`:520`) devuelve `0` ante un fallo de lectura, y
  `propagateFinalScoreToGradeItem` (`:550`) convierte eso en
  `normalizedScore = 0` — otro cero propagado a la libreta como nota real.

Y el bypass de regla de negocio que ya señalaba el backlog: `createSubmission`
(`:77-84`) lee `{ count: attemptCount }` descartando `error`; con
`attemptCount ?? 0`, un fallo de conteo hace `usedAttempts = 0` y **salta la
validación de `max_attempts`** en una evaluación calificable.

**Por qué ahora.** El disparador dejó de ser hipotético: **[[DEBT-059]]**
documenta que el 2026-08-13 un pico de tráfico saturó la función serverless y
produjo 504 en múltiples rutas de contenido. Ese es exactamente el estado en que
estas consultas fallan. Un estudiante que entregue durante un pico se lleva un
cero en firme, y el fallo es **silencioso en ambos extremos**: el estudiante ve
su evaluación entregada, el docente ve una nota que parece legítima. No hay log,
no hay excepción, y después no hay forma de distinguir ese cero de uno real.

Es el mismo antipatrón que spec-037 corrigió en `lib/attendance/` y spec-046 en
el gate de autenticación; este spec lo aplica donde hay una nota en juego.

## Alcance

### Incluye

1. **`lib/submissions/index.ts`** — las cinco funciones donde un fallo de
   lectura produce una nota o salta una regla:
   - `createSubmission` (bypass de `max_attempts`)
   - `submitSubmission` (cierre automático en 0 + propagación a la libreta)
   - `finalizeGrading` (ignora `manual_score` del docente)
   - `getReviewContextByAssignmentQuestionId` (helper, origen del anterior)
   - `getMaxPossiblePoints` / `propagateFinalScoreToGradeItem` (normalización a 0)
2. **`app/api/submissions/[submissionId]/submit/route.ts`** — punto de entrada
   real del envío del estudiante: hoy descarta el `error` del lookup del
   `submission` (`:23`) y responde `404 "Intento no encontrado"` ante un fallo
   de lectura. Debe distinguir "no existe" de "no pude consultar" y devolver
   `503 service_unavailable`.
3. **`lib/enrollments/access.ts`** — `hasCourseAccess`: un fallo de consulta
   devuelve `not-enrolled` y expulsa a un docente u owner legítimo de su propio
   curso. Añadir el estado `unavailable` y reutilizar `/servicio-no-disponible`
   (infraestructura ya creada por spec-046).
4. **Diagnóstico de datos ya corrompidos** — consulta de detección (no de
   corrección automática) para localizar en producción los envíos que este
   defecto pueda haber cerrado en 0, con reporte al docente.

### No incluye

- **Los ~35 sitios restantes de [[DEBT-040]]**. La deuda queda abierta con el
  resto; este spec cierra solo el subconjunto "nota de estudiante en juego" y
  "control de acceso", que es el orden de prioridad que el propio ítem fija.
- Las guardas de borrado de `lib/grades/index.ts:64` y
  `lib/questions/index.ts:251` (permiten borrar con dependencias reportando
  éxito). Mismo patrón, sin nota en juego — se quedan en [[DEBT-040]].
- La consulta a `user_roles` de `middleware.ts:35-39` y de
  `requireRole`/`requireAnyRole`, y `app/layout.tsx:37-38,56` (navbar que
  desaparece). Son el residuo que spec-046 anotó explícitamente en
  [[DEBT-040]]; tocarlos implica el gate global de la app y merece su propia
  ronda de pruebas.
- **Corrección automática de notas ya corrompidas.** El spec entrega la
  detección y el reporte; qué hacer con cada envío afectado (reabrir el
  intento, recalificar, anular) es decisión del docente, caso por caso.
- Reintentos automáticos ante fallo de infraestructura. Se señaliza para que el
  estudiante reintente; no se implementa backoff (spec-046 sí reintenta en el
  middleware, pero ahí el costo de un reintento es un ping, no una escritura).
- Cambios de esquema. Este spec **no lleva migración**.

## Impacto en el sistema

| Archivo | Cambio |
|---------|--------|
| `lib/submissions/index.ts` | Verificar `error` en las 8 lecturas señaladas; nuevo estado `unavailable` en el tipo de retorno de `createSubmission`, `submitSubmission` y `finalizeGrading`; no escribir nunca puntaje desde datos incompletos |
| `lib/submissions/types.ts` | Tipo de resultado compartido con la variante `unavailable` |
| `lib/submissions/actions.ts` | Propagar `unavailable` en las 3 server actions que lo consumen (`createSubmissionAction`, `submitSubmissionAction`, `finalizeGradingAction`) |
| `app/api/submissions/[submissionId]/submit/route.ts` | Distinguir `not_found` de fallo de lectura; mapear `unavailable` → `503` |
| `lib/api/errors.ts` | `serviceUnavailableError()` + `service_unavailable: 503` en `errorCodeToStatus` |
| `lib/enrollments/access.ts` | `CourseAccess` gana `reason: "unavailable"`; `requireCourseAccess` redirige a `/servicio-no-disponible` |
| `components/student/AssignmentPlayer.tsx` | Mensaje honesto ante `503` (hoy: `"Error al enviar."` para todo) y **no** perder las respuestas del intento |
| `components/admin/SubmissionReviewPanel.tsx` | Mensaje honesto si `finalizeGrading` devuelve `unavailable` |

**Consumidores de `hasCourseAccess` a verificar** (13 sitios, todos comprueban
`access.ok`, así que el nuevo estado degrada cerrado sin romper tipos — hay que
confirmarlo uno por uno, no asumirlo):
`app/(cursos)/[courseSlug]/page.tsx`, `.../[lessonSlug]/page.tsx`,
`.../[lessonSlug]/layout.tsx`, `.../[lessonSlug]/apuntes/page.tsx`,
`.../presentacion/page.tsx`, `lib/progress/index.ts` (×2),
`lib/courses/teacher-notes.ts`, `lib/self-assessment/index.ts` (×3).

## Evaluación MCP

**¿Aplica MCP?** No.

Este spec no expone datos ni acciones nuevas: corrige el manejo de errores de
funciones internas ya existentes. Ningún agente docente necesita invocar
"enviar una evaluación" ni "verificar acceso a un curso" — son flujos de
estudiante y de UI docente, no de agente.

La consulta de diagnóstico de la Fase 5 es una lectura puntual de una sola vez
contra producción, no una capacidad recurrente: no justifica una herramienta.
Si tras ejecutarla resulta que hay que auditar envíos con regularidad, eso sí
sería candidato a herramienta de lectura en un MCP futuro — se registrará en el
backlog, no aquí.

## Decisiones de diseño

**D1 — Ante un fallo de lectura, no se escribe puntaje. Nunca.**
`submitSubmission` aborta antes de cualquier `update` si alguna de las tres
lecturas (`answers`, `assignment_questions`, `get_variant_answer_key`) falló. El
intento queda `in_progress` y el estudiante puede reintentar. Es preferible a
cualquier alternativa: un intento reintentable es recuperable, una nota falsa en
la libreta no.

**D2 — `hasOpenQuestions` no se infiere de una lista posiblemente vacía.**
Solo se calcula si la lectura de `assignment_questions` tuvo éxito. Una lista
vacía por error de red y una variante sin preguntas abiertas dejan de ser el
mismo valor. (Consecuencia de D1: con este orden, el caso ni siquiera se
alcanza — pero el cálculo queda explícito para que un refactor futuro no
reintroduzca la inferencia.)

**D3 — `max_attempts` falla cerrado.** Si el conteo de intentos falla,
`createSubmission` rechaza con un mensaje de infraestructura en vez de asumir
`0`. Bloquear temporalmente a un estudiante legítimo es molesto y reversible;
concederle intentos extra en una evaluación calificable no lo es, y además es
invisible.

**D4 — Se extiende el tipo existente, no se reemplaza.** Las funciones ya
devuelven `{ok: true, …} | {ok: false, error: string}`. Se añade
`reason: "business" | "unavailable"` a la rama `ok: false` en vez de migrar al
`{status: 'ok'|'unavailable'}` de spec-037. Motivo: los ~10 consumidores actuales
comprueban `.ok` y siguen funcionando sin tocarse (degradan cerrado), mientras
que quien necesite distinguir —la ruta API para el `503`, el jugador para el
mensaje— lee `reason`. Migrar al otro shape obligaría a tocar cada consumidor
sin ganancia real.

**D5 — `hasCourseAccess` reutiliza `/servicio-no-disponible` de spec-046.** No
se inventa una página nueva: `requireCourseAccess` redirige ahí ante
`unavailable`, igual que hace `requireUser` desde `lib/auth/session.ts`. Los
consumidores que llaman `hasCourseAccess` directo (contenido docente: apuntes,
clave de respuestas) siguen fallando cerrado — correcto para contenido
sensible— pero dejan de decir "no estás matriculado" a quien sí lo está.

**D6 — La detección de datos corrompidos no corrige nada.** La Fase 5 entrega
una consulta y un reporte; la decisión sobre cada envío es del docente. Un
`update` masivo sobre notas ya comunicadas a estudiantes sería peor que el bug.

**D7 — Sin migración.** Todo el cambio es de código de aplicación. La Fase 5 es
una consulta de solo lectura contra producción, que requiere confirmación
explícita del usuario en la sesión en que se ejecute.

## Fases de implementación

### Fase 1 — Tipo de resultado y helper de error de API ✅ (2026-08-16)
- [x] Añadido a `lib/submissions/types.ts`: `SubmissionFailure`, con
      `reason: "business" | "unavailable"` en la rama `ok: false` (D4).
- [x] `lib/api/errors.ts`: `serviceUnavailableError(message?)` y
      `service_unavailable: 503` en `errorCodeToStatus`.
- [x] `AuthResult` no se tocó (uso demasiado amplio en el proyecto); las 3
      Server Actions que necesitan `reason` usan su propio
      `SubmissionActionResult<T>` local en `lib/submissions/actions.ts`.

### Fase 2 — `submitSubmission`: no escribir notas falsas ✅ (2026-08-16)
- [x] Verificado `error` en las tres lecturas (`answers`, `assignment_questions`,
      `get_variant_answer_key`) y en el lookup inicial del `submission`.
- [x] Aborta con `unavailable` antes de cualquier `update` si alguna falló (D1),
      dejando el intento en `in_progress`.
- [x] `hasOpenQuestions` solo se calcula sobre lecturas ya confirmadas
      exitosas (D2).
- [x] Verificado `error` en los `update` de `answers`, `submissions` (cierre a
      `submitted`) y el cierre a `graded`.
- [x] `propagateToGradeItem` devuelve `{ok, error}` en vez de tragarse el
      error en un `console.error` silencioso — `submitSubmission` lo revisa
      y registra el fallo con contexto. No aborta el envío completo si falla
      (el `auto_score` ya escrito para `submitted` es real; solo la
      transición a `graded` queda pendiente, recuperable con
      `finalizeGrading`).

### Fase 3 — `createSubmission` y camino del docente ✅ (2026-08-16)
- [x] `createSubmission`: verificado `error` del `count` (falla cerrado, D3),
      de la lectura del grupo y del `in_progress`.
- [x] `getReviewContextByAssignmentQuestionId`: devuelve
      `{ok:true; data} | {ok:false; error}`, distinguiendo "mapa vacío" de
      "no pude leer".
- [x] `finalizeGrading`: aborta con `unavailable` si el contexto de revisión
      no se pudo leer, en vez de sumar `auto_score` en lugar de
      `manual_score`.
- [x] `getMaxPossiblePoints`: propaga el fallo en vez de devolver `0`;
      `propagateFinalScoreToGradeItem` aborta ante ese fallo — pero preserva
      el comportamiento original para un máximo genuinamente `0` (sin
      preguntas con puntos), que no es el bug que este spec corrige.
      También se corrigió un hallazgo hermano no listado originalmente: el
      fallo de lectura del propio `grade_item_id` del grupo se leía como
      "este grupo no tiene ítem configurado" y devolvía `{ok:true}` sin
      propagar nada — mismo patrón, mismo archivo, ahora aborta.

### Fase 4 — Superficies: ruta API, acciones y UI ✅ (2026-08-16)
- [x] `app/api/submissions/[submissionId]/submit/route.ts`: verificado el
      `error` del lookup y ya no responde `404` ante un fallo de lectura;
      mapea `unavailable` a `503` con `Retry-After: 30`, coherente con
      spec-046.
- [x] `lib/submissions/actions.ts`: `SubmissionActionResult<T>` propaga
      `reason` en las 3 acciones (`createSubmissionAction`,
      `submitSubmissionAction`, `finalizeGradingAction`).
- [x] `AssignmentPlayer.tsx` y `SubmissionReviewPanel.tsx`: **sin cambio de
      código** — ambos ya mostraban `result.error`/`body.error.message`
      verbatim; al hacer honesto el mensaje en el origen (Fase 2/3/ruta API),
      el mensaje correcto llega solo, sin tocar la UI. Confirmado por lectura
      que `AssignmentPlayer` no borra el estado `answers` en el camino de
      error (criterio 7).
- [x] `lib/enrollments/access.ts`: `reason: "unavailable"` en `CourseAccess` +
      redirección a `/servicio-no-disponible` en `requireCourseAccess` (D5).
- [x] Recorridos los 13 consumidores de `hasCourseAccess`/`requireCourseAccess`
      uno por uno. 12 degradan cerrado sin mensaje engañoso (confirmado por
      lectura, sin cambios necesarios). **Uno sí tenía el mensaje engañoso
      real**: `lib/self-assessment/index.ts` → `submitSelfAssessment` colapsaba
      `unavailable` en `reason: 'not_enrolled'`, y
      `components/courses/SelfAssessmentSection.tsx` lo traducía a **"No estás
      matriculado en este curso"** — exactamente el tipo de mentira que este
      spec existe para eliminar, ahora aplicándose a la nota de
      autoevaluaciones (spec-040) en vez de a los envíos. Corregido: nueva
      rama `reason: "unavailable"` en `SubmitSelfAssessmentResult`
      (`lib/self-assessment/types.ts`) con su propio mensaje.

### Fase 5 — Diagnóstico de datos ya corrompidos ✅
- [x] Escribir la consulta de detección: envíos `status = 'graded'` con
      `final_score = 0` / `auto_score = 0` cuyo conjunto de `answers` no
      justifique el cero (respuestas presentes sin `is_correct` evaluado,
      o preguntas abiertas sin `manual_score` pero cerradas automáticamente).
      `scripts/diagnostico-envios-corrompidos-spec050.sql` (dev, vía
      `docker exec ... psql` en `mirp-lab`) y su equivalente
      `scripts/diagnostico-envios-corrompidos-spec050.mjs` (producción, vía
      `@supabase/supabase-js` + service role — sin psql directo, mismo patrón
      que `scripts/diagnostico-duplicados-spec051.mjs`). Dos patrones
      marcados: (A) `multiple_choice` con `selected_choice_ids` no vacío pero
      `is_correct IS NULL`; (B) pregunta abierta (`OPEN_QUESTION_TYPES` de
      `lib/submissions/index.ts`) sin `manual_score` y sin `reviewed_at` en un
      envío ya `graded`.
- [x] Cruzar con la ventana del incidente de [[DEBT-059]] (2026-08-13) y con
      cualquier otra ventana de 5xx conocida. No aplicó: no apareció ningún
      envío afectado en ningún entorno (ver abajo), así que no hubo nada que
      acotar por fecha. El filtro por ventana queda comentado en el `.sql`
      por si se necesita en una corrida futura.
- [x] Ejecutada **primero contra la base de desarrollo** en `mirp-lab`
      (2026-08-16): 0 filas. Con confirmación explícita del usuario, ejecutada
      también contra **producción** (2026-08-16): 0 envíos `graded` en total
      en producción — la funcionalidad de asignaciones/envíos aún no tiene
      actividad real de calificación, así que no hay nada que pudiera estar
      corrompido.
      **Corrección posterior (TC-050-010, Fase 6):** al validar la consulta
      contra un caso plantado a propósito, el "0 filas" original resultó ser
      un **falso negativo** — bug real en el `JOIN` a `academic_courses`, que
      asumía `assignments.academic_course_id` siempre poblado. En una
      evaluación con variantes A/B/C ese campo es `NULL` en la fila de la
      variante (el curso vive en `assignment_variant_groups`), así que el
      `INNER JOIN` descartaba en silencio todos los envíos de evaluaciones
      con variantes — la mayoría, ya que `assignment-mcp` exige ≥2 variantes.
      Corregido en ambos scripts con `LEFT JOIN` + `COALESCE`; reverificado
      con el caso plantado (sí aparece) y de nuevo contra producción (sigue
      en 0, ahora con la lógica correcta — ver `docs/testing/test-050-…md`
      TC-050-010 para el detalle completo).
- [x] Entregar el listado al usuario con curso, estudiante, evaluación y
      fecha. Listado vacío en ambos entornos (con la consulta ya corregida);
      reportado al usuario tal cual. **No se modificó ninguna nota.**
- [x] Si aparecen envíos afectados, registrar en `docs/specs/backlog.md` el
      seguimiento de su corrección manual. No aplica — no aparecieron envíos
      afectados.

### Fase 6 — Verificación
- [x] `npm run lint` y `npm run build` en verde (verificado en Fase 1-4, sin
      cambios de código de producción desde entonces — solo specs/tests/scripts).
- [x] Ronda manual `docs/testing/test-050-errores-supabase-envios.md`: **10/10
      casos aprobados** (2026-08-16), incluyendo TC-050-002 (el más importante
      de la ronda: una evaluación con preguntas abiertas no se autocierra en
      0), TC-050-009 (camino feliz completo, sin regresión, nota propagada a
      `student_grades`) y TC-050-010 (encontró y corrigió un bug real en la
      propia consulta de diagnóstico de la Fase 5 — ver esa fase arriba).
- [ ] Invocar `@reviewer` sobre el diff contra `development` antes de `[DONE]`.

## Criterios de aceptación

1. Con la base de datos inalcanzable, enviar una evaluación **no** escribe
   ningún puntaje: el intento sigue `in_progress` y el estudiante ve un mensaje
   que dice que el servicio no está disponible, no que su nota es 0.
2. Una evaluación con preguntas abiertas **nunca** pasa a `status = 'graded'`
   por un fallo de lectura; sigue yendo a revisión del docente.
3. Con la base inalcanzable, iniciar un intento nuevo se rechaza con un mensaje
   de infraestructura, y **no** concede un intento por encima de `max_attempts`.
4. Finalizar una calificación con el contexto de revisión ilegible falla de
   forma visible en vez de guardar un final que ignora los `manual_score`.
5. `POST /api/submissions/[submissionId]/submit` devuelve `503
   service_unavailable` (no `404`, no `400`) ante un fallo de lectura.
6. Un docente dueño de un curso, con la base degradada, no ve
   "no estás matriculado": ve la página de servicio no disponible.
7. El estudiante no pierde las respuestas ya guardadas cuando el envío falla
   por infraestructura.
8. La consulta de la Fase 5 se ejecuta y su resultado (haya o no envíos
   afectados) queda registrado en el archivo de pruebas.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-050-errores-supabase-envios.md` — casos
  `TC-050-001` … `TC-050-010`. La técnica de simulación de fallo es la misma que
  ya usaron test-037 y test-046: **cortar el túnel SSH a `mirp-lab`** con la
  sesión ya iniciada.
- **Automáticas (e2e/unit):** framework aún **por definir** (ver CLAUDE.md →
  "Testing"), así que el archivo no se crea todavía. Cuando exista, los casos
  derivados de los criterios de aceptación son unitarios y de alto valor —
  `submitSubmission` con un cliente Supabase mockeado que devuelve `error` en
  cada una de las tres lecturas, verificando que no se emite ningún `update`.
  Es justo el tipo de prueba que no se puede hacer a mano de forma fiable.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-16
