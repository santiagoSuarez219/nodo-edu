# test-026 — Primer despliegue a producción (Vercel + Supabase) + MCPs

> Pruebas manuales del spec-026. Se ejecutan **sobre la URL de producción** una
> vez completada la Fase 6 (deploy) del spec. Las pruebas visuales/UI las ejecuta
> el usuario; Claude prepara datos vía API y registra hallazgos caso por caso.
> El framework de tests automatizados sigue "por definir" (ver `CLAUDE.md`), por
> lo que este spec solo tiene pruebas manuales.

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Estudiante de prueba | (Supabase Auth / seed) | `{{id}}` | ⬜ |
| Enrollment de prueba | `POST /api/...` | `{{id}}` | ⬜ |
| Pregunta de banco (prueba API/MCP) | `POST /api/questions` | `{{id}}` | ⬜ |

**Entorno de pruebas:** Producción (URL final de Vercel) — confirmar antes de crear datos.
**Fecha de la ronda:** {{pendiente}}

---

## Casos de prueba (smoke tests — UI)

### TC-026-001 — Carga de la home pública
**Precondición:** Deploy completado en Vercel; URL de producción disponible.
**Datos de prueba usados:** ninguno.
**Pasos:**
1. Abrir la URL de producción en el navegador.
2. Observar la carga de la home y la grilla de cursos.
3. Revisar la consola del navegador.
**Resultado esperado:** La home carga sin errores críticos de consola; se ven los cursos.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

### TC-026-002 — Login de estudiante y redirección
**Precondición:** Estudiante de prueba creado en Supabase Auth.
**Datos de prueba usados:** `{{email}}` / `{{password}}`.
**Pasos:**
1. Ir a la pantalla de login.
2. Autenticarse con las credenciales del estudiante de prueba.
**Resultado esperado:** Login exitoso y redirección a `/cuenta/cursos`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-026-003 — Redirect de recuperación de contraseña / OAuth
**Precondición:** `NEXT_PUBLIC_SITE_URL` y Redirect URLs de Supabase apuntando al dominio de Vercel.
**Datos de prueba usados:** `{{email}}`.
**Pasos:**
1. Solicitar recuperación de contraseña (o iniciar flujo OAuth).
2. Observar la URL de redirección del correo/proveedor.
**Resultado esperado:** El enlace apunta al dominio de producción de Vercel, no a `localhost:3000`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-026-004 — Lección MDX con Mermaid, YouTube y KaTeX
**Precondición:** Estudiante autenticado con acceso a una lección que use los tres componentes.
**Datos de prueba usados:** lección `{{courseSlug}}/{{lessonSlug}}`.
**Pasos:**
1. Abrir la lección.
2. Verificar el render del diagrama Mermaid, el embed de YouTube y las fórmulas KaTeX.
**Resultado esperado:** Los tres componentes renderizan correctamente sin errores.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-026-005 — Enrollment y progreso de lección
**Precondición:** Estudiante autenticado; curso disponible para inscripción.
**Datos de prueba usados:** `{{courseSlug}}`, estudiante `{{id}}`.
**Pasos:**
1. Inscribirse en el curso.
2. Abrir una lección y marcar/avanzar el progreso.
3. Recargar y verificar persistencia.
**Resultado esperado:** El enrollment se registra y el progreso persiste tras recargar.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-026-006 — Autoevaluación de cierre de lección
**Precondición:** Lección con preguntas de autoevaluación asociadas; estudiante inscrito.
**Datos de prueba usados:** lección `{{courseSlug}}/{{lessonSlug}}`.
**Pasos:**
1. Completar la autoevaluación al cierre de la lección.
2. Enviar respuestas.
**Resultado esperado:** El sistema evalúa y muestra feedback; el estado de intento persiste.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-026-007 — Flujo de asistencia (attendance)
**Precondición:** Sesión de asistencia creada; estudiante inscrito.
**Datos de prueba usados:** sesión `{{sessionId}}`.
**Pasos:**
1. Abrir el flujo de asistencia para la sesión.
2. Registrar/consultar la asistencia según el rol.
**Resultado esperado:** El registro/consulta de asistencia funciona sin errores.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-026-008 — Flujo de assignment (variantes A/B/C)
**Precondición:** Grupo de assignment publicado con variantes A/B/C.
**Datos de prueba usados:** grupo `{{groupId}}`.
**Pasos:**
1. Como estudiante, abrir la asignación asignada.
2. Responder y enviar.
**Resultado esperado:** Se asigna una variante, se puede responder y enviar; el envío persiste.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

---

## Casos de prueba MCP (API de producción)

### TC-MCP-026-001 — API routes responden con la API key de producción
**Herramienta probada:** backend `/api/questions`, `/api/assignments`, `/api/attendance` (consumido por los 3 MCPs).
**Precondición:** Deploy completado; `QUESTION_BANK_API_KEY` de producción configurada en Vercel.
**Input de prueba:** `GET https://<url-prod>/api/questions` con header de API key de producción.
**Output esperado:** `200` con datos válidos usando la key de prod; `401` si se usa una key inválida.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-026-002 — question-bank-mcp contra producción
**Herramienta probada:** `list_questions` (u otra de lectura) en `question-bank-mcp`.
**Precondición:** `claude_desktop_config.json` actualizado (Fase 7): base URL de prod + API key de prod; Claude Desktop reiniciado.
**Input de prueba:** invocar `list_questions` desde Claude Desktop.
**Output esperado:** El MCP responde con datos del proyecto de producción, sin errores de conexión/auth.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-026-003 — assignment-mcp contra producción
**Herramienta probada:** herramienta de lectura de `assignment-mcp` (p.ej. `list_academic_courses`).
**Precondición:** igual que TC-MCP-026-002 para `assignment-mcp`.
**Input de prueba:** invocar la herramienta de lectura desde Claude Desktop.
**Output esperado:** El MCP responde contra producción sin errores.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

### TC-MCP-026-004 — attendance-mcp contra producción
**Herramienta probada:** herramienta de lectura de `attendance-mcp` (listar sesiones).
**Precondición:** igual que TC-MCP-026-002 para `attendance-mcp`.
**Input de prueba:** invocar la herramienta de lectura desde Claude Desktop.
**Output esperado:** El MCP (solo lectura) responde contra producción sin errores.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{observaciones}}

---

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 12
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
