# spec-062 — [NOT STARTED] Nombres y apellidos separados, orden por apellido en el panel docente
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Nace como la "Parte B" de spec-059 (ponderación de notas). Por decisión del
usuario (2026-10-20) se extrae a un spec propio que **se despliega primero y
por separado**. spec-059 depende de él de forma blanda: si spec-062 ya está
desplegado, la planilla de notas ordena por apellido; si no, ordena por
`full_name`.

Necesidad del usuario: subir las notas a la plataforma institucional, que
lista a los estudiantes **por apellido**, y ver en **todas** las listas del
panel docente a los estudiantes ordenados por apellido y mostrados como
"Apellidos, Nombres".

Causa exacta en el código:

- El perfil solo tiene `profiles.full_name`
  (`supabase/migrations/20260623000000_init_profiles_students_roles.sql:7`),
  un campo libre que escribe el propio estudiante al registrarse
  (`components/auth/SignUpForm.tsx:12-13`, `lib/auth/schemas.ts:11`) y que
  `handle_new_user`
  (`20260729000003_fix_handle_new_user_conflict_handling.sql`) copia de
  `raw_user_meta_data->>'full_name'` (con el correo como respaldo). No hay
  forma confiable de saber dónde empieza el apellido.
- Las listas del panel docente ordenan por fecha de matrícula o no ordenan
  (inventario en D8): `lib/grades/index.ts:158` y
  `lib/attendance/index.ts:464` usan `.order("enrolled_at")`;
  `lib/enrollments/index.ts` (`getEnrollmentsByAcademicCourse`) también;
  `lib/students/service.ts:131` ordena por `full_name` (es decir, por el
  primer nombre); `lib/attendance/service.ts:287` ordena el resumen de
  asistencia con `localeCompare` sobre `full_name`.
- Hallazgo lateral: `getAllocations` (`lib/assignments/index.ts:592-600`)
  embebe `student:students(full_name)`, pero `enrollments.student_id`
  referencia `auth.users` (`20260625000001_init_enrollments.sql:3`), no
  `students`, y `students` no tiene `full_name`. Inferido del código, sin
  reproducir: el embed no tiene relación que resolver, así que la lista de
  asignación de variantes (`VariantAllocationTable`) falla o muestra
  "Desconocido". Como este spec reescribe la lectura de nombres de todas las
  listas, la corrige de paso (D12).

## Alcance

### Incluye

- `profiles.first_name`, `profiles.last_name` y `profiles.name_needs_review`;
  `full_name` se mantiene como columna **derivada** por trigger (D2).
- Migración de los perfiles existentes con una **propuesta automática** de
  separación desde `full_name`, marcada "por revisar" (D3).
- Registro y `/cuenta` con campos "Nombres" y "Apellidos"; `handle_new_user`
  los toma de los metadatos (D4).
- Edición inline de spec-057 (`StudentNameCell`) extendida a dos campos, con
  insignia "Revisar" y confirmación de la propuesta (D5).
- **Todas** las listas de estudiantes del panel docente ordenadas por
  apellido y mostradas como "Apellidos, Nombres" (D6–D8, inventario).
- API de estudiantes y `students-mcp` con `first_name` / `last_name` (D10).
- API de asistencia y `attendance-mcp`: campos `first_name` / `last_name`
  añadidos y resumen ordenado por apellido (D11).
- Corrección de la lectura de nombres de la asignación de variantes (D12).

### No incluye

- Ponderación de notas, cortes, formato institucional: es spec-059.
- Vistas del estudiante: no muestran listas de otros estudiantes; el
  estudiante solo ve su propio nombre (navbar, `/cuenta`), que sigue en orden
  natural ("Nombres Apellidos").
- Sincronizar `auth.users.user_metadata` al editar nombres (mismo criterio que
  spec-057 D6), salvo en el alta.
- Editar nombres de estudiantes retirados (spec-057 D4 se mantiene).
- Campos adicionales de identidad (documento, segundo nombre por separado).
- Corregir `assignment-mcp` `get_variant_allocations`: su ruta
  (`lib/assignments/service.ts:495-530`) no devuelve nombres; no cambia.

## Impacto en el sistema

### Base de datos (Supabase)

