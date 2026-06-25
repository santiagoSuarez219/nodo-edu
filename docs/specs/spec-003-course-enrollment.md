# spec-003 — [TESTING] Gestión de cursos académicos con matrículas y calificaciones

---

## Contexto

Hoy la plataforma publica contenido MDX organizado por curso de forma completamente estática y pública. No existe ningún mecanismo para que un docente cree una instancia académica de un curso (con estudiantes y horario concretos), ni para que un estudiante se matricule o consulte sus calificaciones.

Este spec introduce las entidades necesarias para gestionar el ciclo académico básico:

- El **docente** crea cursos académicos desde un panel privado, definiendo horario, código y código de matrícula.
- El **estudiante** ingresa ese código desde su cuenta para matricularse.
- El **docente** registra calificaciones parciales por estudiante.
- El **estudiante** consulta sus cursos y calificaciones.

Los cursos académicos son entidades de Supabase **distintas e independientes** de los cursos de contenido MDX (que siguen siendo datos estáticos en TypeScript bajo `lib/courses/data/`). Ambos coexisten sin acoplamiento directo: el curso estático define el material de lectura; el curso académico gestiona la relación docente-estudiante. Un curso académico puede referenciar opcionalmente un `course_slug` del contenido estático, pero no depende de él.

---

## Alcance

### Incluye

- Schema de base de datos: tablas `academic_courses`, `enrollments`, `grade_items`, `student_grades`, con políticas RLS y migraciones SQL versionadas.
- Panel del docente: ruta `/admin/courses` con listado, formulario de creación y vista de detalle (estudiantes + calificaciones).
- Dashboard del estudiante: ruta `/cuenta/cursos` con cursos matriculados y calificaciones.
- Flujo de matrícula: el estudiante ingresa un código en `/cuenta/cursos` y queda vinculado al curso.
- Registro de calificaciones parciales por el docente y cálculo de nota total (promedio simple en Fase 1).
- Retirada de un estudiante de un curso (estado `withdrawn` en la matrícula).
- Protección de rutas admin mediante verificación de rol `teacher` o `admin` en el middleware.

### No incluye

- Asignación automática de contenido MDX a un curso académico (los estudiantes siguen llegando al contenido por la URL pública).
- Notificaciones por email al matricularse o recibir calificación (follow-up).
- Importación masiva de estudiantes (CSV, etc.).
- Fórmulas de calificación ponderada complejas: la nota total es el promedio aritmético de los ítems parciales en Fase 1.
- Integración con Payload CMS: los cursos académicos no son entidades editoriales.
- Evaluaciones en línea, formularios o seguimiento de progreso de lectura (spec futuro).
- Roles `teacher` (docente colaborador) gestionados desde UI: la asignación del rol sigue siendo manual desde el dashboard Supabase o vía SQL, como estableció spec-002.
- Vista pública del curso académico (horario, estudiantes) expuesta a visitantes.

---

## Dependencias

**spec-002 debe estar en estado `[DONE]` antes de iniciar este spec.**

spec-002 establece:
- Tablas `profiles`, `students`, `user_roles` en Supabase con RLS.
- Función `has_role(uid uuid, role_name app_role) returns boolean`.
- Enum `app_role` que incluye `'teacher'` y `'admin'`.
- Middleware con refresh de sesión y protección de rutas privadas.
- Helpers `getCurrentUser()`, `getCurrentProfile()`, `requireUser()` en `lib/auth/session.ts`.
- Rutas `/login`, `/registro`, `/cuenta` funcionando.

Este spec extiende ese fundamento sin reescribir nada de él.

---

## Impacto en el sistema

### Base de datos

Cuatro tablas nuevas en Supabase Postgres. RLS habilitado en todas. Migraciones nuevas bajo `supabase/migrations/`.

- `academic_courses` — instancias de cursos académicos creadas por docentes.
- `enrollments` — relación N:M entre estudiantes y cursos académicos (con estado y fecha).
- `grade_items` — ítems de calificación definidos por el docente (parcial 1, parcial 2, etc.).
- `student_grades` — nota de un estudiante en un ítem de calificación concreto.

Cada tabla tiene sus índices y políticas RLS diferenciadas por rol (docente vs. estudiante).

### Nuevas rutas y layouts

