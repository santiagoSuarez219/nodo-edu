# Análisis Técnico: Autenticación de Estudiantes con Supabase

## Problema

El navbar ya expone un botón "Iniciar sesión" hacia `/login`, pero la ruta no existe (404). Hoy todo el contenido es público y no hay ningún mecanismo de identidad: ni base de datos, ni cookies de sesión, ni middleware. Para preparar el terreno de funcionalidades futuras (progreso por estudiante, evaluaciones, formularios, dashboard, panel admin), se requiere introducir **autenticación de estudiantes** con Supabase, dejando además los cimientos de:

1. **Identidad persistente**: registro y login con email/password (más opcionalmente OAuth Google), sesión vía cookies seguras compatibles con Server Components, Server Actions y Edge.
2. **Modelo de "estudiante" en la base de datos**: fila propia ligada 1:1 a `auth.users` con campos para futuras métricas (carrera, semestre, fecha de registro, último acceso).
3. **UI mínima**: páginas `/login`, `/registro`, `/recuperar-password`, `/cuenta` y un menú de usuario en el navbar que cambia según sesión.
4. **Middleware sin bloquear contenido público**: refresca la sesión y la expone a Server Components; sólo protege rutas privadas (`/cuenta` y futuras `/admin`, `/dashboard`).
5. **Gancho de progreso**: tabla `lesson_progress` con FK a usuario y a lección + RLS, **sin UI**, lista para que un spec posterior empiece a marcar lecciones como vistas.

Restricciones de la fase actual:

- Stack vigente: Next 16.2.4 + React 19 + Tailwind 4 + TypeScript. No hay Supabase, ni `@supabase/ssr`, ni middleware.
- El contenido público (specs 00 y 01) NO debe romperse: home del curso y página de lección siguen accesibles sin sesión.
- Sólo se materializan los roles **estudiante** y **visitante**. El rol **admin / docente principal** se contempla en el schema (no se quema "estudiante" en la base) pero su flujo queda fuera de alcance.
- El docente colaborador (Payload) sigue siendo Fase 2.
- No queremos magic-link como único método: el docente quiere registro tradicional para simplificar el onboarding desde clase.
- Despliegue futuro: Vercel (variables de entorno y edge runtime importantes).

Restricciones a futuro:

- En Fase 2, Payload CMS 3 se embeberá en este mismo Next.js. Payload tendrá su propia tabla de usuarios para autoría editorial; **no debe colisionar** con `auth.users` de Supabase. Decisión documentada abajo.
- En Fase 3 entran evaluaciones, formularios, videos y notebooks; el modelo de progreso se expandirá (`lesson_progress` → quizzes, notebooks, etc.). El schema de hoy debe ser ampliable sin migraciones destructivas.

---

## Impacto Arquitectural

### Frontend público

- **Sin cambios estructurales** en specs 00 y 01: home del curso y página de lección siguen siendo Server Components públicos. Lo único que se inyecta opcionalmente es el `user` para el navbar.
- **Navbar pasa a leer sesión**: `components/navbar/Navbar.tsx` se convierte (o se envuelve) para recibir el `user` desde el layout raíz (Server Component) y renderizar condicionalmente el botón "Iniciar sesión" o un `UserMenu` con avatar + dropdown (cuenta, cerrar sesión).
- **Nuevas rutas públicas no autenticadas** (`/login`, `/registro`, `/recuperar-password`, `/recuperar-password/confirmar`): páginas server con formularios client-side dispuestos sobre Server Actions.
- **Nuevas rutas privadas** (`/cuenta`): protegidas por middleware; redirigen a `/login?redirectTo=/cuenta` si no hay sesión.
- **Callback OAuth**: si se habilita Google, se añade `app/auth/callback/route.ts` (Route Handler) que intercambia el `code` por sesión.

### Capa de dominio

- Aparece un nuevo módulo `lib/auth/` paralelo a `lib/courses/`, con responsabilidades:
  - Crear clientes Supabase específicos para cada contexto (Server Component, Server Action, Route Handler, middleware, browser).
  - Helpers de sesión (`getCurrentUser`, `getCurrentProfile`, `requireUser`).
  - Server Actions de auth (`signIn`, `signUp`, `signOut`, `requestPasswordReset`, `updatePassword`).
  - Schemas Zod de validación.
- Aparece `lib/students/` (o `lib/profiles/`) con el contrato de dominio `Profile` y funciones de acceso (`getProfileByUserId`, `updateProfile`). Es paralelo a `lib/courses/` y respeta la misma frontera (ningún componente importa el cliente Supabase directamente).
- Aparece `lib/progress/` con el contrato `LessonProgress` y stubs de funciones (`getLessonProgress`, `markLessonViewed`) que **se implementan pero no se usan en UI todavía**. Esto deja la frontera lista.

### Middleware

- Se introduce `middleware.ts` en la raíz del proyecto con dos responsabilidades:
  1. **Refrescar la cookie de sesión** en cada request (patrón oficial de `@supabase/ssr`). Crítico: sin esto, los Server Components ven sesiones caducadas.
  2. **Proteger rutas privadas** (`/cuenta`, futuras `/admin`, `/dashboard`) con redirect a `/login`. Las rutas públicas pasan sin tocar.
- `matcher` excluye assets estáticos y `_next/`, y se asegura de no interferir con las rutas de `(cursos)`.

### Base de datos

Esquema nuevo en Postgres (Supabase), con migraciones SQL versionadas en repo:

