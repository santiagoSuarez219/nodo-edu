# Supabase — Base de datos

Proyecto: `academy-page` (`bgiimadnmqnoqmdbudpo`)

## Migraciones

Las migraciones están versionadas en `supabase/migrations/` y se aplican en orden cronológico.

| Archivo | Contenido |
|---|---|
| `20260623000000_init_profiles_students_roles.sql` | Enum `app_role`, tablas `profiles`, `students`, `user_roles` |
| `20260623000001_init_lesson_progress.sql` | Tabla `lesson_progress` |
| `20260623000002_rls_policies.sql` | RLS en todas las tablas, función `has_role` |
| `20260623000003_triggers_and_functions.sql` | Trigger `on_auth_user_created`, función `handle_new_user` |
| `20260625000000_init_academic_courses.sql` | Tabla `academic_courses`, función `set_updated_at`, trigger de `updated_at` |
| `20260625000001_init_enrollments.sql` | Tabla `enrollments` |
| `20260625000002_init_grade_items.sql` | Tabla `grade_items` |
| `20260625000003_init_student_grades.sql` | Tabla `student_grades`, trigger de `updated_at` |
| `20260625000004_rls_academic.sql` | RLS en `academic_courses`, `enrollments`, `grade_items`, `student_grades` |
| `20260709000000_fix_enrollment_code_lookup.sql` | Función `find_course_by_enrollment_code` (security definer) para que el estudiante valide un código de matrícula pese al RLS restrictivo de `academic_courses` |
| `20260709000001_academic_courses_public_lookup.sql` | Función `get_academic_courses_public` (security definer) que resuelve datos del curso + nombre del docente para el estudiante, sin exponer `enrollment_code` |
| `20260709000002_student_profiles_public_lookup.sql` | Función `get_student_profiles_public` (security definer) para que el docente vea el nombre de sus estudiantes matriculados pese al RLS restrictivo de `profiles` |

## Comandos

```bash
# Aplicar migraciones pendientes al proyecto cloud
supabase db push

# Ver el estado de las migraciones
supabase migration list

# Crear una nueva migración vacía
supabase migration new <nombre>
```

## Rol admin

La asignación del rol `admin` se hace manualmente una vez creada la cuenta del docente principal. Ejecutar en el **SQL Editor** del dashboard:

```sql
insert into public.user_roles (user_id, role)
values ('<uuid-del-usuario>', 'admin');
```

El UUID se obtiene desde **Authentication → Users** en el dashboard de Supabase.

## Dependencias entre specs

| Spec | Migraciones que añade |
|---|---|
| spec-002 | `20260623000000` → `20260623000003` |
| spec-003 | `20260625000000` → `20260625000004` (requiere spec-002); fixes `20260709000000`, `20260709000001`, `20260709000002` |
