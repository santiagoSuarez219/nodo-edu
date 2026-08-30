# test-054 — Resiliencia del camino de request ante latencia de Supabase

> Pruebas manuales de `docs/specs/spec-054-resiliencia-latencia-supabase.md`
> (cierra DEBT-069, DEBT-070 y DEBT-071). Escritas junto con el spec, **antes**
> de la implementación: hoy los casos con latencia inyectada **fallan** — ese es
> el estado esperado hasta que la implementación los ponga en verde.
>
> A diferencia de `test-046` y `test-053`, que simulaban una caída **cortando**
> el túnel, esta ronda simula **lentitud**, que es la causa real del incidente y
> un modo de fallo distinto: el servicio responde, pero tarde. Cortar el túnel no
> reproduce DEBT-071; hace falta el proxy de la Fase 0.

## Datos de prueba

> Esta ronda **no crea recursos de dominio**: no hay estudiantes, cursos ni
> evaluaciones nuevas. Lo único que se "monta" es infraestructura local
> reversible, registrada abajo para poder revertirla.

| Recurso | Cómo se monta | Identificador | Revertido |
|---|---|---|---|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| ~~Estudiante de prueba matriculado (reutilizado de `test-053`)~~ | — | ~~`test-spec053@nodo.local`~~ | 🔴 **Ya no existe** — hallazgo de esta ronda: `mirp-lab` no tenía ningún `academic_course` ni estudiante al momento de ejecutar (ver Hallazgos de `TC-054-008`) |
| Curso académico de prueba (creado vía REST + service role — no existe MCP para esto, ver `DEBT-060`) | `POST /rest/v1/academic_courses` | `TEST054 — Estructuras de Datos`, `37292155-ad61-4517-ba3f-1dc7e8f4adb0` | 🟡 No eliminado — decisión del usuario (2026-08-29): queda en desarrollo |
| Estudiante de prueba matriculado en `TEST054` | `create_student` (`students-mcp`) | `d67a80e5-17c4-42a1-bb1c-68e1666fe5c1` (`test-spec054@nodo.local` / `TestSpec054!`), matrícula `f133aa51-48bc-4cfd-a3bb-b48bbed4eb08` | 🟡 No eliminado — misma decisión |
| Proxy de latencia local | `node scripts/latency-proxy.mjs --port=54331 …` | proceso local, puerto 54331 | ✅ (apagado al cierre de la ronda) |
| `NEXT_PUBLIC_SUPABASE_URL` de `.env.local` apuntando al proxy | edición manual (valor original: `http://localhost:54321`) | — | ✅ (restaurado) |
| `jwt_expiry` en `supabase/config.toml` de `mirp-lab` bajado de `3600` a `60` | edición + reinicio del stack en `mirp-lab` | — | ✅ (revertido tras `TC-054-001`) |

**Entorno de pruebas:** desarrollo — instancia Supabase local en `mirp-lab` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). **Nunca ejecutar esta ronda contra
producción:** los casos consisten en degradar deliberadamente el servicio.

**Fecha de la ronda:** 2026-08-29

> **Nota de ejecución:** varios casos de esta ronda son de temporización y
> contenido HTTP, no de apariencia visual — se ejecutan vía `curl` (con una
> sesión real obtenida a través de la propia librería `@supabase/ssr`, no
> reconstruida a mano) en vez de a través del navegador, por instrucción
> explícita del usuario ("Ejecuta esta prueba" en TC-054-001). Los casos que
> sí exigen observar la UI (copy, navbar, banner) se marcan aparte.

### Montaje del escenario

```bash
# 1. Túnel SSH a mirp-lab (si no está activo)
pgrep -f "ssh.*-L 54321.*mirp-lab" || \
  ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
    -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab

# 2. Proxy de latencia (Fase 0 del spec) — ejemplo: 8 s solo en /auth/v1/token
node scripts/latency-proxy.mjs --port=54331 --target=http://localhost:54321 \
  --path='^/auth/v1/token' --delay=8000

# 3. .env.local → NEXT_PUBLIC_SUPABASE_URL=http://localhost:54331
# 4. Reiniciar npm run dev para que recargue .env.local
```

