# Semana 06 — 7 al 13 de septiembre

**Rama:** `feat/semana-06-analisis-de-algoritmos` (borrada tras el merge)
**Estado:** ✅ Contenido listo · ✅ `@reviewer` (1.ª pasada CAMBIOS REQUERIDOS, corregidos) · ✅ Mergeada a `development`

> Esta rama también absorbió dos correcciones de contenido retroactivas a
> lecciones ya publicadas (semanas 4 y 5), pedidas por el usuario al revisar
> el material en curso. Ver "Decisiones" para el detalle.

---

## Ronda — `analisis-de-algoritmos` (2026-08-22 a 2026-08-24)

**Alcance confirmado por el usuario:** Semana 6, **solo Sesión T** (Cómo
resolver recurrencias). La Sesión P (★, Laboratorio evaluativo 1 —
Fundamentos, complejidad y recurrencias, 15%) queda explícitamente fuera de
esta ronda.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | 7–13 sep | Cómo resolver recurrencias — sustitución, árbol de recursión, método maestro | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E0 · Arranque | Árbol limpio, rama creada desde `development` sin choques | ✅ |
| E2 · Plan de lección | Aprobado sin ajustes en la primera propuesta | ✅ |
| E3 · Lección `.mdx` + registro TS | `como-resolver-recurrencias`, `order: 6` — con dos rondas de ajuste (ver Decisiones) | ✅ |
| E4 · Apuntes del docente | No pedidos en esta ronda | — |
| E5 · Cuestionario de cierre | No propuesto en esta ronda — queda pendiente | — |
| E6 · Guía del estudiante | No aplica — Sesión P fuera de alcance esta ronda | — |
| E6 · Quiz A/B/C | No aplica — el ★ de la semana es un informe de laboratorio, no un assignment A/B/C | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/como-resolver-recurrencias.mdx` | ✅ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 6`) | ✅ |
| Apunte de clase | — | **No pedido** en esta ronda |
| Guía del estudiante | — | **No aplica** (Sesión P fuera de alcance) |

### Cuestionario de cierre

No se propuso en esta ronda. Pendiente para una ronda futura.

### Quiz calificable A/B/C

No aplica — el momento evaluativo de la Semana 6 (★, 15%) es el informe de
laboratorio en GitHub de la Sesión P, no un assignment A/B/C.

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Sesión T de la Semana 6 resuelve formalmente la recurrencia de merge
  sort** (`T(n) = 2T(n/2) + Θ(n)`) por tres caminos independientes
  (sustitución, árbol de recursión, método maestro), confirmando
  `Θ(n log n)` — cumple explícitamente la promesa que las lecciones de las
  semanas 4 y 5 dejaron pendiente.
- **Diagrama `xychart-beta` de comparación `n²` vs. `n log₂ n` corregido
  proactivamente** antes de mostrarlo al usuario: el rango original
  (`n=10..5000`, eje Y hasta 25 millones) tenía el mismo defecto de escala
  ya identificado y corregido en la Semana 5 (curvas aplastadas contra el
  eje para los primeros puntos). Se ajustó a `n=5..50` para que ambas
  curvas se vean en toda su extensión.
- **Apertura de la lección corregida tras hallazgo del usuario**: afirmaba
  que el peor caso de insertion sort "se contó término a término, se sumó
  el trabajo de cada elemento y se llegó a una cifra concreta: `Θ(n²)`" —
  ninguna lección anterior había hecho esa suma formal. Reescrita (dos
  apariciones) para reflejar con precisión lo que sí existía: el costo por
  elemento (Semana 4) y el nombre formal asignado vía las definiciones de
  O/Θ/Ω (Semana 5), sin una demostración algebraica completa.
- **Sección de análisis de costo línea a línea de insertion sort, agregada y
  luego reubicada**: a partir del hallazgo anterior, se escribió una
  sección nueva con el método clásico de Cormen (asignar costo por línea,
  contar ejecuciones, sumar a `T(n)`, sustituir mejor/peor caso) —
  inicialmente en la lección de la Semana 4, después **movida** a la Semana
  5 por pedido explícito del usuario: encaja mejor como ejemplo trabajado
  de "cómo se llega a `O(n²)`" y de "por qué se descartan constantes y
  términos menores", justo donde esa lección ya hace ambos argumentos. En
  ese momento la Semana 4 quedó revertida a su estado exacto en
  `development` (verificado con `git diff` vacío) — luego, en un commit
  posterior de esta misma ronda, sí volvió a divergir por la sección de
  complejidad temporal/espacial (ver más abajo).
