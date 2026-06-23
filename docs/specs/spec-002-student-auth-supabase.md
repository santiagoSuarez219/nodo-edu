# spec-002 — [IN PROGRESS] Autenticación de usuarios con Supabase

## Contexto

El navbar expone un botón "Iniciar sesión" hacia `/login`, pero la ruta no existe (404). Todo el contenido es público y no hay ningún mecanismo de identidad: ni base de datos, ni cookies de sesión, ni middleware.

Este spec introduce la capa de autenticación completa sobre Supabase Auth, deja el schema de base de datos listo para los roles previstos (`admin`, `teacher`, `student`) y sienta las bases de funcionalidades futuras (progreso por estudiante, evaluaciones, panel admin).

---

## Alcance

### Incluye

- Proyecto Supabase configurado (Auth, Postgres, RLS).
- Schema de base de datos: `profiles`, `students`, `user_roles`, `lesson_progress`, función `has_role`, trigger `on_auth_user_created`. Migraciones SQL versionadas en `supabase/migrations/`.
- Clientes Supabase para cada contexto: Server Component, Server Action, middleware, browser.
- Helpers de sesión: `getSession`, `getCurrentUser`, `getCurrentProfile`, `requireUser`.
- Server Actions de auth: `signIn`, `signUp`, `signOut`, `requestPasswordReset`, `updatePassword`, `resendConfirmation`.
- Route Handler OAuth: `app/auth/callback/route.ts`.
- Middleware que refresca la cookie de sesión y protege `/cuenta`.
- UI de auth: `/login`, `/registro`, `/registro/confirmar`, `/recuperar-password`, `/recuperar-password/confirmar`.
- Página privada `/cuenta` con visualización y edición de perfil.
- Navbar consciente de sesión: botón "Iniciar sesión" sin sesión; `UserMenu` con dropdown al iniciar.
- `lib/progress/` con `getLessonProgress`, `getCourseProgress`, `markLessonViewed` implementadas sin UI.
- `.env.example` con todas las variables documentadas.

### No incluye

- UI de progreso del estudiante (la API existe, la marca visual es spec posterior).
- Rol `admin` con UI o middleware diferenciado (el enum lo incluye; la asignación es manual en SQL).
- Rol `teacher` operativo (reservado en el enum; su flujo es Fase 2 con Payload).
- Avatares con upload a Supabase Storage (`avatar_url` existe en schema, sin UI de subida).
- Rate-limit propio en Server Actions (Supabase ya lo aplica en auth).
- Tests automatizados E2E.
- Integración de identidad con Payload CMS (se evalúa en Fase 2).

---

## Impacto en el sistema

### Base de datos (Supabase Postgres)

Tablas nuevas con RLS habilitado:

- **`profiles`** — 1:1 con `auth.users`. Campos comunes a todos los roles: `full_name`, `avatar_url`, `last_seen_at`.
- **`students`** — 1:1 opcional con `profiles`. Atributos específicos del rol estudiante: `career`, `semester`.
- **`user_roles`** — N:M entre `auth.users` y el enum `app_role` (`'admin' | 'teacher' | 'student'`). Permite múltiples roles por usuario.
- **`lesson_progress`** — progreso por usuario y lección. PK compuesta `(user_id, course_slug, lesson_slug)`. Sin FK formal a lecciones (viven en TS por ahora).
- **Enum `app_role`** con valores `'admin'`, `'teacher'`, `'student'`.
- **Función `has_role(uid, role)`** `SECURITY DEFINER`, usada en políticas RLS.
- **Trigger `on_auth_user_created`** — crea automáticamente la fila en `profiles`, `user_roles` (rol `'student'`) y `students` para cada nuevo usuario.

### Nuevas rutas

| Ruta | Tipo | Acceso |
|---|---|---|
| `/login` | Server Component | Público |
| `/registro` | Server Component | Público |
| `/registro/confirmar` | Server Component | Público |
| `/recuperar-password` | Server Component | Público |
| `/recuperar-password/confirmar` | Server Component | Público |
| `/cuenta` | Server Component | Privado (requiere sesión) |
| `/auth/callback` | Route Handler GET | Público (OAuth) |

