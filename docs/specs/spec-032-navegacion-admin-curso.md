# spec-032 — [IN PROGRESS] Navegación del docente: layout único de administración de curso

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Hoy el docente tiene tres formas distintas —y parcialmente contradictorias— de
llegar a las secciones de un curso:

1. **Navbar global** (`components/navbar/navLinks.ts` + `CourseScopeSelect.tsx`):
   enlaces "Calificaciones", "Asistencia" y "Evaluaciones" que dependen de que
   la URL actual contenga un `academicCourseId`. Fuera de `/admin/courses/<id>/…`
   aparecen deshabilitados con el tooltip "Selecciona un curso para…", más un
   dropdown "Selecciona un curso" que reescribe la ruta actual conservando la
   sección. Es un scope implícito: el navbar cambia de significado según dónde
   esté parado el usuario.
2. **Tabla de cursos** (`components/admin/AcademicCourseList.tsx`): una columna
   "Acciones" con el dropdown `CourseActionsDropdown` (Ver detalle / Presentación
   / Contenido). Hacer clic en la fila no hace nada.
3. **Tabs duplicados dentro de cada página**: `page.tsx`, `grades/page.tsx` y
   `contenido/page.tsx` reimplementan cada uno su propia barra de tabs, con
   conjuntos **distintos** entre sí. `attendance/page.tsx`, `assignments/page.tsx`,
   `presentacion/page.tsx` y `edit/page.tsx` directamente no tienen tabs: usan un
   breadcrumb o un botón "Volver". El resultado es que la navegación desaparece o
   cambia según la pestaña, y el `page.tsx` de detalle arrastra un `<Link>` vacío
   hacia `presentacion` (líneas 117-121) que renderiza un tab sin texto.

Además, desde spec-031 `[DONE]` la asistencia se gestiona **desde la propia
lección** (`TeacherLessonPanel`, con generación de código y conteo en vivo), lo
que deja a `/admin/courses/<id>/attendance` como una segunda puerta redundante
al mismo flujo.

Este spec unifica la navegación en un único **layout de administración de curso**
que persiste en todas las pestañas, y elimina el scope de curso del navbar global.

## Alcance

**Incluye:**

- **Navbar del docente**: eliminar los enlaces "Calificaciones", "Asistencia" y
  "Evaluaciones", y eliminar el dropdown de selección de curso (`CourseScopeSelect`)
  del navbar de escritorio y del menú móvil. El navbar docente queda con
  "Mis cursos" y "Grupo de Investigación".
- **Tabla de cursos** (`/admin/courses`): eliminar la columna "Acciones" y su
  dropdown; la fila completa pasa a ser clickeable y navega a
  `/admin/courses/<academicCourseId>`.
- **Layout de curso**: nuevo `app/(admin)/admin/courses/[academicCourseId]/layout.tsx`
  que carga el curso una sola vez y renderiza, en **todas** las subrutas:
  - breadcrumb "Mis cursos" → `/admin/courses`;
  - cabecera con nombre, badge Activo/Inactivo, código, horario y código de matrícula;
  - botones secundarios "Contenido", "Presentación" y "Editar curso";
  - barra de tabs **Estudiantes · Calificaciones · Evaluaciones**, con el tab
    activo resuelto desde `usePathname()`.
- **Limpieza de las páginas hijas**: quitar de cada `page.tsx` el breadcrumb, la
  cabecera de curso y los tabs duplicados, incluido el `<Link>` vacío hacia
  `presentacion` y el botón "Volver" de `assignments`.
- **Eliminar** `app/(admin)/admin/courses/[academicCourseId]/attendance/page.tsx`.
  La asistencia se gestiona exclusivamente desde cada lección (spec-031).

**No incluye:**

- Ningún cambio de esquema de base de datos, política RLS, endpoint de API ni MCP.
- Ningún cambio en el navbar del estudiante ni en `getStudentNavLinks()`.
- Eliminar `components/admin/AdminAttendancePanel.tsx` ni nada de `lib/attendance/`:
  spec-031 los reutiliza en la vista docente de la lección y siguen intactos.
- Rediseñar el contenido interno de las pestañas (tabla de estudiantes, panel de
  calificaciones, lista de evaluaciones): solo se les quita el cromo de navegación.
- Convertir `/contenido` o `/presentacion` en tabs; quedan como botones del header.
- Redirección de `/admin/courses/<id>/attendance` a otra ruta: la página se
  elimina y la URL pasa a devolver 404.

## Impacto en el sistema

