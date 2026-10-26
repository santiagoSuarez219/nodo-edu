# test-064 — Resultados de evaluaciones accesibles tras el cierre

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Pregunta `code_snippet` "[TEST-064] Observa el código…" (publicada) | `question-bank-mcp` → `create_question` + `publish_question` | `7a806270-c03f-458e-82cb-439bb1309244` | ✅ |
| Pregunta `open_text` "[TEST-064] Explica… nodo" (publicada) | `question-bank-mcp` → `create_question` + `publish_question` | `5d348667-7270-4b0c-9e7e-7c53becb4eba` | ✅ |
| Grupo G-submit (`submit`, 2 intentos, variantes A/B: MC + code_snippet + open_text, 5 pts) en DEV-EDD `9f423f49-…` | `assignment-mcp` → `create_assignment_group` + `publish_assignment_group` | `7c8351fa-ea0b-4f79-9357-c05d1e3a1a01` | ✅ |
| Grupo G-close (`close`, 1 intento, 2 MC) | ídem | `a872ea06-e990-4ad0-a12f-e3a7336ede11` | ✅ |
| Grupo G-never (`never`, 1 intento, 2 MC) | ídem | `9aa4c434-1ab6-41cb-93b6-cb5e6defb19f` | ✅ |
| Grupo G-sinenvio (`submit`, 1 intento, 2 MC; estudiante 1 nunca lo abre, estudiante 2 lo deja `in_progress`) | ídem | `c79c5cc8-f264-4833-97ba-8a53f3647966` | ✅ |
| Grupo G-limite (`submit`, 2 intentos, 2 MC; añadido para TC-064-011; envíos: intento 1 entregado + intento 2 `in_progress`) | `assignment-mcp` → `create_assignment_group` + `publish_assignment_group` | `e2d9dd3e-0456-4619-a61e-70791a89570e` | ✅ |
| Estudiantes `dev-estudiante1/2@nodo.local` (sembrados, matriculados en DEV-EDD; `seed:dev`) | — (preexistentes, no se borran) | `88db2cf9-…` / `65c0a5b7-…` | n/a (no se borran) |
| Envíos y respuestas de los estudiantes | UI del estudiante / revisión docente | — | ✅ |

> Estrategia de ventana: los grupos se crean con `closes_at` = 2026-10-25T21:30Z (abiertos) para que los estudiantes puedan entregar; para simular el cierre se adelanta `closes_at` al pasado con `update_assignment_group`.

**Entorno de pruebas:** desarrollo (`nodo-dev`, puerto 3002)
**Fecha de la ronda:** 2026-10-24 (navegador autorizado por el usuario)

## Casos de prueba

> **Nota de ejecución (2026-10-26):** los casos marcados ✅ los ejecutó Claude en el navegador por autorización explícita del usuario y se basan en lo observado (texto de página, capturas y códigos HTTP). Quedan **pendientes de confirmación del usuario** antes de darlos por cerrados (regla de `CLAUDE.md`).

### TC-064-001 — Resultados accesibles tras el cierre (G-submit)
**Precondición:** el estudiante entregó G-submit y la ventana ya cerró.
**Pasos:**
1. Iniciar sesión como `dev-estudiante1@nodo.local`.
2. Abrir `/cuenta/cursos/<enrollmentId>/evaluaciones/<G-submit>/resultados`.
**Resultado esperado:** se muestra la nota, el detalle por pregunta y las opciones correctas/incorrectas; sin 404.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado en navegador (Claude, autorizado). G-submit y G-close con `closes_at` en el pasado: `resultados` abre (200) con nota, detalle y respuestas; la opción correcta sale en verde. Antes del cierre el mismo envío ya se veía igual.

### TC-064-002 — `show_feedback_on = close` se revela solo tras el cierre
**Precondición:** G-close con envío entregado y `closes_at` en el futuro cercano.
**Pasos:**
1. Abrir `resultados` antes de `closes_at`.
2. Esperar a que pase `closes_at` y recargar.
**Resultado esperado:** antes, la nota se ve pero las opciones no se marcan como correctas; después, sí.
**Estado:** ✅ Aprobado
**Hallazgos:** G-close (`close`): antes del cierre solo se resalta la opción elegida, sin verde/rojo ni etiqueta "correcta"; tras mover `closes_at` al pasado salen verde (correcta), rojo (elegida errónea) y la etiqueta "correcta". Nota: se simuló el cierre con `update_assignment_group` en vez de esperar.