| Objeto | Cambio | Migración propuesta |
|--------|--------|---------------------|
| `profiles.first_name`, `last_name`, `name_needs_review` | Columnas nuevas; función `propose_name_split(text)`; trigger `sync_profile_names` (deriva `full_name`); backfill; índice `(last_name, first_name)`. | `20261020000000_add_name_parts_to_profiles.sql` |
| `handle_new_user()` | `create or replace`: inserta `first_name`/`last_name` desde los metadatos; conserva `on conflict do nothing` por sentencia. | `20261020000001_handle_new_user_name_parts.sql` |
| RPC `get_student_profiles_public(uuid[])` | `drop` + `create`: devuelve además `first_name`, `last_name` (cambia el tipo de retorno). | `20261020000002_student_profiles_public_name_parts.sql` |

Sin cambios en las políticas de `profiles`: el estudiante ya puede actualizar
su propio perfil (`"profiles: update own"`) y el docente escribe vía
`service_role` bajo el gate de spec-057 D1/D3.

### Capa de datos (`lib/`)

| Archivo | Cambio |
|---------|--------|
| `lib/students/names.ts` | **Nuevo**, puro (importable desde cliente): `formatStudentListName({first_name, last_name, full_name})` y `compareStudentsBySurname(a, b)` (D6, D7). |
| `lib/students/types.ts` | `Profile`, `AdminStudentSummary`, `AdminStudentDetail`, `CreateStudentInput`, `UpdateStudentInput`: `first_name`, `last_name`, `name_needs_review`. |
| `lib/students/schemas.ts` | `CreateStudentSchema` / `UpdateStudentSchema` con partes (D10); `EditStudentNameSchema` (spec-057 D8) pasa a `{ first_name, last_name }`. |
| `lib/students/service.ts` | `:38` bootstrap con partes; `:130-131` lista ordenada por `last_name, first_name` + filtro `name_review_pending`; `:179-196` detalle con partes; `:244` alta con partes en `user_metadata`; `:324-328` update con partes y `name_needs_review = false`. |
| `lib/students/actions.ts` | `updateAccountAction` (`:72-105`) escribe partes; `updateStudentNameAction` (`:153-173`) recibe `{ first_name, last_name }`. |
| `lib/students/index.ts` | `updateProfile` (`:37-39`) y el insert de `:73` con partes. |
| `lib/auth/schemas.ts` | `SignUpSchema` (`:9-12`) y `UpdateProfileSchema` (`:45-46`): `first_name`, `last_name`. |
| `lib/auth/actions.ts` | `:79` lee partes; `:132` `options.data` con partes y `full_name` derivado; `:159` bootstrap con partes. |
| `lib/enrollments/index.ts` | `fetchStudentProfilesPublic` devuelve partes; `getEnrollmentsByAcademicCourse` ordena con `compareStudentsBySurname`. |
| `lib/grades/index.ts` | `getGradesByCourse` (`:143-188`): `CourseGradesRow` + `student_first_name`, `student_last_name`; filas ordenadas por apellido (hoy `:158` por `enrolled_at`). |
| `lib/grades/types.ts` | `CourseGradesRow` + partes. |
| `lib/attendance/index.ts` | Planilla (`:464`, `:570`): partes en `AttendanceSheetRow`, filas ordenadas por apellido. |
| `lib/attendance/types.ts` | `AttendanceSheetRow` (`:50`) + partes. |
| `lib/attendance/service.ts` | `:144` y `:242` seleccionan partes; respuestas con `first_name`/`last_name` (aditivo); `:287` resumen ordenado por apellido (D11). |
| `lib/submissions/index.ts`, `lib/submissions/types.ts` | `:558`, `:607-635`: partes en filas de envíos; lista ordenada por apellido y luego `started_at` desc (D8). |
| `lib/assignments/index.ts` | `getAllocations` (`:592-600`): nombres vía `fetchStudentProfilesPublic`, filas ordenadas por apellido (D12). |
| `scripts/seed-dev-data.mjs` | Estudiantes sembrados con partes (`'Estudiante Dev'` + `'Uno'`/`'Dos'`/`'Tres'`). |

### Panel docente — inventario de listas de estudiantes (D8)

