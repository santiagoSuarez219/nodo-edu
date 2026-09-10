# spec-055 — [TESTING] Acceso a las evaluaciones desde el detalle de matrícula del estudiante

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.
>
> Resuelve **[[DEBT-084]]**. Plan técnico elaborado con `@architect` (2026-09-10).

## Contexto

Un estudiante matriculado **no tiene ningún camino de UI para llegar a sus
evaluaciones calificables**. Las rutas existen y funcionan desde `spec-019`
(**[DONE]**):

- `app/cuenta/cursos/[enrollmentId]/evaluaciones/page.tsx` — listado
- `.../evaluaciones/[groupId]/page.tsx` — resolución (sorteo de variante, jugador)
- `.../evaluaciones/[groupId]/resultados/page.tsx` — resultado del intento

Pero **nada enlaza a ellas**. La página de detalle de matrícula,
`app/cuenta/cursos/[enrollmentId]/page.tsx`, renderiza `EnrollmentDetail`
(información del curso y calificaciones) y `SelfAssessmentSummaryCard`, y su
único `<Link>` es "Mis cursos", de vuelta al listado (`page.tsx:66-74`).
Tampoco hay otro punto de entrada: la navbar (`components/navbar/navLinks.ts`)
solo tiene "Mis cursos" y "Grupo de Investigación", el listado
`/cuenta/cursos` (`components/account/EnrolledCourseList.tsx`) enlaza al
contenido y al detalle, y ninguna vista de curso o lección menciona
evaluaciones.

### Cómo se detectó

Al previsualizar como estudiante el quiz A/B/C de Estructuras de Datos en
desarrollo (2026-09-10), la indicación "entrá al curso y buscá la sección de
evaluaciones" no llevaba a ningún lado. Antes de concluir que era un problema
de navegación se descartaron las causas de datos, verificadas contra la base:
matrícula `active`, grupo `is_published` dentro de su ventana, 30 preguntas
publicadas, y RLS `student_sees_published_groups` correcta. **La URL directa
funciona**; lo que falta es exclusivamente el enlace.

### Por qué no alcanza con compartir la URL

La ruta lleva el `enrollmentId` de cada estudiante
(`/cuenta/cursos/<enrollmentId>/evaluaciones`), así que **no existe una URL
común** que el docente pueda enviar a todo el curso. Cada estudiante tendría
que construir la suya a mano.

### Impacto real

El quiz "Clases, objetos y relaciones entre clases" abre en producción el
**viernes 2026-09-11 a las 9:50** (hora Colombia) para **44 estudiantes
matriculados** en "Estructuras de datos", y hoy ninguno tiene un camino de UI
para encontrarlo.

> **Este spec no llega a tiempo para ese quiz.** El flujo de CLAUDE.md
> (aprobación → implementación → pruebas manuales → `[DONE]` → despliegue)
> no cabe antes de mañana a las 9:50. La mitigación inmediata queda fuera del
> spec y la decide el docente (ver "Mitigación para el quiz del 2026-09-11").

## Alcance

### Incluye

- Una **tarjeta de acceso "Evaluaciones"** en la página de detalle de
  matrícula, visible solo para matrículas `active` con al menos una
  evaluación publicada y dentro de ventana.
- Un **helper de dominio** en `lib/assignments/` que centraliza el criterio
  "evaluaciones abiertas para esta matrícula", usado **tanto** por la tarjeta
  como por el listado, para que el conteo y el listado no puedan divergir.
- Corregir que el listado **confunda un fallo de consulta con "no hay
  evaluaciones"**: hoy descarta el error de Supabase (`const { data: groups }`)
  y muestra el mensaje de vacío. Entra porque el helper devuelve la unión
  `ok | unavailable` y colapsarla otra vez reintroduciría [[DEBT-040]] en
  código nuevo.

### No incluye

