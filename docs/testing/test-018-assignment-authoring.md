# test-018 — Diseño de evaluaciones vía MCP con variantes aleatorias

> Corresponde a [spec-018](../specs/spec-018-assignment-authoring.md).
>
> Esta versión **reemplaza** la anterior, que probaba un constructor de evaluaciones en el
> panel admin (`NewAssignmentForm`). Ese constructor ya no existe: la autoría es 100% vía
> MCP y la UI admin es de solo lectura + publicación.

---

## Precondiciones generales

- Migraciones de spec-018 aplicadas: `assignment_variant_groups`, `assignments`,
  `assignment_questions` y `assignment_variant_allocations`, todas con RLS habilitada.
- Banco de preguntas (spec-005) poblado con al menos **30 preguntas** del docente de prueba,
  cubriendo varios tipos (`multiple_choice`, `open_text`, `code_snippet`, `code_write`,
  `coding_challenge`) y dificultades — suficientes para armar 3 variantes sin repetir.
- Cuentas de prueba:
  - **Docente A:** rol `teacher` puro, dueño de al menos un curso académico y de las
    preguntas del banco. Es el docente de `QUESTION_BANK_AGENT_TEACHER_ID`.
  - **Docente B:** segundo `teacher` puro, dueño de otro curso académico (aislamiento).
    No usar la cuenta `admin`: un admin ve todo por diseño de RLS y no prueba aislamiento.
  - **Estudiantes 1 a 7:** rol `student`, todos con matrícula `active` en el curso del
    Docente A. Se necesitan varios para verificar el reparto balanceado de variantes.
- Cliente MCP configurado con `assignment-mcp` (`ASSIGNMENT_API_BASE_URL` y
  `ASSIGNMENT_API_KEY`) y con `question-bank-mcp` disponible para consultar el banco.
- **System prompt del Assignment Agent** disponible en `docs/mcps/assignment-agent.system-prompt.md`
  para configurar en Claude Desktop. Ver sección "🔧 Configuración previa — Claude Desktop" abajo.
- `npm run dev` levantado y `.env.local` apuntando al proyecto Supabase.

---

## Casos de prueba — Autoría vía MCP

### 🔧 Configuración previa — Claude Desktop

Para ejecutar los casos `TC-MCP-001` a `TC-MCP-013`, configura Claude Desktop con el Assignment Agent:

1. **Obtén el system prompt:**
   - Ruta: `docs/mcps/assignment-agent.system-prompt.md`
   - Este archivo incluye el rol, las 9 capacidades del MCP, restricciones y el flujo típico de trabajo.

2. **Crea una custom instruction en Claude Desktop:**
   - Abre Claude Desktop settings → "Custom Instructions"
   - Copia el contenido completo de `assignment-agent.system-prompt.md`
   - Guarda.

3. **Asegúrate que `assignment-mcp` esté disponible:**
   - El servidor MCP debe estar corriendo en tu máquina (`mcp-servers/assignment-mcp/`).
   - Configura la URL (`ASSIGNMENT_API_BASE_URL`) y la API key (`ASSIGNMENT_API_KEY`) en las variables de entorno.
   - El servidor expone 9 herramientas: `list_academic_courses`, `list_assignment_groups`, `get_assignment_group`, `create_assignment_group`, `update_assignment_group`, `replace_variant_questions`, `delete_assignment_group`, `publish_assignment_group`, `get_variant_allocations`.

4. **También necesitarás acceso a `question-bank-mcp`:**
   - El Assignment Agent puede invocar `list_questions` y `get_question` del Question Bank MCP para explorar el banco antes de armar variantes.
   - Asegúrate que `question-bank-mcp` esté también disponible.

5. **Estructura de prueba:**
   - Cada caso `TC-MCP-NNN` te pedirá que uses una herramienta específica.
   - Copia la entrada de prueba, pásala al agente, y verifica que el output coincida con lo esperado.
   - Marca el caso como ✅ Aprobado cuando pase.

---

