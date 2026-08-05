# spec-041 — [TESTING] Refrescar el código de una sesión de asistencia abierta

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.
>
> **Rama:** `feat/refrescar-codigo-asistencia` (desde `development`)
> **Spec origen:** `spec-010-asistencia-sesion` `[DONE]` — este spec extiende su
> ciclo de vida de sesión (hoy: abrir → cerrar) con un tercer verbo intermedio,
> sin tocar el modelo de datos.

---

## Contexto

Hoy una `class_sessions` nace con un código de 4–5 dígitos y una ventana de
vigencia de ~15 minutos (`code_expires_at`), y el docente solo puede **cerrarla**
(`closeSession`). Cuando el código vence en mitad de la clase —un laboratorio que
se alarga, estudiantes que llegan tarde, una explicación que se come la ventana—
no existe ninguna forma de revivirlo.

**El workaround actual no es solo incómodo: corrompe la estadística del curso.**
Para volver a tener un código vigente, el docente tiene que cerrar la sesión y
abrir otra, lo que produce **dos `class_sessions` el mismo día**. Y
`getServiceCourseAttendanceSummary` (`lib/attendance/service.ts:174`) calcula
`total_sessions` **contando filas** de `class_sessions` en el rango, no días
distintos:

```
attendance_pct = sessions_attended / total_sessions
```

Con dos sesiones el mismo día, el **denominador se infla** para todos los
estudiantes del curso, y los que marcaron solo en la primera (la mayoría: ya
habían marcado antes de que expirara) ven caer su porcentaje sin haber faltado a
nada. El sesgo no se queda en la BD: se propaga a `attendance-mcp`
(`get_course_attendance_summary`, `list_sessions`) y por tanto a cualquier
respuesta que un agente docente dé sobre asistencia. Además el **roster del día
queda partido en dos** sesiones, así que ni siquiera hay una lista única de
quién asistió esa clase.

Refrescar el código en la sesión existente elimina la causa: una clase, una fila,
un roster, un denominador honesto.

---

## Alcance

### Incluye

- **Dos acciones nuevas y separadas** sobre una sesión **abierta**, ambas
  disponibles durante toda la vida de la sesión (D1):
  - **"Extender 15 min"** — conserva el `attendance_code` y solo empuja
    `code_expires_at` a ~15 min desde ahora.
  - **"Generar código nuevo"** — rota el `attendance_code` **y** reinicia la
    ventana a ~15 min.
- **Diálogo de confirmación en ambas** (D2), porque el panel se proyecta en clase.
- Server Actions `extendSessionCode` / `rotateSessionCode` en
  `lib/attendance/index.ts`, con resultado discriminado (D4) y reintento de
  colisión de código en la rotación (D5).
- Cambios en `components/admin/AdminAttendancePanel.tsx`: los dos botones, los dos
  diálogos, **estado pendiente independiente por acción** (D7), reinicio inmediato
  de la cuenta atrás y **preservación del conteo de asistentes** (D6).
- Ajuste de **copia** en `components/courses/AttendanceSection.tsx` para que un
  estudiante que teclee un código ya rotado entienda qué pasó (D8).

### No incluye

- **Ninguna migración de esquema** (D3). Ver "Impacto en el sistema".
- **Histórico / auditoría de rotaciones** (qué códigos tuvo la sesión, cuántas
  veces se extendió, quién lo hizo). Eso sí exigiría una tabla nueva o una columna
  `jsonb`, es decir migración, y no hay una necesidad hoy que lo justifique.
  Explícitamente **fuera de alcance**.
- **Propagación en vivo del código nuevo a la vista del estudiante.** La sección
  del estudiante no hace polling: `AttendanceSection` recibe el estado del server
  component (`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`) y no vuelve a
  consultar. Un estudiante con la página abierta **no verá** el código nuevo sin
  recargar. Es una limitación **preexistente** de spec-010 (que ya listó
  "actualización en vivo por WebSocket/Realtime" en su "No incluye"); este spec
  la **mitiga solo con copia** (D8), no la resuelve. Realtime sigue siendo mejora
  futura.
