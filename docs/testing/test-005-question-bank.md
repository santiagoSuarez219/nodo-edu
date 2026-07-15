# test-005 — Banco de preguntas (API HTTP + MCP)

> **Alcance de estas pruebas.** spec-005 no crea UI: el banco se puebla y mantiene
> exclusivamente vía la API HTTP `/api/questions/*` (autenticada por API key de
> servicio) y el MCP `question-bank-mcp` que la consume. Por eso todos los casos son:
> - `TC-API-*` — verificación directa de la API por `curl`/cliente HTTP.
> - `TC-MCP-*` — verificación de las 6 herramientas del MCP y su seguridad.
>
> No hay casos de UI porque este spec no expone ninguna pantalla.

## Precondiciones generales

- **Servidor Next.js corriendo** en local: `npm run dev` (API en `http://localhost:3000/api/questions`).
- **Supabase local corriendo** (`supabase start`) con las migraciones de la Fase 1 aplicadas
  (`supabase db reset` sin conflictos; las cuatro tablas `questions`, `question_choices`,
  `question_rubrics`, `coding_challenge_tests` con RLS habilitado).
- **Docente principal sembrado** (Fase 0): `npm run seed:teacher` ejecutado; el id resuelto del
  docente registrado.
- **Variables de entorno** en `.env.local`:
  - `QUESTION_BANK_API_KEY` — clave de servicio conocida para las pruebas.
  - `QUESTION_BANK_AGENT_TEACHER_ID` — UUID del docente sembrado (debe coincidir con el
    `created_by` esperado).
  - `SUPABASE_SERVICE_ROLE_KEY` — ya existente.
- Para los casos MCP, además:
  - Proceso MCP `mcp-servers/question-bank-mcp/` construido y arrancable (transport `stdio`).
  - Su `.env` con `QUESTION_BANK_API_BASE_URL=http://localhost:3000/api/questions` y
    `QUESTION_BANK_API_KEY` igual a la de la app.
  - Un cliente MCP (inspector o agente) capaz de invocar las herramientas.
- Convención en los ejemplos: `$KEY` = valor de `QUESTION_BANK_API_KEY`;
  `$BASE` = `http://localhost:3000/api/questions`; `$ID` = id de una pregunta creada.

---

## Casos de prueba — API HTTP (`TC-API-*`)

### TC-API-001 — Request sin header `x-api-key` → 401
**Precondición:** Servidor corriendo.
**Pasos:**
1. Ejecutar una request sin el header de API key:
   ```bash
   curl -i "$BASE"
   ```
**Resultado esperado:** Status `401`. Cuerpo con formato de error uniforme y
`error.code = "unauthorized"`. No se devuelve dato alguno del banco.
**Estado:** ⬜ Pendiente

---

### TC-API-002 — Request con API key inválida → 401
**Precondición:** Servidor corriendo.
**Pasos:**
1. Ejecutar una request con una key incorrecta:
   ```bash
   curl -i -H "x-api-key: clave-invalida" "$BASE"
   ```
**Resultado esperado:** Status `401` con `error.code = "unauthorized"`. La comparación de la key
es de tiempo constante (no se filtra información por diferencia de tiempos).
**Estado:** ⬜ Pendiente

---

### TC-API-003 — Crear pregunta `multiple_choice` válida → 201
**Precondición:** API key válida.
**Pasos:**
1. Crear una pregunta de selección múltiple con ≥2 opciones y ≥1 correcta:
   ```bash
   curl -i -X POST "$BASE" \
     -H "x-api-key: $KEY" -H "Content-Type: application/json" \
     -d '{
       "type": "multiple_choice",
       "stem": "¿Cuál es la complejidad de la búsqueda binaria?",
       "difficulty": 2,
       "tags": ["algoritmos", "complejidad"],
       "course_slug": "estructura-de-datos",
       "choices": [
         { "body": "O(log n)", "is_correct": true,  "order_index": 0 },
         { "body": "O(n)",     "is_correct": false, "order_index": 1 }
       ]
     }'
   ```
