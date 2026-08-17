# test-050 — Fallos de infraestructura en envíos y control de acceso

> Ronda asociada a `docs/specs/spec-050-errores-supabase-envios.md`.
> **Estado: ejecutada — 10/10 casos aprobados (2026-08-16).** Ver "Resumen de
> la ronda" al final del archivo.

## Técnica de simulación del fallo

Todos los casos de esta ronda necesitan que Supabase sea **inalcanzable con la
sesión ya iniciada**. Es la misma técnica que usaron test-037 y test-046:

```bash
# Cortar el túnel (simula la caída)
pkill -f "ssh.*-L 54321.*mirp-lab"

# Restaurar
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
  -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab
```

> ⚠️ **Cortar el túnel también tumba Supabase Auth**, y spec-046 hace que el
> middleware responda `503` antes de llegar a la página. Para aislar "Postgres
> caído / Auth sano" —que es el escenario de varios casos de esta ronda— hay
> que degradar solo la consulta, no toda la instancia. Dos opciones a decidir
> **antes** de ejecutar la ronda:
>
> - **(a)** Revocar temporalmente los permisos de las tablas implicadas en la
>   base de desarrollo (`REVOKE SELECT ON public.answers FROM authenticated;`),
>   lo que produce un `error` de Postgres real con Auth funcionando. Es el que
>   mejor reproduce el escenario de [[DEBT-059]] (consulta que falla bajo
>   carga, Auth sano). Requiere confirmación del usuario por tocar la base
>   directamente, y **revertir el `GRANT` al terminar cada caso**.
> - **(b)** Cortar el túnel entero y aceptar que se está probando el escenario
>   combinado (Auth + Postgres caídos), que es el que spec-046 ya cubre.
>
> **Recomendado: (a)** para TC-050-001..006 —son precisamente los casos que
> spec-046 dejó fuera— y (b) solo para TC-050-009.

## Datos de prueba

> Recursos a crear vía API/MCP antes de la ronda. Se completan al ejecutarla.
> Deben eliminarse al cerrarla.

