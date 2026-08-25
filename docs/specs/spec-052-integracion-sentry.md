# spec-052 — [IN PROGRESS] Integración de Sentry: reporte remoto de errores en producción

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

`spec-037` (**[DONE]**, 2026-08-01) construyó toda la capa de **contención** de
errores: `app/global-error.tsx`, `app/error.tsx`, `app/(admin)/error.tsx`,
`app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx`, el boundary de componente
`components/ErrorBoundary.tsx` y la presentación compartida
`components/ErrorState.tsx`. También corrigió el antipatrón por el que los
`catch` de `lib/attendance`, `lib/self-assessment` y `lib/progress` degradaban
fallos de infraestructura a valores de negocio.

Lo que ese spec **explícitamente dejó fuera** (sección "No incluye") es la otra
mitad del problema:

> **Observabilidad / reporte remoto de errores** (Sentry o equivalente). El
> `digest` de Next queda solo en los logs de Vercel.

Hoy la única observabilidad son los `console.error` que el propio spec-037 dejó
en su sitio con esta nota (Fase 4):

> Mantener los `console.error`: son la única observabilidad **hasta que exista
> Sentry**.

Consecuencia práctica en producción (`https://www.nod0.dev`): cuando un
estudiante o un docente ve el `ErrorState` con un `digest`, ese `digest` solo se
puede cruzar entrando a mano al panel de Vercel, buscando en los *runtime logs*
del deployment correcto, dentro de la ventana de retención del plan. Un error de
render en cliente (React) **ni siquiera llega ahí**: muere en la consola del
navegador del usuario. En clase proyectada, con el curso mirando, nadie va a
pedirle al estudiante que abra las DevTools y copie un stack trace.

Este spec cierra ese hueco: engancha **Sentry** a los boundaries que ya existen,
para que cada excepción llegue con su stack, su `digest`, su ruta y su release.
No crea boundaries nuevos ni cambia la UI que ve el usuario.

**Proyecto Sentry ya creado** (por el usuario, previo a este spec):
organización `instituto-tecnologico-metropol`, proyecto `nodo-edu`, plataforma
`javascript-nextjs`. El DSN existe y **no se escribe en código ni en ningún
archivo rastreado por git**: entra como variable de entorno (ver Fase 1).

## Alcance

### Incluye

- **Captura server-side**: errores no atrapados en Server Components, Server
  Actions y Route Handlers (`app/api/**`, 24 rutas).
- **Captura client-side**: errores de render de React en el navegador,
  enganchados a los boundaries existentes.
- **Solo producción**: el SDK queda **deshabilitado** en `npm run dev` y en el
  entorno de desarrollo local contra `mirp-lab`. Ningún evento sale de una
  máquina de desarrollo (ver **D1**).
- **Dependencia nueva `@sentry/nextjs`** en `dependencies` — ya confirmada por
  el usuario (ver **D2**).
- **Configuración de entorno**: `NEXT_PUBLIC_SENTRY_DSN` en `.env.example` (sin
  valor) y en Vercel → *Settings → Environment Variables*, **solo** para el
  entorno `Production`.
- **Higiene de datos**: no enviar PII por defecto; depurar cookies y cabeceras
  de autenticación antes del envío (ver **D5**).
- **Página de diagnóstico** bajo `/admin`, para poder verificar la integración
  en producción sin romperle la sesión a nadie (ver **D6**).

### No incluye

- **Session Replay** — decisión del usuario. No se instala ni se importa la
  integración; su bundle no debe entrar al cliente.
- **Performance / Tracing** (transacciones, spans, Web Vitals) — decisión del
  usuario. `tracesSampleRate: 0`.
- **Sentry Cron Monitors, Profiling, Logs, User Feedback widget.**
- **Cambiar la UI de error.** `ErrorState` se ve exactamente igual antes y
  después; sigue mostrando el `digest` y **nunca** el `message` de la excepción.
