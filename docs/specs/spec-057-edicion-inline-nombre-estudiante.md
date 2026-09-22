# spec-057 — [TESTING] Edición inline del nombre del estudiante desde la lista de matriculados
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Los estudiantes se autorregistran (spec-027) y escriben su propio nombre,
con erratas frecuentes: minúsculas, apodos, apellidos incompletos, nombre
en un solo campo. Ese `full_name` es el identificador humano del
estudiante en **todo** el panel docente (lista de matriculados, planilla
de asistencia, tabla de notas, revisión de entregas), así que un nombre
mal escrito degrada todas esas vistas.

Hoy el docente tiene dos salidas, ninguna buena: pedirle al estudiante que
lo corrija desde `/cuenta`, o pedírselo a un agente vía `students-mcp` →
`update_student`. No hay ninguna superficie de UI en el panel docente para
corregirlo: no existe página de edición de estudiante
(`app/(admin)/admin/students/…` no existe; `app/api/students/*` es solo
API de servicio para el MCP).

Este spec agrega esa superficie donde el docente ya está mirando el
nombre: la columna "Nombre" de `EnrollmentTable`, editable en el sitio.

## Alcance

**Incluye**
- Edición inline de `profiles.full_name` desde la columna "Nombre" de la
  tabla **Activos** de `EnrollmentTable`.
- Server Action nueva, con verificación de propiedad del curso + matrícula
  activa, que reutiliza `updateServiceStudent`.
- Validación del nombre (trim, longitud) con Zod, en servidor y como
  pre-chequeo de UX en cliente.
- Extracción del gate de autorización duplicado (ver Fase 2, D7).

**No incluye**
- Edición de correo, carrera, semestre o usuario de GitHub (siguen siendo
  exclusivos del MCP / de `/cuenta`).
- Edición del nombre en la tabla **Retirados** (D4).
- Página de gestión global de estudiantes en el panel docente.
- Nuevas policies RLS ni migraciones (D2).
- Historial/auditoría de cambios de nombre (no existe tabla de auditoría
  en el proyecto; si se quiere, es otro spec).
- Edición inline en `AttendanceSheet` o `GradesTable` (esas vistas leen el
  nombre ya corregido; no se duplica la superficie de edición).

## Impacto en el sistema

- **Frontend público:** ninguno. El nombre del estudiante no se publica
  en rutas públicas.
- **Panel docente:**
  - `components/admin/EnrollmentTable.tsx` — la celda "Nombre" de la
    tabla Activos pasa a renderizar el componente nuevo; la de Retirados
    queda igual (texto plano).
  - `components/admin/StudentNameCell.tsx` — **nuevo**, client component.
  - Efecto colateral deseado: `ResetPasswordButton` recibe `studentName`
    desde la misma fila, así que tras corregir el nombre el diálogo de
    contraseña lo muestra bien sin cambios adicionales.
- **Server Actions / lógica:**
  - `lib/students/actions.ts` — **nueva**
    `updateStudentNameAction(studentId, academicCourseId, fullName)`;
    además se extrae el gate compartido con `resetStudentPasswordAction`.
  - `lib/students/schemas.ts` — nuevo `EditStudentNameSchema`.
  - `lib/students/service.ts` — **sin cambios**; `updateServiceStudent`
    se usa tal cual.
- **Base de datos:** **sin migraciones, sin cambios de esquema, sin
  policies nuevas.** El único write es `profiles.full_name` vía
  `service_role`, que bypasea RLS; la autorización real vive en la Server
  Action. `git diff --stat …-- supabase/` debe quedar vacío en esta rama
  (relevante para el checklist de despliegue de CLAUDE.md: este es un
  despliegue **solo código**).
- **Auth / Storage:** sin cambios. `auth.users.user_metadata.full_name`
  **no** se sincroniza (D6).
- **MCPs:** sin cambios (ver "Evaluación MCP").

## Evaluación MCP

**¿Aplica MCP?** No.

- `students-mcp` ya expone `update_student`
  (`mcp-servers/students-mcp/src/tools.ts:79`), cuyo `inputSchema` incluye
  `full_name`, y que hace `PATCH /api/students/{id}` →
  `UpdateStudentSchema` (`full_name: z.string().min(2).optional()`) →
  `updateServiceStudent`. La capacidad "cambiar el nombre de un
  estudiante" **ya está expuesta al agente docente**.
- Este spec no crea datos ni acciones nuevas para un agente: es una
  **superficie de UI nueva sobre una capacidad ya existente**. No hay
  nada que agregar al MCP ni a
  `docs/mcps/students-agent.system-prompt.md`.
