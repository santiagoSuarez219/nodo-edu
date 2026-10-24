# Plan de despliegue — spec-063 (resumen mensual de inasistencias en horas)

> Preparado el 2026-10-24. **Nada de este plan se ha ejecutado.** Cada paso
> marcado con ⛔ requiere confirmación explícita del usuario en esa misma
> sesión (CLAUDE.md → "Despliegue"). El despliegue lo inicia el usuario.
> Spec: `docs/specs/spec-063-resumen-inasistencias-mensual.md` (Fase 6).
> Pruebas: `docs/testing/test-063-resumen-inasistencias-mensual.md` (20/20 ✅).

## 1. Qué viaja a producción

`git diff origin/main..deploy/spec-063` al 2026-10-24: 23 archivos, 3 commits
sin merge (`1b70a5c`, `1f32e82` de spec-063 y `cfda727`, la bitácora del
despliegue de spec-060).

| Qué | Detalle |
|---|---|
| **Esquema** (1 migración) | `20261024000000_academic_courses_hours_per_session`: columna `academic_courses.hours_per_session numeric(4,2) not null default 2` + `check (> 0 and <= 12)`. **Hay cambios de esquema: el paso 2 aplica.** Aditiva, sin policies nuevas (RLS de `academic_courses` ya cubre select/update) |
| Código de la app | Selector "Planilla / Resumen mensual" en la pestaña Asistencia, campo "Horas por sesión" en el formulario del curso, API `GET /api/attendance/courses/[courseId]/monthly-absences` |
| MCPs | `attendance-mcp`: herramienta nueva `get_monthly_absence_summary`. El `dist/` está versionado; hay que **reconectar** `attendance-mcp-prod` (`/mcp`) tras el deploy |
| Variables de entorno | **Ninguna nueva.** La API nueva usa la misma autenticación de servicio que el resto de `/api/attendance/*` |

**Orden obligatorio: migración antes que código.** El código nuevo lee y
escribe `hours_per_session`; si Vercel desplegara antes de la migración, el
formulario del curso y el resumen fallarían. El código viejo ignora la columna
nueva, así que la ventana migración → deploy es inocua.

## 2. Antes del despliegue

### 2.1 Estado verificado en producción (solo lectura, 2026-10-24)

- `GET /rest/v1/academic_courses?select=hours_per_session` → `42703 column
  academic_courses.hours_per_session does not exist`: la migración **no** está
  aplicada.

### 2.2 ⚠️ Horas por sesión de cada grupo (decisión del docente)

El default `2` (D2, sin backfill) **no es correcto para los dos grupos de
Análisis**. Según `class_time_start`/`class_time_end` en producción:

| Grupo | `academic_course_id` | Horario | Duración | Tras la migración queda en | Acción |
|---|---|---|---|---|---|
| Programación científica | `e2ed5a1e-5ab1-44e4-a9bc-31cf252ea399` | jueves 06:00–08:00 | 2 h | 2 | Ninguna |
| Estructuras de datos | `7bd3f233-c8e0-4e9e-bf2e-634b0a883756` | mar/mié/vie 10:00–12:00 | 2 h | 2 | Ninguna |
| Análisis de Algoritmos (G3) | `4b0ed2a9-1633-4ec0-afc0-6be7be809c52` | lunes 06:00–10:00 | 4 h | 2 | **Cambiar a 4** ⛔ |
| Análisis de Algoritmos (G1) | `76191ae2-7969-4956-a9c9-a873f059ad70` | viernes 13:00–16:00 | 3 h | 2 | **Cambiar a 3** ⛔ |

- [ ] El docente confirma las horas reales de cada grupo (el horario
      registrado puede incluir descansos que la institución no cuenta).
- Se cambian desde el formulario del curso (`/admin/courses/<id>` → editar →
  "Horas por sesión") **después** del deploy. Mientras no se cambien, el
  resumen de Análisis reporta la mitad / dos tercios de las horas reales:
  **no transcribir cifras de Análisis a la página oficial antes de ajustarlas.**
  El cambio recalcula retroactivamente todo el resumen (no hay histórico).

### 2.3 Checklist pre-despliegue (CLAUDE.md)

- [x] Spec afectado en `[DONE]` y mergeado a `development` (`eac5bb7`).
- [x] Rama `deploy/spec-063` creada desde `development` (mismo commit que `origin/development`).
- [x] `git diff --stat origin/main..HEAD -- supabase/` no vacío → **hay esquema** (1 migración, confirmado).
- [x] Variables de Vercel → Production: ninguna nueva.
- [x] `npm run build` y `npm run lint` locales sin errores (2026-10-24: build OK; lint 0 errores, 7 advertencias preexistentes).
- [x] Datos de prueba de la ronda manual eliminados (en `nodo-dev`, ver `test-063`; producción nunca se tocó).
- [x] Ventana fuera de clase: el 2026-10-24 es sábado; ningún grupo tiene clase el fin de semana.
- [ ] Horas por sesión de cada grupo confirmadas (2.2).
- [ ] Reconexión de `attendance-mcp-prod` prevista tras el deploy.

