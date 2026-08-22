# Semana 05 — 31 de agosto al 6 de septiembre

**Rama:** `feat/semana-05-analisis-de-algoritmos` (borrada tras el merge)
**Estado:** ✅ Contenido y cuestionario de cierre listos · ✅ `@reviewer` (1.ª pasada CAMBIOS REQUERIDOS, corregidos) · ✅ Mergeada a `development`

> Esta rama también absorbió trabajo que quedó pendiente de rondas
> anteriores del mismo curso, descubierto al arrancar la Semana 5: cambios
> sin commitear de la Semana 4 (rescatados y commiteados), una corrección de
> continuidad (`T(n)` sin definir) que afectaba tanto a la Semana 4 como a la
> Semana 5, una reestructuración pedida por el usuario en los apuntes de la
> Semana 3, y el apunte de docente de la Semana 4 (nunca creado en su
> momento). Ver "Decisiones" para el detalle completo y las notas agregadas
> a `semana-03.md`.

---

## Ronda — `analisis-de-algoritmos` (2026-08-21 a 2026-08-22)

**Alcance confirmado por el usuario:** Semana 5, **solo Sesión T** (Notación
O, Θ y Ω). La Sesión P (laboratorio de clasificación asintótica y
verificación empírica con gráficas) queda explícitamente fuera de esta
ronda, para una ronda futura.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | 31 ago – 6 sep | Notación O, Θ y Ω; notaciones estándar y funciones comunes | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E0 · Arranque | Árbol no estaba limpio (trabajo de Semana 4 sin commitear, ver Decisiones) — resuelto antes de seguir | ✅ |
| E2 · Plan de lección | Aprobado sin ajustes en la primera propuesta | ✅ |
| E3 · Lección `.mdx` + registro TS | `notacion-o-theta-y-omega`, `order: 5` — con una ronda de correcciones (ver Decisiones) y una simplificación de contenido pedida por el usuario | ✅ |
| E4 · Apuntes del docente | Sí, pedidos explícitamente — solo Sesión T | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No aplica — Sesión P fuera de alcance esta ronda | — |
| E6 · Quiz A/B/C | No aplica — semana sin `★` | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/notacion-o-theta-y-omega.mdx` | ✅ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 5`) | ✅ |
| Apunte de clase (solo Sesión T) | `content/cursos/analisis-de-algoritmos/apuntes/notacion-o-theta-y-omega.md` | Solo owner/admin |
| Guía del estudiante | — | **No aplica** (Sesión P fuera de alcance) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `notacion-o-theta-y-omega` | desarrollo | `598eda28-0a60-4e9c-8c29-2ca00138f3ce`, `f5c0a850-cbb3-41c8-a9b7-ec01d7ae468a`, `aa9f7d98-e634-41ce-995b-100fd5c26cde`, `8b47b75f-e259-4ab9-920e-c2bb73737351`, `36cef34b-71f7-4c62-866a-90a14fd1315f`, `64e6be07-2f06-4c7d-8d02-e10ed40312c0` | ✅ (6/6) | ✅ (6/6, orden 0–5) |
| `notacion-o-theta-y-omega` | **producción** | — | ⬜ | ⬜ |

> Keyword nueva creada en el catálogo compartido (desarrollo):
> `notacion-asintotica` (kind: `tema`). Falta crearla y replicar las 6
> preguntas en producción durante D3.

### Quiz calificable A/B/C

