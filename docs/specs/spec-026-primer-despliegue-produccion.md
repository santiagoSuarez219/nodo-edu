# spec-026 — `[NOT STARTED]` Preparación del primer despliegue a producción (Vercel + Supabase) + configuración de MCPs

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.
> Este spec **prepara y verifica** el primer despliegue; el acto de desplegar
> (merge a `main`, push, migraciones prod) queda como fase final **gated** 🔒
> que ejecuta el usuario con confirmación explícita en la misma sesión.

---

## Contexto

`main` nunca ha recibido un despliegue real: este es el **primer despliegue a
producción** de Nodo. La rama `development` va **163 commits adelante de `main`**.
El objetivo es dejar el proyecto **verificado y listo para desplegar** (build,
variables de entorno, configuración de proyecto, RLS, redirect URLs de Auth,
checklist pre-despliegue completo), reservando el despliegue en sí como una fase
final gated conforme a la sección "Despliegue" de `CLAUDE.md`.

Tras el despliegue, los tres MCPs del ecosistema (`question-bank-mcp`,
`assignment-mcp`, `attendance-mcp`) —hoy apuntando a `localhost:3000`— deben
reconfigurarse para consumir la API pública de Vercel con una **API key de
producción distinta de la local**. El usuario pidió expresamente que esta
configuración de MCPs vaya **al final**.

**Riesgo crítico identificado:** `lib/auth/actions.ts` usa
`process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` para construir los
redirects de OAuth y recuperación de contraseña. Si `NEXT_PUBLIC_SITE_URL` no
queda correctamente seteada en Vercel y en las Redirect URLs de Supabase Auth,
los flujos de autenticación se romperán en producción.

## Alcance

### Incluye
- Verificación de precondiciones: specs bloqueantes en `[DONE]`, build y lint
  verdes, migraciones sincronizadas (Local == Remote).
- Revisión y ajuste (solo si aplica) de configuración de proyecto:
  `next.config.ts`, `package.json` (`engines.node`), evaluación de `vercel.json`.
- Actualización de `.env.example` para reflejar **todas** las variables reales
  (incluida la documentación de `TEACHER_EMAIL`/`TEACHER_PASSWORD` como solo-seed).
- Definición exacta de las variables de entorno de Production en Vercel y su origen.
- Verificación de Supabase producción: migraciones aplicadas, políticas RLS por
  tabla, Site URL y Redirect URLs de Auth, buckets/Storage.
- Creación de la rama `deploy/vX.Y.Z` y ejecución del despliegue **gated**
  (merge a `main`, push, migraciones) bajo confirmación explícita.
- Reconfiguración de los 3 MCPs para apuntar a la URL de producción con API key
  de producción (fase final).
- Smoke tests post-deploy de los flujos críticos + verificación de las API routes
  con la API key de prod.

### No incluye
- Automatizar el deploy (CI/CD custom, GitHub Actions de deploy): Vercel ya
  despliega por push a `main`.
- Cambios funcionales de la aplicación (features nuevas, refactors no
  relacionados con el deploy).
- Implementar o corregir specs bloqueantes (spec-020, spec-024): son precondición
  externa a este spec.
- Crear o modificar herramientas de los MCPs: solo se reconfigura el
  endpoint/credencial, sin tocar capacidades.
- Configurar dominio custom (más allá de la URL asignada por Vercel), salvo que
  el usuario lo indique.
- Commitear valores reales de variables de entorno o API keys.

## Impacto en el sistema

- **Configuración de proyecto:** `next.config.ts`, `package.json`, posible
  `vercel.json` (a evaluar), `.env.example`.
- **Rutas y auth:** ninguna ruta nueva; se valida el comportamiento existente de
  `lib/auth/actions.ts` (redirects) y `middleware.ts` bajo el dominio de producción.
- **Base de datos (Supabase remoto, ref `bgiimadnmqnoqmdbudpo`):** sin cambios de
  esquema propios del spec; se **verifica** que las 25 migraciones estén aplicadas
  y que las políticas RLS de todas las tablas sean correctas.
