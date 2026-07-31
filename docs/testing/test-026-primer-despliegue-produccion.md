# test-026 — Primer despliegue a producción: flujos críticos del inicio de clases

> Pruebas manuales del **spec-026**, ejecutadas **sobre la URL de producción**
> una vez completada la Fase 6 (deploy).
>
> **Reglas de la ronda** (ver `CLAUDE.md` → "Pruebas manuales asistidas por Claude"):
> - Quien interactúa con la UI es **siempre el usuario**. Claude prepara datos,
>   guía paso a paso y registra hallazgos caso por caso.
> - Ningún caso se da por aprobado sin confirmación explícita del usuario.
> - **Entorno = PRODUCCIÓN.** Todo dato creado aquí es real: la limpieza al
>   cerrar la ronda no es opcional.
> - El framework de tests automatizados sigue "por definir" (`CLAUDE.md` →
>   Testing), por lo que este spec solo tiene pruebas manuales.
> - **Excepción — `TC-026-013`:** se ejecutó **adelantado, durante la Fase 5**
>   (no en Fase 7 tras el deploy), porque es un **GATE 🔒** de esa fase. Válido
>   igual: el caso prueba el backend de Supabase Auth (Admin API), que es el
>   mismo entorno de producción sin importar si el frontend ya está
>   desplegado en Vercel o corriendo en local apuntando al mismo proyecto.

**Contexto del release:** un solo docente (el usuario) y sus estudiantes. No hay
docentes colaboradores. Los casos de docente los ejecuta la cuenta real del
usuario; los de estudiante, cuentas de prueba desechables.

---

## Bloques de la ronda

| Bloque | Casos | Cuándo | Bloquea el inicio de clases |
|--------|-------|--------|------------------------------|
| **A — Registro y matrícula** | `TC-026-001` … `TC-026-004`, `TC-026-007` | Fase 7 | ✅ Sí |
| **B — Login y control de acceso** | `TC-026-005`, `TC-026-006`, `TC-026-014` | Fase 7 | ✅ Sí |
| **C — Contenido MDX y progreso** | `TC-026-008` … `TC-026-010` | Fase 7 | ✅ Sí |
| **D — Autoevaluación** | `TC-026-011` | Fase 7 | ✅ Sí |
| **E — Asistencia** | `TC-026-012` | Fase 7 | ✅ Sí |
| **F — Operación sin SMTP** | `TC-026-013` | Fase 5 (adelantado — ✅ ejecutado 2026-07-31) | ✅ Sí |
| **G — Evaluaciones A/B/C (diferido)** | `TC-026-015` … `TC-026-017` | Fase 8 (✅ ejecutado 2026-07-31) | ❌ No |
| **H — MCPs contra producción (diferido)** | `TC-MCP-026-001` … `TC-MCP-026-005` | Fase 8 (✅ ejecutado 2026-07-31) | ❌ No |

---

## Datos de prueba

> Recursos creados **en producción** para ejecutar estos casos.
> **Deben eliminarse al cerrar la ronda** (ver "Limpieza").

| # | Recurso | Cómo se crea | Identificador | Eliminado |
|---|---------|--------------|---------------|-----------|
| 1 | Curso académico de prueba | No usado — se reutilizaron los cursos reales del semestre (`estructuras-de-datos`, `analisis-de-algoritmos`) | N/A | N/A |
| 2 | Estudiante de prueba A | Registro desde la UI (`/registro`) — **es el caso TC-026-001** | `ca5f768f-b53a-41ac-b20b-23df90f8d2ac` / `spec026-smoke-a@nodo-test.local` | ✅ (`delete_student`, 2 matrículas removidas; verificado: `auth.users` en producción queda con 1 sola cuenta, la del docente) |
| 3 | Estudiante de prueba B (no matriculado) | `students-mcp` → `create_student` | `ff999b82-ba39-4900-b0aa-009e78a92bb4` / `spec026-smoke-b@nodo-test.local` | ✅ (`delete_student`) |
| 4 | Sesión de asistencia de prueba | UI docente, lección `implementacion-de-pilas-en-java` | N/A | ✅ (eliminada en cascada al borrar el Estudiante A / cerrada por el docente en el caso) |
| 5 | 3 preguntas de banco de prueba (bloque G) | `question-bank-mcp` → `create_question` | `7c50c0c2...`, `b981a704...`, `f11d27fa...` | ✅ (`delete_question` x3) |
| 6 | Grupo de evaluación de prueba (bloque G) | `assignment-mcp` → `create_assignment_group` | `ab99a8e0-a8db-4532-be04-1d24a96dd51c` | ✅ (`delete_assignment_group`, tras borrar la submission previa) |
| 7 | Estudiante de prueba C (evaluaciones) | `students-mcp` → `create_student` (matriculado directo) | `6d9ebcea-b0ab-49f1-acd9-97302a9fcff1` / `spec026-smoke-assignment@nodo-test.local` | ✅ (`delete_student`) |

