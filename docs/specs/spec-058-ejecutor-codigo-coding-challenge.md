# spec-058 — [TESTING] Ejecutor de código para preguntas coding_challenge
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

> **Serie:** este es el **spec A** de una serie de 2-3 (ver "Specs siguientes
> (fuera de alcance)" al final). A habilita la **ejecución**; B la
> **calificación automática**; C las **plantillas de código** y lenguajes
> adicionales.

## Contexto

El tipo de pregunta `coding_challenge` existe desde spec-005: se modela en
`questions` (con `code_language`) y en `coding_challenge_tests` (`input`,
`expected_output`, `is_hidden`, `order_index`), pero la ejecución quedó como
stub. Hoy:

- `lib/code-runner/index.ts` expone `runCode(language, code, input?)`, que
  siempre devuelve `{ status: "disabled" }`.
- `lib/submissions/actions.ts:70-79` → `runCodeAction(language, code, input?)`
  solo hace `requireUser()` y delega en el stub.
- `components/student/QuestionRenderer.tsx` (rama `coding_challenge`,
  ~líneas 171-215) muestra un textarea y un botón "Ejecutar" que llama a
  `runCodeAction(code_language ?? "text", answer.text_response)` y pinta un
  único string ("La ejecución de código no está disponible en esta versión.").
- `QuestionRenderer` solo lo usa `components/student/AssignmentPlayer.tsx`
  (página `app/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/page.tsx`):
  el botón aparece **solo en quices**, no en autoevaluaciones de lección.

Los tres cursos activos necesitan ejercicios de programación evaluables:
Análisis de algoritmos y Programación científica usan **Python**; Estructuras
de datos usa **Java**. Sin ejecución, el estudiante escribe código "a ciegas"
y el docente califica a mano sin saber si compila.

Este spec activa la ejecución real: el estudiante pulsa "Ejecutar" en un quiz
y ve, por cada caso de prueba **visible**, la entrada, la salida esperada, la
salida obtenida y si pasa o falla. **Ninguna nota cambia**: `coding_challenge`
sigue siendo de calificación manual (eso es el spec B).

## Alcance

**Incluye**
- Verificación y elección de un **ejecutor de código gestionado** (servicio
  externo tipo Judge0), con punto de aprobación del usuario (Fase 1).
- Adaptador de servidor del proveedor en `lib/code-runner/` vía `fetch`
  (sin SDK salvo aprobación expresa), con mapeo de lenguajes Python y Java.
- Server Action endurecida que resuelve **en servidor** el lenguaje y los
  casos visibles a partir de `submissionId` + `questionId`, verificando que
  la pregunta pertenece a la variante del intento, que el intento es del
  invocante y que está en curso.
- Ejecución de los casos **visibles** (`is_hidden = false`) únicamente.
- Función pura de normalización y comparación de salida, reutilizable por B.
- Límites de recursos (tiempo, memoria, tamaño de código y de salida) y
  límite de ejecuciones por estudiante, contado de forma persistente.
- UI de resultados por caso en la rama `coding_challenge` de
  `QuestionRenderer`, con estados de carga, error y "no disponible".
- Degradación controlada si falta configuración o el proveedor falla.
- Variables de entorno nuevas (server-only), documentadas en `.env.example`
  y en la tabla de CLAUDE.md.
- Actualización del system prompt del agente del banco de preguntas con las
  convenciones de autoría que este spec vuelve obligatorias (ver
  "Evaluación MCP").

**No incluye**
- Calificación automática, `auto_score` para `coding_challenge`, cambios en
  `OPEN_QUESTION_TYPES` (`lib/submissions/index.ts:22`), en
  `submitSubmission`, en `SubmissionReviewPanel` o en `SubmissionResult`
  (spec B).
- Ejecución de casos ocultos, en ningún flujo (spec B).
- Persistencia de los resultados por caso (spec B). Este spec solo persiste
  un **conteo** de ejecuciones sin código ni salidas (D9).
- Entrada libre (stdin arbitrario) escrita por el estudiante (D12).
- Plantillas de código inicial, editor con resaltado, lenguajes distintos de
  Python y Java (spec C).
- Herramienta MCP para validar casos con solución de referencia (spec B,
  ver "Evaluación MCP").
- Ejecución en autoevaluaciones de lección (`QuestionRenderer` no se usa ahí;
  hoy las autoevaluaciones son `multiple_choice`).
- Validar o normalizar `code_language` al **crear** preguntas en
  `lib/questions/schemas.ts` (hoy es `z.string()` libre) — se mitiga con
  alias en el mapeo (D6) y con el system prompt; endurecer el esquema queda
  para B o C.

## Impacto en el sistema

- **Frontend público:** ninguno.
- **Panel del estudiante (quices):**
  - `components/student/QuestionRenderer.tsx` — la rama `coding_challenge`
    pasa a mostrar el panel de resultados por caso; recibe `submissionId`
    como prop nueva (solo la usa esa rama).
  - `components/student/AssignmentPlayer.tsx` — pasa `submission.id` a
    `QuestionRenderer`. Sin otros cambios.
  - Posible componente nuevo `components/student/CodeRunResults.tsx`
    (presentación de los casos), para no inflar `QuestionRenderer`.
- **Panel docente:** sin cambios (`SubmissionReviewPanel` sigue tratando
  `coding_challenge` como manual).
- **Server Actions / lógica:**
  - `lib/submissions/actions.ts` — `runCodeAction(language, code, input?)`
    se **reemplaza** por `runChallengeAction(submissionId, questionId, code)`
    (D2). La firma vieja desaparece: aceptaba el lenguaje del cliente.
  - `lib/code-runner/index.ts` — deja de ser stub: orquesta la ejecución de
    los casos visibles. `runCode` de bajo nivel se conserva como función
    interna del módulo.
  - `lib/code-runner/provider.ts` — **nuevo**: cliente HTTP del proveedor.
  - `lib/code-runner/languages.ts` — **nuevo**: mapeo `code_language` → id
    del proveedor (D6).
  - `lib/code-runner/compare.ts` — **nuevo**: `normalizeOutput` y
    `outputsMatch` puras (D8).
  - `lib/code-runner/config.ts` — **nuevo**: lectura de variables de entorno
    y límites; `isCodeRunnerConfigured()` (D13).
  - `lib/code-runner/gate.ts` (o dentro de `index.ts`) — verificación de
    intento/pregunta y lectura de casos visibles con service role (D3).
- **Base de datos:** **una migración nueva** — tabla `code_runs` para el
  límite de ejecuciones (D9). Sin cambios en tablas existentes ni en RLS de
  `coding_challenge_tests`. **El despliegue de este spec deja de ser solo
  código**: requiere `supabase db push --linked --dry-run` y aprobación del
  usuario (CLAUDE.md → "Despliegue").
- **Auth / Storage:** sin cambios.
- **Variables de entorno:** `CODE_RUNNER_API_URL` y `CODE_RUNNER_API_KEY`
  (server-only, D13); quizá una tercera si el proveedor exige cabecera de
  host (p. ej. RapidAPI), a decidir en Fase 1.
- **Observabilidad:** Sentry (spec-052) — eventos de fallo del proveedor sin
  código del estudiante (D15).
- **MCPs:** solo system prompt de `question-bank-mcp` (ver "Evaluación MCP").

## Evaluación MCP

**¿Aplica MCP?** Sí, **parcialmente**: actualización de system prompt, sin
herramientas nuevas.

Criterios de CLAUDE.md:

| Pregunta | Respuesta |
|----------|-----------|
| ¿Expone datos que un agente podría consultar? | No. Los resultados de ejecución son efímeros (no se persisten en A) y pertenecen al estudiante durante su intento. `code_runs` es un contador operativo, no un dato pedagógico. |
| ¿Permite acciones que un agente debería ejecutar? | Sí, hay un candidato claro: validar los casos de un `coding_challenge` ejecutando una **solución de referencia** contra **todos** sus casos (visibles y ocultos), para detectar `expected_output` erróneos al crear la pregunta. |
| ¿Ya existe un MCP del dominio? | Sí: `question-bank-mcp` (crea `coding_challenge` con `challenge_tests[]`). |
| ¿Hay un agente cuyo system prompt se beneficie? | Sí: `docs/mcps/question-bank-agent.system-prompt.md`. A vuelve obligatorias convenciones de autoría que el agente hoy no conoce. |

**Decisión: la herramienta de validación se difiere al spec B.** Motivos:
1. **Necesita ejecutar casos ocultos**, que este spec prohíbe ejecutar en
   cualquier flujo. El servicio "ejecutar todos los casos de una pregunta"
   es exactamente lo que B construye para calificar; implementarlo en A
   adelantaría la mitad de B sin sus salvaguardas (persistencia, reintentos).
2. **El proveedor aún no está elegido** (Fase 1). Diseñar una herramienta
   MCP sobre una cuota y unos límites no verificados es prematuro: una
   validación en lote del banco completo podría consumir la cuota que
   necesitan los estudiantes.
3. **Necesita un contrato HTTP nuevo** (`POST /api/questions/{id}/validate`
   o similar, autenticado con `QUESTION_BANK_API_KEY`) y su propio diseño de
   límites, ajeno al flujo del estudiante que es el centro de A.
4. A se mantiene acotado y su riesgo (estudiantes reales en quices) se
   valida antes de abrir un segundo consumidor de la cuota.

**Lo que sí entra en A (Fase 7):** actualizar
`docs/mcps/question-bank-agent.system-prompt.md` — sin tocar el servidor ni
sus herramientas — con:
- Valores admitidos de `code_language` para que la pregunta sea ejecutable:
  `python` o `java` (en minúscula; D6).
- Contrato de E/S: el programa lee el `input` del caso por **stdin** y
  escribe por **stdout**; la comparación sigue D8 (por eso `expected_output`
  no debe depender de espacios finales).
- Java: la clase pública debe llamarse **`Main`** (D7).
- Los casos con `is_hidden: false` **ahora se muestran al estudiante**
  (entrada y salida esperada): deben ser ejemplos, no la respuesta. Incluir
  al menos un caso visible y al menos uno oculto (este último lo usará B).
- `code_snippet` de `coding_challenge` hoy no se persiste (DEBT-057): no
  depender de él.

> **Para el usuario:** `.claude/agents/assessment-builder.md` también redacta
> preguntas y podría necesitar las mismas convenciones. No es un system
> prompt de `docs/mcps/` y queda fuera del alcance de este spec salvo que lo
> apruebes explícitamente (ver "Puntos a decidir").

## Decisiones de diseño

> Cada decisión trae un **valor por defecto** ajustable antes de aprobar.

**D1 — Proveedor gestionado, elegido en la Fase 1 con aprobación.** Ningún
proveedor, plan ni precio está verificado al redactar este spec. Candidato
principal: **Judge0** en su oferta gestionada (Judge0 CE vía RapidAPI o la
oferta cloud oficial de Judge0); alternativas a comparar si Judge0 no encaja:
Sphere Engine Compilers, OneCompiler API, Piston gestionado (la instancia
pública `emkc.org` no sirve para producción). Criterios de la Fase 1, en
orden: (1) soporta Python 3 y Java (versión 17+ preferible); (2) precio y
cuota que cubran el volumen estimado (D16) con holgura; (3) límites
configurables por ejecución (CPU, wall time, memoria); (4) API por `fetch`
con `wait=true` o equivalente síncrono, idealmente con **lote** (varias
ejecuciones en una petición); (5) región/latencia razonable desde Vercel
`iad1`; (6) términos de servicio y tratamiento de datos (el código del
estudiante sale de nuestra infraestructura). La elección queda registrada
como **D1-bis** en este spec (proveedor, plan, precio, límites, versiones
exactas, URL de la documentación consultada y fecha).
*Por defecto:* Judge0 gestionado, si cumple los criterios.
*Self-hosted* (Judge0 propio en Railway/VM) queda descartado en A por
decisión del usuario; anotarlo como plan B si el costo resulta inviable.

**D1-bis — Verificación de Fase 1 (2026-10-19, pendiente de aprobación del
usuario).** Fuentes: `https://ce.judge0.com` (docs), `GET /languages` y
`GET /config_info` de `ce.judge0.com` y `extra-ce.judge0.com` (consultados en
vivo), `https://judge0.com/` (precios).
- **Proveedor candidato:** Judge0 CE gestionado. Solo `fetch`, sin SDK.
- **Ids verificados (ce.judge0.com):** Python 3.12.5 = **100** (también 3.11.2
  = 92, 3.13.2 = 109); Java JDK 17.0.6 = **91** (no usar 62, OpenJDK 13).
  Los ids pueden diferir en una instancia propia: confirmar con `/languages`
  en el host contratado antes de fijarlos en `languages.ts`.
- **`wait=true` NO está habilitado** (`enable_wait_result: false` en ambos
  hosts oficiales; las docs lo desaconsejan). El adaptador debe usar
  `POST /submissions/batch` (lote máx. **20**; `enable_batched_submissions:
  true`) y luego sondear `GET /submissions/batch?tokens=…` hasta que todos
  terminen, dentro del presupuesto de 25 s. Esto cambia el diseño de D10 y
  Fase 4 (lote + polling, no concurrencia 3).
- **Límites del host CE:** CPU por defecto 5 s (máx. 20), pared 10 s (máx.
  30), memoria 256 000 KB (máx. 2 048 000). Los de D5 (2/3 s CPU, 5/6 s pared,
  128/256 MB) caben; se envían por submission.
- **Precio (judge0.com):** Pro €27/mes, 2 000 envíos/día; Ultra €54/mes,
  5 000/día; Mega €107/mes, 10 000/día; exceso €0,001 por envío. Se contrata
  vía listing de RapidAPI, donde el precio mostrado difiere (USD 44,99 /
  89,99 / 169,99; exceso USD 0,0017): **confirmar precio final al contratar**.
- **Contraste con D16:** el pico estimado (~1 700 ejecuciones en ~1 h) cabe
  en Pro (2 000/día) pero con poco margen si coinciden dos quices el mismo
  día; *recomendado Ultra* (5 000/día). Comportamiento al superar la cuota
  (corte duro vs. cobro de exceso): sin verificar.
- **Decisión del usuario (2026-10-19):** usar **pago por uso** (toggle
  "Pay-per-use" de judge0.com) para el **piloto de Estructuras de Datos**
  (~40 estudiantes, final de semestre). La tarifa por envío del pago por uso
  se verificó con una captura del usuario del listing de RapidAPI
  ("Subscribe to Basic Plan → Per use", total hoy USD 0,00, facturado
  mensualmente por uso): **USD 0,0017 por envío** y **USD 0,0017 por envío en
  lote**; ancho de banda incluido 10 240 MB/mes, luego +USD 0,001 por MB.
  Es **posfactura** (sin saldo prepago ni corte a saldo cero): el tope de
  gasto lo ponen los límites de D9, no el proveedor. Estimación del piloto
  (~1 900 envíos) ≈ USD 3,3; peor caso por pregunta e intento
  (20 ejecuciones × 10 casos = 200 envíos) ≈ USD 0,34. El listing de
  RapidAPI usa cabeceras `X-RapidAPI-Key`/`X-RapidAPI-Host`, probable
  `CODE_RUNNER_API_HOST` (confirmar al crear la cuenta).
- **Sin verificar (requieren la cuenta del usuario):** cabeceras de
  autenticación exactas del listing de RapidAPI (`X-RapidAPI-Key` /
  `X-RapidAPI-Host` frente a `X-Auth-Token`) → decide si se necesita
  `CODE_RUNNER_API_HOST`; retención de datos y términos (no figuran en la
  web); si el listing de RapidAPI mantiene `wait` deshabilitado.
- **Pendiente:** consulta de solo lectura en producción de los
  `coding_challenge` existentes (`code_language`, casos visibles/ocultos). La
  bloqueó el clasificador de permisos de Claude Code; necesita tu visto bueno
  o ejecutarla tú.

**D2 — La Server Action recibe contexto, no lenguaje.** Firma nueva:
`runChallengeAction(submissionId: string, questionId: string, code: string): Promise<ChallengeRunResult>`.
El lenguaje, los casos y los límites se resuelven en servidor a partir de la
pregunta. El cliente nunca envía `language` ni `input`. Se elimina
`runCodeAction` (su único consumidor es `QuestionRenderer`).

**D3 — Gate de autorización y lectura de casos: cliente de sesión primero,
service role después.** En este orden, dentro de `lib/code-runner/`
(nunca en `app/` ni `components/`):
1. `requireUser()`.
2. Con el **cliente de sesión**: leer `submissions` por `submissionId`
   (`id, assignment_id, variant_group_id, enrollment_id, status, started_at`)
   y su `enrollment` (`student_id`). La RLS de `submissions` ya limita la
   fila a quien puede verla; además se exige
   `enrollment.student_id === user.id` (un **docente** también puede leer
   entregas de su curso y **no** debe poder gastar ejecuciones en nombre de
   un estudiante).
3. Ventana abierta (D4).
4. Con **service role** (`createServiceSupabaseClient`): comprobar que
   existe `assignment_questions` con `assignment_id = submission.assignment_id`
   y `question_id = questionId`, y leer de `questions` `type` y
   `code_language`. Si `type !== "coding_challenge"` → rechazo.
5. Con **service role**: leer `coding_challenge_tests` con
   `question_id = questionId` **y `is_hidden = false`**, ordenados por
   `order_index`. El filtro `is_hidden = false` va **en la consulta**, no en
   memoria después: los ocultos nunca salen de Postgres en este flujo.

*Alternativa descartada:* una RPC `SECURITY DEFINER`
`get_visible_challenge_tests(p_submission_id, p_question_id)`. Es viable y
haría la verificación en SQL, pero (a) añade una segunda migración y otra
función invocable directamente por PostgREST con la sesión del estudiante
— que expondría los casos visibles fuera del flujo de intento si su guarda
tuviera un hueco (ver la observación sobre `get_variant_question_details` en
"Riesgos"); (b) el patrón "gate con sesión + service role en `lib/`" ya está
auditado en el proyecto (spec-057 D1). *Por defecto:* service role en `lib/`.

**D4 — Solo con el intento en curso y la ventana abierta.** Se rechaza la
ejecución si: `submission.status !== "in_progress"`; o el grupo tiene
`closes_at` y `closes_at <= now()`; o el grupo tiene `time_limit_minutes` y
`started_at + time_limit_minutes <= now()`. (Hoy el límite de tiempo se
aplica en el cliente — `useCountdown` en `AssignmentPlayer`; aquí se
verifica también en servidor para no ejecutar fuera de plazo.) En la UI, el
botón no se renderiza cuando `disabled` (comportamiento actual, se
conserva) y el servidor es la garantía real.

**D5 — Límites por ejecución.** *Por defecto* (ajustables en Fase 1 según
el proveedor):

| Límite | Python | Java | Notas |
|--------|--------|------|-------|
| CPU por caso | 2 s | 3 s | Java paga arranque de JVM |
| Tiempo de pared por caso | 5 s | 6 s | |
| Memoria por caso | 128 MB | 256 MB | JVM necesita más |
| Tamaño máximo de código | 20 000 caracteres | 20 000 caracteres | Rechazo previo, sin llamar al proveedor |
| Salida mostrada por caso (stdout/stderr/compilación) | 4 KB | 4 KB | Se trunca con aviso "… (salida truncada)" |
| Casos visibles ejecutados por clic | máx. 10 | máx. 10 | Si hay más, se ejecutan los 10 primeros por `order_index` y se avisa |
| Presupuesto total de la acción | 25 s | 25 s | Abort con `AbortSignal`; reutilizar `createTimeoutFetch` de `lib/auth/fetch-timeout.ts` |

La comparación pasa/falla se hace sobre la salida **completa** recibida del
proveedor (antes de truncar para mostrar). Los límites viven en
`lib/code-runner/config.ts` como constantes, no en variables de entorno
(cambiar un límite es un cambio de código revisado).

**D6 — Mapeo de lenguaje.** `code_language` es texto libre hoy
(`lib/questions/schemas.ts`). Se normaliza con `trim().toLowerCase()` y se
aceptan alias: `python`, `python3`, `py` → Python 3; `java` → Java. Los ids
del proveedor (p. ej. en Judge0 CE, Python 3.x y Java/OpenJDK tienen ids
numéricos propios) se fijan en `lib/code-runner/languages.ts` **tras
verificarlos en la Fase 1** — no se escriben de memoria. Cualquier otro
valor → resultado `unsupported_language` con mensaje "Esta pregunta usa un
lenguaje que todavía no se puede ejecutar." (sin llamar al proveedor). La
Fase 1 incluye una consulta de solo lectura en producción de los
`coding_challenge` existentes y sus `code_language` para saber si algún
valor real queda fuera de los alias.

**D7 — Java: convención de clase `Main`.** El estudiante escribe un programa
completo con `public class Main { public static void main(String[] args) … }`.
No se reescribe ni se envuelve su código. Si la compilación falla y el
código no contiene `class Main`, el mensaje de error agrega la pista: "En
Java, la clase pública debe llamarse Main." (detección por regex simple,
solo para la pista; nunca bloquea el envío al proveedor). Python: script
plano que lee stdin y escribe stdout.