**Resultado esperado:** Status `201`. `data.id` presente, `data.is_published = false`,
`data.type = "multiple_choice"`, con las `choices` persistidas. Anotar el `id` como `$ID`.
**Estado:** ⬜ Pendiente

---

### TC-API-004 — Crear preguntas de los otros 4 tipos → 201
**Precondición:** API key válida.
**Pasos:**
1. Crear un `open_text` (con `rubric` opcional: `max_score` 0.01–5 y `criteria[]`).
2. Crear un `code_snippet` (requiere `code_snippet` + `code_language`).
3. Crear un `code_write` (con `rubric` opcional).
4. Crear un `coding_challenge` (requiere `code_language` + `challenge_tests[]` ≥1).
**Resultado esperado:** Cada creación responde `201` con `data.id` y `data.type` correcto.
El `coding_challenge` se crea correctamente pese a que su ejecución esté deshabilitada (stub).
**Estado:** ⬜ Pendiente

---

### TC-API-005 — Crear pregunta con payload inválido → 422
**Precondición:** API key válida.
**Pasos:**
1. Enviar un `multiple_choice` sin `choices` (o con una sola opción), o un cuerpo sin `stem`:
   ```bash
   curl -i -X POST "$BASE" \
     -H "x-api-key: $KEY" -H "Content-Type: application/json" \
     -d '{ "type": "multiple_choice", "difficulty": 2 }'
   ```
**Resultado esperado:** Status `422` con `error.code = "validation_error"` y
`error.details.fieldErrors` indicando los campos que fallan (p. ej. `stem`, `choices`).
No se crea ninguna pregunta.
**Estado:** ⬜ Pendiente

---

### TC-API-006 — JSON malformado → 400
**Precondición:** API key válida.
**Pasos:**
1. Enviar un cuerpo con JSON roto:
   ```bash
   curl -i -X POST "$BASE" \
     -H "x-api-key: $KEY" -H "Content-Type: application/json" \
     -d '{ "type": "open_text", '
   ```
**Resultado esperado:** Status `400` con `error.code = "bad_request"`.
**Estado:** ⬜ Pendiente

---

### TC-API-007 — Leer una pregunta por id → 200
**Precondición:** Existe `$ID` (creado en TC-API-003).
**Pasos:**
1. Solicitar la pregunta:
   ```bash
   curl -i -H "x-api-key: $KEY" "$BASE/$ID"
   ```
**Resultado esperado:** Status `200` con `data` tipo `QuestionWithDetails` (incluye
`choices`/`rubric`/`challenge_tests` según el tipo y `author_name`).
**Estado:** ⬜ Pendiente

---

### TC-API-008 — Listar con filtros y paginación → 200
**Precondición:** Varias preguntas creadas (TC-API-003/004).
**Pasos:**
1. Listar filtrando por tipo y curso con paginación:
   ```bash
   curl -i -H "x-api-key: $KEY" \
     "$BASE?type=multiple_choice&course_slug=estructura-de-datos&limit=10&offset=0"
   ```
2. Probar filtros adicionales: `tag`, `difficulty`, `is_published`, `q` (búsqueda parcial en `stem`).
**Resultado esperado:** Status `200` con `{ data: [...], meta: { total, limit, offset } }`.
Solo aparecen preguntas que cumplen los filtros; `meta.total` refleja el total del filtro y
`limit`/`offset` la paginación aplicada.
**Estado:** ⬜ Pendiente

---

### TC-API-009 — Query params inválidos en listado → 422
**Precondición:** API key válida.
**Pasos:**
1. Enviar filtros fuera de rango/dominio:
   ```bash
   curl -i -H "x-api-key: $KEY" "$BASE?difficulty=9&type=foo"
   ```
**Resultado esperado:** Status `422` con `error.code = "validation_error"` (dificultad debe ser
1–5; `type` debe ser uno de los 5 válidos).
**Estado:** ⬜ Pendiente