- Tabla `profiles` (1:1 con `auth.users`): perfil base común a TODOS los usuarios (admin, docentes, estudiantes). Campos compartidos.
- Tabla `students` (1:1 opcional con `profiles`): atributos específicos de estudiante (carrera, semestre). Sólo existe fila si el `profile.role = 'student'`.
- Tabla `user_roles` (n:m entre `auth.users` y un enum `app_role`): permite múltiples roles por usuario (un docente puede ser también estudiante) y deja la puerta abierta sin migraciones disruptivas.
- Tabla `lesson_progress`: progreso por usuario y lección. FK a `auth.users(id)`. Sin FK formal a `lessons` (todavía no existe esa tabla; las lecciones viven en TS). El "id de lección" se almacena como `course_slug` + `lesson_slug` (string), validado por `CHECK`. Cuando Payload modele `lessons` en Postgres (Fase 2), se añadirá una FK opcional sin romper datos.
- Trigger `on_auth_user_created` que inserta automáticamente la fila en `profiles` y, según metadata, en `students`. Reduce el riesgo de "usuario sin perfil".
- Función `has_role(uid, role)` `SECURITY DEFINER` para usar en políticas RLS de forma reutilizable.
- RLS habilitado en TODAS las tablas. Políticas por defecto restrictivas; se otorgan permisos explícitos.

### Auth / Storage

- Proyecto Supabase nuevo. Se configura:
  - Email + password habilitado.
  - OAuth Google habilitado (opcional desde el inicio si no añade fricción de configuración).
  - **Email confirmation activada** (ver decisión más abajo).
  - Site URL y redirect URLs apuntando al dominio de producción y a `localhost:3000`.
- Storage: no se usa todavía (no hay avatares en este spec). Se documenta como follow-up.

### Variables de entorno y deploy

- `.env.local` (no commit) y Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL` — pública.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — pública (se expone al cliente).
  - `SUPABASE_SERVICE_ROLE_KEY` — privada, **sólo server**, sólo para tareas administrativas (migraciones, jobs, no para handlers de request).
  - `NEXT_PUBLIC_SITE_URL` — base usada en redirects de OAuth y password recovery.
- Plantilla en `.env.example` commiteada para onboarding.

---

## Decisiones Abiertas y Recomendación

### 1. Cliente Supabase: `@supabase/ssr` vs. NextAuth/Auth.js con adaptador Supabase

| Aspecto | `@supabase/ssr` (oficial) | NextAuth/Auth.js + Supabase Adapter |
|---|---|---|
| Modelo de sesión | Cookies de Supabase Auth (`sb-<project>-auth-token`), refresco automático en middleware | Cookies de NextAuth, Supabase queda como base de datos de usuarios |
| Compatibilidad con RLS | Total: el JWT que firma Supabase es el que llega a Postgres y `auth.uid()` funciona en políticas RLS | Parcial: NextAuth firma su propio JWT; para que RLS funcione hay que generar tokens compatibles o usar service role (rompe el modelo) |
| App Router + Server Components + Server Actions | Soporte oficial primario | Soporte presente pero pensado originalmente para Pages Router |
| OAuth providers | Configurados en el dashboard Supabase | Configurados en el config de Auth.js |
| Curva con Payload (Fase 2) | Payload tiene su propia tabla de usuarios; podemos mantenerlas separadas o integrarlas con un identity provider común | NextAuth ya gestionaría esa abstracción, pero a costa de duplicar el modelo de identidad respecto a Supabase |
| Riesgo | Bajo: paquete oficial mantenido por Supabase | Medio: depende del adaptador comunitario |

**Recomendación: `@supabase/ssr`**.

- Es la opción que **deja RLS operativo end-to-end** sin acrobacias. Como en Fase 2 y 3 todo el modelo de permisos vivirá en Postgres (progreso, evaluaciones, contenido editorial), perder RLS de Supabase es un costo que no compensa.
- Está pensada nativamente para App Router con Server Components y Server Actions; el patrón `createServerClient` + middleware refresh es el canónico.
- NextAuth aporta más cuando se quieren integrar varios IdPs heterogéneos. No es nuestro caso: identidad sale de Supabase.
- Si en el futuro hace falta una capa de identidad común con Payload, se puede introducir Auth.js encima manteniendo Supabase como almacén; pero invertir el orden ahora cierra la puerta de RLS.

### 2. Server Actions vs. Route Handlers para `signIn`/`signUp`/`signOut`

| Aspecto | Server Actions | Route Handlers (`app/api/...`) |
|---|---|---|
| Idiomatic en App Router | Sí, primer ciudadano | Sí pero más verboso para forms |
| Progressive enhancement | Funciona con JS deshabilitado (form action) | Requiere handler manual |
| CSRF | Next 16 firma automáticamente las Server Actions; protección integrada contra cross-origin | Hay que añadir un token o validar Origin manualmente |
| Revalidación de cache | `revalidatePath` / `revalidateTag` directos | Mismo, pero hay que llamarlos desde el handler |
| OAuth callback | No: el provider hace GET con `?code=...` → debe ser un Route Handler | Sí, encaja naturalmente |

**Recomendación: Server Actions para `signIn`, `signUp`, `signOut`, `requestPasswordReset`, `updatePassword`. Route Handler sólo para el callback OAuth (`app/auth/callback/route.ts`)**.

- Server Actions son más simples, ya tienen CSRF y se integran bien con `react-hook-form` + Zod (action como `onSubmit` final).
- El callback OAuth es un GET de un proveedor externo: por definición no es un form submit, y debe ser un Route Handler.
- Para password recovery, el link del email lleva a `/recuperar-password/confirmar?token_hash=...&type=recovery`; esa página recoge el `token_hash` server-side y lo intercambia con `verifyOtp`. Esto se puede hacer en una Server Action invocada desde la página, no requiere Route Handler.

### 3. Esquema: `profiles` 1:1 con `auth.users` vs. `students` directamente

**Recomendación: `profiles` 1:1 con `auth.users` + `students` 1:1 opcional con `profiles`**.

```
auth.users  (gestionado por Supabase)
   │
   │ 1:1
   ▼
profiles    (id = auth.users.id, full_name, avatar_url, last_seen_at, created_at, ...)
   │
   │ 1:1 opcional
   ▼
