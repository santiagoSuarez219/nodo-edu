# test-042 — Banco de preguntas: desacople pregunta↔lección y catálogo de keywords

Casos manuales de `spec-042`. Solo flujos con UI (`TC-042-*`) y herramientas del
MCP (`TC-MCP-042-*`). Todos arrancan en ⬜ Pendiente.

> **Lo que esta ronda vigila de verdad es la NOTA.** Desde spec-040 el
> denominador de la nota de autoevaluación sale de contar preguntas por
> `(course_slug, lesson_slug)`; este spec cambia de dónde sale ese conteo. Un
> montaje faltante no rompe nada visible: **infla la nota en silencio** del
> estudiante que no respondió. Por eso existe la sección "Consultas de
> verificación de la migración" al final, y por eso los dos primeros casos de
> la ronda son de paridad de nota.
>
> ⚠️ **Adaptación acordada con el usuario (2026-08-06):** el diseño original de
> TC-042-001/002 pedía correrlos **antes y después** de aplicar las
> migraciones. Eso ya no es posible en esta ronda: la base de desarrollo quedó
> migrada durante la implementación (Fases 1, 2 y 5 tuvieron que aplicarse y
> probarse ahí). La paridad **backend** ya quedó demostrada byte a byte en la
> Fase 5 con datos reales — incluido un escenario de nota congelada que
> diverge deliberadamente del recuento en vivo (ver spec-042 D6) — comparando
> el resultado del RPC antes y después del `create or replace`, sin pasar por
> la UI. TC-042-001/002 se adaptan aquí a verificar que la UI **muestra
> correctamente** ese mismo resultado ya probado (verificación "después"), en
> vez de repetir la comparación antes/después a través de la pantalla.

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Docente de desarrollo (dueño del curso académico de pruebas) | ya existe — `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` (recreado en Fase 1, id `7207c852-dd6c-4df4-ac33-99985c36e26c`) | N/A (cuenta base de desarrollo) |
| Curso del catálogo usado en la ronda | contenido versionado en git, no se crea | `analisis-de-algoritmos` | N/A |
| Lección **LA** (autoevaluación principal: orden, reordenamiento, desmontaje) | contenido existente | `analisis-de-algoritmos` / `tablas-hash` | N/A |
| Lección **LB** (segundo montaje de la misma pregunta, TC-042-007) | contenido existente | `analisis-de-algoritmos` / `heaps-y-heapsort` | N/A |
| Lección **LE** (gate de completar lección, TC-042-010/011) | contenido existente | `analisis-de-algoritmos` / `counting-radix-y-bucket-sort` | N/A |
| Curso académico **Grupo A** — sembrado en Fase 0 | `POST /api/academic_courses` vía `service_role` (autorizado en Fase 0) | `Spec-042 QA — Analisis de Algoritmos`, `{{academic_course_id}}=f34aaaf6-540a-4915-beca-534e06105464` | ⬜ |
| Estudiante **frozen** — nota congelada divergente (D6), usado en TC-042-001 adaptado | `students-mcp` → `create_student` + `enroll_student`, sembrado en Fase 0 | `3827b151-0357-4592-a154-841eb6a5fe00` — `spec042-frozen@nodo.test` / `TestStudent042!`, enrollment `50f93a2c-9d4a-4bdf-9162-3312ed7e1531` | ⬜ |
| Estudiante **live** — denominador vivo, usado en TC-042-002 adaptado | `students-mcp` → `create_student` + `enroll_student`, sembrado en Fase 0 | `21b0a022-fa85-4398-bf1d-3fc7c61d4213` — `spec042-live@nodo.test` / `TestStudent042!`, enrollment `7b1bc52c-26de-485c-bad5-425c9f38bffb` | ⬜ |
| Estudiante **E3** — recorrido funcional (LA: orden, reordenamiento, revisión) | `students-mcp` → `create_student` + `enroll_student` | `1ff8befb-9ddc-440b-a0d4-10562ba7ac92` — `test-e3-spec042@nodo.test` / `TestStudent042!` | ⬜ |
| Estudiante **E4** — segunda semilla de barajado (TC-042-008) y gate de LE (TC-042-010/011) | `students-mcp` → `create_student` + `enroll_student` | `fd90dfc9-cde5-4658-b509-92821ea33724` — `test-e4-spec042@nodo.test` / `TestStudent042!` | ⬜ |
| Estudiante **E5** — autoevaluación de LB (pregunta compartida, TC-042-007) | `students-mcp` → `create_student` + `enroll_student` | `2376baaf-c14d-449e-9e44-2d1369442ca4` — `test-e5-spec042@nodo.test` / `TestStudent042!` | ⬜ |
| Preguntas **PA1–PA4** de LA (`multiple_choice`, publicadas y montadas) | `question-bank-mcp` → `create_question` + `publish_question` + `mount_question_in_lesson` (contrato nuevo, con `keywords`) | `1abe335b-0ce6-41f1-8786-52bd51f002b9`, `700d0e21-de36-48de-b0ad-90e8ec439564`, `f4ee7ba6-4031-479a-9e98-07388015f413`, `4cf273b7-c147-47ff-8fa8-6b1e30400f3c` | ⬜ |
| Preguntas **PE1–PE2** de LE (gate de completar lección) | `question-bank-mcp` → `create_question` + `publish_question` + `mount_question_in_lesson` | `0a27096c-f113-474a-a3f0-f1afa2e54c59`, `49ebedc5-f774-4ee3-b2d9-3f24bf310f00` | ⬜ |
| Pregunta **PX** — se monta en **LA y LB** a la vez (TC-042-007) | `create_question` + `publish_question` + dos `mount_question_in_lesson` | `e4518de1-32a5-496e-9d0c-12f8352e1d3d` | ⬜ |
| Pregunta **PY** — publicada y **nunca montada** (TC-042-013) | `create_question` + `publish_question`, **sin** montar | `76cbf039-7ad7-4ec4-b6df-2d5dfd340880` | ⬜ |
| Keyword `logica` (`kind='tema'`) | `question-bank-mcp` → `create_keyword` | `logica` | ⬜ |
| Keyword `python` (`kind='lenguaje'`) | `question-bank-mcp` → `create_keyword` | `python` | ⬜ |
| Keyword `cierre` (`kind='momento'`) | `question-bank-mcp` → `create_keyword` | `cierre` | ⬜ |
| Keyword `spec042-temporal` (solo para el `409` de duplicado y el `409` de borrado en uso) | `create_keyword` | `spec042-temporal` | ⬜ |
| Intentos congelados de `frozen` en `algoritmos-como-tecnologia`/`fundamentos-control-de-versiones-y-flujo-de-trabajo` (D6) | sembrados en Fase 0 vía `service_role` (autorizado) | `4e7560d6-…`, `690a47e6-…` | ⬜ (no hay endpoint de borrado; se limpian junto con el estudiante) |

**Entorno de pruebas:** desarrollo — Supabase **local** corriendo en `mirp-lab` a
través del túnel SSH (ver `CLAUDE.md` → "Base de datos"), con `npm run dev` en
esta máquina (`localhost:3002`) y `question-bank-mcp` / `students-mcp` en su
variante **local** (`./mcp-servers/run-local-mcp.sh`).
**Ningún caso de esta ronda se ejecuta contra producción.** Las consultas de la
sección final sí se reejecutarán contra producción el día del despliegue, pero
como **lectura**, y con confirmación explícita del usuario en ese momento.
**Fecha de la ronda:** 2026-08-06

### ⚠️ Patrón de respuesta correcta

