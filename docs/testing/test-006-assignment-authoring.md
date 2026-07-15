# test-006 — Creación de evaluaciones por el docente (autoría de asignaciones)

## Precondiciones generales

- Supabase local corriendo (`supabase start`) con las migraciones de spec-006 aplicadas
  (`assignments` y `assignment_questions` con RLS habilitada).
- Banco de preguntas (spec-005) poblado con al menos una decena de preguntas del docente
  de prueba, cubriendo varios tipos (`multiple_choice`, `open_text`, `code_snippet`,
  `code_write`, `coding_challenge`), varias dificultades y varios tags.
- Cuentas de prueba disponibles:
  - **Docente A:** usuario con rol `teacher` puro, dueño de al menos un curso académico
    con preguntas propias en el banco.
  - **Docente B:** segundo usuario con rol `teacher` puro, dueño de otro curso académico
    (para validar aislamiento). No usar la cuenta con rol `admin`, ya que un admin ve todo
    por diseño de RLS y no prueba aislamiento.
  - **Estudiante:** usuario con rol `student`, matriculado activo en el curso del Docente A.
- Variables de entorno en `.env.local` apuntando al proyecto local.

---

## Casos de prueba

### TC-001 — Acceso al listado de asignaciones de un curso
**Precondición:** Sesión activa como Docente A, dueño de un curso académico.
**Pasos:**
1. Navegar al detalle del curso académico (`/admin/courses/[academicCourseId]`).
2. Hacer clic en el enlace "Asignaciones".
**Resultado esperado:** Se abre `/admin/courses/[academicCourseId]/assignments` mostrando
el `AssignmentList` del curso (vacío si aún no hay asignaciones), con un botón para crear
una nueva asignación.
**Estado:** ⬜ Pendiente

---

### TC-002 — Entrar al constructor de asignación
**Precondición:** Sesión activa como Docente A. Listado de asignaciones visible.
**Pasos:**
1. En el listado, hacer clic en "Nueva asignación".
**Resultado esperado:** Se abre `/admin/courses/[academicCourseId]/assignments/new` con el
`NewAssignmentForm` de dos paneles: panel izquierdo con el banco de preguntas y panel
derecho vacío (sin preguntas añadidas todavía).
**Estado:** ⬜ Pendiente

---

### TC-003 — El panel del banco es de solo lectura
**Precondición:** Constructor de asignación abierto.
**Pasos:**
1. Observar el panel izquierdo (banco de preguntas).
2. Buscar cualquier control para crear, editar o eliminar preguntas.
**Resultado esperado:** El panel izquierdo solo permite visualizar y seleccionar preguntas
existentes (alimentadas por `getQuestionsByTeacher()`). No hay botones de crear/editar/
eliminar preguntas: el banco es de solo lectura.
**Estado:** ⬜ Pendiente

---

### TC-004 — Filtrar el banco por tipo de pregunta
**Precondición:** Constructor abierto con banco poblado con varios tipos.
**Pasos:**
1. En el panel izquierdo, aplicar el filtro por tipo (ej. `multiple_choice`).
**Resultado esperado:** El banco muestra únicamente preguntas del tipo seleccionado. Al
limpiar el filtro vuelven a listarse todas.
**Estado:** ⬜ Pendiente

---

### TC-005 — Filtrar el banco por dificultad
**Precondición:** Constructor abierto con banco de varias dificultades.
**Pasos:**
1. Aplicar el filtro por dificultad.
**Resultado esperado:** El banco muestra solo las preguntas de la dificultad elegida.
**Estado:** ⬜ Pendiente

---

### TC-006 — Filtrar el banco por tags
**Precondición:** Constructor abierto con banco de preguntas con distintos tags.
**Pasos:**
1. Aplicar el filtro por uno o más tags.
**Resultado esperado:** El banco muestra solo las preguntas que contienen el/los tag(s)
seleccionados.
**Estado:** ⬜ Pendiente

---

### TC-007 — Filtrar el banco por curso
**Precondición:** Constructor abierto. El docente tiene preguntas asociadas a más de un
curso en el banco.
**Pasos:**
1. Aplicar el filtro por curso.
**Resultado esperado:** El banco muestra solo las preguntas asociadas al curso elegido.
Los filtros son combinables (tipo + dificultad + tags + curso) y acotan el resultado.
**Estado:** ⬜ Pendiente

