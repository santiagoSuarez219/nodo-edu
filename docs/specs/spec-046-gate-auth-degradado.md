# spec-046 — [TESTING] Gate de autenticación honesto ante una caída de Supabase Auth

> Volvió brevemente a `[IN PROGRESS]` tras la ronda de pruebas manuales
> (`docs/testing/test-046-gate-auth-degradado.md`, 2026-08-13): TC-046-003 y
> TC-046-004 fallaron — un visitante sin sesión con Auth caído recibía
> `/login` en vez del 503 esperado (viola la decisión D4, fail-closed). Causa
> raíz: `supabase.auth.getUser()` no hace red cuando no hay cookie, así que
> el middleware nunca detectaba `unavailable` para ese caso. Corregido en
> `lib/auth/middleware.ts` (ping a `/auth/v1/health` en esa rama específica)
> y verificado en una segunda ronda — los 16 casos manuales están ahora en
> ✅. Vuelve a `[TESTING]` pendiente de revisión de código antes de `[DONE]`.
> Ver el resumen de la ronda en el archivo de test para el detalle completo.

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Este spec cierra **[[DEBT-042]]** (prioridad Alta), nacida de `TC-037-004` de
`docs/testing/test-037-manejo-de-errores.md` (2026-08-01): con el túnel SSH a
`mirp-lab` cortado, **una simple recarga de página expulsaba a `/login` a
cualquier usuario, de cualquier rol, en cualquier ruta**. Y como `/login`
también necesita Supabase Auth, nadie podía volver a entrar hasta que el
servicio se restaurara.

### La causa: el error nunca se descarta, se ignora

`lib/auth/middleware.ts:28-30`:

```ts
const {
  data: { user },
} = await supabase.auth.getUser();
```

Se destructura `data.user` y **se tira `error`**. `middleware.ts:18` convierte
ese `user: null` en `redirect("/login")`, y el `matcher` (`middleware.ts:52-54`)
cubre todo el sitio salvo estáticos.

> ⚠️ **Matiz al diagnóstico del backlog.** DEBT-042 dice que `getUser()` se
> llama *"sin ningún `try/catch`"* y que *"el SDK la atrapa internamente"*.
> Lo segundo es exacto y más útil de lo que el backlog aprovecha:
> `GoTrueClient._getUser()`
> (`node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:2608-2646`)
> atrapa todo `AuthError` y lo devuelve como `{ data: { user: null }, error }`,
> re-lanzando solo lo que **no** es `AuthError`. Es decir: **la información
> para distinguir los dos casos ya está en el valor de retorno**. El bug es la
> destructuración, no la ausencia de `try/catch`. Este sigue siendo necesario,
> pero solo para el caso residual (excepción no-`AuthError`) y para el fallo de
> construcción del cliente (ver Fase 2).

El SDK ya separa infraestructura de negocio; el comentario de
`node_modules/@supabase/auth-js/dist/module/lib/fetch.js:20-21` lo dice literal:
*"These are infrastructure errors and should not cause session invalidation"*.
Somos nosotros quienes fusionamos ambos casos en `null`.

### La segunda capa: arreglar solo el middleware no cambia nada

`lib/auth/session.ts:8-14` repite el mismo antipatrón en `getCurrentUser`, y
`requireUser` (43-50), `requireRole` (52-65) y `requireAnyRole` (67-79)
redirigen a `/login` o `/` sobre ese `user: null`. El barrido de consumidores:

| Helper | Archivos | Llamadas |
|---|---|---|
| `requireUser` | 6 páginas (`app/cuenta/**`, `app/(cursos)/[courseSlug]/presentacion/`) + 4 módulos de server actions | 22 |
| `requireAnyRole` | 12 archivos bajo `app/(admin)/` (incluido `app/(admin)/layout.tsx:8`) | 12 |
| `requireRole` | **0 consumidores** — código muerto hoy | 0 |
| `getCurrentUser` directo | 9 módulos de `lib/` + `app/(auth)/login/page.tsx:17` + `app/api/submissions/[submissionId]/submit/route.ts:15` | 16 |

Si el middleware dejara pasar la request, la página igual llamaría
`requireUser()` y redirigiría a `/login`. **Ambas capas entran en el alcance**,
o el spec no produce ningún cambio observable.

