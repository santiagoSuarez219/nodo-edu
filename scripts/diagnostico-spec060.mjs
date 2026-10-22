// spec-060, Fase 0 y Fase 7: diagnóstico de la nota de autoevaluaciones (SOLO LECTURA).
//
// Antes del despliegue: foto del estado actual por grupo activo — nota de
// autoevaluaciones de cada matrícula, lecciones con progreso o intentos (la
// lista con la que el docente decide qué marcar) y los casos de riesgo
// (DEBT-098: ítem manual llamado "Autoevaluaciones").
// Después del marcado inicial: `--compare` contrasta contra la foto previa.
//
// No modifica ningún dato: solo usa `.select()`. No trae nombres ni correos de
// estudiantes (solo ids), así que la foto no contiene datos de contacto; aun
// así es información de notas: guárdala fuera del repo.
//
// Uso (producción):
//   node --env-file=.env.prod scripts/diagnostico-spec060.mjs --out ~/diagnostico-spec060-antes.json
//   node --env-file=.env.prod scripts/diagnostico-spec060.mjs --compare ~/diagnostico-spec060-antes.json

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : (args[i + 1] ?? null);
};
const outPath = flag('--out');
const comparePath = flag('--compare');

const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = new URL(url).hostname.split('.')[0];
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// PostgREST corta en 1000 filas por defecto: se pagina para no truncar en silencio.
async function fetchAll(table, columns, apply = (q) => q) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await apply(supabase.from(table).select(columns)).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

const short = (id) => id.slice(0, 8);

async function snapshot() {
  const courses = await fetchAll('academic_courses', 'id, name, code, course_slug, teacher_id', (q) =>
    q.eq('is_active', true)
  );
  const courseIds = courses.map((c) => c.id);

  const enrollments = (
    await fetchAll('enrollments', 'id, student_id, academic_course_id', (q) => q.eq('status', 'active'))
  ).filter((e) => courseIds.includes(e.academic_course_id));
  const items = (
    await fetchAll('grade_items', 'id, academic_course_id, name, kind, weight')
  ).filter((i) => courseIds.includes(i.academic_course_id));
  const saItemIds = new Set(items.filter((i) => i.kind === 'self_assessment').map((i) => i.id));
  const grades = (await fetchAll('student_grades', 'enrollment_id, grade_item_id, score')).filter((g) =>
    saItemIds.has(g.grade_item_id)
  );
  const attempts = await fetchAll(
    'self_assessment_attempts',
    'user_id, course_slug, lesson_slug, question_count, correct_count'
  );
  const progress = await fetchAll('lesson_progress', 'user_id, course_slug, lesson_slug');
  const disabled = await fetchAll('disabled_lessons', 'course_slug, lesson_slug');

  const groups = courses.map((c) => {
    const enr = enrollments.filter((e) => e.academic_course_id === c.id);
    const studentIds = new Set(enr.map((e) => e.student_id));
    const saItem = items.find((i) => i.academic_course_id === c.id && i.kind === 'self_assessment') ?? null;
    const manualConflict = items.find(
      (i) => i.academic_course_id === c.id && i.kind === 'manual' && i.name === 'Autoevaluaciones'
    );
    const slug = c.course_slug;
    const closed = new Set(disabled.filter((d) => d.course_slug === slug).map((d) => d.lesson_slug));

    const lessonStats = new Map();
    const touch = (lesson) => {
      if (!lessonStats.has(lesson)) lessonStats.set(lesson, { viewers: new Set(), answerers: new Set() });
      return lessonStats.get(lesson);
    };
    for (const p of progress)
      if (p.course_slug === slug && studentIds.has(p.user_id)) touch(p.lesson_slug).viewers.add(p.user_id);
    for (const a of attempts)
      if (a.course_slug === slug && studentIds.has(a.user_id)) touch(a.lesson_slug).answerers.add(a.user_id);

    return {
      academic_course_id: c.id,
      name: c.name,
      code: c.code,
      course_slug: slug,
      active_students: enr.length,
      self_assessment_item: saItem && { id: saItem.id, weight: saItem.weight },
      debt098_manual_item_conflict: Boolean(manualConflict) && !saItem,
      enrollments: enr.map((e) => ({
        enrollment_id: e.id,
        student_id: e.student_id,
        score: grades.find((g) => g.enrollment_id === e.id)?.score ?? null,
        lessons_viewed: progress.filter((p) => p.course_slug === slug && p.user_id === e.student_id).length,
        attempts: attempts.filter((a) => a.course_slug === slug && a.user_id === e.student_id).length,
      })),
      lessons: [...lessonStats.entries()]
        .map(([lesson, s]) => ({
          lesson_slug: lesson,
          viewers: s.viewers.size,
          answerers: s.answerers.size,
          closed: closed.has(lesson),
        }))
        .sort((a, b) => b.viewers - a.viewers),
    };
  });

  return { project_ref: projectRef, taken_at: new Date().toISOString(), groups };
}