**D8 — Normalización y comparación de salida (contrato que B reutiliza).**
`normalizeOutput(s)`:
1. Convertir `\r\n` y `\r` en `\n`.
2. Quitar espacios y tabuladores **al final de cada línea**.
3. Quitar líneas vacías **al final** del texto (y por tanto el salto de
   línea final).
`outputsMatch(actual, expected) = normalizeOutput(actual) === normalizeOutput(expected)`.
Se conservan: espacios iniciales, líneas vacías intermedias, mayúsculas y
formato numérico (`3.0` ≠ `3`). Sin tolerancia numérica ni comparación por
tokens en A; si B la necesita, se añade como opción por pregunta. La función
es pura, sin dependencias, y su archivo lleva el comentario de que B la
usará para calificar (cambiarla cambia notas futuras).

**D9 — Límite de ejecuciones persistente: tabla `code_runs` (migración).**
En serverless un contador en memoria no es global (precedente explícito en
`lib/auth/rate-limit.ts`), y el límite del proveedor es **por cuenta**, no
por estudiante: un solo estudiante podría agotar la cuota diaria de todo el
salón. *Por defecto:*
- **20 ejecuciones por (intento, pregunta)** y un **intervalo mínimo de 5 s**
  entre ejecuciones del mismo intento.
- Tabla nueva `public.code_runs`: `id uuid pk`, `submission_id uuid not null
  references submissions(id) on delete cascade`, `question_id uuid not null
  references questions(id) on delete cascade`, `language text not null`,
  `outcome text not null` (check con los valores de D11 +
  `provider_error`), `cases_count smallint not null`, `duration_ms integer`,
  `created_at timestamptz not null default now()`. Índice
  `(submission_id, question_id, created_at desc)`. **No guarda código, ni
  entradas, ni salidas.**
