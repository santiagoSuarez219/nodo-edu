# spec-027 — [DONE] Registro simplificado con código de curso y MCP de administración de estudiantes

## Contexto

El registro actual (`lib/auth/actions.ts` → `signUp`) llama a
`supabase.auth.signUp` con `emailRedirectTo: ${SITE_URL}/auth/callback` y
redirige a `/registro/confirmar`, una pantalla que pide al estudiante revisar
su correo para activar la cuenta. Ese flujo depende de que Supabase pueda
enviar correos a destinatarios arbitrarios.

El proyecto **no tiene SMTP propio configurado**: usa el SMTP por defecto de
Supabase, que solo entrega correos a la cuenta dueña del proyecto. Configurar
un proveedor (Resend, SendGrid) exige verificar un dominio propio, y no hay
dominio disponible antes de la próxima semana.

La próxima semana deben registrarse **4 grupos de ~30 estudiantes (~120
personas)**. Con el flujo actual, prácticamente ninguno recibiría el correo de
confirmación y ninguna cuenta quedaría activa. Es un bloqueante duro de
operación docente, no una mejora de UX.

Decisión de producto ya tomada por el docente (base de este spec, no se
reabre en la implementación):

1. **Fusionar registro y matrícula en un solo paso, sin confirmación por
   correo.** El formulario de `/registro` pide nombre, correo, contraseña y el
   **`enrollment_code` del curso** (el mismo que ya existe en
   `academic_courses`, spec-003). Al enviarlo, el estudiante queda registrado,
   matriculado en ese curso y con sesión iniciada, en una sola operación.
2. **Un MCP con permisos de administración sobre estudiantes**, protegido por
   API key, para que el docente (vía agente) pueda crear manualmente a quien no
   pudo registrarse en clase, corregir un typo en nombre/correo, listar los
   estudiantes registrados por curso y eliminar registros duplicados o
   erróneos.

El estado actual del código relevante, verificado:

- `SignUpSchema` (`lib/auth/schemas.ts`) pide `full_name`, `email`,
  `password`, `password_confirmation`. No conoce el código de curso.
- `SignUpForm.tsx` renderiza esos 4 campos desde un array `fields` constante.
- `enrollByCode` (`lib/enrollments/index.ts`) resuelve el curso con el RPC
  `find_course_by_enrollment_code` (security definer, `grant execute … to
  authenticated`), verifica `is_active`, verifica matrícula previa e inserta en
  `enrollments` con `student_id = auth.uid()`. Depende de `getCurrentUser()`.
- El trigger `on_auth_user_created` → `handle_new_user()` crea `profiles`,
  `user_roles` (rol `student`) y `students`. **Traga los errores** con un
  `exception when others → raise warning; return new`, así que un fallo deja al
  usuario de `auth.users` sin rol `student`.
- La política RLS `enrollments: insert own student` exige
  `student_id = auth.uid() and public.has_role(auth.uid(), 'student')`.
- `supabase/config.toml` ya tiene `enable_confirmations = false`, pero ese
  archivo **no gobierna el proyecto remoto** (`academy-page`), que es el único
  entorno del proyecto y hoy tiene la confirmación activa. El cambio real es
  en el dashboard de Supabase.
- Los tres MCPs de servicio existentes (`question-bank-mcp`, `assignment-mcp`,
  `attendance-mcp`) se autentican **todos contra la misma variable**
  `QUESTION_BANK_API_KEY`, hardcodeada dentro de `authenticateServiceRequest`
  (`lib/api/auth.ts`). No hay separación de privilegios por servicio.
- El único cliente con `SUPABASE_SERVICE_ROLE_KEY` es
  `createServiceSupabaseClient` (`lib/auth/service.ts`), consumido hoy por
  `lib/attendance/service.ts` detrás de rutas `app/api/attendance/*`.

## Alcance

### Incluye

- Desactivación de la confirmación de correo en el registro y eliminación del
  paso `/registro/confirmar` del flujo feliz.
- Eliminación de `app/auth/callback/route.ts`: tras quitar `emailRedirectTo` de
  `signUp`, esa ruta queda sin ningún llamador real en el código (verificado:
  la recuperación de contraseña usa `verifyOtp` directamente en
  `/recuperar-password/confirmar`, no pasa por `/auth/callback`).
- Nuevo campo `enrollment_code` en el formulario de registro, su esquema Zod y
  la Server Action `signUp`, con validación del código **antes** de crear el
  usuario.
- Matrícula automática en el curso indicado, dentro de la misma operación de
  registro, con sesión iniciada al terminar.
- Saneamiento del trigger `handle_new_user` (Fase 1) para que ya no silencie
  fallos reales: una falla real revierte toda la transacción (incluido el
  insert en `auth.users`). **Esto no cubre el 100% de los casos** — ver
  `ensureStudentAccountBootstrap` más abajo, encontrado durante la ronda
  manual.
- `ensureStudentAccountBootstrap` (`lib/students/service.ts`): reconstruye
  `profiles`/`user_roles`/`students` con el cliente de servicio cuando
  `signUp()` reactiva un correo que ya existía sin confirmar (el trigger,
  `AFTER INSERT`, no dispara sobre ese `UPDATE`) — encontrado en TC-027-003.
- Mitigaciones de seguridad por la pérdida de la verificación de correo:
  rate limiting del registro, normalización del código, y no convertir el
  endpoint en un oráculo de enumeración de códigos.
- Generalización de `authenticateServiceRequest` para aceptar qué variable de
  entorno validar, y una API key propia para el dominio de estudiantes.
- API de servicio `/api/students/*` con CRUD de estudiantes y gestión de sus
  matrículas, sobre `SUPABASE_SERVICE_ROLE_KEY`.
- Nuevo MCP `students-mcp` + su system prompt con guardrails estrictos.
- Actualización de `docs/mcps/README.md`, `CLAUDE.md` (inventario de MCPs y
  tabla de variables de entorno) y `.env.example`.
