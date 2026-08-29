# spec-054 — [DONE] Resiliencia del camino de request ante latencia de Supabase

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

Cierra tres deudas que dejó el incidente del 2026-08-27→29: **DEBT-071** (el 504
mudo), **DEBT-070** (los 300 s de cuelgue) y **DEBT-069** (el alcance del 503).

## Contexto

Entre el 2026-08-27 y el 2026-08-29, `www.nod0.dev` estuvo intermitente durante
aproximadamente un día. **La causa raíz es externa y ya está cerrada**: el
gateway de Supabase (capa Cloudflare/Kong, marcado como "Degraded Performance"
en su status page, tras su incidente de PostgREST 14.5) introdujo latencia
extrema de transporte.

La medición que lo demuestra es el cruce de dos fuentes de log del propio
Supabase, el 2026-08-29 entre las 15:00 y las 21:00 UTC:

| Ruta | `edge_logs` (lo que mide el gateway) | `auth_logs` (lo que mide GoTrue, ya dentro del proyecto) |
|---|---|---|
| `/auth/v1/user` | hasta **240.093 ms** | 7–31 ms promedio (máx 213 ms) |
| `/auth/v1/token` | 27,5 s promedio, máx **215.797 ms** | 37–161 ms promedio (máx 389 ms) |

Cero respuestas 5xx. Postgres y PostgREST sin lentitud. Pico de tráfico de 741
req/hora, volumen trivial. **El proyecto respondía en milisegundos mientras el
transporte tardaba minutos.** Por eso se descartó explícitamente subir el plan
de cómputo: no arregla un problema de transporte.

### Impacto medido en los runtime logs de Vercel (24–48 h)

Contra 1.701 respuestas 200 en el mismo periodo — de ahí la intermitencia:

- **34 × `504 MIDDLEWARE_INVOCATION_TIMEOUT`** y 35 × `Your function was stopped
  as it did not return an initial response within 25s` en `/middleware`. Esta es
  la pantalla cruda de Vercel que vio el usuario, **sin** la página de degradado
  que `spec-046` diseñó.
- **10 × `Vercel Runtime Timeout Error: Task timed out after 300 seconds`** en
  `/[courseSlug]` (4 usuarios afectados): 5 minutos de espera para el estudiante
  y 5 minutos de cómputo facturado por request.
- 150 × **503**: el gate de `spec-046` fallando cerrado. Funcionó como se
  diseñó, pero tumbando el sitio entero, incluidas rutas que no necesitan Auth.
- 729 × `DOMException [TimeoutError]: The operation was aborted due to timeout`
  y 30 × `AuthRetryableFetchError: The operation was aborted due to timeout`
  (`status: 0`).

Nada de eso es un bug del proveedor que podamos arreglar. **Lo que sí es
nuestro es cómo degrada la plataforma cuando el transporte se pone lento**: hoy
degrada a 504 mudo, a 300 s de cuelgue y a 503 total.

### Hallazgo 1 — DEBT-071: el mecanismo está confirmado en el código, con números

Versión instalada: `@supabase/auth-js@2.108.2` (vía `@supabase/ssr@0.12.0`).
Verificado en `node_modules/@supabase/auth-js/dist/module/`:

- `GoTrueClient.js:3902-3918` — `_refreshAccessToken` envuelve la petición en
  `retryable()`, con backoff `200 · 2^(intento-1)` ms → 200, 400, 800, 1600…
- El predicado de corte **no cuenta intentos: cuenta reloj de pared**
  (`GoTrueClient.js:3913-3917`):
  `Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS`
- `lib/constants.js:3` — `AUTO_REFRESH_TICK_DURATION_MS = 30 * 1000`.

Simulando ese bucle con el `AbortSignal.timeout(2000)` que hoy inyecta
`lib/auth/middleware.ts:77` — cada intento aborta a los 2 s exactos con
`AuthRetryableFetchError`, que es precisamente el error que el predicado
considera reintentable:

| intento | sleep previo | fin del request | siguiente backoff | ¿continúa? |
|---|---|---|---|---|
| 0 | — | 2,0 s | 200 ms | sí |
| 1 | 0,2 s | 4,2 s | 400 ms | sí |
| 2 | 0,4 s | 6,6 s | 800 ms | sí |
| 3 | 0,8 s | 9,4 s | 1,6 s | sí |
| 4 | 1,6 s | 13,0 s | 3,2 s | sí |
| 5 | 3,2 s | 18,2 s | 6,4 s | sí (24,6 < 30) |
| 6 | 6,4 s | **26,6 s** | 12,8 s | no (39,4 > 30) |

