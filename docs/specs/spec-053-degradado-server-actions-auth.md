# spec-053 — [DONE] Degradado honesto de Server Actions cuando el gate de Auth responde 503

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

`spec-046` (**[DONE]**, 2026-08-13) hizo que el middleware **fallara cerrado**
cuando Supabase Auth no responde: en vez de expulsar a todo el mundo a `/login`
—una ruta que necesita el mismo servicio caído— devuelve una página de servicio
no disponible (`middleware.ts:44-55`):

```ts
return new NextResponse(renderServiceUnavailablePage(pathname), {
  status: 503,
  headers: { "Content-Type": "text/html; charset=utf-8", ... },
});
```

Esa decisión es correcta para una navegación normal: el visitante ve una página
honesta en vez de un bucle de redirecciones. Pero el `matcher` del middleware
(`middleware.ts:126`) excluye únicamente assets estáticos, así que **el gate
también corre sobre los POST de Server Actions**, que van dirigidos a la URL de
la página actual. Para una Server Action, ese `503 text/html` es una respuesta
que el runtime cliente de Next.js no puede parsear como payload RSC, y lanza:

```
Error: An unexpected response was received from the server.
```

Ese error no lo atrapa nadie en los call sites afectados, así que escala al
error boundary de ruta y **reemplaza la página entera** por el `ErrorState`
genérico.

### Evidencia en producción

`spec-052` (**[DONE]**, 2026-08-26) hizo visible el problema. El issue
**NODO-EDU-4** de Sentry acumuló 4 eventos entre el 2026-08-27 y el 2026-08-28,
todos en producción, todos desde Medellín:

| # | UTC | Hora local (UTC-5) | Ruta | Tag `boundary` | Navegador |
|---|---|---|---|---|---|
| 1 | 27-ago 17:55:29 | 27-ago 12:55 | `/login` | `root` | Edge 151 / Windows |
| 2 | 28-ago 15:20:05 | 28-ago 10:20 | `/login` | `root` | Chrome 152 / Windows |
| 3 | 28-ago 15:37:45 | 28-ago 10:37 | `/estructuras-de-datos/polimorfismo` | `lesson` | Chrome 152 / Windows |
| 4 | 28-ago 15:38:24 | 28-ago 10:38 | `/estructuras-de-datos/polimorfismo` | `lesson` | Chrome 152 / Windows |

Los eventos 2, 3 y 4 son el mismo navegador en 18 minutos: alguien no pudo
iniciar sesión, entró de todas formas, y al enviar la autoevaluación de
`polimorfismo` perdió la lección completa — dos veces, con 39 segundos de
diferencia (reintentó).

### Por qué el diagnóstico es este y no otro

Tres datos lo acotan:

1. **Llegó una respuesta HTTP, no hubo caída de red.** Un fallo de red durante
   una Server Action produce `TypeError: Failed to fetch` / `Load failed` —
   que es exactamente lo que reportan `NODO-EDU-3` y `NODO-EDU-5`, issues
   distintos de la misma semana. `"An unexpected response was received"`
   significa que el servidor **sí** respondió, con algo que no era RSC.
2. **El error nace en el cliente, no en un render de servidor.** Ninguno de los
   4 eventos trae el tag `digest`, y los cuatro boundaries lo adjuntan siempre
   (`tags: { boundary, digest }`, spec-052 Fase 4). Un error de render en
   servidor siempre tiene `digest`.
3. **Solo escalan los call sites sin `try/catch`.** De los componentes cliente
   que invocan Server Actions, `LessonClosure.tsx:35-70` y
   `AttendanceSection.tsx:95-96` **sí** capturan y muestran un mensaje amable;
   no han producido ni un evento. `SelfAssessmentSection.tsx:68` y
   `LoginForm.tsx:11` **no** capturan — y son exactamente las dos rutas de los
   4 eventos. La correlación es total.

### Los tres huecos que este spec cierra

1. **El síntoma es desproporcionado.** Una intermitencia de dos segundos en Auth
   le borra la lección entera a un estudiante en mitad de una autoevaluación
   **calificable** (`spec-040`: la autoevaluación cuenta para la nota). El
   estado del formulario se pierde y no hay forma de reintentar sin recargar.