- **Volver a los resultados después del cierre de la ventana.** Hoy es
  imposible con o sin UI: `_getStudentAssignmentForActor` descarta el grupo si
  `closes_at <= now` (`lib/assignments/index.ts:157`) y `resultados/page.tsx`
  hace `notFound()` con eso. Es un problema **anterior e independiente** de
  este bug, y hace inalcanzable `show_feedback_on = "close"`. Registrado como
  **[[DEBT-085]]**. Cuando se resuelva, la regla de
  visibilidad de este spec (D2) deberá ampliarse para contar también esas
  evaluaciones.
- Anunciar evaluaciones **próximas** (publicadas con `opens_at` futuro): el
  listado no las muestra y el jugador da 404, así que anunciarlas crearía otra
  inconsistencia. Registrado como **[[DEBT-086]]**.
- Acceso desde la navbar, la vista de lección o el listado `/cuenta/cursos`
  (justificado en D1).
- Mostrar la fecha de cierre en la tarjeta.
- Cambios de esquema, RLS, API o MCP.

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/assignments/types.ts` | Nuevo tipo `OpenAssignmentGroupsResult` |
| `lib/assignments/index.ts` | Nuevas `_getOpenGroupsByAcademicCourseForActor` (actor) y `getOpenAssignmentGroupsForStudent` (sesión) |
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/page.tsx` | Reemplaza la consulta inline por el helper; `ErrorState` ante `unavailable` |
| `components/account/AssignmentsAccessCard.tsx` | **Nuevo** — tarjeta de acceso |
| `app/cuenta/cursos/[enrollmentId]/page.tsx` | Suma la consulta al `Promise.all` existente y renderiza la tarjeta |
| `docs/specs/backlog.md` | Marca DEBT-084 como resuelto (la deuda detectada ya quedó registrada: DEBT-085 a DEBT-090) |

**No se tocan:** `EnrollmentDetail.tsx`, `EnrolledCourseList.tsx`,
`navLinks.ts`, las rutas del jugador y de resultados, `lib/submissions/*`,
`supabase/migrations/*`.

## Evaluación MCP

**¿Aplica MCP?** No.

- **No expone datos nuevos:** el helper lee exactamente lo que ya lee el
  listado, bajo la RLS del propio estudiante.
- **No habilita acciones nuevas** ni toca endpoints `/api/*`.
- **El lado docente ya está cubierto:** `assignment-mcp` gestiona los grupos,
  y su herramienta `get_variant_allocations` ya permite comprobar, después del
  despliegue, que los estudiantes están entrando a una evaluación.
- No cambia ningún system prompt de `docs/mcps/`.

## Decisiones de diseño

### D1 — Punto de entrada: solo la página de detalle de matrícula

La tarjeta va en `app/cuenta/cursos/[enrollmentId]/page.tsx`, **entre el
encabezado y `EnrollmentDetail`**. Es la única vista que tiene el
`enrollmentId` que exige la ruta, y el camino queda en dos clics (Mis cursos →
curso → Evaluaciones). Va arriba porque es lo único de la página con urgencia
y acción; lo demás es consulta.

| Alternativa descartada | Por qué |
|---|---|
| Navbar | Es global y un estudiante puede tener varias matrículas: no hay a qué `enrollmentId` apuntar sin agregar un selector |
| Vista de curso o lección | Resuelve por `course_slug`, y varios grupos académicos comparten slug (los fixtures "Test-054 Curso A" y "Curso B" son ambos `analisis-de-algoritmos`): resolver la matrícula ahí es ambiguo |
| Contador en `/cuenta/cursos` | Suma una consulta por matrícula; queda como mejora futura |
| Dentro de `EnrollmentDetail` | Es un componente de presentación sin consultas; darle una prop de conteo lo acopla a evaluaciones |

### D2 — Visibilidad: matrícula activa con al menos una evaluación abierta

La tarjeta se muestra si `enrollment.status === "active"` **y** hay al menos
un grupo visible con el **mismo criterio que el listado** (publicado,
`opens_at` nulo o pasado, `closes_at` nulo o futuro). También se muestra, en
versión genérica, si la consulta falla (D4).