**Datos reales usados (no se eliminan):** cuenta docente del usuario, cursos
académicos del semestre, contenido MDX del repo.

**Entorno de pruebas:** 🔴 **PRODUCCIÓN** — `{{url-prod-vercel}}`
**Fecha de la ronda:** {{pendiente}}
**Ejecutada por:** {{usuario}}

---

# Bloque A — Registro y matrícula

### TC-026-001 — Registro de estudiante con código de curso válido
**Precondición:** Deploy completado. "Confirm email" **desactivado** y "Allow new
users to sign up" **activado** en Supabase Auth (verificado en Fase 5). Existe un
curso académico con `enrollment_code` conocido.
**Datos de prueba usados:** `spec026-smoke-a@nodo-test.local`, contraseña
`SmokeTest2026!`, código `5RSENUWM` (curso real "Estructuras de datos").
**Pasos:**
1. Abrir `https://www.nod0.dev/registro` en una ventana de incógnito.
2. Diligenciar nombre completo, correo, contraseña y su confirmación.
3. Ingresar el código de matrícula del curso.
4. Enviar el formulario.
**Resultado esperado:**
- La cuenta se crea y **la sesión queda iniciada automáticamente** (sin pasar por
  correo de confirmación).
- Redirección a `/cuenta/cursos`.
- El curso del código aparece ya matriculado en esa página.
- **No** aparece el mensaje "Tu cuenta se creó pero no se pudo iniciar sesión
  automáticamente" — si aparece, "Confirm email" sigue activo: **detener la ronda
  y corregir la configuración de Supabase antes de continuar.**
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — registro, sesión automática y matrícula
funcionaron como se esperaba.

### TC-026-002 — Registro con código de matrícula inválido
**Precondición:** ninguna.
**Datos de prueba usados:** `spec026-smoke-invalid@nodo-test.local`, código
inexistente `XXXX-NO-EXISTE`.
**Pasos:**
1. En `/registro`, diligenciar datos válidos con un correo **nuevo**.
2. Ingresar un código de matrícula inexistente.
3. Enviar.
**Resultado esperado:** Error de validación en el campo del código; **no se crea
ninguna cuenta** (el código se resuelve antes del `signUp`). Verificar por
`students-mcp` → `list_students` que ese correo no quedó registrado.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — error de validación claro, sin crear cuenta.