- **Distinción complejidad temporal vs. espacial, agregada retroactivamente
  a la Semana 4**: el usuario notó que el curso nunca definió formalmente
  estos dos conceptos pese a ser básicos de la asignatura — todo el
  análisis hecho hasta ahora era implícitamente temporal, sin nombrarlo.
  Alcance confirmado explícitamente: solo el concepto formal (definición +
  que ambas se miden con la misma notación asintótica), sin reanalizar
  insertion sort/merge sort en profundidad de espacio. Se agregó como
  sección nueva al inicio de la lección de la Semana 4, y el topic
  correspondiente se agregó tanto en `lib/courses/data/analisis-de-algoritmos.ts`
  como, con autorización explícita del usuario, en
  `microdiseno/info.md` (Semana 4) — el concepto no estaba planeado en
  ningún punto del semestre.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npx tsc --noEmit` en verde
- [x] Checklist de `lesson-authoring` §8 recorrido (sin `# H1`, sin `###`,
  `updatedAt` de hoy, `summary` en frontmatter y TS)
- [x] Coherencia cruzada: la lección de la Semana 6 retoma exactamente lo
  que las Semanas 4 y 5 dejaron pendiente (recurrencia de merge sort,
  `Θ(n²)` de insertion sort) y lo resuelve por tres métodos independientes;
  las correcciones a la Semana 4 y 5 quedaron alineadas entre sí (sin
  referencias cruzadas rotas tras mover la sección de costo línea a línea)