| Alternativa descartada | Por qué |
|---|---|
| Mostrarla siempre | Sería un enlace a "No hay evaluaciones disponibles por ahora" casi todo el semestre |
| Incluir evaluaciones cerradas ya respondidas | Llevarían a un listado que no las muestra y a un `resultados` que da 404: un enlace muerto. Ver [[DEBT-085]] |
| Tarjeta "Sin evaluaciones abiertas" sin enlace | Ruido permanente que no aporta |

**Matrícula retirada:** se decide con `enrollment.status` **antes** de
consultar. No se consulta y no se muestra la tarjeta, sin depender de la RLS
para una decisión de UI. (La página de detalle hoy no rechaza `withdrawn`,
`page.tsx:29`; eso queda como está — [[DEBT-089]].)

### D3 — Un helper de dominio compartido

Se extrae la consulta a `lib/assignments/index.ts`, siguiendo el patrón
existente de contexto de actor más envoltorio de sesión:

- `_getOpenGroupsByAcademicCourseForActor(context, academicCourseId, now)` —
  mismos filtros y mismo orden (`created_at desc`) que el listado actual; lanza
  ante error, como `_getGroupsByAcademicCourseForActor`.
- `getOpenAssignmentGroupsForStudent(academicCourseId): Promise<OpenAssignmentGroupsResult>`
  — envoltorio público que **nunca lanza**.

```ts
type OpenAssignmentGroupsResult =
  | { status: "ok"; groups: AssignmentVariantGroup[] }
  | { status: "unavailable" };
```

Mismo contrato que `DisabledLessonsResult` (`lib/courses/availability.ts:10-12`).
El envoltorio:

- usa `cache()` de React, como `getDisabledLessonSlugs`;
- obtiene el usuario con `getCurrentUser()` (ya cacheado por request) y **no**
  con `supabase.auth.getUser()`, para no sumar otra ida y vuelta a Auth;
- crea el cliente Supabase **dentro** del `try` ([[DEBT-041]]).

Una sola función que devuelve filas, y no una variante que solo cuenta: dos
funciones con el mismo filtro es justo la divergencia que se quiere evitar. El
costo es mínimo — pocas filas por curso y la consulta usa el índice
`(academic_course_id, is_published)`.

| Alternativa descartada | Por qué |
|---|---|
| Reutilizar `getActiveAssignmentsByEnrollment` | Solo devuelve grupos con allocation ya existente — el listado saldría vacío para quien nunca abrió una — y hace N+1 |
| Ponerlo en `lib/assignments/service.ts` | Usa `service_role` y saltaría la RLS del estudiante |
| `"use cache"` de Next 16 | El resultado depende del usuario (RLS) y de la hora |

### D4 — Sin waterfalls nuevos; ante un fallo, el enlace se muestra igual

**Costo:** la consulta necesita `academic_course_id` y `status`, que salen del
primer `Promise.all` (`page.tsx:24-27`). Va en el **segundo** `Promise.all`
(`page.tsx:35-40`), en paralelo con progreso y lecciones deshabilitadas. **No**
se condiciona a `course`: un grupo académico sin `course_slug` puede tener
evaluaciones.