2. **El gate 503 no reporta a Sentry.** `middleware.ts:45` solo hace
   `console.error`; no hay `captureException` ni `captureMessage`. Por eso no
   existe ningún evento server-side que corrobore la caída de Auth: el
   diagnóstico de NODO-EDU-4 tuvo que inferirse leyendo código. Es la
   consecuencia práctica de **[[DEBT-066]]** (errores *manejados* sin
   telemetría) en el punto más crítico del sistema.
3. **El blindaje es inconsistente.** De 18 componentes cliente que invocan
   Server Actions, 12 no capturan el fallo de transporte. Los 4 eventos salieron
   de 2 de esos 12; los otros 10 son la misma bomba sin estallar.

### Relación con la deuda ya registrada

- **[[DEBT-059]]** (504 por timeout de función en Vercel) produce **el mismo
  error cliente** por el mismo mecanismo: Vercel devuelve HTML de error, no RSC.
  Este spec hace que ese caso también degrade bien, pero **no** aborda la causa
  del pico de latencia. El gate de Auth tarda hasta ~4.25 s en decidirse
  (`lib/auth/middleware.ts:17-18`: 2 intentos × 2 s + 250 ms de backoff), lo que
  acerca peligrosamente cualquier request al límite de la función.
- **[[DEBT-067]]** (sin source maps) es la razón de que los 4 eventos solo
  apunten a `chunks/0w-~z~~6j3s38.js:2:743`. Fuera de alcance aquí.
- No se pudo cruzar con los *runtime logs* de Vercel para confirmar si el
  disparador concreto fue el 503 del gate o un 504 (DEBT-059): el proyecto
  `nodo-edu` no es accesible desde la conexión de Vercel disponible en la
  sesión de diagnóstico. **El mecanismo del error cliente es idéntico en ambos
  casos**, y este spec cubre los dos.

## Alcance

### Incluye

- **Telemetría del gate 503**: reportar a Sentry cada vez que
  `middleware.ts` devuelve la página de servicio no disponible, con el `reason`
  y la ruta (ver **D3**).
- **Blindaje de los call sites cliente** que hoy escalan un fallo de transporte
  al error boundary. Prioridad a los dos con evidencia en producción
  (`SelfAssessmentSection`, `LoginForm`) y barrido de los 10 restantes.
- **Helper compartido** para distinguir un fallo de **transporte** de un fallo
  de **negocio**, de modo que el mensaje al usuario sea honesto y el error no
  se confunda con "datos inválidos" (ver **D2**).
- **Telemetría en el nuevo `catch`**: dejar de escalar al boundary **no** debe
  significar dejar de reportar. Cada fallo de transporte capturado se envía a
  Sentry con `level: "warning"` y tags propios (ver **D4**). Sin esto, este spec
  no arreglaría el problema: lo volvería invisible.
- **Preservar el estado del formulario** en el caso de la autoevaluación: tras
  el fallo, el estudiante debe poder reintentar sin volver a marcar sus
  respuestas.
- **Registro de deuda** para lo que queda fuera (ver Fase 4).

### No incluye

- **Cambiar la política de "fallar cerrado" de `spec-046`** (su D4: un visitante
  sin sesión también debe recibir 503 si Auth no responde). Este spec cambia
  **cómo se comunica** el fallo a un cliente que esperaba RSC, no **cuándo** se
  decide fallar. Ver **D1** — hay una propuesta concreta ahí que requiere
  decisión explícita del usuario.
- **Reintento automático** del Server Action tras un fallo de transporte.
  Reintentar una escritura no idempotente (enviar una autoevaluación de intento
  único, `spec-040`) sin diseñarlo a conciencia es peor que fallar.
- **Atacar [[DEBT-059]]**: ni cacheo del resultado del gate, ni reducción del
  presupuesto de reintentos de `lib/auth/middleware.ts`, ni `maxDuration`.
  Es un frente propio con su propia decisión de riesgo.
- **Source maps de cliente** (**[[DEBT-067]]**).
- **Contexto de usuario en Sentry** (`Sentry.setUser`). Los 4 eventos de
  NODO-EDU-4 dicen `Users: 0` y por eso no se sabe si fue un estudiante o
  cuántos. Se registra como deuda nueva en la Fase 4.