- RLS **habilitada sin policies** para `authenticated`: solo service role
  lee y escribe (el estudiante recibe el conteo restante en la respuesta de
  la acción). Si el docente quiere ver uso, es otro spec.
- Flujo: contar → si se excede, rechazar `rate_limited` con
  `retry_after`/restantes → insertar fila → ejecutar → actualizar
  `outcome`/`duration_ms`. Se acepta la carrera mínima de "contar e
  insertar" (dos clics simultáneos pueden pasar ambos); el botón
  deshabilitado durante la ejecución la hace improbable. Las ejecuciones
  rechazadas antes del proveedor (D4, D5, D6) **no** cuentan; las que fallan
  en el proveedor **sí** cuentan (consumieron cuota).
- Bonus para B y para el costo: la tabla da el volumen real por curso.
*Alternativa sin migración (más débil):* confiar solo en la cuota del
proveedor + límite por clic. Despliegue solo código, pero sin defensa contra
un estudiante que agote la cuota. No recomendada.

**D10 — Ejecución de los casos.** Un clic ejecuta el código una vez por
caso visible (cada caso es una ejecución con su propio stdin). Si el
proveedor ofrece lote, se envía en una sola petición; si no, en paralelo con
concurrencia máxima 3. Si la pregunta tiene **0 casos visibles**, se ejecuta
una vez con stdin vacío y se muestra solo la salida, con el aviso "Esta
pregunta no tiene casos de ejemplo; tu código se ejecutó sin entrada." (sin
pasa/falla). Un error de compilación en Java es idéntico en todos los casos:
se muestra una sola vez, no repetido por caso.

