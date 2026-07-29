// spec-027: sin la confirmación de correo, el registro pasa a ser un
// endpoint público que crea usuarios y valida enrollment_code sin sesión.
// Este limitador en memoria es una mitigación mínima, no una defensa robusta:
//
// - En Vercel (serverless, múltiples instancias) el conteo no es global, así
//   que un atacante distribuido entre instancias podría superarlo.
// - La clave por IP depende de `x-forwarded-for`, que en última instancia lo
//   controla el cliente (rotar el header lo elude). Sirve para frenar un
//   barrido ingenuo desde un único proceso, no para pararlo del todo.
//
// Cubre el caso que sí importa esta semana: no bloquear a un salón real de
// ~30 estudiantes reintentando el mismo código (typos incluidos, que cuentan
// como intento aunque terminen fallando), y sí frenar volumen anómalo.
const WINDOW_MS = 10 * 60 * 1000;

const attempts = new Map<string, number[]>();

export function checkRegistrationRateLimit(
  key: string,
  maxAttempts: number
): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );

  if (recent.length >= maxAttempts) {
    attempts.set(key, recent);
    return false;
  }

  recent.push(now);
  attempts.set(key, recent);
  return true;
}