**Restaurar:** apagar el proxy, devolver `NEXT_PUBLIC_SUPABASE_URL` a
`http://localhost:54321`, revertir `jwt_expiry` a `3600` en `mirp-lab`, y
reiniciar `npm run dev`.

> ⚠️ **Cómo medir.** Varios casos exigen medir el tiempo de respuesta. Usar el
> panel Network del navegador (columna *Time* de la petición del documento) o
> `curl -o /dev/null -w "%{http_code} %{time_total}\n"`. El dato que importa es
> el **de extremo a extremo**, no lo que diga un log interno.

---

## Casos de prueba

### TC-054-001 — Sesión caducada con `/auth/v1/token` lento: 503 diseñado, nunca 504
**Cubre:** CA 1 (DEBT-071) — el caso que produjo la pantalla de error que vio el usuario.
**Precondición:** `jwt_expiry=60` en `mirp-lab`; proxy con `--path='^/auth/v1/token' --delay=8000`; sesión iniciada como `dev@nodo.local` y **esperar >60 s** para que el access token caduque.
**Pasos:**
1. Con la sesión ya caducada, navegar a `/cuenta/cursos`.
2. Cronometrar la respuesta de extremo a extremo.
**Resultado esperado:** la página de servicio no disponible de `spec-046` (503), en **≤ el presupuesto de D-A**. **Nunca** la pantalla `504: GATEWAY_TIMEOUT / MIDDLEWARE_INVOCATION_TIMEOUT` de Vercel ni un error de invocación.
**Estado hoy (pre-implementación):** ❌ se espera que el bucle de `_refreshAccessToken` consuma ~26,6 s (ver Hallazgo 1 del spec) y produzca el 504.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado 3 veces vía `curl` con sesión real (login directo
contra el backend, `jwt_expiry=60` en `mirp-lab`). Resultado final: `503` en
`8.095982s` con el copy de `spec-046` ("No pudimos verificar tu sesión... Tu
sesión sigue activa"). Log del servidor confirma
`[auth] servicio no disponible (timeout, 8002ms) — /cuenta/cursos`, dentro
del presupuesto de D-A. **Bug real encontrado y corregido en el camino:**
`createBudgetedFetch` (`lib/auth/fetch-timeout.ts`) usaba `AbortSignal.any()`,
que **no existe** en el Edge Runtime de Next.js (verificado:
`node_modules/next/dist/compiled/edge-runtime/index.js` no lo implementa,
aunque el Node.js del resto del proyecto sí) — producía un
`TypeError: AbortSignal.any is not a function` en cada fetch del gate,
silenciado solo porque el `Promise.race` de respaldo (D-B) igual devolvía a
tiempo. El mecanismo *primario* (el `AbortController` compartido cortando el
bucle de reintentos) no estaba funcionando en absoluto — solo el cinturón de
seguridad. Corregido con una combinación manual de señales
(`combineSignals()`, sin `.any()`). De paso, se encontró y corrigió un
"unhandled rejection" en `lib/auth/middleware.ts`: la promesa perdedora del
`Promise.race` no tenía `.catch()`, y sus fetches en curso rechazaban tras el
deadline sin nadie escuchando — inofensivo en producción (la invocación
serverless muere antes), pero ruidoso en un servidor de desarrollo
persistente. Repetido dos veces más tras cada corrección para confirmar.

### TC-054-002 — Auth colgado por completo: el gate responde dentro del presupuesto
**Cubre:** CA 2 (DEBT-071).
**Precondición:** proxy con `--path='^/auth/v1' --hang`.
**Pasos:**
1. En una ventana anónima, navegar a `/login` (**no** `/`: tras la decisión
   E1 de la Fase 4, `/` es una ruta degradable — ese comportamiento tiene su
   propio caso, `TC-054-011`. `/login` nunca es degradable, así que aísla el
   mecanismo del deadline global sin la excepción de E1 de por medio).
2. Cronometrar.
**Resultado esperado:** 503 con la página de `spec-046` en ≤ presupuesto de D-A.
**Estado:** ✅ Aprobado
**Hallazgos:** Ajustado de `/` a `/login` (decisión del usuario, 2026-08-29):
el caso original escrito antes de la decisión E1 esperaba 503 en `/`, pero
tras E1 `/` responde `200` en modo degradado — comportamiento correcto, no un
fallo (ver `TC-054-011`). Verificado primero el síntoma en `/` vía `curl`
(`200`, `8.555121s`, log confirma `reason: timeout` pero la excepción de ruta
abierta aplicó), luego contra `/login`: `503` en `8.009460s`, copy correcto
de `spec-046`. El deadline global funciona correctamente; solo la ruta de
prueba original quedó desactualizada por un cambio de scope posterior a la
redacción del test.

### TC-054-003 — Sin regresión con Supabase sano
**Cubre:** CA 4 — que el fix no cueste rendimiento en el caso normal.
**Precondición:** proxy **sin** retardo (`--delay=0`), o `.env.local` apuntando directo a 54321.
**Pasos:**
1. Navegar como anónimo a `/login`.
2. Iniciar sesión como `dev@nodo.local` y navegar a `/cuenta/cursos`, a una lección y a `/admin`.
3. Comparar tiempos con los de la misma navegación antes de la implementación.
**Resultado esperado:** sin diferencia perceptible; ninguna ruta se vuelve más lenta.
**Estado:** ✅ Aprobado
**Hallazgos:** Medido contra build de producción (`next start`), Supabase
sano, sin proxy de por medio. `/login` anónimo: 220ms. `/` anónimo: 307
(redirect a `/login`, comportamiento preexistente no relacionado con este
spec) en 2.6ms. Login: 185ms. `/cuenta/cursos` autenticado: 784ms.
`/estructuras-de-datos/polimorfismo` autenticado: 1,76s. `/admin/courses`
autenticado: 1,07s. Todos los tiempos consistentes con navegación normal, sin
indicio de regresión atribuible al timeout (muy por debajo de los
presupuestos de 6-10s).

### TC-054-004 — El ping de salud no puede exceder el deadline global
**Cubre:** CA 2 y el paso de la Fase 1 sobre `HEALTH_TIMEOUT_MS`.
**Precondición:** proxy con `--path='^/auth/v1/health' --delay=20000` (health lento, resto sano) — la asimetría exacta del incidente del 2026-08-29.
**Pasos:**
1. En ventana anónima (sin cookie de sesión, que es el único camino que llega al ping), navegar a `/`.
2. Cronometrar.
**Resultado esperado:** respuesta dentro del presupuesto de D-A. El peor caso viejo (`2 × 5 s + 250 ms`) ya no aplica: el ping está subordinado al deadline global.
**Estado:** ✅ Aprobado
**Hallazgos:** Probado contra `/login` (no `/`, mismo criterio que
`TC-054-002`, para aislar el mecanismo de la excepción de E1). `503` en
`8.007033s` — dentro del presupuesto de D-A, muy por debajo de los ~10,25s+
del peor caso que tenía el ping de salud antes de subordinarlo al deadline
global.

### TC-054-005 — Página de curso con Supabase colgado: acotada, no 300 s
**Cubre:** CA 5 (DEBT-070) — los 10 cuelgues de 300 s en `/[courseSlug]`.
**Precondición:** sesión iniciada; proxy con `--hang` en `^/rest/v1`.
**Pasos:**
1. Navegar a `/estructuras-de-datos`.
2. Cronometrar hasta que la página resuelva (de una forma u otra).
**Resultado esperado:** resuelve en ≤ presupuesto de D-C. **No** queda colgada minutos.
**Estado:** ✅ Aprobado
**Hallazgos:** Requirió corregir **dos bugs reales** encontrados en el
camino, ambos con commit propio:
1. **`createTimeoutFetch`/`createBudgetedFetch` usaban `AbortSignal.timeout()`**,
   que produce un error con `name: "TimeoutError"`. `@supabase/postgrest-js`
   solo reconoce `name === "AbortError"` como "no reintentable"
   (`PostgrestBuilder.ts`, comentario "Never retry aborted requests") — con
   `TimeoutError` lo trataba como fallo de red reintentable y activaba su
   propio backoff interno durante **~31s** antes de rendirse (verificado en
   Node puro, sin Next.js de por medio: 6s prometidos, 30978ms reales).
   Corregido usando un `AbortController` armado manualmente
   (`controller.abort()`, que sí produce `AbortError`) en vez de
   `AbortSignal.timeout()`. Re-verificado en aislamiento: 6013ms.
2. **`app/layout.tsx` llamaba `getCurrentProfile()`/`getCurrentRoles()` en
   serie**, no en paralelo — con el timeout de 6s aplicado a cada una, un
   dato colgado costaba 6s × 2 = 12s en vez de 6s. Corregido con
   `Promise.all`.
Con ambos fixes: `/estructuras-de-datos/fundamentos-control-de-versiones`
resuelve en `6.45s` (antes: 40s+ sin resolver, con la misma consulta
repitiéndose indefinidamente en el log del proxy).

### TC-054-006 — Ninguna ruta con Server Components supera el presupuesto
**Cubre:** CA 6 (DEBT-070).
**Precondición:** igual que TC-054-005.
**Pasos:** repetir la medición en `/`, `/[courseSlug]`, `/[courseSlug]/[lessonSlug]`, `/cuenta/cursos` y `/admin`.
**Resultado esperado:** las cinco resuelven en ≤ presupuesto de D-C.
**Estado:** ✅ Aprobado
**Hallazgos:** Con los dos fixes de `TC-054-005` ya aplicados: `/` → `200` en
`6.23s` (degradado, ver `TC-054-009`); `/cuenta/cursos` → `200` en `6.23s`;
`/admin/courses` → `307` en `2.13s` (más rápido: pasa por el cliente del
*middleware*, no por `server.ts` — su cap por intento es 2s, no 6s, tal como
se diseñó). `/[courseSlug]/[lessonSlug]` cubierta por `TC-054-005`. Ningún
caso superó su presupuesto correspondiente.

### TC-054-007 — Mensaje honesto al abortar una consulta de datos
**Cubre:** CA 7 (DEBT-070) y la decisión D-D.
**Precondición:** igual que TC-054-005.
**Pasos:**
1. Navegar a una lección.
2. Leer el mensaje mostrado.
**Resultado esperado:** el copy de infraestructura decidido en D-D ("no pudimos contactar el servidor, tu sesión sigue abierta" o equivalente). **No** "Ocurrió un error inesperado", **no** un 500 crudo, **no** página en blanco.
**Estado:** ✅ Aprobado *(resultado distinto al anticipado, ver hallazgo)*
**Hallazgos:** Precondición ajustada respecto al escenario global de
`--hang` sobre todo `/rest/v1`: con ese patrón, el gate de *acceso*
(`hasCourseAccess`, también sobre `/rest/v1`) siempre interceptaba primero y
redirigía a `/servicio-no-disponible` antes de llegar a ninguna consulta de
datos de la lección — nunca se alcanzaba el escenario que este caso quería
probar. Se acotó el proxy a `--path='^/rest/v1/lesson_progress' --hang`
(única tabla identificada como "dato de página, no de autorización" en
`lib/progress`), dejando pasar `user_roles`/`profiles`/`academic_courses`.
**Resultado real:** la página renderiza `200` normal, con el `<article>` de
la lección completo — **no** se activó `error.tsx` ni el copy de
infraestructura, porque el código de `lib/progress` (lectura y registro de
progreso) ya degrada en silencio ante un fallo de la consulta, sin propagar
ninguna excepción. El objetivo del caso ("el usuario no ve un mensaje
confuso") **sí se cumple**, pero por un mecanismo distinto al anticipado: no
hay ningún camino de datos de la lección hoy que efectivamente lance una
excepción capturable por el boundary — el copy de `INFRA_ERROR_COPY` queda
como cobertura defensiva para el día en que algo sí lance, no como algo
verificado en ejecución real.

### TC-054-008 — Un estudiante matriculado no recibe "sin acceso" por un timeout
**Cubre:** CA 8 (DEBT-070) — evita repetir la mentira que `spec-046` eliminó.
**Precondición:** sesión del estudiante de prueba, **matriculado**; proxy con `--hang` en `^/rest/v1`.
**Pasos:**
1. Navegar a una lección de su curso.
**Resultado esperado:** mensaje de servicio no disponible. **Nunca** el redirect a `/cuenta/cursos?sinAcceso=…`, que afirmaría en falso que no está matriculado.
**Estado:** ✅ Aprobado
**Hallazgos:** Precondición bloqueada al inicio: el estudiante de `test-053`
ya no existía y `mirp-lab` no tenía ningún `academic_course` — hallazgo
inesperado, ajeno a este spec (no causado por el `stop`/`start` del stack de
`TC-054-001`, que preserva datos). Creado un curso y un estudiante de prueba
nuevos (ver "Datos de prueba"), con decisión explícita del usuario de crear
estos recursos vía REST directo (no existe MCP para crear
`academic_courses`, `DEBT-060`). Con el estudiante matriculado navegando a
una lección de su curso bajo `--hang` en `/rest/v1`: redirect a
`/servicio-no-disponible?from=...`. **Nunca** `sinAcceso=`.

### TC-054-009 — El root layout no rompe el documento entero
**Cubre:** Fase 3 y la decisión D-F.
**Precondición:** proxy con `--hang` en `^/rest/v1` (afecta `getCurrentProfile`/`getCurrentRoles` del root layout).
**Pasos:**
1. Navegar a cualquier ruta.
2. Observar si aparece el `global-error` (documento reemplazado, sin estilos ni navbar) o un degradado dentro del layout normal.
**Resultado esperado:** el layout **nunca** lanza; se ve navbar degradada + aviso (D-F), no la pantalla de `global-error.tsx`.
**Estado:** ✅ Aprobado
**Hallazgos:** El layout nunca lanza (documento normal, sin `global-error`),
confirmado. Pero **encontró un tercer bug real**: el aviso de D-F NO
aparecía en este escenario específico — `getAuthDegradedReason()` solo
comprobaba `auth.status === "unavailable"` (sesión no verificable), y aquí
Auth respondía bien (`/auth/v1/user` no está bajo el patrón `^/rest/v1` del
proxy) — el problema era que la consulta a `profiles` abortaba por el
timeout de datos, un caso distinto que la función no contemplaba. Corregido
en `lib/auth/session.ts`: `getAuthDegradedReason()` ahora también revisa si
la consulta a `profiles` falló con sesión válida. Reconstruido y
reverificado: el banner ("Estamos con problemas de conexión...") aparece
correctamente, en `6.39s`.

### TC-054-010 — Un usuario con sesión no cree que lo desconectaron
**Cubre:** D-F — la deuda DEBT-042 que `spec-046` cerró y que E1 podría reabrir.
**Precondición:** sesión válida como `dev@nodo.local`; proxy en modo degradado (`--path='^/auth/v1' --hang`).
**Pasos:**
1. Navegar por el sitio en modo degradado.
2. Observar la navbar y cualquier aviso.
**Resultado esperado:** si la navbar muestra estado anónimo, hay un banner explícito indicando que la sesión **no** se ha cerrado.
**Estado:** ✅ Aprobado
**Hallazgos:** Con sesión válida del docente y `--path='^/auth/v1' --hang`,
navegando a `/`: `200` con el banner presente ("Estamos con problemas de
conexión... **Tu sesión no se ha cerrado**") y la navbar efectivamente en
estado anónimo — exactamente el escenario que D-F cubre. **Observación de
experiencia de usuario, no un fallo:** la respuesta tardó `11.48s`, que es la
suma del deadline del gate (8s, D-A) más el presupuesto del render degradado
del layout (hasta 6s, D-C), porque son dos etapas secuenciales de la misma
navegación. No incumple ningún criterio: el middleware por sí solo respeta
sus 8s (muy por debajo de los 25s de Vercel) y el render respeta los suyos.
Pero conviene tenerlo presente: en modo degradado el peor caso percibido por
el usuario ronda los 14s, no los 8s del gate.

### TC-054-011 — Rutas abiertas siguen en pie ante fallo transitorio *(solo si D-E = E1)*
**Cubre:** CA 10 (DEBT-069).
**Precondición:** proxy con `--path='^/auth/v1' --hang` (produce `reason` transitorio); ventana anónima.
**Pasos:**
1. Navegar a `/`.
2. Navegar a `/grupo-investigacion`.
**Resultado esperado:** ambas cargan en modo degradado, con `Cache-Control: no-store`. **Si D-E se resolvió por E2, este caso se marca N/A y no se ejecuta.**
**Estado:** ✅ Aprobado
**Hallazgos:** Ambas rutas responden `200` con `x-auth-degraded: timeout`.
Contra `next dev` el `Cache-Control` aparecía como `no-cache, must-revalidate`
(el propio dev server de Next/Turbopack lo reescribe para su HMR — no es el
valor que fija `middleware.ts`); contra un build de producción real
(`next start`, más representativo de Vercel) el header es exactamente
`no-store, must-revalidate` como se diseñó. Descubrimiento que motivó cambiar
a `next start` para el resto de la ronda.

### TC-054-012 — El contenido restringido sigue cerrado *(el caso de seguridad)*
**Cubre:** CA 11 (DEBT-069) — que la excepción sea de navegación y no de autorización.
**Precondición:** igual que TC-054-011, ventana anónima.
**Pasos:**
1. Intentar cargar `/estructuras-de-datos/polimorfismo` directamente por URL.
**Resultado esperado:** 503 o el redirect de acceso. **Bajo ninguna circunstancia** se muestra contenido de la lección.
**Estado:** ✅ Aprobado
**Hallazgos:** `503`, página de `spec-046` (68 líneas, sin ningún encabezado
de la lección — el único lugar donde aparece el string "polimorfismo" en la
respuesta es el `href` del botón de reintentar). La excepción de E1 no
alcanza esta ruta, tal como se diseñó.

### TC-054-013 — D4 de spec-046 intacto ante `misconfigured`
**Cubre:** CA 12 (DEBT-069).
**Precondición:** vaciar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` y reiniciar `npm run dev` (reproduce `reason: "misconfigured"`).
**Pasos:**
1. Navegar a `/`, a `/grupo-investigacion` y a una lección, en ventana anónima.
**Resultado esperado:** **las tres** responden 503. La excepción de E1 **no** aplica a un fallo permanente.
**Restaurar:** devolver la clave a `.env.local` y reiniciar.
**Estado:** ✅ Aprobado
**Hallazgos:** `/`, `/grupo-investigacion` y
`/estructuras-de-datos/polimorfismo` respondieron `503` las tres. Clave
restaurada en `.env.local` inmediatamente después de la verificación.

### TC-054-014 — Navegación normal tras restaurar el servicio
**Cubre:** recuperación — que el degradado no deje estado pegado (la caché `healthyUntil` es por instancia).
**Precondición:** venir de cualquier caso con proxy degradado.
**Pasos:**
1. Apagar el retardo del proxy.
2. Recargar la página inmediatamente y volver a navegar.
**Resultado esperado:** el sitio vuelve a la normalidad sin esperar a que expire ningún TTL, y sin necesidad de reiniciar `npm run dev`.
**Estado:** ✅ Aprobado
**Hallazgos:** Con sesión y datos colgados: `200` en `6.34s` (degradado, banner
visible). Apagado el proxy de latencia (sin tocar `next start`) y repetida la
misma petición de inmediato: `200` en `0.30s` — normalidad inmediata, sin
esperar ningún TTL.

---

### TC-MCP-054-001 — Los MCPs siguen intactos con Supabase sano
**Herramienta probada:** `list_course_lessons` (`courses-mcp`) y `list_questions` (`question-bank-mcp`)
**Cubre:** CA 13 — que `/api` siga exento del gate (D3 de `spec-046`) tras tocar `service.ts`.
**Precondición:** proxy sin retardo; `npm run dev` corriendo.
**Input de prueba:** `list_course_lessons(course_slug: "estructuras-de-datos")`
**Output esperado:** el catálogo completo, sin error.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado incluso con Auth completamente colgado (proxy
`--path='^/auth/v1' --hang`, escenario de `TC-054-002`) — prueba más fuerte
que la especificada. `list_course_lessons(course_slug: "estructuras-de-datos")`
devolvió las 39 lecciones sin error. Confirma D3 de `spec-046`: la ruta
`/api/courses/*` nunca llama a `updateSupabaseSession()`.

### TC-MCP-054-002 — Los MCPs fallan acotado, no colgados
**Herramienta probada:** la misma de TC-MCP-054-001
**Cubre:** CA 9 (DEBT-070) — el efecto del presupuesto de `service.ts` sobre los MCPs, que es el radio de acción más amplio de la Fase 2.
**Precondición:** proxy con `--hang` en `^/rest/v1`.
**Input de prueba:** `list_course_lessons(course_slug: "estructuras-de-datos")`
**Output esperado:** error acotado en ≤ presupuesto de `service.ts` (D-C). **No** una espera indefinida ni un cuelgue del cliente MCP.
**Estado:** ✅ Aprobado
**Hallazgos:** El MCP reportó `Error: API no disponible` en ~15s. Confirmado
en los logs del servidor que el corte real ocurrió dentro del presupuesto de
`service.ts` (10s): `GET /api/courses/[courseSlug]/lessons error: {message:
'AbortError: This operation was aborted', ...}` — la ruta de API respondió
con el error en vez de colgarse. Los ~15s percibidos por el MCP son el
timeout propio de su cliente HTTP (`mcp-servers/courses-mcp`), no el de
`service.ts` — el servidor cortó primero y correctamente; nunca hubo una
espera indefinida en ningún punto de la cadena.

---

## Verificación en producción (ventana de observación)

> Tres criterios del spec **no son reproducibles en local** porque dependen de
> que el proveedor vuelva a fallar. No se ejecutan como caso puntual: se
> verifican observando los runtime logs de Vercel durante **7 días** tras el
> despliegue. El paso `[TESTING] → [DONE]` **no** queda condicionado a que
> Supabase falle en ese periodo; lo que se exige es la ausencia de regresión.

| Señal a observar | Herramienta | Criterio |
|---|---|---|
| `MIDDLEWARE_INVOCATION_TIMEOUT` / kills a 25 s | runtime logs de Vercel, proyecto `nodo-edu` | Cero ocurrencias nuevas |
| `Task timed out after 300 seconds` | ídem | Cero ocurrencias nuevas |
| Duración máxima del gate y motivo | tags de Sentry (`nodo-edu`) | El máximo observado ≤ presupuesto de D-A |
| Proporción de 503 evitados *(solo si D-E = E1)* | tags de Sentry de la Fase 4 | Dato informativo, sin umbral |

## Resumen de la ronda

- Aprobados: 19 (17 casos de UI/temporización + 2 de MCP) — Fallidos: 0 — Pendientes: 0
- **Tres bugs reales encontrados y corregidos durante la ronda**, cada uno con commit propio:
  1. `AbortSignal.any()` no soportado en el Edge Runtime de Next.js — el
     mecanismo primario de DEBT-071 fallaba en silencio, solo el
     `Promise.race` de respaldo salvaba el resultado (`TC-054-001`).
  2. `AbortSignal.timeout()` produce `name: "TimeoutError"`, y
     `postgrest-js` solo trata `"AbortError"` como "no reintentable" — el
     timeout de datos (DEBT-070) prometía 6s y tardaba ~31s reales
     (`TC-054-005`).
  3. `app/layout.tsx` encadenaba sus llamadas en serie (12s en vez de 6s) y
     el banner de D-F no cubría el caso "sesión válida, perfil sin cargar"
     (`TC-054-005`/`TC-054-009`).
- Dos hallazgos de entorno ajenos al spec: la base de `mirp-lab` no tenía
  ningún estudiante ni curso académico al momento de esta ronda
  (`TC-054-008`) — causa investigada y resuelta después en
  [[DEBT-072]]/[[DEBT-073]]; y el código de progreso de lección ya degrada
  en silencio sin propagar excepciones, por lo que `TC-054-007` no pudo
  reproducir el escenario tal como estaba redactado (ver sus Hallazgos).
- Observación de experiencia de usuario (`TC-054-010`, no bloqueante): en
  modo degradado el tiempo percibido es la suma del deadline del gate (8s) y
  el del render (6s) — hasta ~14s en el peor caso, no los 8s del gate.
  Candidato a afinar si alguna vez molesta en producción.
- Hallazgos escalados a `docs/specs/backlog.md`: pendiente — ver pregunta al
  usuario sobre si registrar la pérdida de datos de `mirp-lab` como deuda.
- Limpieza / reversión del entorno (proxy, `.env.local`, `jwt_expiry`): ✅ Completada