- [x] `npm run lint` en verde (0 errores, 8 advertencias preexistentes sin relación)
- [x] `@reviewer`: 1.ª pasada **CAMBIOS REQUERIDOS** (1 bloqueante: 46 fórmulas
  en backticks en vez de `$...$` en `como-resolver-recurrencias.mdx`,
  detectadas por análisis del AST — se habrían renderizado literales con las
  barras invertidas visibles; 3 mayores: bullet de `n/b` mal redactado,
  contradicción entre "casi 55 veces" y el ratio real que predice la
  recurrencia (≈88.860× para n=1.850.000 — verificado con Python), docstring
  faltante en el `insertion_sort` reubicado a la Semana 5; varios menores:
  "`log₂n` niveles" corregido a "`log₂n + 1`", notación `t_i` unificada a
  KaTeX, nodos flotantes del diagrama del árbol conectados, bullet de
  síntesis agregado en la Semana 4, frase residual sobre "ya contaste
  término a término" ajustada) — todos corregidos. La primera conversión
  automática de backticks a `$...$` corrompió por error los 3 bloques
  Mermaid del archivo (el script no distinguía cercas de triple backtick de
  spans en línea); se revirtió y se rehizo con un script que respeta las
  cercas de código, verificado con el mismo conteo (46) que reportó
  `@reviewer`. Adicionalmente, hallazgo propio (no del reviewer): el
  `xychart-beta` final usaba `line "nombre" [...]`, sintaxis sin precedente
  en el repo ni documentada en `mermaid_guia_completa.md` — cambiado al
  formato `line [...]` sin etiqueta, con la aclaración de qué curva es cuál
  movida a la prosa. Commits de corrección: `a2299e8`, `9d2e243`.

**Merge a `development`:** ✅ completo, sin conflictos (commit
`merge: week 6 lesson on solving recurrences, plus reviewer fixes`).
`npm run build` verificado en verde sobre `development` ya mergeada. Rama
`feat/semana-06-analisis-de-algoritmos` borrada (solo local, nunca se
pusheó a remoto).

## Despliegue a producción (2026-08-24)

> Este despliegue combinó en un solo release el trabajo de `development`
> acumulado desde el 18 de agosto: las Semanas 3-6 de `analisis-de-algoritmos`
> (esta rama y las de `semana-05.md`) **y** trabajo de `estructuras-de-datos`
> ajeno a esta sesión (T1/T2 de su Semana 4, refactor de 3 capas) — alcance
> confirmado explícitamente por el usuario antes de tocar `main`.

- **D0/D1 — hallazgos antes del merge:**
  - Slug renombrado en `estructuras-de-datos` (`composicion-agregacion-y-diagramas-de-paquetes`
    → `asociacion-agregacion-y-composicion`) dejaba huérfana su fila de
    cierre en producción — anotado como riesgo en `semana-04.md` y nunca
    resuelto. Como el nuevo slug no existe en producción hasta que el
    deploy termina, no se pudo pre-cerrar por adelantado (limitación de la
    API): se cerró apenas el deploy quedó en vivo (ver abajo), con una
    ventana de exposición breve pero real. Fila huérfana del slug viejo
    limpiada antes del merge.
  - `main` tenía **2 commits locales sin pushear** (`36e2501`, hotfix del
    diagrama UML "Dueño"/Mermaid en `estructuras-de-datos`) que nunca
    llegaron a `development` — reaplicado manualmente en `development`
    (commit `bf63c2b`) antes de mergear, en vez de confiar en que el merge
    lo preservara.
- **D2 — Merge y push a `main`:** ✅ `deploy: release 2026-08-24` (`0d4cb72`),
  sin conflictos (el fix del diagrama UML se auto-mergeó limpio gracias al
  paso anterior). `npm run build` verificado en verde sobre `main`.
- **D1 (cierre post-deploy):** ✅ `estructuras-de-datos/asociacion-agregacion-y-composicion`
  cerrada vía `courses-mcp-prod` (2026-08-24T13:50:28Z), mismo motivo que el
  slug viejo. El monitor en segundo plano que vigilaba el deploy se detuvo
  por timeout antes de detectarlo (el HTTP 307 de la ruta pública no era una
  señal útil — es el redirect de autenticación, no un indicador de
  disponibilidad); se verificó y cerró manualmente. Confirmado con
  `list_course_lessons`: catálogo de 41 lecciones, `orphan_disabled_slugs: []`.
- **D3 — Banco de preguntas replicado:**
  - Semana 5 de AA (`notacion-o-theta-y-omega`, 6 preguntas) + 5 keywords de
    soporte — ver detalle en `semana-05.md`.
  - **Semana 4 de AA (`analisis-de-algoritmos-y-divide-y-venceras`, 6
    preguntas)** — hallazgo del usuario: nunca se había replicado, pese a
    llevar creada en desarrollo desde antes del inicio de esta ronda (nunca
    quedó registrado en una bitácora porque se creó antes de que existiera
    `semana-05.md`). El servidor de desarrollo estaba caído en el momento
    (túnel a `mirp-lab` desconectado) — se recreó en producción a partir del
    contenido exacto ya verificado en la conversación, sin depender del
    servidor local. Keyword `recursividad` ya existía en producción (con
    otra etiqueta/sin clasificar, mismo slug — reutilizada tal cual). IDs
    en producción: `cad2e1f9-86aa-45a5-a8c9-0b40c5007234`,
    `4c866ca3-0dc6-4ddb-a314-b672b88abc60`,
    `b39c42ed-86f2-4ab0-811f-531ce8160250`,
    `c3553a08-5d5e-4bee-b62b-e4ef6bb80cb4`,
    `f2d8548c-0dd4-4147-b9ca-a550b303b29b`,
    `7c960b51-d636-40ab-8d1f-9efe155dc81a` — publicadas y montadas, orden
    0-5, verificado.
  - La Semana 6 no tiene cuestionario todavía (pendiente, ver abajo).
- **D4 — Lecciones abiertas (`courses-mcp-prod`), alcance confirmado por el
  usuario — solo `analisis-de-algoritmos`, Semanas 4-6:**
  `analisis-de-algoritmos-y-divide-y-venceras`, `notacion-o-theta-y-omega`,
  `como-resolver-recurrencias`. Verificado con `list_course_lessons` que la
  Semana 7 en adelante (`subarreglo-maximo-y-strassen` y siguientes) sigue
  cerrada, sin filas huérfanas. No se tocó ninguna lección de
  `estructuras-de-datos` en este paso (fuera del alcance confirmado).

## Pendientes

- Proponer el cuestionario de cierre de la Semana 6 (E5) — *nota: se refiere
  a la Semana 6 de `analisis-de-algoritmos`, ver ronda arriba. La Semana 6 de
  `estructuras-de-datos` sí tiene su cuestionario, ver ronda abajo.*
- Diseñar la Sesión P de la Semana 6 de `analisis-de-algoritmos` (Laboratorio
  evaluativo 1, ★, 15%) en una ronda futura.
- Decidir en qué apunte futuro se resuelve la discrepancia de alcance con
  `microdiseno/info.md` (Semana 3 P) anotada en `semana-05.md`.
- Despliegue a producción de la ronda `estructuras-de-datos` de abajo:
  pendiente de confirmación del usuario.

---

## Ronda — `estructuras-de-datos` (2026-09-08)

**Alcance confirmado por el usuario:** Semana 6 (8–11 sep 2026), **solo
Sesión T1** (Operaciones sobre la lista simple — inserción, búsqueda,
complejidad). El cronograma agrupa T1 con eliminación y comparación con
arreglos, pero el usuario acotó el alcance a la lección `order: 18` ya
existente; la lección `order: 19` ("Eliminación en lista simple y
comparación con arreglos") queda explícitamente fuera de esta ronda. La
Sesión T2 (lista doble/circular) y la Sesión P (lab `ListaDoble<T>` /
`ListaCircular<T>`) tampoco están en alcance.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T1 | 8 sep (hoy) | Operaciones sobre la lista simple: inserción (inicio, final, posición arbitraria), búsqueda (por índice, por valor), análisis de complejidad | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E0 · Arranque | Árbol limpio, rama `feat/semana-06-estructuras-de-datos-operaciones-lista-simple` creada desde `development` | ✅ |
| E2 · Plan de lección | Aprobado sin ajustes en la primera propuesta | ✅ |
| E3 · Lección `.mdx` + registro TS | `operaciones-sobre-la-lista-simple`, `order: 18` — aprobada sin ajustes | ✅ |
| E4 · Apuntes del docente | Pedidos explícitamente; producidos y corregidos (ver Decisiones) | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No aplica — sin sesión práctica en el alcance de esta ronda | — |
| E6 · Quiz A/B/C | No aplica — Semana 6 sin `★` | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/estructuras-de-datos/operaciones-sobre-la-lista-simple.mdx` | ✅ (en `development`, pendiente de deploy) |
| Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 18`) | — |
| Apunte de clase | `content/cursos/estructuras-de-datos/apuntes/operaciones-sobre-la-lista-simple.md` | Solo owner/admin (en `development`) |
| Guía del estudiante | — | No aplica |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `operaciones-sobre-la-lista-simple` | desarrollo | `baa2a3c1-d505-4bba-a639-e8318e7e036e`, `c27f20cd-267e-4efe-b244-948b69594497`, `d974dcd7-3ec6-4889-9029-2232259af15a`, `c2781397-adb6-42ca-94e4-55d42b177ea6`, `e0c86ef6-4e27-4f1b-bdc2-e0787b40f0af`, `b308244c-3d38-4425-9ac8-77fdfeef777b` | ✅ | ✅ (orden 0-5) |
| `operaciones-sobre-la-lista-simple` | **producción** | — | ⬜ | ⬜ |

> Keyword nueva creada en desarrollo: `complejidad` (kind: `tema`). Las
> preguntas **no viajan con el deploy**: pendiente de replicar en producción
> en D3 cuando se despliegue esta ronda.

### Quiz calificable A/B/C

No aplica — la Semana 6 de `estructuras-de-datos` no lleva `★`.

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Apuntes del docente corregidos antes de mostrarlos**: el primer borrador
  de `@lab-designer` asumía que `insertarAlFinal()` ya existía con ese
  nombre desde la sesión anterior (Semana 5) y delegaba en él sin escribir
  su código. La lección `.mdx` ya aprobada introduce el mismo método como
  código **nuevo** de esta sesión, con el nombre `insertarFinal()` (la
  Semana 5 solo lo había mostrado en un demo privado de sus apuntes, nunca
  en la lección publicada). Reescribí el Paso 2 de los apuntes con el
  código completo de `insertarFinal()` tal como aparece en el `.mdx`,
  corregí la delegación en `insertarEnPosicion()` y renuméré los pasos (0 a
  6) — **motivo:** evitar que el docente proyecte en clase un nombre de
  método que no coincide con lo que el estudiante ve en la lección
  publicada.

**Hallazgos de `@reviewer` (1.ª pasada, `CAMBIOS REQUERIDOS`) y su resolución:**

| # | Severidad | Hallazgo | Resolución |
|---|---|---|---|
| 1 | 🔴 Bloqueante | La lección `.mdx` no tiene diagramas Mermaid | **Confirmado por el usuario como decisión deliberada** — se dejan fuera a propósito en esta lección, no es un olvido |
| 2 | 🔴 Bloqueante | La bitácora afirmaba haber cumplido el checklist de diagramas | Corregido: ver nota en "Verificación (E7)" abajo |
| 3 | 🟠 Mayor | Los apuntes creaban `insertarFinal()` sin resolver la colisión con `insertarAlFinal()` de la Semana 5 (mismo cuerpo, otro nombre) | Corregido: nota explícita al inicio de los apuntes para renombrar `insertarAlFinal` → `insertarFinal` en el proyecto del estudiante antes del Paso 2 |
| 4 | 🟠 Mayor | El estado inicial declarado de `ListaSimple<T>` en los apuntes omitía `recorrerEImprimir()`, que el Paso 6 sí usa | Corregido: agregado a la lista del estado inicial |
| 5 | 🟠 Mayor | `Transaccion` sobrescribía `equals()` sin `hashCode()` | Corregido: `hashCode()` agregado con `Objects.hash(...)`, con nota explicando el contrato de `Object` |
| 6 | 🟡 Menor | `tipo.equals(t.tipo)` no era null-safe | Corregido: `Objects.equals(tipo, t.tipo)` |
| 7 | 🟡 Menor | `actual.getDato().equals(dato)` en `buscarPorValor` puede lanzar NPE si un nodo guarda `null` | Explicación ampliada en los apuntes (código de la lección publicada sin cambios — el reviewer lo marcó como menor, no bloqueante) |
| 8 | 🟡 Menor | Pregunta socrática #3 mal redactada (agramatical) | Reescrita |
| 9 | 🟡 Menor | Tabla rota en esta misma bitácora (línea 235) | Corregida |

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 10 advertencias preexistentes sin relación)
- [x] Checklist de `lesson-authoring` §8 recorrido — **excepción deliberada**:
  sin diagramas Mermaid, decisión explícita del usuario tras la 1.ª pasada de
  `@reviewer`, no un incumplimiento. El resto del checklist (sin `# H1`, sin
  `###`, sin placeholders, `updatedAt` de hoy, `summary` en frontmatter y TS)
  se cumple.
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada: las 6 preguntas cubren exactamente las 5
  operaciones y la tabla de complejidad de la lección; apuntes consistentes
  con el código del `.mdx` tras las correcciones
