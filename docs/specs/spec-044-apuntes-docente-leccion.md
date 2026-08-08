# spec-044 — [TESTING] Apuntes docente en la vista de lección/guía

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
minutado ni objetivos de sesión—, visible **solo** para el docente dueño del
curso o un admin.

> **Cambio de diseño (2026-08-08, aprobado por el usuario tras TC-001):** la
> primera implementación embebía el apunte como bloque dentro de
> `TeacherLessonPanel` (spec-031). Con contenido real, ese bloque alargaba
> demasiado la página de lección. Se movió a una **ruta dedicada**
> (`/[courseSlug]/[lessonSlug]/apuntes`), enlazada con un botón en el header
> de `LessonArticle` — visible solo cuando hay apunte y solo para owner/admin.
> El resto del diseño (gate interno, resolución por `articleSlug`, carpeta
> `apuntes/`) no cambió. Ver "Fases de implementación" para el detalle del
> ajuste.

## Alcance

**Incluye:**
- Una carpeta de contenido nueva, `content/cursos/<curso>/apuntes/<articleSlug>.md`,
  con un apunte por sección (opcional: no todas las secciones lo tienen).
- Una frontera de lectura nueva (`lib/courses/teacher-notes.ts`) que resuelve
  el archivo por `articleSlug` y devuelve su contenido solo si
  `hasCourseAccess(courseSlug).reason` es `"owner"` o `"admin"` — el gate vive
  **dentro** de la función, igual que `getAnswerKeyForLesson` (spec-031), no
  solo en la página.
- Una ruta dedicada `/[courseSlug]/[lessonSlug]/apuntes` que renderiza el
  Markdown vía el pipeline MDX existente (`MdxContent`), gateada de nuevo por
  owner/admin (404 para cualquier otro caso, incluido un `enrolled` con
  acceso a la lección). Un botón "Apuntes de clase" en el header de
  `LessonArticle` enlaza a esta ruta, visible solo cuando existe apunte para
  esa sección.
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
- Un índice/listado de todos los apuntes de un curso. La única forma de
  llegar a `/apuntes` es desde el botón del header de la lección/guía a la
  que pertenece — no hay navegación propia agregada por curso.
- Migración a la plataforma de contenido de `courses/*/projects/` u otras
  fuentes ajenas a `microdiseno/labs/`.

## Impacto en el sistema

| Archivo | Acción |
|---|---|
| `lib/courses/teacher-notes.ts` | Crear — `resolveTeacherNotesPath`, `getTeacherLessonNotes` (contenido, gate interno) y `hasTeacherLessonNotes` (existencia liviana, mismo gate) |
| `app/(cursos)/[courseSlug]/[lessonSlug]/apuntes/page.tsx` | Crear — ruta dedicada, gate owner/admin propio (404 en cualquier otro caso), renderiza `MdxContent` envuelto en `ErrorBoundary` |
| `content/cursos/<curso>/apuntes/` | Crear — carpeta de contenido, uno o más `.md` |
| `components/courses/LessonArticle.tsx` | Modificar — prop `teacherNotesHref?: string \| null`, botón en el header cuando está presente |
| `components/courses/TeacherLessonPanel.tsx` | Sin cambios netos (el bloque embebido se agregó y se revirtió en la misma sesión) |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Modificar — resolver `hasTeacherLessonNotes` dentro de la rama `owner`/`admin` existente, pasar `teacherNotesHref` a `LessonArticle` |
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
- [x] Crear `lib/courses/teacher-notes.ts` con `CONTENT_ROOT` propio,
      consistente con el de `lib/courses/content.ts`.
- [x] Implementar `resolveTeacherNotesPath(courseSlug, articleSlug)` →
      `content/cursos/<courseSlug>/apuntes/<articleSlug>.md`. Sin
      discriminar por `kind`: lecciones y guías comparten carpeta (su
      `articleSlug` ya es único dentro del curso).
- [x] Validar `articleSlug` contra path traversal (rechazar `/`, `..`) antes
      de componer la ruta.
- [x] Implementar `getTeacherLessonNotes(courseSlug, articleSlug): Promise<string | null>`:
  - [x] Gate interno: `hasCourseAccess(courseSlug)`; si `!ok` o `reason` no es
        `"owner"` ni `"admin"` → `return null` **antes** de tocar el
        filesystem (mismo patrón que `getAnswerKeyForLesson`, spec-031).
  - [x] Leer con `fs.readFile` + `gray-matter`; devolver solo `content` (el
        frontmatter, si lo hubiera, se descarta).
  - [x] `ENOENT` → `null` (no hay apunte para esa sección, no es un error).
  - [x] Cualquier otro error de lectura/parseo → `console.error` + `null`
        (fallar cerrado, nunca propagar ni tumbar la página).

### Fase 2 — Componente de presentación (revertida, ver Fase 3b)
- [x] Leer `DESIGN.md` completo y las skills `frontend-design` y
      `tailwind-css-patterns` antes de escribir markup de esta fase.