## Alcance

### Incluye

- **Frente 1 — Clasificación honesta del resultado de `getUser()`**: tipo
  discriminado que separa `authenticated` / `anonymous` / `unavailable`,
  siguiendo el patrón que spec-037 estableció para `lib/attendance/`.
- **Frente 2 — Capa 1 (middleware)**: leer `error`, validar las variables de
  entorno, un reintento único ante fallo de red, y responder **503 con una
  pantalla honesta** en vez de redirigir a `/login`.
- **Frente 3 — Capa 2 (`lib/auth/session.ts`)**: que los tres `require*`
  distingan "sin sesión" de "no se pudo verificar", **sin tocar las ~20 páginas
  consumidoras**.
- **Frente 4 — Página `/servicio-no-disponible`**: destino con layout completo
  que reutiliza `components/ErrorState.tsx`.

### No incluye

- **La consulta a `user_roles`** (`middleware.ts:35-39`, `requireRole:56-61`,
  `requireAnyRole:71-75`), que hoy descarta `error` y expulsa a un docente
  legítimo a `/` ante un fallo de lectura. Es una consulta a **tabla de
  Postgres, no a Auth** — dominio literal de **[[DEBT-040]]**. Además, tras
  este spec el escenario queda mucho menos alcanzable: si Supabase está caído,
  el middleware corta con 503 antes de llegar a esa consulta, así que el hueco
  restante es solo el **fallo parcial** (Auth vivo, Postgres/RLS caído). Se
  anota en DEBT-040 con puntero a este spec (Fase 6).
- **La navbar que desaparece.** `app/layout.tsx:37-38` consume
  `getCurrentProfile()`/`getCurrentRoles()`; con Auth caído ven `null` y
  `app/layout.tsx:56` oculta la navbar entera — la misma mentira en versión
  visual. Queda fuera porque ambos helpers consultan `profiles`/`user_roles`
  (terreno de DEBT-040) y porque con el Frente 2 ese render casi nunca llega a
  verse. Se anota en DEBT-040.
- **Cachear el último `user` válido** ni **dejar pasar la request** ante fallo
  de infraestructura. Descartadas por decisión del usuario (2026-08-09); ver
  "Decisiones".
- **Observabilidad / reporte remoto** (Sentry o equivalente), coherente con el
  "No incluye" de spec-037.
- **Cambios de esquema.** Este spec no toca migraciones.

## Decisiones

### D1 — Capa 1 responde **HTML inline con 503 real**, no la página bonita

Verificado en Next 16.2.4: **`NextResponse.rewrite(url, { status: 503 })` no
produce un 503.** `NextResponse.rewrite` acepta el `init` y lo aplica al
`Response` que construye
(`node_modules/next/dist/server/web/spec-extension/response.js:116-124`), pero
ese status **se descarta aguas abajo**: `resolve-routes.js:449-465` toma del
response del middleware únicamente `resHeaders` y el destino
(`x-middleware-rewrite`), y renderiza la ruta destino, cuyo status es el que
llega al cliente. Solo la rama de `location` (466-473) consulta
`middlewareRes.status`. **Con rewrite el usuario recibe 200.** Lo que sí
sobrevive son las cabeceras (443-447).

| Opción | 503 real | Layout/fuente | Bucle | Veredicto |
|---|---|---|---|---|
| A. `rewrite('/servicio-no-disponible')` | ❌ 200 | ✅ | Exigiría exención | Descartada |
| B. `redirect('/servicio-no-disponible')` | ❌ 307→200 | ✅ | Sí, si no se exime; pierde la URL original | Descartada |
| **C. `new NextResponse(html, {status:503})`** | ✅ | ❌ HTML propio | **Cero** | **Elegida** |
| D. rewrite a un `route.ts` que emite el 503 | ✅ | ❌ | Exigiría exención | Descartada: mismo output que C, una pieza más |