**Una sola llamada a `supabase.auth.getUser()` que necesite refrescar el token
puede consumir ~26,6 s**, ya por encima del límite de 25 s de Vercel. Y
`checkAuth()` (`lib/auth/middleware.ts:100-117`) puede reintentarla una segunda
vez → **~53 s de peor caso**. Los 35 kills a 25 s y los 34 × 504 quedan
explicados sin hipótesis residual.

> **Corolario contraintuitivo, que debe quedar escrito en el código:** *bajar*
> `REQUEST_TIMEOUT_MS` **empeora** este problema, porque hace que quepan más
> iteraciones dentro de la ventana de 30 s del SDK. El comentario actual de
> `lib/auth/middleware.ts:14-17` ("peor caso ≈ 4,25 s") es falso: nunca
> contempló el bucle interno del SDK.

### Hallazgo 2 — DEBT-070: el camino de los 300 s pasa por el root layout

`app/layout.tsx:37-38` llama `getCurrentProfile()` y `getCurrentRoles()` en el
**root layout**, es decir en **toda** página del sitio. Ambas van a
`lib/auth/session.ts` → `lib/auth/server.ts`, que crea el cliente **sin fetch
propio** (y con non-null assertions en las líneas 8-9). Ese es el candidato más
probable de los 10 cuelgues de 300 s en `/[courseSlug]`.

`lib/auth/service.ts` es además un **singleton** consumido por 10 módulos
(`lib/{attendance,assignments,enrollments,courses,students,self-assessment,questions,keywords}/…`),
que son los que sirven `/api/*` y por tanto los 5 MCPs: un timeout ahí tiene un
radio de acción mucho mayor. `lib/auth/actions.ts` tiene también un cliente
propio en la línea 216 (el *throwaway* que verifica la contraseña actual), sin
presupuesto.

### Hallazgo 3 — DEBT-069: su premisa ya no se sostiene, **hoy no hay contenido público**

Verificado leyendo el middleware y las páginas:

- `middleware.ts:103-109` exige sesión para **todo** salvo `/login`, `/registro`
  y `/servicio-no-disponible`. `/`, `/grupo-investigacion` y todas las rutas de
  curso incluidas.
- `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:8` llama además
  `requireCourseAccess()` (`lib/enrollments/access.ts:75-103`), que exige
  **matrícula**, no solo sesión, y ante `unavailable` ya redirige a
  `/servicio-no-disponible`.

Es decir: `/estructuras-de-datos/polimorfismo` es contenido restringido **en dos
capas**. Los 503 observados ahí no fueron falsos positivos sobre contenido
público: fueron el gate cumpliendo D4 de `spec-046`. La frase de DEBT-069 —"un
visitante que solo quería leer una lección abierta"— describe un escenario que
**el producto no ofrece hoy**.

Lo único genuinamente renderizable sin Auth es `/grupo-investigacion`
(componente estático, cero Supabase) y `/` (`getAllCourses()` lee MDX de disco;
pero su navbar sí depende del perfil, vía root layout). **Esto convierte
DEBT-069 de "corregir un bug de alcance" en "decidir un cambio de producto"** —
ver la decisión **D-E**.

## Alcance

### Incluye

1. Un **deadline global** para el camino de autenticación del middleware, que
   garantice que el gate responda su 503 diseñado **antes** de que Vercel mate
   la invocación a los 25 s (DEBT-071).
2. **Timeout de red** en los clientes Supabase server-side que hoy no lo tienen:
   `lib/auth/server.ts`, `lib/auth/actions.ts` (incluido el cliente de la línea
   216) y `lib/auth/service.ts` (DEBT-070).
3. Una **rama de render explícita** cuando una consulta de datos aborta por ese
   timeout, en lugar del 500 genérico que saldría hoy (DEBT-070).
4. Una **política explícita de alcance del 503** ante `reason: "network" |
   "server"`, sin debilitar el fallo cerrado de D4 para contenido restringido
   (DEBT-069, sujeta a **D-E**).
5. Un **método reproducible de prueba** (proxy de inyección de latencia), sin el
   cual ningún criterio de aceptación de este spec es verificable.
6. Instrumentación mínima en Sentry para medir en producción que el peor caso
   quedó acotado.

### No incluye

- **Cambiar de proveedor, de región o de plan de cómputo.** La causa raíz es
  externa y esa vía ya se descartó con evidencia (ver Contexto).
- **Abrir contenido de curso a visitantes.** Si D-E se resuelve por E1, se abren
  `/` y `/grupo-investigacion` a navegación anónima **en modo degradado**; las
  lecciones siguen exigiendo matrícula sin excepción.
