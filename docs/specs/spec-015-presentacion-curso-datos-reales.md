# spec-015 — [IN PROGRESS] Presentación de curso con datos reales y footer de docente

> Estado `[DRAFT]`: paquete spec + pruebas manuales redactado, pendiente de
> aprobación del usuario. Al aprobarse e iniciar la Fase 1, este estado pasa
> a `[IN PROGRESS]` (ver CLAUDE.md → "Durante la implementación").

## Contexto

`spec-012` y `spec-014` (ambos `[DONE]`) crearon la página de presentación de
curso (`/[courseSlug]/presentacion`) con un componente `CoursePresentation`
genérico y datos de contenido estáticos para los 3 cursos del catálogo. Esos
datos fueron placeholders razonables (créditos, horas, cupos, fechas,
evaluación, condiciones) sin anclarse a ninguna fuente real, y en el caso de
Estructuras de Datos incluso listaban herramientas incorrectas (Python en vez
de Java).

Ahora existen tres fuentes de verdad con contenido curricular real del
docente principal:

- `courses/01-estructura-de-datos/info.md`: microdiseño con modalidad,
  créditos, horas, prerrequisito académico y técnico, evaluación (5 momentos
  + seguimiento, suma 100%), y el mapa completo de 9 módulos con semana.
- `courses/01-estructura-de-datos/cronograma-dia-a-dia.md`: fechas reales
  2026-2 (inicio de clases, cierre de cada momento evaluativo, hitos
  institucionales) para Estructuras de Datos.
- `courses/informacion-transversal.md`: datos del docente y condiciones del
  curso que aplican a **todos** los cursos que dicta (transversal, no
  específico de un curso).

Este spec rediseña `CoursePresentation` para reflejar esta información real:
recorta el hero y la card de matrícula (quita datos que no aportan o
duplican info ya visible en otra parte), agrega semana al temario, elimina
la sección standalone de prerrequisitos, corrige las herramientas de
Estructuras de Datos, y agrega un bloque de información del docente en la
página de presentación (no en el `LandingFooter` genérico, que también se
usa en `/`).

Programación científica y Análisis de algoritmos no tienen microdiseño ni
cronograma propio. Por decisión explícita del usuario, sus datos de
modalidad/horas/semanas se completan con valores provisionales razonables
que se actualizarán en un spec futuro cuando exista el microdiseño real.

## Alcance

### Incluye

- Cambios al tipo `CoursePresentation` y `SyllabusUnit` en
  `lib/course-presentations/types.ts`; nueva interface `Instructor`.
- Nuevo módulo `lib/course-presentations/data/transversal.ts` con
  `TRANSVERSAL_INSTRUCTOR` y `TRANSVERSAL_CONDITIONS`, derivados literalmente
  de `courses/informacion-transversal.md`.
- Reescritura de `lib/course-presentations/data/estructuras-de-datos.ts` con
  datos reales de `info.md` + `cronograma-dia-a-dia.md` + datos
  transversales (temario de 10 unidades con semana, evaluación real,
  fechas reales, herramientas corregidas a Java/VS Code/Git).
- Actualización de `lib/course-presentations/data/programacion-cientifica.ts`
  y `lib/course-presentations/data/analisis-de-algoritmos.ts` al nuevo shape
  del tipo (semana estimada en temario, modalidad/horas provisionales
  marcadas con comentario, datos transversales de condiciones/docente).
- Rediseño de `components/course-presentations/CoursePresentation.tsx`: hero,
  card de matrícula, eliminación de la sección "Prerrequisitos" standalone,
  temario con semana.
- Nuevo componente `components/course-presentations/InstructorFooter.tsx`
  para mostrar el bloque completo de datos del docente.
- Edición de `app/(cursos)/[courseSlug]/presentacion/page.tsx` para
  renderizar `InstructorFooter` junto al `LandingFooter` existente.

### No incluye