- [x] ~~Crear `components/courses/TeacherClassNotes.tsx` (bloque colapsable
      embebido en `TeacherLessonPanel`)~~ — implementado, probado en TC-001,
      y **revertido** en la Fase 3b tras el cambio de diseño: la lección
      quedaba extremadamente larga con contenido real. El archivo se borró
      (era código de esta misma sesión, sin uso fuera de ella).

### Fase 3 — Integración en la vista docente (revertida, ver Fase 3b)
- [x] ~~Embeber el apunte como bloque dentro de `TeacherLessonPanel`~~ —
      implementado y revertido en la misma sesión (ver Fase 3b). No queda
      código de esta fase en el árbol final.

### Fase 3b — Ruta dedicada y botón en el header (reemplaza Fases 2-3)
> Ajuste de diseño aprobado por el usuario en sesión (2026-08-08), después de
> validar TC-001 con contenido real y confirmar que el bloque embebido
> alargaba demasiado la página.
- [x] En `lib/courses/teacher-notes.ts`, añadir `hasTeacherLessonNotes(courseSlug, articleSlug): Promise<boolean>`:
      mismo gate `owner`/`admin` y mismo tratamiento de errores que
      `getTeacherLessonNotes`, pero con `fs.access` en vez de `fs.readFile` +
      `gray-matter` — decide si mostrar el botón sin leer ni parsear el
      Markdown completo en cada carga de la lección.
- [x] Crear `app/(cursos)/[courseSlug]/[lessonSlug]/apuntes/page.tsx`
      (server component, `generateMetadata` propio):
  - [x] Resolver `getLessonBySlug(courseSlug, lessonSlug)`; `notFound()` si no existe.
  - [x] El `layout.tsx` del segmento `[lessonSlug]` ya exige acceso al curso
        (`requireCourseAccess`); esta página añade su propio gate con
        `hasCourseAccess(courseSlug)` — si `reason` no es `"owner"` ni
        `"admin"` (incluido `"enrolled"`, que sí tiene acceso a la lección
        pero no a esta ruta), `notFound()`. Un estudiante que adivine la URL
        recibe 404, no un aviso de "sin acceso" que confirmaría que la ruta existe.
  - [x] Resolver `getTeacherLessonNotes(courseSlug, lesson.articleSlug)`;
        `null` → `notFound()`.
  - [x] Renderizar encabezado ("Apuntes de clase" + título de la
        lección/guía + enlace de vuelta) y `<MdxContent source={notes} />`
        envuelto en `ErrorBoundary` (mismo criterio que el resto de la vista
        docente: un fallo de compilación MDX no debe tumbar la página).
- [x] En `components/courses/LessonArticle.tsx`, añadir prop
      `teacherNotesHref?: string | null`: cuando está presente, renderiza un
      botón/enlace "Apuntes de clase" en el header, junto al título.