---

### TC-008 — Añadir preguntas al panel derecho
**Precondición:** Constructor abierto con banco poblado.
**Pasos:**
1. Desde el panel izquierdo, añadir dos o más preguntas a la asignación.
**Resultado esperado:** Las preguntas seleccionadas aparecen en el panel derecho en el
orden en que se añadieron, cada una con su control de puntos.
**Estado:** ⬜ Pendiente

---

### TC-009 — Impedir preguntas duplicadas en la asignación
**Precondición:** Al menos una pregunta ya añadida al panel derecho.
**Pasos:**
1. Intentar añadir de nuevo la misma pregunta desde el banco.
**Resultado esperado:** La pregunta no se duplica en el panel derecho (queda deshabilitada,
ya marcada, o se muestra un aviso). El panel derecho conserva una sola instancia.
**Estado:** ⬜ Pendiente

---

### TC-010 — Asignar puntos válidos por pregunta (0–5)
**Precondición:** Preguntas añadidas al panel derecho.
**Pasos:**
1. Asignar `2.5` puntos a una pregunta y `5` a otra.
**Resultado esperado:** Los valores se aceptan y, si el formulario muestra el total de
puntos, este se recalcula (suma de puntos).
**Estado:** ⬜ Pendiente

---

### TC-011 — Validación de puntos fuera de rango
**Precondición:** Al menos una pregunta añadida.
**Pasos:**
1. Ingresar `0` en el campo de puntos de una pregunta y salir del campo.
2. Ingresar `6` en el campo de puntos y salir.
**Resultado esperado:** Ambos valores se rechazan con error inline (rango válido 0–5,
exclusivo en 0). El formulario no permite guardar hasta corregirlos.
**Estado:** ⬜ Pendiente

---

### TC-012 — Reordenar las preguntas del panel derecho
**Precondición:** Al menos dos preguntas añadidas.
**Pasos:**
1. Cambiar el orden de las preguntas (mover una hacia arriba/abajo).
**Resultado esperado:** El orden visible se actualiza y se refleja en el `order_index` que
se guardará; el nuevo orden persiste al guardar y recargar.
**Estado:** ⬜ Pendiente

---

### TC-013 — Configurar tipo y ventana de la asignación
**Precondición:** Constructor abierto con al menos una pregunta añadida.
**Pasos:**
1. Completar título y (opcional) descripción.
2. Seleccionar `type` (ej. `quiz`).
3. Configurar `opens_at` y `closes_at` con `opens_at` anterior a `closes_at`.
**Resultado esperado:** Los campos aceptan los valores. El selector de tipo ofrece
`practice`, `quiz`, `exam` y `homework`.
**Estado:** ⬜ Pendiente

---

### TC-014 — Configurar límite de tiempo, mezcla e intentos
**Precondición:** Constructor abierto con datos válidos.
**Pasos:**
1. Establecer `time_limit_minutes` (ej. `30`).
2. Activar `shuffle_questions` y/o `shuffle_choices`.
3. Seleccionar `show_feedback_on` (ej. `submit`).
4. Establecer `max_attempts` (ej. `2`).
**Resultado esperado:** Todos los controles aceptan los valores. `show_feedback_on` ofrece
`submit`, `close` y `never`. `max_attempts` no permite valores menores a 1 y
`time_limit_minutes` no permite valores menores a 1.
**Estado:** ⬜ Pendiente

---

### TC-015 — Vincular opcionalmente a un ítem de calificación
**Precondición:** El curso académico tiene al menos un `grade_item` creado (spec-003).
**Pasos:**
1. En el constructor, seleccionar un `grade_item` del selector de vínculo.
2. Verificar además que la asignación puede guardarse sin vincular ningún `grade_item`.
**Resultado esperado:** El vínculo a `grade_item` es opcional: puede seleccionarse un ítem
o dejarse vacío, y en ambos casos el formulario es válido.
**Estado:** ⬜ Pendiente

---

### TC-016 — Guardar la asignación como borrador
**Precondición:** Constructor con título, al menos una pregunta con puntos válidos y
configuración completa.
**Pasos:**
1. Hacer clic en "Guardar" (borrador).
**Resultado esperado:** La asignación se crea con `is_published = false`. Redirige al
detalle (`/admin/courses/[academicCourseId]/assignments/[assignmentId]`) o al listado, y la
asignación aparece con estado "Borrador"/"No publicada".
**Estado:** ⬜ Pendiente