### TC-MCP-001 — Listar los cursos académicos del docente
**Herramienta probada:** `list_academic_courses` en `assignment-mcp`
**Precondición:** El Docente A es dueño de al menos un curso académico.
**Input de prueba:** invocación sin argumentos.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.
Por favor, lista todos mis cursos académicos. Muestra id, name y code de cada uno.
```
**Output esperado:** Lista de los cursos del docente con `id`, `name` y `code`. No aparece
ningún curso del Docente B.
**Estado:** ✅ Aprobado

---

### TC-MCP-002 — Crear una evaluación con 3 variantes
**Herramienta probada:** `create_assignment_group` en `assignment-mcp`
**Precondición:** Banco poblado. `academic_course_id` obtenido de `TC-MCP-001`.
**Input de prueba:** config compartida (`title`, `type: "quiz"`, `opens_at`, `closes_at`,
`time_limit_minutes: 30`, `max_attempts: 1`, `show_feedback_on: "submit"`) + 3 variantes
`A`, `B`, `C`, cada una con 5 preguntas **distintas** y puntos que sumen **el mismo total**
en las tres (ej. 5 preguntas × 2 puntos = 10 en cada variante).
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Quiero crear una evaluación tipo "quiz" para el curso <academic_course_id>
con el título "Quiz de prueba TC-MCP-002". Se abre hoy y cierra en 7 días,
límite de tiempo 30 minutos, 1 intento permitido, feedback al enviar.

Primero explora el banco de preguntas de ese curso (usa question-bank-mcp,
list_questions) y arma 3 variantes (A, B, C) con 5 preguntas distintas cada
una, de forma que las tres sumen el mismo puntaje total (por ejemplo, 5
preguntas x 2 puntos = 10 puntos por variante). No repitas preguntas dentro
de una misma variante.

Crea el grupo con create_assignment_group.
```
**Output esperado:** La evaluación se crea con `is_published: false` y devuelve el grupo con
sus 3 variantes, cada una con sus preguntas, puntos, `order_index` y `total_points` igual.
**Estado:** ✅ Aprobado

---

### TC-MCP-003 — Atomicidad: una variante inválida no crea nada
**Herramienta probada:** `create_assignment_group` en `assignment-mcp`
**Precondición:** Ninguna evaluación creada en esta prueba.
**Input de prueba:** payload con 3 variantes donde la variante `C` contiene un `question_id`
inexistente (o `points: 6`, fuera de rango).
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Crea una evaluación "quiz" de prueba para el curso <academic_course_id> con
3 variantes A, B y C, cada una con 5 preguntas del banco. Para esta prueba,
en la variante C usa intencionalmente el question_id "00000000-0000-0000-
0000-000000000000" (no existe en el banco) en una de las 5 preguntas.

Intenta crear el grupo con create_assignment_group y muéstrame el error
completo tal como lo devuelve la API, sin reinterpretarlo.

Luego, usa list_assignment_groups filtrando por ese curso y confírmame si
quedó algún grupo creado con este título.
```
**Output esperado:** Error de validación que **nombra la variante `C`** y el problema
concreto. Verificar con `list_assignment_groups` que **no se creó ningún grupo**: no queda
un grupo huérfano con las variantes `A` y `B`.
**Estado:** ✅ Aprobado

---

### TC-MCP-004 — Consultar el detalle de una evaluación
**Herramienta probada:** `get_assignment_group` en `assignment-mcp`
**Precondición:** Evaluación creada en `TC-MCP-002`.
**Input de prueba:** el `group_id` devuelto.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Muéstrame el detalle completo de la evaluación con group_id <group_id>:
configuración compartida y, por cada variante (A, B, C), sus preguntas en
orden con sus puntos y el total de puntos de la variante.
```
**Output esperado:** Config compartida + las 3 variantes con sus preguntas (enunciado, tipo,
puntos, orden) y el `total_points` de cada una.
**Estado:** ✅ Aprobado

---

### TC-MCP-005 — Corregir una sola variante
**Herramienta probada:** `replace_variant_questions` en `assignment-mcp`
**Precondición:** Evaluación de `TC-MCP-002`, sin publicar.
**Input de prueba:** reemplazar el set completo de preguntas de la variante `B` por otras 5
preguntas del banco, manteniendo el mismo total de puntos.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