Se elige **C**. El coste es real —se pierde el layout, `globals.css` y
JetBrains Mono— pero **este proyecto ya tomó y aprobó exactamente esa decisión**:
`app/global-error.tsx:9-22` documenta que renderiza su propio `<html>`/`<body>`
con un `<style>` inline y `prefers-color-scheme` en vez de la clase `.dark`, y
acepta la tipografía de sistema porque *"cargar `next/font` aquí añadiría una
vía de fallo dentro del propio manejador de fallos"*. El middleware es el mismo
caso, un grado más extremo: no hay React en absoluto.

La página bonita del Frente 4 no se desperdicia — es el destino de la Capa 2,
que sí corre en React.

> Si en la revisión se prefiere fidelidad visual sobre el status HTTP, el
> cambio a la opción A es de una línea. Next 16.2.4 **no** permite las dos.

### D2 — Un reintento en el middleware, solo ante fallo de red o 5xx

Verificado: `_getUser` → `_request` **no reintenta** (el helper `retryable` de
auth-js solo se usa en el refresh del token, no en `GET /user`). Sin reintento,
la pérdida de un solo paquete convertiría el sitio entero en un 503.

- **Un** reintento, backoff fijo ~250 ms.
- Solo si `reason` es `network` o `server`; **nunca** si es `misconfigured`.
- `AbortSignal.timeout` ~2 s por intento, para no agotar el límite de ejecución
  del middleware en Vercel. Peor caso añadido: ~2,25 s antes del 503.
- **Solo en la Capa 1.** En `lib/auth/session.ts` no: esa capa se alcanza tras
  un middleware que ya reintentó, y `getAuthCheck` está `cache()`-ada por
  request, con lo que el reintento se multiplicaría por cada llamada.

> **Corrección tras la revisión de código** (2026-08-13): el peor caso de
> ~2,25 s de arriba quedó desactualizado por el fix de TC-046-003/004 (ver
> nota en la sección "Diseño" → "Taxonomía real de `getUser()`"). Un
> visitante **sin cookie de sesión** ahora dispara `checkAuthHealth()`, que
> reutiliza este mismo mecanismo de reintento — así que su peor caso real es
> **dos** intentos de ~2 s más el backoff de 250 ms, **~4,25 s** antes del
> 503 (coincide con el comentario de `lib/auth/middleware.ts:14-17`, que ya
> lo documentaba correctamente; era esta sección del spec la que había
> quedado corta). `/api` no paga este costo: se cortocircuita en
> `middleware.ts` antes de llegar a `updateSupabaseSession()` (ver D3).

### D3 — `/api` queda exento del 503 (y del chequeo de Auth por completo)

`middleware.ts` corta camino para cualquier `pathname` que empiece con
`/api` **antes** de llamar a `updateSupabaseSession()` — no solo del 503, del
chequeo de Auth entero. Son rutas de servicio (MCP) autenticadas por
**API key, no por sesión**. No dependen de Supabase Auth y
devolverles HTML en vez de JSON rompería los cinco MCPs del proyecto. La rama
`unavailable` debe respetar esa exención. Es criterio de aceptación, no detalle.

### D4 — Ante un caso desconocido, fallar **cerrado**

El default de lo no clasificable es `unavailable` (503), no `anonymous`. Es la
lección del Frente 4 de spec-037: un fallo de infraestructura no debe relajar
un gate. El coste de un falso 503 es una pantalla molesta; el de un falso
`anonymous` es expulsar a todo el mundo, que es justo la deuda que cerramos.

## Diseño

### Taxonomía real de `getUser()` (verificada en `@supabase/auth-js`)

| Escenario | `error` devuelto | Clasificación |
|---|---|---|
| No hay cookie de sesión, Auth responde | `AuthSessionMissingError` (status 400) — `GoTrueClient.js:2625` | `anonymous` (tras ping a `/auth/v1/health`, ver corrección post-`TC-046-003/004`) |
| JWT inválido / caducado / cookie corrupta | `AuthApiError` 401/403 (`bad_jwt`) | `anonymous` |
| **Auth inalcanzable** (túnel caído, DNS, TLS, timeout) | `AuthRetryableFetchError` con `status: 0` — `lib/fetch.js:28` | `unavailable: 'network'` |
| **Auth devuelve 5xx** (500-504, 520-530 de Cloudflare) | `AuthRetryableFetchError` con ese status — `lib/fetch.js:22-32` | `unavailable: 'server'` |
| Respuesta ilegible (JSON roto) | `AuthUnknownError` | `unavailable: 'unknown'` |
| Falta una variable de entorno | (lanza al construir el cliente) | `unavailable: 'misconfigured'` |