---

### TC-017 — Validación: guardar sin preguntas o sin título
**Precondición:** Constructor abierto.
**Pasos:**
1. Intentar guardar sin título.
2. Intentar guardar sin ninguna pregunta añadida.
**Resultado esperado:** El formulario muestra errores inline (título requerido; la
asignación debe tener al menos una pregunta) y no se guarda.
**Estado:** ⬜ Pendiente

---

### TC-018 — Publicar una asignación
**Precondición:** Asignación guardada como borrador, en su página de detalle.
**Pasos:**
1. Hacer clic en `PublishAssignmentButton` ("Publicar").
**Resultado esperado:** La asignación pasa a `is_published = true`. El detalle y el listado
la muestran con estado "Publicada".
**Estado:** ⬜ Pendiente

---

### TC-019 — Las asignaciones no publicadas no son visibles para estudiantes
**Precondición:** Existe una asignación en borrador (no publicada) en el curso del
Docente A. El estudiante está matriculado activo en ese curso.
**Pasos:**
1. Iniciar sesión como estudiante.
2. Consultar las asignaciones disponibles del curso.
**Resultado esperado:** La asignación en borrador no aparece para el estudiante. Solo las
asignaciones publicadas serían visibles.
**Estado:** ⬜ Pendiente

---

### TC-020 — El listado muestra las asignaciones con su estado
**Precondición:** El curso del Docente A tiene al menos una asignación publicada y una en
borrador.
**Pasos:**
1. Como Docente A, navegar a `/admin/courses/[academicCourseId]/assignments`.
**Resultado esperado:** El `AssignmentList` lista todas las asignaciones del curso,
distinguiendo su estado ("Publicada" vs "Borrador") y ofreciendo acceso a su detalle/edición.
**Estado:** ⬜ Pendiente

---

### TC-021 — Editar una asignación existente
**Precondición:** Asignación creada, en su página de detalle/edición.
**Pasos:**
1. Abrir el detalle de la asignación.
2. Cambiar el título, ajustar los puntos de una pregunta y guardar.
**Resultado esperado:** Los cambios se persisten y se reflejan al recargar el detalle y en
el listado.
**Estado:** ⬜ Pendiente

---

### TC-022 — Aislamiento: el listado no muestra asignaciones de cursos ajenos
**Precondición:** Docente A y Docente B, cada uno dueño de su propio curso con asignaciones.
**Pasos:**
1. Iniciar sesión como Docente B.
2. Navegar al listado de asignaciones de su propio curso.
**Resultado esperado:** El Docente B solo ve las asignaciones de su curso; no aparece
ninguna asignación del curso del Docente A.
**Estado:** ⬜ Pendiente

---

### TC-023 — Aislamiento: acceso directo a asignaciones de un curso ajeno
**Precondición:** Docente B con sesión activa. Se conoce el `academicCourseId` del curso del
Docente A y el `assignmentId` de una de sus asignaciones.
**Pasos:**
1. Como Docente B, acceder directamente a
   `/admin/courses/[academicCourseId-de-A]/assignments`.
2. Acceder directamente al detalle
   `/admin/courses/[academicCourseId-de-A]/assignments/[assignmentId-de-A]`.
**Resultado esperado:** El acceso no revela ni permite editar las asignaciones del curso
ajeno (404 o vacío por filtrado de RLS vía `academic_courses.teacher_id`). El Docente B no
puede crear, editar ni listar asignaciones de cursos que no le pertenecen.
**Estado:** ⬜ Pendiente

---

### TC-024 — Modo claro/oscuro en las rutas de asignaciones
**Precondición:** Toggle de tema disponible en la navbar.
**Pasos:**
1. Activar modo oscuro y luego modo claro.
2. Revisar visualmente: listado de asignaciones, constructor (`new`) y detalle/edición
   (`[assignmentId]`).
**Resultado esperado:** Todos los fondos, textos y bordes respetan la paleta definida en
`DESIGN.md` en ambos modos. Tipografía JetBrains Mono. Sin textos ilegibles ni fondos
blancos en modo oscuro.
**Estado:** ⬜ Pendiente