- **Ampliación de scope aprobada por el usuario durante la ronda manual**:
  eliminación completa del flujo de recuperación de contraseña
  (`/recuperar-password`, `/recuperar-password/confirmar`,
  `PasswordResetRequestForm`, `PasswordResetConfirmForm`,
  `requestPasswordReset`, `updatePassword`, `PasswordResetRequestSchema`,
  `PasswordResetConfirmSchema`, y el enlace "¿Olvidaste tu contraseña?" en
  `LoginForm`). Sin SMTP, ese flujo nunca entregaba el correo; la única vía de
  recuperación real es el docente vía `students-mcp` (`update_student` con
  nuevo `email`, o recrear la cuenta). Mantenerlo visible sugería una opción
  que no funciona.

### No incluye

- Configurar SMTP propio ni comprar/verificar un dominio. Cuando exista, la
  reintroducción de la verificación de correo será otro spec.
- Login social / OAuth.
- Panel de administración de estudiantes en la UI de `/admin`. La
  administración de este spec es vía agente + MCP, no vía pantalla.
- Cambios en el flujo de matrícula ya existente desde `/cuenta/cursos`
  (`enrollByCourseCodeAction`), que se mantiene para matricularse en un segundo
  curso.
- Rotación de `enrollment_code` por curso (ver riesgos; se registra en
  `docs/specs/backlog.md`).

## Impacto en el sistema

### Configuración de Supabase (fuera del código)

- Dashboard → Authentication → Providers → Email → **desactivar "Confirm
  email"** en el proyecto `academy-page`. Sin este cambio, `signUp` no devuelve
  sesión y el resto del spec no funciona. Es una acción manual del usuario, no
  ejecutable por Claude.
- `supabase/config.toml` ya declara `enable_confirmations = false`: queda
  alineado con el remoto tras el cambio, pero no lo provoca.

### Frontend público

- `components/auth/SignUpForm.tsx`: nuevo campo `enrollment_code` en el array
  `fields` (texto, `autoComplete="off"`, placeholder con el formato del código,
  texto de ayuda "Te lo entrega tu docente en clase"). Sin cambios
  estructurales en el componente.
- `app/(auth)/registro/page.tsx`: ajustar el `subtitle` del `AuthShell` para
  reflejar que el registro matricula al curso.
- `app/(auth)/registro/confirmar/page.tsx`: se elimina del flujo. Decisión a
  tomar en Fase 3: borrar la ruta o dejarla como página informativa
  inalcanzable. Recomendación: **eliminarla** junto con
  `components/auth/ResendConfirmationForm.tsx` y la acción `resendConfirmation`,
  para que no quede código muerto que sugiera un flujo que ya no existe.
- Nuevo destino tras registro exitoso: `/cuenta/cursos` (coherente con el
  redirect de `signIn` para usuarios con rol `student`).

### Auth y capa de datos

- `lib/auth/schemas.ts`: `SignUpSchema` gana `enrollment_code` (requerido,
  `min(1)`, con transform a `trim().toUpperCase()` para igualar la
  normalización que ya hace `enrollByCourseCodeAction`).
- `lib/auth/actions.ts` → `signUp`: cambia de "crear usuario y redirigir a
  confirmar" a una secuencia con orden significativo:
  1. Validar el payload.
  2. **Resolver el curso por código antes de crear el usuario** (evita dejar
     usuarios huérfanos por un código mal escrito, que será el error más común
     con 120 estudiantes tecleando en clase).
  3. `supabase.auth.signUp` sin `emailRedirectTo`.
  4. Insertar la matrícula usando **la misma instancia** de cliente Supabase
     que hizo el `signUp`.
  5. `revalidatePath("/", "layout")` y `redirect("/cuenta/cursos")`.
- El paso 2 no puede usar el RPC `find_course_by_enrollment_code` tal cual: su
  `grant execute` es solo para `authenticated`, y en ese momento el visitante
  es anónimo. Dos opciones, a decidir en Fase 2:
  - **(a) recomendada)** validar el código server-side con
    `createServiceSupabaseClient` desde la Server Action. No requiere
    migración, no amplía la superficie pública del RPC.
  - (b) `grant execute … to anon`, que convierte el RPC en un oráculo de
    enumeración de códigos accesible sin sesión. Descartada salvo bloqueante.
- **No reutilizar `enrollByCode` tal cual dentro de `signUp`**: esa función
  llama a `getCurrentUser()`, que crea un cliente nuevo leyendo cookies del
  request entrante. Dentro de la misma request en la que acaba de crearse la
  sesión, las cookies de sesión aún no están en el store leído por ese cliente,
  así que `auth.uid()` puede resolver a `null` y el insert falla contra RLS.
  Extraer en `lib/enrollments/index.ts` una función que reciba el
  `supabase` client y el `userId` explícitos, y dejar `enrollByCode` como
  wrapper que la llama con `getCurrentUser()` — así `/cuenta/cursos` no cambia
  de comportamiento.

### Base de datos y RLS

- **Sin cambios de esquema.** `academic_courses.enrollment_code` y
  `enrollments` ya existen y bastan.
- El insert en `enrollments` sigue pasando por la política
  `enrollments: insert own student`, que exige `has_role(auth.uid(),'student')`.
  El rol lo crea el trigger `on_auth_user_created`, que es un `AFTER INSERT`
  **en la misma transacción** que el insert en `auth.users`: cuando `signUp`
  retorna, las filas de `profiles`/`user_roles`/`students` ya están
  comprometidas. **No hay carrera temporal.**
- Sí hay un riesgo real distinto de la carrera: `handle_new_user` captura
  `when others` y devuelve `new` igual. Si el insert en `user_roles` falla, el
  usuario queda creado **sin rol `student`**, y el insert en `enrollments`
  fallará contra RLS con un error opaco. Hoy eso es invisible; con el registro
  fusionado se vuelve un fallo visible para el estudiante. Mitigación en Fase
  1: una migración de una línea que haga que `handle_new_user` deje de
  silenciar los errores del rol (o que registre el fallo de forma consultable),
  más un fallback explícito en la Server Action similar al `ensureProfile` que
  ya existe en `lib/students/index.ts`.
