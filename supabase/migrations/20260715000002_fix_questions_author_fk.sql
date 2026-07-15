-- PostgREST necesita una foreign key directa entre `questions` y `profiles` para
-- resolver el embed `author:profiles(full_name)` usado en getQuestionsByTeacher /
-- getQuestionById. `questions.created_by` solo referencia auth.users(id), por lo
-- que ese embed fallaba con PGRST200 ("no relationship found") y el listado de
-- preguntas quedaba silenciosamente vacío para el docente.
alter table public.questions
  add constraint questions_created_by_profiles_fkey
  foreign key (created_by) references public.profiles(id) on delete restrict;
