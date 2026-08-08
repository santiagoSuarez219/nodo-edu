# spec-044 — [NOT STARTED] Apuntes docente en la vista de lección/guía

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Cada sección de contenido del curso (lección o guía) puede requerir una guía
paso a paso de los ejercicios y el código que se implementa en clase — el
docente necesita esa referencia a mano mientras dicta, sin salir de la página
que está proyectando.

Hoy ese material, cuando existe, vive como planificación docente privada bajo
`content/cursos/<curso>/microdiseno/labs/<algo>-docente.md` (ver ejemplos
reales: `fundamentos-de-control-de-versiones-colab-y-diagnostico-docente.md`
en `programacion-cientifica` y `lab-00-git-fundamentos-docente.md` en
`estructuras-de-datos`). Esos archivos son documentos de planificación
completos — ficha de sesión, minutado, objetivos, diferenciación pedagógica,
además del guion de ejercicios — y **no se publican en la web** (`CLAUDE.md`
lo documenta explícitamente, y hoy ningún módulo de `app/` ni `lib/` lee de
`microdiseno/`).

Este spec introduce un artefacto **distinto y más acotado**: un apunte corto,
por sección, con únicamente el desarrollo de ejercicios y código —sin
minutado ni objetivos de sesión—, renderizado dentro de la propia página de
lección/guía, visible **solo** para el docente dueño del curso o un admin.
Reutiliza el gate de acceso y el contenedor de "vista docente" que spec-031
(`[DONE]`) ya construyó (`TeacherLessonPanel`), sumándole un tercer bloque.

## Alcance

**Incluye:**
- Una carpeta de contenido nueva, `content/cursos/<curso>/apuntes/<articleSlug>.md`,
  con un apunte por sección (opcional: no todas las secciones lo tienen).
- Una frontera de lectura nueva (`lib/courses/teacher-notes.ts`) que resuelve
  el archivo por `articleSlug` y devuelve su contenido solo si
  `hasCourseAccess(courseSlug).reason` es `"owner"` o `"admin"` — el gate vive
  **dentro** de la función, igual que `getAnswerKeyForLesson` (spec-031), no
  solo en la página.
- Un componente de presentación (`TeacherClassNotes`) que renderiza el
  Markdown vía el pipeline MDX existente (`MdxContent`), como bloque nuevo
  dentro de `TeacherLessonPanel`, abierto por defecto.
- Aplica por igual a lecciones (`kind` ausente o `"lesson"`) y a guías
  (`kind: "guide"`) — ambas pueden tener ejercicios que documentar.
- Reserva del slug `"apuntes"` en `RESERVED_LESSON_SLUGS`.
- Al menos dos apuntes reales de contenido semilla (uno para una lección, uno
  para una guía), derivados del bloque "Desarrollo paso a paso" de un
  `*-docente.md` existente, **sin** su minutado ni objetivos.
- Documentar el formato del nuevo artefacto en la skill `lesson-authoring` y
  en el árbol de `content/cursos/<curso>/` de `CLAUDE.md`.

**No incluye:**
- Migrar, recortar o tocar los archivos existentes en `microdiseno/labs/`:
  siguen siendo el documento de planificación completo, privado, fuera del
  runtime. Este spec no lee de `microdiseno/` en ningún módulo de `app/`/`lib/`.
- Un campo nuevo en `Lesson` (`lib/courses/types.ts`) para declarar el apunte:
  la resolución es implícita por convención de nombre sobre `articleSlug`
  (ver Fase 1), igual que ya hace `getLessonArticle`. No se edita ningún nodo
  existente de `lib/courses/data/*.ts`.
- Edición de apuntes desde una UI: se escriben como `.md` versionados en git,
  igual que artículos y guías (Fase 1 del proyecto).
- Persistencia de "colapsado/expandido" en cookie (patrón de spec-038 para la
  clave de respuestas): el bloque nace expandido por defecto y sin memoria de
  estado entre sesiones; si se pide luego, es un spec/ampliación posterior.