No aplica — la Semana 5 no está marcada `★` (el `★` de este módulo cae en la
Semana 6, Laboratorio 1).

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Rescate de trabajo sin commitear de la Semana 4**, encontrado al hacer
  `git status` en E0: la lección `analisis-de-algoritmos-y-divide-y-venceras.mdx`
  tenía contenido completo (peor/mejor/caso promedio, recursividad, merge
  sort) escrito pero nunca commiteado, junto con cambios de infraestructura
  del flujo de preparación de clase (rename `weekly-class-prep` →
  `class-material-prep`). Confirmado con el usuario ("Merge a development y
  elimina la rama"), se separó en dos commits temáticos y se mergeó.
- **Definición de `T(n)` agregada** en `analisis-de-algoritmos-y-divide-y-venceras.mdx`
  (Semana 4), donde se usa por primera vez en la recurrencia de merge sort
  — ni esa lección ni la de la Semana 5 la definían. Corrección pedida
  explícitamente por el usuario tras detectar la omisión.
- **Diagrama `xychart-beta` de "por qué ignoramos constantes" reescalado**
  (Semana 5) de `n=10..10.000` a `n=20..200`, tras reporte del usuario de que
  no se veía bien en móvil: el rango original aplastaba los primeros puntos
  contra el eje. **Nota histórica:** este diagrama, junto con el resto de los
  `xychart-beta` de la lección, fue **eliminado posteriormente** por decisión
  intencional del usuario durante una simplificación del contenido (ver
  siguiente punto) — el fix de escala quedó sin efecto práctico, pero se
  documenta porque fue una corrección real en su momento.
- **Simplificación de contenido de la lección de Semana 5, intencional del
  usuario**: se quitaron los 3 diagramas Mermaid `xychart-beta`, se redujo la
  tabla de "Funciones estándar" (quitando columnas de valor numérico y
  ejemplo de algoritmo), y se compactó la sección de comparación final
  merge/insertion sort. Confirmado explícitamente con el usuario antes de
  aceptar el estado como definitivo (ver conversación: "Fue intencional").
- **Párrafo confuso sobre `Θ` de insertion sort reescrito**: la redacción
  original mezclaba en una sola oración la afirmación general ("cuando
  ambos casos comparten el mismo Θ, describe todo el comportamiento") con
  la excepción de insertion sort, generando ambigüedad sobre si `Θ(n²)`
  aplicaba a "todo el comportamiento". Reportado por el usuario, reescrito
  en dos oraciones separadas. **Nota:** este párrafo específico fue
  eliminado por completo en la simplificación de contenido posterior — la
  ambigüedad ya no aplica porque el pasaje ya no existe en su forma extensa.
- **Errores de edición corregidos tras la simplificación** (no decisiones de
  contenido, confirmados como no intencionales): frase con gramática rota
  ("resuelta, esa recurrencia su crecimiento es Θ(n log n)" → "resuelta, el
  crecimiento de esa recurrencia es Θ(n log n)"); línea en blanco faltante
  antes de una función de nivel superior (PEP 8).
- **Apunte de docente de la Semana 4 creado en esta ronda**, no en la suya
  propia: nunca se había pedido en su momento. Empieza retomando
  exactamente el código de análisis de casos de insertion sort que se sacó
  del apunte de la Semana 3 (ver más abajo), y lo extiende con merge sort
  instrumentado y la comparación empírica.
- **Apunte de docente de la Semana 3 recortado**, a pedido del usuario: se
  sacó de la Sesión P el conteo de operaciones, la clasificación
  mejor/peor/caso promedio y la extrapolación al caso de la empresa —
  quedó solo el algoritmo y la validación de la invariante de ciclo. Ese
  contenido se reubicó, sin cambios de lógica, como apertura del apunte de
  la Semana 4 (ver punto anterior). **Nota de alcance sin resolver:** el
  microdiseño (`Semana 3 P`) todavía pide ese conteo/clasificación como
  parte de la práctica de esa semana — el usuario indicó que lo ajustaría
  después; no se tocó `microdiseno/info.md`.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] Checklist de `lesson-authoring` §8 recorrido (frontmatter, `summary`
  en `.mdx` y TS, sin placeholders)
- [x] `summary` presente en frontmatter **y** en registro TS (semanas 4 y 5,
  ambas corregidas en esta ronda)
- [x] Coherencia cruzada: la lección retoma `T(n)` y el "crece como n²" de
  la Semana 4 con nombre formal (`Θ(n²)`), adelanta `Θ(n log n)` para merge
  sort sin revelar el método (Semana 6), y el cuestionario evalúa
  exactamente las 5 ideas centrales del contenido ya simplificado
- [x] `npm run lint` en verde (0 errores, 8 advertencias preexistentes sin relación)
- [x] `@reviewer`: 1.ª pasada **CAMBIOS REQUERIDOS** (4 hallazgos bloqueantes:
  promesa de columna inexistente en la tabla de jerarquía, LaTeX crudo dentro
  de backticks sin renderizar, y ambos apuntes de docente desincronizados con
  las lecciones ya simplificadas/editadas — referenciaban diagramas Mermaid
  eliminados; 3 mayores: bitácora sin commitear, tipo de commit `content` no
  documentado en `CLAUDE.md`, tabla de jerarquía sin `n log n`) — los 7
  corregidos uno por uno, más los menores relevantes (LaTeX en backticks del
  apunte, atribución incorrecta a la síntesis, guiones largos sin espacio).
  Commit de las correcciones: `e00fa8b`.

**Merge a `development`:** ✅ completo, sin conflictos (commit
`merge: week 5 lesson on asymptotic notation, plus retroactive fixes to
weeks 3-4`). `npm run build` verificado en verde sobre `development` ya
mergeada. Rama `feat/semana-05-analisis-de-algoritmos` borrada (solo local,
nunca se pusheó a remoto).

## Pendientes

- Diseñar la Sesión P de la Semana 5 (laboratorio de clasificación
  asintótica) en una ronda futura.
- Replicar el cuestionario de cierre y la keyword `notacion-asintotica` a
  producción durante el despliegue (D3).
- Decidir en qué apunte futuro se resuelve la discrepancia de alcance con
  `microdiseno/info.md` (Semana 3 P) anotada arriba.
