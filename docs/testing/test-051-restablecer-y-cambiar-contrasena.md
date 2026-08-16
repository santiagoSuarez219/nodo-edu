# test-051 — Restablecer y cambiar contraseña

> Ronda asociada a `docs/specs/spec-051-restablecer-y-cambiar-contrasena.md`.
> **Estado: en curso** — arrancada el 2026-08-16, empezando por TC-051-010.

## Datos de prueba

| Recurso | Endpoint / MCP de creación | Identificador | Eliminado |
|---------|---------------------------|---------------|-----------|
| Curso académico 1 (`TEST051`, docente dev@nodo.local) | *(sin endpoint — [[DEBT-060]]; insertado vía `psql` en `mirp-lab`, confirmado por el usuario)* | `53c1a445-cf85-43ec-8167-8eeefa1f7902` | ⬜ |
| Estudiante A — `tc051010@test.nodo.local` | `POST /api/students` (matriculado directo en el curso 1) | `19f5e6cd-fc8d-4ad5-87c8-c39b6315048a` | ⬜ |
| Matrícula de A en curso 1 | (incluida en el alta anterior) | `513851fa-421f-4b9f-91f5-6ef14178e0ae` | ⬜ |
| Docente 2 — `docente2-tc051005@test.nodo.local` (rol `teacher`, **sin** `admin` a propósito) | Script `node` inline con `service_role`, mismo patrón que `scripts/seed-teacher.mjs` pero sin asignar `admin` | `ffd142f7-72ac-45e1-a729-07b0edb751c5` | ⬜ |
| Curso académico 2 (`TEST051-B`, docente 2) | *(sin endpoint — [[DEBT-060]]; insertado vía `psql`, confirmado por el usuario)* | `0f4605e1-2305-4fef-8620-0b7b1dba6abd` | ⬜ |
| Estudiante B — `tc051005-b@test.nodo.local` | `POST /api/students` (matriculado directo en el curso 2) | `9da22d9a-cc5e-412b-86ca-13bcaaec2ee3` | ⬜ |
| Matrícula de B en curso 2 | (incluida en el alta anterior) | `51f9e6e8-0a27-4444-be17-81c3093b9e73` | ⬜ |
| Docente de desarrollo | ya sembrado (`dev@nodo.local` / `DevLocal2026!`) | `7207c852-dd6c-4df4-ac33-99985c36e26c` | n/a |

**Contraseñas usadas en la ronda** (anotarlas para poder revertir):

| Momento | Valor |
|---------|-------|
| Inicial de A (`create_student`) | `TempInicial2026!` (ya no sirve — reemplazada en TC-051-010) |
| Genérica tras el restablecimiento (TC-051-010) | `U2FU6485F9` |
| Definitiva que elige A (TC-051-009) | `TempInicial2026!` — coincide con la inicial original de `create_student`, pero D6 solo exige distinta de la **actual** (`U2FU6485F9` en ese momento), así que se aceptó correctamente |
| Cambio voluntario (TC-051-001) | `TempInicial2026!+` |
| Segunda genérica tras restablecimiento (TC-051-006) | `5R3YSWE93S` |
| Cambio forzado, post-corte de túnel (TC-051-011/013) | `PostCorteFinal789` — **contraseña actual de A; `must_change_password` = false, ya no confinado** |
| Estudiante B (`create_student`) | `EstudianteBTemp2026!` — **contraseña actual de B; no debe cambiar tras TC-051-005** |

**Entorno de pruebas:** desarrollo — `npm run dev` en el puerto **3002**
(`.env.local` ya apunta ahí), Supabase en `mirp-lab` vía túnel SSH (confirmado
activo).
**Fecha de la ronda:** 2026-08-16

> Se necesitan **dos navegadores** (o uno normal + uno de incógnito) para
> TC-051-010, que comprueba el cierre de las otras sesiones.
> TC-051-005 necesita un **segundo docente**: si no existe, crearlo o
> ejecutarlo con la cuenta admin sobre un curso que no sea suyo.

## Casos de prueba — Cambio voluntario

### TC-051-001 — Cambio exitoso desde `/cuenta`
**Cubre:** criterios 1 y 3
**Precondición:** sesión iniciada como el estudiante A.
**Pasos:**
1. Ir a `/cuenta` y localizar la tarjeta de cambio de contraseña.
2. Escribir la contraseña actual, una nueva válida y su confirmación. Enviar.
3. Cerrar sesión, intentar entrar con la **anterior**, y luego con la **nueva**.
**Resultado esperado:** mensaje de éxito y campos limpios; la sesión actual
sigue activa. En el paso 3, la anterior es rechazada y la nueva entra.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Confirmado — cambio voluntario exitoso desde `/cuenta`, sesión
actual conservada, `TempInicial2026!` rechazada tras cerrar sesión y la nueva
aceptada. Contraseña nueva: `TempInicial2026!+` (registrada en la tabla de
arriba).