- **Auth/Storage (Supabase):** Site URL y Redirect URLs deben incluir el dominio
  de Vercel; revisión de buckets de Storage si se sirven imágenes/PDFs.
- **Infra (Vercel):** primer proyecto conectado a `main`; variables de entorno de
  Production.
- **MCPs:** `claude_desktop_config.json` (fuera del repo), `docs/mcps/README.md`,
  y los system prompts en `docs/mcps/` si procede reflejar el endpoint de producción.
- **Git:** rama `deploy/vX.Y.Z`; merge a `main` (primer merge real).

## Evaluación MCP

**¿Aplica MCP?** Sí — pero **solo reconfiguración**, sin nuevas herramientas ni
cambios de capacidad.

- **MCP existente a modificar:** los tres (`question-bank-mcp`, `assignment-mcp`,
  `attendance-mcp`) cambian su variable de base URL de `http://localhost:3000/api/*`
  a la URL pública de Vercel, y su API key de local a la de producción. **No se
  agregan ni modifican herramientas.**
- **MCP nuevo a crear:** ninguno.
- **System prompts afectados:** `docs/mcps/question-bank-agent.system-prompt.md`,
  `docs/mcps/assignment-agent.system-prompt.md`,
  `docs/mcps/attendance-agent.system-prompt.md` — revisar si mencionan
  endpoint/entorno; actualizar **solo** si describen el destino. Las capacidades
  declaradas no cambian.
- **Fase de MCP en este spec:** Fase 7 (al final, tras el despliegue).

> Justificación de que no hay herramientas nuevas: el spec no expone datos ni
> acciones nuevas a los agentes; reapunta clientes existentes a producción. La API
> sigue protegida por `QUESTION_BANK_API_KEY` vía `lib/api/auth.ts`.

## Fases de implementación

### Fase 1 — Precondiciones y bloqueadores (gate de entrada)
> No produce cambios; **verifica** que se puede proceder. Si algo falla, el spec
> se detiene aquí.

- [ ] Confirmar que **spec-020** está en `[DONE]` y mergeado a `development`
      (hoy corregido a `[NOT STARTED]`; es bloqueante).
- [ ] Confirmar que **spec-024** (`[IN PROGRESS]`) está en `[DONE]` y mergeado a
      `development`.
- [ ] Confirmar que no quedan otros specs `[IN PROGRESS]`/`[TESTING]` que deban
      entrar en este release.
- [ ] Confirmar rama activa `development` sincronizada con `origin/development`.
- **Archivos impactados:** lectura de `docs/specs/` (sin edición).

### Fase 2 — Verificación local de build, lint y migraciones
- [ ] `npm run build` pasa sin errores.
- [ ] `npm run lint` pasa sin errores.
- [ ] `supabase migration list` muestra columnas Local y Remote **coincidentes**
      (25 migraciones aplicadas al proyecto remoto).
- [ ] Registrar en el spec cualquier warning de build relevante para producción.
- **Archivos impactados:** ninguno (solo verificación).

### Fase 3 — Configuración de proyecto para producción
- [ ] Revisar `next.config.ts` (hoy stub vacío) y **evaluar** si producción
      requiere: `images.remotePatterns` para servir imágenes desde Supabase
      Storage (si el contenido las usa), headers de seguridad u otras opciones.
      Ajustar **solo** si hay necesidad real; no imponer configuración especulativa.
- [ ] **Evaluar y decidir** si se añade `engines.node` a `package.json` para fijar
      la versión de Node en Vercel; documentar la versión elegida.
- [ ] **Evaluar necesidad de `vercel.json`**: con el framework preset de Next.js
      probablemente **no** es necesario; justificar la decisión (crear solo si hay
      override real de build/rutas/regiones).
- [ ] Actualizar `.env.example` para reflejar **todas** las variables reales del
      runtime y documentar `TEACHER_EMAIL`/`TEACHER_PASSWORD` como **solo-seed**.
      Verificar que `NEXT_PUBLIC_SITE_URL`/`QUESTION_BANK_API_BASE_URL` indiquen
      claramente su valor de producción esperado.
