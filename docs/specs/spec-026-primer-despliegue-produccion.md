# spec-026 — `[IN PROGRESS]` Primer despliegue a producción (Vercel + Supabase) para el inicio de clases

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.
> Este spec **prepara y verifica** el primer despliegue; el acto de desplegar
> (merge a `main`, push, migraciones prod) queda como fase **gated** 🔒 que
> ejecuta el usuario con confirmación explícita en la misma sesión.
>
> **Revisión 2026-07-30:** el spec se reescribió para (a) corregir hechos que
> quedaron obsoletos tras spec-027/028/029/030/031, (b) reordenar las fases
> alrededor de los flujos que el usuario declaró críticos para el arranque de
> clases, y (c) mover la reconfiguración de MCPs después de los smoke tests
> críticos. Ver "Cambios respecto a la versión anterior del spec".

---

## Contexto

`main` nunca ha recibido un despliegue real: este es el **primer despliegue a
producción** de Nodo. La rama `development` va **207 commits adelante de `main`**
(verificado 2026-07-30).

**Restricción temporal:** las clases comienzan la semana del **2026-08-03**. La
plataforma entra en producción con **un solo docente (el usuario) y sus
estudiantes**; no habrá docentes colaboradores en este release. Eso reduce el
alcance real de la puesta en producción: no hay que resolver gestión de
permisos entre docentes, ni branding multi-docente, ni administración avanzada
de cursos.

**Flujos críticos declarados por el usuario** (deben funcionar el día 1):

1. **Registro** de estudiante con código de curso.
2. **Matrícula** (automática en el registro, y manual desde `/cuenta/cursos`).
3. **Login** y redirección por rol.
4. **Contenido MDX** (lecciones, Mermaid, KaTeX, YouTube, guías).
5. **Asistencia** por sesión con código.
6. **Autoevaluación** de cierre de lección.

Todo lo demás (evaluaciones A/B/C de spec-018/019/020, los 4 MCPs, panel de
calificaciones) es **importante pero no bloqueante para el día 1**: se verifica
después del arranque, en fases diferidas de este mismo spec.

## Alcance

### Incluye
- Corrección del **único error de lint** que hoy rompe el checklist
  pre-despliegue (**[[DEBT-013]]**).
- Verificación de precondiciones: specs en `[DONE]`, build y lint verdes,
  migraciones sincronizadas (Local == Remote).
- Revisión y ajuste (solo si aplica) de `next.config.ts`, `package.json`
  (`engines.node`), evaluación de `vercel.json`.
- Actualización de `.env.example` para reflejar las variables **reales** del
  runtime y separar las que consume la app de las que consumen los MCPs.
- Definición exacta de las variables de entorno de Production en Vercel.
- Verificación de Supabase producción: migraciones, RLS por tabla, **y la
  configuración de Auth de la que depende el registro** (ver Fase 5 — es el
  riesgo crítico real de este release).
- Creación de la rama `deploy/v1.0.0` y ejecución del despliegue **gated**.
- **Smoke tests de los 6 flujos críticos** sobre la URL de producción (Fase 7),
  antes de tocar nada más.
- Reconfiguración de los **4** MCPs (`question-bank-mcp`, `assignment-mcp`,
  `attendance-mcp`, `students-mcp`) para consumir la API de producción, y
  smoke tests diferidos de evaluaciones (Fase 8, post-arranque).
- Protocolo operativo de recuperación de cuentas mientras no exista SMTP
  propio (**[[DEBT-001]]** / **[[DEBT-011]]**).

### No incluye
- Automatizar el deploy (CI/CD custom): Vercel despliega por push a `main`.
- Cambios funcionales de la aplicación. **Única excepción**: la corrección de
  `<a>` → `<Link>` de **[[DEBT-013]]**, incluida porque bloquea el checklist
  pre-despliegue de `CLAUDE.md` y es un cambio de una línea.
- Resolver el resto del backlog. Los ítems relevantes para este release se
  listan en "Deuda técnica evaluada" con su decisión (abordar / diferir).
- Crear o modificar herramientas de los MCPs: solo se reconfigura el
  endpoint/credencial.
- Configurar dominio custom más allá de la URL asignada por Vercel.
- Commitear valores reales de variables de entorno o API keys.

## Impacto en el sistema

- **Configuración de proyecto:** `next.config.ts`, `package.json`, posible
  `vercel.json` (a evaluar), `.env.example`.
- **Código:** `components/admin/AcademicCourseList.tsx` (fix de lint, Fase 0).
- **Rutas y auth:** ninguna ruta nueva. Se valida el comportamiento de
  `middleware.ts` bajo el dominio de producción: hoy **todo el sitio requiere
  sesión** salvo `/login`, `/registro` y `/api` — no hay home pública.
- **Base de datos (Supabase remoto, ref `bgiimadnmqnoqmdbudpo`):** sin cambios
  de esquema propios del spec; se **verifica** que las **34** migraciones estén
  aplicadas y que las políticas RLS de todas las tablas sean correctas.