### Nuevos módulos en `lib/`

| Módulo | Responsabilidad |
|---|---|
| `lib/auth/server.ts` | `createServerSupabaseClient()` para Server Components y Server Actions |
| `lib/auth/middleware.ts` | `updateSupabaseSession(request)` para el middleware |
| `lib/auth/browser.ts` | `createBrowserSupabaseClient()` para Client Components puntuales |
| `lib/auth/session.ts` | `getSession`, `getCurrentUser`, `getCurrentProfile`, `requireUser` |
| `lib/auth/actions.ts` | Server Actions de auth |
| `lib/auth/schemas.ts` | Schemas Zod de validación |
| `lib/auth/types.ts` | `AuthResult<T>`, `AuthError` |
| `lib/students/types.ts` | `Profile`, `Student` |
| `lib/students/index.ts` | `getProfileByUserId`, `updateProfile`, `updateStudent`, `ensureProfile` |
| `lib/progress/types.ts` | `LessonProgress` |
| `lib/progress/index.ts` | `getLessonProgress`, `getCourseProgress`, `markLessonViewed` |

### Componentes nuevos o modificados

**Nuevos en `components/auth/`:**
`LoginForm`, `SignUpForm`, `PasswordResetRequestForm`, `PasswordResetConfirmForm`, `AuthShell`, `OAuthButtons` (opcional).

**Nuevos en `components/navbar/`:**
`UserMenu` — avatar + dropdown (cuenta, cerrar sesión).

**Nuevos en `components/account/`:**
`AccountInfoCard`, `AccountForm`.

**Modificados:**
- `app/layout.tsx` — llama `getCurrentProfile()` y pasa `profile` al navbar.
- `components/navbar/Navbar.tsx` — render condicional según sesión.

**Nuevo en raíz:**
`middleware.ts` — refresca cookie de sesión y protege `/cuenta`.

---

## Schema de base de datos

### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text not null`
- `avatar_url text`
- `last_seen_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `students`
- `profile_id uuid primary key references profiles(id) on delete cascade`
- `career text`
- `semester smallint check (semester between 1 and 20)`
- `enrolled_at timestamptz not null default now()`

### `user_roles`
- `user_id uuid references auth.users(id) on delete cascade`
- `role app_role not null`
- `assigned_at timestamptz not null default now()`
- PK `(user_id, role)`

### `lesson_progress`
- `user_id uuid references auth.users(id) on delete cascade`
- `course_slug text not null`
- `lesson_slug text not null`
- `viewed_at timestamptz not null default now()`
- `completed_at timestamptz`
- PK `(user_id, course_slug, lesson_slug)`
- Índice `(user_id, course_slug)`

### Políticas RLS

- **`profiles`**: `select` propio + admin. `update` propio. Sin `insert`/`delete` directos (trigger).
- **`students`**: mismas reglas que `profiles`.
- **`user_roles`**: `select` propio + admin. Sin `insert`/`update`/`delete` desde RLS pública — solo el trigger del signup asigna `'student'`; el rol `admin` se asigna manualmente con `service_role`.
- **`lesson_progress`**: `select`, `insert`, `update`, `delete` propios. `select` pleno para admin.

---

## Fases de implementación

### Fase A — Infraestructura Supabase y migraciones SQL

- [x] Crear proyecto Supabase (producción) — proyecto cloud creado y credenciales obtenidas.
- [x] Inicializar CLI local con `supabase init` + vincular con `supabase link --project-ref <ref>`.
- [x] Configurar Auth en el dashboard: email+password habilitado, confirmación de email activada, Site URL `http://localhost:3000` y redirect URLs configuradas.
- [x] Crear `supabase/migrations/20260623000000_init_profiles_students_roles.sql`: enum `app_role`, tablas `profiles`, `students`, `user_roles` con FKs e índices.
- [x] Crear `supabase/migrations/20260623000001_init_lesson_progress.sql`: tabla `lesson_progress` con PK compuesta e índices.
- [x] Crear `supabase/migrations/20260623000002_rls_policies.sql`: `enable row level security` en las 4 tablas + función `has_role` + todas las políticas.
- [x] Crear `supabase/migrations/20260623000003_triggers_and_functions.sql`: trigger `on_auth_user_created`.
- [x] Aplicar migraciones y verificar schema en Supabase Studio.
- [x] Documentar el orden de migraciones y el comando de reset en `supabase/README.md`.