Todas las preguntas de control de esta ronda se crean con la misma estructura que
la ronda de spec-040: 4 opciones, **la correcta es siempre la tercera ("C")**, con
el texto literal `"Esta es la opción correcta (C)"`; las otras tres dicen
`"Opción incorrecta A"`, `"Opción incorrecta B"` y `"Opción incorrecta D"`. Así se
puede alcanzar cualquier puntaje exacto sin memorizar respuestas.

Para poder distinguir el **orden** de las preguntas a simple vista, el `stem` de
cada una empieza con su etiqueta: `[042 PA1] …`, `[042 PA2] …`, etc.

### ⚠️ Advertencias de irreversibilidad y de orden de ejecución

- **Un envío de autoevaluación no se puede repetir** (spec-040: intento único por
  `(user_id, course_slug, lesson_slug)`, sin acción de anulación). Cada caso que
  implique un envío quema ese par estudiante-lección. Si un caso falla a mitad,
  **crear otro estudiante** con `students-mcp`, no borrar el intento en base.
- Las migraciones (Fases 1, 2, 5 del spec) **ya están aplicadas** en desarrollo
  desde la implementación — no forman parte de esta ronda. TC-042-001/002 se
  ejecutan en su forma **[ADAPTADO]** (ver la nota al inicio del documento).
- Orden: **preparación → TC-042-001/002 (adaptados) → resto de `TC-042-*` →
  `TC-MCP-042-*`**.
- Los `TC-MCP-042-*` de contrato (`422`/`409`) se ejecutan **después** de los
  casos de UI: algunos crean y borran keywords compartidas.

### Preparación previa (antes del primer caso)

1. Túnel SSH activo y stack de Supabase arriba en `mirp-lab`; `npm run dev`
   corriendo en `localhost:3002`.
2. Los estudiantes `frozen`/`live` y el curso académico de la Fase 0 ya existen
   (ver tabla de arriba) — no se recrean.
3. Crear los estudiantes E3–E5 y sus matrículas con `students-mcp`; anotar IDs.
4. Crear el catálogo de keywords de la ronda (`logica`, `python`, `cierre`,
   `spec042-temporal`) con `create_keyword`.
5. Crear, publicar y montar con el **contrato nuevo** (`keywords` en el payload,
   `mount_question_in_lesson` explícito): PA1–PA4 en LA, PE1–PE2 en LE, PX en LA
   y LB, PY publicada sin montar. Verificar con `list_lesson_questions` que cada
   lección tiene exactamente las preguntas esperadas.
6. Los conteos de la **Fase 0** del spec (total de `questions`; con slugs no
   nulos; con `tags` no vacío; `multiple_choice` publicadas por
   `(course_slug, lesson_slug)`) ya están registrados abajo, con el breakdown de
   referencia exportado al scratchpad de la sesión (**fuera del repo**).

#### Conteos de la Fase 0 (registrados 2026-08-06, antes de migrar)

| Métrica | Desarrollo | Producción (solo lectura) |
|---|---|---|
| Total de filas en `questions` | 10 | 121 |
| Con `course_slug` y `lesson_slug` no nulos | 10 | 117 |
| Con `cardinality(tags) > 0` | 10 | 118 |
| `multiple_choice` publicadas, agrupadas por `(course_slug, lesson_slug)` | 6 lecciones — ver detalle abajo | 7 lecciones — ver detalle abajo |
| Filas en `self_assessment_attempts` | 3 | 78 |
| Filas en `student_grades` del `grade_item` con `kind='self_assessment'` | 0 | 117 |

**Detalle `multiple_choice` publicadas por `(course_slug, lesson_slug)` — desarrollo:**

| `course_slug` | `lesson_slug` | # preguntas |
|---|---|---|
| `analisis-de-algoritmos` | `algoritmos-como-tecnologia` | 2 |
| `analisis-de-algoritmos` | `fundamentos-control-de-versiones-y-flujo-de-trabajo` | 2 |
| `analisis-de-algoritmos` | `sintaxis-de-python` | 1 |
| `estructuras-de-datos` | `encapsulamiento` | 3 |
| `estructuras-de-datos` | `introduccion-al-uml` | 1 |
| `programacion-cientifica` | `variables-tipos-de-datos-y-operadores` | 1 |

