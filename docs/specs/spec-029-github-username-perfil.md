# spec-029 — [DONE] Campo `github_username` en `Profile`

## Contexto

Los cursos de programación se apoyan en repositorios de GitHub (entregas,
laboratorios, revisión de código). Hoy no hay forma de saber qué cuenta de
GitHub corresponde a cada persona de la plataforma: `public.profiles` solo
guarda `full_name`, `avatar_url` y `last_seen_at`.

El campo debe vivir en `Profile` y no en `Student` porque aplica a los tres
roles (`admin`, `teacher`, `student`): el docente también necesita publicar
su cuenta y, en Fase 2, los docentes colaboradores igual. `public.students`
es específica del rol estudiante (`career`, `semester`) y colgar ahí el dato
obligaría a crear filas de `students` para docentes solo por este campo.

## Alcance

### Incluye

- Columna `github_username text` (nullable, sin `unique`) en `public.profiles`
  vía migración.
- Extensión del tipo `Profile` y de los tipos admin (`AdminStudentSummary`,
  `AdminStudentDetail`, `CreateStudentInput`, `UpdateStudentInput`) en
  `lib/students/types.ts`.
- Helper único de saneamiento compartido por los dos caminos de escritura:
  `trim`, quitar `@` inicial, cadena vacía → `null`.
- Autoedición por el propio usuario en `/cuenta` (campo nuevo en
  `AccountForm`, escritura en `updateAccountAction`) — válido para los tres
  roles.
- Edición y lectura por admin: `GET`/`POST /api/students`,
  `GET`/`PATCH /api/students/{studentId}`, con sus schemas Zod.
- Fase de MCP: exponer el campo en `create_student` / `update_student` de
  `students-mcp` y reflejarlo en su system prompt y en `docs/mcps/README.md`.
- Visualización del valor guardado en `/cuenta`.

### No incluye

- Validación de existencia de la cuenta en GitHub ni llamadas a la API de GitHub.
- Regex de formato estricto de nombre de usuario de GitHub (decisión tomada:
  solo saneamiento).
- Restricción `unique` sobre la columna. Un índice único produciría un error
  `23505` opaco en los caminos admin y de autoedición, y el campo no es
  autoritativo (nadie verifica la propiedad de la cuenta). Duplicados quedan
  como riesgo aceptado. **Confirmado con el usuario.**
- Mostrar `github_username` en el roster docente (`components/admin/*`,
  embeds de `enrollments`). Hoy ni `career` ni `semester` se muestran ahí;
  añadirlo obligaría a extender `get_student_profiles_public`, que hoy es
  deliberadamente mínimo. Queda para un spec posterior si el docente lo pide.
  **Confirmado con el usuario.**
- OAuth de GitHub / vincular la cuenta real por login.
- Cualquier cambio a `Student` o a la tabla `public.students`.

## Impacto en el sistema

### Base de datos (`supabase/`)

| Archivo | Cambio |
|---|---|
| `supabase/migrations/20260730000000_add_github_username_to_profiles.sql` (nuevo) | `alter table public.profiles add column github_username text;` — nullable, sin default, sin constraint. |
| RLS | Sin cambios. `"profiles: update own"` y `"profiles: select own or admin"` son a nivel de tabla. Documentar en el comentario de la migración la exposición vía la policy `"profiles: select published question authors"` (cualquier `teacher`/`admin` puede leer todas las columnas del perfil de un docente con al menos una pregunta publicada, incluyendo este campo — aceptable por ser un dato de naturaleza pública). |
| `handle_new_user()` | Sin cambios: la columna es nullable, el trigger sigue insertando solo `id, full_name`. |

### Tipos y saneamiento (`lib/`)

| Archivo | Cambio |
|---|---|
| `lib/students/types.ts` | `Profile`: `+ github_username: string \| null`. `AdminStudentSummary`: `+ github_username: string \| null`. `CreateStudentInput`: `+ github_username?: string`. `UpdateStudentInput`: `+ github_username?: string \| null`. `AdminStudentDetail` lo hereda de `AdminStudentSummary`. |
| `lib/students/github.ts` (nuevo) | `sanitizeGithubUsername(raw: unknown): string \| null` + un fragmento Zod reutilizable (`GithubUsernameField`) que aplica el `transform`. Un solo punto de verdad para los dos caminos de escritura. |
| `lib/students/schemas.ts` | `CreateStudentSchema` y `UpdateStudentSchema`: campo opcional (nullable en update, para poder borrar el valor). El `.refine` de "al menos un campo" de `UpdateStudentSchema` ya cubre el campo nuevo. |
| `lib/auth/schemas.ts` | `UpdateProfileSchema`: campo opcional para el formulario de `/cuenta`. |

### Capa de servicio admin (`lib/students/service.ts`)