- [x] `@reviewer`: 1.ª pasada `CAMBIOS REQUERIDOS` (2 bloqueantes, 3 mayores,
  4 menores) — bloqueante de diagramas aceptado como decisión del usuario;
  el resto corregido en la misma rama, sin nueva pasada de `@reviewer`
  solicitada

---

## Ronda — `programacion-cientifica` (2026-09-09)

**Alcance confirmado por el usuario:** Semana 6 (jueves 10 sep 2026), sesión
única (el curso tiene una sola sesión semanal). Tema: Funciones, orientado
explícitamente a problemas de ciencias de datos y programación científica.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Única | jue. 10 sep | Funciones: `def`, parámetros/valores por defecto/retorno, `map`/`filter`/`lambda`, alcance de variables (scope), buenas prácticas de modularización | ◇ (taller de seguimiento, no evaluativo) |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E0 · Arranque | Árbol limpio, rama `feat/semana-06-programacion-cientifica` creada desde `development` | ✅ |
| E2 · Plan de lección | Aprobado con ajuste de dataset (estación meteorológica → mediciones PM2.5) | ✅ |
| E3 · Lección `.mdx` + registro TS | `funciones`, `order: 5` — dos rondas de corrección (ver Decisiones) | ✅ |
| E4 · Apuntes del docente | Pedidos explícitamente; aprobados sin ajustes | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No aplica — sesión práctica confirmada como demo en vivo del docente | — |
| E6 · Quiz A/B/C | No aplica — Semana 6 sin `★` y el usuario no lo pidió | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/funciones.mdx` | ✅ (en rama, pendiente de merge/deploy) |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 5`, `summary` agregado) | — |
| Apunte de clase | `content/cursos/programacion-cientifica/apuntes/funciones.md` | Solo owner/admin (en rama) |
| Guía del estudiante | — | No aplica |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `funciones` | desarrollo | `a7d20653-158e-4211-9efc-c06acdeb54e9`, `54180b7a-5553-4364-bdfe-d5476dcab662`, `c347bf28-591a-415d-932e-cbf85e26cf00`, `7e351489-d9cf-4f43-973b-b02491fc8247`, `a485206f-4eb5-4308-bcc0-4c1dde6b79a4`, `ab8f083a-d867-4d46-9413-cfbaa90233b2` | ✅ | ✅ (orden 0-5) |
| `funciones` | **producción** | `7369f605-b3a9-4026-92c0-722c2d8f7076`, `05ab10b2-d007-43a5-a67d-a4de2915160d`, `389fd85f-496d-4a62-80d3-648d5e50a7b5`, `7fec2e55-c74a-4a6d-9dde-63b561609a2b`, `59e37def-fe95-4ee5-a14d-8b181218d62e`, `6d22370a-5c5d-445e-8a94-8c0b7183ec6c` | ✅ | ✅ (orden 4-9, después de 4 preguntas preexistentes sin publicar en orden 0-3) |