El 5xx del servidor de Auth **ya cae del lado "no se pudo verificar"** por
diseño del SDK; no hay que tratarlo aparte.

> **Corrección tras la ronda de pruebas manuales** (`TC-046-003`/`TC-046-004`,
> 2026-08-13): la fila "no hay cookie de sesión" de esta tabla era la causa
> raíz del incumplimiento del criterio de aceptación #2. `AuthSessionMissingError`
> se resuelve **localmente** en el SDK (`GoTrueClient._getUser`) sin llegar a
> hacer ninguna petición de red — así que sin más, un visitante anónimo nunca
> podía activar la rama `unavailable`, sin importar el estado real de Auth.
> `lib/auth/middleware.ts` (`tryGetUser`) ahora hace un ping explícito a
> `GET {supabaseUrl}/auth/v1/health` (sin autenticar, expuesto por GoTrue)
> **solo** en esa rama, antes de confiar en `anonymous`; el retry de D2 se
> reutiliza sin cambios porque el resultado del ping pasa por la misma
> clasificación `AuthCheckResult`. El caso de JWT inválido/corrupto no
> necesita este ping extra: esa rama ya hace una llamada de red real dentro
> de `getUser()` para validar el token, así que un Auth caído ya cae en
> `unavailable` por el camino existente (confirmado en `TC-046-015`).

### Tipo discriminado

```
AuthCheckResult =
  | { status: 'authenticated'; user: User }
  | { status: 'anonymous' }
  | { status: 'unavailable'; reason: 'network' | 'server' | 'misconfigured' | 'unknown' }
```

Mapeo en una única función pura `classifyAuthError()`:
sin `error` y con `user` → `authenticated`; `AuthSessionMissingError` o
`AuthError` con status 400-499 → `anonymous`; `AuthRetryableFetchError`,
`AuthUnknownError` o `AuthError` con status ≥ 500 → `unavailable`; excepción
no-`AuthError` → `unavailable: 'unknown'` (D4).

### No se importa `isAuthRetryableFetchError`

Existe en `@supabase/auth-js` (`lib/errors.js:222-224`) y lo re-exporta
`@supabase/supabase-js` (`dist/index.d.mts:7`), pero **`@supabase/ssr` no**.
Se implementan type guards propios (~6 líneas) en `lib/auth/errors.ts`:

- evita añadir `@supabase/supabase-js` al bundle del middleware (hoy solo
  arrastra `@supabase/ssr`), que es el runtime más frágil del proyecto (Edge);
- elimina el riesgo de que un cambio de `exports` en `package.json` rompa el
  build;
- `isAuthError` es literalmente `'__isAuthError' in error`, y el `name`
  (`errors.js:219`) es contrato público estable.

### Variables de entorno

`lib/auth/middleware.ts:8-9` usa non-null assertions (`!`). Si falta la
variable, `createServerClient` lanza **antes** de cualquier `try` — el patrón de
**[[DEBT-041]]**, pero aquí en el middleware, donde una excepción cruda tumba
todo el sitio con el error genérico de Next. Se validan ambas explícitamente y
se devuelve `unavailable: 'misconfigured'` con un log `configuration_error`
(coherente con el tratamiento de `COURSES_ADMIN_API_KEY` en CLAUDE.md), en vez
de lanzar. Además, la construcción del cliente pasa **dentro** del `try`.

### Capa 2: redirect, no throw

| Opción | Archivos tocados | Problema |
|---|---|---|
| 1. Devolver el discriminado a cada consumidor | **23 archivos, ~34 llamadas** | Superficie enorme para un caso raro; alto riesgo de que una página lo maneje mal |
| 2. `throw AuthUnavailableError` recogido por `error.tsx` | 1 archivo | **Falla en producción**: Next redacta `error.message` en los boundaries de cliente, y `app/error.tsx:24-25` solo podría mostrar "Algo salió mal" — justo el mensaje que no queremos. Y desde un **server action** el throw llega como fallo genérico del action, no como página |
| **3. `redirect('/servicio-no-disponible')`** | **1 archivo** + 1 página nueva + 1 línea en `middleware.ts` | **Elegida** |