| Lista | Componente (archivo:línea del nombre) | Origen de datos | Orden hoy | Cambio |
|-------|---------------------------------------|-----------------|-----------|--------|
| Matriculados — Activos | `components/admin/EnrollmentTable.tsx:81` (vía `StudentNameCell`) | `getEnrollmentsByAcademicCourse` | `enrolled_at` | Apellido; "Apellidos, Nombres"; edición en dos campos (D5) |
| Matriculados — Retirados | `components/admin/EnrollmentTable.tsx:148` | idem | `enrolled_at` | Apellido; "Apellidos, Nombres" |
| Planilla de notas | `components/admin/GradesTable.tsx:86` | `getGradesByCourse` (`lib/grades/index.ts:181`) | `enrolled_at` | Apellido; "Apellidos, Nombres" |
| Planilla de asistencia | `components/admin/AttendanceSheet.tsx:257` (en `asistencia/page.tsx` vía `AdminAttendancePanel`) | `lib/attendance/index.ts:570` | `enrolled_at` | Apellido; "Apellidos, Nombres" |
| Envíos de una evaluación | `components/admin/SubmissionList.tsx:73` | `lib/submissions/index.ts:558` | `started_at` desc | Apellido, luego `started_at` desc; "Apellidos, Nombres" |
| Asignación de variantes | `components/admin/VariantAllocationTable.tsx:132` | `getAllocations` (`lib/assignments/index.ts:592-608`) | sin orden | Apellido; "Apellidos, Nombres"; corrige la lectura (D12) |

Menciones de **un solo** estudiante (no son listas) que siguen en orden
natural con `full_name` (D6): `SubmissionReviewPanel.tsx:288`,
`assignments/[groupId]/review/[submissionId]/page.tsx:38`,
`ResetPasswordButton.tsx:108,147`, y las etiquetas `aria-label` de
`AttendanceCell.tsx:35` y `GradeInputCell.tsx:85`.

### Registro y `/cuenta`

| Archivo | Cambio |
|---------|--------|
| `components/auth/SignUpForm.tsx` | `:12-13` → "Nombres" y "Apellidos". |
| `components/account/AccountForm.tsx` | `:59-83` → "Nombres" y "Apellidos". |
| `components/admin/StudentNameCell.tsx` | Dos campos, insignia "Revisar", confirmación (D5). |

### Consumidores de `full_name` que **no cambian**

Leen la columna derivada: `components/navbar/Navbar.tsx`,
`components/navbar/UserMenu.tsx`, `lib/questions/index.ts` (autor), los RPC
`get_academic_courses_public` (`teacher_name`), las políticas de
`20260715000003_profiles_visible_for_published_authors.sql` y los scripts
`scripts/diagnostico-*`.

### API y MCP

| Archivo | Cambio |
|---------|--------|
| `app/api/students/route.ts`, `app/api/students/[studentId]/route.ts` | Sin cambios de transporte; heredan esquemas y servicio. |
| `app/api/attendance/**` | Sin cambios de transporte; heredan `lib/attendance/service.ts`. |
| `mcp-servers/students-mcp/src/tools.ts` | `create_student` (`:47-76`), `update_student` (`:78-97`), `list_students` (`:5-33`), `get_student` (`:34-45`). |
| `mcp-servers/attendance-mcp/src/tools.ts` | Descripciones de `get_session_attendance` (`:44-46`) y `get_course_attendance_summary` (`:59`). |
| `docs/mcps/students-agent.system-prompt.md`, `docs/mcps/attendance-agent.system-prompt.md`, `docs/mcps/README.md` | Fase 5. |

## Decisiones de diseño

### D1 — Partes del nombre en `profiles`

`first_name text not null default ''`, `last_name text not null default ''`,
`name_needs_review boolean not null default false` en `profiles`, donde ya
vive `full_name` y desde donde lo leen todos los consumidores. Aplica también
a docentes (inocuo).

### D2 — `full_name` se mantiene como columna almacenada y derivada por trigger

Se descarta `generated always as (…) stored`: una columna generada **rechaza
escrituras**, y hoy escriben `full_name` al menos `handle_new_user`,
`lib/students/service.ts:38/328`, `lib/students/index.ts:39/73`,
`lib/students/actions.ts:99` y `lib/auth/actions.ts`. Además, las migraciones
se aplican **antes** de desplegar el código: en esa ventana el código viejo
seguiría escribiendo `full_name` y fallaría.

Trigger `sync_profile_names` (`before insert or update` en `profiles`):

- si se escribieron `first_name`/`last_name`, recalcula
  `full_name = "first_name last_name"`;
- si solo cambió `full_name` (escritor anterior a este spec o `PATCH` legado),
  propone la separación con `propose_name_split` y marca
  `name_needs_review = true`;
- en un insert sin partes, igual que el caso anterior.

Todos los escritores del repo pasan a escribir partes; `full_name` queda como
columna de solo lectura de hecho, conservada por compatibilidad.

### D3 — Backfill con propuesta automática, revisable (heurística confirmada)

`propose_name_split(text)` (SQL, `immutable`) es la **única** implementación
de la heurística (la usan backfill y trigger):