| Archivo | Acción |
|---|---|
| `components/navbar/navLinks.ts` | Modificar — `getTeacherNavLinks()` pierde el parámetro `academicCourseId` y devuelve solo "Mis cursos" y "Grupo de Investigación" |
| `components/navbar/Navbar.tsx` | Modificar — eliminar import y render de `CourseScopeSelect` (desktop + móvil), la prop `teacherCourses` y el `useParams()` que ya no se usa |
| `components/navbar/CourseScopeSelect.tsx` | **Eliminar** — sin más consumidores |
| `app/layout.tsx` | Modificar — dejar de llamar a `getCoursesByTeacher()` y de pasar `teacherCourses` al `Navbar` |
| `components/admin/AcademicCourseList.tsx` | Modificar — quitar columna "Acciones"; fila clickeable con patrón *stretched link* |
| `components/admin/CourseActionsDropdown.tsx` | **Eliminar** — sin más consumidores |
| `app/(admin)/admin/courses/[academicCourseId]/layout.tsx` | **Crear** — carga el curso, `notFound()` si no existe, renderiza header + tabs + `children` |
| `components/admin/CourseHeader.tsx` | **Crear** — server component de presentación: breadcrumb, datos del curso y botones Contenido / Presentación / Editar curso |
| `components/admin/CourseTabs.tsx` | **Crear** — client component; tab activo vía `usePathname()` |
| `app/(admin)/admin/courses/[academicCourseId]/page.tsx` | Modificar — deja solo `EnrollmentTable` |
| `app/(admin)/admin/courses/[academicCourseId]/grades/page.tsx` | Modificar — quitar breadcrumb, título y tabs propios |
| `app/(admin)/admin/courses/[academicCourseId]/assignments/page.tsx` | Modificar — quitar botón "Volver" |
| `app/(admin)/admin/courses/[academicCourseId]/contenido/page.tsx` | Modificar — quitar breadcrumb y tabs propios |
| `app/(admin)/admin/courses/[academicCourseId]/presentacion/page.tsx` | Modificar — quitar breadcrumb |
| `app/(admin)/admin/courses/[academicCourseId]/edit/page.tsx` | Modificar — quitar breadcrumb si lo tiene |
| `app/(admin)/admin/courses/[academicCourseId]/attendance/page.tsx` | **Eliminar** |

> Las tres eliminaciones de archivo (`CourseScopeSelect.tsx`,
> `CourseActionsDropdown.tsx`, `attendance/page.tsx`) requieren confirmación
> explícita del usuario en la sesión de implementación (ver CLAUDE.md →
> "Acciones prohibidas").

### Nota sobre subrutas profundas

El layout de `[academicCourseId]` aplica también a
`assignments/[groupId]`, `assignments/[groupId]/review` y
`assignments/[groupId]/review/[submissionId]`. Esto es deseable —la cabecera del
curso se conserva en todo el flujo— y en esas rutas ningún tab queda marcado como
activo salvo "Evaluaciones", que sí lo estará por prefijo de ruta.

## Evaluación MCP

**¿Aplica MCP?** No.

Este spec es exclusivamente de navegación y presentación en la UI del panel
docente: no crea, expone ni modifica datos, endpoints ni acciones. Las cuatro
preguntas de la matriz de CLAUDE.md dan negativo:

- No expone datos nuevos que un agente pueda consultar (los cursos ya se leen
  vía `students-mcp` / `assignment-mcp`).
- No habilita acciones nuevas: reordena enlaces existentes.
- Los MCP existentes (`question-bank-mcp`, `assignment-mcp`, `attendance-mcp`,
  `students-mcp`) operan sobre `/api/*` y no dependen de estas rutas de UI.
- Ningún system prompt de `docs/mcps/` menciona `/admin/courses/<id>/attendance`
  ni el selector de curso del navbar, por lo que ninguno queda desactualizado.

En particular, **`attendance-mcp` no se ve afectado** por eliminar la página
`/admin/courses/<id>/attendance`: es un cliente de solo lectura de
`/api/attendance/*`, que permanece sin cambios.

## Fases de implementación

### Fase 1 — Navbar del docente sin scope de curso
- [ ] Simplificar `getTeacherNavLinks()` en `components/navbar/navLinks.ts`:
      sin parámetro, sin `disabled`, sin `title`; devuelve "Mis cursos" y
      "Grupo de Investigación".
- [ ] En `components/navbar/Navbar.tsx`: eliminar el render de `CourseScopeSelect`
      en escritorio y en el menú móvil, la prop `teacherCourses` y el `useParams()`
      si queda sin uso.
- [ ] En `app/layout.tsx`: eliminar la llamada a `getCoursesByTeacher()` y la prop
      `teacherCourses`; retirar el import si queda huérfano.
- [ ] Eliminar `components/navbar/CourseScopeSelect.tsx` (confirmar antes de borrar).
- [ ] Verificar que el navbar del estudiante no cambió.

### Fase 2 — Tabla de cursos con filas clickeables
- [ ] En `components/admin/AcademicCourseList.tsx`: eliminar la columna "Acciones"
      del `<thead>` y del `<tbody>`, y el import de `CourseActionsDropdown`.
- [ ] Hacer la fila navegable a `/admin/courses/<id>` con *stretched link*:
      `<tr className="relative …">` + `<Link className="… after:absolute after:inset-0">`
      envolviendo el nombre del curso. Mantiene HTML válido, foco por teclado y
      un solo destino accesible por fila.
- [ ] Añadir affordance visual de fila clickeable (`hover:bg-…`, `cursor-pointer`)
      según los tokens de `DESIGN.md`.