---

### TC-API-010 — Actualizar una pregunta (reemplazo total) → 200
**Precondición:** Existe `$ID` de un `multiple_choice`.
**Pasos:**
1. Enviar un `PATCH` con el `QuestionSchema` completo, cambiando el `stem` y reemplazando las
   `choices`:
   ```bash
   curl -i -X PATCH "$BASE/$ID" \
     -H "x-api-key: $KEY" -H "Content-Type: application/json" \
     -d '{
       "type": "multiple_choice",
       "stem": "Enunciado actualizado",
       "difficulty": 3,
       "choices": [
         { "body": "Nueva A", "is_correct": true,  "order_index": 0 },
         { "body": "Nueva B", "is_correct": false, "order_index": 1 }
       ]
     }'
   ```
**Resultado esperado:** Status `200` con el recurso actualizado. Las `choices` anteriores se
reemplazan por completo (semántica de reemplazo total), sin dejar opciones huérfanas.
**Estado:** ⬜ Pendiente

---

### TC-API-011 — Actualizar con payload inválido → 422
**Precondición:** Existe `$ID`.
**Pasos:**
1. Enviar un `PATCH` que no cumple el schema (p. ej. `difficulty=7` o sin `stem`).
**Resultado esperado:** Status `422` con `error.code = "validation_error"` y `fieldErrors`.
La pregunta no cambia.
**Estado:** ⬜ Pendiente

---

### TC-API-012 — `created_by` forzado; body ignorado
**Precondición:** API key válida. `QUESTION_BANK_AGENT_TEACHER_ID` conocido.
**Pasos:**
1. Crear una pregunta enviando un `created_by` arbitrario en el cuerpo:
   ```bash
   curl -i -X POST "$BASE" \
     -H "x-api-key: $KEY" -H "Content-Type: application/json" \
     -d '{
       "type": "open_text",
       "stem": "Explica la recursión con un ejemplo.",
       "difficulty": 2,
       "created_by": "00000000-0000-0000-0000-000000000000"
     }'
   ```
**Resultado esperado:** Status `201`. En la respuesta, `data.created_by` es
`QUESTION_BANK_AGENT_TEACHER_ID` (no el UUID enviado en el body): el `created_by` del cuerpo se
ignora y se fuerza al docente designado.
**Estado:** ⬜ Pendiente

---

### TC-API-013 — `questionId` de otro autor → 404 (pese a bypass de RLS)
**Precondición:** Existe en la tabla `questions` una pregunta cuyo `created_by` NO es
`QUESTION_BANK_AGENT_TEACHER_ID` (crear una manualmente en Supabase con otro autor, o usar la
de otro docente). Anotar su id como `$OTHER_ID`.
**Pasos:**
1. Intentar leerla vía la API de servicio:
   ```bash
   curl -i -H "x-api-key: $KEY" "$BASE/$OTHER_ID"
   ```
2. Intentar `PATCH` y `DELETE` sobre `$OTHER_ID`.
**Resultado esperado:** Status `404` con `error.code = "not_found"` en los tres casos. Aunque el
service client bypasa RLS, el dominio scopea por `created_by = actorId`, por lo que un recurso de
otro autor no se lee, actualiza ni elimina (no hay fuga de recursos ajenos).
**Estado:** ⬜ Pendiente

---

### TC-API-014 — Publicar `multiple_choice` sin opción correcta → 422
**Precondición:** Existe un `multiple_choice` con `$ID_SIN_CORRECTA` cuyas opciones tienen todas
`is_correct = false`.
**Pasos:**
1. Publicar:
   ```bash
   curl -i -X POST "$BASE/$ID_SIN_CORRECTA/publish" -H "x-api-key: $KEY"
   ```
**Resultado esperado:** Status `422` con `error.code = "validation_error"` y un mensaje claro
(p. ej. "Debe haber al menos una opción correcta."). La pregunta permanece `is_published = false`.
**Estado:** ⬜ Pendiente

