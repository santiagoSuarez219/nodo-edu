# spec-021 — [DRAFT] Guías de laboratorio y prácticas como nodo de contenido del curso

> **Estado:** `[DRAFT]` — paquete spec + pruebas manuales redactado, pendiente de
> aprobación del usuario. Al aprobarse e iniciar la Fase 1, pasa a `[IN PROGRESS]`.

---

## Contexto

Algunas actividades evaluativas del curso —laboratorios, sprints de proyecto—
no se agotan en la clase: requieren un documento que detalle qué debe hacer el
estudiante, con qué requisitos previos, qué debe entregar y bajo qué criterios
se evalúa. Hoy ese material existe fuera de la plataforma (por ejemplo
`courses/01-estructura-de-datos/projects/*.md`, que forma parte del microdiseño
curricular y **no se publica en la web**), de modo que el estudiante no tiene
dónde consultarlo dentro del curso.

Este spec abre el flujo de evaluación por su eslabón más simple y de menor
riesgo: **publicar la guía como contenido navegable del curso**. No introduce
entregas, notas ni vínculo con calificaciones; establece el nodo de contenido
sobre el que esos specs posteriores se apoyarán.

Una guía no es una clase: no se dicta, no tiene asistencia y no tiene
autoevaluación de cierre. Por eso no puede ser simplemente "una lección más":
necesita distinguirse en la navegación y apagar el flujo de cierre de lección
que spec-009/010/011/017 construyeron.

---

## Alcance

### Incluye

- Un discriminante de tipo (`kind`) en el modelo de contenido del curso que
  distingue una **guía** de una **lección**, sin romper los 60 nodos ya
  declarados en `lib/courses/data/`.
- Resolución del cuerpo de la guía desde `content/cursos/<curso>/guias/<slug>.md`,
  conviviendo con los artículos `.mdx` de lección sin cambiar su comportamiento.
- Publicación de la guía como nodo **hermano** de las lecciones, intercalado en
  la misma secuencia del sidebar según su `order`.
- Diferenciación visual y accesible de la guía en el sidebar (escritorio y
  móvil) y en el header del artículo.
- Separación de `order` (clave de ordenamiento) y `classIndex` (numeración de
  clase visible), para que insertar una guía no renumere las clases.
- Apagado en las guías de: asistencia, autoevaluación, bloque de cierre y botón
  de completar.
- Exclusión de las guías del progreso: denominador de la barra, indicador de
  completada, redirect de reanudación (spec-016) y sitemap.
- Corrección del filtro de progreso de `LessonSidebar`, hoy inoperante.
- Una guía de laboratorio real como fixture, declarada e intercalada en
  `estructuras-de-datos`.

### No incluye

- **Vínculo con `grade_item`, entregables o calificaciones.** La guía es el
  documento de la práctica; la evaluación asociada corresponde a un spec
  posterior del flujo de evaluación.
- **Marcar una guía como leída/completada.** Decisión de producto: la guía es
  material de consulta y no participa del progreso.
- Autoría de guías desde una UI: se escriben como archivos `.md` versionados en
  git, igual que los artículos de lección (Fase 1 del proyecto).
- Un índice o ruta dedicada `/[courseSlug]/guias`. El slug se reserva, pero la
  ruta no se implementa.
- Acceso público o preview de guías sin matrícula (ver "Decisiones de diseño").
- Migrar a la plataforma las guías existentes en `courses/*/projects/`. Solo se
  crea la guía fixture; la migración del resto es contenido, no código.

---

## Dependencias

- **spec-001 `[DONE]`** — página de lección, sidebar, pipeline MDX.
- **spec-006 `[DONE]`** — `requireCourseAccess`; las guías heredan el gate sin
  modificarlo.
- **spec-009 `[DONE]`** — `lesson_progress`, barra de progreso.
- **spec-016 `[DONE]`** — `resolveResumeLessonSlug`, del que hay que excluir guías.
- **spec-017 `[DONE]`** — `LessonClosureFlow`, que las guías no renderizan.

---

## Decisiones de diseño