- **Auth (Supabase):** configuración de "Confirm email", Site URL y Redirect
  URLs. Ver Fase 5.
- **Infra (Vercel):** primer proyecto conectado a `main`; variables de
  Production.
- **MCPs:** `.mcp.json` / `claude_desktop_config.json`, `docs/mcps/README.md`,
  y los 4 system prompts si procede.
- **Git:** rama `deploy/v1.0.0`; merge a `main` (primer merge real).

## Riesgo crítico (corregido respecto a la versión anterior del spec)

> La versión anterior de este spec señalaba como riesgo crítico que
> `lib/auth/actions.ts` construyera redirects con
> `NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`. **Eso ya no es cierto.**
> spec-027 eliminó por completo el flujo de recuperación de contraseña y el
> `emailRedirectTo` de `signUp`; hoy `NEXT_PUBLIC_SITE_URL` **no tiene ninguna
> referencia** en `app/`, `lib/` ni `components/` (verificado por grep,
> 2026-07-30 — es **[[DEBT-014]]**). No hay OAuth implementado.

El riesgo crítico real de este release es otro:

**El registro de estudiantes depende de que "Confirm email" esté DESACTIVADO en
el dashboard de Supabase Auth.** `signUp` (`lib/auth/actions.ts`) crea la
cuenta, exige que `signUpData.session` exista, hace el bootstrap de
perfil/rol y matricula al estudiante en el curso del código. El propio código
lo documenta:

```ts
// Si "Confirm email" llegara a reactivarse en el dashboard de Supabase
// (fuera del control de este código), signUp no devuelve sesión: el
// insert de matrícula correría como anónimo y RLS lo rechazaría en silencio.
if (!signUpData.session) { return { ok: false, error: "Tu cuenta se creó pero no se pudo iniciar sesión automáticamente..." } }
```

Si esa opción está activa en producción, **ningún estudiante puede
registrarse**: todos reciben el error, y el límite de 3 correos/hora del plan
gratuito (**[[DEBT-001]]**) hace que ni siquiera puedan confirmar por correo.
Es un fallo total del día 1 en un salón de ~30 personas registrándose a la vez.
Por eso la verificación de Auth pasa a ser un **gate explícito** (Fase 5).

**Riesgo secundario — no hay NINGUNA vía soportada para reponer una contraseña.**
spec-027 eliminó el flujo de recuperación por correo (**[[DEBT-011]]**), y la
suposición de que el docente podía resolverlo con `students-mcp` **es falsa**:
verificado a 2026-07-30, `update_student` acepta `full_name`, `email`, `career`,
`semester` y `github_username` — **no acepta `password`**. Solo `create_student`
recibe contraseña. Las únicas salidas hoy son:

1. **Supabase Dashboard / Admin API** (`auth.admin.updateUserById({ password })`
   con `service_role`) — fuera de la app, manual.
2. **`delete_student` + `create_student`** — destructivo: borra matrículas,
   asistencia y calificaciones, y devuelve `409` si el estudiante tiene entregas.

Con ~30 estudiantes, esto **ocurrirá en las primeras semanas**. Fase 5 exige
elegir y probar una vía antes del arranque; se registra además como ítem nuevo
de backlog (**DEBT-024**) por si se decide exponer un `reset_student_password`
en `students-mcp` en un spec propio.

## Evaluación MCP

**¿Aplica MCP?** Sí — pero **solo reconfiguración**, sin nuevas herramientas ni
cambios de capacidad.

- **MCPs existentes a modificar:** los **cuatro** (`question-bank-mcp`,
  `assignment-mcp`, `attendance-mcp`, `students-mcp`). Cambian su base URL de
  `http://localhost:3000/api/*` a la URL pública de Vercel, y su API key de
  local a la de producción. **No se agregan ni modifican herramientas.**
  > Corrección: la versión anterior del spec hablaba de 3 MCPs. `students-mcp`
  > se añadió en spec-027 y usa una clave distinta (`STUDENTS_ADMIN_API_KEY`).
- **MCP nuevo a crear:** ninguno.
- **System prompts afectados:** los 4 en `docs/mcps/` — revisar y actualizar
  **solo** si describen endpoint/entorno. Las capacidades no cambian.
- **Fase de MCP en este spec:** Fase 8 (después del arranque de clases y de los
  smoke tests críticos).

> Justificación: el spec no expone datos ni acciones nuevas a los agentes;
> reapunta clientes existentes a producción.

## Deuda técnica evaluada para este release

> Revisión de `docs/specs/backlog.md` a 2026-07-30 con el criterio "¿bloquea el
> arranque de clases de la semana del 2026-08-03?".