Con la opción 3, `requireUser`/`requireRole`/`requireAnyRole` conservan
`redirect("/login")` para `anonymous` y redirigen a
`/servicio-no-disponible?from=<ruta>` para `unavailable`. Funciona igual en
páginas RSC y en server actions, y **no toca ninguna de las ~20 páginas
consumidoras**.

`getCurrentUser()` **mantiene su firma** `Promise<User | null>` (16 call sites
intactos) y pasa a delegar en una nueva `getAuthCheck(): Promise<AuthCheckResult>`
`cache()`-ada. Devuelve `null` tanto para `anonymous` como para `unavailable`:
mentira consciente y acotada, que debe llevar un comentario `// DEBT:` con
puntero a **[[DEBT-040]]**, porque esos 16 consumidores son precisamente su
alcance. Lo que importa es que los tres `require*` ya no pasen por ahí.

### Falsos positivos: por qué una cookie corrupta no deja a nadie en 503 permanente

Un JWT inválido produce `AuthApiError` 401/403 vía `handleError`
(`lib/fetch.js:74`), que **no** entra en `NETWORK_ERROR_CODES`
(`lib/fetch.js:22-24`) y por tanto se clasifica como `anonymous` → `/login` →
el flujo de login limpia las cookies. Solo `status: 0` (red) y 5xx llegan a
`unavailable`. Este razonamiento es lo que hace segura la política de "fallar
cerrado" de D4, y se verifica en `TC-046-015`.

## Impacto en el sistema

| Archivo | Qué cambia |
|---|---|
| `lib/auth/errors.ts` *(nuevo)* | Type guards propios (`isAuthErrorLike`) y `classifyAuthError()`; sin imports de `@supabase/*` |
| `lib/auth/auth-check.ts` *(nuevo)* | `AuthCheckResult` discriminado. Nombre distinto de `lib/auth/types.ts` a propósito: ese archivo ya existía con `AuthResult` (resultado de server actions), un tipo homónimo pero no relacionado |
| `lib/auth/middleware.ts` | Guardas de env (8-9), `try/catch` + lectura de `error` (28-30), reintento único (D2); `updateSupabaseSession` devuelve `{ supabaseResponse, auth, supabase }` en vez de `user` |
| `middleware.ts` | `/api` cortocircuita antes de tocar Supabase (D3, corregido tras revisión de código); rama `unavailable` → 503 para el resto; `/servicio-no-disponible` añadido a `PUBLIC_PREFIXES`; matcher sin cambios |
| `lib/auth/service-unavailable-page.ts` *(nuevo)* | Constructor del HTML inline del 503, aislado y testeable fuera de `middleware.ts` |
| `lib/auth/session.ts` | `getAuthCheck()` nueva; `getCurrentUser` (8-14) delega; `requireUser` (43-50), `requireRole` (52-65), `requireAnyRole` (67-79) redirigen a `/servicio-no-disponible` ante `unavailable` |
| `app/servicio-no-disponible/page.tsx` *(nuevo)* | Página React con `ErrorState`, `dynamic = 'force-dynamic'`, `robots: { index: false }` |
| `app/servicio-no-disponible/RetryButton.tsx` *(nuevo)* | Client component mínimo para `router.refresh()` |
| `app/layout.tsx` | **Sin cambios** (fuera de alcance, ver "No incluye") |
| `app/error.tsx`, `app/global-error.tsx`, `app/(admin)/error.tsx`, `components/ErrorState.tsx` | **Sin cambios** — con la opción 3 nunca reciben este error, y su copy genérico sigue siendo correcto para todo lo demás |
| `docs/specs/backlog.md` | DEBT-042 → resuelta; residuos anotados en DEBT-040 |

### Contenido de la pantalla 503

El copy es el corazón de la deuda: debe dejar claro que **la sesión no se
cerró** y que **no es la contraseña**.

- Título: *"No pudimos verificar tu sesión"*
- Descripción: *"El servicio de autenticación no está respondiendo. **Tu sesión
  sigue activa** — esto no es un problema con tu usuario ni tu contraseña.
  Intenta de nuevo en unos segundos."*
