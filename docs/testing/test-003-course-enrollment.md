# test-003 — Gestión de cursos académicos con matrículas y calificaciones

## Precondiciones generales

- Supabase local corriendo (`supabase start`).
- Dos cuentas de prueba disponibles:
  - **Docente:** usuario con rol `teacher` en `user_roles`.
  - **Estudiante:** usuario con rol `student` (cualquier cuenta registrada).
- Variables de entorno en `.env.local` apuntando al proyecto local.

---

## Casos de prueba

### TC-001 — Acceso a `/admin/courses` sin sesión
**Precondición:** No hay sesión activa.
**Pasos:**
1. Abrir `/admin/courses` directamente.
**Resultado esperado:** Redirige a `/login?redirectTo=/admin/courses`.
**Estado:** ✅ Aprobado

---

### TC-002 — Acceso a `/admin/courses` con rol estudiante
**Precondición:** Sesión activa con rol `student`.
**Pasos:**
1. Iniciar sesión como estudiante.
2. Navegar a `/admin/courses`.
**Resultado esperado:** Redirige a `/` (página de inicio).
**Estado:** ✅ Aprobado

---

### TC-003 — Acceso a `/admin/courses` con rol docente
**Precondición:** Sesión activa con rol `teacher`.
**Pasos:**
1. Iniciar sesión como docente.
2. Navegar a `/admin/courses`.
**Resultado esperado:** Muestra el listado de cursos (vacío si no hay ninguno).
**Estado:** ✅ Aprobado

---

### TC-004 — Crear un curso nuevo
**Precondición:** Sesión activa como docente. Listado de cursos visible.
**Pasos:**
1. Hacer clic en "Nuevo curso".
2. Completar el formulario: nombre, código, al menos un día de clase, hora inicio < hora fin.
3. Hacer clic en "Generar" para el código de matrícula.
4. Enviar el formulario.
**Resultado esperado:** Redirige a `/admin/courses/[id]`. El curso aparece en el listado.
**Estado:** ✅ Aprobado

---

### TC-005 — Validación del formulario de creación
**Precondición:** Formulario de nuevo curso abierto.
**Pasos:**
1. Intentar enviar el formulario vacío.
2. Ingresar hora fin anterior a hora inicio y enviar.
**Resultado esperado:**
- Caso 1: errores inline en los campos requeridos.
- Caso 2: error "La hora de fin debe ser posterior a la de inicio".
**Estado:** ✅ Aprobado

---

### TC-006 — Editar un curso existente
**Precondición:** Al menos un curso creado.
**Pasos:**
1. Navegar al detalle del curso (`/admin/courses/[id]`).
2. Hacer clic en "Editar curso".
3. Cambiar el nombre y guardar.
**Resultado esperado:** Vuelve al detalle con el nombre actualizado.
**Estado:** ✅ Aprobado

---

### TC-007 — Matricularse con código válido (flujo estudiante)
**Precondición:** Sesión activa como estudiante. Código de matrícula de un curso activo disponible.
**Pasos:**
1. Navegar a `/cuenta/cursos`.
2. Ingresar el código de matrícula en el formulario.
3. Hacer clic en "Matricularme".
**Resultado esperado:** Mensaje de éxito. El curso aparece en la lista con estado "Activo" y nota "—".
**Estado:** ✅ Aprobado

---

### TC-008 — Errores de matrícula
**Precondición:** Sesión activa como estudiante.
**Pasos:**
1. Ingresar un código inexistente y hacer clic en "Matricularme".
2. Ingresar el mismo código válido por segunda vez.
**Resultado esperado:**
- Caso 1: "Código no encontrado."
- Caso 2: "Ya estás matriculado en este curso."
**Estado:** ✅ Aprobado

---

### TC-009 — Ver detalle de matrícula con calificaciones vacías
**Precondición:** Estudiante matriculado. Docente con ítems de evaluación creados.
**Pasos:**
1. Como estudiante, navegar a `/cuenta/cursos`.
2. Hacer clic en "Ver detalle" del curso.
**Resultado esperado:** Muestra los ítems de evaluación con "—" en cada nota. Nota total: "—".
**Estado:** ✅ Aprobado

---

### TC-010 — Docente ve estudiante matriculado
**Precondición:** Estudiante matriculado en el curso del docente.
**Pasos:**
1. Iniciar sesión como docente.
2. Navegar al detalle del curso (`/admin/courses/[id]`).
**Resultado esperado:** El estudiante aparece en la tabla "Activos" con nota total "—".
**Estado:** ✅ Aprobado

---

### TC-011 — Añadir ítems de calificación
**Precondición:** Sesión activa como docente. Curso con estudiante matriculado.
**Pasos:**
1. Navegar a `/admin/courses/[id]/grades`.
2. Hacer clic en "Añadir ítem" e ingresar "Parcial 1". Confirmar.
3. Añadir un segundo ítem "Taller 1".
**Resultado esperado:** Los ítems aparecen en la lista y la tabla de calificaciones muestra columnas para cada ítem.
**Estado:** ✅ Aprobado

---

### TC-012 — Registrar y ver calificaciones
**Precondición:** Ítems de evaluación creados. Estudiante activo en el curso.
**Pasos:**
1. En la tabla de calificaciones, hacer clic en una celda e ingresar `4.5`.
2. Hacer clic fuera de la celda (onBlur).
3. Verificar que aparece el ícono de check (✓) brevemente.
4. Verificar que la columna "Total" se actualiza.
5. Iniciar sesión como estudiante y navegar al detalle de la matrícula.
**Resultado esperado:** La nota `4.50` es visible tanto para el docente como para el estudiante. El total refleja el promedio.
**Estado:** ✅ Aprobado

