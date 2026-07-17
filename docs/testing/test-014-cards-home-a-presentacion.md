# test-014 — Cards de home enlazan a la presentación del curso

> Casos manuales de UI para spec-014. Ejecutar en desktop (≥1280px) y en
> móvil (≤480px), en modo claro y modo oscuro salvo que el caso indique otra
> cosa. Requiere al menos un usuario de prueba matriculado en un curso y otro
> sin matrícula en ninguno.

## Casos de prueba

### TC-001 — Card de home navega a la presentación (Estructuras de datos)
**Precondición:** Sesión activa, en `/`.
**Pasos:**
1. Hacer clic en la card "Estructuras de datos".
**Resultado esperado:** Navega a `/estructuras-de-datos/presentacion` y
muestra la presentación completa del curso.
**Estado:** ⬜ Pendiente

### TC-002 — Card de home navega a la presentación (Programación científica)
**Precondición:** Sesión activa, en `/`.
**Pasos:**
1. Hacer clic en la card "Programación científica".
**Resultado esperado:** Navega a `/programacion-cientifica/presentacion` y
muestra la presentación completa (no `notFound`), con temario derivado de
las lecciones reales del curso.
**Estado:** ⬜ Pendiente

### TC-003 — Card de home navega a la presentación (Análisis de algoritmos)
**Precondición:** Sesión activa, en `/`.
**Pasos:**
1. Hacer clic en la card "Análisis de algoritmos".
**Resultado esperado:** Navega a `/analisis-de-algoritmos/presentacion` y
muestra la presentación completa (no `notFound`), con temario derivado de
las lecciones reales del curso.
**Estado:** ⬜ Pendiente

### TC-004 — La presentación muestra Navbar + Contenido + Footer
**Precondición:** Estar en `/[courseSlug]/presentacion` de cualquier curso.
**Pasos:**
1. Recorrer la página de arriba a abajo.
**Resultado esperado:** Aparece el Navbar global arriba, el contenido de la
presentación (hero, prerrequisitos, temario, herramientas, evaluación,
fechas, condiciones, CTA final) en el medio, y el footer (mismo diseño que
en `/`) al final. En páginas cortas el footer no queda "flotando" a mitad de
pantalla (se mantiene al fondo).
**Estado:** ⬜ Pendiente

### TC-005 — CTA "Matricular este curso" para usuario sin matrícula
**Precondición:** Sesión activa con un usuario SIN matrícula en el curso
visitado.
**Pasos:**
1. Navegar a `/[courseSlug]/presentacion` de un curso sin matricular.
2. Observar el CTA del hero y el CTA final.
**Resultado esperado:** Ambos CTA dicen "Matricular este curso" y enlazan a
`/cuenta/cursos`.
**Estado:** ⬜ Pendiente

### TC-006 — CTA "Ir al curso" para usuario matriculado
**Precondición:** Sesión activa con un usuario matriculado (`status: active`)
en el curso visitado.
**Pasos:**
1. Navegar a `/[courseSlug]/presentacion` de ese curso.
2. Observar el CTA del hero y el CTA final.
**Resultado esperado:** Ambos CTA dicen "Ir al curso" y enlazan a
`/[courseSlug]` (contenido). Al hacer clic, navega al contenido del curso
correctamente.
**Estado:** ⬜ Pendiente

### TC-007 — CTA "Ir al curso" para docente dueño o admin
**Precondición:** Sesión activa con un usuario docente dueño del curso
académico vinculado, o con rol admin.
**Pasos:**
1. Navegar a `/[courseSlug]/presentacion` del curso correspondiente.
**Resultado esperado:** El CTA dice "Ir al curso" (mismo criterio que
matriculado: `hasCourseAccess` con `reason: "owner"` o `"admin"`).
**Estado:** ⬜ Pendiente

### TC-008 — Vista previa admin sigue funcionando para los cursos nuevos
**Precondición:** Sesión de docente/admin, con un curso académico cuyo
`course_slug` sea `programacion-cientifica` o `analisis-de-algoritmos`.
**Pasos:**
1. Ir a `/admin/courses/[academicCourseId]/presentacion`.
**Resultado esperado:** Se muestra la vista previa completa de la
presentación (ya no el estado vacío), con CTA no funcional (deshabilitado),
igual que ya ocurría para "Estructuras de datos".
**Estado:** ⬜ Pendiente

### TC-009 — Usuario sin sesión es redirigido a login
**Precondición:** Sin sesión activa.
**Pasos:**
1. Navegar directamente a `/[courseSlug]/presentacion` de cualquier curso.
**Resultado esperado:** Redirección a `/login?redirectTo=...` (comportamiento
ya existente de `requireUser`, no debe romperse).
**Estado:** ⬜ Pendiente
