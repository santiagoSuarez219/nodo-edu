# Plan de despliegue — spec-060 (nota de autoevaluaciones por lecciones dictadas)

> Preparado el 2026-10-22. **Nada de este plan se ha ejecutado.** Cada paso
> marcado con ⛔ requiere confirmación explícita del usuario en esa misma
> sesión (CLAUDE.md → "Despliegue"). El despliegue lo inicia el usuario.
> Spec: `docs/specs/spec-060-autoevaluacion-por-lecciones-dictadas.md` (Fase 0,
> Fase 7). Pruebas: `docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`.

## 1. Qué viaja a producción

`git diff origin/main..development` al 2026-10-22: 32 archivos, 9 commits.
Todo es de spec-060, salvo una bitácora (`docs/preparacion-semanal/semana-12.md`).

| Qué | Detalle |
|---|---|
| **Esquema** (3 migraciones) | `20261022000000_init_taught_lessons`, `20261022000001_rls_taught_lessons`, `20261022000002_self_assessment_by_taught_lessons`. **Hay cambios de esquema: el paso 2 aplica.** |
| Código de la app | Pestaña "Contenido" del docente, API `/api/courses/[courseSlug]/groups/**`, `/api/students/[studentId]/self-assessment` con `academic_course_id`, tarjeta del estudiante, `markLessonViewed` sin recálculo |
| MCPs | `courses-mcp` (3 herramientas nuevas) y `students-mcp` (1 modificada). El `dist/` está versionado; hay que **reconectar** los MCP `-prod` (`/mcp`) tras el deploy |
| Variables de entorno | **Ninguna nueva.** Confirmar que `COURSES_ADMIN_API_KEY` y `STUDENTS_ADMIN_API_KEY` ya están en Vercel → Production |
| Skill `class-material-prep` (paso D7) | **No viaja**: `.claude/` está en `.gitignore`. Solo existe en la máquina del docente |

Impacto sobre datos: la migración **no recalcula** ninguna nota. Las notas
existentes cambian cuando ocurre el primer recálculo de cada grupo (marcado
inicial) o el primer envío de un estudiante.

## 2. Antes del despliegue

### 2.1 Fase 0 — diagnóstico en producción (solo lectura) ⛔

Requiere autorización explícita del usuario para leer producción. Script
preparado y probado contra `nodo-dev`: `scripts/diagnostico-spec060.mjs`
(solo `.select()`, sin nombres ni correos de estudiantes).

```bash
node --env-file=.env.prod scripts/diagnostico-spec060.mjs --out ~/diagnostico-spec060-antes.json
```

Guardar la foto **fuera del repo** (tiene ids y notas). Qué revisar:

- [ ] Lista de grupos activos y su `course_slug` (insumo del marcado inicial).
- [ ] **DEBT-098:** ningún grupo con `⚠️ ítem MANUAL llamado "Autoevaluaciones"`.
      Si aparece alguno, **no desplegar** hasta que el docente renombre ese
      ítem: el marcado de ese grupo fallaría entero (`23502`, rollback).
- [ ] Nota actual de cada matrícula (línea base para la comparación).
- [ ] Lecciones con más actividad por grupo (ayuda al docente a decidir qué marcar).

### 2.2 Lista de lecciones dictadas por grupo (decisión del docente, D13)

Sin backfill automático. Completar antes de la ventana, para que el marcado sea
**una llamada por grupo**:

| Grupo | `academic_course_id` | Lecciones dictadas (slugs) | Confirmada por el docente |
|---|---|---|---|
| | | | ⬜ |

Cada lista se valida con `list_taught_lessons` (slugs exactos, que no sean
guías).

### 2.3 Comunicar a los estudiantes

Antes del deploy: su nota puede bajar, porque las lecciones dictadas que no
abrieron empiezan a contar como 0. Borrador:

