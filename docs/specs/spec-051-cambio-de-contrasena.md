# spec-051 — [NOT STARTED] Cambio de contraseña con sesión activa

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

**Hoy ningún usuario de la plataforma puede cambiar su propia contraseña.**
Verificado sobre el código el 2026-08-15:

- `lib/auth/actions.ts` exporta únicamente `signIn`, `signUp` y `signOut`.
- `app/(auth)/` contiene solo `login` y `registro`.
- `app/cuenta/` permite editar el perfil (`AccountForm`), no las credenciales.
- La única llamada a la API de contraseñas del proyecto es
  `supabase.auth.admin.updateUserById` (`lib/students/service.ts:315`), que es
  el camino del **docente** vía `students-mcp` — no del propio usuario.

La acción existió: spec-002 implementó `updatePassword`
(`updateUser({ password })`, "requiere sesión activa"). **spec-027 la eliminó**
dentro del paquete que retiró todo el flujo de recuperación por correo. Pero
`updatePassword` **no dependía de SMTP**: se fue arrastrada por la limpieza de
un flujo vecino, y ningún ítem del backlog la reclama —
**[[DEBT-011]]** habla de la recuperación por correo y **[[DEBT-024]]** del
docente reponiendo la contraseña de un estudiante.

El hueco tiene filo en este curso concreto: `students-mcp.create_student` crea
las cuentas con una **contraseña temporal** que el docente reparte. Esa
contraseña temporal es hoy **permanente**, porque el estudiante no tiene forma
de cambiarla. Y son cursos presenciales, con estaciones de laboratorio
compartidas.

### Por qué este spec NO incluye la recuperación por correo

**[[DEBT-011]]** (Alta) sigue abierta y este spec no la cierra. No es solo
SMTP: hay **dos** bloqueos, y el segundo es el que manda.

1. **SMTP** — el plan gratuito de Supabase limita a 3 correos de auth por hora
   (**[[DEBT-001]]**). Un flujo de recuperación que atiende a 3 personas por
   hora es inservible justo cuando se necesita: el arranque de semestre, con
   ~30 estudiantes estrenando contraseña temporal a la vez.
2. **Los correos no están verificados** — spec-027 eliminó la confirmación de
   correo. Ese spec ya lo anota: *"`resetPasswordForEmail` deja de ser una vía
   fiable de recuperación (correo no verificado + sin SMTP)"*. Montar la
   recuperación sobre direcciones no verificadas no es "poco fiable", es un
   agujero: el enlace de restablecimiento viaja a un buzón que nadie comprobó
   que pertenezca a quien dice ser su dueño.

Resolver (1) es configuración; resolver (2) es un spec propio (reintroducir la
verificación de correo). Este spec entrega lo que **sí** está desbloqueado y
no requiere ninguna de las dos: cambiar la contraseña demostrando identidad con
la **sesión activa**, no con un correo.

## Alcance

### Incluye

1. Formulario de cambio de contraseña en `/cuenta`, para cualquier usuario
   autenticado (estudiante, docente o admin — no depende del rol).
2. Server Action `changePassword` que **exige la contraseña actual** (D2).
3. Cierre del resto de sesiones del usuario tras un cambio exitoso (D3).
4. Señalización honesta de errores, separando negocio de infraestructura,
   siguiendo el patrón de spec-037 / spec-046 (D6).

### No incluye

- **Recuperación de contraseña por correo** ("olvidé mi contraseña"). Sigue en
  **[[DEBT-011]]**, bloqueada por **[[DEBT-001]]** y por la verificación de
  correo (ver Contexto). Este spec no crea `/recuperar-password` ni ninguna
  ruta pública.
- **Forzar el cambio de la contraseña temporal en el primer inicio de sesión.**
  Sería el complemento natural, pero exige una marca por usuario
  (`must_change_password`), migración, y un gate en el middleware o el layout.
  Merece su propio spec; se registra en el backlog al cerrar este.
- **Cambiar el correo de la cuenta.** Depende de la verificación de correo, o
  sea del mismo bloqueo (2) de arriba.
- **Cambios en `students-mcp`.** El docente ya puede reponer contraseñas con
  `update_student`; este spec no toca ese camino ni su system prompt.
- **Política de contraseñas nueva.** Se reutiliza la de `SignUpSchema` (D4).

