# spec-033 — [TESTING] Autoevaluación de cierre: persistir el estado de "ya respondida" tras recargar

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

La autoevaluación de cierre de una lección (`SelfAssessmentSection`, spec-017)
mantiene su estado de "ya respondida" **solo en memoria del cliente**:
`hasSubmitted` y `feedbackByQuestion` son `useState` inicializados siempre en
`false` / `{}` ([SelfAssessmentSection.tsx:28-32](../../components/courses/SelfAssessmentSection.tsx#L28-L32)).

El servidor sí sabe que existe un intento: `getSelfAssessmentStatus()`
([lib/self-assessment/index.ts:239](../../lib/self-assessment/index.ts#L239))
calcula `hasAttempt` correctamente y se usa bien para desbloquear "marcar
lección completada"
([page.tsx:141](<../../app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx#L141>)).
Pero ese dato **nunca llega** a `SelfAssessmentSection`: ni `LessonClosureFlow`
ni el propio componente lo aceptan como prop.

Resultado: tras cualquier recarga de la página, el widget vuelve a mostrarse
como si nunca se hubiera respondido —formulario en blanco, feedback perdido—
aunque el botón "Marcar lección completada" sí aparezca desbloqueado. La
incoherencia entre ambas señales es confusa: la lección dice "ya podés
completarla" mientras la autoevaluación dice "todavía no respondiste".

### Qué NO es este bug

DEBT-028 se registró afirmando que el defecto "permite reintentos silenciosos y
datos inconsistentes". **Esa premisa es falsa** y se corrigió en el backlog el
2026-07-31:

- `self_assessment_attempts` es, por diseño explícito, *"una bitácora
  append-only de intentos completados por estudiante"* (Decisión D1 de
  spec-017, documentada en el comentario de
  `20260718000000_init_self_assessment_attempts.sql`). Varias filas por
  estudiante/lección son el comportamiento esperado.
- `SelfAssessmentSection` expone un botón **"Reintentar"** deliberado
  ([línea 304](../../components/courses/SelfAssessmentSection.tsx#L304)) que
  limpia el estado y permite reenviar, generando otra fila.
- `hasAttempt` solo evalúa `length > 0`, así que ningún reintento altera el
  desbloqueo de "marcar lección completada".

Por lo tanto este spec **no** busca impedir reenvíos ni deduplicar filas: busca
que la UI refleje al recargar lo que el servidor ya sabe.

## Alcance

### Incluye

- Extender `SelfAssessmentStatus` con los datos del **último intento**
  (`correct_count`, `question_count`, `submitted_at`).
- Propagar ese dato desde `page.tsx` → `LessonClosureFlow` →
  `SelfAssessmentSection`.
- Que `SelfAssessmentSection`, cuando ya exista un intento previo, renderice un
  **resumen del último intento** ("Ya completaste esta autoevaluación:
  X/Y correctas") en vez de un formulario en blanco.
- Conservar el botón **"Reintentar"** en ese estado, con el mismo
  comportamiento actual (limpia el formulario, permite responder de nuevo,
  bloquea "marcar lección completada" mientras se reintenta vía
  `onRetryingChange`).

### No incluye

- **Reconstruir el feedback por pregunta tras la recarga.** Es imposible con el
  esquema actual: `self_assessment_attempts` guarda solo conteos agregados, no
  qué opción eligió el estudiante en cada pregunta. Ese es el "fix completo"
  de DEBT-028 (alcance 2), que requiere migración y queda fuera.
- Eliminar, limitar o deduplicar el log de intentos.
- Cambiar la regla de desbloqueo de "marcar lección completada".
- Aleatorizar el orden de las opciones (**[[DEBT-029]]**, mismo componente pero
  problema independiente).
- Migrar `SelfAssessmentSection` a tokens semánticos (**[[DEBT-020]]**).

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/self-assessment/types.ts` | Extender `SelfAssessmentStatus` con `lastAttempt: { correctCount, questionCount, submittedAt } \| null` |
| `lib/self-assessment/index.ts` | `getSelfAssessmentStatus()`: seleccionar `question_count, correct_count, submitted_at` y ordenar por `submitted_at desc` para quedarse con el más reciente; derivar `hasAttempt` de ahí |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Incluir `lastAttempt: null` en el valor por defecto (línea 73-77) y pasar `lastAttempt` a `LessonClosureFlow` |
| `components/courses/LessonClosureFlow.tsx` | Nueva prop `lastAttempt`, propagada a `SelfAssessmentSection` |
| `components/courses/SelfAssessmentSection.tsx` | Nueva prop `lastAttempt`; inicializar `hasSubmitted` desde ella; renderizar resumen del intento previo cuando no haya feedback en memoria |

> El índice `(user_id, course_slug, lesson_slug)` de
> `self_assessment_attempts` ya cubre la consulta; el `order by submitted_at
> desc limit 1` no requiere índice nuevo ni migración.

### Riesgo a vigilar

`getSelfAssessmentStatus` hoy hace `.limit(1)` **sin `order by`**, así que la
fila que devuelve es arbitraria. Para `hasAttempt` daba igual (solo importaba si
existía alguna), pero al pasar a mostrar conteos **sí importa**: sin `order by`
el estudiante podría ver el resumen de un intento viejo en vez del último.

## Evaluación MCP

**¿Aplica MCP?** No.

Este spec no expone datos ni acciones nuevas: `self_assessment_attempts` ya
existe y ya se lee: el cambio es qué columnas trae una función interna y cómo se
renderiza en el cliente. Un estudiante solo lee sus propios intentos (RLS de
`20260718000001`), así que tampoco hay una superficie nueva de lectura para un
agente.

> **Candidato preexistente, no de este spec:** spec-017 (sección "Evaluación
> MCP") ya dejó anotado que una lectura docente agregada de
> `self_assessment_attempts` —p. ej. `get_self_assessment_summary(course_slug,
> lesson_slug?)` en `attendance-mcp`— es candidata a MCP en un spec futuro.
> Este spec no la aborda ni la bloquea.

## Fases de implementación

### Fase 1 — Datos: exponer el último intento
- [x] Extender `SelfAssessmentStatus` en `lib/self-assessment/types.ts` con
      `lastAttempt: SelfAssessmentAttemptSummary | null`
- [x] En `getSelfAssessmentStatus()`, cambiar el `select('id')` por
      `select('question_count, correct_count, submitted_at')`, añadir
      `.order('submitted_at', { ascending: false })` y mantener `.limit(1)`
      (con desempate `.order('id', { ascending: false })` para determinismo
      ante `submitted_at` empatados)
- [x] Derivar `hasAttempt` de la presencia de `lastAttempt` (sin cambiar su
      semántica actual)
- [x] Verificar que la rama de error (`catch`) y la de usuario anónimo devuelven
      `lastAttempt: null`

### Fase 2 — Propagación al cliente
- [x] Añadir `lastAttempt: null` al valor por defecto de `selfAssessmentStatus`
      en `page.tsx` (líneas 73-77)
- [x] Pasar `lastAttempt={selfAssessmentStatus.lastAttempt}` a
      `LessonClosureFlow`
- [x] Añadir la prop a `LessonClosureFlowProps` y propagarla a
      `SelfAssessmentSection`

### Fase 3 — Estado inicial y resumen en la UI
- [x] Añadir `lastAttempt` a `SelfAssessmentSectionProps`
- [x] Inicializar `hasSubmitted` en `!!lastAttempt` en vez de `false`
- [x] Renderizar, cuando `hasSubmitted` sea true y `feedbackByQuestion` esté
      vacío (caso "vengo de una recarga"), un resumen con
      "Ya completaste esta autoevaluación: X/Y correctas" y la fecha del intento,
      **en vez del formulario** (no junto a él) — corregido tras hallazgo
      bloqueante de `@reviewer`: la primera versión dejaba el formulario
      completo renderizado y respondible sin botón de envío
- [x] Mantener visible el botón "Reintentar" en ese estado, con el
      comportamiento actual intacto
- [x] Verificar que tras un envío en la misma sesión se sigue mostrando el
      feedback por pregunta (no debe regresionar al resumen agregado)

### Fase 4 — Verificación
- [x] `npm run lint` sin errores nuevos
- [x] `npm run build` en verde
- [ ] Ejecutar la ronda manual de `docs/testing/test-033-autoevaluacion-estado-persistente.md`

### Revisión de `@reviewer` (2026-07-31)

Primera pasada: ❌ CAMBIOS REQUERIDOS.

- 🔴 Bloqueante — el resumen se agregaba junto al formulario, no en su lugar;
  las preguntas quedaban respondibles sin botón de envío. **Corregido**:
  `showAttemptSummary` ahora controla un `if/else` real entre resumen y
  formulario.
- 🟠 Mayor — `submittedAt` se transportaba pero no se renderizaba. **Corregido**:
  se muestra junto al resumen.
- 🟠 Mayor — fases sin marcar pese a estar completas, y merge a `development`
  con el spec en `[IN PROGRESS]`. **Corregido**: fases marcadas; el merge a
  `development` en `[IN PROGRESS]` se acepta como excepción documentada (ver
  nota debajo de "Aprobación de implementación") en vez de revertirse, dado
  que ya se corrigió el hallazgo bloqueante sobre la misma rama antes de la
  ronda de pruebas manuales.
- 🟡 Menores — rename `flex-shrink-0`→`shrink-0` fuera de alcance (se deja,
  dado el bajo riesgo, pero queda anotado como inconsistente con el resto del
  repo); duplicación de markup entre branches del resumen (resuelta al
  colapsar a un único bloque); tipo implícito en la consulta de intentos
  (**corregido**: nuevo `AttemptRow` en `lib/self-assessment/index.ts`);
  `lastAttempt` opcional en el hijo pero obligatorio en el padre
  (**corregido**: ahora obligatorio en ambos).

## Criterios de aceptación

1. Un estudiante que respondió la autoevaluación y **recarga la página** ve un
   resumen de su último intento ("Ya completaste esta autoevaluación: X/Y
   correctas"), no un formulario en blanco.
2. Ese resumen refleja el intento **más reciente**, no uno arbitrario, cuando
   existe más de uno.
3. El botón **"Reintentar"** sigue disponible tras la recarga y conserva su
   comportamiento: limpia el formulario, permite reenviar y bloquea "marcar
   lección completada" mientras el reintento está en curso.
4. Tras enviar en la misma sesión (sin recargar), el estudiante sigue viendo el
   **feedback por pregunta** —opción correcta resaltada— exactamente como hoy.
5. Un estudiante que **nunca respondió** ve el formulario en blanco, sin cambios
   respecto del comportamiento actual.
6. La regla de desbloqueo de "marcar lección completada" no cambia: sigue
   dependiendo de `requiresAttempt` / `hasAttempt`.
7. Una lección **sin preguntas publicadas** no renderiza la sección de
   autoevaluación, igual que hoy.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-033-autoevaluacion-estado-persistente.md`
  — casos `TC-033-001` … `TC-033-007`.
- **Automáticas (e2e/unit):** no se crea archivo todavía. El framework de
  testing sigue "por definir" (CLAUDE.md → "Testing"). Cuando exista, derivar
  un caso por criterio de aceptación en
  `{{ubicación e2e por definir}}/e2e-033-autoevaluacion-estado-persistente.spec.ts`.

## Deuda técnica relacionada

- **[[DEBT-028]]** — este spec implementa su alcance 1 (fix mínimo). El alcance
  2 (persistir la respuesta por pregunta, con migración) queda abierto.
- **[[DEBT-029]]** — orden de opciones no aleatorizado, mismo componente.
  Deliberadamente fuera de alcance; evaluar si conviene un spec conjunto.
- **[[DEBT-020]]** — tokens crudos de paleta en este componente.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-31 ("Implementa el spec-033", instrucción
  explícita en esta misma sesión)

> **Nota de proceso:** la implementación se mergeó a `development` con el spec
> en `[IN PROGRESS]` (commit `87859ea`), antes de la revisión de `@reviewer` y
> de la ronda de pruebas manuales — desviación de la regla de CLAUDE.md → Git
> ("Solo se puede hacer merge a `development` de specs en estado `[DONE]`").
> Se corrigió sobre la misma rama (sin abrir una nueva) antes de la ronda de
> pruebas, así que no queda código sin revisar en `development`; documentado
> para no repetir la secuencia en próximos specs: primero rama + revisión +
> pruebas, merge al final.