> A partir de [fecha] la nota de autoevaluaciones se calcula sobre las
> lecciones que el docente marque como vistas en clase, no sobre las que tú
> abres. Si una lección ya vista en clase no tiene respuestas tuyas, cuenta
> como 0, pero puedes responderla cuando quieras y tu nota se actualiza. Tu
> nota aparece en "Mis cursos" → tu curso → Autoevaluaciones.

### 2.4 Checklist pre-despliegue (CLAUDE.md)

- [x] Spec afectado en `[DONE]` y mergeado a `development` (`6180cc1`).
- [ ] `git diff --stat origin/main..HEAD -- supabase/` no vacío → **hay esquema** (3 migraciones, confirmado).
- [ ] Variables de Vercel → Production verificadas (ver tabla de arriba).
- [ ] `npm run build` y `npm run lint` locales sin errores (tsc y lint ya pasaron en la revisión; el **build no se ha corrido**).
- [ ] Datos de prueba de las rondas manuales eliminados (en `nodo-dev` hecho; producción nunca se tocó).
- [ ] Ventana elegida **fuera del horario de clase** de todos los grupos (los horarios están en `academic_courses.class_days` / `class_time_*`).
- [ ] Reconexión de los MCP `-prod` prevista tras el deploy.

## 3. Ejecución (en una sola sesión, pasos seguidos)

> ⚠️ **Ventana migración → deploy.** Entre el `db push` y el fin del build de
> Vercel, el código viejo sigue llamando a `recalculate_self_assessment_grade`
> cada vez que un estudiante abre una lección por primera vez. Con
> `taught_lessons` vacía, la nota de ese estudiante pasa a `null`. Se recupera
> sola con el marcado inicial, pero conviene que sea corta: hacer los pasos 3 a 6
> sin pausas.

1. **Rama de despliegue**
   ```bash
   git checkout development && git pull origin development
   git checkout -b deploy/spec-060
   ```
2. **Dry-run (obligatorio) ⛔** — `--linked` es **producción** y no lo dice.
   ```bash
   supabase db push --linked --dry-run
   ```
   Debe listar **exactamente** las 3 migraciones `20261022*`. Si aparece alguna
   otra, parar y reportar (riesgo de DEBT-073). Mostrar la salida al usuario y
   guardarla en la bitácora.
3. **Aplicar migraciones ⛔** (solo tras confirmar el dry-run)
   ```bash
   supabase db push --linked
   supabase migration list --linked
   ```
4. **Verificar el esquema** (lectura REST contra `.env.prod`):
   - `GET /rest/v1/taught_lessons?select=academic_course_id&limit=1` → `200` y `[]`.
   - Con la clave **anon**, `POST /rest/v1/rpc/set_lessons_taught_internal` con ids
     ficticios → debe responder `42501` (permiso denegado). Repite lo mismo con
     `apply_self_assessment_grade` y `recalculate_course_self_assessment_grades_internal`.
     (En `nodo-dev` esto pasó con `authenticated` y `anon`.)
5. **Merge a `main` ⛔** (y luego **push ⛔**)
   ```bash
   git checkout main && git pull origin main
   git merge deploy/spec-060 --no-ff -m "deploy: release spec-060"
   git push origin main
   ```
6. **Verificar el deploy en Vercel**: build sin errores, `https://www.nod0.dev`
   carga, login y lectura de un curso funcionan.
7. **Reconectar los MCP `-prod`** (`/mcp`) y comprobar que
   `list_course_groups` responde.
8. **Marcado inicial ⛔** — un lote por grupo, con `courses-mcp-prod`, nombrando
   grupo, lecciones y dirección al docente antes de cada llamada:
   `list_course_groups` → `list_taught_lessons` → `set_lessons_taught`
   (`taught: true`). Registrar `changed_slugs`, `recalculated_count` y cualquier
   `warning: lesson_disabled`. Como alternativa, desde la pestaña Contenido
   (lección por lección).