> Las 5 preguntas de `analisis-de-algoritmos` fueron sembradas en la Fase 0 vía
> `question-bank-mcp`/API real (`create_question` + `publish_question`, contrato
> **anterior** al spec) para validar el backfill contra datos con forma real:
> dos lecciones con 2 preguntas cada una (repaso de reuso/orden) y una colisión de
> slug deliberada en los tags `recursion` / `recursión` de
> `algoritmos-como-tecnologia` (para ejercitar la detección de colisiones de la
> Fase 2). Las 5 preguntas restantes (`estructuras-de-datos` /
> `programacion-cientifica`) son datos huérfanos de rondas QA anteriores
> (spec-038/039), ya publicados; se dejan tal cual porque no interfieren y
> sirven como ruido realista adicional para el backfill.
>
> Los 3 `self_assessment_attempts` existentes en desarrollo (usuario
> `064e4a19-…`, lecciones `algoritmos-como-tecnologia`,
> `fundamentos-control-de-versiones-y-flujo-de-trabajo`, `sintaxis-de-python`,
> `question_count=5` cada uno) son intentos **huérfanos** de una ronda QA previa:
> el conteo congelado (5) ya no coincide con las preguntas publicadas hoy en esas
> lecciones. Esto reproduce exactamente el escenario D6 ("congelado si ya
> respondió") con una divergencia real entre lo congelado y lo vivo — útil para
> confirmar en la Fase 2 que el backfill y la verificación de paridad usan
> **siempre** el conteo congelado del intento, nunca el recuento en vivo, para
> estos tres casos. No se tocan ni se limpian antes del backfill: forman parte
> deliberada del escenario de prueba.
>
> **Detalle producción** (7 lecciones, 121 preguntas totales — no se listan aquí
> por extenso; ver `spec042_breakdown_reference.json` y `spec042_pairs.json` en
> el scratchpad de la sesión, fuera del repo, para la lista completa por curso y
> las 78 combinaciones `(user_id, course_slug)` con intentos exportadas como
> referencia para la Verificación 3).

---

## Casos de prueba — UI

### TC-042-001 — [ADAPTADO] La UI muestra correctamente la nota congelada de un estudiante con intento previo a la migración
**Rol que ejecuta:** estudiante **spec042-frozen@nodo.test** (sembrado en Fase 0, ver spec-042)
**Criterio cubierto:** "Un estudiante con intento previo ve la misma nota... que antes"; "ninguna fila de `student_grades` cambia como efecto de la migración" — verificado aquí como "la UI concuerda con el resultado ya probado byte a byte en la Fase 5", no como comparación antes/después en pantalla (ver nota de adaptación arriba).
**Precondición:** estudiante `spec042-frozen@nodo.test` (id `3827b151-0357-4592-a154-841eb6a5fe00`) con un intento congelado en `analisis-de-algoritmos/algoritmos-como-tecnologia` (`question_count=2, correct_count=1`) y otro en `fundamentos-control-de-versiones-y-flujo-de-trabajo` (`question_count=1` — **deliberadamente divergente** de las 2 preguntas publicadas hoy en esa lección, D6). Nota ya verificada por RPC: **3.33**. Matriculado en el curso académico `Spec-042 QA — Analisis de Algoritmos` (`f34aaaf6-540a-4915-beca-534e06105464`).
**Datos de prueba usados:** `spec042-frozen@nodo.test` / `TestStudent042!`
**Pasos:**
1. Iniciar sesión como `spec042-frozen@nodo.test`.
2. Abrir `/cuenta/cursos` (o la ruta de la libreta del estudiante) y localizar el curso `analisis-de-algoritmos`.
3. Anotar la nota de autoevaluaciones mostrada, el acumulado `X/Y` y el desglose por lección — en particular la fila de `fundamentos-control-de-versiones-y-flujo-de-trabajo`.
4. Abrir la lección `algoritmos-como-tecnologia` y comprobar que la autoevaluación se muestra como ya respondida (sin poder reenviar).
**Resultado esperado:** la nota mostrada es **3.33**, el acumulado es **2/3**, y la fila de `fundamentos-control-de-versiones-y-flujo-de-trabajo` muestra el denominador **congelado en 1** (no 2, que es el recuento en vivo hoy) — la UI respeta D6 igual que el RPC ya verificado. La lección `algoritmos-como-tecnologia` no permite responder de nuevo.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario — la UI muestra la nota y el desglose esperados, sin observaciones adicionales reportadas.

### TC-042-002 — [ADAPTADO] La UI muestra correctamente la nota con denominador vivo de un estudiante sin intento previo
**Rol que ejecuta:** estudiante **spec042-live@nodo.test** (sembrado en Fase 0) + docente `dev@nodo.local`
**Criterio cubierto:** "el `question_count` de `self_assessment_breakdown` es idéntico antes y después" — verificado aquí como "la UI concuerda con el recuento en vivo ya probado", el caso que detectaría un backfill incompleto (denominador que se encoge ⇒ nota inflada).
**Precondición:** estudiante `spec042-live@nodo.test` (id `21b0a022-fa85-4398-bf1d-3fc7c61d4213`) con `lesson_progress` en `algoritmos-como-tecnologia` y `sintaxis-de-python`, **sin** ningún intento. Nota ya verificada por RPC: **0.00** (denominador vivo 2+1=3, sin respuestas). Matriculado en el mismo curso académico.
**Datos de prueba usados:** `spec042-live@nodo.test` / `TestStudent042!`
**Pasos:**
1. Iniciar sesión como `spec042-live@nodo.test`.
2. Abrir `/cuenta/cursos` y anotar la nota de autoevaluaciones, el acumulado `X/Y` y las filas de `algoritmos-como-tecnologia` y `sintaxis-de-python`.
3. Como docente, abrir la libreta del grupo `Spec-042 QA — Analisis de Algoritmos` y anotar la nota de este estudiante en la columna "Autoevaluaciones".
4. Como docente, pulsar "Recalcular autoevaluaciones" y volver a mirar la nota.
**Resultado esperado:** la nota mostrada al estudiante es **0.00** (o "sin nota" si el criterio de UI para 0 sin denominador difiere — anotar cuál), el acumulado es **0/3**, ambas lecciones muestran "sin responder" con sus denominadores en vivo (2 y 1). La libreta del docente muestra el mismo valor. Recalcular **no cambia** el valor (ya es el correcto). Si aparece cualquier diferencia frente a lo esperado, **detener la ronda** y ejecutar la verificación 3 de la sección final antes de continuar.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario — nota, acumulado y desglose coinciden con lo esperado; el recálculo del docente no altera el valor.

### TC-042-003 — La autoevaluación muestra las preguntas montadas, en el orden de `order_index`
**Rol que ejecuta:** estudiante **E3**
**Criterio cubierto:** puntos 1 y 6 de la reescritura (mismo conjunto y mismo orden en formulario y envío).
**Precondición:** migraciones aplicadas. PA1–PA4 publicadas y montadas en LA con `order_index` 0,1,2,3 (verificado con `list_lesson_questions`). E3 sin intento en LA.
**Datos de prueba usados:** `test-e3-spec042@nodo.test`; `1abe335b-0ce6-41f1-8786-52bd51f002b9`–`4cf273b7-c147-47ff-8fa8-6b1e30400f3c`
**Pasos:**
1. Como E3, abrir `/analisis-de-algoritmos/tablas-hash` y bajar a la autoevaluación de cierre **sin responder**.
2. Anotar el orden de las etiquetas visibles.
3. Recargar la página (F5) dos veces y volver a anotar el orden.
4. Cerrar sesión, volver a entrar y repetir.
**Resultado esperado:** se ven exactamente **4** preguntas, en el orden `[042 PA1] → [042 PA2] → [042 PA3] → [042 PA4]`, que es el de `order_index`. El orden es **estable** entre recargas y entre sesiones (el barajado de spec-034 afecta a las opciones, nunca al orden de las preguntas). No aparece ninguna pregunta de otra lección ni ninguna sin montar.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario — 4 preguntas en el orden esperado, estable entre recargas.
**Hallazgos:** {{observaciones}}

### TC-042-004 — Reordenar el montaje cambia el orden que ve el estudiante
**Rol que ejecuta:** docente vía MCP + estudiante **E3**
**Criterio cubierto:** "Reordenar el montaje cambia el orden en que el estudiante ve las preguntas".
**Precondición:** TC-042-003 ejecutado; E3 **sigue sin enviar** su intento en LA.
**Datos de prueba usados:** `1abe335b-0ce6-41f1-8786-52bd51f002b9`–`4cf273b7-c147-47ff-8fa8-6b1e30400f3c`
**Pasos:**
1. Con `question-bank-mcp` → `reorder_lesson_questions` sobre `analisis-de-algoritmos` / `tablas-hash`, enviar el orden invertido: `[PA4, PA3, PA2, PA1]`.
2. Como E3, recargar la lección (F5).
3. Anotar el orden de las etiquetas.
4. Comprobar que la sección de asistencia/progreso y el resto de la lección no cambian.
**Resultado esperado:** el estudiante ve ahora `[042 PA4] → [042 PA3] → [042 PA2] → [042 PA1]`. El cambio se refleja tras una recarga, sin necesidad de redeploy ni de tocar contenido MDX. Nada más de la lección se altera.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario — el reordenamiento vía API se reflejó de inmediato tras recargar.

### TC-042-005 — La revisión del intento respeta el MISMO orden que el formulario
**Rol que ejecuta:** estudiante **E3**
**Criterio cubierto:** "`getAttemptReview` respeta ese mismo orden" — detecta la divergencia de desempate de D4 (el formulario ordena por `order_index`, la revisión ordenaba por `created_at`).
**Precondición:** TC-042-004 aprobado: LA está reordenada a `[PA4, PA3, PA2, PA1]`, que es **el inverso** del orden por `created_at`. E3 sin intento en LA.
**Datos de prueba usados:** `test-e3-spec042@nodo.test`
**Pasos:**
1. Como E3, con la lección LA abierta, anotar el orden del formulario.
2. Responder las 4 preguntas acertando exactamente **3** (fallar deliberadamente la que aparece en **segunda** posición) y confirmar el envío definitivo.
3. Observar de inmediato la revisión del intento: anotar el orden de las etiquetas y en qué posición aparece la fallada.
4. Recargar (F5) y volver a anotar. Cerrar sesión, entrar de nuevo y repetir.
5. Reordenar de nuevo con `reorder_lesson_questions` a `[PA2, PA1, PA4, PA3]` y recargar la revisión de E3.
**Resultado esperado:** en los pasos 3 y 4 la revisión lista las preguntas en **exactamente el mismo orden** que tenía el formulario (`PA4, PA3, PA2, PA1`), con la fallada en segunda posición y el resultado "3/4". Tras el paso 5, la revisión sigue el nuevo `order_index` (`PA2, PA1, PA4, PA3`) y **el contenido de la revisión no cambia**: la misma opción marcada, el mismo acierto/fallo por pregunta y el mismo "3/4". En ningún momento el formulario y la revisión muestran órdenes distintos.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario en dos mitades — la revisión siguió el orden del formulario original (PA4,PA3,PA2,PA1) con PA3 fallada en 2ª posición y "3/4"; tras reordenar a (PA2,PA1,PA4,PA3) la revisión adoptó el nuevo orden sin alterar el contenido (mismo acierto/fallo, mismo resultado). Confirma que el desempate D4 es idéntico entre formulario y revisión.

### TC-042-006 — Desmontar una pregunta la retira de esa autoevaluación, sin borrarla del banco
**Rol que ejecuta:** docente vía MCP + estudiantes **E4** (LA) y **E3** (revisión previa)
**Criterio cubierto:** "Desmontar una pregunta de una lección la retira de esa autoevaluación sin eliminarla del banco ni afectar sus otros montajes"; punto 7 (fallback a `created_at` para preguntas desmontadas).
**Precondición:** TC-042-005 aprobado (E3 **ya** tiene intento en LA con las 4 preguntas). E4 matriculado, **sin** intento en LA.
**Datos de prueba usados:** `f4ee7ba6-4031-479a-9e98-07388015f413`; `e4518de1-32a5-496e-9d0c-12f8352e1d3d` (montada en LA y LB)
**Pasos:**
1. Con `unmount_question_from_lesson`, desmontar **PA3** de `analisis-de-algoritmos` / `tablas-hash`.
2. Como E4, abrir LA y contar las preguntas del formulario.
3. Como E3 (que ya respondió con 4), recargar LA y revisar su intento.
4. Con `get_question` sobre `f4ee7ba6-4031-479a-9e98-07388015f413`, comprobar que la pregunta sigue existiendo y publicada.
5. Con `list_questions` sin filtros (o filtrando por `keyword`), comprobar que PA3 sigue apareciendo en el banco.
6. Comprobar que **PX**, montada también en LB, sigue apareciendo en la autoevaluación de LB (paso rápido: abrir LB como E5).
**Resultado esperado:** E4 ve **3** preguntas (sin `[042 PA3]`) y su denominador es 3. E3 sigue viendo su revisión **completa de 4 preguntas**, incluida PA3 ya desmontada (fallback a `created_at`), con resultado "3/4" intacto y su nota sin cambios. PA3 sigue existiendo en el banco (`get_question` responde `200`, `is_published: true`) y sus otros montajes, si los tiene, siguen vivos. PX sigue en LB.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario (E4 ve 3 preguntas, E3 conserva su revisión completa de 4). Verificado por API: `get_question` de PA3 devuelve `is_published: true` con `lessons: []` (desmontada, no borrada); PX sigue montada solo en `heaps-y-heapsort` (nunca se tocó su montaje en este caso).

### TC-042-007 — Una misma pregunta montada en dos lecciones aparece en las dos autoevaluaciones
**Rol que ejecuta:** estudiantes **E4** (LA) y **E5** (LB)
**Criterio cubierto:** "Una misma pregunta puede montarse en 2+ lecciones y aparece en la autoevaluación de todas ellas".
**Precondición:** PX publicada y montada en LA **y** en LB con `mount_question_in_lesson` (dos llamadas). E4 sin intento en LA; E5 sin intento en LB.
**Datos de prueba usados:** `e4518de1-32a5-496e-9d0c-12f8352e1d3d`
**Pasos:**
1. Como E4, abrir LA y localizar `[042 PX]` en el formulario.
2. Como E5, abrir LB y localizar `[042 PX]` en el formulario.
3. Comparar el enunciado y las opciones (contenido, no orden) en ambas vistas.
4. Verificación asistida: `list_questions` sobre `e4518de1-32a5-496e-9d0c-12f8352e1d3d` muestra **un solo** `id`, con dos montajes.
**Resultado esperado:** la misma pregunta (mismo `id`, mismo enunciado) aparece en las dos autoevaluaciones, sin duplicarla en el banco. Cada lección la cuenta en su propio denominador. El orden de sus opciones puede diferir entre E4 y E5 (barajado de spec-034), pero el conjunto de opciones es el mismo.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario en la UI. Verificado por API: `get_question` de PX devuelve un único `id` con `lessons` mostrando los dos montajes (`heaps-y-heapsort` order_index 0, `tablas-hash` order_index 3).

### TC-042-008 — Las opciones se siguen barajando por estudiante (spec-034) tras la migración
**Rol que ejecuta:** estudiantes **E4** y **E5**
**Criterio cubierto:** "Las opciones de cada pregunta se siguen barajando por estudiante".
**Precondición:** LA con sus preguntas montadas; ni E4 ni E5 han enviado su intento en LA. E5 matriculado y con acceso a LA.
**Datos de prueba usados:** `test-e4-spec042@nodo.test`, `test-e5-spec042@nodo.test`
**Pasos:**
1. Como E4, abrir LA y anotar el orden de las 4 opciones de la primera pregunta (por su texto: "A", "B", "correcta (C)", "D").
2. Recargar tres veces y comprobar que ese orden **no cambia** para E4.
3. Cerrar sesión, entrar como E5, abrir LA y anotar el orden de las opciones de la misma pregunta.
4. Comparar ambos órdenes.
**Resultado esperado:** el orden de las opciones es **estable por estudiante** entre recargas (semilla `usuario:pregunta`) y **distinto entre E4 y E5** en al menos una de las preguntas. La opción correcta no queda sistemáticamente en la misma posición. Este comportamiento es idéntico al de antes de la migración.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario — orden de opciones estable por estudiante entre recargas y distinto entre E4 y E5.

### TC-042-009 — La clave de respuestas del docente: mismo conjunto, orden de montaje, opciones en orden canónico
**Rol que ejecuta:** docente `dev@nodo.local`
**Criterio cubierto:** "la clave del docente sigue en orden canónico"; punto 3 de la reescritura (gate de rol intacto).
**Precondición:** LA reordenada según TC-042-005 (`[PA2, PA1, PA4, PA3]` menos PA3 si ya se desmontó — anotar el estado real del montaje antes de empezar con `list_lesson_questions`).
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Como docente, abrir `/analisis-de-algoritmos/tablas-hash` y desplegar el panel **"Clave de respuestas"**.
2. Anotar el orden de las preguntas y compararlo con la salida de `list_lesson_questions`.
3. Para cada pregunta, anotar el orden de las opciones y compararlo con el `order_index` de `question_choices` (el que devuelve `get_question`).
4. Cerrar sesión, entrar como estudiante **E4** y navegar a la misma lección buscando explícitamente el panel de clave.
**Resultado esperado:** el docente ve las preguntas en el **mismo orden de montaje** que el estudiante, con las opciones **sin barajar** (orden canónico por `order_index`, idéntico al de `get_question`) y la correcta señalada. El estudiante **no** ve el panel de clave por ningún camino. El gate de rol no cambió con este spec.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario — orden `PA2 → PA1 → PA4 → PX` con opciones canónicas A/B/C/D sin barajar, "C" marcada correcta; E4 no ve el panel.

### TC-042-010 — Completar la lección sigue exigiendo la autoevaluación
**Rol que ejecuta:** estudiante **E4**
**Criterio cubierto:** "Completar una lección sigue exigiendo haber respondido la autoevaluación (spec-033 / spec-037 D8)" — punto 5 de la reescritura, el que alimenta el gate.
**Precondición:** LE con PE1–PE2 publicadas y **montadas**; E4 sin intento en LE.
**Datos de prueba usados:** `test-e4-spec042@nodo.test`; `0a27096c-f113-474a-a3f0-f1afa2e54c59`, `49ebedc5-f774-4ee3-b2d9-3f24bf310f00`
**Pasos:**
1. Como E4, abrir `/analisis-de-algoritmos/counting-radix-y-bucket-sort` sin responder la autoevaluación.
2. Intentar marcar la lección como completada.
3. Leer el mensaje.
4. Responder y enviar la autoevaluación; volver a intentar completar.
5. Repetir el paso 1–2 en una lección **sin** preguntas montadas (por ejemplo `sintesis-del-semestre`, verificando antes con `list_lesson_questions` que está vacía).
**Resultado esperado:** en el paso 2 la lección **no** se marca como completada y se explica que falta responder la autoevaluación; en el paso 4 sí se completa. En el paso 5, una lección sin preguntas montadas se completa sin exigir autoevaluación (el gate depende del conteo de montajes, no de la existencia de la sección).
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude con el navegador (autorizado explícitamente por el usuario en esta sesión). Paso 2: el botón "Completar lección" aparece deshabilitado con el texto "Completa la autoevaluación antes de marcar la lección como finalizada."; un clic no produce efecto (0 de 17 sin cambios). Paso 4: tras responder PE1/PE2 correctamente y confirmar el envío definitivo, el botón se habilita; al pulsarlo la lección queda "Lección completada" (1 de 17 · 6%). Paso 5: en `notacion-o-theta-y-omega` (sin autoevaluación ni preguntas montadas) el botón está habilitado desde el inicio y completa sin exigir nada (2 de 17 · 12%).
**Hallazgos:** {{observaciones}}

### TC-042-011 — Fail-closed: si el estado de la autoevaluación no se puede consultar, no se completa la lección
**Rol que ejecuta:** estudiante **E4**, con inducción de fallo asistida
**Criterio cubierto:** "si la consulta de estado falla, se falla cerrado" (spec-037/D8, punto 5).
**Precondición:** E4 en una lección con preguntas montadas y **sin** intento (usar `sintesis-del-paradigma-de-divide-y-venceras` con 2 preguntas montadas, para no quemar LE). Se induce el fallo de la consulta de conteo sobre `lesson_questions` (revocar temporalmente el `select` de la política RLS para `authenticated`, o detener el stack de Supabase durante la acción) — **requiere autorización explícita del usuario en el momento**, y se revierte inmediatamente después.
**Datos de prueba usados:** `test-e4-spec042@nodo.test`
**Pasos:**
1. Anotar el estado de `lesson_progress` de E4 en esa lección.
2. Inducir el fallo de la consulta de estado (ver precondición).
3. Como E4, intentar marcar la lección como completada.
4. Leer el mensaje mostrado.
5. Revertir el fallo inducido y volver a intentar tras responder la autoevaluación.
6. Verificación asistida: comprobar que en el paso 3 **no** se escribió `completed_at`.
**Resultado esperado:** la lección **no** se marca como completada y se muestra un mensaje de indisponibilidad (`self_assessment_unavailable`), **nunca** un "completada" optimista. No hay escritura de `completed_at`. Tras revertir, el flujo normal funciona. El fail-closed sobrevive al cambio de la consulta a `lesson_questions`.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado con autorización explícita del usuario y navegador real. Se usó `algoritmos-como-tecnologia` (2 preguntas montadas, sin intento de E4) en vez de `sintesis-del-paradigma-de-divide-y-venceras`, por tener datos ya sembrados. Fallo inducido: `REVOKE SELECT ON lesson_questions FROM authenticated` en `mirp-lab`. Con el fallo activo, el botón "Completar lección" aparece deshabilitado con "No pudimos verificar tu autoevaluación. Inténtalo de nuevo en un momento."; un clic no tiene efecto (progreso sin cambios). Se revirtió con `GRANT SELECT` de inmediato. Tras recargar, el flujo normal se restauró: la autoevaluación volvió a mostrarse, se respondió correctamente y la lección se completó sin problema (3 de 17 · 18%). Nota: durante la preparación el túnel SSH se cayó dos veces por causas ajenas a la prueba (mostró "Correo o contraseña incorrectos" en el login por falla de conectividad, no por RLS); se identificó, reconectó y no afectó el resultado.

### TC-042-012 — Un estudiante no ve montajes de preguntas en borrador
**Rol que ejecuta:** estudiante **E4** + docente
**Criterio cubierto:** políticas RLS de D7 (`lesson_questions` legible por el estudiante solo si la pregunta está publicada o es suya).
**Precondición:** una pregunta nueva **en borrador** (creada sin `publish_question`) y **montada** en LA.
**Datos de prueba usados:** `{{pz_borrador}}`
**Pasos:**
1. Con `question-bank-mcp`, crear una pregunta **sin publicar** y montarla en LA.
2. Como E4, abrir LA y contar las preguntas del formulario.
3. Como docente, abrir la clave de respuestas de LA y contar.
4. Publicar la pregunta y repetir el paso 2.
**Resultado esperado:** en el paso 2 la pregunta en borrador **no aparece** ni suma al denominador; en el paso 4, una vez publicada, sí aparece. El estudiante nunca ve el montaje de una pregunta no publicada.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-042-013 — Una pregunta publicada pero NO montada no aparece en ninguna autoevaluación
**Rol que ejecuta:** estudiante **E4** + docente vía MCP
**Criterio cubierto:** el modo de fallo nuevo del flujo de tres pasos (crear → publicar → **montar**), que el spec exige que sea **detectable**.
**Precondición:** PY creada y publicada, **sin** ningún montaje.
**Datos de prueba usados:** `76cbf039-7ad7-4ec4-b6df-2d5dfd340880`
**Pasos:**
1. Como E4, abrir LA y comprobar que `[042 PY]` **no** está.
2. Recorrer LB y LE y comprobar lo mismo.
3. Con `list_lesson_questions` sobre LA, LB y LE, comprobar que PY no figura.
4. Con `list_questions`, comprobar que PY **sí** existe en el banco y está publicada.
5. Montar PY en LA con `mount_question_in_lesson` y recargar LA como E4.
**Resultado esperado:** una pregunta publicada sin montar es invisible para el estudiante en todas las lecciones y **no** afecta a ningún denominador, pero es visible y localizable desde el banco: `list_lesson_questions` da la lista real y permite detectar el olvido (a diferencia del slug mal escrito del modelo anterior, que era indetectable). Al montarla, aparece de inmediato tras recargar.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

---

## Casos de prueba — MCP (`question-bank-mcp`)

> Precondición común a todos: `npm run dev` corriendo en `localhost:3002`, la
> Fase 6 aplicada y el servidor recompilado
> (`npm run build` en `mcp-servers/question-bank-mcp/`), verificado en aislado con
> `./mcp-servers/run-local-mcp.sh question-bank-mcp </dev/null`.

### TC-MCP-042-001 — `list_keywords` devuelve el catálogo y filtra por `kind`
**Herramienta probada:** `list_keywords` en `question-bank-mcp`
**Precondición:** catálogo con al menos `logica` (`tema`), `python` (`lenguaje`), `cierre` (`momento`) y las keywords sembradas desde `tags` en el backfill (con `kind = null`).
**Input de prueba:** (a) sin filtros; (b) `{ "kind": "tema" }`; (c) `{ "q": "pyth" }`; (d) `{ "kind": "inventado" }`
**Output esperado:** (a) lista con `slug`, `label`, `description` y `kind` de cada término, incluidas las sembradas con `kind: null`; (b) solo las de `kind: 'tema'`; (c) solo `python`; (d) error de validación, **no** una lista vacía silenciosa.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-002 — `create_keyword` crea un término del vocabulario controlado
**Herramienta probada:** `create_keyword`
**Precondición:** el slug no existe en el catálogo.
**Input de prueba:** `{ "slug": "Recursión Múltiple", "label": "Recursión múltiple", "kind": "tema", "description": "Preguntas sobre recursión con más de una llamada." }`
**Output esperado:** `201` con el término creado y el `slug` **normalizado** a `recursion-multiple` (minúsculas, sin acentos, espacios → `-`); `label` conserva la forma legible original. Inmediatamente después, `list_keywords` lo devuelve.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-003 — `create_keyword` con slug duplicado devuelve `409`
**Herramienta probada:** `create_keyword`
**Precondición:** `spec042-temporal` ya existe en el catálogo.
**Input de prueba:** `{ "slug": "spec042-temporal", "label": "Otro rótulo distinto", "kind": "tema" }`
**Output esperado:** `409` con mensaje explícito de slug ya existente. **No** hay upsert silencioso: `list_keywords` sigue mostrando el `label` original, no "Otro rótulo distinto". El agente recibe el mensaje original de la API, sin reformular.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-004 — `create_keyword` con `kind` fuera del enum falla
**Herramienta probada:** `create_keyword`
**Precondición:** ninguna.
**Input de prueba:** `{ "slug": "spec042-kind-malo", "label": "Kind inválido", "kind": "legacy" }`
**Output esperado:** error de validación (`422`) indicando los valores admitidos `('tema','lenguaje','momento','ejercicio')`; la keyword **no se crea** (`list_keywords` no la devuelve). Repetir con `kind` omitido: **sí** se crea, con `kind: null` (nullable a propósito, D3) — recordar limpiarla al cerrar la ronda.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-005 — Flujo de tres pasos: `create_question` con `keywords` → `publish_question` → `mount_question_in_lesson`
**Herramienta probada:** `create_question`, `publish_question`, `mount_question_in_lesson`
**Precondición:** `logica` y `cierre` existen en el catálogo. LA con sus montajes conocidos.
**Input de prueba:** `create_question` de tipo `multiple_choice` con `stem: "[042 PM1] …"`, 4 `choices` (la tercera correcta) y `keywords: ["logica", "cierre"]`; luego `publish_question`; luego `mount_question_in_lesson { course_slug: "analisis-de-algoritmos", lesson_slug: "tablas-hash" }`.
**Output esperado:** (1) la pregunta se crea con `keywords: ["cierre","logica"]` en la respuesta y **sin** `course_slug`/`lesson_slug`/`tags` en el objeto devuelto; (2) tras publicar, `is_published: true`; (3) el montaje devuelve la fila con su `order_index` y `list_lesson_questions` de LA la muestra al final de la lista. Invocar `mount_question_in_lesson` **una segunda vez** con los mismos parámetros es **idempotente**: no duplica el montaje ni cambia el `order_index`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-006 — `create_question` con una keyword inexistente devuelve `422` con TODAS las faltantes y no crea la pregunta
**Herramienta probada:** `create_question`
**Precondición:** `logica` existe; `no-existe-1` y `no-existe-2` **no** existen. Anotar el total de filas de `questions` antes.
**Input de prueba:** `create_question` válida en todo lo demás, con `keywords: ["logica", "no-existe-1", "no-existe-2"]`.
**Output esperado:** `422 validation_error` con `details.fieldErrors.keywords` listando **las dos** faltantes en el mismo error (no solo la primera), con el texto de la API: `"La keyword 'no-existe-1' no existe en el catálogo. Créala con POST /api/keywords."` y su equivalente para `no-existe-2`. **La pregunta no se crea**: el total de `questions` es el mismo que antes y `list_questions` no la devuelve. El mensaje llega al agente **sin reformular**.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-007 — `create_question` con `course_slug` / `lesson_slug` / `tags` devuelve `422` apuntando al endpoint correcto
**Herramienta probada:** `create_question`
**Precondición:** ninguna.
**Input de prueba:** tres invocaciones, cada una con un campo prohibido: (a) `course_slug: "analisis-de-algoritmos"`; (b) `lesson_slug: "tablas-hash"`; (c) `tags: ["recursion"]`.
**Output esperado:** las tres devuelven `422` con un mensaje que **nombra el reemplazo**: (a) y (b) apuntan a `POST /api/questions/{id}/lessons` (`mount_question_in_lesson`); (c) apunta a `keywords` + `POST /api/keywords`. En ningún caso el campo se ignora en silencio ni se crea la pregunta. Repetir (a) sobre `update_question` de una pregunta existente: mismo `422`, y la pregunta queda **intacta**.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-008 — `update_question` con `keywords` reemplaza el set y NO altera los montajes
**Herramienta probada:** `update_question`
**Precondición:** una pregunta con `keywords: ["logica","cierre"]` y **dos** montajes (LA y LB). Anotar sus montajes con `list_lesson_questions` de ambas lecciones.
**Input de prueba:** `update_question` con el payload completo de la pregunta y `keywords: ["python"]`.
**Output esperado:** la pregunta queda con `keywords: ["python"]` (reemplazo total del set, `logica` y `cierre` desaparecen de esa pregunta pero **siguen en el catálogo**); los **dos montajes siguen exactamente igual** (mismas lecciones, mismo `order_index`) — D6. Verificarlo abriendo LA y LB como estudiante: las preguntas y su orden no cambian.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-009 — `list_lesson_questions` devuelve las preguntas montadas en orden
**Herramienta probada:** `list_lesson_questions`
**Precondición:** LA con montajes conocidos; PY publicada pero sin montar; una pregunta en borrador montada en LA (TC-042-012).
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "tablas-hash" }`; luego una lección sin montajes; luego un `lesson_slug` inexistente.
**Output esperado:** lista ordenada por `order_index` con `question_id`, `order_index` y datos mínimos de la pregunta (`stem`, `type`, `is_published`); coincide **exactamente** con lo que ve el estudiante en TC-042-003/004, salvo por la pregunta en borrador, que el docente sí ve marcada como no publicada. PY **no** figura. Una lección sin montajes devuelve lista vacía (`200`, no error). Un `lesson_slug` inexistente devuelve lista vacía o `422` de slug no válido — anotar cuál, y que sea coherente con lo documentado.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-010 — `unmount_question_from_lesson` desmonta sin borrar
**Herramienta probada:** `unmount_question_from_lesson`
**Precondición:** PX montada en LA y LB.
**Input de prueba:** `{ "question_id": "e4518de1-32a5-496e-9d0c-12f8352e1d3d", "course_slug": "analisis-de-algoritmos", "lesson_slug": "tablas-hash" }`; luego repetir la misma llamada.
**Output esperado:** la primera llamada desmonta PX de LA; `list_lesson_questions` de LA ya no la devuelve y la de **LB sí**; `get_question` sigue devolviendo la pregunta (`is_published` intacto). La segunda llamada es idempotente: no falla con `500` ni borra otra cosa (`200`/`204` o un `404` explícito y estable — anotar cuál).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-011 — `reorder_lesson_questions` reordena el montaje
**Herramienta probada:** `reorder_lesson_questions`
**Precondición:** LA con exactamente los montajes anotados por `list_lesson_questions`.
**Input de prueba:** la lista completa de `question_id` de LA en orden invertido.
**Output esperado:** `200` con la lista nueva; `list_lesson_questions` devuelve los `order_index` `0..n-1` reasignados en el orden enviado; el cambio se ve en la UI del estudiante tras recargar (TC-042-004). La operación **solo reordena**: no monta ni desmonta nada.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-012 — `reorder_lesson_questions` con una lista que no coincide devuelve `422` y no escribe nada
**Herramienta probada:** `reorder_lesson_questions`
**Precondición:** LA con N montajes; anotar los `order_index` actuales de **todos**.
**Input de prueba:** tres invocaciones: (a) la lista **sin uno** de los `question_id` montados; (b) la lista **más** un `question_id` no montado; (c) la lista con un `question_id` **repetido**.
**Output esperado:** las tres devuelven `422` con un mensaje que indica qué sobra y qué falta; **ninguna escribe**: `list_lesson_questions` devuelve exactamente los mismos `order_index` anotados antes, y la autoevaluación del estudiante no cambia de orden. Este es el caso que garantiza que ninguna llamada pueda vaciar una autoevaluación de un tirón (D6).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-013 — `list_questions` filtra por `keyword`
**Herramienta probada:** `list_questions`
**Precondición:** al menos dos preguntas con `logica` y una con `python` únicamente.
**Input de prueba:** (a) `{ "keyword": "logica" }`; (b) `{ "keyword": "python" }`; (c) `{ "keyword": "no-existe" }`; (d) `{ "tag": "logica" }` (filtro **retirado**).
**Output esperado:** (a) y (b) devuelven **exactamente** las preguntas relacionadas con esa keyword, ni una más; (c) lista vacía (`200`); (d) error de parámetro no reconocido o rechazo explícito — el filtro `tag` ya no existe y no debe aceptarse en silencio. Ninguna respuesta incluye `tags` ni los slugs de curso/lección en el objeto pregunta.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-014 — `list_questions` con `course_slug` / `lesson_slug` sigue funcionando, resuelto vía montaje
**Herramienta probada:** `list_questions`
**Precondición:** LA con sus montajes; PY publicada sin montar; una pregunta con `questions.course_slug` viejo pero **desmontada** durante la ronda (PA3, de TC-042-006).
**Input de prueba:** (a) `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "tablas-hash" }`; (b) solo `{ "course_slug": "analisis-de-algoritmos" }`.
**Output esperado:** los filtros **conservan el nombre** y responden; (a) devuelve exactamente las preguntas **montadas** en LA — incluye las montadas desde otras lecciones (PX si sigue montada), **excluye** PY y **excluye** PA3 aunque su columna vieja `questions.lesson_slug` siga diciendo `tablas-hash` (la resolución es por montaje, no por la columna deprecada); (b) devuelve las montadas en cualquier lección del curso, sin duplicar una pregunta montada en dos lecciones del mismo curso.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-015 — Eliminar una keyword en uso devuelve `409`
**Herramienta probada:** `DELETE /api/keywords/{slug}` — verificación asistida por API (no hay herramienta MCP de borrado; es la única forma de observar este criterio)
**Precondición:** `spec042-temporal` relacionada con al menos una pregunta vía `question_keywords`; y `spec042-kind-null` (creada en TC-MCP-042-004) **sin** ninguna relación.
**Input de prueba:** (a) `DELETE /api/keywords/spec042-temporal`; (b) tras desasociarla de la pregunta con `update_question`, repetir (a); (c) `DELETE /api/keywords/spec042-kind-null`.
**Output esperado:** (a) `409` con mensaje que explica que está en uso (idealmente con el número de preguntas relacionadas); la keyword **sigue en el catálogo** y las preguntas relacionadas no se tocan. (b) y (c) eliminan correctamente. En ningún caso se borran preguntas en cascada: la FK hacia `keywords` es `on delete restrict`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-042-016 — El system prompt y `SKILL.md` describen el flujo nuevo
**Herramienta probada:** documentación de `question-bank-mcp` (revisión asistida, sin invocación)
**Precondición:** Fase 6 completada.
**Input de prueba:** lectura de `docs/mcps/question-bank-agent.system-prompt.md`, `docs/mcps/README.md`, la tabla "Inventario de MCPs" de `CLAUDE.md` y `.claude/skills/lesson-authoring/SKILL.md`.
**Output esperado:** los cuatro documentos (a) describen el flujo obligatorio de **tres pasos** (crear → publicar → montar), (b) prohíben inventar keywords y exigen `list_keywords` antes de asignar, (c) indican que `create_keyword` se **propone al usuario** antes de invocarse, (d) advierten que `update_question` ya no mueve preguntas de lección y que una pregunta publicada sin montar es invisible, y (e) **no mencionan** `tags` ni `course_slug`/`lesson_slug` como campos de la pregunta. Una búsqueda de `tags` y `lesson_slug` en esos archivos no arroja instrucciones vigentes.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

---

## Consultas de verificación de la migración

> Las tres verificaciones de la **Fase 2** del spec, listas para copiar y
> reejecutar. Se corren (1) en desarrollo tras el backfill, (2) **otra vez** tras
> el `create or replace` del punto 8 de la Fase 5, y (3) contra **producción** el
> día del despliegue, **como lectura** y con confirmación explícita del usuario.
> Son válidas mientras existan las columnas deprecadas (D1): después del `DROP`
> del spec de seguimiento dejan de poder ejecutarse.
>
> La expresión de slugificación de abajo debe ser **idéntica** a la de
> `supabase/migrations/20260806000005_seed_keywords_from_tags.sql`. Si la
> migración usa otra, actualizar estas consultas para que coincidan; si no, la
> verificación 2 dará falsos positivos.

### Verificación 1 — Montajes faltantes
**Esperado: cero filas.** Cada fila es una pregunta que la autoevaluación dejará
de ver ⇒ denominador más chico ⇒ **nota inflada**.

```sql
select
  q.id,
  q.course_slug,
  q.lesson_slug,
  q.type,
  q.is_published,
  q.created_at