### D1 — Ruta: se reutiliza `[lessonSlug]`, no se crea ruta hermana

La guía se sirve en `/<courseSlug>/<slug>`, el mismo segmento dinámico que una
lección. Motivos:

- El requisito de producto es que guías y lecciones compartan **una única
  secuencia**. `getLessonBySlug` ya calcula `prev`/`next` sobre un solo array
  ordenado; una ruta hermana obligaría a `LessonPagination` y al sidebar a
  construir dos formas de URL para el mismo recorrido.
- El `layout.tsx` que provee sidebar y gate de acceso pertenece al segmento
  `[lessonSlug]`; una ruta hermana lo duplicaría.
- La unicidad de slug entre guías y lecciones sale gratis: el validador de
  `lib/courses/index.ts` ya rechaza slugs duplicados dentro de un curso.

Se añade `"guias"` a `RESERVED_LESSON_SLUGS` para blindar un futuro índice, aunque
esa ruta no se implemente aquí.

### D2 — `order` ordena; `classIndex` numera

Hoy el sidebar (`LessonSidebarItem.tsx:25`) y el header (`LessonArticle.tsx:22`)
rotulan con `lesson.order` crudo, y el header lo llama literalmente
**"Clase NN"**. Si una guía ocupa `order: 5`, la lección siguiente mostraría
"Clase 06" siendo la 5.ª clase del curso: **la numeración pasaría a mentir en
toda la cola del curso**.

Por tanto `order` queda como clave de ordenamiento pura y la numeración visible
pasa a ser un `classIndex` contiguo (01..N) calculado contando **solo** nodos de
tipo lección. Las guías no llevan número: llevan icono. Insertar o quitar una
guía nunca renumera clases, y sidebar y header comparten una única fuente de
verdad.

> **Efecto visible:** en un curso con guías intercaladas, el número mostrado en
> las lecciones posteriores a una guía difiere de su `order`. Es el
> comportamiento correcto y está cubierto por TC-018.

### D3 — Acceso: la guía es al menos tan privada como una lección

No se añade ningún caso especial: `requireCourseAccess` en `layout.tsx:21` y
`page.tsx:44` ya cubre la ruta. Un anónimo va a login; un usuario sin matrícula,
al mismo destino que hoy produce una lección protegida; docente dueño y admin la
ven. Una guía contiene el enunciado de una actividad evaluativa, así que abrirla
públicamente filtraría enunciados antes de tiempo.

### D4 — Diferenciación por forma, no por color nuevo

El azul ya está tomado por el estado activo del sidebar. `DESIGN.md` define
primitivas `purple` pero **no** un token semántico ni fila de badge morada, y las
reglas del proyecto prohíben usar valores crudos de la paleta. Por tanto la guía
se diferencia por **icono + etiqueta textual "Guía"** dentro de los tokens ya
existentes, sin introducir un hue nuevo.

La etiqueta es textual y no solo un icono o un `title`: un icono por sí solo no
comunica el tipo de nodo a un lector de pantalla, y la diferencia debe
sobrevivir en escala de grises (TC-002).

> Si más adelante se quiere un hue propio para guías, requiere **añadir el par
> de tokens semánticos a `DESIGN.md` y aprobarlo**, no inventarlos en el
> componente.

### D5 — Regla de autoría: el `.md` se compila como MDX

El pipeline `compileMDX` procesa `.md` sin cambios (MDX es superset de
Markdown), lo que evita un segundo renderer. El coste es que **MDX interpreta
`<...>` como JSX**: una guía que escriba `<tu-usuario>`, `<archivo.java>` o un
genérico `List<Nodo>` fuera de backticks **falla en compilación**, no degrada.

Regla de autoría a documentar: todo placeholder o genérico va entre backticks.

