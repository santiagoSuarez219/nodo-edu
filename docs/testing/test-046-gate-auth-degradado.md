# test-046 — Gate de autenticación honesto ante una caída de Supabase Auth

> Pruebas manuales de `docs/specs/spec-046-gate-auth-degradado.md` (cierra
> **[[DEBT-042]]**). Escritas junto con el spec, antes de la implementación:
> **hoy todos los casos con Auth caído fallan** — ese es el estado esperado
> hasta que la implementación los ponga en verde.

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Curso académico de prueba (creado por SQL directo — no hay endpoint/MCP para crear `academic_courses`, ver `DEBT` en backlog) | `INSERT` manual vía `psql` en `mirp-lab` | `fe52311d-7d26-483b-b9b5-b03d9940e5cc` (`TEST046ED`, slug `estructuras-de-datos`) | ✅ (`DELETE` manual vía `psql`, verificado `count = 0`) |
| Estudiante de prueba | `create_student` (`students-mcp`) | `ec0c2ccd-43d2-41b4-ad0b-cfc4a8e1b603` (`test-spec046@nodo.local` / `TestSpec046!`) | ✅ (`delete_student`, `students-mcp`) |
| Matrícula del estudiante en el curso de prueba (creada junto con el estudiante) | `create_student` (`students-mcp`, `academic_course_id`) | `73f3076b-2612-42d6-94d9-9d6aae1c978b` | ✅ (eliminada en cascada por `delete_student`) |

**Entorno de pruebas:** desarrollo — instancia Supabase local en `mirp-lab` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). **Nunca ejecutar esta ronda contra
producción:** los casos consisten en tumbar el servicio de autenticación.

**Fecha de la ronda:** 2026-08-13

### Cómo simular la caída y cómo restaurarla

Con `npm run dev` corriendo, **cortar** el túnel:

```bash
pkill -f "ssh.*-L 54321.*mirp-lab"
```

**Restaurar** (no hace falta reiniciar `npm run dev`):

```bash
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
  -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab
```

Verificar el estado del túnel en cualquier momento:

```bash
pgrep -f "ssh.*-L 54321.*mirp-lab"   # sin salida = túnel caído
```

> Los casos `TC-046-001` … `TC-046-010` se ejecutan con el túnel **caído**;
> `TC-046-011` … `TC-046-016`, con el túnel **restaurado**. Conviene ejecutarlos
> en ese orden para cortar y restaurar una sola vez.

---

## Casos de prueba

### Bloque A — Con Supabase Auth caído

### TC-046-001 — Docente autenticado recarga `/admin`
**Precondición:** sesión iniciada como `dev@nodo.local`, navegando en `/admin`.
Cortar el túnel **después** de haber cargado la página.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Con sesión activa en `/admin`, ejecutar `pkill -f "ssh.*-L 54321.*mirp-lab"`.
2. Recargar la página (F5).
**Resultado esperado:** aparece la pantalla "No pudimos verificar tu sesión",
con el texto que indica que **la sesión sigue activa** y que no es un problema
de usuario ni contraseña. **No** se redirige a `/login`. Es la inversión exacta
del síntoma de `TC-037-004`.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

### TC-046-002 — Estudiante autenticado recarga `/cuenta/cursos`
**Precondición:** sesión iniciada con el estudiante de prueba, túnel caído.
**Datos de prueba usados:** `test-spec046@nodo.local` / `TestSpec046!`
**Pasos:**
1. Con sesión activa, navegar a `/cuenta/cursos` y recargar.
**Resultado esperado:** misma pantalla 503. Verifica que el fix cubre la
**Capa 2** (`requireUser` en `app/cuenta/cursos/page.tsx:14`), no solo el
middleware.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario). Mensaje exacto: "No pudimos verificar tu sesión" / "El servicio de
autenticación no está respondiendo. Tu sesión sigue activa — esto no es un
problema con tu usuario ni tu contraseña." Sin observaciones adicionales.