- La API de servicio del MCP usa `SUPABASE_SERVICE_ROLE_KEY` y **bypasa RLS por
  completo**: ninguna de las políticas anteriores la limita.

### API de servicio y MCPs

- `lib/api/auth.ts`: `authenticateServiceRequest(req)` pasa a aceptar qué
  variable de entorno validar, con `QUESTION_BANK_API_KEY` como valor por
  defecto para no romper las 3 rutas de dominio existentes (`questions`,
  `assignments`, `attendance`, 15 call sites verificados). Mantener el
  `timingSafeEqual` con padding tal como está.
- Nuevas rutas `app/api/students/*`, autenticadas contra una variable nueva
  `STUDENTS_ADMIN_API_KEY`, siguiendo el patrón exacto de
  `app/api/attendance/sessions/route.ts`: `authenticateServiceRequest` primero
  → `unauthorizedError` + 401 en JSON → lógica en un service layer →
  helpers de `lib/api/errors.ts` para el resto de códigos.
- Nuevo `lib/students/service.ts` (nombre alineado con
  `lib/attendance/service.ts`), que usa `createServiceSupabaseClient` y es el
  **único** lugar donde se tocan `auth.admin.*`, `profiles`, `students`,
  `user_roles` y `enrollments` con privilegios de admin. `lib/students/index.ts`
  (cliente con sesión, usado por la UI) no se modifica.
- Nuevo `mcp-servers/students-mcp/` replicando la estructura de
  `attendance-mcp` (`src/index.ts` con `Server` + `StdioServerTransport`,
  `src/api.ts` con el fetch y el header `x-api-key`, `src/tools.ts` con el
  array `Tool[]` y el `switch` de `processToolCall`).
- `middleware.ts` no requiere cambios: `/api` ya está en `PUBLIC_PREFIXES` y
  `/registro` también.

### Documentación

- `docs/mcps/README.md`: nueva fila para `students-mcp`.
- `docs/mcps/students-agent.system-prompt.md`: nuevo.
- `CLAUDE.md`: nueva fila en el inventario de MCPs, nueva fila en la tabla de
  configuración de Claude Desktop, y `STUDENTS_ADMIN_API_KEY` en la tabla de
  variables de entorno.
- `.env.example`: `STUDENTS_ADMIN_API_KEY`.
- `docs/specs/backlog.md`: rotación de `enrollment_code` y reintroducción de la
  verificación de correo cuando exista dominio/SMTP.

### Riesgos de seguridad (aceptados o mitigados, todos deben quedar explícitos)

1. **Se pierde la verificación de propiedad del correo.** Cualquiera puede
   registrarse con un correo inventado o ajeno. Consecuencias concretas:
   - Un tercero puede "quemar" el correo real de un estudiante registrándose
     antes que él; el estudiante legítimo quedará bloqueado (correo ya en uso)
     y dependerá del docente vía MCP para arreglarlo.
   - `resetPasswordForEmail` deja de ser una vía fiable de recuperación
     (correo no verificado + sin SMTP), así que el docente es el único canal de
     recuperación de cuentas hasta que haya dominio.
   - Los datos de contacto de `auth.users` dejan de ser confiables para
     comunicaciones futuras.
2. **El `enrollment_code` es el único gate y no es secreto.** Se dicta en voz
   alta a ~30 personas; se puede reenviar por WhatsApp a cualquiera. Y hoy no
   hay forma de rotarlo sin romper la validación de matrículas ya hechas.
   Mitigación mínima en este spec: rate limiting del registro por IP y
   respuesta genérica ante código inválido (sin distinguir "no existe" de
   "curso inactivo") para no facilitar el barrido. Mitigación real (rotación /
   expiración del código) → backlog.
3. **Enumeración de códigos y creación masiva de cuentas.** El endpoint de
   registro pasa a ser, de hecho, un validador de códigos accesible sin sesión.
   Sin rate limiting, permite fuerza bruta sobre el espacio de códigos y
   creación automatizada de usuarios. Esto no existía cuando la confirmación de
   correo frenaba las cuentas.
4. **El MCP de estudiantes es la superficie más privilegiada del proyecto.**
   Opera con `SUPABASE_SERVICE_ROLE_KEY`, bypasa RLS y puede crear, modificar y
   **eliminar** usuarios de `auth.users`. Un `delete_student` es destructivo:
   borra perfil, rol, matrículas y asistencia en cascada — **pero no entregas**
   (`submissions.enrollment_id` es `on delete restrict`, no cascade): si el
   estudiante ya entregó una evaluación real, la eliminación falla con `409`
   y no borra nada (hallazgo de la ronda manual, ver Fase 5/TC-MCP-027-005;
   la implementación original de este párrafo asumía cascada total, que no
   es el comportamiento real). Por eso:
   - API key propia (`STUDENTS_ADMIN_API_KEY`), nunca la compartida
     `QUESTION_BANK_API_KEY`.
   - El system prompt debe imponer guardrails explícitos: confirmar antes de
     cualquier borrado, nunca borrar en lote, nunca establecer ni resetear
     contraseñas sin instrucción explícita del docente en esa misma sesión,
     nunca imprimir contraseñas ni tokens, no volcar correos completos de todo
     un curso sin que se pidan.
   - Los borrados deben ser reportados en la respuesta de la API con lo que se
     eliminó, para que el agente pueda mostrárselo al docente.
5. **La API key de servicio viaja en el `claude_desktop_config.json` local del
   docente**, en claro. Es el modelo que ya usan los 3 MCPs existentes; se
   hereda, pero con clave separada el radio de daño de una filtración queda
   acotado por dominio.

## Evaluación MCP

**¿Aplica MCP?** Sí

- **MCP nuevo a crear:** `students-mcp` — cliente de la API `/api/students/*`
  para que un agente docente administre estudiantes y sus matrículas.