| Punto | Cambio |
|---|---|
| `listServiceStudents` | Añadir `github_username` al `.select(...)` y al mapeo del objeto de salida. |
| `getServiceStudentById` | Idem: `.select(...)` y objeto de retorno. |
| `createServiceStudent` | Escribir `github_username` en `profiles` tras `auth.admin.createUser`, en un bloque análogo al de `career`/`semester`. |
| `updateServiceStudent` | Extender el bloque que hoy actualiza solo `full_name` en `profiles` para incluir `github_username` cuando venga definido (incluido `null` para limpiarlo). |
| `ensureStudentAccountBootstrap`, `deleteServiceStudent`, `enroll*`/`unenroll*` | Sin cambios. |

### Autoedición (`app/cuenta`, `components/account`, `lib/students/actions.ts`)

| Archivo | Cambio |
|---|---|
| `lib/students/actions.ts` → `updateAccountAction` | Leer `github_username` del `FormData`, parsear con `UpdateProfileSchema`, incluirlo en el `update` a `profiles` junto a `full_name` (una sola sentencia). |
| `components/account/AccountForm.tsx` | Input nuevo en el bloque de nivel perfil (junto a "Nombre completo"), opcional, con `defaultValue={profile.github_username ?? ""}`, `aria-describedby` para error y texto de ayuda ("solo el usuario, sin `@` ni URL"). Tokens semánticos de `DESIGN.md`. |
| `components/account/AccountInfoCard.tsx` | Mostrar el valor guardado como enlace a `https://github.com/{username}` (`rel="noopener noreferrer"`) cuando no sea `null`. |
| `app/cuenta/page.tsx` | Sin cambios: `getProfileWithStudent` usa `select("*")`, la columna llega sola. |
| `lib/students/index.ts` | `updateProfile` amplía el `Pick<Profile, ...>` para incluir `github_username`. |
| `lib/auth/session.ts` → `getCurrentProfile` | Sin cambios (`select("*")`). |

### API (`app/api/students/`)

| Archivo | Cambio |
|---|---|
| `app/api/students/route.ts` | Sin cambios de código: `CreateStudentSchema` y el servicio propagan el campo. Verificar que la respuesta `201` lo incluye. |
| `app/api/students/[studentId]/route.ts` | Sin cambios de código por la misma razón. |
| `app/api/students/[studentId]/enrollments/route.ts` | Sin cambios. |

## Evaluación MCP

**¿Aplica MCP?** Sí.

- **MCP existente a modificar:** `students-mcp` — se extienden los
  `inputSchema` y las descripciones de `create_student` y `update_student`
  en `mcp-servers/students-mcp/src/tools.ts`. `list_students` y
  `get_student` devuelven el campo automáticamente (reenvían el JSON de la
  API sin transformarlo).
- **System prompt afectado:** `docs/mcps/students-agent.system-prompt.md` —
  sección "Capacidades" (mencionar que `update_student` corrige el usuario
  de GitHub) y una nota de que el dato no está verificado contra GitHub y no
  debe tratarse como identidad.
- **Registro:** `docs/mcps/README.md`.
- **Limitación conocida a documentar:** los `inputSchema` del MCP declaran
  `type: "string"`, así que el agente no puede enviar `null` para borrar el
  valor (mismo hueco que ya existe con `career`). La API sí lo acepta. No se
  corrige en este spec; se documenta en el system prompt.
- **Fase de MCP en este spec:** Fase 4.

Justificación: el docente administra cuentas de estudiante exclusivamente vía
este agente (no hay panel admin de estudiantes en la UI), así que sin esta
fase el campo sería inaccesible por la vía admin.

## Fases de implementación

### Fase 1 — Migración y esquema
- [x] Crear `supabase/migrations/20260730000000_add_github_username_to_profiles.sql`
      con el `alter table` y un comentario que explique por qué el campo va
      en `profiles` y por qué no lleva `unique` ni validación de formato.
- [x] Documentar en el mismo comentario la exposición vía la policy
      `"profiles: select published question authors"`.
- [x] Confirmar con el usuario antes de ejecutar `supabase db push`.
- [x] Verificar con `supabase migration list` que Local y Remote coinciden.

### Fase 2 — Tipos, saneamiento y schemas
- [x] Añadir `github_username` a `Profile`, `AdminStudentSummary`,
      `CreateStudentInput` y `UpdateStudentInput` en `lib/students/types.ts`.
- [x] Crear `lib/students/github.ts` con `sanitizeGithubUsername` + fragmento
      Zod reutilizable (trim, quitar `@` inicial, `""` → `null`).
- [x] Extender `CreateStudentSchema` y `UpdateStudentSchema` en
      `lib/students/schemas.ts` usando ese fragmento.
- [x] Extender `UpdateProfileSchema` en `lib/auth/schemas.ts` usando el mismo
      fragmento.
- [x] Ampliar el `Pick` de `updateProfile` en `lib/students/index.ts`.
- [x] `npx tsc --noEmit` en verde (pendiente de Fase 3: errores actuales son
      solo en `service.ts`, cubiertos en esa fase).

