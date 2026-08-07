# spec-043 — [DONE] Formato de código en enunciados y opciones de preguntas

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Las preguntas del banco (`questions.stem`) y las opciones de selección múltiple
(`question_choices.body`) se guardan como texto plano y se pintan en la UI con
interpolación directa de React (`{stem}`, `{choice.body}`). Cuando el docente
escribe código dentro del enunciado —lo habitual en cursos de programación— usa
la convención de Markdown con backticks, pero la UI los muestra literales:

```
¿Qué imprime `print(len(x))` si x = [1, 2]?      ← se lee tal cual, con backticks
Devuelve un ```int```                            ← se lee tal cual, con backticks
```

El resultado es ruido visual: el estudiante no distingue el código del texto y
los backticks se leen como parte del enunciado.

El problema **no se limita a `multiple_choice`**: el `stem` es común a los cinco
tipos de pregunta (`multiple_choice`, `open_text`, `code_snippet`, `code_write`,
`coding_challenge`), así que cualquier enunciado con código está afectado en
todas las superficies donde se muestra. Lo que sí es exclusivo de las preguntas
de selección es el `body` de cada opción.

Existe ya un campo dedicado `code_snippet` / `code_language` que se renderiza en
un bloque aparte (`QuestionRenderer`, `QuestionStem`); ese camino funciona, pero
solo sirve para **un** bloque separado del enunciado y no cubre el código
embebido en la frase ni en las opciones.

## Alcance

### Incluye

- Interpretar, en el momento de renderizar, la notación de código de Markdown en
  `stem` y en `choice.body`:
  - `` `código` `` → fragmento inline monoespaciado.
  - ```` ```lenguaje\ncódigo\n``` ```` → bloque monoespaciado multilínea.
  - ```` ```código``` ```` en una sola línea → se trata como fragmento inline.
- Un componente único de presentación reutilizado por las **ocho** superficies
  donde hoy se pinta texto plano (ver "Impacto en el sistema").
- Estilo monoespaciado con fondo y borde, en modo claro y oscuro, según los
  tokens de `DESIGN.md`. **Sin colores de sintaxis por token.**
- Actualización del system prompt de `question-bank-agent` para documentar la
  convención de backticks al redactar preguntas.

### No incluye

- **Resaltado de sintaxis con colores (Shiki)**. Se descartó por decisión
  explícita del usuario: exigiría pre-renderizar HTML en servidor y propagar un
  campo nuevo (`stem_html`) por el servicio, la API HTTP y el MCP, o bien cargar
  Shiki en el bundle del cliente. El pipeline MDX de las lecciones
  (`lib/mdx/compile.ts` + `rehype-pretty-code`) **no se toca**.
- Cualquier otra sintaxis de Markdown: negritas, cursivas, enlaces, listas,
  tablas, KaTeX o Mermaid en `stem`/`body`. El texto que no esté entre backticks
  se renderiza literal, exactamente como hoy.
- Cambios de esquema en base de datos. `stem` y `body` siguen siendo texto plano
  en Postgres; la interpretación ocurre solo en presentación.
- Cambios en el contrato de las APIs `/api/questions/*` ni en las herramientas
  del MCP. El texto viaja igual que hoy.
- Rediseño del bloque `code_snippet` dedicado, que conserva su presentación
  actual. Solo se alinean sus tokens de color con los del bloque nuevo para que
  no convivan dos estilos distintos de código en la misma tarjeta.
- Editor enriquecido o vista previa en el panel admin al escribir preguntas.

## Impacto en el sistema

### Archivos nuevos

| Archivo | Rol |
|---------|-----|
| `lib/questions/rich-text.ts` | Función pura `parseQuestionText(text): TextSegment[]` — tokeniza backticks. Sin dependencias de React. |
| `components/questions/QuestionText.tsx` | Componente de presentación que consume los segmentos y aplica estilos. |

### Superficies a modificar (8)

| # | Archivo | Línea aprox. | Campo | Cliente/Servidor |
|---|---------|--------------|-------|------------------|
| 1 | `components/courses/QuestionStem.tsx` | 15 | `stem` | servidor (sin `'use client'`) |
| 2 | `components/courses/SelfAssessmentSection.tsx` | 156 | `choice.body` (formulario) | cliente |
| 3 | `components/courses/SelfAssessmentSection.tsx` | 293 | `choice.body` (revisión) | cliente |
| 4 | `components/courses/TeacherAnswerKey.tsx` | 138 | `choice.body` | cliente |
| 5 | `components/student/QuestionRenderer.tsx` | 71 | `choice.body` | cliente |
| 6 | `components/student/AssignmentPlayer.tsx` | 236 | `stem` | cliente |
| 7 | `components/student/SubmissionResult.tsx` | 68 | `stem` | servidor |
| 8 | `components/admin/AssignmentGroupDetail.tsx` | 156 | `stem` | cliente |
| 9 | `components/admin/SubmissionReviewPanel.tsx` | 133 | `choice.body` | cliente |

> Son 9 puntos de edición sobre 8 archivos (`SelfAssessmentSection` tiene dos).

