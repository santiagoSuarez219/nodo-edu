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
4. Listar los specs activos (`[IN PROGRESS]` o `[TESTING]`) en `docs/specs/`.
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
├── content/               # Artículos MDX por curso
│   └── cursos/
│       └── <curso>/       # Un directorio por curso
├── courses/               # Microdiseños curriculares (info.md, projects/)
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
| `NEXT_PUBLIC_SITE_URL` | URL base del sitio (redirects OAuth y password recovery) |

> ⚠️ Nunca escribas valores reales de variables de entorno en este archivo
> ni en ningún archivo rastreado por git.

---

## Base de datos

- Proveedor: **Supabase Postgres**.
- Cuando hagas modificaciones al esquema, crea siempre una migración para producción.
- Nunca ejecutar migraciones en entornos distintos al local sin confirmación explícita.
- Row Level Security habilitado; verificar políticas antes de añadir nuevas tablas.

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
courses/<curso>/           # Microdiseño curricular (info.md, projects/)
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
| `attendance-mcp` | Cliente de solo lectura de la API `/api/attendance/*` para que un agente docente liste sesiones de asistencia, consulte roster y resúmenes de asistencia por estudiante. | Activo | `docs/mcps/attendance-agent.system-prompt.md` |

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
| `[IN PROGRESS]` | Implementación iniciada                                         |
| `[TESTING]`     | Implementación completa, pendiente de pruebas manuales/e2e      |
| `[DONE]`        | Pruebas superadas, listo para merge a `development`             |

- Los specs completados **no se borran**; se marcan con `[DONE]` en el título.
- Solo specs en estado `[DONE]` con su archivo `test-NNN` correspondiente
  pueden hacer merge a `development`.

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
# spec-NNN — [Estado] Título descriptivo

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
6. Guardar el spec en `docs/specs/` y los archivos de prueba en sus carpetas,
   todos con la misma nomenclatura `NNN-slug`.
7. Esperar aprobación del usuario del **paquete completo (spec + pruebas)**
   antes de escribir el código de implementación.

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
- Al iniciar la Fase 1 de cualquier spec, cambiar su estado a `[IN PROGRESS]`.
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
3. El usuario ejecutará los casos manuales de `docs/testing/test-NNN` e indicará
   cuáles pasan. Claude marcará cada caso como completado en el archivo de test.
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

## Casos de prueba

### TC-001 — Nombre del caso
**Precondición:** ...
**Pasos:**
1. ...
2. ...
**Resultado esperado:** ...
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido

### TC-MCP-001 — Nombre del caso MCP (si aplica)
**Herramienta probada:** `{{nombre-herramienta}}` en `{{nombre-mcp}}`
**Precondición:** ...
**Input de prueba:** ...
**Output esperado:** ...
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
```

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
| Proyecto             | `{{nombre del proyecto en Supabase}}`                   |
| Project ref          | `{{project-ref}}`                                        |
| Región               | `{{región de producción}}`                              |
| Variables de conexión| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`  |
| Panel de control     | `https://supabase.com/dashboard/project/{{project-ref}}`|

#### Frontend (Vercel)

| Campo              | Valor                                          |
|--------------------|------------------------------------------------|
| Proveedor          | `Vercel`                                       |
| Proyecto           | `{{nombre del proyecto en Vercel}}`            |
| Rama de producción | `main`                                         |
| URL producción     | `{{url del proyecto desplegado}}`              |
| Deploy trigger     | `push a main → auto-deploy`                     |
| Panel de control   | `https://vercel.com/{{equipo}}/{{proyecto}}`   |

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
   supabase db push --project-ref {{project-ref}}

   # Ver estado de migraciones:
   supabase migration list --project-ref {{project-ref}}
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
   - Navegar a `{{url de producción}}` y verificar que la aplicación carga.
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

- Proveedor PostgreSQL gestionado con Storage, Auth y Realtime integrados.
- Las migraciones se gestionan con la CLI de Supabase:
  ```bash
  # Aplicar migraciones pendientes en producción:
  supabase db push --project-ref {{project-ref}}

  # Ver estado de migraciones:
  supabase migration list --project-ref {{project-ref}}
  ```
- Verificar cambios en `Table Editor` del panel antes de confirmar.
- Si el proyecto usa Row Level Security (RLS), validar que las nuevas
  tablas o columnas tienen las políticas correctas aplicadas.
- Panel: `https://supabase.com/dashboard/project/{{project-ref}}`

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

- Borrar archivos o carpetas (salvo temporales generados por la propia tarea).
- Ejecutar migraciones de base de datos en entornos distintos al local.
- Hacer push a `main` o `development` directamente.
- Modificar variables de entorno de producción.
- Instalar dependencias nuevas sin mencionarlo y esperar confirmación.
- Hacer commit de archivos `.env*` reales.
- Editar el spec activo o sus archivos de prueba para ampliar su scope sin
  aprobación del usuario.
- Eliminar o reemplazar un MCP activo sin confirmar que ningún agente lo consume.
- Modificar un system prompt en `docs/mcps/` fuera de una fase de MCP
  aprobada en el spec correspondiente.

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