> Keywords nuevas creadas: en desarrollo `python`, `funciones`, `map-filter`,
> `alcance-de-variables`, `modularizacion` (tema); en producción `python` y
> `funciones` ya existían (reutilizadas), se crearon `map-filter` y
> `alcance-de-variables`, y para "modularización" se reutilizó la keyword
> `modularidad` ya existente en producción en vez de crear un slug duplicado
> (`modularizacion` no se creó en prod).

### Quiz calificable A/B/C

No aplica — la Semana 6 de `programacion-cientifica` no lleva `★` y el
usuario confirmó explícitamente no crearlo.

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Dataset de la lección corregido dos veces antes de la aprobación final**:
  el primer borrador de `@lesson-writer` inventó una "estación
  meteorológica" genérica como dataset nuevo. Al revisar el `.mdx` completo
  detecté que rompía la continuidad narrativa con la Semana 5 (Taller
  evaluativo 01), cuyo dataset real son mediciones de PM2.5 de una red de
  monitoreo de calidad del aire (`registros_estaciones`) — corregido con el
  usuario, que eligió alinear al dataset real. Una segunda relectura detectó
  además una inconsistencia matemática: las `lecturas` de `EST-02` se usaban
  a la vez como mg/m³ (en la sección de conversión) y como µg/m³ ya
  convertidas (en el filtro de umbral), sin conversión real entre ambas.
  Corregido introduciendo un "sensor nuevo" separado (`lecturas_sensor_nuevo_mg`)
  para el escenario de conversión, dejando `registros_estaciones` siempre en
  µg/m³ como en el taller de origen — verificado manualmente que todos los
  resultados impresos en el `.mdx` final son matemáticamente correctos.