- **Crear boundaries nuevos** ni mover los existentes. Se enganchan los cuatro
  `error.tsx`/`global-error.tsx` y el `ErrorBoundary` de clase que ya hay.
- **Reemplazar los `console.error` existentes.** Se suman, no se sustituyen: en
  desarrollo (con Sentry apagado) siguen siendo la única señal.
- **Instrumentar los errores *manejados***. Los resultados discriminados que
  introdujo spec-037 (`status: 'unavailable'`, `MarkAttendanceResult`, etc.) son
  valores de retorno, no excepciones: no se reportan a Sentry en este spec.
  Convertirlos en eventos de Sentry es un frente propio (ver "Deuda registrada").
- **Alertas, reglas de notificación, integración con Slack/correo** dentro de
  Sentry. Es configuración de panel, no de código; queda para el usuario.
- **Cambios de esquema de base de datos** ni migraciones.

## Impacto en el sistema

| Archivo | Cambio | Fase |
|---|---|---|
| `package.json` | Modificar — `@sentry/nextjs` en `dependencies` | 1 |
| `.env.example` | Modificar — `NEXT_PUBLIC_SENTRY_DSN` (sin valor) + comentario | 1 |
| `lib/observability/sentry-enabled.ts` | **Crear** — única fuente de verdad del gate "¿está activo?" (D1) | 1 |
| `sentry.server.config.ts` | **Crear** — init del runtime Node | 2 |
| `sentry.edge.config.ts` | **Crear** — init del runtime Edge (`middleware.ts`) | 2 |
| `instrumentation.ts` | **Crear** — `register()` + `onRequestError` | 2 |
| `instrumentation-client.ts` | **Crear** — init del navegador | 3 |
| `app/global-error.tsx` | Modificar — `captureException` (hoy no reporta nada) | 4 |
| `app/error.tsx` | Modificar — `captureException` junto al `console.error` del `useEffect` | 4 |
| `app/(admin)/error.tsx` | Modificar — ídem | 4 |
| `app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx` | Modificar — ídem | 4 |
| `components/ErrorBoundary.tsx` | Modificar — `captureException` en `componentDidCatch` | 4 |
| `app/(admin)/admin/diagnostico-sentry/page.tsx` | **Crear** — página de verificación (D6) | 5 |
| `app/(admin)/admin/diagnostico-sentry/actions.ts` | **Crear** — server action que lanza a propósito | 5 |
| `app/(admin)/admin/diagnostico-sentry/SentryDiagnostics.tsx` | **Crear** — client component que lanza a propósito | 5 |
| `.gitignore` | Modificar — `.sentryclirc` | 1 |
| `CLAUDE.md` | Modificar — tabla de variables de entorno + stack | 6 |
| `docs/specs/backlog.md` | Modificar — registrar DEBT nueva (ver Fase 6) | 6 |
| `middleware.ts` | **Sin cambios** — el runtime Edge se instrumenta por config, no por código | — |
| `components/ErrorState.tsx` | **Sin cambios** — presentación pura, no toca Sentry | — |
| `mcp-servers/**` | **Sin cambios** — procesos Node fuera de Next (ver "Evaluación MCP") | — |

### Puntos de captura y qué cubre cada uno

| Punto | Qué captura | Mecanismo |
|---|---|---|
| `instrumentation.ts` → `onRequestError` | Excepciones de Server Components, Server Actions y Route Handlers durante una request | Hook nativo de Next 15+/16, `Sentry.captureRequestError` |
| `sentry.server.config.ts` | Excepciones no atrapadas y *unhandled rejections* del proceso Node | `Sentry.init` en `register()` |
| `sentry.edge.config.ts` | Fallos en `middleware.ts` (runtime Edge) | `Sentry.init` en `register()` |
| `instrumentation-client.ts` | Errores globales del navegador (`onerror`, `onunhandledrejection`) | `Sentry.init` en cliente |
| `app/error.tsx` y hermanos | El error que ya llegó al boundary de ruta, **con su `digest`** para poder cruzarlo con los logs de Vercel | `captureException` manual |
| `components/ErrorBoundary.tsx` | Fallo aislado del panel de asistencia / formulario del estudiante, que **no** desmonta la página y por eso no llega a ningún `error.tsx` | `captureException` en `componentDidCatch` |

