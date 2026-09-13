# Semana 08 — 21 al 27 de septiembre

**Rama:** `feat/semana-07-08-analisis-de-algoritmos` (cubre también la Semana 07, ver `semana-07.md`)
**Estado:** ✅ Contenido listo · ⬜ `@reviewer` pendiente · ⬜ Merge a `development` pendiente

---

## Ronda — `analisis-de-algoritmos` (2026-09-12 a 2026-09-13)

**Alcance confirmado por el usuario:** Semana 8, **solo Sesión T** (Síntesis
del paradigma de divide y vencerás). La Sesión P — **Laboratorio evaluativo 2,
★, 15%** (informe en GitHub) — queda explícitamente fuera de esta ronda.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | 21–27 sep | Síntesis del paradigma de divide y vencerás: esquema general, criterio de decisión, caso límite (hallar el máximo / sumar un arreglo) | — (la ★ de la semana es la Sesión P, fuera de alcance) |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E0 · Arranque | Mismo diagnóstico y rama que la Semana 7 (ver `semana-07.md`) | ✅ |
| E2 · Plan de lección | Aprobado sin ajustes en la primera propuesta | ✅ |
| E3 · Lección `.mdx` + registro TS | `sintesis-del-paradigma-de-divide-y-venceras`, `order: 8` — aprobada; hilo de modelado agregado a pedido del usuario. La sección de ética/impacto agregada en la misma ronda fue removida posteriormente en una edición directa del archivo — el usuario confirmó que el recorte es intencional | ✅ |
| E4 · Apuntes del docente | Pedidos explícitamente; aprobados sin cambios adicionales a los de la Semana 7 | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 5 preguntas → aprobadas 4 (se eliminó "identificar las tres fases en un enunciado nuevo") | ✅ |
| E6 · Guía del estudiante | No aplica — la Sesión P es el Laboratorio evaluativo 2 (informe en GitHub, formato propio del microdiseño), no una guía de laboratorio estándar | — |
| E6 · Quiz A/B/C | No decidido en esta ronda. El ★ de la semana corresponde a un informe de laboratorio, no a un assignment A/B/C — poco usual que aplique, pero no se descartó explícitamente | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/sintesis-del-paradigma-de-divide-y-venceras.mdx` | ✅ (en rama, pendiente de merge/deploy) |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 8`, `summary` agregado) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/sintesis-del-paradigma-de-divide-y-venceras.md` | Solo owner/admin (en rama) |
| Guía del estudiante | — | No aplica (Sesión P es informe evaluativo, fuera del formato de guía) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `sintesis-del-paradigma-de-divide-y-venceras` | desarrollo | `637f7e1d-37f6-44c2-ae76-3760117a1806`, `7359f527-892d-4ce2-a359-fd1babf47155`, `1e213e80-578d-4fad-9c71-90ec9dc71dbc`, `3e04d77f-d161-47cf-baa9-cfe42066f11c` | ✅ | ✅ (orden 0-3) |
| `sintesis-del-paradigma-de-divide-y-venceras` | **producción** | — | ⬜ | ⬜ |

> Reutiliza las keywords `divide-y-venceras`, `recurrencias`, `metodo-maestro`
> creadas para la Semana 7, más `complejidad` (ya existente). Las preguntas
> **no viajan con el deploy**: pendiente de replicar en producción en D3.

### Quiz calificable A/B/C

No decidido — el usuario pospuso esta decisión explícitamente para esta
ronda. El ★ de la Semana 8 (Laboratorio evaluativo 2, 15%) se evalúa con
informe en GitHub, no con un assignment de `assignment-mcp`.

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Hilos transversales agregados a pedido del usuario**: "Modelado: la
  decisión misma es el problema" (aplicado al problema de decidir si D&V
  aplica, ya que esta lección no modela una situación de dominio nuevo) y
  "Ética e impacto: pagar un costo sin obtener nada a cambio" (cifra
  concreta: ≈3,85×10⁷ copias de más por noche sin ninguna ganancia, al
  aplicar la versión recursiva de "hallar el máximo" sobre un lote de
  1.850.000 lecturas). **Esta segunda sección fue removida posteriormente**
  en una edición directa del `.mdx` fuera de esta conversación — el usuario
  confirmó que el recorte es intencional, se deja constancia aquí por si se
  quiere revisar en el futuro.
- **Pregunta de cuestionario eliminada por pedido del usuario**: "Identificar
  las tres fases en un enunciado nuevo" (ejemplo de la mediana de dos
  arreglos ordenados) — las 4 restantes quedan aprobadas y montadas.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 10 advertencias preexistentes sin relación)
- [x] Checklist de `lesson-authoring` §8 recorrido: sin `# H1`, sin `###`
  fuera de bloques de código, sin placeholders fuera de backticks,
  `updatedAt` de hoy, `summary` en frontmatter y TS, apunte sin entrada TS
- [x] Coherencia cruzada: las 4 preguntas cubren el método maestro aplicado a
  una recurrencia nueva, el caso límite de combinar-domina, el caso límite de
  subproblemas-no-se-reducen, y la distinción correcta/conveniente — todas
  montadas y verificadas con `list_lesson_questions`
- [ ] `@reviewer`: pendiente

## Pendientes

- Decidir en una ronda futura la Sesión P de la Semana 7 (guía vs. demo en
  vivo) y el Laboratorio evaluativo 2 de la Semana 8 (★, 15%).
- Decidir si se retoma la sección de ética/impacto removida del `.mdx` de
  esta lección.
