# spec-037 — [NOT STARTED] Manejo de errores: boundaries y señalización honesta de fallos de infraestructura

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Este spec cierra **[[DEBT-037]]**, nacida de `TC-007` de
`docs/testing/test-fix-attendance-panel-flicker.md` (2026-08-01): con el túnel
SSH a `mirp-lab` caído, el docente vio el overlay *"An unexpected response was
received from the server"* apuntando a `TeacherAttendanceControl.tsx:97`.

> ⚠️ **El backlog diagnostica mal esta deuda.** DEBT-037 afirma que `openSession`
> *"hace `throw error` ante cualquier fallo de Supabase … la excepción no la
> recoge nadie"*. **Es falso.** Los 5 `throw` de `lib/attendance/index.ts`
> (líneas 75, 112, 137, 147, 170) están **todos** dentro de un `try/catch` de su
> propia función —el de la línea 75 se atrapa cuatro líneas más abajo— y se
> convierten en un valor de retorno. Ninguno se propaga. El spec nace, por tanto,
> contradiciendo su propia fuente de origen; la Fase 7 corrige la entrada del
> backlog para que la próxima lectura no repita el error.

El problema real es de tres capas, y ninguna es la que describe el backlog.

### (A) Los `catch` mienten

Degradan fallos de infraestructura a valores **indistinguibles de un caso
legítimo de negocio**:

| Función (`lib/attendance/index.ts`) | Ante fallo devuelve | La UI lo lee como |
|---|---|---|
| `getOpenSessionForCourse` | `null` | "No hay sesión abierta" |
| `getSessionAttendanceCount` | `0` | "Nadie ha marcado asistencia" |
| `markAttendanceByCode` | `'not_found'` | "Tu código es incorrecto" |
| `getStudentAttendanceForCourse` | `{sessionOpen:false, alreadyMarked:false}` | "El docente no abrió sesión" |

Solo `openSession` y `closeSession` devuelven un error honesto. En clase esto
significa que el contador **proyectado** cae a `0` ante un fallo de red, y que
un estudiante con el código correcto recibe "código no válido" y lo reescribe
cinco veces.

Además, `createServerSupabaseClient()` se invoca **fuera del `try`** en las 6
funciones exportadas (líneas 40, 104, 126, 162, 183, 222). `lib/auth/server.ts`
usa non-null assertions (`!`) sobre ambas variables de entorno, así que un
`.env` incompleto lanza ahí, fuera de toda protección. Es la **única** ruta que
hoy sí propaga una excepción cruda desde este módulo.

### (B) No existe ningún error boundary

`find app -name "error.tsx" -o -name "global-error.tsx"` devuelve **cero
resultados**. Solo hay dos `not-found.tsx`, en `app/(cursos)/[courseSlug]/` y
`.../[lessonSlug]/`. Cuando algo lanza, el usuario cae en la pantalla genérica
de Next.js y pierde el contexto de dónde estaba.

### (C) El caso observado no lo cierra ninguno de los dos anteriores

El error de `TC-007` es un fallo de **transporte del server action**: la
respuesta RSC llegó malformada porque el túnel estaba caído. La excepción **no
nace dentro** de `openSession` —nace en el runtime de React al deserializar la
respuesta, ya de vuelta en el cliente—, así que ningún `try/catch` del servidor
puede atraparla. Un `error.tsx` de segmento **sí** la atraparía, pero al precio
de **desmontar la lección entera**: el docente pierde artículo, navegación y
panel, con la pantalla proyectada ante el curso.

El remedio correcto es envolver la **invocación** del server action en un
`try/catch` en el propio Client Component, de modo que un fallo de transporte
alimente el banner inline que ya existe (herencia de **[[DEBT-018]]**) sin
desmontar nada. El boundary queda como red de seguridad de último recurso, no
como mecanismo principal.

### (D) El mismo antipatrón abre un gate de negocio