### TC-046-003 — Visitante sin sesión entra a `/`
**Precondición:** ventana de incógnito, sin cookies de sesión. Túnel caído.
**Pasos:**
1. Abrir `http://localhost:3000/` en incógnito.
**Resultado esperado:** pantalla 503, **no** `/login`. El gate no puede decidir
y falla cerrado (decisión D4 del spec).
**Estado:** ✅ Aprobado (segunda ronda, tras el fix)
**Hallazgos (primera ronda — fallido):** redirige a `/login?redirectTo=%2F`
(307) en vez de mostrar el 503. Confirmado por el usuario en incógnito real
con túnel caído, y reproducido por curl:
```
curl -sI http://localhost:3002/
HTTP/1.1 307 Temporary Redirect
location: /login?redirectTo=%2F
```
Contradice la decisión D4 (fail closed ante visitante sin sesión y Auth
inalcanzable): el middleware está clasificando el caso "sin sesión + Auth
caído" como `anonymous` en vez de `unavailable`. Bug dentro del alcance del
spec — no se corrige en esta sesión sin aprobación explícita del usuario.

**Causa raíz confirmada por lectura de código** (`lib/auth/middleware.ts:82-94`,
`tryGetUser`): sin cookie de sesión, `supabase.auth.getUser()` del SDK
resuelve `{ data: { user: null }, error: null }` **sin llegar a hacer una
petición de red** a Auth (nada que revalidar contra el servidor). El
middleware nunca entra a la rama `unavailable` porque nunca intenta la
llamada — no es que la clasifique mal, es que no hay señal alguna que
consultar. `checkAuth`/`tryGetUser` fueron diseñados para clasificar el
*resultado* de una llamada a Auth, pero no cubren el caso "no hay nada que
preguntarle a Auth". Corregirlo requeriría una comprobación de salud del
servicio independiente de la sesión del visitante (p. ej. probar Auth de
forma directa) para los casos sin cookie.

**Segunda ronda (post-fix, ejecutada por Claude vía navegador con
autorización explícita del usuario, entorno aislado verificado: túnel
cortado, `54321` libre, sin stack de Docker local corriendo en paralelo):**
`lib/auth/middleware.ts` ahora hace un ping a `GET {supabaseUrl}/auth/v1/health`
en la rama sin cookie, antes de clasificar `anonymous`. `GET /` con túnel
caído y sin sesión → `503` (título de pestaña "Servicio no disponible", texto
"No pudimos verificar tu sesión" visible). Log del servidor:
`[auth] servicio no disponible (network) — /`. Sin regresión confirmada por
curl con Auth sano: `GET /cuenta/cursos` sin cookie → `307` a `/login?redirectTo=…`
(TC-046-011 sigue en verde).

### TC-046-004 — `/login` durante la caída
**Precondición:** incógnito, túnel caído.
**Pasos:**
1. Navegar directamente a `http://localhost:3000/login`.
**Resultado esperado:** pantalla 503, **no** el formulario de login. Verifica que
no se ofrece un login que no puede funcionar — el bucle "no puedo entrar porque
no puedo verificar" que motivó la deuda.
**Estado:** ✅ Aprobado (segunda ronda, tras el fix)
**Hallazgos (primera ronda — fallido):** sirve el formulario de login normal
(`200 OK`), no el 503. Confirmado por el usuario y reproducido por curl:
```
curl -sI http://localhost:3002/login
HTTP/1.1 200 OK
```
Es exactamente el bucle que motivó `DEBT-042`/spec-046: el visitante ve un
formulario de login que no puede funcionar (Auth caído), sin ninguna
indicación de que el problema es del servicio y no de sus credenciales.
Misma causa raíz que TC-046-003 (ver sus hallazgos): sin cookie de sesión,
`supabase.auth.getUser()` nunca hace una llamada de red a Auth, así que el
middleware nunca ve un motivo para clasificar el estado como `unavailable` —
`/login` queda exenta del gate (`PUBLIC_PREFIXES`) y se sirve normal. Bug
dentro del alcance del spec — no se corrige en esta sesión sin aprobación
explícita del usuario.

