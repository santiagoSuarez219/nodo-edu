# spec-051 — [IN PROGRESS] Ciclo de contraseña: restablecer por el docente, cambio forzado y cambio voluntario

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

**Problema real observado (2026-08-15).** Varios estudiantes olvidaron su
contraseña y, para resolverlo, **crearon cuentas nuevas**. Eso deja cuentas
duplicadas cuyo historial —matrícula, progreso de lecciones, notas,
asistencia— queda partido entre la cuenta vieja y la nueva.

No es un descuido de los estudiantes: **es la única salida que la plataforma
les deja hoy.**

### Por qué no había alternativa

Nadie puede restablecer una contraseña. Ni el estudiante, ni el docente, ni un
admin, ni un agente. Verificado sobre el código el 2026-08-15:

| Vía | Estado |
|-----|--------|
| Estudiante cambia la suya | **No existe.** `lib/auth/actions.ts` solo exporta `signIn`, `signUp`, `signOut` |
| Recuperación por correo | **Eliminada** por spec-027; bloqueada por [[DEBT-001]] y por la falta de verificación de correo |
| Docente vía UI | **No existe** ninguna acción de contraseña en el panel |
| Docente vía `students-mcp` | **No existe.** `UpdateStudentSchema` (`lib/students/schemas.ts:15-25`) acepta `full_name`, `email`, `career`, `semester`, `github_username` — **no `password`**. La herramienta `update_student` del MCP tampoco lo expone; solo `create_student` recibe contraseña, y es obligatoria |

`updatePassword` sí existió: spec-002 la implementó (`updateUser({ password })`,
"requiere sesión activa"). **spec-027 la eliminó** junto con el flujo de
recuperación por correo — pero `updatePassword` **no dependía de SMTP**. Se fue
arrastrada por la limpieza de un flujo vecino.

**[[DEBT-011]]** ya documentaba la consecuencia sin llamarla por su nombre:
*"el docente es el único canal real de recuperación de cuentas (vía
`students-mcp` → `update_student` con nuevo `email`, o recreando la cuenta)"*.
Es decir: la vía oficial era **liberar el correo de la cuenta vieja** para que
el estudiante pudiera registrarse otra vez con él. Eso produce exactamente el
duplicado observado — y explica por qué aparecen cuentas nuevas "con el mismo
correo": el correo se le quitó a la cuenta anterior.

> ⚠️ **Consecuencia a revisar aparte de este spec.** Cada duplicado dejó una
> cuenta huérfana que conserva la matrícula, el progreso, las notas y la
> asistencia originales, mientras la cuenta nueva arranca vacía. Este spec
> **corta la causa**, no repara los datos ya partidos. Ver Fase 7.

### La solución

El circuito que pediste, y que además es el único que funciona sin SMTP ni
correo verificado:

```
Docente restablece  →  contraseña genérica  →  el estudiante entra  →
la plataforma le exige cambiarla antes de seguir  →  contraseña sólo suya
```

La identidad se demuestra **en persona** (el docente entrega la contraseña en
clase) y **con la sesión** (el cambio ocurre ya autenticado). No hace falta
ningún correo, así que ninguno de los dos bloqueos de [[DEBT-011]] aplica.

## Alcance

### Incluye

1. **Cambio voluntario** de contraseña por el propio usuario, desde `/cuenta`.
2. **Restablecimiento por el docente** desde la lista de estudiantes del curso,
   con contraseña genérica visible una sola vez.
3. **Cambio forzado**: mientras la contraseña esté marcada como restablecida,
   el usuario no puede navegar la plataforma sin cambiarla.
4. **Herramienta MCP** equivalente en `students-mcp`, para poder resolverlo
   también en conversación (Fase 5).

### No incluye

- **Recuperación de contraseña por correo.** Sigue en [[DEBT-011]], bloqueada
  por [[DEBT-001]] (SMTP: 3 correos/hora en plan gratuito) **y** por la falta
  de verificación de correo que eliminó spec-027. Este spec no crea ninguna
  ruta pública ni envía correos.
- **Reparación de las cuentas ya duplicadas.** Fusionar historiales
  (matrículas, progreso, notas, asistencia) es un trabajo de datos con sus
  propias decisiones. Se diagnostica en la Fase 7 y se registra; no se
  ejecuta aquí.
- **Cambiar el correo de la cuenta desde la UI.** Depende de la verificación
  de correo.