9. **Comparar contra la Fase 0**
   ```bash
   node --env-file=.env.prod scripts/diagnostico-spec060.mjs --compare ~/diagnostico-spec060-antes.json
   ```
   Esperado: bajan las notas de quien no abrió lecciones ya dictadas; ningún
   estudiante de un grupo con marcas queda en "sin nota" si hay lecciones con
   preguntas; los grupos sin marcar siguen en su valor previo o en `null`.
10. **Limpiar la rama**
    ```bash
    git branch -d deploy/spec-060
    git push origin --delete deploy/spec-060   # solo si se llegó a publicar
    ```

## 4. Después

- [ ] **Repetir TC-060-12 paso 3** (confirmación inline al desmarcar una marca
      huérfana): quedó sin evidencia en navegador (ver `test-060`).
- [ ] **DEBT-097:** migración que elimina `self_assessment_breakdown(uuid, text)`,
      **en otro ciclo**, cuando el deploy esté confirmado.
- [ ] **DEBT-098:** corregir `apply_self_assessment_grade` ante un ítem manual
      llamado "Autoevaluaciones".
- [ ] Repetir en producción `has_function_privilege` de las tres funciones
      internas (en `nodo-dev` se verificó por comportamiento, no literalmente).
- [ ] No desplegar spec-059 el mismo día, para poder atribuir cualquier cambio
      de nota a uno solo (spec-060, "Relación con spec-059").

## 5. Rollback

- **Frontend:** Vercel → Deployments → último deployment bueno →
  `Promote to Production`. En segundos.
- **Base de datos: no hay rollback automático** (CLAUDE.md). Las migraciones son
  aditivas (tabla y funciones nuevas), pero:
  - `apply_self_assessment_grade(uuid, uuid, text)` se **eliminó** y
    `recalculate_self_assessment_grade(text)` se **redefinió** sobre la regla
    nueva. Si se vuelve al código viejo, este seguirá funcionando (conserva
    `self_assessment_breakdown(uuid, text)` y las firmas que usa), pero cada
    recálculo aplicará la regla **nueva**: con `taught_lessons` vacía, las
    notas pasan a `null`.
  - Volver a la regla vieja exige un SQL de reversión (restaurar las funciones
    de `20260802000004_self_assessment_grade_rpcs.sql`) **que no está
    preparado**. Si se decide, escribirlo y revisarlo con el usuario antes de
    ejecutar nada; escalar primero.
- Un marcado equivocado se corrige con `set_lessons_taught` (`taught: false`) o
  desde Contenido: recalcula el grupo en el mismo acto.

## 6. Riesgos

| Riesgo | Efecto | Mitigación |
|---|---|---|
| Notas bajan al desplegar | Quejas de estudiantes | Comunicarlo antes (2.3) |
| Ventana migración → deploy | Notas en `null` al abrir una lección | Pasos 3 a 6 seguidos, fuera de clase |
| Ítem manual "Autoevaluaciones" en algún grupo (DEBT-098) | El marcado de ese grupo falla entero | Detectarlo en la Fase 0 y renombrar antes |
| Docente olvida marcar una lección dictada | No cuenta para la nota | Paso D7 de la skill (solo local); cabecera "N marcadas" en Contenido |
| Marcar una lección cerrada | No cuenta hasta abrirla | `warning: lesson_disabled` en la respuesta |
| `npm run build` no probado | Fallo de build en Vercel | Correrlo en 2.4 antes de la rama de despliegue |

## 7. Registro de ejecución

| Paso | Fecha y hora | Resultado | Notas |
|---|---|---|---|
| Fase 0 (foto previa) | | | |
| Comunicación a estudiantes | | | |
| Dry-run | | | salida guardada: |
| `db push` | | | |
| Verificación del esquema | | | |
| Merge y push a `main` | | | |
| Build de Vercel | | | |
| Marcado inicial (por grupo) | | | |
| Comparación contra Fase 0 | | | |