students    (profile_id PK/FK, career, semester, enrolled_at)
```

Razones:

- `profiles` contiene lo común a TODOS los usuarios (nombre, avatar, último acceso). Es donde el navbar lee el `display_name` independientemente del rol.
- `students` contiene lo específico del rol estudiante (carrera, semestre). Cuando llegue `teachers` no se ensucia `profiles` con campos opcionales por rol.
- El alternativo "tabla `students` directa" funcionaría hoy (sólo hay un rol concreto), pero el día que aparezca un docente que también quiere ver progreso como estudiante, romperíamos el modelo.
- Trigger `on_auth_user_created` crea la fila en `profiles` automáticamente; la fila en `students` se crea sólo si el flujo de signup público marca `role = 'student'` (que es el caso por defecto en este spec).

### 4. Roles: columna `role` con CHECK vs. tabla `user_roles` n:m

**Recomendación: tabla `user_roles` n:m desde el inicio**, con un enum `app_role` (`'admin' | 'teacher' | 'student'`).

Razones:

- Hoy hay 2 roles concretos pero a medio plazo serán 4+ (admin, docente principal, docente colaborador, estudiante). Una columna única `role` fuerza a elegir uno y dificulta superposición ("docente que también es estudiante de otra cosa").
- La función auxiliar `has_role(uid uuid, role app_role) returns boolean` se usa en políticas RLS de forma uniforme y se mantiene legible.
- Migrar de "columna única" a n:m a posteriori es una migración invasiva con backfill; arrancar n:m de una vez es trivial.
- Para el caso 90% (un usuario con un solo rol) la sobrecarga es despreciable: una fila por usuario en `user_roles`.

### 5. Confirmación de email

**Recomendación: activada desde Fase 1**, con UX cuidada.

- Pros: previene cuentas con emails falsos, reduce ruido en la base, exigible para emails universitarios, y necesario antes de Fase 3 (envío de notificaciones).
- Contras: añade un paso al onboarding.
- Mitigación de fricción: tras el signup, redirigir a una página `/registro/confirmar` con instrucciones claras ("Te enviamos un correo a X, revísalo"), botón "reenviar email" (rate-limited), y permitir login también con cuentas no confirmadas pero con un banner persistente "confirma tu correo" hasta que lo hagan. Bloquear sólo acciones sensibles futuras (envío de evaluaciones).
- En desarrollo, se puede desactivar la confirmación localmente para iterar rápido. La política se documenta.

### 6. Manejo de sesión en Server Components

**Recomendación: helper centralizado en `lib/auth/session.ts`** con dos funciones:

- `getSession()` → cachea la lectura de sesión por request usando `cache()` de React (`react`). Cualquier Server Component que la llame múltiples veces paga sólo una llamada a Supabase.
- `getCurrentUser()` → wrapper sobre `getSession()` que devuelve `user | null`.
- `getCurrentProfile()` → cruza con `profiles` (también memoizado por request).
- `requireUser()` → llama `getCurrentUser()` y dispara `redirect('/login')` si null. Para usar en páginas privadas.

Esto evita el patrón "fetch del usuario en cada componente" porque la memoización por request hace transparente el coste, y centraliza la frontera con Supabase. El navbar lo llama una vez; si una página privada lo vuelve a llamar, no hay round-trip extra.

### 7. Migraciones SQL: en repo (Supabase CLI) vs. dashboard

**Recomendación: en repo, vía Supabase CLI**, en `supabase/migrations/`.

Razones:

- Coherente con la cultura Git-first del proyecto (contenido en MDX, capa de dominio en TS, todo versionado).
- Reproducible: cualquier dev puede levantar una réplica local con `supabase start` y `supabase db reset`.
- Code review de schema cambia el juego: los PRs muestran exactamente qué tablas, columnas y políticas se tocan.
- Pipeline futuro: en Vercel se puede correr `supabase db push` con un GitHub Action cuando se mergea a `main`.
- El dashboard se reserva para configuración no-SQL (providers OAuth, branding de emails, plantillas).

Estructura propuesta:

```
supabase/
  config.toml
  migrations/
    20260430000000_init_profiles_students_roles.sql
    20260430000001_init_lesson_progress.sql
    20260430000002_rls_policies.sql
    20260430000003_triggers_and_functions.sql
  seed.sql                    # opcional, datos de dev