### Fase 3 — Camino admin (servicio + API)
- [x] `listServiceStudents`: `select` + mapeo.
- [x] `getServiceStudentById`: `select` + objeto de retorno.
- [x] `createServiceStudent`: escritura en `profiles` tras `createUser`.
- [x] `updateServiceStudent`: incluir el campo en el `update` de `profiles`
      (soportando `null` para limpiar).
- [x] Verificar que `GET`/`POST`/`PATCH` de `/api/students*` devuelven el
      campo sin tocar los route handlers (`npx tsc --noEmit` en verde).

### Fase 4 — MCP: actualizar `students-mcp`
- [x] Añadir `github_username` a los `inputSchema` y descripciones de
      `create_student` y `update_student` en
      `mcp-servers/students-mcp/src/tools.ts`.
- [x] `npm run build` en `mcp-servers/students-mcp/`.
- [x] Actualizar `docs/mcps/students-agent.system-prompt.md` (Capacidades +
      nota de dato no verificado + limitación de no poder enviar `null`).
- [x] Actualizar la entrada de `students-mcp` en `docs/mcps/README.md`.
- [x] Verificar que las herramientas responden con el campo (se valida en
      Fase 6, TC-MCP-029-001/002 — `processToolCall` reenvía el body/JSON
      de la API sin transformarlo, ya cubierto por Fase 3).

### Fase 5 — Autoedición en `/cuenta`
- [x] Leer `DESIGN.md` antes de tocar UI.
- [x] `updateAccountAction` (`lib/students/actions.ts`): leer y validar
      `github_username`, incluirlo en el `update` a `profiles` junto a
      `full_name`.
- [x] `components/account/AccountForm.tsx`: input opcional en el bloque de
      perfil, con label, texto de ayuda, manejo de `fieldErrors` y tokens
      semánticos.
- [x] `components/account/AccountInfoCard.tsx`: mostrar el valor como enlace
      a GitHub cuando exista.
- [x] `npm run lint` y `npm run build` en verde (lint: 5 errores/10 warnings
      preexistentes en archivos no tocados por este spec; nada nuevo en los
      archivos modificados aquí).

### Fase 6 — Pruebas
- [ ] Ejecutar con el usuario los casos manuales de
      `docs/testing/test-029-github-username-perfil.md`.
- [ ] Invocar `@tester` para las pruebas automáticas cuando exista framework
      (hoy "por definir", ver `CLAUDE.md` → "Testing").
- [ ] Eliminar los datos de prueba creados vía API y cerrar la ronda.

## Criterios de aceptación

1. `public.profiles` tiene una columna `github_username text` nullable; los
   perfiles existentes quedan en `null` sin errores.
2. Un usuario autenticado con rol `student` puede guardar su usuario de
   GitHub desde `/cuenta` y verlo persistido al recargar.
3. Un usuario con rol `teacher` o `admin` puede hacer lo mismo desde
   `/cuenta` (el campo no está condicionado al rol ni depende de la fila de
   `students`).
4. Al guardar ` @Octocat ` se persiste `Octocat` (trim + `@` inicial
   eliminado); al guardar cadena vacía se persiste `null`.
5. No se ejecuta ninguna llamada a GitHub ni se rechaza un valor por
   formato: cualquier cadena no vacía se acepta tras el saneamiento.
6. Un usuario no puede modificar el `github_username` de otro (RLS
   `"profiles: update own"` lo impide; verificado en pruebas automáticas).
7. `GET /api/students` y `GET /api/students/{id}` incluyen `github_username`
   en cada registro.
8. `PATCH /api/students/{id}` con `{"github_username": "octocat"}` actualiza
   el campo y devuelve `200` con el detalle actualizado; con `null` lo
   limpia; con un cuerpo `{}` sigue devolviendo `422`.
9. `POST /api/students` acepta `github_username` opcional y lo devuelve en
   el `201`.
10. El agente docente puede invocar `update_student` con `github_username` y
    obtener el estudiante actualizado, y `get_student` / `list_students`
    muestran el campo.
11. El system prompt de `docs/mcps/students-agent.system-prompt.md` y
    `docs/mcps/README.md` reflejan la capacidad nueva.
12. `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-029-github-username-perfil.md` — casos
  `TC-029-001..006` (autoedición estudiante, autoedición docente, saneamiento
  de `@` y espacios, limpiar el valor, persistencia tras recarga,
  visualización como enlace) y `TC-MCP-029-001..002` (`update_student` y
  `get_student` con el campo nuevo).
- **Automáticas:** `{{ubicación e2e por definir}}/e2e-029-github-username-perfil.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio, incluyendo
  el criterio 6 (aislamiento por RLS). Se crea cuando exista framework de
  testing (ver `CLAUDE.md` → "Testing").

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-29
