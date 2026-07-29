# spec-028 — [TESTING] Navbar por rol (estudiante / docente) y ocultamiento para anónimos

## Contexto

Hoy el header global se monta en `app/layout.tsx` para **todas** las rutas y
para **cualquier** visitante: el wrapper `<div data-site-header class="sticky
top-0 …">` con `<AnnouncementBar />` y `<Navbar profile roles />`. El `Navbar`
es un Client Component que ramifica internamente entre "hay perfil" (muestra
`UserMenu`) y "no hay perfil" (botón *Iniciar sesión*), y muestra el enlace
*Grupo de Investigación* siempre, sesión o no. No existe navegación específica
para el docente: el panel admin depende de un nav móvil mínimo en
`app/(admin)/layout.tsx` y de la navegación interna de cada página de curso.

Esto produce tres problemas:

1. El navbar contamina páginas públicas que están diseñadas para tener su
   propia identidad (landing, `/grupo-investigacion`, `/login`, `/registro`).
2. El estudiante autenticado y el docente ven exactamente la misma barra, sin
   diferenciación por rol.
3. El docente no tiene forma de saltar entre *Calificaciones*, *Asistencia* y
   *Evaluaciones* de un curso sin volver a `/admin/courses` y entrar de nuevo
   a cada sección.

Estado actual del código relevante, verificado:

- `app/layout.tsx` (Server Component, root layout): llama a
  `getCurrentProfile()` y `getCurrentRoles()` de `lib/auth/session.ts`, y
  renderiza siempre, para cualquier ruta hija, el wrapper `data-site-header`
  con `AnnouncementBar` y `Navbar`.
- `components/navbar/Navbar.tsx` (Client Component): calcula
  `isTeacher = roles.includes("teacher") || roles.includes("admin")` y
  `misCursosHref` (`/admin/courses` o `/cuenta/cursos`), pero hoy solo decide
  entre `UserMenu` (con perfil) o botón *Iniciar sesión* (sin perfil). El
  enlace *Grupo de Investigación* está hardcodeado y duplicado en el bloque
  desktop y en el bloque del menú móvil (`id="mobile-menu"`).
- `components/navbar/UserMenu.tsx`: dropdown con avatar+iniciales, enlaces
  *Mis cursos* (`misCursosHref`), *Mi cuenta* (`/cuenta`), botón *Cerrar
  sesión*. El foco inicial del menú (`firstItemRef`) está atado al primer
  ítem, hoy *Mis cursos*.
- `app/(auth)/login/page.tsx` y `app/(auth)/registro/` viven bajo el route
  group `app/(auth)/layout.tsx` (sin navbar propio, no aparece en la URL).
- `app/(admin)/layout.tsx` hace `await requireAnyRole(["teacher","admin"])`
  como gate de acceso y renderiza un nav móvil propio muy simple (*Mis
  cursos* → `/admin/courses`) + `<main>{children}</main>`. Rutas admin:
  `/admin/courses`, `/admin/courses/new`,
  `/admin/courses/[academicCourseId]/{edit,grades,attendance,assignments,contenido,presentacion}`.
- `app/(cursos)/[courseSlug]/...` son rutas públicas en la URL pero con gate
  de matrícula (spec-006, `lib/enrollments/access.ts` →
  `requireCourseAccess`). `app/cuenta/`, `app/cuenta/cursos/` son del
  estudiante autenticado. `app/grupo-investigacion/` es pública sin gate.
- `lib/academic-courses/index.ts` expone `getCoursesByTeacher(teacherId)`,
  ya consumida hoy por `app/(admin)/admin/courses/page.tsx`; es server-only,
  sin endpoint HTTP.
- `lib/auth/session.ts` expone `AppRole = "student" | "teacher" | "admin"`,
  `getCurrentProfile` (cache), `getCurrentRoles` (cache), `requireRole`,
  `requireAnyRole`.
- `components/HeaderHeightObserver.tsx`: mide `[data-site-header]` y expone
  `--header-height` como custom property en `document.documentElement`. Si no
  encuentra el elemento, **retorna sin definir la variable**, dejándola en su
  valor por defecto (`6rem` en el único consumidor,
  `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx`).