- **[[DEBT-040]]** — `getCurrentUser()` colapsando `unavailable` en `null`, y la
  consulta a `user_roles` que descarta `error` (`middleware.ts:130`). Este spec
  la roza y la desbloquea, pero no la resuelve.
- **[[DEBT-067]]** — el 503 que llega a un Server Action como HTML plano y
  dispara el error boundary genérico. Es un problema de **formato** de la
  respuesta, no de tiempo; sigue vivo (ver "Residuo declarado").
- **[[DEBT-061]]** — las rutas `/api` que autentican por sesión devolviendo 401
  en vez de 503. Fuera de alcance por D3 de `spec-046`.
- **Cambios de esquema.** Este spec no toca migraciones.
- Reintentos del lado del cliente o service worker.

## Impacto en el sistema

| Archivo | Qué cambia | Deuda |
|---|---|---|
| `lib/auth/fetch-timeout.ts` *(nuevo)* | Fábrica única del `fetch` con presupuesto: acepta un `AbortSignal` externo o construye uno, para que middleware y clientes de datos compartan una implementación en vez de tres copias | 070, 071 |
| `lib/auth/middleware.ts` | `AbortController` único por request compartido por todo el cliente (reemplaza el `AbortSignal.timeout` por-fetch de la línea 77); deadline global sobre `checkAuth`; corregir el comentario falso de las líneas 14-17 | 071 |
| `middleware.ts` | Distinguir `unavailable` por deadline agotado de `unavailable` por clasificación; política de alcance del 503 según ruta (Fase 4); tags de duración en el `Sentry.captureMessage` de las líneas 46-54 | 071, 069 |
| `lib/auth/server.ts` | Inyectar `global.fetch` con presupuesto; sustituir los non-null assertions de las líneas 8-9 por guardas explícitas (mismo patrón que `lib/auth/middleware.ts:56-67`) | 070 |
| `lib/auth/actions.ts` | Presupuesto en el cliente *throwaway* de la línea 216 (los otros 4 call sites lo heredan de `server.ts`) | 070 |
| `lib/auth/service.ts` | Presupuesto en el singleton — radio de acción amplio, ver **D-C** | 070 |
| `lib/auth/errors.ts` | `classifyAuthError` debe mapear `DOMException` con `name === "TimeoutError" \| "AbortError"` de forma explícita, no por el catch genérico de `unknown` | 070, 071 |
| `lib/auth/auth-check.ts` | Posible valor `"timeout"` en `AuthUnavailableReason`, distinto de `"network"` (ver **D-B**); único cambio de tipo del spec | 071 |
| `lib/auth/session.ts` | `getAuthCheck()` (17-25) debe reconocer el abort; decidir si `getCurrentProfile`/`getCurrentRoles` (33-71) propagan o degradan | 070 |
| `app/layout.tsx` | Camino degradado del root layout: hoy un throw aquí **no** lo captura `app/error.tsx`, solo `global-error.tsx` | 070 |
| `lib/enrollments/access.ts` | Verificar que `hasCourseAccess` devuelve `unavailable` —no `not-enrolled`— cuando la consulta aborta | 070 |
| `app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx`, `components/ErrorState.tsx` | Copy diferenciado para el fallo de infraestructura | 070 |
| `scripts/latency-proxy.mjs` *(nuevo)* | Proxy de inyección de latencia para el entorno local — **sin dependencias nuevas**, solo `node:http` | prueba |
| `docs/specs/backlog.md` | DEBT-069/070/071 → resueltas; anotar los residuos que quedan vivos | — |

**Sin cambios:** `lib/auth/browser.ts` (no consume tiempo de función
serverless), `app/api/**` (exento por D3 de `spec-046`),
`lib/auth/service-unavailable-page.ts`, `supabase/migrations/**`.

## Evaluación MCP

**¿Aplica MCP?** **No.**

- Las tres deudas son de **resiliencia del camino de request**: no crean tablas,
  ni endpoints, ni acciones de dominio que un agente pudiera consultar o
  ejecutar. No hay nada nuevo que exponer.
- Los 5 MCPs del proyecto son **estructuralmente inmunes** a lo que toca este
  spec: `middleware.ts:24-26` cortocircuita `/api` **antes** de llamar a
  `updateSupabaseSession()` (D3 de `spec-046`), así que ni el deadline global ni
  la política de alcance del 503 los alcanzan.
- Ningún system prompt de `docs/mcps/` describe comportamiento que cambie aquí.

**Salvedad honesta, que refuerza la conclusión en vez de contradecirla:** la
Fase 2 sí toca `lib/auth/service.ts`, del que dependen los 10 módulos que sirven
`/api/*`. El timeout **sí** llega a la capa de datos de los MCPs, aunque el gate
no. Eso no es exponer nada nuevo a un agente: es un cambio de comportamiento en
su capa de datos, y se cubre con la decisión **D-C** y con los casos
`TC-MCP-054-001/002`, no con una fase de MCP.