- Extender/rotar el código de una sesión **cerrada** (revivir una sesión). Cerrar
  sigue siendo terminal.
- Configurar la duración de la ventana (siempre ~15 min, igual que `openSession`).
- Cambios en `attendance-mcp` (ver "Evaluación MCP").
- Corregir la ausencia de `with check` en la policy
  `class_sessions_mutate_owner_or_admin` → registrado como **DEBT-046**, no se
  toca aquí (D9).

---

## Dependencias

- **spec-010 `[DONE]`** — `class_sessions`, `attendance_records`, RLS, RPCs,
  `lib/attendance/`, `AdminAttendancePanel`, `AttendanceSection`.
- **spec-031 `[DONE]`** — la vista docente de la lección, que es **hoy el único
  punto de montaje** del panel: `TeacherLessonPanel` → `TeacherAttendanceControl`
  → `AdminAttendancePanel`. La subruta
  `/admin/courses/[academicCourseId]/attendance` que creó spec-010 **ya no
  existe**; no hay una segunda pantalla que verificar.
- **spec-037 `[DONE]`** — tipos discriminados negocio/infraestructura en
  `lib/attendance/types.ts` y manejo de fallos de transporte en el panel; los
  contratos nuevos deben seguir ese criterio.
- **DEBT-019 (resuelta)** — el polling del conteo ya está fuera de
  `startTransition`; este spec no debe reintroducir el acoplamiento.

---

## Impacto en el sistema

### Base de datos / RLS — **sin cambios**

Verificado contra las migraciones existentes; **no se crea ninguna migración**:

- `class_sessions.attendance_code` y `class_sessions.code_expires_at` ya existen
  y son `not null` (`20260716000000_init_attendance.sql`). Refrescar es un
  `update` de una o dos columnas sobre una fila existente.
- El trigger `set_class_sessions_updated_at` ya actualiza `updated_at` en cada
  `update` (misma migración).
- La policy `class_sessions_mutate_owner_or_admin`
  (`20260716000001_rls_attendance.sql`) ya autoriza `for update` al **docente
  dueño del curso o admin**, que es exactamente quien puede refrescar. No hace
  falta policy nueva.
- El índice `create unique index on class_sessions (attendance_code) where is_open`
  **también gobierna los `UPDATE`**: rotar el código puede colisionar con la
  sesión abierta de otro curso. Se maneja en la aplicación (D5), no con DDL.
- El índice `(academic_course_id) where is_open` **no** puede violarse aquí: no se
  modifica `academic_course_id` ni `is_open`.

### `lib/attendance/types.ts`

Un tipo de resultado nuevo, compartido por las dos acciones (D4).

### `lib/attendance/index.ts`

Dos Server Actions nuevas (`extendSessionCode`, `rotateSessionCode`) y la
extracción del bucle de reintento de código a un helper interno reutilizable por
`openSession` y `rotateSessionCode` (D5).

### `components/admin/AdminAttendancePanel.tsx`

El archivo con más trabajo: dos botones, dos diálogos de confirmación, estado
pendiente por acción, reinicio del countdown y preservación del conteo. Detalle
en D6/D7.

### `components/courses/AttendanceSection.tsx`

Solo copia (D8). Sin cambios de lógica, contratos ni props.

### Sin impacto

- `lib/attendance/service.ts` y `/api/attendance/*` — no cambian; **se benefician
  pasivamente** (el denominador deja de inflarse).
- `mcp-servers/attendance-mcp/` y `docs/mcps/attendance-agent.system-prompt.md` —
  sin cambios (ver "Evaluación MCP").
- RPCs `mark_attendance_by_code` / `get_student_session_status`: ya leen el estado
  vigente en cada llamada; un código rotado funciona sin tocarlos.

---

## Evaluación MCP

> Completar esta sección antes de iniciar la implementación.

**¿Aplica MCP?** **No.**

Aplicando la tabla de criterios de `CLAUDE.md`:

