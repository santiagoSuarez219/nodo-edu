# spec-031 — [TESTING] Vista docente en la página de lección

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Hoy, cuando el docente dueño de un curso (`access.reason === "owner"`, o `"admin"`) abre la página pública de una lección (`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`), ve exactamente lo mismo que un estudiante sin matrícula: el artículo y nada más. El bloque de cierre pedagógico (autoevaluación, asistencia, botón "Completar lección") está condicionado a `access.reason === "enrolled"` (líneas 74-78 y 99-121 de esa página), así que el docente nunca lo ve.

Para dictar una clase o un laboratorio, el docente hoy necesita:
- Abrir en paralelo `/admin/courses/<academicCourseId>/attendance` para generar el código de asistencia.
- Consultar el banco de preguntas por separado para recordar cuál es la respuesta correcta de cada pregunta de la autoevaluación de cierre.

Este spec unifica ambas necesidades **dentro de la misma vista de lección**, sin salir de la ruta pública, condicionado a que `access.reason` sea `"owner"` o `"admin"`.

## Alcance

**Incluye:**
- Una función de lectura nueva que trae las preguntas `multiple_choice` publicadas de la lección **con `is_correct`**, solo accesible para owner/admin de ese curso.
- Un panel docente embebido en la página de lección (y en las guías de laboratorio) con dos bloques:
  - **Clave de respuestas:** las preguntas de la autoevaluación de cierre, en el mismo orden que las ve el estudiante, con un toggle (por pregunta y global) que revela/oculta la(s) opción(es) correcta(s). Sin formulario, sin envío, sin feedback de acierto — es una referencia de lectura para el docente, no un flujo de respuesta.
  - **Control de asistencia:** generar/abrir una sesión de asistencia de esa clase, ver su código y el conteo de asistentes en vivo, y cerrarla — reutilizando la lógica ya existente en `lib/attendance/index.ts` y el componente `AdminAttendancePanel`, sin duplicarlos.
- Resolución del curso académico a partir del `course_slug` de la lección, con selector explícito cuando el docente tiene más de un curso académico activo con el mismo slug (ej. dos grupos/semestres).
- El panel también se muestra en guías de laboratorio (`isGuideNode`), mostrando solo el control de asistencia (las guías no tienen preguntas de autoevaluación).

**No incluye:**
- Ver qué respondió cada estudiante en la autoevaluación. El docente solo ve la clave de respuestas, nunca los intentos individuales (`self_assessment_attempts`). No se modifica ninguna política RLS de esa tabla.
- Ninguna migración de base de datos: todo el acceso necesario ya está cubierto por RLS existente (ver "Evaluación MCP" y Fase 1/2 más abajo).
- Ninguna subruta nueva bajo `/admin`. La vista vive en la ruta pública de lección.
- Editar preguntas o su contenido desde la lección.
- Herramientas de escritura en `attendance-mcp` (sigue siendo de solo lectura, ver Decisión 9 de spec-010).
- Sustituir `/admin/courses/<id>/attendance`, que sigue existiendo sin cambios.

## Impacto en el sistema

| Archivo | Acción |
|---|---|
| `lib/self-assessment/types.ts` | Modificar — nuevos tipos `AnswerKeyChoice`, `AnswerKeyQuestion` |
| `lib/self-assessment/index.ts` | Modificar — nueva función `getAnswerKeyForLesson` |
| `lib/academic-courses/index.ts` | Modificar — nueva función `resolveAcademicCoursesBySlug` |
| `components/courses/QuestionStem.tsx` | Crear — presentacional compartido (enunciado + topic + code_snippet) |
| `components/courses/SelfAssessmentSection.tsx` | Modificar — consumir `QuestionStem` en vez de su markup inline |
| `components/courses/TeacherAnswerKey.tsx` | Crear — client island, clave de respuestas con toggles |
| `components/courses/TeacherAttendanceControl.tsx` | Crear — client island, selector de grupo + monta `AdminAttendancePanel` |
| `components/courses/TeacherLessonPanel.tsx` | Crear — server component contenedor |
| `components/admin/AdminAttendancePanel.tsx` | Sin cambios — se reutiliza tal cual |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Modificar — rama condicional nueva para owner/admin, sin tocar la de `enrolled` |
| `lib/attendance/index.ts` | Sin cambios |
| `lib/enrollments/access.ts` | Sin cambios |
| `supabase/migrations/` | Sin cambios |
| `docs/specs/backlog.md` | Modificar — registrar deuda técnica identificada (ver Fase 4) |