- `app/page.tsx` (landing) tiene `mt-19` en su `<main>`, un offset manual que
  hoy compensa el header, aunque el header es `sticky top-0` dentro de un
  `body` en `flex flex-col` (ya ocupa espacio en flujo).
- El navbar actual usa clases crudas de Tailwind (`text-gray-700`,
  `bg-blue-700`, etc.) en vez de tokens semánticos — deuda ya documentada en
  `docs/specs/backlog.md`; no se corrige en este spec salvo en el código
  *nuevo* que se agregue, donde sí se usarán tokens semánticos cuando sea
  directo.
- No existe framework de testing automatizado (ver CLAUDE.md → Testing); solo
  pruebas manuales en `docs/testing/`.

## Alcance

### Incluye

- Ocultar por completo el header (wrapper `data-site-header` + `AnnouncementBar`
  + `Navbar`) para visitantes sin sesión iniciada, en **todas** las rutas
  públicas (`/`, `/grupo-investigacion`, `/login`, `/registro` y cualquier
  otra sin perfil autenticado).
- Reorganizar `components/navbar/` en un shell (`Navbar.tsx`) + datos de
  enlaces por rol (`navLinks.ts`) + un renderer compartido
  (`NavLinkList.tsx`), reutilizado en desktop y móvil, eliminando la
  duplicación actual de JSX entre ambos.
- Navbar de **estudiante**: `UserMenu` (Mis cursos → `/cuenta/cursos`, Mi
  cuenta → `/cuenta`, Cerrar sesión) + enlace *Grupo de Investigación*.
- Navbar de **docente** (`teacher`/`admin`): *Mis cursos*, *Calificaciones*,
  *Asistencia*, *Evaluaciones*, *Grupo de Investigación*, con un dropdown
  (`CourseScopeSelect`) para seleccionar el curso académico en scope; los tres
  enlaces dependientes de curso navegan a ese curso.
- Endurecer `HeaderHeightObserver` para fijar `--header-height: 0px` de forma
  explícita cuando no existe header (en vez de dejar la variable indefinida).
- Retirar el nav móvil redundante de `app/(admin)/layout.tsx` (ya cubierto por
  el navbar de docente).
- Revisar y ajustar el `mt-19` de `app/page.tsx`, validando visualmente ambos
  estados (anónimo y autenticado), ya que perder el header puede dejar un
  hueco vacío sobre el contenido de la landing.

### No incluye

- Refactor de las clases crudas de Tailwind del `Navbar` heredado a tokens
  semánticos (deuda ya registrada en backlog).
- Cambios en `UserMenu` más allá de hacer opcional el enlace *Mis cursos*.
- Rediseño de la landing, del footer o de `AnnouncementBar` más allá de
  dejar de montarlos para anónimos.
- Ningún cambio de esquema de base de datos, RLS, Auth ni endpoints HTTP
  nuevos.
- Ningún MCP nuevo ni modificado (ver "Evaluación MCP").
- Ninguna ruta nueva.
- **Puntos de entrada nuevos a `/login` para visitantes anónimos.** Decisión
  explícita del usuario: se acepta que, sin navbar, el único acceso a
  `/login` para un anónimo sea por URL directa o por el gate de matrícula que
  redirige allí. No se agregan enlaces al footer de la landing en este spec.

## Impacto en el sistema

### Archivos a crear

| Archivo | Qué contiene |
|---|---|
| `components/navbar/navLinks.ts` | Tipo `NavLink` y los constructores `getStudentNavLinks()` / `getTeacherNavLinks(academicCourseId)`; única fuente de verdad de rutas y etiquetas del navbar. |
| `components/navbar/NavLinkList.tsx` | Renderer presentacional de `NavLink[]` con `variant: "desktop" | "mobile"`; centraliza el estado deshabilitado (`aria-disabled`, sin `href`) y elimina la duplicación desktop/móvil. |
| `components/navbar/CourseScopeSelect.tsx` | Dropdown de cursos del docente; deriva el curso en scope de la URL (`useParams()`) y navega al seleccionar, preservando la sección actual. |
| `docs/testing/test-028-navbar-por-rol.md` | Casos manuales `TC-028-xxx`. Todo el spec es UI, cobertura enteramente manual. |