### TC-051-002 — Contraseña actual incorrecta
**Cubre:** criterio 2 y D4
**Pasos:**
1. Escribir una contraseña actual **equivocada** y una nueva válida. Enviar.
2. Cerrar sesión y entrar con la contraseña que ya se tenía.
**Resultado esperado:** rechazo con mensaje específico en el campo de
contraseña actual, no un error genérico. El paso 2 confirma que no cambió.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Ejecutado por Claude vía navegador (autorización explícita del
usuario para este caso). Mensaje exacto mostrado: **"La contraseña actual no
es correcta."**, asociado al campo `Contraseña actual` — no un banner
genérico. Confirmado con `zoom`/captura. Paso 2: cerrada la sesión, `A` volvió
a entrar con `TempInicial2026!+` sin problema — el intento fallido no tocó
la contraseña real.

### TC-051-003 — Validaciones del formulario
**Cubre:** criterio 7 y D5/D6. Un subcaso por paso, verificando el mensaje:
1. Nueva de 7 caracteres.
2. Nueva y confirmación distintas.
3. Nueva **igual** a la actual.
4. Campos vacíos.
**Resultado esperado:** cada subcaso se rechaza con el error en su campo. El
subcaso 3 es el que sostiene todo el circuito (D6): sin él, el cambio forzado
se puede "cumplir" reescribiendo la genérica del docente.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Ejecutado por Claude vía navegador (autorización del usuario).
Los cuatro subcasos correctos:
1. 7 caracteres → "La contraseña debe tener al menos 8 caracteres" (bajo Nueva contraseña).
2. Confirmación distinta → "Las contraseñas no coinciden" (bajo Confirmar).
3. Nueva = actual → **"La nueva contraseña debe ser distinta de la actual"**
   (bajo Nueva contraseña) — D6 funcionando tal cual se diseñó.
4. Campos vacíos → bloqueado por la validación nativa del navegador
   (`required`), ni siquiera llegó al servidor: el error del subcaso anterior
   permaneció sin cambios en pantalla, confirmando que no hubo submit real.