| Ítem | Decisión | Motivo |
|------|----------|--------|
| **DEBT-013** — lint falla por `<a>` en `AcademicCourseList` | **Abordar (Fase 0)** | Hoy `npm run lint` termina con **5 errores**; el checklist pre-despliegue de `CLAUDE.md` exige lint en verde. Cambio de una línea. |
| **DEBT-001** — SMTP propio | **Mitigar, no resolver (Fase 5)** | No hay tiempo para SMTP antes del 2026-08-03. Se mitiga garantizando que el registro **no envíe correos** (Confirm email OFF) y documentando el protocolo de recuperación vía docente. |
| **DEBT-011** — recuperación de contraseña inexistente | **Mitigar (Fase 5)** | Sin SMTP no se puede reconstruir el flujo. Se elige, documenta y prueba una vía manual del docente. |
| **DEBT-024** (nuevo) — `students-mcp` no puede resetear contraseñas | **Decidir en Fase 5** | `update_student` no acepta `password`. Sin esto, el docente no tiene forma no destructiva de reponer el acceso de un estudiante. Ver "Riesgo secundario". |
| **DEBT-012** — rotación/expiración de `enrollment_code` | **Diferir** | El código es el gate de registro, pero durante el semestre en curso no se rota. Riesgo aceptado; revisar tras el arranque. |
| **DEBT-014** — `NEXT_PUBLIC_SITE_URL` sin uso | **Resolver documentalmente (Fase 3)** | Se decide en Fase 3 si se retira o se deja reservada; en cualquier caso se corrige la descripción errónea en `.env.example`/`CLAUDE.md`. |
| **DEBT-023** — parpadeo de grupo/código equivocado en `TeacherAttendanceControl` | **Diferir, con advertencia** | Afecta al docente proyectando en clase. No bloquea el deploy, pero conviene que el usuario lo sepa antes de dictar. Solo aplica con **más de un grupo**. |
| **DEBT-019** — botón "Cerrar sesión" parpadea cada ~5s | **Diferir** | Cosmético, uso docente. |
| **DEBT-018** — `alert()`/`confirm()` nativos en asistencia | **Diferir** | Cosmético. |
| **DEBT-002** — marca canónica SITAIM vs nodo | **Diferir** | Con un solo docente no bloquea; sí es visible para estudiantes. Decisión de producto del usuario. |
| **DEBT-003 / DEBT-004** — `course_slug` sin validación, sin borrar curso | **Diferir** | Operaciones de admin que solo ejecuta el usuario, con cuidado manual. |
| **DEBT-017** — sin enlace visible a `/login` | **Diferir** | Los estudiantes reciben la URL de registro directamente del docente. |
| **DEBT-008 / DEBT-010 / DEBT-015 / DEBT-016 / DEBT-020 / DEBT-021 / DEBT-022 / DEBT-006 / DEBT-025** | **Diferir** | Cosméticos, accesibilidad o limpieza estructural. |

## Fases de implementación

### Fase 0 — Corrección bloqueante de lint (**[[DEBT-013]]**)
> Único cambio de código del spec. Requiere la aprobación general del spec.

- [x] Reemplazar el `<a href="/admin/courses/new/">` de
      `components/admin/AcademicCourseList.tsx:31` por
      `<Link href="/admin/courses/new">` de `next/link`.
- [x] Verificar que `npm run lint` termina **sin errores** (0 errores,
      10 warnings aceptados y registrados).
- [x] Marcar **[[DEBT-013]]** como resuelto en `docs/specs/backlog.md`.
- **Archivos impactados:** `components/admin/AcademicCourseList.tsx`,
  `docs/specs/backlog.md`.

### Fase 1 — Precondiciones y bloqueadores (gate de entrada)
> No produce cambios; **verifica** que se puede proceder.

- [x] Todos los specs anteriores en `[DONE]` — reverificado 2026-07-30 tras
      Fase 0: spec-026 (ahora `[IN PROGRESS]`) es el **único** spec fuera de
      `[DONE]`.
- [x] `docs/specs/00_course_home_page.md` es un documento de análisis técnico
      previo a la numeración de specs, **no un spec**. Confirmado con el
      usuario 2026-07-30: se deja como está; no bloquea el despliegue.
- [x] Confirmar rama activa `development` sincronizada con `origin/development`
      — **hallazgo (2026-07-30):** `development` local estaba 4 commits
      adelante de `origin/development` sin pushear. **Resuelto en Fase 6
      (2026-07-31):** commiteados los cambios de las Fases 0-5
      (`c8b8ad1`) y pusheado — `development` ahora sincronizada con
      `origin/development`.
- **Archivos impactados:** lectura de `docs/specs/` (sin edición).

### Fase 2 — Verificación local de build, lint y migraciones
- [x] `npm run build` pasa sin errores. Sin warnings relevantes en el output
      (compilación y generación de páginas estáticas OK, 40 rutas dinámicas).
- [x] `npm run lint` pasa sin errores (tras Fase 0) — 0 errores, 10 warnings.
- [x] `supabase migration list` muestra Local y Remote **coincidentes**:
      **34** migraciones, todas emparejadas (última: `20260730000000`).
- **Archivos impactados:** ninguno (solo verificación).