| Ruta | Tipo | Quién accede |
|---|---|---|
| `/admin/courses` | Server Component (listado) | Docente / Admin |
| `/admin/courses/new` | Server Component (formulario) | Docente / Admin |
| `/admin/courses/[academicCourseId]` | Server Component (detalle + estudiantes) | Docente / Admin |
| `/admin/courses/[academicCourseId]/grades` | Server Component (tabla de calificaciones) | Docente / Admin |
| `/cuenta/cursos` | Server Component (mis cursos) | Estudiante |
| `/cuenta/cursos/[enrollmentId]` | Server Component (detalle de matrícula) | Estudiante |

Las rutas bajo `/admin/*` requieren rol `teacher` o `admin`. La verificación se hace en `middleware.ts` (ya existente desde spec-002) añadiendo el prefijo `/admin` a la lista de rutas protegidas, y también en cada Server Component con `requireRole('teacher')` (helper nuevo en `lib/auth/session.ts`).

Nuevo layout compartido: `app/(admin)/layout.tsx` con barra de navegación del panel, visible solo si hay sesión con rol correspondiente.

### Nuevos módulos en lib/

| Módulo | Responsabilidad |
|---|---|
| `lib/academic-courses/` | CRUD de cursos académicos (solo docente) |
| `lib/enrollments/` | Matrícula por código, retirada, lectura de cursos propios |
| `lib/grades/` | Gestión de ítems de calificación y notas por estudiante |

Cada módulo expone tipos TypeScript, funciones de acceso a Supabase (server-side) y Server Actions. Ningún componente importa el cliente Supabase directamente.

### Componentes nuevos o modificados

**Nuevos en `components/admin/`:**
- `AcademicCourseList` — tabla con cursos del docente.
- `AcademicCourseForm` — formulario de creación/edición (React Hook Form + Zod).
- `EnrollmentTable` — lista de estudiantes matriculados con estado.
- `GradeItemsPanel` — gestión de ítems parciales (añadir, editar, eliminar).
- `GradesTable` — tabla de calificaciones por estudiante e ítem.
- `GradeInputCell` — celda editable de calificación individual.

**Nuevos en `components/account/`:**
- `EnrolledCourseList` — lista de cursos del estudiante con nota total.
- `EnrollmentForm` — campo de código de matrícula con feedback de error.
- `EnrollmentDetail` — detalle de un curso matriculado y sus calificaciones.

**Modificados:**
- `middleware.ts` — añade `/admin` como prefijo de ruta protegida con verificación de rol.
- `lib/auth/session.ts` — añade `requireRole(role: app_role)` helper.
- `app/cuenta/layout.tsx` — añade enlace "Mis cursos" en la navegación de cuenta.

---

## Schema de base de datos

### Tabla `academic_courses`

Representa una instancia concreta de un curso dictado por un docente en un período académico.

Campos:
- `id uuid primary key default gen_random_uuid()`
- `teacher_id uuid not null references auth.users(id) on delete restrict` — el docente que creó el curso.
- `name text not null` — nombre del curso (ej. "Estructuras de Datos").
- `code text not null` — código académico institucional (ej. "EDS-2025-1"). No necesariamente único globalmente, pero sí por docente.
- `class_days text[] not null` — días de clase (ej. `['lunes', 'miercoles']`).
- `class_time_start time not null` — hora de inicio (ej. `08:00`).
- `class_time_end time not null` — hora de fin (ej. `10:00`).
- `enrollment_code text not null unique` — código que los estudiantes usan para matricularse. Único en toda la tabla.
- `course_slug text` — referencia opcional al slug del curso de contenido MDX. No tiene FK formal (el contenido vive en TS). Puede ser null si el curso académico no tiene contenido asociado.
- `is_active boolean not null default true` — si el curso acepta nuevas matrículas.
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Índices:
- `(teacher_id)` — para listar cursos del docente eficientemente.
- `(enrollment_code)` — ya cubierto por el `unique`, pero lo mencionamos para claridad.

Restricción adicional: `check (class_time_end > class_time_start)`.

### Tabla `enrollments`

Relación N:M entre estudiantes (`auth.users`) y cursos académicos.