**D11 — Contrato del resultado.** Tipo discriminado devuelto al cliente:
- `{ status: "disabled" }` — ejecutor no configurado (D13).
- `{ status: "rejected", reason, message }` con `reason` ∈
  `not_in_progress | window_closed | not_owner | question_not_in_variant |
  not_coding_challenge | unsupported_language | code_too_large |
  rate_limited | empty_code`. `rate_limited` incluye `runsRemaining: 0` y,
  si aplica, `retryAfterSeconds`.
- `{ status: "unavailable", message }` — fallo del proveedor o timeout de la
  acción (D14).
- `{ status: "completed", compileError?: string, cases: VisibleCaseResult[],
  truncatedCases: boolean, runsRemaining: number }` donde cada caso tiene
  `index`, `input`, `expectedOutput`, `actualOutput`, `stderr?`, `verdict`
  ∈ `passed | wrong_answer | runtime_error | timeout | memory_exceeded |
  compile_error | internal_error`, `outputTruncated: boolean`.
Nunca incluye ids de casos, conteo de casos ocultos ni ningún dato de
`is_hidden = true`. `CodeRunResult` del stub se reemplaza por estos tipos en
`lib/code-runner/types.ts` (o en `index.ts`).

**D12 — Sin stdin libre en A.** El estudiante ejecuta contra los casos
visibles, no contra una entrada propia. Reduce superficie (la acción no
acepta `input`) y volumen. Si se pide "probar con mi propia entrada", se
evalúa en C.