- **`summary` agregado al registro TS**: la entrada `id: "funciones"` en
  `lib/courses/data/programacion-cientifica.ts` no tenía `summary` desde
  antes de esta ronda (a diferencia de las demás lecciones del archivo);
  se completó como parte de E3, idéntico al del frontmatter del `.mdx`.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 10 advertencias preexistentes sin relación)
- [x] Checklist de `lesson-authoring` §8 recorrido: sin `# H1`, sin `###`,
  sin placeholders fuera de backticks, `updatedAt` de hoy, `summary` en
  frontmatter y TS, `order` sin duplicados, apuntes sin entrada TS, sin guía
  de estudiante creada (sesión en vivo confirmada)
- [x] Coherencia cruzada: las 6 preguntas cubren las 5 secciones de la
  lección; los apuntes del docente siguen el mismo dataset, funciones y
  progresión que el `.mdx` aprobado, incluyendo el bug de scope reproducido
  a propósito
- [x] `@reviewer`: 1.ª pasada **APROBADO** con 3 hallazgos mayores y varios
  menores/sugerencias — todos los mayores y dos menores corregidos en la
  misma rama: (1) `convertir_a_microgramos(1)` → `1.0` para que el resultado
  prometido `1000.0` fuera real; (2) `lecturas_sensor_campo` definida en la
  lección (antes solo existía en los apuntes, causaba `NameError` si se
  copiaba tal cual); (3) el ejemplo de `filter` combinaba lecturas de Norte
  y Centro para que de verdad descarte valores (antes filtraba solo sobre
  EST-02, cuyas tres lecturas pasaban el umbral, sin demostrar nada);
  además, contradicción del valor por defecto ("caso más común en la red")
  y typo "`return`a" corregidos. Apuntes del docente actualizados en
  paralelo para mantener el mismo ejemplo de `filter`. No se solicitó nueva
  pasada de `@reviewer` (cambios acotados y verificados manualmente con
  Python + `npm run build`/`lint` en verde tras la corrección).

