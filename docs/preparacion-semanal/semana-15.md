# Semana 15 — 9–15 de noviembre

**Rama:** `feat/semana-15-analisis-de-algoritmos` (AA) · `feat/semana-15-programacion-cientifica` (PC)
**Estado:** ✅ Material y cuestionario listos en desarrollo / ⬜ Mergeada a `development` / ⬜ Desplegada y abierta

---

## Ronda — `analisis-de-algoritmos` (2026-10-24)

**Alcance confirmado por el usuario:** solo la Sesión 1 (T) del lunes 9 de
noviembre. **Excluida en esta primera ronda:** la Sesión 2 (P, estrategia voraz), cubierta en la Ronda 2.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | lun 9 nov | Fundamentos de programación dinámica (corte de varillas) | |
| P | lun 9 nov | Estrategia voraz (cubierta en la Ronda 2) | |

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
- [x] `@reviewer`: APROBADO (2 menores corregidos antes del merge)

---

## Ronda 2 — `analisis-de-algoritmos`, Sesión 2 (P) (2026-10-24)

**Alcance confirmado por el usuario:** solo la Sesión 2 (P) del lunes 9 de
noviembre: *Estrategia voraz*. **Huffman** se quitó de los `topics` del registro
por decisión del usuario (el cronograma lo manda a lectura autónoma).

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado con 4 decisiones (sala de estudio; "menos conflictos" en una frase y reto; Huffman en una frase en la Síntesis; costo de PD como O(n³)) | ✅ |
| E3 · Lección `.mdx` + registro TS | `estrategia-voraz` (order 16, 133 líneas) | ✅ (implícita al pedir los apuntes) |
| E4 · Apuntes del docente | Sí, pedidos por el usuario | ✅ |
| E5 · Cuestionario de cierre | Propuestas 5 preguntas → 5 aprobadas (P4 (c) corregida) | ✅ |
| E6 · Guía del estudiante | No (decisión del usuario) | ✅ |
| E6 · Quiz A/B/C | No (decisión del usuario) | ✅ |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/estrategia-voraz.mdx` | ⬜ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 16`; `summary` añadido, Huffman quitado de `topics`) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/estrategia-voraz.md` | Solo owner/admin |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `estrategia-voraz` | desarrollo | P1 `a585f7f4-c712-4448-bc5b-0c12b5d9488d` · P2 `16ac5ba5-4e9f-46c9-8a6e-237afe98d6d2` · P3 `17d88a10-9407-44d1-8fa0-98fff22e2a97` · P4 `10bd5e29-5632-4a2d-899a-16dfdd80f011` · P5 `445d9e68-5c62-422a-8ea2-9918312e467f` | ✅ | ✅ (orden P1–P5) |
| `estrategia-voraz` | **producción** | — | ⬜ | ⬜ |

Keyword creada en desarrollo: `algoritmos-voraces` (tema); verificarla/crearla en
producción en D3. Las explicaciones no se guardaron (sin campo de feedback).

### Decisiones tomadas por Claude en nombre del docente

- Quitar Huffman de los `topics` sin sustituirlo por otro tópico (el "implementar
  y contrastar con PD" de `info.md` vive en los apuntes) — **motivo:** el usuario
  pidió quitarlo.
- El redactor reemplazó "elegir al azar da 2–3 turnos" (no verificado) por
  "empezar por el grupo 3 deja solo 3 turnos".
- La PD de Cormen aparece en la lección solo como idea y costo O(n³); el 286 de
  la recurrencia son *pruebas* (C(13,3)) y 78 *evaluaciones*, ambos declarados
  en los apuntes.
- La keyword `algoritmos-voraces` se creó al aprobar las preguntas, sin una
  respuesta explícita aparte; las opciones se dejaron sin ajustar de longitud (la
  correcta es la más larga en P2–P5).
- Los apuntes mueven la votación y el error planeado 2 antes de la tabla
  comparativa para no revelarlos.
- En los apuntes, la práctica externa (LeetCode 435, 452, 253) está sin enlaces y
  "por verificar".

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` sin errores (7 warnings preexistentes)
- [x] Sin `# H1` ni `###` en el `.mdx`; sin placeholders fuera de backticks en los apuntes
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada lección ↔ apuntes ↔ cuestionario
- [x] `@reviewer`: APROBADO (4 hallazgos mayores y 1 menor corregidos antes del merge)