1. Normaliza espacios. Vacío → `('', '')`. Si contiene `@` (nombre que quedó
   como correo por el `coalesce` de `handle_new_user`) → `(texto, '')`.
2. Une partículas al token siguiente (`de`, `del`, `la`, `las`, `los`, `y`,
   `san`, `da`, `van`, `von`): "Juan de la Cruz" → `Juan` | `de la Cruz`.
3. 1 token → `(t1, '')`; 2 → `(t1, t2)`; **3 → 1 nombre + 2 apellidos**
   (confirmado por el usuario: "Santiago | Suárez Cortés"); 4 o más → los dos
   últimos son apellidos, el resto nombres.

El backfill marca `name_needs_review = true` en todo lo propuesto: ninguna
heurística acierta siempre ("Juan Carlos Pérez" sale `Juan` | `Carlos
Pérez`). El docente corrige con D5; el estudiante, desde `/cuenta`.

### D4 — Registro y `/cuenta` con campos separados

- `SignUpForm`: "Nombres" y "Apellidos", obligatorios, `trim`, 2–60
  caracteres cada uno. `SignUpSchema` reemplaza `full_name`.
- `signUp` envía en `options.data` `first_name`, `last_name` y `full_name`
  derivado (para que `auth.users` siga mostrando un nombre en el dashboard).
- `handle_new_user` inserta las partes desde `raw_user_meta_data`; si faltan
  (altas por otros caminos), el trigger de D2 propone la separación. Se
  conservan los `on conflict do nothing` por sentencia de `20260729000003`.
- `/cuenta` (`AccountForm`, `updateAccountAction`): dos campos; al guardar,
  `name_needs_review = false`.

### D5 — Revisión de nombres: se extiende spec-057, no se crea otra UI

`StudentNameCell` (Activos de `EnrollmentTable`) pasa de un `<input>` a dos
("Nombres", "Apellidos"), conservando spec-057 D5/D6 (click-to-edit, Enter
guarda, Escape cancela, blur no guarda, sin optimistic update, error con
`role="alert"`). Cambios:

- En lectura muestra "Apellidos, Nombres" (D6) y la insignia "Revisar" si
  `name_needs_review`.
- ✓ habilitado también **sin cambios** cuando la fila está por revisar: es el
  gesto de "la propuesta es correcta" y limpia la marca.
- `updateStudentNameAction(studentId, academicCourseId, { first_name,
  last_name })` mantiene el gate `assertTeacherOwnsEnrolledStudent` (spec-057
  D3/D7) y llama a `updateServiceStudent` con `name_needs_review = false`.
- Aviso sobre la tabla: "N estudiantes con nombres por revisar" (solo
  activos).
- Retirados sin edición (spec-057 D4).

### D6 — Formato visible: "Apellidos, Nombres" en listas, orden natural en menciones sueltas

`formatStudentListName` (en `lib/students/names.ts`):

- `last_name` y `first_name` presentes → `"Álvarez Gómez, Ana María"`.
- Sin `last_name` → solo `first_name`, sin coma.
- Sin ninguna parte (perfil anterior al backfill o fallo) → `full_name`.

Se usa en **listas** (inventario de D8). Las menciones de un solo estudiante
en prosa ("¿Restablecer la contraseña de Ana Álvarez?") y los `aria-label`
siguen con `full_name`, porque "Apellidos, Nombres" solo ayuda a recorrer una
lista y suena forzado en una frase o en un lector de pantalla.

### D7 — Un único criterio de orden, en TypeScript

`compareStudentsBySurname(a, b)`: `last_name`, luego `first_name`, con
`localeCompare(…, "es", { sensitivity: "base" })`, para que "Álvarez" quede
junto a "Alvarado" y no después de "Zapata". Vacíos al final. Se aplica en
cada cargador de lista (D8) en lugar de `order by` en SQL, porque la
colación de la base no es necesariamente española y casi todas estas listas
se arman en memoria de todos modos.

Excepción: `lib/students/service.ts` (`list_students`) pagina en la base
(`limit`/`offset`), así que ahí el orden es `order by last_name, first_name`
en SQL, con la colación de la instancia. Puede diferir del orden de la UI en
casos de tildes; se documenta en la descripción del tool.

### D8 — Inventario de listas del panel docente

Ver la tabla "Panel docente — inventario de listas" en "Impacto". Las seis
listas pasan a orden por apellido y formato de D6. La lista de envíos ordena
por apellido y, dentro del mismo estudiante, por `started_at` descendente
(conserva el intento más reciente arriba).

