# test-028 — Navbar por rol (estudiante / docente) y ocultamiento para anónimos

## Datos de prueba

> Se completan al preparar la ronda de ejecución (ver "Pruebas manuales
> asistidas por Claude" en `CLAUDE.md`). Todo el spec es UI, no requiere
> mutar datos salvo contar con las cuentas descritas abajo.

| Recurso | Endpoint/API de creación | Identificador | Eliminado |
|---|---|---|---|
| Cuenta docente con ≥2 cursos académicos activos | reutilizar existente o `POST /api/students` + `academic_courses` | ⬜ pendiente de confirmar con el usuario | ⬜ |
| Cuenta de estudiante matriculada en al menos un curso | reutilizar existente o UI `/registro` | ⬜ pendiente de confirmar con el usuario | ⬜ |

**Entorno de pruebas:** desarrollo (proyecto Supabase único del repo)
**Fecha de la ronda:** 2026-07-29

---

## Precondiciones generales

- `npm run dev` corriendo.
- Cuenta docente (`teacher` o `admin`) con al menos 2 cursos académicos
  activos a su nombre (`teacher_id`).
- Cuenta de estudiante matriculada en al menos un curso.
- Probar en desktop y en viewport móvil (DevTools o dispositivo real), y en
  modo claro y oscuro (`prefers-color-scheme`), para cada caso relevante.

---

## Casos de prueba

### TC-028-001 — Visitante anónimo no ve navbar en la landing
**Precondición:** sin sesión iniciada (logout o navegación privada).
**Pasos:**
1. Ir a `/`.
2. Observar la parte superior de la página.
**Resultado esperado:** no aparece navbar ni barra de anuncio
(`AnnouncementBar`); no hay hueco vacío anómalo sobre el contenido.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — comportamiento exacto al esperado.

### TC-028-002 — Visitante anónimo no ve navbar en rutas públicas restantes
**Precondición:** sin sesión iniciada.
**Pasos:**
1. Ir a `/grupo-investigacion`.
2. Ir a `/login`.
3. Ir a `/registro`.
**Resultado esperado:** en las tres rutas, no aparece navbar ni barra de
anuncio.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-003 — Con sesión, el navbar aparece incluso en `/login`/`/registro`
**Precondición:** sesión iniciada (estudiante o docente).
**Pasos:**
1. Con sesión activa, navegar manualmente a `/login`.
2. Navegar manualmente a `/registro`.
**Resultado esperado:** el navbar aparece igual que en el resto de rutas
autenticadas.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-004 — Navbar de estudiante: enlaces y `UserMenu`
**Precondición:** sesión de estudiante iniciada.
**Pasos:**
1. Observar la barra en desktop.
2. Abrir el `UserMenu` (avatar/iniciales).
3. Verificar el enlace *Grupo de Investigación*.
4. Click en *Mis cursos*.
5. Volver, abrir `UserMenu`, click en *Mi cuenta*.
6. Volver, abrir `UserMenu`, click en *Cerrar sesión*.
**Resultado esperado:** la barra muestra *Grupo de Investigación* + el
`UserMenu`; *Mis cursos* lleva a `/cuenta/cursos`, *Mi cuenta* a `/cuenta`,
*Cerrar sesión* cierra la sesión y redirige según el flujo existente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-005 — Navbar de estudiante en móvil
**Precondición:** sesión de estudiante iniciada, viewport móvil.
**Pasos:**
1. Abrir el menú hamburguesa.
2. Verificar *Grupo de Investigación*, nombre de usuario, *Mi cuenta*,
   *Cerrar sesión*.
3. Click en cualquier enlace.
**Resultado esperado:** el drawer muestra los mismos elementos que desktop;
al navegar, el drawer se cierra.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-006 — Navbar de docente: enlaces base
**Precondición:** sesión docente iniciada (`teacher` o `admin`), con ≥2
cursos activos.
**Pasos:**
1. Observar la barra en desktop.
2. Verificar presencia de *Mis cursos*, *Calificaciones*, *Asistencia*,
   *Evaluaciones*, *Grupo de Investigación* y el dropdown de curso.
**Resultado esperado:** todos los elementos están presentes; el `UserMenu`
del docente NO muestra *Mis cursos* (ya está en la barra).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-007 — Dropdown sin curso en scope (`/admin/courses`)
**Precondición:** sesión docente iniciada, ubicado en `/admin/courses`.
**Pasos:**
1. Observar el dropdown de curso.
2. Intentar click en *Calificaciones*, *Asistencia*, *Evaluaciones*.
3. Click en *Mis cursos*.
**Resultado esperado:** el dropdown muestra *"Selecciona un curso"*; los
tres enlaces dependientes de curso aparecen deshabilitados y no navegan;
*Mis cursos* sí navega a `/admin/courses`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-008 — Dropdown con curso en scope
**Precondición:** sesión docente iniciada, ubicado en
`/admin/courses/{id}/edit` (o cualquier subruta de un curso).
**Pasos:**
1. Observar el dropdown: debe mostrar el curso actual seleccionado.
2. Click en *Calificaciones*.
3. Volver a la ruta con scope, click en *Asistencia*.
4. Volver a la ruta con scope, click en *Evaluaciones*.
**Resultado esperado:** el dropdown refleja el curso correcto; los tres
enlaces navegan a `/admin/courses/{id}/grades`, `/attendance` y
`/assignments` respectivamente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-009 — Cambiar de curso desde una sección con scope
**Precondición:** sesión docente iniciada, ubicado en
`/admin/courses/A/grades`, con un segundo curso B disponible.
**Pasos:**
1. Abrir el dropdown y seleccionar el curso B.
**Resultado esperado:** navega a `/admin/courses/B/grades` (misma sección,
otro curso).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-010 — Cambiar de curso desde una ruta sin sección
**Precondición:** sesión docente iniciada, ubicado en `/admin/courses` (sin
scope).
**Pasos:**
1. Abrir el dropdown y seleccionar un curso.
**Resultado esperado:** navega a `/admin/courses/{id}` (detalle del curso
elegido).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-011 — Docente sin cursos propios
**Precondición:** cuenta docente sin ningún `academic_course` a su nombre
(o `admin` sin cursos asignados).
**Pasos:**
1. Observar el dropdown de curso.
2. Verificar *Calificaciones*, *Asistencia*, *Evaluaciones*.
**Resultado esperado:** el dropdown aparece deshabilitado con texto *"Sin
cursos"* y un acceso a *Nuevo curso*; los tres enlaces dependientes de curso
están deshabilitados.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-012 — Navbar de docente en móvil
**Precondición:** sesión docente iniciada, viewport móvil.
**Pasos:**
1. Abrir el menú hamburguesa.
2. Verificar los 4 enlaces + dropdown de curso + *Grupo de Investigación*.
3. Seleccionar un curso en el dropdown desde el drawer.
4. Click en un enlace dependiente de curso ya habilitado.
**Resultado esperado:** el drawer muestra los mismos elementos que desktop
sin desalineación visual respecto al header; cualquier navegación cierra el
drawer.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-013 — Accesibilidad de `UserMenu` para docente
**Precondición:** sesión docente iniciada.
**Pasos:**
1. Abrir `UserMenu` con teclado (Tab hasta el trigger, Enter/Espacio).
2. Verificar que el foco inicial cae en el primer ítem visible (*Mi
   cuenta*, ya que *Mis cursos* no se renderiza para docentes).
3. Presionar `Escape` y verificar que el menú cierra y el foco vuelve al
   trigger.
4. Repetir con click fuera del menú.
**Resultado esperado:** navegación por teclado funciona igual que antes del
cambio, sin quedar el foco perdido o en un elemento inexistente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-014 — Altura del header en páginas de lección
**Precondición:** sesión de estudiante matriculado, con acceso a una
lección.
**Pasos:**
1. Entrar a una lección (`/[courseSlug]/[lessonSlug]`).
2. Verificar que el layout sticky de la lección respeta la altura real del
   header (sin recorte ni hueco).
**Resultado esperado:** `--header-height` refleja la altura real; no hay
desajuste visual en el layout de la lección.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-015 — Landing sin hueco vacío para anónimos
**Precondición:** sin sesión iniciada.
**Pasos:**
1. Ir a `/` y observar el espacio entre el borde superior de la ventana y
   el contenido (`Cursos`).
2. Repetir con sesión iniciada y comparar.
**Resultado esperado:** sin header, no queda un hueco vacío desproporcionado
sobre el contenido; con header, no hay layout shift ni superposición.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-028-016 — Modo oscuro
**Precondición:** `prefers-color-scheme: dark` activo en el sistema/navegador.
**Pasos:**
1. Repetir TC-028-004 (estudiante) y TC-028-006 (docente) en modo oscuro.
**Resultado esperado:** contraste y legibilidad correctos en ambos navbars y
en el dropdown de curso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: 15 — Fallidos: 0 — Pendientes: 1 (TC-028-011 teórico, saltado)
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno
- Limpieza de datos de prueba: ⬜ Pendiente (cuentas de prueba: docente-spec028-1785359286@test.edu.co, 2 cursos TEST-A y TEST-B)
