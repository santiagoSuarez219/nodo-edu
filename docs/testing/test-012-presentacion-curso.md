# test-012 — Página de presentación de curso

Casos de prueba manuales (flujos con UI) para spec-012. Los endpoints/datos no
tienen UI propia y se validarán con pruebas automáticas cuando exista framework.

**Precondición global:** app corriendo (`npm run dev`), curso de contenido
`estructuras-de-datos` con archivo de presentación creado, y un `academic_course`
cuyo `course_slug = "estructuras-de-datos"`.

## Casos de prueba

### TC-012-001 — Vista previa en el tab admin (curso con presentación)
**Precondición:** Sesión como docente/admin dueño de un curso con
`course_slug = "estructuras-de-datos"`.
**Pasos:**
1. Ir a `/admin/courses/<id>` de ese curso.
2. Clic en el tab "Presentación del curso".
**Resultado esperado:** Se renderiza la presentación completa (hero con badges
programa/nivel, título, descripción, meta de créditos/duración/clases/cupos;
tarjeta "Matrícula abierta"; Prerrequisitos; Temario; Herramientas; Evaluación con
barras y %; Fechas importantes; Condiciones; CTA final). El breadcrumb y las tabs
siguen visibles. El botón "Matricular este curso" está deshabilitado (vista previa).
**Estado:** ✅ Aprobado

### TC-012-002 — Tab admin con curso sin `course_slug` o sin presentación
**Precondición:** Sesión docente/admin en un curso con `course_slug = null`
(o un slug sin archivo de presentación).
**Pasos:**
1. Ir a `/admin/courses/<id>/presentacion` de ese curso.
**Resultado esperado:** Se muestra un estado vacío informativo dentro del tab
(explica que no hay presentación asociada). NO aparece una página 404.
**Estado:** ✅ Aprobado

### TC-012-003 — Vista de estudiante NO matriculado
**Precondición:** Sesión como estudiante autenticado que NO está matriculado en
`estructuras-de-datos`.
**Pasos:**
1. Navegar a `/estructuras-de-datos/presentacion`.
**Resultado esperado:** La presentación se muestra completa (sin bloqueo por
`requireCourseAccess`). El CTA "Matricular este curso" está activo.
**Estado:** ✅ Aprobado

### TC-012-004 — CTA de matrícula desde la ruta de estudiante
**Precondición:** Sesión de estudiante en `/estructuras-de-datos/presentacion`.
**Pasos:**
1. Clic en "Matricular este curso" (hero o CTA final).
**Resultado esperado:** Navega al flujo de matrícula existente (`/cuenta/cursos`).
**Estado:** ✅ Aprobado

### TC-012-005 — Ruta de estudiante sin presentación → 404
**Precondición:** Sesión autenticada. Existe un `courseSlug` sin archivo de
presentación (p.ej. `programacion-cientifica`, aún sin datos).
**Pasos:**
1. Navegar a `/programacion-cientifica/presentacion`.
**Resultado esperado:** Se muestra la página 404 (`notFound()`).
**Estado:** ✅ Aprobado

### TC-012-006 — Ruta de estudiante sin sesión → redirección a login
**Precondición:** Sin sesión iniciada (logout).
**Pasos:**
1. Navegar directamente a `/estructuras-de-datos/presentacion`.
**Resultado esperado:** Redirección a `/login?redirectTo=/estructuras-de-datos/presentacion`.
Tras iniciar sesión, vuelve a la presentación.
**Estado:** ✅ Aprobado

### TC-012-007 — Modo oscuro
**Precondición:** Presentación visible (admin o estudiante).
**Pasos:**
1. Activar modo oscuro con el toggle global del navbar.
**Resultado esperado:** Todas las secciones (hero, tarjeta, chips, barras de
evaluación, fechas, condiciones, CTA) se ven correctamente en oscuro, con contraste
adecuado y sin colores rotos.
**Estado:** ✅ Aprobado

### TC-012-008 — Responsive (móvil)
**Precondición:** Presentación visible.
**Pasos:**
1. Reducir el viewport a ancho de móvil (~375px).
**Resultado esperado:** El hero de 2 columnas y la sección Evaluación/Fechas apilan
verticalmente; chips y temario se ajustan sin desbordamiento horizontal; los CTAs
siguen accesibles.
**Estado:** ✅ Aprobado

### TC-012-009 — Contenido no hardcodeado (paridad con el archivo .ts)
**Precondición:** Presentación de `estructuras-de-datos` visible.
**Pasos:**
1. Comparar el contenido en pantalla (título, descripción, prerrequisitos, unidades
   del temario, herramientas, porcentajes de evaluación, fechas, condiciones) con
   `lib/course-presentations/data/estructuras-de-datos.ts`.
2. Editar un valor en el `.ts` (p.ej. un porcentaje de evaluación) y recargar.
**Resultado esperado:** Todo el contenido coincide con el archivo `.ts`, y el cambio
editado se refleja en la página tras recargar (confirma render desde datos, no
hardcodeado).
**Estado:** ✅ Aprobado