---

### TC-013 — Nota inválida en celda
**Precondición:** Tabla de calificaciones abierta.
**Pasos:**
1. Ingresar `6` en una celda y salir (onBlur).
**Resultado esperado:** La celda se pone en estado de error (borde rojo). No se guarda la nota.
**Estado:** ✅ Aprobado

---

### TC-014 — Retirar a un estudiante
**Precondición:** Estudiante activo en el curso.
**Pasos:**
1. En `/admin/courses/[id]`, hacer clic en "Retirar" junto al estudiante.
2. Verificar que el estudiante pasa a la sección "Retirados".
3. Iniciar sesión como estudiante y navegar a `/cuenta/cursos`.
**Resultado esperado:**
- El docente ya no ve al estudiante en "Activos".
- El estudiante ve el curso con estado "Retirado" (sin enlace "Ver detalle").
**Estado:** ✅ Aprobado

---

### TC-015 — Intentar re-matricularse tras retiro
**Precondición:** Estudiante retirado de un curso activo.
**Pasos:**
1. Como estudiante, ingresar el mismo código de matrícula en `/cuenta/cursos`.
**Resultado esperado:** "Ya estás matriculado en este curso." (la fila existe con `status = withdrawn`).
**Estado:** ✅ Aprobado

---

### TC-016 — Eliminar ítem de calificación sin notas
**Precondición:** Ítem de calificación sin notas registradas.
**Pasos:**
1. En el panel de ítems, hacer clic en "Eliminar" del ítem.
2. Confirmar en el diálogo.
**Resultado esperado:** El ítem desaparece de la lista y de la tabla de calificaciones.
**Estado:** ✅ Aprobado

---

### TC-017 — Eliminar ítem con notas registradas
**Precondición:** Ítem con al menos una nota registrada.
**Pasos:**
1. Intentar eliminar el ítem con notas.
**Resultado esperado:** Aparece alerta: "No se puede eliminar un ítem que ya tiene notas registradas."
**Estado:** ✅ Aprobado

---

### TC-018 — Aislamiento entre docentes
**Precondición:** Dos cuentas con rol `teacher` y un curso cada una.
**Pasos:**
1. Iniciar sesión como docente A. Verificar que solo aparece su curso.
2. Anotar el ID del curso del docente B e intentar acceder directamente.
**Resultado esperado:** El docente A no ve el curso del docente B en el listado. El acceso directo devuelve 404 (RLS filtra el resultado).
**Estado:** ✅ Aprobado — Nota: `santiago8628@gmail.com` tiene rol `teacher` **y** `admin`; por diseño RLS ("select own or admin") un admin ve todos los cursos, por lo que esa dirección no prueba aislamiento. Se validó con `docente-b@nodo.test` (teacher puro): no ve "Estructuras de datos" en su listado y el acceso directo a `/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756` devuelve 404.

---

### TC-019 — Rutas públicas no afectadas
**Precondición:** Sin sesión activa.
**Pasos:**
1. Navegar a `/` (home).
2. Navegar a un curso público (ej. `/estructuras-de-datos`).
3. Navegar a una lección (ej. `/estructuras-de-datos/bienvenida-al-curso`).
**Resultado esperado:** Las tres rutas cargan con código 200 sin errores ni redireccionamientos.
**Estado:** ✅ Aprobado

---

### TC-020 — Modo oscuro en rutas nuevas
**Precondición:** Modo oscuro activado (toggle en navbar).
**Pasos:**
1. Revisar visualmente: `/admin/courses`, `/admin/courses/new`, `/admin/courses/[id]`, `/admin/courses/[id]/grades`.
2. Revisar: `/cuenta/cursos`, `/cuenta/cursos/[enrollmentId]`.
**Resultado esperado:** Todos los fondos, textos y bordes respetan la paleta oscura definida en `DESIGN.md`. Sin textos ilegibles ni fondos blancos en modo oscuro.
**Estado:** ✅ Aprobado

---

### TC-021 — Matrícula en curso inactivo
**Precondición:** Sesión activa como estudiante. Existe un curso cuyo `is_active = false` (desactivado por el docente) y se conoce su código de matrícula.
**Pasos:**
1. Navegar a `/cuenta/cursos`.
2. Ingresar el código de matrícula del curso inactivo.
3. Hacer clic en "Matricularme".
**Resultado esperado:** Mensaje de error "El curso no está aceptando matrículas." El estudiante no queda matriculado y el curso no aparece en su lista.
**Estado:** ✅ Aprobado

---

### TC-022 — Código de matrícula duplicado al crear curso
**Precondición:** Sesión activa como docente. Ya existe un curso con un código de matrícula conocido.
**Pasos:**
1. Navegar a `/admin/courses/new`.
2. Completar el formulario con datos válidos, pero ingresar manualmente en "Código de matrícula" un código que ya está en uso por otro curso.
3. Enviar el formulario.
**Resultado esperado:** El servidor rechaza la creación. Se muestra el error "El código de matrícula ya existe. Genera uno diferente." y el campo "Código de matrícula" marca "Ya existe este código." El curso no se crea.
**Estado:** ✅ Aprobado

---

### TC-023 — Acceso a `/cuenta/cursos` sin sesión
**Precondición:** No hay sesión activa.
**Pasos:**
1. Abrir `/cuenta/cursos` directamente.
**Resultado esperado:** Redirige a `/login?redirectTo=/cuenta/cursos`.
**Estado:** ✅ Aprobado