- Cabeceras: `Content-Type: text/html; charset=utf-8`,
  `Cache-Control: no-store, must-revalidate`, `X-Robots-Tag: noindex`,
  `Retry-After: 30`.
- "Reintentar" debe funcionar **sin JS**: `<a href="{ruta actual}">` estilado
  como botón, no un `onclick` suelto.
- El HTML replica la estructura de `components/ErrorState.tsx` (`role="alert"`,
  título/descripción/botón) con los valores de `DESIGN.md` volcados a hex
  literal, porque `globals.css` no está cargado. La duplicación es **aceptada y
  debe ir comentada en el código** apuntando a `DESIGN.md`, igual que
  `global-error.tsx` duplica el look de `error.tsx`.
- Modo claro/oscuro vía `@media (prefers-color-scheme)`, sin JS, como
  `global-error.tsx` (que llegó a ese diseño tras romperse en `TC-037-006`).

## Evaluación MCP

**¿Aplica MCP?** **No.**

Las cuatro preguntas de CLAUDE.md dan negativo: no expone datos consultables
(es una rama de control de flujo del middleware, sin recursos); no expone
acciones ejecutables ("el servicio de auth está caído" no es una operación que
un agente invoque); no hay MCP de dominio relacionado (los cinco existentes son
clientes HTTP de `/api/*`, que este spec deja explícitamente intacto); y ningún
system prompt de `docs/mcps/` cambia de capacidades.

**Nota operativa que sí afecta a los MCPs:** se autentican por API key contra
`/api/*`. El diseño mantiene `/api` fuera de la respuesta 503 (**D3**); si eso
no se respetara, los cinco MCPs empezarían a recibir HTML en vez de JSON. Está
recogido como criterio de aceptación y como `TC-046-008`, no como fase de MCP.

## Fases de implementación

> Orden no negociable: 1→2→3 antes que 5. La Fase 5 depende del discriminado de
> la Fase 1, y el fix del middleware sin la página (Fase 4) dejaría a
> `requireUser` redirigiendo a una ruta inexistente.