- Un índice o ruta dedicada de apuntes. No hay navegación propia: el apunte
  solo aparece embebido en la lección/guía a la que pertenece.
- Migración a la plataforma de contenido de `courses/*/projects/` u otras
  fuentes ajenas a `microdiseno/labs/`.

## Impacto en el sistema

| Archivo | Acción |
|---|---|
| `lib/courses/teacher-notes.ts` | Crear — `resolveTeacherNotesPath`, `getTeacherLessonNotes` (gate `owner`/`admin` interno) |
| `components/courses/TeacherClassNotes.tsx` | Crear — bloque colapsable, renderiza `MdxContent` |
| `content/cursos/<curso>/apuntes/` | Crear — carpeta de contenido, uno o más `.md` |
| `components/courses/TeacherLessonPanel.tsx` | Modificar — prop `teacherNotes: string \| null`, tercer bloque envuelto en `ErrorBoundary` |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Modificar — resolver apuntes dentro de la rama `owner`/`admin` existente (líneas ~159-192), pasar la prop nueva |
| `lib/courses/index.ts` | Modificar — `RESERVED_LESSON_SLUGS` += `"apuntes"` |
| `.claude/skills/lesson-authoring/SKILL.md` | Modificar — documentar el nuevo artefacto y su formato |
| `CLAUDE.md` (§ Repositorios del ecosistema) | Modificar — añadir `apuntes/` al árbol de `content/cursos/<curso>/` |
| `docs/testing/test-044-apuntes-docente-leccion.md` | Crear — casos manuales |
| Base de datos / RLS / migraciones | Sin cambios |
| MCPs | Sin cambios |

## Evaluación MCP

**¿Aplica MCP?** No.

- **¿Expone datos que un agente podría necesitar consultar?** El contenido ya
  es un archivo Markdown versionado en el repositorio, accesible a un agente
  con acceso al filesystem (igual razonamiento que spec-021, guías de
  laboratorio). Exponerlo por HTTP duplicaría un canal que ya existe, con peor
  control de acceso que el filesystem del repo.
- **¿Permite acciones que un agente debería ejecutar?** No. No hay estado en
  base de datos, no hay publicación ni ciclo de vida — es lectura de un
  archivo estático.
- **¿Ya existe un MCP que cubre un dominio relacionado?** `question-bank-mcp`
  y `attendance-mcp` no tocan contenido de curso; ninguno aplica.
- **¿Hay un agente definido en `docs/mcps/` que se beneficiaría?** No. Ningún
  system prompt cambia con este spec.

No se crean ni modifican MCPs. No se toca `docs/mcps/README.md` ni ningún
system prompt.

## Fases de implementación

### Fase 1 — Frontera de resolución de apuntes
- [ ] Crear `lib/courses/teacher-notes.ts` con `CONTENT_ROOT` propio,
      consistente con el de `lib/courses/content.ts`.
- [ ] Implementar `resolveTeacherNotesPath(courseSlug, articleSlug)` →
      `content/cursos/<courseSlug>/apuntes/<articleSlug>.md`. Sin
      discriminar por `kind`: lecciones y guías comparten carpeta (su
      `articleSlug` ya es único dentro del curso).
- [ ] Validar `articleSlug` contra path traversal (rechazar `/`, `..`) antes
      de componer la ruta.
- [ ] Implementar `getTeacherLessonNotes(courseSlug, articleSlug): Promise<string | null>`:
  - [ ] Gate interno: `hasCourseAccess(courseSlug)`; si `!ok` o `reason` no es
        `"owner"` ni `"admin"` → `return null` **antes** de tocar el
        filesystem (mismo patrón que `getAnswerKeyForLesson`, spec-031).
  - [ ] Leer con `fs.readFile` + `gray-matter`; devolver solo `content` (el
        frontmatter, si lo hubiera, se descarta).
  - [ ] `ENOENT` → `null` (no hay apunte para esa sección, no es un error).
  - [ ] Cualquier otro error de lectura/parseo → `console.error` + `null`
        (fallar cerrado, nunca propagar ni tumbar la página).