**Segunda ronda (post-fix, mismo entorno aislado que TC-046-003):** `GET /login`
con túnel caído → `503`, título de pestaña "Servicio no disponible". Log del
servidor: `[auth] servicio no disponible (network) — /login`. Recuperación
verificada: al restaurar el túnel y pulsar "Reintentar", `/login` vuelve a
servir el formulario normal (visitante anónimo, sin sesión que preservar —
la aserción de "sesión intacta" de TC-046-009 no aplica aquí, solo que el
gate deja de bloquear).

### TC-046-005 — "Reintentar" con el servicio aún caído
**Precondición:** estar en la pantalla 503, túnel todavía caído.
**Pasos:**
1. Abrir DevTools → pestaña Network, marcar "Preserve log".
2. Pulsar "Reintentar".
**Resultado esperado:** vuelve a la misma pantalla 503. **Sin** cadena de
redirects 307, **sin** pantalla en blanco y **sin** overlay de error de Next.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario). Un único request `GET /cuenta/cursos` → `503` en el log de Network
(sin redirects intermedios); misma pantalla renderizada, sin overlay de Next.
Sin observaciones adicionales.

### TC-046-006 — Status y cabeceras de la respuesta
**Precondición:** túnel caído, DevTools → Network abierto.
**Pasos:**
1. Recargar cualquier ruta protegida.
2. Inspeccionar el documento principal en Network.
**Resultado esperado:** status **503** (no 200, no 307).
Cabeceras presentes: `Cache-Control: no-store, must-revalidate`,
`Retry-After`, `X-Robots-Tag: noindex`,
`Content-Type: text/html; charset=utf-8`.
3. Recargar de nuevo **sin** forzar caché: no se sirve una copia cacheada.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario), con una limitación de tooling: las herramientas de automatización
disponibles solo exponen `statusCode` de cada request, no las cabeceras
crudas (`fetch` con cookies de sesión resultó bloqueado por una política de
seguridad del propio tool de JS, y `F12` no abre un DevTools inspeccionable
en un tab controlado por la extensión). Verificación alternativa: (1) status
`503` confirmado en el log de red en dos recargas sucesivas — sin cache
servida; (2) el cuerpo renderizado coincide exactamente con
`renderServiceUnavailablePage()`; (3) inspección directa de
`middleware.ts:29-37` confirma que las cuatro cabeceras del criterio
(`Content-Type`, `Cache-Control: no-store, must-revalidate`, `Retry-After`,
`X-Robots-Tag: noindex`) se fijan incondicionalmente en la misma respuesta
que produjo ese `503` y ese cuerpo — no hay lógica condicional que pueda
omitirlas. Se recomienda una verificación visual directa en DevTools real
(fuera de la extensión) antes de dar el criterio por definitivo si se
requiere certeza al 100%.

### TC-046-007 — Navegación de cliente (no recarga) durante la caída
**Precondición:** sesión activa, app cargada, túnel **aún levantado**.
**Pasos:**
1. Con la app abierta, cortar el túnel.
2. Sin recargar, hacer clic en un enlace de la navbar (navegación RSC del router).
**Resultado esperado:** se acaba en la pantalla 503. El router degrada a
navegación dura. **No** aparece el overlay de error de Next ni el mensaje
genérico "Algo salió mal" de `app/error.tsx`.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario). Clic en "Mis cursos" desde `/` (app ya cargada, sin recargar antes
de cortar el túnel) terminó en `/cuenta/cursos` con la pantalla 503, sin
overlay de Next ni error genérico. Sin observaciones adicionales.

### TC-046-008 — Las rutas `/api/*` siguen devolviendo JSON (protege a los 5 MCPs)
**Precondición:** túnel caído. Tener a mano `QUESTION_BANK_API_KEY` de `.env.local`.
**Pasos:**
1. Ejecutar una petición autenticada por API key, p. ej.:
   ```bash
   curl -i -H "x-api-key: $QUESTION_BANK_API_KEY" \
     http://localhost:3000/api/questions
   ```