### TC-051-004 — La sesión no se desplaza al verificar la contraseña actual
**Cubre:** el riesgo de implementación de D4
**Precondición:** DevTools abiertas en la pestaña de cookies.
**Pasos:**
1. Anotar las cookies de sesión de Supabase.
2. Enviar el formulario con una contraseña actual **incorrecta**.
3. Comparar cookies y seguir navegando.
**Resultado esperado:** la sesión sigue siendo la misma y no hay expulsión. Si
`signInWithPassword` reescribió las cookies, este caso lo delata.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Ejecutado por Claude vía navegador. **Ajuste de método:** el
acceso directo a `document.cookie` fue bloqueado por la propia extensión del
navegador (protección esperada — las cookies de sesión de Supabase son
`httpOnly`, invisibles para JS de página de todos modos). Verificación
alternativa, igual de concluyente: tras el intento con contraseña actual
incorrecta, se navegó directo a `/cuenta/cursos` **sin recargar sesión** — la
página cargó con normalidad, mostrando al mismo usuario (A, "Estudiante Prueba
TC-051-010"), sin redirect a `/login`. Confirma que `verifyCurrentPassword()`
(el cliente desechable de D4) no tocó la sesión real.

## Casos de prueba — Restablecimiento por el docente

### TC-051-005 — Un docente no puede restablecer en un curso ajeno
**Cubre:** criterio 5 — *el caso de seguridad de la ronda*
**Precondición:** sesión como docente del curso 1.
**Pasos:**
1. Intentar restablecer la contraseña del estudiante **B** (curso 2, otro
   docente), por UI si es alcanzable y, si no, invocando la Server Action
   directamente con su `student_id`.
**Resultado esperado:** rechazo. La contraseña de B **no** cambia y B sigue
entrando con la suya.
**Estado:** ✅ Aprobado (2026-08-16), con una corrección al planteamiento del
caso
**Hallazgos:** Ejecutado por Claude vía navegador y API.

**Corrección necesaria antes de ejecutar:** `dev@nodo.local` (docente del
curso 1) tiene rol `admin` además de `teacher` — se lo asignó
`scripts/seed-teacher.mjs`, pensado para el único docente de desarrollo. La
policy RLS de `enrollments`/`academic_courses` permite explícitamente a un
admin ver y actuar sobre **cualquier** curso — es el bypass correcto, no un
bug. Probar el caso tal cual estaba escrito (docente 1 = `dev@nodo.local`
contra B) habría dado un "éxito" que en realidad solo demuestra el bypass de
admin, no la comprobación de propiedad — un falso positivo de seguridad. Se
creó **docente 2** (`ffd142f7-72ac-45e1-a729-07b0edb751c5`, rol `teacher`
puro, sin `admin`) para probar el límite real, invirtiendo el sentido del
ataque: docente 2 contra el estudiante **A** (curso 1, ajeno a docente 2).

**Verificado en dos capas:**
1. **Página del panel** — docente 2, con sesión real, navegó directo a
   `/admin/courses/{{curso1}}`: **404**. Ni siquiera puede confirmar que el
   curso existe, no solo que no puede actuar sobre él.
2. **El guard exacto que usa `resetStudentPasswordAction`** — se reprodujo la
   consulta literal (`enrollments` filtrado por `student_id` de A y
   `academic_course_id` del curso 1) contra PostgREST, autenticada con el
   `access_token` real de docente 2 (obtenido vía
   `/auth/v1/token?grant_type=password`): **`[]`**, vacío — exactamente la
   condición que dispara `{ok: false, error: "No tienes acceso a este
   estudiante."}` en el código. La policy `enrollments: select` bloquea antes
   de que el código de la acción tenga que decidir nada.

**Confirmado que nada cambió:** login de A con su contraseña real
(`PostCorteFinal789`) → `200`. La contraseña nunca estuvo en riesgo porque el
intento nunca llegó a `resetServiceStudentPassword()`.

El escenario original del caso (docente 1 contra B) también se puede validar
por separado si hace falta un docente admin+teacher específicamente, pero no
aporta nada que docente 2 no haya probado ya de forma más rigurosa.

### TC-051-006 — Restablecimiento desde la lista de estudiantes
**Cubre:** criterio 4
**Precondición:** sesión como docente dueño del curso 1.
**Pasos:**
1. Ir a `/admin/courses/{{id}}` y localizar al estudiante A en la lista.
2. Pulsar "Restablecer contraseña" y confirmar en el diálogo.
3. Anotar la contraseña genérica mostrada.
4. Recargar la página.
**Resultado esperado:** la contraseña se muestra **una sola vez**, legible para
dictarla en voz alta (sin caracteres ambiguos). Tras recargar ya no aparece por
ningún lado (D7).
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Ejecutado por Claude vía navegador. Diálogo de confirmación
correcto (nombre del estudiante incluido: "¿Restablecer la contraseña de
Estudiante Prueba TC-051-010?"). Contraseña generada: `5R3YSWE93S` — solo
mayúsculas y dígitos, sin `l/1/I/O/0`, coherente con `READABLE_PASSWORD_CHARS`.
Tras "Listo" y recargar la página, el texto de la contraseña no aparece en
ningún sitio (confirmado con `get_page_text` de la página completa). Esta es
la contraseña **actual** de A a partir de ahora.

### TC-051-007 — La contraseña genérica no queda registrada en ningún sitio
**Cubre:** D7
**Pasos:**
1. Tras TC-051-006, revisar la consola del navegador y los logs del servidor.
2. Consultar por API el registro del estudiante.
**Resultado esperado:** la contraseña no aparece en logs, ni en la respuesta de
ninguna consulta posterior, ni en `profiles`. Solo existió en la respuesta
directa del restablecimiento.
**Estado:** ✅ Aprobado (2026-08-16), con una comprobación pendiente del usuario
**Hallazgos:** Verificado por Claude: `GET /api/students/{{id}}` no incluye
`password` en ningún campo de la respuesta (`AdminStudentDetail` nunca lo tuvo,
por diseño de spec-027). Confirmado además contra el esquema real en
`mirp-lab`: ni `public.profiles` ni `public.students` tienen columna de
contraseña — vive únicamente hasheada en `auth.users`, gestionada por GoTrue,
inalcanzable por consulta directa. **Pendiente de que el usuario confirme:**
la consola del navegador (revisada, sin coincidencias, pero el tracking de
consola solo arrancó después de ejecutar TC-051-006, así que no cubre
retroactivamente ese momento) y, sobre todo, **la terminal donde corre
`npm run dev`** — Claude no tiene acceso a ese proceso, y es la única vía
"logs del servidor" mencionada en el caso que queda sin cubrir.

## Casos de prueba — Cambio forzado

### TC-051-008 — El estudiante queda confinado hasta cambiarla
**Cubre:** criterio 6 — *el caso central del spec*
**Precondición:** estudiante A recién restablecido; contraseña genérica de
TC-051-006 — **cubierta por la de TC-051-010** (`U2FU6485F9`), ya que la ronda
empezó por ese caso.
**Pasos:**
1. Entrar como A con la contraseña genérica.
2. Intentar navegar a `/cuenta`, a una lección y a `/cuenta/cursos`,
   escribiendo las URL directamente.
**Resultado esperado:** toda navegación redirige a `/cambiar-contrasena`, con
un texto que explica por qué. No se alcanza ninguna otra página.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Confirmado — `/cuenta`, `/cuenta/cursos` y una lección
(`/estructuras-de-datos`) redirigieron las tres a `/cambiar-contrasena`
escribiendo la URL directamente. El gate del middleware (Fase 4) confina
correctamente al estudiante marcado.

### TC-051-009 — Cambiarla libera la navegación sin volver a entrar
**Cubre:** criterio 8
**Pasos:**
1. Desde `/cambiar-contrasena`, escribir la genérica como actual y una nueva
   propia. Enviar.
2. Navegar a una lección y a `/cuenta`.
**Resultado esperado:** el cambio se acepta y la navegación se normaliza de
inmediato, **sin** pedir volver a iniciar sesión.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Confirmado — tras el cambio, la navegación a una lección y a
`/cuenta` funcionó de inmediato sin volver a iniciar sesión. Verifica en vivo
que `getUser()` revalida contra el servidor de Auth en cada request (Fase 4):
la marca `must_change_password` desapareció sin necesitar ningún revalidatePath
ni truco de caché adicional. Contraseña definitiva elegida: `TempInicial2026!`
(registrada en la tabla de arriba).

### TC-051-010 — Restablecer cierra las sesiones abiertas
**Cubre:** criterio 10 y D8 — *requiere dos navegadores*
**Precondición:** el estudiante A con sesión abierta en el navegador B.
**Pasos:**
1. Como docente, restablecer la contraseña de A.
2. En el navegador B, recargar una página protegida.
**Resultado esperado:** B queda fuera y se le redirige a `/login`.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Confirmado — al restablecer la contraseña de A desde el panel
docente, el navegador B (con sesión abierta de A) quedó expulsado a `/login`
al recargar. **Resuelve el hallazgo de D8** de la Fase 3/4 de spec-051: el
servidor de Auth de Supabase (GoTrue) sí invalida las sesiones activas de un
usuario al cambiar su contraseña vía la API admin
(`auth.admin.updateUserById({password})`), aunque el SDK no lo documentaba en
ningún sitio accesible. `resetServiceStudentPassword()` no necesita ningún
cambio adicional para cumplir D8 — ya lo cumplía sin saberlo con certeza.

### TC-051-011 — Un usuario marcado siempre puede cerrar sesión
**Cubre:** criterio 9
**Precondición:** estudiante marcado, confinado en `/cambiar-contrasena`.
**Pasos:**
1. Pulsar cerrar sesión sin cambiar la contraseña.
**Resultado esperado:** la sesión se cierra y se llega a `/login`. Sin esta
exención, un usuario marcado que no recuerde la genérica queda atrapado sin
salida.
**Estado:** ✅ Aprobado (2026-08-16)
**Hallazgos:** Ejecutado por Claude vía navegador. A, marcado y confinado en
`/cambiar-contrasena` (contraseña `5R3YSWE93S`, sin cambiarla), pulsó "Cerrar
sesión" desde el menú del navbar — visible con normalidad ahí, sin necesitar
ningún control especial en la página. Cerró sesión limpiamente y llegó a
`/login`. Confirma en vivo el razonamiento de D3/Fase 4: no hizo falta una
exención de middleware aparte para "cerrar sesión" — la del propio
`/cambiar-contrasena` ya bastaba, porque el formulario de logout siempre
postea a la página actual.

### TC-051-012 — El gate no añade consultas a base de datos
**Cubre:** criterio 13 y D2 — relacionado con [[DEBT-059]]
**Pasos:**
1. Navegar por varias páginas con un usuario **no** marcado.
2. Revisar los logs de consultas de Supabase para esos requests.
**Resultado esperado:** el gate no genera ninguna consulta adicional: la marca
se lee de `app_metadata`, que el middleware ya recibe en `getUser()`.
**Estado:** ✅ Aprobado (2026-08-16) — medido en vivo, no solo por código
**Hallazgos:** El navegador no sirve para esto (el middleware corre en el
servidor; el tráfico de red del cliente no lo muestra), así que se buscó una
vía real de medición en vez de conformarse con la revisión de código.
`pg_stat_statements` está habilitado en `mirp-lab` — se reseteó
(`pg_stat_statements_reset()`), se navegó por 4 rutas protegidas con un
usuario autenticado sin marcar (docente 2: `/cuenta`, `/cuenta/cursos` ×2,
`/admin/courses/{{curso2}}`), y se inspeccionaron las consultas capturadas.

**Resultado definitivo:** la consulta que GoTrue ejecuta internamente para
`getUser()` es:
```sql
SELECT users.aud, ..., users.raw_app_meta_data, users.raw_user_meta_data, ...
FROM users AS users WHERE instance_id = $1 and id = $2 LIMIT $3
```
`raw_app_meta_data` (nombre real de columna detrás de `app_metadata`) **ya
viene incluido** en esa misma consulta — 8 llamadas capturadas en las 4
navegaciones (2 por página, consistente con el doble `getUser()` de
`lib/auth/middleware.ts` + `lib/auth/session.ts`, preexistente de spec-046,
no algo que este spec añadiera). Sin filtro `ilike '%must_change%'` con
resultados: no existe ninguna consulta separada para la marca, en ningún
punto de la traza.

### TC-051-013 — Fallo de infraestructura no se disfraza
**Cubre:** criterio 11 y D9
**Pasos:**
1. Con el formulario relleno correctamente, cortar el túnel:
   `pkill -f "ssh.*-L 54321.*mirp-lab"`
2. Enviar. Restaurar el túnel y verificar que la contraseña no cambió.
**Resultado esperado:** mensaje de servicio no disponible, distinto de
"contraseña incorrecta", sin reportar éxito.
> ⚠️ Cortar el túnel también tumba Auth, así que spec-046 puede responder 503
> antes de llegar al formulario. Ese 503 **cuenta como resultado válido**
> (es señalización honesta); anotarlo en Hallazgos.
**Estado:** ✅ Aprobado (2026-08-16), con un hallazgo nuevo escalado al backlog
**Hallazgos:** Ejecutado por Claude vía navegador, con autorización explícita
del usuario para cortar/restaurar el túnel. **Lo importante primero: la
contraseña nunca cambió durante los dos intentos con el túnel cortado** —
verificado dos veces entrando de nuevo con la antigua (`5R3YSWE93S`), que
siguió funcionando ambas veces. D9 se sostuvo: ningún fallo de infraestructura
escribió nada.

**Lo que se vio en pantalla no fue lo que anticipaba el caso.** No apareció el
503 honesto de spec-046 ni el mensaje de "no se pudo verificar tu contraseña"
de `changePassword` — apareció la pantalla **genérica** del error boundary de
React: *"Algo salió mal / Ocurrió un error inesperado."* Se reprodujo dos
veces de forma consistente.

**Diagnóstico con `read_network_requests`:** el servidor sí respondió
correctamente — `POST /cambiar-contrasena` devolvió **503**, el propio 503
inline de spec-046. El problema está en el cliente: Next.js espera un formato
de respuesta específico (RSC/streaming) para la respuesta de un Server Action,
y el HTML plano del 503 de spec-046 no cumple ese formato — el runtime del
cliente no puede interpretarlo y dispara el error boundary genérico
(`app/error.tsx`) en vez de mostrar cualquier mensaje relacionado con
"servicio no disponible".

**Por qué no se corrige aquí:** es un hallazgo de **spec-046**, no de
spec-051 — `changePassword` está devolviendo exactamente lo que debe (el 503
llega, el servidor no miente), y el defecto vive en la interacción entre el
503 inline de spec-046 y el protocolo de Server Actions de Next.js. Afecta
potencialmente a **cualquier** Server Action del proyecto invocada mientras
Auth está caído (`signIn`, `signOut`, `withdrawStudentAction`, etc.), no solo
a `changePassword`. Escalado a `docs/specs/backlog.md` como deuda nueva.

## Casos de prueba — MCP

### TC-MCP-051-001 — `reset_student_password`
**Herramienta probada:** `reset_student_password` en `students-mcp`
**Cubre:** criterio 12
**Input de prueba:** `student_id` del estudiante A, sin `password` (generada).
**Output esperado:** la contraseña aplicada, devuelta una sola vez. El
estudiante entra con ella y queda confinado en `/cambiar-contrasena`
(reverificar con TC-051-008).
**Comprobación adicional:** invocar con un `student_id` inexistente devuelve un
error claro, no un éxito silencioso.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 14
- Diagnóstico de cuentas duplicadas (Fase 7): {{pendiente}}
- Contraseña del docente de desarrollo restaurada: ⬜ Pendiente
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