### Archivos a modificar

| Archivo | Qué cambia |
|---|---|
| `app/layout.tsx` | Si `profile` es `null`, no se monta `<div data-site-header>` (ni `AnnouncementBar` ni `Navbar`). Si hay perfil y es docente, resuelve `getCoursesByTeacher(profile.id)` y pasa `teacherCourses` al `Navbar`. `ThemeInit`, el fondo radial y `HeaderHeightObserver` se mantienen siempre montados. |
| `components/navbar/Navbar.tsx` | Pasa a ser el shell: logo, hamburguesa, contenedor desktop, drawer móvil, `UserMenu`. Elimina la rama anónima y el enlace *Grupo de Investigación* hardcodeado; consume `getStudentNavLinks()`/`getTeacherNavLinks()` vía `NavLinkList` e inserta `CourseScopeSelect` para docentes. Nueva prop `teacherCourses?: AcademicCourse[]`. |
| `components/navbar/UserMenu.tsx` | `misCursosHref` pasa a ser `string \| null \| undefined`; si es nulo, no renderiza *Mis cursos*, y `firstItemRef` se reubica al primer ítem realmente renderizado (*Mi cuenta*). |
| `components/HeaderHeightObserver.tsx` | Cuando no existe `[data-site-header]`, fija `--header-height: 0px` en vez de retornar sin definirla. |
| `app/(admin)/layout.tsx` | Elimina la tira de nav móvil (*Mis cursos*), ahora cubierta por el navbar de docente; conserva `requireAnyRole(["teacher","admin"])` y `<main>`. |
| `app/page.tsx` | Revisa y ajusta el `mt-19` del `<main>`, validado visualmente con el usuario en ambos estados de sesión. |
| `docs/specs/backlog.md` | Registra los hallazgos fuera de alcance detectados (clases crudas del navbar heredado, flash de `AnnouncementBar` por `localStorage`, ausencia de puntos de entrada a `/login` para anónimos). |

## Evaluación MCP

**¿Aplica MCP?** No.

- **¿Expone datos nuevos que un agente pueda consultar?** No. El único dato
  leído es la lista de cursos del docente vía `getCoursesByTeacher`,
  función server-only ya existente y ya consumida por `/admin/courses`. No
  se crea ninguna tabla, columna ni endpoint HTTP.
- **¿Habilita acciones nuevas ejecutables por un agente?** No. El spec solo
  produce navegación (`Link` / `router.push`); no hay mutaciones, ni Server
  Actions nuevas, ni cambios en las existentes (`signOut` se reutiliza tal
  cual).
- **¿Hay un MCP relacionado que deba extenderse?** No. `question-bank-mcp`,
  `assignment-mcp`, `attendance-mcp` y `students-mcp` operan sobre dominios
  de datos; ninguno se beneficia de saber cómo se pinta un navbar.
- **¿Algún system prompt de `docs/mcps/` cambia?** No. Ninguna capacidad de
  agente se altera, así que no se toca ningún archivo de `docs/mcps/`.

## Fases de implementación

### Fase 1 — Ocultar el header para visitantes anónimos
- [ ] En `app/layout.tsx`, calcular `const showHeader = Boolean(profile)` y
      envolver `<div data-site-header>` (con `AnnouncementBar` y `Navbar`
      dentro) en ese condicional; mantener fuera del condicional `ThemeInit`,
      el `Script` de tema, el fondo radial fijo y `HeaderHeightObserver`.
- [ ] En `components/HeaderHeightObserver.tsx`, cuando no exista
      `[data-site-header]`, fijar `--header-height` a `0px` de forma
      explícita antes de salir, en lugar de dejar la variable sin definir.
- [ ] Verificar en `/`, `/grupo-investigacion`, `/login` y `/registro` sin
      sesión: no aparece header, no queda franja de `AnnouncementBar`, no hay
      hueco superior anómalo y no hay solapamientos con el contenido.
- [ ] Verificar con sesión (estudiante y docente) que el header sigue
      apareciendo en esas mismas rutas y que la altura sticky de las
      lecciones (`--header-height`) sigue siendo correcta.

