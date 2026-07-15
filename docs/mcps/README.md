# MCPs del proyecto

Índice de servidores MCP (Model Context Protocol) activos en Nodo. Cada MCP
expone herramientas a agentes de IA; su system prompt asociado vive en este
mismo directorio.

| MCP | Propósito | Estado | System prompt | Código |
|---|---|---|---|---|
| `question-bank-mcp` | Cliente de la API `/api/questions/*` para que un agente docente liste, cree, actualice, elimine y publique preguntas del banco de evaluaciones (multiple_choice, open_text, code_snippet, code_write, coding_challenge). | Activo | `docs/mcps/question-bank-agent.system-prompt.md` | `mcp-servers/question-bank-mcp/` |