Detectado al analizar este spec, y **más grave que todo lo anterior**:
`getSelfAssessmentStatus` (`lib/self-assessment/index.ts`) degrada en su `catch`
a `requiresAttempt: false`, y `markLessonCompleted` (`lib/progress/index.ts:79-82`)
lo usa como *gate*:

```
const status = await getSelfAssessmentStatus(courseSlug, lessonSlug);
if (status.requiresAttempt && !status.hasAttempt) {
  return { ok: false, reason: "self_assessment_pending" };
}
```

**Un fallo de lectura de base de datos abre el gate**: el estudiante marca la
lección como completada sin haber respondido la autoevaluación. Es el único
caso encontrado en que un error no solo confunde, sino que **debilita una regla
de negocio**. En el mismo flujo, el `upsert` de `lesson_progress`
(`lib/progress/index.ts:84`) descarta su `error` por completo —ni siquiera lo
destructura—, así que un fallo de escritura también **reporta éxito**.

Por decisión del usuario (2026-08-01), este frente entra en este spec en vez de
aplazarse a uno propio.

## Alcance

### Incluye

- **Frente 1 — Boundaries de App Router:** `global-error.tsx`, `error.tsx` y los
  boundaries de zona que se justifiquen, más un boundary de componente
  reutilizable.
- **Frente 2 — Señalización honesta** en las 6 funciones de
  `lib/attendance/index.ts` y su propagación a los 4 consumidores.
- **Frente 3 — `try/catch` cliente** alrededor de las 4 invocaciones de server
  action del dominio de asistencia. Es el frente que cierra `TC-007`.
- **Frente 4 — Cerrar el gate de autoevaluación:** que un fallo de
  infraestructura no permita completar una lección sin responder, y que un
  `upsert` fallido no reporte éxito.

### No incluye

- **Observabilidad / reporte remoto de errores** (Sentry o equivalente). El
  `digest` de Next queda solo en los logs de Vercel.
- **Corregir el antipatrón en los demás dominios.** Un barrido de `lib/` muestra
  ~40 sitios con `const { data } = await supabase…` descartando `error` al
  destructurar. Se registran como deuda nueva (ver Fase 7), no se abordan aquí.
- **Instalar Flowbite/shadcn** (**[[DEBT-036]]**) ni normalizar tokens `dark:`
  (**[[DEBT-015]]** / **[[DEBT-032]]**). Se sigue el patrón vigente del repo:
  token semántico + clase cruda `dark:`.
- **Cambios de esquema de base de datos.** Este spec no toca migraciones.
- `loading.tsx` ni estados de carga.

## Impacto en el sistema

| Archivo | Cambio | Fase |
|---|---|---|
| `components/ErrorState.tsx` | Crear — presentación pura de estado de error | 1 |
| `components/ErrorBoundary.tsx` | Crear — boundary de React de clase | 3 |
| `app/global-error.tsx` | Crear | 2 |
| `app/error.tsx` | Crear | 2 |
| `app/(admin)/error.tsx` | Crear | 2 |
| `app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx` | Crear | 2 |
| `lib/attendance/types.ts` | Modificar — tipos de resultado discriminados | 4 |
| `lib/attendance/index.ts` | Modificar — las 6 funciones exportadas | 4 |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Modificar (`:86`, `:116`) | 3, 5 |
| `components/courses/TeacherLessonPanel.tsx` | Modificar (`:11`, `:43`) | 3, 5 |
| `components/courses/TeacherAttendanceControl.tsx` | Modificar (`:17`) | 5 |
| `components/admin/AdminAttendancePanel.tsx` | Modificar (`:16`, `:44-49`, `:57-84`) | 5, 6 |
| `components/courses/AttendanceSection.tsx` | Modificar (`:29`, `:84`, `:95`) | 5, 6 |
| `lib/self-assessment/index.ts` | Modificar — `getSelfAssessmentStatus` | 7 |
| `lib/progress/index.ts` | Modificar — gate y `upsert` (`:79-92`) | 7 |
| `docs/specs/backlog.md` | Modificar — corregir DEBT-037; añadir DEBT-040/041 | 8 |
| `docs/testing/test-fix-attendance-panel-flicker.md` | Modificar — enlace en TC-007 | 8 |
| `lib/attendance/service.ts`, `app/api/attendance/*` | **Sin cambios** (verificado) | — |