**D13 — Configuración y degradación.** Variables nuevas, **server-only**
(sin prefijo `NEXT_PUBLIC_`): `CODE_RUNNER_API_URL` (base del proveedor) y
`CODE_RUNNER_API_KEY`. Si el proveedor exige una cabecera adicional (p. ej.
`X-RapidAPI-Host`), se añade `CODE_RUNNER_API_HOST` en la Fase 1.
`isCodeRunnerConfigured()` devuelve `false` si falta cualquiera →
`runChallengeAction` responde `{ status: "disabled" }` **sin** contar
ejecución. Es el modo por defecto en desarrollo mientras no haya clave, y
nunca rompe el quiz: el textarea, el autoguardado y "Enviar respuestas" no
dependen del ejecutor. Distinto de `COURSES_ADMIN_API_KEY` (que responde
`500 configuration_error`): aquí la ausencia es un estado de producto
legítimo ("ejecución no disponible"), no un error de despliegue.

**D14 — Errores de transporte y del proveedor.**
- Proveedor 5xx, 429 de cuota, red caída o presupuesto de 25 s agotado →
  `{ status: "unavailable", message: "No pudimos ejecutar tu código en este
  momento. Tu respuesta sigue guardada; puedes intentarlo de nuevo o enviar
  la evaluación." }`, `outcome = provider_error` en `code_runs`, evento a
  Sentry (D15).
- Fallo de transporte de la Server Action (cliente ↔ Next) → patrón de
  spec-053 que ya usa la rama: `isServerActionTransportError` +
  `reportTransportError(err, "runChallengeAction")` +
  `SERVER_ACTION_TRANSPORT_ERROR_MESSAGE`.
- Nada de esto bloquea ni altera la entrega.

**D15 — Observabilidad sin código del estudiante.** Se reporta a Sentry
(solo producción, spec-052) cada `unavailable` con tags `code_runner.provider`,
`code_runner.language`, `code_runner.http_status` y `code_runner.phase`
(`request | timeout | parse`). **Nunca** se adjuntan el código, los stdin,
stdout/stderr ni la respuesta cruda del proveedor (puede contener el código
o la salida). Los veredictos `compile_error`/`runtime_error`/`timeout` son
resultados normales del estudiante, **no** errores: no van a Sentry. Revisar
en implementación que la instrumentación de Server Actions de
`@sentry/nextjs` no capture argumentos (el `code` llega como argumento).

**D16 — Estimación de costo y volumen (se completa en Fase 1).** Fórmula:
`ejecuciones_proveedor ≈ estudiantes × quices_con_coding × preguntas_coding_por_quiz × clics_por_pregunta × casos_visibles`.
Orden de magnitud con supuestos por defecto (a confirmar con los grupos
reales): 3 cursos × ~35 estudiantes = ~105; 3 quices con código por curso
por semestre; 2 preguntas `coding_challenge` por quiz; ~8 clics por
pregunta; 3 casos visibles → **≈ 15 000 ejecuciones/semestre**, con picos
concentrados en la ventana de cada quiz (~35 estudiantes × 2 × 8 × 3 ≈
1 700 ejecuciones en ~1 h). El pico, no el total, decide el plan (cuotas
diarias o por minuto). El límite de D9 acota el peor caso por intento a
20 × 10 casos = 200 ejecuciones por pregunta. Registrar en D1-bis el costo
mensual estimado y el comportamiento al superar la cuota (corte duro vs.
cobro por exceso).

**D17 — Resultados obsoletos en la UI.** Si el estudiante edita el código
después de ejecutar, el panel de resultados se conserva pero muestra "El
código cambió desde la última ejecución." Los resultados no se persisten:
al recargar la página desaparecen (y el contador de restantes se vuelve a
obtener en la siguiente ejecución).