### D9 — RPC de perfiles públicos ampliado

`get_student_profiles_public` (`20260709000002_student_profiles_public_lookup.sql`)
es la vía por la que el docente lee nombres de sus estudiantes (la RLS de
`profiles` no se lo permite directamente). Se reemplaza para devolver además
`first_name` y `last_name`. Cambiar el tipo de retorno exige `drop` +
`create`; los llamadores actuales ignoran columnas extra.

### D10 — Contrato de la API de estudiantes

`CreateStudentSchema` exige `first_name` + `last_name`, **o** `full_name`
(compatibilidad: se separa automáticamente y queda `name_needs_review`).
`UpdateStudentSchema` acepta `first_name`, `last_name` y, por compatibilidad,
`full_name` (mismo tratamiento). Lista y detalle devuelven `first_name`,
`last_name`, `name_needs_review`; la lista se ordena por apellido y acepta
`name_review_pending=true`.

### D11 — API de asistencia: campos aditivos, resumen por apellido

`lib/attendance/service.ts` (consumido por `/api/attendance/*` y
`attendance-mcp`):

- Ambas respuestas agregan `first_name` y `last_name` junto a `student_name`
  (que se conserva: cambio aditivo, no rompe al agente).
- `get_course_attendance_summary` (`:287`): ordena por apellido con
  `compareStudentsBySurname` (hoy ordena por `full_name`).
- `get_session_attendance` (`:130-160`): **conserva** el orden por
  `marked_at`, porque ese roster responde "quién marcó y a qué hora" y el
  orden de llegada es el dato. El agente puede reordenar si el docente lo
  pide.

### D12 — Asignación de variantes: lectura de nombres corregida

`getAllocations` (`lib/assignments/index.ts:592-600`) deja el embed
`student:students(full_name)` (sin relación posible, ver "Contexto") y
resuelve nombres con `fetchStudentProfilesPublic`, como el resto de listas.
Antes de implementar, confirmar en `nodo-dev` el síntoma actual (error o
"Desconocido") y anotarlo en el test.

### D13 — Timestamps anteriores a los de spec-059

spec-062 se despliega **antes** que spec-059. Si sus migraciones tuvieran
timestamps posteriores a las de spec-059 aún no aplicadas, el siguiente
`db push` de spec-059 encontraría migraciones "en el pasado" y exigiría
`--include-all`. Por eso spec-062 usa `20261020000000`–`…0002` y spec-059 se
mueve a `20261021000000` en adelante.

## Evaluación MCP

**¿Aplica MCP?** Sí — dos MCPs existentes se modifican; ninguno nuevo.

- **`students-mcp`** (`mcp-servers/students-mcp/src/tools.ts`). Sin tools
  nuevas; cambian esquemas y descripciones:
  - `create_student`: `first_name` y `last_name` en `properties` y `required`
    (en lugar de `full_name`).
  - `update_student`: `first_name`, `last_name` opcionales; se retira
    `full_name` del esquema del tool (la API lo sigue aceptando, D10).
  - `list_students`: descripción con el orden por apellido (y su matiz de
    colación, D7); parámetro opcional nuevo `name_review_pending` (boolean).
  - `get_student`: descripción documenta `first_name`, `last_name`,
    `name_needs_review`.
  - `src/api.ts`: verificar que reenvía el query param nuevo.
- **`attendance-mcp`** (`mcp-servers/attendance-mcp/src/tools.ts`). Devuelve
  nombres (`get_session_attendance`: "roster … con nombres de estudiantes",
  `:46`; `get_course_attendance_summary`). Es un cliente que reenvía el JSON
  de la API, así que solo cambian las **descripciones**: documentar
  `first_name`/`last_name` y el orden de cada respuesta (D11).
  `docs/mcps/attendance-agent.system-prompt.md` hoy no menciona orden ni
  formato de nombres (verificado con `grep`); se añade una línea: al listar
  estudiantes al docente, usar "Apellidos, Nombres" y orden por apellido.
- **System prompts afectados:** `docs/mcps/students-agent.system-prompt.md`
  ("MCP(s) disponibles", "Capacidades", "Restricciones": usar siempre nombres
  y apellidos por separado; no inventar la separación — si el docente da un
  nombre completo ambiguo, preguntar) y
  `docs/mcps/attendance-agent.system-prompt.md`.
- **Índice:** `docs/mcps/README.md` (filas de `students-mcp` y
  `attendance-mcp`).