Campos:
- `id uuid primary key default gen_random_uuid()`
- `student_id uuid not null references auth.users(id) on delete restrict`
- `academic_course_id uuid not null references academic_courses(id) on delete restrict`
- `status text not null default 'active' check (status in ('active', 'withdrawn'))`
- `enrolled_at timestamptz not null default now()`
- `withdrawn_at timestamptz` — null si está activo.

Restricción de unicidad: `unique (student_id, academic_course_id)` — un estudiante solo puede estar matriculado una vez en el mismo curso (incluso si fue retirado; la fila persiste con `status = 'withdrawn'`).

Índices:
- `(student_id)` — para listar cursos del estudiante.
- `(academic_course_id)` — para listar estudiantes del curso.
- `(academic_course_id, status)` — para filtrar solo activos al mostrar la lista del docente.

### Tabla `grade_items`

Ítems de calificación definidos por el docente para un curso (ej. "Parcial 1", "Taller 2").

Campos:
- `id uuid primary key default gen_random_uuid()`
- `academic_course_id uuid not null references academic_courses(id) on delete cascade`
- `name text not null` — nombre del ítem (ej. "Parcial 1").
- `order_index smallint not null default 0` — orden de visualización en la tabla.
- `created_at timestamptz not null default now()`

Restricción de unicidad: `unique (academic_course_id, name)` — no puede haber dos ítems con el mismo nombre en el mismo curso.

Índice: `(academic_course_id, order_index)` — para ordenar los ítems al renderizar la tabla.

### Tabla `student_grades`

Nota de un estudiante en un ítem de calificación.

