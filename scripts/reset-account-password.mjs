import { createClient } from '@supabase/supabase-js';

const requiredVars = [
  'RESET_EMAIL',
  'RESET_NEW_PASSWORD',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
  console.error('Asegúrate de que el .env correspondiente contiene RESET_EMAIL, RESET_NEW_PASSWORD,');
  console.error('NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.RESET_EMAIL;
const newPassword = process.env.RESET_NEW_PASSWORD;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('✅ Cliente Supabase inicializado con service role key');
console.log(`🎯 Proyecto: ${supabaseUrl}`);

async function findUserByEmail(targetEmail) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  return (data.users || []).find((u) => u.email === targetEmail);
}

async function resetPassword() {
  try {
    console.log(`🔍 Buscando usuario: ${email}`);
    const user = await findUserByEmail(email);

    if (!user) {
      console.error(`❌ No se encontró ningún usuario con email ${email} en este proyecto`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado (ID: ${user.id})`);
    console.log('🔐 Actualizando contraseña...');

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) throw error;

    console.log(`✅ Contraseña actualizada correctamente para ${email}`);
  } catch (err) {
    console.error(`❌ Error fatal: ${err.message}`);
    process.exit(1);
  }
}

await resetPassword();
