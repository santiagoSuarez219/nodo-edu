# test-058 — Ejecutor de código para preguntas coding_challenge

## Datos de prueba
> Recursos a crear vía API/MCP para ejecutar estos casos. Se completan al
> preparar la ronda y **deben eliminarse al cerrarla** (en orden inverso).
> Los fixtures de spec-054 **no existen en `nodo-dev`** (ver CLAUDE.md); se
> parte de `npm run seed:teacher && npm run seed:dev`.

| Recurso | Endpoint / herramienta de creación | Identificador | Eliminado |
|---------|------------------------------------|---------------|-----------|
| Curso académico Python (p. ej. `DEVADA2026`, sembrado por `seed:dev`) | `npm run seed:dev` (no se crea en la ronda) | `734e07bd-608b-47be-9b5e-39d06d686c2e` (DEV-ADA; matrícula `9d945a68-0067-468e-8cfe-98e25bdcc141`) | n/a (fixture de seed) |
| Curso académico Java (p. ej. `DEVEDD2026`, sembrado por `seed:dev`) | `npm run seed:dev` (no se crea en la ronda) | `9f423f49-dbe5-4d73-89f8-9f27ac5fe068` (DEV-EDD; matrícula `9b5e0621-22e8-49a3-be64-ae85fde5ba8e`) | n/a (fixture de seed) |
| Estudiante matriculado en ambos cursos (p. ej. `dev-estudiante1@nodo.local` / `DevStudent2026!`) | `seed:dev` o `students-mcp` → `enroll_student` | `88db2cf9-792b-49eb-b5e0-2abf53ba465d` (dev-estudiante1, matriculado en ambos) | n/a / ⬜ |
| Pregunta Python "suma de dos enteros" (`coding_challenge`, `code_language: python`, 2 casos visibles + 1 oculto con salida distinguible) | `question-bank-mcp` → `create_question` | `d32c0dfb-a200-4059-861b-2ebb493c5282` (oculto: 400000 599999 → 999999) | ✅ (SQL) |
| Pregunta Python con **0 casos visibles** (solo ocultos) — para TC-058-012 | `question-bank-mcp` → `create_question` | `db7d7101-404f-4479-9494-9520bed663c1` | ✅ (SQL) |
| Pregunta Java "invertir cadena" (`coding_challenge`, `code_language: java`, 2 visibles + 1 oculto) | `question-bank-mcp` → `create_question` | `25589e27-5c6d-4423-a87a-ab6f97a7df51` (oculto: qwerty999999 → 999999ytrewq) | ✅ (SQL) |
| Quiz Python A/B/C publicado (las 3 variantes con las preguntas Python; sin límite de tiempo; `max_attempts` ≥ 2) | `assignment-mcp` → `create_assignment_group` + `publish_assignment_group` | `3eec6a8c-211c-49ea-81f8-21438d45f2a8` (con las dos preguntas Python) | ✅ (SQL) |
| Quiz Java A/B/C publicado | `assignment-mcp` → `create_assignment_group` + `publish_assignment_group` | `c918bf64-f644-4449-8739-399354aa6bdc` | ✅ (SQL) |
| Quiz Python con `time_limit_minutes: 1` (para TC-058-008, opcional) | `assignment-mcp` | `c7b1ee0e-baf3-4862-85cf-0774ca50a1e5` | ✅ (SQL) |
| Clave del ejecutor en `.env.local` (`CODE_RUNNER_API_URL`, `CODE_RUNNER_API_KEY`) | Manual por el usuario | — | n/a (retirar solo para TC-058-011) |

> Sugerencia para el caso oculto: usar una salida esperada **inconfundible**
> (p. ej. `999999`) para poder buscarla en la respuesta de red en
> TC-058-006.

**Entorno de pruebas:** desarrollo (`nodo-dev`, `npm run dev` en el puerto 3002)
**Fecha de la ronda:** 2026-10-19
**Nota:** todos los recursos llevan el prefijo `[TEST-058]` en su título/enunciado. Las ejecuciones de `code_runs` se borran en cascada al eliminar los intentos.

