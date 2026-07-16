# test-009 — Progreso de lección y cierre ("completar lección")

Casos de prueba manuales del spec-009. Solo flujos con UI. Cada caso encodifica
un criterio de aceptación y arranca en estado ⬜ Pendiente.

**Precondiciones globales de datos:**

- Existe un curso de contenido MDX con slug `estructuras-de-datos` con al menos
  una lección con artículo (p. ej. `introduccion`) y, si es posible, una lección
  **placeholder** sin `articleSlug`.
- Existe un `academic_course` con `course_slug = "estructuras-de-datos"` creado
  por `docenteA`.
- Cuentas disponibles: `estudianteMatriculado` (matrícula activa en ese curso),
  `estudianteSinAcceso` (autenticado, sin matrícula), `docenteA` (dueño del
  `academic_course`), `admin`.

---

## Completar / des-marcar

### TC-009-01 — Estudiante matriculado ve y usa "Completar lección"
**Precondición:** sesión de `estudianteMatriculado`.
**Pasos:**
1. Abrir `/estructuras-de-datos/introduccion`.
2. Desplazarse al final de la lección.
3. Pulsar "Completar lección".
**Resultado esperado:** aparece el botón al final de la lección; al pulsarlo, el
estado cambia a "Lección completada el …" sin recargar la página manualmente. El
cambio persiste en `lesson_progress.completed_at`.
**Estado:** ⬜ Pendiente

### TC-009-02 — Estudiante des-marca una lección completada
**Precondición:** sesión de `estudianteMatriculado`, con `introduccion` ya
completada (TC-009-01).
**Pasos:**
1. Abrir `/estructuras-de-datos/introduccion`.
2. Des-marcar la lección (botón "Marcar como no completada" o equivalente).
**Resultado esperado:** el estado vuelve a "no completada" sin recarga manual y
`completed_at` queda en `null`.
**Estado:** ⬜ Pendiente

### TC-009-03 — Lección placeholder (sin apuntes) también se puede completar
**Precondición:** sesión de `estudianteMatriculado`; existe una lección
placeholder sin artículo MDX.
**Pasos:**
1. Abrir la lección placeholder del curso.
2. Pulsar "Completar lección".
**Resultado esperado:** la lección se marca como completada igual que una con
contenido; no hay bloqueo por ausencia de apuntes.
**Estado:** ⬜ Pendiente

---

## Visibilidad por rol

### TC-009-04 — Docente dueño NO ve el botón de completar
**Precondición:** sesión de `docenteA` (dueño del `academic_course`), sin
matrícula como estudiante.
**Pasos:**
1. Abrir `/estructuras-de-datos/introduccion`.
**Resultado esperado:** la lección se muestra con normalidad, pero **no** aparece
el botón "Completar lección" (el cierre de estudiante no se renderiza para
owner).
**Estado:** ⬜ Pendiente

### TC-009-05 — Admin NO ve el botón de completar
**Precondición:** sesión de `admin`.
**Pasos:**
1. Abrir `/estructuras-de-datos/introduccion`.
**Resultado esperado:** la lección carga, sin botón "Completar lección".
**Estado:** ⬜ Pendiente

---

## Reflejo del progreso en navegación

### TC-009-06 — Check de completada en la sidebar
**Precondición:** sesión de `estudianteMatriculado`.
**Pasos:**
1. Completar `/estructuras-de-datos/introduccion`.
2. Observar la `LessonSidebar`.
**Resultado esperado:** el ítem de la lección completada muestra un check (u otro
indicador de completada); se actualiza sin recarga manual.
**Estado:** ⬜ Pendiente

### TC-009-07 — Contador "X de N" en el hub de cursos
**Precondición:** sesión de `estudianteMatriculado`, con al menos una lección
completada.
**Pasos:**
1. Navegar a `/cuenta/cursos/{enrollmentId}` (detalle de la matrícula del curso).
**Resultado esperado:** se muestra un contador "X de N lecciones completadas"
coherente con las lecciones marcadas.
**Estado:** ⬜ Pendiente

---

## Registro de visita

### TC-009-08 — Abrir una lección registra la visita
**Precondición:** sesión de `estudianteMatriculado`; lección aún no visitada.
**Pasos:**
1. Abrir una lección del curso por primera vez.
2. (Verificación de datos) revisar que existe fila en `lesson_progress` con
   `viewed_at` para ese usuario/lección.
**Resultado esperado:** al abrir la lección se registra `viewed_at` (aunque no se
complete). No requiere acción del usuario.
**Estado:** ⬜ Pendiente

---

## Persistencia

### TC-009-09 — El estado persiste tras cerrar y reabrir sesión
**Precondición:** sesión de `estudianteMatriculado`, con `introduccion` completada.
**Pasos:**
1. Cerrar sesión.
2. Iniciar sesión de nuevo con la misma cuenta.
3. Abrir `/estructuras-de-datos/introduccion`.
**Resultado esperado:** la lección sigue mostrándose como completada y el check
persiste en la sidebar.
**Estado:** ⬜ Pendiente