**Resultado esperado:** la respuesta **no** es el HTML del 503. Puede fallar por
la base de datos caída, pero debe seguir siendo **JSON** con el error propio del
endpoint. Cubre la decisión D3 del spec: si `/api` recibiera HTML, los cinco
MCPs del proyecto se romperían.
**Estado:** ✅ Aprobado
**Hallazgos:**
```
HTTP/1.1 500 Internal Server Error
content-type: application/json
{"error":{"code":"internal_error","message":"Error interno del servidor"}}
```
Falla por la base de datos caída (como anticipa el propio caso), pero se
mantiene JSON — `/api` queda correctamente exenta del gate de spec-046. Sin
observaciones adicionales.

### TC-046-009 — Recuperación con la sesión intacta ⭐
**Precondición:** estar en la pantalla 503 con sesión previamente activa
(continúa desde `TC-046-001`).
**Pasos:**
1. Restaurar el túnel con el comando `ssh -f -N -L 54321:…` de arriba.
2. Pulsar "Reintentar" en la pantalla 503.
**Resultado esperado:** se vuelve a la app **sin tener que iniciar sesión de
nuevo**. Es el criterio de aceptación central del spec: la caída no cerró la
sesión de nadie.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario), continuando desde la sesión del estudiante de prueba (TC-046-002),
no la del docente de TC-046-001 — misma aserción, distinto rol. Al restaurar
el túnel y pulsar "Reintentar", volvió directo a `/cuenta/cursos` mostrando
el curso matriculado, sin pasar por `/login`. Sin observaciones adicionales.

### TC-046-010 — Legibilidad en modo claro y oscuro
**Precondición:** túnel caído, pantalla 503 visible.
**Pasos:**
1. Cambiar la preferencia del sistema operativo a modo oscuro y recargar.
2. Cambiar a modo claro y recargar.
**Resultado esperado:** la pantalla es legible en ambos (contraste suficiente,
sin texto invisible ni flash blanco cegador). Nota: esta pantalla **no** carga
`globals.css` ni JetBrains Mono por diseño (decisión D1 del spec, mismo
precedente que `app/global-error.tsx`), así que la tipografía será la del
sistema — eso es esperado, no un hallazgo. Verificar solo legibilidad y que el
tema respeta `prefers-color-scheme`, como se validó en `TC-037-006`.
**Estado:** ✅ Aprobado
**Hallazgos:** confirmado por el usuario: legible en modo claro y oscuro, sin
texto invisible ni flash blanco cegador.

---

### Bloque B — Regresión, con Supabase Auth sano

> **Restaurar el túnel antes de este bloque.** Confirmar con
> `pgrep -f "ssh.*-L 54321.*mirp-lab"` que hay salida.

### TC-046-011 — El gate real sigue vivo: visitante sin sesión
**Precondición:** incógnito, túnel restaurado.
**Pasos:**
1. Navegar a `http://localhost:3000/cuenta/cursos`.
**Resultado esperado:** redirige a `/login?redirectTo=/cuenta/cursos`. **El fix
no debe haber aflojado el gate**: sin sesión se sigue exigiendo login, con el
`redirectTo` correcto.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario), cerrando sesión en vez de incógnito real (mismo tab, misma
aserción). URL final: `/login?redirectTo=%2Fcuenta%2Fcursos`. Sin
observaciones adicionales.

### TC-046-012 — Estudiante autenticado entra a `/admin`
**Precondición:** sesión iniciada con el estudiante de prueba.
**Datos de prueba usados:** `test-spec046@nodo.local` / `TestSpec046!`
**Pasos:**
1. Navegar a `http://localhost:3000/admin`.
**Resultado esperado:** redirige a `/`. La comprobación de rol vía `user_roles`
sigue igual que antes (queda fuera del alcance del spec, ver "No incluye").
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario). `/admin` redirigió a `/` para el estudiante de prueba. Sin
observaciones adicionales.