## Evaluación MCP

**¿Aplica MCP?** No.

- **¿Expone datos que un agente podría necesitar consultar?** Los datos que muestra esta vista ya son accesibles para agentes por canales existentes: la clave de respuestas vía `question-bank-mcp` (`get_question`/`list_questions` ya devuelven las opciones con su corrección), y el estado de asistencia vía `attendance-mcp` (`list_sessions`, `get_session_attendance`). Este spec no crea información nueva, solo la compone en una vista de aula para el docente humano.
- **¿Permite acciones que un agente debería poder ejecutar?** Abrir/cerrar una sesión de asistencia es un acto presencial del docente frente al grupo: el código expira en 15 minutos y su valor depende de dictarse en voz alta en ese momento. Exponer esta acción a un agente no aporta valor y amplía la superficie de fraude. Esto ratifica la Decisión 9 de spec-010 (`attendance-mcp` de solo lectura por diseño) — este spec no la revierte.
- **¿Ya existe un MCP que cubre un dominio relacionado?** Sí (`attendance-mcp`, `question-bank-mcp`), y ninguno requiere cambios.
- **¿Hay un agente definido en `docs/mcps/` que se beneficiaría?** No: ningún system prompt cambia con este spec.

No se crean ni modifican MCPs. No se toca `docs/mcps/README.md` ni ningún system prompt.

## Fases de implementación

### Fase 1 — Lectura de la clave de respuestas (datos)
- [x] En `lib/self-assessment/types.ts`, añadir `AnswerKeyChoice` (= `SelfAssessmentChoice` + `is_correct: boolean`) y `AnswerKeyQuestion` (mismos campos que `SelfAssessmentQuestion` pero con `choices: AnswerKeyChoice[]`). No modificar `SelfAssessmentQuestion`: sigue siendo el contrato sanitizado del estudiante.
- [x] En `lib/self-assessment/index.ts`, añadir `getAnswerKeyForLesson(courseSlug, lessonSlug): Promise<AnswerKeyQuestion[]>`: mismo `select`, mismos filtros (`type = 'multiple_choice'`, `is_published = true`, `course_slug`, `lesson_slug`) y mismo `order('created_at')` que `getSelfAssessmentForLesson` — el orden debe coincidir exactamente con el que ve el estudiante. Único cambio: propagar `is_correct` en vez de descartarlo. Mismo manejo de error (`catch` → log → `[]`).
- [x] La función debe llamar a `hasCourseAccess(courseSlug)` internamente y devolver `[]` si `!access.ok` o si `access.reason` no es `"owner"` ni `"admin"` — este gate vive en la función, no solo en la página, para que invocarla directamente como Server Action no filtre `is_correct` a un estudiante.

### Fase 2 — Resolución del curso académico desde el slug
- [x] En `lib/academic-courses/index.ts`, añadir `resolveAcademicCoursesBySlug(courseSlug, access): Promise<AcademicCourse[]>`. Filtra por `course_slug = courseSlug` y `is_active = true`; si `access.reason === "owner"` filtra además por `teacher_id` del usuario actual; si `access.reason === "admin"` no filtra por `teacher_id` (un admin puede no ser el dueño del curso). Devuelve la lista completa ordenada por `name` — el desempate entre varios cursos con el mismo slug es responsabilidad de la UI (Fase 3), no de esta función.
- [x] No modificar el RPC `get_student_session_status`: su `limit 1` sigue siendo correcto para el flujo de estudiante, que además filtra por matrícula activa.