## Despliegue a producción — ronda `programacion-cientifica` (2026-09-10)

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | Solo `programacion-cientifica` Semana 6, sin cambios de esquema (`git diff --stat origin/main..HEAD -- supabase/` vacío). `funciones` ya estaba cerrada en producción desde antes ("Cierre solicitado por el docente", 2026-08-04) |
| D1 · Lecciones nuevas cerradas por adelantado | — | No aplicó: la lección ya estaba cerrada de antemano; el usuario confirmó abrirla de inmediato tras el deploy (D4), no antes |
| D2 · Merge a `main` y deploy en Vercel | ✅ | Rama `deploy/semana-06-programacion-cientifica`, commit `deploy: release week 6 programacion-cientifica lesson on functions`. Deploy Vercel `dpl_3wo6viF741zEQGZZ3NFWAMiaAh14`, `readyState: READY`, `target: production` |
| D3 · Banco de preguntas replicado a producción | ✅ | IDs prod: `7369f605-b3a9-4026-92c0-722c2d8f7076`, `05ab10b2-d007-43a5-a67d-a4de2915160d`, `389fd85f-496d-4a62-80d3-648d5e50a7b5`, `7fec2e55-c74a-4a6d-9dde-63b561609a2b`, `59e37def-fe95-4ee5-a14d-8b181218d62e`, `6d22370a-5c5d-445e-8a94-8c0b7183ec6c` — publicadas y montadas en orden 4-9 (ver hallazgo debajo) |
| D4 · Lecciones abiertas a los estudiantes | ✅ | `programacion-cientifica` → `funciones` (`order: 5`) abierta vía `courses-mcp-prod`. Verificado con `list_course_lessons`: Semana 7 en adelante sigue cerrada, `orphan_disabled_slugs: []` |
| D5 · Verificación end-to-end en producción | ⚠️ Parcial | `https://www.nod0.dev` y `/programacion-cientifica/funciones` responden (307, redirect de autenticación normal — no confirma renderizado). Verificación visual (Mermaid, autoevaluación) no realizada: requiere navegador, fuera de alcance sin solicitud explícita |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | Esta entrada. Rama `deploy/semana-06-programacion-cientifica` pendiente de borrar (local, no se pusheó a remoto) |

- [x] Verificado que las lecciones de semanas futuras siguen **cerradas**

### Decisiones tomadas durante el despliegue

- **Preguntas preexistentes en producción, ajenas a esta ronda**: `list_questions`
  reveló 4 preguntas ya montadas en `programacion-cientifica`/`funciones`
  (`code_write`/`open_text` sobre propina, reciclaje, cuenta de restaurante y
  un acertijo lógico — sin relación con el contenido de esta lección),
  todas sin publicar. Origen desconocido, no documentado en ninguna bitácora
  anterior. **Decisión del usuario**: dejarlas tal cual (sin publicar, por
  tanto invisibles) y montar las 6 nuevas encima, en orden 4-9.
- **Hallazgo crítico antes de replicar — el banco de desarrollo no coincidía
  con lo aprobado**: al leer las 6 preguntas reales creadas en desarrollo
  (E5) para copiarlas a producción, resultaron ser genéricas (`saludar`,
  `cuadrado`, `incrementar`, `numeros` pares) y **no** las preguntas sobre
  PM2.5/`registros_estaciones` que se habían presentado y aprobado en el
  chat. Corregido con `update_question` en **desarrollo primero** (las 6,
  contenido exacto de la propuesta aprobada) y solo después replicado a
  producción — nunca se publicó en producción el contenido genérico.
- **Keyword `modularizacion` vs. `modularidad`**: la pregunta de
  modularización usaba `modularizacion` en desarrollo, pero producción ya
  tenía `modularidad` (mismo concepto, slug distinto). Por decisión del
  usuario, se reutilizó `modularidad` en producción en vez de crear un
  duplicado — la pregunta en desarrollo conserva `modularizacion` (no se
  tocó ese catálogo).

## Pendientes (despliegue)

- Verificación visual en producción (Mermaid, autoevaluación) — a criterio
  del usuario, requiere navegador.
- Investigar el origen de las 4 preguntas ajenas ya montadas en `funciones`
  en producción (propina, reciclaje, restaurante, acertijo lógico) — quedan
  sin publicar, pero conviene entender de dónde salieron.
- Borrar rama local `deploy/semana-06-programacion-cientifica` (no se
  pusheó a remoto).