### TC-046-013 — Sin regresión de spec-045
**Precondición:** sesión iniciada (cualquier rol).
**Pasos:**
1. Navegar a `http://localhost:3000/login`.
**Resultado esperado:** redirige a `/`, como estableció spec-045.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario). Sin observaciones adicionales.

### TC-046-014 — Ciclo completo de login / logout
**Precondición:** sin sesión, túnel restaurado.
**Pasos:**
1. Iniciar sesión con el estudiante de prueba.
2. Navegar a `/cuenta`; debe cargar.
3. Cerrar sesión.
4. Navegar a `/cuenta`.
**Resultado esperado:** paso 2 carga con normalidad; paso 4 redirige a `/login`.
Verifica que el caso `anonymous` no quedó contaminado con `unavailable`.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude vía navegador (autorización explícita del
usuario). Paso 2: `/cuenta` cargó con normalidad (perfil del estudiante
visible). Paso 4: redirigió a `/login?redirectTo=%2Fcuenta`. Sin observaciones
adicionales.

### TC-046-015 — Cookie de sesión corrupta → `/login`, no 503 ⭐
**Precondición:** sesión iniciada, túnel restaurado.
**Pasos:**
1. DevTools → Application → Cookies → editar a mano el valor de la cookie
   `sb-…-auth-token`, alterando algunos caracteres del JWT.
2. Recargar `/cuenta`.
3. Iniciar sesión de nuevo con las credenciales correctas.
**Resultado esperado:** el paso 2 lleva a **`/login`** (no al 503) y el paso 3
funciona con normalidad. Es el caso de falso positivo del spec: un JWT inválido
produce `AuthApiError` 401/403, que **no** debe clasificarse como
`unavailable`. Sin esto, un usuario con cookies corruptas quedaría atrapado en
un 503 permanente.
**Estado:** ✅ Aprobado
**Hallazgos:** confirmado por el usuario: cookie corrupta llevó a `/login` (no
503), y el login posterior con credenciales correctas funcionó con
normalidad.

### TC-046-016 — Variable de entorno de Supabase ausente
**Precondición:** `npm run dev` detenido. Túnel indiferente.
**Pasos:**
1. Comentar `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`.
2. Arrancar `npm run dev` y abrir cualquier ruta.
3. Revisar la consola del servidor.
4. **Restaurar la variable** y reiniciar `npm run dev`.
**Resultado esperado:** se muestra la pantalla 503 y el log del servidor
registra `configuration_error`. **No** aparece una excepción cruda ni la
pantalla genérica de error de Next. Cubre el tratamiento de las non-null
assertions de `lib/auth/middleware.ts:8-9`.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado por Claude (edición de `.env.local` y reinicio de
`npm run dev` con autorización explícita del usuario). Pantalla 503 servida y
log del servidor:
```
[auth] configuration_error: falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
[auth] servicio no disponible (misconfigured) — /
```
Sin excepción cruda ni pantalla genérica de error de Next. Variable restaurada
y servidor reiniciado al terminar — verificado con `curl` (`307` normal).

---

## Resumen de la ronda

- **Primera ronda:** Aprobados: 14 — Fallidos: 2 (TC-046-003, TC-046-004) —
  Pendientes: 0.
- **Fix aplicado** (`lib/auth/middleware.ts`): sin cookie de sesión,
  `supabase.auth.getUser()` resuelve `AuthSessionMissingError` **localmente**,
  sin llamada de red — el middleware nunca tenía señal para clasificar
  `unavailable` en ese camino. Ahora hace un ping explícito a
  `GET {supabaseUrl}/auth/v1/health` (endpoint público de GoTrue) en esa rama
  específica antes de confiar en `anonymous`, reutilizando el retry/timeout de
  D2 sin código adicional. El caso de JWT inválido/corrupto (TC-046-015) no
  necesitó cambios: ya dispara una llamada de red real dentro de `getUser()`.