- Matiz a dejar escrito (no requiere cambios, pero es una asimetría
  deliberada): el camino MCP tiene autoridad de **admin**
  (`STUDENTS_ADMIN_API_KEY`, sin comprobación de propiedad de curso) y
  puede renombrar a cualquier estudiante; el camino de UI nuevo es **más
  estrecho** (docente dueño del curso + estudiante con matrícula activa
  en ese curso). No se relaja el camino de UI para igualar al del MCP.

## Decisiones de diseño

**D1 — El write va por `service_role` bajo un gate explícito, no por RLS
del docente.** `profiles` solo tiene `"profiles: update own"`. La Server
Action verifica propiedad con el cliente de **sesión** y solo entonces
llama a `updateServiceStudent` (service_role). Es el patrón ya auditado
de `resetStudentPasswordAction`.

**D2 — Se descarta agregar una policy `"profiles: update by course
teacher"`.** Motivos: (a) una policy RLS es por fila, no por columna —
abriría al docente el UPDATE de **todo** el perfil (incluido
`github_username`) vía PostgREST directo, no solo del nombre; (b) obliga
a una migración y a un `db push` a producción, cuando el spec puede ser
100% código; (c) el proyecto ya tiene precedente consolidado en sentido
contrario (service_role + gate en la acción).

**D3 — Gate de autorización en dos pasos, en este orden:**
1. `select id from academic_courses where id = :academicCourseId` con
   cliente de sesión → si no devuelve fila, el invocante no es dueño ni
   admin. **Este paso es el que cierra el hueco**: un estudiante nunca es
   `teacher_id` de nada.
2. `select id from enrollments where student_id = :studentId and
   academic_course_id = :academicCourseId and status = 'active'`.

Nunca invertir el orden ni quedarse solo con el paso 2 (ver el comentario
de `lib/students/actions.ts:63-84`).

**D4 — Solo estudiantes activos.** La restricción no es técnica (el
nombre de un retirado sí es legible y escribible por este camino), es de
producto: una fila retirada es registro histórico y su columna de acción
ya es "Reactivar" (spec-056). La restricción se aplica **en el
servidor** (`.eq("status","active")` en el paso 2 del gate), no solo
ocultando el botón. Si más adelante se quiere permitir retirados, se
quita ese filtro y se habilita la celda en la segunda tabla — cambio de
una línea a cada lado.

**D5 — Patrón de UI: click-to-edit, no input siempre montado.** Flowbite
**no** tiene componente de celda editable (tiene Table y Forms/Input por
separado), así que es composición manual, como ya lo fue
`GradeInputCell`. Pero no se copia su forma "input siempre visible": eso
funciona para notas (se editan constantemente, en lote) y no para
nombres (se corrigen una vez), donde convertiría la columna en un muro de
inputs y rompería la lectura del roster.

Comportamiento:
- Estado lectura: el nombre + un botón discreto de lápiz
  (`aria-label="Editar nombre de {nombre}"`), visible siempre (no solo en
  hover — el hover-only falla en táctil y en teclado).
- Al activar: la celda renderiza un `<input>` controlado, con foco
  automático y el texto seleccionado, más botones ✓ Guardar / ✕ Cancelar.
- Teclado: **Enter guarda, Escape cancela**. **`blur` NO guarda** (a
  diferencia de `GradeInputCell`): habiendo un cancelar explícito, guardar
  al hacer clic fuera es sorpresivo. `blur` con el valor sin cambios
  cierra la edición; con cambios, la deja abierta.
- La celda lleva un `min-width` fijo para que la tabla no salte al
  alternar lectura/edición.
- Tokens y clases: mismas parejas claro/oscuro y
  `rounded-[var(--radius-base)]` que ya usa la tabla; nada de valores
  crudos de la paleta (CLAUDE.md + DESIGN.md).

**D6 — Sin optimistic update; se confirma contra el servidor.**
`EnrollmentTable` es server component y el nombre se propaga a props
hermanos (`ResetPasswordButton.studentName`) y a otras vistas del curso.
Un valor optimista quedaría desincronizado del render del servidor hasta
que llegue la revalidación. Además el precedente a evitar es DEBT-091 y
el hallazgo de @reviewer sobre `reactivateStudentAction`: una mutación
que *parece* haber funcionado cuando falló. Se muestra spinner durante el
guardado y el nombre nuevo solo después de `ok`.

En error: la edición **permanece abierta con el texto tecleado** (no se
pierde lo escrito), y se muestra el mensaje con `role="alert"`. No hay
"revertir en silencio".

`auth.users.user_metadata.full_name` no se toca: `updateServiceStudent`
tampoco lo hace hoy, y `profiles` es la fuente de verdad que lee toda la
app. Sincronizarlo sería ampliar el scope y divergir del camino MCP.