- **`assignment-mcp`**: no aplica; `get_variant_allocations` usa
  `lib/assignments/service.ts:495-530`, que no devuelve nombres.
- **Fase de MCP:** Fase 5 (antes de la Fase 6 de pruebas).

## DDL propuesto (diseño — **no aplicar en esta fase**)

### `20261020000000_add_name_parts_to_profiles.sql`

```sql
alter table public.profiles
  add column first_name        text    not null default '',
  add column last_name         text    not null default '',
  add column name_needs_review boolean not null default false;

create index on public.profiles (last_name, first_name);

-- spec-062 D3: única implementación de la heurística de separación.
create or replace function public.propose_name_split(p_full_name text)
returns table (first_name text, last_name text)
language plpgsql
immutable
set search_path = public
as $$
declare
  v_norm   text := btrim(regexp_replace(coalesce(p_full_name, ''), '\s+', ' ', 'g'));
  v_tokens text[] := '{}';
  v_buf    text := '';
  v_tok    text;
  n        int;
begin
  if v_norm = '' then
    return query select ''::text, ''::text;
    return;
  end if;

  if position('@' in v_norm) > 0 then
    return query select v_norm, ''::text;
    return;
  end if;

  foreach v_tok in array string_to_array(v_norm, ' ') loop
    if lower(v_tok) in ('de', 'del', 'la', 'las', 'los', 'y', 'san', 'da', 'van', 'von') then
      v_buf := v_buf || v_tok || ' ';
    else
      v_tokens := v_tokens || (v_buf || v_tok);
      v_buf := '';
    end if;
  end loop;
  if v_buf <> '' then
    v_tokens := v_tokens || btrim(v_buf);
  end if;

  n := coalesce(array_length(v_tokens, 1), 0);

  if n = 1 then
    return query select v_tokens[1], ''::text;
  elsif n = 2 then
    return query select v_tokens[1], v_tokens[2];
  elsif n = 3 then
    return query select v_tokens[1], v_tokens[2] || ' ' || v_tokens[3];
  else
    return query select array_to_string(v_tokens[1:n - 2], ' '),
                        v_tokens[n - 1] || ' ' || v_tokens[n];
  end if;
end;
$$;

-- spec-062 D2: full_name derivado; escritores legados re-proponen partes.
create or replace function public.sync_profile_names()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_first text;
  v_last  text;
  v_parts_written boolean;
begin
  if tg_op = 'INSERT' then
    v_parts_written := btrim(new.first_name) <> '' or btrim(new.last_name) <> '';
  else
    v_parts_written := new.first_name is distinct from old.first_name
                    or new.last_name  is distinct from old.last_name;
  end if;

  if not v_parts_written
     and btrim(coalesce(new.full_name, '')) <> ''
     and (tg_op = 'INSERT' or new.full_name is distinct from old.full_name) then
    select s.first_name, s.last_name into v_first, v_last
    from public.propose_name_split(new.full_name) s;
    new.first_name := v_first;
    new.last_name := v_last;
    new.name_needs_review := true;
  end if;

  new.first_name := btrim(new.first_name);
  new.last_name := btrim(new.last_name);

  if new.first_name <> '' or new.last_name <> '' then
    new.full_name := btrim(concat_ws(' ', nullif(new.first_name, ''), nullif(new.last_name, '')));
  end if;

  return new;
end;
$$;

create trigger sync_profile_names
  before insert or update on public.profiles
  for each row execute function public.sync_profile_names();

-- Backfill (D3): todo lo automático queda por revisar.
update public.profiles p
set (first_name, last_name) = (
      select s.first_name, s.last_name from public.propose_name_split(p.full_name) s
    ),
    name_needs_review = true
where btrim(p.full_name) <> ''
  and p.first_name = ''
  and p.last_name = '';
```

> El backfill dispara `sync_profile_names` (partes escritas → recalcula
> `full_name`), lo que normaliza espacios dobles del `full_name` original. Es
> intencional.

### `20261020000001_handle_new_user_name_parts.sql`

```sql
-- spec-062 D4: parte de 20260729000003 (on conflict por sentencia, sin
-- bloque exception). Solo cambia el insert en profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    -- Si faltan las partes, sync_profile_names propone la separación desde aquí.
    coalesce(new.raw_user_meta_data->>'full_name', new.email, '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id, role) do nothing;

  insert into public.students (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;
```

### `20261020000002_student_profiles_public_name_parts.sql`