---

## Ronda — `programacion-cientifica` (2026-10-28)

**Alcance:** jueves 12 de noviembre, sesión única: *Matplotlib y Seaborn*
(`order: 11`). El usuario estaba ausente y pidió preparar de una vez lección,
apuntes del docente y cuestionario de cierre; **no hubo paradas de aprobación
por etapa** — todo queda pendiente de su revisión en Nodo.

### Etapas

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Producido por `@lesson-designer`, resuelto con valores predeterminados | ⬜ (pre-autorizada, por revisar) |
| E3 · Lección `.mdx` + registro TS | `matplotlib-y-seaborn` (243 líneas, 8 secciones, 4 PNG) | ⬜ por revisar |
| E4 · Apuntes del docente | `apuntes/matplotlib-y-seaborn.md` (7 pasos, 2 errores planeados, 2 votaciones, reto en parejas, práctica externa) | ⬜ por revisar |
| E5 · Cuestionario de cierre | 6 preguntas creadas, publicadas y montadas en **desarrollo** | ⬜ por revisar |
| E6 · Guía del estudiante | No (sesión en vivo; el proyecto ya tiene su guía) | — |
| E6 · Quiz A/B/C | No aplica (semana sin ★) | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/matplotlib-y-seaborn.mdx` | ⬜ |
| Imágenes | `public/documentos/programacion-cientifica/lecciones/matplotlib-y-seaborn/` (4 PNG) | ⬜ |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`summary` añadido) | — |
| Apunte de clase | `content/cursos/programacion-cientifica/apuntes/matplotlib-y-seaborn.md` | Solo owner/admin |
| Proyecto integrador | `guias/proyecto-integrador-analisis-de-datos.md` (order 11.5, rúbricas E1 y E2) + datasets en `public/documentos/programacion-cientifica/datasets/` | ⬜ |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas |
|---|---|---|---|---|
| `matplotlib-y-seaborn` | desarrollo | P1 `f7e68922-ba5d-4aa0-b0d1-bf76a7206611` · P2 `6363c629-605e-4006-a525-02e30c3008d6` · P3 `16648dce-6057-40e3-a44c-634910078fcd` · P4 `2f13d949-e23c-4d2b-ab35-24c2a658362d` · P5 `5d1c876e-37e8-41dc-b410-986845310443` · P6 `6a1bec38-7b26-4d15-ae42-f0161ed1a696` | ✅ | ✅ (orden P1–P6) |
| `matplotlib-y-seaborn` | **producción** | — | ⬜ | ⬜ |

Keywords creadas en desarrollo: `visualizacion`, `matplotlib`, `seaborn`
(verificarlas/crearlas en producción en D3).

### Decisiones tomadas por Claude en nombre del docente

- Fechas de la guía del proyecto ajustadas por el usuario a las del microdiseño:
  E1 jueves 5 nov (23:59), E2 + exposición jueves 19 nov. `info.md` y el
  cronograma no se modificaron. La lección y los apuntes no mencionan fechas.
- Flujo B no estaba en el material publicado: se añadió a la guía del proyecto
  el paso a paso (token como Secreto de Colab, `!git clone`, `!git config`) y al
  Paso 7 de los apuntes.
- 4 PNG (sin imagen para barras ni pairplot). Es la primera lección con
  imágenes: **verificar el render en Nodo**.
- Serie de líneas con 7 valores inventados, rotulada como ejemplo.
- Votación 2 de los apuntes cambiada a la correlación -0.10 de dengue, para no
  repetir la pregunta 5 del cuestionario.
- Práctica externa de Kaggle Learn marcada "por verificar".
- Distractor "87 %" de la P5 no sale de la lección (mala lectura habitual).
- No se ejecutó `npm run build` en esta ronda para no interferir con el servidor
  de desarrollo; sí `tsc`, `eslint` y compilación MDX.

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-15` |
| D3 · Banco de preguntas replicado a producción | ⬜ | |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `analisis-de-algoritmos` → `fundamentos-de-programacion-dinamica`, `estrategia-voraz` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- La lección de AA debe estar desplegada y abierta **antes del lunes 9 de nov** (aula invertida); la de PC, antes del **jueves 12 de nov**.
- Guía del Lab 4: fuera de esta ronda.
- Tras la clase: D7, marcar la lección como vista por grupo.
