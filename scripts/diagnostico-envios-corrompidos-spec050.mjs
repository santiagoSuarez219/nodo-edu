// spec-050, Fase 5: diagnóstico de envíos ya corrompidos por el bug que este
// spec corrige (solo lectura). Equivalente JS de
// scripts/diagnostico-envios-corrompidos-spec050.sql, para correr contra un
// proyecto Supabase al que no se tiene psql directo (producción, gestionada —
// sin acceso a docker exec como en mirp-lab).
//
// No modifica ningún dato. Uso:
//   node --env-file=.env.prod scripts/diagnostico-envios-corrompidos-spec050.mjs

import { createClient } from '@supabase/supabase-js';

const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Mismo criterio que OPEN_QUESTION_TYPES en lib/submissions/index.ts.
const OPEN_QUESTION_TYPES = new Set(['open_text', 'code_snippet', 'code_write', 'coding_challenge']);

async function main() {
  console.log('📋 Diagnóstico de envíos ya corrompidos (spec-050, Fase 5) — solo lectura\n');

  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('id, status, auto_score, final_score, submitted_at, graded_at, enrollment_id, assignment_id')
    .eq('status', 'graded');
  if (submissionsError) throw submissionsError;

  const suspects = submissions.filter(
    (s) => (s.auto_score ?? 0) === 0 || (s.final_score ?? 0) === 0
  );

  console.log(`Envíos graded con auto_score=0 o final_score=0: ${suspects.length} de ${submissions.length} graded en total.\n`);

  if (suspects.length === 0) {
    console.log('✅ Diagnóstico completado. Ningún dato fue modificado.');
    return;
  }

  const suspectIds = suspects.map((s) => s.id);

  const { data: answers, error: answersError } = await supabase
    .from('answers')
    .select('id, submission_id, assignment_question_id, selected_choice_ids, is_correct, manual_score, reviewed_at')
    .in('submission_id', suspectIds);
  if (answersError) throw answersError;

  const { data: assignmentQuestions, error: aqError } = await supabase
    .from('assignment_questions')
    .select('id, question_id');
  if (aqError) throw aqError;
  const questionIdByAssignmentQuestionId = new Map(assignmentQuestions.map((aq) => [aq.id, aq.question_id]));

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, type');
  if (questionsError) throw questionsError;
  const questionTypeById = new Map(questions.map((q) => [q.id, q.type]));

  // --- Marcar respuestas sospechosas (patrones A y B, ver .sql hermano) ---
  const flagsBySubmission = new Map();
  for (const a of answers) {
    const questionId = questionIdByAssignmentQuestionId.get(a.assignment_question_id);
    const type = questionId ? questionTypeById.get(questionId) : undefined;
    if (!type) continue;

    let reason = null;
    if (type === 'multiple_choice') {
      const answered = Array.isArray(a.selected_choice_ids) && a.selected_choice_ids.length > 0;
      if (answered && a.is_correct === null) reason = 'A_multiple_choice_sin_evaluar';
    } else if (OPEN_QUESTION_TYPES.has(type)) {
      if (a.manual_score === null && a.reviewed_at === null) reason = 'B_abierta_sin_calificar';
    }
    if (!reason) continue;

    if (!flagsBySubmission.has(a.submission_id)) {
      flagsBySubmission.set(a.submission_id, { A_multiple_choice_sin_evaluar: 0, B_abierta_sin_calificar: 0 });
    }
    flagsBySubmission.get(a.submission_id)[reason]++;
  }

  const flaggedSubmissionIds = [...flagsBySubmission.keys()];
  if (flaggedSubmissionIds.length === 0) {
    console.log('✅ Ninguno de esos envíos tiene respuestas sin evaluar/calificar. Diagnóstico completado.');
    return;
  }

  // --- Enriquecer con curso, evaluación y estudiante para el reporte ---
  const flaggedSubmissions = suspects.filter((s) => flagsBySubmission.has(s.id));

  const enrollmentIds = [...new Set(flaggedSubmissions.map((s) => s.enrollment_id))];
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('id, student_id, academic_course_id')
    .in('id', enrollmentIds);
  if (enrollmentsError) throw enrollmentsError;
  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  const assignmentIds = [...new Set(flaggedSubmissions.map((s) => s.assignment_id))];
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('id, title, academic_course_id')
    .in('id', assignmentIds);
  if (assignmentsError) throw assignmentsError;
  const assignmentById = new Map(assignments.map((a) => [a.id, a]));

  const courseIds = [...new Set(assignments.map((a) => a.academic_course_id).filter(Boolean))];
  const { data: courses, error: coursesError } = await supabase
    .from('academic_courses')
    .select('id, name, course_slug')
    .in('id', courseIds);
  if (coursesError) throw coursesError;
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const studentIds = [...new Set(enrollments.map((e) => e.student_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', studentIds);
  if (profilesError) throw profilesError;
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  console.log('=== Envíos con respuestas sin evaluar/calificar detrás de un puntaje 0 ===\n');
  const sorted = [...flaggedSubmissions].sort((a, b) => (b.graded_at ?? '').localeCompare(a.graded_at ?? ''));
  for (const s of sorted) {
    const enrollment = enrollmentById.get(s.enrollment_id);
    const assignment = assignmentById.get(s.assignment_id);
    const course = assignment ? courseById.get(assignment.academic_course_id) : undefined;
    const profile = enrollment ? profileById.get(enrollment.student_id) : undefined;
    const flags = flagsBySubmission.get(s.id);

    console.log(`  submission_id: ${s.id}`);
    console.log(`    curso: ${course?.name ?? '?'} (${course?.course_slug ?? '?'})`);
    console.log(`    evaluación: ${assignment?.title ?? '?'}`);
    console.log(`    estudiante: ${profile?.full_name ?? '?'} (${enrollment?.student_id ?? '?'})`);
    console.log(`    auto_score=${s.auto_score} final_score=${s.final_score} graded_at=${s.graded_at}`);
    console.log(`    respuestas_mc_sin_evaluar=${flags.A_multiple_choice_sin_evaluar} respuestas_abiertas_sin_calificar=${flags.B_abierta_sin_calificar}`);
    console.log('');
  }

  console.log(`Total de envíos afectados: ${flaggedSubmissions.length}.`);
  console.log('✅ Diagnóstico completado. Ningún dato fue modificado.');
}

await main();