- **Política de contraseñas nueva.** Se reutiliza la del registro (D5).
- **Expiración periódica de contraseñas.** No aporta en este contexto.

## Impacto en el sistema

| Archivo | Cambio |
|---------|--------|
| `lib/auth/schemas.ts` | **Nuevo** `ChangePasswordSchema` |
| `lib/auth/actions.ts` | **Nueva** Server Action `changePassword` |
| `components/account/ChangePasswordForm.tsx` | **Nuevo.** Patrón de `AccountForm` (`useActionState` + `AuthResult`) |
| `app/cuenta/page.tsx` | Monta la tarjeta de cambio voluntario |
| `app/cambiar-contrasena/page.tsx` | **Nueva.** Destino del cambio forzado; reutiliza el mismo formulario |
| `lib/students/schemas.ts` | **Nuevo** `ResetStudentPasswordSchema` |
| `lib/students/service.ts` | **Nueva** `resetServiceStudentPassword()` — fija contraseña y marca `must_change_password` |
| `lib/students/actions.ts` | **Nueva** Server Action de restablecimiento para la UI docente |
| `components/admin/EnrollmentTable.tsx` | Acción "Restablecer contraseña" en la columna que ya existe |
| `middleware.ts` | Gate del cambio forzado (D3) |
| `mcp-servers/students-mcp/` | Herramienta `reset_student_password` |
| `docs/mcps/students-agent.system-prompt.md` | Documentar la herramienta nueva |

**Sin migración de base de datos** (D2). Las credenciales y la marca viven en
`auth.users`, gestionadas por Supabase Auth.

**Punto de anclaje de la UI docente:** ya existe la lista de estudiantes —
`components/admin/EnrollmentTable.tsx`, montada en
`app/(admin)/admin/courses/[academicCourseId]/page.tsx`, con una columna
"Acción" que hoy tiene el botón de retirar (`withdrawStudentAction`, patrón
`action.bind`). El botón nuevo va ahí; no hay que construir ninguna vista.

## Evaluación MCP

**¿Aplica MCP?** **Sí** — `students-mcp` (existente, se extiende).

- **MCP a modificar:** `students-mcp` — herramienta nueva
  `reset_student_password(student_id, password?)`. Devuelve la contraseña
  aplicada para que el docente pueda dictarla, y deja la cuenta marcada para
  cambio forzado.
- **Por qué extenderlo y no crear otro:** ya es el dominio de administración de
  estudiantes (`create_student`, `update_student`, `enroll_student`), corre con
  `STUDENTS_ADMIN_API_KEY` y permisos de admin. Restablecer una contraseña es
  exactamente ese dominio.
- **System prompt afectado:** `docs/mcps/students-agent.system-prompt.md` — hay
  que reflejar la herramienta y **reforzar la restricción existente** sobre no
  imprimir contraseñas fuera de la respuesta directa al docente que la pidió.
- **Fase de MCP en este spec:** Fase 5.

## Decisiones de diseño

**D1 — El docente fija la contraseña; el estudiante la reemplaza.** El docente
no ve ni recupera la contraseña anterior (no existe forma: están hasheadas).
Pone una genérica, se la entrega al estudiante en clase, y la plataforma obliga
a cambiarla. El docente **nunca** termina conociendo la contraseña definitiva.

**D2 — La marca de "debe cambiar" vive en `app_metadata`, no en una tabla.**
Se usa `auth.users.app_metadata.must_change_password`, escrita con
`supabase.auth.admin.updateUserById(...)` (el mismo camino que ya usa
`updateServiceStudent` para el correo).

Motivo, y es el que decide: **el middleware ya llama `supabase.auth.getUser()`
en cada request** y recibe el objeto de usuario completo, `app_metadata`
incluido. Leer la marca de ahí cuesta **cero**. Una columna en una tabla
propia obligaría a una consulta a Postgres **por cada request** — justo el
costo que [[DEBT-059]] y spec-049 intentan quitar del middleware. Además evita
migración y política RLS.

`app_metadata` solo es escribible con `service_role`: el usuario no puede
borrarse la marca a sí mismo desde el cliente.

**D3 — El gate va en el middleware, después del gate de sesión de spec-046.**
Si hay usuario autenticado y `must_change_password`, se redirige a
`/cambiar-contrasena`. Exentos: la propia ruta, `/api` (ya cortocircuitado
antes), y el cierre de sesión — un usuario marcado **siempre** debe poder salir.