- [ ] Eliminar `components/admin/CourseActionsDropdown.tsx` (confirmar antes de borrar).

### Fase 3 — Layout persistente de administración de curso
- [ ] Crear `components/admin/CourseHeader.tsx` (server component de presentación)
      con el contenido de cabecera que hoy vive en `[academicCourseId]/page.tsx`
      (líneas 41-92): breadcrumb "Mis cursos", nombre, badge de estado, código,
      horario, código de matrícula. Añadir los botones "Contenido",
      "Presentación" y "Editar curso".
- [ ] Crear `components/admin/CourseTabs.tsx` (`"use client"`): tabs Estudiantes ·
      Calificaciones · Evaluaciones; activo por `usePathname()` — "Estudiantes"
      con coincidencia exacta de `/admin/courses/<id>`, los otros dos por prefijo
      de su segmento. Marcar el activo con `aria-current="page"`.
- [ ] Crear `app/(admin)/admin/courses/[academicCourseId]/layout.tsx`:
      `requireAnyRole(["teacher","admin"])`, `getAcademicCourseById()`,
      `notFound()` si no existe, y render de `CourseHeader` + `CourseTabs` +
      `{children}` dentro del contenedor de ancho actual.

### Fase 4 — Limpieza de las páginas hijas
- [ ] `page.tsx`: eliminar breadcrumb, cabecera, tabs y el `<Link>` vacío hacia
      `presentacion`; dejar solo `EnrollmentTable`. Quitar los imports y las
      constantes (`DAY_LABELS`, formateo de horario) que migraron a `CourseHeader`,
      y la carga del curso si ya no se usa.
- [ ] `grades/page.tsx`: eliminar breadcrumb, bloque de título y tabs propios.
- [ ] `assignments/page.tsx`: eliminar el botón "Volver".
- [ ] `contenido/page.tsx`: eliminar breadcrumb y la barra de tabs propia (que aún
      apunta a `attendance`).
- [ ] `presentacion/page.tsx` y `edit/page.tsx`: eliminar el breadcrumb.
- [ ] Conservar el `export const metadata` propio de cada página.

### Fase 5 — Eliminar la página de asistencia del panel
- [ ] Eliminar `app/(admin)/admin/courses/[academicCourseId]/attendance/page.tsx`
      (confirmar antes de borrar).
- [ ] Verificar con `grep` que no queda ningún enlace a `/attendance` bajo `/admin`
      en `app/`, `components/` ni `docs/mcps/`.
- [ ] Confirmar que `components/admin/AdminAttendancePanel.tsx` y `lib/attendance/`
      siguen intactos y que el panel docente de la lección (spec-031) no se rompe.

### Fase 6 — Verificación
- [ ] `npm run lint` sin errores.
- [ ] `npm run build` sin errores (detecta imports rotos por los archivos eliminados).
- [ ] Cambiar el estado del spec a `[TESTING]` y recorrer `docs/testing/test-032-navegacion-admin-curso.md`.

## Criterios de aceptación

1. El navbar de un docente autenticado muestra únicamente "Mis cursos" y
   "Grupo de Investigación", en cualquier ruta, incluidas las de `/admin/courses/<id>/…`.
2. El navbar del docente no muestra ningún selector de curso, ni con cursos ni sin ellos.
3. La tabla de `/admin/courses` no tiene columna "Acciones" ni dropdown alguno.
4. Hacer clic en cualquier parte de la fila de un curso navega a
   `/admin/courses/<academicCourseId>`; la fila es alcanzable y activable por teclado.
5. En `/admin/courses/<id>`, `/grades`, `/assignments`, `/contenido`,
   `/presentacion` y `/edit` se muestra la misma cabecera de curso (nombre, estado,
   código, horario, código de matrícula) y la misma barra de tabs.
6. La barra de tabs contiene exactamente tres tabs —Estudiantes, Calificaciones,
   Evaluaciones— y marca como activo el correspondiente a la ruta actual.
7. No existe ningún tab vacío ni sin etiqueta en ninguna pestaña.
8. Los botones "Contenido", "Presentación" y "Editar curso" están presentes en la
   cabecera y llevan a sus rutas respectivas.
9. `/admin/courses/<id>/attendance` devuelve 404 y no queda ningún enlace hacia esa ruta.
10. El panel docente de asistencia dentro de una lección (spec-031) sigue
    funcionando: abrir sesión, ver código, ver conteo y cerrar sesión.
11. El navbar del estudiante y sus rutas de `/cuenta` no cambian.
12. `npm run lint` y `npm run build` pasan sin errores.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-032-navegacion-admin-curso.md` — casos `TC-001`
  a `TC-011`. No hay casos `TC-MCP-NNN`: este spec no toca ningún MCP.
- **Automáticas (e2e/unit):** pendientes de que exista framework de testing
  (ver CLAUDE.md → "Testing"). Cuando exista, el archivo será
  `{{ubicación e2e por definir}}/e2e-032-navegacion-admin-curso.spec.ts`, con un
  caso por criterio de aceptación.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
