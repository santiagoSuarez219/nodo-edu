# spec-030 — [DONE] Documentos PDF en la presentación de curso

## Contexto

La página de presentación de cada curso (spec-012, spec-015) ya muestra una
sección "Bibliografía" (spec-024) con referencias bibliográficas y un link a
la biblioteca institucional, pero no hay forma de publicar documentos propios
del curso (guías, formatos, plantillas, rúbricas, etc.) en formato PDF. Se
necesita una nueva sección de "Documentos" que liste archivos PDF alojados en
`public/` y referenciados desde el archivo de datos de cada curso
(`lib/course-presentations/data/<curso>.ts`), donde cada documento se abre en
una pestaña nueva al hacer clic.

## Alcance

**Incluye:**
- Nuevo tipo `CourseDocument` en `lib/course-presentations/types.ts`:
  `title`, `url` (ruta pública al PDF) y `description` (opcional).
- Nuevo campo `documents: CourseDocument[]` en `CoursePresentation`.
- Convención de almacenamiento: los PDFs viven en
  `public/documentos/<courseSlug>/<archivo>.pdf`, y `url` referencia esa ruta
  pública (ej. `/documentos/analisis-de-algoritmos/guia-laboratorios.pdf`).
- Nueva sección "Documentos" en `CoursePresentation.tsx`, ubicada después de
  la sección "Bibliografía" y antes del CTA final, siguiendo el mismo patrón
  visual de card (`bg-gray-50 dark:bg-gray-800`, borde `border-gray-200
  dark:border-gray-700`) que las demás secciones de la página.
- Cada documento se renderiza como un link clickeable (`title` +
  `description` si existe) que abre el PDF en una pestaña nueva
  (`target="_blank"`, `rel="noopener noreferrer"`), apuntando directamente a
  la ruta pública del archivo.
- Si un curso no tiene documentos (`documents: []`), la sección no se
  renderiza (mismo criterio que otras secciones opcionales de la página).
- Placeholder: al menos 1 PDF real de bajo peso subido a `public/documentos/`
  para validar el flujo end-to-end en los tres cursos existentes
  (`estructuras-de-datos`, `programacion-cientifica`,
  `analisis-de-algoritmos`).

**No incluye:**
- Subida de PDFs vía UI o backend (Supabase Storage) — los archivos se
  versionan directamente en `public/` como el resto de assets estáticos.
- Contenido documental definitivo — el usuario aportará los PDFs reales
  después de este spec; se usa un placeholder mínimo para probar el flujo.
- Cambios al curso "transversal" (no es un `CoursePresentation` con
  syllabus propio — mismo criterio que spec-024).
- Previsualización embebida del PDF dentro de la página (solo apertura en
  pestaña nueva).
- Control de acceso o restricción de documentos por rol — son públicos como
  el resto de la página de presentación.

## Impacto en el sistema

- `lib/course-presentations/types.ts` — nuevo tipo `CourseDocument` y campo
  `documents: CourseDocument[]` en `CoursePresentation`.
- `lib/course-presentations/index.ts` — exportar el nuevo tipo
  `CourseDocument`.
- `lib/course-presentations/data/estructuras-de-datos.ts`,
  `programacion-cientifica.ts`, `analisis-de-algoritmos.ts` — agregar
  `documents` con al menos un documento placeholder cada uno.
- `components/course-presentations/CoursePresentation.tsx` — nueva sección
  "Documentos" con la lista de links a los PDFs.
- `public/documentos/<courseSlug>/` — nuevas carpetas con los PDFs
  placeholder referenciados desde los archivos de datos.

## Evaluación MCP

**¿Aplica MCP?** No.

Es contenido estático de solo lectura para visitantes humanos de la página de
presentación (mismo criterio que spec-024, Bibliografía): no expone una
acción ni una consulta que un agente necesite invocar de forma independiente,
ya se sirve como parte del HTML de la página y los archivos son estáticos en
`public/`.

## Fases de implementación

### Fase 1 — Tipos y datos
- [x] Agregar `CourseDocument` (`title`, `url`, `description?`) y el campo
      `documents: CourseDocument[]` a `CoursePresentation` en `types.ts`.
- [x] Exportar `CourseDocument` desde `index.ts`.
- [x] Crear `public/documentos/<courseSlug>/` para los tres cursos y subir un
      PDF placeholder por curso.
- [x] Agregar `documents` con esos placeholders a los tres archivos de datos.

### Fase 2 — UI
- [x] Agregar sección "Documentos" en `CoursePresentation.tsx`, después de
      "Bibliografía" y antes del CTA final, con un link por documento que
      abre en pestaña nueva.
- [x] Omitir la sección completa si `documents` está vacío.
- [x] Verificar modo claro/oscuro con los tokens de `DESIGN.md` (mismos
      tokens que la sección de Bibliografía; pendiente de confirmación
      visual por el usuario — ver `test-030`).

## Criterios de aceptación
- En `/[courseSlug]` (para los tres cursos con presentación) se ve una
  sección "Documentos" con al menos un PDF listado.
- Al hacer clic en un documento, el PDF se abre en una pestaña nueva
  (`target="_blank"`) sirviéndose desde `public/`.
- Si `documents` está vacío para un curso, la sección "Documentos" no
  aparece en su página.
- La sección respeta modo claro/oscuro sin romper contraste.
- El build (`npm run build`) y el linter (`npm run lint`) pasan sin errores.

## Nota de estado (implementación 2026-07-29)
Fases 1 y 2 implementadas: tipo `CourseDocument`, campo `documents` en los
tres cursos (`estructuras-de-datos`, `programacion-cientifica`,
`analisis-de-algoritmos`) con un PDF placeholder cada uno en
`public/documentos/<courseSlug>/guia-informe-laboratorio.pdf`, y la sección
"Documentos" en `CoursePresentation.tsx`. `npm run lint` y `npm run build`
pasan sin errores nuevos (los 5 errores de lint preexistentes son de otros
archivos, no relacionados con este spec). Cambios sin commitear.

## Nota de estado (pruebas 2026-07-29)
Las 4 pruebas manuales de `test-030` (TC-001 a TC-004) fueron ejecutadas por
el usuario y aprobadas sin hallazgos. TC-003 se verificó vaciando
temporalmente `documents: []` en `programacion-cientifica.ts`, confirmando
que la sección desaparece, y revirtiendo el cambio al placeholder real
inmediatamente después. Spec marcado `[DONE]`.

## Pruebas asociadas
- **Manuales:** `docs/testing/test-030-documentos-curso.md` — casos
  `TC-001` a `TC-003`.
- **Automáticas:** no aplica (sin framework de testing definido en el
  proyecto).

## Aprobación de implementación
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-29
