// spec-051, Fase 7: diagnóstico de cuentas duplicadas (solo lectura).
// Equivalente JS de scripts/diagnostico-duplicados-spec051.sql, para correr
// contra un proyecto Supabase al que no se tiene psql directo (producción,
// gestionada — sin acceso a docker exec como en mirp-lab). Usa el mismo
// patrón que fetchEmailsById en lib/students/service.ts: auth.users no es
// visible por PostgREST, así que los correos se traen vía
// supabase.auth.admin.listUsers().
//
// No modifica ningún dato. Uso:
//   node --env-file=.env.prod scripts/diagnostico-duplicados-spec051.mjs

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

async function fetchEmailsById() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return new Map(data.users.map((u) => [u.id, u.email ?? '']));
}

async function fetchStudentIds() {
  const { data, error } = await supabase.from('user_roles').select('user_id').eq('role', 'student');
  if (error) throw error;
  return new Set(data.map((r) => r.user_id));
}

async function main() {
  console.log('📋 Diagnóstico de cuentas duplicadas (spec-051, Fase 7) — solo lectura\n');

  const [emails, studentIds] = await Promise.all([fetchEmailsById(), fetchStudentIds()]);

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name');
  if (profilesError) throw profilesError;
  const studentProfiles = profiles.filter((p) => studentIds.has(p.id));

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('student_id, academic_course_id, status')
    .eq('status', 'active');
  if (enrollmentsError) throw enrollmentsError;

  const { data: progress, error: progressError } = await supabase
    .from('lesson_progress')
    .select('user_id, course_slug, lesson_slug, viewed_at');
  if (progressError) throw progressError;

  // --- Heurística A: mismo full_name entre distintas cuentas de estudiante ---
  const byName = new Map();
  for (const p of studentProfiles) {
    if (!byName.has(p.full_name)) byName.set(p.full_name, []);
    byName.get(p.full_name).push(p.id);
  }
  const dupByName = [...byName.entries()].filter(([, ids]) => ids.length > 1);

  console.log('=== Heurística A: mismo full_name entre distintas cuentas ===');
  if (dupByName.length === 0) console.log('(sin resultados)\n');
  else {
    for (const [name, ids] of dupByName) console.log(`  ${name}: ${ids.join(', ')}`);
    console.log('');
  }

  // --- Heurística B: mismo correo por parte local ---
  const byLocalPart = new Map();
  for (const id of studentIds) {
    const email = emails.get(id);
    if (!email) continue;
    const local = email.split('@')[0];
    if (!byLocalPart.has(local)) byLocalPart.set(local, []);
    byLocalPart.get(local).push({ id, email });
  }
  const dupByEmail = [...byLocalPart.entries()].filter(([, rows]) => rows.length > 1);

  console.log('=== Heurística B: mismo correo (parte local) entre distintas cuentas ===');
  if (dupByEmail.length === 0) console.log('(sin resultados)\n');
  else {
    for (const [local, rows] of dupByEmail) {
      console.log(`  ${local}: ${rows.map((r) => `${r.id} <${r.email}>`).join(' | ')}`);
    }
    console.log('');
  }

  // --- Heurísticas C1/C2: matrícula activa sin progreso vs. progreso sin matrícula activa ---
  const activeEnrollmentStudentIds = new Set(enrollments.map((e) => e.student_id));
  const progressByUser = new Map();
  for (const row of progress) {
    if (!studentIds.has(row.user_id)) continue; // mismo filtro que la versión SQL
    if (!progressByUser.has(row.user_id)) progressByUser.set(row.user_id, []);
    progressByUser.get(row.user_id).push(row);
  }

  const nuevas = studentProfiles.filter(
    (p) => activeEnrollmentStudentIds.has(p.id) && !progressByUser.has(p.id)
  );
  const viejas = studentProfiles.filter(
    (p) => progressByUser.has(p.id) && !activeEnrollmentStudentIds.has(p.id)
  );

  console.log('=== Heurística C1: matrícula activa SIN ningún lesson_progress ===');
  if (nuevas.length === 0) console.log('(sin resultados)\n');
  else {
    for (const p of nuevas) console.log(`  ${p.full_name} <${emails.get(p.id) ?? '?'}> (${p.id})`);
    console.log('');
  }

  console.log('=== Heurística C2: progreso registrado SIN ninguna matrícula activa ===');
  if (viejas.length === 0) console.log('(sin resultados)\n');
  else {
    for (const p of viejas) console.log(`  ${p.full_name} <${emails.get(p.id) ?? '?'}> (${p.id})`);
    console.log('');
  }

  console.log('=== Cruce: mismo full_name entre C1 (nueva) y C2 (vieja) — candidato más fuerte ===');
  const cruce = nuevas.filter((n) => viejas.some((v) => v.full_name === n.full_name && v.id !== n.id));
  if (cruce.length === 0) console.log('(sin resultados)\n');
  else {
    for (const n of cruce) {
      const v = viejas.find((v) => v.full_name === n.full_name && v.id !== n.id);
      console.log(`  ${n.full_name}: nueva=${n.id} <${emails.get(n.id)}> — vieja=${v.id} <${emails.get(v.id)}>`);
    }
    console.log('');
  }

  console.log('✅ Diagnóstico completado. Ningún dato fue modificado.');
}

await main();
