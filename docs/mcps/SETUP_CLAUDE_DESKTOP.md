# Guía de Configuración: MCPs en Claude Desktop

Este documento guía el proceso de configurar los servidores MCP (Model Context Protocol) en Claude Desktop para probar agentes especializados.

---

## 📋 Requisitos previos

- Claude Desktop instalado y actualizado
- El proyecto `Educational-Page` clonado localmente
- npm instalado
- Servidor de desarrollo (`npm run dev`) corriendo en puerto 3000

---

## 🔧 Configuración rápida

### 1. Ubicar el archivo de configuración

```bash
# En macOS:
~/Library/Application\ Support/Claude/claude_desktop_config.json

# En Windows/Linux:
~/.claude/claude_desktop_config.json
```

### 2. Editar la configuración

Abre el archivo en tu editor favorito y busca la sección `mcpServers`. Si no existe, créala:

```json
{
  "mcpServers": {
    "question-bank-mcp": { ... },
    "assignment-mcp": { ... },
    "attendance-mcp": { ... }
  }
}
```

### 3. Verificar cada MCP

Para cada MCP, verifica:
- ✅ La ruta al archivo `.js` compilado es correcta
- ✅ Las variables de entorno están presentes
- ✅ El servidor de desarrollo está corriendo en puerto 3000

---

## 📚 MCPs disponibles

### `question-bank-mcp` — Banco de preguntas

**System prompt:** `docs/mcps/question-bank-agent.system-prompt.md`

Permite a un agente crear, leer, actualizar y eliminar preguntas del banco de evaluaciones.

**Herramientas:**
- `list_questions` — listar preguntas con filtros
- `get_question` — obtener detalle de una pregunta
- `create_question` — crear pregunta nueva
- `update_question` — actualizar pregunta existente
- `delete_question` — eliminar pregunta
- `publish_question` — marcar como publicada

**Configuración en `claude_desktop_config.json`:**

```json
"question-bank-mcp": {
  "command": "node",
  "args": [
    "/Users/santiagosuarez/Documents/03-Proyectos/02-Educational-Page/mcp-servers/question-bank-mcp/dist/index.js"
  ],
  "env": {
    "QUESTION_BANK_API_BASE_URL": "http://localhost:3000/api/questions",
    "QUESTION_BANK_API_KEY": "a45a49ff7617c6c6c74215b26870b8db4f820b980a432eb9fdf99540b3733a8e"
  }
}
```

---

### `assignment-mcp` — Diseño de evaluaciones

**System prompt:** `docs/mcps/assignment-agent.system-prompt.md`

Permite a un agente diseñar evaluaciones con 3 variantes equivalentes, publicarlas y monitorear el reparto a estudiantes.

**Herramientas:**
- `list_academic_courses` — listar cursos del docente
- `list_assignment_groups` — listar evaluaciones (con filtros)
- `get_assignment_group` — obtener detalle de evaluación
- `create_assignment_group` — crear evaluación con 3 variantes (atómico)
- `update_assignment_group` — actualizar configuración compartida
- `replace_variant_questions` — reemplazar preguntas de una variante
- `delete_assignment_group` — eliminar evaluación
- `publish_assignment_group` — publicar con validación de invariantes
- `get_variant_allocations` — consultar reparto a estudiantes

**Configuración en `claude_desktop_config.json`:**

```json
"assignment-mcp": {
  "command": "node",
  "args": [
    "/Users/santiagosuarez/Documents/03-Proyectos/02-Educational-Page/mcp-servers/assignment-mcp/dist/index.js"
  ],
  "env": {
    "ASSIGNMENT_API_BASE_URL": "http://localhost:3000/api/assignments",
    "ASSIGNMENT_API_KEY": "a45a49ff7617c6c6c74215b26870b8db4f820b980a432eb9fdf99540b3733a8e"
  }
}
```

---

### `attendance-mcp` — Asistencia

**System prompt:** `docs/mcps/attendance-agent.system-prompt.md`

Permite a un agente consultar sesiones de asistencia y resúmenes por estudiante (solo lectura).

**Herramientas:**
- `list_attendance_sessions` — listar sesiones de asistencia
- `get_roster` — obtener roster de una sesión
- `get_student_summary` — resumen de asistencia de un estudiante

**Configuración en `claude_desktop_config.json`:**