**Fallo:** ante `unavailable`, la tarjeta se muestra en versión **genérica, sin
conteo**. Mismo razonamiento que el comentario de spec-039 en esa página ("esta
pantalla es de lectura, no el gate real") y que spec-054: la excepción es de
**navegación**, no de **autorización**. Los controles reales siguen en las
rutas y en la RLS.

| Alternativa descartada | Por qué |
|---|---|
| Ocultar la tarjeta ante un fallo | Esconder el enlace justo cuando Supabase va lento reproduce el bug el día del examen. Mostrarlo de más solo lleva a un listado que informa su propio estado |
| Propagar la excepción a `app/error.tsx` | Tumbaría notas y autoevaluación por un dato secundario |

### D5 — El listado distingue un fallo de "no hay evaluaciones"

Al migrar `evaluaciones/page.tsx` al helper, `unavailable` se renderiza con
`ErrorState` e `INFRA_ERROR_COPY` (`components/ErrorState.tsx`), **no** con
"No hay evaluaciones disponibles por ahora".

### D6 — UI: componente `AssignmentsAccessCard`

- **Archivo:** `components/account/AssignmentsAccessCard.tsx`, Server
  Component.
- **Props:** `{ enrollmentId: string; openCount: number | null }` — `null`
  significa "no se pudo contar" (D4).
- **Estructura:** la tarjeta completa es un `<Link>` a
  `/cuenta/cursos/${enrollmentId}/evaluaciones`, con el mismo patrón visual que
  las tarjetas hermanas de la página: fondo y borde de card, `rounded-[var(--radius-base)]`,
  `px-6 py-5`.
- **Contenido:**
  - Título "Evaluaciones", con el estilo de los `h2` de las tarjetas hermanas.
  - Texto "Tienes 1 evaluación abierta" / "Tienes N evaluaciones abiertas".
    En versión genérica: "Consulta las evaluaciones de este curso". La UI
    existente tutea ("Consulta tus cursos").
  - Badge con el conteo, estilo **Badge info** de `DESIGN.md`
    (`bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`).
  - Chevron decorativo con `aria-hidden="true"`.
- **Tema:** tokens semánticos donde existan, más las variantes `dark:` de la
  tabla claro/oscuro de `DESIGN.md`, igual que las tarjetas hermanas.
- **Flowbite:** no está instalado ([[DEBT-036]]); el patrón de card se escribe
  con Tailwind. **No se agregan dependencias.**
- **Accesibilidad:**
  - El nombre accesible sale del texto visible — **sin `aria-label`** que lo
    reemplace (WCAG 2.5.3, "etiqueta en el nombre").
  - Foco visible: `focus-visible:ring-2` con los colores de foco de `DESIGN.md`
    en claro y oscuro.

## Fases de implementación

### Fase 1 — Capa de dominio
- [x] `lib/assignments/types.ts`: agregar `OpenAssignmentGroupsResult`.
- [x] `lib/assignments/index.ts`: agregar `_getOpenGroupsByAcademicCourseForActor`
      con los filtros exactos del listado actual y un único `now` por llamada.
- [x] `lib/assignments/index.ts`: agregar `getOpenAssignmentGroupsForStudent`
      con `cache()`, `getCurrentUser()` y `try/catch` que envuelva también la
      creación del cliente; ante error, `console.error` y `{ status: "unavailable" }`.
- [x] Mover al helper el comentario que hoy explica en el listado por qué no se
      usa `getActiveAssignmentsByEnrollment`.

### Fase 2 — El listado usa el helper
- [x] `evaluaciones/page.tsx`: reemplazar la consulta inline por el helper.
- [x] Ante `unavailable`, renderizar `ErrorState` con `INFRA_ERROR_COPY` (D5).
- [x] Mantener sin cambios el control de matrícula y el cálculo de estado de cada intento.
- [x] Quitar imports que queden sin uso.

### Fase 3 — Componente
- [x] Crear `components/account/AssignmentsAccessCard.tsx` (D6).

### Fase 4 — Integración en el detalle de matrícula
- [x] `app/cuenta/cursos/[enrollmentId]/page.tsx`: sumar el helper al segundo
      `Promise.all`, **solo** si `enrollment.status === "active"`.
- [x] Derivar la visibilidad: activa **y** (`unavailable` **o** ≥ 1 grupo).
- [x] Renderizar `AssignmentsAccessCard` entre el encabezado y `EnrollmentDetail`.
- [x] Comentario breve sobre por qué ante un fallo la tarjeta se muestra igual (D4).

### Fase 5 — Cierre
- [x] `docs/specs/backlog.md`: marcar DEBT-084 como resuelto por spec-055.
- [x] `npm run lint` y `npm run build` sin errores.
- [x] Sin fase MCP (ver "Evaluación MCP").

## Criterios de aceptación

1. Un estudiante con matrícula `active` y al menos una evaluación publicada y
   dentro de ventana ve en `/cuenta/cursos/[enrollmentId]` la tarjeta
   "Evaluaciones" con el conteo correcto, en singular y plural, y la tarjeta lo
   lleva a `/cuenta/cursos/[enrollmentId]/evaluaciones`.
2. Con **cero** evaluaciones abiertas —ninguna publicada, solo borradores, solo
   con apertura futura o solo cerradas— la tarjeta no aparece y el resto de la
   página no cambia.
3. Con matrícula `withdrawn` la tarjeta **nunca** aparece, aunque el curso
   tenga evaluaciones abiertas.
4. El conteo de la tarjeta coincide siempre con los ítems del listado para la
   misma matrícula y el mismo momento.
5. El criterio es por **grupo académico**, no por `course_slug`: una evaluación
   del Curso B no aparece en el detalle del Curso A aunque compartan slug.
6. La tarjeta aparece también en grupos académicos **sin** `course_slug`.
7. Si la consulta de evaluaciones falla, la página de detalle se renderiza
   completa con la tarjeta en versión genérica, y el listado muestra el
   `ErrorState` de infraestructura en lugar de "No hay evaluaciones disponibles".
8. La tarjeta se puede usar con teclado: se alcanza con Tab, el foco se ve en
   claro y en oscuro, y Enter navega. Su nombre accesible contiene el texto visible.
9. La página de detalle no suma niveles secuenciales de espera: la consulta
   nueva corre en el mismo `Promise.all` que progreso y lecciones deshabilitadas.
10. `npm run lint` y `npm run build` pasan.

## Pruebas asociadas

> Se crean junto con el spec (ver CLAUDE.md → "Artefactos que acompañan al spec").

- **Manuales:** `docs/testing/test-055-acceso-evaluaciones-estudiante.md` —
  casos `TC-055-001` a `TC-055-012`.
- **Automáticas (e2e/unit):** sin archivo, porque el framework de testing sigue
  "por definir" (CLAUDE.md → "Testing"). Cuando exista, un caso por criterio de
  aceptación; los candidatos más valiosos son el helper de dominio (criterios
  2, 4, 5 y 7) y la regla de visibilidad de la página (criterios 1, 3 y 6).

## Mitigación para el quiz del 2026-09-11

Fuera del alcance del spec — se deja registrada para que la decisión sea
explícita. Mientras spec-055 no esté desplegado, el único camino para los
estudiantes es construir la URL a mano:

> Entrar a **Mis cursos** → abrir **Estructuras de datos** → agregar
> `/evaluaciones` al final de la dirección del navegador.

La dirección del detalle ya contiene el `enrollmentId` propio de cada
estudiante, así que agregar `/evaluaciones` lleva a su listado correcto.

## Deuda detectada durante el análisis

Registrada en `docs/specs/backlog.md` el 2026-09-10. Ninguna se resuelve en
este spec.

| Deuda | Tema | Prioridad |
|---|---|---|
| [[DEBT-085]] | Resultados inaccesibles tras el cierre de la ventana; `show_feedback_on = "close"` inalcanzable | Media-alta |
| [[DEBT-086]] | Las evaluaciones próximas no se anuncian | Baja |
| [[DEBT-087]] | N+1 en el listado de evaluaciones | Baja |
| [[DEBT-088]] | Los envoltorios de `lib/assignments/index.ts` no usan la caché de Auth | Baja |
| [[DEBT-089]] | El detalle de matrícula no rechaza matrículas retiradas | Baja |
| [[DEBT-090]] | Consulta en serie evitable en el detalle de matrícula | Baja |

**Riesgo que sube con este spec — [[DEBT-083]]:** hasta ahora, publicar una
evaluación por accidente era casi invisible porque no había navegación. Con la
tarjeta, un grupo publicado por error aparece de inmediato para todos los
matriculados. Quedó anotado en la propia DEBT-083; conviene resolverla antes o
junto con el despliegue de este spec.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-09-10