En la evaluación group_id <group_id>, reemplaza completamente las preguntas
de la variante B por otras 5 preguntas distintas del banco de ese curso,
manteniendo el mismo puntaje total que las variantes A y C (usa
replace_variant_questions).

Después, consulta get_assignment_group y confírmame que A y C no cambiaron.
```
**Output esperado:** La variante `B` queda con las preguntas nuevas. Verificar con
`get_assignment_group` que las variantes `A` y `C` **no cambiaron**.
**Estado:** ✅ Aprobado

---

### TC-MCP-006 — Actualizar la configuración compartida
**Herramienta probada:** `update_assignment_group` en `assignment-mcp`
**Precondición:** Evaluación de `TC-MCP-002`.
**Input de prueba:** actualización parcial: cambiar `title`, `max_attempts: 2` y vincular un
`grade_item_id` del curso.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Actualiza la evaluación group_id <group_id>: cambia el título a
"Quiz de prueba TC-MCP-006", permite 2 intentos en vez de 1, y vincúlala
al grade_item_id <grade_item_id> del curso. No toques las variantes.

Después confírmame que el resto de la configuración y las 3 variantes
quedaron intactas.
```
**Output esperado:** Los tres campos cambian; el resto de la config y las variantes quedan
intactas. La config es única para las 3 variantes (no hay forma de que difieran).
**Estado:** ✅ Aprobado

---

### TC-MCP-007 — Publicar rechaza variantes con puntaje distinto
**Herramienta probada:** `publish_assignment_group` en `assignment-mcp`
**Precondición:** Evaluación cuya variante `C` fue modificada para sumar 12 puntos mientras
`A` y `B` suman 10.
**Input de prueba:** el `group_id`.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

En la evaluación group_id <group_id>, usa replace_variant_questions para
que la variante C sume 12 puntos totales (por ejemplo, añade una pregunta
extra), mientras A y B se quedan sumando 10 cada una.

Luego intenta publicar la evaluación con publish_assignment_group y
muéstrame el error completo tal como lo devuelve la API.
```
**Output esperado:** Error `422` indicando que las variantes deben tener el mismo puntaje
total y nombrando la variante desviada. El grupo sigue con `is_published: false`.
**Estado:** ✅ Aprobado

---

### TC-MCP-008 — Publicar rechaza grupo con variante vacía o con menos de 2 variantes
**Herramienta probada:** `publish_assignment_group` en `assignment-mcp`
**Precondición:** (a) un grupo con una variante sin preguntas; (b) un grupo con una sola
variante.
**Input de prueba:** publicar cada uno.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Caso (a): en la evaluación group_id <group_id_variante_vacia>, deja la
variante C sin preguntas (usa replace_variant_questions con una lista
vacía si la herramienta lo permite, o dime si no es posible desde el MCP
y por qué). Luego intenta publicar con publish_assignment_group y
muéstrame el error completo.

Caso (b): dado el group_id <group_id_una_variante> que solo tiene la
variante A creada, intenta publicarlo con publish_assignment_group y
muéstrame el error completo.
```
**Output esperado:** En ambos casos error `422` con el motivo concreto (variante vacía /
mínimo de 2 variantes). Ninguno queda publicado.
**Estado:** ✅ Aprobado

---

### TC-MCP-009 — Publicar una evaluación válida
**Herramienta probada:** `publish_assignment_group` en `assignment-mcp`
**Precondición:** Evaluación con 3 variantes no vacías, mismo puntaje total y `closes_at`
futuro.
**Input de prueba:** el `group_id`.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Antes de publicar, consulta get_assignment_group para el group_id
<group_id> y confírmame que las 3 variantes están completas y con el
mismo puntaje total.