---

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/courses/types.ts` | Añade `kind?: "lesson" \| "guide"` a `Lesson` |
| `lib/courses/nodes.ts` *(nuevo)* | Predicados y `buildCourseOutline` |
| `lib/courses/content.ts` | Resolución de path por `kind` (`.md` en `guias/`) |
| `lib/courses/index.ts` | Validador, `RESERVED_LESSON_SLUGS`, resume, sitemap |
| `components/courses/LessonSidebar.tsx` | Outline, `classIndex`, fix del filtro |
| `components/courses/LessonSidebarItem.tsx` | Icono, etiqueta, `classIndex` |
| `components/courses/LessonArticle.tsx` | Eyebrow "Guía" vs "Clase NN" |
| `components/courses/LessonPagination.tsx` | Predicado unificado, calificador |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Apagados y resolución |
| `lib/courses/data/estructuras-de-datos.ts` | Declara la guía fixture |
| `content/cursos/estructuras-de-datos/guias/*.md` *(nuevo)* | Guía fixture |

**No se toca:** `layout.tsx`, `lib/progress/`, `lib/enrollments/`, esquema de
Supabase ni migraciones. **Este spec no requiere cambios en base de datos.**

---

## Evaluación MCP

**¿Aplica MCP?** No.

Las guías son contenido estático versionado en git, escrito por el docente
principal en el mismo flujo que los artículos de lección. Este spec no crea
ninguna API HTTP ni expone datos consultables o acciones ejecutables nuevas:

| Pregunta | Respuesta |
|---|---|
| ¿Expone datos que un agente podría consultar? | No — el contenido ya vive en el repositorio, accesible al agente como archivo. |
| ¿Permite acciones que un agente debería ejecutar? | No — no hay escritura, ni entregas, ni estado en DB. |
| ¿Existe un MCP de dominio relacionado? | `question-bank-mcp` (preguntas) y `attendance-mcp` (asistencia) no tocan contenido de curso. |
| ¿Algún agente en `docs/mcps/` se beneficiaría? | No — ninguno opera sobre el catálogo de contenido. |

Cuando un spec posterior vincule guías con `grade_item` o entregables (fuera de
alcance aquí, ver D-alcance), se reevaluará.

---

## Fases de implementación

> El orden de las fases 2 → 7 **no es negociable**: el validador de
> `lib/courses/index.ts` corre como IIFE al importar el módulo, así que declarar
> la guía (Fase 7) antes de enseñarle a resolver `.md` (Fase 2) rompe `dev` y
> `build` con un error poco obvio.

### Fase 1 — Modelo de dominio: discriminante `kind`
- [ ] Añadir `kind?: "lesson" | "guide"` a `Lesson` en `lib/courses/types.ts`
      (opcional; ausente ⇒ `"lesson"`, para no editar los 60 nodos existentes).
- [ ] Actualizar el comentario de `articleSlug` documentando que la clave sigue
      siendo opaca y que es `kind` quien decide **cómo** se resuelve. Las guías
      reutilizan `articleSlug`; no se crea un campo paralelo.
- [ ] Crear `lib/courses/nodes.ts` con predicados puros (sin I/O):
      `isGuide`, `isNavigable`, `buildCourseOutline` (anota `classIndex: number | null`)
      y `countProgressibleLessons`.
- [ ] Reexportar desde `lib/courses/index.ts`.

### Fase 2 — Resolución de archivo y validación de build
- [ ] En `lib/courses/content.ts`, extraer y exportar
      `resolveArticlePath(courseSlug, articleSlug, kind)`: guía →
      `<CONTENT_ROOT>/<curso>/guias/<slug>.md`; lección → `.mdx` (sin cambios).
- [ ] `getLessonArticle` recibe `kind` como tercer parámetro **opcional con
      default**, de modo que ningún llamador existente cambia de firma.
- [ ] Sustituir el `path.join` inline del validador de `lib/courses/index.ts`
      por `resolveArticlePath`, e incluir el `kind` en el mensaje de error.
- [ ] Hacer que el validador rechace un `kind` fuera del union (protege contra
      un `"guia"` mal escrito que el compilador no detecta si el objeto se tipa
      laxamente).
- [ ] Añadir `"guias"` a `RESERVED_LESSON_SLUGS`.

### Fase 3 — Exclusión del progreso
- [ ] `resolveResumeLessonSlug`: excluir guías antes de recorrer **y** en el
      fallback "todas completas → última lección".
- [ ] `getCourseLessonSlugPairs`: excluir guías (hoy filtra por `articleSlug`
      truthy, que las guías tienen, así que entrarían al sitemap sin querer).
- [ ] `LessonSidebar`: reemplazar `filter((l) => l.articleSlug !== null)` por
      `countProgressibleLessons`. **Bug latente confirmado:** `articleSlug` es
      `string | undefined`, nunca `null`, así que ese filtro no filtra nada hoy.
      Es inocuo por ahora (los 60 nodos tienen `articleSlug`), pero introducir
      guías es justo el cambio que lo vuelve relevante.
- [ ] `page.tsx`: omitir `markLessonViewed` y `getLessonProgress` cuando el nodo
      es guía. `lesson_progress` no tiene FK al catálogo, así que escribir filas
      con slug de guía dejaría basura silenciosa contable a futuro.

### Fase 4 — Apagado de asistencia, autoevaluación y cierre
- [ ] Derivar `isGuide` en `page.tsx` justo tras resolver la lección.
- [ ] Condicionar el bloque de carga de datos (`page.tsx:63-67`) con `&& !isGuide`,
      evitando tres consultas inútiles a Supabase.
- [ ] Condicionar el render de `<LessonClosureFlow>` (`:86-108`) con `&& !isGuide`;
      `AttendanceSection` cuelga de él y cae con el mismo gate.
- [ ] Resolver el cuerpo vía `getLessonArticle(course.slug, lesson.articleSlug, lesson.kind)`.
- [ ] Parametrizar el copy de `PreparationPlaceholder` ("Guía en preparación"),
      sin duplicar el componente.
- [ ] `generateMetadata`: prefijar el título de las guías.

### Fase 5 — Diferenciación visual (sidebar y header)
- [ ] `LessonSidebar`: consumir `buildCourseOutline(course)` en lugar del sort
      inline y pasar `classIndex` a cada ítem.
- [ ] `LessonSidebar`: forzar `isCompleted={false}` en guías.
- [ ] `LessonSidebarItem`: usar `classIndex` en vez de `lesson.order`; en guías,
      renderizar un icono SVG inline (`aria-hidden`) en la misma caja del badge.
- [ ] `LessonSidebarItem`: añadir etiqueta textual "Guía" (accesible, no solo
      icono ni `title`).
- [ ] `LessonSidebarItem`: reemplazar `hasArticle` por `isNavigable`, sin
      cambiar la lógica de los tres estados existentes.
- [ ] `LessonArticle`: recibir `classIndex` y rotular `"· Guía"` en lugar de
      `"· Clase NN"` cuando corresponda.
- [ ] Verificar el sidebar móvil: `LessonSidebarMobile` envuelve la **misma**
      instancia de `LessonSidebar`, así que hereda todo el trabajo; solo hay que
      comprobar que icono + etiqueta no desbordan en anchos estrechos.

### Fase 6 — Paginación
- [ ] `LessonPagination`: sustituir los gates `prev.articleSlug` / `next.articleSlug`
      por `isNavigable` (las guías ya enlazarían bien; el cambio elimina la
      duplicación del predicado).
- [ ] Añadir calificador en la tarjeta cuando el vecino es guía, para que el
      estudiante sepa que no avanza a una clase.

### Fase 7 — Guía fixture real
- [ ] Crear `content/cursos/estructuras-de-datos/guias/lab-01-listas-enlazadas.md`
      con una guía **real y completa** (objetivo, requisitos previos, desarrollo
      paso a paso, entregable, criterios de evaluación), con bloques de código
      que ejerciten Shiki. Todo placeholder o genérico entre backticks (D5).
- [ ] Declararla en `lib/courses/data/estructuras-de-datos.ts` con
      `kind: "guide"`, `articleSlug`, `topics: []` y un `order` **intercalado
      entre dos lecciones existentes** — única forma de probar de verdad la
      secuencia única y la renumeración de `classIndex`.

### Fase 8 — Verificación y cierre
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Ejecutar los casos manuales de `docs/testing/test-021-guias-laboratorio.md`.
- [ ] Invocar `@reviewer` antes de marcar el spec como `[DONE]`.

---

## Criterios de aceptación

1. Una guía declarada con `kind: "guide"` aparece en el sidebar intercalada en
   la secuencia según su `order`, en escritorio y en móvil.
2. La guía se distingue de una lección por icono **y** etiqueta textual, de
   forma perceptible en escala de grises y para lectores de pantalla.
3. Al abrir la guía se renderiza el contenido de
   `content/cursos/<curso>/guias/<slug>.md` con el mismo tratamiento tipográfico
   y resaltado de código que un artículo de lección.
4. El header de la guía no la rotula como "Clase NN".
5. La guía no muestra asistencia, autoevaluación, bloque de cierre ni botón de
   completar, incluso con sesión de asistencia abierta y preguntas publicadas.
6. La guía no altera el denominador ni el porcentaje de la barra de progreso, y
   nunca muestra indicador de completada.
7. El redirect de reanudación de `/[courseSlug]` nunca cae en una guía.
8. La numeración de clase visible es contigua (01..N) contando solo lecciones, y
   no cambia al insertar o quitar una guía.
9. La paginación anterior/siguiente recorre la secuencia completa incluyendo la
   guía, sin enlaces rotos.
10. Un usuario sin matrícula y un anónimo reciben ante la guía exactamente el
    mismo tratamiento que ante una lección del curso.
11. Una guía declarada sin su archivo `.md` falla de forma explícita y temprana
    en `dev`/`build`, nombrando la guía y la ruta esperada.
12. El flujo completo de cierre de lección de las lecciones normales no sufre
    ninguna regresión.

---

## Pruebas asociadas

- **Manuales:** `docs/testing/test-021-guias-laboratorio.md` — casos `TC-001` a
  `TC-018`. Sin casos `TC-MCP-*`: este spec no incluye fase de MCP.
- **Automáticas (e2e/unit):** pendientes del framework de testing, aún por
  definir (ver `CLAUDE.md` → Testing). Los criterios de aceptación 6, 7, 8 y 11
  son candidatos naturales a prueba unitaria de `lib/courses/nodes.ts` y del
  validador, por ser lógica pura sin UI.

---

## Riesgos

1. **`.md` se compila como MDX** (D5). Es la trampa principal del spec: un
   `<placeholder>` fuera de backticks rompe la compilación en lugar de degradar.
   Se mitiga en la guía fixture y con la regla de autoría documentada.
2. **Fallo en carga de módulo** si se altera el orden de las fases 2 y 7 (ver
   nota al inicio de las fases).
3. **La renumeración de clases es un cambio visible** respecto a hoy en cursos
   con guías intercaladas. Es deseado, pero debe verificarse explícitamente
   (TC-018).
4. **`kind` opcional debilita el tipado**: un valor mal escrito puede escapar al
   compilador si el objeto se tipa laxamente. Mitigado por la validación en
   Fase 2.
5. **`lesson_progress` no tiene FK al catálogo**: nada en base de datos impide
   escribir progreso con slug de guía. Este spec se defiende en el llamador
   (Fase 3); el guard de dominio queda como deuda.

---

## Deuda técnica detectada

Registrar en `docs/specs/backlog.md`, sin actuar en este spec:

- `course.lessons` pasa a contener nodos de dos tipos pese a su nombre.
  Renombrar a `nodes` y migrar `kind` opcional → unión discriminada `CourseNode`
  cuando llegue Payload (Fase 2 del proyecto); hoy tocaría ~10 archivos sin
  beneficio funcional.
- `markLessonViewed` / `markLessonCompleted` deberían rechazar slugs que no
  correspondan a una lección consultando el catálogo, en vez de confiar en que
  el llamador filtre.
- Hallazgo colateral: `PreparationPlaceholder` y el estado "bloqueada /
  Próximamente" del sidebar son **código muerto hoy** — los 60 nodos de los 3
  cursos tienen `articleSlug`.
