# CLAUDE.md — Nodo

> Este archivo es la fuente de verdad para Claude Code en este proyecto.
> Léelo completo antes de ejecutar cualquier acción.

---

## Inicialización de sesión

Antes de cualquier tarea, Claude debe ejecutar estos pasos en orden:

1. Leer este archivo completo.
2. Leer `DESIGN.md` si la tarea involucra UI.
3. Revisar los subagentes disponibles en `/.claude/agents/` y las skills
   disponibles en `/.claude/skills/` para saber con qué capacidades cuenta
   antes de planificar la tarea.
4. Listar los specs de `docs/specs/` agrupados por estado: activos
   (`[IN PROGRESS]` o `[TESTING]`) y pendientes de aprobación (`[NOT STARTED]`).
   Si algún spec no tiene estado en el título, marcarlo como `[NOT STARTED]`
   y reportarlo al usuario.
5. Confirmar el repositorio activo y la rama actual con `git status`.
6. Si hay contexto previo relevante (spec en curso, decisión de arquitectura,
   deuda técnica pendiente), pedirlo al usuario antes de proceder.

---

## Reglas generales

- Toda la comunicación con el usuario debe ser en español.
- Antes de editar cualquier archivo, leer las secciones relevantes de su contenido.
  Para archivos de más de 300 líneas, navegar por secciones antes de editar;
  no asumir estructura sin haberla leído.
- No adivines rutas, imports ni nombres de variables: confírmalos leyendo el código.
- Si tienes dudas bloqueantes, usa `AskUserQuestion` antes de proceder.
- Nunca interrumpas una tarea a mitad para pedir confirmación, salvo que el
  riesgo de continuar sea alto (borrado de datos, cambios en producción, etc.).
- Prefiere cambios quirúrgicos sobre refactors amplios no solicitados.
- Para cualquier tarea que involucre UI, leer `DESIGN.md` antes de escribir código.
- **Nunca inicies la implementación de un spec sin confirmación explícita del
  usuario en esa misma sesión.** Redactar el spec y sus pruebas no autoriza a
  escribir el código: son pasos distintos y cada uno requiere su aprobación.
- **No abras ni controles el navegador** (navegación, automatización, capturas)
  salvo que el usuario lo solicite explícitamente. Ver "Pruebas visuales y uso
  del navegador".

---

## Agentes especializados

En `/.claude/agents/` viven las definiciones de los subagentes. Leer el archivo
del agente antes de invocarlo. No improvisar su comportamiento.

| Agente        | Cuándo invocarlo                                                              |
|---------------|-------------------------------------------------------------------------------|
| `@architect`  | Diseño de specs: fases, archivos impactados, sin código                       |
| `@reviewer`   | Revisión de código antes de marcar un spec como `[DONE]`                     |
| `@tester`     | Generación y ejecución de casos de prueba e2e                                 |
| `@mcp-builder`| Evaluación, diseño, creación y actualización de MCPs y sus system prompts     |
| `@lesson-designer`   | Orquestar la producción del material de una lección: lee microdiseño y cronograma, calibra al nivel del curso, produce el plan y delega |
| `@lesson-writer`     | Redactar la lección teórica `.mdx` publicable y su registro en `lib/courses/data/`                                    |
| `@lab-designer`      | Diseñar la guía de laboratorio del docente (privada, con soluciones) y la del estudiante (publicada, con rúbrica)     |
| `@assessment-builder`| Crear el cuestionario de cierre y los quices A/B/C vía `question-bank-mcp` y `assignment-mcp`                         |

> Si en `/.claude/agents/` existen agentes adicionales específicos del proyecto,
> tienen precedencia sobre la tabla anterior.

---

## Skills

En `/.claude/skills/` viven las skills del proyecto. Cada skill es una carpeta
con su propio `SKILL.md` que documenta buenas prácticas, convenciones o
procedimientos para un tipo de tarea concreto.

- Antes de ejecutar una tarea, revisar si alguna skill de `/.claude/skills/`
  cubre ese dominio y, si es así, leer su `SKILL.md` **completo** antes de
  escribir código o generar archivos. Varias skills pueden aplicar a una
  misma tarea.
- No asumir el contenido de una skill por su nombre: leerla siempre.
- Las skills describen cómo hacer las cosas en **este** proyecto; sus
  instrucciones tienen precedencia sobre suposiciones generales.
- Si una tarea recurrente carece de skill y valdría la pena documentarla,
  proponerlo al usuario antes de crear una skill nueva.

| Skill                       | Cuándo aplicarla                                              |
|-----------------------------|--------------------------------------------------------------|
| `lesson-authoring`          | Escribir lecciones, guías de laboratorio y evaluaciones de un curso |
| `frontend-design`           | Construir UI de alta calidad: componentes, páginas, layouts  |
| `tailwind-css-patterns`     | Estilar con Tailwind CSS (responsive, grid/flex, tokens)     |
| `react-best-practices`      | Rendimiento y patrones en React/Next.js                      |
| `composition-patterns`      | Componer componentes React reutilizables (compound, context) |
| `next-best-practices`       | Convenciones de Next.js (RSC, data fetching, metadata)       |
| `next-cache-components`     | Cache Components de Next 16 (PPR, `use cache`, `cacheTag`)    |
| `next-upgrade`              | Actualizar Next.js a una versión mayor                       |
| `typescript-advanced-types` | Tipos avanzados de TypeScript (genéricos, mapped, condicional)|
| `accessibility`             | Auditar/mejorar accesibilidad (WCAG 2.2)                     |
| `seo`                       | Optimizar para buscadores (meta tags, structured data)       |
| `nodejs-backend-patterns`   | Servicios backend Node (API routes, middleware, errores)     |
| `nodejs-best-practices`     | Principios de desarrollo Node (async, seguridad, arquitectura)|

> Mantener esta tabla actualizada cuando se agreguen o modifiquen skills en
> `/.claude/skills/`.

---

## Contexto del proyecto

**Nodo** es una plataforma web educativa para publicar y gestionar material académico de cursos de programación e inteligencia artificial, dirigida a ingenieros de sistemas, electrónicos y de ciencias de datos.

**Estado actual:** MVP en desarrollo — Fase 1 (contenido MDX versionado en Git, publicado por el docente principal).

**Roles previstos:**
- **Docente principal / admin**: gestiona cursos, usuarios y permisos.
- **Docente colaborador**: publica y edita artículos de sus cursos (Fase 2).
- **Estudiante**: consume contenido y responde evaluaciones (fase futura).
- **Visitante**: lectura pública del material abierto.

**Visión:**
- **Hoy**: artículos tipo blog organizados por curso, escritos por el docente principal.
- **Mediano plazo**: colaboración con otros docentes mediante Payload CMS, sin tocar código.
- **Largo plazo**: evaluaciones, formularios, videos, notebooks ejecutables y seguimiento de estudiantes.

---

## Repositorios del ecosistema

Este proyecto vive en un único repositorio. No hay monorepo ni submódulos.