- **Segunda ronda (post-fix):** TC-046-003 y TC-046-004 re-ejecutados por
  Claude vía navegador (autorización explícita del usuario) — **ambos
  ✅ Aprobados**. Ver sus hallazgos individuales para el detalle. Sin
  regresión en TC-046-011 (Auth sano, gate normal) ni TC-046-008 (`/api`
  exenta), verificado por curl. `npx tsc --noEmit` y `npm run lint`: limpios.
- **Revisión de código (`@reviewer`):** primera pasada — ❌ CAMBIOS REQUERIDOS.
  Hallazgo bloqueante: `checkAuthHealth()` pingueaba `/auth/v1/health` **sin**
  `apikey`, y el gateway de Supabase hosted (Kong, a diferencia del local en
  `mirp-lab`) exige esa cabecera — verificado contra producción real
  (`https://bgiimadnmqnoqmdbudpo.supabase.co/auth/v1/health` → `401` sin key,
  `200` con key). Sin corregirlo, el fix habría causado 503 para **todo**
  visitante anónimo en producción con Auth perfectamente sano — el mismo
  apagón que el spec busca evitar, ahora causado por el propio remedio.
  Corregido: se manda `apikey`/`Authorization: Bearer`, se mapea `401/403` a
  `misconfigured` (no reintentable) y `429` a `server` (reintentable, dado
  DEBT-059), con log explícito del status crudo. Re-verificado contra
  producción y contra el entorno local (túnel caído/restaurado): sin
  regresión. También se aplicaron los hallazgos mayores: `/api` ahora
  cortocircuita antes de `updateSupabaseSession()` (no paga el ping), y el
  archivo ajeno al spec detectado en el árbol de trabajo (contenido de un
  curso, preexistente a esta sesión) se dejó fuera del commit sin tocarlo.
- **Total final: 16 aprobados — 0 fallidos — 0 pendientes.**
- **Incidente de entorno detectado y resuelto durante la verificación del
  fix:** un stack de Supabase quedó corriendo en Docker Desktop **local**
  (mismo `project` `02-Educational-Page`, puertos 54321-54324) en paralelo al
  túnel SSH a `mirp-lab`, sin que quedara claro qué lo inició. Mientras
  estuvo arriba, cortar el túnel no aislaba nada (`localhost:54321` seguía
  respondiendo vía el stack local), lo que ocultó que el primer intento de
  fix parecía no funcionar. Se detuvo con `supabase stop` (autorización
  explícita del usuario) y se confirmó el puerto libre antes de repetir la
  verificación. Los resultados de la primera ronda (TC-046-001 a 016, previos
  a este incidente) no se ven afectados — el stack local se detectó recién al
  verificar el fix, con timestamp de inicio muy posterior a esos casos.
- Hallazgos escalados a `docs/specs/backlog.md`: **DEBT-060** (no existe
  endpoint/MCP para crear `academic_courses`; se creó el curso de prueba por
  SQL directo con autorización explícita del usuario).
- Limpieza de datos de prueba: ✅ Completada. Estudiante `test-spec046@nodo.local`
  eliminado vía `delete_student` (`students-mcp`, matrícula eliminada en
  cascada); curso `TEST046ED` eliminado por `DELETE` directo en `mirp-lab`
  (mismo mecanismo que su creación — no hay endpoint/MCP de borrado, ver
  DEBT-060). Verificado: `/api/students` devuelve lista vacía y
  `count(*) from academic_courses where code = 'TEST046ED'` → `0` (la query
  citaba antes `'TEST-046'`, un typo detectado en la segunda revisión de
  código — el código real del curso era `TEST046ED`; la limpieza en sí fue
  correcta, la corrigió la @reviewer de forma independiente).
- ⚠️ Verificado: túnel SSH a `mirp-lab` restaurado, `.env.local` con
  `NEXT_PUBLIC_SUPABASE_URL` sin comentar, `npm run dev` respondiendo normal,
  y sin ningún stack de Docker local corriendo en paralelo
  (`docker ps --filter label=com.docker.compose.project=02-Educational-Page`
  → vacío).