- **Por qué uno nuevo y no extender uno existente:**
  - `attendance-mcp` es de **solo lectura** y su dominio es asistencia. Meterle
    CRUD de usuarios rompería tanto su contrato como su system prompt, que
    afirma explícitamente que no tiene acceso a datos de usuarios más allá de
    asistencia.
  - `question-bank-mcp` y `assignment-mcp` son dominios de contenido y
    evaluación, sin relación con la identidad de los usuarios.
  - Sobre todo: es la única forma de **separar privilegios**. Un MCP aparte
    permite una API key propia, de modo que la clave que hoy usa el agente de
    preguntas no habilite borrar estudiantes.
- **Herramientas previstas:**
  | Herramienta | Tipo | Propósito |
  |---|---|---|
  | `list_students` | lectura | Lista estudiantes, con filtro opcional por `academic_course_id` y por texto (nombre/correo), paginada |
  | `get_student` | lectura | Detalle de un estudiante: perfil, datos académicos y sus matrículas |
  | `create_student` | escritura | Crea el usuario con correo y contraseña temporal, y opcionalmente lo matricula por `enrollment_code` o `academic_course_id` |
  | `update_student` | escritura | Corrige `full_name`, `email`, `career`, `semester` |
  | `delete_student` | destructiva | Elimina el usuario y sus datos en cascada |
  | `enroll_student` | escritura | Matricula a un estudiante existente en un curso |
  | `unenroll_student` | escritura | Retira una matrícula (`status = withdrawn`, coherente con `withdrawStudent`) |
- **System prompt afectado:** `docs/mcps/students-agent.system-prompt.md`
  (nuevo). A diferencia de `attendance-agent`, es un agente de **escritura con
  privilegios de admin**, así que su sección de restricciones es el elemento
  central del documento, no un apéndice.
- **Fase de MCP en este spec:** Fase 6 (la API de servicio que consume es la
  Fase 5).

## Fases de implementación

### Fase 1 — Configuración de Supabase y saneamiento del trigger

- [x] Confirmar con el usuario que va a desactivar **Confirm email** en el
      dashboard de Supabase del proyecto `academy-page` (Authentication →
      Providers → Email) y esperar a que lo haga; sin eso, nada de lo demás
      funciona. — Desactivado por el usuario el 2026-07-29.
- [ ] Verificar tras el cambio que `supabase.auth.signUp` devuelve `session`
      distinta de `null` (comprobación puntual contra el proyecto remoto). —
      Se verifica en Fase 7 con la ejecución de TC-027-002, para no crear
      cuentas de prueba sueltas antes de tiempo.
- [x] Verificar que `supabase/config.toml` mantiene `enable_confirmations =
      false` para que el archivo no contradiga al remoto. — Confirmado
      (líneas 226 y 261).
- [x] Crear la migración `20260729000002_harden_handle_new_user.sql` que hace
      que `handle_new_user` deje de silenciar el fallo de creación del rol
      `student` (sin SQL en este spec).
- [x] Ejecutar `supabase db push` **solo tras confirmación explícita del
      usuario** y verificar con `supabase migration list`. — Aplicada
      2026-07-29; `supabase migration list` confirma Local == Remote
      (`20260729000002`).

### Fase 2 — Registro unificado (registro + matrícula en un paso)

- [x] Añadir `enrollment_code` a `SignUpSchema` en `lib/auth/schemas.ts`, con
      normalización `trim().toUpperCase()` y mensaje de error en español.
- [x] Extraer en `lib/enrollments/index.ts` una función de matrícula que reciba
      el cliente Supabase y el `userId` de forma explícita, y reescribir
      `enrollByCode` como wrapper que la invoca con `getCurrentUser()`, sin
      cambiar el comportamiento de `/cuenta/cursos`. — Extraído como
      `insertEnrollment` (helper interno) y `enrollNewUserInCourse` (export
      usado por `signUp`); `enrollByCode` sin cambios de comportamiento.
- [x] Añadir en `lib/enrollments/index.ts` un resolvedor de curso por
      `enrollment_code` que use `createServiceSupabaseClient`, para validar el
      código **antes** de crear el usuario y sin exponer el RPC a `anon`. —
      `resolveCourseForRegistration`, con mensaje unificado para código
      inexistente/inactivo (adelanta parte de Fase 4).
- [x] Reescribir `signUp` en `lib/auth/actions.ts` con el orden: validar →
      resolver curso (código inexistente o curso inactivo ⇒ error genérico en
      el campo `enrollment_code`, sin crear usuario) → `signUp` sin
      `emailRedirectTo` → insertar matrícula con el mismo cliente →
      `revalidatePath` → `redirect("/cuenta/cursos")`.
- [x] Manejar el fallo parcial: si la matrícula falla tras crear el usuario, se
      registra en el log del servidor (`console.error` con `user_id` y
      `academic_course_id`) para que el docente pueda repararlo por MCP, y el
      flujo continúa igual hacia `/cuenta/cursos` (la cuenta y la sesión ya son
      válidas; el estudiante puede reintentar el mismo código ahí mismo). No se
      combina con un mensaje de error en la misma respuesta porque `redirect()`
      interrumpe la función — devolver un `AuthResult` de error habría
      cancelado la redirección pese a que la cuenta sí quedó creada.
      MCP. No dejar al estudiante en un estado ambiguo.
