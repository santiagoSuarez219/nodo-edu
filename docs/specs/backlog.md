# Backlog — Deuda técnica y pendientes

Registro de ítems que no se abordan en su spec original pero que deben
resolverse antes de salir a producción o en una iteración posterior.

---

## DEBT-037 — La app no tiene ningún error boundary: un server action que lanza deja al usuario sin mensaje útil

**Origen:** `TC-007` de `docs/testing/test-fix-attendance-panel-flicker.md`
(2026-08-01), al cortar deliberadamente la conexión con Supabase
**Prioridad:** Media — no se manifiesta en operación normal, pero cuando se
manifiesta es en el peor momento (docente en clase, sin base de datos)

`find app -name "error.tsx" -o -name "global-error.tsx"` no devuelve **ningún
archivo**: la app no define un solo error boundary de App Router. Cuando un
server action lanza —por ejemplo `openSession`
(`lib/attendance/index.ts:75`), que hace `throw error` ante cualquier fallo de
Supabase que no sea una violación de unique constraint— la excepción no la
recoge nadie.

Observado en desarrollo con el túnel SSH a `mirp-lab` caído: el overlay de
Turbopack con *"An unexpected response was received from the server."*
apuntando a `TeacherAttendanceControl.tsx:97`. En producción el usuario vería
la pantalla de error genérica de Next.js, perdiendo el contexto de la página.

Los `try/catch` de los server actions distinguen bien los errores **de
negocio** (devuelven `{ success: false, error }`, que la UI sí sabe mostrar),
pero los de **infraestructura** se propagan crudos. El manejo de errores
inline que agregó **[[DEBT-018]]** cubre solo la primera categoría, por diseño.

**Acción:** Agregar al menos un `app/error.tsx` (y evaluar `global-error.tsx`)
con un mensaje comprensible y un botón de reintento (`reset()`). Evaluar
además si los server actions críticos —los del panel de asistencia, que se usa
en vivo durante la clase— deberían capturar sus propias excepciones y
devolverlas como `{ success: false, error }` en vez de lanzar, para que el
docente vea el banner inline sin perder la página.

---

## DEBT-036 — CLAUDE.md declara Flowbite y shadcn/ui, pero ninguno está instalado

**Origen:** Detectado al resolver **[[DEBT-018]]** (2026-08-01), al buscar un
componente de modal/toast del sistema de diseño para reemplazar los
`alert()`/`confirm()` nativos
**Prioridad:** Baja — no rompe nada hoy, pero desvía cada decisión de UI