```sql
-- spec-062 D9: cambia el tipo de retorno → drop + create.
drop function if exists public.get_student_profiles_public(uuid[]);

create function public.get_student_profiles_public(p_ids uuid[])
returns table (id uuid, full_name text, first_name text, last_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.first_name, p.last_name
  from public.profiles p
  where p.id = any(p_ids);
$$;

grant execute on function public.get_student_profiles_public(uuid[]) to authenticated;
```

## Fases de implementación

### Fase 1 — Esquema
- [ ] Crear las tres migraciones del "DDL propuesto".
- [ ] **Antes de producción**, correr la heurística en modo lectura sobre los
      perfiles reales (`select p.full_name, s.* from profiles p,
      propose_name_split(p.full_name) s`, tras crear solo la función en una
      sesión de prueba o con una copia local) y mostrar la muestra al usuario.
- [ ] `supabase db push --db-url "$DEV_DB_URL" --dry-run`, mostrar la salida y,
      con visto bueno, aplicar en `nodo-dev` (**nunca** `--linked`).
- [ ] Verificar en `nodo-dev`: backfill (perfiles sembrados con
      `name_needs_review = true`); trigger (escritura legada de `full_name`
      re-propone; escritura de partes recalcula `full_name`); alta de usuario
      con y sin partes en los metadatos; RPC ampliado.

### Fase 2 — Registro, `/cuenta` y servicio de estudiantes
- [ ] `lib/auth/schemas.ts`, `lib/auth/actions.ts`, `SignUpForm.tsx` (D4).
- [ ] `lib/students/types.ts`, `schemas.ts`, `service.ts`, `index.ts`,
      `actions.ts` (`updateAccountAction`) y `AccountForm.tsx`.
- [ ] Contrato de API (D10); `fetchStudentProfilesPublic` con partes.
- [ ] `scripts/seed-dev-data.mjs` con partes.
- [ ] `grep -rn "full_name:" lib app components` solo muestra lecturas o el
      `full_name` derivado de `options.data`.

### Fase 3 — Formato y orden en las listas del panel docente
- [ ] `lib/students/names.ts` (D6, D7).
- [ ] Aplicar a las seis listas del inventario (D8): cargadores en
      `lib/enrollments`, `lib/grades`, `lib/attendance` (incluido
      `service.ts`, D11), `lib/submissions`, `lib/assignments` (D12), y sus
      componentes.
- [ ] Leer `DESIGN.md`; sin cambios de estilo salvo la insignia "Revisar".

### Fase 4 — Edición de nombres (extensión de spec-057)
- [ ] `StudentNameCell` con dos campos, insignia y confirmación (D5);
      `updateStudentNameAction` con `{ first_name, last_name }`.
- [ ] Aviso "N estudiantes con nombres por revisar" en `EnrollmentTable`.

### Fase 5 — MCP: actualizar `students-mcp` y `attendance-mcp`
> Según `.claude/agents/mcp-builder.md` (modo construcción/actualización).
- [ ] `students-mcp/src/tools.ts`: `create_student`, `update_student`,
      `list_students` (`name_review_pending`), `get_student`; `api.ts`.
- [ ] `attendance-mcp/src/tools.ts`: descripciones de las dos tools (D11).
- [ ] `npm run build` de ambos MCPs.
- [ ] `docs/mcps/README.md` (dos filas), `students-agent.system-prompt.md` y
      `attendance-agent.system-prompt.md`.
- [ ] Verificar con `./mcp-servers/run-local-mcp.sh <mcp>` (con `npm run dev`
      arriba) que las tools responden con las partes y el orden esperado.

### Fase 6 — Pruebas
- [ ] Ejecutar con el usuario `docs/testing/test-062-nombres-y-apellidos-separados.md`.
- [ ] Cuando exista framework, implementar los casos de "Pruebas asociadas".

### Fase 7 — Despliegue (solo con confirmación explícita del usuario)
- [ ] Desplegar **antes** que spec-059 (D13).
- [ ] `git diff --stat origin/main..HEAD -- supabase/` lista solo las tres
      migraciones de este spec.
- [ ] `supabase db push --linked --dry-run` (**obligatorio**), mostrar la
      salida y aplicar solo si lista exactamente esas tres.
- [ ] Verificar por REST que existe `profiles.first_name` (`42703` = no
      aplicada).
- [ ] Registrar una cuenta de prueba en producción solo con confirmación
      explícita del usuario (CLAUDE.md: no crear datos de prueba en
      producción sin confirmación) y borrarla; alternativa: verificar con el
      primer registro real.