## Fases de implementación

### Fase 0 — Método de prueba: proxy de inyección de latencia

> Va primero por una razón dura: la causa raíz es latencia del proveedor y **no
> se puede convocar a voluntad**. Sin este instrumento, ningún criterio de
> aceptación es verificable y la implementación sería un acto de fe.

- [x] Crear `scripts/latency-proxy.mjs`: proxy HTTP de reenvío **sin
      dependencias nuevas** (`node:http` + `fetch`), que escucha en un puerto
      local (p. ej. 54331) y reenvía a `http://localhost:54321` (el túnel SSH a
      `mirp-lab`, ver CLAUDE.md → "Base de datos").
- [x] Modos de inyección, seleccionables por flag:
      `--delay=<ms>` (retardo fijo); `--hang` (no responde nunca, reproduce el
      cuelgue de 300 s); `--path=<regex>` (retardo solo en rutas que casen —
      **crítico**: el incidente real tenía `/auth/v1/token` lento con
      `/auth/v1/health` sano, y hay que poder reproducir esa asimetría);
      `--fail-rate=<0..1>` (intermitencia, para el patrón 503/200 alternado).
- [x] Documentar en el propio script el procedimiento: levantar túnel, levantar
      proxy, apuntar `NEXT_PUBLIC_SUPABASE_URL` de `.env.local` al puerto del
      proxy, reiniciar `npm run dev`.
- [ ] Para los escenarios de refresh de token (DEBT-071), bajar `jwt_expiry` en
      el `supabase/config.toml` de `mirp-lab` de `3600` a `60`, reiniciar el
      stack allá, y **revertirlo al terminar** (anotado como reversible en el
      archivo de test).

### Fase 1 — DEBT-071: deadline global del middleware

- [x] `lib/auth/fetch-timeout.ts` *(nuevo)*: fábrica del `fetch` con
      presupuesto, capaz de recibir un `AbortSignal` **externo y compartido** en
      vez de crear uno nuevo por llamada. Es la pieza que permite cortar también
      los reintentos internos del SDK.
- [x] `lib/auth/middleware.ts`: crear un `AbortController` por request en
      `updateSupabaseSession`, armado con el presupuesto global (**D-A**), y
      pasarlo al `global.fetch` del `createServerClient` (sustituye el
      `AbortSignal.timeout(REQUEST_TIMEOUT_MS)` de la línea 77). Efecto buscado:
      cuando el bucle de `_refreshAccessToken` haga su intento nº 4, la señal ya
      está abortada y el intento falla **de inmediato**, no a los 2 s — el bucle
      se agota en milisegundos en vez de en 26,6 s.
- [x] Conservar un timeout **por intento** además del global (`AbortSignal.any`
      o señales combinadas): el global evita el 504; el por-intento sigue
      evitando que un solo request colgado consuma todo el presupuesto.
- [x] Subordinar `HEALTH_TIMEOUT_MS` (5 s) y `RETRY_DELAY_MS` al deadline
      global: el peor caso del ping de salud (`2 × 5 s + 250 ms ≈ 10,25 s`)
      **excede** el presupuesto recomendado y no puede seguir siendo un
      presupuesto paralelo. Este es exactamente el error de diseño que produjo
      DEBT-071.
- [x] Añadir el cinturón de seguridad: `Promise.race` de `checkAuth()` completo
      contra un temporizador al presupuesto global. El `AbortController` corta
      de raíz; el `race` protege ante cualquier ruta del SDK que no propague la
      señal.
- [x] Corregir el comentario de las líneas 14-17 y documentar el bucle de
      auth-js 2.108.2 (tabla del Hallazgo 1) con la advertencia de que **bajar
      el timeout por intento empeora el problema**. Es de los comentarios que
      justifican existir: el *por qué* no es obvio y ya engañó una vez.
- [x] `lib/auth/errors.ts`: mapear `DOMException` `TimeoutError`/`AbortError`
      explícitamente, para que un abort no caiga en el default `unknown`.
- [x] `middleware.ts`: añadir duración del gate y motivo (`deadline` vs.
      clasificación) como tags del `Sentry.captureMessage` existente.

### Fase 2 — DEBT-070: presupuesto de red en los clientes de datos

- [x] `lib/auth/server.ts`: inyectar `global.fetch` con el presupuesto de datos
      (**D-C**) usando la fábrica de la Fase 1. Sustituir los non-null
      assertions `!` de las líneas 8-9 por guardas explícitas — hoy una env var
      ausente lanza una excepción cruda dentro de `createServerClient`,
      exactamente el fallo que `spec-046` corrigió en el middleware y que aquí
      quedó vivo.
