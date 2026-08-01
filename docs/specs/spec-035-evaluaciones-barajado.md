# spec-035 — [DONE] Evaluaciones A/B/C: implementar `shuffle_questions` y `shuffle_choices`

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

`assignment_variant_groups` tiene dos columnas booleanas, `shuffle_questions` y
`shuffle_choices`, que atraviesan todo el sistema: esquema
(`20260718000002_init_assignment_variant_groups.sql:12-13`), tipos
(`lib/assignments/types.ts:17-18`), validación (`lib/assignments/schemas.ts:31-32`),
persistencia (`lib/assignments/service.ts:46-47`), API
(`app/api/assignments/groups/[groupId]/route.ts:32-33`), herramientas MCP
(`mcp-servers/assignment-mcp/src/tools.ts:85,89,187,191`) y la ficha que ve el
docente en el panel admin, como "Sí"/"No"
(`components/admin/AssignmentGroupDetail.tsx:100,109`).

**Ningún código las lee.** La RPC que sirve las preguntas al estudiante ordena
siempre canónicamente: `order by aq.order_index` para las preguntas y
`order by c.order_index` dentro del `jsonb_agg` de opciones
(`20260724000002_variant_question_content_rpcs.sql:93,104`). Un docente que
activa "mezclar opciones" en una evaluación formal cree haber mitigado el
copieteo entre estudiantes contiguos y no lo hizo — es peor que no tener el
flag, porque induce una falsa sensación de control. Registrado como
**[[DEBT-034]]**, que planteaba dos frentes: (1) implementar el barajado o
(2) quitar los flags de la UI para no seguir prometiendo algo que no ocurre.
**Este spec toma el frente 1 y descarta el 2.**

spec-034 (`[DONE]`) resolvió el problema equivalente en la autoevaluación de
cierre y dejó el helper determinista listo: `seededShuffle<T>(items, seed)`
(sha256 → mulberry32 → Fisher-Yates), puro y verificado empíricamente por
`@reviewer` sobre 5000 semillas. Este spec lo reutiliza y sigue su misma línea
de diseño.

### Por qué el orden debe ser estable, no aleatorio por request

El mismo argumento de spec-034, agravado: acá hay un **examen calificable con
límite de tiempo**. `AssignmentPlayer` es un client component que se
re-renderiza desde el servidor en cada navegación, y el estudiante puede
recargar a mitad de intento (el flujo lo contempla explícitamente:
`createSubmission` recupera el `in_progress` en curso, ver comentario en
`lib/submissions/index.ts:61-65`). Si el examen se reordena a mitad de camino,
el estudiante pierde el hilo de lo que ya respondió: **es peor que no barajar**.

Hay además una segunda superficie que spec-034 no tenía: la página de
**resultados** (`.../resultados/page.tsx:38`) llama a la misma función. Si
jugador y resultados no coinciden, el estudiante ve su retroalimentación
desordenada respecto a cómo respondió.

### Por qué NO es un control de seguridad