---

### TC-API-015 — Publicar una pregunta válida → 200
**Precondición:** Existe `$ID` de un `multiple_choice` con ≥1 opción correcta.
**Pasos:**
1. Publicar:
   ```bash
   curl -i -X POST "$BASE/$ID/publish" -H "x-api-key: $KEY"
   ```
**Resultado esperado:** Status `200`. `data.is_published = true`.
**Estado:** ⬜ Pendiente

---

### TC-API-016 — Eliminar una pregunta no usada → 200
**Precondición:** Existe una pregunta `$ID_LIBRE` no referenciada por ninguna asignación.
**Pasos:**
1. Eliminar:
   ```bash
   curl -i -X DELETE "$BASE/$ID_LIBRE" -H "x-api-key: $KEY"
   ```
2. Volver a leerla con `GET`.
**Resultado esperado:** Status `200` en el `DELETE`; el `GET` posterior devuelve `404`. Sus
`choices`/`rubric`/`tests` se eliminan en cascada.
**Estado:** ⬜ Pendiente

---

### TC-API-017 — Eliminar una pregunta en uso → 409
**Precondición:** Existe una pregunta `$ID_EN_USO` referenciada en `assignment_questions`
(tabla de spec-006; sembrar la referencia manualmente si spec-006 aún no está implementado, o
saltar el caso documentando la dependencia).
**Pasos:**
1. Intentar eliminarla:
   ```bash
   curl -i -X DELETE "$BASE/$ID_EN_USO" -H "x-api-key: $KEY"
   ```
**Resultado esperado:** Status `409` con `error.code = "conflict"`. La pregunta no se elimina.
**Estado:** ⬜ Pendiente

---

### TC-API-018 — Método no permitido en una ruta → 405
**Precondición:** API key válida.
**Pasos:**
1. Invocar un método no soportado, p. ej. `DELETE` sobre la colección:
   ```bash
   curl -i -X DELETE "$BASE" -H "x-api-key: $KEY"
   ```
**Resultado esperado:** Status `405` con `error.code = "method_not_allowed"`.
**Estado:** ⬜ Pendiente

---

### TC-API-019 — `getQuestionsByTeacher` (lectura por sesión) expuesta y funcional
**Precondición:** Sesión de docente en la app (no API key). Al menos una pregunta publicada del
docente designado.
**Pasos:**
1. Desde un contexto server con sesión de docente (p. ej. un consumidor de prueba análogo al
   selector del `NewAssignmentForm` de spec-006), invocar `getQuestionsByTeacher`.
**Resultado esperado:** Devuelve las preguntas del docente respetando RLS de sesión (propias +
publicadas ajenas). La firma del wrapper es estable y utilizable sin conocer el refactor por actor.
**Estado:** ⬜ Pendiente

---

## Casos de prueba — MCP `question-bank-mcp` (`TC-MCP-*`)

> Precondición común a todos los `TC-MCP-*`: la API local corriendo, el proceso MCP construido y
> conectado mediante un cliente MCP (inspector/agente), con `QUESTION_BANK_API_BASE_URL` y
> `QUESTION_BANK_API_KEY` correctamente cargadas (fail-fast si falta alguna).

### TC-MCP-001 — `list_questions` lista con filtros
**Precondición:** Preguntas creadas en el banco (TC-API-003/004).
**Pasos:**
1. Invocar `list_questions` sin filtros.
2. Invocar `list_questions` con filtros (`type`, `course_slug`, `difficulty`, `limit`, `offset`).
**Resultado esperado:** Devuelve `{ questions: QuestionSummary[], total }`; los filtros se
propagan al `GET /api/questions` y el resultado coincide con TC-API-008.
**Estado:** ⬜ Pendiente

---