### Fase 2 — Reestructurar `components/navbar/`
- [ ] Crear `components/navbar/navLinks.ts` con el tipo `NavLink` y los dos
      constructores (`getStudentNavLinks()`, `getTeacherNavLinks(academicCourseId)`),
      con las rutas de la tabla de la sección "Rutas del navbar de docente"
      (ver Criterios de aceptación); los enlaces dependientes de curso se
      devuelven marcados como `disabled` cuando `academicCourseId` es `null`.
- [ ] Crear `components/navbar/NavLinkList.tsx`: renderiza `NavLink[]` con
      `variant "desktop" | "mobile"`; enlace activo con `Link`, enlace
      deshabilitado como elemento no focalizable con `aria-disabled="true"` y
      texto de ayuda explicativo; propaga el cierre del drawer en la
      variante móvil. Usar tokens semánticos del sistema de diseño en este
      componente nuevo.
- [ ] Refactorizar `components/navbar/Navbar.tsx`: eliminar la rama anónima
      (botón *Iniciar sesión* de desktop y de móvil) y el enlace *Grupo de
      Investigación* hardcodeado en ambos bloques; renderizar `NavLinkList`
      en el slot central de desktop y al inicio del drawer móvil; conservar
      logo, hamburguesa, `aria-controls`/`aria-expanded`, `closeMenu()` y el
      `UserMenu` de desktop.
- [ ] Ajustar el bloque de sesión del drawer móvil para mostrar nombre, *Mi
      cuenta* y *Cerrar sesión* sin la rama de *Iniciar sesión* (ya
      inalcanzable: sin perfil no hay navbar).
- [ ] En `components/navbar/UserMenu.tsx`, volver `misCursosHref` opcional y
      no renderizar el ítem *Mis cursos* cuando falte; reubicar
      `firstItemRef` al primer ítem realmente renderizado para preservar el
      foco inicial y el cierre con `Escape`.
- [ ] Comprobar con sesión de estudiante que el navbar muestra *Grupo de
      Investigación* + `UserMenu` con los tres ítems, en desktop y en móvil.

### Fase 3 — Navbar de docente y dropdown de curso
- [ ] En `app/layout.tsx`, tras resolver `roles`, calcular `isTeacher` y,
      solo en ese caso, `await getCoursesByTeacher(profile.id)`; pasar
      `teacherCourses` al `Navbar` (vacío/undefined para estudiantes).
- [ ] En `Navbar.tsx`, aceptar `teacherCourses?: AcademicCourse[]`, calcular
      `isTeacher` y elegir entre `getStudentNavLinks()` y
      `getTeacherNavLinks(scopedCourseId)`.
- [ ] Crear `components/navbar/CourseScopeSelect.tsx`: lee `useParams()` para
      obtener `academicCourseId`; si existe, ése es el curso en scope y el
      control lo muestra seleccionado; si no existe, muestra el placeholder
      *"Selecciona un curso"*. Al seleccionar un curso, navega preservando la
      sección actual (`grades`/`attendance`/`assignments`) si la hay,
      truncando subrutas más profundas (p. ej. `assignments/[groupId]` →
      `assignments`), o yendo a `/admin/courses/{id}` si no hay sección.
- [ ] Definir el estado vacío del dropdown: si `teacherCourses` está vacío,
      mostrar el control deshabilitado con texto *"Sin cursos"* y un
      enlace/CTA a `/admin/courses/new`, dejando *Calificaciones*,
      *Asistencia* y *Evaluaciones* deshabilitados.
- [ ] Renderizar `CourseScopeSelect` en el slot desktop y en el drawer móvil
      (mismo componente, sin duplicar markup), cerrando el drawer al
      navegar.
- [ ] Elevar el `academicCourseId` derivado hasta `Navbar` (o derivarlo
      también allí con `useParams()`) para que `getTeacherNavLinks` reciba
      el scope correcto y los enlaces dejen de estar deshabilitados al
      entrar a un curso.