- Cambios en `components/landing/LandingFooter.tsx` ni en
  `lib/landing/data.ts` (`FOOTER_LINKS`): siguen siendo genéricos para `/` y
  la presentación de curso.
- Cambios en `app/(admin)/admin/courses/[academicCourseId]/presentacion/page.tsx`:
  reutiliza `CoursePresentation` sin cambios de código; solo se verifica
  manualmente que el nuevo shape de datos renderiza correctamente ahí (sin
  el bloque de docente, que es específico de la ruta pública).
- Cambios en `hasCourseAccess`, el flujo de matrícula, o el CTA condicional
  ya implementado en spec-014.
- Sincronizar `spots` con datos reales de `academic_courses` en Supabase:
  sigue siendo dato estático de contenido (mismo criterio de spec-012/014).
- Microdiseño/cronograma real para Programación científica y Análisis de
  algoritmos: sus datos de modalidad/horas/semanas quedan como
  provisionales, marcados con comentario `// NOTE:` en el código, y se
  actualizarán en un spec futuro cuando exista la fuente real (decisión
  explícita del usuario).

## Impacto en el sistema

**Tipos**
- `lib/course-presentations/types.ts`:
  - `SyllabusUnit`: agrega `week: string` (ej. `"Semana 1"`,
    `"Semanas 4-5"`, `"Opcional"`).
  - `CoursePresentation`: quita `hours`, `classesCount`, `startDate`,
    `enrollDeadline`. Agrega `modality: string`, `weeklyHours: string`,
    `independentHours: string`. Mantiene `spots` (se usa en el CTA final
    "Quedan X cupos disponibles"), `prereqs` (prerrequisito académico,
    ahora también mostrado en la card de matrícula) y `tools`.
  - Nueva interface `Instructor`: `name`, `credentials`, `department`,
    `researchGroup`, `email`, `office`.

**Datos**
- Nuevo `lib/course-presentations/data/transversal.ts`: exporta
  `TRANSVERSAL_INSTRUCTOR: Instructor` y `TRANSVERSAL_CONDITIONS: string[]`.
  Importado por los 3 archivos de curso (`conditions`) y por
  `presentacion/page.tsx` (bloque de docente).
- `lib/course-presentations/data/estructuras-de-datos.ts`: reescritura
  completa (ver detalle de contenido en Fase 2).
- `lib/course-presentations/data/programacion-cientifica.ts` y
  `analisis-de-algoritmos.ts`: agregar `week` a cada `SyllabusUnit`
  existente (semanas estimadas secuenciales, criterio ya aceptado),
  agregar `modality`/`weeklyHours`/`independentHours` provisionales con
  comentario `// NOTE:`, quitar `hours`/`classesCount`/`startDate`/
  `enrollDeadline`, `conditions: TRANSVERSAL_CONDITIONS`.
- `lib/course-presentations/index.ts`: re-exportar `Instructor`.

**Componente de presentación**
- `components/course-presentations/CoursePresentation.tsx`:
  - Hero: fila de `MetaItem` pasa de (Créditos, Duración, Clases
    disponibles, Cupos) a (Créditos, Modalidad, Horas semanales, Horas de
    trabajo independiente).
  - Card de matrícula: quita columnas Inicio/Cierre inscripción; agrega
    bloque con el prerrequisito académico (`presentation.prereqs`) en lugar
    del texto fijo actual.
  - Elimina la sección `<section>` standalone "Prerrequisitos" (chips).
  - Temario: cada unidad muestra `unit.week` junto a `unit.n`/`unit.title`.
  - Herramientas, Evaluación, Fechas importantes, Condiciones y CTA final
    sin cambios estructurales, solo consumen los nuevos datos.
- Nuevo `components/course-presentations/InstructorFooter.tsx`: recibe
  `instructor: Instructor`, renderiza el bloque completo (nombre,
  formación, facultad/depto, grupo de investigación, correo, oficina).