### Llamadores exhaustivos (grep verificado)

| Función | Llamadores |
|---|---|
| `openSession` | `components/admin/AdminAttendancePanel.tsx:60` |
| `closeSession` | `components/admin/AdminAttendancePanel.tsx:76` |
| `getSessionAttendanceCount` | `components/admin/AdminAttendancePanel.tsx:45` (polling 5 s) |
| `getOpenSessionForCourse` | `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:116` **+ interno: `lib/attendance/index.ts:93`** |
| `getStudentAttendanceForCourse` | `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:86` |
| `markAttendanceByCode` | `components/courses/AttendanceSection.tsx:84` |
| `getSelfAssessmentStatus` | `lib/progress/index.ts:79`, `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` |

**Red de seguridad del compilador:** `AttendanceSection.tsx:29` declara
`resultMessages: Record<MarkAttendanceResult, …>`. Al ampliar ese union,
TypeScript **obliga** a cubrir la variante nueva — el `strict: true` del
proyecto actúa como verificación del Frente 2.

**Limitación de la convención de App Router:** un `error.tsx` **no** captura los
errores del layout de su propio segmento. Como `app/layout.tsx` es `async` y
llama `getCurrentProfile()`/`getCurrentRoles()`, un fallo suyo solo lo recoge
`global-error.tsx`. Por eso ese archivo es **obligatorio**, no opcional.

## Evaluación MCP

**¿Aplica MCP?** **No.**

1. Ninguna de las cuatro preguntas de CLAUDE.md da afirmativo: el spec no expone
   datos ni acciones nuevas, reclasifica errores ya existentes en la frontera de
   presentación. Un error boundary es UI de recuperación del navegador, sin
   superficie invocable por un agente.
2. Argumento estructural, más fuerte: `attendance-mcp` es cliente HTTP de
   `app/api/attendance/*`, que importa de **`lib/attendance/service.ts`**. Este
   spec modifica **`lib/attendance/index.ts`**. Son módulos distintos y no hay
   import entre ellos (verificado), así que el MCP no puede verse afectado ni
   siquiera indirectamente y su system prompt no requiere actualización.

*Contra-argumento considerado y descartado:* podría alegarse que un agente
docente se beneficiaría de distinguir "sin sesión" de "no pude consultar". Esa
distinción viviría en `service.ts` y las rutas API, fuera del alcance de este
spec; convertirlo en fase de MCP ampliaría el scope sin cerrar DEBT-037.

## Fases de implementación

### Fase 1 — Componente compartido de UI de error
- [ ] Crear `components/ErrorState.tsx`: presentación pura, props `title`,
      `description`, `onRetry?`, `retryLabel?`, `digest?`.
- [ ] Replicar el look del banner ya existente en
      `components/admin/AdminAttendancePanel.tsx:129-144`: `role="alert"`,
      `border-danger/30 bg-danger/10`, texto `text-danger dark:text-red-300`.
- [ ] Copy en español, sin jerga técnica. Mostrar el `digest` solo como código de
      referencia discreto; **nunca** el `message` de la excepción.
- [ ] Verificar contraste en claro y oscuro contra la tabla de `DESIGN.md`.

### Fase 2 — Boundaries de ruta (Frente 1)
- [ ] `app/global-error.tsx` (`'use client'`). Debe renderizar su propio
      `<html lang="es">`/`<body>`: no hereda fuente ni script de tema. Reinyectar
      el snippet de `prefers-color-scheme` (ver D2).
