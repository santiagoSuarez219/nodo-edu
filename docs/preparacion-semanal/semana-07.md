# Semana 07 — 14 al 20 de septiembre

**Rama:** `feat/semana-07-08-analisis-de-algoritmos` (cubre también la Semana 08, ver `semana-08.md`)
**Estado:** ✅ Contenido listo · ⬜ `@reviewer` pendiente · ⬜ Merge a `development` pendiente

---

## Ronda — `analisis-de-algoritmos` (2026-09-12 a 2026-09-13)

**Alcance confirmado por el usuario:** Semana 7, **solo Sesión T** (Subarreglo
máximo y Strassen). La Sesión P (laboratorio de implementación, sin marca ★)
queda explícitamente fuera de esta ronda — no se decidió si es trabajo
independiente o demo en vivo.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | 14–20 sep | Subarreglo máximo por divide y vencerás; algoritmo de Strassen para multiplicación de matrices | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E0 · Arranque | Árbol limpio, rama creada desde `development` sin choques. Diagnóstico inicial detectó que las 18 lecciones teóricas del semestre ya existían como stubs vacíos (solo frontmatter) — el usuario confirmó el alcance real: escribir el contenido de los stubs de las Semanas 7 y 8 | ✅ |
| E2 · Plan de lección | Aprobado sin ajustes en la primera propuesta | ✅ |
| E3 · Lección `.mdx` + registro TS | `subarreglo-maximo-y-strassen`, `order: 7` — aprobada; se añadieron los hilos transversales de modelado y ética/impacto a pedido del usuario (ver Decisiones) | ✅ |
| E4 · Apuntes del docente | Pedidos explícitamente; varias rondas de corrección y ampliación (ver Decisiones) | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 5 preguntas → aprobadas 4 (se eliminó la de "qué reduce Strassen y a qué costo") | ✅ |
| E6 · Guía del estudiante | No decidido en esta ronda — queda pendiente | — |
| E6 · Quiz A/B/C | No aplica — la Semana 7 no lleva `★` | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/subarreglo-maximo-y-strassen.mdx` | ✅ (en rama, pendiente de merge/deploy) |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 7`, `summary` agregado) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/subarreglo-maximo-y-strassen.md` | Solo owner/admin (en rama) |
| Guía del estudiante | — | No decidido en esta ronda |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `subarreglo-maximo-y-strassen` | desarrollo | `f75e83df-f654-4ff3-a149-202e5e0bf667`, `b0ca3397-667d-4b58-84e0-e33032d874a1`, `69be9d73-7f3c-4c38-b7b3-9d1a524db841`, `f7a4fd4c-5761-4335-9588-7a4674f132a8` | ✅ | ✅ (orden 0-3) |
| `subarreglo-maximo-y-strassen` | **producción** | — | ⬜ | ⬜ |

> Keywords nuevas creadas en desarrollo: `divide-y-venceras`, `recurrencias`,
> `metodo-maestro`, `matrices` (kind: `tema`) — compartidas con el
> cuestionario de la Semana 8. Las preguntas **no viajan con el deploy**:
> pendiente de replicar en producción en D3.

### Quiz calificable A/B/C

No aplica — la Semana 7 no lleva `★`.

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Hilos transversales de modelado y ética/impacto, agregados a la lección
  a pedido explícito del usuario tras la primera versión aprobada**: se
  agregó la sección "Modelado: de la situación a la operación" (entrada/
  salida/restricción/costo dominante del problema del subarreglo máximo) y
  "Ética e impacto: el costo de elegir mal el algoritmo", con una cifra
  concreta calculada y verificada (fuerza bruta vs. D&V sobre 1.850.000
  medidores → ≈1,8 kWh/año desperdiciados en una sola subrutina del cierre
  nocturno, más el riesgo de falsos positivos de fraude si se recorta la
  ventana de análisis).
- **Corrección de un error de contenido real, hallado al escribir una prueba
  de escritorio a pedido del usuario**: la lección afirmaba que el subarreglo
  de mayor ganancia de la serie de ejemplo (`[-3,5,-2,8,-6,3,9,-4]`) era
  "días 4-7, suma +14". Al trazar el algoritmo real a mano (y verificarlo
  ejecutándolo) resultó que el máximo real es "días 2-7, suma +17" (verificado
  también con un cálculo de Kadane independiente). Corregido en la lección
  `.mdx` y en el `assert` del apunte del docente — de no corregirse, el
  `assert` habría fallado en vivo frente al grupo.
- **Prueba de escritorio guiada agregada al apunte del docente**: traza
  completa nivel por nivel (casos base → combinaciones → raíz) de la
  recursión sobre el ejemplo de 8 días, mostrando en cada nivel el cálculo
  del barrido cruzado y qué caso gana — con la observación de que el caso
  cruzado gana en los tres niveles con más de un elemento.
- **Código de conteo de multiplicaciones agregado al apunte**, para deducir
  empíricamente `Θ(n³)` del algoritmo escolar de multiplicación de matrices
  antes de introducir Strassen (razón de crecimiento verificada en
  8.00× exacto al duplicar `n`, y exactamente 8 multiplicaciones para `n=2`,
  el número que Strassen reduce a 7).
- **Versión recursiva general de Strassen agregada al apunte** (partición en
  bloques, relleno a potencia de 2, recorte final), más allá del caso base
  2×2 de la lección — verificada numéricamente contra el algoritmo escolar
  para `n = 1..17`, incluyendo tamaños que no son potencia de 2.
- **Otra inconsistencia corregida en el apunte**: el caso de prueba de
  `strassen_2x2` (`a`, `b`) había sido editado directamente en el archivo sin
  actualizar el `esperado` ni los comentarios de la cuenta a mano — el
  `assert` habría fallado. Corregido con el producto real recalculado.
- **Pregunta de cuestionario eliminada por pedido del usuario**: "Qué reduce
  Strassen y a qué costo" (mecanismo/costo de las 7 multiplicaciones) — las 4
  restantes quedan aprobadas y montadas.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 10 advertencias preexistentes sin relación)
- [x] Checklist de `lesson-authoring` §8 recorrido: sin `# H1`, sin `###`
  fuera de bloques de código, sin placeholders fuera de backticks,
  `updatedAt` de hoy, `summary` en frontmatter y TS, apunte sin entrada TS
- [x] Coherencia cruzada: las 4 preguntas cubren el caso cruzado, la
  recurrencia del subarreglo máximo, la partición ingenua de matrices y la
  recurrencia de Strassen — todas montadas y verificadas con
  `list_lesson_questions`
- [ ] `@reviewer`: pendiente