Como la mayoría son **Client Components**, el componente nuevo debe funcionar en
cliente sin `async`: de ahí que el parseo sea síncrono y sin Shiki.

### Restricción de markup

Varias de esas superficies interpolan el texto dentro de elementos **inline**
(`<p>`, `<span>`, `<label>`). Emitir `<pre>` o `<div>` ahí produce HTML inválido
y advertencias de hidratación en React. Por eso `QuestionText` **nunca** emite
`<pre>` ni `<div>`: los bloques multilínea se renderizan como
`<code className="block whitespace-pre overflow-x-auto …">`, válido dentro de
cualquier contenedor inline y con el mismo resultado visual. Esto permite un
cambio quirúrgico —sustituir `{stem}` por `<QuestionText text={stem} />`— sin
reestructurar el markup de ninguna de las nueve ubicaciones.

### Seguridad

El texto se renderiza siempre como nodos de React (nunca
`dangerouslySetInnerHTML`), por lo que el HTML escrito por un docente dentro de
un enunciado sigue mostrándose escapado, igual que hoy. Sin nueva superficie XSS.

### Dependencias

Ninguna nueva. El parser son ~60 líneas de TypeScript sin librerías.

## Evaluación MCP

**¿Aplica MCP?** Sí — solo documentación, sin herramientas nuevas.

- **MCP existente a modificar:** `question-bank-mcp` — **ninguna herramienta
  cambia**. `create_question` y `update_question` ya aceptan cualquier string en
  `stem` y en `choices[].body`; el contrato de entrada y salida queda idéntico.