> Los cuatro `error.tsx` **sí** son necesarios además del hook de request: un
> error de render en **cliente** (hidratación, interacción del usuario) nunca
> pasa por `onRequestError`. Y `global-error.tsx` es el único punto que ve un
> fallo de `app/layout.tsx` (limitación de App Router documentada en spec-037).
> Sí existe solape parcial en el caso "error de render en servidor": Sentry
> deduplica por huella, y el evento del boundary aporta el `digest`, que el del
> hook no siempre trae.

## Evaluación MCP

**¿Aplica MCP?** **No.**

Las cuatro preguntas del checklist de CLAUDE.md dan negativo:

1. *¿Expone datos que un agente podría necesitar consultar?* No datos **del
   proyecto**. Sentry almacena telemetría de la propia app, no entidades del
   dominio educativo (cursos, lecciones, preguntas, estudiantes, asistencia).
   Un agente docente no consulta stack traces para preparar una clase.
2. *¿Permite acciones que un agente debería poder ejecutar?* No. Las acciones que
   introduce este spec son de infraestructura (inicializar un SDK, reportar una
   excepción) y ocurren sin intervención: no hay superficie invocable.
3. *¿Existe un MCP que cubra un dominio relacionado?* No. Los cinco MCPs del
   proyecto (`question-bank`, `assignment`, `attendance`, `students`, `courses`)
   son clientes HTTP de `app/api/**` y modelan dominio académico. Ninguno tiene
   parentesco con observabilidad, y extender cualquiera de ellos con
   herramientas de Sentry rompería su cohesión.
4. *¿Hay un agente en `docs/mcps/` que se beneficiaría del cambio?* No. Ninguno
   de los cinco system prompts cambia de capacidades: este spec no modifica
   `app/api/**` ni los contratos que consumen.

*Contra-argumento considerado y descartado:* podría alegarse que un agente de
soporte se beneficiaría de leer *issues* de Sentry para diagnosticar un fallo
reportado en clase. Cierto — pero eso ya lo cubre el **MCP oficial de Sentry**
(externo, mantenido por Sentry), que se conecta con las credenciales de la
organización sin escribir una línea en este repo. Construir un MCP propio sería
duplicar un cliente de API de terceros, no exponer un dominio nuestro. Si el
usuario quiere esa capacidad, es un cambio de configuración de cliente MCP,
fuera del alcance de un spec de código.