Igual que en spec-034: `get_variant_question_details` es `security definer` y
alcanzable directamente por REST con la sesión del propio estudiante. Un
estudiante decidido puede invocarla y obtener el orden canónico. El barajado
mitiga el **copieteo por vecindad** (mirar la pantalla de al lado, "la respuesta
es la C"), no a un atacante con devtools. Queda documentado así para que el
docente no sobreestime la garantía.

## Alcance

### Incluye

- **Compartir** el helper de barajado: mover `lib/self-assessment/shuffle.ts` →
  `lib/shuffle.ts` (módulo transversal, sin dominio) y actualizar el import de
  `lib/self-assessment/index.ts`.
- Barajar, **en el servidor y sobre el resultado de la RPC**, las preguntas y/o
  las opciones que devuelve `getVariantQuestionDetails()`, respetando cada flag
  por separado.
- Semilla determinista por `enrollment_id`, estable entre recargas, entre el
  jugador y los resultados, y durante todo el intento.
- Encapsular la lectura de los flags **dentro de `lib/submissions/`**, de modo
  que ningún consumidor pueda olvidarse de barajar.
- Una nota en el panel admin advirtiendo la consecuencia de `shuffle_questions`
  sobre la numeración compartida en clase (ver Decisión D6).

### No incluye

- **Modificar la RPC ni crear migración alguna.** El barajado es de
  presentación; `order_index` no cambia en base (ver "Por qué TypeScript y no
  SQL").
- **Cambiar la vista del docente.** `getSubmissionForReview()` →
  `get_submission_review_context` conserva orden canónico, igual que spec-034
  decidió para la clave de respuestas del docente.
- **Cambiar el default de los flags** (`false` en migración y schema). Quien
  quiera barajar lo activa explícitamente; no se activa retroactivamente para
  grupos existentes.
- **Barajar por intento** (orden nuevo en cada reintento) — ver Decisión D1,
  descartado con el usuario y documentado.
- **Reordenar la autoevaluación de cierre**, ya resuelta por spec-034.
- **Migrar `AssignmentGroupDetail.tsx` a tokens semánticos.** El componente usa
  clases crudas de Tailwind; es la deuda **[[DEBT-015]]** / **[[DEBT-032]]**,
  cuyo bloqueante (el sistema de tokens no tiene variante `dark:`) sigue
  vigente. La nota nueva sigue el patrón "Texto sutil" de `DESIGN.md`
  (`text-gray-500 dark:text-gray-400`), consistente con el componente que la
  aloja; no se propaga deuda nueva ni se resuelve la existente.

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/shuffle.ts` | **Nuevo** (movido desde `lib/self-assessment/shuffle.ts`, contenido idéntico) |
| `lib/self-assessment/shuffle.ts` | **Eliminado** tras el movimiento |
| `lib/self-assessment/index.ts` | Solo el import: `./shuffle` → `@/lib/shuffle`. Cero cambios de comportamiento |
| `lib/submissions/index.ts` | `getVariantQuestionDetails()`: nuevo tercer parámetro **requerido** `groupId`; lee los flags del grupo y aplica `seededShuffle` sobre el resultado de la RPC |
| `lib/submissions/types.ts` | Sin cambios estructurales. Comentario en `order_index`: posición canónica de autoría, **no** de renderizado (D4) |
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/page.tsx` | Línea 65: pasar `groupId` |
| `.../[groupId]/resultados/page.tsx` | Línea 38: pasar `groupId` |
| `components/admin/AssignmentGroupDetail.tsx` | Nota de alcance junto al "Sí"/"No" de `shuffle_questions` (D6) |
| `components/student/AssignmentPlayer.tsx` | **Sin cambios.** Ya renderiza en orden de array y numera con `idx + 1` (línea 233) |
| `components/student/SubmissionResult.tsx` | **Sin cambios.** Ídem, `#{idx + 1}` |
| `components/student/QuestionRenderer.tsx` | **Sin cambios.** Mapea `choices` en orden de array |
| `docs/specs/backlog.md` | Marcar **[[DEBT-034]]** como resuelta por spec-035 |
| `docs/specs/spec-034-...md` | Anotar que su exclusión de las evaluaciones A/B/C queda cubierta acá |
| **Migraciones** | **Ninguna** |

### Por qué TypeScript y no SQL

Reordenar dentro de la RPC fue evaluado y **descartado**:

1. `get_variant_question_details` es `security definer` y concentra la lógica
   sensible de revelado (`should_reveal`); tocarla es riesgo desproporcionado
   para un cambio de presentación.
2. Requeriría una migración nueva y su ciclo completo (sincronizar a `mirp-lab`,
   `db reset`, aplicar a producción), sin ganancia funcional.
3. Un Fisher-Yates sembrado por sha256 en PL/pgSQL es mucho más costoso de
   escribir y auditar que el helper TS ya verificado.
4. La RPC **ya garantiza entrada determinista** al barajado (`order by
   aq.order_index` y `jsonb_agg(... order by c.order_index)`), que es justo la
   precondición que spec-034 tuvo que añadir a mano en PostgREST
   (`.order(..., { referencedTable })`). Acá viene gratis por contrato SQL:
   **no hace falta ningún `.order()` adicional**.
5. Sin cambio de RPC, el orden canónico sigue disponible para el docente y para
   depuración.

## Decisiones de diseño

### D1 — Semilla: `enrollment_id`, sin `attempt_number`

| Orden de | Semilla |
|---|---|
| **Preguntas** | `assignment-questions:${enrollmentId}:${assignmentId}` |
| **Opciones** | `assignment-choices:${enrollmentId}:${questionId}` |

`assignmentId` es el **id de la variante** (`allocation.variant.id` /
`assignment.variant.id`), no el del grupo: dos estudiantes con la misma variante
obtienen órdenes distintos por diferir en `enrollmentId`; el mismo estudiante
obtiene el mismo orden en ambas páginas porque ambas resuelven la misma variante
para la misma matrícula.

El prefijo de namespace evita que una misma pregunta usada a la vez en una
autoevaluación (semilla `${userId}:${questionId}`, spec-034) y en un examen
derive el mismo orden por coincidencia de string.

**`enrollment_id` y no `user_id`:** es el identificador que ya reciben ambas
superficies y ata el orden al contexto de curso, que es la unidad correcta acá.

**Por qué se excluye `attempt_number` / `submission_id`** (decisión del usuario,
2026-08-01):

- *A favor de incluirlo:* con `max_attempts > 1` y `show_feedback_on = 'submit'`,
  un estudiante podría memorizar "la correcta era la tercera" y acertar el
  reintento sin releer.
- *En contra, y decisivo:* obligaría a que jugador y resultados coincidan en
  cuál es el intento vigente, y hoy lo resuelven por caminos distintos
  (`createSubmission` devuelve la fila creada/recuperada; `getSubmissionByStudent`
  toma el `attempt_number` más alto). Cualquier desalineación produce
  exactamente el bug que este spec busca evitar. Con la semilla por
  `enrollment_id` la coherencia es **por construcción**, no por convención entre
  dos páginas. Además, el vector real que describe DEBT-034 es el copieteo entre
  estudiantes contiguos, plenamente cubierto sin `attempt_number`; y la palanca
  correcta contra la memorización entre intentos es `show_feedback_on`
  (`'close'` / `'never'`), no el barajado.

> Si en la práctica se detecta abuso entre intentos, el cambio es acotado
> (incorporar `attempt_number` a la semilla) pero **exige antes unificar cómo
> ambas páginas resuelven el intento vigente**. Se registrará en el backlog al
> cerrar el spec.

### D2 — Cada flag actúa por separado

`shuffle_questions` reordena el array de `QuestionDetail`; `shuffle_choices`
reordena `choices` **dentro de cada pregunta**. Las cuatro combinaciones son
válidas y se prueban. Con ambos en `false` (el default, y el estado de todos los
grupos existentes) la salida debe ser **idéntica a la de hoy**.

### D3 — Coherencia jugador ↔ resultados por construcción

La lectura de los flags y el barajado viven **dentro de
`getVariantQuestionDetails`**, no en las páginas. Se añade `groupId` como tercer
parámetro **requerido** (no opcional): el compilador obliga a actualizar ambos
consumidores y ninguno futuro puede omitir el barajado por olvido. Ambas páginas
ya tienen `groupId` en `params`.

*Alternativa evaluada:* pasar los flags ya leídos (la página del jugador
consulta el grupo en las líneas 43-47, y `getStudentAssignment` de la página de
resultados hace `select("*")`, así que los tiene sin costo). **Descartada:** un
consumidor podría pasar `false, false` por comodidad y el compilador no lo
detectaría. El costo de la vía elegida es una lectura extra por PK en páginas
que ya hacen 5-6 roundtrips — despreciable.

### D4 — `order_index` sigue expuesto, marcado como no-renderizable

Se mantiene en `QuestionDetail` y en cada choice: es dato legítimo de la fila y
quitarlo obligaría a tocar la RPC. Misma decisión que spec-034.

Riesgo asumido: tras este spec `order_index` **deja de coincidir** con la
posición mostrada. Verificado que ningún consumidor del flujo del estudiante lo
usa para renderizar (`AssignmentPlayer` usa `idx + 1`, `SubmissionResult` usa
`#{idx + 1}`, `QuestionRenderer` mapea el array). Mitigación: comentario
explícito en `lib/submissions/types.ts` para que nadie lo "arregle" añadiendo un
`sort by order_index` en el cliente.

### D5 — Preguntas sin opciones

`open_text` / `code_write` / `coding_challenge` llegan con `choices: []` (la RPC
hace `coalesce(..., '[]'::jsonb)`). `seededShuffle([], seed)` devuelve `[]`: **no
requiere caso especial**. El barajado de preguntas aplica por igual a todos los
tipos.

### D6 — La numeración deja de ser compartida (con aviso en admin)

Con `shuffle_questions = true`, "la pregunta 3" significa algo distinto para cada
estudiante, y ninguno coincide con la numeración canónica que el docente ve en el
panel admin (`AssignmentGroupDetail.tsx:148` renderiza `q.order_index + 1`) ni en
la revisión de envíos. No es un defecto —es inherente a barajar preguntas— pero
sí una pérdida real de comunicación en clase ("resuelvan primero la 2"), y es una
razón legítima para activar `shuffle_choices` dejando `shuffle_questions` en
`false`.

**Decisión del usuario (2026-08-01):** advertirlo en la UI. Se añade una nota
breve junto al "Sí"/"No" de `shuffle_questions` en el panel admin, visible solo
cuando el flag está activo. Es información que de otro modo solo se descubre
dictando el examen.

### D7 — `mulberry32` sobre secuencias más largas

La revisión de spec-034 dejó como 🔵 sugerencia el overflow de `a` en
`mulberry32` sin truncar a int32, *"para si `seededShuffle` se reutiliza en
DEBT-034 sobre secuencias largas"*. **Este spec es esa reutilización.**
Re-evaluado: sigue siendo irrelevante — las secuencias acá son de N preguntas por
variante y ~4-6 opciones por pregunta, órdenes de magnitud por debajo de donde
ese detalle importaría. **No se modifica el helper:** cualquier cambio alteraría
los órdenes ya estables de la autoevaluación en producción.

## Evaluación MCP

**¿Aplica MCP?** No — no requiere fase de MCP.

`assignment-mcp` ya expone `shuffle_questions` y `shuffle_choices` como
parámetros de `create_assignment_group` y `update_assignment_group`
(`mcp-servers/assignment-mcp/src/tools.ts:85,89,187,191`, descritos como
"Mezclar preguntas/opciones"). Este spec **no agrega ni cambia ninguna
herramienta ni ningún contrato**: hace que esas descripciones, hoy falsas, pasen
a ser ciertas. `docs/mcps/assignment-agent.system-prompt.md` no menciona el
barajado, así que no contiene afirmaciones que corregir.

El barajado es una transformación de presentación en el servidor: no expone
datos ni acciones nuevas, no cambia el esquema y no altera ninguna superficie de
lectura para un agente.

> Mejora **opcional** evaluada en Fase 5: añadir al system prompt una línea que
> oriente al agente docente sobre cuándo activar cada flag (incluida la
> consecuencia de D6). No es requisito del spec.

## Fases de implementación

### Fase 1 — Compartir el helper de barajado
- [ ] Crear `lib/shuffle.ts` con el contenido exacto de
      `lib/self-assessment/shuffle.ts` (sin modificar la implementación: ver D7)
- [ ] Actualizar el import en `lib/self-assessment/index.ts` a `@/lib/shuffle`
- [ ] Eliminar `lib/self-assessment/shuffle.ts`
- [ ] `grep -rn "self-assessment/shuffle"` para confirmar que no queda ninguna
      referencia
- [ ] Confirmar que `lib/submissions/` no importa nada de `lib/self-assessment/`
      (la dependencia cruzada entre dominios que este movimiento evita)

### Fase 2 — Barajado en `getVariantQuestionDetails`
- [ ] Añadir el tercer parámetro **requerido** `groupId: string` a la firma
- [ ] Tras la RPC, leer `shuffle_questions, shuffle_choices` de
      `assignment_variant_groups` por `groupId`
- [ ] Si `shuffle_choices`, barajar `choices` de cada pregunta con semilla
      `assignment-choices:${enrollmentId}:${questionId}`
- [ ] Si `shuffle_questions`, barajar el array de preguntas con semilla
      `assignment-questions:${enrollmentId}:${assignmentId}`
- [ ] Si la lectura del grupo falla o no devuelve fila: **no barajar** (degradar
      a orden canónico) en vez de lanzar — el estudiante debe poder resolver el
      examen igual. Registrar con `console.error`, siguiendo el criterio de
      `propagateToGradeItem` (`lib/submissions/index.ts:534`)
- [ ] Documentar en el comentario de cabecera de la función (junto al que ya
      explica el gating de `is_correct`) que el barajado es de presentación y no
      una garantía criptográfica
- [ ] No añadir ningún `.order()`: la RPC ya garantiza entrada determinista
- [ ] Evaluar extraer el reordenamiento a un helper puro dentro de
      `lib/submissions/` (mejora la testabilidad futura sin costo hoy)

### Fase 3 — Actualizar los consumidores
- [ ] `.../evaluaciones/[groupId]/page.tsx:65` — pasar `groupId`
- [ ] `.../evaluaciones/[groupId]/resultados/page.tsx:38` — pasar `groupId`
- [ ] Confirmar por typecheck que no existe ningún otro llamador
- [ ] Confirmar que ambos resuelven la **misma variante** para la misma
      matrícula (`allocation.variant.id` vs `assignment.variant.id`), condición
      de la que depende la coherencia de D1

### Fase 4 — Tipos y verificación de no regresión
- [ ] Comentar `order_index` en `lib/submissions/types.ts` según D4
- [ ] Confirmar que `saveAnswer` sigue indexando por `question_id`
      (`onConflict: "submission_id,question_id"`) y que `buildInitialAnswers` /
      `handleAnswerChange` / `handleSubmit` de `AssignmentPlayer` siguen
      buscando por `question_id`, nunca por posición
- [ ] Confirmar que `submitSubmission` califica contra el mapa de
      `get_variant_answer_key` por `question_id` comparando **conjuntos de ids**
      de opción — independiente del orden mostrado
- [ ] Confirmar que `getSubmissionForReview` / `get_submission_review_context`
      **no** barajan y mantienen orden canónico para el docente
- [ ] Confirmar que `SubmissionResult` empareja respuesta con pregunta por
      `question_id`, no por índice

### Fase 5 — UI admin y documentación
- [x] Añadir en `components/admin/AssignmentGroupDetail.tsx`, junto al "Sí"/"No"
      de `shuffle_questions` y solo cuando el flag esté activo, una nota breve
      advirtiendo que cada estudiante ve las preguntas en un orden propio y que
      la numeración de esta ficha no coincide con la que ellos ven (D6).
      Usa el patrón "Texto sutil" de `DESIGN.md`
      (`text-gray-500 dark:text-gray-400`), consistente con el componente
- [x] Marcar **[[DEBT-034]]** en `docs/specs/backlog.md` como resuelta por
      spec-035, dejando constancia de que el frente 2 (quitar los flags) queda
      descartado
- [x] Registrar en el backlog el ítem derivado de D1 (barajar por intento exige
      antes unificar la resolución del intento vigente) — ver **[[DEBT-035]]**
- [x] Anotar en `spec-034-autoevaluacion-barajado-opciones.md` que su exclusión
      de las evaluaciones A/B/C queda cubierta por spec-035
- [x] Decidir si se enriquece `docs/mcps/assignment-agent.system-prompt.md` con
      orientación sobre cuándo activar cada flag — **decidido: no.** Es una
      mejora opcional de calidad del prompt, no un requisito del spec (ver
      "Evaluación MCP"); el spec no introduce ni cambia ninguna herramienta
      del MCP, y el system prompt actual no menciona el barajado, por lo que no
      contiene ninguna afirmación falsa que corregir con urgencia. Queda
      disponible como mejora futura si se retoma `assignment-agent`

### Fase 6 — Verificación final
- [x] `npm run lint` sin errores nuevos
- [x] `npm run build` en verde
- [x] Invocar `@reviewer` antes de la ronda manual — APROBADO
- [x] Ejecutar la ronda manual de `docs/testing/test-035-evaluaciones-barajado.md`
      — 13/13 casos aprobados, sin hallazgos nuevos (2026-08-01)

## Criterios de aceptación

1. Con `shuffle_choices = true`, dos estudiantes distintos de la misma variante
   ven las opciones de una misma pregunta en **orden distinto**.
2. Con `shuffle_questions = true`, dos estudiantes distintos de la misma variante
   ven las preguntas en **orden distinto**.
3. Un mismo estudiante ve **siempre el mismo orden** durante todo su intento:
   tras recargar el jugador, tras navegar fuera y volver, y tras recuperar un
   `in_progress`.
4. El orden de la página de **resultados** coincide exactamente con el que el
   estudiante vio en el jugador (preguntas y opciones).
5. Con ambos flags en `false` el orden es **idéntico al actual**
   (`order_index` canónico), sin regresión alguna.
6. Cada flag actúa de forma independiente: las cuatro combinaciones producen el
   comportamiento esperado.
7. La calificación es correcta con cualquier orden: responder bien puntúa,
   responder mal no, y el autoguardado por debounce sigue asociando cada
   respuesta a su pregunta.
8. Las preguntas sin opciones (`open_text`, `code_write`, `coding_challenge`) se
   renderizan sin error con ambos flags activos.
9. La vista del docente (revisión de envíos y ficha del grupo en admin) sigue
   mostrando orden **canónico**.
10. `order_index` en base no cambia: el barajado es solo de presentación.
11. Lo verificado en `test-019` (resolución) y `test-020` (revisión) sigue
    funcionando.
12. La autoevaluación de cierre (spec-034) sigue funcionando idénticamente tras
    el movimiento del helper: los órdenes previos se conservan.
13. El panel admin advierte la consecuencia de `shuffle_questions` sobre la
    numeración cuando el flag está activo, y no muestra la nota cuando no lo
    está.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-035-evaluaciones-barajado.md` — casos
  `TC-035-001` … `TC-035-013`, uno por criterio de aceptación. Requiere **al
  menos dos estudiantes** matriculados y asignados a la misma variante
  (forzable vía `students-mcp` + `assignment-mcp`) y un grupo con
  `max_attempts > 1` para cubrir el criterio 3.
- **Automáticas (e2e/unit):** no se crea archivo todavía (framework "por
  definir", CLAUDE.md → "Testing"). Candidatos naturales cuando exista:
  `seededShuffle` (ya identificado en spec-034) y el helper puro de
  reordenamiento de `QuestionDetail[]` que la Fase 2 evalúa extraer.

## Aprobación de implementación

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-01

## Implementación completada

- [x] Fase 1 — Compartir el helper de barajado
- [x] Fase 2 — Barajado en `getVariantQuestionDetails`
- [x] Fase 3 — Actualizar los consumidores
- [x] Fase 4 — Tipos y verificación de no regresión
- [x] Fase 5 — UI admin y documentación
- [x] Fase 6 — Ronda manual de pruebas — 13/13 casos aprobados (2026-08-01)