**D4 — Se exige la contraseña actual, también en el cambio forzado.**
`updateUser({ password })` no la pide: basta una sesión válida. Aceptarlo
significaría que cualquiera que alcance una sesión abierta —una estación de
laboratorio compartida donde el anterior no cerró sesión, el escenario real de
estos cursos— cambia la contraseña y deja fuera al dueño, que además no tiene
recuperación por correo.

En el cambio forzado no estorba: el estudiante **acaba de escribir** la
contraseña genérica para entrar.

> ⚠️ **Riesgo de implementación a resolver en la Fase 2.** La vía natural para
> verificar la contraseña actual es `signInWithPassword`, pero invocarla con el
> cliente de servidor **emite una sesión nueva y reescribe las cookies**,
> desplazando la sesión en curso. Hay que verificar con un cliente que **no**
> persista sesión (sin el adaptador de cookies de `@supabase/ssr`). Si no
> resulta viable, **reportar antes de improvisar**: renunciar a D4 requiere
> aprobación explícita.

**D5 — Misma política de contraseñas que el registro.** `min(8)`, igual que
`SignUpSchema` (`lib/auth/schemas.ts:13`). Que una contraseña sirva para
registrarse pero no para cambiarse sería incoherente.

**D6 — La nueva debe ser distinta de la actual.** Sin esto, un estudiante puede
"cumplir" el cambio forzado reescribiendo la genérica que el docente le dio, y
el circuito entero no habría servido de nada. Es la validación que sostiene D1.

**D7 — La contraseña genérica se muestra una sola vez, y se genera.** La UI la
devuelve en la respuesta del restablecimiento para que el docente la dicte, y
no vuelve a mostrarse. **No** se guarda en ninguna tabla ni en ningún log. Se
genera aleatoria por defecto; el docente puede fijar una si lo prefiere
(útil para dictarla a varios en clase), asumiendo que es de un solo uso.

**D8 — Restablecer cierra las sesiones abiertas de esa cuenta.** Si el motivo
es que la cuenta está comprometida o compartida, dejar sesiones vivas vacía el
gesto. En el **cambio voluntario** se cierran las demás y se conserva la
propia — implementado con `signOut({scope:'others'})` sobre la sesión de quien
cambia (Fase 2, ✅).

> ⚠️ **Hallazgo de la Fase 3 (2026-08-16): en el restablecimiento por el
> docente, esto no se pudo implementar y queda sin verificar.**
> `signOut({scope:'others'})` opera sobre la sesión de **quien invoca**; en
> este flujo quien invoca es el docente, no el estudiante. El SDK admin de
> GoTrue (`supabase.auth.admin`) no expone ningún método para revocar las
> sesiones de OTRO usuario por su `id` — solo `admin.signOut(jwt, scope)`, que
> exige el JWT de esa sesión, que el docente no tiene. Tampoco es una opción
> limpia: `auth.sessions`/`auth.refresh_tokens` viven en el schema `auth`, que
> PostgREST no expone ni con `service_role` (mismo límite que ya documenta
> `fetchEmailsById` en `lib/students/service.ts` sobre `auth.users`).
>
> Es posible que **GoTrue invalide las sesiones del lado del servidor al
> cambiar la contraseña vía el API admin** (comportamiento estándar en muchos
> proveedores de Auth), pero no hay ninguna confirmación de esto en el SDK ni
> en la documentación del proyecto — no se asume. `resetServiceStudentPassword()`
> deja esto anotado en su propio código y **TC-051-010 lo verifica en vivo**
> con dos navegadores. Si el test muestra que la sesión anterior sigue viva,
> es un hallazgo a escalar (posible spec de seguimiento: RPC `security
> definer` que borre de `auth.sessions` por `user_id`, lo que sí requeriría
> migración — fuera del "sin migración" declarado en el alcance de este spec).

**D9 — Errores honestos.** Tres resultados distinguibles, en la línea de
spec-037/046 y [[DEBT-040]]: contraseña actual incorrecta (negocio), no se pudo
verificar (infraestructura), y éxito. Nunca reportar éxito sin comprobar el
`error` de `updateUser`.

## Fases de implementación

### Fase 1 — Schema y validación ✅ (2026-08-15)
- [x] `ChangePasswordSchema` en `lib/auth/schemas.ts`: `current_password`,
      `new_password` (min 8, D5), `new_password_confirmation`.