Campos:
- `id uuid primary key default gen_random_uuid()`
- `enrollment_id uuid not null references enrollments(id) on delete cascade`
- `grade_item_id uuid not null references grade_items(id) on delete cascade`
- `score numeric(5,2)` — nota sobre 5.0 (escala colombiana). Puede ser null si aún no se ha registrado.
- `recorded_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Restricción de unicidad: `unique (enrollment_id, grade_item_id)` — una nota por estudiante por ítem.
Restricción de rango: `check (score is null or (score >= 0 and score <= 5))`.

Índice: `(enrollment_id)` — para obtener todas las notas de un estudiante en un curso.

### Nota total calculada

No se almacena como columna persistente en esta fase. Se calcula en la capa de aplicación (o con una vista SQL) como el promedio simple de los `score` no nulos del estudiante en el curso. Si todos los scores son null, la nota total es null. Se expone como campo derivado en el tipo TypeScript `EnrollmentWithGrades`.

En una fase posterior, si el rendimiento lo justifica, se puede materializar como una columna generada o una vista materializada.

### Políticas RLS

**`academic_courses`:**
- `select`: el docente ve solo sus cursos (`teacher_id = auth.uid()`). Admin ve todos (`has_role(auth.uid(), 'admin')`).
- `insert`: solo usuarios con rol `teacher` o `admin` (`has_role(auth.uid(), 'teacher') or has_role(auth.uid(), 'admin')`). El `teacher_id` se fuerza a `auth.uid()` via check.
- `update`: solo el docente dueño del curso o admin.
- `delete`: solo el docente dueño o admin. Bloqueado si hay matrículas activas (restricción en aplicación, no en DB).

**`enrollments`:**
- `select`: el estudiante ve solo sus matrículas (`student_id = auth.uid()`). El docente ve las matrículas de sus cursos (join con `academic_courses where teacher_id = auth.uid()`). Admin ve todas.
- `insert`: solo el propio estudiante puede matricularse (`student_id = auth.uid()` y `has_role(auth.uid(), 'student')`). Verificación del `enrollment_code` se hace en la Server Action antes del insert.
- `update`: el docente dueño del curso puede cambiar el `status` (retirar). El estudiante no puede modificar su matrícula.
- `delete`: no permitido (las matrículas son inmutables para auditoría; solo se cambia el estado).

**`grade_items`:**
- `select`: el docente dueño del curso. Estudiantes matriculados activos en ese curso (para que puedan ver el nombre de los ítems en su detalle de calificaciones).
- `insert`, `update`, `delete`: solo el docente dueño del curso.

**`student_grades`:**
- `select`: el estudiante ve solo sus propias notas (via `enrollment_id` que pertenece a su `student_id`). El docente ve las notas de sus cursos.
- `insert`, `update`: solo el docente dueño del curso al que pertenece el `enrollment_id`.
- `delete`: solo el docente dueño.

---

## Fases de implementación

### Fase 1 — Schema de base de datos y migraciones

**Objetivo:** tener las tablas, índices y políticas RLS creadas y aplicadas localmente. Sin tocar código de Next.js todavía.

- [x] Crear `supabase/migrations/<timestamp>_init_academic_courses.sql` con la tabla `academic_courses`, su índice y trigger de `updated_at`.
- [x] Crear `supabase/migrations/<timestamp>_init_enrollments.sql` con la tabla `enrollments` y sus índices.
- [x] Crear `supabase/migrations/<timestamp>_init_grade_items.sql` con la tabla `grade_items` y su índice compuesto.
- [x] Crear `supabase/migrations/<timestamp>_init_student_grades.sql` con la tabla `student_grades`, sus índices y restricción de rango.
- [x] Crear `supabase/migrations/<timestamp>_rls_academic.sql` con `enable row level security` en las cuatro tablas y todas las políticas descritas en el schema.
- [x] Aplicar con `supabase db reset` localmente y verificar que no hay conflictos con las migraciones de spec-002.
- [ ] Verificar en el studio local (`supabase studio`) que las políticas están activas y las relaciones son correctas.
- [x] Documentar en `supabase/README.md` (o en el README raíz) el orden de migraciones y las dependencias entre specs.

**Verificación de fase:** `supabase db reset` pasa sin errores. Las cuatro tablas existen con RLS habilitado. Se puede insertar un `academic_course` con un usuario que tenga rol `teacher` y se rechaza con un usuario que tenga rol `student`.

---

### Fase 2 — Capa de dominio en lib/

**Objetivo:** tipos TypeScript, funciones de acceso a Supabase y Server Actions para los tres módulos nuevos. Sin UI todavía.

- [x] Crear `lib/academic-courses/types.ts` con los tipos `AcademicCourse`, `AcademicCourseInput` (para creación), `AcademicCourseUpdate`.
- [x] Crear `lib/academic-courses/index.ts` con:
  - `getCoursesByTeacher(teacherId)`: lista los cursos del docente autenticado.
  - `getAcademicCourseById(courseId)`: detalle de un curso (verifica que el docente sea el dueño).
  - `createAcademicCourse(input)`: inserta un nuevo curso. Genera el `enrollment_code` si no se provee (string aleatorio de 8 caracteres alfanuméricos mayúsculas, verificando unicidad antes de insertar).
  - `updateAcademicCourse(courseId, update)`: actualiza campos editables del curso.
  - `deactivateAcademicCourse(courseId)`: cambia `is_active = false` (no borra).
- [x] Crear `lib/academic-courses/actions.ts` con Server Actions: `createCourseAction`, `updateCourseAction`, `deactivateCourseAction`. Cada una valida con Zod, aplica la función de `index.ts` y devuelve `{ ok: true } | { ok: false, error: string, fieldErrors? }`.
- [x] Crear `lib/academic-courses/schemas.ts` con Zod: `AcademicCourseSchema` (validación de `name`, `code`, `class_days` como array de al menos un día, `class_time_start` y `class_time_end` como strings `HH:mm`, `enrollment_code` opcional, `course_slug` opcional).
- [x] Crear `lib/enrollments/types.ts` con `Enrollment`, `EnrollmentWithCourse`, `EnrollmentWithStudents`.
- [x] Crear `lib/enrollments/index.ts` con:
  - `enrollByCode(enrollmentCode)`: busca el curso activo por `enrollment_code`, inserta en `enrollments` con `student_id = auth.uid()`. Devuelve error si el código no existe, el curso está inactivo, o el estudiante ya está matriculado (incluso si fue retirado).
  - `getEnrollmentsByStudent()`: lista los cursos del estudiante autenticado con nombre del curso y nota total calculada.
  - `getEnrollmentById(enrollmentId)`: detalle de matrícula para el estudiante (valida que `student_id = auth.uid()`).
  - `getEnrollmentsByAcademicCourse(academicCourseId)`: lista estudiantes matriculados para el docente dueño.
  - `withdrawStudent(enrollmentId)`: cambia `status = 'withdrawn'` y `withdrawn_at = now()` (solo docente dueño).
- [x] Crear `lib/enrollments/actions.ts` con Server Actions: `enrollByCourseCodeAction`, `withdrawStudentAction`.
- [x] Crear `lib/grades/types.ts` con `GradeItem`, `StudentGrade`, `EnrollmentWithGrades` (incluye array de ítems con la nota del estudiante y la nota total calculada como campo derivado).
- [x] Crear `lib/grades/index.ts` con:
  - `getGradeItemsByCourse(academicCourseId)`: lista los ítems de calificación del curso.
  - `createGradeItem(academicCourseId, name, orderIndex)`.
  - `updateGradeItem(gradeItemId, fields)`.
  - `deleteGradeItem(gradeItemId)`: solo si no hay notas registradas para ese ítem (validación en aplicación).
  - `getGradesByEnrollment(enrollmentId)`: notas de un estudiante en un curso (para el estudiante propio o el docente).
  - `getGradesByCourse(academicCourseId)`: todas las notas del curso organizadas por estudiante (para el docente).
  - `upsertStudentGrade(enrollmentId, gradeItemId, score)`: inserta o actualiza la nota.
- [x] Crear `lib/grades/actions.ts` con Server Actions: `createGradeItemAction`, `updateGradeItemAction`, `deleteGradeItemAction`, `upsertStudentGradeAction`.
- [x] Crear `lib/grades/schemas.ts` con Zod: `GradeItemSchema`, `StudentGradeSchema` (score entre 0 y 5, dos decimales máximo).
- [x] Añadir `requireRole(role: app_role)` a `lib/auth/session.ts`. La función llama `getCurrentUser()`, verifica con `has_role` y dispara `redirect('/login')` o `redirect('/')` según corresponda si el rol no se cumple.

**Verificación de fase:** Correr `tsc --noEmit` sin errores. Los módulos exportan sus tipos y funciones correctamente. Se pueden probar las funciones de lectura desde una página temporal de server component.

---

### Fase 3 — Middleware y protección de rutas admin

**Objetivo:** el prefijo `/admin` queda protegido con verificación de rol antes de que exista la UI.

> **Prerequisito:** el archivo `proxy.ts` en la raíz es el middleware de spec-002, pero está mal nombrado: Next.js requiere el archivo `middleware.ts` con una función exportada como `middleware`. El primer paso de esta fase es corregir esto.

- [x] Renombrar `proxy.ts` → `middleware.ts` en la raíz del proyecto. Renombrar la función exportada de `proxy` a `middleware`. Verificar que el refresh de sesión y la protección de `/cuenta` siguen funcionando.
- [x] Añadir en `middleware.ts` el bloque para `/admin`: si `pathname.startsWith('/admin')` y no hay sesión, redirigir a `/login`; si hay sesión pero no tiene rol `teacher` ni `admin`, redirigir a `/`.
- [x] La verificación de rol en el middleware debe ser ligera: consulta a `user_roles` con el cliente de middleware usando `has_role`.
- [x] Actualizar el `matcher` si fuera necesario para asegurar que `/admin/*` queda dentro del scope del middleware.
- [ ] Probar manualmente: un visitante sin sesión que accede a `/admin/courses` → redirige a `/login`. Un estudiante autenticado que accede a `/admin/courses` → redirige a `/`. Un docente autenticado → accede correctamente (404 todavía, pero el middleware no bloquea).

**Verificación de fase:** El middleware bloquea accesos no autorizados a `/admin/*` en los tres casos descritos.

---

### Fase 4 — Panel del docente: listado y creación de cursos

**Objetivo:** el docente puede ver sus cursos y crear uno nuevo desde `/admin/courses`.

- [x] Crear `app/(admin)/layout.tsx` con la barra lateral o cabecera del panel admin. Llama `requireRole('teacher')` (o `requireRole('admin')`) al inicio. Incluye navegación mínima: "Mis Cursos" y, en el futuro, "Estudiantes". Usa tokens semánticos del sistema de diseño; Flowbite primero.
- [x] Crear `app/(admin)/courses/page.tsx` (Server Component): llama `getCoursesByTeacher()` y renderiza `<AcademicCourseList courses={courses} />`. Incluye un botón o enlace a `/admin/courses/new`.
- [x] Crear `components/admin/AcademicCourseList.tsx` (server): tabla con columnas: Nombre, Código, Horario, Código de matrícula, Estado (activo/inactivo), acciones (Ver detalle). Si la lista está vacía, muestra un estado vacío con CTA para crear el primer curso.
- [x] Crear `app/(admin)/courses/new/page.tsx` (Server Component): renderiza `<AcademicCourseForm />`.
- [x] Crear `components/admin/AcademicCourseForm.tsx` (`"use client"`): React Hook Form + Zod resolver para `AcademicCourseSchema`. Campos: Nombre, Código del curso, Días de clase (checkboxes: lunes a sábado), Hora inicio, Hora fin, Código de matrícula (con sugerencia de generar automáticamente), Slug de contenido (opcional). Al submit llama `createCourseAction`. En éxito redirige a `/admin/courses/[id]`. En error pinta `fieldErrors`.
- [x] El campo "Código de matrícula" tiene un botón "Generar" que popula el campo con un código aleatorio en el cliente (8 caracteres alfanuméricos, solo como sugerencia; la validación de unicidad real ocurre en el servidor).
- [ ] Validar que el formulario funciona en modo claro y oscuro, tipografía JetBrains Mono, sin colores crudos.

**Verificación de fase:** Un usuario con rol `teacher` puede crear un curso y verlo en el listado. Un usuario con rol `student` ve el listado vacío de sus cursos (rutas `/cuenta/cursos`), pero no puede acceder a `/admin/courses`.

---

### Fase 5 — Panel del docente: detalle de curso y estudiantes

**Objetivo:** el docente ve los estudiantes matriculados y puede retirarlos.

- [x] Crear `app/(admin)/courses/[academicCourseId]/page.tsx` (Server Component): llama `getAcademicCourseById` y `getEnrollmentsByAcademicCourse`. Renderiza cabecera del curso (nombre, código, horario, código de matrícula) + `<EnrollmentTable enrollments={...} />`.
- [x] Crear `components/admin/EnrollmentTable.tsx` (server): tabla con columnas: Nombre del estudiante, Fecha de matrícula, Estado (activo/retirado), Nota total, acción "Retirar" (solo si activo). Nota: email omitido — requiere service role, pendiente en backlog.
- [x] La acción "Retirar" dispara `withdrawStudentAction` desde un `<form>` con botón que invoca la Server Action directamente (sin necesidad de un componente client para este caso simple).
- [x] Crear enlace o pestaña "Calificaciones" hacia `/admin/courses/[academicCourseId]/grades`.
- [x] Crear enlace "Editar curso" que muestra el formulario de edición (puede ser la misma ruta con un `?edit=true` param o una ruta `/admin/courses/[id]/edit` — se prefiere ruta explícita para claridad).
- [x] Crear `app/(admin)/courses/[academicCourseId]/edit/page.tsx` con `<AcademicCourseForm />` prellenado con los datos del curso. Al submit llama `updateCourseAction`.

**Verificación de fase:** El docente puede ver la lista de estudiantes matriculados con su nota total (null inicialmente), retirar a uno, y editar los datos del curso.

---

### Fase 6 — Panel del docente: gestión de calificaciones

**Objetivo:** el docente define ítems de calificación y registra notas por estudiante.

- [x] Crear `app/(admin)/courses/[academicCourseId]/grades/page.tsx` (Server Component): llama `getGradeItemsByCourse`, `getEnrollmentsByAcademicCourse` y `getGradesByCourse`. Renderiza `<GradeItemsPanel />` y `<GradesTable />`.
- [x] Crear `components/admin/GradeItemsPanel.tsx` (`"use client"`): lista los ítems existentes con botón para añadir uno nuevo. El formulario de ítem es inline (input de nombre + número de orden). Al confirmar llama `createGradeItemAction`. Permite eliminar un ítem (con confirmación si ya hay notas registradas).
- [x] Crear `components/admin/GradesTable.tsx` (`"use client"`): tabla con filas = estudiantes activos, columnas = ítems de calificación + columna "Total". Cada celda es `<GradeInputCell />`.
- [x] Crear `components/admin/GradeInputCell.tsx` (`"use client"`): input numérico (0.00–5.00) que llama `upsertStudentGradeAction` al perder el foco (`onBlur`). Muestra un indicador visual de guardado (spinner breve, luego check) y de error. El valor null se representa como celda vacía (no "0").
- [x] La columna "Total" calcula el promedio de las notas no nulas del estudiante en el cliente (dato ya disponible en la carga inicial). Se recalcula reactivamente cuando se cambia una celda.
- [x] Si no hay ítems definidos todavía, `GradesTable` muestra un estado vacío orientando al docente a crear ítems primero.

**Verificación de fase:** El docente puede añadir ítems de calificación, ingresar notas por estudiante celda a celda, y ver la nota total actualizarse. Dos docentes con cursos distintos no ven las notas del otro (validar con dos cuentas teacher).

---

### Fase 7 — Dashboard del estudiante: mis cursos y matrícula

**Objetivo:** el estudiante puede matricularse con un código y ver sus cursos con sus calificaciones.

- [x] Editar `app/cuenta/layout.tsx` para añadir el enlace "Mis Cursos" apuntando a `/cuenta/cursos`.
- [x] Crear `app/cuenta/cursos/page.tsx` (Server Component): llama `requireUser()` y `getEnrollmentsByStudent()`. Renderiza `<EnrollmentForm />` para matricularse y `<EnrolledCourseList enrollments={...} />`.
- [x] Crear `components/account/EnrollmentForm.tsx` (`"use client"`): un campo de texto para el código de matrícula + botón "Matricularme". Llama `enrollByCourseCodeAction`. Muestra mensajes de error claros: "Código no encontrado", "Ya estás matriculado en este curso", "El curso no está aceptando matrículas". En éxito recarga la lista (revalidación de la ruta).
- [x] Crear `components/account/EnrolledCourseList.tsx` (server): tarjetas con Nombre del curso, Código, Docente (nombre del perfil), Horario, Nota total, Estado (activo/retirado). Enlace a `/cuenta/cursos/[enrollmentId]` para ver el detalle.
- [x] Crear `app/cuenta/cursos/[enrollmentId]/page.tsx` (Server Component): llama `getEnrollmentById` y `getGradesByEnrollment`. Verifica que `student_id = auth.uid()`. Renderiza `<EnrollmentDetail />`.
- [x] Crear `components/account/EnrollmentDetail.tsx` (server): muestra datos del curso (nombre, docente, horario), tabla de calificaciones (ítem + nota, nota nula se muestra como "—"), y nota total. Modo de solo lectura para el estudiante.
- [x] Si el estudiante no tiene matrículas activas, `EnrolledCourseList` muestra un estado vacío con instrucciones para ingresar un código.

**Verificación de fase:** Un estudiante puede matricularse con un código válido, ver el curso en su lista, y consultar sus calificaciones (inicialmente todas vacías). El error se muestra correctamente para códigos inválidos o cursos ya matriculados.

---

### Fase 8 — Pulido, accesibilidad y validación final

**Objetivo:** paridad visual, accesibilidad, robustez y cierre del spec.

- [x] Revisar todos los componentes nuevos contra los tokens semánticos definidos en `DESIGN.md`. Eliminar cualquier valor crudo de la paleta.
- [ ] Validar modo claro y oscuro en todas las rutas nuevas: `/admin/courses`, `/admin/courses/new`, `/admin/courses/[id]`, `/admin/courses/[id]/grades`, `/cuenta/cursos`, `/cuenta/cursos/[enrollmentId]`. — **pendiente validación manual (TC-020)**
- [x] Validar accesibilidad de `GradeInputCell`: label asociado con nombre de estudiante e ítem, navegación por teclado (tab nativo), anuncio de estado con `aria-live="polite"`.
- [ ] Validar que las rutas públicas de specs 001 y 002 no se ven afectadas. — **pendiente (TC-019)**
- [ ] Probar los casos de error de RLS directamente. — **pendiente (TC-018)**
- [ ] Probar la retirada de un estudiante. — **pendiente (TC-014)**
- [x] Correr `npm run lint` y `tsc --noEmit` sin errores nuevos.
- [x] Crear `docs/testing/test-003-course-enrollment.md` con los casos de prueba manuales.
- [x] Cambiar el estado del spec a `[TESTING]` y ejecutar los casos de prueba manuales.

---

## Criterios de aceptación

### Docente

- Un usuario con rol `teacher` puede acceder a `/admin/courses` y ver el listado de sus cursos.
- Puede crear un curso nuevo desde `/admin/courses/new` con nombre, código, días, hora y código de matrícula. El formulario valida todos los campos y muestra errores inline.
- El código de matrícula es único. Si ya existe, el servidor devuelve error y el formulario lo indica.
- Puede editar un curso existente desde `/admin/courses/[id]/edit`.
- Puede ver la lista de estudiantes matriculados en `/admin/courses/[id]`, incluyendo su nota total.
- Puede retirar a un estudiante activo. La fila cambia de estado a `withdrawn`; el estudiante sigue viendo el curso en su lista con estado "retirado" pero no puede volver a matricularse con el mismo código.
- Puede gestionar ítems de calificación: añadir, renombrar, eliminar (si sin notas), reordenar.
- Puede registrar y editar notas en la tabla de calificaciones, celda a celda. La nota total se actualiza visualmente en la misma sesión.
- Un docente no puede ver ni editar los cursos ni las calificaciones de otro docente.

### Estudiante

- Un usuario con rol `student` puede acceder a `/cuenta/cursos`.
- Puede matricularse ingresando un código de matrícula válido. El sistema valida el código y muestra errores claros si no existe, si el curso está inactivo, o si ya está matriculado.
- Ve su lista de cursos matriculados con nombre, docente, horario, nota total y estado.
- Puede consultar el detalle de cada matrícula con la tabla de calificaciones (lectura).
- No puede ver ni modificar cursos de otros estudiantes.

### Seguridad y acceso

- Un visitante sin sesión que accede a `/admin/*` o `/cuenta/cursos` es redirigido a `/login`.
- Un estudiante autenticado que accede a `/admin/*` es redirigido a `/` (no a `/login`).
- Las rutas públicas de contenido (`/`, `/[courseSlug]`, `/[courseSlug]/[lessonSlug]`) siguen accesibles sin sesión y devuelven 200.
- RLS bloquea accesos cruzados en DB directamente (validable con la anon key y el service role en el cliente de Supabase).
- El `enrollment_code` no se filtra en ninguna respuesta pública; solo el docente dueño y el sistema de matrícula lo conocen.

### Calidad

- Lint y typecheck pasan sin errores nuevos.
- Modo claro y oscuro consistentes con `DESIGN.md`.
- Tipografía JetBrains Mono en todos los componentes nuevos.
- Sin valores crudos de paleta en los estilos.

---

## Pruebas e2e (si aplica)

Los siguientes flujos deben ser cubiertos por el agente `@tester` como última fase antes de marcar el spec como `[DONE]`:

1. **Flujo docente completo**: login como teacher → crear curso → copiar código de matrícula → verificar que aparece en listado → añadir ítems de calificación → verificar que la tabla de notas muestra los ítems.

2. **Flujo matrícula**: login como student → ir a `/cuenta/cursos` → ingresar código inválido → verificar error → ingresar código válido → verificar que el curso aparece en la lista → verificar que el detalle muestra los ítems de calificación con notas vacías.

3. **Flujo calificación**: login como teacher → navegar a calificaciones del curso → ingresar una nota en una celda → verificar que el guardado ocurre sin recargar la página → verificar que la nota total se actualiza → login como student en otra sesión → verificar que la nota es visible.

4. **Flujo retirada**: login como teacher → retirar a un estudiante → verificar que desaparece de la vista activa → login como student → verificar que el curso aparece como "retirado" → intentar matricularse con el mismo código → verificar que el sistema devuelve error de "ya matriculado".

5. **Bloqueo de acceso**: sin sesión → acceder a `/admin/courses` → verificar redirect a `/login`. Con sesión de estudiante → acceder a `/admin/courses` → verificar redirect a `/`. Con sesión de docente → acceder a `/cuenta/cursos` → funciona correctamente (el docente puede tener también cursos como estudiante en el futuro).

6. **Aislamiento entre docentes**: dos cuentas teacher distintas → cada una crea un curso → verificar que cada docente solo ve sus propios cursos en el listado y no puede acceder al detalle del otro.
