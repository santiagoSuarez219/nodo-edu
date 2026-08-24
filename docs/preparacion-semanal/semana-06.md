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

## Pendientes

- Proponer el cuestionario de cierre de la Semana 6 (E5).
- Diseñar la Sesión P de la Semana 6 (Laboratorio evaluativo 1, ★, 15%) en
  una ronda futura.
- Decidir en qué apunte futuro se resuelve la discrepancia de alcance con
  `microdiseno/info.md` (Semana 3 P) anotada en `semana-05.md`.