- [x] `lib/auth/actions.ts`: presupuesto en el cliente *throwaway* de la línea
      216. Los otros cuatro call sites (37, 122, 186, 309) lo heredan.
- [x] `lib/auth/service.ts`: presupuesto en el singleton, con el valor de
      **D-C**. Verificar que el `fetch` inyectado no rompe
      `supabase.auth.admin.updateUserById` ni las operaciones por lotes de los
      servicios de `/api`.
- [x] Barrer el repo por clientes sin presupuesto
      (`grep -rn "createServerClient\|createClient(" lib app`) y cerrar el
      conjunto.

### Fase 3 — DEBT-070 (segunda mitad): qué se renderiza cuando la consulta aborta

- [x] `lib/auth/session.ts`: que `getAuthCheck()` clasifique el abort como
      `unavailable`, no como `unknown`. Comportamiento de
      `getCurrentProfile`/`getCurrentRoles` según **D-D**.
- [x] `app/layout.tsx`: camino degradado del root layout. **Punto delicado:** un
      throw aquí no lo captura `app/error.tsx`, solo `global-error.tsx`, que
      reemplaza el documento entero. El root layout **nunca debe lanzar**:
      degrada a navbar anónima + aviso (**D-F**).
- [x] `lib/enrollments/access.ts`: verificar que `hasCourseAccess()` devuelve
      `unavailable` y no `not-enrolled` cuando la consulta aborta. Si devolviera
      `not-enrolled`, un timeout mandaría a un estudiante **matriculado** a
      `/cuenta/cursos?sinAcceso=…`: el mismo tipo de mentira que `spec-046`
      eliminó, un nivel más abajo.
