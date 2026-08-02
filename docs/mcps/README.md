# MCPs del proyecto

Índice de servidores MCP (Model Context Protocol) activos en Nodo. Cada MCP
expone herramientas a agentes de IA; su system prompt asociado vive en este
mismo directorio.

| MCP | Propósito | Estado | System prompt | Código |
|---|---|---|---|---|
| `question-bank-mcp` | Cliente de la API `/api/questions/*` para que un agente docente liste, cree, actualice, elimine y publique preguntas del banco de evaluaciones (multiple_choice, open_text, code_snippet, code_write, coding_challenge). | Activo | `docs/mcps/question-bank-agent.system-prompt.md` | `mcp-servers/question-bank-mcp/` |
| `assignment-mcp` | Cliente de la API `/api/assignments/*` para que un agente docente diseñe evaluaciones formadas por 3 variantes (A/B/C) de preguntas distintas, publique con validación de invariantes, y monitoree el reparto aleatorio a estudiantes. | Activo | `docs/mcps/assignment-agent.system-prompt.md` | `mcp-servers/assignment-mcp/` |
| `attendance-mcp` | Cliente de solo lectura de la API `/api/attendance/*` para que un agente docente liste sesiones de asistencia, consulte roster y resúmenes de asistencia por estudiante. | Activo | `docs/mcps/attendance-agent.system-prompt.md` | `mcp-servers/attendance-mcp/` |
| `students-mcp` | Cliente de la API `/api/students/*` (permisos de admin, `service_role`) para que un agente docente liste, cree, corrija, elimine y (des)matricule estudiantes manualmente — creado en spec-027 para cubrir el registro simplificado sin confirmación de correo. `create_student`/`update_student` incluyen `github_username` (dato declarado, no verificado; spec-029). Incluye además la lectura `get_student_self_assessment_summary` (spec-040): nota de autoevaluaciones de un estudiante en un curso, con acumulado y desglose por lección — solo lectura, la nota es derivada y no se puede modificar por MCP. Autenticado con `STUDENTS_ADMIN_API_KEY`, distinta de `QUESTION_BANK_API_KEY`. | Activo | `docs/mcps/students-agent.system-prompt.md` | `mcp-servers/students-mcp/` |
| `courses-mcp` | Cliente de la API `/api/courses/*` para que un agente docente consulte el catálogo de lecciones de un curso y abra o cierre lecciones a los estudiantes sin desplegar (spec-039). El estado es global por `course_slug`: afecta a todos los grupos. Autenticado con `COURSES_ADMIN_API_KEY`, propia de este dominio. | Activo | `docs/mcps/courses-agent.system-prompt.md` | `mcp-servers/courses-mcp/` |

## Configuración: local vs. producción (spec-026, Fase 8)

Desde el primer despliegue (2026-07-31, `https://www.nod0.dev`), cada uno de
los 5 MCPs tiene **dos variantes** registradas en `.mcp.json`:

| Variante | Apunta a | Wrapper | Credenciales |
|---|---|---|---|
| `question-bank-mcp`, `assignment-mcp`, `attendance-mcp`, `students-mcp`, `courses-mcp` | `http://localhost:3000/api/*` (`npm run dev`) | `mcp-servers/run-local-mcp.sh` | `.env.local` |
| `question-bank-mcp-prod`, `assignment-mcp-prod`, `attendance-mcp-prod`, `students-mcp-prod`, `courses-mcp-prod` | `https://www.nod0.dev/api/*` | `mcp-servers/run-prod-mcp.sh` | `.env.prod-mcp` (nunca commiteado) |

Ambas variantes conviven — usar las `-prod` para operar sobre datos reales
del semestre en curso (preguntas, evaluaciones, asistencia, estudiantes,
disponibilidad de lecciones), y las locales para seguir desarrollando/probando
contra `npm run dev` sin tocar producción. `QUESTION_BANK_API_KEY`,
`STUDENTS_ADMIN_API_KEY` y `COURSES_ADMIN_API_KEY` de producción son
**distintas** de las locales (ver spec-026 Fase 4).

Credencial por dominio:

| MCP | Variable de entorno |
|---|---|
| `question-bank-mcp`, `assignment-mcp`, `attendance-mcp` | `QUESTION_BANK_API_KEY` |
| `students-mcp` | `STUDENTS_ADMIN_API_KEY` |
| `courses-mcp` | `COURSES_ADMIN_API_KEY` (spec-039 M2 — separada porque estas rutas pueden cerrar contenido a estudiantes reales de forma instantánea, y debe poder revocarse sin apagar el banco de preguntas) |

> `courses-mcp-prod` solo funciona si `COURSES_ADMIN_API_KEY` está cargada en
> Vercel → Production. Sin ella, `/api/courses/*` responde `500`
> `configuration_error` (nunca `401`), lo que hace el fallo diagnosticable.

Verificar un servidor de producción de forma aislada:
```bash
./mcp-servers/run-prod-mcp.sh question-bank-mcp </dev/null
```