- [ ] Accesibilidad del dropdown: `aria-haspopup`/`aria-expanded` si es menú
      custom (o `<label>` asociado si es `<select>` de Flowbite), cierre con
      `Escape`, cierre al clic fuera y foco devuelto al trigger — mismo
      patrón que ya implementa `UserMenu`.

### Fase 4 — Limpieza de navegación redundante y ajuste de landing
- [ ] Eliminar la tira de nav móvil (*Mis cursos*) de
      `app/(admin)/layout.tsx`, dejando intactos
      `requireAnyRole(["teacher","admin"])` y el `<main>`.
- [ ] Revisar si alguna página admin dependía visualmente del borde
      inferior de esa tira para separarse del header y, si hace falta,
      ajustar solo el espaciado del `<main>`.
- [ ] Revisar el `mt-19` del `<main>` de `app/page.tsx`: validar visualmente
      con el usuario los dos estados (anónimo sin header, autenticado con
      header) y ajustar el valor para evitar el hueco vacío sin introducir
      layout shift para usuarios autenticados.
- [ ] Registrar en `docs/specs/backlog.md` los hallazgos fuera de alcance
      detectados (clases crudas del navbar heredado, `AnnouncementBar` con
      `localStorage` en el primer render, ausencia de puntos de entrada a
      `/login` para anónimos — aceptada como decisión de este spec, no como
      deuda a resolver).

### Fase 5 — Pruebas
- [ ] Ejecutar `npm run lint` y `npm run build`.
- [ ] Cambiar el estado del spec a `[TESTING]`.
- [ ] Acompañar al usuario en la ronda de
      `docs/testing/test-028-navbar-por-rol.md` (anónimo, estudiante,
      docente; desktop y móvil; modo claro y oscuro).
- [ ] Registrar hallazgos caso por caso y cerrar el resumen de la ronda.
      Confirmar con el usuario si se reutiliza una cuenta docente existente
      con ≥2 cursos activos y una cuenta de estudiante existente, o si se
      crean nuevas vía API; limpiar al cierre en el segundo caso.
- [ ] No hay pruebas automáticas: el framework sigue por definir (ver
      CLAUDE.md → Testing) y el 100% del spec es UI.

## Criterios de aceptación

- Un visitante sin sesión no ve navbar ni barra de anuncio en `/`,
  `/grupo-investigacion`, `/login` ni `/registro`, ni en ninguna otra ruta
  pública.
- Con sesión iniciada, el navbar aparece en todas las rutas, incluidas
  `/login` y `/registro`.
- Un estudiante autenticado ve, en desktop y en móvil: *Grupo de
  Investigación* y el `UserMenu` con *Mis cursos* → `/cuenta/cursos`, *Mi
  cuenta* → `/cuenta` y *Cerrar sesión* funcional.
- Un docente (`teacher` o `admin`) ve *Mis cursos*, *Calificaciones*,
  *Asistencia*, *Evaluaciones*, *Grupo de Investigación* y el dropdown de
  curso académico, en desktop y en móvil.
- Rutas exactas del navbar de docente:

  | Etiqueta | Destino | Estado sin curso en scope |
  |---|---|---|
  | Mis cursos | `/admin/courses` | Siempre activo |
  | Calificaciones | `/admin/courses/{academicCourseId}/grades` | Deshabilitado |
  | Asistencia | `/admin/courses/{academicCourseId}/attendance` | Deshabilitado |
  | Evaluaciones | `/admin/courses/{academicCourseId}/assignments` | Deshabilitado |

- Estando en `/admin/courses` (sin curso en scope), el dropdown muestra
  *"Selecciona un curso"* y *Calificaciones/Asistencia/Evaluaciones*
  aparecen deshabilitados y no navegan; *Mis cursos* sí funciona.
- Estando en `/admin/courses/{id}/…`, el dropdown muestra ese curso
  seleccionado y los tres enlaces navegan a `/admin/courses/{id}/grades`,
  `/attendance` y `/assignments` respectivamente.
- Cambiar de curso en el dropdown desde `/admin/courses/A/grades` lleva a
  `/admin/courses/B/grades`; desde una ruta sin scope de curso lleva a
  `/admin/courses/B`.