| Pregunta | Respuesta |
|---|---|
| ¿Expone datos que un agente podría consultar? | **No** datos nuevos. No se crea ninguna entidad ni columna; el estado que resulta (`code_expires_at`, `is_open`, roster) ya lo expone `attendance-mcp` con las herramientas actuales. El único dato que este spec produce y hoy no se expone es el `attendance_code` vigente, y **no debe exponerse**: spec-010 D9 lo declaró secreto operativo del aula y las rutas `/api/attendance/*` lo excluyen del `select` deliberadamente. |
| ¿Permite acciones que un agente debería poder ejecutar? | **No.** Extender y rotar son **acciones de aula en vivo**: dependen de que el docente vea la clase, sepa que el código se filtró o que falta gente por marcar, y de que el código nuevo quede proyectado en ese instante. Un agente que las ejecutara remotamente rotaría el código que 30 estudiantes están tecleando, sin nadie que proyecte el nuevo. Es exactamente el mismo razonamiento por el que spec-010 D9 dejó `open_session`/`close_session`/`mark_attendance` **fuera** del MCP; refrescar pertenece a esa misma familia y hereda la decisión. |
| ¿Existe un MCP de dominio relacionado? | Sí, `attendance-mcp`, pero es **de solo lectura por diseño**. Agregarle la primera herramienta de mutación rompería su invariante declarada en `docs/mcps/attendance-agent.system-prompt.md` y en el criterio de aceptación de spec-010 ("no existen `open_session`, `close_session` ni `mark_attendance`"), que además está cubierto por `TC-MCP-010-04`. |
| ¿Hay un agente en `docs/mcps/` que se beneficie del cambio? | **No.** El system prompt de `attendance-agent` describe herramientas de lectura cuyo contrato no cambia. **No se modifica ningún system prompt** en este spec (hacerlo fuera de una fase de MCP aprobada está además en "Acciones prohibidas"). |

**Conclusión:** no hay fase de MCP. Sí conviene registrar en la implementación que
este spec **mejora la calidad de lo que el MCP ya reporta** (D10): al dejar de
duplicar sesiones por día, `get_course_attendance_summary` deja de subestimar el
porcentaje de asistencia.

---

## Decisiones de arquitectura

### Decisión 1 — Dos acciones separadas, no un botón "refrescar"

Un único botón que rotara siempre el código castigaría el caso habitual: el
código venció y **todos los que ya lo anotaron** tendrían que volver a mirar la
pantalla. Se separan por intención:

- **"Extender 15 min"** — caso habitual (se acabó el tiempo, la clase sigue). El
  código anotado en el cuaderno del estudiante **sigue sirviendo**.
- **"Generar código nuevo"** — caso excepcional (el código se filtró por WhatsApp
  a alguien que no está en el aula). Invalida lo anterior a propósito.

Ambas reinician la ventana a ~15 min desde el momento de la acción: extender sin
reiniciar la ventana no tendría sentido, y rotar sin reiniciarla dejaría un código
nuevo que muere en segundos.

**Ambas están disponibles durante toda la sesión abierta**, no solo cuando el
código ya expiró: el docente sabe antes que el reloj que la clase se va a alargar,
y el caso "se filtró" no espera a la expiración.

### Decisión 2 — Confirmación en ambas acciones

El panel se proyecta en clase (spec-031) y el docente lo maneja mientras habla.
Un click accidental en "Generar código nuevo" invalidaría el código que los
estudiantes están tecleando en ese momento, con la vista del estudiante **sin
forma de enterarse** (ver D8). El diálogo se pide también para "Extender 15 min"
—aunque sea benigno— por coherencia y para que el gesto de "pulsar el botón de la
derecha por error" no tenga consecuencias distintas según cuál sea.

Los dos diálogos siguen **verbatim** el patrón ya presente en el archivo (overlay
`<button>` con `aria-label`, `role="dialog"` + `aria-modal` +
`aria-labelledby`/`aria-describedby`, Escape para cerrar, foco al botón de
confirmar, `overflow: hidden` en el body).

> **[[DEBT-038]] documenta que ese diálogo está duplicado** entre
> `AssignmentPlayer`, `AdminAttendancePanel` y `CourseLifecycleActions`. Este spec
> **no lo refactoriza**: extraer `components/ui/ConfirmDialog.tsx` tocaría tres
> componentes ya `[DONE]` y es una tarea de UI independiente. Se es consciente de
> que este spec añade la **cuarta y quinta** copia, deliberadamente, siguiendo el
> mismo criterio con que spec-036 añadió la tercera. Al implementar, dejar un
> `// DEBT-038:` junto a los diálogos nuevos para que la futura extracción los
> encuentre.