### TC-064-003 — `show_feedback_on = never` nunca revela
**Precondición:** G-never con envío entregado, ventana cerrada.
**Pasos:** abrir `resultados`.
**Resultado esperado:** nota visible; ninguna opción marcada como correcta.
**Estado:** ✅ Aprobado
**Hallazgos:** G-never (`never`), ventana cerrada: nota visible, solo se resalta la opción elegida; ninguna marcada como correcta.

### TC-064-004 — Sección "Cerradas" en el listado
**Precondición:** el estudiante tiene envíos en G-submit y G-close (cerrados) y existe G-sinenvio.
**Pasos:** abrir `/cuenta/cursos/<enrollmentId>/evaluaciones`.
**Resultado esperado:** "Cerradas" lista G-submit y G-close con estado y fecha de cierre, ordenadas por cierre descendente; **no** lista G-sinenvio; cada ítem enlaza a `resultados`.
**Estado:** ✅ Aprobado
**Hallazgos:** Listado de estudiante 1: sección "Cerradas" con G-submit (Enviado — pendiente de revisión), G-close y G-never (Calificado); G-sinenvio ausente. Orden verificado con cierres distintos: G-never (26-oct 06:00Z) → G-submit (03:00Z) → G-close (25-oct 12:00Z). "Abiertas" muestra "No hay evaluaciones abiertas por ahora.". Estudiante 2 (solo un `in_progress`): "No hay evaluaciones disponibles por ahora.".

### TC-064-005 — Sin "Iniciar nuevo intento" con ventana cerrada
**Precondición:** `max_attempts` > 1 y al estudiante le quedan intentos; ventana cerrada.
**Pasos:** abrir `resultados`.
**Resultado esperado:** no aparece el botón "Iniciar nuevo intento".
**Estado:** ✅ Aprobado
**Hallazgos:** G-submit (`max_attempts` 2, 1 usado) con ventana cerrada: no hay botón "Iniciar nuevo intento". Con la ventana abierta, el botón sí aparecía (verificado antes del cierre).

### TC-064-006 — Grupo cerrado sin envío entregado
**Precondición:** G-sinenvio (cerrado, sin envío) y un grupo cerrado con envío `in_progress`.
**Pasos:** abrir su URL de `resultados` directamente.
**Resultado esperado:** 404 en ambos; ninguno aparece en "Cerradas".
**Estado:** ✅ Aprobado
**Hallazgos:** Estudiante 2 con intento `in_progress` en G-sinenvio y ventana cerrada: `resultados` 404 y fuera de "Cerradas". G-submit sin envío de estudiante 2: `resultados` 404. Estudiante 1 sin intento en G-sinenvio: `resultados` 404.

### TC-064-007 — Aislamiento de matrícula
**Precondición:** `dev-estudiante2` sin envío en G-submit; `dev-estudiante1` con envío.
**Pasos:**
1. Como `dev-estudiante2`, abrir la URL de `resultados` de G-submit con su propio `enrollmentId`.
2. Probar con el `enrollmentId` de `dev-estudiante1`.
**Resultado esperado:** 404 en ambos casos. Un estudiante retirado también recibe 404.
**Estado:** ✅ Aprobado (parcial)
**Hallazgos:** Estudiante 2 con su matrícula y G-submit (sin envío): 404. Estudiante 2 usando la matrícula de estudiante 1 (`resultados` y listado): 404. **No cubierto:** estudiante retirado (no hay uno en `nodo-dev`).

### TC-064-008 — Notas del docente en `code_snippet`
**Precondición:** envío `graded` con `reviewer_notes` en una pregunta `code_snippet` y otra en `open_text`.
**Pasos:** abrir `resultados`.
**Resultado esperado:** se ve "Retroalimentación del docente" en ambas preguntas.
**Estado:** ✅ Aprobado
**Hallazgos:** Docente (`dev@nodo.local`) calificó G-submit de estudiante 1: code_snippet 1,5/2 con nota, open_text 1/1 con nota; finalizó (4,50/5,00). Con la ventana cerrada el estudiante ve "Retroalimentación del docente" en AMBAS preguntas (antes del fix el `code_snippet` la ocultaba). La nota final pasó de "Puntaje automático" a "Calificación final".