Si todo está en orden, publica la evaluación con publish_assignment_group
y resume el resultado: estado final, variantes y puntaje.
```
**Output esperado:** El grupo pasa a `is_published: true`. La publicación **no** ocurrió
automáticamente al crear (verificar que en `TC-MCP-002` quedó en borrador).
**Estado:** ✅ Aprobado

---

### TC-MCP-010 — Consultar el reparto de variantes
**Herramienta probada:** `get_variant_allocations` en `assignment-mcp`
**Precondición:** Evaluación publicada y al menos 3 estudiantes que ya la abrieron
(ver `TC-008`).
**Input de prueba:** el `group_id`.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Muéstrame el reparto de variantes de la evaluación group_id <group_id>:
qué estudiante tiene qué variante y el conteo total por variante (A/B/C).
```
**Output esperado:** Lista de estudiante → variante asignada, más el conteo por variante.
Es solo lectura: no existe herramienta para reasignar la variante de un estudiante.
**Estado:** ✅ Aprobado

---

### TC-MCP-011 — Eliminar una evaluación con intentos ya realizados
**Herramienta probada:** `delete_assignment_group` en `assignment-mcp`
**Precondición:** Evaluación publicada con al menos una submission de estudiante (requiere
spec-019 implementado; si no lo está, marcar como bloqueado).
**Input de prueba:** el `group_id`.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Intenta eliminar la evaluación group_id <group_id> con
delete_assignment_group. Sé que ya tiene intentos de estudiantes
registrados; muéstrame el error completo tal como lo devuelve la API y
explícame en tus palabras qué significa.
```
**Output esperado:** Error `409` indicando que la evaluación tiene intentos y no puede
eliminarse. Los datos permanecen intactos.
**Estado:** ✅ Aprobado

---

### TC-MCP-012 — El agente de evaluaciones no puede mutar el banco
**Herramienta probada:** superficie completa de `assignment-mcp`
**Precondición:** MCP `assignment-mcp` conectado.
**Input de prueba:** listar las herramientas disponibles del servidor.
**Prompt para el agente:**
```
Actúa como el Assignment Agent.

