# test-062 — Nombres y apellidos separados, orden por apellido en el panel docente

## Datos de prueba
> Se parte de `npm run seed:dev` en `nodo-dev`, sembrado **antes** de aplicar
> las migraciones de este spec (así los perfiles pasan por el backfill).
> Estudiantes y nombres se gestionan vía `students-mcp` o `/api/students`; la
> sesión de asistencia y las correcciones de nombre se hacen desde la UI como
> parte de los casos.

**Recursos base (de `seed:dev`, no se crean ni se eliminan):**

| Recurso | Identificador | Uso en esta ronda |
|---------|---------------|-------------------|
| Docente de desarrollo | `dev@nodo.local` / `TEACHER_PASSWORD` de `.env.local` | Dueño de los cursos DEV. |
| Curso "DEV — Estructuras de Datos" | código `DEVEDD2026` | Curso de todas las listas. |
| Curso "DEV — Análisis de Algoritmos" | código `DEVADA2026` | Estudiante retirado (TC-062-10). |
| Estudiante "Estudiante Dev Uno" | `dev-estudiante1@nodo.local` / `DevStudent2026!` | Activo en DEVEDD2026 y DEVADA2026. |
| Estudiante "Estudiante Dev Dos" | `dev-estudiante2@nodo.local` / `DevStudent2026!` | Activo en DEVEDD2026. |
| Estudiante "Estudiante Dev Tres" | `dev-estudiante3@nodo.local` / `DevStudent2026!` | Activo en DEVPC2026; queda sin revisar (TC-MCP-062-03). |

**Recursos creados durante la ronda:**

| Recurso | Creación | Identificador | Eliminado |
|---------|----------|---------------|-----------|
| Cambio de nombres de Dev Uno a "Ana" / "Álvarez" | UI lista de matriculados (TC-062-02) | `dev-estudiante1@nodo.local` | ✅ (restaurar con `students-mcp update_student` → `first_name: "Estudiante Dev"`, `last_name: "Uno"`) |
| Cuenta "Test Registro Sesentaydos" | Registro en `/registro` con código `DEVEDD2026` (TC-062-03) | `registro.test062@nodo.local` / {{id}} | ✅ (`students-mcp delete_student`) |
| Estudiante "Mononimo" (una sola palabra) | `POST /api/students` con `full_name: "Mononimo"` + `enrollment_code: "DEVEDD2026"` (TC-062-11) | `mononimo.test062@nodo.local` / {{id}} | ✅ (`students-mcp delete_student`) |
| Sesión manual de asistencia en DEVEDD2026, con Dev Uno y Dev Dos presentes | UI planilla de asistencia (TC-062-06) | {{session_id}} | ❌ permanente (dato de prueba; si no hay eliminación por UI, anotarlo como permanente) |
| Evaluación publicada con envíos de Dev Uno y Dev Dos en DEVEDD2026 | `assignment-mcp create_assignment_group` + `publish_assignment_group`; envíos desde la UI del estudiante (TC-062-08, -09) | {{group_id}} | ❌ permanente (`delete_assignment_group` responde 409 con envíos: anotarlo como permanente, igual que en test-056) |
| Retiro de Dev Uno de DEVADA2026 | `students-mcp unenroll_student` (TC-062-10) | {{enrollment_id}} | ✅ (revertir con `enroll_student`) |
| Estudiante "Mcp Prueba Sesentaydos" | `students-mcp create_student` (TC-MCP-062-01) | `mcp.test062@nodo.local` / {{id}} | ✅ (`students-mcp delete_student`) |

**Limpieza (orden inverso):** borrar los estudiantes temporales → reactivar a
Dev Uno en DEVADA2026 → restaurar los nombres de Dev Uno → anotar los datos
que no se pueden eliminar.