### Decisión 3 — Sin migración

Ver "Impacto en el sistema". Es la razón por la que este spec cabe en una tarde:
todo el trabajo es de aplicación y UI. Cualquier requisito que empuje hacia una
migración (auditoría de rotaciones, ventana configurable) queda en "No incluye".

### Decisión 4 — Contrato de las Server Actions

Firmas:

```ts
// lib/attendance/index.ts  ("use server")
export async function extendSessionCode(sessionId: string): Promise<RefreshCodeResult>
export async function rotateSessionCode(sessionId: string): Promise<RefreshCodeResult>
```

Tipo de retorno, en `lib/attendance/types.ts`:

```ts
// Resultado discriminado de extendSessionCode / rotateSessionCode. Sigue el
// criterio de spec-037: los estados de negocio son valores distintos y
// nombrados; 'unavailable' está reservado a fallos de infraestructura.
export type RefreshCodeResult =
  | { status: 'ok'; session: ClassSession }
  | { status: 'not_open' }        // negocio: ya no hay sesión abierta con ese id
  | { status: 'code_collision' }  // negocio: no se logró un código único (solo rotate)
  | { status: 'unavailable' };    // infraestructura
```

Criterios que este contrato respeta, alineados con el resto del módulo:

- **Discriminado por `status`**, como `OpenSessionResult` / `AttendanceCountResult`
  / `StudentAttendanceState`, y **no** como el legado
  `{ success, session?, error? }` de `openSession`/`closeSession`. Ese shape
  legado obliga al llamador a distinguir negocio de infraestructura leyendo un
  `string` de error en español, que es justo lo que DEBT-037 corrigió en el resto
  del módulo. No se migran `openSession`/`closeSession` aquí (fuera de alcance);
  las acciones **nuevas** nacen con el contrato bueno.
- **Los textos de UI viven en el componente**, no en el valor de retorno: la
  acción devuelve un `status`, el panel decide qué frase mostrar. `openSession`
  devuelve mensajes en español desde el servidor; no se replica ese acoplamiento.
- **`createServerSupabaseClient()` dentro de su propio `try`**, como en el resto
  del archivo (y evitando el patrón que **[[DEBT-041]]** persigue).
- Devuelve la **`ClassSession` actualizada**, no un `OpenSessionSummary`: el
  conteo de asistentes no es asunto de esta acción (ver D6).
- `revalidatePath('/admin/courses', 'layout')` igual que `closeSession`, para no
  dejar el árbol de servidor con el código viejo.

Implementación de `extendSessionCode` (sin reintentos: no toca el código):

```
update class_sessions
  set code_expires_at = <ahora + 15 min>
where id = :sessionId and is_open = true
returning *
```

`rotateSessionCode` hace lo mismo añadiendo `attendance_code = <código nuevo>`,
dentro del bucle de reintento de D5.

### Decisión 5 — Reintento de colisión solo en la rotación

El índice `unique (attendance_code) where is_open` aplica igual en `UPDATE` que en
`INSERT`: el código nuevo puede chocar con el de la sesión abierta de otro curso.
`rotateSessionCode` **reutiliza el bucle de `openSession`** (hasta 5 intentos,
detectando `error.code === '23505'`); agotados los intentos devuelve
`{ status: 'code_collision' }`.

Para no tener dos copias del bucle, se extrae un helper interno del módulo
(no exportado como Server Action — un archivo `"use server"` solo puede exportar
funciones async, así que el helper se queda privado o se mueve a un módulo
hermano sin la directiva). `openSession` pasa a usarlo también; su comportamiento
observable no cambia, incluida la distinción del índice
`class_sessions_academic_course_id_idx` que solo aplica a su `INSERT`.

`extendSessionCode` **no** lleva reintentos: no modifica `attendance_code`, así
que no puede violar ese índice.