## Fases de implementación

### Fase 1 — Verificación del proveedor (punto de aprobación)
- [x] Revisar documentación vigente de los candidatos de D1: lenguajes y
      versiones exactas de Python y Java, ids de lenguaje, endpoints
      (síncrono, lote), límites configurables, cuotas, precio y política de
      datos.
- [x] Completar D16 con los grupos reales (estudiantes por curso, quices
      planeados con `coding_challenge`).
- [x] Consulta **de solo lectura** en producción (2026-10-19, `list_questions`):
      77 `coding_challenge`, 61 `python` y 16 `java`, todos con al menos un
      caso visible; ninguno montado en una lección. Publicadas: 16 Java (1 caso
      visible descriptivo, no stdin/stdout, sin ocultos) y 1 Python de prueba
      (`5` → `5`). Alias de D6 válidos. Riesgo: los 16 Java publicados no son
      ejecutables tal cual (texto en lugar de entrada/salida real) y sus casos
      visibles se mostrarían al estudiante si se usan en un quiz; revisarlos
      antes de usarlos.
- [x] Registrar la elección como **D1-bis** en este spec (proveedor, plan,
      precio, límites, versiones, ids, URL consultada, fecha) y ajustar D5/D9
      si el proveedor lo exige.
- [x] Confirmar que basta `fetch` (sin SDK). Si hiciera falta un SDK,
      **detenerse** y pedir confirmación (CLAUDE.md → "Dependencias").
- [x] **Detenerse y pedir aprobación explícita del usuario** del proveedor y
      del plan antes de seguir a la Fase 2. El usuario crea la cuenta y la
      clave (Claude no crea servicios en ningún proveedor).

### Fase 2 — Configuración y variables de entorno
- [x] `lib/code-runner/config.ts`: lectura de `CODE_RUNNER_API_URL`,
      `CODE_RUNNER_API_KEY` (y `CODE_RUNNER_API_HOST` si aplica), constantes
      de D5/D9 e `isCodeRunnerConfigured()`.
- [x] Documentar las variables en `.env.example` (bloque "Variables de la
      APP", marcadas SERVER-ONLY, con nota de que sin ellas la ejecución
      queda "no disponible").
- [x] Añadir las filas a la tabla "Variables de entorno" de `CLAUDE.md`.
- [x] El usuario carga las variables en `.env.local` (desarrollo) y, al
      desplegar, en Vercel → Production (Claude no modifica variables de
      producción).

### Fase 3 — Migración `code_runs`
- [x] Crear `supabase/migrations/<timestamp>_init_code_runs.sql` según D9
      (tabla, check de `outcome`, índice, RLS habilitada sin policies,
      comentario explicando por qué no hay policies).
- [x] `supabase db push --db-url "$DEV_DB_URL" --dry-run` contra
      `nodo-dev`, **mostrar la salida al usuario**, y aplicar solo con su
      visto bueno. Nunca `--linked`.
- [x] Verificar en `nodo-dev` que la tabla existe con RLS y los `GRANT`s
      estándar.
- [x] Revisión de código: `20261019000001_add_claim_code_run.sql` añade la
      función `claim_code_run` (advisory lock por intento; conteo, intervalo
      e inserción atómicos; `execute` solo para `service_role`). Aplicada en
      `nodo-dev` con el visto bueno del usuario.

### Fase 4 — Núcleo del ejecutor (`lib/code-runner/`)
- [x] `languages.ts`: normalización + alias (D6) e ids verificados en Fase 1.
- [x] `compare.ts`: `normalizeOutput` y `outputsMatch` (D8), puras.
- [x] `provider.ts`: cliente `fetch` del proveedor con límites de D5,
      `AbortSignal` y presupuesto total; mapeo de estados del proveedor a
      `verdict` (D11); truncado de salidas para mostrar.
- [x] `index.ts`: `runVisibleChallengeTests(...)` que orquesta casos (lote o
      concurrencia 3, D10), compila el error de compilación una sola vez y
      añade la pista de Java (D7). Reemplazar el stub y `CodeRunResult` por
      los tipos de D11.
- [x] Reporte a Sentry de D15, sin código ni salidas.

### Fase 5 — Server Action y gate
- [x] Gate de D3 + ventana de D4 en `lib/code-runner/` (service role solo
      ahí).
- [x] Conteo y registro en `code_runs` (D9).
- [x] `runChallengeAction(submissionId, questionId, code)` en
      `lib/submissions/actions.ts` (`requireUser()`, validación de tamaño y
      vacío, delega en `lib/code-runner`); eliminar `runCodeAction` y su
      comentario de stub.
- [x] `npm run lint` (0 errores) y typecheck; `npm run build` en verde.

### Fase 6 — UI del estudiante
- [x] `AssignmentPlayer` pasa `submissionId={submission.id}` a
      `QuestionRenderer`.
- [x] Rama `coding_challenge`: botón "Ejecutar" → "Ejecutando…" y
      deshabilitado mientras corre; llamada a `runChallengeAction`; patrón de
      transport error de spec-053.
- [x] `components/student/CodeRunResults.tsx`: por caso — título "Caso N",
      insignia "Pasa"/"No pasa", bloques `<pre>` para Entrada, Salida
      esperada y Tu salida (y stderr si existe); error de compilación único;
      mensajes en español para `timeout` ("Tiempo límite excedido"),
      `memory_exceeded`, `runtime_error`; aviso de salida truncada; contador
      "Te quedan N ejecuciones para esta pregunta"; aviso de D17; leyenda
      "Los casos de ejemplo no definen tu nota: la calificación la hace el
      docente."
- [x] Estados `disabled`, `rejected` y `unavailable` con sus mensajes (D11,
      D13, D14), sin afectar al envío.
- [x] Accesibilidad: región de resultados con `aria-live="polite"`,
      pasa/falla no solo por color (texto + ícono), foco visible, botón con
      `aria-busy` durante la ejecución.
