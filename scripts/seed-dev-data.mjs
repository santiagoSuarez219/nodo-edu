// Siembra datos de dominio de DESARROLLO: cursos académicos y estudiantes
// matriculados. Complementa `npm run seed:teacher`, que solo restaura la
// cuenta docente.
//
// Motivo (DEBT-072, 2026-08-29): el procedimiento documentado para probar una
// migración en `mirp-lab` es `supabase db reset`, que **borra todos los datos
// de desarrollo**. Antes de este script, recuperarse de un reset significaba
// volver a montar a mano cada curso y estudiante que una ronda de pruebas
// necesitara — o descubrir a mitad de la ronda siguiente que ya no estaban.
// Ahora cuesta un comando: `npm run seed:dev`.
//
// Idempotente: se puede correr las veces que haga falta. Reutiliza lo que ya
// exista (por correo del estudiante y por `enrollment_code` del curso) en vez
// de duplicarlo.

import { createClient } from '@supabase/supabase-js';

const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
  console.error('   Ejecutá con: node --env-file=.env.local scripts/seed-dev-data.mjs');
  console.error('   (o vía `npm run seed:dev`, que ya lo hace).');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─────────────────────────────────────────────────────────────
// Guarda de seguridad — NO NEGOCIABLE
//
// Este script escribe datos ficticios con `service_role` (bypasea RLS). Correrlo
// contra producción metería estudiantes y cursos falsos en la base real, entre
// datos de estudiantes reales, sin ninguna marca que los distinga a simple
// vista. Se exige que la URL sea local: el entorno de desarrollo llega vía
// túnel SSH a `mirp-lab` (localhost:54321), así que una URL `*.supabase.co`
// solo puede significar producción — o el proxy de latencia de spec-054
// apuntando a ella.
// ─────────────────────────────────────────────────────────────
const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(supabaseUrl);
if (!isLocalUrl) {
  console.error('❌ ABORTADO: este script solo puede correr contra la base de DESARROLLO.');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL apunta a: ${supabaseUrl}`);
  console.error('   Se esperaba localhost/127.0.0.1 (túnel SSH a mirp-lab, ver CLAUDE.md → "Base de datos").');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEACHER_EMAIL = process.env.TEACHER_EMAIL ?? 'dev@nodo.local';

// Un curso académico por cada curso real de `content/cursos/`. `course_slug`
// debe coincidir exactamente con el directorio, o las páginas de curso no
// resuelven.
const COURSES = [
  {
    course_slug: 'estructuras-de-datos',
    name: 'DEV — Estructuras de Datos',
    code: 'DEV-EDD',
    enrollment_code: 'DEVEDD2026',
    class_days: ['lunes', 'miercoles'],
    class_time_start: '08:00',
    class_time_end: '10:00',
  },
  {
    course_slug: 'analisis-de-algoritmos',
    name: 'DEV — Análisis de Algoritmos',
    code: 'DEV-ADA',
    enrollment_code: 'DEVADA2026',
    class_days: ['martes', 'jueves'],
    class_time_start: '10:00',
    class_time_end: '12:00',
  },
  {
    course_slug: 'programacion-cientifica',
    name: 'DEV — Programación Científica',
    code: 'DEV-PC',
    enrollment_code: 'DEVPC2026',
    class_days: ['viernes'],
    class_time_start: '14:00',
    class_time_end: '17:00',
  },
];

// Contraseña común a propósito: son cuentas de prueba de un entorno local que
// nunca sale de la workstation del laboratorio, y tener que recordar tres
// contraseñas distintas solo entorpece las rondas de pruebas manuales.
const STUDENT_PASSWORD = 'DevStudent2026!';
const STUDENTS = [
  { email: 'dev-estudiante1@nodo.local', full_name: 'Estudiante Dev Uno', courses: ['estructuras-de-datos', 'analisis-de-algoritmos'] },
  { email: 'dev-estudiante2@nodo.local', full_name: 'Estudiante Dev Dos', courses: ['estructuras-de-datos'] },
  { email: 'dev-estudiante3@nodo.local', full_name: 'Estudiante Dev Tres', courses: ['programacion-cientifica'] },
];

async function findUserByEmail(email) {
  // `listUsers()` pagina de a 50 por defecto; en una base de desarrollo recién
  // reseteada eso sobra, pero se pide explícitamente una página grande para
  // que el script no empiece a fallar en silencio cuando el entorno acumule
  // cuentas de prueba de varias rondas.
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`listUsers falló: ${error.message}`);
  return (data.users ?? []).find((u) => u.email === email);
}

async function ensureTeacher() {
  const teacher = await findUserByEmail(TEACHER_EMAIL);
  if (!teacher) {
    console.error(`❌ No existe la cuenta docente ${TEACHER_EMAIL}.`);
    console.error('   Ejecutá primero: npm run seed:teacher');
    process.exit(1);
  }
  console.log(`✅ Docente encontrado: ${TEACHER_EMAIL} (${teacher.id})`);
  return teacher;
}

async function ensureCourse(course, teacherId) {
  const { data: existing, error: readError } = await supabase
    .from('academic_courses')
    .select('id')
    .eq('enrollment_code', course.enrollment_code)
    .maybeSingle();
  if (readError) throw new Error(`leyendo academic_courses: ${readError.message}`);

  if (existing) {
    console.log(`   ↩︎  ${course.name} ya existe (${existing.id})`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('academic_courses')
    .insert({ ...course, teacher_id: teacherId, is_active: true })
    .select('id')
    .single();
  if (error) throw new Error(`creando ${course.name}: ${error.message}`);

  console.log(`   ✅ ${course.name} creado (${data.id}) — código ${course.enrollment_code}`);
  return data.id;
}

async function ensureStudent(student) {
  const existing = await findUserByEmail(student.email);
  if (existing) {
    console.log(`   ↩︎  ${student.email} ya existe (${existing.id})`);
    return existing.id;
  }

  // El trigger `handle_new_user` (supabase/migrations/…_harden_handle_new_user.sql)
  // crea por sí solo el `profiles`, el `user_roles` con rol student y la fila
  // en `students` — este script no debe insertarlos a mano o chocaría con él.
  const { data, error } = await supabase.auth.admin.createUser({
    email: student.email,
    password: STUDENT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: student.full_name },
  });
  if (error) throw new Error(`creando ${student.email}: ${error.message}`);

  console.log(`   ✅ ${student.email} creado (${data.user.id})`);
  return data.user.id;
}

async function ensureEnrollment(studentId, courseId, label) {
  const { data: existing, error: readError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('academic_course_id', courseId)
    .maybeSingle();
  if (readError) throw new Error(`leyendo enrollments: ${readError.message}`);

  if (existing) {
    console.log(`   ↩︎  matrícula ya existe en ${label}`);
    return;
  }

  const { error } = await supabase
    .from('enrollments')
    .insert({ student_id: studentId, academic_course_id: courseId, status: 'active' });
  if (error) throw new Error(`matriculando en ${label}: ${error.message}`);

  console.log(`   ✅ matriculado en ${label}`);
}

async function main() {
  console.log(`📋 Seed de datos de desarrollo — ${supabaseUrl}\n`);

  const teacher = await ensureTeacher();

  console.log('\n📚 Cursos académicos:');
  const courseIdBySlug = new Map();
  for (const course of COURSES) {
    courseIdBySlug.set(course.course_slug, await ensureCourse(course, teacher.id));
  }

  console.log('\n👥 Estudiantes:');
  for (const student of STUDENTS) {
    const studentId = await ensureStudent(student);
    for (const slug of student.courses) {
      await ensureEnrollment(studentId, courseIdBySlug.get(slug), slug);
    }
  }

  console.log('\n✅ Seed de desarrollo completado.\n');
  console.log('   Docente:     ' + TEACHER_EMAIL);
  console.log('   Estudiantes: ' + STUDENTS.map((s) => s.email).join(', '));
  console.log('   Contraseña de los estudiantes: ' + STUDENT_PASSWORD);
  console.log('   Códigos de matrícula: ' + COURSES.map((c) => c.enrollment_code).join(', '));
}

main().catch((err) => {
  console.error(`\n❌ Seed fallido: ${err.message}`);
  process.exit(1);
});