- **Cambios de esquema de base de datos** ni migraciones.
- **Cambiar la UI de `ErrorState`** ni crear boundaries nuevos.

## Impacto en el sistema

| Archivo | Cambio | Fase |
|---|---|---|
| `lib/errors/server-action.ts` | **Crear** — `isServerActionTransportError()` + copy compartido (D2) | 1 |
| `lib/observability/report-transport-error.ts` | **Crear** — envío a Sentry del fallo capturado (D4) | 1 |
| `middleware.ts` | Modificar — reportar el 503 del gate a Sentry junto al `console.error` de la línea 45 (D3) | 2 |
| `components/courses/SelfAssessmentSection.tsx` | Modificar — `try/catch` alrededor de `submitSelfAssessment` (línea 68), preservando el estado del formulario | 3 |
| `components/auth/LoginForm.tsx` | Modificar — envolver `signIn` para que `useActionState` reciba un `AuthResult`, no una excepción (D5) | 3 |
| `components/student/QuestionRenderer.tsx` | Modificar — `try/catch` en `runCodeAction` | 3 |
| `components/account/ChangePasswordForm.tsx` | Modificar — mismo patrón que `LoginForm` (D5) | 3 |
| `components/account/AccountForm.tsx` | Modificar — ídem | 3 |
| `components/account/EnrollmentForm.tsx` | Modificar — ídem | 3 |
| `components/navbar/Navbar.tsx` · `components/navbar/UserMenu.tsx` | Modificar — `<form action={signOut}>`: un fallo aquí escala a `boundary: root` | 3 |
| `components/admin/SubmissionReviewPanel.tsx` | Modificar — `try/catch` | 3 |
| `components/admin/GradeItemsPanel.tsx` | Modificar — ídem | 3 |
| `components/admin/GradeInputCell.tsx` | Modificar — ídem | 3 |
| `components/admin/RecalculateSelfAssessmentButton.tsx` | Modificar — ídem | 3 |
| `docs/specs/backlog.md` | Modificar — registrar **DEBT-068**; anotar en **[[DEBT-059]]** y **[[DEBT-066]]** su relación con este spec | 4 |
| `docs/specs/spec-046-gate-auth-degradado.md` | Modificar — nota en "No incluye" enlazando a este spec | 4 |
| `components/courses/LessonClosure.tsx` | **Sin cambios de estructura** — ya captura; solo se le añade el reporte a Sentry del `catch` existente (línea 67) | 3 |
| `components/courses/AttendanceSection.tsx` | **Sin cambios de estructura** — ídem (línea 96) | 3 |
| `lib/auth/middleware.ts` | **Sin cambios** — la lógica de detección de Auth caído no se toca | — |
| `lib/auth/service-unavailable-page.ts` | **Sin cambios** — la página 503 sigue igual para navegaciones normales | — |
| `components/ErrorState.tsx` · los 4 `error.tsx` | **Sin cambios** — siguen siendo la red de seguridad para todo lo demás | — |

### Auditoría de call sites (estado actual)

Base del barrido de la Fase 3. `catch` = el componente ya distingue un fallo de
transporte de un resultado de negocio.

| Componente | `catch` hoy | Boundary al que escala | Quién lo sufre |
|---|---|---|---|
| `courses/SelfAssessmentSection.tsx` | ❌ | `lesson` | Estudiante — **evidencia en NODO-EDU-4** |
| `auth/LoginForm.tsx` | ❌ | `root` | Cualquiera — **evidencia en NODO-EDU-4** |
| `student/QuestionRenderer.tsx` | ❌ | `root` | Estudiante en evaluación calificable |
| `account/ChangePasswordForm.tsx` | ❌ | `root` | Cualquiera (incluye el cambio forzado de `spec-051`) |
| `account/AccountForm.tsx` | ❌ | `root` | Cualquiera |
| `account/EnrollmentForm.tsx` | ❌ | `root` | Estudiante |
| `navbar/Navbar.tsx` · `navbar/UserMenu.tsx` | ❌ | `root` | Cualquiera (cerrar sesión) |
| `admin/SubmissionReviewPanel.tsx` | ❌ | `admin` | Docente calificando |
| `admin/GradeItemsPanel.tsx` | ❌ | `admin` | Docente |
| `admin/GradeInputCell.tsx` | ❌ | `admin` | Docente |
| `admin/RecalculateSelfAssessmentButton.tsx` | ❌ | `admin` | Docente |
| `courses/LessonClosure.tsx` | ✅ | — | — |
| `courses/AttendanceSection.tsx` | ✅ | — | — |
| `student/AssignmentPlayer.tsx` | ✅ | — | — |
| `admin/PublishAssignmentGroupButton.tsx` | ✅ | — | — |
| `admin/VariantAllocationTable.tsx` | ✅ | — | — |

