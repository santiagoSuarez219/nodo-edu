-- spec-051, Fase 7: diagnóstico de cuentas duplicadas (solo lectura).
-- Tres heurísticas, cada una imperfecta por sí sola — se cruzan al final.
-- No modifica ningún dato. Pensado para correr primero en desarrollo
-- (mirp-lab) y, con confirmación explícita del usuario, contra producción.

\echo '=== Heurística A: mismo full_name entre distintas cuentas de estudiante ==='
select p.full_name, count(*) as n_cuentas, array_agg(p.id) as profile_ids
from public.profiles p
join public.user_roles ur on ur.user_id = p.id and ur.role = 'student'
group by p.full_name
having count(*) > 1
order by n_cuentas desc, p.full_name;

\echo ''
\echo '=== Heurística B: mismo correo (parte local, antes de @) entre distintas cuentas ==='
select split_part(u.email, '@', 1) as local_part,
       count(*) as n_cuentas,
       array_agg(u.id) as user_ids,
       array_agg(u.email) as emails
from auth.users u
join public.user_roles ur on ur.user_id = u.id and ur.role = 'student'
group by split_part(u.email, '@', 1)
having count(*) > 1
order by n_cuentas desc, local_part;

\echo ''
\echo '=== Heurística C1: matrícula activa SIN ningún lesson_progress (posible cuenta "nueva" tras un duplicado) ==='
-- Restringido a rol 'student': un docente/admin sin matrícula activa nunca
-- debería aparecer aquí, y no aporta nada al diagnóstico de duplicados.
select p.id as profile_id, p.full_name, u.email, e.academic_course_id, e.enrolled_at
from public.enrollments e
join public.profiles p on p.id = e.student_id
join auth.users u on u.id = e.student_id
join public.user_roles ur on ur.user_id = e.student_id and ur.role = 'student'
where e.status = 'active'
  and not exists (
    select 1 from public.lesson_progress lp where lp.user_id = e.student_id
  )
order by p.full_name;

\echo ''
\echo '=== Heurística C2: progreso registrado SIN ninguna matrícula activa (posible cuenta "vieja" abandonada) ==='
-- Mismo filtro por rol: sin él, cualquier docente/admin que haya navegado
-- lecciones (sin estar nunca matriculado como estudiante) sale como falso
-- positivo -- pasó exactamente eso con dev@nodo.local en la primera corrida.
select p.id as profile_id, p.full_name, u.email,
       count(distinct lp.course_slug || '/' || lp.lesson_slug) as lecciones_con_progreso,
       max(lp.viewed_at) as ultima_actividad
from public.lesson_progress lp
join public.profiles p on p.id = lp.user_id
join auth.users u on u.id = lp.user_id
join public.user_roles ur on ur.user_id = lp.user_id and ur.role = 'student'
where not exists (
  select 1 from public.enrollments e
   where e.student_id = lp.user_id and e.status = 'active'
)
group by p.id, p.full_name, u.email
order by ultima_actividad desc;

\echo ''
\echo '=== Cruce: mismo full_name entre C1 (cuenta nueva sin progreso) y C2 (cuenta vieja con progreso) — el candidato más fuerte a duplicado real ==='
with nuevas as (
  select distinct p.id as profile_id, p.full_name, u.email
  from public.enrollments e
  join public.profiles p on p.id = e.student_id
  join auth.users u on u.id = e.student_id
  where e.status = 'active'
    and not exists (select 1 from public.lesson_progress lp where lp.user_id = e.student_id)
),
viejas as (
  select distinct p.id as profile_id, p.full_name, u.email
  from public.lesson_progress lp
  join public.profiles p on p.id = lp.user_id
  join auth.users u on u.id = lp.user_id
  where not exists (
    select 1 from public.enrollments e where e.student_id = lp.user_id and e.status = 'active'
  )
)
select n.full_name,
       n.profile_id as cuenta_nueva_id, n.email as cuenta_nueva_email,
       v.profile_id as cuenta_vieja_id, v.email as cuenta_vieja_email
from nuevas n
join viejas v on v.full_name = n.full_name and v.profile_id <> n.profile_id
order by n.full_name;