- [x] Estilos con tokens semánticos y parejas claro/oscuro de `DESIGN.md`;
      sin valores crudos de la paleta. Leer `DESIGN.md` antes de escribir.

### Fase 7 — MCP: actualizar system prompt de `question-bank-mcp`
- [x] Actualizar `docs/mcps/question-bank-agent.system-prompt.md` con las
      convenciones listadas en "Evaluación MCP" (sin cambios en
      `mcp-servers/question-bank-mcp/`).
- [x] Actualizar la entrada de `question-bank-mcp` en `docs/mcps/README.md`
      si su descripción menciona que `coding_challenge` no se ejecuta. No
      aplica: la descripción no lo menciona.

### Fase 8 — Pruebas
- [x] Ejecutar `docs/testing/test-058-ejecutor-codigo-coding-challenge.md`
      con el usuario (13/13 aprobados, 2026-10-19) (protocolo "Pruebas manuales asistidas por Claude").
- [ ] (Cuando exista framework) pruebas automáticas vía `@tester`.

## Criterios de aceptación

1. En un quiz en curso, el estudiante pulsa "Ejecutar" en una pregunta
   `coding_challenge` en Python con una solución correcta y ve cada caso
   visible con entrada, salida esperada, su salida y "Pasa".
2. Con una salida incorrecta, los casos afectados muestran "No pasa" y la
   diferencia es legible (esperada vs. obtenida).
3. La comparación aplica D8: espacios finales y saltos de línea finales no
   provocan "No pasa"; una diferencia de contenido sí.
4. Un error de sintaxis en Python o de compilación en Java se muestra como
   un único mensaje de error claro en español (con la pista de `Main` en
   Java cuando aplique), sin casos "Pasa".
5. Un bucle infinito termina como "Tiempo límite excedido" dentro del
   presupuesto de D5, sin colgar la página ni el quiz.
6. Los casos con `is_hidden = true` no aparecen en la UI ni en la respuesta
   de red de la Server Action, ni se ejecutan.
7. Con el intento enviado (o la ventana cerrada, o el límite de tiempo
   vencido), no hay botón "Ejecutar" y una invocación directa de
   `runChallengeAction` devuelve `rejected` sin llamar al proveedor.
8. `runChallengeAction` con un `questionId` que no pertenece a la variante
   del intento, o con un `submissionId` de otro estudiante (o invocada por
   el docente), devuelve `rejected` y no ejecuta nada.
9. Tras 20 ejecuciones de una misma pregunta en un intento, la siguiente se
   rechaza con un mensaje claro y el contador en 0; el intervalo mínimo de
   5 s también se respeta.
10. El lenguaje usado en la ejecución es siempre el de la pregunta
    (`questions.code_language`), nunca uno enviado por el cliente.
11. Sin `CODE_RUNNER_API_URL`/`CODE_RUNNER_API_KEY`, "Ejecutar" muestra que
    la ejecución no está disponible y el quiz se puede responder y enviar
    con normalidad.
12. Si el proveedor falla, el estudiante ve un mensaje de "no disponible",
    su respuesta sigue guardada, y Sentry recibe un evento sin código ni
    salidas del estudiante.
13. Tras enviar, la pregunta `coding_challenge` sigue pendiente de
    calificación manual: `auto_score` y la revisión docente no cambian
    respecto de hoy.
14. `code_runs` no contiene código, entradas ni salidas, y no es legible con
    la sesión de un estudiante.
15. `docs/mcps/question-bank-agent.system-prompt.md` documenta las
    convenciones de autoría de `coding_challenge` ejecutables.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-058-ejecutor-codigo-coding-challenge.md`
  — casos `TC-058-001` … `TC-058-013` (criterios con UI). Sin casos
  `TC-MCP-058`: la Fase 7 no agrega ni cambia herramientas, solo el system
  prompt (se verifica por revisión del documento, criterio 15).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-058-ejecutor-codigo-coding-challenge.spec.ts`
  — framework "por definir"; hoy solo se describen:
  - **Unit `compare.ts`** (criterio 3): tabla de pares `actual/expected`
    con `\r\n`, espacios finales, líneas vacías finales, espacios iniciales,
    líneas vacías intermedias, mayúsculas, `3.0` vs `3`. Es la prueba de
    mayor valor porque B califica con esta función.
  - **Unit `languages.ts`** (D6): alias admitidos y rechazo de otros.
  - **Unit `provider.ts`** con proveedor simulado: mapeo de estados a
    `verdict`, truncado, timeout de presupuesto → `unavailable`.
  - **Integración del gate** (criterios 6-10, 14): intento ajeno, docente,
    pregunta fuera de variante, intento enviado/expirado, límite agotado,
    filtro `is_hidden = false` en la consulta, RLS de `code_runs`.

## Riesgos y observaciones

- **DEBT-057** (`code_snippet` no se persiste para `code_write`/
  `coding_challenge`): A **no depende** de él porque no usa plantilla; el
  enunciado completo debe ir en `stem`. Es **prerrequisito del spec C**.
- **Casos visibles pasan a ser públicos para el estudiante.** Hasta hoy
  `is_hidden = false` no se mostraba nunca. Preguntas ya creadas podrían
  tener como "visible" un caso que revela la solución. La Fase 1 lo audita
  en producción; antes de publicar un quiz con `coding_challenge`, el
  docente debe revisar sus casos.
- **Dependencia de un tercero en plena evaluación.** Mitigado por D13/D14
  (el quiz nunca depende del ejecutor) y por D9 (cuota protegida).
- **Datos que salen de la plataforma.** El código del estudiante (sin
  nombre ni correo) se envía al proveedor. Registrar su política de
  retención en D1-bis.
- **Observación fuera de alcance (para `docs/specs/backlog.md`, no se
  registra en este spec):** `get_variant_question_details`
  (`supabase/migrations/20260724000002_variant_question_content_rpcs.sql`)
  es `SECURITY DEFINER` y verifica que `p_enrollment_id` tenga la
  asignación, pero **no** que ese `enrollment` pertenezca a `auth.uid()`;
  un usuario autenticado con un `enrollment_id` ajeno podría leer el
  contenido de esa variante. Bajo riesgo (UUID no adivinable, no expone
  casos de prueba), pero conviene registrarlo como deuda. Este spec no
  replica el patrón: D3 exige `student_id === user.id`.