Los servidores de `mcp-servers/**` tampoco se instrumentan: son procesos Node
independientes que corren **solo en local** (ver CLAUDE.md → "Claude Code —
Configuración de MCPs"), y este spec activa Sentry únicamente en producción.

## Fases de implementación

### Fase 1 — Dependencia, variables de entorno y gate de activación
- [x] Instalar `@sentry/nextjs` con `npm install @sentry/nextjs` — queda en
      `dependencies` (se ejecuta en runtime de producción, no es herramienta de
      build). `package-lock.json` entra en el commit.
- [x] Agregar a `.env.example`, en el bloque "Variables de la APP", la entrada
      `NEXT_PUBLIC_SENTRY_DSN=` **sin valor**, con un comentario que indique:
      dónde se obtiene (Sentry → proyecto `nodo-edu` → *Settings → Client Keys
      (DSN)*), que **solo** se carga en Vercel → *Settings → Environment
      Variables* con alcance `Production`, y que **no debe ponerse en
      `.env.local`** — hacerlo activaría el reporte desde la máquina de
      desarrollo (ver D1).
- [x] Crear `lib/observability/sentry-enabled.ts`: única fuente de verdad del
      gate, exportando el DSN y un booleano `isSentryEnabled`. Regla (D1):
      **activo solo si hay DSN y `NODE_ENV === "production"`**. Sin `any`, sin
      non-null assertions sobre `process.env` (a diferencia de
      `lib/auth/server.ts`: aquí la ausencia del DSN es un estado válido, no un
      error de configuración).
- [x] Agregar `.sentryclirc` a `.gitignore` (el CLI de Sentry puede generarlo
      con un token dentro).
- [x] Verificar que **no** aparece el DSN literal en ningún archivo rastreado:
      `git grep -n "ingest.us.sentry.io"` devuelve vacío salvo este spec y el
      archivo de pruebas.

### Fase 2 — Captura server-side (Node + Edge)
- [ ] Crear `sentry.server.config.ts` con `Sentry.init({ dsn, enabled, environment: "production", tracesSampleRate: 0, sendDefaultPii: false, beforeSend })`.
      **No** registrar integraciones de Replay ni de tracing (fuera de alcance).
- [ ] Crear `sentry.edge.config.ts` con la misma forma, para el runtime en el que
      corre `middleware.ts`. `middleware.ts` **no se edita**.
- [ ] Crear `instrumentation.ts` en la raíz:
      - `register()` importa dinámicamente el config según
        `process.env.NEXT_RUNTIME` (`"nodejs"` → server, `"edge"` → edge).
      - Exportar `onRequestError = Sentry.captureRequestError` — es lo que
        engancha Server Components, Server Actions y las 24 rutas de `app/api/**`
        sin tocar ninguna de ellas.
- [ ] Implementar `beforeSend` compartido (D5): descartar el evento si
      `isSentryEnabled` es falso (segunda barrera, defensa en profundidad) y
      depurar `request.cookies`, la cabecera `Authorization` y cualquier cabecera
      cuyo nombre contenga `api-key` — por ahí viajan `QUESTION_BANK_API_KEY`,
      `STUDENTS_ADMIN_API_KEY` y `COURSES_ADMIN_API_KEY`.
- [ ] **No** envolver `next.config.ts` con `withSentryConfig` (D4 descartada por
      el usuario): sin subida de source maps, no aporta nada en este spec.
      `next.config.ts` **no se modifica**.
- [ ] Verificar que `npm run build` pasa y que `npm run dev` **no** imprime
      ningún aviso de conexión con Sentry.

### Fase 3 — Captura client-side
- [ ] Crear `instrumentation-client.ts` en la raíz (convención de Next 15.3+ /
      Next 16; sustituye al antiguo `sentry.client.config.ts`) con el mismo
      `Sentry.init` gateado por `isSentryEnabled`.
- [ ] Confirmar explícitamente que **no** se importa
      `Sentry.replayIntegration()` ni `browserTracingIntegration()`: fuera de
      alcance y ambos engordan el bundle del cliente.
- [ ] Exportar `onRouterTransitionStart` desde `instrumentation-client.ts`
      (`Sentry.captureRouterTransitionStart`) solo si el SDK lo requiere para no
      emitir avisos en build; con tracing apagado no aporta datos.
- [ ] Comprobar el peso añadido al bundle del cliente (`npm run build`) y
      registrarlo en el spec al cerrar la fase, para tener el dato si más
      adelante se evalúa Replay.

### Fase 4 — Enganche a los boundaries existentes de spec-037
- [ ] `app/error.tsx`, `app/(admin)/error.tsx` y
      `app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx`: dentro del `useEffect`
      que ya existe, **añadir** `Sentry.captureException(error)` junto al
      `console.error` actual (que se conserva: es la única señal en desarrollo).
      Adjuntar el `digest` como *tag* para poder cruzarlo con los runtime logs de
      Vercel y con el código que ve el usuario en pantalla.
- [ ] `app/global-error.tsx`: hoy **no tiene `useEffect` y no reporta nada**.
      Añadir el reporte del `error` que recibe por props. Cuidado: este boundary
      solo se ve cuando el root layout ya falló — todo lo que se agregue debe ser
      a prueba de fallos y no puede romper su render (ver la nota de D2 en
      spec-037 sobre el `<script>` que rompió TC-037-006). El `captureException`
      va dentro de un `useEffect`, nunca en el cuerpo del render.
- [ ] `components/ErrorBoundary.tsx`: añadir `Sentry.captureException` en
      `componentDidCatch`, aprovechando el `errorInfo` de React para adjuntar el
      *component stack*. Es el único punto que ve los fallos aislados del panel de
      asistencia proyectado en clase, que por diseño **no** escalan a ningún
      `error.tsx`.
- [ ] Etiquetar los eventos con su origen (`boundary: "global" | "root" |
      "admin" | "lesson" | "component"`) para poder filtrar en el panel de Sentry.
- [ ] Verificar que ninguna de estas ediciones cambia lo que ve el usuario:
      `ErrorState` recibe exactamente las mismas props que antes.

### Fase 5 — Página de diagnóstico y verificación en producción
- [ ] Crear `app/(admin)/admin/diagnostico-sentry/page.tsx`: página bajo
      `/admin`, por tanto ya protegida por el gate de rol `teacher`/`admin` del
      `middleware.ts` (D6). Sin enlace en la navegación admin: se llega por URL.
- [ ] Botón "Probar error de servidor" → server action en `actions.ts` que lanza
      una excepción con un mensaje reconocible (`"Sentry server-side check"`).
- [ ] Botón "Probar error de cliente" → client component que lanza dentro de un
      handler (`"Sentry client-side check"`), envuelto en el `ErrorBoundary`
      existente para que el fallo degrade solo su recuadro.
- [ ] Texto en la página advirtiendo, en español, que estos botones generan
      errores **reales** que llegarán a Sentry y que no deben usarse durante una
      clase en curso.
- [ ] Desplegar y ejecutar `docs/testing/test-052-integracion-sentry.md` contra
      producción (es la única forma de verificar: en desarrollo el SDK está
      apagado por diseño). El despliegue lo inicia el usuario, con confirmación
      explícita, siguiendo la sección "Despliegue" de CLAUDE.md.

### Fase 6 — Documentación y deuda
- [ ] `CLAUDE.md`: añadir `NEXT_PUBLIC_SENTRY_DSN` a la tabla de "Variables de
      entorno", indicando que **solo** se carga en Vercel/Production. Añadir
      Sentry al bloque "Infraestructura" del stack y al checklist de "Verificar
      variables de entorno en Vercel" del proceso de despliegue.
- [ ] `docs/specs/backlog.md`: registrar dos deudas nuevas (usar los
      correlativos que correspondan al leer el backlog):
      - **Errores *manejados* sin telemetría**: los resultados discriminados de
        spec-037 (`status: "unavailable"` en `lib/attendance`, el estado
        indeterminado de `getSelfAssessmentStatus`, el
        `auth.status === "unavailable"` de `middleware.ts` + spec-046) señalan
        fallos reales de infraestructura que **nunca lanzan** y por tanto Sentry
        no verá. Hoy solo dejan un `console.error` en los logs de Vercel.
        Convertirlos en eventos explícitos (`captureMessage` con nivel
        `warning`) es el siguiente paso natural de observabilidad y merece su
        propio spec.
      - **Stack traces de cliente sin source maps (D4 descartada)**: los
        eventos de Sentry originados en el navegador quedan con código
        minificado. Retomar `withSentryConfig` + `SENTRY_AUTH_TOKEN` es un
        cambio acotado si en el futuro la legibilidad se vuelve necesaria.
- [ ] Actualizar la sección "No incluye" de `spec-037` con una nota que enlace a
      este spec, para que la próxima lectura no vuelva a diagnosticar el hueco
      como abierto.
- [ ] `npm run lint` y `npm run build` sin errores; ningún `any` nuevo.

## Criterios de aceptación

1. Con la app desplegada en producción, provocar un error server-side (server
   action de la página de diagnóstico) genera un *issue* nuevo en el proyecto
   `nodo-edu` de Sentry, con stack trace y la ruta de origen.
2. Provocar un error client-side (React, botón de la página de diagnóstico)
   genera un *issue* en Sentry, distinguible del anterior por su origen.
3. En `npm run dev` (entorno local contra `mirp-lab`), provocar los mismos
   errores **no** genera ningún evento en Sentry: el SDK no se inicializa y no
   sale ninguna petición a `*.ingest.us.sentry.io`.
4. `git grep -n "ingest.us.sentry.io"` no devuelve ninguna coincidencia en
   código, configuración ni `.env.example`; solo en documentación de este spec.
5. El DSN de producción está configurado en Vercel → *Settings → Environment
   Variables* con alcance `Production` únicamente, y **no** existe en
   `.env.local`.
6. Un fallo dentro del panel de asistencia (`ErrorBoundary`) llega a Sentry
   **sin** desmontar la página: el artículo y la navegación siguen visibles.
   No hay regresión de los criterios 1-4 de spec-037.
7. `app/global-error.tsx` sigue renderizando correctamente (`<html lang="es">`
   propio, sin FOUC de tema) con el reporte a Sentry ya integrado — el criterio 6
   de spec-037 sigue pasando.
8. La UI de error no cambia: `ErrorState` muestra el mismo copy y sigue sin
   exponer nunca el `message` de la excepción al usuario.
9. Ningún evento enviado a Sentry contiene cookies de sesión de Supabase, la
   cabecera `Authorization` ni ninguna de las tres claves de servicio del
   proyecto (verificable en el JSON del evento en el panel de Sentry).
10. El bundle del cliente **no** incluye Session Replay ni Browser Tracing.
11. `npm run build` y `npm run lint` pasan sin errores; ningún `any` nuevo.
12. La ruta `/admin/diagnostico-sentry` es inaccesible para un estudiante
    (redirige a `/`, por el gate de rol del `middleware.ts`).

## Decisiones

| # | Decisión | Resolución |
|---|---|---|
| **D1** | ¿Cómo se garantiza "solo producción"? | **Gate por DSN + `NODE_ENV`**, no por `VERCEL_ENV`. `isSentryEnabled = Boolean(DSN) && NODE_ENV === "production"`. Doble candado: `npm run dev` tiene `NODE_ENV === "development"` (falla el segundo), y el entorno local contra `mirp-lab` **además** no tiene el DSN en `.env.local` (falla el primero). Descartado depender solo de `VERCEL_ENV`: obliga a tener activada la exposición de *System Environment Variables* en Vercel y no protege un `npm run build && npm run start` local, que sí es `production`. Con este gate, incluso ese caso queda apagado mientras el DSN no esté presente. |
| **D2** | ¿`@sentry/nextjs` en `dependencies` o `devDependencies`? | **`dependencies`**. El SDK se ejecuta en runtime (servidor y cliente), no solo en build. Ponerlo en `devDependencies` rompería el deploy de Vercel, que instala solo `dependencies` en producción. |
| **D3** | ¿Nombre de la variable del DSN? | **`NEXT_PUBLIC_SENTRY_DSN`**. El DSN se necesita en el cliente, así que el prefijo `NEXT_PUBLIC_` es obligatorio y el valor **será visible en el bundle** — eso es correcto y esperado: un DSN solo permite *escribir* eventos, no leerlos, y Sentry lo diseña para ser público. Aun así no se hardcodea, para poder rotarlo o apagarlo desde Vercel sin un deploy de código. El mismo valor sirve para servidor y cliente: no hacen falta dos variables. |
| **D4** | ¿Subir source maps a Sentry en el build? | **No, descartado por el usuario.** No se envuelve `next.config.ts` con `withSentryConfig` ni se gestiona `SENTRY_AUTH_TOKEN`. Consecuencia aceptada: los stack traces de cliente en Sentry quedan **minificados** (`chunk-abc123.js:1:45678`) hasta que se decida abordarlo, que queda anotado como deuda en la Fase 6. La captura sigue funcionando igual — el `digest` y el stack de servidor no se ven afectados, solo la legibilidad del stack de cliente. |
| **D5** | ¿Qué se depura antes de enviar? | **`sendDefaultPii: false` + `beforeSend` explícito** que elimina `request.cookies`, la cabecera `Authorization` y toda cabecera con `api-key` en el nombre. Motivo: los usuarios son estudiantes reales identificables por correo institucional, y las cabeceras de las 24 rutas de `app/api/**` llevan claves de servicio con permisos de admin. Un stack trace útil no necesita ninguna de las dos cosas. |
| **D6** | ¿Cómo se verifica en producción sin molestar a nadie? | **Página bajo `/admin`**, no una ruta pública tipo `/sentry-example-page` (lo que genera el asistente oficial). Motivo: `/admin` ya está protegido por el gate de rol del `middleware.ts`, así que ningún estudiante puede dispararlo por accidente, y la página queda como herramienta permanente para verificar la integración tras cada cambio de configuración — no un andamio que hay que acordarse de borrar. |
| **D7** | ¿Se enganchan los boundaries a mano si `onRequestError` ya captura del lado servidor? | **Sí, ambos.** `onRequestError` no ve los errores de render en **cliente** (hidratación, interacción), y ningún hook de request ve un fallo de `app/layout.tsx` — solo `global-error.tsx`. Además, el `ErrorBoundary` de componente atrapa fallos que por diseño **no** escalan a ningún `error.tsx` (esa es justo su razón de ser en spec-037): sin el enganche manual serían invisibles. El solape parcial en el caso "render en servidor" lo resuelve la deduplicación de Sentry, y el evento del boundary aporta el `digest` que ve el usuario. |
| **D8** | ¿`tunnelRoute` para esquivar bloqueadores de anuncios? | **No por ahora.** Añade una ruta proxy en la app y hace que todo el tráfico de telemetría pase por Vercel (coste de función). El público son estudiantes de ingeniería en clase, y perder un porcentaje de eventos de cliente por *ad blockers* es aceptable frente a la captura server-side, que no se ve afectada. Reevaluable si el volumen client-side resulta sospechosamente bajo. |
| **D9** | ¿Se reportan a Sentry los errores *manejados* de spec-037? | **No en este spec.** Los `status: "unavailable"` son valores de retorno, no excepciones: instrumentarlos exige decidir nivel, huella y umbral de ruido caso por caso, en tres dominios distintos. Se registra como deuda en la Fase 6 para un spec propio. Este spec entrega primero la captura de lo que hoy se pierde por completo. |

## Pruebas asociadas

> Estos archivos se crean junto con el spec (CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-052-integracion-sentry.md` — casos
  `TC-052-001` … `TC-052-012`, mapeados 1:1 a los criterios de aceptación.
  Ojo: los casos 1, 2, 6, 7, 9 y 12 solo son verificables **en producción**,
  porque el SDK está apagado en desarrollo por diseño (D1). Requieren
  confirmación explícita del usuario para ejecutarse contra producción y no
  crean datos de dominio (solo *issues* en Sentry, que se resuelven al cerrar
  la ronda).
- **Automáticas (e2e/unit):**
  `{{ubicación e2e por definir}}/e2e-052-integracion-sentry.spec.ts` — pendiente
  del framework de testing (CLAUDE.md → "Testing"). Los criterios 4, 10 y 11 son
  verificables por grep/CLI desde ya.
- Sin MCP → sin casos `TC-MCP`.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario, sin D4 (sin source maps / `SENTRY_AUTH_TOKEN`)
- **Fecha de aprobación:** 2026-08-25