### Fase 3 — Componentes de la vista docente
- [x] Leer `DESIGN.md` completo y las skills `frontend-design` y `tailwind-css-patterns` antes de escribir cualquier markup de esta fase.
- [x] Crear `components/courses/QuestionStem.tsx` (presentacional, sin estado): extrae el markup de enunciado/topic/code_snippet que hoy vive inline en `SelfAssessmentSection.tsx`. Modificar `SelfAssessmentSection.tsx` para consumirlo — cambio quirúrgico, sin tocar el resto del flujo de envío/corrección del estudiante.
- [x] Crear `components/courses/TeacherAnswerKey.tsx` (`'use client'`): recibe `questions: AnswerKeyQuestion[]`; estado local de qué preguntas están reveladas; toggle global "Revelar todas / Ocultar todas" + toggle por pregunta; opciones en modo lectura (sin inputs) que resaltan las correctas al revelar, con los mismos tokens semánticos que usa hoy el feedback correcto de `SelfAssessmentSection`; indicar explícitamente cuando una pregunta admite varias respuestas correctas. Estado inicial: todo oculto (el docente puede estar proyectando la pantalla en clase).
- [x] Crear `components/courses/TeacherAttendanceControl.tsx` (`'use client'`): recibe la lista de cursos académicos resueltos y su sesión abierta (si la hay). Si hay 0 cursos, mostrar mensaje explicativo (el `course_slug` no está vinculado a ningún curso académico activo). Si hay 1, montar `AdminAttendancePanel` directamente. Si hay más de 1, mostrar un `<select>` de grupo antes de montar el panel, persistiendo la elección en `localStorage` por `courseSlug`. Reutilizar `AdminAttendancePanel` tal cual — si la densidad visual no encaja en la lección, añadirle un prop opcional de variante en vez de duplicar el archivo.
- [x] Crear `components/courses/TeacherLessonPanel.tsx` (server component): compone `TeacherAnswerKey` (si hay preguntas) y `TeacherAttendanceControl`, con un encabezado que identifique claramente la vista como exclusiva del docente.

### Fase 4 — Semántica de la sesión de asistencia (por curso, no por lección)
- [x] Confirmar y documentar en el copy de `TeacherAttendanceControl` que la sesión de asistencia pertenece al curso académico y al día, no a la lección específica: `class_sessions` no tiene `lesson_slug`, y el índice único parcial impone una sola sesión abierta por curso. Si el docente ya tiene una sesión abierta desde otra lección del mismo curso, debe verse activa (con su código y conteo) también desde esta lección — comportamiento ya cubierto por `getOpenSessionForCourse`, sin código nuevo.
- [x] Verificar que el mensaje de error de `openSession` ante colisión de sesión abierta ("Ya hay una sesión de asistencia abierta en este curso") llega correctamente a la UI embebida en la lección.
- [x] No modificar `lib/attendance/index.ts` — los `revalidatePath` existentes hacia rutas `/admin/...` son inocuos quando se invoca desde la lección (el panel refresca por estado local), y tocar ese archivo arriesgaría la ruta admin ya `[DONE]`.
- [x] Registrar en `docs/specs/backlog.md` como deuda técnica fuera de alcance: `AdminAttendancePanel` usa `alert()`/`confirm()` nativos, aceptables en el panel admin pero pobres si se proyectan en clase — no se corrige en este spec.