- [ ] Avisar al docente de que todos los perfiles quedan "por revisar".

## Criterios de aceptación

1. Tras la migración, cada perfil tiene nombres y apellidos propuestos y
   marcados "por revisar"; el nombre visible no cambia salvo normalización de
   espacios.
2. Con 3 palabras la propuesta es 1 nombre + 2 apellidos.
3. El registro pide "Nombres" y "Apellidos" por separado y el perfil queda
   con ambas partes, sin marca de revisión.
4. El docente corrige o confirma nombres y apellidos desde la lista de
   matriculados; la marca "Revisar" desaparece al guardar o confirmar.
5. El estudiante edita sus nombres y apellidos en `/cuenta`.
6. Un escritor que solo envía `full_name` no rompe: se proponen las partes y
   se marca la revisión.
7. Las seis listas del inventario muestran "Apellidos, Nombres" y están
   ordenadas por apellido, con las tildes ordenadas junto a su letra base.
8. Un estudiante sin apellido se muestra solo con su nombre, sin coma.
9. Las menciones sueltas (diálogos, revisión de un envío, `aria-label`)
   siguen en orden natural.
10. La lista de asignación de variantes muestra los nombres de los
    estudiantes (hoy no los resuelve).
11. El agente de `students-mcp` crea y actualiza estudiantes con
    `first_name`/`last_name`, los recibe en `get_student`/`list_students`
    (ordenada por apellido) y puede listar solo los nombres por revisar.
12. `attendance-mcp` devuelve `first_name`/`last_name` en ambas tools y el
    resumen de asistencia viene ordenado por apellido.

## Pruebas asociadas
> Estos archivos se crean junto con el spec.

- **Manuales:** `docs/testing/test-062-nombres-y-apellidos-separados.md` —
  `TC-062-01` a `TC-062-12` y `TC-MCP-062-01` a `TC-MCP-062-06`.
- **Automáticas:** `{{ubicación e2e por definir}}/e2e-062-nombres-y-apellidos-separados.spec.ts`
  — cuando exista framework. Casos, en rojo desde el inicio:
  - **Unitarias de `lib/students/names.ts` (criterios 7, 8):** formato con
    ambas partes, sin apellido, sin partes (cae a `full_name`); orden
    `Alvarado < Álvarez < Bernal < Zapata` (la tilde no manda al final);
    vacíos al final; empate de apellido resuelto por nombre.
  - **Base de datos (criterios 1, 2, 3, 6):** `propose_name_split` con `''`,
    `'ana'`, `'Ana Gómez'`, `'Santiago Suárez Cortés'`,
    `'Juan Carlos Pérez Gómez'`, `'Juan de la Cruz'`, `'correo@x.com'`,
    espacios dobles; `sync_profile_names` (partes → recalcula `full_name` sin
    tocar la marca; solo `full_name` → re-propone y marca; insert sin partes →
    propone); `handle_new_user` con y sin partes; RPC ampliado.
  - **Integración (criterios 7, 10, 12):** cada cargador del inventario
    devuelve filas ordenadas; `getAllocations` resuelve nombres; respuestas de
    `/api/attendance/*` con partes y resumen ordenado.
  - **e2e (criterios 3, 4, 7):** flujos de `TC-062-02`, `-03`, `-05`.

## Preguntas abiertas para el usuario

- **P1 — Roster de una sesión de asistencia vía MCP.** `get_session_attendance`
  conserva el orden de llegada (`marked_at`, D11). ¿Lo quieres también por
  apellido?
- **P2 — Lista de envíos.** Propongo ordenar por apellido y, dentro del mismo
  estudiante, por intento más reciente (D8), en vez del orden cronológico
  actual. ¿Te sirve, o prefieres conservar el cronológico ahí?

## Riesgos

- **`handle_new_user`** es una ruta crítica con incidentes previos (spec-027):
  un error ahí rompe el registro. Mitigación: despliegue aislado y prueba de
  registro real (Fase 7).
- **Ventana de despliegue**: entre la migración y el código, el registro
  antiguo envía solo `full_name`; el trigger lo absorbe (D2), pero esas altas
  quedan "por revisar".
- **Revisión masiva**: tras el backfill, todos los perfiles de producción
  quedan "por revisar". El aviso de D5 es por curso; el docente los confirma
  de a uno (un ✓ por fila).
- **Colación de la base** en `list_students` (D7).
- **`getAllocations` (D12)**: la causa del fallo actual está inferida del
  código; confirmar en `nodo-dev` antes de corregir.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