function printSnapshot(s) {
  console.log(`📋 Diagnóstico spec-060 — proyecto ${s.project_ref} — ${s.taken_at}\n`);
  for (const g of s.groups) {
    console.log(`■ ${g.name} (${g.code}) — ${short(g.academic_course_id)}`);
    if (!g.course_slug) {
      console.log('   sin course_slug: no se ve afectado por spec-060\n');
      continue;
    }
    console.log(`   course_slug: ${g.course_slug} · estudiantes activos: ${g.active_students}`);
    console.log(
      `   ítem de autoevaluaciones: ${
        g.self_assessment_item ? `sí (peso ${g.self_assessment_item.weight ?? 'sin peso'})` : 'no existe (se crea al primer envío)'
      }`
    );
    if (g.debt098_manual_item_conflict)
      console.log('   ⚠️  DEBT-098: hay un ítem MANUAL llamado "Autoevaluaciones" y no existe el automático.');
    console.log('   matrículas (nota actual · lecciones vistas · intentos):');
    for (const e of g.enrollments)
      console.log(`     ${short(e.student_id)}  ${e.score ?? 'sin nota'} · ${e.lessons_viewed} · ${e.attempts}`);
    console.log('   lecciones con actividad (candidatas a marcar, de más a menos vistas):');
    for (const l of g.lessons.slice(0, 15))
      console.log(
        `     ${l.lesson_slug}  vista por ${l.viewers}/${g.active_students} · respondida por ${l.answerers}${l.closed ? ' · CERRADA' : ''}`
      );
    console.log('');
  }
  const conflicts = s.groups.filter((g) => g.debt098_manual_item_conflict).length;
  console.log(`Resumen: ${s.groups.length} grupos activos · conflictos DEBT-098: ${conflicts}`);
}

function compare(before, after) {
  console.log(`🔎 Comparación spec-060: antes ${before.taken_at} → ahora ${after.taken_at}\n`);
  for (const g of after.groups) {
    const prev = before.groups.find((b) => b.academic_course_id === g.academic_course_id);
    if (!prev || !g.course_slug) continue;
    console.log(`■ ${g.name} (${g.code})`);
    for (const e of g.enrollments) {
      const was = prev.enrollments.find((p) => p.enrollment_id === e.enrollment_id);
      const a = was?.score ?? null;
      const b = e.score ?? null;
      const delta = a !== null && b !== null ? ` (${b - a >= 0 ? '+' : ''}${(b - a).toFixed(2)})` : '';
      console.log(`   ${short(e.student_id)}  ${a ?? 'sin nota'} → ${b ?? 'sin nota'}${delta}`);
    }
    const nulls = g.enrollments.filter((e) => e.score === null).length;
    console.log(`   sin nota ahora: ${nulls}/${g.enrollments.length}\n`);
  }
}

const now = await snapshot();
if (comparePath) {
  compare(JSON.parse(readFileSync(comparePath, 'utf8')), now);
} else {
  printSnapshot(now);
}
if (outPath) {
  writeFileSync(outPath, JSON.stringify(now, null, 2));
  console.log(`\n💾 Foto guardada en ${outPath} (contiene ids y notas: no la subas al repo).`);
}
