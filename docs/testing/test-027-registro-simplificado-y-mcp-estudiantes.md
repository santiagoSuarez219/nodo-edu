# test-027 — Registro simplificado con código de curso y MCP de administración de estudiantes

## Datos de prueba

> Se completan al preparar la ronda de ejecución (ver "Pruebas manuales asistidas
> por Claude" en `CLAUDE.md`). Los recursos deben crearse vía API/MCP y
> eliminarse al cerrar la ronda; nada de esto se monta en producción.

| Recurso | Endpoint/API de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico activo "test-027 — Curso A" (`enrollment_code=T027ACTV`) | `POST /rest/v1/academic_courses` (sin endpoint de servicio dedicado) | `6fa5c42e-bde8-4b67-b573-1342e990a7d3` | ✅ (`DELETE /rest/v1/academic_courses`) |
| Curso académico **inactivo** "test-027 — Curso inactivo" (`enrollment_code=T027INAC`) | `POST /rest/v1/academic_courses` | `5578add9-dcee-44e5-b893-1c8a9a3df1db` | ✅ (`DELETE /rest/v1/academic_courses`) |
| Curso académico activo "test-027 — Curso segundo" (`enrollment_code=T027SEC1`, para TC-027-009) | `POST /rest/v1/academic_courses` | `e199cc0e-4360-49e4-8ab0-62c9fc0273f6` | ✅ (`DELETE /rest/v1/academic_courses`) |
| Estudiante de prueba ya registrado (correo conocido, para el caso de correo duplicado) — "Gloria Cortes" / `santiagosuarez272510@correo.itm.edu.co`, matriculado en Curso A | UI `/registro` (TC-027-002) | `4a895b66-90bb-49d3-be2b-ae0db77db55f` | ✅ (`DELETE /api/students/{id}`, 2 matrículas removidas) |
| Cuenta huérfana del primer intento fallido de TC-027-002 (Confirm email aún activo) — `ee43365b-897d-4676-9899-d3f386d3eb44` | UI `/registro` (intento fallido) | `ee43365b-897d-4676-9899-d3f386d3eb44` | ✅ (`DELETE /auth/v1/admin/users/{id}`, sin matrícula asociada) |
| Cuenta preexistente sin confirmar reactivada por el primer intento de TC-027-003 (`santiagosuarez9056@correo.itm.edu.co`, existía desde antes de spec-027) | preexistente, reactivada por `signUp()` | `c28d6b81-47cb-4009-a772-d76ea0853442` | ✅ (`DELETE /auth/v1/admin/users/{id}`, decidido con el usuario) |
| Cuenta "Pepillo" / `test027-repro-stale@example.com`, creada para reproducir el bug de TC-027-003 (sin confirmar, perfil/rol despojados a propósito) y luego usada para verificar el fix — matriculada en Curso A | `POST /auth/v1/admin/users` + UI `/registro` | `e838cec9-96b3-4b7a-8206-81b8c735a2e0` | ✅ (`DELETE /api/students/{id}`, 1 matrícula removida) |
| "Estudiante Creado MCP" / `test027-mcp-create@example.com`, matriculado en Curso A (TC-MCP-027-003, reusado para `update_student`) | `POST /api/students` | `8a89d5cc-7a64-4cbf-a6c9-d94cb69ba38e` | ✅ (`DELETE /api/students/{id}`, 1 matrícula removida) |
| "Estudiante Desechable" / `test027-mcp-delete@example.com`, creado y borrado en TC-MCP-027-005 | `POST /api/students` | `82dae42d-68e7-46ae-a8f7-0c705e5c9652` | ✅ (`DELETE /api/students/{id}`, verificado en la propia prueba) |
| "Estudiante Enroll Test" / `test027-mcp-enroll@example.com`, para `enroll_student`/`unenroll_student` (TC-MCP-027-006) | `POST /api/students` | `a9e3ac44-b384-4ca6-8d27-3698da628211` | ✅ (`DELETE /api/students/{id}`, 1 matrícula removida) |

**Limpieza verificada:** `GET /api/students` tras la limpieza muestra
únicamente los 7 estudiantes preexistentes de rondas anteriores
(test-018/019/020), ninguno de esta ronda quedó huérfano.

**Entorno de pruebas:** desarrollo (proyecto Supabase único del repo)
**Fecha de la ronda:** 2026-07-29

> **Nota sobre TC-MCP-027-\*:** esta sesión de Claude Code no tiene el
> servidor `students-mcp` conectado como herramienta (vive para Claude
> Desktop, ver `CLAUDE.md`). Los casos `TC-MCP-027-*` se ejecutan invocando
> directamente `/api/students/*` — el mismo HTTP que `students-mcp` envuelve
> internamente — para validar la capa de servicio. El arranque del binario
> del MCP ya se verificó en la Fase 6 (`✓ Students MCP iniciado`); probar la
> herramienta tal cual la usaría un agente requeriría configurarla en Claude
> Desktop, fuera del alcance de esta sesión.

---

## Precondiciones generales

- `npm run dev` corriendo, `.env.local` con `STUDENTS_ADMIN_API_KEY` configurada
  y distinta de `QUESTION_BANK_API_KEY`.
- Confirmación de correo desactivada en el proyecto Supabase (`Authentication →
  Providers → Email → Confirm email` en OFF) — precondición de infraestructura
  de todo este spec, no de un caso puntual.
- `students-mcp` compilado y registrado en la configuración local de Claude
  Desktop (o accesible por el agente de pruebas) con la `STUDENTS_ADMIN_API_KEY`
  correcta.

---

## Casos de prueba

### TC-027-001 — Formulario de registro muestra el campo de código
**Precondición:** ninguna.
**Pasos:**
1. Ir a `/registro`.
2. Observar los campos del formulario.

**Resultado esperado:** el formulario muestra exactamente cinco campos: nombre
completo, correo, contraseña, confirmación de contraseña y código del curso
(con placeholder/ayuda indicando que lo entrega el docente en clase).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-027-002 — Registro con código válido matricula y autentica en un solo paso
**Precondición:** curso activo con `enrollment_code` conocido (tabla de datos
de prueba).
**Datos de prueba usados:** `enrollment_code` del curso activo.
**Pasos:**
1. Completar `/registro` con nombre, correo nuevo, contraseña y el código del
   curso activo.
2. Enviar el formulario.

**Resultado esperado:** no aparece ninguna pantalla de "revisa tu correo"; el
navegador aterriza directamente en `/cuenta/cursos` con sesión iniciada, y el
curso correspondiente aparece en la lista de cursos matriculados.
**Estado:** ✅ Aprobado
**Hallazgos:** En el primer intento, "Confirm email" seguía activo en el
dashboard de Supabase (el toggle real vive en Authentication → Sign In /
Providers → User Signups, no en el drawer del proveedor Email donde se buscó
originalmente) — `signUp` devolvió el error de sesión ausente correctamente
(hallazgo #4 de la revisión funcionando como debía), sin crear matrícula.
Cuenta huérfana (`ee43365b-...`) eliminada. Con "Confirm email" ya
desactivado, el reintento funcionó: usuario `4a895b66-90bb-49d3-be2b-ae0db77db55f`
("Gloria Cortes") creado con `email_confirmed_at` = `created_at` (sin
`confirmation_sent_at`), sesión iniciada de inmediato, y matrícula `active`
verificada en `enrollments` (`97c2ad79-fcb7-4d57-96f9-56e8f5624ada`) contra
el Curso A.

### TC-027-003 — El código se normaliza (minúsculas y espacios)
**Precondición:** igual a TC-027-002.
**Pasos:**
1. Repetir el registro con un correo distinto, escribiendo el mismo código en
   minúsculas y con espacios al inicio/final.

**Resultado esperado:** el registro funciona igual que en TC-027-002.
**Estado:** ✅ Aprobado
**Hallazgos:** **Bug real encontrado y corregido durante esta ronda** (no
detectado por `@reviewer`): el primer intento usó
`santiagosuarez9056@correo.itm.edu.co`, un correo que ya existía en
`auth.users` **sin confirmar** desde hacía semanas (de rondas de prueba
anteriores a spec-027). `signUp()` reactivó esa fila con un `UPDATE` en vez de
un `INSERT`, así que el trigger `on_auth_user_created` (`AFTER INSERT`) nunca
disparó — sesión creada, pero sin `profiles`/`user_roles`/`students`/matrícula
(verificado por API: las tres tablas vacías para ese `user_id`). Esto refuta
la premisa con la que se omitió el fallback en la Fase 2 ("el trigger
endurecido ya cubre todo caso alcanzable" — cierto para inserts fallidos, pero
no para reactivación de una fila existente).

Corregido con `ensureStudentAccountBootstrap` (nueva función en
`lib/students/service.ts`, con el cliente de servicio ya que ninguna de las 3
tablas tiene policy de INSERT propia), invocada en `signUp` justo después de
confirmar `session`. Verificado reproduciendo la condición exacta (cuenta sin
confirmar y sin perfil/rol vía API) con `test027-repro-stale@example.com` +
código normalizado `t027actv` con espacios: aterrizó en `/cuenta/cursos` con
Curso A activo, y se confirmó por API que `profiles`, `user_roles` (rol
`student`), `students` y `enrollments` (`9ad2296a-...`, `status: active`)
quedaron creados correctamente.

### TC-027-004 — Código inexistente no crea usuario
**Precondición:** ninguna.
**Pasos:**
1. Completar `/registro` con un código que no corresponde a ningún curso.
2. Enviar el formulario.

**Resultado esperado:** error genérico asociado al campo del código; el
formulario no redirige; verificar por API/MCP que no se creó ningún usuario con
ese correo.
**Estado:** ✅ Aprobado
**Hallazgos:** Mensaje "Código de curso inválido. Verifica con tu docente."

### TC-027-005 — Código de curso inactivo da el mismo error que un código inexistente
**Precondición:** curso inactivo con `enrollment_code` conocido.
**Pasos:**
1. Completar `/registro` con el código del curso inactivo.
2. Enviar el formulario.

**Resultado esperado:** el mensaje de error es **idéntico** (mismo texto) al de
TC-027-004 — no debe distinguirse "no existe" de "está inactivo".
**Estado:** ✅ Aprobado
**Hallazgos:** Mensaje "Código de curso inválido. Verifica con tu docente."
idéntico al de TC-027-004 (mismo código de la función unificada, garantizado
por construcción).

### TC-027-006 — Correo ya registrado no crea una segunda cuenta
**Precondición:** estudiante de prueba ya registrado (tabla de datos de prueba).
**Pasos:**
1. Completar `/registro` con el correo ya usado y un código válido.
2. Enviar el formulario.

**Resultado esperado:** error de correo duplicado; no se crea una segunda
cuenta ni una segunda matrícula.
**Estado:** ✅ Aprobado
**Hallazgos:** Mensaje "No se pudo crear la cuenta. Intenta de nuevo." (no
distingue causa, consistente con el resto del formulario). Verificado por API
que el conteo total de usuarios no cambió (12 antes y después del intento).

### TC-027-007 — `/registro/confirmar` y `/auth/callback` ya no existen
**Precondición:** ninguna.
**Pasos:**
1. Navegar directamente a `/registro/confirmar`.
2. Navegar directamente a `/auth/callback`.

**Resultado esperado:** 404 en ambas rutas.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-027-008 — Recuperación de contraseña: eliminada (ampliación de scope en vivo)
**Precondición:** ninguna.
**Pasos (originales, ejecutados antes del cambio de scope):**
1. Navegar a `/recuperar-password` y confirmar que la página carga y el
   formulario se puede enviar (aunque el correo no llegue por falta de SMTP).

**Resultado observado:** funcionó (página cargaba, formulario se enviaba).
**Decisión tomada durante la ronda:** el usuario pidió eliminar el flujo por
completo (sin SMTP nunca entrega el correo; la única recuperación real es vía
docente/`students-mcp`) — ver "Incluye" del spec, sección de ampliación de
scope. Se eliminaron `/recuperar-password`, `/recuperar-password/confirmar`,
`PasswordResetRequestForm`, `PasswordResetConfirmForm`,
`requestPasswordReset`, `updatePassword`, los schemas asociados, la entrada de
`middleware.ts`, y el enlace "¿Olvidaste tu contraseña?" en `LoginForm`.
**Estado:** ✅ Aprobado (como retiro completo — re-verificado con `curl`:
`/recuperar-password` y `/recuperar-password/confirmar` responden `307` hacia
`/login` para un visitante anónimo, porque el middleware ya no las trata como
públicas y no hay sesión — no hay build corriendo para confirmar el `404` que
vería un usuario ya autenticado, pero el archivo de página fue eliminado, así
que no hay UI alcanzable en ningún caso. `LoginForm.tsx` confirmado sin el
enlace "¿Olvidaste tu contraseña?" — 0 coincidencias.).
**Hallazgos:** El criterio de aceptación 8 del spec queda obsoleto por este
cambio (decía "el flujo sigue funcionando"); ver criterios actualizados.

### TC-027-009 — Matrícula a un segundo curso desde `/cuenta/cursos` sigue funcionando
**Precondición:** estudiante ya registrado (de TC-027-002) y un segundo curso
activo con su propio `enrollment_code`.
**Pasos:**
1. Iniciar sesión con el estudiante de TC-027-002.
2. Ir a `/cuenta/cursos` y matricularse en el segundo curso con su código.

**Resultado esperado:** la matrícula al segundo curso funciona igual que antes
del spec (regresión de `enrollByCourseCodeAction`).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — Gloria Cortes quedó matriculada en Curso A
(desde el registro) y Curso segundo (desde `/cuenta/cursos`), sin regresión.

### TC-027-010 — Registro de ~30 estudiantes seguidos no activa el rate limit
**Precondición:** curso activo con `enrollment_code` conocido.
**Pasos:**
1. Registrar (o simular, según cómo quede implementado el rate limit) 30
   registros seguidos desde la misma red/IP en un lapso corto, como ocurriría
   en un salón de clase.

**Resultado esperado:** los 30 registros se completan sin ser bloqueados por el
rate limiting.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado con una réplica en aislado del algoritmo exacto de
`lib/auth/rate-limit.ts` (misma ventana de 10 min, mismos umbrales 40/IP y
200/código), en vez de 30 registros reales por UI (impráctico manualmente,
decidido con el usuario). Simulación: 35 intentos (30 estudiantes + 5 typos)
desde la misma IP y código → **0 bloqueados**. 10 intentos adicionales por
encima del umbral de 40 → **5 bloqueados**, confirmando que el límite sí actúa
más allá del umbral real (no es un no-op). Script:
`node /tmp/rate-limit-test.mjs` (no versionado, solo para esta verificación).

---

### TC-MCP-027-001 — `list_students` filtra por curso
**Herramienta probada:** `list_students` en `students-mcp`.
**Precondición:** al menos un estudiante matriculado en un curso conocido.
**Input de prueba:** `academic_course_id` del curso.
**Output esperado:** lista de estudiantes matriculados en ese curso, con
nombre y correo, y **sin** `enrollment_code` en la respuesta.
**Estado:** ✅ Aprobado
**Hallazgos:** `GET /api/students?academic_course_id=6fa5c42e-...` devolvió
exactamente los 2 matriculados en Curso A (Gloria Cortes, Pepillo), sin
`enrollment_code` en ninguna fila. También confirmó en el camino el fix del
filtro por rol `student` (la cuenta docente/admin no aparece pese a tener fila
en `students`, ver hallazgo de TC-027-003/Fase 5).

### TC-MCP-027-002 — `get_student` devuelve detalle con matrículas
**Herramienta probada:** `get_student`.
**Precondición:** estudiante con al menos una matrícula.
**Input de prueba:** id del estudiante.
**Output esperado:** perfil, datos académicos y matrículas del estudiante.
**Estado:** ✅ Aprobado
**Hallazgos:** `GET /api/students/4a895b66-...` (Gloria Cortes) devolvió perfil
completo y las 2 matrículas reales (Curso A de TC-027-002, Curso segundo de
TC-027-009), ambas `status: active`.

### TC-MCP-027-003 — `create_student` crea una cuenta operativa
**Herramienta probada:** `create_student`.
**Precondición:** curso activo con `enrollment_code` conocido.
**Input de prueba:** nombre, correo nuevo y código del curso.
**Output esperado:** el estudiante creado puede iniciar sesión en `/login` con
la contraseña indicada/generada, y ve el curso en `/cuenta/cursos`.
**Estado:** ✅ Aprobado
**Hallazgos:** `POST /api/students` con `enrollment_code=T027ACTV` creó
"Estudiante Creado MCP" (`8a89d5cc-...`), matriculado `active` en Curso A, sin
`password` ni `enrollment_code` en la respuesta. Verificado con
`POST /auth/v1/token?grant_type=password` que la cuenta autentica
correctamente con la contraseña dada.

### TC-MCP-027-004 — `update_student` corrige nombre/correo
**Herramienta probada:** `update_student`.
**Precondición:** estudiante existente.
**Input de prueba:** id del estudiante + nuevo `full_name` o `email`.
**Output esperado:** el cambio se refleja en la UI (perfil, listados).
**Estado:** ✅ Aprobado
**Hallazgos:** `PATCH /api/students/8a89d5cc-...` con `full_name` nuevo
devolvió el perfil actualizado ("Estudiante Corregido MCP"), matrícula
intacta.

### TC-MCP-027-005 — `delete_student` elimina en cascada y reporta qué se borró
**Herramienta probada:** `delete_student`.
**Precondición:** estudiante creado exclusivamente para este caso.
**Input de prueba:** id del estudiante.
**Output esperado:** la respuesta detalla qué se eliminó (perfil, matrículas,
entregas asociadas); tras la operación el estudiante no aparece en
`list_students` ni puede iniciar sesión.
**Estado:** ✅ Aprobado (tras corregir un bug real encontrado en esta prueba)
**Hallazgos:** **Bug real encontrado**: el primer intento de `DELETE` falló
con `{"error":{"code":"not_found","message":"{}"}}` y el estudiante **seguía
existiendo**. Causa raíz verificada directamente contra la API Admin de
Supabase: `enrollments.student_id` tiene `on delete restrict` (no cascade,
`20260625000001_init_enrollments.sql`), así que `auth.admin.deleteUser` falla
con una violación de FK cruda (`23503`) para cualquier estudiante con al menos
una matrícula — que ahora es casi cualquier estudiante real, porque este mismo
spec fusionó registro y matrícula. El comentario original en el código
("borrar el usuario hace cascade... spec-002/003") era incorrecto para esta
tabla específica.

Corregido en `deleteServiceStudent`: ahora borra explícitamente las
`enrollments` del estudiante antes de `deleteUser`. A su vez,
`submissions.enrollment_id` también es `restrict` — si ese borrado de
matrículas falla (estudiante con entregas reales), se traduce en un error
claro ("tiene entregas registradas... usa unenroll_student") en vez de dejar
pasar el error crudo de Postgres. La ruta también se corrigió para devolver
`409` (conflicto) en ese caso en vez de `404`.

Reintentado tras el fix: `DELETE /api/students/82dae42d-...` (1 matrícula, sin
entregas) → `200` con `enrollments_removed: 1`; `GET` posterior → `404`;
`POST /auth/v1/token` con sus credenciales → `400 invalid_credentials`.

### TC-MCP-027-006 — `enroll_student` / `unenroll_student`
**Herramienta probada:** `enroll_student` y `unenroll_student`.
**Precondición:** estudiante existente sin matrícula en el curso objetivo.
**Input de prueba:** id del estudiante + `academic_course_id` o
`enrollment_code`.
**Output esperado:** `enroll_student` crea la matrícula `active`;
`unenroll_student` la deja en `status = 'withdrawn'` (no la borra).
**Estado:** ✅ Aprobado
**Hallazgos:** `POST .../enrollments` con `enrollment_code=T027ACTV` creó la
matrícula `active` (`d30143c8-...`); `DELETE .../enrollments?academic_course_id=...`
la dejó en `status: withdrawn` con `withdrawn_at` poblado, fila conservada
(no borrada).

### TC-MCP-027-007 — `QUESTION_BANK_API_KEY` no autoriza `/api/students/*`
**Herramienta probada:** cualquier herramienta de `students-mcp` (o llamada
directa a la API).
**Precondición:** ninguna.
**Input de prueba:** petición a `/api/students` con header `x-api-key` igual a
`QUESTION_BANK_API_KEY` (no a `STUDENTS_ADMIN_API_KEY`).
**Output esperado:** `401` — la clave de otro dominio no debe autorizar rutas
de estudiantes.
**Estado:** ✅ Aprobado
**Hallazgos:** `GET /api/students` con `x-api-key: $QUESTION_BANK_API_KEY` →
`401 {"error":{"code":"unauthorized","message":"API key inválida"}}`. (Nota
metodológica: el primer intento dio `400` por un error propio del script de
prueba — `grep` capturó dos líneas de `.env.local`, no un bug de la app;
corregido y confirmado `401`.)

### TC-MCP-027-008 — Rutas existentes siguen aceptando `QUESTION_BANK_API_KEY`
**Herramienta probada:** cualquier tool de `question-bank-mcp`,
`assignment-mcp` o `attendance-mcp` (regresión de la generalización de
`authenticateServiceRequest`).
**Precondición:** ninguna.
**Input de prueba:** una llamada de lectura simple de cada MCP existente (ej.
`list_sessions` de `attendance-mcp`).
**Output esperado:** responde igual que antes del spec — sin regresión.
**Estado:** ✅ Aprobado
**Hallazgos:** Con `QUESTION_BANK_API_KEY` (la misma de siempre): `GET
/api/questions?limit=1` → `200`; `GET /api/assignments/academic-courses` →
`200`; `GET /api/attendance/sessions?courseId=...` → `200`. Sin regresión tras
generalizar `authenticateServiceRequest`.

---

## Resumen de la ronda

- Aprobados: 18 — Fallidos: 0 — Pendientes: 0
- **Bugs reales encontrados y corregidos durante la ronda** (ninguno detectado
  por `@reviewer` en las dos rondas de revisión previas):
  1. **"Confirm email" seguía activo** en el dashboard de Supabase pese a un
     intento anterior de desactivarlo — el toggle real vive en
     `Authentication → Sign In / Providers → User Signups`, no en el drawer
     del proveedor "Email". No es un bug de código, sino de infraestructura;
     documentado en TC-027-002.
  2. **`signUp()` sobre un correo preexistente sin confirmar no dispara el
     trigger `on_auth_user_created`** (reactiva la fila con `UPDATE`, no
     `INSERT`) → cuenta con sesión pero sin perfil/rol/matrícula. Corregido
     con `ensureStudentAccountBootstrap` (`lib/students/service.ts`). Ver
     TC-027-003.
  3. **`enrollments.student_id` es `on delete restrict`**, no cascade →
     `delete_student` fallaba para cualquier estudiante con al menos una
     matrícula (casi todos, tras fusionar registro+matrícula). Corregido en
     `deleteServiceStudent` (borra matrículas explícitamente antes del
     usuario) y en la ruta (409 en vez de 404 cuando hay entregas reales que
     lo impiden). Ver TC-MCP-027-005.
  - Ninguno de los tres afecta los criterios de aceptación aprobados en el
    diseño original; los tres ya están corregidos, verificados en vivo, y
    documentados en el spec y en este archivo.
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno nuevo (DEBT-011 se
  actualizó para reflejar la eliminación completa del flujo de recuperación de
  contraseña, decidida por el usuario durante esta misma ronda).
- Ampliación de scope aprobada en vivo por el usuario: eliminación completa del
  flujo de recuperación de contraseña (ver spec-027, sección "Incluye").
- Limpieza de datos de prueba: ✅ Completada — 3 cursos y 7 cuentas de
  estudiante (incluida una cuenta huérfana preexistente a esta sesión)
  eliminadas y verificadas; `GET /api/students` confirma solo los fixtures
  preexistentes de rondas anteriores.