| Recurso | Endpoint / MCP de creación | Identificador | Eliminado |
|---------|---------------------------|---------------|-----------|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` (`7207c852-dd6c-4df4-ac33-99985c36e26c`) | n/a |
| Curso académico de prueba | `INSERT` manual vía `psql` en `mirp-lab` (sin endpoint, [[DEBT-060]]) | `d435eacc-ee95-4461-8b33-aeba180b440e` (`TEST050ED`, slug `estructuras-de-datos`, código `TEST050XY`) | ⬜ |
| Estudiante de prueba A | `students-mcp.create_student` | `0f9e753d-1c82-4f25-bfd0-9ca30e0569c2` (`test-spec050@nodo.local` / `TestSpec050!`) | ⬜ |
| Matrícula del estudiante A (creada junto con el estudiante) | `students-mcp.create_student` (`academic_course_id`) | `8f4edc46-76a7-4053-9111-7660ab0c0ab9` | ⬜ (en cascada por `delete_student`) |
| Estudiante de prueba B (TC-050-002, intento A ya agotado) | `students-mcp.create_student` | `3c6c194c-2be8-424e-bf8e-26e1a1d0bc69` (`test-spec050b@nodo.local` / `TestSpec050B!`), matrícula `58e6cc6a-e385-4be0-83ac-ddcd721d8412` | ⬜ (en cascada) |
| Estudiante de prueba C (TC-050-009, camino feliz original) | `students-mcp.create_student` | `853a4462-7899-4147-93df-163b61c3f27a` (`test-spec050c@nodo.local` / `TestSpec050C!`), matrícula `e35d4f59-66f5-4ce4-a75d-0d609fb35aad` | ⬜ (en cascada) |
| Estudiante de prueba D (re-verificación de TC-050-009 tras el fix de `finalizeGrading`) | `students-mcp.create_student` | `eebbb2a2-0ab7-417d-b159-22a0eff89de9` (`test-spec050d@nodo.local` / `TestSpec050D!`), matrícula `c70235dc-3d65-46cb-b43d-7a7950a06b33` | ⬜ (en cascada) |
| Pregunta multiple_choice | `question-bank-mcp.create_question` + `publish_question` | `2799e28a-b130-484b-a4a7-d2727de28658` | ⬜ |
| Pregunta abierta (`open_text`) | `question-bank-mcp.create_question` + `publish_question` | `faeb32d0-440a-46f3-9173-e65154a52b0f` | ⬜ |
| Evaluación con variantes A/B (2 mín.) con ambas preguntas, publicada | `assignment-mcp.create_assignment_group` + `publish_assignment_group` | `0219cfd1-e25e-4973-bf8f-864542bb9361` (variante A: `569d5174-e0f2-47a1-8ff8-5d3af60e68ab`, variante B: `15787348-bb82-4d82-8365-beb5e4ed5e89`) | ⬜ |

**Entorno de pruebas:** desarrollo (`mirp-lab`)
**Fecha de la ronda:** 2026-08-16

## Casos de prueba

### TC-050-001 — Enviar una evaluación con la lectura de respuestas caída no produce una nota
**Cubre:** criterio de aceptación 1
**Precondición:** estudiante con un intento `in_progress` y respuestas ya
guardadas; `SELECT` revocado sobre `public.answers`.
**Pasos:**
1. Como estudiante, abrir la evaluación y responder todas las preguntas.
2. Verificar que las respuestas se guardaron (recargar: siguen ahí).
3. Revocar el `SELECT` sobre `answers`.
4. Pulsar "Enviar evaluación".
**Resultado esperado:** mensaje de servicio no disponible (no "Error al
enviar." genérico, no una nota). El intento sigue `in_progress`. **Ninguna**
escritura en `submissions.auto_score` / `final_score` ni en `student_grades`.
**Verificación por API:** consultar el `submission` y confirmar
`status = 'in_progress'`, `auto_score` sin cambios.
**Estado:** ✅ Aprobado
**Hallazgos:** `submission_id c4ee550a-d428-484b-a340-0e0110f85b68`. UI mostró
"No pudimos registrar tu envío. Tus respuestas siguen guardadas — intenta de
nuevo en un momento." (mensaje honesto, no "Error al enviar." genérico).
`POST /api/submissions/{id}/submit` devolvió `503` (cubre también el criterio
de TC-050-008). Verificado por `psql`: `status='in_progress'`, `auto_score`
y `final_score` en `NULL`, `submitted_at` en `NULL`.

### TC-050-002 — Una evaluación con preguntas abiertas no se autocierra en 0
**Cubre:** criterio de aceptación 2 — *el caso más importante de la ronda*
**Precondición:** evaluación que incluye al menos una pregunta `open_text`;
intento `in_progress` con ambas respondidas.
**Pasos:**
1. Responder la pregunta de opción múltiple y la abierta.
2. Degradar la lectura de `assignment_questions` (o del RPC
   `get_variant_answer_key`).
3. Enviar.
**Resultado esperado:** el envío **no** pasa a `status = 'graded'` ni propaga
nada a la libreta. Sin el fix, este es el caso que produce un cero en firme
sobre una evaluación que debía ir a revisión manual.
**Verificación por API:** `submissions.status ≠ 'graded'`; no existe fila nueva
en `student_grades` para esa matrícula e ítem.
**Estado:** ✅ Aprobado
**Hallazgos:** `submission_id c05c4531-e693-4820-8bd5-b6f464c76de6` (segundo
estudiante de prueba, `test-spec050b@nodo.local`, creado porque el máximo de
intentos del primero ya estaba agotado). Con `assignment_questions` degradada,
la UI mostró el mismo mensaje honesto de servicio no disponible. Verificado
por `psql`: el envío quedó en `status='in_progress'` (ni siquiera avanzó a
`submitted`, D1 falla cerrado antes de cualquier escritura) y `student_grades`
no tiene ninguna fila para esa matrícula. Sin el fix, este escenario producía
un cero en firme sobre una evaluación que debía ir a revisión manual.

### TC-050-003 — El estudiante no pierde sus respuestas tras un envío fallido
**Cubre:** criterio de aceptación 7
**Precondición:** la de TC-050-001, justo después de su paso 4.
**Pasos:**
1. Restaurar el acceso a la base.
2. Recargar la página de la evaluación.
3. Reintentar el envío.
**Resultado esperado:** las respuestas siguen ahí, íntegras; el reintento se
completa con normalidad y produce la nota correcta (no 0).
**Estado:** ✅ Aprobado
**Hallazgos:** Tras restaurar el `GRANT` y recargar, las respuestas seguían
íntegras (opción `O(n)` marcada, texto de la pregunta abierta completo).
Reenvío exitoso: redirigió a `/resultados`, `status='submitted'`,
`auto_score=2.00` (correcto — la MC de 2 pts fue acertada), la pregunta
abierta quedó con `text_response` preservado y sin autocalificar (pendiente
de revisión docente, como corresponde a `open_text`). No 0 en firme.

### TC-050-004 — `max_attempts` no se salta ante un fallo de conteo
**Cubre:** criterio de aceptación 3
**Precondición:** evaluación con `max_attempts = 1` y un intento ya
**entregado** por el estudiante (sin `in_progress` pendiente).
**Pasos:**
1. Degradar la lectura de `submissions`.
2. Como estudiante, intentar iniciar un intento nuevo.
**Resultado esperado:** rechazo con mensaje de infraestructura. **No** se crea
un `submission` con `attempt_number = 1` duplicado ni se concede un segundo
intento.
**Verificación por API:** contar los `submissions` de esa matrícula y grupo —
debe seguir siendo 1.
**Estado:** ✅ Aprobado
**Hallazgos:** Reutilizado el estudiante A (intento ya `submitted`). Con
`submissions` degradada, la UI mostró "No pudimos verificar tus intentos
anteriores. Intenta de nuevo en un momento." — rechazo honesto, no un
intento nuevo silencioso. Verificado por `psql`: sigue existiendo exactamente
1 `submission` para esa matrícula/grupo (sin duplicado).

### TC-050-005 — Finalizar una calificación con el contexto de revisión ilegible falla visiblemente
**Cubre:** criterio de aceptación 4
**Precondición:** envío en `status = 'submitted'` con una pregunta abierta ya
calificada a mano por el docente (`manual_score` > 0).
**Pasos:**
1. Como docente, abrir el panel de revisión y confirmar que la nota manual está
   registrada.
2. Degradar el RPC `get_submission_review_context`.
3. Pulsar "Finalizar calificación".
**Resultado esperado:** error visible; **no** se guarda un `final_score` que
ignore el `manual_score`. Sin el fix, la nota manual del docente se descarta en
silencio y el estudiante recibe un final más bajo.
**Verificación por API:** `submissions.final_score` sin cambios y `status`
sigue en `submitted`.
**Estado:** ✅ Aprobado
**Hallazgos:** `submission_id c05c4531-e693-4820-8bd5-b6f464c76de6` (envío del
estudiante B, ya en `submitted` tras corregir su intento en TC-050-002/003
implícitamente al reenviar). Nota manual de la pregunta abierta guardada
primero (`manual_score=2.00`, confirmado "Guardado"). Con el RPC
`get_submission_review_context` degradado (`REVOKE EXECUTE ... FROM PUBLIC,
authenticated` — **nota metodológica**: Postgres otorga `EXECUTE` a `PUBLIC`
por defecto en funciones nuevas, así que un `REVOKE` dirigido solo a
`authenticated` no basta; hay que revocar también de `PUBLIC`, si no la
llamada sigue funcionando y el caso da un falso negativo — como pasó en el
primer intento sobre `c4ee550a`, que terminó finalizando con éxito y quedó
como estado real, no una prueba fallida), "Finalizar calificación" mostró
"No pudimos verificar el contexto de revisión. Intenta de nuevo — tus
calificaciones manuales ya guardadas no se perdieron." Verificado por `psql`:
`status='submitted'` (no avanzó a `graded`), `final_score` en `NULL`,
`manual_score=2.00` intacto.

### TC-050-006 — Un docente dueño del curso no es expulsado como "no matriculado"
**Cubre:** criterio de aceptación 6
**Precondición:** sesión iniciada como docente dueño de un curso; Auth sano.
**Pasos:**
1. Degradar la lectura de `academic_courses` (o de `user_roles`).
2. Navegar a `/{courseSlug}`.
**Resultado esperado:** página de servicio no disponible
(`/servicio-no-disponible`), **no** una redirección a
`/cuenta/cursos?sinAcceso=…`, que afirma en falso que no tiene acceso a su
propio curso.
**Estado:** ✅ Aprobado
**Hallazgos:** `dev@nodo.local` tiene rol `admin` además de `teacher`, así que
degradar solo `academic_courses` no bastaba (la rama `admin` de
`hasCourseAccess` resuelve antes de tocar `academic_courses` y no estaba
degradada — primer intento cargó la lección con normalidad, sin pasar por el
camino que este caso quiere probar). Corregido degradando también
`user_roles`. Con ambas tablas degradadas, redirigió correctamente a
`/servicio-no-disponible` (no a `?sinAcceso=`) — cumple el criterio de
aceptación. **Hallazgo menor (no bloqueante):** el texto de esa página
("El servicio de autenticación no está respondiendo") es el de spec-046 y
asume específicamente una caída de Auth; aquí Auth estaba sano y la causa
real fue una lectura de Postgres (`academic_courses`/`user_roles`) — mensaje
técnicamente inexacto aunque el destino y el comportamiento (fallar cerrado,
no acceso falso) sean correctos. D5 del spec ya documentó la decisión de
reutilizar esta página en vez de crear una nueva; el matiz de copy quedó sin
contemplar. Registrado en `docs/specs/backlog.md` como parte de
[[DEBT-065]] (hallazgo confirmado también por `@reviewer` en la Fase 6).

### TC-050-007 — Contenido docente sensible sigue fallando cerrado
**Cubre:** D5 — verificar que el fix no abre nada de más
**Precondición:** sesión de **estudiante**; base degradada como en TC-050-006.
**Pasos:**
1. Como estudiante, intentar acceder a `/{courseSlug}/{lessonSlug}/apuntes`
   (contenido exclusivo de docente, spec-044).
2. Repetir con la clave de respuestas de la lección.
**Resultado esperado:** el contenido **no** se muestra en ningún caso. Un
estado `unavailable` nunca debe convertirse en acceso concedido.
**Estado:** ✅ Aprobado
**Hallazgos:** Como estudiante (test-spec050@nodo.local), con
`academic_courses` y `user_roles` degradadas, `GET
/estructuras-de-datos/fundamentos-control-de-versiones/apuntes` redirigió a
`/servicio-no-disponible` **antes** de llegar al chequeo propio de la página
de apuntes — el `layout.tsx` del segmento `[lessonSlug]` ya llama
`requireCourseAccess` y falla cerrado ahí. Contenido nunca se sirvió. Revisado
también en código (sin necesidad de repetir en vivo, mismo mecanismo): la
clave de respuestas en `page.tsx` de la lección está condicionada a
`access.ok && (access.reason === "owner" || access.reason === "admin")` —
con `access.ok=false` (unavailable) esa rama nunca es verdadera, así que no
hay forma de que un estudiante la vea por una caída de infraestructura.

### TC-050-008 — La ruta API responde 503, no 404
**Cubre:** criterio de aceptación 5
**Precondición:** intento válido `in_progress`; base degradada.
**Pasos:**
1. Con las DevTools abiertas (pestaña Red), pulsar "Enviar evaluación".
2. Inspeccionar la respuesta de `POST /api/submissions/{id}/submit`.
**Resultado esperado:** `503` con código `service_unavailable`. Hoy responde
`404 "Intento no encontrado"` (mentira: el intento existe) o `400`.
**Estado:** ✅ Aprobado
**Hallazgos:** Cubierto con la misma evidencia de TC-050-001: DevTools → Red
mostró `POST /api/submissions/c4ee550a-d428-484b-a340-0e0110f85b68/submit` →
`503`. No se repitió por separado porque es la misma llamada del mismo caso
de fondo (envío con `answers` degradada).

### TC-050-009 — No hay regresión en el flujo normal
**Cubre:** que el fix no rompa el camino feliz — el riesgo real de fallar cerrado
**Precondición:** base **sana**, túnel activo, evaluación completa disponible.
**Pasos:**
1. Iniciar un intento, responder todas las preguntas y enviar.
2. Verificar la nota de la parte automática.
3. Como docente, calificar la pregunta abierta y finalizar.
4. Verificar que la nota llega a la libreta del estudiante.
**Resultado esperado:** todo el flujo funciona exactamente igual que antes del
spec. Ningún mensaje de servicio no disponible en condiciones normales.
**Estado:** ✅ Aprobado
**Hallazgos:** Requirió un tercer estudiante de prueba (`test-spec050c@nodo.local`,
los dos anteriores ya habían agotado su único intento) y vincular un ítem de
calificación nuevo (`a0641b8e-2878-4281-8f4d-5b4d4e6b9fc9`, creado desde la
pestaña Calificaciones) al grupo de evaluación vía
`assignment-mcp.update_assignment_group` — no existía antes en la ronda.
`submission_id 647b6c57-ee0a-4521-a967-c9f6533e86d5`: envío con todo sano
→ `auto_score=2.00` correcto de inmediato; docente calificó la abierta
(3/3) y finalizó sin fricción → `status='graded'`, `final_score=5.00`.
Verificado por `psql`: `student_grades` tiene la fila propagada
(`grade_item_id a0641b8e...`, `score=5.00`, igual al `final_score`). Ningún
mensaje de servicio no disponible en ningún paso — sin regresión del camino
feliz.

**Re-verificación (2026-08-16, tras la 3ª pasada de `@reviewer`):** este caso
se había ejecutado antes de que `finalizeGrading` cambiara de orden
(propagar antes de marcar `graded`, en vez de después — hallazgo de la 2ª
pasada). Con un cuarto estudiante de prueba
(`test-spec050d@nodo.local`, `submission_id c773c4b7-0624-4612-b241-c35def58cfc7`)
se repitió el camino feliz completo contra el código final: `auto_score=2.00`
correcto, docente calificó la abierta (3/3) y finalizó sin fricción →
`status='graded'`, `final_score=5.00`, `student_grades.score=5.00` para esa
matrícula. El nuevo orden no cambia el resultado del camino feliz.

### TC-050-010 — Diagnóstico de datos ya corrompidos
**Cubre:** criterio de aceptación 8
**Precondición:** Fase 5 implementada; consulta lista.
**Pasos:**
1. Ejecutar la consulta contra la base de **desarrollo** y validar que su lógica
   detecta el caso plantado a propósito (dejar un envío en el estado que produce
   el bug antes del fix, o insertarlo a mano con confirmación del usuario).
2. Con confirmación explícita del usuario, ejecutarla contra **producción**.
**Resultado esperado:** listado con curso, estudiante, evaluación y fecha de
cada envío sospechoso — o confirmación de que no hay ninguno. **Ninguna nota se
modifica.**
**Estado:** ✅ Aprobado
**Hallazgos:** 🔴 **Bug real encontrado en la propia consulta de diagnóstico**
al ejecutar el paso 1 (validar contra un caso plantado). El primer intento con
un envío corrompido a propósito (`c05c4531-e693-4820-8bd5-b6f464c76de6`:
`status='graded'`, `auto_score=0`, `final_score=0`, `is_correct=NULL` en la
respuesta multiple_choice) dio **0 filas** — falso negativo. Causa: en una
evaluación con variantes A/B/C (spec-039), `assignments.academic_course_id` y
`assignments.title` quedan `NULL` en la fila de la variante — esos datos viven
en `assignment_variant_groups`. El `INNER JOIN` directo de la consulta a
`academic_courses` descartaba en silencio **todos** los envíos de evaluaciones
con variantes, que son la mayoría (`assignment-mcp` exige ≥2 variantes).
Corregido en ambos scripts (`.sql` y `.mjs`) con `LEFT JOIN` a
`assignment_variant_groups` + `COALESCE` para resolver curso y título por
cualquiera de las dos rutas. Reverificado tras el fix: el caso plantado
aparece correctamente (`respuestas_mc_sin_evaluar=1`). Envío revertido a su
estado real anterior tras la prueba (sin dejar datos de prueba corrompidos).
No se modificó ninguna nota real de estudiante en ningún momento.
**Resultado en producción:** sin envíos afectados — 0 de 0 envíos `graded` en
producción (verificado con la consulta ya corregida; el resultado no cambió
respecto a la corrida original porque la ausencia de filas de origen hacía
que el bug del JOIN nunca llegara a activarse ahí, pero si hubiera habido
envíos con variantes corrompidos, habrían quedado invisibles sin este fix).

## Resumen de la ronda

- Aprobados: 10 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: **[[DEBT-065]]**, creada tras
  la revisión de `@reviewer` sobre esta misma rama — agrupa el hallazgo de
  copy de TC-050-006 (mensaje de `/servicio-no-disponible` específico de Auth
  reutilizado para un caso de Postgres) junto con otros tres hallazgos menores
  de la revisión de código (`checkSelfAssessmentAnswer` colapsando
  `unavailable`, `startNewAttemptAction`/acciones sin consumidor, y
  `getSubmissionForReview` sin indicio visible de infraestructura degradada
  en el panel del docente). El bug de
  TC-050-010 (JOIN roto en la consulta de diagnóstico para evaluaciones con
  variantes) se corrigió dentro de la misma sesión, en los propios scripts de
  diagnóstico — no es deuda del código de producción, así que no aplica
  backlog.
- Reversión de los `REVOKE`/`GRANT` usados para simular fallos: ✅ Completada
  — verificado con una consulta final que confirma los 6 permisos tocados
  (`answers`, `assignment_questions`, `submissions`, `academic_courses`,
  `user_roles`, `get_submission_review_context`) de vuelta en su estado sano.
- Limpieza de datos de prueba: ⬜ Pendiente — el usuario pidió **conservar**
  los datos de esta ronda para una posible segunda ronda (mismo criterio que
  spec-051). IDs a limpiar cuando corresponda: curso
  `d435eacc-ee95-4461-8b33-aeba180b440e` (slug `estructuras-de-datos`, SQL
  directo — DEBT-060), estudiantes `0f9e753d-1c82-4f25-bfd0-9ca30e0569c2`,
  `3c6c194c-2be8-424e-bf8e-26e1a1d0bc69`, `853a4462-7899-4147-93df-163b61c3f27a`,
  `eebbb2a2-0ab7-417d-b159-22a0eff89de9`
  (`delete_student`, students-mcp — elimina en cascada matrículas/envíos),
  preguntas `2799e28a-b130-484b-a4a7-d2727de28658` y
  `faeb32d0-440a-46f3-9173-e65154a52b0f` (`delete_question`, requiere borrar
  antes la evaluación que las usa), evaluación
  `0219cfd1-e25e-4973-bf8f-864542bb9361` (`delete_assignment_group` —
  fallará con 409 porque ya tiene respuestas reales de estudiantes; requiere
  borrar primero los envíos o decidir conservar la evaluación), ítem de
  calificación `a0641b8e-2878-4281-8f4d-5b4d4e6b9fc9` (sin herramienta MCP —
  eliminar desde la pestaña Calificaciones del panel docente o por SQL).