- [x] `app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx` y
      `components/ErrorState.tsx`: copy diferenciado ("no pudimos contactar el
      servidor, tu sesión sigue abierta"), coherente con
      `/servicio-no-disponible`.
- [x] Revisar `app/(admin)/error.tsx` y `app/error.tsx` para que el copy
      genérico siga siendo correcto en lo que no cubre la rama nueva.

### Fase 4 — DEBT-069: alcance del 503 ante fallo transitorio

> **Bloqueada hasta que se resuelva D-E**, porque su premisa de partida es falsa
> (Hallazgo 3). No debe implementarse "según el backlog".

- [x] `middleware.ts`: introducir el conjunto de rutas abiertas que decida D-E,
      **separado y explícito** frente a `PUBLIC_PREFIXES` (que hoy significa
      otra cosa: "rutas de auth exentas del gate de sesión").
- [x] Aplicar la excepción **solo** cuando `auth.reason` sea `"network"` o
      `"server"`. `misconfigured` y `unknown` siguen produciendo 503 en todas las
      rutas: **D4 de `spec-046` queda intacto**.
- [x] Dejar escrito el argumento de seguridad: dejar pasar una navegación
      anónima a `/` **no expone contenido**, porque las páginas de curso y
      lección tienen su propia capa (`requireCourseAccess`) que sigue fallando
      cerrado ante `unavailable`. La excepción es de **navegación**, no de
      **autorización**.
- [x] Responder `Cache-Control: no-store` en las rutas que pasen en modo
      degradado, para que ningún CDN fije la versión anónima.
- [x] Ampliar los tags de Sentry con la ruta y si se aplicó la excepción, para
      medir cuánto tráfico salva realmente.

### Fase 5 — Observabilidad y cierre

- [ ] Verificar que los tags nuevos aparecen en el proyecto `nodo-edu` de Sentry
      y permiten responder: ¿cuál fue la duración máxima real del gate esta
      semana?, ¿cuántos 503 se evitaron?
- [x] Actualizar `docs/specs/backlog.md`: DEBT-069/070/071 → resueltas, con nota
      de qué queda vivo (DEBT-040, DEBT-067, DEBT-061).
- [ ] Revertir `jwt_expiry` en `mirp-lab` y apagar el proxy; dejar el script
      versionado y documentado para el próximo incidente.

## Decisiones pendientes del usuario

> Ninguna se implementa sin respuesta explícita. Cada una lleva su recomendación
> razonada.

**D-A — Presupuesto global del middleware.** Recomendado: **8 s**. Vercel corta
a 25 s y el gate necesita margen para construir y devolver el HTML del 503; 8 s
deja ~3× de holgura y sigue estando ~20× por encima del peor caso legítimo
medido en `auth_logs` (389 ms). *Consecuencia a aceptar:* con Auth realmente
lento, el usuario espera hasta 8 s antes de ver el 503 — pero ve el 503
diseñado, no la pantalla cruda de Vercel.

**D-B — Cómo se acota el bucle interno de auth-js.** Recomendado: **`Promise.race`
+ `AbortController` compartido, las dos juntas**. El controller corta de raíz
(incluidos los reintentos internos); el race es el cinturón ante cualquier ruta
del SDK que no propague la señal. *Sub-pregunta:* ¿un `reason: "timeout"` nuevo
en `AuthUnavailableReason`, o reutilizar `"network"`? Recomendado: **`"timeout"`
nuevo** — cuesta una línea y hace que Sentry distinga "el transporte estaba
lento" de "no hubo red", que es justo la distinción que costó un día
diagnosticar.

**D-C — Presupuesto de los clientes de datos.** Recomendado: **6 s para
`server.ts` y `actions.ts`** (las consultas normales están en decenas de ms, así
que 6 s es ~100× el caso normal y ~50× mejor que los 300 s de hoy) y **10 s para
`service.ts`, decidido aparte**, porque su singleton alimenta los 10 módulos que
sirven `/api/*` y los MCPs, donde sí hay operaciones legítimamente más largas
(altas por lotes, publicación de variantes). Si se prefiere un solo número para
los tres, que sea 10 s.

**D-D — Qué se renderiza cuando una consulta de datos aborta.** Recomendado:
**dos comportamientos distintos, no uno**. En el camino de sesión/autorización
(`getAuthCheck`, `hasCourseAccess`): traducir el abort a `unavailable` y usar el
destino que ya existe, `/servicio-no-disponible`. En las consultas de datos de
página (progreso, asistencia, autoevaluación): **no redirigir**, propagar al
error boundary de ruta con copy de infraestructura — redirigir el sitio entero
porque falló una consulta de progreso sería desproporcionado, y la lección es
legible sin ella.

**D-E — Qué es "ruta pública" (bloquea la Fase 4).** Recordar el Hallazgo 3:
**hoy no hay ninguna**. Opciones:

- **E1 — Abrir `/` y `/grupo-investigacion` a navegación anónima en modo
  degradado**, solo ante `network`/`server`, con el contenido de curso siempre
  cerrado por `requireCourseAccess`. *Recomendada.*
- **E2 — Cerrar DEBT-069 como "no aplica en la forma en que fue redactada"** y
  quedarse con las Fases 1-3. Defendible: si todo el producto exige sesión, el
  503 total es *coherente* con el producto, y la Fase 4 solo añade superficie de
  riesgo a la política de seguridad de `spec-046`.
- **E3 — Abrir además el listado de lecciones de un curso** (`/[courseSlug]`)
  como catálogo público. Cambio de producto mayor, fuera de un spec de
  resiliencia.

> Lectura honesta de E1: salva `/` y `/grupo-investigacion`, **no** las
> lecciones. Si el objetivo era "que un estudiante pueda seguir leyendo durante
> una caída", **E1 no lo consigue** y ese objetivo pertenece a otro spec
> (contenido cacheado/ISR sin Auth). Si el objetivo es "que el sitio no muera
> del todo y la portada siga en pie", E1 lo consigue.

**D-F — La navbar en modo degradado.** Si se adopta E1, un usuario **con sesión
válida** que caiga en el camino degradado verá la navbar de anónimo, y creerá
que lo desconectaron — que es literalmente la deuda que `spec-046` cerró
(DEBT-042). Recomendado: **un banner discreto y persistente** ("estamos con
problemas de conexión; tu sesión no se ha cerrado") cuando el estado sea
degradado. Requiere que `app/layout.tsx` distinga `anonymous` de `unavailable`,
lo que roza [[DEBT-040]] sin resolverla.

## Criterios de aceptación

**DEBT-071**

1. Con el proxy inyectando 8 s de latencia en `/auth/v1/token` y `jwt_expiry=60`,
   una navegación con sesión caducada recibe el **503 de `spec-046`** en ≤ el
   presupuesto de D-A, y **nunca** un 504 ni un error de invocación.
2. Con el proxy en `--hang` sobre `/auth/v1/*`, el middleware responde 503 en ≤
   presupuesto de D-A, medido de extremo a extremo (no por el log interno).
3. El evento de Sentry del gate incluye la duración observada y el motivo
   (`deadline` vs. clasificación).
4. Con Supabase sano (proxy sin retardo), el tiempo del middleware no empeora
   respecto de hoy: navegación autenticada, anónima y `/admin` sin regresión.

**DEBT-070**

5. Con el proxy en `--hang`, una petición a `/[courseSlug]` termina en ≤
   presupuesto de D-C, no en 300 s.
6. Ninguna ruta renderizada por Server Component supera el presupuesto de D-C
   esperando a Supabase; verificado en `/`, `/[courseSlug]`,
   `/[courseSlug]/[lessonSlug]`, `/cuenta/cursos` y `/admin`.
7. Al abortar una consulta de datos, el usuario ve el mensaje de infraestructura
   de D-D: **no** "Algo salió mal", **no** un 500 crudo, **no** página en blanco.
8. Un estudiante **matriculado** que sufre un timeout en `hasCourseAccess`
   **no** es enviado a `/cuenta/cursos?sinAcceso=…`.
9. Los 5 MCPs siguen funcionando contra `/api/*` con Supabase sano, y ante
   `--hang` fallan con un error acotado en ≤ presupuesto de `service.ts`, no
   colgados.

**DEBT-069** *(solo si D-E se resuelve por E1)*

10. Con `reason: "network"`, un visitante anónimo puede cargar `/` y
    `/grupo-investigacion`.
11. Con `reason: "network"`, `/[courseSlug]/[lessonSlug]` **sigue** produciendo
    503 o el redirect de acceso — nunca contenido de lección.
12. Con `reason: "misconfigured"`, **todas** las rutas producen 503, incluidas
    las de (10). D4 intacto.
13. `/api/*` sigue exento del gate por completo (D3 de `spec-046`), verificado
    con los MCPs y no solo por lectura del código.

**Transversales**

14. `npm run build` y `npm run lint` pasan sin errores.
15. `scripts/latency-proxy.mjs` está versionado y documentado, y **no** añade
    ninguna dependencia a `package.json`.

## Qué es verificable dónde

| Escenario | Local (`mirp-lab` + proxy) | Solo producción |
|---|---|---|
| Deadline global respetado (CA 1-2) | ✅ reproducible a voluntad | — |
| Timeout de clientes de datos (CA 5-6) | ✅ | — |
| Render degradado y copys (CA 7-8) | ✅ | — |
| Alcance del 503 (CA 10-13) | ✅ | — |
| Tags de Sentry (CA 3) | ⚠️ Sentry solo se activa con `NODE_ENV=production` + DSN (`lib/observability/sentry-enabled.ts`) → requiere build de producción y DSN de prueba | Confirmación final |
| Desaparición de los 504 `MIDDLEWARE_INVOCATION_TIMEOUT` | ❌ | ✅ por ausencia |
| Desaparición de `Task timed out after 300 seconds` | ❌ | ✅ ídem |
| Proporción real de 503 evitados (E1) | ❌ | ✅ vía los tags de la Fase 4 |

Las tres últimas filas son la limitación estructural de este spec: la causa es
latencia de un tercero y no se puede convocar. Por eso los criterios de
aceptación se formulan **contra el proxy**, que reproduce el mecanismo, y la
verificación en producción se define como una **ventana de observación de 7 días
de los runtime logs de Vercel** tras el despliegue — no como un caso de prueba
puntual. Así, el paso `[TESTING] → [DONE]` no queda rehén de que Supabase vuelva
a fallar.

## Residuo declarado

Aunque este spec cierre las tres deudas, **[[DEBT-067]] sigue abierta y es
visible**: durante una caída, cualquier Server Action (`signIn`, `signOut`,
`changePassword`, `withdrawStudentAction`…) que reciba el 503 en HTML plano
seguirá disparando el error boundary genérico en vez del mensaje honesto. Con
este spec el 503 llegará **antes** (8 s en vez de 25 s de espera muda), lo cual
es mejor, pero el mensaje seguirá siendo el equivocado. Resolver 071+070+069
mejora el **tiempo** y el **alcance** del degradado; DEBT-067 es la que falta
para que el **mensaje** también sea correcto en todos los caminos.

## Pruebas asociadas

> Creadas junto con el spec (ver CLAUDE.md → "Artefactos que acompañan al spec").

- **Manuales:** `docs/testing/test-054-resiliencia-latencia-supabase.md` — casos
  `TC-054-001` … `TC-054-014` y `TC-MCP-054-001/002`.
- **Automáticas (e2e/unit):** pendientes de que exista framework de testing (ver
  CLAUDE.md → "Testing"). Los criterios de aceptación 1-2 y 5-6 son los mejores
  candidatos a prueba automatizada contra el proxy de la Fase 0.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- [x] Decisiones D-A … D-F resueltas
- **Fecha de aprobación:** 2026-08-29

### Decisiones tomadas (2026-08-29)

- **D-A** — 8 s de deadline global en el middleware.
- **D-B** — `AbortController` compartido + `Promise.race` como cinturón,
  ambos juntos (recomendación aceptada). `reason: "timeout"` nuevo en
  `AuthUnavailableReason`, distinto de `"network"`.
- **D-C** — 6 s en `lib/auth/server.ts` y `lib/auth/actions.ts`; 10 s en el
  singleton `lib/auth/service.ts` (recomendación aceptada, valores
  diferenciados).
- **D-D** — dos comportamientos: camino de sesión/autorización degrada a
  `/servicio-no-disponible`; consultas de datos de página propagan al error
  boundary de ruta con copy de infraestructura, sin redirigir.
- **D-E** — **E1**: ante `reason: "network" | "server"`, `/` y
  `/grupo-investigacion` quedan abiertas a navegación anónima en modo
  degradado. Las rutas de curso y lección siguen exigiendo sesión y
  matrícula sin excepción (D4 de spec-046 intacto). `misconfigured` y
  `unknown` no activan esta excepción en ninguna ruta.
- **D-F** — banner discreto y persistente en el layout cuando el estado sea
  degradado, para que un usuario con sesión válida no crea que se cerró.

### Implementación completada (2026-08-29)

Fases 0-5 implementadas. `npm run build` y `npm run lint` pasan sin errores.
Verificación empírica del mecanismo de DEBT-071 (Fase 1) contra `mirp-lab` con
el proxy de la Fase 0: una réplica exacta del bucle de reintentos de
`@supabase/auth-js@2.108.2` (mismo backoff, mismo predicado de corte a 30s)
tardaba **8002ms** en resolver con el deadline global implementado, contra los
~26.600ms que el mismo bucle tarda sin él (tabla del Hallazgo 1) — confirma
que el `AbortController` compartido + `Promise.race` cortan el bucle dentro
del presupuesto de D-A.

Dos desviaciones menores respecto al plan original, ambas documentadas en el
código:

- `lib/auth/errors.ts` gana el mapeo de `DOMException` que pedía la Fase 1,
  pero se verificó en `node_modules/@supabase/auth-js` que en la práctica es
  inalcanzable desde `supabase.auth.getUser()`: el SDK ya envuelve cualquier
  abort en `AuthRetryableFetchError` antes de que llegue a `classifyAuthError`.
  Queda como cinturón de seguridad, no como corrección de un bug real.
- La Fase 3 (D-D, "root layout nunca lanza") resultó ya satisfecha por
  construcción: `getCurrentProfile`/`getCurrentRoles` ya degradaban a
  `null`/`[]` sin lanzar antes de este spec (gap de DEBT-040, fuera de
  alcance) — aplicar el timeout de la Fase 2 convirtió esa degradación de
  "eventual, tras 300s" a "acotada, en 6s", sin necesitar tocar
  `app/layout.tsx` más allá del banner de D-F. `lib/enrollments/access.ts`
  (`hasCourseAccess`) igual: ya clasificaba el error de una consulta abortada
  como `unavailable`, verificado sin necesidad de cambio.

### Ronda de pruebas manuales completada (2026-08-29)

18/18 aprobados (16 casos de UI/temporización + 2 de MCP), ver
`docs/testing/test-054-resiliencia-latencia-supabase.md`. La ronda encontró y
corrigió **tres bugs reales** en la implementación, cada uno con commit
propio:

1. `AbortSignal.any()` no soportado en el Edge Runtime de Next.js — el
   mecanismo primario de la Fase 1 fallaba en silencio, solo el
   `Promise.race` de respaldo (D-B) salvaba el resultado.
2. `AbortSignal.timeout()` produce `name: "TimeoutError"`, que
   `@supabase/postgrest-js` no reconoce como "no reintentable" (solo
   `"AbortError"`) — el timeout de datos de la Fase 2 prometía 6s y tardaba
   ~31s reales.
3. `app/layout.tsx` encadenaba sus llamadas en serie (pagando el timeout dos
   veces) y el banner de D-F no cubría el caso "sesión válida, perfil sin
   cargar".

Dos observaciones que no requirieron cambio de código: `TC-054-007` reveló
que el código de progreso de lección ya degrada en silencio ante un fallo de
consulta, sin propagar ninguna excepción — el copy de `INFRA_ERROR_COPY`
queda como cobertura defensiva, no verificada en ejecución real con el
código actual. Y `mirp-lab` apareció sin ningún dato de dominio
(estudiantes/cursos) al iniciar la ronda, ajeno a este spec — registrado como
[[DEBT-072]].

Pendiente, no bloqueante para `[DONE]` (según lo definido en la sección "Qué
es verificable dónde"): la ventana de observación de 7 días en producción
tras el despliegue, descrita en `docs/testing/test-054-*.md`.