## Archivos concretos (rutas verificadas)

**Crear**
- `lib/code-runner/config.ts`
- `lib/code-runner/languages.ts`
- `lib/code-runner/compare.ts`
- `lib/code-runner/provider.ts`
- `lib/code-runner/types.ts` (si los tipos de D11 no viven en `index.ts`)
- `components/student/CodeRunResults.tsx`
- `supabase/migrations/<timestamp>_init_code_runs.sql`

**Modificar**
- `lib/code-runner/index.ts` (stub → orquestador)
- `lib/submissions/actions.ts` (`runCodeAction` → `runChallengeAction`)
- `components/student/QuestionRenderer.tsx` (rama `coding_challenge`, prop
  `submissionId`)
- `components/student/AssignmentPlayer.tsx` (pasar `submission.id`)
- `.env.example`, `CLAUDE.md` (tabla de variables)
- `docs/mcps/question-bank-agent.system-prompt.md` y, si aplica,
  `docs/mcps/README.md` (Fase 7)

**Leídos y deliberadamente NO modificados**
- `lib/submissions/index.ts` (`OPEN_QUESTION_TYPES`, `submitSubmission`,
  `getVariantQuestionDetails`)
- `components/admin/SubmissionReviewPanel.tsx`,
  `components/student/SubmissionResult.tsx`
- `supabase/migrations/20260715000000_init_questions.sql`,
  `20260715000001_rls_questions.sql` (RLS de `coding_challenge_tests` se
  mantiene: el estudiante sigue sin leerla)
- `supabase/migrations/20260724000002_variant_question_content_rpcs.sql`
- `lib/questions/schemas.ts`, `mcp-servers/question-bank-mcp/**`

## Referencias de código que la implementación debe seguir

- Gate con sesión + service role en `lib/`: spec-057 D1/D3,
  `lib/students/actions.ts`.
- Cliente service role: `lib/auth/service.ts` (`createServiceSupabaseClient`).
- Presupuesto de tiempo para `fetch`: `lib/auth/fetch-timeout.ts`
  (`createTimeoutFetch`).
- Transport errors en Server Actions: spec-053,
  `lib/errors/server-action.ts`,
  `lib/observability/report-transport-error.ts`.
- Por qué un contador en memoria no sirve: `lib/auth/rate-limit.ts`.
- Depuración de eventos Sentry: `lib/observability/scrub-sentry-event.ts`.

## Specs siguientes (fuera de alcance)

### Spec B — Calificación automática de `coding_challenge`
**Depende de A** (proveedor, adaptador, `compare.ts`, `code_runs`).
- **Al enviar** (`submitSubmission`), ejecutar en servidor **todos** los
  casos de cada `coding_challenge` (visibles y ocultos) con la última
  respuesta guardada, usando `outputsMatch` de D8.
- **`auto_score`:** decidir entre **proporcional** (`points × casos_pasados /
  casos_totales`, recomendado para dar crédito parcial) y **todo-o-nada**;
  posible peso distinto para ocultos. Decidir si el docente puede hacer
  **override manual** (recomendado: `manual_score` prevalece sobre
  `auto_score`, igual que en abiertas).
- **Clasificación:** sacar `coding_challenge` de `OPEN_QUESTION_TYPES` o
  tratarlo como **híbrido** (auto con revisión opcional). Revisar el
  comentario de `lib/submissions/index.ts:15-22` y `finalizeGrading`.
- **Persistencia por caso:** probable migración (`answer_test_results`:
  `answer_id`, `test_id`, `passed`, `verdict`, `actual_output` truncada,
  `duration_ms`), con RLS: el estudiante ve sus resultados de **visibles**
  completos y de **ocultos** solo pasa/falla (sin entrada ni salida
  esperada) — probablemente vía RPC `SECURITY DEFINER` que filtre.
- **UI:** resultados por caso en `SubmissionReviewPanel` (docente ve todo,
  incluido el código) y en `SubmissionResult` (estudiante: ocultos solo
  pasa/falla), respetando `show_feedback_on`.
- **Notas:** propagación a la libreta vía `propagate_submission_grade`;
  confirmar que un recalculo automático no pisa un override docente.
- **Proveedor caído al enviar:** **la entrega nunca se pierde ni se
  bloquea**. Opciones: marcar la pregunta como "calificación pendiente" y
  reintentar (cron de Vercel o reintento al abrir la revisión), o cola.
  Mismo principio que spec-050 D1: mejor pendiente que nota falsa.
- **Costo:** cada envío ejecuta todos los casos; recalcular D16.
- **MCP:** herramienta en `question-bank-mcp` para **validar los casos con
  una solución de referencia** (ver "Evaluación MCP" de A), con su ruta
  `/api/questions/{id}/validate` y límites propios; actualizar los system
  prompts de `question-bank-mcp` y `assignment-mcp` (calificación
  automática, cómo leer resultados por caso).

### Spec C — Plantillas de código y lenguajes adicionales (opcional)
- **Prerrequisito:** resolver **DEBT-057** (persistir `code_snippet` para
  `code_write`/`coding_challenge`).
- Código inicial en `code_snippet` precargado en el editor cuando
  `text_response` está vacío (sin pisar lo que el estudiante ya escribió).
- Posible editor con resaltado (CodeMirror/Monaco ligero; requiere
  confirmación de dependencia y evaluación de bundle/accesibilidad).
- Lenguajes adicionales según necesidad (C/C++, JavaScript), ampliando D6.
- Endurecer `code_language` en `lib/questions/schemas.ts` a un enum de
  lenguajes ejecutables.
- Opcional: stdin libre del estudiante ("probar con mi entrada", D12).
- Si no se hizo en B: la herramienta MCP de validación con solución de
  referencia.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-10-19 ("Implementa el spec58")