CLAUDE.md → "Stack tecnológico" declara **Flowbite** ("componentes UI sobre
Tailwind; usar primero") y **shadcn/ui** ("complementarios cuando Flowbite no
cubra"), y "Convenciones de código" repite la regla ("Flowbite primero,
shadcn/ui como complemento"). **Ninguno de los dos está en `package.json`**:
las dependencias de UI son solo `tailwindcss`, `react-hook-form` y `zod`. No
hay `components/ui/` ni `components.json`.

En la práctica los componentes se escriben a mano con Tailwind, y los
primitivos se van reinventando por archivo: el diálogo modal de
`AssignmentPlayer` (spec-019) es el único patrón accesible existente, y
DEBT-018 lo copió a `AdminAttendancePanel` en vez de importarlo.

**Acción:** Decidir cuál de las dos realidades vale, y alinear la otra:
(a) instalar Flowbite/shadcn/ui y adoptarlos donde ya hay primitivos a mano, o
(b) corregir CLAUDE.md para reflejar que los componentes son propios, y extraer
los primitivos repetidos (empezando por el diálogo de confirmación, hoy
duplicado en dos archivos) a un `components/ui/` propio.

---

## DEBT-035 — Barajado de evaluaciones A/B/C: orden estable entre intentos, no congelado en el `submission`

**Origen:** Decisión D1 de spec-035 (2026-08-01), hallazgo de `@reviewer` al revisar el spec
**Prioridad:** Baja — el diseño actual está justificado y cubre el riesgo real
(copieteo entre estudiantes contiguos); esto es refinamiento futuro, no un defecto

spec-035 (`docs/specs/spec-035-evaluaciones-barajado.md`) implementó el
barajado de `shuffle_questions`/`shuffle_choices` con una semilla que
deliberadamente **no** incluye `attempt_number`: `assignment-questions:${enrollmentId}:${assignmentId}`
y `assignment-choices:${enrollmentId}:${questionId}` (`lib/submissions/index.ts`,
`getVariantQuestionDetails`). La decisión (D1 del spec) prioriza garantizar
"por construcción" que el jugador y la página de resultados coincidan, en vez
de depender de que ambas resuelvan igual cuál es el intento vigente —hoy lo
hacen por caminos distintos (`createSubmission` recupera la fila
creada/recuperada; `getSubmissionByStudent` toma el `attempt_number` más alto).

**Consecuencia asumida:** con `max_attempts > 1` y `show_feedback_on: "submit"`,
un estudiante que ya vio la retroalimentación de su primer intento puede
memorizar la posición de la opción correcta y acertar el reintento sin releer
el enunciado. La palanca correcta hoy contra esto es `show_feedback_on`
(`"close"` o `"never"`), no el barajado.

**Relacionado — flags no congelados en el intento:** los flags se leen en vivo
del grupo en cada llamada a `getVariantQuestionDetails`, no se copian al
`submission` al crearlo. Si el docente cambia `shuffle_questions`/
`shuffle_choices` **a mitad de un intento en curso**, el orden se reordena en
la siguiente recarga del estudiante y la página de resultados puede no
coincidir con lo que vio durante la resolución — la misma incoherencia que D3
de spec-035 buscaba evitar, mochila de que la configuración vive en el grupo y
no en el intento.

**Acción:** Si en la práctica se observa que estudiantes aprovechan la
posición memorizada entre intentos, incorporar `attempt_number` (o
`submission_id`) a la semilla — pero **antes** unificar cómo el jugador y la
página de resultados resuelven cuál es el intento vigente para esa variante,
o la coherencia jugador↔resultados que D3 garantiza hoy se rompe. Evaluar en
el mismo trabajo si conviene copiar los flags al `submission` al crearlo (o a
`assignment_variant_allocations`), para que un cambio de configuración del
docente a mitad de examen no reordene un intento ya en curso.

---

## DEBT-034 — `shuffle_choices` / `shuffle_questions` son flags decorativos: nada los implementa — ✅ Resuelto (spec-035, 2026-08-01)

**Origen:** Detectado al investigar **[[DEBT-029]]** (2026-07-31)
**Prioridad:** ~~Media~~ → **Resuelto** (frente 1 implementado)

`assignment_variant_groups` tiene las columnas `shuffle_questions` y
`shuffle_choices` que atraviesan el sistema (esquema, tipos, API, panel admin).
**Ningún código las leía para barajar** hasta spec-035.

**Resolución (2026-08-01):** implementado el barajado en el servidor con orden
estable por estudiante (spec-035). El helper de barajado (`seededShuffle`) se
movió de `lib/self-assessment/` a `lib/shuffle.ts` (módulo transversal).
`getVariantQuestionDetails()` ahora lee `shuffle_questions` y `shuffle_choices`
del grupo, aplica Fisher-Yates con semilla `(enrollment_id, assignment_id/question_id)`,
y devuelve las preguntas/opciones barajadas. El orden es estable entre recargas
durante el intento, y coincide exactamente entre el jugador y la página de
resultados — garantizado por construcción, no por convención entre dos páginas.
La vista del docente sigue mostrando orden canónico. Panel admin ahora advierte
con una nota que `shuffle_questions` rompe la numeración compartida en clase.

**Frente 2 (quitar los flags de la UI):** descartado. Los flags son verdaderos
ahora y funcionan correctamente.

---

## DEBT-033 — Políticas RLS legacy conviven con las del diseño de variantes en `assignments` y `assignment_questions`

**Origen:** Detectado al resolver **[[DEBT-031]]** (2026-07-31), al comparar el
esquema real de producción contra el que reconstruyen las migraciones
**Prioridad:** Baja — hoy inocuo, pero es superficie de RLS que nadie diseñó a
propósito y que puede volverse peligrosa si el modelo de datos cambia

Producción arrastra **8 políticas RLS legacy** creadas fuera de git, del diseño
original en que una fila de `assignments` era la evaluación completa y no una
variante A/B/C:

- `assignments`: `"assignments: select"`, `": insert teacher or admin"`,
  `": update teacher or admin"`, `": delete teacher or admin"`
- `assignment_questions`: las cuatro equivalentes

DEBT-031 las incorporó a las migraciones
(`20260717000000`, `20260717000001`) **para que el esquema reconstruido fuera
fiel al real**, no porque se hayan validado. Conviven con las que sí declaran
`20260718000003` y `20260718000005` (`inherits_group_select`,
`inherits_variant_select`, `teacher_manages_own_*`).

**El riesgo:** Postgres combina las políticas permisivas de un mismo comando con
`OR`, así que la política legacy **amplía** el acceso más allá de lo que
`20260718000005` pretendía acotar (su propio comentario dice que `assignments`
debe heredar la visibilidad del grupo padre). Hoy no tiene efecto práctico
porque las filas de variante tienen `academic_course_id` en `NULL` —desde que
`20260718000004` relajó ese `NOT NULL`—, así que el `EXISTS` de la política
legacy nunca da verdadero. Es decir: **la contención depende de un dato nulo,
no de la política**. Si alguna vez se vuelve a poblar `academic_course_id` en
las filas de variante, las políticas legacy se activan y exponen metadata de
variantes (`variant_label`, `description`) y el contenido de
`assignment_questions` a cualquier estudiante matriculado en el curso, saltándose
la cascada del grupo.

**Acción:** Auditar si las 8 políticas legacy siguen cumpliendo alguna función.
Si no —lo más probable, dado que todo el acceso de sesión a estas tablas es de
solo lectura y las escrituras van por `service_role` en
`lib/assignments/service.ts`— eliminarlas con una migración nueva
(`drop policy`), aplicada tanto en dev como en producción. Verificar antes que
ningún flujo de estudiante o docente dependa de ellas.

---

## DEBT-032 — Tokens crudos de Tailwind en los componentes nuevos del panel admin de curso

> Título restaurado el 2026-08-01: esta entrada había perdido su encabezado y su
> separador, quedando pegada al final de **[[DEBT-033]]** — era invisible al leer
> el índice del backlog y su número no aparecía en la numeración.

**Origen:** spec-032 (navegación admin de curso), hallazgo de `@reviewer`
**Prioridad:** Baja — impacto visual/mantenibilidad, no funcional

`components/admin/CourseHeader.tsx` y `components/admin/CourseTabs.tsx` (nuevos
en spec-032, contenido movido verbatim desde las páginas que reemplazaron) usan
clases crudas de la paleta Tailwind (`text-gray-900`, `text-blue-700`,
`bg-green-100`, `border-gray-200`) en lugar de los tokens semánticos que exige
`DESIGN.md` y CLAUDE.md → "Convenciones de código". Mismo problema que
**DEBT-015** (navbar), que documenta que el sistema de tokens actual no tiene
variante `dark:`, lo que hace inviable migrar hoy sin abordar antes esa
limitación.

**Acción:** Ampliar el alcance de DEBT-015 para cubrir también
`components/admin/`, o resolverla junto con esa deuda cuando el sistema de
tokens soporte modo oscuro.

**Relacionado:** también se detectaron anchos de contenedor inconsistentes
entre las pestañas del curso (`max-w-5xl`, `max-w-2xl`, `max-w-7xl`, sin límite)
ahora que comparten un header y tabs comunes en `layout.tsx`. Revisar si vale
la pena unificar el `max-w-*` en el layout tras la ronda de pruebas manuales
(`test-032`, TC-005).

---

## DEBT-031 — El historial de migraciones no reconstruye producción desde cero — ✅ Resuelto (2026-07-31)

**Origen:** Detectado al armar el entorno de desarrollo local en `mirp-lab`
(2026-07-31, post-spec-026) — `supabase start` con las migraciones del repo
falló
**Prioridad:** Alta — es un riesgo de recuperación ante desastres, no solo un
problema de este entorno de dev

La tabla `assignments` existe en producción (verificado por el schema
OpenAPI de PostgREST) pero **ninguna migración la crea**. La migración
`20260718000002_init_assignment_variant_groups.sql` la asume existente — su
propio comentario dice *"table may already exist from prior integration"* —
y solo le agrega columnas (`variant_group_id`, `variant_label`) vía
`ALTER TABLE`. No hay ningún commit que borre una migración anterior que la
creara: se creó fuera de git en algún momento (probablemente a mano en el
SQL Editor de Supabase), antes de que existiera esa migración.

Consecuencia: reconstruir producción desde cero solo con
`supabase/migrations/` **falla** en ese punto. Esto no bloqueó el
despliegue original (spec-026 nunca reconstruyó el esquema desde cero,
solo verificó que las 34 migraciones ya aplicadas coincidían Local==Remote),
pero sí es un riesgo real para una recuperación ante desastres futura, y ya
bloqueó armar un entorno de desarrollo espejo.

**Mitigación temporal (2026-07-31):** se agregó una migración
`20260717000000_local_only_missing_assignments_table.sql`, pero **solo en
la copia del repo que vive en `mirp-lab`** (`/home/sosagro4c/proyectos/nodo-dev-db/`),
con la estructura real de `assignments` tomada del schema de producción. No
se commiteó al repo principal — ver decisión del usuario de no tocar el
historial de migraciones de producción sin evaluarlo aparte.

**Resolución (2026-07-31, opción (a)):** se extrajo el DDL real de producción
con `supabase db dump --linked --schema public` y se commitearon dos
migraciones nuevas, ambas con timestamp anterior a `20260718000002`:

- `20260717000000_init_assignments_legacy_table.sql`
- `20260717000001_init_assignment_questions_legacy_table.sql`

Al hacerlo se descubrió que **`assignment_questions` tenía el mismo problema
que `assignments`**, no detectado cuando se redactó este ítem: también se creó
fuera de git, por lo que el `create table if not exists` de `20260718000002`
nunca se ejecutó en producción y el esquema real conserva nombres legacy
(constraint `assignment_questions_unique` en vez de `unique_question_per_variant`,
más un índice legacy `assignment_questions_assignment_id_order_index_idx`
*adicional* al que crea esa migración). Ambas tablas arrastraban además 4
políticas RLS legacy cada una (`"<tabla>: select/insert/update/delete teacher
or admin"`) que ninguna migración declaraba.

**Verificación:** `supabase db reset` desde cero en `mirp-lab` seguido de
`supabase db dump --local`, comparado línea a línea contra el dump de
producción → **conjunto de sentencias idéntico**, incluidos nombres de
constraints, índices, triggers y políticas RLS.

La migración `20260717000000_local_only_missing_assignments_table.sql` de
`mirp-lab` se eliminó: ya no hace falta, la copia de allá está sincronizada
con el repo.

Las 8 políticas RLS legacy se reprodujeron por fidelidad con el esquema real,
sin validarlas — quedaron registradas aparte como **[[DEBT-033]]**.

**Nota de mantenimiento (reconfirmada):** tras cada `supabase db reset` en
`mirp-lab` hay que reaplicar a mano los `GRANT` de `anon`/`authenticated`/
`service_role` sobre `public` (ver CLAUDE.md → "Base de datos"). Es el único
punto en que el esquema local diverge del real, y es un quirk del CLI local,
no del historial de migraciones.

---

## DEBT-030 — El ícono de la aplicación no aparece en la pestaña del navegador

**Origen:** Reportado por el usuario (2026-07-31), post-despliegue de spec-026
**Prioridad:** Baja — cosmético, sin impacto funcional

`public/icono.png` existe pero no está conectado: no hay `app/icon.*` ni
`app/favicon.ico` (las convenciones de App Router que Next.js detecta
automáticamente), y `app/layout.tsx` no declara `metadata.icons`. Sin ninguna
de las dos vías, el navegador no tiene de dónde tomar el favicon.

**Acción:** Elegir una vía: (a) renombrar/copiar `public/icono.png` a
`app/icon.png` (Next.js lo sirve automáticamente como favicon), o (b)
agregar `icons: { icon: "/icono.png" }` al objeto `metadata` de
`app/layout.tsx`. Verificar en varios navegadores (el ícono a veces queda
cacheado agresivamente).

---

## DEBT-024 — No existe ninguna vía en la plataforma para reponer la contraseña de un estudiante — ✅ Mitigado (spec-026, Fase 5)

**Origen:** Revisión de spec-026 previa al primer despliegue (2026-07-30)
**Prioridad:** Alta — con ~30 estudiantes, ocurrirá en las primeras semanas de clase

spec-027 eliminó el flujo de recuperación de contraseña por correo
(**[[DEBT-011]]**), asumiendo que el docente sería el canal de recuperación vía
`students-mcp`. **Esa suposición es falsa:** `update_student`
(`mcp-servers/students-mcp/src/tools.ts`) acepta `full_name`, `email`, `career`,
`semester` y `github_username` — **no acepta `password`**. Solo `create_student`
recibe contraseña, y `delete_student` es destructivo (borra matrículas,
asistencia y calificaciones, y devuelve `409` si hay entregas).

Resultado: hoy un estudiante que olvide su contraseña **no puede recuperarla por
ningún camino dentro de la plataforma**. La única salida es el Supabase Dashboard
/ Admin API (`auth.admin.updateUserById({ password })`), fuera de la app.

**Acción:** Para el arranque, documentar el reset manual vía Supabase Dashboard
(spec-026, Fase 5). Después, diseñar un spec que añada `reset_student_password`
a `/api/students/*` y a `students-mcp`, con las salvaguardas del dominio de
admin (`STUDENTS_ADMIN_API_KEY`). Se resuelve por completo con
**[[DEBT-001]]** + **[[DEBT-011]]** si se reconstruye la recuperación por correo.

**Resolución (2026-07-31):** el botón "Reset password" del Supabase Dashboard
**no sirve** (solo envía correo, sin SMTP no llega). La vía real, documentada y
probada (`TC-026-013`, ver `test-026`), es la **Admin API vía `curl`** con
`SUPABASE_SERVICE_ROLE_KEY` (`PUT /auth/v1/admin/users/{id}` con
`{"password": "..."}`). El spec propio de `reset_student_password` en
`students-mcp` sigue pendiente como mejora futura, no bloqueante.

---

## DEBT-026 — Mensaje de error genérico al registrarse con un correo ya existente

**Origen:** `TC-026-003` (spec-026, smoke test de producción, 2026-07-31)
**Prioridad:** Baja — el comportamiento de seguridad es correcto (no duplica
la cuenta), es solo un problema de claridad del mensaje

Al intentar registrarse con un correo que ya tiene cuenta, `/registro` muestra
"No se pudo crear la cuenta. Intenta de nuevo" — un mensaje genérico que no le
dice al usuario que el correo ya está registrado (y por lo tanto no lo guía a
usar "Iniciar sesión" en su lugar). Verificado que no duplica la cuenta ni la
matrícula: el problema es puramente de UX/mensaje.

**Acción:** En el server action de registro (`lib/auth/actions.ts`), detectar
el caso de correo duplicado (Supabase Auth normalmente lo señala en el error
de `signUp`) y devolver un mensaje específico, p. ej. "Ya existe una cuenta con
este correo. Iniciá sesión en su lugar."

---

## DEBT-029 — Preguntas de autoevaluación con la respuesta correcta siempre en la primera posición — ✅ Frente 2 resuelto (spec-034, 2026-07-31)

**Origen:** `TC-026-011` (spec-026, smoke test de producción, 2026-07-31),
reportado por el usuario
**Prioridad:** ~~Media~~ → **Baja** — reclasificado el 2026-07-31: el frente
de plataforma (el que escalaba y no dependía de la memoria de cada autor) ya
está resuelto. Lo que queda es solo contenido.

Las 3 preguntas publicadas de `estructuras-de-datos/implementacion-de-pilas-en-java`
tienen la opción correcta en `order_index = 0` (primera posición) en las
tres. Ni `lib/self-assessment/index.ts` ni
`components/courses/SelfAssessmentSection.tsx` aleatorizan el orden de las
opciones al mostrarlas: se renderizan siempre en `order_index` tal como están
guardadas (a diferencia de `assignment_variant_groups`, que sí tiene un flag
`shuffle_choices` para las evaluaciones formales A/B/C).

**Acción:** Dos frentes, no excluyentes:
1. **Contenido:** revisar las preguntas existentes en el banco y variar la
   posición de la opción correcta al autorarlas (`question-bank-mcp` →
   `update_question`/`create_question`).
2. **Plataforma:** aleatorizar el orden de despliegue de `choices` en
   `SelfAssessmentSection` (barajar en el cliente o servidor al momento de
   mostrar, sin alterar `order_index` en la base), para no depender de que
   cada autor de preguntas varíe el orden manualmente.

**Resolución (frente 2, 2026-07-31):** implementado y probado en
`spec-034-autoevaluacion-barajado-opciones.md` — `[DONE]`. El servidor
baraja las opciones con semilla **determinista `(user_id, question_id)`**:
cada estudiante ve un orden distinto pero estable entre recargas,
`router.refresh()` post-envío y "Reintentar" (un `Math.random()` por request
habría hecho saltar las opciones mientras el estudiante lee su feedback). La
clave de respuestas del docente (spec-031) sigue en orden canónico
`order_index`, sin barajar. Ronda manual `test-034` (7 casos, 3 estudiantes)
aprobada sin hallazgos nuevos; `@reviewer` verificó `seededShuffle`
empíricamente con 5000 semillas (determinismo, pureza, distribución uniforme)
antes de la ronda.

El **frente 1** (revisar y variar la posición de la correcta en las preguntas
ya publicadas) sigue abierto, pero dejó de ser crítico: tras el frente 2,
ningún estudiante puede aprobar eligiendo siempre la primera opción,
independientemente de cómo esté guardada la pregunta.

> **Corrección menor de la premisa (2026-07-31).** Este ítem contrastaba la
> autoevaluación con las evaluaciones formales A/B/C, *"que sí tiene un flag
> `shuffle_choices`"*. El flag existe, pero **ningún código lo implementa**:
> ver **[[DEBT-034]]**. El contraste no era válido — ninguno de los dos flujos
> baraja hoy.

---

## DEBT-028 — La autoevaluación de cierre no persiste su estado de "ya respondida" tras recargar la página — ✅ Alcance 1 resuelto (spec-033, 2026-07-31)

**Origen:** `TC-026-011` (spec-026, smoke test de producción, 2026-07-31)
**Prioridad:** ~~Alta~~ → **Media** — reclasificado el 2026-07-31 al redactar
spec-033 (ver "Corrección de la premisa" más abajo): no hay corrupción de
datos, es una regresión de UX en uno de los 6 flujos declarados críticos

> **Corrección de la premisa (2026-07-31).** Este ítem se redactó afirmando que
> el bug "permite reintentos silenciosos y datos inconsistentes". **Eso es
> falso.** La migración que crea la tabla la define explícitamente como
> *"una bitácora append-only de intentos completados por estudiante"*
> (Decisión D1 de spec-017), y `SelfAssessmentSection` expone un botón
> **"Reintentar"** deliberado que limpia el estado y permite reenviar. Varias
> filas por estudiante/lección son **el diseño esperado**, no un defecto: las
> dos filas citadas abajo como evidencia son exactamente lo que ese log debe
> registrar tras dos intentos. `hasAttempt` solo evalúa `length > 0`, así que
> los reintentos tampoco alteran el desbloqueo de "marcar lección completada".
> Lo que queda es un bug real pero acotado y sin impacto en los datos: tras
> recargar, el estudiante pierde el feedback y la UI no refleja que ya
> respondió.

`components/courses/SelfAssessmentSection.tsx` mantiene el estado "ya
respondida" (`hasSubmitted`, `feedbackByQuestion`) **solo en memoria del
cliente** (`useState`), inicializado siempre en `false`/`{}`. El servidor sí
sabe si ya existe un intento — `getSelfAssessmentStatus()`
(`lib/self-assessment/index.ts:239`) calcula `hasAttempt` correctamente y se
usa bien para desbloquear "marcar lección completada"
(`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:141-143`) — pero ese
`hasAttempt` **nunca se pasa** a `SelfAssessmentSection` /
`LessonClosureFlow`. Resultado: tras cualquier recarga, el widget de
preguntas vuelve a mostrarse como si nunca se hubiera respondido, permitiendo
reenviar respuestas.

Observado en producción: el estudiante de prueba
`spec026-smoke-a@nodo-test.local` generó dos filas en
`self_assessment_attempts` para la misma lección
(`estructuras-de-datos/github-flujo-de-trabajo-con-ramas`, 14:17 y 14:18 UTC
del 2026-07-31) con distinto `correct_count` (6 y 4). Se interpretó como
evidencia del bug, pero —según la corrección de arriba— es el
comportamiento esperado del log: dos intentos, dos filas. El síntoma real es
que la UI no mostraba el intento previo tras la recarga.

**Limitación adicional para el fix completo:** la tabla
`self_assessment_attempts` (`supabase/migrations/20260718000000_init_self_assessment_attempts.sql`)
solo guarda conteos agregados (`question_count`, `answered_count`,
`correct_count`) — **no** qué opción se eligió en cada pregunta. No es
posible reconstruir el detalle por pregunta (qué elegiste, qué era correcto)
después de un reload con el esquema actual.

**Acción:** Dos alcances posibles:
1. **Fix mínimo (sin migración):** pasar el último intento (conteos agregados
   y `submitted_at`) desde `page.tsx` → `LessonClosureFlow` →
   `SelfAssessmentSection`, y si ya hay intento, mostrar un resumen ("Ya
   completaste esta autoevaluación: X/Y correctas") en vez de reiniciar el
   formulario. **Conservando el botón "Reintentar"**, que es una función
   deliberada y no debe eliminarse.
2. **Fix completo:** agregar una tabla/columna que guarde la respuesta
   seleccionada por pregunta (ej. `self_assessment_answers` con
   `attempt_id`, `question_id`, `selected_choice_ids`), migración incluida,
   para poder reconstruir el feedback exacto por pregunta tras un reload.

**Resolución (alcance 1, 2026-07-31):** implementado y probado en
`spec-033-autoevaluacion-estado-persistente.md` — `[DONE]`. El servidor ahora
expone `lastAttempt` (conteos + fecha del intento más reciente, con
`order by submitted_at desc` para evitar devolver un intento arbitrario) y
`SelfAssessmentSection` muestra un resumen en vez del formulario cuando ya
existe un intento sin feedback en memoria, conservando "Reintentar" intacto.
Ronda manual `test-033` (7 casos) aprobada sin hallazgos nuevos — el único
defecto real de esta iteración (el resumen se agregaba junto al formulario en
vez de en su lugar) lo detectó `@reviewer` en la revisión de código previa a
la ronda y se corrigió antes de que el usuario probara.

El **alcance 2** (persistir la respuesta elegida por pregunta, con migración,
para reconstruir el feedback detallado tras un reload) sigue abierto — ver
"Limitación adicional" arriba.

---

## DEBT-027 — Revisar claridad de los mensajes de validación del formulario de registro

**Origen:** `TC-026-004` (spec-026, smoke test de producción, 2026-07-31) —
pedido explícito del usuario tras aprobar el caso
**Prioridad:** Baja — la validación funciona (campos vacíos, formato de
correo inválido y contraseñas que no coinciden se bloquean correctamente,
sin pantalla en blanco); es una mejora de claridad de mensaje, no un bug
funcional

El usuario pidió mejorar los mensajes de error de campos vacíos y formato
inválido en `/registro`. El esquema de validación vive en
`lib/auth/schemas.ts` (`SignUpSchema`): ya tiene mensajes personalizados por
campo ("Ingresa un correo válido", "La contraseña debe tener al menos 8
caracteres", etc.) — falta precisar **qué mensaje concreto** resultó confuso
en la prueba (¿el de campo vacío en `full_name`/`enrollment_code`, el de
formato de correo, u otro) antes de tocar el esquema.

**Acción:** En una próxima sesión, pedir al usuario el mensaje exacto que le
pareció poco claro (o repetir la prueba con capturas) y ajustar el `message`
correspondiente en `SignUpSchema`.

---

## DEBT-023 — `TeacherAttendanceControl`: parpadeo del grupo/código equivocado antes de restaurar la selección guardada — ✅ Resuelto (2026-08-01)

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** ~~Media~~ → **Resuelto**

Con más de un grupo y una elección guardada en `localStorage`, el primer pintado del cliente monta `AdminAttendancePanel` con `courses[0]` (y su sesión, si tiene una abierta); el `useEffect` post-montaje cambia después a la selección restaurada, remontando el panel (por el `key={selectedCourse.id}`). Si el grupo por defecto (`courses[0]`) tiene una sesión abierta, el docente ve un instante el código de **otro** grupo antes de que aparezca el correcto — riesgoso si la pantalla está proyectada en clase.

**Acción:** Persistir la elección en una cookie legible desde el server component (para que el HTML inicial ya venga con el grupo correcto), o no renderizar `AdminAttendancePanel` hasta que la restauración desde `localStorage` haya corrido.

**Resolución (2026-08-01, rama `fix/attendance-panel-flicker`):** se optó por la
cookie. `lib/attendance/group-preference.ts` (nuevo) expone
`attendanceGroupCookieName(courseSlug)` y `resolveStoredAttendanceGroup()`; la
página de lección lee la cookie en el server y pasa `initialAttendanceGroupId`
por `TeacherLessonPanel` → `TeacherAttendanceControl`, que ya no usa
`localStorage` ni el `useEffect` de restauración (se fueron con él dos
`eslint-disable`, incluido el de `set-state-in-effect`). El HTML inicial trae
el grupo correcto, así que no hay remontaje ni parpadeo. La escritura sigue en
el cliente vía `document.cookie` (`path=/`, `SameSite=Lax`, 1 año) por ser una
preferencia de UI sin efecto en datos.

**Nota de migración:** la preferencia anterior guardada en `localStorage` no se
migra — cada docente con más de un grupo vuelve a elegirlo una vez y a partir
de ahí queda persistido en la cookie.

---

## DEBT-022 — `getAnswerKeyForLesson` duplica la consulta de `getSelfAssessmentForLesson`

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** Baja — riesgo de divergencia futura, no un bug actual

`lib/self-assessment/index.ts` tiene dos funciones (`getSelfAssessmentForLesson` y `getAnswerKeyForLesson`) con el mismo `select`, mismos filtros y mismo `order('created_at')`, que solo difieren en si propagan `is_correct`. El criterio de aceptación de spec-031 exige que el orden de la clave de respuestas del docente coincida exactamente con el que ve el estudiante — hoy esa garantía depende de que ambas consultas se mantengan sincronizadas manualmente.

**Acción:** Extraer un helper privado (ej. `fetchLessonQuestionRows(courseSlug, lessonSlug)`) del que ambas funciones exportadas deriven su resultado, propagando o no `is_correct` según corresponda. De paso, añadir `.order('order_index', { referencedTable: 'question_choices' })` en ambas — hoy el orden de `choices` coincide en la práctica porque es la misma consulta, pero PostgREST no lo garantiza para recursos embebidos.

---

## DEBT-021 — `TeacherAnswerKey`: no distingue "sin preguntas" de "error al cargar"

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** Baja

`getAnswerKeyForLesson` devuelve `[]` tanto si la lección no tiene preguntas publicadas como si la consulta falló (`catch` → log → `[]`). `TeacherLessonPanel` omite el bloque de clave de respuestas en ambos casos por igual (`answerKey.length > 0`), así que el docente no puede distinguir "esta lección no tiene autoevaluación" de "no se pudo cargar la clave" en medio de una clase.

**Acción:** Devolver un resultado discriminado (ej. `{ ok: true, questions } | { ok: false }`) en vez de `[]` para ambos casos, y que `TeacherLessonPanel` muestre un mensaje de error cuando `ok` sea `false`.

---

## DEBT-020 — Accesibilidad y tokens crudos en los componentes nuevos de la vista docente (spec-031)

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** Baja

Dos hallazgos menores en los componentes nuevos de spec-031:
1. `TeacherAnswerKey.tsx` usa tokens crudos de paleta (`bg-green-50`, `border-green-200`, `text-green-600`, `text-gray-500/900`) en vez de los semánticos de `DESIGN.md` (`--color-success`, etc.) — consistente con lo que ya hace `SelfAssessmentSection.tsx` (que el spec pedía imitar), así que no es una regresión nueva, pero propaga la deuda.
2. Los toggles "Revelar"/"Revelar todas" son `<button>` sin `aria-expanded` ni `aria-pressed`, y el resaltado de la respuesta correcta se comunica solo por color + un ícono `aria-hidden`, sin texto accesible equivalente.

**Acción:** En una iteración de UI/accesibilidad, migrar `TeacherAnswerKey.tsx` (y de paso `SelfAssessmentSection.tsx`) a tokens semánticos, añadir `aria-expanded` a los toggles y un `<span className="sr-only">` junto al ícono de respuesta correcta.

---

## DEBT-019 — `AdminAttendancePanel`: el botón "Cerrar sesión" parpadea a "Cerrando..." cada ~5s — ✅ Resuelto (2026-08-01)

**Origen:** test-031 (TC-009), reportado por el usuario durante la ronda de pruebas manuales
**Prioridad:** ~~Media~~ → **Resuelto**

`AdminAttendancePanel.tsx` usa un único `isPending` de `useTransition()` compartido entre tres operaciones: abrir sesión, cerrar sesión, y el polling del conteo de asistentes cada 5 segundos (`useEffect` con `setInterval` → `startTransition(async () => { getSessionAttendanceCount(...) })`). Como las tres comparten el mismo `isPending`, cada vez que el polling dispara su transición, el botón "Cerrar sesión" cambia brevemente a "Cerrando..." y se deshabilita, aunque nadie esté cerrando nada — un parpadeo cada ~5s mientras la sesión está abierta. Preexistente desde spec-010 (el componente original), pero mucho más visible ahora que spec-031 lo embebe en la vista de lección donde el docente lo tiene a la vista durante toda la clase.

**Acción:** Usar un `useTransition()` (o simple `useState<boolean>`) independiente para el polling de conteo, separado del que gobierna los botones de abrir/cerrar sesión, para que el polling nunca afecte su estado visual.

**Resolución (2026-08-01, rama `fix/attendance-panel-flicker`):** el polling salió
por completo de `startTransition` — no necesitaba transición ninguna, solo un
`setAttendanceCount` directo. `isPending` queda gobernando exclusivamente los
botones de abrir/cerrar sesión. Se agregó un flag `cancelled` en el cleanup del
efecto para que una respuesta en vuelo no reviva el conteo de una sesión ya
cerrada.

---

## DEBT-018 — `AdminAttendancePanel` usa `alert()`/`confirm()` nativos — ✅ Resuelto (2026-08-01)

**Origen:** spec-031 (vista docente en la página de lección)
**Prioridad:** ~~Baja~~ → **Resuelto**

`AdminAttendancePanel.tsx` (líneas 52 y 60-62) usa `alert()` para reportar
errores y `confirm()` para confirmar el cierre de sesión. Es aceptable en el
panel admin (`/admin/courses/<id>/attendance`), pero spec-031 reutiliza este
mismo componente embebido dentro de la página de lección, donde el docente
puede estar proyectando la pantalla en clase — un `alert()`/`confirm()`
nativo del navegador ahí se ve pobre. Fuera de alcance de spec-031 (que
reutiliza el componente tal cual, sin modificarlo, para no arriesgar la ruta
admin ya `[DONE]`).

**Acción:** En una iteración de UI, reemplazar `alert()`/`confirm()` por un
toast/modal propio del sistema de diseño, y verificar ambos puntos de montaje
(`/admin/courses/<id>/attendance` y la vista docente de lección).

**Resolución (2026-08-01, rama `fix/attendance-panel-flicker`):** los `alert()`
se reemplazaron por un banner inline con `role="alert"` y botón de descarte
(estado `error` local), y el `confirm()` por un diálogo modal que reutiliza
**verbatim el patrón ya existente** en `AssignmentPlayer` (spec-019):
`role="dialog"` + `aria-modal` + `aria-labelledby`/`aria-describedby`, cierre
con Escape, foco al botón de confirmar al abrir y `overflow: hidden` en el
body. No se agregó ninguna dependencia — el proyecto no tiene Flowbite ni
shadcn/ui instalados hoy, pese a lo que declara CLAUDE.md → "Stack tecnológico"
(ver **[[DEBT-036]]**).

---

## DEBT-017 — Sin puntos de entrada visibles a `/login` para visitantes anónimos

**Origen:** spec-028 (navbar por rol) — decisión explícita del usuario
**Prioridad:** Baja — decisión de producto aceptada, no un bug

Tras ocultar el navbar para visitantes sin sesión, la única forma de llegar a
`/login` es escribiendo la URL directamente o siendo redirigido por un gate de
autenticación (p. ej. `/grupo-investigacion`). El usuario decidió
explícitamente aceptar esto en el alcance de spec-028 (ver sección "No
incluye" del spec) en vez de agregar un enlace en el footer de la landing.

**Acción:** Si en el futuro se detecta que usuarios reales no encuentran cómo
iniciar sesión, agregar un enlace "Iniciar sesión" a `FOOTER_LINKS`
(`lib/landing/data.ts`) o a la landing pública.

---

## DEBT-016 — Flash de `AnnouncementBar` por lectura de `localStorage` en el primer render

**Origen:** spec-028 (navbar por rol), relacionado con **[[DEBT-010]]**
**Prioridad:** Baja — cosmético, superficie reducida por spec-028

`AnnouncementBar` decide su visibilidad inicial leyendo `localStorage` en el
primer render del cliente, lo que puede producir un parpadeo perceptible al
hidratar (el servidor no conoce la preferencia guardada). spec-028 no corrige
este mecanismo, pero sí reduce su superficie: al ocultar el header completo
para visitantes sin sesión, `AnnouncementBar` deja de montarse en las páginas
públicas (`/`, `/grupo-investigacion`, `/login`, `/registro`).

**Acción:** Abordar junto con **[[DEBT-010]]** en la iteración dedicada a
temas — evaluar leer la preferencia desde una cookie (accesible en el
servidor) en vez de `localStorage`, para eliminar el flash por completo.

---

## DEBT-015 — Navbar usa clases crudas de Tailwind en lugar de tokens semánticos (parcial)

**Origen:** spec-028 (navbar por rol)
**Prioridad:** Baja — cosmético, sin impacto funcional; heredado del código anterior

`components/navbar/Navbar.tsx`, `UserMenu.tsx` y otros componentes del navbar
usan clases crudas de Tailwind (`text-gray-700`, `bg-blue-700`, `hover:bg-gray-100`,
etc.) en lugar de tokens semánticos del sistema de diseño (`--color-*` definidos
en `DESIGN.md`). El código nuevo de spec-028 (`NavLinkList.tsx`,
`CourseScopeSelect.tsx`) aplica tokens semánticos (`text-body`, `text-fg-brand`,
`text-fg-disabled`, `bg-neutral-tertiary`, `border-border-default`, etc.) **solo
para el modo claro**: el sistema de tokens de `DESIGN.md`/`globals.css` no
define equivalentes para modo oscuro (no hay `--color-body` distinto bajo
`.dark`), así que el modo oscuro de estos dos componentes sigue usando clases
crudas con prefijo `dark:` (`dark:text-gray-300`, `dark:bg-gray-800`, etc.),
igual que el resto del navbar heredado.

**Acción:** En una iteración dedicada a UI/tokens, (1) definir tokens
semánticos con variante oscura en `globals.css`/`DESIGN.md` y (2) refactorizar
todos los estilos del navbar (heredados y nuevos) para consumirlos también en
modo oscuro. Ver también **[[DEBT-008]]** (flash de tema claro/oscuro) — se
beneficiará del mismo trabajo de tokens.

---

## DEBT-014 — `NEXT_PUBLIC_SITE_URL` sin ningún uso en el código — ✅ Resuelto documentalmente (spec-026, Fase 3)

**Origen:** Detectado por `@reviewer` en la 3ª pasada de spec-027 (ajeno a su
alcance)
**Prioridad:** Baja — configuración muerta, no rompe nada

Tras eliminar `emailRedirectTo` de `signUp` (Fase 2) y todo el flujo de
recuperación de contraseña (ampliación de scope de spec-027, `SITE_URL` salió
de `lib/auth/actions.ts`), `NEXT_PUBLIC_SITE_URL` quedó **sin ninguna
referencia** en `*.ts`/`*.tsx` (verificado por grep global). `.env.example` y
`CLAUDE.md` la siguen describiendo como *"redirects OAuth y password
recovery"* — ambos flujos inexistentes hoy.

**Acción:** Decidir si se retira de `.env.example`/`CLAUDE.md`/Vercel, o se
deja documentada como reservada para un futuro flujo de OAuth (spec-002 la
tenía prevista, nunca implementada).

**Resolución (2026-07-30):** decisión del usuario — se deja **reservada**.
Se carga en Vercel Production con la URL de producción (Fase 4) por si un
futuro flujo (OAuth, `metadataBase`) la requiere. Se corrigió la descripción
en `.env.example` y `CLAUDE.md` para no mencionar flujos inexistentes.

---

## DEBT-013 — `npm run lint` falla por `<a>` en vez de `<Link>` en AcademicCourseList — ✅ Resuelto (spec-026, Fase 0)

**Origen:** Detectado por `@reviewer` durante la revisión de spec-027 (ajeno a
su alcance)
**Prioridad:** Media — bloquea que `npm run lint` termine en verde, condición
del checklist pre-despliegue

`components/admin/AcademicCourseList.tsx:31` usa un `<a>` nativo para navegar
a `/admin/courses/new/` en vez de `<Link />` de `next/link`, lo que dispara
`@next/next/no-html-link-for-pages` (5 veces, una por regla evaluada).

**Acción:** Reemplazar el `<a>` por `<Link href="/admin/courses/new">` en ese
archivo y verificar que `npm run lint` termina sin errores.

**Resolución (2026-07-30):** reemplazado por `<Link>` de `next/link` en
`components/admin/AcademicCourseList.tsx`. `npm run lint` termina con
0 errores, 10 warnings.

---

## DEBT-012 — Expiración automática de `enrollment_code`

> Retitulado el 2026-07-31: era "Rotación/expiración". **La rotación ya
> existe** — ver "Corrección de la premisa".

**Origen:** spec-027 (registro simplificado con código de curso)
**Prioridad:** ~~Alta~~ → **Media** — reclasificado el 2026-07-31: la mitad
del problema que lo hacía Alta no existe

Desde spec-027, el `enrollment_code` de `academic_courses` ya no es solo un
dato de conveniencia para matricularse desde `/cuenta/cursos`: es el único
mecanismo que evita que cualquier persona con correo inventado se registre en
la plataforma (ver sección "Riesgos de seguridad" de spec-027). El código se
comparte en voz alta a grupos de ~30 estudiantes, por lo que es fácil que
circule más allá del grupo.

> **Corrección de la premisa (2026-07-31).** Este ítem afirmaba que *"no existe
> forma de rotar o expirar un código sin romper la validación de matrículas ya
> hechas contra ese mismo valor"*. **Las dos mitades son falsas:**
>
> 1. **La rotación ya existe y funciona.**
>    `/admin/courses/[academicCourseId]/edit` renderiza `AcademicCourseForm`,
>    que incluye un botón de generar código nuevo
>    (`setValue("enrollment_code", generateCode())`,
>    `components/admin/AcademicCourseForm.tsx:56`), y `updateCourseAction`
>    (`lib/academic-courses/actions.ts:67`) lo persiste. El docente puede rotar
>    un código filtrado hoy mismo, sin código nuevo.
> 2. **Rotar no rompe ninguna matrícula.** `enrollments` referencia
>    `academic_course_id` (FK uuid a `academic_courses`), **no** el código
>    (`20260625000001_init_enrollments.sql:4`). El `enrollment_code` solo se usa
>    para *resolver* el curso en el registro y en `/cuenta/cursos`; una vez
>    creada la fila de matrícula es independiente del valor del código.
>
> Lo que sí falta —y es todo lo que queda de este ítem— es **expiración
> automática**: un código filtrado sigue siendo válido indefinidamente hasta
> que alguien se acuerde de rotarlo a mano.

**Mitigación existente:** `lib/auth/rate-limit.ts` limita intentos de registro
por IP (40) y por código (200) en ventanas de 10 min. Su propio comentario
advierte que es "una mitigación mínima, no una defensa robusta": en Vercel
(serverless, múltiples instancias) el conteo **no es global**, y la clave por IP
depende de `x-forwarded-for`, que controla el cliente.

**Acción:** Diseñar un spec para **expiración** de `enrollment_code` (ej.
vigencia temporal configurable por el docente, o un `valid_until` en
`academic_courses` que el gate de registro verifique). La rotación manual ya
está cubierta; documentarla en la guía del docente puede ser suficiente como
paso intermedio.

---

## DEBT-011 — Reintroducir recuperación de contraseña por correo cuando haya SMTP propio [ACTUALIZADO]

**Origen:** spec-027 (registro simplificado con código de curso)
**Prioridad:** Alta — bloqueante para cualquier estudiante que olvide su contraseña

**Actualización (misma ronda manual, 2026-07-29):** este ítem nació anotando
que `/recuperar-password` seguiría "rota" sin SMTP. Durante la ronda de
pruebas el usuario decidió ir más allá: en vez de dejar la UI visible pero no
funcional, se **eliminó por completo** el flujo (`/recuperar-password`,
`/recuperar-password/confirmar`, `PasswordResetRequestForm`,
`PasswordResetConfirmForm`, `requestPasswordReset`, `updatePassword`, los
schemas asociados, y el enlace en `LoginForm`) — ver spec-027, sección
"Incluye". Mientras no haya SMTP propio, el docente es el único canal real de
recuperación de cuentas (vía `students-mcp` → `update_student` con nuevo
`email`, o recreando la cuenta).

**Acción:** Cuando exista SMTP propio (ver **[[DEBT-001]]**), diseñar un spec
nuevo para **reconstruir** el flujo de recuperación de contraseña desde cero
(la implementación anterior ya no existe en el código) — no es un simple
"reactivar", hay que rehacer las rutas, formularios y Server Actions.

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

## DEBT-025 — Temas opcionales de los 3 cursos sin lección asignada

> Renumerado de `DEBT-006` a `DEBT-025` el 2026-07-30: compartía número con
> "`course.lessons` mezcla dos tipos de nodo", que conserva el `DEBT-006`.

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