Lista todas las herramientas que tienes disponibles en assignment-mcp
(sus nombres, no las ejecutes). Después dime explícitamente: ¿tienes
alguna herramienta para crear, editar o eliminar preguntas del banco?
Si no la tienes, ¿cómo consultas el banco de preguntas?
```
**Output esperado:** No existe ninguna herramienta de creación, edición o borrado de
preguntas (`create_question`, `update_question`, `delete_question`). El agente solo puede
leer el banco a través de `question-bank-mcp`.
**Estado:** ✅ Aprobado

---

### TC-MCP-013 — La API rechaza peticiones sin API key válida
**Herramienta probada:** API `/api/assignments/*` (probar con `curl`, no vía MCP)
**Precondición:** App corriendo.
**Input de prueba:** `GET /api/assignments/groups` (a) sin cabecera `x-api-key`;
(b) con una `x-api-key` incorrecta.
**Prompt para el agente:** No aplica — este caso se ejecuta directamente contra la API con
`curl`, sin pasar por Claude Desktop ni por el agente:
```bash
# (a) sin x-api-key
curl -i http://localhost:3000/api/assignments/groups

# (b) con x-api-key incorrecta
curl -i -H "x-api-key: clave-incorrecta" http://localhost:3000/api/assignments/groups
```
**Output esperado:** `401` en ambos casos, sin filtrar datos de evaluaciones ni el motivo
exacto del rechazo.
**Estado:** ✅ Aprobado

---

## Casos de prueba — UI admin (solo lectura + publicar)

### TC-001 — Acceso al listado de evaluaciones de un curso
**Precondición:** Sesión activa como Docente A, dueño de un curso con al menos una
evaluación creada vía MCP.
**Pasos:**
1. Navegar al detalle del curso académico (`/admin/courses/[academicCourseId]`).
2. Hacer clic en el enlace "Evaluaciones".
**Resultado esperado:** Se abre `/admin/courses/[academicCourseId]/assignments` con el
`AssignmentGroupList`: cada evaluación muestra título, tipo, ventana, número de variantes y
estado de publicación.
**Estado:** ✅ Aprobado

---

### TC-002 — No existe ruta ni control de creación
**Precondición:** Listado de evaluaciones visible como Docente A.
**Pasos:**
1. Buscar en el listado cualquier botón de "Nueva evaluación" o similar.
2. Navegar directamente a `/admin/courses/[academicCourseId]/assignments/new`.
**Resultado esperado:** No hay ningún control de creación en la UI. La ruta `/new` devuelve
**404**: la creación solo existe vía MCP.
**Estado:** ✅ Aprobado

---

### TC-003 — Detalle: las 3 variantes en solo lectura
**Precondición:** Evaluación creada vía MCP con 3 variantes.
**Pasos:**
1. Desde el listado, abrir el detalle de la evaluación.
**Resultado esperado:** Se muestra la config compartida (tipo, ventana, límite de tiempo,
feedback, intentos, `grade_item` si lo hay) y, por cada variante `A`/`B`/`C`, sus preguntas
en orden con sus puntos y el total de la variante. Los tres totales coinciden.
**Estado:** ✅ Aprobado

---

### TC-004 — El detalle no permite editar nada del contenido
**Precondición:** Detalle de una evaluación abierto.
**Pasos:**
1. Buscar controles para añadir, quitar o reordenar preguntas.
2. Buscar campos editables de puntos, título, ventana o intentos.
**Resultado esperado:** No existe ningún control de edición: todo el contenido es texto de
lectura. La única acción disponible es publicar.
**Estado:** ✅ Aprobado

---

### TC-005 — Publicar una evaluación desde el panel
**Precondición:** Evaluación en borrador, válida (3 variantes no vacías, mismo puntaje).
**Pasos:**
1. En el detalle, hacer clic en `PublishAssignmentGroupButton` ("Publicar").
**Resultado esperado:** La evaluación pasa a "Publicada" en el detalle y en el listado.
**Estado:** ✅ Aprobado

---

### TC-006 — Publicar una evaluación inválida muestra el motivo
**Precondición:** Evaluación en borrador cuya variante `C` tiene puntaje total distinto.
**Pasos:**
1. Intentar publicarla desde el detalle.
**Resultado esperado:** La publicación falla y la UI muestra un mensaje legible con el motivo
(variantes con puntaje distinto, nombrando la variante). La evaluación sigue en borrador.
**Estado:** ✅ Aprobado

---

### TC-007 — Tabla de reparto de variantes
**Precondición:** Evaluación publicada que al menos 3 estudiantes ya abrieron.
**Pasos:**
1. En el detalle, revisar el `VariantAllocationTable`.
**Resultado esperado:** Se lista cada estudiante con la variante que le tocó y el conteo por
variante. Los estudiantes que aún no la abrieron aparecen sin variante (o no aparecen).
**Estado:** ✅ Aprobado

---

## Casos de prueba — Reparto de variantes (estudiante)

> 🚧 **Bloqueado por spec-019.** `lib/assignments/index.ts` ya implementa la
> lógica de reparto (`_getOrAllocateVariantForActor`, `_getStudentAssignmentForActor`,
> `_getActiveAssignmentsByEnrollmentForActor`), pero **no existe ninguna
> página ni endpoint** que un estudiante pueda usar para acceder a una
> evaluación — todas las rutas bajo `/api/assignments/*` son de servicio
> (docente/MCP). El flujo "estudiante abre su evaluación" es el alcance de
> **spec-019 (assignment-solving)**, aún no implementado. TC-008 a TC-012
> quedan bloqueados hasta entonces (mismo criterio ya aplicado a
> `TC-MCP-011`).

### TC-008 — Al primer acceso se asigna una variante
**Precondición:** Evaluación publicada y en ventana. Estudiante 1 con matrícula `active`,
sin haberla abierto nunca.
**Pasos:**
1. Iniciar sesión como Estudiante 1.
2. Abrir la evaluación desde su listado de evaluaciones.
**Resultado esperado:** Se le presenta una de las 3 variantes. En
`assignment_variant_allocations` existe una fila para esa matrícula y esa evaluación.
El estudiante no elige la variante en ningún momento.
**Estado:** 🚧 Bloqueado (spec-019)

---

### TC-009 — La variante es estable entre accesos y entre intentos
**Precondición:** Estudiante 1 ya tiene variante asignada (`TC-008`). Evaluación con
`max_attempts: 2`.
**Pasos:**
1. Recargar la evaluación tres veces y anotar las preguntas mostradas.
2. Cerrar sesión, volver a entrar y abrirla de nuevo.
3. Completar el primer intento e iniciar el segundo.
**Resultado esperado:** En los cinco accesos se muestra **siempre la misma variante**. El
segundo intento usa la misma variante que el primero. La fila de allocation no cambia.
**Estado:** 🚧 Bloqueado (spec-019)

---

### TC-010 — El reparto es balanceado
**Precondición:** Evaluación publicada con 3 variantes. Estudiantes 1 a 6 sin abrirla.
**Pasos:**
1. Que los seis estudiantes abran la evaluación, uno tras otro.
2. Como Docente A, revisar el `VariantAllocationTable` (o `get_variant_allocations`).
**Resultado esperado:** Los conteos por variante no difieren en más de 1 entre sí (con 6
estudiantes, lo esperable es 2/2/2). No se admite un reparto tipo 5/1/0.
**Estado:** 🚧 Bloqueado (spec-019)

---

### TC-011 — El estudiante no accede a las variantes que no le tocaron
**Precondición:** Estudiante 1 con la variante `A` asignada. Se conocen los ids de las
variantes `B` y `C`.
**Pasos:**
1. Como Estudiante 1, intentar abrir directamente la URL de la variante `B`.
2. Consultar por API/DB si puede leer las preguntas de `B` o `C`.
**Resultado esperado:** Acceso denegado o redirección a su propia variante (`404`/`403`
según corresponda). El estudiante no puede leer las preguntas de las otras variantes ni
saber qué variante le tocó a otro estudiante.
**Estado:** 🚧 Bloqueado (spec-019)

---

### TC-012 — Las evaluaciones no publicadas no son visibles para estudiantes
**Precondición:** Evaluación en borrador en el curso del Docente A. Estudiante 1 matriculado
activo en ese curso.
**Pasos:**
1. Iniciar sesión como Estudiante 1 y revisar sus evaluaciones disponibles.
**Resultado esperado:** La evaluación en borrador no aparece y no se le asigna ninguna
variante (no se crea fila en `assignment_variant_allocations`).
**Estado:** 🚧 Bloqueado (spec-019)

---

## Casos de prueba — Aislamiento y calidad

### TC-013 — Aislamiento: el listado no muestra evaluaciones de cursos ajenos
**Precondición:** Docente A y Docente B, cada uno dueño de su curso con evaluaciones.
**Pasos:**
1. Iniciar sesión como Docente B.
2. Navegar al listado de evaluaciones de su propio curso.
**Resultado esperado:** El Docente B solo ve las evaluaciones de su curso; ninguna del curso
del Docente A.
**Estado:** ⬜ Pendiente

---

### TC-014 — Aislamiento: acceso directo a una evaluación ajena
**Precondición:** Docente B con sesión activa. Se conocen el `academicCourseId` del Docente A
y el `groupId` de una de sus evaluaciones.
**Pasos:**
1. Como Docente B, acceder a `/admin/courses/[academicCourseId-de-A]/assignments`.
2. Acceder al detalle `/admin/courses/[academicCourseId-de-A]/assignments/[groupId-de-A]`.
3. Intentar publicar esa evaluación ajena.
**Resultado esperado:** El acceso no revela el contenido ni permite publicar (404 o vacío
por filtrado de RLS vía `academic_courses.teacher_id`).
**Estado:** ⬜ Pendiente

---

### TC-015 — Modo claro/oscuro en las rutas de evaluaciones
**Precondición:** Toggle de tema disponible en la navbar.
**Pasos:**
1. Activar modo oscuro y luego modo claro.
2. Revisar visualmente el listado y el detalle (incluida la tabla de reparto).
**Resultado esperado:** Fondos, textos y bordes respetan los tokens de `DESIGN.md` en ambos
modos. Tipografía JetBrains Mono. Sin textos ilegibles ni fondos blancos en modo oscuro.
**Estado:** ⬜ Pendiente