**Verificación:** `supabase db reset` pasa sin errores. Las 4 tablas existen con RLS habilitado. El trigger crea filas en `profiles`, `user_roles` y `students` al registrar un usuario de prueba.

---

### Fase B — Variables de entorno y clientes Supabase

- [x] Crear `.env.example` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (marcada como `# SERVER-ONLY`).
- [x] Instalar `@supabase/supabase-js` y `@supabase/ssr`.
- [x] Instalar `react-hook-form`, `@hookform/resolvers`, `zod`.
- [x] Crear `lib/auth/server.ts`: `createServerSupabaseClient()` con `createServerClient` de `@supabase/ssr` + `cookies()` de Next.
- [x] Crear `lib/auth/middleware.ts`: `updateSupabaseSession(request)` que refresca la sesión y devuelve `NextResponse` con cookies actualizadas.
- [x] Crear `lib/auth/browser.ts`: `createBrowserSupabaseClient()`.
- [x] Crear `lib/auth/session.ts`: `getCurrentUser()`, `getCurrentProfile()`, `requireUser(redirectTo?)` memoizados con `cache()` de React.
- [x] Crear `lib/auth/types.ts` con `AuthResult<T>`.
- [x] Crear `lib/auth/schemas.ts` con Zod: `SignInSchema`, `SignUpSchema`, `PasswordResetRequestSchema`, `PasswordResetConfirmSchema`, `UpdateProfileSchema`.
- [x] Crear `lib/students/types.ts` con `Profile`, `Student` y `ProfileWithStudent`.
- [x] Crear `lib/students/index.ts` con `getProfileByUserId`, `getStudentByProfileId`, `getProfileWithStudent`, `updateProfile`, `updateStudent`, `ensureProfile`.

**Verificación:** `tsc --noEmit` pasa sin errores. Los clientes se instancian correctamente en un Server Component de prueba.

---

### Fase C — Middleware

- [x] Crear `middleware.ts` en la raíz: llama `updateSupabaseSession(request)` y devuelve la `NextResponse`.
- [x] Si `pathname.startsWith('/cuenta')` y la sesión es null, redirigir a `/login?redirectTo=<original>`.
- [x] Configurar `matcher` para excluir `_next/static`, `_next/image`, `favicon.ico` y assets estáticos.
- [ ] Verificar que `/`, `/[courseSlug]` y `/[courseSlug]/[lessonSlug]` siguen devolviendo 200 sin sesión.
- [ ] Verificar que `/cuenta` sin sesión redirige a `/login?redirectTo=/cuenta`.

**Verificación:** Los tres escenarios anteriores funcionan manualmente.

---

### Fase D — Server Actions de autenticación

- [x] Crear `lib/auth/actions.ts` con:
  - `signIn` — valida con Zod, `signInWithPassword`, en éxito `revalidatePath('/', 'layout')` + `redirect`.
  - `signUp` — `signUp` con `options.data = { full_name }` y `emailRedirectTo`. Redirige a `/registro/confirmar`.
  - `signOut` — `signOut`, `revalidatePath('/', 'layout')`, `redirect('/')`.
  - `requestPasswordReset` — `resetPasswordForEmail`. Mensaje genérico siempre.
  - `updatePassword` — `updateUser({ password })`. Requiere sesión activa.
  - `resendConfirmation` — `auth.resend({ type: 'signup', email })`.