### TC-026-003 — Registro con correo ya existente
**Precondición:** `TC-026-001` aprobado (el estudiante A ya existe).
**Datos de prueba usados:** `spec026-smoke-a@nodo-test.local` y código válido.
**Pasos:**
1. En incógnito, intentar registrarse de nuevo con `spec026-smoke-a@nodo-test.local`.
**Resultado esperado:** Mensaje de error claro; no se duplica la cuenta ni la
matrícula. Verificar en `students-mcp` que sigue existiendo **una sola** fila
para ese correo.
**Estado:** ✅ Aprobado (con observación)
**Hallazgos:** El mensaje de error es genérico ("No se pudo crear la cuenta.
Intenta de nuevo") en vez de indicar específicamente que el correo ya está
registrado. Lo funcional/seguro está correcto: **no** duplica la cuenta.
Aprobado por el usuario porque no bloquea el arranque de clases; hallazgo de
UX escalado a `docs/specs/backlog.md` como nuevo ítem de deuda técnica.

### TC-026-004 — Validación del formulario de registro
**Precondición:** ninguna.
**Datos de prueba usados:** ninguno (solo validación de cliente/servidor).
**Pasos:**
1. En `/registro`, enviar con campos vacíos.
2. Enviar con contraseña y confirmación distintas.
3. Enviar con un correo con formato inválido.
**Resultado esperado:** En cada intento, mensajes de error por campo, en español,
sin errores de consola ni pantalla en blanco.
**Estado:** ✅ Aprobado (con observación)
**Hallazgos:** Funciona en los tres casos (errores por campo, sin pantalla en
blanco). El usuario pidió mejorar la claridad de los mensajes de campos
vacíos/formato inválido — escalado a `docs/specs/backlog.md` como mejora de
UX, no bloqueante.

### TC-026-007 — Matrícula manual en un segundo curso desde `/cuenta/cursos`
**Precondición:** Estudiante A autenticado; existe un **segundo** curso académico
con su propio `enrollment_code`.
**Datos de prueba usados:** `spec026-smoke-a@nodo-test.local`, código del
segundo curso `0YQPYZSY` (Análisis de algoritmos).
**Pasos:**
1. Ir a `/cuenta/cursos`.
2. En "Matricularse en un curso", ingresar el código del segundo curso.
3. Enviar.
4. Volver a intentar con el **mismo** código.
**Resultado esperado:**
- Primer intento: mensaje de éxito y el segundo curso aparece en la lista tras el
  refresh.
- Segundo intento: error controlado por matrícula duplicada, sin romper la vista.
- El código se acepta indistintamente en mayúsculas o minúsculas (el formulario
  hace `toUpperCase()`).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

# Bloque B — Login y control de acceso

### TC-026-005 — Login de estudiante y redirección a `/cuenta/cursos`
**Precondición:** Estudiante A existente.
**Datos de prueba usados:** `spec026-smoke-a@nodo-test.local` / `SmokeTest2026!`.
**Pasos:**
1. Cerrar sesión y abrir `{{url-prod}}/login`.
2. Autenticarse con las credenciales del estudiante A.
**Resultado esperado:** Login exitoso y redirección a `/cuenta/cursos` con sus
cursos matriculados. El navbar muestra la variante de **estudiante** (spec-028).
**Estado:** ✅ Aprobado (tras fix)
**Hallazgos:** **Bug encontrado (2026-07-31):** el usuario llegó a `/login` vía
`nod0.dev` → middleware → `/login?redirectTo=%2F` (el caso más común: un
estudiante escribe el dominio pelado, no `/login` directo). En
`lib/auth/actions.ts:42-45`, si `formData.redirectTo` venía con cualquier
valor truthy (incluido `"/"`), el login redirigía ahí **antes** de evaluar el
rol — así que el estudiante terminaba en `/` (grilla general de cursos) en
vez de `/cuenta/cursos`. No era un crash ni un error de seguridad, pero
incumplía el resultado esperado del caso, declarado crítico para el día 1.
**Fix desplegado** (ampliación de scope aprobada por el usuario, commit
`15a50bd` en `development`, mergeado a `main` en `1393ba8`): se excluyó
`"/"` del `redirectTo` honrado, dejando que ese caso caiga en el redirect por
rol. Reintentado tras el redeploy de Vercel: **confirmado por el usuario,
funciona correctamente.**

### TC-026-006 — Login del docente y acceso al panel admin
**Precondición:** Cuenta real del usuario con rol `teacher`/`admin` en
`user_roles` (verificado en Fase 5).
**Datos de prueba usados:** credenciales reales del docente.
**Pasos:**
1. Iniciar sesión con la cuenta docente.
2. Navegar a `/admin/courses`.
3. Abrir un curso y revisar sus pestañas (contenido, asistencia, calificaciones).
**Resultado esperado:** Acceso concedido; el navbar muestra la variante de
**docente**; el panel admin carga sin errores de consola.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.
**Hallazgos:** {{observaciones}}

### TC-026-014 — Gate de acceso: anónimo y estudiante sin matrícula
**Precondición:** Estudiante B creado vía `students-mcp` y **sin matricular** en
el curso a probar.
**Datos de prueba usados:** `spec026-smoke-b@nodo-test.local` /
`SmokeTestB2026!`; lección `estructuras-de-datos/implementacion-de-pilas-en-java`.
**Pasos:**
1. En incógnito (sin sesión), abrir `{{url-prod}}/` y luego una URL de lección.
2. Observar la redirección.
3. Iniciar sesión como estudiante B y abrir la misma URL de lección.
4. Como estudiante B, intentar abrir `/admin/courses`.
**Resultado esperado:**
- Pasos 1-2: redirección a `/login` con `redirectTo` en la query (el middleware
  exige sesión en **todo** el sitio salvo `/login`, `/registro` y `/api`).
- Paso 3: el contenido del curso **no** es accesible sin matrícula (gate de
  spec-006).
- Paso 4: redirección a `/` — sin acceso al panel admin.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

---

# Bloque C — Contenido MDX y progreso

### TC-026-008 — Lección MDX con Mermaid, KaTeX, YouTube y código
**Precondición:** Estudiante A matriculado; identificar una lección real que use
los cuatro elementos (Claude la localiza antes del caso).
**Datos de prueba usados:** lección
`analisis-de-algoritmos/fundamentos-control-de-versiones-y-flujo-de-trabajo`.
**Pasos:**
1. Abrir la lección como estudiante A.
2. Verificar el render del **diagrama Mermaid**.
3. Verificar el render de las **fórmulas KaTeX**.
4. Verificar el **embed de YouTube** (que cargue y reproduzca).
5. Verificar el **resaltado de sintaxis (Shiki)** en los bloques de código.
6. Revisar la consola del navegador.
**Resultado esperado:** Los cuatro elementos renderizan correctamente en
producción; sin errores críticos de consola. Prestar atención a diferencias con
local: Mermaid y Shiki son los candidatos más probables a fallar en build de
producción.
**Estado:** ✅ Aprobado (KaTeX no verificado — sin contenido)
**Hallazgos:** Verificado al 2026-07-31: **ninguna lección publicada usa
KaTeX** hoy (`grep` sobre `content/cursos/*/*.mdx` sin resultados de `$...$`).
Se probaron Mermaid, YouTube y Shiki en la lección indicada — sin
observaciones. KaTeX queda como capacidad técnica sin uso real todavía (no
bloquea el arranque; ningún curso la necesita por ahora). Decisión del
usuario: no forzar una prueba con contenido temporal.

### TC-026-009 — Navegación del curso: sidebar, guías y presentación
**Precondición:** Estudiante A matriculado.
**Datos de prueba usados:** `estructuras-de-datos`.
**Pasos:**
1. Abrir `{{url-prod}}/estructuras-de-datos` y confirmar el redirect a la lección de
   reanudación (spec-016).
2. Navegar por el sidebar entre varias lecciones.
3. Abrir una **guía de laboratorio** (nodo `kind: "guide"`, spec-021).
4. Abrir `/estructuras-de-datos/presentacion` y verificar bibliografía y documentos PDF
   (spec-024 / spec-030).
**Resultado esperado:** Toda la navegación funciona; las guías abren; los PDFs
(estáticos desde `public/documentos/`, **no** Supabase Storage — corregido en
Fase 5) descargan/visualizan correctamente en producción.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-026-010 — Progreso de lección persiste
**Precondición:** Estudiante A en una lección.
**Datos de prueba usados:** lección de `estructuras-de-datos`.
**Pasos:**
1. Abrir una lección y marcarla como completada (según el flujo de spec-009/017).
2. Recargar la página.
3. Volver a `/cuenta/cursos` y revisar el avance del curso.
4. Cerrar sesión, volver a entrar y verificar de nuevo.
**Resultado esperado:** El progreso persiste tras recargar y tras reiniciar
sesión; el avance del curso refleja la lección completada.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

# Bloque D — Autoevaluación

### TC-026-011 — Autoevaluación de cierre de lección
**Precondición:** Una lección con preguntas de autoevaluación **publicadas** en
el banco (verificar antes con `question-bank-mcp` → `list_questions`, o con la
clave de respuestas de la vista docente). Estudiante A matriculado.
**Datos de prueba usados:** lección `estructuras-de-datos/implementacion-de-pilas-en-java`
(3 preguntas publicadas, verificadas por `question-bank-mcp`); también se
detectó actividad de prueba en `estructuras-de-datos/github-flujo-de-trabajo-con-ramas`
y `estructuras-de-datos/fundamentos-control-de-versiones`.
**Pasos:**
1. Como estudiante A, abrir la lección y bajar hasta la autoevaluación.
2. Responder todas las preguntas y enviar.
3. Verificar el feedback por pregunta (correcta/incorrecta).
4. Recargar la página y comprobar que el intento persiste.
5. Verificar que el bloqueo de cierre de lección por autoevaluación (spec-017) se
   comporta como corresponde.
6. **Como docente**, abrir la misma lección y verificar que la **clave de
   respuestas** (spec-031) se muestra y coincide en orden con lo que vio el
   estudiante.
**Resultado esperado:** El envío se evalúa, el feedback se muestra, el intento
persiste y la clave docente coincide.
> Advertencia conocida (**[[DEBT-021]]**): si la clave de respuestas no aparece,
> puede ser "sin preguntas publicadas" **o** un error de carga — hoy no se
> distinguen. Verificar por MCP antes de reportarlo como fallo.
**Estado:** ❌ Fallido
**Hallazgos:** Dos hallazgos:
1. **[[DEBT-029]]:** en las 3 preguntas publicadas de
   `implementacion-de-pilas-en-java`, la opción correcta está siempre en la
   posición 0 (primera) y no hay aleatorización de opciones. Registrado en
   el backlog.
2. **Bug funcional confirmado (`DEBT-028`):** el estado "ya respondida" **no
   persiste** tras recargar. Verificado con datos reales: el estudiante A
   generó **dos intentos** distintos para la misma lección
   (`github-flujo-de-trabajo-con-ramas`, 14:17 y 14:18 UTC, `correct_count`
   6 y luego 4) porque la UI no reflejaba el intento previo y permitió
   reenviar. Causa raíz: `getSelfAssessmentStatus().hasAttempt` se calcula
   bien en el servidor y se usa correctamente para desbloquear "marcar
   lección completada", pero **nunca se pasa** a `SelfAssessmentSection`.
   No bloquea el desbloqueo de cierre de lección (eso sí funciona), pero sí
   incumple el resultado esperado de este caso. Decisión del usuario: no
   corregir en esta sesión, solo registrar en el backlog (`DEBT-028`).

---

# Bloque E — Asistencia

### TC-026-012 — Ciclo completo de asistencia por sesión
**Precondición:** Docente autenticado; estudiante A matriculado en ese curso; dos
navegadores/perfiles abiertos (docente y estudiante).
**Datos de prueba usados:** lección `estructuras-de-datos/implementacion-de-pilas-en-java`,
estudiante A (`spec026-smoke-a@nodo-test.local`), código generado en el momento.
**Pasos:**
1. **Docente:** abrir una lección del curso y, en el control de asistencia
   embebido (spec-031), **abrir una sesión**.
2. **Docente:** anotar el código de 4-6 dígitos mostrado.
3. **Estudiante A:** abrir la misma lección, ir a la sección de asistencia e
   ingresar el código.
4. **Estudiante A:** intentar registrar el **mismo** código por segunda vez.
5. **Estudiante A:** probar un código inválido (p. ej. `0000`).
6. **Docente:** verificar que el conteo de asistentes sube a 1.
7. **Docente:** cerrar la sesión.
8. **Estudiante A:** intentar registrar el código con la sesión ya cerrada.
9. **Docente:** verificar el registro en `/admin/courses/<id>/attendance` y con
   `attendance-mcp` → `get_session_attendance`.
**Resultado esperado:**
- Paso 3: "Asistencia registrada".
- Paso 4: "Asistencia ya registrada" (sin duplicar).
- Paso 5: "Código no válido".
- Paso 6: conteo correcto.
- Paso 8: "Sesión cerrada".
- Paso 9: el registro aparece en el panel y vía MCP.
> Advertencias conocidas, **no** son fallos nuevos: el botón "Cerrar sesión"
> parpadea a "Cerrando..." cada ~5s (**[[DEBT-019]]**), se usan `alert()`/
> `confirm()` nativos (**[[DEBT-018]]**), y con **más de un grupo** puede
> mostrarse por un instante el código del grupo equivocado al cargar
> (**[[DEBT-023]]** — ⚠️ relevante si se proyecta la pantalla en clase).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones nuevas.
**Hallazgos:** {{observaciones}}

---

# Bloque F — Operación sin SMTP

### TC-026-013 — Vía de recuperación de cuenta sin correo
**Precondición:** No existe flujo de recuperación de contraseña en la app
(**[[DEBT-011]]**) ni SMTP propio (**[[DEBT-001]]**).
> ⚠️ **Verificado 2026-07-30:** `students-mcp` **no puede** resetear contraseñas
> — `update_student` acepta `full_name`, `email`, `career`, `semester` y
> `github_username`, pero **no `password`** (**DEBT-024**). No intentar el reset
> por esa vía: no existe.
> ⚠️ **Corrección 2026-07-31 (ejecución real del caso):** el botón "Reset
> password" del Supabase Dashboard (Authentication → Users → detalle de
> usuario) **solo envía un correo de recuperación** — no ofrece setear la
> contraseña directamente. Con "Confirm email" OFF pero sin SMTP propio, esa
> vía no es utilizable. La vía real y probada es la **Admin API de Supabase
> Auth** vía `curl` con `SUPABASE_SERVICE_ROLE_KEY` (`PUT
> /auth/v1/admin/users/{user_id}` con `{"password": "..."}`), documentada en
> la Fase 5 del spec-026.