- **Archivos impactados:** `next.config.ts` (posible), `package.json` (posible
  `engines`), `vercel.json` (solo si se justifica), `.env.example`.

### Fase 4 — Variables de entorno en Vercel (Production)
> El usuario configura las variables en el panel de Vercel; el spec entrega la
> lista exacta y su origen. Claude **no** modifica variables directamente.

- [ ] Producir la tabla definitiva de variables de Production con su origen:

  | Variable | Origen / valor de producción |
  |----------|------------------------------|
  | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase remoto |
  | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública Supabase |
  | `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (server-only) |
  | `NEXT_PUBLIC_SITE_URL` | **URL final de producción de Vercel** (crítico para redirects de auth; ver `lib/auth/actions.ts`) |
  | `QUESTION_BANK_API_KEY` | **API key de producción** (distinta de la local) que protege `/api/questions\|assignments\|attendance` |
  | `QUESTION_BANK_AGENT_TEACHER_ID` | Id del docente para las API routes de agente |

- [ ] Confirmar que `TEACHER_EMAIL`/`TEACHER_PASSWORD` **no** se cargan en Vercel
      (son solo del seed script local).
- [ ] Definir el valor de producción de `QUESTION_BANK_API_KEY` y dejar constancia
      de que se compartirá al usuario por canal seguro, **nunca commiteado**.
- **Archivos impactados:** ninguno en repo (configuración en Vercel).

### Fase 5 — Supabase producción: migraciones, RLS, Auth y Storage
- [ ] Confirmar (re-verificar tras Fase 2) que todas las migraciones están
      aplicadas al proyecto remoto.
- [ ] Revisar que **todas las tablas** tienen RLS habilitado y políticas correctas
      por rol (admin/docente/estudiante/visitante) antes de exponer la app.
- [ ] Configurar en Supabase Auth el **Site URL** y las **Redirect URLs** para
      incluir el dominio de Vercel (necesario para OAuth y recuperación de
      contraseña; enlaza con el riesgo de `NEXT_PUBLIC_SITE_URL`).
- [ ] Revisar buckets de Storage y sus políticas si se sirven PDFs/imágenes;
      confirmar acceso público/privado según el diseño.
- [ ] Documentar que `supabase db push` (Fase 6) aplica al mismo proyecto remoto y
      requiere confirmación explícita.
- **Archivos impactados:** ninguno en repo; posibles migraciones nuevas **solo** si
  la revisión RLS detecta un hueco (proponer al usuario antes de crearlas).

### Fase 6 — Rama de despliegue y deploy real (GATED) 🔒
> **Cada subpaso de merge/push/migración requiere confirmación explícita del
> usuario en la misma sesión.** Claude prepara y verifica; el usuario autoriza.

- [ ] Completar el **Checklist pre-despliegue** de `CLAUDE.md`.
- [ ] Crear rama `deploy/vX.Y.Z` desde `development`.
- [ ] **[GATE 🔒]** Aplicar migraciones a producción si aplica (`supabase db push`).
- [ ] **[GATE 🔒]** Merge `deploy/vX.Y.Z` → `main` (`--no-ff`).
- [ ] **[GATE 🔒]** Push a `main` → Vercel dispara build automático.
- [ ] Verificar en Vercel que el build terminó sin errores y capturar la **URL de
      producción final** (necesaria para Fases 7 y 8; si difiere de la asumida en
      Fase 4, actualizar `NEXT_PUBLIC_SITE_URL` y Redirect URLs de Supabase antes
      de continuar).
- [ ] Limpiar la rama `deploy/vX.Y.Z` tras confirmar el despliegue.
- **Archivos impactados:** historial git (`main`), sin cambios de código.

### Fase 7 — MCP: actualizar configuración de los 3 MCPs a producción 🔒
> Al final por decisión del usuario. Requiere la URL de producción real (Fase 6)
> y la API key de producción (Fase 4).

- [ ] Actualizar la configuración de los 3 MCPs en `claude_desktop_config.json`
      (fuera del repo) para que las base URL apunten a
      `https://<url-prod-vercel>/api/*` y usen la **API key de producción**.
      **No commitear la key.**