### Fase 1 — Clasificación ✅
- [x] Crear `lib/auth/auth-check.ts` con `AuthCheckResult` (renombrado de
      `lib/auth/types.ts` planeado originalmente: ese archivo ya existía con
      `AuthResult`, un tipo homónimo pero no relacionado — ver "Impacto en el
      sistema").
- [x] Crear `lib/auth/errors.ts` con `isAuthErrorLike` y `classifyAuthError()`,
      sin importar de `@supabase/*`.
- [x] Verificar que la clasificación falla cerrado (D4) ante entrada desconocida.

### Fase 2 — Capa 1a: lectura honesta en el middleware ✅
- [x] Validar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
      antes de construir el cliente; devuelve `misconfigured` con log
      `configuration_error` en vez de lanzar.
- [x] Mover `createServerClient` dentro del flujo protegido (guarda de env
      antes de construir el cliente).
- [x] Leer `error` de `getUser()` y clasificarlo.
- [x] Reintento único con backoff ~250 ms y `AbortSignal.timeout` ~2 s (D2) —
      implementado vía `global.fetch` (no `auth.fetch`: es la única vía tipada
      de `@supabase/supabase-js` para inyectar un fetch propio en este cliente).
- [x] Cambiar el contrato de retorno a `{ supabaseResponse, auth, supabase }`.

### Fase 3 — Capa 1b: respuesta 503 ✅
- [x] Crear `lib/auth/service-unavailable-page.ts` con el HTML inline, el copy
      acordado y el soporte de `prefers-color-scheme`.
- [x] Añadir la rama `unavailable` en `middleware.ts` **antes** del gate de
      `PUBLIC_PREFIXES`, con las cabeceras acordadas.
- [x] Mantener `/api` pasando sin 503 (D3).

### Fase 4 — Página compartida ✅
- [x] Crear `app/servicio-no-disponible/page.tsx` reutilizando `ErrorState`, con
      `force-dynamic` y `robots: { index: false }`.
- [x] Crear `app/servicio-no-disponible/RetryButton.tsx` — exporta
      `ServiceUnavailableCard`, el client component que posee el callback
      `onRetry` y por eso es quien renderiza `ErrorState` (ese prop es una
      función y no puede cruzar el límite server/client).
- [x] Añadir la ruta a `PUBLIC_PREFIXES` (`middleware.ts:5-9`).

### Fase 5 — Capa 2: `lib/auth/session.ts` ✅
- [x] Añadir `getAuthCheck()` `cache()`-ada.
- [x] `getCurrentUser` delega, conservando su firma y con el comentario `// DEBT:`.
- [x] `requireUser`, `requireRole` y `requireAnyRole` distinguen `anonymous`
      (→ `/login`) de `unavailable` (→ `/servicio-no-disponible?from=`).
- [x] Confirmado: ninguna página consumidora se modificó (`git diff --stat`
      contra `development` solo toca los archivos de la tabla de "Impacto en
      el sistema").

### Fase 6 — Cierre documental ✅
- [x] `docs/specs/backlog.md`: DEBT-042 → ✅ Resuelta (spec-046).
- [x] Anotado en DEBT-040 los dos residuos con puntero a spec-046: la consulta a
      `user_roles` y la navbar de `app/layout.tsx:37-38,56`.

### Fase 7 — Pruebas
- [x] Ronda manual de `docs/testing/test-046-gate-auth-degradado.md` —
      **16/16 casos ✅ Aprobados** (2026-08-13, con Claude como copiloto,
      ejecución con autorización explícita del usuario en cada paso con
      navegador). Primera ronda: 14 ✅ / 2 ❌ (TC-046-003, TC-046-004 — un
      visitante sin cookie de sesión no activaba la rama `unavailable` con
      Auth caído). Fix aplicado en `lib/auth/middleware.ts` (ping a
      `/auth/v1/health`), y una segunda ronda confirmó los dos casos en
      verde. La revisión de código posterior (`@reviewer`) encontró que ese
      primer fix habría roto producción (Kong hosted exige `apikey`, a
      diferencia del Kong local de `mirp-lab`) — corregido y re-verificado
      contra el proyecto de producción real. Ver el resumen completo de la
      ronda, el incidente de entorno (stack de Docker local contaminando el
      aislamiento) y los hallazgos de la revisión en
      `docs/testing/test-046-gate-auth-degradado.md`.
- [ ] (Cuando exista framework) e2e/unit sobre `classifyAuthError()` — función
      pura, testeable sin red.

## Criterios de aceptación

1. Con Supabase Auth inalcanzable, un usuario **autenticado** que recarga
   cualquier ruta ve la pantalla 503 con "Tu sesión sigue activa", **no**
   `/login`.
2. Con Supabase Auth inalcanzable, un **visitante sin sesión** también ve el
   503: el gate no puede decidir, y falla cerrado (D4).
3. La respuesta lleva status **503** y `Cache-Control: no-store`.
4. Al restaurarse el servicio, "Reintentar" devuelve al usuario a la app **con
   su sesión intacta**, sin volver a iniciar sesión.
5. Con Supabase Auth **sano**, el gate real sigue funcionando: sin sesión →
   `/login?redirectTo=…`; sin rol → `/`; spec-045 (autenticado en `/login` → `/`)
   sin regresión.
6. Una **cookie de sesión corrupta** lleva a `/login`, **no** al 503, y el login
   posterior funciona.
7. Las rutas `/api/*` siguen devolviendo **JSON** durante la caída: los cinco
   MCPs no se rompen (D3).
8. Con una variable de entorno de Supabase ausente, la app muestra el 503 con
   log `configuration_error`, no una excepción cruda de Next.
9. Ninguna de las ~20 páginas que consumen `require*` se modifica.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-046-gate-auth-degradado.md` — casos
  `TC-046-001` … `TC-046-016`. Sin casos `TC-MCP-`: este spec no crea ni
  modifica herramientas de MCP (ver "Evaluación MCP"); la protección de `/api`
  se cubre en `TC-046-008`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-046-gate-auth-degradado.spec.ts`
  — framework pendiente (ver CLAUDE.md → "Testing"). `classifyAuthError()` es
  pura y será el primer candidato natural a test unitario del repo.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-09