**Página de presentación**
- `app/(cursos)/[courseSlug]/presentacion/page.tsx`: importar
  `TRANSVERSAL_INSTRUCTOR` (re-exportado desde `lib/course-presentations`),
  renderizar `<InstructorFooter instructor={TRANSVERSAL_INSTRUCTOR} />`
  entre el contenido de `CoursePresentation` y `LandingFooter`.

**Admin (sin cambios de código)**
- `app/(admin)/admin/courses/[academicCourseId]/presentacion/page.tsx`:
  verificar manualmente que sigue renderizando con el nuevo shape de datos.

## Evaluación MCP

**¿Aplica MCP?** No.

- *¿Expone datos que un agente consultaría?* No: contenido estático
  file-based, mismo criterio que spec-012/014; no hay API ni tabla nueva.
- *¿Permite acciones que un agente ejecutaría?* No: no hay escritura nueva.
- *¿Existe un MCP relacionado a extender?* No. `question-bank-mcp` y
  `attendance-mcp` cubren dominios distintos.
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No.

No se añade fase de MCP.

## Fases de implementación

### Fase 1 — Tipos y módulo transversal
- [ ] Leer `DESIGN.md` (aplica por ser cambio de UI).
- [ ] Actualizar `lib/course-presentations/types.ts`: `SyllabusUnit.week`,
      nuevos campos de `CoursePresentation` (`modality`, `weeklyHours`,
      `independentHours`), remoción de `hours`/`classesCount`/`startDate`/
      `enrollDeadline`, nueva interface `Instructor`.
- [ ] Crear `lib/course-presentations/data/transversal.ts` con
      `TRANSVERSAL_INSTRUCTOR` y `TRANSVERSAL_CONDITIONS` (contenido literal
      de `courses/informacion-transversal.md`).
- [ ] Actualizar `lib/course-presentations/index.ts` para re-exportar
      `Instructor`.

### Fase 2 — Datos reales de Estructuras de Datos
- [ ] Reescribir `lib/course-presentations/data/estructuras-de-datos.ts`:
  - `program: "Ingeniería de Sistemas — 4.º semestre"`, `credits: 5`,
    `modality: "Presencial"`, `weeklyHours: "6 h/semana presenciales"`,
    `independentHours: "9 h/semana independientes"` (144h / 16 semanas).
  - `prereqs: ["Lógica de Programación y Laboratorio"]`.
  - `tools`: corregir a `["Java JDK 21", "Visual Studio Code", "Git y GitHub"]`
    (la lista actual con Python es incorrecta para este curso).
  - `syllabus`: 10 unidades siguiendo el "Mapa general del curso" de
    `info.md` — Git y GitHub (Semana 1), POO clases/UML básico (Semanas
    2-3), POO herencia/polimorfismo/diseño avanzado (Semanas 4-5, ★ M1),
    Introducción a estructuras + Big O (Semanas 6-7), Listas (Semanas
    8-10, ★ M2 parte 1), Manejo de archivos (Semana 11, ★ cierre M2),
    Pilas y colas (Semanas 12-13, ★ M3), Recursividad (Semana 14, ★ M4),
    Árboles (Semanas 15-16, ★ M5), Temas opcionales — Hash y Grafos
    (Opcional).
  - `evaluation`: Momento 1 POO 15%, Momento 2 Estructuras lineales 15%,
    Momento 3 Pilas y colas 15%, Momento 4 Recursividad 10%, Momento 5
    Proyecto final 25%, Seguimiento continuo 20% (suma 100%).
  - `dates`: fechas reales de `cronograma-dia-a-dia.md` — inicio de clases
    (4 ago), cierre M1 (4 sep), cierre M2 (16 oct), cierre M3 (30 oct),
    registro del 60% (1 nov), cierre M4 (6 nov), cancelación de
    asignaturas (22 nov), sustentación/cierre M5 (24-27 nov).
  - `conditions: TRANSVERSAL_CONDITIONS`.