- [ ] Actualizar `docs/mcps/README.md` si documenta endpoints/entorno (reflejar
      que existe configuración de producción además de la local).
- [ ] Revisar los 3 system prompts (`docs/mcps/*-agent.system-prompt.md`) y
      ajustarlos **solo** si describen endpoint/entorno; las capacidades no cambian.
- [ ] Reiniciar Claude Desktop y confirmar que los 3 MCPs cargan contra producción.
- **Archivos impactados:** `claude_desktop_config.json` (local, sin commit de
  secretos), `docs/mcps/README.md`, `docs/mcps/question-bank-agent.system-prompt.md`,
  `docs/mcps/assignment-agent.system-prompt.md`,
  `docs/mcps/attendance-agent.system-prompt.md`.

### Fase 8 — Smoke tests post-deploy
> Ejecución de flujos críticos sobre la URL de producción. Las pruebas visuales/UI
> las ejecuta el usuario (ver `CLAUDE.md`); Claude prepara datos vía API y registra
> hallazgos. La verificación de API routes con la key de prod valida a su vez el
> backend que consumen los MCPs.

- [ ] Carga de la home pública sin errores de consola.
- [ ] Login de estudiante y redirección a `/cuenta/cursos`.
- [ ] Verificar redirect de recuperación de contraseña / OAuth (confirma
      `NEXT_PUBLIC_SITE_URL` y Redirect URLs de Supabase).
- [ ] Lectura de una lección MDX con **Mermaid, YouTube embed y KaTeX** renderizando.
- [ ] Flujo de enrollment y persistencia de progreso de lección.
- [ ] Flujo de autoevaluación.
- [ ] Flujo de asistencia (attendance).
- [ ] Flujo de assignment (variantes A/B/C).
- [ ] Verificar `/api/questions`, `/api/assignments`, `/api/attendance` respondiendo
      con la **API key de producción** (valida además que los MCPs de Fase 7 operan).
- [ ] Registrar hallazgos; los bugs fuera de scope van a `docs/specs/backlog.md`.
- **Archivos impactados:** `docs/testing/test-026-primer-despliegue-produccion.md`
  (registro), `docs/specs/backlog.md` (si surgen hallazgos).

## Criterios de aceptación

- spec-020 y spec-024 están en `[DONE]` y mergeados a `development` antes de
  iniciar cualquier acción de despliegue.
- `npm run build` y `npm run lint` pasan sin errores; `supabase migration list`
  muestra Local == Remote.
- `.env.example` documenta todas las variables reales, incluidas
  `TEACHER_EMAIL`/`TEACHER_PASSWORD` marcadas como solo-seed.
- La decisión sobre `next.config.ts`, `engines.node` y `vercel.json` queda
  documentada y justificada en el spec.
- Todas las variables de Production están presentes en Vercel;
  `NEXT_PUBLIC_SITE_URL` apunta a la URL final de producción.
- Supabase producción: RLS verificado en todas las tablas y Site/Redirect URLs de
  Auth incluyen el dominio de Vercel.
- El merge a `main`, el push y las migraciones prod ocurren **solo tras
  confirmación explícita del usuario**; ningún paso de deploy se automatiza.
- Tras el push, Vercel completa el build sin errores y la app carga en la URL de
  producción.
- Los 3 MCPs apuntan a la URL de producción con la API key de producción (distinta
  de la local) y cargan correctamente en Claude Desktop; ninguna API key real queda
  commiteada.
- Los smoke tests de home, login, lección MDX (Mermaid/YouTube/KaTeX), enrollment,
  progreso, autoevaluación, asistencia y assignment pasan; las API routes responden
  con la key de prod.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-026-primer-despliegue-produccion.md` — casos
  `TC-026-NNN` (smoke tests post-deploy con UI) y `TC-MCP-026-NNN` (MCPs contra prod).
- **Automáticas (e2e/unit):** el framework de testing sigue "por definir"
  (ver `CLAUDE.md` → Testing). No se crea archivo e2e hasta que exista framework;
  los criterios de aceptación se validan por ahora con las pruebas manuales.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{pendiente}}