## Casos de prueba

### TC-058-001 — Python correcto: todos los casos visibles pasan
**Precondición:** quiz Python publicado; estudiante con sesión iniciada; ejecutor configurado.
**Datos de prueba usados:** `{{estudiante}}`, quiz Python `{{groupId}}`.
**Pasos:**
1. Entrar a `/cuenta/cursos/{enrollmentId}/evaluaciones/{groupId}` e iniciar el intento.
2. En la pregunta "suma de dos enteros", escribir una solución correcta que lea stdin e imprima el resultado.
3. Pulsar "Ejecutar".
**Resultado esperado:** el botón pasa a "Ejecutando…" y se deshabilita; luego aparece un bloque por cada caso visible (2) con Entrada, Salida esperada, Tu salida e insignia "Pasa" (texto + ícono, no solo color); se muestra "Te quedan N ejecuciones para esta pregunta" y la leyenda de que la calificación la hace el docente. Ningún bloque para el caso oculto.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones (aprobado por el usuario, 2026-10-19).

### TC-058-002 — Salida incorrecta: los casos fallan y la diferencia es legible
**Precondición:** TC-058-001 en el mismo intento.
**Pasos:**
1. Modificar la solución para que imprima un valor erróneo (p. ej. `a - b`).
2. Verificar que el panel anterior muestra "El código cambió desde la última ejecución.".
3. Pulsar "Ejecutar".
**Resultado esperado:** los casos muestran "No pasa", con Salida esperada y Tu salida lado a lado o una debajo de otra, legibles en modo claro y oscuro.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones (aprobado por el usuario, 2026-10-19).

### TC-058-003 — Normalización: espacios y saltos de línea finales no hacen fallar
**Precondición:** TC-058-001.
**Pasos:**
1. Modificar la solución correcta para que imprima el resultado seguido de espacios y de dos saltos de línea extra (p. ej. `print(str(a + b) + "   \n\n")`).
2. Pulsar "Ejecutar".
3. Modificarla para que imprima un espacio **inicial** (`print(" " + str(a + b))`) y ejecutar de nuevo.
**Resultado esperado:** en el paso 2 todos los casos "Pasa"; en el paso 3 "No pasa" (los espacios iniciales sí cuentan, D8).
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Paso A: los 2 casos 'Pasa' con espacios y saltos finales. Paso B: 'No pasa' con espacio inicial. Contador coherente (16 tras 4 ejecuciones). Sin observaciones.

### TC-058-004 — Error de sintaxis en Python
**Precondición:** TC-058-001.
**Pasos:**
1. Escribir código con un error de sintaxis (p. ej. `print(` sin cerrar).
2. Pulsar "Ejecutar".
**Resultado esperado:** se muestra un mensaje de error claro en español con el detalle del intérprete (truncado si es largo); ningún caso "Pasa"; el quiz sigue operable.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Un único mensaje con `SyntaxError: '(' was never closed`, sin casos 'Pasa', 15 restantes. Observación: esta ejecución tardó ~13 s en responder (el indicador de Next mostraba 'Rendering', probable compilación en desarrollo o cola del proveedor); las demás tardaron 2-5 s.

### TC-058-005 — Java: correcto y error de compilación con pista de `Main`
**Precondición:** quiz Java publicado; estudiante con sesión iniciada.
**Datos de prueba usados:** quiz Java `{{groupId}}`.
**Pasos:**
1. En la pregunta Java, escribir una solución correcta en `public class Main` y pulsar "Ejecutar".
2. Renombrar la clase a `public class Solucion` y pulsar "Ejecutar".
3. Volver a `Main` e introducir un error de compilación (falta un `;`) y pulsar "Ejecutar".
**Resultado esperado:** (1) todos los casos visibles "Pasa"; (2) error de compilación mostrado **una sola vez** (no repetido por caso) con la pista "En Java, la clase pública debe llamarse Main."; (3) error de compilación sin la pista de `Main`.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). (1) 2 casos 'Pasa'. (2) `Solucion`: error de compilación una sola vez con la pista 'En Java, la clase pública debe llamarse Main.'. (3) falta `;`: error `';' expected` sin la pista.