**Entorno de pruebas:** desarrollo (`nodo-dev`, `npm run dev` en el puerto 3002)
**Fecha de la ronda:** 2026-10-20 (ejecutada por Claude con navegador y MCPs por delegación del usuario; servidor del worktree en el puerto 3012)

## Casos de prueba

### TC-062-01 — Propuesta automática tras la migración
**Precondición:** migraciones aplicadas en `nodo-dev` sin volver a correr `seed:dev`.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la lista de matriculados de "DEV — Estructuras de Datos".
**Resultado esperado:** aviso "2 estudiantes con nombres por revisar". Dev
Uno y Dev Dos con insignia "Revisar", mostrados como "Dev Uno, Estudiante" y
"Dev Dos, Estudiante" (3 palabras → 1 nombre + 2 apellidos). El menú de
usuario de cada estudiante sigue mostrando "Estudiante Dev Uno".
**Estado:** ✅ Aprobado
**Hallazgos:** Aviso "3 estudiantes con nombres por revisar" (2 sembrados + "Mononimo" de TC-062-11, ya presente). Dev Uno/Dev Dos con insignia y "Dev Uno, Estudiante". Menú de usuario de Dev Uno: "Estudiante Dev Uno".

### TC-062-02 — Revisar, corregir y confirmar nombres
**Precondición:** TC-062-01 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Activar la edición de Dev Dos.
2. Sin cambiar nada, pulsar ✓.
3. Activar la edición de Dev Uno; poner Nombres = `Ana`, Apellidos = `Álvarez`; Enter.
4. Activar de nuevo la edición, borrar Apellidos y pulsar Escape.
5. Activar la edición, dejar Apellidos vacío y pulsar ✓.
**Resultado esperado:**
1. Dos campos con la propuesta ("Estudiante" | "Dev Dos").
2. Se guarda; la insignia desaparece; el aviso pasa a "1 estudiante".
3. Se guarda tras el spinner (sin actualización optimista); la fila muestra
   "Álvarez, Ana"; sin insignia; sin aviso.
4. Se cancela sin guardar.
5. Error de validación con `role="alert"`; la edición sigue abierta con lo
   tecleado.
**Estado:** ✅ Aprobado
**Hallazgos:** Pasos 1–5 OK. En el paso 5 el error es "Apellidos: Debe tener al menos 2 caracteres" (role="alert", edición abierta). Escape cancela sin guardar.

### TC-062-03 — Registro con nombres y apellidos separados
**Precondición:** sesión cerrada.
**Datos de prueba usados:** `registro.test062@nodo.local`, contraseña de prueba, código `DEVEDD2026`
**Pasos:**
1. Abrir el registro.
2. Intentar registrarse con Apellidos vacío.
3. Registrarse con Nombres `Test Registro` y Apellidos `Sesentaydos`.
4. Como docente, abrir la lista de matriculados de DEVEDD2026.
**Resultado esperado:**
1. Campos "Nombres" y "Apellidos" en lugar de "Nombre completo".
2. Error de validación; no se crea la cuenta.
3. Se crea y queda matriculada (flujo de spec-027 intacto).
4. Aparece "Sesentaydos, Test Registro" **sin** insignia "Revisar".
**Estado:** ⚠️ Parcial
**Hallazgos:** El formulario muestra "Nombres" y "Apellidos"; Apellidos de 1 letra da el error de validación y no crea cuenta. El alta completa NO se pudo ejecutar por UI: `nodo-dev` tiene "Confirm email" activo y Supabase responde `over_email_send_rate_limit` / `email_address_invalid` (dominio .local). Se verificó la misma ruta (`handle_new_user` con partes en `user_metadata`) creando la cuenta por `POST /api/students`: queda con partes, sin marca de revisión, matriculada, y aparece como "Sesentaydos, Test Registro" sin insignia. Pendiente: desactivar "Confirm email" en nodo-dev para probar el registro real (ver CLAUDE.md, Base de datos, punto 4).