- [x] Añadir el fallback de rol/perfil. — **Historia real de este ítem**: se
      omitió primero tras análisis con el usuario ("el trigger endurecido de
      Fase 1 revierte toda la transacción si `user_roles` falla, no hay ya un
      escenario alcanzable de usuario sin rol"). **Ese análisis resultó
      incompleto**: la ronda manual (TC-027-003) encontró un caso real distinto
      — un correo que ya existía en `auth.users` **sin confirmar** (de antes
      de spec-027) hace que `signUp()` reactive esa fila con un `UPDATE`, no
      un `INSERT`, así que el trigger `AFTER INSERT` nunca corre. Se
      implementó `ensureStudentAccountBootstrap` (`lib/students/service.ts`,
      con cliente de servicio porque ninguna de las 3 tablas tiene policy de
      INSERT propia) e invocada en `signUp` tras confirmar `session`.
      Verificado reproduciendo la condición exacta y confirmando por API que
      `profiles`/`user_roles`/`students`/`enrollments` quedan creados.
- [x] Añadir el campo `enrollment_code` al array `fields` de
      `components/auth/SignUpForm.tsx`, con `autoComplete="off"`, placeholder y
      texto de ayuda ("Te lo entrega tu docente en clase"), respetando los
      tokens semánticos de `DESIGN.md`.
- [x] Actualizar el `subtitle` de `app/(auth)/registro/page.tsx` para reflejar
      que el registro también matricula al curso.

### Fase 3 — Retiro del flujo de confirmación por correo

- [x] Eliminar `app/(auth)/registro/confirmar/page.tsx`.
- [x] Eliminar `components/auth/ResendConfirmationForm.tsx`.
- [x] Eliminar la Server Action `resendConfirmation` de `lib/auth/actions.ts`.
- [x] Verificar con una búsqueda global que no queda ninguna referencia a
      `/registro/confirmar`, `resendConfirmation` ni `ResendConfirmationForm`.
- [x] **Eliminar** `app/auth/callback/route.ts` — tras revisión con el usuario:
      verificado que `requestPasswordReset` → `/recuperar-password/confirmar`
      usa `verifyOtp` directamente y no pasa por `/auth/callback`; sin
      `emailRedirectTo` en `signUp`, la ruta queda sin ningún llamador real.
      Quitada también la entrada `"/auth/callback"` de `PUBLIC_PREFIXES` en
      `middleware.ts`.
- [x] Anotar en `docs/specs/backlog.md` que la recuperación de contraseña por
      correo seguirá sin funcionar hasta que exista SMTP con dominio propio. —
      DEBT-011 (nuevo). También se registró DEBT-012 (rotación de
      `enrollment_code`, riesgo señalado en la sección "Riesgos de seguridad").

### Fase 4 — Mitigaciones de seguridad del registro abierto

- [x] Añadir rate limiting a la Server Action de registro (por IP y por
      `enrollment_code`), dimensionado para no bloquear a 30 estudiantes
      registrándose desde la misma red del aula. — `lib/auth/rate-limit.ts`,
      límite en memoria de 40 intentos/10min por clave (IP y código por
      separado). **Limitación conocida y documentada en el propio archivo**:
      en Vercel (serverless, múltiples instancias) el conteo no es global —
      es una mitigación mínima contra un barrido desde una sola instancia, no
      una defensa robusta distribuida. Suficiente para el riesgo de esta
      semana; no sustituye un rate limiter real (ej. Upstash) si el registro
      abierto se mantiene más tiempo.
- [x] Unificar la respuesta de error para "código no existe" y "curso inactivo"
      en un único mensaje genérico, para no dar señal de enumeración. —
      Resuelto en Fase 2 (`resolveCourseForRegistration`).
- [x] Verificar que el mensaje de error de correo ya registrado no permite
      enumerar cuentas existentes más de lo que ya lo hace hoy el login. —
      Verificado por código: `signUp` ya devuelve el mismo mensaje genérico
      ("No se pudo crear la cuenta. Intenta de nuevo.") para cualquier error
      de `supabase.auth.signUp`, incluido correo duplicado; no distingue
      causas, igual que `signIn` con "Correo o contraseña incorrectos."
- [x] Registrar en `docs/specs/backlog.md`: rotación/expiración de
      `enrollment_code`, y reintroducción de la verificación de correo cuando
      haya dominio y SMTP. — DEBT-011 y DEBT-012 (Fase 3).

### Fase 5 — API de servicio de administración de estudiantes

- [x] Generalizar `authenticateServiceRequest` en `lib/api/auth.ts` para
      recibir el nombre de la variable de entorno a validar, manteniendo
      `QUESTION_BANK_API_KEY` como valor por defecto y sin tocar los call
      sites existentes de `questions`, `assignments` y `attendance` (parámetro
      opcional con default, ningún call site tuvo que cambiar).
- [x] Añadir `STUDENTS_ADMIN_API_KEY` a `.env.example` y a la tabla de
      variables de entorno de `CLAUDE.md`; el usuario debe generar el valor
      real en `.env.local` y en Vercel (Claude no lo escribe).
- [x] Crear `lib/students/service.ts` sobre `createServiceSupabaseClient`, con
      las operaciones: listar (filtro por curso y búsqueda, paginado), obtener
      detalle con matrículas, crear usuario + perfil + matrícula opcional,
      actualizar perfil y datos académicos, eliminar usuario, matricular y
      retirar. `lib/students/index.ts` no se tocó.
- [x] Definir tipos de entrada/salida de la capa de servicio en
      `lib/students/types.ts`, sin `any`.
- [x] Crear `app/api/students/route.ts` (`GET` listar, `POST` crear).
- [x] Crear `app/api/students/[studentId]/route.ts` (`GET`, `PATCH`, `DELETE`).
- [x] Crear `app/api/students/[studentId]/enrollments/route.ts` (`GET`, `POST`
      matricular, `DELETE` retirar).
- [x] En todas las rutas: `authenticateServiceRequest` contra
      `STUDENTS_ADMIN_API_KEY` como primer paso, `401` con `unauthorizedError`
      al fallar, `runtime = 'nodejs'` y `dynamic = 'force-dynamic'`, y códigos
      de error vía `lib/api/errors.ts` (`validation_error` 422, `not_found`
      404, `conflict` 409, `internal_error` 500).
- [x] Validar todos los cuerpos con Zod y devolver `validationError` con
      `fieldErrors`, igual que las rutas de `questions`.
- [x] Garantizar que **ninguna respuesta incluye contraseñas, tokens ni
      `enrollment_code`** de los cursos. — `AdminStudentSummary`/`Detail` no
      incluyen esos campos por diseño; `create_student` recibe la contraseña
      como input obligatorio pero nunca la devuelve.
- [x] Hacer que la respuesta de `DELETE` detalle qué se eliminó para que el
      agente pueda reportarlo. — `DeleteStudentResult` incluye
      `enrollments_removed` (medido con `.select("id")` sobre el propio
      `delete`, no una cuenta previa — incluye matrículas `withdrawn`, que
      también se borran). `profiles`/`user_roles`/`students` sí son
      `on delete cascade` desde `auth.users` (spec-002); **`enrollments` y
      `submissions` NO lo son** (`on delete restrict`, spec-003/spec-018) —
      ver el hallazgo siguiente, encontrado en la ronda manual, no en
      revisión de código.
- [x] **Hallazgo de la ronda manual (TC-MCP-027-005), corregido en esta
      fase:** `enrollments.student_id` es `on delete restrict`, así que
      `deleteServiceStudent` fallaba con un error crudo de FK de Postgres
      (`23503`) para cualquier estudiante con al menos una matrícula — casi
      cualquier estudiante real, desde que este spec fusionó registro y
      matrícula — y el estudiante **no quedaba borrado** pese a que la API no
      lanzaba una excepción no controlada. Corregido: `deleteServiceStudent`
      ahora borra explícitamente las `enrollments` del estudiante en una sola
      sentencia antes de `auth.admin.deleteUser` (una sola sentencia: si
      `submissions.enrollment_id` — también `restrict` — bloquea el borrado
      por una entrega real, Postgres aborta la sentencia completa, no hay
      borrado parcial). Ese caso se traduce en un error 409 explícito
      ("tiene entregas registradas... usa unenroll_student"), distinguido en
      la ruta (`app/api/students/[studentId]/route.ts`) de un verdadero
      "no encontrado" (404). Verificado en vivo: creado un estudiante con 1
      matrícula sin entregas, reproducido el bug original, aplicado el fix,
      y confirmado `200` con `enrollments_removed: 1`, `404` en un GET
      posterior, y `400 invalid_credentials` al intentar iniciar sesión.
- [x] **Hallazgo no previsto, corregido dentro de esta fase (no es scope
      nuevo, era necesario para que este mismo código compilara):**
      `lib/auth/service.ts` tipaba `serviceClient` como
      `ReturnType<typeof createClient> | null`, lo que resuelve distinto que
      `SupabaseClient` para una función genérica y hacía que
      `.insert()`/`.update()` sobre el cliente de servicio tipara sus filas
      como `never`. No se había manifestado antes porque `attendance/service.ts`
      solo hace lecturas con casts explícitos que lo ocultan. Corregido a
      `SupabaseClient | null` (un solo tipo, sin cambio de comportamiento en
      runtime); verificado con `npx tsc --noEmit` limpio en todo el proyecto.

### Fase 6 — MCP: crear `students-mcp`

- [x] Crear `mcp-servers/students-mcp/` con `package.json`, `tsconfig.json` y
      `src/{index.ts,api.ts,tools.ts}`, replicando la estructura de
      `attendance-mcp` (`api.ts` adaptado del patrón de `question-bank-mcp`
      para soportar body JSON en escrituras, no solo query params).
- [x] En `src/index.ts`: servidor stdio con `validateEnv` exigiendo
      `API_BASE_URL` y `API_KEY`, handlers de `ListToolsRequestSchema` y
      `CallToolRequestSchema`, y manejo de error con `isError: true`.
- [x] En `src/api.ts`: cliente HTTP con header `x-api-key`, distinguiendo 4xx
      (mensaje de la API tal cual) de 5xx (API no disponible).
- [x] En `src/tools.ts`: definir `list_students`, `get_student`,
      `create_student`, `update_student`, `delete_student`, `enroll_student`,
      `unenroll_student`, con descripciones en español y `inputSchema` que
      marque los campos requeridos.
- [x] En la descripción de `delete_student`, dejar escrito que es una acción
      destructiva e irreversible que requiere confirmación previa del docente.
- [x] Compilar con `npm run build` y verificar que arranca por stdio. —
      `npm install` + `npm run build` sin errores; ejecución manual confirmó
      `✓ Students MCP iniciado. API: ...`.
- [x] Registrar `students-mcp` en `docs/mcps/README.md` (propósito, estado,
      system prompt, ruta del código).
- [x] Añadir `students-mcp` al inventario de MCPs de `CLAUDE.md` y a la tabla
      de configuración de Claude Desktop, con `STUDENTS_ADMIN_API_KEY`.
- [x] Crear `docs/mcps/students-agent.system-prompt.md` siguiendo la estructura
      mínima de `CLAUDE.md`, con una sección de restricciones que exija como
      mínimo: confirmar explícitamente antes de eliminar; nunca eliminar en
      lote; nunca crear ni resetear contraseñas sin instrucción explícita del
      docente en esa misma sesión; nunca imprimir contraseñas ni claves; no
      volcar correos de un curso completo salvo petición directa; no inventar
      UUIDs; reportar los errores de la API tal cual.
- [x] Verificar cada herramienta contra la API en desarrollo y anotar el
      resultado. — Ejecutado en la ronda manual (Fase 7):
      `TC-MCP-027-001..008` en `test-027`, las 7 herramientas + el rechazo de
      `QUESTION_BANK_API_KEY` + la regresión de los 3 MCPs existentes, todos
      ✅. Encontró y corrigió 2 bugs reales (bootstrap de cuenta y
      `delete_student`, ver Fase 2/Fase 5).

### Fase 7 — Verificación y cierre

- [x] Ejecutar `npm run lint` y `npm run build` sin errores. — `npm run build`
      limpio. `npm run lint` reporta 5 errores **preexistentes y ajenos a
      spec-027** (`components/admin/AcademicCourseList.tsx`, `<a>` en vez de
      `<Link>`); el usuario decidió no arreglarlos dentro de este spec —
      registrado como DEBT-013 en `docs/specs/backlog.md`.
- [x] Revisar que `SUPABASE_SERVICE_ROLE_KEY` no quedó importada en ningún
      archivo bajo `app/` (fuera de las rutas `api/`, que son server-only) ni
      bajo `components/`. — Confirmado, sin coincidencias.
- [x] Actualizar `docs/testing/test-027-…` con el resultado de cada caso. —
      18/18 casos ✅ Aprobado, resumen de la ronda completo, datos de prueba
      creados y eliminados verificados.
- [x] Invocar `@reviewer` antes de marcar el spec como `[DONE]`. — Primera
      ronda: **CAMBIOS REQUERIDOS**. Hallazgos y correcciones aplicadas:
      - 🔴 **Bloqueante real de seguridad**: `lib/api/auth.ts` llamaba a
        `timingSafeEqual` sin comprobar su valor de retorno (booleano) —
        **cualquier API key de la longitud correcta autenticaba cualquier
        ruta de servicio**, incluido el borrado de estudiantes. Corregido:
        ahora se compara con buffers rellenados a la misma longitud y se
        verifica el resultado explícitamente.
      - 🔴 `npm run lint` con errores preexistentes — ver arriba (DEBT-013).
      - 🟠 `getServiceStudentById` no usaba `students!inner`, así que
        `delete_student`/`update_student` podían operar sobre cualquier
        perfil (docente, admin), no solo estudiantes. Corregido.
      - 🟠 `signUp` no comprobaba `signUpData.session` antes de matricular;
        si "Confirm email" se reactivara en el dashboard, el fallo se
        degradaba en silencio. Corregido: ahora devuelve error explícito.
      - 🟠 Rate limit por código demasiado ajustado (40/10min, compartido por
        todo un salón incluyendo typos) y dependencia de `x-forwarded-for`
        (falsificable) sin documentar. Corregido: umbral por código subido a
        200, umbral por IP mantenido en 40, límites ahora parametrizables por
        llamada, comentario ampliado sobre la limitación de `x-forwarded-for`.
      - 🟠 `createServiceStudent` reportaba éxito aunque la matrícula
        automática fallara, y usaba `student!` (aserción no nula). Corregido:
        la respuesta incluye `enrollment_warning` cuando aplica; sin
        aserciones de tipos.
      - 🟠 La migración de Fase 1 envolvía los 3 inserts en un único
        `exception when unique_violation`, lo que revertía inserts ya
        exitosos ante un conflicto en una tabla distinta. Corregida con una
        migración nueva (`20260729000003_fix_handle_new_user_conflict_handling.sql`,
        ya aplicada al remoto): `on conflict do nothing` por sentencia.
      - 🟡 401 de `/api/students/*` filtraba si el motivo era clave inválida
        o variable de entorno faltante. Corregido: se distingue
        `AuthenticationError` (401) de error de configuración (500 vía
        `configurationError`).
      - 🟡 Regex de UUID (`[0-9a-f-]{36}`) aceptaba cualquier combinación de
        36 caracteres hex/guión, no un UUID real. Corregido con el patrón
        canónico.
      - 🟡 `updateServiceStudent` cambiaba el correo sin `email_confirm:
        true`; sin SMTP, un cambio de correo habría quedado pendiente de
        verificar de forma irrecuperable. Corregido.
      - 🟡 Cambios fuera de alcance detectados en el working tree
        (`components/navbar/Navbar.tsx`, `package.json`) — de sesiones
        anteriores no relacionadas con este spec; el usuario decidió
        commitearlos por separado (ver cierre de la sesión).
      - No se tocó: `meta.total` de paginación (coincide con el patrón ya
        existente en `/api/questions`), ni el colapso de errores no-4xx en
        `mcp-servers/*/src/api.ts` (heredado de los MCPs existentes).

      **Segunda ronda tras aplicar las 10 correcciones: ✅ APROBADO.**
      Verificó cada corrección contra el código (no solo la descripción),
      confirmó cero regresiones en `questions`/`assignments`/`attendance`, y
      encontró un último detalle menor: el 500 de configuración devolvía
      `err.message` (revelaba el nombre exacto de la variable de entorno
      faltante, ej. `"STUDENTS_ADMIN_API_KEY no configurada"`, a un llamador
      no autenticado). Corregido: las 8 rutas ahora responden un mensaje
      genérico ("Servicio mal configurado.") y registran el detalle solo en
      `console.error` del servidor. Build y typecheck limpios tras el ajuste.

      **Tercera ronda, sobre los hallazgos de la ronda manual (bootstrap de
      cuenta, fix de `delete_student`, retiro de recuperación de contraseña):
      CAMBIOS REQUERIDOS → aplicados.** Encontró: (1) dos ítems de fase
      documentados como pendientes pese a estar hechos (Fase 6/7, ya
      marcados arriba); (2) dos afirmaciones factualmente incorrectas sobre
      `delete_student` (decían "cascada total" cuando `enrollments` y
      `submissions` son `restrict`, ya corregidas arriba); (3)
      `ensureStudentAccountBootstrap` no era idempotente por tabla — un guard
      de lectura único sobre `profiles` no reparaba el caso de `profiles` OK
      pero `user_roles`/`students` faltantes. Corregido: las 3 tablas ahora
      usan `upsert(..., {ignoreDuplicates: true})` por separado, mismo patrón
      que la migración `20260729000003`; (4) `deleteServiceStudent` perdía el
      error real del `delete` de `enrollments` y siempre atribuía el fallo a
      "tiene entregas" — corregido: ahora se loguea el error real, solo el
      código `23503` (violación de FK) se traduce a ese mensaje (con los
      cursos involucrados), cualquier otro error da un mensaje genérico;
      `enrollments_removed` ahora se mide con `.select("id")` sobre el propio
      delete, no una cuenta previa; (5) la descripción de `delete_student` en
      `students-mcp` y el system prompt no mencionaban el caso 409 —
      corregido en ambos, MCP recompilado. Verificado con `tsc --noEmit` y
      `npm run lint` limpios (sin `npm run build`, para no corromper el
      `npm run dev` activo — ver Fase 7).

- [x] **Hallazgo adicional durante la preparación de la ronda manual (no
      detectado por `@reviewer`, encontrado probando `list_students` en vivo
      contra datos reales):** la cuenta docente/admin
      (`587ceede-6e6a-484a-a95d-4d62fcda79eb`, roles `teacher`+`admin`, sin
      rol `student`) **aparecía en `list_students`** y habría pasado el
      `students!inner` de `getServiceStudentById` — porque el trigger
      `handle_new_user` crea una fila en `students` para **cualquier** signUp,
      sin importar el rol, y esta cuenta pasó por ese flujo antes de que le
      asignaran los roles de docente/admin manualmente. En la práctica,
      `delete_student`/`update_student` podían apuntar a la propia cuenta del
      docente. Corregido con `fetchStudentRoleIds` (nueva función en
      `lib/students/service.ts`): filtra explícitamente contra
      `user_roles.role = 'student'` en `listServiceStudents` y
      `getServiceStudentById`, no solo la presencia de fila en `students`.
      Verificado contra la API real: la cuenta docente y una cuenta
      `teacher`-only (`docente-b@nodo.test`) desaparecieron de la respuesta de
      `GET /api/students` tras el fix.

## Criterios de aceptación

**Registro unificado**

1. En `/registro` el formulario muestra exactamente cinco campos: nombre
   completo, correo, contraseña, confirmación de contraseña y código del curso.
2. Con datos válidos y un `enrollment_code` de un curso activo, al enviar el
   formulario el estudiante queda autenticado y aterriza en `/cuenta/cursos`,
   sin pasar por ninguna pantalla de confirmación de correo.
3. Tras ese registro, el curso correspondiente aparece en la lista de cursos
   del estudiante en `/cuenta/cursos`, y existe una fila en `enrollments` con
   `student_id` igual al usuario nuevo y `status = 'active'`.
4. El código se acepta escrito en minúsculas y con espacios al principio o al
   final (se normaliza a mayúsculas sin espacios).
5. Con un código inexistente o de un curso inactivo, el formulario muestra un
   error genérico asociado al campo del código, **no se crea ningún usuario**
   en `auth.users`, y el mismo mensaje aparece en ambos casos.
6. Con un correo ya registrado, el formulario muestra un error y no se crea una
   segunda cuenta.
7. Navegar a `/registro/confirmar` y a `/auth/callback` no expone ninguna UI
   alcanzable en ninguno de los dos casos (un visitante anónimo recibe `307`
   hacia `/login` — el middleware ya no las trata como públicas y no hay
   sesión; un usuario ya autenticado vería `404`, el archivo de página no
   existe), y no queda ninguna referencia a esas rutas en el código.
8. **(Actualizado en vivo durante la ronda manual, ver "Incluye"):** el flujo
   de recuperación de contraseña se elimina por completo — `/recuperar-password`
   y `/recuperar-password/confirmar` no exponen UI alcanzable, y `LoginForm`
   no muestra ningún enlace de recuperación. La única vía de recuperación real
   es el docente (vía `students-mcp` → `update_student` con nuevo `email`, o
   recreando la cuenta).
9. Un estudiante ya registrado puede seguir matriculándose en un segundo curso
   desde `/cuenta/cursos` con `enrollment_code`, tal como antes.
10. Registrar 30 cuentas seguidas desde la misma red no es bloqueado por el
    rate limiting.

**API de servicio y MCP**

11. Toda ruta bajo `/api/students/*` responde `401` con el cuerpo de error
    estándar cuando falta el header `x-api-key` o su valor es incorrecto.
12. Una petición con la `QUESTION_BANK_API_KEY` válida **no** autoriza ninguna
    ruta de `/api/students/*`: solo `STUDENTS_ADMIN_API_KEY` lo hace.
13. Las rutas existentes de `/api/questions/*`, `/api/assignments/*` y
    `/api/attendance/*` siguen autenticándose con `QUESTION_BANK_API_KEY` tras
    la generalización de `authenticateServiceRequest`.
14. El agente puede invocar `list_students` con un `academic_course_id` y
    obtener la lista de estudiantes matriculados en ese curso, con nombre y
    correo, y sin ningún `enrollment_code`.
15. El agente puede invocar `create_student` con nombre, correo y código de
    curso, y el estudiante resultante puede iniciar sesión en `/login` y ve el
    curso en `/cuenta/cursos`.
16. El agente puede invocar `update_student` para corregir el nombre o el
    correo de un estudiante, y el cambio se refleja en la UI de la aplicación.
17. El agente puede invocar `delete_student` y, tras la operación, ese
    estudiante ya no aparece en `list_students` ni puede iniciar sesión; la
    respuesta detalla qué se eliminó.
18. `unenroll_student` deja la matrícula en `status = 'withdrawn'` en lugar de
    borrarla.
19. Ninguna respuesta de `/api/students/*` ni ninguna salida del MCP contiene
    contraseñas, tokens de sesión o `enrollment_code`.
20. `docs/mcps/README.md`, el inventario de MCPs de `CLAUDE.md` y
    `docs/mcps/students-agent.system-prompt.md` describen `students-mcp` con
    exactamente las herramientas implementadas.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al
> spec" en `CLAUDE.md`).

- **Manuales:** `docs/testing/test-027-registro-simplificado-y-mcp-estudiantes.md`
  — casos `TC-027-xxx` para los flujos con UI (registro con código válido,
  código inválido, código de curso inactivo, correo duplicado, aterrizaje en
  `/cuenta/cursos`, `/registro/confirmar` inexistente, matrícula desde
  `/cuenta/cursos` sin regresión, login del estudiante creado por el agente) y
  casos `TC-MCP-027-xxx` para las siete herramientas de `students-mcp`,
  incluyendo la verificación de que `QUESTION_BANK_API_KEY` no autoriza
  `/api/students/*`.
- **Automáticas (e2e/unit):** pendientes — el proyecto aún no tiene framework
  de testing definido (ver la sección "Testing" de `CLAUDE.md`). Los criterios
  de aceptación de este spec quedan como fuente para
  `e2e-027-registro-simplificado-y-mcp-estudiantes.spec.ts` cuando el framework
  exista.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-29