### Fase 3 — Configuración de proyecto para producción
> **Estado verificado a 2026-07-30:** `next.config.ts` es un stub vacío;
> `vercel.json` **no existe**; `package.json` **no** declara `engines`
> (Next `16.2.4`, React `19.2.4`); `.env.example` documenta 8 variables.
> **Corrección respecto a la versión anterior:** `TEACHER_EMAIL` y
> `TEACHER_PASSWORD` **no existen en el código** (grep global sin resultados),
> así que no hay nada que documentar sobre ellas.

- [x] Revisar `next.config.ts` y **evaluar** si producción requiere
      `images.remotePatterns` o headers de seguridad.
      **Corrección sobre la premisa del spec:** los PDFs (spec-030) se sirven
      desde `public/documentos/`, **no** desde Supabase Storage (verificado
      por grep — no hay uso de Storage en el código). El único uso de
      `next/image` con `src` dinámico es `img` de MDX
      (`lib/mdx/components.tsx`), y hoy ningún contenido usa URLs de imagen
      externas (grep sobre `content/` sin resultados). **Decisión:** no se
      agrega `images.remotePatterns` ni headers de seguridad — no hay
      necesidad real hoy. Si un docente embebe una imagen externa en MDX,
      fallará en runtime; queda anotado como riesgo latente, no bloqueante
      (revisar si aparece contenido con imágenes externas).
- [x] **Evaluar y decidir** si se añade `engines.node` a `package.json`.
      **Decisión:** sí — se agregó `"engines": { "node": ">=20.9.0" }`,
      igual al mínimo que exige `next@16.2.4` (`node_modules/next/package.json`),
      para que Vercel seleccione un runtime compatible.
- [x] **Evaluar necesidad de `vercel.json`**: con el preset de Next.js
      **no es necesaria** — no hay rewrites, redirects, headers ni
      configuración de funciones fuera de lo que Vercel detecta
      automáticamente del framework. Se decide no crearla.
- [x] Reestructurar `.env.example` separando explícitamente:
      (a) variables que consume **la app en Vercel**, y (b) variables que solo
      consumen **los clientes MCP locales** (`QUESTION_BANK_API_BASE_URL`,
      `STUDENTS_ADMIN_API_BASE_URL`) y que **no** deben cargarse en Vercel.
- [x] Resolver **[[DEBT-014]]**: decisión del usuario — se deja
      **reservada** (se carga en Vercel con la URL de producción por si un
      flujo futuro la requiere: OAuth, `metadataBase`). Se corrigió su
      descripción en `.env.example` y `CLAUDE.md`.
- **Archivos impactados:** `package.json` (`engines.node`), `.env.example`
  (reestructurado), `CLAUDE.md` (descripción de `NEXT_PUBLIC_SITE_URL`),
  `docs/specs/backlog.md` (DEBT-014 resuelto). `next.config.ts` y
  `vercel.json` sin cambios (decisión documentada, no había necesidad real).

### Fase 4 — Variables de entorno en Vercel (Production)
> El usuario configura las variables en el panel de Vercel; el spec entrega la
> lista exacta y su origen. Claude **no** modifica variables directamente.