- [x] Toda action devuelve `AuthResult<T>`: `{ ok: true } | { ok: false, error: string, fieldErrors? }`.
- [x] Mensajes de error en español, genéricos donde corresponda.

**Verificación:** Las actions se pueden invocar desde un formulario mínimo de prueba.

---

### Fase E — Route Handler OAuth

- [x] Crear `app/auth/callback/route.ts` (GET): lee `code` de `searchParams`, `exchangeCodeForSession(code)`, redirige a `searchParams.next ?? '/'`. Si falla, redirige a `/login?error=auth_callback_failed`.
- [ ] Validar el flujo completo una vez que las páginas de auth estén implementadas (Fase F).

---

### Fase F — UI de autenticación

- [x] Crear `components/auth/AuthShell.tsx` (server): card centrada, título, subtítulo, `{children}`. Tokens semánticos del sistema de diseño, modo claro/oscuro.
- [x] Crear `components/auth/LoginForm.tsx` (client): `useActionState` + Zod, inputs Tailwind/Flowbite, invoca `signIn`. Pinta `fieldErrors` y alert general de error. Botón con `aria-busy` durante pending. Soporta `redirectTo`.
- [x] Crear `app/(auth)/login/page.tsx` (server).
- [x] Crear `components/auth/SignUpForm.tsx` (client) con campos: `full_name`, `email`, `password`, `password_confirmation`. Invoca `signUp`.
- [x] Crear `app/(auth)/registro/page.tsx` (server).
- [x] Crear `app/(auth)/registro/confirmar/page.tsx` con instrucciones y `ResendConfirmationForm`.
- [x] Crear `components/auth/PasswordResetRequestForm.tsx` (client) y `app/(auth)/recuperar-password/page.tsx`.
- [x] Crear `components/auth/PasswordResetConfirmForm.tsx` (client) y `app/(auth)/recuperar-password/confirmar/page.tsx`. La página verifica `token_hash` + `type` server-side con `verifyOtp`; si falla, muestra "enlace inválido o expirado".
- [ ] (Opcional) Crear `components/auth/OAuthButtons.tsx` (client) con botón "Continuar con Google".

**Verificación:** Flujo completo de registro → confirmación → login → logout funciona end-to-end.

---

### Fase G — Navbar consciente de sesión

- [ ] Editar `app/layout.tsx`: llamar `getCurrentProfile()` y pasar `profile` a `<Navbar profile={profile} />`.
- [ ] Editar `components/navbar/Navbar.tsx`: aceptar `profile?: Profile`. Render condicional: sin perfil muestra "Iniciar sesión"; con perfil muestra `<UserMenu profile={profile} />`.
- [ ] Crear `components/navbar/UserMenu.tsx` (client): avatar con iniciales si no hay `avatar_url`, dropdown Flowbite con "Mi cuenta" → `/cuenta` y "Cerrar sesión" (form con Server Action `signOut`). `aria-haspopup="menu"`, `aria-expanded`, cierre con `Esc`.

**Verificación:** El navbar cambia correctamente entre estado sin sesión y con sesión.

---

### Fase H — Página privada `/cuenta`

- [ ] Crear `app/cuenta/page.tsx` (server): llama `requireUser()` y `getCurrentProfile()`. Monta `AccountInfoCard` + `AccountForm`.
- [ ] Crear `app/cuenta/layout.tsx` opcional con encabezado de cuenta.
- [ ] Crear `components/account/AccountInfoCard.tsx` (server): email, fecha de registro (solo lectura).
- [ ] Crear `components/account/AccountForm.tsx` (client): edita `full_name`, `career`, `semester`. Invoca Server Action `updateAccount` en `lib/students/actions.ts`. Valida con Zod.
- [ ] Crear `lib/students/actions.ts` con `updateAccountAction`: actualiza `profiles` y `students`. Devuelve `AuthResult`.
- [ ] Verificar que RLS rechaza updates sobre filas ajenas con dos cuentas distintas.

---