> Los dos archivos de `content/cursos/analisis-de-algoritmos/microdiseno/projects/`
> modificados en el árbol de trabajo **no** forman parte del despliegue: no se
> commitean en esta rama.

## 3. Ejecución

1. **Rama de despliegue** — ✅ ya creada (`deploy/spec-063` = `development`).
2. **Dry-run (obligatorio) ⛔** — `--linked` es **producción** y no lo dice.
   ```bash
   supabase db push --linked --dry-run
   ```
   Debe listar **exactamente** `20261024000000_academic_courses_hours_per_session.sql`.
   Si aparece otra, parar y reportar ([[DEBT-073]]). Mostrar la salida al
   usuario y guardarla en la bitácora.
3. **Aplicar la migración ⛔** (solo tras confirmar el dry-run)
   ```bash
   supabase db push --linked
   supabase migration list --linked
   ```
4. **Verificar el esquema** (lectura REST contra `.env.prod`):
   - `GET /rest/v1/academic_courses?select=id,hours_per_session` → `200`, los
     4 grupos en `2`.
5. **Merge a `main` ⛔** y luego **push ⛔**
   ```bash
   git checkout main && git pull origin main
   git merge deploy/spec-063 --no-ff -m "deploy: release spec-063"
   git push origin main
   ```
6. **Verificar el deploy en Vercel**: build sin errores, `https://www.nod0.dev`
   carga, login funciona. `GET /api/attendance/courses/<id>/monthly-absences`
   sin clave → `401` (no `500`). Revisar runtime errors los primeros minutos.
7. **Ajustar horas por sesión ⛔** de los grupos de Análisis (2.2), desde el
   formulario del curso (lo hace el docente en la UI).
8. **Reconectar `attendance-mcp-prod`** (`/mcp`) y comprobar que
   `get_monthly_absence_summary` responde para un grupo y que
   `get_course_attendance_summary` responde igual que antes.
9. **Limpiar la rama**
   ```bash
   git checkout development
   git branch -d deploy/spec-063
   git push origin --delete deploy/spec-063   # solo si se llegó a publicar
   ```

## 4. Después

- [ ] Pruebas visuales en producción a cargo del docente: pestaña Asistencia →
      "Resumen mensual" de un grupo real; la "Planilla" y su % sin cambios.
- [ ] Marcar en el spec la última casilla de la Fase 6 (migración aplicada a producción).
- [ ] Deudas abiertas por spec-063 en `docs/specs/backlog.md` (historial de
      rematrícula, criterios distintos de `get_course_attendance_summary`,
      [[DEBT-079]]) — **en otro ciclo**.

## 5. Rollback

- **Frontend:** Vercel → Deployments → último deployment bueno →
  `Promote to Production`. El código viejo funciona con la columna nueva.
- **Base de datos:** no hay rollback automático (CLAUDE.md). La migración es
  aditiva y no hace falta revertirla para volver al código anterior. Si se
  quisiera quitar (`alter table academic_courses drop column hours_per_session`),
  escribir el SQL y revisarlo con el usuario antes de ejecutarlo; se pierden
  los valores ajustados en 2.2.

## 6. Riesgos

| Riesgo | Efecto | Mitigación |
|---|---|---|
| Default `2` en grupos de 3 y 4 h | Horas subreportadas en Análisis | Paso 7, antes de transcribir nada (2.2) |
| Deploy de código antes que la migración | Formulario del curso y resumen fallan | Pasos 2–4 antes del 5 |
| Dry-run lista migraciones ajenas | Aplicar esquema no revisado | Parar y reportar (DEBT-073) |
| MCP `-prod` sin reconectar | El agente no ve la herramienta nueva | Paso 8 |

## 7. Registro de ejecución

| Paso | Fecha y hora | Resultado | Notas |
|---|---|---|---|
| Estado previo en producción | 2026-10-24 | ✅ Columna ausente (`42703`) | Lectura REST |
| Dry-run | 2026-10-24 | ✅ Solo la migración esperada | Proyecto enlazado `bgiimadnmqnoqmdbudpo`, CLI 2.107.0. Salida: `Would push these migrations: 20261024000000_academic_courses_hours_per_session.sql` |
| `db push` | 2026-10-24 | ✅ Migración aplicada | Ejecutado por el usuario (el modo automático bloqueó el comando a Claude). Aviso de Docker (caché del catálogo) sin efecto, igual que en spec-060 |
| Verificación del esquema | 2026-10-24 | ✅ `200` | `academic_courses?select=id,name,hours_per_session` → los 4 grupos en `2.00` |
| Merge y push a `main` | | | |
| Build de Vercel | | | |
| Horas por sesión ajustadas | | | |
| `attendance-mcp-prod` reconectado | | | |
