# test-050 — Fallos de infraestructura en envíos y control de acceso

> Ronda asociada a `docs/specs/spec-050-errores-supabase-envios.md`.
> **Estado: pendiente de implementación** — los casos nacen con el spec y se
> ejecutan cuando el usuario apruebe e implemente el paquete.

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
| Curso académico de prueba | *(sin endpoint — ver [[DEBT-060]])* | `{{id}}` | ⬜ |
| Estudiante de prueba | `students-mcp.create_student` | `{{id}}` | ⬜ |
| Matrícula del estudiante | `students-mcp.enroll_student` | `{{id}}` | ⬜ |
| Pregunta multiple_choice | `question-bank-mcp.create_question` | `{{id}}` | ⬜ |
| Pregunta abierta (`open_text`) | `question-bank-mcp.create_question` | `{{id}}` | ⬜ |
| Evaluación A/B/C con ambas preguntas | `assignment-mcp.create_assignment_group` | `{{id}}` | ⬜ |

> **Nota:** el alta del curso académico sigue sin endpoint ([[DEBT-060]]); habrá
> que insertarlo por `psql` con confirmación explícita del usuario, como se hizo
> en test-046, o reutilizar el curso que quedara de aquella ronda.

**Entorno de pruebas:** desarrollo (`mirp-lab`)
**Fecha de la ronda:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-050-003 — El estudiante no pierde sus respuestas tras un envío fallido
**Cubre:** criterio de aceptación 7
**Precondición:** la de TC-050-001, justo después de su paso 4.
**Pasos:**
1. Restaurar el acceso a la base.
2. Recargar la página de la evaluación.
3. Reintentar el envío.
**Resultado esperado:** las respuestas siguen ahí, íntegras; el reintento se
completa con normalidad y produce la nota correcta (no 0).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-050-007 — Contenido docente sensible sigue fallando cerrado
**Cubre:** D5 — verificar que el fix no abre nada de más
**Precondición:** sesión de **estudiante**; base degradada como en TC-050-006.
**Pasos:**
1. Como estudiante, intentar acceder a `/{courseSlug}/{lessonSlug}/apuntes`
   (contenido exclusivo de docente, spec-044).
2. Repetir con la clave de respuestas de la lección.
**Resultado esperado:** el contenido **no** se muestra en ningún caso. Un
estado `unavailable` nunca debe convertirse en acceso concedido.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-050-008 — La ruta API responde 503, no 404
**Cubre:** criterio de aceptación 5
**Precondición:** intento válido `in_progress`; base degradada.
**Pasos:**
1. Con las DevTools abiertas (pestaña Red), pulsar "Enviar evaluación".
2. Inspeccionar la respuesta de `POST /api/submissions/{id}/submit`.
**Resultado esperado:** `503` con código `service_unavailable`. Hoy responde
`404 "Intento no encontrado"` (mentira: el intento existe) o `400`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}
**Resultado en producción:** {{pendiente — registrar aquí el listado o "sin envíos afectados"}}

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 10
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Reversión de los `REVOKE`/`GRANT` usados para simular fallos: ⬜ Pendiente
- Limpieza de datos de prueba: ⬜ Pendiente