### TC-062-04 — El estudiante edita sus nombres y apellidos en `/cuenta`
**Precondición:** TC-062-03 aprobado.
**Datos de prueba usados:** `registro.test062@nodo.local`
**Pasos:**
1. Iniciar sesión con la cuenta nueva y abrir `/cuenta`.
2. Cambiar Apellidos a `Sesenta Dos` y guardar.
3. Observar el menú de usuario.
**Resultado esperado:** dos campos con los valores del registro; se guarda;
el menú muestra "Test Registro Sesenta Dos" (orden natural).
**Estado:** ✅ Aprobado
**Hallazgos:** Dos campos con los valores del alta; guardar "Sesenta Dos" muestra "Perfil actualizado" y el menú queda "Test Registro Sesenta Dos".

### TC-062-05 — Lista de matriculados ordenada por apellido
**Precondición:** TC-062-02 y TC-062-04 aprobados.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la lista de matriculados de DEVEDD2026.
**Resultado esperado:** orden "Álvarez, Ana" → "Dev Dos, Estudiante" →
"Sesenta Dos, Test Registro" (la tilde no manda a Álvarez al final).
**Estado:** ✅ Aprobado
**Hallazgos:** Orden Álvarez, Ana → Dev Dos → Sesenta Dos (Mcp Prueba) → Sesenta Dos (Test Registro) → Mononimo (sin apellido, al final).

### TC-062-06 — Planilla de asistencia ordenada por apellido
**Precondición:** TC-062-05 aprobado. Crear desde la planilla de asistencia una sesión manual y marcar como presentes primero a Dev Dos y después a Ana Álvarez.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir "Asistencia" de DEVEDD2026.
**Resultado esperado:** mismas filas, mismo orden y mismo formato que
TC-062-05. Las etiquetas accesibles de cada celda siguen en orden natural
("Asistencia de Ana Álvarez el …").
**Estado:** ✅ Aprobado
**Hallazgos:** Mismo orden y formato. aria-label de celdas en orden natural ("Asistencia de Ana Álvarez el 19 de octubre de 2026").

### TC-062-07 — Planilla de notas ordenada por apellido
**Precondición:** TC-062-05 aprobado; al menos un ítem de calificación en DEVEDD2026.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir "Calificaciones" de DEVEDD2026.
**Resultado esperado:** mismo orden y formato que TC-062-05.
**Estado:** ✅ Aprobado
**Hallazgos:** Con un ítem "Parcial test-062": mismo orden y formato. Empate de apellido resuelto por nombre.

### TC-062-08 — Lista de envíos y revisión de un envío
**Precondición:** evaluación publicada en DEVEDD2026 con un envío de Dev Dos y luego uno de Ana Álvarez (en ese orden).
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la lista de envíos de la evaluación.
2. Abrir la revisión del envío de Ana Álvarez.
**Resultado esperado:**
1. "Álvarez, Ana" primero y "Dev Dos, Estudiante" después, aunque Dev Dos
   envió antes.
2. El encabezado dice "Revisión del envío de Ana Álvarez" (orden natural).
**Estado:** ✅ Aprobado
**Hallazgos:** Lista: "Álvarez, Ana" antes que "Dev Dos, Estudiante" aunque Dev Dos envió antes. Encabezado: "Revisión del envío de Ana Álvarez". Nota: Ana quedó con un segundo intento en progreso por abrir el quiz con la matrícula de DEVADA (la página no valida que la matrícula pertenezca al curso del grupo; fuera de alcance, ver backlog).

### TC-062-09 — Asignación de variantes muestra los nombres
**Precondición:** la evaluación de TC-062-08. Antes de desplegar este spec,
anotar en "Hallazgos" qué muestra hoy esa vista (error o "Desconocido").
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la vista de asignación de variantes de la evaluación.
**Resultado esperado:** cada fila muestra "Apellidos, Nombres" del estudiante
con su variante, ordenadas por apellido; ningún "Desconocido".
**Estado:** ✅ Aprobado
**Hallazgos:** Antes: no se pudo observar el síntoma previo (se implementó la corrección sin reproducirlo; el embed `students` no tiene relación posible). Ahora: tres filas con "Apellidos, Nombres" y variante, ninguna "Desconocido".