```
02-Educational-Page/
├── app/                   # Next.js App Router — rutas y layouts
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades, configuración y clientes externos
├── content/               # Contenido de cursos
│   └── cursos/
│       └── <curso>/       # Un directorio por curso
│           ├── *.mdx      # Artículos/lecciones publicados
│           └── microdiseno/  # Microdiseño curricular (info.md, cronograma, projects/) — no se publica
├── courses/               # Material sin curso publicado equivalente (bancos de ejercicios, fuentes externas)
├── public/                # Assets estáticos
└── docs/                  # Documentación
    ├── specs/             # Specs de funcionalidades
    ├── testing/           # Casos de prueba manuales
    └── mcps/              # System prompts e índice de MCPs (cuando apliquen)
```

---

## Stack tecnológico

### Frontend / Framework principal
- **Next.js 16** (App Router) + **TypeScript** — full-stack React con server actions y API routes.
- **React 19**.
- **Tailwind CSS 4** — estilos utilitarios (ver `DESIGN.md`).
- **Flowbite** — componentes UI sobre Tailwind; usar primero.
- **shadcn/ui** — componentes accesibles complementarios cuando Flowbite no cubra.
- **React Hook Form + Zod** — formularios y validación.

### Contenido
- Artículos en **MDX** versionados en Git bajo `content/cursos/<curso>/<articulo>.mdx`.
- **Shiki** para syntax highlighting de código.
- **KaTeX** para fórmulas matemáticas.
- **Fase 2:** Payload CMS 3 embebido, con panel admin para roles.

### Backend / Datos
- **Supabase**: Postgres gestionado, Auth (email/password + OAuth), Storage (PDFs e imágenes), Row Level Security.

### Infraestructura
- **Vercel** — hosting y deploy continuo desde Git.
- **GitHub** — repositorio y control de versiones.
- **npm** — package manager.

### Tipografía
- **JetBrains Mono** en todo el proyecto (texto, UI, código) — sin excepciones.

### Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build / Producción
npm run build

# Iniciar build de producción
npm run start

# Linter
npm run lint

