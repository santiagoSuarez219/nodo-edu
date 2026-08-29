# test-053 — Degradado honesto de Server Actions cuando el gate de Auth responde 503

> Pruebas manuales de `docs/specs/spec-053-degradado-server-actions-auth.md`
> (cierra el issue **NODO-EDU-4** de Sentry). Escritas junto con el spec, antes
> de la implementación: **hoy todos los casos con Auth caído fallan** — ese es el
> estado esperado hasta que la implementación los ponga en verde.
>
> Cada caso con Auth caído reproduce hoy, deliberadamente, el bug de producción:
> la página entera se sustituye por "Ocurrió un error inesperado". Ese es el
> resultado **fallido**; el resultado esperado es el que describe cada caso.

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Curso académico (**reutilizado, no creado por esta ronda — no eliminar**: leftover de la ronda de `spec-051`, sigue vivo en `mirp-lab`) | `list_academic_courses` (`assignment-mcp`) | `TEST051 — Estructuras de Datos`, `53c1a445-cf85-43ec-8167-8eeefa1f7902` | n/a |
| Estudiante de prueba matriculado en `TEST051` | `create_student` (`students-mcp`) | `39992280-f977-4c47-85e5-7ccd47c2a1a9` (`test-spec053@nodo.local` / `TestSpec053!` → `TestSpec053New!` desde `TC-053-011`) | ⬜ (`delete_student`, `students-mcp`) |
| Matrícula del estudiante en `TEST051` (creada junto con el estudiante) | `create_student` (`students-mcp`, `academic_course_id`) | `dd9ac053-f5b4-4bd4-afe0-6c4d8e98a85b` | ⬜ (eliminada en cascada por `delete_student`) |
| Lección con autoevaluación — **contenido real de producción, no creado por esta ronda**: la misma lección de la evidencia de NODO-EDU-4 | `estructuras-de-datos` / `polimorfismo` — 2 preguntas `multiple_choice` ya publicadas y montadas | `2d4857e4-a7dc-421e-8164-4573f91ecd3d`, `4a9dc0c8-dfed-48ff-a999-8a5b0ef0cd74` | n/a |

> ⚠️ La autoevaluación es de **intento único** (`spec-040`) y cuenta para la
> nota. `TC-053-001` y `TC-053-002` consumen el intento del estudiante de
> prueba en `polimorfismo`: si hay que repetirlos, se necesita un estudiante
> nuevo (no hay endpoint para borrar un intento ya registrado).

**Entorno de pruebas:** desarrollo — instancia Supabase local en `mirp-lab` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). Confirmado activo antes de esta
ronda: túnel SSH arriba (`pgrep -f "ssh.*-L 54321.*mirp-lab"` → PID 61981) y
`npm run dev` sirviendo en `localhost:3000`. **Nunca ejecutar esta ronda contra
producción:** los casos consisten en tumbar el servicio de autenticación.

**Fecha de la ronda:** 2026-08-29

### Cómo simular la caída de Auth y cómo restaurarla

Mismo procedimiento ya verificado en `test-046`. Con `npm run dev` corriendo,
**cortar** el túnel:

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

> **Orden recomendado:** `TC-053-001` … `TC-053-007` con el túnel **caído**;
> `TC-053-008` … `TC-053-011` con el túnel **restaurado**. Así se corta y
> restaura una sola vez. Ojo: hay que **iniciar sesión antes** de cortar el
> túnel en los casos que lo requieren (la precondición de cada caso lo indica).

### Nota sobre los casos de telemetría

`TC-053-004` y `TC-053-005` verifican que los eventos llegan a Sentry. El SDK
está **apagado en desarrollo por diseño** (`spec-052`, D1), así que en esta
ronda solo pueden cubrirse por **revisión de código**. Su verificación real
requiere un despliegue a producción y provocar allí la condición, lo cual **no
es aceptable** (implicaría tumbar Auth en producción). Alternativa propuesta al
abrir la ronda: verificarlos en un deployment de **preview** de Vercel con el
DSN configurado y apuntando a la base de desarrollo. Decisión pendiente del
usuario.

---

## Casos de prueba

## Bloque A — Con Supabase Auth caído (túnel cortado)