## Evaluación MCP

**¿Aplica MCP?** **No.**

Las cuatro preguntas del checklist de CLAUDE.md dan negativo:

1. *¿Expone datos que un agente podría necesitar consultar?* No. Lo que produce
   este spec es telemetría (eventos de Sentry) y mensajes de UI. No hay
   entidades del dominio educativo nuevas ni consultables.
2. *¿Permite acciones que un agente debería poder ejecutar?* No. Todos los
   cambios son manejo de errores dentro de flujos ya existentes; no hay
   superficie invocable nueva.
3. *¿Existe un MCP que cubra un dominio relacionado?* No. Los cinco MCPs
   (`question-bank`, `assignment`, `attendance`, `students`, `courses`) son
   clientes HTTP de `app/api/**`, y **este spec no toca ninguna ruta de
   `app/api/**`**: el middleware las cortocircuita antes del gate de Auth
   (`middleware.ts:29-31`), justamente porque se autentican con API key y no
   con cookie de sesión. Los MCPs son, por diseño, inmunes a este bug.
4. *¿Hay un agente en `docs/mcps/` que se beneficiaría del cambio?* No. Ningún
   system prompt cambia de capacidades: los contratos de `app/api/**` quedan
   idénticos.

Consulta de *issues* de Sentry —lo que originó este spec— ya la cubre el MCP
oficial de Sentry, externo al repo; mismo razonamiento que en la "Evaluación
MCP" de `spec-052`.

## Fases de implementación

### Fase 1 — Clasificación del error y reporte compartido
- [x] Crear `lib/errors/server-action.ts` con `isServerActionTransportError(error: unknown): boolean`.
      Reconoce las dos familias observadas en Sentry esta semana:
      `"An unexpected response was received from the server"` (NODO-EDU-4 — llegó
      respuesta no-RSC) y `TypeError: Failed to fetch` / `"Load failed"`
      (NODO-EDU-3 y NODO-EDU-5 — no llegó respuesta). Ver **D2** sobre por qué
      la detección va por mensaje y qué la hace aceptable aquí.
- [x] Exportar desde el mismo módulo el copy compartido en español, para que los
      12 componentes no inventen 12 mensajes distintos. Propuesta:
      *"No pudimos comunicarnos con el servidor. Revisa tu conexión e inténtalo
      de nuevo en un momento."*
- [x] Crear `lib/observability/report-transport-error.ts`: envía el error a
      Sentry con `level: "warning"` y tags `{ transport: "server_action", action: "<nombre>" }`
      (**D4**). Debe respetar el gate `isSentryEnabled` de `spec-052` — en
      desarrollo no envía nada y solo queda el `console.error`.
- [x] Sin `any`. `npm run lint` y `npm run build` pasan.

### Fase 2 — Telemetría del gate 503 en el middleware
- [x] En `middleware.ts:44-55`, junto al `console.error` que ya existe (que **se
      conserva**: es la única señal en desarrollo), reportar a Sentry el 503 con
      el `reason` (`network` / `server` / `misconfigured` / `unknown`), el
      `pathname` y si la request era un Server Action (**D3**).
- [x] Verificar que el runtime Edge de `spec-052` (`sentry.edge.config.ts`)
      efectivamente inicializa para `middleware.ts` — si no, el evento no sale y
      la fase no está hecha. Es la única parte de la instrumentación de
      `spec-052` que nunca se ejercitó en producción.