### Fase I — Frontera de progreso (sin UI)

- [ ] Crear `lib/progress/types.ts` con `LessonProgress`.
- [ ] Crear `lib/progress/index.ts` con:
  - `getLessonProgress(courseSlug, lessonSlug): Promise<LessonProgress | null>`
  - `getCourseProgress(courseSlug): Promise<LessonProgress[]>`
  - `markLessonViewed(courseSlug, lessonSlug)` — Server Action con `upsert` en `lesson_progress`.
- [ ] Verificar manualmente que `markLessonViewed` inserta y `getLessonProgress` devuelve el registro.

---

### Fase J — Pulido, accesibilidad y validación final

- [ ] Revisar todos los componentes nuevos contra los tokens semánticos de `DESIGN.md`. Eliminar valores crudos de paleta.
- [ ] Validar modo claro y oscuro en todas las rutas nuevas.
- [ ] Validar accesibilidad de `UserMenu`: navegación por teclado, foco-trap, `aria-live` en mensajes de error.
- [ ] Verificar que las rutas de specs 001 y 002 anteriores siguen generándose estáticamente (`next build`).
- [ ] Configurar variables de entorno en Vercel (Development, Preview, Production).
- [ ] Correr `npm run lint` y `tsc --noEmit` sin errores nuevos.
- [ ] Crear `docs/testing/test-002-student-auth-supabase.md` con los casos de prueba manuales.
- [ ] Cambiar el estado del spec a `[TESTING]`.

---

## Criterios de aceptación

- Las rutas `/login`, `/registro`, `/registro/confirmar`, `/recuperar-password`, `/recuperar-password/confirmar`, `/cuenta` y `/auth/callback` existen y funcionan.
- Un usuario puede registrarse con email/password, confirmar su email, iniciar sesión y ver su perfil en `/cuenta`. Puede cerrar sesión.
- El navbar muestra "Iniciar sesión" sin sesión y `UserMenu` con dropdown al iniciar.
- `/cuenta` sin sesión redirige a `/login?redirectTo=/cuenta`. Tras login, retorna a `/cuenta`.
- Las rutas públicas (`/`, `/<courseSlug>`, `/<courseSlug>/<lessonSlug>`) siguen accesibles sin sesión y devuelven 200.
- El middleware refresca cookies de sesión en cada request; la sesión sobrevive a recargas.
- Las tablas `profiles`, `students`, `user_roles`, `lesson_progress` existen con RLS habilitado y la función `has_role` está definida.
- El trigger `on_auth_user_created` crea automáticamente las filas en `profiles`, `user_roles` (rol `student`) y `students`.
- Un usuario no puede leer ni modificar el perfil ni el progreso de otro.
- Las migraciones están en `supabase/migrations/` y `supabase db reset` recrea el schema completo.
- `lib/progress/` tiene las tres funciones implementadas y operativas.
- Lint y typecheck pasan sin errores nuevos.
- Modo claro y oscuro consistentes con `DESIGN.md`.

---

## Pruebas e2e

1. **Registro y confirmación**: signup → email de confirmación → click en enlace → login automático → `/cuenta` accesible.
2. **Login y logout**: login con credenciales válidas → navbar muestra `UserMenu` → cerrar sesión → navbar muestra "Iniciar sesión".
3. **Protección de ruta**: sin sesión → acceder a `/cuenta` → redirige a `/login?redirectTo=/cuenta` → login → redirige a `/cuenta`.
4. **Recuperar contraseña**: solicitar reset → email → click en enlace → ingresar nueva contraseña → login con nueva contraseña exitoso.
5. **Rutas públicas intactas**: sin sesión → acceder a `/`, `/estructura-de-datos`, `/estructura-de-datos/git-github` → 200 en todos.
6. **Aislamiento entre usuarios**: dos cuentas registradas → cada una solo ve y edita su propio perfil.
7. **Progreso**: `markLessonViewed` guarda el registro → `getLessonProgress` lo devuelve → otro usuario no lo ve.