- [x] Cargar en Vercel (entorno `Production`) exactamente estas variables —
      confirmado por el usuario 2026-07-30. **Pendiente:** `NEXT_PUBLIC_SITE_URL`
      se cargó con un placeholder; falta reemplazarla por la URL real tras el
      primer deploy (Fase 6).

  | Variable | Origen / valor de producción | Requerida |
  |----------|------------------------------|-----------|
  | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase remoto | Sí |
  | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública Supabase | Sí |
  | `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (server-only) | Sí |
  | `QUESTION_BANK_API_KEY` | **API key de producción** (distinta de la local); protege `/api/questions`, `/api/assignments`, `/api/attendance` | Sí |
  | `QUESTION_BANK_AGENT_TEACHER_ID` | Id del docente para las API routes de agente | Sí |
  | `STUDENTS_ADMIN_API_KEY` | **Clave propia de producción** del dominio de estudiantes (`/api/students/*`); permisos de admin, distinta de la anterior | Sí |
  | `NEXT_PUBLIC_SITE_URL` | URL final de producción de Vercel | Según decisión de Fase 3 (hoy sin uso en código) |

- [x] **No** cargar en Vercel: `QUESTION_BANK_API_BASE_URL` ni
      `STUDENTS_ADMIN_API_BASE_URL` (son de los clientes MCP locales) —
      excluidas del bloque preparado para importar.
- [x] Generar los valores de producción de `QUESTION_BANK_API_KEY` y
      `STUDENTS_ADMIN_API_KEY`, distintos entre sí y distintos de los locales
      — generadas con `openssl rand -hex 32` y cargadas en `.env.prod`
      (gitignorado, nunca commiteado).
- **Archivos impactados:** ninguno en repo (configuración en Vercel);
  `.env.prod` local creado como referencia (cubierto por `.env*` en
  `.gitignore`, nunca commiteado).

### Fase 5 — Supabase producción: Auth del día 1, migraciones, RLS y Storage 🔒
> **Esta es la fase de mayor riesgo del release** (ver "Riesgo crítico").

- [x] **[GATE 🔒] Confirmar en Supabase Dashboard → Authentication → Providers →
      Email que "Confirm email" está DESACTIVADO.** Sin esto, ningún estudiante
      puede registrarse (ver "Riesgo crítico"). **Confirmado por el usuario
      2026-07-31: DESACTIVADO.**
- [x] Confirmar que **"Allow new users to sign up" está ACTIVADO**. **Confirmado
      por el usuario 2026-07-31: ACTIVADO.**
- [x] Revisar los límites de rate limiting de Auth en el proyecto Supabase para
      un pico de ~30 registros simultáneos en la primera clase, y ~120
      estudiantes en total durante el semestre. **Hallazgo (2026-07-31):**
      "Rate limit for sign-ups and sign-ins" estaba en 30 requests/5 min
      **por IP** — riesgo real si el salón comparte una sola IP pública (NAT
      de la red de la universidad) y ~30 estudiantes se registran en la misma
      ventana. Emails de confirmación (2/h) no aplican: "Confirm email" está
      OFF. **Acción:** subido a **100 requests/5 min** por el usuario en
      Dashboard → Authentication → Rate Limits → Save changes.
- [ ] Configurar el **Site URL** de Supabase Auth con el dominio de Vercel y
      añadir las **Redirect URLs** correspondientes (aunque hoy ningún flujo las
      use, evita romper OAuth/recuperación si se añaden después).
- [x] Confirmar que las **34** migraciones están aplicadas al proyecto remoto —
      ya verificado en Fase 2 (`supabase migration list`, Local == Remote,
      última `20260730000000`).
- [x] Revisar que **todas las tablas** tienen RLS habilitado y políticas
      correctas por rol (admin/docente/estudiante). **Verificado 2026-07-31**
      vía `pg_tables`/`pg_policies` contra producción:
      - **RLS habilitado en las 21 tablas de `public`**, sin excepción.
      - **Corrección de nomenclatura:** la tabla de sesiones se llama
        `class_sessions`, no `attendance_sessions` como decía este ítem
        originalmente.
      - Políticas revisadas por rol en las tablas críticas: `academic_courses`,
        `enrollments`, `class_sessions`, `attendance_records`,
        `lesson_progress`, `profiles`, `students`, `user_roles`, `questions`,
        `question_choices`, `question_rubrics`, `assignments` y relacionadas,
        `student_grades`, `grade_items`, `submissions`, `answers`,
        `self_assessment_attempts` — todas con `SELECT`/`INSERT`/`UPDATE`
        acotados a `auth.uid()` (dueño) o `has_role(..., 'admin')`, más el
        caso docente vía `academic_courses.teacher_id`.
      - **Hallazgos que parecían huecos y resultaron diseño intencional:**
        `attendance_records`, `profiles`, `user_roles` y `students` **no**
        tienen policy de `INSERT` para el cliente autenticado. Verificado en
        código: el alta ocurre por el trigger `on_auth_user_created` (ver
        `supabase/migrations/20260729000003_fix_handle_new_user_conflict_handling.sql`)
        y, como fallback idempotente, `ensureStudentAccountBootstrap()` en
        `lib/students/service.ts` vía `createServiceSupabaseClient()` — nunca
        desde `app/`/`components/`. El check-in de asistencia usa la RPC
        `security definer` `mark_attendance_by_code()`
        (`supabase/migrations/20260716000002_attendance_rpcs.sql`), que valida
        sesión abierta, expiración y matrícula activa antes de insertar. Sin
        huecos reales encontrados.
- [x] Revisar buckets de Storage y sus políticas (PDFs de spec-030).
      **Corrección sobre la premisa del spec (igual que en Fase 3):** los
      PDFs se sirven desde `public/documentos/`, no desde Supabase Storage.
      Verificado por SQL contra producción (`select * from storage.buckets`):
      **0 buckets creados.** No aplica revisión de políticas — no hay Storage
      en uso hoy.
- [x] **[GATE 🔒] Elegir y documentar la vía de recuperación de cuenta sin SMTP**
      (**[[DEBT-011]]** / **DEBT-024**). `students-mcp` **no** puede resetear
      contraseñas (`update_student` no acepta `password`).
      **Decisión confirmada por el usuario 2026-07-31: opción (a), pero
      corregida tras probarla.** El botón "Reset password" del Dashboard
      (Authentication → Users → detalle) **solo envía un correo de
      recuperación** — no viable sin SMTP. La vía real es la **Admin API de
      Supabase Auth vía `curl`**, usando `SUPABASE_SERVICE_ROLE_KEY`:

      ```bash
      curl -X PUT "https://bgiimadnmqnoqmdbudpo.supabase.co/auth/v1/admin/users/<USER_ID>" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d '{"password": "<nueva-contraseña>"}'
      ```

      `USER_ID` es el UUID visible en Dashboard → Authentication → Users (o
      vía `students-mcp.get_student`, campo `id`). El docente ejecuta este
      comando desde su máquina, cargando `SUPABASE_SERVICE_ROLE_KEY` desde
      `.env.prod` (nunca commiteado). **Probada exitosamente** con un
      estudiante de prueba creado y eliminado ad-hoc (`TC-026-013` ✅
      Aprobado, ver `docs/testing/test-026-primer-despliegue-produccion.md`):
      reset aplicado, login confirmado por el usuario, dato de prueba limpiado
      y verificado (`get_student` → no encontrado tras el `delete_student`).
      Opciones (b) y (c) quedan descartadas para este release.
- [x] Verificar que existe la cuenta del docente con rol `teacher`/`admin` en
      `user_roles` y que los `academic_courses` del semestre están creados con
      su `enrollment_code` y su `course_slug` correcto (**[[DEBT-003]]**: el
      slug no se valida; un typo deja el curso sin contenido).
      **Verificado 2026-07-31:** la cuenta docente (`587ceede-...`,
      `QUESTION_BANK_AGENT_TEACHER_ID`) tiene ambos roles `teacher` y `admin`
      en `user_roles`. Los 3 cursos reales del semestre están activos con
      `course_slug`/`enrollment_code` correctos: `estructuras-de-datos`,
      `analisis-de-algoritmos`, `programacion-cientifica`.
      **Hallazgo y limpieza:** existía un **4º curso residual de pruebas**,
      "Curso Docente B" (`DB-2026-1`, `course_slug = null`, `teacher_id`
      distinto perteneciente a la cuenta de prueba `docente-b@nodo.test`,
      `role = teacher`) — filtrado de otra ronda de testing (multi-docente).
      Sin datos dependientes (`enrollments`, `class_sessions`,
      `assignment_variant_groups`, `grade_items` en 0 para ese curso).
      Confirmado por el usuario como residuo → **eliminado**: primero el
      curso (`DELETE` vía REST con `service_role`, `academic_courses.teacher_id`
      es `ON DELETE RESTRICT` así que debía ir antes), después la cuenta
      `docente-b@nodo.test` vía Admin API (cascada sobre `profiles`,
      `user_roles`, `students`). Verificado tras el borrado: quedan
      exactamente los 3 cursos reales y el perfil de `docente-b@nodo.test`
      ya no existe.
- **Archivos impactados:** ninguno en repo. Sin huecos de RLS detectados
  (no hizo falta crear migraciones). Datos de producción: eliminado el curso
  de prueba `3b922b65-636a-4d0e-90ca-939bd5bdb840` ("Curso Docente B") y la
  cuenta `docente-b@nodo.test` (`e20695ec-f060-4cce-8a56-4fbc94b8eba6`),
  ambos residuos de testing sin relación con este spec.

**Barrido adicional de usuarios de prueba (2026-07-31, a pedido del usuario):**
tras cerrar el ítem anterior, se auditaron **todos** los usuarios de
`auth.users` (8 en total) para descartar más residuos de testing más allá del
docente de prueba ya encontrado. Resultado: **7 de las 8 cuentas eran de
prueba**, todas matriculadas activamente en el curso real
`estructuras-de-datos` con datos generados (submissions, self-assessment
attempts, student_grades, attendance_records) de rondas de testing de
spec-018/019/020 (evaluaciones A/B/C):
- `test-student-a` a `test-student-e@example.com` (5 cuentas, `full_name`
  literal = el email, sin personalizar).
- `estudiante.retirado.test@nodo.local` ("Estudiante Retirado (QA)",
  matrícula `withdrawn`).
- `santiagosuarezcortes21@gmail.com` ("Karol Quintero Marin") — email/nombre
  de apariencia real, **confirmado por el usuario** como cuenta de prueba
  propia (no un estudiante real).

Todas eliminadas con `students-mcp.delete_student`. 5 de las 7 (los
`test-student-*`) devolvieron **409** por tener `submissions` reales
asociadas; se limpiaron manualmente vía REST con `service_role` (orden:
`submissions` → cascada automática sobre `answers` por
`on delete cascade`; `student_grades`; `self_assessment_attempts`) y se
reintentó el borrado, exitoso en los 5 casos. **Verificado tras la limpieza:**
`auth.users` en producción queda con **1 sola cuenta**, la del docente real
(`santiago8628@gmail.com`).

### Fase 6 — Rama de despliegue y deploy real (GATED) 🔒
> **Cada subpaso de merge/push/migración requiere confirmación explícita del
> usuario en la misma sesión.**

- [x] Completar el **Checklist pre-despliegue** de `CLAUDE.md` — build/lint
      verdes, `development` sincronizada con `origin/development`
      (commit `c8b8ad1`, ver Fase 1).
- [x] Crear rama `deploy/v1.0.0` desde `development`.
- [x] **[GATE 🔒]** Aplicar migraciones a producción si aplica — **no aplica**:
      34 migraciones ya sincronizadas (Local == Remote), sin cambios de
      esquema en este spec.
- [x] **[GATE 🔒]** Merge `deploy/v1.0.0` → `main` (`--no-ff`) — confirmado
      por el usuario 2026-07-31, commit `fc24335`. Primer merge real de
      Nodo a `main` (207+ commits de `development`, sin conflictos).
- [x] **[GATE 🔒]** Push a `main` → Vercel dispara el build — confirmado por
      el usuario, push exitoso (`a8d383b..fc24335`).
- [x] Verificar que el build terminó sin errores y capturar la **URL de
      producción final**. **Proyecto Vercel creado por el usuario tras el
      push** (no existía antes — corrección respecto a la premisa de Fase 4,
      que asumía un proyecto ya conectado). URL asignada:
      `https://nodo-edu.vercel.app` — verificado por HTTP: `200`, redirige
      correctamente a `/login?redirectTo=%2F` para un visitante anónimo
      (middleware funcionando, adelanta parte de `TC-026-014`).
      **Ampliación de alcance confirmada por el usuario:** se conectó
      además el dominio propio **`nod0.dev`** (comprado directamente desde
      Vercel, DNS gestionado automáticamente) — fuera del alcance original
      del spec ("No incluye: Configurar dominio custom"), aprobado
      explícitamente en esta sesión. Vercel dejó `https://www.nod0.dev`
      como dominio canónico (`nod0.dev` redirige a `www.nod0.dev`), también
      verificado por HTTP: `200`.
      **`NEXT_PUBLIC_SITE_URL` actualizada** en Vercel a
      `https://www.nod0.dev` y redeployada; **Site URL y Redirect URLs de
      Supabase Auth** actualizados a `https://www.nod0.dev` (+ `nod0.dev/**`
      y `www.nod0.dev/**` en Redirect URLs) — ambos confirmados por el
      usuario.
- [x] Limpiar la rama `deploy/v1.0.0` tras confirmar el despliegue.
- **Archivos impactados:** historial git (`main`), sin cambios de código.
  Fuera de lo previsto en el spec original: dominio `nod0.dev` conectado en
  Vercel (ampliación de alcance aprobada en sesión).

### Fase 7 — Smoke tests críticos del día 1 🔒
> Los 6 flujos que el usuario declaró críticos, sobre la URL de producción.
> **Las pruebas de UI las ejecuta el usuario** (ver `CLAUDE.md`); Claude prepara
> datos vía API/MCP, guía caso por caso y registra hallazgos.
> Casos detallados en `docs/testing/test-026-primer-despliegue-produccion.md`.

- [ ] **Registro** con código de curso válido → cuenta creada, sesión iniciada,
      matrícula automática (`TC-026-001` a `TC-026-004`).
- [ ] **Login** y redirección por rol: estudiante → `/cuenta/cursos`, docente →
      `/` (`TC-026-005`, `TC-026-006`).
- [ ] **Matrícula manual** en un segundo curso desde `/cuenta/cursos`
      (`TC-026-007`).
- [ ] **Contenido MDX**: lección con Mermaid, KaTeX, YouTube, código con Shiki;
      sidebar y guía de laboratorio (`TC-026-008`, `TC-026-009`).
- [ ] **Progreso de lección** persiste tras recargar (`TC-026-010`).
- [ ] **Autoevaluación** de cierre: responder, enviar, ver feedback, y que el
      estado persista (`TC-026-011`).
- [ ] **Asistencia**: docente abre sesión y comparte código; estudiante lo
      registra; docente ve el conteo (`TC-026-012`).
- [ ] **Recuperación de cuenta sin SMTP** vía `students-mcp` (`TC-026-013`).
- [ ] **Gate de acceso**: usuario anónimo es redirigido a `/login`; estudiante
      no matriculado no ve el contenido del curso (`TC-026-014`).
- [ ] Eliminar **todos** los datos de prueba creados en producción y dejar
      constancia en el archivo de test.
- [ ] Registrar hallazgos; los bugs fuera de scope van a
      `docs/specs/backlog.md`.
- **Archivos impactados:**
  `docs/testing/test-026-primer-despliegue-produccion.md`,
  `docs/specs/backlog.md`.

### Fase 8 — MCP: reconfigurar los 4 MCPs a producción + smoke tests diferidos 🔒
> **Post-arranque de clases.** Requiere la URL de producción (Fase 6) y las API
> keys de producción (Fase 4). No bloquea el día 1: los MCPs son herramientas
> del docente, no del estudiante.

- [ ] Actualizar la configuración de los **4** MCPs (`.mcp.json` vía
      `mcp-servers/run-local-mcp.sh` y/o `claude_desktop_config.json`) para
      apuntar a `https://<url-prod>/api/*` con las API keys de producción.
      **No commitear las keys.**
      > Nota: `run-local-mcp.sh` deriva el origen desde
      > `QUESTION_BANK_API_BASE_URL` en `.env.local`. Evaluar si conviene un
      > perfil separado para producción en vez de sobrescribir el local, para
      > no perder la capacidad de trabajar contra `npm run dev`.
- [ ] Actualizar `docs/mcps/README.md` para reflejar que existe configuración de
      producción además de la local.
- [ ] Revisar los **4** system prompts en `docs/mcps/` y ajustarlos **solo** si
      describen endpoint/entorno.
- [ ] Verificar que los 4 MCPs cargan contra producción (`TC-MCP-026-001` a
      `TC-MCP-026-005`).
- [ ] Smoke tests diferidos de **evaluaciones A/B/C** (spec-018/019/020):
      publicar un grupo, resolverlo como estudiante, calificarlo como docente
      (`TC-026-015` a `TC-026-017`).
- **Archivos impactados:** `.mcp.json` (si aplica),
  `claude_desktop_config.json` (local, sin secretos commiteados),
  `docs/mcps/README.md`, los 4 `docs/mcps/*-agent.system-prompt.md`.

## Criterios de aceptación

- `npm run lint` termina **sin errores** y `npm run build` pasa;
  `supabase migration list` muestra Local == Remote.
- `.env.example` refleja las variables reales y distingue las de la app (Vercel)
  de las de los clientes MCP locales; la descripción de `NEXT_PUBLIC_SITE_URL`
  ya no menciona flujos inexistentes.
- La decisión sobre `next.config.ts`, `engines.node`, `vercel.json` y
  `NEXT_PUBLIC_SITE_URL` queda documentada y justificada en el spec.
- Todas las variables de Production están presentes en Vercel, incluida
  `STUDENTS_ADMIN_API_KEY`, con claves de producción distintas de las locales.
- **"Confirm email" está desactivado y "Allow new users to sign up" activado**
  en Supabase Auth, verificado y documentado antes del despliegue.
- Supabase producción: 34 migraciones aplicadas y RLS verificado en todas las
  tablas de los flujos críticos.
- El protocolo de recuperación de cuenta sin SMTP está documentado y probado.
- El merge a `main`, el push y las migraciones prod ocurren **solo tras
  confirmación explícita del usuario**; ningún paso de deploy se automatiza.
- Tras el push, Vercel completa el build sin errores y la app carga en la URL de
  producción.
- **Los 6 flujos críticos (registro, matrícula, login, contenido MDX,
  asistencia, autoevaluación) pasan sus casos en producción** antes del inicio
  de clases.
- Todos los datos de prueba creados en producción quedan eliminados y
  registrados como tal.
- (Fase 8) Los 4 MCPs apuntan a producción con sus keys de producción y
  responden correctamente; ninguna API key real queda commiteada.

## Pruebas asociadas
- **Manuales:** `docs/testing/test-026-primer-despliegue-produccion.md` — casos
  `TC-026-NNN` (smoke tests en producción, con UI) y `TC-MCP-026-NNN` (MCPs
  contra producción).
- **Automáticas (e2e/unit):** el framework de testing sigue "por definir"
  (ver `CLAUDE.md` → Testing). No se crea archivo e2e; los criterios de
  aceptación se validan con las pruebas manuales.

## Cambios respecto a la versión anterior del spec (2026-07-30)

1. **Riesgo crítico corregido.** El riesgo de `NEXT_PUBLIC_SITE_URL` era real
   cuando se escribió el spec, pero spec-027 eliminó los flujos que lo usaban;
   hoy la variable no tiene ninguna referencia en el código. Se reemplazó por el
   riesgo real: la dependencia del registro sobre "Confirm email" desactivado.
2. **3 → 4 MCPs.** Se añadió `students-mcp` (spec-027) y su variable
   `STUDENTS_ADMIN_API_KEY`, que faltaba en la tabla de Vercel.
3. **`TEACHER_EMAIL`/`TEACHER_PASSWORD` eliminadas del spec:** no existen en el
   código (grep global sin resultados).
4. **Cifras actualizadas:** 34 migraciones (era 31), 207 commits adelante de
   `main` (era 174), 30 specs en `[DONE]` (era 25).
5. **Fases reordenadas:** los smoke tests críticos pasaron de Fase 8 (última) a
   Fase 7, **antes** de la reconfiguración de MCPs, porque los flujos de
   estudiante bloquean el inicio de clases y los MCPs no.
6. **Fase 0 nueva:** corrección de **[[DEBT-013]]**, que hoy deja `npm run lint`
   en rojo y bloquea el checklist pre-despliegue.
7. **Fase 5 ampliada** con la configuración de Auth del día 1 y el protocolo de
   recuperación de cuentas sin SMTP.
8. **Sección "Deuda técnica evaluada"** nueva: decisión explícita (abordar /
   mitigar / diferir) sobre cada ítem del backlog frente a la fecha de inicio de
   clases.
9. **Smoke test de recuperación de contraseña / OAuth eliminado:** esos flujos
   no existen en el código.
10. **Corrección sobre la home:** el `middleware.ts` actual exige sesión en todo
    el sitio salvo `/login`, `/registro` y `/api`. No hay "home pública" que
    probar; el caso se reemplazó por el gate de acceso anónimo.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-30
