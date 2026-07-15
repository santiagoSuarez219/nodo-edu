# test-005 — Banco de preguntas

## Casos de prueba — Seguridad API

### TC-001 — Autenticación: sin header x-api-key
**Precondición:** Servidor local ejecutándose en `http://localhost:3000`
**Pasos:**
1. Ejecutar: `curl -X GET http://localhost:3000/api/questions`
**Resultado esperado:** `401 Unauthorized` con error `{ "error": { "code": "unauthorized", "message": "API key no proporcionada" } }`
**Estado:** ⬜ Pendiente

### TC-002 — Autenticación: header x-api-key inválido
**Precondición:** Servidor local ejecutándose
**Pasos:**
1. Ejecutar: `curl -X GET -H "x-api-key: invalid-key" http://localhost:3000/api/questions`
**Resultado esperado:** `401 Unauthorized` con error `{ "error": { "code": "unauthorized", "message": "API key inválida" } }`
**Estado:** ⬜ Pendiente

### TC-003 — Autenticación: header x-api-key válido
**Precondición:** `QUESTION_BANK_API_KEY` configurada en `.env.local`; servidor ejecutándose
**Pasos:**
1. Ejecutar: `curl -X GET -H "x-api-key: $QUESTION_BANK_API_KEY" http://localhost:3000/api/questions`
**Resultado esperado:** `200 OK` con `{ "data": [...], "meta": { "total": N, "limit": 50, "offset": 0 } }`
**Estado:** ⬜ Pendiente

## Casos de prueba — CRUD

### TC-004 — GET /api/questions (lista vacía)
**Precondición:** API autenticada; base de datos sin preguntas del docente principal
**Pasos:**
1. Ejecutar: `curl -X GET -H "x-api-key: $KEY" http://localhost:3000/api/questions`
**Resultado esperado:** `200 OK`, `data: []`, `meta: { total: 0, limit: 50, offset: 0 }`
**Estado:** ⬜ Pendiente

### TC-005 — POST /api/questions (crear multiple_choice)
**Precondición:** API autenticada; `QUESTION_BANK_AGENT_TEACHER_ID` válido
**Pasos:**
1. Ejecutar POST con cuerpo completo
**Resultado esperado:** `201 Created`, pregunta con `id` generado, `created_by` forzado a `QUESTION_BANK_AGENT_TEACHER_ID`, `is_published: false`
**Estado:** ⬜ Pendiente

### TC-006 — GET /api/questions/{id} (leer pregunta creada)
**Precondición:** Pregunta creada en TC-005 con id conocido
**Pasos:**
1. Ejecutar GET sobre el id de TC-005
**Resultado esperado:** `200 OK`, pregunta completa con `choices`, `rubric: null`, `challenge_tests: []`
**Estado:** ⬜ Pendiente

### TC-007 — PATCH /api/questions/{id} (actualizar pregunta)
**Precondición:** Pregunta de TC-005 con id conocido
**Pasos:**
1. Ejecutar PATCH con cuerpo actualizado (reemplazo total)
**Resultado esperado:** `200 OK`, pregunta actualizada con nuevos valores
**Estado:** ⬜ Pendiente

### TC-008 — POST /api/questions/{id}/publish (publicar pregunta)
**Precondición:** Pregunta de TC-007 con id conocido
**Pasos:**
1. Ejecutar POST sobre `/publish`
**Resultado esperado:** `200 OK`, `{ "data": { "id": "...", "is_published": true } }`
**Estado:** ⬜ Pendiente

### TC-009 — GET /api/questions?is_published=true (filtro de publicadas)
**Precondición:** Pregunta publicada en TC-008
**Pasos:**
1. Ejecutar GET con filtro `is_published=true`
**Resultado esperado:** `200 OK`, `data` incluye la pregunta publicada en TC-008
**Estado:** ⬜ Pendiente

### TC-010 — DELETE /api/questions/{id} (eliminar pregunta no usada)
**Precondición:** Pregunta no referenciada en `assignment_questions`
**Pasos:**
1. Ejecutar DELETE sobre pregunta
2. Intentar GET sobre ese id
**Resultado esperado:** DELETE retorna `200 OK`, GET retorna `404 not_found`
**Estado:** ⬜ Pendiente

## Casos de prueba — Validación

### TC-011 — POST con JSON malformado
**Precondición:** API autenticada
**Pasos:**
1. Ejecutar POST con JSON inválido
**Resultado esperado:** `400 Bad Request`, `{ "error": { "code": "bad_request" } }`
**Estado:** ⬜ Pendiente

### TC-012 — POST multiple_choice sin opciones correctas
**Precondición:** API autenticada
**Pasos:**
1. Ejecutar POST con choices sin correctas
**Resultado esperado:** `422 Validation Error`, `fieldErrors` con mensaje sobre opciones correctas
**Estado:** ⬜ Pendiente

### TC-013 — POST con difficulty fuera de rango (1-5)
**Precondición:** API autenticada
**Pasos:**
1. Ejecutar POST con `difficulty: 0` o `difficulty: 6`
**Resultado esperado:** `422 Validation Error`
**Estado:** ⬜ Pendiente

## Casos de prueba — MCP

### TC-MCP-001 — list_questions (sin filtros)
**Herramienta probada:** `list_questions` en `question-bank-mcp`
**Precondición:** MCP configurado y corriendo
**Input de prueba:** Listar sin filtros
**Output esperado:** JSON con `{ "data": [...], "meta": {...} }`
**Estado:** ⬜ Pendiente

### TC-MCP-002 — get_question (lectura)
**Herramienta probada:** `get_question` en `question-bank-mcp`
**Precondición:** MCP configurado; id de pregunta existente
**Input de prueba:** id de pregunta
**Output esperado:** Pregunta completa
**Estado:** ⬜ Pendiente

### TC-MCP-003 — create_question (multiple_choice)
**Herramienta probada:** `create_question` en `question-bank-mcp`
**Precondición:** MCP configurado
**Input de prueba:** Payload de pregunta múltiple choice
**Output esperado:** Pregunta creada con id, `is_published: false`
**Estado:** ⬜ Pendiente

### TC-MCP-004 — update_question (actualización)
**Herramienta probada:** `update_question` en `question-bank-mcp`
**Precondición:** Pregunta existente
**Input de prueba:** id + campos a actualizar
**Output esperado:** Pregunta actualizada
**Estado:** ⬜ Pendiente

### TC-MCP-005 — delete_question (eliminación)
**Herramienta probada:** `delete_question` en `question-bank-mcp`
**Precondición:** Pregunta no en uso
**Input de prueba:** id de pregunta
**Output esperado:** `{ "deleted": true }`
**Estado:** ⬜ Pendiente

### TC-MCP-006 — publish_question (publicación)
**Herramienta probada:** `publish_question` en `question-bank-mcp`
**Precondición:** Pregunta existente
**Input de prueba:** id de pregunta
**Output esperado:** `{ "data": { "id": "...", "is_published": true } }`
**Estado:** ⬜ Pendiente