### TC-058-006 — Bucle infinito: tiempo límite excedido
**Precondición:** TC-058-001.
**Pasos:**
1. Escribir `while True: pass` y pulsar "Ejecutar".
2. Cronometrar aproximadamente cuánto tarda en responder.
**Resultado esperado:** cada caso muestra "Tiempo límite excedido" en pocos segundos (dentro del presupuesto de 25 s de D5); la página no se congela y se puede seguir respondiendo otras preguntas.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Ambos casos 'Tiempo límite excedido' en menos de 10 s; la página siguió operable.

### TC-058-007 — Los casos ocultos no aparecen en la UI ni en la red
**Precondición:** TC-058-001; pregunta con un caso oculto de salida inconfundible (p. ej. `999999`).
**Pasos:**
1. Abrir las herramientas de desarrollador → pestaña Red.
2. Pulsar "Ejecutar" con la solución correcta.
3. Inspeccionar la respuesta de la petición de la Server Action y buscar la entrada y la salida del caso oculto.
4. Repetir la búsqueda en la respuesta HTML/RSC de la carga inicial de la página del quiz.
**Resultado esperado:** solo aparecen los casos visibles; ni la entrada ni la salida del caso oculto figuran en ninguna respuesta; tampoco hay conteo de casos ocultos ni ids de casos.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). La respuesta de la Server Action (427 bytes, capturada con hook de fetch) solo contiene 2 veredictos `passed`: no aparecen `400000`, `999999`, `is_hidden` ni ids. El HTML/RSC de la carga inicial tampoco los contiene.

### TC-058-008 — Intento enviado o fuera de plazo: no se puede ejecutar
**Precondición:** intento en curso del quiz Python; (opcional) quiz con `time_limit_minutes: 1`.
**Pasos:**
1. Enviar el intento con "Enviar respuestas".
2. Volver a la página del quiz / resultados y buscar el botón "Ejecutar".
3. (Opcional) En el quiz de 1 minuto, dejar vencer el tiempo y comprobar que no queda forma de ejecutar.
**Resultado esperado:** el botón "Ejecutar" no se muestra con el intento enviado ni tras vencer el tiempo; no hay ejecución posible desde la UI.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Con el intento enviado la app redirige a /resultados sin botón 'Ejecutar'. En el quiz de 1 minuto el envío automático al vencer también deja la pantalla sin botón. NO cubierto: la invocación directa de `runChallengeAction` con el intento enviado o la ventana vencida (rechazo en servidor); requiere prueba automática del gate.

### TC-058-009 — Límite de ejecuciones e intervalo mínimo
**Precondición:** intento nuevo en curso del quiz Python (segundo intento o quiz recién creado).
**Pasos:**
1. Pulsar "Ejecutar" dos veces seguidas en menos de 5 s (tras terminar la primera).
2. Ejecutar repetidamente (respetando el intervalo) hasta agotar las 20 ejecuciones de la pregunta, observando el contador.
3. Intentar una ejecución más.
4. Ejecutar en **otra** pregunta del mismo intento.
**Resultado esperado:** (1) la segunda se rechaza con un mensaje de esperar unos segundos; (2) el contador baja hasta 0; (3) se rechaza con un mensaje claro de límite alcanzado, sin llamar al proveedor; (4) la otra pregunta tiene su propio contador intacto. El quiz se puede enviar con normalidad.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Intervalo: el segundo clic inmediato se rechaza. HALLAZGO corregido durante la ronda: el mensaje decía 'Alcanzaste el límite de ejecuciones' en vez de 'Ejecutaste hace muy poco. Espera N s'; arreglado en `lib/code-runner/index.ts` y reverificado. Límite: se agotaron las 20 ejecuciones de la pregunta 1 (contador 19→0), la 21ª se rechazó con 'Alcanzaste el límite…' sin llamar al proveedor. La pregunta 2 tuvo su contador propio. `code_runs` tiene 20 filas para la pregunta 1 y sus columnas no incluyen código, entradas ni salidas. Se usó el mismo intento (no uno nuevo) para ahorrar ejecuciones.

### TC-058-010 — Proveedor caído o con error
**Precondición:** intento en curso; simular el fallo con una `CODE_RUNNER_API_URL` inválida (p. ej. host inexistente) en `.env.local` y reiniciar `npm run dev`.
**Pasos:**
1. Pulsar "Ejecutar".
2. Editar la respuesta, esperar el autoguardado y pulsar "Enviar respuestas".
**Resultado esperado:** mensaje "No pudimos ejecutar tu código en este momento…" en español; la respuesta queda guardada y el envío funciona. (En desarrollo Sentry no envía eventos; la ausencia de código en el evento se valida por revisión de código.)
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19) con `CODE_RUNNER_API_URL=https://no-existe.invalid`. "Ejecutar" mostró "No pudimos ejecutar tu código en este momento. Tu respuesta sigue guardada…", consola limpia, autoguardado con `# editado` y envío correcto. Sentry revisado solo por código (en desarrollo no envía eventos).

### TC-058-011 — Ejecutor sin configurar: "no disponible" y el quiz se envía igual
**Precondición:** retirar `CODE_RUNNER_API_URL` y `CODE_RUNNER_API_KEY` de `.env.local` y reiniciar `npm run dev`.
**Pasos:**
1. Iniciar un intento del quiz Python, escribir código y pulsar "Ejecutar".
2. Enviar el intento.
3. Restaurar las variables y reiniciar el servidor al terminar.
**Resultado esperado:** mensaje de que la ejecución no está disponible, sin errores en pantalla ni en consola; el contador de ejecuciones no se consume; el envío funciona.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19) con las variables vacías. Mostró "La ejecución de código no está disponible por ahora. Puedes seguir respondiendo y enviar la evaluación.", sin errores de consola y con el envío correcto. No se verificó por API que `code_runs` no sumara fila; lo respalda la revisión de código (el estado `disabled` se resuelve antes de insertar).

### TC-058-012 — Pregunta sin casos visibles
**Precondición:** quiz que incluya la pregunta Python con 0 casos visibles.
**Pasos:**
1. Escribir un programa que imprima algo fijo (sin leer stdin) y pulsar "Ejecutar".
**Resultado esperado:** se muestra la salida del programa con el aviso "Esta pregunta no tiene casos de ejemplo; tu código se ejecutó sin entrada.", sin pasa/falla y sin revelar los casos ocultos.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Aviso 'Esta pregunta no tiene casos de ejemplo; tu código se ejecutó sin entrada.', salida `hola mundo`, sin pasa/falla y sin datos de casos ocultos.

### TC-058-013 — La calificación sigue siendo manual tras enviar
**Precondición:** un intento enviado con una solución que pasaba todos los casos visibles (TC-058-001).
**Pasos:**
1. Como estudiante, abrir la vista de resultados del intento.
2. Como `dev@nodo.local`, abrir la revisión de entregas del quiz y la entrega del estudiante.
**Resultado esperado:** la pregunta `coding_challenge` aparece pendiente de calificación manual exactamente como antes de este spec (sin puntaje automático ni resultados por caso); el docente la califica a mano como hoy.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorizado por el usuario, 2026-10-19). Lado estudiante verificado: tras enviar, /resultados muestra 'Pendiente de revisión por el docente', puntaje 0.00/4.00 y sin resultados por caso; por API `submissions.status=submitted`, `auto_score=0.00`, `answers.auto_score` y `manual_score` nulos. Lado docente confirmado por el usuario (2026-10-19): las preguntas aparecen pendientes de calificación manual, sin puntaje automático ni resultados por caso, igual que antes del spec.

## Resumen de la ronda
- Aprobados: 13 — Fallidos: 0 — Pendientes: 0 (Ronda 1). Ronda 2 (repetición tras `claim_code_run`): TC-001, TC-006, TC-009 y TC-013 aprobados, 0 fallidos.
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno (el mensaje del rechazo por intervalo se corrigió durante la ronda; `get_variant_question_details` fuera de alcance queda por registrar)
- Limpieza de datos de prueba: ✅ Completada (la API devolvía 409 con intentos o preguntas en uso; el usuario eligió borrar por SQL en `nodo-dev`, verificado por consulta)

## Ronda 2 — repetición tras `claim_code_run` (2026-10-19)
> Se repiten TC-001, TC-009, TC-006 y TC-013 porque `runChallenge` pasó a reservar la ejecución con la función atómica `claim_code_run`. Datos creados en `nodo-dev`; deben eliminarse al cerrar (borrado por SQL con confirmación si la API devuelve 409).

| Recurso | Herramienta de creación | Identificador | Eliminado |
|---------|-------------------------|---------------|-----------|
| Pregunta Python "[TEST-058] Suma de dos enteros" (2 visibles + 1 oculto: 400000, 599999 → 999999) | `question-bank-mcp` → `create_question` + `publish_question` | `9fc0d933-69cc-430f-8640-224a00a42472` | ✅ (SQL) |
| Pregunta Python "[TEST-058] Doble de un entero" (1 visible + 1 oculto: 500000 → 1000000) | `question-bank-mcp` → `create_question` + `publish_question` | `7c394397-f8dd-48eb-b7a5-b07249dd94e3` | ✅ (SQL) |
| Quiz "[TEST-058] Quiz Python (repetición)" en DEV-ADA, 3 intentos, variantes A/B/C iguales | `assignment-mcp` → `create_assignment_group` + `publish_assignment_group` | `4a9a554e-a8ef-4f51-b770-ca1088a7285c` (variantes `83d1e44b-a707-4a98-9eab-6cb219b720af`, `957f956d-0741-4fff-890e-0e60fd346526`, `1ac42091-5572-4738-ab7b-2c7a4bba9b2d`) | ✅ (SQL) |

Estudiante: `dev-estudiante1@nodo.local` (`88db2cf9-792b-49eb-b5e0-2abf53ba465d`), matriculado en DEV-ADA.

### Resultados observados de la Ronda 2 (ejecutados por Claude en el navegador, autorizado por el usuario, 2026-10-19)
Intento `09b32b14-def4-46db-a37d-03c47502cb18` (variante A) de `dev-estudiante1`. **Aprobados por el usuario el 2026-10-19** (TC-058-001, TC-058-006, TC-058-009 y TC-058-013).

- ✅ **TC-058-001 (ejecución normal):** con la solución correcta, "Ejecutar" mostró 2 tarjetas ("Pasa", entrada, salida esperada y salida obtenida), "2 de 2 casos pasan.", "Te quedan 19 ejecuciones…", sin nada del caso oculto (no aparece `999999`) y sin errores en consola. `code_runs`: 1 fila `completed` para la pregunta 1.
- ✅ **TC-058-009 (límites, tras `claim_code_run`):** 30 llamadas simultáneas a `claim_code_run` (intervalo 0, máx. 20) dieron exactamente 20 `ok`, 6 `limit` y 4 `interval`; el límite no se salta en paralelo. Con intervalo de 5 s: `ok` tras 7 s y `interval` (`retry_after: 5`) en la llamada inmediata siguiente. En la UI, "Ejecutar" en la pregunta 2 (20 ejecuciones agotadas) mostró "Alcanzaste el límite de ejecuciones para esta pregunta." y no sumó filas (siguen 20). El límite de ejecuciones de la UI no se agotó con Judge0 real: se simuló vía RPC para no gastar cuota.
- ✅ **TC-058-006 (casos ocultos):** en el texto de la página nunca aparecen las salidas ocultas (`999999`, `1000000`). No se inspeccionó el cuerpo de la respuesta de red.
- ✅ **TC-058-013 (calificación manual):** tras enviar, `submissions.status=submitted`, `auto_score=0.00`, `answers.auto_score` y `manual_score` nulos; `/resultados` muestra "Pendiente de revisión por el docente" y 0.00 / 4.00 sin resultados por caso. Lado docente no revisado en esta ronda.
- **Hallazgo menor:** con `p_min_interval_seconds` = 0, 4 de 30 llamadas simultáneas devolvieron `interval`, porque `now()` es la hora de inicio de la transacción y puede ser anterior al `created_at` de una inserción concurrente. Es conservador (rechaza de más, nunca de menos); usar `clock_timestamp()` lo eliminaría.

**Limpieza Ronda 2:** completada el 2026-10-19. La API devolvió 409 ("ya tiene submissions"); con confirmación del usuario se borró por SQL en `nodo-dev` (`code_runs`, `answers`, el intento, `assignment_questions`, las 3 variantes, el quiz y las 2 preguntas), verificado con consultas (0 filas restantes). No se tocó producción.

## Prueba de humo en producción (2026-10-19)
> Pedida por el usuario para validar "Ejecutar" en producción antes de usarlo en el quiz de Pilas y Colas de Estructuras de datos. Datos creados en **producción** (`academy-page`) con confirmación del usuario; deben eliminarse al terminar. El quiz está publicado en el curso real, sin ítem de calificación y con ventana corta, así que también lo ven sus estudiantes.

| Recurso | Herramienta de creación | Identificador | Eliminado |
|---------|-------------------------|---------------|-----------|
| Pregunta Java "[PRUEBA] Pilas — paréntesis balanceados" (2 visibles + 3 ocultos) | `question-bank-mcp-prod` → `create_question` + `update_question` + `publish_question` | `eb7919ff-730a-4be4-888f-0e1d87d2d725` | ✅ (SQL) |
| Pregunta Java "[PRUEBA] Colas — simulación FIFO" (2 visibles + 2 ocultos) | `question-bank-mcp-prod` → `create_question` + `update_question` + `publish_question` | `fce3c5c4-34f1-4381-86f0-98ccbf9a48c7` | ✅ (SQL) |
| Estudiante "[PRUEBA] Estudiante spec-058" (`prueba.spec058@nodo.test`), matriculado en Estructuras de datos `580506004-20` | `students-mcp-prod` → `create_student` | `d4491469-f4b8-453b-9a00-8deea3b9bfce` (matrícula `e60ca0dc-a747-4da1-abf8-64a490fc7699`) | ✅ (API) |
| Quiz "[PRUEBA] Ejecutor de código — no responder", 2 intentos, 45 min, ventana 20:50–22:30 UTC, variantes A/B iguales | `assignment-mcp-prod` → `create_assignment_group` + `publish_assignment_group` | `6431d2cc-b6a8-45bb-a525-58f604d1d4aa` (variantes `03f1ace5-0cc5-408a-af63-5e62d21e6278`, `3ce35ac6-de6a-446e-9aa2-e2e601a79a8c`) | ✅ (SQL) |

Las soluciones de referencia de ambas preguntas se verificaron localmente con Java 17 contra todos los casos antes de crearlas. La contraseña del estudiante no se registra aquí.

**Resultado (2026-10-19):** ✅ el usuario ejecutó el quiz con el estudiante de prueba en `www.nod0.dev` y reportó que todo funcionó. Solo el estudiante de prueba recibió variante (A); ningún estudiante real abrió el quiz. Tras la prueba se adelantó el cierre a 20:58 UTC para que nadie más pudiera abrirlo.

**Limpieza:** completada el 2026-10-19. `delete_assignment_group` devolvió 409 ("ya tiene submissions"); con autorización del usuario se borró por SQL en producción, en una transacción: el intento del estudiante de prueba (con sus `answers` y `code_runs` en cascada), el grupo del quiz (variantes, `assignment_questions` y asignación en cascada) y las 2 preguntas (casos y keywords en cascada). El estudiante se borró por la API (`delete_student`). Verificado por consulta: 0 filas restantes en todas las tablas, incluido `auth.users`.