- [ ] `app/error.tsx` (`'use client'`): red de seguridad global, botón
      "Reintentar" → `reset()`.
- [ ] `app/(admin)/error.tsx`: conserva el chrome admin al fallar.
- [ ] `app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx`: captura fallos de render
      en servidor de la página de lección (las llamadas a datos de `page.tsx:86-128`),
      conservando el layout de lección.
- [ ] **No** crear boundaries en `(auth)`, `cuenta` ni `(cursos)`: `app/error.tsx`
      ya los cubre (ver D1).

### Fase 3 — Boundary de componente para el panel proyectado en clase
- [ ] Crear `components/ErrorBoundary.tsx`: boundary de clase
      (`getDerivedStateFromError` + `componentDidCatch`), con `fallback` y `onReset`.
- [ ] Envolver `<TeacherAttendanceControl>` en `TeacherLessonPanel.tsx:43` — **no**
      `<AdminAttendancePanel>` desde dentro, para que el selector de grupo
      sobreviva al fallo.
- [ ] Envolver `<AttendanceSection>` en la página de lección del estudiante.
- [ ] Objetivo explícito: un fallo del panel degrada **solo su recuadro**; el
      artículo y la navegación siguen en pantalla mientras se proyecta.

### Fase 4 — Señalización honesta en `lib/attendance/index.ts` (Frente 2)
- [ ] Definir en `lib/attendance/types.ts` los resultados discriminados que
      separan negocio de infraestructura (forma en D3).
- [ ] Mover `createServerSupabaseClient()` **dentro** del `try` en las 6 funciones
      exportadas (líneas 40, 104, 126, 162, 183, 222).
- [ ] `getOpenSessionForCourse`: separar "no hay sesión" (`PGRST116`, negocio) de
      fallo de consulta. Actualizar el llamador interno `openSession:93-96`, que
      hoy colapsa ambos en "Error al recuperar la sesión creada".
- [ ] `getSessionAttendanceCount`: dejar de devolver `0` ante fallo (ver D4).
- [ ] `markAttendanceByCode`: separar los tres casos hoy fundidos en `'not_found'`
      — formato inválido (zod, `:189-193`), error del RPC (`:201-204`) y excepción
      (`:213-216`). Ampliar `MarkAttendanceResult`.
- [ ] `getStudentAttendanceForCourse`: distinguir "sin sesión abierta" de "no pude
      consultar". Ojo con `:230`, que hoy funde `error`, `!data` y `data.length === 0`
      en una sola rama.
- [ ] `openSession` / `closeSession`: sin cambio de contrato; solo mover el cliente
      dentro del `try`.
- [ ] Mantener los `console.error`: son la única observabilidad hasta que exista Sentry.

### Fase 5 — Propagación a consumidores
- [ ] `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`: manejar la variante de
      infraestructura en `:86` y `:116`; ajustar el tipo de la prop serializada en cadena.
- [ ] `components/courses/TeacherLessonPanel.tsx:11` y
      `TeacherAttendanceControl.tsx:17`: ajustar `initialSessionsByCourseId`.
- [ ] `components/admin/AdminAttendancePanel.tsx`: aceptar el estado de infra en
      `initialSession`; en el polling (`:44-49`) conservar el último conteo conocido
      y marcarlo como desactualizado en vez de pintar `0` (D4). **Mantener** el guard
      `cancelled` de **[[DEBT-019]]** y no volver a meter el polling en `startTransition`.