- El dropdown solo lista cursos cuyo `teacher_id` es el docente autenticado;
  si no tiene cursos, se muestra deshabilitado con acceso a *Nuevo curso*.
- El menú móvil abre y cierra correctamente, y cualquier navegación desde él
  cierra el drawer.
- El `UserMenu` de un docente no muestra *Mis cursos* (está en la barra) y
  su navegación por teclado (foco inicial, `Escape`, clic fuera) sigue
  funcionando.
- La altura del header sticky en las páginas de lección sigue siendo
  correcta; sin header, `--header-height` vale `0px`.
- El hueco vacío sobre el contenido de la landing para visitantes anónimos
  queda resuelto o reducido a un ajuste aceptado visualmente por el usuario.
- `npm run lint` y `npm run build` pasan sin errores; ningún archivo de
  `docs/mcps/` fue modificado.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-028-navbar-por-rol.md` — casos `TC-028-xxx`.
- **Automáticas (e2e/unit):** no aplica; framework por definir (ver
  CLAUDE.md → Testing). El spec es 100% UI y su cobertura es manual.

## Riesgos y mitigaciones

- **`HeaderHeightObserver` asume que el header existe.** Verificado: si no
  encuentra `[data-site-header]` retorna sin definir `--header-height`, y el
  único consumidor cae al fallback `6rem`, restando 96px inexistentes.
  Mitigación: fijar `0px` explícitamente (Fase 1). Riesgo residual bajo: las
  lecciones exigen matrícula, así que hoy siempre hay sesión y header en esa
  ruta.
- **Hueco muerto y layout shift en la landing.** `app/page.tsx` tiene
  `mt-19` en su `<main>`, offset manual que probablemente ya duplica el
  espacio del header (que es `sticky` pero ocupa espacio en flujo). Sin
  header para anónimos, se convierte en un vacío visible. Mitigación:
  ajustarlo en Fase 4 validando visualmente con el usuario ambos estados,
  nunca cambiarlo sin esa verificación.
- **Flicker o salto por render condicional del header.** El condicional vive
  en un Server Component, así que el HTML llega ya sin header: no hay flash
  de navbar apareciendo/desapareciendo. El único flash restante es el de
  `AnnouncementBar` (visibilidad inicial desde `localStorage`), que este
  spec no arregla pero cuya superficie reduce al dejar de montarse en
  páginas públicas. Se registra en backlog, no se aborda aquí.
- **Query extra en el root layout para el dropdown de docente.**
  `getCoursesByTeacher` se ejecutaría en cada request de un docente.
  Mitigación: invocarla solo si `isTeacher`; la tabla es pequeña y se filtra
  por `teacher_id`. Si el volumen crece, la evolución natural es un `cache()`
  alrededor del helper, análogo a `getCurrentProfile` — no se hace ahora
  para evitar sobre-ingeniería.
- **El drawer móvil asume una altura fija de header.** `Navbar.tsx` usa
  `fixed inset-0 top-16`; si el navbar de docente crece de alto (4 enlaces +
  dropdown), el drawer puede desalinearse respecto al header real.
  Mitigación: verificar el borde superior del drawer al probar el navbar de
  docente en móvil; si desencaja, sustituir `top-16` por
  `top-[var(--header-height,4rem)]`.
- **Regresión de accesibilidad en `UserMenu`.** `firstItemRef` está atado
  hoy a *Mis cursos*, que desaparece para docentes; si no se reubica, el
  foco inicial del menú deja de moverse al abrir. Mitigación: paso
  explícito en Fase 2 y caso de prueba manual con navegación por teclado
  para ambos roles.
- **Sin cobertura automática.** Todo el spec es UI y no hay framework de
  testing. Mitigación: `docs/testing/test-028-navbar-por-rol.md` cubre la
  matriz completa — 3 estados de sesión (anónimo/estudiante/docente) × 2
  viewports (desktop/móvil) × modo claro y oscuro, más los casos de curso en
  scope, sin scope, cambio de curso y docente sin cursos.
- **Acceso a `/login` para anónimos.** Decisión explícita del usuario:
  aceptar que, sin navbar, el único acceso sea por URL directa o por el gate
  de matrícula. No se agregan enlaces nuevos en este spec.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-29
