# spec-045 — [TESTING] Redirigir `/login` a `/` cuando ya hay sesión iniciada

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Hoy `app/(auth)/login/page.tsx` (`LoginPage`) renderiza siempre el formulario
de inicio de sesión, sin comprobar si ya existe una sesión activa. Un usuario
autenticado que navega a `/login` (por ejemplo, un enlace viejo, una pestaña
duplicada, o el botón "atrás" del navegador) ve el formulario de login en vez
de ser llevado al contenido — una fricción de UX innecesaria, ya que Supabase
Auth ya tiene su sesión vigente en cookies (`lib/auth/server.ts` vía
`@supabase/ssr`).

`getCurrentUser()` (`lib/auth/session.ts`) ya resuelve el usuario actual desde
el servidor y se usa en el resto del proyecto para gates de acceso
(`requireUser`, `requireRole`). Este spec aplica el mismo patrón, a la
inversa, en la página de login.

## Alcance

**Incluye:**
- Si `getCurrentUser()` devuelve un usuario en `LoginPage`
  (`app/(auth)/login/page.tsx`), redirigir de inmediato a `/` con
  `redirect()` de `next/navigation`, sin renderizar el formulario.
- Un usuario sin sesión sigue viendo el formulario de login exactamente igual
  que hoy, incluido el manejo del parámetro `?error=auth_callback_failed`.

**No incluye:**
- Cambios en `/registro` (`app/(auth)/registro/page.tsx`): el usuario pidió
  explícitamente el comportamiento solo para `/login`. Si se quiere el mismo
  redirect ahí, es una ampliación a decidir aparte.
- Usar el parámetro `?redirectTo=` para decidir el destino del redirect: por
  instrucción explícita del usuario, el destino es siempre `/`, no
  `redirectTo`. `/` ya actúa como dashboard de retorno (spec-004, `[DONE]`),
  así que no se pierde contexto útil.
- Cualquier cambio en `middleware.ts` o en el flujo de `requireUser`/
  `requireRole`: este spec no toca el gate de rutas protegidas, solo el
  comportamiento de la página pública de login ante un usuario ya autenticado.
- Cambios en `LoginForm` ni en el flujo de autenticación en sí.

## Impacto en el sistema

| Archivo | Acción |
|---|---|
| `app/(auth)/login/page.tsx` | Modificar — comprobar `getCurrentUser()` y `redirect("/")` antes de renderizar el formulario |
| `docs/testing/test-045-redirect-login-autenticado.md` | Crear — casos manuales |
| Base de datos / RLS / migraciones | Sin cambios |
| MCPs | Sin cambios |

## Evaluación MCP

**¿Aplica MCP?** No. Es un ajuste de navegación en una página pública del
frontend; no expone datos ni acciones nuevas consultables/ejecutables por un
agente, y ningún MCP existente cubre navegación de UI.

## Fases de implementación

### Fase 1 — Redirect en `LoginPage`
- [x] En `app/(auth)/login/page.tsx`, importar `getCurrentUser` de
      `@/lib/auth/session` y `redirect` de `next/navigation`.
- [x] Al inicio del componente (antes de leer `searchParams` o renderizar
      `AuthShell`), llamar `await getCurrentUser()`; si devuelve un usuario,
      `redirect("/")` inmediatamente.
- [x] Verificar que el caso sin sesión no cambia: mismo render de
      `AuthShell` + `LoginForm` + manejo de `?error=auth_callback_failed`.
- [x] `npx tsc --noEmit`, `npx eslint "app/(auth)/login/page.tsx"` y
      `npm run build` verificados sin errores.

### Fase 2 — Pruebas
- [ ] Ejecutar los casos manuales de
      `docs/testing/test-045-redirect-login-autenticado.md`.
- [ ] Invocar `@reviewer` antes de marcar el spec como `[DONE]` (cambio
      pequeño; confirmar con el usuario si amerita revisión formal o basta
      con `npx tsc --noEmit` + `npm run lint` + `npm run build`).

## Criterios de aceptación

1. Un usuario con sesión activa que navega a `/login` es redirigido a `/` sin
   ver el formulario de login.
2. Un usuario sin sesión que navega a `/login` ve el formulario exactamente
   igual que hoy.
3. Un usuario sin sesión que navega a `/login?error=auth_callback_failed`
   sigue viendo el mensaje de error del enlace de confirmación inválido.
4. El redirect ignora `?redirectTo=`: siempre lleva a `/`, nunca a la ruta
   indicada en ese parámetro.
5. `/registro` no cambia de comportamiento en ningún caso.
6. `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan sin errores.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-045-redirect-login-autenticado.md` — casos
  `TC-001` a `TC-004`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-045-redirect-login-autenticado.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio (cuando
  exista framework).

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-08