### Decisión 6 — La sesión pudo cerrarse en otra pestaña: `is_open = true` en el `WHERE`

Escenario real: el docente tiene el panel abierto en el portátil y en la pantalla
del aula; cierra la sesión en uno y pulsa "Extender" en el otro.

El `update` lleva **`and is_open = true`** en el `WHERE`, no solo el `id`. Así:

- Si la sesión sigue abierta → una fila afectada, `returning *` devuelve la fila →
  `{ status: 'ok', session }`.
- Si ya fue cerrada (o el id no existe) → **cero filas**. Con `.select().single()`
  Supabase responde `PGRST116` ("no rows"), que se traduce a
  `{ status: 'not_open' }` — el mismo criterio con que `getOpenSessionForCourse`
  ya trata `PGRST116` como caso de negocio y no como fallo.

Esto evita el peor resultado posible: **revivir el código de una sesión cerrada**
(que es lo que pasaría con un `where id = :id` a secas, ya que el `update` tendría
éxito sobre una fila con `is_open = false` y dejaría un código con ventana vigente
en una sesión que el docente dio por terminada). El estado `not_open` es de
negocio: el panel lo trata limpiando la sesión de su estado local y mostrando "La
sesión ya fue cerrada" — no un banner de error rojo de infraestructura.

**El conteo de asistentes no se toca.** Las acciones no devuelven
`attendanceCount` y el panel **conserva** el valor que tenga: las
`attendance_records` cuelgan de `session_id`, que no cambia, así que refrescar el
código no puede borrar marcas. Devolver un `OpenSessionSummary` recalculado
abriría la puerta a que un fallo de conteo pintara un 0 justo después de
refrescar, que es el fallo que **[[DEBT-037]]** persiguió en este mismo panel. El
polling de 5 s ya es el dueño del conteo.

### Decisión 7 — Estado pendiente independiente por acción

Hoy `isPending` (un único `useTransition`) gobierna abrir **y** cerrar, y ya causó
el parpadeo de **[[DEBT-019]]** cuando además lo compartía el polling. Con cuatro
acciones sobre el mismo panel, un `isPending` compartido haría que al pulsar
"Extender" el botón "Cerrar sesión" dijera "Cerrando…" — con el docente mirando y
la clase proyectada.

Se introduce:

```ts
type PanelAction = 'open' | 'close' | 'extend' | 'rotate';
const [pendingAction, setPendingAction] = useState<PanelAction | null>(null);
```

Reglas:

- **Solo el botón que se pulsó** cambia su etiqueta ("Extendiendo…", "Generando…",
  "Cerrando…", "Abriendo sesión…").
- **Todos** los botones quedan `disabled` mientras `pendingAction !== null`: dos
  mutaciones simultáneas sobre la misma fila no aportan nada y complican el
  estado.
- `setPendingAction(null)` en el `finally` de cada handler, para que un fallo de
  transporte no deje el panel bloqueado.
- El **polling del conteo sigue fuera** de todo esto (invariante de DEBT-019): no
  toca `pendingAction` ni ninguna transición.

### Decisión 8 — Cuenta atrás y copia del estudiante

**Cuenta atrás (panel docente).** `timeRemaining` se recalcula en un `useEffect`
con `setInterval(1000)` que depende de `[session]` y lleva
`eslint-disable react-hooks/exhaustive-deps`. Al refrescar se llama
`setSession(prev => prev && { ...prev, session: nuevaSesion })`, lo que **cambia
la identidad** de `session` y hace que tanto ese efecto como el del polling se
reinicien — comportamiento correcto y deseado. Dos cuidados:

1. Llamar **también** `setTimeRemaining(getTimeRemaining())` de forma inmediata
   tras el refresh: si no, el docente ve "expirado" hasta un segundo después de
   haber extendido, justo cuando está mirando para confirmar que funcionó.
2. Al reconstruir `session` hay que **conservar `attendanceCount`** (D6) y **no
   volver a montar** el panel: `TeacherAttendanceControl` monta
   `AdminAttendancePanel` con `key={selectedCourse.id}`, que no cambia aquí.

No se toca el `eslint-disable` existente; retirarlo es refactor ajeno al spec.