- [x] En `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, sustituir la
      resolución de contenido completo por `hasTeacherLessonNotes`; construir
      `teacherNotesHref = hasNotes ? "/${courseSlug}/${lessonSlug}/apuntes" : null`
      y pasarlo a `<LessonArticle>`. Revertir el prop `teacherNotes` de
      `<TeacherLessonPanel>` (vuelve a su forma previa a este spec).
- [x] Confirmar que `RESERVED_LESSON_SLUGS += "apuntes"` (Fase 4) sigue
      siendo correcto con el nuevo diseño: la ruta `/apuntes` es un segmento
      estático **anidado bajo** `[lessonSlug]`, no compite con un
      `lessonSlug` literal `"apuntes"` a ese mismo nivel — la reserva ya
      hecha no era estrictamente necesaria para esto, pero tampoco estorba
      (sigue protegiendo la carpeta de contenido de una colisión de nombre).

### Fase 4 — Reservas y validación del catálogo
- [x] Añadir `"apuntes"` a `RESERVED_LESSON_SLUGS` en `lib/courses/index.ts`.
- [x] Confirmar por inspección que ningún nodo actual usa `slug: "apuntes"`,
      para que el validador de arranque (IIFE al importar el módulo) no
      lance al aplicar este spec.
- [x] No extender la validación `existsSync` de artículos a los apuntes: son
      opcionales por diseño y validarlos rompería el build de los nodos que
      no tienen apunte.

### Fase 5 — Contenido semilla y documentación de formato
- [x] Crear `content/cursos/programacion-cientifica/apuntes/` con al menos un
      apunte real derivado del bloque "Desarrollo paso a paso" del
      `*-docente.md` correspondiente en `microdiseno/labs/`, sin minutado,
      objetivos ni diferenciación pedagógica.
- [x] Crear un segundo apunte para un nodo `kind: "guide"`, para ejercitar
      ambos tipos de sección.
- [x] Dejar intactos los archivos de `microdiseno/labs/`: no se migran ni se
      recortan en este spec.
- [x] Documentar en `.claude/skills/lesson-authoring/SKILL.md` el formato del
      apunte: encabezados de paso, bloques de código con lenguaje explícito,
      prohibición explícita de minutado/objetivos/ficha de sesión, y la
      advertencia de que el pipeline compila `.md` como MDX (escapar `<` y
      `{` fuera de fences de código, mismo riesgo documentado en spec-021).
- [x] Actualizar el árbol de `content/cursos/<curso>/` en `CLAUDE.md` con la
      carpeta `apuntes/` y la nota de que es material servido solo a
      owner/admin, distinto de `microdiseno/` (no publicado en ningún caso).

### Fase 6 — Verificación de despliegue
- [x] `npx tsc --noEmit`, `npm run lint` y `npm run build` en verde.
- [x] Verificar que los `.md` de `apuntes/` quedan incluidos en el file
      tracing de Vercel (misma raíz `content/cursos/` que ya funciona en
      producción para artículos y guías); si no aparecieran, añadir
      `outputFileTracingIncludes` en `next.config` y documentarlo aquí.
- [x] Confirmar que ninguna ruta estática expone `content/` ni `apuntes/`
      directamente.

**Nota de implementación:** no se agregó `outputFileTracingIncludes` a
`next.config.ts`. `getTeacherLessonNotes` resuelve la ruta con el mismo
patrón (`CONTENT_ROOT` fijo + segmento dinámico) que `getLessonArticle` usa
para `guias/`, que ya funciona en producción (spec-021, `[DONE]`) sin esa
configuración — se asume el mismo comportamiento de tracing por analogía
estructural; **queda pendiente confirmarlo en un despliegue real** antes del
primer uso en producción de este spec (ver checklist pre-despliegue de
`CLAUDE.md`).

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
   `content/cursos/<curso>/apuntes/<articleSlug>.md` ve un botón "Apuntes de
   clase" en el header de la lección; al hacer clic, llega a
   `/[courseSlug]/[lessonSlug]/apuntes` y ve el Markdown renderizado (código
   resaltado, tablas, listas).
2. Un **admin** ve el mismo botón y la misma página en las mismas
   condiciones, en cualquier curso.
3. Un **estudiante matriculado** que abre la misma lección no ve el botón, y
   si navega directamente a `/[courseSlug]/[lessonSlug]/apuntes` recibe 404
   — el contenido del apunte no aparece en el HTML ni en el payload RSC de
   ninguna de las dos rutas.
4. Un **visitante no autenticado** que navega directamente a
   `/[courseSlug]/[lessonSlug]/apuntes` es redirigido a login (gate del
   `layout.tsx` de `[lessonSlug]`), sin recibir el contenido del apunte en
   ningún punto.
5. Si no existe archivo de apuntes para el `articleSlug`, la lección carga
   normalmente sin el botón, y navegar directamente a `/apuntes` para esa
   sección da 404: sin error, sin placeholder.
6. El comportamiento es idéntico para nodos `kind: "guide"` y para lecciones
   (`kind` ausente o `"lesson"`).
7. Si el archivo de apuntes existe pero falla al compilarse, el
   `ErrorBoundary` de `/apuntes` muestra el mensaje de fallo dentro de esa
   página, sin tumbar el resto de la app; la lección de origen (artículo,
   clave de respuestas, asistencia) no se ve afectada en ningún caso, porque
   ya no comparten el mismo árbol de render.
8. Toda la funcionalidad de spec-031 sigue operativa sin regresión: clave de
   respuestas (con su estado colapsable de spec-038), selector de grupo y
   código de asistencia — `TeacherLessonPanel` queda funcionalmente idéntico
   a como estaba antes de este spec.
9. `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan sin errores, y
   el validador de `lib/courses/index.ts` no lanza pese a que la mayoría de
   nodos no tienen apuntes.
10. Ningún nodo del catálogo puede declarar `slug: "apuntes"`: intentarlo hace
    fallar el arranque con el mensaje de slug reservado.
11. No se modificó ningún archivo bajo `content/cursos/*/microdiseno/`, y
    ningún módulo de `app/` o `lib/` lee de esa carpeta.
12. Un usuario `enrolled` que invocara directamente `getTeacherLessonNotes`
    o `hasTeacherLessonNotes` (`courseSlug, articleSlug`) como Server Action
    recibiría `null`/`false` respectivamente, nunca el contenido del apunte
    ni una señal de que existe.
13. Un usuario `enrolled` con acceso válido a la lección que visita
    `/[courseSlug]/[lessonSlug]/apuntes` directamente (URL adivinada o
    compartida) recibe 404 — el gate de esta ruta es más estricto que el de
    la lección misma, no se conforma con "tiene acceso al curso".

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-044-apuntes-docente-leccion.md` — casos
  `TC-001` a `TC-013`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-044-apuntes-docente-leccion.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio (cuando exista
  framework).

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-08