```json
"attendance-mcp": {
  "command": "node",
  "args": [
    "/Users/santiagosuarez/Documents/03-Proyectos/02-Educational-Page/mcp-servers/attendance-mcp/dist/index.js"
  ],
  "env": {
    "API_BASE_URL": "http://localhost:3000/api",
    "API_KEY": "a45a49ff7617c6c6c74215b26870b8db4f820b980a432eb9fdf99540b3733a8e"
  }
}
```

---

## 🚀 Usar un MCP en Claude Desktop

### Paso 1: Editar `claude_desktop_config.json`

Copia y pega la configuración del MCP que deseas usar (arriba) en tu archivo de configuración.

### Paso 2: Reiniciar Claude Desktop

Cierra completamente Claude Desktop y ábrelo de nuevo. Esto recarga la configuración.

### Paso 3: Crear una conversación

En Claude Desktop, abre una conversación nueva y:

1. Copia el **system prompt completo** desde `docs/mcps/{{nombre}}-agent.system-prompt.md`
2. Pega el system prompt en la sección "Custom Instructions" de la conversación (esquina arriba a la derecha)
3. Ahora el agente tiene acceso a las herramientas del MCP

### Paso 4: Invocar una herramienta

Pide al agente que use una herramienta:

```
Por favor, lista mis cursos académicos.
```

El agente invocará `list_academic_courses` automáticamente.

---

## 🧪 Probar un MCP

### Verificación rápida: Question Bank MCP

**Prompt de prueba:**

```
Actúa como el Question Bank Agent. 
Por favor, lista todas las preguntas del banco y agrupa por tipo.
```

**Resultado esperado:**
- El agente invoca `list_questions`
- Muestra preguntas agrupadas por tipo

### Verificación rápida: Assignment MCP

**Prompt de prueba:**

```
Actúa como el Assignment Agent.
¿Cuáles son mis cursos académicos y cuántas evaluaciones tengo en total?
```

**Resultado esperado:**
- El agente invoca `list_academic_courses`
- Luego invoca `list_assignment_groups` para cada curso
- Muestra un resumen

---

## 🛠️ Solución de problemas

### Las herramientas no aparecen

**Causa:** Claude Desktop no recargó la configuración.

**Solución:**
1. Cierra Claude Desktop completamente
2. Espera 5 segundos
3. Ábrelo de nuevo
4. Verifica que `npm run dev` sigue corriendo

### Error de autenticación en herramienta

**Causa:** La API key es incorrecta o el servidor de desarrollo no está corriendo.

**Solución:**
1. Verifica que `npm run dev` está activo en puerto 3000
2. Verifica la API key en `claude_desktop_config.json` (debe coincidir con variable de entorno en el servidor)
3. Revisa la consola de Claude Desktop para mensajes de error

### Ruta del MCP no encontrada

**Causa:** La ruta en `args` no es correcta.

**Solución:**
1. Verifica que la carpeta `mcp-servers/{{nombre-mcp}}/dist/` existe
2. Verifica que el archivo `index.js` existe dentro
3. Usa la ruta absoluta (no rutas relativas como `./mcp-servers/...`)

---

## 📖 Archivos de referencia

- **Inventario de MCPs:** `docs/mcps/README.md`
- **System prompts:** `docs/mcps/*-agent.system-prompt.md`
- **Casos de prueba:** `docs/testing/test-018-assignment-authoring.md` (para MCP de assignments)
- **Configuración del proyecto:** `CLAUDE.md` (sección "Claude Desktop — Configuración de MCPs")

---

## ✅ Checklist de configuración

- [ ] Archivo `claude_desktop_config.json` localizado y abierto
- [ ] Sección `mcpServers` existe en el archivo
- [ ] MCP `question-bank-mcp` configurado y compilado
- [ ] MCP `assignment-mcp` configurado y compilado
- [ ] MCP `attendance-mcp` configurado y compilado
- [ ] Servidor de desarrollo corriendo (`npm run dev`)
- [ ] Claude Desktop reiniciado tras cambios en JSON
- [ ] Test rápido ejecutado: agente invoca herramienta exitosamente

Cuando todo esté ✅, estás listo para ejecutar los casos de prueba.

---

**Última actualización:** 18 de julio, 2026
**Versión de spec:** spec-018 [TESTING]