# Tests
# (framework por definir — ver sección Testing)
```

---

## Dependencias

- Package manager: `npm` — no mezclar managers en el mismo proyecto.
- Antes de instalar cualquier dependencia nueva:
  1. Verificar si ya existe algo equivalente en `package.json`.
  2. Mencionarlo al usuario con justificación clara (qué resuelve, por qué esa librería).
  3. Esperar confirmación explícita.
- Preferir dependencias con mantenimiento activo y bajo footprint.
- Nunca instalar dependencias de desarrollo en `dependencies` ni al revés.

---

## Variables de entorno

- Archivo de referencia: `.env.example`
- Archivo real (nunca commitear): `.env.local`

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase (nueva nomenclatura) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo server-side, nunca en cliente) |
| `NEXT_PUBLIC_SITE_URL` | URL base del sitio. Reservada: sin uso actual en el código (no hay OAuth ni recuperación de contraseña implementados); se carga por si un flujo futuro la requiere (ver DEBT-014 en `docs/specs/backlog.md`) |
| `STUDENTS_ADMIN_API_KEY` | Clave de servicio del dominio de estudiantes (`/api/students/*`, `students-mcp`) — permisos de admin, distinta de `QUESTION_BANK_API_KEY` |
| `COURSES_ADMIN_API_KEY` | Clave de servicio del dominio de cursos (`/api/courses/*`, `courses-mcp`) — abre y cierra lecciones a los estudiantes. Propia y distinta de `QUESTION_BANK_API_KEY` y `STUDENTS_ADMIN_API_KEY`: debe poder revocarse sin apagar el banco de preguntas (spec-039 M2). Si falta, la ruta responde `500 configuration_error`, nunca `401` |

> ⚠️ Nunca escribas valores reales de variables de entorno en este archivo
> ni en ningún archivo rastreado por git.

> ⚠️ **Desde el 2026-07-31 existe un entorno de desarrollo separado de
> producción** (spec-026 quedó `[DONE]` con la app ya en producción real, lo
> que hizo necesario dejar de probar directo ahí). `.env.local` apunta a una
> instancia de Supabase local (`supabase start`) corriendo en la workstation
> de laboratorio `mirp-lab` (host SSH configurado en `~/.ssh/config`,
> `/home/sosagro4c/proyectos/nodo-dev-db/`), accesible desde esta Mac vía
> túnel SSH. Los valores reales de producción quedaron respaldados en
> `.env.local.prod-backup` (gitignorado). Ver "Base de datos" para el
> procedimiento completo de arranque/reconexión.

---

## Base de datos

- Proveedor: **Supabase Postgres**.
- Cuando hagas modificaciones al esquema, crea siempre una migración.
- **Dos entornos desde el 2026-07-31:**
  - **Producción:** proyecto Supabase remoto `academy-page`
    (ref `bgiimadnmqnoqmdbudpo`). Variables reales respaldadas en
    `.env.prod` / `.env.prod-mcp` (gitignorados, nunca commitear).
    `supabase db push`/`supabase migration list` **sin** `--project-ref`
    (o con `bgiimadnmqnoqmdbudpo` explícito) operan contra este proyecto —
    requiere confirmación explícita del usuario antes de aplicar
    migraciones (ver "Acciones prohibidas").
  - **Desarrollo:** instancia local (`supabase start`) en `mirp-lab`
    (`/home/sosagro4c/proyectos/nodo-dev-db/`), con su propia copia de
    `supabase/migrations/` sincronizada manualmente desde este repo (no
    hay symlink ni CI que las mantenga alineadas — si agregás una
    migración nueva acá, hay que `rsync`earla a `mirp-lab` y correr
    `supabase db reset` allá para probarla antes de aplicarla a prod).
    `.env.local` apunta acá por defecto.

  **Para reconectar el entorno de desarrollo en una sesión nueva:**
  1. Túnel SSH (si no está activo —
     `pgrep -f "ssh.*-L 54321.*mirp-lab"` para chequear):
     ```bash
     ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
       -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab
     ```
  2. Confirmar que el stack sigue corriendo en `mirp-lab` (si se reinició la
     máquina, hay que levantarlo de nuevo):
     ```bash
     ssh mirp-lab "cd /home/sosagro4c/proyectos/nodo-dev-db && \
       NODE_OPTIONS='--dns-result-order=ipv4first' npx supabase status"
     # si no está corriendo:
     ssh mirp-lab "cd /home/sosagro4c/proyectos/nodo-dev-db && \
       NODE_OPTIONS='--dns-result-order=ipv4first' npx supabase start"
     ```
  3. `.env.local` ya apunta a `http://localhost:54321` vía el túnel — solo
     hace falta que `npm run dev` esté corriendo (reiniciarlo si venía de
     antes de este cambio, para que recargue el `.env.local` nuevo).
  4. Docente de desarrollo ya sembrado: `dev@nodo.local` / `DevLocal2026!`
     (`npm run seed:teacher` para recrearlo si se resetea la base).
  > ⚠️ **Nota de mantenimiento del CLI:** esta instancia local (CLI
  > `2.111.0`) no otorgó automáticamente los `GRANT`s estándar de
  > `anon`/`authenticated`/`service_role` sobre `public` al aplicar las
  > migraciones desde cero — tuvieron que ejecutarse a mano
  > (`GRANT ALL ON ALL TABLES/SEQUENCES/FUNCTIONS IN SCHEMA public TO
  > anon, authenticated, service_role` + `ALTER DEFAULT PRIVILEGES`
  > equivalente). Si se vuelve a resetear esta base desde cero
  > (`supabase db reset`) y algo empieza a fallar con
  > `permission denied for table ...`, repetir esos `GRANT`s.
- Para verificar que una migración se aplicó en **producción**:
  `supabase migration list --project-ref bgiimadnmqnoqmdbudpo` (columnas
  Local y Remote deben coincidir) o una consulta REST contra
  `NEXT_PUBLIC_SUPABASE_URL` de `.env.prod`.
- Row Level Security habilitado; verificar políticas antes de añadir nuevas tablas.
- **[[DEBT-031]] resuelta (2026-07-31)**: el historial de migraciones ahora
  **sí** reconstruye producción desde cero. Las tablas `assignments` y
  `assignment_questions` se habían creado fuera de git; se agregaron
  `20260717000000_init_assignments_legacy_table.sql` y
  `20260717000001_init_assignment_questions_legacy_table.sql` con el DDL real
  extraído de producción, y se marcaron como aplicadas allá con
  `supabase migration repair` (no ejecutan DDL en producción). Verificado:
  `db reset` en `mirp-lab` produce un esquema idéntico al de producción.
  Ver `docs/specs/backlog.md`.

---

## Backend y APIs

- **Supabase** actúa como backend principal (Auth, DB, Storage).
- Los clientes de Supabase se inicializan en `lib/auth/` — un archivo por contexto:
  - `lib/auth/server.ts` — Server Components y Server Actions (`createServerClient` de `@supabase/ssr`).
  - `lib/auth/middleware.ts` — middleware de Next.js (`updateSupabaseSession`).
  - `lib/auth/browser.ts` — Client Components puntuales (`createBrowserClient`).
- Las server actions y API routes de Next.js consumen Supabase a través de los helpers de `lib/auth/session.ts`.
- Autenticación: sesión gestionada por Supabase Auth; el token se mantiene en cookies httpOnly via `@supabase/ssr`.
- `SUPABASE_SERVICE_ROLE_KEY` bypasa RLS — **nunca** importar en archivos bajo `app/` o `components/`.

---

## Arquitectura y patrones internos

```
app/
├── (cursos)/              # Rutas públicas de cursos y artículos
│   └── [courseSlug]/      # Página de cada curso
│       └── [lessonSlug]/  # Página de cada lección/artículo
├── (admin)/               # Panel de administración (acceso restringido)
└── api/                   # API routes

components/                # Componentes React reutilizables (sin lógica de negocio)
lib/
├── courses/               # Lógica de lectura y parseo de contenido MDX
├── auth/                  # Clientes Supabase, helpers de sesión y Server Actions de auth
├── students/              # Perfil de usuario (Profile, Student)
└── progress/              # Progreso de lecciones por usuario

content/cursos/<curso>/    # Artículos MDX del curso
content/cursos/<curso>/microdiseno/  # Info.md, cronograma, projects/ — no se publica
courses/                   # Material sin curso publicado equivalente
```

- Patrón de contenido: MDX en disco, parseado en build/request con `next-mdx-remote`.
- Patrón de datos dinámicos: Supabase directamente desde server components y server actions.
- No usar `useEffect` para fetch de datos; preferir server components.

---

## MCPs del proyecto

Los MCPs (Model Context Protocol) son servidores que exponen herramientas
y recursos del proyecto a agentes de IA. Centralizar su gestión permite que
tanto Claude Code como otros agentes accedan a datos y acciones del sistema
de forma consistente y trazable.

### Estructura de carpetas

```
docs/
└── mcps/
    ├── README.md                        # Índice de MCPs activos y su propósito
    ├── {{nombre-mcp}}.system-prompt.md  # System prompt del agente que usa este MCP
    └── …
```

### Inventario de MCPs

> Mantener este inventario actualizado. Cada MCP registrado debe tener
> su entrada en `docs/mcps/README.md`.

| MCP               | Propósito                          | Estado     | System prompt                              |
|-------------------|------------------------------------|------------|--------------------------------------------|
| `question-bank-mcp` | Cliente de la API `/api/questions/*` para que un agente docente liste, cree, actualice, elimine y publique preguntas del banco de evaluaciones (multiple_choice, open_text, code_snippet, code_write, coding_challenge). | Activo | `docs/mcps/question-bank-agent.system-prompt.md` |
| `assignment-mcp` | Cliente de la API `/api/assignments/*` para que un agente docente diseñe evaluaciones formadas por 3 variantes (A/B/C) de preguntas distintas, publique con validación de invariantes, y monitoree el reparto aleatorio a estudiantes. | Activo | `docs/mcps/assignment-agent.system-prompt.md` |
| `attendance-mcp` | Cliente de solo lectura de la API `/api/attendance/*` para que un agente docente liste sesiones de asistencia, consulte roster y resúmenes de asistencia por estudiante. | Activo | `docs/mcps/attendance-agent.system-prompt.md` |
| `students-mcp` | Cliente de la API `/api/students/*` (permisos de admin, `service_role`) para que un agente docente liste, cree, corrija, elimine y (des)matricule estudiantes manualmente. Autenticado con `STUDENTS_ADMIN_API_KEY`, distinta de `QUESTION_BANK_API_KEY`. | Activo | `docs/mcps/students-agent.system-prompt.md` |
| `courses-mcp` | Cliente de la API `/api/courses/*` para que un agente docente consulte el catálogo de lecciones de un curso y abra o cierre lecciones a los estudiantes sin desplegar (spec-039). El estado es global por `course_slug`: afecta a todos los grupos. Autenticado con `COURSES_ADMIN_API_KEY`, propia de este dominio. | Activo | `docs/mcps/courses-agent.system-prompt.md` |

### Reglas de gestión de MCPs

- Antes de implementar cualquier spec, evaluar si la funcionalidad nueva
  expone datos o acciones que un agente podría necesitar → candidato a MCP.
- Si ya existe un MCP relacionado, evaluar si requiere nuevas herramientas
  o ajustes en su configuración.
- Todo MCP nuevo o modificado debe actualizarse en `docs/mcps/README.md`.
- Si el MCP tiene un agente asociado, su system prompt en `docs/mcps/`
  debe reflejar las capacidades actuales del MCP tras cada cambio.
- Los system prompts deben ser precisos: describir qué puede hacer el agente,
  qué herramientas tiene disponibles, sus límites y el tono esperado.
- Nunca eliminar un MCP sin confirmar con el usuario que ningún agente
  activo lo consume.

### Estructura mínima de un system prompt (`docs/mcps/`)

```md
# System prompt — {{Nombre del agente}}

## Rol y propósito
Descripción del agente: qué es, para quién trabaja y cuál es su objetivo.

## MCP(s) disponibles
- `{{nombre-mcp}}`: {{qué herramientas expone y para qué sirven}}

## Capacidades
- {{Acción concreta que puede realizar}}
- {{Acción concreta que puede realizar}}

## Restricciones
- {{Qué NO puede o NO debe hacer}}
- {{Límites de acceso a datos}}

## Tono y formato de respuesta
{{Instrucciones de estilo: formal/informal, idioma, longitud de respuestas, etc.}}
```

### Claude Code — Configuración de MCPs (`.mcp.json`)

Los MCPs del proyecto están registrados en `.mcp.json` (versionado), de modo que
están disponibles en cualquier sesión de Claude Code sin configuración manual:

```json
{
  "mcpServers": {
    "question-bank-mcp": {
      "command": "./mcp-servers/run-local-mcp.sh",
      "args": ["question-bank-mcp"]
    }
  }
}
```

Los servidores de `mcp-servers/` **no usan dotenv**: leen `process.env` y hacen
`exit(1)` si falta una variable. El wrapper `mcp-servers/run-local-mcp.sh`
resuelve eso:

- Carga `.env.local` (que nunca se commitea) antes de ejecutar el servidor.
- Deriva el origen de la app (`http://localhost:<puerto>`) desde
  `QUESTION_BANK_API_BASE_URL`, así que **no hardcodea el puerto de `npm run dev`**.
- Mapea los nombres de variable que espera cada servidor:
  `ASSIGNMENT_API_KEY` reutiliza `QUESTION_BANK_API_KEY` (las rutas de
  `/api/assignments` autentican con esa clave por defecto), y `attendance-mcp` /
  `students-mcp` / `courses-mcp` reciben los genéricos `API_BASE_URL` /
  `API_KEY` (mapeados desde `QUESTION_BANK_API_KEY`, `STUDENTS_ADMIN_API_KEY` y
  `COURSES_ADMIN_API_KEY` respectivamente).

> ⚠️ Los MCPs son clientes HTTP: **requieren `npm run dev` corriendo** y fallan
> con "API no disponible" sin reintentar. Comprobar un servidor de forma aislada:
> ```bash
> ./mcp-servers/run-local-mcp.sh question-bank-mcp </dev/null
> ```

### Claude Desktop — Configuración de MCPs

Para ejecutar agentes con MCPs locales en Claude Desktop:

#### Ubicación del archivo de configuración
- **Ruta:** `~/.claude/claude_desktop_config.json` (o en macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`)
- Este archivo contiene las definiciones de todos los servidores MCP disponibles.
- **Nunca commitear valores reales de API keys en este archivo.**

#### Estructura de un MCP en `claude_desktop_config.json`

```json
{
  "mcpServers": {
    "{{nombre-mcp}}": {
      "command": "node",
      "args": [
        "/ruta/absoluta/al/mcp-servers/{{nombre-mcp}}/dist/index.js"
      ],
      "env": {
        "{{VAR_API_BASE_URL}}": "http://localhost:3000/api/{{ruta}}",
        "{{VAR_API_KEY}}": "{{api-key-para-desarrollo}}"
      }
    }
  }
}
```

#### Configuración actual de MCPs locales

| MCP | Comando | Variables de entorno |
|-----|---------|----------------------|
| `question-bank-mcp` | `node /path/to/mcp-servers/question-bank-mcp/dist/index.js` | `QUESTION_BANK_API_BASE_URL=http://localhost:3000/api/questions`, `QUESTION_BANK_API_KEY={{key}}` |
| `assignment-mcp` | `node /path/to/mcp-servers/assignment-mcp/dist/index.js` | `ASSIGNMENT_API_BASE_URL=http://localhost:3000/api/assignments`, `ASSIGNMENT_API_KEY={{key}}` |
| `attendance-mcp` | `node /path/to/mcp-servers/attendance-mcp/dist/index.js` | `API_BASE_URL=http://localhost:3000/api`, `API_KEY={{key}}` |
| `students-mcp` | `node /path/to/mcp-servers/students-mcp/dist/index.js` | `API_BASE_URL=http://localhost:3000/api/students`, `API_KEY={{STUDENTS_ADMIN_API_KEY}}` |
| `courses-mcp` | `node /path/to/mcp-servers/courses-mcp/dist/index.js` | `API_BASE_URL=http://localhost:3000/api/courses`, `API_KEY={{COURSES_ADMIN_API_KEY}}` |

#### Pasos para agregar un MCP a Claude Desktop

1. **Compilar el servidor MCP** (si es necesario):
   ```bash
   cd mcp-servers/{{nombre-mcp}}
   npm run build
   ```

2. **Obtener la ruta absoluta** del archivo compilado:
   ```bash
   pwd  # desde la carpeta del MCP
   # Anota: /Users/santiagosuarez/Documents/03-Proyectos/02-Educational-Page/mcp-servers/{{nombre-mcp}}/dist/index.js
   ```

3. **Editar `claude_desktop_config.json`** y agregar una entrada en `mcpServers`:
   ```json
   "{{nombre-mcp}}": {
     "command": "node",
     "args": ["/ruta/absoluta/a/mcp-servers/{{nombre-mcp}}/dist/index.js"],
     "env": {
       "{{VAR1}}": "valor",
       "{{VAR2}}": "valor"
     }
   }
   ```

4. **Reiniciar Claude Desktop** para que cargue la nueva configuración.

5. **Verificar disponibilidad** en Claude Desktop:
   - Abre una conversación.
   - Busca las herramientas del MCP en la interfaz de MCPs.
   - Prueba una herramienta simple (ej. `list_questions` para question-bank-mcp).

#### Guía de seguridad

- **Nunca commitear credenciales reales** en `claude_desktop_config.json` ni en archivos de configuración del proyecto.
- Usar **API keys de desarrollo local** que sean diferentes de las de producción.
- Si cambias una API key:
  1. Actualiza `claude_desktop_config.json` localmente.
  2. Reinicia Claude Desktop.
  3. Verifica que los MCPs funcionen.
  4. **Nunca** hagas commit de la clave.

#### Validación de MCPs

Para verificar que un MCP está correctamente configurado:

1. **Desde Claude Desktop:**
   - En una conversación, menciona el agente (ej. "actúa como Assignment Agent").
   - Copia el system prompt desde `docs/mcps/{{nombre}}.system-prompt.md`.
   - Intenta invocar una herramienta sencilla del MCP (ej. `list_academic_courses`).

2. **Desde línea de comandos** (si el MCP expone stdio):
   ```bash
   node mcp-servers/{{nombre-mcp}}/dist/index.js 2>&1 | head -20
   ```
   Deberías ver un mensaje de inicialización o conexión.

---

## Convenciones de código

- Lenguaje: **TypeScript estricto** (`strict: true`).
- Nombres de archivos: `kebab-case` para páginas y rutas, `PascalCase` para componentes React.
- Nombres de funciones y variables: `camelCase`.
- Exportaciones: preferir **named exports**; default export solo para componentes de página.
- Estilos: **Tailwind CSS 4** con tokens semánticos definidos en `DESIGN.md`. Nunca usar valores crudos de la paleta.
- No usar `any` salvo que sea absolutamente inevitable; documentarlo con `// TODO: type this`.
- **Idioma**: contenido y UI en español; código, identificadores y commits en inglés.
- **Comentarios en código**: solo cuando el *por qué* no sea obvio.
- **Componentes UI**: Flowbite primero, shadcn/ui como complemento.

---

## Testing

- Framework: **por definir** (pendiente de decisión de arquitectura). Hasta
  entonces, las pruebas automáticas se describen en el spec pero no se ejecutan;
  las pruebas manuales (`docs/testing/test-NNN`) sí aplican desde ya.
- Ubicación de tests unitarios: por definir junto con el framework.
- Ubicación de tests e2e: por definir junto con el framework.
- Convención de nombres (cuando exista framework): `{{nombre}}.test.ts` / `{{nombre}}.spec.ts`.
- **Los archivos de prueba se escriben al redactar el spec, no al final.** Ver
  "Specs de funcionalidades → Artefactos que acompañan al spec". Encodifican los
  criterios de aceptación: las pruebas manuales arrancan en estado Pendiente y
  las automáticas (cuando haya framework) arrancan en rojo hasta que la
  implementación las pone en verde.
- No borrar ni modificar tests existentes sin instrucción explícita.
- Los tests e2e son responsabilidad de `@tester`, que los ejecuta como última
  fase de cada spec antes del merge a `development`; el archivo de test ya
  existe desde la redacción del spec.
- La **ejecución** de las pruebas manuales la realiza el usuario sobre la UI;
  Claude prepara los datos, guía el proceso y registra los hallazgos
  (ver "Pruebas manuales asistidas por Claude").

---

## Specs de funcionalidades

### Ubicación y nomenclatura

- Carpeta: `docs/specs/` en la raíz del proyecto.
- Nomenclatura: `spec-{{NNN}}-{{slug-descriptivo}}.md`
  (NNN = correlativo con cero a la izquierda, ej. `spec-007-auth-estudiante.md`)
- Consultar specs anteriores antes de nombrar uno nuevo para evitar solapamiento.

### Estados válidos

| Estado          | Significado                                                     |
|-----------------|-----------------------------------------------------------------|
| `[NOT STARTED]` | Spec redactado (con sus pruebas), sin implementación iniciada   |
| `[IN PROGRESS]` | Implementación iniciada                                         |
| `[TESTING]`     | Implementación completa, pendiente de pruebas manuales/e2e      |
| `[DONE]`        | Pruebas superadas, listo para merge a `development`             |

- **Todo spec que no esté en `[IN PROGRESS]`, `[TESTING]` o `[DONE]` debe estar
  marcado explícitamente como `[NOT STARTED]`.** No existen specs sin estado en
  el título: si Claude encuentra uno, debe marcarlo como `[NOT STARTED]` y
  avisarlo al usuario.
- Todo spec **nace en `[NOT STARTED]`**, junto con sus archivos de prueba. Ese
  es su estado mientras espera la aprobación del usuario para implementarse.
- Un spec puede permanecer en `[NOT STARTED]` indefinidamente (backlog, spec
  planificado, spec pospuesto); eso no lo invalida ni autoriza a implementarlo.
- Transición válida: `[NOT STARTED]` → `[IN PROGRESS]` → `[TESTING]` → `[DONE]`.
  No saltarse estados ni retroceder sin avisar al usuario.
- Los specs completados **no se borran**; se marcan con `[DONE]` en el título.
- Solo specs en estado `[DONE]` con su archivo `test-NNN` correspondiente
  pueden hacer merge a `development`.
- El paso de `[NOT STARTED]` a `[IN PROGRESS]` solo ocurre **después** de la
  aprobación explícita del usuario para iniciar la implementación.

### Artefactos que acompañan al spec

> Al redactar un spec se escriben, **en el mismo momento**, sus archivos de
> prueba. No se dejan para el final del spec ni para el cierre de la
> implementación: definen la aceptación por adelantado (enfoque test-first).

Cada spec `spec-NNN-slug` nace junto con:

| Artefacto           | Ubicación                                            | Contenido                                                                    |
|---------------------|------------------------------------------------------|------------------------------------------------------------------------------|
| Spec                | `docs/specs/spec-NNN-slug.md`                        | Contexto, alcance, fases, criterios de aceptación                            |
| Pruebas manuales    | `docs/testing/test-NNN-slug.md`                      | Casos manuales (`TC-NNN`, y `TC-MCP-NNN` si aplica) — solo flujos con UI      |
| Pruebas automáticas | `{{ubicación e2e por definir}}/e2e-NNN-slug.spec.ts` | Casos e2e/unit derivados de los criterios de aceptación, en rojo (cuando exista framework) |

- Los tres archivos comparten el mismo `NNN` y `slug`.
- Mientras el framework de testing esté "por definir" (ver "Testing"), las
  pruebas automáticas se describen en el spec pero su archivo se crea cuando el
  framework exista; las pruebas manuales sí se escriben desde la redacción.
- Escribir estos archivos de prueba **no cuenta como la implementación**:
  encodifica lo que debe cumplirse. La implementación es lo que los pone en
  verde y es lo que requiere la aprobación previa del usuario.
- Si durante la implementación cambia el scope aprobado, actualizar también
  estos archivos de prueba (no editar el scope unilateralmente; ver
  "Durante la implementación").

### Estructura mínima de un spec

```md
# spec-NNN — [NOT STARTED] Título descriptivo
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto
Por qué se necesita esta funcionalidad y qué problema resuelve.

## Alcance
Qué incluye y qué **no** incluye este spec.

## Impacto en el sistema
Componentes, rutas, modelos o servicios afectados.

## Evaluación MCP
> Completar esta sección antes de iniciar la implementación.

**¿Aplica MCP?** Sí / No

Si aplica, describir:
- **MCP existente a modificar:** `{{nombre-mcp}}` — herramientas a agregar/cambiar.
- **MCP nuevo a crear:** `{{nombre-mcp}}` — propósito y herramientas que expondrá.
- **System prompt afectado:** `docs/mcps/{{nombre}}.system-prompt.md`
- **Fase de MCP en este spec:** Fase {{N}}

Si no aplica, justificar brevemente por qué esta funcionalidad
no requiere exponer herramientas o datos a agentes.

## Fases de implementación

### Fase 1 — Nombre
- [ ] Paso concreto
- [ ] Paso concreto

### Fase N — MCP: {{crear / actualizar}} `{{nombre-mcp}}`
> Incluir esta fase solo si "Evaluación MCP" indica que aplica.
- [ ] {{Crear servidor MCP / Agregar herramienta al MCP existente}}
- [ ] Registrar o actualizar entrada en `docs/mcps/README.md`
- [ ] Crear o actualizar `docs/mcps/{{nombre}}.system-prompt.md`
- [ ] Verificar que el MCP responde correctamente a las herramientas declaradas

### Fase N+1 — Nombre
- [ ] Paso concreto

## Criterios de aceptación
- El usuario puede hacer X.
- El sistema responde con Y ante Z.
- (Si aplica MCP) El agente puede invocar `{{herramienta}}` y obtener `{{resultado esperado}}`.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-NNN-slug.md` — casos `TC-NNN` (y `TC-MCP-NNN` si aplica).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-NNN-slug.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio (cuando exista framework).

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
```

---

## Nuevas funcionalidades

### Antes de implementar

1. Analizar el impacto del feature en todos los componentes del proyecto.
2. Usar el subagente `@architect` para crear el plan de implementación:
   - Solo descripción de fases, pasos y archivos a editar.
   - Sin código de implementación.
3. **Evaluar si aplica MCP** (ver criterios en la sección siguiente).
   Si aplica, invocar `@mcp-builder` para diseñar la fase de MCP dentro del spec.
4. Crear la rama nueva desde `development` siguiendo las reglas de git.
   Esta rama aloja el spec, sus archivos de prueba y la futura implementación.
5. **Escribir, junto con el spec, sus archivos de prueba** (ver
   "Specs de funcionalidades → Artefactos que acompañan al spec"):
   - Pruebas manuales en `docs/testing/test-NNN-slug.md` (flujos con UI).
   - Pruebas automáticas (e2e/unit) derivadas de los criterios de aceptación,
     en rojo — cuando exista framework de testing (ver "Testing").
   - Invocar `@tester` para el diseño de los casos automáticos cuando aporte
     rigor al conjunto de pruebas.
6. Guardar el spec en `docs/specs/` **con estado `[NOT STARTED]` en el título**
   y los archivos de prueba en sus carpetas, todos con la misma nomenclatura
   `NNN-slug`.
7. **Detenerse y esperar la aprobación explícita del usuario del paquete
   completo (spec + pruebas) antes de escribir una sola línea de código de
   implementación.** Esta regla no admite excepciones:
   - Aprobar el spec como documento **no** equivale a autorizar la implementación:
     debe existir una instrucción clara del usuario en esa misma sesión
     (ej. "procede con la implementación del spec-NNN").
   - Ante cualquier ambigüedad, preguntar con `AskUserQuestion` en lugar de asumir.
   - Mientras no exista esa aprobación, el spec permanece en `[NOT STARTED]`.
   - Al recibir la aprobación, marcar la casilla de "Aprobación de implementación"
     en el spec y recién entonces cambiar su estado de `[NOT STARTED]` a
     `[IN PROGRESS]`.
   - Si el usuario pide "avanzar" sin especificar, confirmar si se refiere a
     redactar el spec o a implementarlo.

### Criterios para evaluar si una funcionalidad requiere MCP

Responder estas preguntas antes de diseñar el spec:

| Pregunta                                                                 | Si la respuesta es "sí"…                          |
|--------------------------------------------------------------------------|---------------------------------------------------|
| ¿La funcionalidad expone datos que un agente podría necesitar consultar? | Candidato a herramienta de lectura en un MCP      |
| ¿La funcionalidad permite acciones que un agente debería poder ejecutar? | Candidato a herramienta de escritura/acción en MCP|
| ¿Ya existe un MCP que cubre un dominio relacionado?                      | Evaluar si extenderlo en lugar de crear uno nuevo |
| ¿Hay un agente definido en `docs/mcps/` que se beneficiaría del cambio? | Su system prompt debe actualizarse obligatoriamente|

> Si ninguna respuesta es afirmativa, documentar la justificación en
> la sección "Evaluación MCP" del spec y continuar sin fase de MCP.

### Durante la implementación

- Trabajar fase por fase según el spec; no saltarse pasos.
- Al iniciar la Fase 1 de cualquier spec —lo que solo ocurre tras la aprobación
  explícita del usuario— cambiar su estado de `[NOT STARTED]` a `[IN PROGRESS]`.
- Al completar cada fase, documentarla como completada en el propio spec.
- La implementación consiste en poner en verde las pruebas ya escritas al
  redactar el spec; usarlas como guía de avance.
- La fase de MCP debe ejecutarse antes de la fase de pruebas e2e,
  para que `@tester` pueda validar también las herramientas expuestas.
- Si el scope del spec debe cambiar (nuevo hallazgo, bloqueante estructural),
  proponer la modificación al usuario **antes** de proceder. No editar el spec
  ni los archivos de prueba unilateralmente ni implementar fuera de él.
- Si se descubre deuda técnica fuera del scope, documentarla con un comentario
  `// DEBT:` en el código y registrarla en `docs/specs/backlog.md`, sin actuar
  sobre ella en la tarea actual.
- Si aparece un bloqueante no previsto en el spec, reportarlo antes de improvisar.
- No modificar archivos fuera del alcance del spec sin avisar.

### Después de terminar la implementación

1. Verificar que los archivos de prueba creados al redactar el spec
   (`test-NNN` y, si existe framework, las pruebas automáticas) siguen cubriendo
   los criterios de aceptación finales; ajustarlos si el scope cambió durante la
   implementación (con la aprobación correspondiente).
2. Cambiar el estado del spec a `[TESTING]`.
3. El usuario ejecutará los casos manuales de `docs/testing/test-NNN`. Si pide
   apoyo, Claude lo acompaña siguiendo el protocolo de
   "Pruebas manuales asistidas por Claude": prepara los datos vía API, guía
   paso a paso, marca los hallazgos en el archivo de test y elimina los datos
   al finalizar.
4. Cuando todos los casos manuales estén aprobados, invocar `@tester` para
   ejecutar las pruebas automáticas ya definidas y confirmar que pasan en verde
   (cuando exista framework de testing).
5. Al superar todas las pruebas (manuales y automáticas), marcar el spec como `[DONE]`.

### Pruebas manuales — estructura del archivo

- Todos los archivos `test-NNN` van en `docs/testing/` en la raíz del proyecto
  y se crean al redactar el spec, no al cerrarlo.
- Solo incluir casos manuales de flujos con UI. Los endpoints se validan con las
  pruebas automáticas asociadas al spec.
- Si el spec incluyó una fase de MCP, agregar casos de prueba específicos
  para las herramientas creadas o modificadas (prefijo `TC-MCP-NNN`).
- Cada caso de prueba debe tener un código identificador único (ej. `TC-001`).

```md
# test-NNN — Título descriptivo

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso        | Endpoint de creación | Identificador | Eliminado |
|----------------|----------------------|---------------|-----------|
| {{recurso}}    | `POST /{{ruta}}`     | `{{id}}`      | ⬜ / ✅     |

**Entorno de pruebas:** {{desarrollo}}
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-001 — Nombre del caso
**Precondición:** ...
**Datos de prueba usados:** `{{id}}` / `{{credenciales}}`
**Pasos:**
1. ...
2. ...
**Resultado esperado:** ...
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones reportadas por el usuario: error, comportamiento
inesperado, lentitud, detalle visual… o "sin observaciones"}}

### TC-MCP-001 — Nombre del caso MCP (si aplica)
**Herramienta probada:** `{{nombre-herramienta}}` en `{{nombre-mcp}}`
**Precondición:** ...
**Input de prueba:** ...
**Output esperado:** ...
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** ...

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: {{n}}
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
```

---

## Pruebas manuales asistidas por Claude

> Aplica cuando el usuario pide apoyo para **ejecutar** los casos de
> `docs/testing/test-NNN-slug.md`. Claude actúa como copiloto: prepara los
> datos, guía la ejecución y registra los hallazgos.
> **Quien interactúa con la UI es siempre el usuario**, salvo instrucción
> explícita en contrario.

### 1. Preparación de datos vía API

- Leer el archivo `test-NNN-slug.md` completo e identificar las precondiciones
  de cada caso antes de crear nada.
- Confirmar con el usuario el **entorno** contra el que se trabajará. Por
  defecto, desarrollo (`.env.local` → instancia local en `mirp-lab`, ver
  "Base de datos"). **Nunca crear datos de prueba en producción** sin
  confirmación explícita en esa misma sesión — desde el 2026-07-31 sí existen
  entornos separados, pero la confirmación de alcance sigue aplicando igual:
  algunas verificaciones (ej. probar un fix ya desplegado) legítimamente
  necesitan producción.
- Crear **todo lo necesario para ejecutar las pruebas vía API**: usuarios,
  autenticación, registros base, estados intermedios, relaciones y cualquier
  precondición del caso. Usar los endpoints documentados en "Backend y APIs"
  o las herramientas del MCP correspondiente.
- No manipular la base de datos directamente para montar precondiciones
  salvo que el usuario lo indique; si no existe endpoint para algo necesario,
  reportarlo antes de improvisar.
- Registrar **cada recurso creado** (recurso, endpoint, payload relevante e
  identificador devuelto) en la sección "Datos de prueba" del archivo `test-NNN`.
  Sin este registro no se puede garantizar la limpieza posterior.
- Entregar al usuario, antes de empezar, el resumen de lo que quedó montado:
  credenciales, IDs, estado inicial y qué caso cubre cada dato.

### 2. Guía paso a paso durante la ejecución

- Ejecutar **un caso de prueba a la vez**, en orden, sin adelantarse.
- Para cada caso, indicarle al usuario de forma explícita:
  - la precondición ya montada y con qué datos/credenciales,
  - la pantalla o ruta desde la que debe partir,
  - los pasos concretos a seguir, numerados,
  - el resultado esperado y qué debe observar en detalle.
- Esperar el reporte del usuario antes de pasar al siguiente caso.
- Si el usuario reporta un fallo, pedir el mínimo detalle necesario para
  documentarlo (mensaje de error, respuesta de red, comportamiento observado)
  y ofrecer verificación por API del estado resultante del recurso.
- **No dar por aprobado ningún caso que el usuario no haya confirmado**, ni
  inferir resultados a partir de la respuesta de la API.

### 3. Registro de hallazgos

- Tras cada caso, actualizar `docs/testing/test-NNN-slug.md` inmediatamente:
  - cambiar el campo **Estado** (✅ Aprobado / ❌ Fallido),
  - completar el campo **Hallazgos** con lo observado, incluso si el caso pasó
    (comportamientos raros, lentitud, detalles visuales, mensajes poco claros).
- No esperar al final de la ronda para escribir: el archivo de test se actualiza
  caso por caso.
- Los hallazgos que impliquen bugs fuera del scope del spec se registran además
  en `docs/specs/backlog.md`; **no se corrigen dentro de la sesión de pruebas**
  sin aprobación explícita del usuario.
- Al cerrar la ronda, completar la sección "Resumen de la ronda" del archivo.

### 4. Limpieza de datos

- Al terminar la ronda, **eliminar vía API todos los datos creados en el paso 1**,
  en orden inverso a su creación para respetar dependencias.
- Verificar que la eliminación fue efectiva (consultar el recurso y confirmar
  `404` / lista vacía).
- Marcar cada recurso como eliminado en la tabla "Datos de prueba" del archivo
  `test-NNN` y marcar la limpieza como completada en el resumen.
- Si algún recurso no puede eliminarse vía API, reportarlo al usuario con el
  identificador exacto y el motivo; **nunca borrarlo directamente en base de
  datos sin confirmación explícita**.
- No cerrar la sesión de pruebas dejando datos huérfanos en el entorno.
- Si el usuario pide conservar los datos para una segunda ronda, dejarlo
  anotado en el archivo `test-NNN` junto con los IDs pendientes de limpieza.

---

## Pruebas visuales y uso del navegador

- **Las pruebas visuales las ejecuta el usuario.** Claude no valida por su
  cuenta apariencia, layout, responsive ni comportamiento visual, salvo que el
  usuario le indique lo contrario de forma explícita.
- **Claude no abre ni controla el navegador** —navegación, automatización,
  capturas de pantalla, inspección del DOM— a menos que el usuario lo solicite
  expresamente en esa misma sesión.
- Si Claude considera que una verificación automatizada en navegador aportaría
  valor (por ejemplo, reproducir un bug reportado), puede **proponerlo** y
  esperar respuesta; nunca iniciarlo por su cuenta.
- Cuando el usuario autorice el uso del navegador, limitarse al alcance
  autorizado (entorno, rutas y casos indicados), no ejecutar acciones
  destructivas ni sobre producción, y reportar lo observado sin ampliar el
  alcance.
- La autorización es puntual: vale para la petición concreta, no para toda la
  sesión ni para sesiones futuras.
- Los tests e2e automatizados que ejecuta `@tester` como fase del spec no
  cuentan como "acceder al navegador" y siguen su flujo normal.

---

## Despliegue

> ⚠️ Ningún paso de esta sección debe ejecutarse sin confirmación explícita
> del usuario en la misma sesión. El despliegue siempre lo inicia el usuario;
> Claude puede asistir en la preparación y verificación.

Esta plataforma es una app **Next.js full-stack desplegada en Vercel**, con
**Supabase** como backend gestionado (Postgres, Auth y Storage). No existe un
servicio de backend independiente: el "backend" es Supabase y no requiere un
paso de deploy propio más allá de aplicar migraciones de esquema.

---

### Infraestructura

#### Base de datos / Backend (Supabase)

| Campo                | Valor                                                   |
|----------------------|---------------------------------------------------------|
| Proveedor            | `Supabase` (Postgres gestionado + Auth + Storage)       |
| Proyecto             | `academy-page`                                          |
| Project ref          | `bgiimadnmqnoqmdbudpo`                                  |
| Región               | `us-west-2`                                             |
| Variables de conexión| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`  |
| Panel de control     | `https://supabase.com/dashboard/project/bgiimadnmqnoqmdbudpo`|

#### Frontend (Vercel)

| Campo              | Valor                                          |
|--------------------|------------------------------------------------|
| Proveedor          | `Vercel`                                       |
| Proyecto           | `nodo-edu`                                     |
| Rama de producción | `main`                                         |
| URL producción     | `https://www.nod0.dev` (también `https://nod0.dev` y `https://nodo-edu.vercel.app`) |
| Deploy trigger     | `push a main → auto-deploy`                     |
| Panel de control   | `https://vercel.com/santiago-suarez-cortes-projects/nodo-edu`   |

---

### Checklist pre-despliegue

Ejecutar este checklist **antes de iniciar cualquier despliegue**:

- [ ] Todos los specs afectados están en estado `[DONE]`.
- [ ] La rama `development` tiene todos los merges requeridos.
- [ ] Las variables de entorno de producción están actualizadas en Vercel y
      Supabase — **no en archivos locales**.
- [ ] Si hay cambios de esquema, el script de migración está preparado y revisado.
- [ ] El build local pasa sin errores (`npm run build`).
- [ ] El linter pasa sin errores (`npm run lint`).
- [ ] (Cuando exista framework de tests) los tests pasan en su totalidad.
- [ ] Los datos de prueba de las rondas manuales fueron eliminados del
      proyecto Supabase (ver "Pruebas manuales asistidas por Claude").
- [ ] Se creó la rama `deploy/{{versión-o-descripción}}` desde `development`.

---

### Proceso de despliegue (Vercel + Supabase)

```
development ──merge──▶ deploy/vX.Y.Z ──merge──▶ main ──push──▶ Vercel (auto-deploy)
```

#### Paso a paso

1. **Preparar rama de despliegue**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b deploy/{{versión}}
   ```

2. **Aplicar migraciones en Supabase** *(solo si hay cambios de esquema)*
   > ⚠️ Requiere confirmación explícita del usuario antes de ejecutar.
   ```bash
   # Aplicar migraciones pendientes en producción:
   supabase db push --project-ref bgiimadnmqnoqmdbudpo

   # Ver estado de migraciones:
   supabase migration list --project-ref bgiimadnmqnoqmdbudpo
   ```
   - Verificar los cambios en `Table Editor` del panel de Supabase antes de continuar.
   - Si el proyecto usa Row Level Security (RLS), validar que las nuevas tablas
     o columnas tienen las políticas correctas aplicadas.

3. **Verificar variables de entorno en Vercel**
   - Acceder a `Settings → Environment Variables` en el panel de Vercel.
   - Confirmar que todas las variables requeridas están presentes para el
     entorno `Production`:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
     SUPABASE_SERVICE_ROLE_KEY
     NEXT_PUBLIC_SITE_URL
     ```

4. **Merge a `main`**
   > ⚠️ Requiere confirmación explícita del usuario.
   ```bash
   git checkout main
   git pull origin main
   git merge deploy/{{versión}} --no-ff -m "deploy: release {{versión}}"
   ```

5. **Push a `main`**
   > ⚠️ Requiere confirmación explícita del usuario.
   ```bash
   git push origin main
   ```
   Vercel detecta el push y lanza el build automáticamente.
   Si es deploy manual, ejecutar:
   ```bash
   npx vercel --prod
   ```

6. **Verificar el despliegue en Vercel**
   - Confirmar que el build terminó sin errores en el panel de Vercel
     (`Deployments → último deployment`).
   - Navegar a `https://www.nod0.dev` y verificar que la aplicación carga.
   - Revisar la consola del navegador en busca de errores críticos.
   - Validar un flujo con Supabase (login/lectura de contenido) para confirmar
     la conexión con la base de datos.

7. **Limpiar ramas**
   ```bash
   git branch -d deploy/{{versión}}
   git push origin --delete deploy/{{versión}}
   ```

---

### Migraciones de base de datos — Supabase

> Nota: desde el 2026-07-31 desarrollo y producción son proyectos Supabase
> **separados** (ver "Base de datos") — `supabase db push`/`migration list`
> sin `--project-ref` aplican sobre el proyecto que esté enlazado
> (`supabase link`) en la máquina donde se ejecuten; usar
> `--project-ref bgiimadnmqnoqmdbudpo` explícito para apuntar a producción
> sin ambigüedad, como en los comandos de abajo.

- Proveedor PostgreSQL gestionado con Storage, Auth y Realtime integrados.
- Las migraciones se gestionan con la CLI de Supabase:
  ```bash
  # Aplicar migraciones pendientes en producción:
  supabase db push --project-ref bgiimadnmqnoqmdbudpo

  # Ver estado de migraciones:
  supabase migration list --project-ref bgiimadnmqnoqmdbudpo
  ```
- Verificar cambios en `Table Editor` del panel antes de confirmar.
- Si el proyecto usa Row Level Security (RLS), validar que las nuevas
  tablas o columnas tienen las políticas correctas aplicadas.
- Panel: `https://supabase.com/dashboard/project/bgiimadnmqnoqmdbudpo`

---

### Rollback de emergencia

Si el despliegue produce errores críticos en producción:

#### Frontend — Vercel
1. Acceder al panel de Vercel → proyecto → `Deployments`.
2. Localizar el último deployment exitoso.
3. Hacer clic en `···` → `Promote to Production`.
4. Vercel redirige el tráfico al deployment anterior en segundos.

#### Base de datos — Supabase
> No existe rollback automático para migraciones de esquema.
> Si la migración causó pérdida o corrupción de datos, escalar
> inmediatamente al usuario con el detalle del error antes de
> ejecutar cualquier acción. El rollback de esquema debe planificarse
> manualmente (script SQL de reversión revisado con el usuario).

---

### Acciones prohibidas en despliegue

Además de las acciones prohibidas generales, durante el proceso de despliegue
Claude **nunca** debe:

- Ejecutar migraciones en producción sin confirmación explícita del usuario
  en esa misma sesión, incluso si forman parte del checklist.
- Hacer `push` a `main` sin que el usuario haya aprobado el merge previamente.
- Modificar variables de entorno directamente en Vercel o Supabase.
- Ejecutar un rollback de base de datos sin escalar al usuario primero.
- Crear o eliminar proyectos, bases de datos o servicios en cualquier proveedor.

---

## Acciones prohibidas

> Claude nunca debe realizar las siguientes acciones sin confirmación explícita
> del usuario en esa misma sesión:

- **Iniciar la implementación de un spec** (escribir código, crear archivos de
  implementación, modificar módulos existentes) sin aprobación explícita del
  paquete spec + pruebas.
- **Abrir o controlar el navegador** para navegar, automatizar o verificar
  visualmente la aplicación sin que el usuario lo haya solicitado.
- Dar por aprobado un caso de prueba manual que el usuario no haya confirmado.
- Crear datos de prueba en producción, o cerrar una ronda de pruebas manuales
  dejando datos de prueba sin eliminar.
- Borrar archivos o carpetas (salvo temporales generados por la propia tarea).
- Ejecutar migraciones de base de datos en entornos distintos al local.
- Hacer push a `main` o `development` directamente.
- Modificar variables de entorno de producción.
- Instalar dependencias nuevas sin mencionarlo y esperar confirmación.
- Hacer commit de archivos `.env*` reales.
- Editar el spec activo o sus archivos de prueba para ampliar su scope sin
  aprobación del usuario.
- Dejar un spec sin estado en el título o cambiarlo de estado sin que se cumplan
  las condiciones de la transición (ver "Specs de funcionalidades → Estados válidos").
- Eliminar o reemplazar un MCP activo sin confirmar que ningún agente lo consume.
- Modificar un system prompt en `docs/mcps/` fuera de una fase de MCP
  aprobada en el spec correspondiente.
- Borrar datos directamente en base de datos cuando la limpieza vía API falle;
  reportar al usuario en su lugar.

---

## Git — Branching & Commits

### Estructura de ramas

| Propósito                         | Prefijo     | Ejemplo                          |
|-----------------------------------|-------------|----------------------------------|
| Nueva funcionalidad o spec        | `feat/`     | `feat/auth-estudiante`           |
| Corrección de bug                 | `fix/`      | `fix/lesson-pagination`          |
| Preparación de despliegue         | `deploy/`   | `deploy/v1.0.0`                  |

- `main` — producción; solo recibe merges desde `deploy/`.
- `development` — integración y pruebas; todas las ramas `feat/` y `fix/`
  se desprenden de aquí.
- Al mergear una rama a `development`, eliminarla inmediatamente.
- Los ajustes de despliegue van en `deploy/<nombre>` y se mergean a `main`.
- Solo se puede hacer merge a `development` de specs en estado `[DONE]` que
  cuenten con su archivo `test-NNN` aprobado.

### Commits

- Hacer commits cuando el volumen de cambios lo justifique; no commits triviales.
- Mensajes **completamente en inglés**, siguiendo
  [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

Tipos válidos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`,
`style`, `perf`, `ci`.

Ejemplos:
```
feat(courses): add lesson page with MDX rendering
fix(auth): resolve session token refresh on page reload
chore(deps): upgrade next to v16.2
docs(courses): add estructura-de-datos project specs
docs(mcps): update content-agent system prompt with new tools
feat(mcp): add lesson-read tool to courses-mcp server
test(enrollment): add manual test cases for spec-003 course enrollment
```