### Fase 3 — Datos provisionales de Programación científica y Análisis de algoritmos
- [ ] Agregar `week` estimada secuencial a cada `SyllabusUnit` existente en
      ambos archivos (ej. bloques de 3 semanas por unidad).
- [ ] Agregar `modality: "Presencial"`, `weeklyHours`, `independentHours`
      con un comentario `// NOTE: datos provisionales, pendientes de
      microdiseño real — actualizar en spec futuro` sobre cada bloque.
- [ ] Quitar `hours`/`classesCount`/`startDate`/`enrollDeadline`.
- [ ] `conditions: TRANSVERSAL_CONDITIONS` en ambos.

### Fase 4 — Rediseño de `CoursePresentation.tsx`
- [ ] Hero: reemplazar fila de `MetaItem` (Duración, Clases disponibles,
      Cupos) por (Modalidad, Horas semanales, Horas de trabajo
      independiente), manteniendo Créditos.
- [ ] Card de matrícula: quitar columnas Inicio/Cierre inscripción; agregar
      bloque con el prerrequisito académico.
- [ ] Eliminar la sección standalone "Prerrequisitos".
- [ ] Temario: mostrar `unit.week` junto a número/título de cada unidad.
- [ ] Verificar que "Herramientas", "Evaluación", "Fechas importantes",
      "Condiciones" y el CTA final siguen renderizando correctamente con el
      nuevo shape de datos.

### Fase 5 — Bloque de información del docente
- [ ] Crear `components/course-presentations/InstructorFooter.tsx`.
- [ ] Editar `app/(cursos)/[courseSlug]/presentacion/page.tsx` para
      importar `TRANSVERSAL_INSTRUCTOR` y renderizar `InstructorFooter`
      junto a `LandingFooter`, sin modificar `LandingFooter` ni
      `FOOTER_LINKS`.

### Fase 6 — Verificación admin y build
- [ ] Verificar manualmente `/admin/courses/[academicCourseId]/presentacion`
      para los 3 cursos vinculados por `course_slug`: sigue renderizando
      sin errores con el nuevo shape de datos (sin bloque de docente).
- [ ] `npm run build` y `npm run lint` sin errores.

## Criterios de aceptación

- El hero de `/[courseSlug]/presentacion` muestra Créditos, Modalidad,
  Horas semanales y Horas de trabajo independiente (ya no Duración, Clases
  disponibles ni Cupos).
- La card de matrícula ya no muestra Inicio/Cierre inscripción; muestra el
  botón CTA y el prerrequisito académico del curso.
- No existe una sección standalone "Prerrequisitos" en la página.
- Cada unidad del temario muestra su semana (o rango) además de número,
  título y temas.
- Para Estructuras de Datos: el temario refleja los 9 módulos + opcionales
  de `info.md`, la evaluación refleja los 5 momentos + seguimiento (suma
  100%), las fechas importantes son las reales de
  `cronograma-dia-a-dia.md`, y las herramientas muestran Java/VS Code/Git
  (no Python).
- Los 3 cursos muestran las mismas condiciones (`TRANSVERSAL_CONDITIONS`) y
  el mismo bloque de información de docente en su página de presentación.
- El bloque de información del docente aparece en
  `/[courseSlug]/presentacion` para los 3 cursos, sin alterar el
  `LandingFooter` ni su uso en `/`.
- La vista previa admin de presentación sigue funcionando para los 3 cursos
  sin cambios de código, con el nuevo shape de datos.
- `npm run build` y `npm run lint` pasan sin errores.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-015-presentacion-curso-datos-reales.md`
  — casos `TC-001` a `TC-010`.
- **Automáticas (e2e/unit):** no aplica — framework de testing automático
  aún "por definir" (ver sección "Testing" de `CLAUDE.md`).