**D7 — Extraer el gate a un helper compartido.**
`updateStudentNameAction` sería la **segunda** copia de un chequeo de
seguridad en el que ya se encontró un hueco una vez. Se extrae a
`assertTeacherOwnsEnrolledStudent(studentId, academicCourseId, {
requireActive })` dentro de `lib/students/actions.ts`, y
`resetStudentPasswordAction` pasa a usarlo (con `requireActive: false`,
para no cambiar su comportamiento actual — hoy no filtra por estado). Es
un refactor pequeño y **dentro** del scope declarado; el comentario que
documenta el hallazgo de @reviewer se mueve al helper, no se pierde.

**D8 — Validación.** `EditStudentNameSchema = z.string().trim().min(2,
…).max(100, …)` en `lib/students/schemas.ts`. El `.trim()` de Zod
normaliza antes de validar, así que `"  "` falla el `min(2)`. Se agrega
`max(100)` (hoy ningún esquema lo tiene) solo en esta ruta; **no** se
modifica `UpdateProfileSchema` ni `UpdateStudentSchema` — sería cambiar
el contrato del MCP y de `/cuenta` fuera de scope (anotarlo como
`// DEBT:` + entrada en `docs/specs/backlog.md`: la falta de `max` en los
esquemas de nombre es transversal).

El cliente deshabilita ✓ si el valor está vacío o no cambió; eso es UX,
la validación real es la del servidor.

**D9 — Revalidación.** `revalidatePath("/admin/courses/[academicCourseId]",
"layout")` además de `revalidatePath("/admin/courses")`. El `"layout"` es
necesario porque el nombre también se renderiza en rutas hermanas del
mismo segmento (`/asistencia`, `/grades`, `/assignments/**`), y un
`revalidatePath` de ruta exacta —como el que usan `withdrawStudentAction`
y `resetStudentPasswordAction`— no las alcanza. Verificar este punto en
la ronda manual (TC-057-006).

## Fases de implementación

### Fase 1 — Validación y capa de datos
- [x] Agregar `EditStudentNameSchema` a `lib/students/schemas.ts`
      (`z.string().trim().min(2).max(100)`, mensajes en español).
- [x] Confirmar que `updateServiceStudent`
      (`lib/students/service.ts:304`) sirve tal cual para `{ full_name }`
      y **no** modificarla.
- [x] Registrar en `docs/specs/backlog.md` la deuda de D8 (falta de `max`
      en los esquemas de nombre compartidos).

### Fase 2 — Autorización compartida
- [x] Extraer de `resetStudentPasswordAction` el gate de dos pasos a
      `assertTeacherOwnsEnrolledStudent(studentId, academicCourseId, {
      requireActive })` en `lib/students/actions.ts`, trasladando íntegro
      el comentario que documenta el hallazgo de @reviewer (2026-08-16).
- [x] Migrar `resetStudentPasswordAction` al helper con
      `requireActive: false` (comportamiento idéntico al actual).

### Fase 3 — Server Action
- [x] Crear `updateStudentNameAction(studentId, academicCourseId,
      fullName): Promise<AuthResult<{ full_name: string }>>` en
      `lib/students/actions.ts`:
  - [x] `await requireUser()`.
  - [x] Gate con `assertTeacherOwnsEnrolledStudent(..., { requireActive:
        true })`.
  - [x] Validar con `EditStudentNameSchema`; devolver `{ ok: false,
        error }` con mensaje en español ante fallo.
  - [x] Llamar `updateServiceStudent(studentId, { full_name })`; si
        devuelve `null`, responder error (estudiante no encontrado)
        **sin** revalidar.
  - [x] Revalidar según D9 y devolver el `full_name` normalizado (ya
        trimmeado) para que la UI muestre exactamente lo guardado.

### Fase 4 — Celda editable (UI)
- [x] Crear `components/admin/StudentNameCell.tsx` (`"use client"`), con
      props `{ studentId, academicCourseId, initialName }`.
- [x] Máquina de estados `idle | editing | saving | error` reutilizando
      la forma de `GradeInputCell` (spinner, check transitorio,
      `aria-live="polite"`).
- [x] Manejo de fallo de transporte con `isServerActionTransportError` +
      `reportTransportError("updateStudentNameAction")` (spec-053).
- [x] Teclado y foco: autofocus + `select()` al abrir; Enter guarda;
      Escape cancela y devuelve el foco al botón de lápiz; `blur` sin
      cambios cierra.
- [x] Accesibilidad: `aria-label` en lápiz/input/✓/✕, `role="alert"` para
      el error, objetivo táctil ≥ 24px, sin dependencia de hover.
- [x] Estilos con tokens semánticos y parejas claro/oscuro de
      `DESIGN.md`; `min-width` en la celda para evitar el salto de
      layout.