### TC-062-10 — Retirados: formato, orden y sin edición
**Precondición:** Dev Uno ("Ana Álvarez") retirado de DEVADA2026 con `students-mcp unenroll_student`.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la lista de matriculados de DEVADA2026.
**Resultado esperado:** "Álvarez, Ana" en "Retirados", sin botón de edición
de nombre (spec-057 D4) y sin contar en el aviso de nombres por revisar.
**Estado:** ✅ Aprobado
**Hallazgos:** "Álvarez, Ana" en Retirados, sin botón de edición, "No hay estudiantes activos", sin aviso de revisión.

### TC-062-11 — Estudiante de una sola palabra y escritura legada
**Precondición:** crear "Mononimo" con `POST /api/students` enviando solo `full_name` (camino de compatibilidad) y matricularlo en DEVEDD2026.
**Datos de prueba usados:** `dev@nodo.local`; `mononimo.test062@nodo.local`
**Pasos:**
1. Abrir la lista de matriculados de DEVEDD2026.
**Resultado esperado:** la fila muestra "Mononimo" **sin coma**, con insignia
"Revisar" (separación automática), y queda al final del orden (apellido
vacío).
**Estado:** ✅ Aprobado
**Hallazgos:** Creado con `POST /api/students` solo con `full_name`: "Mononimo" sin coma, insignia "Revisar", al final del orden.

### TC-062-12 — Modo claro/oscuro y ancho móvil
**Precondición:** TC-062-05 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Revisar la lista de matriculados (lectura y edición en dos campos) y el
   registro en modo claro y oscuro.
2. Revisarlos a ancho de móvil.
**Resultado esperado:** insignia "Revisar" con el estilo de advertencia de
`DESIGN.md`; los dos campos de edición caben en la celda sin desbordar la
tabla; el formulario de registro se apila en móvil.
**Estado:** ⚠️ Parcial
**Hallazgos:** Modo oscuro verificado (insignia amarilla de advertencia, dos campos caben en la celda en desktop). Modo claro y ancho móvil NO verificados: `resize_window` no cambia el viewport real y el navegador quedó bloqueado por un diálogo de confirmación al borrar el ítem de calificación. Por revisar por el usuario.

## Casos de prueba — MCP

### TC-MCP-062-01 — `create_student` con nombres y apellidos
**Herramienta probada:** `create_student` en `students-mcp`
**Precondición:** `npm run dev` corriendo; `students-mcp` apuntando a `nodo-dev`.
**Input de prueba:** `{ first_name: "Mcp Prueba", last_name: "Sesentaydos", email: "mcp.test062@nodo.local", password: "<de prueba>", enrollment_code: "DEVEDD2026" }`; luego el mismo sin `last_name`.
**Output esperado:** el primero crea al estudiante con `first_name`,
`last_name`, `full_name = "Mcp Prueba Sesentaydos"`, `name_needs_review:
false` (sin contraseña en la respuesta). El segundo es rechazado por
validación.
**Estado:** ✅ Aprobado
**Hallazgos:** Con `last_name` ausente la API rechaza (422 "Indica first_name y last_name (o full_name)"). Con ambos: `first_name`, `last_name`, `full_name = "Mcp Prueba Sesentaydos"`, `name_needs_review: false`, sin contraseña.