## Impacto en el sistema

| Archivo | Cambio |
|---------|--------|
| `lib/auth/schemas.ts` | **Nuevo** `ChangePasswordSchema` (actual, nueva, confirmación) |
| `lib/auth/actions.ts` | **Nueva** Server Action `changePassword(prev, formData)` |
| `components/account/ChangePasswordForm.tsx` | **Nuevo.** Client Component con `useActionState`, mismo patrón que `AccountForm` |
| `app/cuenta/page.tsx` | Monta la tarjeta nueva bajo `AccountForm` |

**Sin migración de base de datos.** Las credenciales viven en `auth.users`,
gestionadas por Supabase Auth; no hay tabla propia que tocar.

**Patrón a seguir** (ya establecido en el proyecto, no se inventa nada):
`components/account/AccountForm.tsx` + `lib/students/actions.ts:9`
(`updateAccountAction`) — `useActionState`, firma
`(_prev: AuthResult, formData: FormData) => Promise<AuthResult>`, errores por
campo en `fieldErrors`.

## Evaluación MCP

**¿Aplica MCP?** No.

Es una acción que el usuario ejecuta sobre **su propia** cuenta, demostrando
identidad con su sesión. Un agente no tiene ni debe tener sesión de un
estudiante. El camino administrativo equivalente —el docente reponiendo la
contraseña de otro— **ya existe** en `students-mcp.update_student` y no cambia
con este spec, así que tampoco hay system prompt que actualizar.

## Decisiones de diseño

**D1 — Solo el flujo con sesión activa.** Ver Contexto. Es lo único
desbloqueado, y entregarlo no estorba a la recuperación futura: el
`ChangePasswordSchema` y el formulario se reaprovechan cuando DEBT-011 se
aborde.

**D2 — Se exige la contraseña actual.** `updateUser({ password })` **no** la
pide: basta una sesión válida. Aceptar eso significaría que cualquiera que
alcance una sesión abierta —una estación de laboratorio compartida donde el
estudiante anterior no cerró sesión, exactamente el escenario de estos cursos
presenciales— puede cambiar la contraseña y **dejar fuera al dueño de la
cuenta**, que además no tiene recuperación por correo a la que acudir. El costo
de pedirla es un campo más; el de no pedirla es una cuenta secuestrada sin vía
de retorno.

> ⚠️ **Riesgo de implementación a resolver en la Fase 2.** La forma natural de
> verificar la contraseña actual es `signInWithPassword`, pero invocarla con el
> cliente de servidor **emite una sesión nueva y reescribe las cookies**, lo que
> puede desplazar la sesión en curso. La verificación debe hacerse con un
> cliente que **no** persista sesión (sin el adaptador de cookies de
> `@supabase/ssr`), de modo que solo sirva para comprobar la credencial. Si esa
> vía no resulta viable, hay que reportarlo antes de improvisar: degradar a "no
> pedir la contraseña actual" **anula D2** y requiere aprobación explícita.

**D3 — Tras un cambio exitoso se cierran las demás sesiones.** Con
`signOut({ scope: 'others' })`: si el motivo del cambio es que alguien más
conoce la contraseña, dejar sus sesiones vivas vacía el gesto. La sesión desde
la que se hizo el cambio **se conserva** — expulsar al usuario de su propia
acción es hostil y además lo dejaría en `/login` sin señal de éxito.

**D4 — Misma política de contraseñas que el registro.** `min(8)`, idéntica a
`SignUpSchema` (`lib/auth/schemas.ts:13`). Endurecerla solo aquí produciría la
incoherencia de que una contraseña válida para registrarse sea inválida para
cambiarse. Si la política debe subir, que suba en los dos sitios y en su propio
spec.

**D5 — La nueva contraseña debe ser distinta de la actual.** Validación en el
schema. Sin esto, el formulario acepta un "cambio" que no cambia nada y
reporta éxito — el mismo tipo de mentira que spec-037 vino a eliminar.

**D6 — Errores honestos, separando negocio de infraestructura.** Tres
resultados distinguibles, en la línea de spec-037/046 y [[DEBT-040]]:
- `contraseña actual incorrecta` → negocio, mensaje específico en el campo.
- `no se pudo verificar` (Auth caído) → infraestructura, mensaje distinto, y
  **no** se intenta el cambio.
