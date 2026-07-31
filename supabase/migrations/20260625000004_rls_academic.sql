-- ─── academic_courses ────────────────────────────────────────────────────────
alter table public.academic_courses enable row level security;

-- El docente ve solo sus cursos; admin ve todos
create policy "academic_courses: select own or admin"
  on public.academic_courses for select
  using (
    teacher_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo teacher o admin pueden crear cursos; el teacher_id debe ser el propio usuario
create policy "academic_courses: insert teacher or admin"
  on public.academic_courses for insert
  with check (
    teacher_id = auth.uid()
    and (
      public.has_role(auth.uid(), 'teacher')
      or public.has_role(auth.uid(), 'admin')
    )
  );

-- Solo el docente dueño o admin pueden editar
create policy "academic_courses: update own or admin"
  on public.academic_courses for update
  using (
    teacher_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    teacher_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el docente dueño o admin pueden eliminar
create policy "academic_courses: delete own or admin"
  on public.academic_courses for delete
  using (
    teacher_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- ─── enrollments ─────────────────────────────────────────────────────────────
alter table public.enrollments enable row level security;

-- Estudiante ve sus propias matrículas; docente ve las de sus cursos; admin ve todas
create policy "enrollments: select"
  on public.enrollments for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el propio estudiante puede matricularse
create policy "enrollments: insert own student"
  on public.enrollments for insert
  with check (
    student_id = auth.uid()
    and public.has_role(auth.uid(), 'student')
  );

-- Solo el docente dueño del curso puede cambiar el estado (retirar)
create policy "enrollments: update teacher or admin"
  on public.enrollments for update
  using (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- No se permite eliminar matrículas (inmutables para auditoría)

-- ─── grade_items ─────────────────────────────────────────────────────────────
alter table public.grade_items enable row level security;

-- Docente dueño y estudiantes activos del curso pueden leer los ítems
create policy "grade_items: select"
  on public.grade_items for select
  using (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.enrollments e
      where e.academic_course_id = grade_items.academic_course_id
        and e.student_id = auth.uid()
        and e.status = 'active'
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el docente dueño puede gestionar ítems
create policy "grade_items: insert teacher or admin"
  on public.grade_items for insert
  with check (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_items: update teacher or admin"
  on public.grade_items for update
  using (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_items: delete teacher or admin"
  on public.grade_items for delete
  using (
    exists (
      select 1 from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- ─── student_grades ──────────────────────────────────────────────────────────
alter table public.student_grades enable row level security;

-- Estudiante ve sus propias notas; docente ve las notas de sus cursos; admin ve todas
create policy "student_grades: select"
  on public.student_grades for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id
        and e.student_id = auth.uid()
    )
    or exists (
      select 1 from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where e.id = enrollment_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el docente dueño puede insertar notas
create policy "student_grades: insert teacher or admin"
  on public.student_grades for insert
  with check (
    exists (
      select 1 from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where e.id = enrollment_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el docente dueño puede actualizar notas
create policy "student_grades: update teacher or admin"
  on public.student_grades for update
  using (
    exists (
      select 1 from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where e.id = enrollment_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (
      select 1 from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where e.id = enrollment_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el docente dueño puede eliminar notas
create policy "student_grades: delete teacher or admin"
  on public.student_grades for delete
  using (
    exists (
      select 1 from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where e.id = enrollment_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );
