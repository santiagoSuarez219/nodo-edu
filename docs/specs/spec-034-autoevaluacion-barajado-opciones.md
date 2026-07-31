# spec-034 — [IN PROGRESS] Autoevaluación de cierre: barajar el orden de las opciones por estudiante

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Las opciones de las preguntas de autoevaluación se renderizan **siempre en el
mismo orden**, tal como se guardaron en `question_choices`.
`getSelfAssessmentForLesson()` ([lib/self-assessment/index.ts:77](../../lib/self-assessment/index.ts#L77))
mapea `row.choices` sin reordenar, y `SelfAssessmentSection` las pinta en ese
orden de array.

Combinado con el patrón de autoría detectado en **[[DEBT-029]]** —las 3
preguntas publicadas de
`estructuras-de-datos/implementacion-de-pilas-en-java` tienen la correcta en
`order_index = 0`— el resultado es que **un estudiante puede acertar la
autoevaluación completa eligiendo siempre la primera opción, sin leer nada**.

Eso no es un detalle cosmético: la autoevaluación es el requisito que desbloquea
"marcar lección completada" (`page.tsx:141`). Si se puede superar sin leer, el
gate no mide nada.

Arreglarlo solo en el contenido (variar posiciones al autorar) no escala: depende
de que cada autor se acuerde, en cada pregunta, para siempre. Este spec ataca el
lado de plataforma, que sí escala.

### Por qué el orden debe ser *estable*, no aleatorio por request

Un `Math.random()` por render sería incorrecto. `SelfAssessmentSection` llama a
`router.refresh()` tras enviar ([línea 77](../../components/courses/SelfAssessmentSection.tsx#L77)),
lo que vuelve a ejecutar el server component y re-obtiene las preguntas: con
orden aleatorio por request, **las opciones saltarían de lugar justo mientras el
estudiante lee su feedback**, con la respuesta correcta ya resaltada. Lo mismo al
pulsar "Reintentar".

La solución es un barajado **determinista sembrado por `(user_id, question_id)`**:
estable para un mismo estudiante en una misma pregunta (sobrevive recargas,
`router.refresh()` y reintentos), distinto entre estudiantes, y sin escribir nada
en base de datos.

## Alcance

### Incluye

- Un helper de barajado determinista sembrado, nuevo, en `lib/self-assessment/`.
- Aplicarlo a las opciones que devuelve `getSelfAssessmentForLesson()`.
- Fijar el orden de entrada del barajado con
  `.order('order_index', { referencedTable: 'question_choices' })`, hoy ausente:
  sin él PostgREST no garantiza el orden de un recurso embebido, así que la
  semilla se aplicaría sobre una entrada no determinista.

### No incluye

- **Barajar el orden de las *preguntas*** (solo las opciones de cada pregunta).
- **Implementar `shuffle_choices` en las evaluaciones formales A/B/C** — ver
  **[[DEBT-034]]**: ese flag existe en el esquema y en la UI admin pero ningún
  código lo lee. Es un problema real y adyacente, pero de otro flujo
  (`get_variant_question_details`) y con su propia decisión de producto
  (implementarlo vs. quitar el flag). Este spec deja el helper reutilizable.
- **Corregir las preguntas ya publicadas** con la correcta en primera posición
  (frente de contenido de DEBT-029). Tras este spec deja de importar para el
  estudiante, pero sigue siendo buena práctica de autoría.
- Cambiar el modelo de datos: `order_index` se mantiene intacto en la base; el
  barajado es solo de presentación.

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/self-assessment/shuffle.ts` | **Nuevo.** `seededShuffle<T>(items, seed)` — Fisher-Yates con PRNG sembrado desde un hash del seed |
| `lib/self-assessment/index.ts` | `getSelfAssessmentForLesson()`: añadir `.order(...)` sobre `question_choices`, obtener el usuario actual y barajar las opciones de cada pregunta con semilla `${userId}:${questionId}` |
| `lib/self-assessment/types.ts` | Sin cambios — `order_index` sigue en el tipo (ya no se usa para renderizar, pero es dato legítimo de la fila) |
| `components/courses/SelfAssessmentSection.tsx` | **Sin cambios.** Ya renderiza `question.choices` en orden de array; no ordena por `order_index` |

### Interacción con spec-031 (clave de respuestas del docente) — decisión requerida

**`getAnswerKeyForLesson()` NO debe barajar.** El docente necesita una vista
canónica y estable para dictar en clase.

Pero eso **invalida por diseño un criterio de aceptación de spec-031**, que exige
que el orden de la clave del docente coincida exactamente con el que ve el
estudiante (ver también **[[DEBT-022]]**). Con barajado por estudiante, "el orden
que ve el estudiante" deja de ser único: hay uno distinto por cada uno, así que
el criterio se vuelve insatisfacible tal como está escrito.

Este spec lo **supersede explícitamente**: la clave del docente pasa a mostrarse
en orden canónico (`order_index`), y la correspondencia con el estudiante se
mantiene por el *contenido* de cada opción, no por su posición. Hay que anotarlo
en spec-031 al implementar.

## Evaluación MCP

**¿Aplica MCP?** No.

El barajado es una transformación de presentación en el servidor; no expone datos
ni acciones nuevas, no cambia el esquema y no altera ninguna superficie de
lectura para un agente. `question-bank-mcp` sigue viendo y escribiendo
`order_index` igual que antes: el orden almacenado no cambia.

## Fases de implementación

### Fase 1 — Helper de barajado determinista
- [x] Crear `lib/self-assessment/shuffle.ts` con `seededShuffle<T>(items: T[], seed: string): T[]`
- [x] Derivar la semilla numérica de un hash del string (`crypto.createHash('sha256')`),
      no de `Math.random()`
- [x] Implementar Fisher-Yates con un PRNG determinista (ej. mulberry32)
- [x] La función debe ser pura: misma entrada → misma salida, sin mutar el array original

### Fase 2 — Aplicarlo en la consulta de autoevaluación
- [x] En `getSelfAssessmentForLesson()`, añadir
      `.order('order_index', { referencedTable: 'question_choices' })` para fijar
      la entrada del barajado
- [x] Obtener el usuario actual con `getCurrentUser()`
- [x] Barajar las opciones de cada pregunta con semilla `${userId}:${questionId}`
- [x] Definir el fallback sin sesión: sembrar solo con `questionId` (determinista,
      igual para todos) — la sección no se renderiza para anónimos, pero la
      función es invocable y no debe romper

### Fase 3 — Verificación de no regresión
- [x] Confirmar que `submitSelfAssessment()` sigue calificando bien: compara
      **IDs** de opción, no posiciones
      ([lib/self-assessment/index.ts:354-360](../../lib/self-assessment/index.ts#L354-L360)),
      así que es independiente del orden — verificar que sigue siendo cierto
- [x] Confirmar que `getAnswerKeyForLesson()` **no** baraja y mantiene orden canónico
- [x] Anotar en `spec-031-vista-docente-leccion.md` que su criterio de
      correspondencia de orden queda superseded por este spec

### Fase 4 — Verificación final
- [ ] `npm run lint` sin errores nuevos
- [ ] `npm run build` en verde
- [ ] Ejecutar la ronda manual de `docs/testing/test-034-autoevaluacion-barajado-opciones.md` (pendiente prueba manual)

## Criterios de aceptación

1. Dos estudiantes distintos, en la misma pregunta, ven las opciones en **orden
   distinto** (con suficientes opciones para que la colisión sea improbable).
2. Un mismo estudiante ve **siempre el mismo orden** para una misma pregunta:
   tras recargar, tras `router.refresh()` post-envío, y tras pulsar "Reintentar".
3. Las opciones no saltan de posición mientras el estudiante lee su feedback.
4. La calificación es correcta independientemente del orden mostrado: responder
   bien da "Correcto" y responder mal da "Incorrecto", con la opción correcta
   resaltada donde efectivamente esté.
5. La clave de respuestas del docente (spec-031) se muestra en orden canónico
   (`order_index`) y sigue marcando la opción correcta correctamente.
6. `order_index` en `question_choices` no cambia: el barajado es solo de
   presentación.
7. Todo lo verificado en `test-033` sigue funcionando (resumen tras recargar,
   "Reintentar", desbloqueo de "marcar lección completada").

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-034-autoevaluacion-barajado-opciones.md`
  — casos `TC-034-001` … `TC-034-007`.
- **Automáticas (e2e/unit):** no se crea archivo todavía (framework "por definir",
  CLAUDE.md → "Testing"). `seededShuffle` es una función pura y sería el
  **primer candidato natural a test unitario** del proyecto cuando exista
  framework: determinismo, no mutación, y distribución sobre semillas distintas.

## Deuda técnica relacionada

- **[[DEBT-029]]** — este spec resuelve su frente de plataforma. El frente de
  contenido (variar posiciones al autorar) queda abierto pero deja de ser
  crítico.
- **[[DEBT-034]]** — `shuffle_choices`/`shuffle_questions` decorativos en las
  evaluaciones A/B/C. Fuera de alcance; este spec deja el helper listo para
  reutilizar.
- **[[DEBT-022]]** — `getAnswerKeyForLesson` duplica la consulta de
  `getSelfAssessmentForLesson`. Este spec **agranda la divergencia** (una baraja,
  la otra no), lo que refuerza el caso de extraer el helper común que ese ítem
  propone.
- **[[DEBT-020]]** — tokens crudos de paleta en este componente.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-31 ("Implementa el spec34", instrucción explícita en esta sesión)
