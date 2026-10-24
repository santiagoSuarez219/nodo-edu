# Semana 15 — 9–15 de noviembre

**Rama:** `feat/semana-15-analisis-de-algoritmos`
**Estado:** ✅ Material y cuestionario listos en desarrollo / ⬜ Mergeada a `development` / ⬜ Desplegada y abierta

---

## Ronda — `analisis-de-algoritmos` (2026-10-24)

**Alcance confirmado por el usuario:** solo la Sesión 1 (T) del lunes 9 de
noviembre. **Excluida:** la Sesión 2 (P, estrategia voraz).

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | lun 9 nov | Fundamentos de programación dinámica (corte de varillas) | |
| P | lun 9 nov | Estrategia voraz (**no cubierta en esta ronda**) | |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado sin cambios (9 puntos abiertos resueltos con los valores predeterminados) | ✅ |
| E3 · Lección `.mdx` + registro TS | `fundamentos-de-programacion-dinamica` | ✅ (implícita al pedir los apuntes) |
| E4 · Apuntes del docente | Sí, pedidos por el usuario | ✅ |
| E5 · Cuestionario de cierre | Propuestas 5 preguntas → 5 aprobadas (P1 (c) corregida) | ✅ |
| E6 · Guía del estudiante | No (decisión del usuario) | ✅ |
| E6 · Quiz A/B/C | No (decisión del usuario; semana sin ★) | ✅ |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/fundamentos-de-programacion-dinamica.mdx` | ⬜ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 14`; `summary` añadido, `topics` ajustados) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/fundamentos-de-programacion-dinamica.md` | Solo owner/admin |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `fundamentos-de-programacion-dinamica` | desarrollo | P1 `9fa5b324-49be-4a6a-803b-44aa54cbbce8` · P2 `c0a9467e-6943-4f19-92bc-c48f4a535258` · P3 `073d885e-29f4-466f-afca-28915c4d20d9` · P4 `f681dd3a-73ed-41e6-a552-54c8038a5460` · P5 `6017d880-ea31-4fc1-8436-49f2e5a80fe4` | ✅ | ✅ (orden P1–P5) |
| `fundamentos-de-programacion-dinamica` | **producción** | — | ⬜ | ⬜ |

Keywords creadas en desarrollo: `programacion-dinamica`, `memoizacion`,
`tabulacion`, `recursion` (hay que verificarlas/crearlas en producción en D3).
Las explicaciones de las preguntas no se guardaron: `create_question` no tiene
campo de feedback.

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- Quitar "Multiplicación de cadenas de matrices" de los `topics` del registro
  y poner "Subestructura óptima y subproblemas traslapados" — **motivo:** el
  cronograma la mueve a lectura autónoma (el usuario pidió ajustar los topics).
- "Cómo reconocerlas" (subestructura/traslape en otros problemas) queda para
  `elementos-de-la-pd-y-lcs`; aquí solo se enuncian sobre el corte de varillas.
- Corrección del plan: en el árbol de `cortar_ingenuo(4)`, `cortar(2)` aparece
  2 veces (no 4), `cortar(1)` 4 y `cortar(0)` 8.
- La lección (227 líneas) supera la longitud típica de una lectura previa.
- Escenario ilustrativo inventado en la sección 10 (lote en bloques con costo
  por bloque), declarado como ilustración de escala.
- Los problemas de LeetCode de la práctica externa (70, 746, 322) están
  marcados "por verificar" en los apuntes.
- Primera lección sin explicaciones guardadas en las preguntas (limitación de la API).

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` sin errores (7 warnings preexistentes ajenos a esta ronda)
- [x] Sin `# H1` ni `###` en el `.mdx`; sin placeholders fuera de backticks en los apuntes
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada lección ↔ apuntes ↔ cuestionario (las votaciones no repiten el cuestionario)
- [ ] `@reviewer`

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-15` |
| D3 · Banco de preguntas replicado a producción | ⬜ | |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `analisis-de-algoritmos` → `fundamentos-de-programacion-dinamica` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- La lección debe estar desplegada y abierta **antes del lunes 9 de nov** (aula invertida).
- Sesión P (estrategia voraz) y guía del Lab 4: fuera de esta ronda.
- Tras la clase: D7, marcar la lección como vista por grupo.