### TC-MCP-002 — `get_question` obtiene una pregunta completa
**Precondición:** Existe `$ID`.
**Pasos:**
1. Invocar `get_question` con `{ id: "$ID" }`.
**Resultado esperado:** Devuelve la `Question` completa con `choices`/`rubric`/`challenge_tests`
según el tipo. Coincide con TC-API-007.
**Estado:** ⬜ Pendiente

---

### TC-MCP-003 — `create_question` crea siempre como borrador
**Precondición:** MCP conectado.
**Pasos:**
1. Invocar `create_question` con un `QuestionInput` de tipo `multiple_choice` válido.
**Resultado esperado:** La pregunta se crea (`201` en la API) y se devuelve la `Question` con
`is_published = false` (borrador) y `created_by = QUESTION_BANK_AGENT_TEACHER_ID`.
**Estado:** ⬜ Pendiente

---

### TC-MCP-004 — `update_question` actualiza (relee y compone payload completo)
**Precondición:** Existe `$ID`.
**Pasos:**
1. Invocar `update_question` con `{ id: "$ID", stem: "Nuevo enunciado" }` (solo el campo a cambiar).
**Resultado esperado:** El MCP relee la pregunta con `get_question`, compone el payload completo y
llama a `PATCH`. La pregunta queda actualizada sin cambiar su `type`; el resto de campos se conserva.
**Estado:** ⬜ Pendiente

---

### TC-MCP-005 — `delete_question` elimina una pregunta
**Precondición:** Existe una pregunta libre `$ID_LIBRE` no usada.
**Pasos:**
1. Invocar `delete_question` con `{ id: "$ID_LIBRE" }`.
**Resultado esperado:** Devuelve `{ deleted: true, id: "$ID_LIBRE" }`. Un `get_question` posterior
falla con "no encontrado".
**Estado:** ⬜ Pendiente

---

### TC-MCP-006 — `publish_question` publica una pregunta
**Precondición:** Existe `$ID` de un `multiple_choice` con ≥1 opción correcta.
**Pasos:**
1. Invocar `publish_question` con `{ id: "$ID" }`.
**Resultado esperado:** Devuelve la `Question` con `is_published = true`.
**Estado:** ⬜ Pendiente

---

### TC-MCP-007 — Un error de la API se relaya tal cual
**Precondición:** MCP conectado.
**Pasos:**
1. Invocar `publish_question` sobre un `multiple_choice` sin opción correcta (provoca `422`).
2. Invocar `get_question` con un id inexistente o de otro autor (provoca `404`).
3. Invocar `delete_question` sobre una pregunta en uso (provoca `409`).
**Resultado esperado:** En cada caso el MCP devuelve un **error de herramienta** con el mensaje
original de la API (validación / no encontrado / conflicto), sin ocultar el fallo ni asumir éxito
parcial. No hay reintentos automáticos en operaciones de escritura.
**Estado:** ⬜ Pendiente

---

### TC-MCP-008 — La API key nunca se expone
**Precondición:** MCP conectado; logs del proceso MCP observables (stderr).
**Pasos:**
1. Ejecutar varias herramientas (lectura, escritura y un caso de error).
2. Revisar la salida de las herramientas y los logs del proceso.
**Resultado esperado:** `QUESTION_BANK_API_KEY` no aparece en ningún output de herramienta, en
mensajes de error, ni en los logs. El MCP no importa clientes de Supabase ni lee
`SUPABASE_SERVICE_ROLE_KEY`.
**Estado:** ⬜ Pendiente

---

### TC-MCP-009 — Fail-fast si falta configuración
**Precondición:** Proceso MCP con `QUESTION_BANK_API_BASE_URL` o `QUESTION_BANK_API_KEY` ausente.
**Pasos:**
1. Arrancar el MCP sin una de las dos variables de entorno requeridas.
**Resultado esperado:** El MCP no arranca; registra el error en stderr (nunca en stdout, reservado
al protocolo) y termina. No queda en un estado a medias.
**Estado:** ⬜ Pendiente
