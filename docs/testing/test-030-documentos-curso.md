# test-030 — Documentos PDF en la presentación de curso

## Casos de prueba

### TC-001 — Sección de documentos visible
**Precondición:** Estar en la página de presentación de un curso con al
menos un documento cargado (ej. `/analisis-de-algoritmos`).
**Pasos:**
1. Recorrer la página hasta la sección "Documentos", después de
   "Bibliografía".
**Resultado esperado:** Se ve el título "Documentos" y una lista con al
menos un PDF (título, y descripción si existe).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Aparece tal como se espera.

### TC-002 — El PDF abre en pestaña nueva
**Precondición:** Estar en la sección "Documentos" de la página de un curso.
**Pasos:**
1. Hacer clic en un documento de la lista.
**Resultado esperado:** El PDF se abre en una pestaña nueva (no reemplaza la
pestaña actual) y carga correctamente desde `public/documentos/<curso>/`.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Se abre una pestaña nueva con el documento.

### TC-003 — Curso sin documentos no muestra la sección
**Precondición:** Un curso cuya lista `documents` esté vacía.
**Pasos:**
1. Visitar la página de presentación de ese curso.
2. Recorrer la página completa.
**Resultado esperado:** La sección "Documentos" no aparece en absoluto (ni
título ni contenedor vacío).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Verificado dejando temporalmente
`documents: []` en `programacion-cientifica.ts` (revertido al placeholder
real tras la prueba, ya que los 3 cursos deben tener documentos según el
alcance del spec).

### TC-004 — Modo claro y oscuro
**Precondición:** Estar en la sección "Documentos" de la página de un curso.
**Pasos:**
1. Cambiar la preferencia de tema del sistema operativo a oscuro y recargar
   la página.
2. Cambiar la preferencia a claro y recargar.
**Resultado esperado:** El texto, las cards y los links respetan los tokens
de `DESIGN.md` en ambos modos, sin contraste roto.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Se ve bien en ambos modos.

## Resumen de la ronda
- Aprobados: 4 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno
- Fecha de la ronda: 2026-07-29
