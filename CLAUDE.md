# CLAUDE.md — Educational Page

> Este archivo es la fuente de verdad para Claude Code en este proyecto.
> Léelo completo antes de ejecutar cualquier acción.

---

## Inicialización de sesión

Antes de cualquier tarea, Claude debe ejecutar estos pasos en orden:

1. Leer este archivo completo.
2. Leer `DESIGN.md` si la tarea involucra UI.
3. Listar los specs activos (`[IN PROGRESS]` o `[TESTING]`) en `specs/`.
4. Confirmar el repositorio activo y la rama actual con `git status`.
5. Si hay contexto previo relevante (spec en curso, decisión de arquitectura,
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

En `/.agents/` viven instrucciones para subagentes. Leer el archivo del agente
antes de invocarlo. No improvisar su comportamiento.

| Agente        | Cuándo invocarlo                                              |
|---------------|---------------------------------------------------------------|
| `@architect`  | Diseño de specs: fases, archivos impactados, sin código       |
| `@reviewer`   | Revisión de código antes de marcar un spec como `[DONE]`     |
| `@tester`     | Generación y ejecución de casos de prueba e2e                 |

> Si en `/.agents/` existen agentes adicionales específicos del proyecto,
> tienen precedencia sobre la tabla anterior.

---

## Contexto del proyecto

Plataforma web educativa para publicar y gestionar material académico de cursos de programación e inteligencia artificial, dirigida a ingenieros de sistemas, electrónicos y de ciencias de datos.

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
└── docs/                  # Documentación y casos de prueba
    ├── specs/             # Specs de funcionalidades
    └── testing/
```

---

## Stack tecnológico

### Frontend / Framework principal
- **Next.js 15** (App Router) + **TypeScript** — full-stack React con server actions y API routes.
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

# Linter
npm run lint
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

- Framework: por definir (pendiente de decisión de arquitectura).
- Antes de cerrar una tarea con lógica crítica, verificar que existe al menos
  un test que cubra el caso feliz.
- No borrar ni modificar tests existentes sin instrucción explícita.
- Los tests e2e son responsabilidad de `@tester` y se ejecutan como última
  fase de cada spec antes del merge a `development`.

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

### Estructura mínima de un spec

```md
# spec-NNN — [Estado] Título descriptivo

## Contexto
Por qué se necesita esta funcionalidad y qué problema resuelve.

## Alcance
Qué incluye y qué **no** incluye este spec.

## Impacto en el sistema
Componentes, rutas, modelos o servicios afectados.

## Fases de implementación

### Fase 1 — Nombre
- [ ] Paso concreto
- [ ] Paso concreto

### Fase 2 — Nombre
- [ ] Paso concreto

## Criterios de aceptación
- El usuario puede hacer X.
- El sistema responde con Y ante Z.

## Pruebas e2e (si aplica)
Descripción de los casos a automatizar en la última fase, ejecutados por @tester.
```

---

## Nuevas funcionalidades

### Antes de implementar

1. Analizar el impacto del feature en todos los componentes del proyecto.
2. Usar el subagente `@architect` para crear el plan de implementación:
   - Solo descripción de fases, pasos y archivos a editar.
   - Sin código.
3. Guardar el plan en `docs/specs/` con la nomenclatura definida.
4. Esperar aprobación del usuario antes de escribir código.
5. Crear una rama nueva desde `development` siguiendo las reglas de git.

### Durante la implementación

- Trabajar fase por fase según el spec; no saltarse pasos.
- Al iniciar la Fase 1 de cualquier spec, cambiar su estado a `[IN PROGRESS]`.
- Al completar cada fase, documentarla como completada en el propio spec.
- Si el scope del spec debe cambiar (nuevo hallazgo, bloqueante estructural),
  proponer la modificación al usuario **antes** de proceder. No editar el spec
  unilateralmente ni implementar fuera de él.
- Si se descubre deuda técnica fuera del scope, documentarla con un comentario
  `// DEBT:` en el código y registrarla en `docs/specs/backlog.md`, sin actuar
  sobre ella en la tarea actual.
- Si aparece un bloqueante no previsto en el spec, reportarlo antes de improvisar.
- No modificar archivos fuera del alcance del spec sin avisar.

### Después de terminar la implementación

1. Crear el archivo de pruebas manuales en `docs/testing/` con la nomenclatura
   `test-{{NNN}}-{{slug-descriptivo}}.md` (mismos NNN y slug que el spec).
2. Cambiar el estado del spec a `[TESTING]`.
3. El usuario ejecutará los casos manualmente e indicará cuáles pasan.
   Claude marcará cada caso como completado en el archivo de test.
4. Cuando todos los casos estén aprobados, invocar `@tester` para ejecutar
   las pruebas e2e definidas en el spec (si aplica).
5. Al superar todas las pruebas, marcar el spec como `[DONE]`.

### Pruebas manuales — estructura del archivo

- Todos los archivos `test-NNN` van en `docs/testing/` en la raíz del proyecto.
- Solo incluir casos manuales de flujos con UI. Los endpoints se validan con pruebas e2e desde el propio spec.
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
```

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
- Editar el spec activo para ampliar su scope sin aprobación del usuario.

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
chore(deps): upgrade next to v15.3
docs(courses): add estructura-de-datos project specs
```