from public.questions q
where q.course_slug is not null
  and q.lesson_slug is not null
  and not exists (
    select 1
    from public.lesson_questions lq
    where lq.question_id  = q.id
      and lq.course_slug  = q.course_slug
      and lq.lesson_slug  = q.lesson_slug
  )
order by q.course_slug, q.lesson_slug, q.created_at, q.id;
```

Complemento — el `order_index` reproduce el orden anterior (`created_at`, `id`).
**Esperado: cero filas.**

```sql
with esperado as (
  select
    q.id as question_id,
    q.course_slug,
    q.lesson_slug,
    (row_number() over (
       partition by q.course_slug, q.lesson_slug
       order by q.created_at, q.id
     ) - 1)::int as order_index_esperado
  from public.questions q
  where q.course_slug is not null
    and q.lesson_slug is not null
)
select e.*, lq.order_index as order_index_real
from esperado e
join public.lesson_questions lq
  on  lq.question_id = e.question_id
  and lq.course_slug = e.course_slug
  and lq.lesson_slug = e.lesson_slug
where lq.order_index is distinct from e.order_index_esperado
order by e.course_slug, e.lesson_slug, e.order_index_esperado;
```

### Verificación 2 — Keywords faltantes
**Esperado: cero filas** (descontadas las colisiones de slugificación ya
reportadas al usuario, que se listan con la consulta de la sección siguiente).

```sql
with tag_slug as (
  select
    q.id as question_id,
    t.tag,
    trim(both '-' from
      regexp_replace(
        translate(lower(trim(t.tag)), 'áéíóúüñ', 'aeiouun'),
        '[^a-z0-9]+', '-', 'g'
      )
    ) as slug
  from public.questions q
  cross join lateral unnest(q.tags) as t(tag)
  where trim(t.tag) <> ''
)
select ts.question_id, ts.tag, ts.slug,
       (select count(*) from public.keywords k where k.slug = ts.slug) as en_catalogo
