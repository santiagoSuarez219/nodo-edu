-- La policy "profiles: select own or admin" solo deja ver el propio perfil
-- (o todos, si eres admin). Eso rompe el embed author:profiles(full_name)
-- en getQuestionsByTeacher/getQuestionById: cuando un docente sin rol admin
-- ve una pregunta publicada por otro docente, RLS filtra la fila de
-- profiles del autor y el nombre llega como null ("—" en la UI).
--
-- Esta policy expone el perfil de un docente a otros teacher/admin
-- únicamente si ese docente es autor de al menos una pregunta publicada,
-- para no abrir toda la tabla profiles (que también contiene perfiles de
-- estudiantes).
create policy "profiles: select published question authors"
  on public.profiles for select
  using (
    (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin'))
    and exists (
      select 1 from public.questions q
      where q.created_by = profiles.id
        and q.is_published = true
    )
  );