- [x] Confirmar que el evento **no** lleva cookies ni cabeceras de
      autenticación: el `beforeSend` de `lib/observability/scrub-sentry-event.ts`
      (spec-052, D5) debe seguir aplicando.

### Fase 3 — Blindaje de los call sites cliente
> Orden deliberado: primero los dos con evidencia en producción, luego el resto.
> Cada componente aplica el mismo patrón — capturar, reportar (Fase 1), mostrar
> el copy compartido, **no** escalar al boundary.

- [x] `components/courses/SelfAssessmentSection.tsx`: `try/catch` alrededor de
      `submitSelfAssessment` (línea 68). El mensaje va al `submitError` que ya
      existe (línea 35), y **no** se llama a `router.refresh()` ni se limpia el
      formulario: el estudiante conserva sus respuestas y el botón vuelve a
      quedar operativo. Es el caso con peor consecuencia hoy (autoevaluación de
      intento único que cuenta para la nota, `spec-040`).
- [x] `components/auth/LoginForm.tsx`: aplicar **D5** para que `useActionState`
      reciba un `AuthResult` con `ok: false` en vez de una excepción. Mismo
      patrón en `account/ChangePasswordForm.tsx`, `account/AccountForm.tsx` y
      `account/EnrollmentForm.tsx`.
- [x] `components/student/QuestionRenderer.tsx`: `try/catch` en `runCodeAction`.
- [x] `components/navbar/Navbar.tsx` y `components/navbar/UserMenu.tsx`: el
      `<form action={signOut}>` no admite `try/catch` en el call site — evaluar
      envolver `signOut` con el mismo patrón de **D5**.
- [x] Barrido de los 4 componentes de `admin/` sin `catch` (ver tabla de
      auditoría). Prioridad menor: solo los sufre el docente, y con la sesión
      abierta ya sabe interpretar el fallo — pero el patrón debe quedar
      uniforme.
- [x] `components/courses/LessonClosure.tsx` (línea 67) y
      `components/courses/AttendanceSection.tsx` (línea 96): **no** cambiar la
      estructura; añadir únicamente la llamada de reporte de la Fase 1 dentro
      del `catch` que ya tienen. Hoy capturan bien pero el evento se pierde.
- [x] Verificar que ningún componente traga un error que **no** sea de
      transporte: el `catch` reporta y muestra el copy solo si
      `isServerActionTransportError()` da verdadero; en cualquier otro caso
      **re-lanza**, para que el boundary siga cumpliendo su función de
      `spec-037`.

### Fase 4 — Documentación y deuda
- [x] `docs/specs/backlog.md`: registrar **DEBT-068** — *sin contexto de usuario
      en Sentry (`Sentry.setUser`)*: los 4 eventos de NODO-EDU-4 reportan
      `Users: 0`, así que no se sabe si el afectado fue un estudiante, cuál, ni
      cuántos lo sufrieron. Sin ese dato no se puede priorizar por impacto real.
- [x] `docs/specs/backlog.md`: anotar en **[[DEBT-059]]** que el 504 produce el
      mismo error cliente que este spec degrada, y que el presupuesto de ~4.25 s
      del gate de Auth es un contribuyente directo a la latencia p95 del
      middleware.
- [x] `docs/specs/backlog.md`: anotar en **[[DEBT-066]]** que la Fase 2 cubre
      **un** caso concreto (el 503 del gate), no la deuda completa.
- [x] `docs/specs/spec-046-gate-auth-degradado.md`, sección "No incluye": nota
      enlazando a este spec — el gate fallaba cerrado correctamente, pero nunca
      se consideró el caso "el cliente que recibe el 503 esperaba RSC".
- [x] `npm run lint` y `npm run build` pasan sin errores nuevos.

## Criterios de aceptación

1. Con Supabase Auth caído, un estudiante que envía la autoevaluación de una
   lección ve un mensaje de error **dentro de la sección de autoevaluación**;
   la lección, el artículo y la navegación siguen visibles.
2. En ese mismo caso, **las respuestas marcadas se conservan** y el botón de
   enviar vuelve a quedar operativo sin recargar la página.
3. Con Auth caído, enviar el formulario de `/login` muestra un mensaje de error
   **en el formulario**; no se sustituye la página por el `ErrorState` genérico.