### Fase 5 — Integración en la página de lección y guías
- [x] En `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, no tocar el bloque `enrolled` existente (ni el condicional ni su render). Añadir un bloque nuevo, en paralelo, guardado por `access.ok && (access.reason === "owner" || access.reason === "admin")`, que resuelva `getAnswerKeyForLesson` y `resolveAcademicCoursesBySlug` + `getOpenSessionForCourse` por cada curso resuelto (en paralelo con `Promise.all` donde sea independiente).
- [x] Renderizar `<TeacherLessonPanel />` en la misma posición que ocupa `LessonClosureFlow` para el estudiante (entre `<LessonArticle>` y `<LessonPagination>`). Las ramas `enrolled` y `owner`/`admin` son mutuamente excluyentes por construcción.
- [x] Extender esta misma rama a las guías de laboratorio (`isGuideNode`): en ese caso `getAnswerKeyForLesson` devuelve `[]` (no hay preguntas), así que `TeacherLessonPanel` omite el bloque de clave de respuestas y muestra solo el control de asistencia.
- [x] No modificar el comportamiento de `markLessonViewed` para el docente — sigue llamándose igual que hoy; es ruido inocuo, se registra como nota en backlog si aplica, sin actuar.

### Fase 6 — Pruebas
- [x] Ejecutar los casos manuales de `docs/testing/test-031-vista-docente-leccion.md`. **Resultado: 20/20 aprobados** (ronda del 2026-07-30). Datos de prueba limpiados y verificados; ver tabla "Datos de prueba" del archivo de test.
- [ ] Pruebas automáticas: pendientes del framework de testing (ver CLAUDE.md → "Testing"); los criterios de aceptación quedan descritos abajo y el archivo `e2e-031-vista-docente-leccion.spec.ts` se crea cuando exista el framework.
- [ ] Invocar `@reviewer` antes de marcar el spec como `[DONE]` — **pendiente:** el subagente `@reviewer` no está disponible en esta sesión; queda para cuando se pueda invocar.

**Nota de implementación:** `npx tsc --noEmit`, `npm run build` y `npm run lint`
pasan sin errores nuevos (los 5 errores de `no-html-link-for-pages` en
`AcademicCourseList.tsx` son deuda preexistente, ver `DEBT-013` en
`docs/specs/backlog.md`, ajena a este spec). Fases 1-5 completas. Durante la
ronda de pruebas manuales se corrigió además un bug de hidratación en
`TeacherAttendanceControl` (lectura de `localStorage` en el inicializador de
`useState`, ejecutada también en SSR) y se detectó `DEBT-019` (parpadeo
preexistente de "Cerrar sesión" en `AdminAttendancePanel`, fuera de alcance).
Queda pendiente únicamente la revisión de `@reviewer` antes de pasar a
`[DONE]`.

## Criterios de aceptación

**Clave de respuestas**
1. El docente dueño del curso, al abrir una lección con autoevaluación publicada, ve todas sus preguntas en el mismo orden en que las ve el estudiante.
2. Las respuestas correctas están ocultas al cargar la página.
3. El toggle por pregunta revela y vuelve a ocultar la(s) opción(es) correcta(s) de esa pregunta, sin afectar a las demás.
4. El toggle global revela y oculta todas a la vez.
5. En preguntas con más de una respuesta correcta se indica explícitamente que admiten varias, y al revelar se resaltan todas.
6. La vista del docente no muestra formulario, botón de envío ni feedback de acierto: no hay nada que responder.
7. El docente no ve, en ningún punto, qué respondió ningún estudiante.
8. Un usuario `enrolled` que invoque directamente la Server Action `getAnswerKeyForLesson` recibe `[]`, nunca `is_correct`.
9. Un usuario `enrolled` sigue viendo exactamente el flujo actual de autoevaluación, sin cambio alguno.

**Asistencia**
10. El docente dueño puede abrir una sesión de asistencia desde la página de lección y ve el código generado y su cuenta atrás.
11. El conteo de asistentes se actualiza sin recargar la página mientras la sesión está abierta.
12. El docente puede cerrar la sesión desde la misma vista.
13. Si ya hay una sesión abierta del curso —aunque se abriera desde otra lección—, al entrar a esta lección se muestra activa, con su código y conteo, no un botón de abrir.
14. Si el docente tiene más de un curso académico activo con el mismo `course_slug`, puede elegir el grupo antes de abrir la sesión, y la sesión se abre en el grupo elegido.
15. La elección de grupo persiste al recargar la página (misma lección, mismo curso).
16. Si el `course_slug` no corresponde a ningún curso académico activo, se muestra un mensaje explicativo en vez de un panel roto.
17. Un estudiante marca asistencia con el código generado desde la lección igual que con uno generado desde `/admin`.

**Guías de laboratorio**
18. En una guía de laboratorio, el docente ve el control de asistencia pero no ve bloque de clave de respuestas.

**Aislamiento**
19. Un usuario `admin` que no es el docente del curso ve el panel completo.
20. Un usuario `enrolled` no ve el panel docente en ninguna forma.
21. La ruta `/admin/courses/<id>/attendance` sigue funcionando sin cambios y refleja la sesión abierta desde la lección.
22. No se aplicó ninguna migración de base de datos.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-031-vista-docente-leccion.md` — casos `TC-001` a `TC-020`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-031-vista-docente-leccion.spec.ts` — un caso por criterio de aceptación, en rojo desde el inicio (cuando exista framework).

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-30