```

### 8. Cómo evolucionar al añadir el rol docente (admin)

- El enum `app_role` ya incluye `'admin'` y `'teacher'` desde el inicio.
- El middleware NO codifica "estudiante o nada"; codifica "rutas con prefijo `/admin/*` requieren `has_role(user, 'admin')`", "rutas `/dashboard/*` requieren cualquier sesión", etc. Hoy esto se traduce a un único caso (`/cuenta` → cualquier sesión), pero el patrón está listo.
- La asignación del rol `admin` se hace **manualmente en SQL** la primera vez (un `INSERT INTO user_roles (user_id, role) VALUES (...)` ejecutado por el docente principal contra su propio `auth.users.id`). Documentado.
- El signup público SIEMPRE crea fila en `user_roles` con `'student'`. No se permite escalar privilegios desde el formulario. Forzado por RLS sobre `user_roles`.

### 9. Tabla `lesson_progress` ahora vs. después

**Recomendación: ahora**, sin UI.

- El esfuerzo marginal es bajo (una migración) y deja la frontera lista. El siguiente spec sólo añade Server Actions y UI.
- Permite probar las políticas RLS con un caso de uso real (`select` y `upsert` por usuario propio) antes de que aparezcan más tablas y se complique el debugging.
- `lib/progress/` queda como carpeta vacía-funcional con la firma `markLessonViewed(courseSlug, lessonSlug)` y `getLessonProgress(courseSlug, lessonSlug)` ya implementadas. Útil para validación E2E.
- Forma:
  - `user_id uuid` FK `auth.users(id) on delete cascade`.
  - `course_slug text not null`.
  - `lesson_slug text not null`.
  - `viewed_at timestamptz not null default now()`.
  - `completed_at timestamptz null` (preparado para Fase 3, cuando "ver" y "completar" sean distintos).
  - PK compuesta `(user_id, course_slug, lesson_slug)`.
  - Índices: `(user_id)`, `(user_id, course_slug)`.

### 10. Variables de entorno: claves públicas vs. privadas

- **Públicas** (`NEXT_PUBLIC_*`, expuestas al cliente):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key: por diseño es pública; las protecciones reales son las políticas RLS)
  - `NEXT_PUBLIC_SITE_URL`
- **Privadas** (sólo server):
  - `SUPABASE_SERVICE_ROLE_KEY` — bypassa RLS. **Jamás** debe llegar al cliente, ni a Server Actions normales. Reservada para scripts de migración o futuros jobs admin.
- En Vercel se configuran en "Project Settings → Environment Variables", separadas por entorno (Development, Preview, Production).
- En `.env.example` se listan todas con valores vacíos y comentarios.

### 11. Validación, rate-limit y seguridad transversal

- **Validación**: todas las Server Actions usan **Zod** desde el primer día. Errores se devuelven como `{ ok: false, errors: { field: [..] } }` y se renderizan en el form vía `react-hook-form`.
- **Rate-limit**: Supabase ya rate-limita login/signup/recovery a nivel de proyecto. No se introduce middleware de rate-limit propio en Fase 1; se documenta como follow-up el día que aparezca un endpoint custom (envío de evaluaciones, etc.).
- **CSRF**: Server Actions de Next 16 incluyen protección por defecto (validación de origen). No se añade nada extra.
- **Cookies**: `httpOnly`, `secure` en producción, `sameSite=lax`. Lo gestiona `@supabase/ssr` siguiendo defaults seguros; se verifica.
- **Email enumeration**: el flujo de "recuperar contraseña" siempre devuelve el mismo mensaje exista o no el email, para no filtrar cuentas. Supabase ya lo hace por defecto.

### 12. Coexistencia con Payload (Fase 2)

- Payload trae su propia tabla de usuarios para autoría editorial. **Decisión**: mantenerlas separadas. Los docentes que escriben en Payload tendrán cuenta en Payload; los estudiantes y los visitantes pasan por Supabase Auth. La integración fina (un único login para todos) se evalúa cuando llegue Fase 2.
- El `profiles.role = 'teacher'` de Supabase no está atado a Payload; sirve para diferenciar permisos del frontend público (acceso a vistas privadas), no para escribir contenido.

---

## Propuesta de Solución

### Modelo de dominio (resumen conceptual)

- **Profile**: `id` (= `auth.users.id`), `fullName`, `avatarUrl?`, `lastSeenAt`, `createdAt`. Compartido por todos los roles.
- **Student**: `profileId` (PK/FK), `career?`, `semester?`, `enrolledAt`.
- **UserRole**: `userId`, `role` (`'admin' | 'teacher' | 'student'`).
- **LessonProgress**: `userId`, `courseSlug`, `lessonSlug`, `viewedAt`, `completedAt?`.

### Estructura de carpetas final

```
app/
  (auth)/                              # grupo de rutas (no añade segmento)
    login/
      page.tsx                         # Server Component, monta <LoginForm/>
    registro/
      page.tsx
      confirmar/
        page.tsx                       # "te enviamos un correo"
    recuperar-password/
      page.tsx                         # form de solicitud
      confirmar/
        page.tsx                       # form de nueva contraseña tras click en email
  cuenta/
    page.tsx                           # ruta privada (Profile básico)
    layout.tsx                         # opcional: encabezado de cuenta
  auth/
    callback/
      route.ts                         # Route Handler para OAuth y verifyOtp
middleware.ts                          # NUEVO: refresh sesión + protección de rutas privadas
lib/
  auth/
    server.ts                          # createServerClient (Server Components, Server Actions)
    middleware.ts                      # createMiddlewareClient (sólo middleware)
    browser.ts                         # createBrowserClient (sólo Client Components puntuales)
    session.ts                         # getSession, getCurrentUser, getCurrentProfile, requireUser
    actions.ts                         # signIn, signUp, signOut, requestPasswordReset, updatePassword
    schemas.ts                         # Zod: SignInSchema, SignUpSchema, ...
    types.ts                           # AuthError, AuthResult<T>
  students/
    types.ts                           # Profile, Student
    index.ts                           # getProfileByUserId, updateProfile, ...
  progress/
    types.ts                           # LessonProgress
    index.ts                           # getLessonProgress, markLessonViewed (sin UI todavía)
components/
  navbar/
    Navbar.tsx                         # editado: recibe user, render condicional
    UserMenu.tsx                       # NUEVO (client): avatar + dropdown
  auth/
    LoginForm.tsx                      # NUEVO (client): RHF + Zod + Server Action
    SignUpForm.tsx                     # NUEVO (client)
    PasswordResetRequestForm.tsx       # NUEVO (client)
    PasswordResetConfirmForm.tsx       # NUEVO (client)
    OAuthButtons.tsx                   # NUEVO (client, opcional)
    AuthShell.tsx                      # NUEVO (server): layout común login/registro/recuperar
  account/
    AccountInfoCard.tsx                # NUEVO (server): muestra datos del profile
    AccountForm.tsx                    # NUEVO (client): editar full_name, carrera, semestre
supabase/
  config.toml
  migrations/
    20260430000000_init_profiles_students_roles.sql
    20260430000001_init_lesson_progress.sql
    20260430000002_rls_policies.sql
    20260430000003_triggers_and_functions.sql
.env.example                           # NUEVO
```

### Esquema SQL (resumen conceptual)

- **Enum** `app_role` con valores `'admin'`, `'teacher'`, `'student'`.
- **Tabla `profiles`**:
  - `id uuid primary key references auth.users(id) on delete cascade`
  - `full_name text not null`
  - `avatar_url text`
  - `last_seen_at timestamptz`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- **Tabla `students`**:
  - `profile_id uuid primary key references profiles(id) on delete cascade`
  - `career text`
  - `semester smallint check (semester between 1 and 20)`
  - `enrolled_at timestamptz not null default now()`
- **Tabla `user_roles`**:
  - `user_id uuid references auth.users(id) on delete cascade`
  - `role app_role not null`
  - `assigned_at timestamptz not null default now()`
  - PK `(user_id, role)`
- **Tabla `lesson_progress`**:
  - `user_id uuid references auth.users(id) on delete cascade`
  - `course_slug text not null`
  - `lesson_slug text not null`
  - `viewed_at timestamptz not null default now()`
  - `completed_at timestamptz`
  - PK `(user_id, course_slug, lesson_slug)`
  - Índice `(user_id, course_slug)`
- **Función `public.has_role(uid uuid, role_name app_role) returns boolean`** `security definer`, `set search_path = public`. Devuelve `exists (select 1 from user_roles where user_id = uid and role = role_name)`.
- **Trigger `on_auth_user_created`**: `after insert on auth.users` → inserta `(id, full_name=coalesce(raw_user_meta_data->>'full_name', email))` en `profiles`, y si `raw_user_meta_data->>'role' = 'student'` (o sin metadata, caso default) inserta también en `students` y en `user_roles (user_id, 'student')`.
- **RLS**:
  - `profiles`: `select` propio + `select` por cualquiera con `has_role(uid, 'admin')`. `update` propio (`id = auth.uid()`). Sin `insert`/`delete` directos (los maneja el trigger / cascade).
  - `students`: mismas reglas que `profiles`.
  - `user_roles`: `select` propio + admin. **Sin `insert`/`update`/`delete` desde RLS pública** — se manipula sólo vía `service_role` o por el trigger del signup que sólo asigna `'student'`.
  - `lesson_progress`: `select`, `insert`, `update` propio (`user_id = auth.uid()`). `delete` propio. Admin tiene `select` pleno para futuros dashboards.

### Render de las páginas

- `/login` (Server Component) → `AuthShell` + `LoginForm` (client). El form usa `react-hook-form` + Zod resolver y, en submit, invoca la Server Action `signIn`. En éxito: `redirect(searchParams.redirectTo ?? '/')`. En error: muestra mensaje genérico ("Credenciales inválidas") sin filtrar si fue email o password.
- `/registro` (Server Component) → `AuthShell` + `SignUpForm`. Submit → Server Action `signUp` → `redirect('/registro/confirmar')`.
- `/registro/confirmar` (Server Component) → mensaje informativo + botón "reenviar email" (Server Action propia con rate-limit del lado Supabase).
- `/recuperar-password` (Server Component) → `PasswordResetRequestForm`. Submit → Server Action `requestPasswordReset` → mensaje genérico "si el email existe, te enviamos instrucciones".
- `/recuperar-password/confirmar` (Server Component) → lee `token_hash` y `type` de `searchParams`, llama `verifyOtp` server-side, renderiza `PasswordResetConfirmForm` (nueva contraseña + confirmación).
- `/cuenta` (Server Component, ruta privada) → `requireUser()` + `getCurrentProfile()` → `AccountInfoCard` + `AccountForm`. El form actualiza `profiles` y `students` vía Server Action.
- `app/auth/callback/route.ts` (Route Handler GET) → recibe `?code=...` de OAuth, intercambia con `exchangeCodeForSession`, redirige a `/`.

### Estilos

- Tokens semánticos exclusivamente, según tabla claro/oscuro de `CLAUDE.md`.
- Forms montados con Flowbite (Input, Label, Button, Alert) + react-hook-form + Zod resolver.
- `AuthShell` centra el form en una card `bg-white dark:bg-gray-800` con borde sutil; logo + título + subtítulo con tipografía heredada (JetBrains Mono).
- `UserMenu` usa Flowbite Dropdown con avatar (placeholder con iniciales si no hay `avatar_url`).
- Sin emojis en UI ni en mensajes.

### Accesibilidad

- Forms con labels asociados (`<label for>` o composición con Flowbite que ya cumple).
- Mensajes de error en `aria-live="polite"` y asociados al input vía `aria-describedby`.
- Botones de submit con `aria-busy` durante el pending state (`useFormStatus`).
- `UserMenu` con `aria-haspopup`, `aria-expanded`, foco-trap en el dropdown abierto y cierre con `Esc`.
- Páginas de auth con `<h1>` claro y único.

---

## Plan de Implementación por Fases

### Fase A — Infraestructura Supabase y migraciones SQL

**Objetivo**: tener el proyecto Supabase creado, migraciones versionadas en repo y la base de datos con el schema completo, sin tocar código de Next todavía.

1. Crear proyecto Supabase nuevo (entorno producción) y proyecto local con `supabase init` + `supabase start`.
2. Configurar Auth en el dashboard:
   - Email + password habilitado, email confirmation **activada**.
   - OAuth Google habilitado (opcional pero recomendado).
   - Site URL = `NEXT_PUBLIC_SITE_URL`. Redirect URLs: `<site>/auth/callback`, `<site>/recuperar-password/confirmar`, `http://localhost:3000/auth/callback`, `http://localhost:3000/recuperar-password/confirmar`.
   - Personalizar plantillas de email (asunto y cuerpo en español, sin emojis).
3. Crear `supabase/migrations/20260430000000_init_profiles_students_roles.sql`: enum `app_role`, tablas `profiles`, `students`, `user_roles` con FKs e índices.
4. Crear `supabase/migrations/20260430000001_init_lesson_progress.sql`: tabla `lesson_progress` con PK compuesta e índices.
5. Crear `supabase/migrations/20260430000002_rls_policies.sql`: `enable row level security` en las 4 tablas + función `has_role` + políticas detalladas en la sección "Esquema SQL".
6. Crear `supabase/migrations/20260430000003_triggers_and_functions.sql`: trigger `on_auth_user_created` que crea fila en `profiles`, en `user_roles` (rol `'student'`) y, si aplica, en `students`.
7. Aplicar migraciones localmente (`supabase db reset`) y a producción (`supabase db push`) cuando estén validadas. Documentar el comando en el README.
8. Ejecutar manualmente el `INSERT` en `user_roles` para asignar el rol `'admin'` al docente principal una vez se cree su cuenta. Documentado en `supabase/seed.sql` o en un `README.md` del directorio `supabase/`.

**Archivos creados**: `supabase/config.toml`, 4 migraciones SQL, `supabase/seed.sql` (opcional).
**Archivos editados**: ninguno.

### Fase B — Variables de entorno y clientes Supabase

**Objetivo**: dejar listos los clientes Supabase para cada contexto (server, browser, middleware) y los helpers de sesión, sin UI ni rutas todavía.

1. Crear `.env.example` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Documentar en `README.md` cómo poblar `.env.local`.
2. Instalar dependencias: `@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `@hookform/resolvers`, `zod`.
3. Crear `lib/auth/server.ts`: `createServerSupabaseClient()` que invoca `createServerClient` de `@supabase/ssr` con `cookies()` de Next. Apto para Server Components y Server Actions.
4. Crear `lib/auth/middleware.ts`: `updateSupabaseSession(request)` que crea el cliente de middleware, refresca la sesión y devuelve la `NextResponse` con cookies actualizadas.
5. Crear `lib/auth/browser.ts`: `createBrowserSupabaseClient()` para los pocos casos client-side (callback OAuth en cliente si fuese necesario; en este spec no se usa, queda como utilidad).
6. Crear `lib/auth/session.ts`: `getSession()` (memoizado con `cache()` de React), `getCurrentUser()`, `getCurrentProfile()`, `requireUser(redirectTo?)`. `requireUser` redirige a `/login?redirectTo=<path>` si no hay sesión.
7. Crear `lib/auth/types.ts` y `lib/auth/schemas.ts` (Zod) con `SignInSchema`, `SignUpSchema`, `PasswordResetRequestSchema`, `PasswordResetConfirmSchema`, `UpdateProfileSchema`.
8. Crear `lib/students/types.ts` y `lib/students/index.ts` con `getProfileByUserId`, `getStudentByProfileId`, `updateProfile`, `updateStudent`. Cada función crea su propio cliente server (no recibe el cliente como argumento desde fuera).

**Archivos creados**: `.env.example`, archivos en `lib/auth/` y `lib/students/`.
**Archivos editados**: `package.json`, `package-lock.json`, `README.md` (sección de setup).

### Fase C — Middleware

**Objetivo**: refrescar sesión en cada request y proteger rutas privadas, sin romper el contenido público.

1. Crear `middleware.ts` en la raíz del proyecto. Llama a `updateSupabaseSession(request)` y devuelve la `NextResponse` resultante.
2. Después del refresh, si `request.nextUrl.pathname` empieza por `/cuenta` (o, en el futuro, `/dashboard`, `/admin`) y la sesión es null, devolver `NextResponse.redirect('/login?redirectTo=<original>')`.
3. Configurar el `matcher` para excluir `_next/static`, `_next/image`, `favicon.ico`, archivos estáticos comunes y `app/auth/callback`. Mantener el resto de rutas (incluyendo `(cursos)`) dentro del matcher para que el refresco de cookies funcione globalmente.
4. Validar manualmente:
   - `/`, `/<courseSlug>`, `/<courseSlug>/<lessonSlug>` siguen funcionando sin sesión.
   - `/cuenta` sin sesión → redirige a `/login?redirectTo=/cuenta`.
   - Las cookies se refrescan tras login (sesión sobrevive a recargas).

**Archivos creados**: `middleware.ts`.
**Archivos editados**: ninguno.

### Fase D — Server Actions de autenticación

**Objetivo**: dejar implementadas todas las acciones server-side antes de montar UI.

1. Crear `lib/auth/actions.ts` con:
   - `signIn(formData)`: parse Zod, llama `signInWithPassword`, en éxito `revalidatePath('/', 'layout')` + `redirect(redirectTo ?? '/')`.
   - `signUp(formData)`: parse Zod, llama `signUp` con `options.data = { full_name }` y `options.emailRedirectTo = <site>/auth/callback`. En éxito redirige a `/registro/confirmar`.
   - `signOut()`: llama `signOut`, `revalidatePath('/', 'layout')`, `redirect('/')`.
   - `requestPasswordReset(formData)`: `resetPasswordForEmail` con `redirectTo = <site>/recuperar-password/confirmar`. Devuelve mensaje genérico.
   - `updatePassword(formData)`: requiere sesión activa (la página `/recuperar-password/confirmar` la obtiene via `verifyOtp` previo); llama `updateUser({ password })`.
   - `resendConfirmation(formData)`: `auth.resend({ type: 'signup', email })`.
2. Toda función devuelve un tipo `AuthResult<T> = { ok: true, data: T } | { ok: false, error: string, fieldErrors?: Record<string, string[]> }` para que el cliente pinte errores.
3. Validación con Zod en el primer paso de cada action; errores → `{ ok: false, fieldErrors }`.
4. Mensajes de error siempre en español, genéricos donde aplique (login, password reset).

**Archivos creados**: `lib/auth/actions.ts`.
**Archivos editados**: ninguno.

### Fase E — Route Handler de callback OAuth

**Objetivo**: cerrar el flujo de Google (si se habilita) y servir como punto único para `verifyOtp` en flujos donde lo necesitemos.

1. Crear `app/auth/callback/route.ts` (GET). Lee `code` de `searchParams`. Si existe, llama `exchangeCodeForSession(code)` con el cliente server, redirige a `searchParams.next ?? '/'`. Si falla, redirige a `/login?error=oauth`.
2. Validar manualmente con Google.

**Archivos creados**: `app/auth/callback/route.ts`.
**Archivos editados**: ninguno.

### Fase F — UI de auth (login, registro, recuperar contraseña)

**Objetivo**: páginas y formularios funcionales.

1. Crear el grupo `app/(auth)/` con un `layout.tsx` opcional que monta `AuthShell` (server) común.
2. Crear `components/auth/AuthShell.tsx` (server): card centrada con título, subtítulo y `{children}`. Usa tokens del sistema.
3. Crear `components/auth/LoginForm.tsx` (`"use client"`): RHF + Zod resolver, inputs Flowbite, submit invoca la Server Action `signIn`. Pinta `fieldErrors` y un alert general si `error`. Soporta `redirectTo` desde `searchParams`. Botón con `aria-busy` durante pending.
4. Crear `app/(auth)/login/page.tsx` (server): renderiza `<AuthShell title="Iniciar sesión"><LoginForm/></AuthShell>`. Lee `searchParams.redirectTo`.
5. Crear `components/auth/SignUpForm.tsx` y `app/(auth)/registro/page.tsx` con campos: `full_name`, `email`, `password`, `password_confirmation`, opcional `career`, `semester`. La metadata adicional (`career`, `semester`) se persiste en `students` después del signup en una segunda Server Action o vía trigger que lea `raw_user_meta_data` (decisión: hacerlo en una segunda action explícita después de la confirmación de email, para evitar guardar datos huérfanos si nunca confirman).
6. Crear `app/(auth)/registro/confirmar/page.tsx` con instrucciones y botón "reenviar email" (form mínimo con email).
7. Crear `components/auth/PasswordResetRequestForm.tsx` y `app/(auth)/recuperar-password/page.tsx`.
8. Crear `components/auth/PasswordResetConfirmForm.tsx` y `app/(auth)/recuperar-password/confirmar/page.tsx`. La página, en server, intenta `verifyOtp({ token_hash, type: 'recovery' })` antes de renderizar el form; si falla, muestra mensaje "enlace inválido o expirado".
9. Crear `components/auth/OAuthButtons.tsx` (`"use client"`) con un botón "Continuar con Google" que llama `signInWithOAuth({ provider: 'google', options: { redirectTo: <site>/auth/callback } })`. Se inserta en `LoginForm` y `SignUpForm` si la feature está habilitada.

**Archivos creados**: 4 páginas en `app/(auth)/`, 5 componentes en `components/auth/`.
**Archivos editados**: ninguno.

### Fase G — Navbar consciente de sesión y UserMenu

**Objetivo**: el botón "Iniciar sesión" sólo aparece sin sesión; con sesión se ve un `UserMenu`.

1. Editar `app/layout.tsx`: en el render del navbar, llamar `getCurrentProfile()` (server) y pasarlo como prop a `<Navbar profile={profile} />`. Si null, el navbar muestra el botón "Iniciar sesión" → `/login`.
2. Editar `components/navbar/Navbar.tsx`: aceptar `profile?: Profile`. Render condicional: si null, el link existente; si presente, `<UserMenu profile={profile} />`.
3. Crear `components/navbar/UserMenu.tsx` (`"use client"`): avatar (iniciales si no hay URL), dropdown Flowbite con: nombre, email, link "Mi cuenta" → `/cuenta`, separador, "Cerrar sesión" (form que invoca la Server Action `signOut`). Accesibilidad: `aria-haspopup="menu"`, foco-trap, cierre con `Esc`.
4. Validar paridad claro/oscuro con la tabla de `CLAUDE.md`.

**Archivos creados**: `components/navbar/UserMenu.tsx`.
**Archivos editados**: `app/layout.tsx`, `components/navbar/Navbar.tsx`.

### Fase H — Página privada `/cuenta`

**Objetivo**: el primer caso real de ruta protegida y de edición de perfil.

1. Crear `app/cuenta/page.tsx` (Server Component): llama `requireUser()` y `getCurrentProfile()`. Compone `AccountInfoCard` (datos básicos read-only: email, fecha de registro) + `AccountForm` (full_name, career, semester).
2. Crear `app/cuenta/layout.tsx` (opcional): encabezado consistente.
3. Crear `components/account/AccountInfoCard.tsx` (server) y `components/account/AccountForm.tsx` (`"use client"`). El form invoca una Server Action `updateAccount` que valida con Zod, actualiza `profiles` y `students` en una transacción (RPC propia o dos updates seguidos: `update profiles ...; update students ...`).
4. Validar: cambios persisten, RLS rechaza updates sobre filas ajenas (probar con dos cuentas distintas), `last_seen_at` se actualiza al login (via trigger de auth o vía Server Action al cargar `/cuenta`).

**Archivos creados**: `app/cuenta/page.tsx`, opcional `layout.tsx`, 2 componentes en `components/account/`, posible Server Action en `lib/students/actions.ts` o en `lib/auth/actions.ts`.
**Archivos editados**: posiblemente migración SQL adicional si se decide que `last_seen_at` se actualice por trigger en login (más limpio que via action).

### Fase I — Frontera de progreso (sin UI)

**Objetivo**: dejar `lib/progress/` lista para que un spec posterior monte UI sobre ella.

1. Crear `lib/progress/types.ts` con `LessonProgress`.
2. Crear `lib/progress/index.ts` con:
   - `getLessonProgress(courseSlug, lessonSlug): Promise<LessonProgress | null>`. Crea cliente server, lee de `lesson_progress` filtrando por `auth.uid()` (RLS lo restringe). Devuelve null si no hay sesión o no hay registro.
   - `getCourseProgress(courseSlug): Promise<LessonProgress[]>`.
   - `markLessonViewed(courseSlug, lessonSlug)` Server Action: `upsert` en `lesson_progress` con `viewed_at = now()`. RLS asegura que sólo afecta al usuario actual.
3. Probar manualmente con una página descartable (no commit) o con un test E2E que invoque `markLessonViewed` y verifique con `getLessonProgress`.
4. Documentar en un comentario en `lib/progress/index.ts` que estas funciones aún no se invocan desde la UI; la integración con la página de lección es spec posterior.

**Archivos creados**: archivos en `lib/progress/`.
**Archivos editados**: ninguno.

### Fase J — Pulido, accesibilidad y validación

**Objetivo**: paridad visual, accesibilidad y robustez antes de cerrar el spec.

1. Revisar todos los componentes nuevos contra la tabla claro/oscuro de `CLAUDE.md`. Reemplazar valores crudos por tokens.
2. Validar foco, teclado y ARIA en `UserMenu` (apertura/cierre, navegación por teclado, foco-trap).
3. Validar mensajes de error en español, sin filtración de información (login, recuperar contraseña).
4. Validar SSG: las rutas de specs 00 y 01 deben seguir generándose estáticamente. El middleware no debe romper SSG (no introduce dynamic rendering para rutas no protegidas).
5. Validar end-to-end:
   - Signup → email de confirmación → click → login automático → `/cuenta` accesible.
   - Logout → `/cuenta` redirige a `/login`.
   - Recuperar contraseña → email → cambio → login con nueva.
   - Login con OAuth Google (si habilitado) → callback → home.
   - Visitante (sin sesión): `/`, `/<courseSlug>`, `/<courseSlug>/<lessonSlug>` accesibles.
6. Lint + typecheck (`npm run lint`, `tsc --noEmit`).
7. Configurar variables de entorno en Vercel (Production y Preview). Deploy de prueba a una rama feature, validar que cookies funcionan en HTTPS.

**Archivos creados**: ninguno.
**Archivos editados**: los componentes que necesiten ajuste.

---

## Criterios de Aceptación

- Las páginas `/login`, `/registro`, `/registro/confirmar`, `/recuperar-password`, `/recuperar-password/confirmar`, `/cuenta` y el callback `/auth/callback` existen y funcionan.
- Un visitante puede registrarse con email/password, recibir email de confirmación, iniciar sesión y ver su perfil en `/cuenta`. Puede cerrar sesión.
- Si OAuth Google está habilitado, un usuario puede registrarse/iniciar sesión con Google y aterrizar en la home.
- El navbar muestra "Iniciar sesión" sin sesión y `UserMenu` con avatar + dropdown cuando hay sesión.
- `/cuenta` sin sesión redirige a `/login?redirectTo=/cuenta`. Tras login, retorna a `/cuenta`.
- Las rutas públicas (`/`, `/<courseSlug>`, `/<courseSlug>/<lessonSlug>`) siguen siendo accesibles sin sesión y devolviendo 200.
- El middleware refresca cookies de sesión en cada request relevante; la sesión sobrevive a recargas.
- En Postgres existen las tablas `profiles`, `students`, `user_roles`, `lesson_progress` con RLS habilitado y políticas activas. La función `has_role` está definida.
- El trigger `on_auth_user_created` crea automáticamente las filas en `profiles`, `user_roles` (rol `student`) y `students` para nuevos usuarios.
- Un usuario no puede leer ni modificar el perfil ni el progreso de otro (validable con dos cuentas y consultas directas a Supabase con la anon key + cookies).
- Las migraciones SQL están versionadas en `supabase/migrations/` y `supabase db reset` recrea el schema desde cero.
- Variables de entorno configuradas en Vercel (Development, Preview, Production) con la separación pública/privada documentada.
- `lib/progress/` tiene `getLessonProgress`, `getCourseProgress`, `markLessonViewed` implementadas y operativas (sin UI todavía).
- Modo claro y oscuro consistentes con la tabla de `CLAUDE.md`. Sin colores crudos.
- Lint y typecheck pasan sin warnings nuevos.

## Riesgos y Mitigaciones

- **Riesgo**: el middleware de Supabase introduce dynamic rendering en rutas que estaban en SSG (specs 00 y 01). **Mitigación**: el `matcher` se ajusta para incluir el refresh global, pero la lectura de sesión en Server Components sigue siendo opcional; las páginas de curso y lección no llaman `getCurrentUser` (no convierten a dynamic). Sólo el navbar lo hace, y vive en el layout raíz, que ya es dynamic en presencia de cookies. Validar con `next build` que las páginas de curso y lección siguen generándose estáticamente.
- **Riesgo**: `SUPABASE_SERVICE_ROLE_KEY` se filtra al cliente por accidente. **Mitigación**: nunca importar esa variable en archivos en `app/` o `components/`. Centralizar su uso en `lib/auth/admin.ts` (no creado en este spec; se documenta para el futuro). En `.env.example` está marcada con un comentario `# SERVER-ONLY — never expose`.
- **Riesgo**: el trigger `on_auth_user_created` falla y deja un `auth.users` huérfano. **Mitigación**: el trigger captura excepciones y deja un log; la primera vez que el usuario llama a `getCurrentProfile()` y no hay perfil, se crea on-demand (función `ensureProfile()` defensiva en `lib/students/index.ts`).
- **Riesgo**: el flujo de password recovery se rompe si la `Site URL` no está bien configurada. **Mitigación**: documentado en el README y validado en QA antes del primer deploy a producción.
- **Riesgo**: futuro: añadir el rol `admin` requiere refactor del middleware. **Mitigación**: el middleware ya está escrito en términos de "matchers de rutas → predicado de rol". Hoy sólo se usa el predicado "hay sesión"; añadir "tiene rol admin" es una rama más, no un rediseño.
- **Riesgo**: confirmación de email añade fricción y abandono en clase. **Mitigación**: en sesión presencial, el docente puede preconfirmar manualmente desde el dashboard Supabase, o desactivar temporalmente la confirmación durante una clase de onboarding. Documentado.
- **Riesgo**: la decisión de mantener `lesson_progress.lesson_slug` como string (sin FK) provoca progresos huérfanos cuando se renombra una lección. **Mitigación**: hoy las lecciones viven en TS y el control del rename lo tiene el docente. Cuando Payload tome el control (Fase 2), se añade FK opcional a `lessons` y un script de migración.

## Fuera de Alcance

- Rol `admin` operativo: el enum incluye `admin` y la asignación se hace manualmente, pero **no hay UI ni middleware diferenciados** para admin todavía. Anotado como follow-up.
- Rol `teacher` (docente colaborador): Fase 2 con Payload. Aquí sólo está reservado en el enum.
- Avatares con upload a Supabase Storage. `avatar_url` existe en el schema pero la UI no permite subirlo aún.
- UI de progreso del estudiante: la tabla y la API existen, pero no hay marca visual en la página de lección ni dashboard de estudiante. Spec posterior.
- Evaluaciones, formularios, videos, notebooks: Fase 3.
- Integración de identidad con Payload (single sign-on entre Supabase y Payload): se evalúa en Fase 2.
- Magic-link como método principal: descartado para esta fase. Disponible en Supabase si se decide ofrecerlo más adelante.
- Rate-limit propio en Server Actions: depende del rate-limit nativo de Supabase. Follow-up.
- Tests automatizados (E2E con Playwright): recomendado pero no parte del spec.
- Internacionalización: contenido sólo en español.