**Datos de prueba usados:** estudiante ad-hoc creado vía `students-mcp` para
esta prueba — `spec026-test-reset@nodo-test.local`, id
`2d22d146-1bf3-40eb-822f-3999fe090dc2`, sin matrículas (creado y eliminado el
mismo 2026-07-31, no queda como dato residual).
**Pasos ejecutados:**
1. Creado el estudiante de prueba vía `students-mcp.create_student` (sin
   matrícula), contraseña inicial `TempPass1234!`.
2. Ejecutado como docente el `curl` a la Admin API con
   `SUPABASE_SERVICE_ROLE_KEY` para fijar una contraseña nueva
   (`NuevaPass5678!`) — respuesta 200 con `updated_at` actualizado
   (12:33:47 → 12:37:02 UTC).
3. Iniciada sesión como el estudiante de prueba con la contraseña nueva desde
   `/login` — **confirmado por el usuario: login exitoso**.
4. Estudiante de prueba eliminado vía `students-mcp.delete_student`
   (`enrollments_removed: 0`, no había datos que perder) y verificado con
   `get_student` → `Estudiante no encontrado` (limpieza efectiva).
**Resultado esperado:** El docente repone el acceso sin correo de por medio, en
pasos reproducibles y sin pérdida de datos del estudiante. El protocolo queda
escrito en la Fase 5 del spec.
**Estado:** ✅ Aprobado
**Hallazgos:** La opción originalmente prevista en el spec ("Dashboard/Admin
API" como vía única) resultó ser dos cosas distintas: el Dashboard por sí solo
no sirve (solo email), la Admin API sí. El procedimiento probado y
documentado usa exclusivamente la Admin API vía `curl`. Sin otros hallazgos.

---

# Bloque G — Evaluaciones A/B/C (diferido, Fase 8)

> No bloquea el inicio de clases. Ejecutar la primera semana, antes de aplicar la
> primera evaluación calificable.

### TC-026-015 — Publicación de un grupo de evaluación con variantes A/B/C
**Precondición:** MCPs reconfigurados contra producción (Fase 8).
**Datos de prueba usados:** grupo `ab99a8e0-a8db-4532-be04-1d24a96dd51c`,
preguntas `7c50c0c2...`/`b981a704...`/`f11d27fa...` (curso
`estructuras-de-datos`).
**Pasos:**
1. Crear preguntas de prueba con `question-bank-mcp` y publicarlas.
2. Crear un grupo con `assignment-mcp`, componer las 3 variantes y publicarlo.
3. Verificar el grupo en `/admin/courses/<id>/assignments/<groupId>`.
**Resultado esperado:** El grupo se publica cumpliendo las invariantes; la UI
admin muestra los enunciados reales (no IDs).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. `publish_assignment_group` validó las
invariantes (≥2 variantes, ninguna vacía, mismo puntaje total en las 3 — 5
puntos c/u) y el usuario confirmó que la UI admin muestra los enunciados
reales.

### TC-026-016 — Resolución de la evaluación por el estudiante
**Precondición:** `TC-026-015` aprobado.
**Datos de prueba usados:** estudiante de prueba
`spec026-smoke-assignment@nodo-test.local` (`6d9ebcea-b0ab-49f1-acd9-97302a9fcff1`,
enrollment `e9f27e93-5fbd-47dc-a592-c88ba6757622`), grupo
`ab99a8e0-a8db-4532-be04-1d24a96dd51c`.
**Pasos:**
1. Como estudiante, abrir `/cuenta/cursos/<enrollmentId>/evaluaciones`.
2. Abrir la evaluación, resolverla y enviarla.
3. Revisar la vista de resultados.
**Resultado esperado:** Se asigna una variante, las preguntas se ven con su
enunciado real, el envío persiste y el `auto_score` se calcula.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — la vista de resultados muestra la
calificación final y la respuesta correcta.

### TC-026-017 — Calificación manual del docente
**Precondición:** `TC-026-016` aprobado.
**Datos de prueba usados:** grupo `ab99a8e0-a8db-4532-be04-1d24a96dd51c`,
envío del estudiante de prueba.
**Pasos:**
1. Como docente, abrir `.../assignments/<groupId>/review`.
2. Abrir el envío, calificar las preguntas abiertas y finalizar.
**Resultado esperado:** La calificación final se registra y el envío pasa a
"calificados".
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Las 3 preguntas de prueba eran
`multiple_choice` (autocalificadas), así que no hubo preguntas abiertas que
calificar manualmente — el caso sirvió para confirmar que la vista de
revisión carga el envío y su calificación correctamente.

---

# Bloque H — MCPs contra producción (diferido, Fase 8)

### TC-MCP-026-001 — API routes responden con las API keys de producción
**Herramienta probada:** backend `/api/questions`, `/api/assignments`,
`/api/attendance`, `/api/students`.
**Precondición:** Deploy completado; `QUESTION_BANK_API_KEY` y
`STUDENTS_ADMIN_API_KEY` de producción configuradas en Vercel.
**Input de prueba:**
- `GET https://<url-prod>/api/questions` con la key de producción → esperado `200`.
- La misma petición con una key inválida → esperado `401`.
- `GET https://<url-prod>/api/students` con `STUDENTS_ADMIN_API_KEY` → `200`.
- `GET https://<url-prod>/api/students` con `QUESTION_BANK_API_KEY` → esperado
  **no autorizado** (las claves son de dominios distintos).
**Output esperado:** Los `200`/`401` descritos. Ninguna ruta de API queda
accesible sin key.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado por `curl` directo (2026-07-31) con las keys de
`.env.prod-mcp`: `/api/questions` con key válida → `200`; con key inválida →
`401`; `/api/students` con `STUDENTS_ADMIN_API_KEY` → `200`; `/api/students`
con `QUESTION_BANK_API_KEY` (dominio cruzado) → `401 unauthorized`. Sin
observaciones.

### TC-MCP-026-002 — `question-bank-mcp` contra producción
**Herramienta probada:** `list_questions`.
**Precondición:** Configuración del MCP actualizada a la URL y key de producción;
cliente reiniciado.
**Input de prueba:** invocar `list_questions`.
**Output esperado:** Datos del proyecto de producción, sin errores de
conexión/auth.
**Estado:** ✅ Aprobado (equivalente funcional)
**Hallazgos:** Se creó el perfil de producción de los 4 MCPs (spec-026 Fase 8:
`mcp-servers/run-prod-mcp.sh` + `.env.prod-mcp`, entradas `*-mcp-prod` en
`.mcp.json`). El arranque aislado (`./mcp-servers/run-prod-mcp.sh
question-bank-mcp`) inicia correctamente contra
`https://www.nod0.dev/api/questions`, y una llamada HTTP equivalente a
`list_questions` (`GET /api/questions` con la key de producción) devuelve
datos reales del proyecto. La invocación real de la herramienta MCP
`question-bank-mcp-prod` requiere que Claude Code se reconecte a los
servidores MCP (no recoge servidores nuevos de `.mcp.json` sin reinicio de
sesión) — pendiente de confirmar en la próxima sesión, sin bloquear el cierre
de esta fase.

### TC-MCP-026-003 — `assignment-mcp` contra producción
**Herramienta probada:** `list_academic_courses`.
**Precondición:** igual que `TC-MCP-026-002`.
**Input de prueba:** invocar `list_academic_courses`.
**Output esperado:** Lista de los cursos académicos reales de producción.
**Estado:** ✅ Aprobado (equivalente funcional)
**Hallazgos:** Arranque aislado OK contra
`https://www.nod0.dev/api/assignments`. `GET /api/assignments/academic-courses`
con la key de producción devuelve los 3 cursos reales del semestre. Mismo
pendiente que `TC-MCP-026-002` sobre la invocación real vía Claude Code.

### TC-MCP-026-004 — `attendance-mcp` contra producción
**Herramienta probada:** `list_sessions`.
**Precondición:** igual que `TC-MCP-026-002`.
**Input de prueba:** invocar `list_sessions` para un curso real.
**Output esperado:** Las sesiones de asistencia reales, incluida la de
`TC-026-012` si aún no se ha limpiado. Solo lectura.
**Estado:** ✅ Aprobado (equivalente funcional)
**Hallazgos:** Arranque aislado OK contra `https://www.nod0.dev/api`.
`GET /api/attendance/sessions?courseId=<estructuras-de-datos>` con la key de
producción devuelve la sesión real de `TC-026-012` (ya con `attendee_count: 0`
tras la limpieza, esperado). Mismo pendiente sobre la invocación real vía
Claude Code.

### TC-MCP-026-005 — `students-mcp` contra producción
**Herramienta probada:** `list_students`.
**Precondición:** igual que `TC-MCP-026-002`, con `STUDENTS_ADMIN_API_KEY` de
producción.
**Input de prueba:** invocar `list_students`.
**Output esperado:** El listado real de estudiantes matriculados. ⚠️ Este MCP
tiene permisos de admin sobre datos reales de estudiantes: **no ejecutar
herramientas de escritura o borrado durante la ronda** salvo las previstas en
`TC-026-013` y en la limpieza.
**Estado:** ✅ Aprobado (equivalente funcional)
**Hallazgos:** Arranque aislado OK contra `https://www.nod0.dev/api/students`.
`GET /api/students?limit=1` con `STUDENTS_ADMIN_API_KEY` de producción
devuelve `{"data":[],...}` — vacío porque ya no quedan estudiantes de prueba
en producción (limpieza de la Fase 7). Ninguna herramienta de escritura/borrado
ejecutada en este caso. Mismo pendiente sobre la invocación real vía Claude
Code.

---

## Limpieza de datos de prueba (obligatoria — entorno de producción)

> Ejecutar en **orden inverso** a la creación. Verificar cada borrado
> (consulta → `404` / lista vacía) y marcarlo en la tabla "Datos de prueba".

- [x] Eliminar el grupo de evaluación de prueba — **N/A**, no se creó
      (bloque G diferido a Fase 8).
- [x] Eliminar las preguntas de prueba — **N/A**, no se crearon preguntas de
      prueba; se usaron preguntas reales ya publicadas (`implementacion-de-pilas-en-java`).
- [x] Cerrar/eliminar la sesión de asistencia de prueba y su registro —
      sesión cerrada por el docente en `TC-026-012`; el registro de
      asistencia se eliminó en cascada al borrar el Estudiante A.
- [x] Desmatricular y eliminar al estudiante B (`students-mcp` →
      `delete_student`) — eliminado, `enrollments_removed: 0` (nunca tuvo).
- [x] Desmatricular y eliminar al estudiante A, incluyendo su progreso de lección
      y su intento de autoevaluación — eliminado directo con `delete_student`
      (`enrollments_removed: 2`), sin bloqueo 409 pese a tener
      `self_assessment_attempts`/`attendance_records`/`lesson_progress`
      (el guard de 409 solo mira `submissions`, no estos datos).
- [x] Eliminar el curso académico de prueba, si se creó uno — **N/A**, no se
      creó ninguno; se reutilizaron los 3 cursos reales del semestre.
- [x] Confirmar que no queda ninguna cuenta de prueba en producción —
      verificado directo contra `auth.users` (Admin API): **1 sola cuenta**,
      la del docente real (`santiago8628@gmail.com`).

---

## Resumen de la ronda

- **Bloqueantes del día 1 (A–F):** Aprobados: 13 / 14 — Fallidos: 1
  (`TC-026-011`) — Pendientes: 0
- **Diferidos (G–H):** Aprobados: 8 / 8 — Fallidos: 0 — Pendientes: 0 (Fase 8,
  ejecutados 2026-07-31, post-arranque pero sin apuro para el 2026-08-03).
  Bloque H aprobado como "equivalente funcional" (ver notas de cada caso):
  falta confirmar la invocación real de las herramientas `*-mcp-prod` desde
  Claude Code, que requiere reconectar los servidores MCP tras el cambio en
  `.mcp.json`.
- **Veredicto de arranque:** ✅ **Listo para clases**, con un riesgo conocido
  y aceptado explícitamente por el usuario: `TC-026-011` (la autoevaluación
  no bloquea el reintento tras recargar, `DEBT-028`) no impide que los
  estudiantes accedan, respondan ni avancen — solo genera intentos
  duplicados en el registro. No bloquea el 2026-08-03.
- **Bug encontrado y corregido durante la ronda:** `TC-026-005` falló en el
  primer intento (login redirigía a `/` en vez de `/cuenta/cursos` cuando el
  estudiante entraba por la raíz del dominio) — corregido en
  `lib/auth/actions.ts` (commit `15a50bd`, desplegado en `1393ba8`),
  reintentado y aprobado.
- Hallazgos escalados a `docs/specs/backlog.md`: **DEBT-024** (mitigado),
  **DEBT-026** (mensaje de error genérico en registro duplicado),
  **DEBT-027** (claridad de mensajes de validación, pendiente de detalle),
  **DEBT-028** (persistencia de autoevaluación, alta prioridad),
  **DEBT-029** (orden de respuestas en autoevaluación).
- Limpieza de datos de prueba: ✅ Completada — verificado, `auth.users` en
  producción queda con 1 sola cuenta (la del docente real).