### Fase 2 — Componente de presentación
- [ ] Leer `DESIGN.md` completo y las skills `frontend-design` y
      `tailwind-css-patterns` antes de escribir markup de esta fase.
- [ ] Crear `components/courses/TeacherClassNotes.tsx` (server component):
      recibe `source: string`, renderiza `<MdxContent source={source} />`
      dentro de un contenedor con la misma estructura visual que el bloque
      "Asistencia" de `TeacherLessonPanel` (borde, cabecera con título
      "Apuntes de clase", cuerpo).
- [ ] Colapsable con `<details>`/`<summary>` nativo, **abierto por defecto**.
      Sin persistencia de estado en este spec (ver "No incluye").
- [ ] Usar exclusivamente tokens semánticos de `DESIGN.md`
      (`bg-brand-softer`, `text-brand`, escala `gray-*` con `dark:`), sin
      valores crudos de paleta ni toggle de tema manual.

### Fase 3 — Integración en la vista docente
- [ ] En `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, declarar
      `let teacherNotes: string | null = null` junto a las demás variables
      de la vista docente.
- [ ] Dentro del bloque `access.ok && (access.reason === "owner" || access.reason === "admin")`,
      sumar la resolución al `Promise.all` existente: solo si
      `lesson.articleSlug` está definido; si no, `null`.
- [ ] Pasar `teacherNotes={teacherNotes}` a `<TeacherLessonPanel />`.
- [ ] En `TeacherLessonPanel.tsx`, añadir `teacherNotes: string | null` a
      `TeacherLessonPanelProps` y renderizar `<TeacherClassNotes />` como
      **primer** bloque del contenedor (antes de la clave de respuestas y de
      asistencia — es lo primero que el docente consulta al iniciar la
      clase), condicionado a `teacherNotes !== null`.
- [ ] Envolver ese bloque en `<ErrorBoundary title="Los apuntes de clase no están disponibles" description="Ocurrió un error inesperado. Intenta de nuevo." />`,
      con el mismo criterio que ya usa `TeacherAttendanceControl`: un fallo
      de compilación MDX del apunte no debe tumbar el resto de la vista
      docente proyectada en clase.
- [ ] Verificar que la rama `enrolled` y `LessonClosureFlow` no se alteran:
      ambas ramas siguen siendo mutuamente excluyentes por construcción.

### Fase 4 — Reservas y validación del catálogo
- [ ] Añadir `"apuntes"` a `RESERVED_LESSON_SLUGS` en `lib/courses/index.ts`.
- [ ] Confirmar por inspección que ningún nodo actual usa `slug: "apuntes"`,
      para que el validador de arranque (IIFE al importar el módulo) no
      lance al aplicar este spec.
- [ ] No extender la validación `existsSync` de artículos a los apuntes: son
      opcionales por diseño y validarlos rompería el build de los nodos que
      no tienen apunte.

### Fase 5 — Contenido semilla y documentación de formato
- [ ] Crear `content/cursos/programacion-cientifica/apuntes/` con al menos un
      apunte real derivado del bloque "Desarrollo paso a paso" del
      `*-docente.md` correspondiente en `microdiseno/labs/`, sin minutado,
      objetivos ni diferenciación pedagógica.
- [ ] Crear un segundo apunte para un nodo `kind: "guide"`, para ejercitar
      ambos tipos de sección.
- [ ] Dejar intactos los archivos de `microdiseno/labs/`: no se migran ni se
      recortan en este spec.
- [ ] Documentar en `.claude/skills/lesson-authoring/SKILL.md` el formato del
      apunte: encabezados de paso, bloques de código con lenguaje explícito,
      prohibición explícita de minutado/objetivos/ficha de sesión, y la
      advertencia de que el pipeline compila `.md` como MDX (escapar `<` y
      `{` fuera de fences de código, mismo riesgo documentado en spec-021).
- [ ] Actualizar el árbol de `content/cursos/<curso>/` en `CLAUDE.md` con la
      carpeta `apuntes/` y la nota de que es material servido solo a
      owner/admin, distinto de `microdiseno/` (no publicado en ningún caso).

### Fase 6 — Verificación de despliegue
- [ ] `npx tsc --noEmit`, `npm run lint` y `npm run build` en verde.
- [ ] Verificar que los `.md` de `apuntes/` quedan incluidos en el file
      tracing de Vercel (misma raíz `content/cursos/` que ya funciona en
      producción para artículos y guías); si no aparecieran, añadir
      `outputFileTracingIncludes` en `next.config` y documentarlo aquí.
- [ ] Confirmar que ninguna ruta estática expone `content/` ni `apuntes/`
      directamente.

### Fase 7 — Pruebas
- [ ] Ejecutar los casos manuales de
      `docs/testing/test-044-apuntes-docente-leccion.md` (protocolo de
      "Pruebas manuales asistidas por Claude", entorno de desarrollo).
- [ ] Invocar `@reviewer` antes de marcar el spec como `[DONE]`.
- [ ] Pruebas automáticas: pendientes del framework de testing (ver
      `CLAUDE.md` → Testing); los criterios de aceptación quedan descritos
      abajo y `e2e-044-apuntes-docente-leccion.spec.ts` se crea cuando exista
      el framework.

## Criterios de aceptación

1. Un docente **owner** del curso que abre una lección con archivo
   `content/cursos/<curso>/apuntes/<articleSlug>.md` ve el bloque "Apuntes de
   clase" dentro de la vista docente, con el Markdown renderizado (código
   resaltado, tablas, listas) y abierto por defecto.
2. Un **admin** ve el mismo bloque en las mismas condiciones, en cualquier
   curso.
3. Un **estudiante matriculado** que abre la misma lección no ve el bloque, y
   el contenido del apunte no aparece en el HTML ni en el payload RSC de la
   respuesta.
4. Un **visitante no autenticado** en la misma lección tampoco recibe el
   contenido del apunte en la respuesta.
5. Si no existe archivo de apuntes para el `articleSlug`, la página del
   docente carga normalmente y el bloque simplemente no aparece: sin error,
   sin 404, sin placeholder.
6. El comportamiento es idéntico para nodos `kind: "guide"` y para lecciones
   (`kind` ausente o `"lesson"`).
7. Si el archivo de apuntes existe pero falla al compilarse, el
   `ErrorBoundary` muestra el mensaje de fallo solo en ese bloque: el
   artículo, la clave de respuestas, el panel de asistencia y la navegación
   siguen funcionando.
8. Toda la funcionalidad de spec-031 sigue operativa sin regresión: clave de
   respuestas (con su estado colapsable de spec-038), selector de grupo y
   código de asistencia.
9. `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan sin errores, y
   el validador de `lib/courses/index.ts` no lanza pese a que la mayoría de
   nodos no tienen apuntes.
10. Ningún nodo del catálogo puede declarar `slug: "apuntes"`: intentarlo hace
    fallar el arranque con el mensaje de slug reservado.
11. No se modificó ningún archivo bajo `content/cursos/*/microdiseno/`, y
    ningún módulo de `app/` o `lib/` lee de esa carpeta.
12. Un usuario `enrolled` que invocara directamente
    `getTeacherLessonNotes(courseSlug, articleSlug)` como Server Action
    recibiría `null`, nunca el contenido del apunte.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-044-apuntes-docente-leccion.md` — casos
  `TC-001` a `TC-012`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-044-apuntes-docente-leccion.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio (cuando exista
  framework).

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
