import { createClient } from '@supabase/supabase-js';

const requiredVars = [
  'TEACHER_EMAIL',
  'TEACHER_PASSWORD',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
  console.error('Asegúrate de que .env.local contiene TEACHER_EMAIL, TEACHER_PASSWORD,');
  console.error('NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('✅ Cliente Supabase inicializado con service role key');
console.log('📋 Seed de docente iniciado...');

const teacherEmail = process.env.TEACHER_EMAIL;
const teacherPassword = process.env.TEACHER_PASSWORD;

async function findUserByEmail(email) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    const users = data.users || [];
    return users.find((u) => u.email === email);
  } catch (err) {
    console.error(`❌ Error buscando usuario por email: ${err.message}`);
    throw err;
  }
}

async function createTeacherUser(email, password) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    return data.user;
  } catch (err) {
    console.error(`❌ Error creando usuario: ${err.message}`);
    throw err;
  }
}

async function seedTeacher() {
  try {
    console.log(`🔍 Buscando usuario: ${teacherEmail}`);
    let user = await findUserByEmail(teacherEmail);

    if (user) {
      console.log(`✅ Usuario ya existe (ID: ${user.id})`);
    } else {
      console.log(`📝 Creando nuevo usuario: ${teacherEmail}`);
      user = await createTeacherUser(teacherEmail, teacherPassword);
      console.log(`✅ Usuario creado exitosamente (ID: ${user.id})`);
    }

    console.log(`\n📋 Configurando roles para ${user.id}...`);

    const userId = user.id;
    const rolesToAssign = ['teacher', 'admin'];

    for (const role of rolesToAssign) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error && error.code === '23505') {
        console.log(`  ✅ Rol ${role} ya existe`);
      } else if (error) {
        console.error(`❌ Error insertando rol ${role}: ${error.message}`);
        throw error;
      } else {
        console.log(`  ✅ Rol ${role} creado`);
      }
    }

    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'student');

    if (deleteError) {
      console.error(`❌ Error eliminando rol student: ${deleteError.message}`);
      throw deleteError;
    }
    console.log(`  ✅ Rol student eliminado (si existía)`);

    const { data: finalRoles, error: readError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (readError) {
      console.error(`❌ Error leyendo roles finales: ${readError.message}`);
      throw readError;
    }

    const rolesList = finalRoles.map((r) => r.role).sort();
    console.log(`\n✅ Estado final de roles: [${rolesList.join(', ')}]`);

    if (rolesList.includes('student')) {
      console.warn(`⚠️  Advertencia: el rol student sigue presente`);
    }
    if (!rolesList.includes('teacher') || !rolesList.includes('admin')) {
      console.error(`❌ Error: faltan roles requeridos (teacher, admin)`);
      process.exit(1);
    }

    console.log('✅ Fase 0 completada: docente sembrado correctamente');
    console.log(`\n📝 Recordá guardar este ID en QUESTION_BANK_AGENT_TEACHER_ID en .env.local:`);
    console.log(`   QUESTION_BANK_AGENT_TEACHER_ID=${userId}`);
    return user;
  } catch (err) {
    console.error(`❌ Error fatal en seed: ${err.message}`);
    process.exit(1);
  }
}

await seedTeacher();