4. Cada 503 devuelto por el gate de `middleware.ts` genera un evento en Sentry
   con el `reason` y la ruta. Hoy no genera ninguno.
5. Cada fallo de transporte capturado en un componente cliente genera un evento
   en Sentry con `level: "warning"` y tag `transport: "server_action"`. El
   arreglo **no** reduce la telemetría respecto de hoy: la cambia de
   `boundary: <ruta>` a `transport: server_action`.
6. Un error que **no** sea de transporte (p. ej. un fallo de render real) sigue
   escalando a su error boundary exactamente como en `spec-037`. Sin regresión
   de los criterios de aceptación de `spec-037`.
7. Ningún evento nuevo contiene cookies de sesión, la cabecera `Authorization`
   ni claves de servicio (`spec-052`, D5, sigue aplicando).
8. Con Auth **sano**, ninguno de los 16 componentes de la tabla de auditoría
   cambia de comportamiento: los mensajes de negocio existentes
   (`already_submitted`, `not_enrolled`, `save_failed`, …) se muestran igual.
9. En `npm run dev` no sale ningún evento a Sentry (gate de `spec-052`, D1).
10. `npm run build` y `npm run lint` pasan sin errores; ningún `any` nuevo.

## Decisiones

| # | Decisión | Resolución |
|---|---|---|
| **D1** | ¿Se mueve la comprobación `auth.status === "unavailable"` **después** del filtro `PUBLIC_PREFIXES`, para que `/login` no dispare el 503? | **Propuesta: no, y requiere confirmación del usuario.** Sería la solución más limpia para `/login` — el formulario podría degradar solo, sin gate de por medio — pero contradice frontalmente la **D4 de `spec-046`**, aprobada tras una ronda manual de 16 casos (`TC-046-003`/`004` existen precisamente para verificar que un visitante **sin sesión** también falla cerrado). Cambiar esa política es una decisión de producto, no una corrección de bug, y merece su propio spec si el usuario la quiere. Este spec resuelve el mismo síntoma sin tocarla: el 503 se sigue emitiendo, pero el cliente ya no lo convierte en una pantalla de error. **Si el usuario prefiere la otra vía, hay que reabrir `spec-046` y su ronda de pruebas.** |
| **D2** | ¿Cómo se detecta un "fallo de transporte" si Next no exporta un tipo de error? | **Por coincidencia de mensaje, centralizada en un único módulo** (`lib/errors/server-action.ts`). Next.js no expone ninguna clase ni código para estos errores: el runtime cliente lanza un `Error` genérico. Es frágil por naturaleza — un cambio de wording en una versión mayor de Next lo rompe en silencio. Se mitiga así: (a) un solo lugar que tocar, (b) la rama por defecto es **re-lanzar**, de modo que si la detección falla el comportamiento degrada al de hoy (escala al boundary) y no a "error tragado sin rastro", y (c) `TC-053-010` verifica explícitamente que un error no-transporte sigue escalando. Descartado envolver cada Server Action del lado servidor: el error nace en el **cliente**, después de que la respuesta ya salió del servidor — no hay nada que envolver allá. |
| **D3** | ¿`captureException` o `captureMessage` para el 503 del gate? | **`captureMessage` con `level: "error"`** y tags `{ gate: "auth", reason, path, is_server_action }`. No hay excepción real: es una decisión deliberada del middleware. Usar `captureException` con un `Error` sintético daría un stack trace del propio middleware, inútil para diagnosticar, y agruparía mal. Con `captureMessage` y el `reason` como tag, los cuatro motivos de fallo quedan distinguibles en el panel — que es justo lo que faltó para diagnosticar NODO-EDU-4. Se añade `is_server_action` (presencia de la cabecera `Next-Action`) porque es el discriminante entre "el usuario vio la página 503, todo funcionó como se diseñó" y "el usuario vio una pantalla de error rota". |
| **D4** | Si los componentes dejan de escalar al boundary, ¿se pierde la señal en Sentry? | **Sí, y por eso el reporte es parte del alcance, no un extra.** Sin la Fase 1, este spec haría desaparecer NODO-EDU-4 del panel sin haber arreglado la causa: el estudiante seguiría sin poder enviar su autoevaluación, solo que ahora en silencio. Los eventos capturados se envían con `level: "warning"` (no `error`): son fallos esperados y ya manejados, no deben competir en el panel con las excepciones reales, pero sí deben poder contarse para saber con qué frecuencia Auth se cae. |
| **D5** | `useActionState` no permite `try/catch` en el call site. ¿Cómo se blinda `LoginForm` y los otros tres formularios? | **Envolver la Server Action en un adaptador cliente** que captura el fallo de transporte y devuelve el mismo tipo de resultado que la acción (`AuthResult` con `ok: false` y el copy compartido), re-lanzando cualquier otro error. Así `useActionState` sigue siendo la API del formulario, el estado de campos se conserva y no hay que reescribir cuatro formularios a `useTransition` + estado manual. **Riesgo a verificar en implementación:** `signIn` termina en `redirect()` (`lib/auth/actions.ts:53-66`); hay que confirmar que envolver la llamada en `try/catch` no interfiere con el manejo del redirect por parte del router — `TC-053-002` cubre el camino feliz precisamente por esto. |
| **D6** | ¿Se reintenta automáticamente el Server Action fallido? | **No.** La acción con peor consecuencia (`submitSelfAssessment`) es una escritura de **intento único** que cuenta para la nota (`spec-040`): un reintento automático sobre una respuesta ambigua puede consumir el único intento del estudiante o duplicar el registro. El reintento lo decide la persona, pulsando el botón otra vez sobre un formulario que conserva sus respuestas (criterio 2). Reevaluable para acciones idempotentes de lectura en un spec propio. |