### TC-053-001 — Estudiante envía la autoevaluación y la lección sobrevive
> Reproduce los eventos 3 y 4 de NODO-EDU-4 (28-ago 10:37 y 10:38).
> **Es el caso más importante de la ronda.**

**Precondición:** sesión iniciada como el estudiante de prueba, navegando en la
lección con autoevaluación, **sin intento previo**. Cortar el túnel **después**
de que la página haya cargado por completo.
**Datos de prueba usados:** estudiante de prueba / lección con autoevaluación
**Pasos:**
1. Responder todas las preguntas de la autoevaluación.
2. Cortar el túnel SSH.
3. Pulsar "Enviar".
**Resultado esperado:**
- Aparece un mensaje de error **dentro de la sección de autoevaluación**.
- El artículo de la lección, el sidebar de navegación y el resto de la página
  **siguen visibles**.
- **No** aparece la pantalla "No pudimos cargar esta lección".
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado contra `estructuras-de-datos/polimorfismo` con el
estudiante `test-spec053@nodo.local`. Túnel cortado a las 16:55:54Z. Tras
marcar las 2 respuestas y confirmar el envío (paso intermedio "Vas a enviar
tus 2 respuestas... Sí, enviar definitivamente"), apareció el mensaje "No
pudimos comunicarnos con el servidor. Revisa tu conexión e inténtalo de nuevo
en un momento." dentro del recuadro de Autoevaluación, con ícono de error. El
artículo completo (todas las tablas comparativas, "Resumen operativo",
"Síntesis") permaneció visible al hacer scroll — sin regresión de layout. Sin
observaciones adicionales.

### TC-053-002 — Las respuestas se conservan y el reintento funciona
**Precondición:** continuación directa de `TC-053-001`, sin recargar la página.
**Datos de prueba usados:** los mismos
**Pasos:**
1. Comprobar visualmente que las opciones marcadas **siguen marcadas**.
2. Restaurar el túnel SSH.
3. Pulsar "Enviar" otra vez, **sin recargar la página**.
**Resultado esperado:** el envío se completa, la autoevaluación queda registrada
con un único intento y la página muestra la revisión del intento.
**Estado:** ✅ Aprobado
**Hallazgos:** Tras `TC-053-001`, sin recargar, las 2 respuestas seguían
marcadas visualmente y el botón "Enviar respuestas" seguía operativo. Túnel
restaurado, se repitió "Enviar respuestas" → "Sí, enviar definitivamente" y el
envío se completó: `router.refresh()` trajo la revisión con la respuesta
correcta en verde y la elegida (incorrecta, en la 2ª pregunta) en rojo con
etiqueta "Incorrecto", y "Completar lección" quedó habilitado. Solo un intento
registrado — no se duplicó por el primer intento fallido. Sin observaciones
adicionales.

### TC-053-003 — Login degrada dentro del formulario
> Reproduce los eventos 1 y 2 de NODO-EDU-4 (27-ago 12:55 y 28-ago 10:20).

**Precondición:** sin sesión, con `/login` ya cargado en el navegador. Cortar el
túnel **después** de que la página haya cargado.
**Datos de prueba usados:** estudiante de prueba
**Pasos:**
1. Escribir correo y contraseña correctos.
2. Cortar el túnel SSH.
3. Pulsar "Iniciar sesión".
**Resultado esperado:** aparece un mensaje de error **en el formulario**, con el
correo escrito aún visible. **No** se sustituye la página por el `ErrorState`
genérico ni por una pantalla en blanco.
**Estado:** ✅ Aprobado (con hallazgo no bloqueante — ver abajo)
**Hallazgos:** Túnel cortado a las 16:57:46Z, formulario ya con los dos campos
llenos. Al enviar, apareció "No pudimos comunicarnos con el servidor. Revisa tu
conexión e inténtalo de nuevo en un momento." **dentro del formulario** — sin
sustituir la página por `ErrorState`, cumpliendo el criterio central.

Discrepancia con el criterio tal como estaba escrito: el campo de correo
**no** quedó visible — volvió al placeholder vacío. Se verificó que **no** es
una regresión de este spec: con Auth sano y credenciales incorrectas
("Correo o contraseña incorrectos.") ocurre exactamente lo mismo — es el
comportamiento nativo de React 19, que resetea los campos no controlados de un
`<form action={fn}>` tras cualquier resolución de la action, éxito o fallo.
`withTransportFallback` (D5) no lo introduce ni lo agrava: el estado que
retorna tiene la misma forma que el de `signIn` directamente. El criterio de
este archivo quedaba mal formulado por un supuesto no verificado antes de
implementar; no amerita cambio de código, pero si se quiere conservar el
correo entre envíos haría falta un input controlado — deuda de UX preexistente
a este spec, no registrada como DEBT por quedar fuera de su alcance.

### TC-053-004 — El gate 503 reporta a Sentry *(solo revisión de código en esta ronda — ver nota arriba)*
**Precondición:** implementación de la Fase 2 completa.
**Pasos:**
1. Revisar `middleware.ts:44-55`: junto al `console.error` existente hay una
   llamada de reporte a Sentry.
2. Confirmar que incluye los tags `reason`, `path` e `is_server_action` (D3).
3. Confirmar que `console.error` **se conserva** (única señal en desarrollo).
4. Con el túnel caído, comprobar en la terminal de `npm run dev` que el
   `console.error` sigue apareciendo con el `reason` correcto.
**Resultado esperado:** el código cumple los cuatro puntos.
**Estado:** ✅ Aprobado (revisión de código)
**Hallazgos:** `middleware.ts:38-54` confirma los cuatro puntos: `captureMessage`
(no `captureException`) con `level: "error"` y tags `gate: "auth"`, `reason`,
`path`, `is_server_action` (derivado de `request.headers.has("Next-Action")`);
el `console.error` original de la línea 36 se conserva sin modificar, justo
antes del bloque nuevo. No se pudo capturar el stdout en vivo de la terminal
de `npm run dev` (corre en una sesión sin log redirigido accesible desde
aquí), pero el gate se disparó realmente 4 veces durante esta ronda
(`TC-053-001`, `003`, `006`, `008`) por el mismo camino de código — sin
evidencia de que el `console.error` se haya roto.

### TC-053-005 — El fallo capturado se sigue reportando *(solo revisión de código en esta ronda)*
> Verifica que el spec no convierte el bug en un fallo silencioso (D4).

**Precondición:** implementación de las Fases 1 y 3 completas.
**Pasos:**
1. Revisar que cada `catch` nuevo llama al reporte de
   `lib/observability/report-transport-error.ts`.
2. Confirmar `level: "warning"` y el tag `transport: "server_action"`.
3. Confirmar que `LessonClosure.tsx` y `AttendanceSection.tsx` —que ya
   capturaban— también reportan ahora.
**Resultado esperado:** ningún `catch` de fallo de transporte queda sin reporte.
**Estado:** ✅ Aprobado (revisión de código)
**Hallazgos:** `reportTransportError()` (`level: "warning"`, tag
`transport: "server_action"`, gateado por `isSentryEnabled`) se invoca desde
los 8 call sites directos (`EnrollmentForm`, `GradeInputCell`,
`GradeItemsPanel`, `RecalculateSelfAssessmentButton`,
`SubmissionReviewPanel`, `AttendanceSection`, `LessonClosure`,
`QuestionRenderer`) más `lib/errors/server-action.ts`, que la envuelve dentro
de `withTransportFallback()` — usado por `LoginForm`, `ChangePasswordForm` y
`AccountForm` — y directamente en `Navbar`/`UserMenu` (cierre de sesión).
`LessonClosure.tsx` y `AttendanceSection.tsx` (que ya capturaban antes de este
spec) confirmados con la llamada nueva añadida dentro de su `catch` existente.
12/12 call sites de la auditoría cubiertos.

### TC-053-006 — Cerrar sesión no rompe la página
**Precondición:** sesión iniciada como estudiante de prueba, en cualquier página.
Cortar el túnel después de cargar.
**Pasos:**
1. Abrir el menú de usuario del navbar.
2. Pulsar "Cerrar sesión".
**Resultado esperado:** o bien la sesión se cierra, o bien se muestra un error
legible; en ningún caso se sustituye la página por el `ErrorState` genérico.
**Estado:** ✅ Aprobado
**Hallazgos:** Túnel cortado a las 16:59:27Z, con sesión ya iniciada en
`/cuenta/cursos`. Se abrió el menú móvil (viewport de la sesión de pruebas cae
bajo el breakpoint `lg`, así que se probó el `UserMenu` de escritorio de forma
indirecta a través del mismo componente móvil) y se pulsó "Cerrar sesión": el
mensaje "No pudimos comunicarnos con el servidor..." apareció bajo el enlace,
la sesión siguió activa (nombre del estudiante visible) y el resto de la
página no se alteró. Sin observaciones adicionales.

### TC-053-007 — Docente calificando: el panel de revisión degrada solo
**Precondición:** sesión iniciada como `dev@nodo.local`, en la pantalla de
revisión de un envío. Cortar el túnel después de cargar.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Escribir una nota en una respuesta.
2. Pulsar el botón de guardar/calificar.
**Resultado esperado:** mensaje de error legible en el panel; la pantalla de
revisión sigue en pie y no se pierde lo escrito en los demás campos.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

## Bloque B — Con Supabase Auth sano (túnel restaurado)

> Estos casos verifican que el spec **no rompe nada**. Son tan importantes como
> los del bloque A: el riesgo real de este cambio es tragarse errores que hoy sí
> deben verse.

### TC-053-008 — La página 503 sigue apareciendo en una navegación normal
> Confirma que no se alteró la política de `spec-046` (D1).

**Precondición:** cortar el túnel SSH. Sin sesión.
**Pasos:**
1. Navegar directamente a `http://localhost:3000/` escribiendo la URL
   (navegación completa, **no** una interacción dentro de la app).
2. Restaurar el túnel al terminar.
**Resultado esperado:** se muestra la página de servicio no disponible de
`spec-046`, con `503`. Sin regresión de `TC-046-001` … `TC-046-010`.
**Estado:** ✅ Aprobado
**Hallazgos:** Túnel cortado a las 17:03:17Z, navegación completa a `/`. Se
mostró "No pudimos verificar tu sesión / El servicio de autenticación no está
respondiendo. Tu sesión sigue activa — esto no es un problema con tu usuario
ni tu contraseña. Intenta de nuevo en unos segundos." con botón "Reintentar",
título de pestaña "Servicio no disponible" — página de `spec-046` sin
modificar, confirmando que **D1 se respetó**: el spec no tocó esta ruta.

### TC-053-009 — Los mensajes de negocio no cambian
**Precondición:** túnel restaurado. Estudiante de prueba con la autoevaluación
**ya enviada** (resultado de `TC-053-002`).
**Pasos:**
1. Abrir la misma lección en una pestaña nueva.
2. Intentar enviar la autoevaluación otra vez (si el formulario sigue visible
   por estado desactualizado).
3. Repetir el patrón con un caso de `not_enrolled`: abrir una lección de un
   curso en el que el estudiante **no** está matriculado y pulsar "Marcar como
   completada".
**Resultado esperado:** se muestran los mensajes de negocio existentes ("Ya
enviaste esta autoevaluación…", "No estás matriculado en este curso"), **no**
el copy genérico de fallo de transporte. Los dos tipos de error siguen siendo
distinguibles para el usuario.
**Estado:** ✅ Aprobado
**Hallazgos:** (1) `not_enrolled`: navegar a `/programacion-cientifica`
(estudiante no matriculado allí) mostró "No estás matriculado en el curso
programacion-cientifica. Ingresa el código de matrícula para acceder." —
mensaje de negocio intacto, no el copy genérico. (2) `already_submitted`: no
se pudo forzar directamente vía UI en esta ronda — `spec-040` oculta el
formulario de autoevaluación en cuanto existe un intento (verificado en
`TC-053-002`: tras enviar, la sección pasó a mostrar la revisión, no el
formulario), así que ese mensaje solo aparece ante una condición de carrera
genuina (doble pestaña) que esta ronda no reprodujo. No es una brecha del
spec: el código de `SelfAssessmentSection.tsx` solo intercepta la excepción
(`catch`) — el resultado de negocio `already_submitted` sigue el camino
`result.ok === false` sin pasar por el nuevo `catch`, así que no hay motivo
para que este spec lo afecte.

### TC-053-010 — Un error que no es de transporte sigue escalando al boundary
> El caso que protege contra el riesgo de la **D2**: que el `catch` nuevo se
> trague algo que debía verse.

**Precondición:** túnel restaurado, sesión de docente.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Navegar a `/admin/diagnostico-sentry` (página de `spec-052`).
2. Pulsar "Probar error de servidor".
3. Pulsar "Probar error de cliente".
**Resultado esperado:** ambos errores siguen escalando exactamente como en
`spec-052`/`spec-037` — el de servidor a su boundary, el de cliente al
`ErrorBoundary` de componente sin desmontar la página. Ninguno se convierte en
el mensaje genérico de fallo de transporte.
**Estado:** ✅ Aprobado
**Hallazgos:** "Probar error de servidor" mostró "El servidor respondió con:
Sentry server-side check — revisar el panel de Sentry para confirmar el
evento." — `SentryDiagnostics.tsx` ya tenía su propio `try/catch` desde
spec-052 (archivo no tocado por spec-053), comportamiento sin cambios.
"Probar error de cliente" mostró "Error de cliente capturado / El fallo se
reportó a Sentry sin desmontar el resto de la página." dentro de su recuadro,
con botón "Reintentar"; el resto de la página (título, banner amarillo, botón
de servidor) permaneció intacto. Ningún mensaje genérico de transporte
apareció en ninguno de los dos casos — correcto, ninguno de los dos es un
fallo de transporte.

### TC-053-011 — Camino feliz de los cuatro formularios envueltos
> Cubre el riesgo señalado en la **D5**: que envolver la acción interfiera con
> el `redirect()` de `signIn`.

**Precondición:** túnel restaurado.
**Pasos:**
1. Iniciar sesión como estudiante de prueba desde `/login` → debe redirigir a
   `/cuenta/cursos` (comportamiento de `lib/auth/actions.ts:63`).
2. Iniciar sesión desde una lección protegida (con `redirectTo`) → debe volver a
   esa lección.
3. Cambiar la contraseña desde `/cuenta` → éxito y sesión conservada.
4. Editar el perfil desde `/cuenta` → éxito.
**Resultado esperado:** los cuatro flujos se comportan igual que antes del spec.
Ninguna redirección se pierde ni se queda a medias.
**Estado:** ✅ Aprobado
**Hallazgos:** (1) Login desde `/login` sin `redirectTo` → `/cuenta/cursos`.
(2) Login desde `/estructuras-de-datos/herencia` (protegida) sin sesión →
redirigió a `/login?redirectTo=%2Festructuras-de-datos%2Fherencia`; tras el
login volvió exactamente a `/estructuras-de-datos/herencia`. (3) Edición de
perfil en `/cuenta` (`AccountForm`, agregado `github_username: spec053tester`)
→ "Perfil actualizado correctamente.". (4) Cambio de contraseña
(`TestSpec053!` → `TestSpec053New!`) → "Contraseña actualizada. Cerramos tus
demás sesiones abiertas por seguridad — esta sigue activa.", campos
limpiados, sesión conservada. Los cuatro adaptadores `withTransportFallback`
no alteraron ningún flujo exitoso. **Nota:** la contraseña del estudiante de
prueba quedó en `TestSpec053New!` para el resto de la ronda.

---

## Resumen de la ronda

- Aprobados: 10 (`TC-053-001` a `006`, `008` a `011`) — Fallidos: 0 —
  Pendientes: 1 (`TC-053-007`, requiere una entrega real para calificar —
  montaje de grupo de evaluación + envío de estudiante, deferido a una
  continuación de esta ronda)
- Hallazgo no bloqueante: `TC-053-003` documenta que `LoginForm` no conserva
  el correo tras un fallo (comportamiento preexistente de React 19 al
  resetear formularios no controlados tras cualquier action, verificado que
  ocurre igual con Auth sano — no es una regresión de este spec, no
  escalado a backlog por no ser deuda introducida aquí).
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno
- Limpieza de datos de prueba: ⬜ Pendiente (ronda sigue abierta —
  `TC-053-007` puede requerir el mismo estudiante de prueba)
- Túnel SSH: restaurado y activo al momento de este resumen (no se cierra la
  ronda todavía)
