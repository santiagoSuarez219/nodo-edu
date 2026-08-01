# spec-038 — [NOT STARTED] Ocultar/mostrar la clave de respuestas en la vista docente

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

La vista docente de la lección (spec-031, `[DONE]`) monta `TeacherLessonPanel`
cuando `access.reason` es `"owner"` o `"admin"`
(`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:193`). Ese panel compone dos
bloques: `TeacherAnswerKey` — la clave de respuestas de la autoevaluación de
cierre — y un bloque de asistencia que envuelve `TeacherAttendanceControl`.

`TeacherAnswerKey` ya tiene un toggle de **revelado**
(`revealedIds`, `components/courses/TeacherAnswerKey.tsx:12`; botones "Revelar
todas" en la cabecera y "Revelar" por pregunta) que controla si se resalta la
opción correcta. Pero ese toggle **no oculta el bloque**: el título "Clave de
respuestas", los enunciados de todas las preguntas y todas las opciones se
renderizan siempre. Cuando el docente proyecta la lección en clase, ese bloque
queda visible al final del artículo: los estudiantes ven los enunciados de la
autoevaluación antes de responderla y, además, ven un bloque de trabajo interno
que no forma parte de la clase.

Hoy la única forma de evitarlo es no bajar hasta el final de la página, lo que
es incompatible con usar el control de asistencia — que vive justo debajo, en
el mismo `TeacherLessonPanel`, y sí debe proyectarse (el código de asistencia se
dicta en voz alta frente al grupo).

Este spec añade un control explícito para **plegar y desplegar el bloque
completo de la clave de respuestas**, con la preferencia persistida en cookie y
leída en el server component para que el primer HTML ya venga en el estado
correcto.

## Alcance

**Incluye:**

- Un control de plegado en la cabecera de `TeacherAnswerKey` que oculta o
  muestra **todo el cuerpo del bloque** (enunciados, opciones y el botón
  "Revelar todas / Ocultar todas"), dejando visible solo la cabecera con el
  control.
- Persistencia de la preferencia en una cookie leída en el server component de
  la lección, para que el HTML inicial ya venga en el estado correcto — sin
  parpadeo del bloque visible antes de plegarse.
- **Estado por defecto (sin cookie): plegado.** Un docente que abre la lección
  por primera vez en una máquina de aula no revela nada por accidente.
- Al desplegar el bloque, las respuestas correctas siguen ocultas: `revealedIds`
  arranca vacío en cada carga, sin cambios respecto a hoy.

**No incluye:**

- Ocultar el control de asistencia ni el resto del `TeacherLessonPanel`. El
  plegado aplica exclusivamente al bloque de clave de respuestas (decisión del
  usuario, 2026-08-01).
- Persistir `revealedIds` (qué preguntas están reveladas). Sigue siendo estado
  efímero de la página, por diseño.
- Cambiar quién ve el panel docente, ni tocar `getAnswerKeyForLesson`
  (`lib/self-assessment/index.ts:106`). El bloque plegado **sí** viaja en el
  payload RSC, como hoy (ver D4).
- Un "modo presentación" global que oculte varios bloques a la vez. Si se
  necesita más adelante, será otro spec.
- Envolver `TeacherAnswerKey` en un `ErrorBoundary` (hoy solo lo tiene el bloque
  de asistencia, `TeacherLessonPanel.tsx:46`). Fuera de alcance; si se considera
  necesario, registrarlo en `docs/specs/backlog.md`.

## Impacto en el sistema

| Archivo | Acción |
|---|---|
| `lib/self-assessment/answer-key-preference.ts` | **Crear** — nombre de cookie, `max-age` y parseo del valor almacenado. Espejo estructural de `lib/attendance/group-preference.ts`; no importa `next/headers` para que lo consuman cliente y server |
| `components/courses/TeacherAnswerKey.tsx` | **Modificar** — nuevas props, estado de plegado, control en cabecera, escritura de la cookie |
| `components/courses/TeacherLessonPanel.tsx` | **Modificar** — aceptar y propagar la preferencia inicial a `TeacherAnswerKey` (ya recibe `courseSlug`, línea 9) |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | **Modificar** — leer la cookie en el bloque owner/admin que ya llama a `cookies()` (línea 141) y pasarla al panel (línea 193-201) |
| `lib/self-assessment/index.ts` | Sin cambios |
| `supabase/migrations/` | Sin cambios — no hay esquema, RLS ni datos involucrados |
| `docs/mcps/` | Sin cambios (ver "Evaluación MCP") |

**Nota de caché:** la ruta ya declara `export const dynamic = "force-dynamic"`
(línea 36), así que la lectura adicional de cookie no cambia el
comportamiento de caché de la página ni introduce una nueva opt-out.

## Evaluación MCP

**¿Aplica MCP?** No.

- **¿Expone datos que un agente podría necesitar consultar?** No. El spec no
  crea ni expone información nueva: cambia la presentación de datos que el
  docente ya recibe y que un agente obtiene por `question-bank-mcp`
  (`list_questions` / `get_question` ya devuelven las opciones con su
  corrección).
- **¿Permite acciones que un agente debería poder ejecutar?** No. La acción es
  una preferencia de proyección en el navegador del docente durante una clase
  presencial; no hay ningún escenario en que delegarla a un agente aporte algo.
- **¿Ya existe un MCP relacionado?** Sí, `question-bank-mcp`, y no requiere
  cambios: su dominio es el contenido de las preguntas, no cómo se pintan.
- **¿Algún system prompt de `docs/mcps/` cambia?** No.

No se crean ni modifican MCPs.

## Decisiones de diseño

**D1 — Cookie, no `localStorage`.** Misma razón que la preferencia de grupo de
asistencia (**[[DEBT-023]]**, `lib/attendance/group-preference.ts`): el server
component debe poder leer el estado para que el primer HTML ya venga plegado.
Con `localStorage` el bloque se pintaría desplegado y se plegaría tras la
hidratación — exactamente el parpadeo que este spec existe para evitar, y en el
peor momento posible: pantalla proyectada frente al grupo. Además, inicializar
`useState` desde `initialExpanded` (prop del server) no produce desajuste de
hidratación, cosa que sí ocurriría leyendo `localStorage` en el render.

**D2 — Una sola cookie global, no una por curso.** Aquí me aparto del
precedente de asistencia y del borrador previo. En `attendanceGroupCookieName`
el sufijo por curso es *inherente*: el valor guardado es el id de un grupo
académico, que solo tiene sentido dentro de un curso. Aquí el valor es un
booleano que representa un modo de trabajo del docente ("estoy proyectando" vs.
"estoy preparando"), no una propiedad del curso. Una cookie por curso
implicaría:

- N cookies permanentes por docente (una por cada curso que dicte), enviadas en
  **todas** las peticiones al sitio (`path=/`), incluidas las de estudiantes y
  las de rutas que nada tienen que ver.
- Un modelo mental incoherente: el docente que pliega en un curso espera estar
  plegado en general, no volver a descubrir el bloque abierto al cambiar de
  curso.

Nombre: `nodo_teacher_answer_key`. Sin sufijo, sin `:` (no es un token válido
en `document.cookie` según RFC 6265).

**D3 — Por defecto plegado.** Elegido sobre "por defecto desplegado" porque el
costo de los dos errores es asimétrico: desplegar de más frente a un grupo
revela material de evaluación; plegar de más cuesta un clic.

**D4 — Ausencia de cookie = plegado; plegar borra la cookie.** El único valor
que la cookie llega a tener es `"1"` (desplegado). Al plegar **no** se escribe
`"0"`: se expira la cookie (`max-age=0`). Consecuencias buscadas:

- El estado por defecto y el estado "plegado" son el mismo estado — no hay dos
  representaciones del mismo hecho ni riesgo de que un valor corrupto se
  interprete como desplegado.
- `resolveStoredAnswerKeyExpanded` es trivial y total: `true` solo si el valor
  es exactamente `"1"`; cualquier otra cosa (ausencia, `"0"`, basura) es
  `false`, el estado seguro.

**D5 — `max-age` corto (12 h), no un año.** `TeacherAttendanceControl` usa un
año (`COOKIE_MAX_AGE_SECONDS`, línea 22) y es correcto ahí: el valor guardado es
inocuo. Aquí el estado persistido es el **riesgoso** (desplegado), así que debe
decaer solo hacia el estado seguro. 12 h cubre de sobra una jornada de
preparación + clase, y garantiza que una máquina de aula compartida no amanezca
con la clave de respuestas desplegada por lo que hizo otra persona ayer. Es una
divergencia deliberada del precedente, no un descuido; documentarla en el
doc-comment del módulo.

**D6 — El contenido sigue en el DOM y en el payload RSC.** El bloque plegado no
se desmonta del payload. Esto es un control de **proyección**, no de seguridad,
y conviene decirlo explícito para que nadie lo lea como garantía de
confidencialidad. La garantía real está antes: `getAnswerKeyForLesson` devuelve
`[]` si `access.reason` no es `"owner"` ni `"admin"`
(`lib/self-assessment/index.ts:110-113`), así que un estudiante nunca recibe
estos datos, inspeccione lo que inspeccione. Desmontarlo del payload solo
añadiría un round-trip al desplegar, en mitad de una clase.

**D7 — Plegar con el atributo `hidden`, no con render condicional.** El
borrador previo pedía a la vez "renderizar el cuerpo solo si `expanded`" y
"`aria-controls` apuntando al `id` del cuerpo": son incompatibles —
`aria-controls` que apunta a un elemento inexistente es un fallo de
accesibilidad. Se resuelve manteniendo el contenedor del cuerpo siempre
montado, con `hidden` cuando está plegado (`display: none`, invisible también
para lectores de pantalla y para buscar-en-página). Coherente con D6, que ya
acepta que el contenido esté en el DOM. El botón "Revelar todas" vive hoy en la
cabecera (`TeacherAnswerKey.tsx:43-49`): debe moverse dentro del contenedor
plegable o condicionarse a `expanded`, para que no quede huérfano en la cabecera
de un bloque plegado.

**D8 — Al plegar se limpia `revealedIds`.** Volver a desplegar nunca muestra
respuestas reveladas antes de plegar. Alternativa descartada: conservar el
revelado, más cómodo para el docente que pliega un momento y vuelve, pero
convierte "desplegar" en una acción de resultado impredecible frente al grupo —
justo lo que este spec quiere eliminar. Misma asimetría de costos que D3.

**D9 — Escritura desde el cliente con `document.cookie`, sin
`router.refresh()`.** Igual que `TeacherAttendanceControl.tsx:43`
(`path=/; SameSite=Lax`). No amerita una Server Action: es preferencia de UI sin
efecto en datos. Refrescar re-renderizaría el artículo entero para un cambio que
el estado del cliente ya resolvió.

**D10 — Estilos: seguir la tabla de modo claro/oscuro de `DESIGN.md`, no
inventar tokens.** `TeacherAnswerKey` ya usa exactamente las clases que esa
tabla prescribe (`bg-white dark:bg-gray-800`, `border-gray-200
dark:border-gray-700`, …) junto a los tokens semánticos que sí existen
(`text-brand`, `bg-brand-softer`). Eso **no** es una instancia de
**[[DEBT-032]]** / **[[DEBT-015]]**: esas deudas documentan que el sistema de
tokens no tiene variante `dark:`, por lo que hoy la tabla de `DESIGN.md` es la
fuente correcta. El control nuevo debe ser visualmente indistinguible de los
controles ya presentes en esa cabecera; no introducir clases ni patrones que la
tabla no contemple.

## Fases de implementación

### Fase 1 — Módulo de preferencia

- [ ] Crear `lib/self-assessment/answer-key-preference.ts`, con el mismo estilo
      de doc-comment que `lib/attendance/group-preference.ts` y **sin** importar
      `next/headers` (lo consumen cliente y server):
  - [ ] `ANSWER_KEY_COOKIE_NAME = "nodo_teacher_answer_key"` (D2).
  - [ ] `ANSWER_KEY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12` (D5), con comentario
        explicando por qué diverge del año de `TeacherAttendanceControl`.
  - [ ] `resolveStoredAnswerKeyExpanded(storedValue: string | undefined): boolean`
        → `true` solo si el valor es exactamente `"1"`; todo lo demás `false`
        (D3, D4).

### Fase 2 — Lectura en el server component

- [ ] En `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, declarar
      `let teacherAnswerKeyExpanded = false;` junto a las demás variables del
      bloque docente (líneas 111-114).
- [ ] Dentro del `if (access.ok && (access.reason === "owner" || access.reason
      === "admin"))`, reutilizar el `cookieStore` que ya se obtiene en la línea
      141 para resolver `teacherAnswerKeyExpanded`. **No** añadir una segunda
      llamada a `cookies()`.
- [ ] Pasar `initialAnswerKeyExpanded={teacherAnswerKeyExpanded}` a
      `TeacherLessonPanel` (línea 193-201).

### Fase 3 — Propagación en el panel

- [ ] `TeacherLessonPanel.tsx`: añadir `initialAnswerKeyExpanded: boolean` a
      `TeacherLessonPanelProps` y propagarlo a `TeacherAnswerKey`. El panel
      sigue siendo server component y sigue sin renderizar `TeacherAnswerKey`
      cuando `answerKey.length === 0` (línea 35) — sin regresión.

### Fase 4 — UI del plegado

- [ ] Antes de escribir markup: leer `DESIGN.md` completo y las skills
      `frontend-design`, `tailwind-css-patterns` y `accessibility`.
- [ ] `TeacherAnswerKey.tsx`: añadir prop `initialExpanded: boolean` y estado
      `const [expanded, setExpanded] = useState(initialExpanded)`.
- [ ] Envolver el cuerpo (el `<div className="divide-y …">`, líneas 52-117) en
      un contenedor con `id` estable y atributo `hidden={!expanded}` (D7).
- [ ] Mover el botón "Revelar todas / Ocultar todas" dentro del contenedor
      plegable, o condicionarlo a `expanded` (D7).
- [ ] Añadir el control de plegado en la cabecera, con `aria-expanded={expanded}`
      y `aria-controls` apuntando al `id` del contenedor — mismo patrón que
      `LessonSidebarItem.tsx:91-92` (`panelId` definido en la línea 33, aplicado
      al panel en la línea 118). Etiqueta **visible** en texto ("Mostrar" /
      "Ocultar"), no solo un chevron.
- [ ] Cuando está plegado, la cabecera indica cuántas preguntas hay
      (p. ej. `Clave de respuestas · 5 preguntas`), para que el docente sepa que
      el bloque existe y no está vacío. Singular/plural correctos.
- [ ] Al alternar, escribir la cookie desde el cliente (D4, D9):
      al desplegar `…=1; path=/; max-age=<12h>; SameSite=Lax`; al plegar el
      mismo nombre con `max-age=0`.
- [ ] Al plegar, `setRevealedIds(new Set())` (D8).
- [ ] Verificar que el foco permanece en el botón de plegado tras alternar (no
      se pierde al ocultarse el contenido) y que el control es operable con
      teclado (`Enter` / `Espacio`).
- [ ] Estilos según D10; no ampliar **[[DEBT-032]]** con clases fuera de la
      tabla de `DESIGN.md`.

### Fase 5 — Verificación

- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Ejecutar los casos manuales de `docs/testing/test-038-clave-respuestas-ocultable.md`
      siguiendo el protocolo de "Pruebas manuales asistidas por Claude".
- [ ] Invocar `@reviewer` antes de marcar `[DONE]`.

## Criterios de aceptación

- Un docente (`owner`) que abre una lección con preguntas publicadas, **sin
  cookie previa**, ve el bloque "Clave de respuestas" plegado: cabecera, conteo
  de preguntas y control visibles; ningún enunciado ni opción visible.
- Al pulsar el control, el bloque se despliega y muestra las preguntas con sus
  respuestas correctas **ocultas** (ninguna opción resaltada en verde).
- Al recargar la página con el bloque desplegado, el bloque llega desplegado en
  el HTML inicial: no aparece plegado y se despliega después, ni al revés.
- Al recargar con el bloque plegado, no hay ningún instante en que el contenido
  sea visible.
- Al navegar a otra lección — del mismo curso o de otro — la preferencia se
  conserva (D2).
- Al plegar y volver a desplegar, las respuestas correctas vuelven a estar
  ocultas aunque antes estuvieran reveladas (D8).
- El control de asistencia permanece visible e interactivo en ambos estados.
- El control de plegado es alcanzable y operable solo con teclado, expone
  `aria-expanded` acorde al estado y `aria-controls` resuelve a un elemento
  existente en ambos estados.
- Un admin (`access.reason === "admin"`) obtiene el mismo comportamiento que el
  `owner`.
- Un estudiante matriculado no ve el panel docente en ninguno de los dos
  estados (sin regresión respecto a spec-031).
- El bloque de clave de respuestas no se renderiza en absoluto cuando la lección
  no tiene preguntas publicadas, ni cuando el nodo es una guía (sin regresión).

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-038-clave-respuestas-ocultable.md` — casos
  `TC-001` a `TC-010`, uno por criterio de aceptación. Sin casos `TC-MCP-*`:
  este spec no toca MCPs.
- **Automáticas (e2e/unit):** pendientes de framework (CLAUDE.md → "Testing").
  Cuando exista, el candidato más valioso es
  `resolveStoredAnswerKeyExpanded` — función pura, total y con el estado seguro
  por defecto, testeable sin navegador (`undefined`, `""`, `"0"`, `"1"`,
  `"true"`, valor arbitrario).

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{pendiente}}