- [ ] `components/courses/AttendanceSection.tsx`: añadir la entrada de infra a
      `resultMessages:29` con copy que **no culpe al estudiante** ("No pudimos
      verificar tu código, inténtalo de nuevo"); revisar que `:95` no muestre
      "Sin sesión activa" cuando en realidad la consulta falló.

### Fase 6 — `try/catch` cliente sobre server actions (Frente 3 — cierra `TC-007`)
- [ ] Envolver las 4 invocaciones: `AdminAttendancePanel.tsx:60` (`openSession`),
      `:76` (`closeSession`), `:45` (`getSessionAttendanceCount`) y
      `AttendanceSection.tsx:84` (`markAttendanceByCode`).
- [ ] Ante excepción de transporte, alimentar el `setError`/banner existente en vez
      de dejar que escale al boundary. Esto evita el overlay de `TC-007` **sin**
      desmontar la lección.
- [ ] El fallo del polling **no** debe generar banner en cada tick: degradar
      silenciosamente a "conteo desactualizado".

### Fase 7 — Cerrar el gate de autoevaluación (Frente 4)
- [ ] `lib/self-assessment/index.ts` → `getSelfAssessmentStatus`: dejar de degradar
      a `requiresAttempt: false` en el `catch`. Devolver un estado que el llamador
      pueda distinguir de "esta lección no tiene autoevaluación" (ver D8).
- [ ] `lib/progress/index.ts` → `markLessonCompleted:79-82`: ante estado
      indeterminado, **denegar** el completado con un motivo propio, no permitirlo.
      Fallar cerrado, no abierto.
- [ ] `lib/progress/index.ts:84`: capturar el `error` del `upsert` de
      `lesson_progress` y dejar de reportar éxito ante un fallo de escritura.
- [ ] Mover `createServerSupabaseClient()` dentro del `try` en las 5 funciones de
      `lib/self-assessment/index.ts` donde está fuera.
- [ ] Verificar que el mensaje que ve el estudiante distingue "te falta la
      autoevaluación" de "no pudimos verificarlo ahora".

### Fase 8 — Documentación y deuda
- [ ] Corregir la entrada **DEBT-037** de `docs/specs/backlog.md`: su diagnóstico
      (`openSession` "lanza y nadie recoge") es incorrecto. Dejar constancia del
      diagnóstico real (ver D7).
- [ ] Registrar **DEBT-040** — error de Supabase descartado en la destructuración
      (~40 sitios). Los más costosos: `lib/submissions/index.ts:77` (un fallo al
      contar intentos se lee como "primer intento" y salta `max_attempts`),
      `:204-219` (respuestas vacías → `auto_score = 0` escrito como nota real),
      `lib/enrollments/access.ts:21,37` (un fallo devuelve `not-enrolled` y expulsa
      a un docente legítimo), `lib/grades/index.ts:64` y `lib/questions/index.ts:251`
      (guardas de borrado que no disparan → borran con dependencias y reportan éxito).
- [ ] Registrar **DEBT-041** — `createServerSupabaseClient()` fuera del `try` en
      `lib/academic-courses/index.ts:206` y demás módulos no cubiertos por este spec.
- [ ] Actualizar `docs/testing/test-fix-attendance-panel-flicker.md` enlazando
      `TC-007` a este spec.

## Criterios de aceptación

Verificables cortando el túnel SSH a `mirp-lab` (mismo método que originó `TC-007`).

1. Con la BD inalcanzable, al pulsar "Abrir sesión de asistencia" el docente ve un
   banner inline dentro del panel; **el artículo de la lección y la navegación
   siguen visibles**, sin overlay de Turbopack ni pantalla genérica de Next.
2. Con la BD inalcanzable, el contador de asistentes conserva su último valor
   conocido y se indica que está desactualizado; **nunca muestra `0`** por fallo
   de consulta.
3. Con la BD inalcanzable, un estudiante que envía un código **correcto** ve un
   mensaje de fallo de conexión, **no** "Código no válido".
4. Con la BD inalcanzable y sin sesión abierta, el estudiante no ve "Sin sesión de
   asistencia activa": ve que no se pudo consultar.
5. Al forzar una excepción en el render en servidor de la página de lección, se
   muestra el `error.tsx` del segmento enmarcado por su layout, y "Reintentar"
   (`reset()`) recupera la página cuando la causa desaparece.
6. Al forzar una excepción en `app/layout.tsx`, `global-error.tsx` renderiza una
   página legible en español, con `<html lang="es">` propio y sin FOUC de tema.
7. **Con la BD inalcanzable, un estudiante NO puede marcar como completada una
   lección con autoevaluación pendiente**; ve un mensaje que distingue el fallo
   de verificación de la autoevaluación pendiente.
8. Con la BD inalcanzable, marcar una lección sin autoevaluación **no** reporta
   éxito si el `upsert` falló.
9. `npm run build` y `npm run lint` pasan sin errores; ningún `any` nuevo.
10. `grep -n "createServerSupabaseClient" lib/attendance/index.ts` muestra las 6
    llamadas dentro de su `try`.
11. `app/api/attendance/*` y `attendance-mcp` siguen respondiendo igual (sin
    regresión, al no depender de `index.ts`).
12. Con la app sana, todos los resultados de negocio de `MarkAttendanceResult`
    siguen mostrando el mensaje que mostraban antes.

## Decisiones

| # | Decisión | Resolución |
|---|---|---|
| **D1** | ¿Cuántos `error.tsx` por zona? | **4 archivos**: `global-error` + `app/error` + `(admin)/error` + `[lessonSlug]/error`. Cubren el 100 % de las rutas; añadirlos en `(auth)`, `cuenta` y `(cursos)` solo duplicaría el fallback de `app/error.tsx`. |
| **D2** | En `global-error.tsx`, ¿reinyectar fuente y script de tema? | **Solo el script de tema** (2 líneas, evita un flash blanco cegador en modo oscuro proyectado). Se acepta la fuente de sistema: `global-error` solo se ve si el root layout ya falló, y cargar `next/font` ahí añadiría una vía de fallo dentro del propio manejador de fallos. |
| **D3** | Forma del tipo de retorno del Frente 2. | **Union discriminado explícito** por función (p. ej. `{ status: 'ok', … } \| { status: 'unavailable' }`) en vez de `null`/`0` sobrecargados: TypeScript señala **todos** los llamadores en compilación. Descartado `throw` (rompería el Frente 3) y un `Result<T,E>` genérico (no hay convención así en el repo). |
| **D4** | Ante fallo del polling, ¿qué muestra el contador? | **Último valor conocido + etiqueta discreta "desactualizado"**. Es el número proyectado ante la clase: un `0` es activamente desinformativo, y ocultarlo desmaqueta el panel en vivo. |
| **D5** | ¿Frente 3 dentro de este spec? | **Sí** — decisión del usuario (2026-08-01). Es el único frente que cierra `TC-007`; sin él la deuda se cerraría sin resolver su síntoma. |
| **D6** | ¿El gate de autoevaluación entra aquí? | **Sí** — decisión del usuario (2026-08-01), pese a que amplía el spec a un tercer dominio. Es el único hallazgo donde un error **debilita una regla de negocio**, no solo confunde. |
| **D7** | ¿Corregir la entrada errónea de DEBT-037? | **Sí**, en la Fase 8. Dejar el diagnóstico falso invita a que la próxima lectura repita el error de asumir que los `throw` se propagan. |
| **D8** | Ante fallo, ¿qué devuelve `getSelfAssessmentStatus`? | **Fallar cerrado**: un estado indeterminado explícito que `markLessonCompleted` traduce en denegación. Es preferible bloquear temporalmente a un estudiante honesto que dejar pasar el gate — el bloqueo se revierte solo cuando la BD responde. |

## Pruebas asociadas

- **Manuales:** `docs/testing/test-037-manejo-de-errores.md` — casos `TC-037-001`
  … `TC-037-012`, mapeados 1:1 a los criterios de aceptación.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-037-manejo-de-errores.spec.ts`
  — pendiente del framework de testing (CLAUDE.md → "Testing"). Los criterios 10 y
  11 son verificables por grep/CLI desde ya.
- Sin MCP → sin casos `TC-MCP`.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{pendiente}}
