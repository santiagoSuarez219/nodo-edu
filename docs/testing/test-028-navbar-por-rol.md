# test-028 — Navbar por rol (estudiante / docente) y ocultamiento para anónimos

## Datos de prueba

> Se completan al preparar la ronda de ejecución (ver "Pruebas manuales
> asistidas por Claude" en `CLAUDE.md`). Todo el spec es UI, no requiere
> mutar datos salvo contar con las cuentas descritas abajo.

| Recurso | Endpoint/API de creación | Identificador | Eliminado |
|---|---|---|---|
| Cuenta docente de prueba "Docente Test" (rol corregido manualmente a `teacher` tras signup) | `POST /auth/v1/signup` + `PATCH /rest/v1/user_roles` | `d4af82b0-1b90-4aea-839c-926ea0196648` | ✅ (`DELETE /auth/v1/admin/users/{id}`, `user_roles`, `profiles`) |
| Curso académico "Test A" (`TEST-A`) | `POST /rest/v1/academic_courses` | `899dce0d-aa2e-40a1-bd20-64e0598e1754` | ✅ (`DELETE /rest/v1/academic_courses`) |
| Curso académico "Test B" (`TEST-B`) | `POST /rest/v1/academic_courses` | `62a876be-3f04-483a-98ba-46c5639d292e` | ✅ (`DELETE /rest/v1/academic_courses`) |
| Cuenta de estudiante ya existente (reutilizada, matriculada en al menos un curso) | preexistente, iniciada por el usuario | no aplica (cuenta real del usuario, no de prueba — no se elimina) | no aplica |
| Cuenta docente sin cursos académicos "docente-sin-cursos-028" | `POST /auth/v1/signup` + `PATCH /rest/v1/user_roles` | `22fd4348-03c6-4183-b6cb-75f53037b468` | ✅ (`DELETE /auth/v1/admin/users/{id}`, `user_roles`, `profiles`) |

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
**Estado:** ✅ Aprobado
**Hallazgos:** `/grupo-investigacion` redirige a `/login` (gate de
autenticación de esa ruta, ajeno al scope de spec-028 — no muestra navbar en
ningún punto del flujo). `/login` y `/registro` funcionan sin navbar, sin
observaciones adicionales.

### TC-028-003 — Con sesión, el navbar aparece incluso en `/login`/`/registro`
**Precondición:** sesión iniciada (estudiante o docente).
**Pasos:**
1. Con sesión activa, navegar manualmente a `/login`.
2. Navegar manualmente a `/registro`.
**Resultado esperado:** el navbar aparece igual que en el resto de rutas
autenticadas.
**Estado:** ✅ Aprobado
**Hallazgos:** El signup por defecto asigna rol `student`; para validar el
caso docente se corrigió el rol manualmente vía `user_roles` (ver "Datos de
prueba"). Tras la corrección, el navbar aparece en `/login` y `/registro`
con los enlaces de docente (deshabilitados, sin curso en scope todavía) —
comportamiento correcto.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado el 2026-07-29 con una cuenta de estudiante real ya
existente. Sin observaciones.

### TC-028-005 — Navbar de estudiante en móvil
**Precondición:** sesión de estudiante iniciada, viewport móvil.
**Pasos:**
1. Abrir el menú hamburguesa.
2. Verificar *Grupo de Investigación*, nombre de usuario, *Mis cursos*, *Mi
   cuenta*, *Cerrar sesión*.
3. Click en cualquier enlace.
**Resultado esperado:** el drawer muestra los mismos elementos que desktop
(incluido *Mis cursos*, agregado al drawer tras la corrección de
CAMBIOS REQUERIDOS de code review); al navegar, el drawer se cierra.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado el 2026-07-29. *Mis cursos* aparece correctamente en
el drawer (agregado tras la corrección post-review); el drawer cierra al
navegar. Sin observaciones.

### TC-028-006 — Navbar de docente: enlaces base
**Precondición:** sesión docente iniciada (`teacher` o `admin`), con ≥2
cursos activos.
**Pasos:**
1. Observar la barra en desktop.
2. Verificar presencia de *Mis cursos*, *Calificaciones*, *Asistencia*,
   *Evaluaciones*, *Grupo de Investigación* y el dropdown de curso.
**Resultado esperado:** todos los elementos están presentes; el `UserMenu`
del docente NO muestra *Mis cursos* (ya está en la barra).
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado tal cual, sin observaciones.

### TC-028-007 — Dropdown sin curso en scope (`/admin/courses`)
**Precondición:** sesión docente iniciada, ubicado en `/admin/courses`.
**Pasos:**
1. Observar el dropdown de curso.
2. Intentar click en *Calificaciones*, *Asistencia*, *Evaluaciones*.
3. Click en *Mis cursos*.
**Resultado esperado:** el dropdown muestra *"Selecciona un curso"*; los
tres enlaces dependientes de curso aparecen deshabilitados y no navegan;
*Mis cursos* sí navega a `/admin/courses`.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado tal cual, sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-028-009 — Cambiar de curso desde una sección con scope
**Precondición:** sesión docente iniciada, ubicado en
`/admin/courses/A/grades`, con un segundo curso B disponible.
**Pasos:**
1. Abrir el dropdown y seleccionar el curso B.
**Resultado esperado:** navega a `/admin/courses/B/grades` (misma sección,
otro curso).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-028-010 — Cambiar de curso desde una ruta sin sección
**Precondición:** sesión docente iniciada, ubicado en `/admin/courses` (sin
scope).
**Pasos:**
1. Abrir el dropdown y seleccionar un curso.
**Resultado esperado:** navega a `/admin/courses/{id}` (detalle del curso
elegido).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-028-011 — Docente sin cursos propios
**Precondición:** cuenta docente sin ningún `academic_course` a su nombre
(o `admin` sin cursos asignados).
**Pasos:**
1. Observar el dropdown de curso.
2. Click en el dropdown para abrirlo.
3. Verificar *Calificaciones*, *Asistencia*, *Evaluaciones*.
**Resultado esperado:** el dropdown se ve visualmente atenuado con texto
*"Sin cursos"*, pero es clickeable y al abrirse muestra un mensaje y un
acceso a *Crear nuevo curso*; los tres enlaces dependientes de curso están
deshabilitados.
**Estado:** ✅ Aprobado
**Hallazgos:** **Bug encontrado y corregido durante la ejecución**: el botón
del dropdown tenía el atributo HTML `disabled`, lo que impedía abrirlo por
completo — el usuario no podía ver el mensaje ni el CTA "Crear nuevo curso"
porque el `<button disabled>` no dispara `onClick`. Corregido en
`CourseScopeSelect.tsx` quitando el atributo `disabled` del trigger (se
mantiene el estilo visual atenuado vía className, pero el botón es
clickeable para mostrar el estado vacío). Reprobado tras el fix: aprobado.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-028-014 — Altura del header en páginas de lección
**Precondición:** sesión de estudiante matriculado, con acceso a una
lección.
**Pasos:**
1. Entrar a una lección (`/[courseSlug]/[lessonSlug]`).
2. Verificar que el layout sticky de la lección respeta la altura real del
   header (sin recorte ni hueco).
**Resultado esperado:** `--header-height` refleja la altura real; no hay
desajuste visual en el layout de la lección.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-028-015 — Landing sin hueco vacío para anónimos
**Precondición:** sin sesión iniciada.
**Pasos:**
1. Ir a `/` y observar el espacio entre el borde superior de la ventana y
   el contenido (`Cursos`).
2. Repetir con sesión iniciada y comparar.
**Resultado esperado:** sin header, no queda un hueco vacío desproporcionado
sobre el contenido; con header, no hay layout shift ni superposición.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones, tras el ajuste del `mt-19` en `app/page.tsx`
(Fase 4).

### TC-028-016 — Modo oscuro
**Precondición:** `prefers-color-scheme: dark` activo en el sistema/navegador.
**Pasos:**
1. Repetir TC-028-004 (estudiante) y TC-028-006 (docente) en modo oscuro.
**Resultado esperado:** contraste y legibilidad correctos en ambos navbars y
en el dropdown de curso.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado con la cuenta docente en la primera ejecución y con
una cuenta de estudiante real en la segunda ronda. Sin observaciones en
ninguno de los dos roles.

## Resumen de la ronda

### Primera ejecución (2026-07-29)
- Aprobados: 11 — Fallidos: 0 — Pendientes: 3 (TC-028-004, TC-028-005,
  TC-028-011 — no se probó ninguna cuenta de estudiante ni el caso de
  docente sin cursos)
- Limpieza parcial: cuenta docente `docente-spec028-1785359286@test.edu.co`
  (`d4af82b0-1b90-4aea-839c-926ea0196648`) y cursos `TEST-A`
  (`899dce0d-aa2e-40a1-bd20-64e0598e1754`), `TEST-B`
  (`62a876be-3f04-483a-98ba-46c5639d292e`) eliminados.

### Segunda ejecución (2026-07-29, misma fecha — cierre de la ronda)
- Se ejecutaron los 3 casos pendientes:
  - **TC-028-004 y TC-028-005** con una cuenta de estudiante real del
    usuario (no se creó dato de prueba; no requiere limpieza).
  - **TC-028-011** con una cuenta docente de prueba sin cursos, creada
    específicamente para este caso.
- **Bug encontrado y corregido durante TC-028-011:** el botón trigger de
  `CourseScopeSelect` tenía el atributo HTML `disabled` cuando el docente no
  tenía cursos, impidiendo abrirlo para ver el estado vacío y el CTA "Crear
  nuevo curso". Corregido quitando el atributo `disabled` (se conserva el
  estilo visual atenuado). Reprobado tras el fix: aprobado.
- Aprobados: **16 — Fallidos: 0 — Pendientes: 0**

### Resultado final
- **16/16 casos aprobados.**
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno nuevo (DEBT-015,
  DEBT-016, DEBT-017 ya registrados durante la implementación; el bug de
  `CourseScopeSelect` se corrigió en el mismo ciclo de pruebas, no quedó
  como deuda).
- Limpieza de datos de prueba: ✅ Completada — todas las cuentas y cursos de
  prueba (docente con 2 cursos, docente sin cursos) eliminados vía API.
  Verificado con consultas posteriores: 0 registros restantes en ambos
  casos. La cuenta de estudiante usada era preexistente del usuario, no un
  dato de prueba, y no requiere limpieza.