## Pruebas asociadas

> Estos archivos se crean junto con el spec (CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-053-degradado-server-actions-auth.md` — casos
  `TC-053-001` … `TC-053-011`, mapeados a los criterios de aceptación. La ronda
  se ejecuta **en desarrollo** (instancia local en `mirp-lab`), cortando el
  túnel SSH para simular la caída de Auth: es el mismo procedimiento ya
  verificado en `docs/testing/test-046-gate-auth-degradado.md`. **Nunca contra
  producción**: los casos consisten en tumbar el servicio de autenticación.
  Los casos de telemetría (`TC-053-004`, `TC-053-005`) son la excepción — con
  Sentry apagado en desarrollo por diseño (`spec-052`, D1) solo pueden
  verificarse en producción, o por revisión de código; ver la nota en el archivo
  de pruebas.
- **Automáticas (e2e/unit):**
  `{{ubicación e2e por definir}}/e2e-053-degradado-server-actions-auth.spec.ts`
  — pendiente del framework de testing (CLAUDE.md → "Testing"). El criterio 10
  es verificable por CLI desde ya; `isServerActionTransportError()` es una
  función pura y sería la primera candidata natural a test unitario cuando el
  framework exista.
- Sin MCP → sin casos `TC-MCP`.

**Ronda del 2026-08-29: 11/11 aprobados.** Ejecutada en desarrollo
(`mirp-lab`) contra los 4 eventos reales de NODO-EDU-4 (autoevaluación de
`polimorfismo` y `/login`) y contra un grupo de evaluación de prueba montado
para `TC-053-007`. Sin hallazgos que requirieran cambio de código — un solo
hallazgo no bloqueante documentado en `TC-053-003` (comportamiento
preexistente de React 19, no introducido por este spec). Limpieza de datos de
prueba **bloqueada**: el envío real de `TC-053-007` impide borrar el grupo de
evaluación y el estudiante de prueba vía API (ambos devuelven 409) — pendiente
de decisión del usuario, ver `docs/testing/test-053-degradado-server-actions-auth.md`
→ "Resumen de la ronda".

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- [x] **D1 resuelta explícitamente** por el usuario: se **mantiene** la
      política de `spec-046` sin cambios — el gate sigue devolviendo 503 en
      `/login` (y cualquier otra ruta) cuando Auth está caído. Este spec
      resuelve el síntoma solo del lado del cliente, sin tocar `middleware.ts`
      más allá de la telemetría de la Fase 2.
- **Fecha de aprobación:** 2026-08-29