### TC-MCP-062-02 — `update_student` con nombres y apellidos
**Herramienta probada:** `update_student` en `students-mcp`
**Precondición:** TC-MCP-062-01 aprobado.
**Input de prueba:** `{ id: "<id del estudiante MCP>", last_name: "Sesenta Dos" }`.
**Output esperado:** `last_name` actualizado, `first_name` intacto,
`full_name = "Mcp Prueba Sesenta Dos"`, `name_needs_review: false`. El
esquema del tool ya no ofrece `full_name`.
**Estado:** ✅ Aprobado
**Hallazgos:** Hallazgo corregido: la primera versión exigía enviar ambas partes juntas; ahora `{id, last_name}` fusiona con la parte existente. Resultado: "Mcp Prueba" | "Sesenta Dos", `name_needs_review: false`. El esquema del tool ya no ofrece `full_name`.

### TC-MCP-062-03 — `list_students` por apellido y filtro de revisión
**Herramienta probada:** `list_students` en `students-mcp`
**Precondición:** TC-062-02 aplicado; Dev Tres sigue sin revisar.
**Input de prueba:** `{ academic_course_id: "<DEVEDD2026>" }`; luego `{ name_review_pending: true }`.
**Output esperado:** la primera lista viene ordenada por apellido (Álvarez
primero) con `first_name`, `last_name`, `name_needs_review` por fila. La
segunda incluye a Dev Tres y a "Mononimo", no a Ana Álvarez.
**Estado:** ✅ Aprobado
**Hallazgos:** Lista por curso con Álvarez primero y partes por fila; `name_review_pending: true` devolvió Dev Tres y Mononimo, no a Ana.

### TC-MCP-062-04 — `get_student` devuelve las partes del nombre
**Herramienta probada:** `get_student` en `students-mcp`
**Precondición:** TC-MCP-062-02 aprobado.
**Input de prueba:** `{ id: "<id del estudiante MCP>" }`.
**Output esperado:** `first_name: "Mcp Prueba"`, `last_name: "Sesenta Dos"`,
`full_name`, `name_needs_review: false` y sus matrículas.
**Estado:** ✅ Aprobado
**Hallazgos:** `get_student` devuelve partes, `full_name`, `name_needs_review: false` y matrículas.

### TC-MCP-062-05 — `get_course_attendance_summary` ordenado por apellido
**Herramienta probada:** `get_course_attendance_summary` en `attendance-mcp`
**Precondición:** sesión de TC-062-06.
**Input de prueba:** `{ course_id: "<id de DEVEDD2026>" }`.
**Output esperado:** cada estudiante trae `student_name`, `first_name` y
`last_name`; la lista viene ordenada por apellido (Álvarez primero).
**Estado:** ✅ Aprobado
**Hallazgos:** Resumen con `student_name`, `first_name`, `last_name`; Álvarez primero.

### TC-MCP-062-06 — `get_session_attendance` con partes y orden de llegada
**Herramienta probada:** `get_session_attendance` en `attendance-mcp`
**Precondición:** sesión de TC-062-06 (Dev Dos marcado antes que Ana Álvarez).
**Input de prueba:** `{ session_id: "<id de la sesión>" }`.
**Output esperado:** registros con `student_name`, `first_name`, `last_name`
y `marked_at`, en orden de llegada (D11), no por apellido.
**Estado:** ✅ Aprobado
**Hallazgos:** Registros con partes en orden de llegada: Dev Dos (…:46) antes que Ana (…:50).

## Resumen de la ronda
- Aprobados: 16 — Fallidos: 0 — Parciales: 2 (TC-062-03, TC-062-12) — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⚠️ Casi completa. Eliminados: estudiantes registro/mcp/mononimo; Ana reactivada en DEVADA y con sus nombres restaurados; Dev Dos con nombres confirmados. **Permanentes:** evaluación "Quiz test-062" (`4e00ed9b-c8b3-4ebc-93ad-d11e7de99449`, 409 con envíos), sesión de asistencia manual del 19/10 en DEVEDD2026 y el ítem de calificación "Parcial test-062" (el navegador se bloqueó con un diálogo de confirmación al eliminarlo: borrarlo desde la UI).