**Copia del estudiante.** `AttendanceSection` no hace polling (ver "No incluye"),
así que tras una rotación un estudiante con la página abierta teclea el código
viejo y el RPC responde `not_found` → la UI dice **"Código no válido"**, que le
echa la culpa a él y no explica nada. Mitigación **solo de copia**, dentro de
alcance:

- Mensaje de `not_found`: pasa a mencionar la posibilidad de un código nuevo e
  invitar a recargar (ej. *"El código no corresponde a ninguna sesión abierta. Si
  el docente generó uno nuevo, recarga la página y usa el que esté proyectado."*).
  El **título** sigue siendo "Código no válido": no podemos afirmar que hubo una
  rotación, solo ofrecer la hipótesis correcta.
- El mensaje de `expired` ("Solicita un nuevo código al docente") ya era honesto y
  ahora, además, es **accionable**: el docente por fin puede darle uno. Se
  conserva.

Redacción concreta a revisar con el usuario en la Fase 3.

### Decisión 9 — El hallazgo de RLS no se corrige aquí

`class_sessions_mutate_owner_or_admin` (`for update`) define `using` pero **no**
`with check`. En Postgres, sin `with check` la fila **resultante** no se valida
contra el predicado: un docente dueño podría, con un `update` a mano, reasignar
`academic_course_id` a un curso ajeno. Este spec **no lo arregla** —es un hallazgo
de seguridad preexistente, ajeno a refrescar un código, y tocar una policy exige
migración y su propia ronda de pruebas—; se registra como **DEBT-046** en
`docs/specs/backlog.md`. Las acciones de este spec **nunca escriben
`academic_course_id`**, así que no amplían la exposición.

### Decisión 10 — Efecto secundario deseado en las estadísticas

Al dejar de duplicar sesiones por día, `getServiceCourseAttendanceSummary` y por
tanto `attendance-mcp` reportan porcentajes correctos **de aquí en adelante**.
Este spec **no repara retroactivamente** los días ya duplicados en producción
(implicaría fusionar sesiones y sus `attendance_records`, con riesgo de pérdida y
sin forma fiable de saber cuál duplicado era "el bueno"). Si el usuario lo
requiere, es un trabajo aparte y se abrirá su propia entrada de backlog.

---

## Fases de implementación

### Fase 1 — Contrato y Server Actions ✅
- [x] Añadir `RefreshCodeResult` a `lib/attendance/types.ts` con el comentario que
      explique la separación negocio / infraestructura (estilo del archivo).
- [x] Extraer en `lib/attendance/index.ts` el bucle de reintento de código único a
      un helper interno, y hacer que `openSession` lo use sin cambiar su
      comportamiento observable (D5).
- [x] Implementar `extendSessionCode(sessionId)` — `update code_expires_at` con
      `is_open = true` en el `WHERE`, `PGRST116` → `not_open`, `revalidatePath`.
- [x] Implementar `rotateSessionCode(sessionId)` — ídem + `attendance_code` nuevo,
      con reintentos `23505` y `code_collision` al agotarlos.
- [ ] Verificar contra `mirp-lab` (entorno de desarrollo) que ambas acciones
      afectan la fila esperada, que `updated_at` avanza por el trigger, que las
      `attendance_records` previas siguen ahí y que sobre una sesión cerrada
      devuelven `not_open` **sin** modificar nada. *(pendiente: se ejecuta junto
      con la ronda manual de la Fase 4, contra los datos que se preparen para
      `test-041`.)*

**Verificación:** el `select` de la fila tras cada acción muestra el
`code_expires_at` empujado, el `attendance_code` conservado (extender) o distinto
(rotar), `is_open` intacto y el mismo número de `attendance_records`.

### Fase 2 — Panel docente (`AdminAttendancePanel.tsx`) ✅
- [x] Sustituir el `isPending` compartido por `pendingAction` (D7), conservando el
      polling del conteo **fuera** de toda transición (invariante DEBT-019).
- [x] Añadir los botones "Extender 15 min" y "Generar código nuevo" en el bloque
      del código, visibles durante toda la sesión abierta, con tokens semánticos
      de `DESIGN.md` (jerarquía: cerrar sigue siendo la acción destructiva en
      `danger`; extender/rotar son secundarias, no compiten visualmente con el
      código proyectado).
- [x] Añadir los diálogos de confirmación siguiendo el patrón existente del
      archivo, con `// DEBT-038:` (D2). **Desviación deliberada de la letra de
      D2:** en vez de triplicar el bloque JSX del diálogo (uno por acción), se
      consolidó en un único diálogo con `confirmAction` + mapa `dialogCopy`,
      replicando el patrón ya establecido en `CourseLifecycleActions.tsx`
      (spec-036) para sus 3 acciones. Mismo comportamiento observable (mismos
      textos, mismo Escape/foco/overflow por acción); reduce a un tercio el
      código de accesibilidad a mantener sincronizado. El comentario
      `// DEBT-038:` señala que sigue siendo markup no extraído a un componente
      compartido. Textos: el de rotar advierte que el código proyectado dejará
      de funcionar de inmediato.
- [x] Handlers: actualizar `session` conservando `attendanceCount`, refrescar
      `timeRemaining` de inmediato, mapear `not_open` (limpiar sesión + aviso
      informativo en un banner `warning` nuevo, distinto del banner rojo de
      error), `code_collision` y `unavailable` a mensajes distintos, y
      `try/catch` de transporte como el resto de handlers.
- [ ] Revisar que el panel siga correcto en modo claro y oscuro y con el grupo
      conmutado en `TeacherAttendanceControl`. *(pendiente: requiere navegador,
      ver "Pruebas visuales y uso del navegador" en CLAUDE.md — se verifica en
      la ronda manual de Fase 4.)*

**Verificación:** con una sesión abierta, extender conserva el código y reinicia
la cuenta atrás; rotar muestra un código distinto; el conteo de asistentes no se
mueve; ningún botón ajeno cambia de etiqueta durante la acción.

### Fase 3 — Copia del estudiante (`AttendanceSection.tsx`) ✅
- [x] Ajustar el mensaje de `not_found` para contemplar la rotación e invitar a
      recargar (D8), sin cambiar el título ni la lógica.
- [ ] Confirmar la redacción final con el usuario antes de cerrar la fase.

**Verificación:** con un código rotado, el estudiante que teclea el viejo recibe
un mensaje que le dice qué hacer.

### Fase 4 — Verificación final (parcial)
- [x] `npm run lint` y `npm run build` sin errores. *(0 errores; los 8 warnings
      restantes son preexistentes y ajenos a este spec.)*
- [ ] Ejecutar la ronda manual `docs/testing/test-041-refrescar-codigo-asistencia.md`
      (el usuario opera la UI; Claude prepara datos y registra hallazgos).
- [x] Registrar **DEBT-046** en `docs/specs/backlog.md` (D9) — verificado presente.
- [ ] Pruebas automáticas: **N/A** mientras no exista framework (ver "Pruebas
      asociadas").

> **No hay fase de MCP** (ver "Evaluación MCP"). No hay fase de migración (D3).

---

## Criterios de aceptación

1. Con una sesión de asistencia **abierta**, el docente ve en el panel dos
   acciones nuevas —"Extender 15 min" y "Generar código nuevo"— disponibles en
   todo momento, no solo tras la expiración.
2. **Extender** conserva el `attendance_code` visible y reinicia la cuenta atrás a
   ~15 min; un estudiante que ya tenía anotado ese código puede marcar con él.
3. **Generar código nuevo** muestra un código **distinto** y reinicia la cuenta
   atrás; el código anterior deja de funcionar (el RPC responde `not_found`).
4. **Ambas acciones piden confirmación**; cancelar en cualquiera de los dos
   diálogos deja el código y la expiración **exactamente como estaban**.
5. Las **marcas de asistencia previas sobreviven** a cualquier refresco: el conteo
   del panel no se reinicia ni parpadea a 0, y el estudiante que ya había marcado
   sigue viendo su confirmación con su `marked_at` original.
6. Refrescar **no crea una segunda `class_sessions`**: sigue habiendo una sola
   fila para el día, con el mismo `id`, y `total_sessions` del curso no aumenta.
7. Si la sesión fue **cerrada desde otra pestaña**, refrescar **no la revive**:
   la acción responde "la sesión ya fue cerrada", el panel vuelve al estado "sin
   sesión abierta" y la fila conserva `is_open = false` con su expiración
   original.
8. Mientras una acción está en curso, **solo su botón** muestra el estado de carga;
   ningún otro botón cambia de etiqueta (no se reintroduce DEBT-019).
9. El **conteo en vivo sigue funcionando** después de refrescar: un estudiante que
   marca con el código vigente incrementa el contador en ~5 s.
10. Un estudiante que teclea un código ya rotado recibe un mensaje que **explica
    qué hacer** (recargar y usar el proyectado), no solo "código no válido".
11. **No se crea ninguna migración** ni se modifica ningún archivo de
    `supabase/migrations/`.
12. `npm run lint` y `npm run build` pasan sin errores.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Rotar deja fuera a estudiantes que ya tenían el código anotado y no miran la pantalla | Es el propósito de separar las dos acciones (D1): el caso habitual usa "Extender", que no invalida nada. El diálogo de rotar lo advierte explícitamente (D2). |
| El estudiante con la página abierta no ve el código nuevo | Limitación preexistente, declarada fuera de alcance y mitigada con copia (D8). Realtime queda como mejora futura de spec-010. |
| Colisión del código nuevo con la sesión abierta de otro curso | Reintento sobre `23505` reutilizando el bucle de `openSession` (D5); `code_collision` como estado de negocio si se agotan los intentos. |
| Revivir por accidente una sesión cerrada | `is_open = true` en el `WHERE` del `update` (D6); el caso se prueba explícitamente (TC-008). |
| El refresco resetea el conteo de asistentes a 0 en pantalla proyectada | Las acciones no devuelven conteo y el panel conserva el suyo (D6); cubierto por TC-005 y TC-009. |
| Parpadeo cruzado entre botones (regresión de DEBT-019) | `pendingAction` por acción y polling fuera de transiciones (D7); cubierto por TC-010. |
| Añadir dos copias más del diálogo duplicado (DEBT-038) | Aceptado conscientemente y marcado con `// DEBT-038:` para la futura extracción (D2). |
| La policy de `update` sin `with check` | Fuera de alcance, registrado como **DEBT-046** (D9). Este spec no escribe `academic_course_id`. |

---

## Pruebas asociadas

> Se crean junto con el spec (test-first). Ver "Artefactos que acompañan al spec"
> en `CLAUDE.md`.

- **Manuales:** `docs/testing/test-041-refrescar-codigo-asistencia.md` — casos
  `TC-001` … `TC-011`, uno o más por criterio de aceptación. Arrancan todos en
  ⬜ Pendiente.
- **Automáticas (e2e/unit): el archivo NO existe, a propósito.** `CLAUDE.md` →
  "Testing" declara el framework **"por definir"**: no hay runner, ni ubicación
  convenida para los specs e2e, ni configuración que ejecutar. Crear un
  `e2e-041-….spec.ts` produciría un archivo que nadie puede correr, en una ruta
  inventada que habría que mover cuando se decida el framework — ruido, no
  cobertura. Se describen aquí los casos que ese archivo debe contener cuando el
  framework exista, derivados de los criterios de aceptación:

  | Caso automático | Criterio |
  |---|---|
  | `extendSessionCode` conserva `attendance_code` y empuja `code_expires_at` | 2 |
  | `rotateSessionCode` cambia `attendance_code` y empuja `code_expires_at` | 3 |
  | Tras rotar, `mark_attendance_by_code` con el código viejo → `not_found` | 3 |
  | Tras refrescar, `count(attendance_records)` de la sesión no cambia | 5 |
  | Refrescar no incrementa `count(class_sessions)` del curso/día | 6 |
  | Sobre una sesión con `is_open = false` → `not_open` y fila intacta | 7 |
  | Colisión forzada de código (dos cursos abiertos) → reintento exitoso | D5 |
  | Sesión de otro docente → la RLS impide el `update` (`not_open`) | seguridad |

---

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-05
