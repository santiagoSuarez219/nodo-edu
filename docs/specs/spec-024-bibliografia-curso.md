# spec-024 — [IN PROGRESS] Bibliografía en la presentación de curso

## Contexto

La página de presentación de cada curso (spec-012, spec-015) no muestra los
libros y documentos guía del curso. Los estudiantes no tienen forma de saber
qué material de referencia usa el curso ni cómo acceder a la biblioteca de la
institución para conseguirlo.

## Alcance

**Incluye:**
- Nuevo campo `bibliography` en `CoursePresentation` (`lib/course-presentations/types.ts`):
  lista de referencias con `title`, `author` y `edition` (opcional).
- Nueva sección "Bibliografía" en `CoursePresentation.tsx`, ubicada entre
  "Herramientas y tecnologías" y el bloque de "Evaluación & Fechas", siguiendo
  el mismo patrón visual (card `bg-gray-50 dark:bg-gray-800`) que las demás
  secciones de la página.
- Link clickeable a la biblioteca institucional (`https://www.itm.edu.co/biblioteca/`)
  dentro de esa sección, abierto en una pestaña nueva (`target="_blank"`,
  `rel="noopener noreferrer"`).
- Datos placeholder (1-2 referencias) en los tres cursos existentes
  (`estructuras-de-datos.ts`, `programacion-cientifica.ts`,
  `analisis-de-algoritmos.ts`) — el usuario completará la lista real después.

**No incluye:**
- Contenido bibliográfico definitivo (se agrega como placeholder).
- Cambios al curso "transversal" (no es un `CoursePresentation` con syllabus propio).
- Ningún cambio de backend/Supabase — el dato vive en los archivos estáticos
  de `lib/course-presentations/data/`, igual que el resto de la presentación.

## Impacto en el sistema

- `lib/course-presentations/types.ts` — nuevo tipo `BibliographyItem` y campo
  `bibliography: BibliographyItem[]` en `CoursePresentation`.
- `lib/course-presentations/index.ts` — exportar el nuevo tipo `BibliographyItem`.
- `lib/course-presentations/data/estructuras-de-datos.ts`,
  `programacion-cientifica.ts`, `analisis-de-algoritmos.ts` — agregar
  `bibliography` con datos placeholder.
- `components/course-presentations/CoursePresentation.tsx` — nueva sección
  "Bibliografía" con el link a la biblioteca.

## Evaluación MCP

**¿Aplica MCP?** No.

Es contenido estático de solo lectura para visitantes humanos de la página de
presentación; no expone una acción ni una consulta que un agente necesite
invocar de forma independiente (ya se sirve como parte del HTML de la página).

## Fases de implementación

### Fase 1 — Tipos y datos
- [ ] Agregar `BibliographyItem` (`title`, `author`, `edition?`) y el campo
      `bibliography: BibliographyItem[]` a `CoursePresentation` en `types.ts`.
- [ ] Exportar `BibliographyItem` desde `index.ts`.
- [ ] Agregar 1-2 referencias placeholder a los tres cursos en `data/`.

### Fase 2 — UI
- [ ] Agregar sección "Bibliografía" en `CoursePresentation.tsx` con la lista
      de referencias y el link a `https://www.itm.edu.co/biblioteca/`.
- [ ] Verificar modo claro/oscuro con los tokens de `DESIGN.md`.

## Criterios de aceptación
- En `/[courseSlug]` se ve una sección "Bibliografía" con las referencias del
  curso (título y autor).
- La sección incluye un link clickeable a `https://www.itm.edu.co/biblioteca/`
  que abre en una pestaña nueva.
- La sección respeta modo claro/oscuro sin romper contraste.
- El build (`npm run build`) y el linter (`npm run lint`) pasan sin errores.

## Pruebas asociadas
- **Manuales:** `docs/testing/test-024-bibliografia-curso.md` — casos `TC-001` a `TC-003`.
- **Automáticas:** no aplica (sin framework de testing definido en el proyecto).