### Fase 5 — Integración en la tabla
- [x] En `components/admin/EnrollmentTable.tsx`, sustituir
      `{enrollment.profile.full_name}` de la **tabla Activos** (línea
      ~77) por `<StudentNameCell …/>`.
- [x] Dejar la **tabla Retirados** (línea ~143) como texto plano (D4).
- [x] Verificar que `ResetPasswordButton` sigue recibiendo el nombre
      correcto tras la revalidación.
- [x] `npm run lint` y `npm run build` en verde.

### Fase 6 — Pruebas
- [x] Ejecutar `docs/testing/test-057-edicion-inline-nombre-estudiante.md`
      con el usuario (protocolo de "Pruebas manuales asistidas por
      Claude").
- [x] (Cuando exista framework) ejecutar las pruebas automáticas vía
      `@tester`.

> **Sin fase de MCP** (ver "Evaluación MCP"). **Sin fase de migraciones**
> (ver "Impacto en el sistema").

## Criterios de aceptación

1. El docente dueño del curso ve un control de edición junto al nombre
   de cada estudiante **activo** en `/admin/courses/{id}`, y ninguno
   junto a los **retirados**.
2. Al activarlo, la celda muestra un input con el nombre actual
   seleccionado; Enter o ✓ guardan, Escape o ✕ cancelan sin cambios.
3. Tras guardar con éxito, la celda muestra el nombre nuevo (trimmeado)
   y el cambio se refleja también en el resto de vistas del curso
   (asistencia, notas) sin recargar manualmente.
4. Un nombre vacío, de espacios, de menos de 2 caracteres o de más de
   100 es rechazado con mensaje en español y la edición queda abierta
   con lo tecleado.
5. Si el guardado falla, la UI **no** muestra el nombre nuevo (no hay
   optimistic update) y presenta el error con `role="alert"`.
6. `updateStudentNameAction` invocada con un `academicCourseId` que el
   usuario no posee devuelve error y **no** modifica `profiles`;
   invocada por un estudiante autenticado con su propio `studentId`
   también falla (paso 1 del gate).
7. `updateStudentNameAction` sobre un estudiante **retirado** del curso
   falla en el servidor, aunque la UI no ofrezca el control.
8. La edición es operable solo con teclado y la celda no altera el
   ancho de la tabla al alternar entre lectura y edición.
9. `resetStudentPasswordAction` conserva su comportamiento exacto tras
   la extracción del helper.
10. `git diff --stat origin/development..HEAD -- supabase/` está vacío
    (despliegue solo código).

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-057-edicion-inline-nombre-estudiante.md`
  — casos `TC-057-001` … `TC-057-009`, uno por criterio con UI (1–5, 8,
  9). Sin casos `TC-MCP-057` (no hay fase de MCP).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-057-edicion-inline-nombre-estudiante.spec.ts`
  — criterios 6 y 7 (autorización) son los de mayor valor para
  automatizar; hoy solo se describen en el spec (framework "por
  definir", cuando exista).

## Archivos concretos (rutas verificadas)

**Crear**
- `components/admin/StudentNameCell.tsx`

**Modificar**
- `components/admin/EnrollmentTable.tsx` (celda de nombre de la tabla
  Activos, ~línea 77)
- `lib/students/actions.ts` (helper de autorización compartido +
  `updateStudentNameAction`; migrar `resetStudentPasswordAction`)
- `lib/students/schemas.ts` (`EditStudentNameSchema`)
- `docs/specs/backlog.md` (deuda de D8)

**Leídos y deliberadamente NO modificados**
- `lib/students/service.ts` (`updateServiceStudent` se reutiliza tal cual)
- `lib/enrollments/actions.ts` y `lib/enrollments/index.ts` (esta acción
  no toca matrículas)
- `app/api/students/[studentId]/route.ts`,
  `mcp-servers/students-mcp/src/tools.ts`,
  `docs/mcps/students-agent.system-prompt.md`
- `supabase/migrations/**` (sin cambios de esquema)
- `app/(admin)/admin/courses/[academicCourseId]/page.tsx` (no requiere
  cambios: solo pasa `enrollments` y `academicCourseId`, que ya son lo
  que la celda necesita)

## Referencias de código que la implementación debe seguir

- Gate de autorización y su historia: `lib/students/actions.ts:63-119`
- Celda con estados de guardado y transport errors:
  `components/admin/GradeInputCell.tsx`
- Por qué el docente no puede leer/escribir `profiles` directo:
  `supabase/migrations/20260623000002_rls_policies.sql:14-29` y
  `supabase/migrations/20260709000002_student_profiles_public_lookup.sql`
- Comprobar el resultado de la mutación en vez de asumir éxito:
  `lib/enrollments/index.ts:244-268` (`reactivateEnrollment`)

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-09-22
