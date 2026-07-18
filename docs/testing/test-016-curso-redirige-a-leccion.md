# test-016 — Redirect de `/[courseSlug]` a la lección de reanudación

> Casos manuales de UI/navegación para spec-016. Ejecutar con una sesión de
> estudiante matriculado salvo que el caso indique otro rol. `[courseSlug]` =
> `estructuras-de-datos` (o cualquier curso con lecciones).

## Casos de prueba

### TC-001 — Redirect desde `/[courseSlug]`
**Precondición:** Sesión de estudiante con matrícula activa en el curso.
**Estudiante de prueba:** `test-student-a@example.com` / `TestPassword123!`
**Pasos:**
1. Navegar manualmente a `/[courseSlug]` (por URL directa o desde el CTA "Ir al
   curso" de la presentación).
**Resultado esperado:** La URL final del navegador es
`/[courseSlug]/[lessonSlug]` (una lección). No se muestra en ningún momento la
antigua página intermedia con header del curso, contenido de bienvenida ni
sidebar-índice del curso.
**Estado:** ✅ Aprobado

### TC-002 — Reanudar en la primera lección sin completar
**Precondición:** Estudiante matriculado que ha marcado como completadas algunas
lecciones (no todas), dejando al menos una intermedia sin completar.
**Estudiante de prueba:** `test-student-b@example.com` / `TestPassword123!`
  - Completadas: orden 1 (`git-github`) y 3 (`introduccion`)
  - Pendiente: orden 2 (`ramas-en-github`) ← **primera sin completar**
**Pasos:**
1. Navegar a `/[courseSlug]`.
**Resultado esperado:** El redirect cae en la **primera lección sin completar**
según el orden del curso: `ramas-en-github` (orden 2).
**Estado:** ✅ Aprobado

### TC-003 — Todas las lecciones completadas → última lección
**Precondición:** Estudiante matriculado con **todas** las lecciones del curso
marcadas como completadas.
**Estudiante de prueba:** `test-student-c@example.com` / `TestPassword123!`
**Pasos:**
1. Navegar a `/[courseSlug]`.
**Resultado esperado:** El redirect apunta a la **última lección** del curso
(según el orden canónico): `grafos` (orden 8).
**Estado:** ✅ Aprobado

### TC-004 — Sin progreso → primera lección
**Precondición:** Estudiante matriculado que aún no ha completado ninguna lección
(sin filas de progreso completadas). También aplica a un docente/admin con acceso
pero sin progreso.
**Estudiante de prueba:** `test-student-a@example.com` / `TestPassword123!`
**Pasos:**
1. Navegar a `/[courseSlug]`.
**Resultado esperado:** El redirect apunta a la **primera lección** del curso (`git-github`, orden 1).
**Estado:** ✅ Aprobado

### TC-005 — Usuario no autenticado sigue protegido
**Precondición:** Sin sesión iniciada.
**Pasos:**
1. Navegar a `/[courseSlug]`.
**Resultado esperado:** Redirect a `/login?redirectTo=/[courseSlug]` (o
equivalente codificado). No se expone contenido del curso.
**Estado:** ✅ Aprobado

### TC-006 — Usuario autenticado no matriculado sigue protegido
**Precondición:** Sesión iniciada con un usuario SIN matrícula activa en el curso
(y que no sea owner/admin del curso).
**Pasos:**
1. Navegar a `/[courseSlug]`.
**Resultado esperado:** Redirect a `/cuenta/cursos?sinAcceso=[courseSlug]`. No se
expone contenido del curso ni se redirige a ninguna lección.
**Estado:** ✅ Aprobado

### TC-007 — La página intermedia ya no existe como pantalla
**Precondición:** Sesión de estudiante matriculado.
**Estudiante de prueba:** `test-student-a@example.com` / `TestPassword123!`
**Pasos:**
1. Navegar a `/[courseSlug]` y observar la carga.
**Resultado esperado:** No aparece en ningún momento la pantalla intermedia
(header del curso + bienvenida MDX + sidebar "Contenido del curso" con botón "Ir
al curso"). La navegación resuelve directo a una lección.
**Estado:** ✅ Aprobado