- `ok` → éxito, con confirmación visible.

Nunca reportar éxito sin comprobar el `error` de `updateUser`.

**D7 — Sin rate limiting propio.** El formulario verifica una contraseña, así
que en teoría es superficie de fuerza bruta; en la práctica el atacante ya
necesita una sesión válida del usuario, así que no abre nada que no estuviera
abierto. Se apoya en los límites de Supabase Auth y se anota como punto a
revisar si alguna vez se expone sin sesión.

## Fases de implementación

### Fase 1 — Schema y validación
- [ ] `ChangePasswordSchema` en `lib/auth/schemas.ts`: `current_password`,
      `new_password` (min 8, D4), `new_password_confirmation`.
- [ ] `.refine()` de coincidencia entre nueva y confirmación (mismo patrón que
      `SignUpSchema`).
- [ ] `.refine()` de que la nueva es distinta de la actual (D5).
- [ ] Exportar `ChangePasswordInput`.

### Fase 2 — Server Action
- [ ] `changePassword(_prev: AuthResult, formData: FormData)` en
      `lib/auth/actions.ts`.
- [ ] Resolver la verificación de la contraseña actual sin desplazar la sesión
      (ver el aviso de D2). **Si no es viable, detenerse y reportar.**
- [ ] Cambiar la contraseña con `updateUser({ password })`, **verificando
      `error`** antes de reportar éxito (D6).
- [ ] Cerrar las demás sesiones (D3).
- [ ] Distinguir los tres resultados de D6.

### Fase 3 — UI
- [ ] `components/account/ChangePasswordForm.tsx`, siguiendo `AccountForm`:
      `useActionState`, `AuthResult`, `fieldErrors`.
- [ ] Tres campos `type="password"` con `autoComplete` correcto
      (`current-password` / `new-password`), etiquetas asociadas y errores
      enlazados con `aria-describedby` — el patrón accesible que `AccountForm`
      ya usa.
- [ ] Mensaje de éxito explícito, y aviso de que se cerraron las otras
      sesiones (D3).
- [ ] Montar la tarjeta en `app/cuenta/page.tsx` bajo `AccountForm`.
- [ ] Limpiar los campos tras un cambio exitoso.

### Fase 4 — Verificación
- [ ] `npm run lint` y `npm run build` en verde.
- [ ] Ronda manual `docs/testing/test-051-cambio-de-contrasena.md`.
- [ ] Invocar `@reviewer` sobre el diff contra `development`.

### Fase 5 — Cierre
- [ ] Registrar en `docs/specs/backlog.md` el ítem de **forzar el cambio de la
      contraseña temporal en el primer inicio de sesión** (ver "No incluye").
- [ ] Anotar en **[[DEBT-011]]** que el cambio con sesión activa ya está
      resuelto por este spec, para que su alcance quede acotado a la
      recuperación por correo.

## Criterios de aceptación

1. Un usuario autenticado puede cambiar su contraseña desde `/cuenta`.
2. El cambio **exige** la contraseña actual; con una incorrecta se rechaza con
   un mensaje específico y la contraseña **no** cambia.
3. Tras cambiarla, el usuario puede iniciar sesión con la nueva y **no** con la
   anterior.
4. La sesión desde la que se hizo el cambio sigue activa; las demás se cierran.
5. Una contraseña nueva igual a la actual se rechaza (D5).
6. Una contraseña nueva de menos de 8 caracteres, o que no coincide con su
   confirmación, se rechaza con el error en el campo correspondiente.
7. Con Supabase Auth caído, el formulario informa de un fallo de
   infraestructura — distinto de "contraseña incorrecta" — y no reporta éxito.
8. Funciona igual para estudiante, docente y admin.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-051-cambio-de-contrasena.md` — casos
  `TC-051-001` … `TC-051-009`.
- **Automáticas (e2e/unit):** framework aún **por definir** (ver CLAUDE.md →
  "Testing"). Cuando exista, el caso de mayor valor es unitario sobre
  `ChangePasswordSchema` (coincidencia, longitud, distinta de la actual) y uno
  de integración que confirme que una contraseña actual incorrecta no llega a
  invocar `updateUser`.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{pendiente}}