from tag_slug ts
where not exists (
        select 1 from public.question_keywords qk
        where qk.question_id  = ts.question_id
          and qk.keyword_slug = ts.slug
      )
   or not exists (
        select 1 from public.keywords k where k.slug = ts.slug
      )
order by ts.question_id, ts.tag;
```

Contraste agregado (preguntas con `tags` que no quedaron con **ninguna** keyword).
**Esperado: cero filas.**

```sql
select q.id, q.tags
from public.questions q
where cardinality(q.tags) > 0
  and not exists (
    select 1 from public.question_keywords qk where qk.question_id = q.id
  )
order by q.created_at, q.id;
```

### Verificación 3 — Paridad del `question_count`, fórmula vieja vs. nueva *(la crítica)*
Réplica exacta de la subconsulta de conteo de `self_assessment_breakdown`
(`20260802000004_self_assessment_grade_rpcs.sql:28-38`), incluido el `coalesce`
de D6 (congelado si ya respondió, vivo si no), evaluada con la fórmula vieja y con
la nueva sobre las mismas filas de `lesson_progress`.

**Esperado: cero filas.** Cualquier diferencia se investiga **antes** de tocar el
RPC: si `question_count_nuevo < question_count_viejo`, la nota del estudiante que
no respondió **sube** sin que nadie lo note.

```sql
with breakdown as (
  select
    lp.user_id,
    lp.course_slug,
    lp.lesson_slug,
    -- Fórmula VIEJA: cuenta por las columnas deprecadas de questions.
    coalesce(
      a.question_count,
      (select count(*)::int
         from public.questions q
        where q.course_slug = lp.course_slug
          and q.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as question_count_viejo,
    -- Fórmula NUEVA: cuenta por la tabla puente lesson_questions.
    coalesce(
      a.question_count,
      (select count(*)::int
         from public.lesson_questions lq
         join public.questions q on q.id = lq.question_id
        where lq.course_slug = lp.course_slug
          and lq.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as question_count_nuevo,
    coalesce(a.correct_count, 0) as correct_count,
    (a.id is not null)           as answered
  from public.lesson_progress lp
  left join public.self_assessment_attempts a
    on  a.user_id     = lp.user_id
    and a.course_slug = lp.course_slug
    and a.lesson_slug = lp.lesson_slug
)
select *
from breakdown
where question_count_viejo is distinct from question_count_nuevo
order by user_id, course_slug, lesson_slug;
```

Verificación 3b — paridad de la **nota final** por `(user_id, course_slug)`, con la
misma fórmula de `apply_self_assessment_grade` (`round(correctas/preguntas*5, 2)`,
`null` si el denominador es 0). **Esperado: cero filas.**

```sql
with breakdown as (
  select
    lp.user_id,
    lp.course_slug,
    coalesce(
      a.question_count,
      (select count(*)::int
         from public.questions q
        where q.course_slug = lp.course_slug
          and q.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as qc_viejo,
    coalesce(
      a.question_count,
      (select count(*)::int
         from public.lesson_questions lq
         join public.questions q on q.id = lq.question_id
        where lq.course_slug = lp.course_slug
          and lq.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as qc_nuevo,
    coalesce(a.correct_count, 0) as correct_count
  from public.lesson_progress lp
  left join public.self_assessment_attempts a
    on  a.user_id     = lp.user_id
    and a.course_slug = lp.course_slug
    and a.lesson_slug = lp.lesson_slug
),
notas as (
  select
    user_id,
    course_slug,
    case when sum(qc_viejo) = 0 then null
         else round((sum(correct_count)::numeric / sum(qc_viejo)) * 5, 2) end as nota_vieja,
    case when sum(qc_nuevo) = 0 then null
         else round((sum(correct_count)::numeric / sum(qc_nuevo)) * 5, 2) end as nota_nueva,
    sum(qc_viejo) as denominador_viejo,
    sum(qc_nuevo) as denominador_nuevo,
    sum(correct_count) as numerador
  from breakdown
  group by user_id, course_slug
)
select *
from notas
where nota_vieja is distinct from nota_nueva
order by user_id, course_slug;
```

Verificación 3c — contraste contra lo **realmente escrito** en la libreta
(`student_grades` del ítem `kind='self_assessment'`), para detectar notas que
cambien por efecto de un recálculo posterior a la migración.
**Esperado: cero filas.**

```sql
with notas_calculadas as (
  -- Reemplazar por el bloque `notas` de la verificación 3b (columna nota_nueva).
  select null::uuid as user_id, null::text as course_slug, null::numeric as nota_nueva
  where false
)
select
  e.student_id,
  ac.course_slug,
  sg.score      as nota_en_libreta,
  n.nota_nueva  as nota_recalculada
from public.student_grades sg
join public.grade_items gi     on gi.id = sg.grade_item_id and gi.kind = 'self_assessment'
join public.enrollments e      on e.id = sg.enrollment_id
join public.academic_courses ac on ac.id = e.academic_course_id
left join notas_calculadas n
  on  n.user_id     = e.student_id
  and n.course_slug = ac.course_slug
where sg.score is distinct from n.nota_nueva
order by e.student_id, ac.course_slug;
```

### Colisiones de slugificación de `tags`
Dos `tags` distintos que producen el mismo `slug` (p. ej. `recursión` y
`recursion`). El backfill los fusiona con `on conflict do nothing`, conservando el
**primer** `label`. **Si esta consulta devuelve filas, reportarlas al usuario
antes de continuar con la Fase 3** y anotarlas aquí.

```sql
with tags_distintos as (
  select distinct trim(t.tag) as tag
  from public.questions q
  cross join lateral unnest(q.tags) as t(tag)
  where trim(t.tag) <> ''
),
slugged as (
  select
    tag,
    trim(both '-' from
      regexp_replace(
        translate(lower(tag), 'áéíóúüñ', 'aeiouun'),
        '[^a-z0-9]+', '-', 'g'
      )
    ) as slug
  from tags_distintos
)
select
  slug,
  count(*)                     as tags_distintos,
  array_agg(tag order by tag)  as tags_originales
from slugged
group by slug
having count(*) > 1
order by slug;
```

| Slug resultante | Tags originales fusionados | Reportado al usuario | Decisión |
|---|---|---|---|
| {{slug}} | {{tag-a}}, {{tag-b}} | ⬜ | {{conservar / crear término aparte}} |

---

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: **29** (13 `TC-042-*` + 16 `TC-MCP-042-*`)
- Verificación 1 (montajes faltantes): ⬜ Pendiente — resultado: {{filas}}
- Verificación 2 (keywords faltantes): ⬜ Pendiente — resultado: {{filas}}
- Verificación 3 (paridad de `question_count`): ⬜ Pendiente — resultado: {{filas}} (**esperado: 0**)
- Verificación 3 reejecutada tras el `create or replace` del RPC: ⬜ Pendiente
- Colisiones de slugificación reportadas al usuario: {{lista o "ninguna"}}
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
  - Orden inverso de creación: desmontar preguntas (`unmount_question_from_lesson`) → eliminar preguntas (`delete_question`) → eliminar keywords de prueba (`DELETE /api/keywords/{slug}`, ya sin uso) → `unenroll_student` + `delete_student` de E1–E5.
  - Los intentos de `self_assessment_attempts` y las filas de `student_grades` de los estudiantes de prueba se eliminan en cascada al borrar las matrículas; verificarlo y, si algo queda huérfano, **reportarlo con el identificador exacto en lugar de borrarlo en base**.