- **MCP nuevo a crear:** ninguno.
- **System prompt afectado:** `docs/mcps/question-bank-agent.system-prompt.md` —
  debe documentar la convención ahora que el texto se interpreta:
  - usar `` `backticks` `` para identificadores, llamadas y fragmentos cortos
    dentro del `stem` y del `body` de las opciones;
  - usar ```` ``` ```` con lenguaje para fragmentos multilínea embebidos en el
    enunciado;
  - seguir prefiriendo el campo dedicado `code_snippet` + `code_language` cuando
    el código es el *objeto* de la pregunta (tipos `code_snippet`, `code_write`,
    `coding_challenge`), no un inciso dentro de la frase;
  - advertir que un backtick suelto (sin cierre) se mostrará literal.
- **Fase de MCP en este spec:** Fase 4.

También se actualiza la fila de `question-bank-mcp` en `docs/mcps/README.md` si
su descripción menciona el formato del enunciado.

## Fases de implementación

### Fase 1 — Parser de segmentos ✅

- [x] Crear `lib/questions/rich-text.ts` con el tipo
      `TextSegment = { kind: 'text'; value: string } | { kind: 'code'; value: string; display: 'inline' | 'block'; lang: string | null }`.
- [x] Implementar `parseQuestionText(text: string): TextSegment[]` con este orden
      de reconocimiento:
  1. Cercas de triple backtick ```` ```lang?\n…\n``` ````. Si el contenido
     interior **no** tiene salto de línea → `display: 'inline'`; si lo tiene →
     `display: 'block'`.
  2. Backtick simple `` `…` `` → `display: 'inline'`.
  3. Todo lo demás → `kind: 'text'` literal.
- [x] Casos borde cubiertos: cadena vacía, backtick sin cerrar (literal),
      backticks adyacentes, código con `<` y `&`, texto sin ningún backtick
      (debe devolver un único segmento `text`), salto de línea dentro de un
      bloque preservado tal cual.
- [x] La función es pura y sin dependencias de React (reutilizable en servidor).
- Nota de implementación: una cerca de triple backtick de una sola línea
  (```` ```int``` ````) no distingue "lenguaje" de "cuerpo" — se resuelve
  como código inline con el contenido completo, igual que backtick simple.
  Verificado con casos manuales vía `tsx` antes de integrar el componente.

### Fase 2 — Componente de presentación ✅

- [x] Crear `components/questions/QuestionText.tsx` con la firma
      `({ text, className }: { text: string; className?: string })`.
- [x] Renderizar los segmentos: `text` como string plano; `code` inline como
      `<code>` con fondo, borde sutil y `font-mono`; `code` en bloque como
      `<code className="block whitespace-pre overflow-x-auto">`.
- [x] Aplicar los tokens de `DESIGN.md` en claro y oscuro (fondo
      `bg-gray-100 / dark:bg-gray-800`, borde `border-gray-200 /
      dark:border-gray-700`, texto `text-gray-800 / dark:text-gray-200`, radio
      `var(--radius-xs)`). Sin valores crudos de la paleta.
- [x] El tamaño del código se define relativo (`text-[0.9em]`) para que herede la
      escala del contenedor: el mismo componente sirve en el `stem` de 16 px de
      `AssignmentPlayer` y en la lista de 14 px de `AssignmentGroupDetail`.
- [x] Nunca emitir `<pre>` ni `<div>` (ver "Restricción de markup").
- [x] Si `text` es vacío o nulo, no romper: renderizar nada.

### Fase 3 — Integración en las superficies ✅

- [x] Sustituir la interpolación por `<QuestionText …>` en las 9 ubicaciones de
      la tabla de "Impacto en el sistema", una por una.
- [x] Verificar que en las opciones el `<code>` no rompe la alineación del
      `flex items-start` ni el área clicable del `<label>`.
- [x] Alinear los colores del bloque `code_snippet` existente
      (`QuestionRenderer`, `QuestionStem` y adicionalmente
      `SubmissionReviewPanel`, que tenía el mismo bloque duplicado) con los del
      componente nuevo, para no mostrar dos estilos de código distintos en la
      misma tarjeta.
- [x] `npm run lint` y `npm run build` en verde.
- Hallazgo durante la implementación: `components/admin/SubmissionReviewPanel.tsx`
  tiene un décimo punto de render (`answer.question_stem`, línea 90) que la
  tabla original de "Impacto en el sistema" no había listado por separado —
  es la misma superficie 9, así que se corrigió junto con `choice.body` sin
  cambiar el alcance del spec.

### Fase 4 — MCP: actualizar `question-bank-mcp` ✅

- [x] No se agregan ni modifican herramientas del servidor MCP.
- [x] Actualizar `docs/mcps/question-bank-agent.system-prompt.md` con la
      convención de backticks descrita en "Evaluación MCP" (nueva sección
      "Formato de código en el enunciado y en las opciones (spec-043)").
- [x] Revisar la entrada de `question-bank-mcp` en `docs/mcps/README.md` — no
      requiere cambio: su descripción no menciona el formato del `stem`, solo
      las operaciones CRUD y el montaje, que no cambiaron.
- [ ] Verificar que el MCP sigue respondiendo con normalidad a
      `create_question` / `update_question` con un `stem` que contenga backticks
      (el texto debe guardarse y devolverse **sin alterar**) — se ejecuta como
      parte de la ronda manual (`TC-MCP-043-001`), Fase 5.

### Fase 5 — Pruebas ✅

- [x] Ejecutar la ronda manual de `docs/testing/test-043-formato-de-codigo-en-preguntas.md`
      — 13/13 casos aprobados (`TC-043-001`…`011`, `TC-MCP-043-001`/`002`).
- [ ] Ejecutar las pruebas automáticas — no aplica: framework "por definir"
      según "Testing" en `CLAUDE.md`.
- [x] Limpiar los datos de prueba: curso académico, estudiante, 7 preguntas,
      grupo de evaluación y envío, verificados vacíos tras la limpieza. El
      curso académico y algunos recursos con envío real requirieron SQL
      directo autorizado explícitamente por el usuario (bloqueados por 409 en
      la API — comportamiento correcto, no un bug); el resto se limpió vía
      MCP normal.
- Hallazgo fuera de alcance registrado como **DEBT-057** en
  `docs/specs/backlog.md`: `code_snippet`/`code_language` no se persisten
  para `code_write`/`coding_challenge`.

## Criterios de aceptación

1. Un enunciado con `` `print(len(x))` `` se muestra con `print(len(x))` en un
   fragmento monoespaciado con fondo, **sin backticks visibles**.
2. Una opción de selección múltiple con ```` ```int``` ```` se muestra con `int`
   en un fragmento monoespaciado inline, sin backticks y sin romper la fila.
3. Un enunciado con una cerca multilínea con lenguaje
   (```` ```python\n…\n``` ````) se muestra como bloque monoespaciado, con
   saltos de línea e indentación preservados y scroll horizontal si desborda.
4. El texto fuera de backticks se muestra exactamente igual que antes del cambio:
   sin negritas, cursivas ni ninguna otra transformación de Markdown.
5. Un backtick suelto sin cierre se muestra literal y no rompe el render de la
   pregunta ni de la página.
6. El comportamiento es idéntico en las nueve ubicaciones: autoevaluación de
   lección (formulario y revisión), clave de respuestas del docente, evaluación
   A/B/C, opciones de evaluación, página de resultados, panel de revisión del
   docente y detalle de grupo de evaluación.
7. Los cinco tipos de pregunta se benefician en el `stem`, no solo
   `multiple_choice`.
8. El formato se ve correcto en modo claro y en modo oscuro.
9. La consola del navegador no muestra advertencias de hidratación ni de
   anidamiento inválido de HTML en ninguna de las superficies.
10. El texto guardado en base de datos no cambia: `get_question` devuelve el
    `stem` con sus backticks intactos.
11. El agente del banco de preguntas, siguiendo su system prompt actualizado,
    redacta enunciados con backticks y estos se muestran formateados en la UI.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al
> spec" en `CLAUDE.md`).

- **Manuales:** `docs/testing/test-043-formato-de-codigo-en-preguntas.md` —
  casos `TC-043-001`…`TC-043-011` y `TC-MCP-043-001`…`TC-MCP-043-002`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-043-formato-de-codigo-en-preguntas.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio. El parser de la
  Fase 1 es una función pura y es el candidato natural a prueba unitaria en
  cuanto exista framework.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-07