- [x] `.refine()` de coincidencia con la confirmación (patrón de `SignUpSchema`).
- [x] `.refine()` de que la nueva es distinta de la actual (D6).

### Fase 2 — Cambio voluntario ✅ (2026-08-15)
- [x] Server Action `changePassword` en `lib/auth/actions.ts`.
- [x] Verificar la contraseña actual sin desplazar la sesión (aviso de D4).
      **Resuelto:** cliente desechable de `@supabase/supabase-js` con
      `persistSession: false` — nunca toca el adaptador de cookies de
      `@supabase/ssr`, así que no puede reescribir la sesión en curso.
      Verificado con `npx tsc --noEmit` en verde; la prueba manual real queda
      en TC-051-004/007.
- [x] `updateUser({ password })` **verificando `error`** (D9).
- [x] Limpiar `must_change_password` si estaba puesta —
      `clearMustChangePasswordFlag()` en `lib/auth/service.ts`, no-op hasta
      que la Fase 3/4 la escriban.
- [x] Cerrar las demás sesiones, conservando la propia (D8) —
      `signOut({ scope: 'others' })`.
- [x] `ChangePasswordForm.tsx` con `useActionState`, `autoComplete`
      (`current-password` / `new-password`), errores con `aria-describedby`.
- [x] Montar la tarjeta en `app/cuenta/page.tsx`.

### Fase 3 — Restablecimiento por el docente ✅ (2026-08-16)
- [x] `ResetStudentPasswordSchema` en `lib/students/schemas.ts`.
- [x] `resetServiceStudentPassword()` en `lib/students/service.ts`: fija la
      contraseña y marca `must_change_password`. **Cierre de sesiones sin
      resolver — ver el hallazgo anotado en D8.** El `app_metadata` se lee con
      `admin.getUserById` y se mergea en código antes de escribir, mismo
      criterio que `clearMustChangePasswordFlag`.
- [x] Generador de contraseña legible para dictar en voz alta (D7) — evitar
      caracteres ambiguos (`l/1/I`, `O/0`). `generateGenericPassword()`: solo
      mayúsculas + dígitos del alfabeto sin ambigüedad, 10 caracteres,
      `node:crypto.randomBytes`.
- [x] Server Action `resetStudentPasswordAction` en `lib/students/actions.ts`.
      **No reutiliza el criterio de `withdrawStudentAction`** (ese delega la
      autorización a RLS porque escribe con el cliente de sesión); aquí la
      escritura real es con `service_role`, así que la autorización se verifica
      explícitamente ANTES, consultando `enrollments` con el cliente de sesión
      (reutiliza la policy `enrollments: select` — mismo patrón que D1 de
      spec-052 para no reimplementar en código una regla que RLS ya expresa).
- [x] Botón "Restablecer contraseña" en `EnrollmentTable.tsx`
      (`ResetPasswordButton.tsx`), con diálogo de dos fases (confirmar → mostrar
      la contraseña una sola vez).
      > **Van CUATRO copias del diálogo, no tres** — `CourseLifecycleActions`
      > (spec-036) ya era la tercera; [[DEBT-038]] no estaba actualizado.
      > Evaluado extraer `ConfirmDialog`: **no se hizo**. Este diálogo tiene una
      > segunda fase (mostrar el resultado) que las otras tres no tienen;
      > forzarlas a una API común sin migrarlas en el mismo cambio habría sido
      > un refactor amplio no pedido por este spec. Motivo documentado en el
      > propio componente y en el backlog.

### Fase 4 — Cambio forzado ✅ (2026-08-16)
- [x] Ruta `app/cambiar-contrasena/page.tsx` reutilizando `ChangePasswordForm`,
      con un texto que explique por qué se le exige.
- [x] Gate en `middleware.ts` (D3), después del gate de sesión de spec-046 y
      **sin** añadir ninguna consulta a Postgres (D2) — la marca se lee de
      `user.app_metadata`, ya presente en el `getUser()` existente.
- [x] Exenciones: la propia ruta (`CHANGE_PASSWORD_PATH`), `/api` (ya
      cortocircuitado antes de este bloque, sin cambios). **Cierre de sesión
      resultó no necesitar una exención propia**: el formulario del navbar
      hace POST a la página actual, que para un usuario marcado siempre es
      `/cambiar-contrasena` — ya cubierta por la exención de ruta. Razonamiento
      completo en el comentario del propio `middleware.ts`.