### TC-064-009 — El jugador sigue cerrado
**Precondición:** ventana cerrada.
**Pasos:** abrir `.../evaluaciones/<G>` (jugador) directamente.
**Resultado esperado:** 404; no se puede iniciar ni continuar un intento.
**Estado:** ✅ Aprobado (con matiz)
**Hallazgos:** Ventana cerrada: el jugador no permite responder ni empezar. Con envío entregado redirige a `resultados`; sin reparto devuelve 404; con un intento `in_progress` (estudiante 2, G-sinenvio) responde 200 pero muestra solo "La evaluación ya está cerrada." (sin preguntas). El caso esperaba 404; el bloqueo real se cumple, la diferencia es el mensaje.

### TC-064-010 — Apariencia y accesibilidad
**Precondición:** sección "Cerradas" con al menos un ítem.
**Pasos:** revisar listado y resultados en modo claro, oscuro y ancho móvil (~375 px); navegar con teclado.
**Resultado esperado:** tokens de `DESIGN.md`, JetBrains Mono, foco visible y enlaces con nombre accesible.
**Estado:** ✅ Aprobado (confirmado por el usuario, 2026-10-26)
**Hallazgos:** Solo se vio el modo oscuro (tema de la sesión del navegador): tokens, tipografía y tarjetas de "Cerradas" coherentes con el resto del listado. **No verificados:** modo claro, ancho móvil (~375 px) y navegación con teclado/foco.

### TC-064-011 — Intento entregado + intento posterior `in_progress`, ventana cerrada
**Precondición:** evaluación con `max_attempts` ≥ 2; estudiante con un intento entregado y un segundo intento iniciado (`in_progress`); luego `closes_at` en el pasado (`update_assignment_group`).
**Pasos:**
1. Abrir `/cuenta/cursos/<enrollmentId>/evaluaciones` como el estudiante.
2. Abrir el enlace de la evaluación en "Cerradas".
**Resultado esperado:** el listado la etiqueta con el estado del intento entregado ("Enviado…" o "Calificado"), no "En progreso"; `resultados` muestra la nota y la retroalimentación del intento entregado (sin 404). Limitación conocida: las opciones correctas no se marcan (ver spec, "Limitaciones conocidas").
**Estado:** ✅ Aprobado (observado por Claude en navegador, 2026-10-26; pendiente de confirmación del usuario)
**Hallazgos:** G-limite (`submit`, 2 intentos): estudiante 1 entregó el intento 1 (5,00/5,00), inició el 2 (`in_progress`) y se cerró la ventana. Listado: "Cerradas" lo etiqueta "Calificado" (no "En progreso"). `resultados`: sin 404, muestra "Calificación final 5,00" y las respuestas del intento 1, sin botón de nuevo intento. Limitación confirmada: solo se resalta la opción elegida, no se marcan las correctas (la RPC mira el último intento).

## Resumen de la ronda
- Aprobados: 11 (007 parcial; 010 confirmado por el usuario) — Fallidos: 0 — Pendientes: 0 (TC-064-011 aprobado, a confirmar por el usuario)
- Hallazgos escalados a `docs/specs/backlog.md`: —
- Limpieza de datos de prueba: ✅ Completada (2026-10-26). G-limite (TC-064-011) también se borró por SQL con autorización del usuario (1 evaluación, 2 variantes, 4 preguntas montadas, 1 reparto, 2 envíos, 2 respuestas; verificado: 0 filas `[TEST-064]`, 0 variantes huérfanas, preguntas reutilizadas intactas). Detalle de la primera limpieza: La API no permite borrar evaluaciones con envíos (409), así que, con autorización explícita del usuario, se borraron directo en `nodo-dev` (SQL, filtrando por `title like '[TEST-064]%'` / `stem like '[TEST-064]%'`, en una transacción y en orden inverso de dependencias): 7 respuestas, 4 envíos, 4 repartos, 18 preguntas montadas, 8 variantes, 4 evaluaciones y 2 preguntas. Verificado: 0 filas `[TEST-064]`, 0 variantes huérfanas, preguntas reutilizadas intactas.