- [x] Verificar que tras el cambio la marca desaparece y la navegación se
      normaliza sin volver a iniciar sesión — se apoya en que `getUser()`
      revalida contra el servidor de Auth en cada request (no decodifica un
      JWT local cacheado), así que la siguiente navegación tras limpiar la
      marca ya no la ve. Confirmación empírica pendiente: TC-051-009.

### Fase 5 — MCP: actualizar `students-mcp`
- [ ] Herramienta `reset_student_password` en `mcp-servers/students-mcp/`.
- [ ] Ruta `/api/students/*` correspondiente, autenticada con
      `STUDENTS_ADMIN_API_KEY`.
- [ ] Actualizar `docs/mcps/README.md`.
- [ ] Actualizar `docs/mcps/students-agent.system-prompt.md`: la herramienta y
      el refuerzo de la restricción de no imprimir contraseñas.
- [ ] Verificar el MCP con `./mcp-servers/run-local-mcp.sh students-mcp`.

### Fase 6 — Verificación
- [ ] `npm run lint` y `npm run build` en verde.
- [ ] Ronda manual `docs/testing/test-051-restablecer-y-cambiar-contrasena.md`.
- [ ] Invocar `@reviewer` sobre el diff contra `development`.

### Fase 7 — Cierre y diagnóstico de duplicados
- [ ] **Consulta de diagnóstico** (solo lectura) que liste cuentas candidatas a
      duplicado: mismo `full_name`, o correos con la misma parte local, o
      matrículas activas sin ningún `lesson_progress` frente a cuentas con
      progreso y sin matrícula activa.
- [ ] Ejecutarla primero en desarrollo; contra producción **solo con
      confirmación explícita** del usuario.
- [ ] Entregar el listado. **No fusionar ni borrar nada.**
- [ ] Registrar en `docs/specs/backlog.md` la reparación de los duplicados
      encontrados.
- [ ] Anotar en [[DEBT-011]] que el circuito sin correo ya está resuelto, y que
      su alcance queda en la recuperación por correo.

## Criterios de aceptación

1. Un usuario autenticado puede cambiar su contraseña desde `/cuenta`.
2. El cambio exige la contraseña actual; con una incorrecta se rechaza con
   mensaje específico y la contraseña **no** cambia.
3. Tras cambiarla, entra con la nueva y **no** con la anterior.
4. El docente puede restablecer la contraseña de un estudiante de su curso
   desde la lista, y ve la contraseña resultante una sola vez.
5. Un docente **no** puede restablecer la contraseña de un estudiante de un
   curso ajeno.
6. Tras el restablecimiento, el estudiante entra con la genérica y **no puede
   navegar** a ninguna otra ruta hasta cambiarla.
7. En el cambio forzado, reutilizar la misma contraseña genérica se rechaza (D6).
8. Cambiada la contraseña, la marca desaparece y la navegación se normaliza sin
   volver a iniciar sesión.
9. Un usuario marcado siempre puede cerrar sesión.
10. Restablecer cierra las sesiones abiertas de esa cuenta (D8). **Pendiente
    de verificación empírica (TC-051-010, ver hallazgo de la Fase 3 en D8)**:
    el código fija la contraseña nueva, pero no invoca ningún cierre explícito
    de sesión porque el SDK admin no lo permite por `user_id`. Si TC-051-010
    muestra que la sesión anterior sigue viva, este criterio queda incumplido
    y hay que decidir con el usuario si se acepta el riesgo residual o se abre
    un spec de seguimiento (ver D8).
11. Con Supabase Auth caído, se informa de un fallo de infraestructura,
    distinto de "contraseña incorrecta", y no se reporta éxito.
12. El agente puede invocar `reset_student_password` y obtener la contraseña
    aplicada, quedando la cuenta marcada para cambio forzado.
13. El gate del cambio forzado **no** añade ninguna consulta a base de datos
    por request (D2).

## Pruebas asociadas

- **Manuales:** `docs/testing/test-051-restablecer-y-cambiar-contrasena.md` —
  casos `TC-051-001` … `TC-051-013` y `TC-MCP-051-001`.
- **Automáticas (e2e/unit):** framework aún **por definir** (ver CLAUDE.md →
  "Testing"). Cuando exista: unitarias de `ChangePasswordSchema` y una de
  integración que confirme que una contraseña actual incorrecta no llega a
  invocar `updateUser`.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-15
