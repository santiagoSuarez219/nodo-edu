# Semana 15 — 9–15 de noviembre

**Rama:** `feat/semana-15-analisis-de-algoritmos` (AA) · `feat/semana-15-programacion-cientifica` (PC) · `feat/semana-15-estructuras-de-datos` (ED T1) · `feat/semana-15-t2-estructuras-de-datos` (ED T2; su estado está en las secciones «Ronda — `estructuras-de-datos`», más abajo)
**Estado:** AA: ✅ Material y cuestionarios listos en desarrollo / ⬜ Desplegada · PC: ✅ **Desplegada y abierta en producción (2026-10-28)** · ED (T1 y T2): ✅ **Desplegada y abierta en producción (2026-11-04)** — ver «Despliegue — `estructuras-de-datos`», al final

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
| Apunte de clase | ~~`content/cursos/analisis-de-algoritmos/apuntes/fundamentos-de-programacion-dinamica.md`~~ | Eliminado el 2026-11-02: el tema pasó a estudio autónomo |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `fundamentos-de-programacion-dinamica` | desarrollo | P1 `9fa5b324-49be-4a6a-803b-44aa54cbbce8` · P2 `c0a9467e-6943-4f19-92bc-c48f4a535258` · P3 `073d885e-29f4-466f-afca-28915c4d20d9` · P4 `f681dd3a-73ed-41e6-a552-54c8038a5460` · P5 `6017d880-ea31-4fc1-8436-49f2e5a80fe4` | ✅ | ✅ (orden P1–P5) |
| `fundamentos-de-programacion-dinamica` | **producción** (2026-10-28) | P1 `e38e5259-742d-4dd0-b54b-4b5d6cba6523` · P2 `c5c4b904-8d4e-49c3-931c-f9459ce865e9` · P3 `258c424a-9719-442e-9737-e6665bdcbd7a` · P4 `0a3e81b6-3ac0-4c97-bd4c-1d07276005e3` · P5 `799f35dd-a4bf-4bb4-9534-250bf47dfc06` | ✅ | ✅ (orden P1–P5) |

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
| Apunte de clase | ~~`content/cursos/analisis-de-algoritmos/apuntes/estrategia-voraz.md`~~ | Eliminado el 2026-11-02: el tema pasó a estudio autónomo |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `estrategia-voraz` | desarrollo | P1 `a585f7f4-c712-4448-bc5b-0c12b5d9488d` · P2 `16ac5ba5-4e9f-46c9-8a6e-237afe98d6d2` · P3 `17d88a10-9407-44d1-8fa0-98fff22e2a97` · P4 `10bd5e29-5632-4a2d-899a-16dfdd80f011` · P5 `445d9e68-5c62-422a-8ea2-9918312e467f` | ✅ | ✅ (orden P1–P5) |
| `estrategia-voraz` | **producción** (2026-10-28) | P1 `7a57ecff-6f8f-4f1f-8e77-28a60dc300f3` · P2 `64560a2a-eb86-4eaf-91dd-af8303f1c275` · P3 `2f15d00e-2f9e-48b1-9a6e-a7b0be7665eb` · P4 `ff07cc80-83b4-4340-9db3-bad125eedba5` · P5 `bb798ca4-d651-40cb-aea8-d9d20e490182` | ✅ | ✅ (orden P1–P5) |
| `programacion-dinamica-decidir-verificar-y-medir` | desarrollo (2026-11-03) | P1 `6017d880-ea31-4fc1-8436-49f2e5a80fe4` (precio por metro, movida desde Fundamentos) · P2 `e434060a-c73c-485d-93e1-8a6d532c9b2b` · P3 `ee0370c6-5cca-4bf2-8791-c7bbb50e640a` · P4 `6cba102a-a8d0-468d-81b3-a4419698bdb0` · P5 `6a0f39ac-79ee-48f6-82c1-d06d04605a64` | ✅ | ✅ (orden P1–P5) |
| `programacion-dinamica-decidir-verificar-y-medir` | **producción** (2026-11-03) | P1 `799f35dd-a4bf-4bb4-9534-250bf47dfc06` (precio por metro, movida desde Fundamentos) · P2 `7f3386ac-930e-4c36-ae5a-cdd46c657585` · P3 `1067dc42-397b-4d2b-bfff-6ec919569d95` · P4 `5bab42ad-d3d5-4440-92c6-3b7a4109d5a4` · P5 `bda8d178-bf21-4ddb-be55-190aec19115b` | ✅ | ✅ (orden P1–P5) |

Ajuste del 2026-11-03: la P4 de `estrategia-voraz` (en ambos entornos) compara ahora la regla voraz con la búsqueda exhaustiva, porque la lección ya no incluye la recurrencia O(n³) de Cormen. Keyword `notacion-asintotica` creada en desarrollo para igualar el catálogo de producción.

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
| E2 · Plan de lección | Producido por `@lesson-designer`, resuelto con valores predeterminados | ✅ (material y guía aprobados por el usuario, 2026-10-28) |
| E3 · Lección `.mdx` + registro TS | `matplotlib-y-seaborn` (243 líneas, 8 secciones, 4 PNG) | ✅ (material y guía aprobados por el usuario, 2026-10-28) |
| E4 · Apuntes del docente | `apuntes/matplotlib-y-seaborn.md` (7 pasos, 2 errores planeados, 2 votaciones, reto en parejas, práctica externa) | ✅ (material y guía aprobados por el usuario, 2026-10-28) |
| E5 · Cuestionario de cierre | 6 preguntas creadas, publicadas y montadas en **desarrollo** | ✅ (material y guía aprobados por el usuario, 2026-10-28) |
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
| `matplotlib-y-seaborn` | **producción** (2026-10-28) | P1 `0905d8f0-d259-4cca-a1c2-7c0bcc23b38a` · P2 `9b32c1bf-fd7f-4257-bc1e-cc7dbd806290` · P3 `26cc01a8-0e52-4121-bc42-7f151addaa5d` · P4 `560056d1-ec19-4269-9943-478c14d35840` · P5 `9343b44e-6ccd-44c7-9a2d-7e4ee82b39b1` · P6 `c0abcb08-f12b-4f64-ab33-939278b97136` | ✅ | ✅ (orden P1–P6) |

Keywords creadas en desarrollo: `visualizacion`, `matplotlib`, `seaborn`
(verificarlas/crearlas en producción en D3).

### Decisiones tomadas por Claude en nombre del docente

- Fechas de la guía del proyecto ajustadas por el usuario a las del microdiseño:
  E1 jueves 5 nov (23:59), E2 + exposición jueves 19 nov. `info.md` y el
  cronograma no se modificaron. **Actualización 2026-11-02:** el docente movió
  el E1 al jueves 12 nov (23:59); se actualizaron la guía, `info.md` y el
  cronograma (Momento evaluativo 4 pasa a la semana 15). La lección y los apuntes no mencionan fechas.
- GitHub se usa "como un Google Drive" (decisión del usuario): la guía del
  proyecto ya no exige commits de ambos integrantes ni mensajes descriptivos, y
  explica paso a paso crear el repositorio, invitar al docente, crear carpetas y
  subir archivos desde la web, guardar el notebook con "Guardar una copia en
  GitHub" y escribir el README (editor web + tabla de Markdown). El criterio de
  repositorio de la rúbrica E1 pasó a "Repositorio y organización"; el ajuste
  individual depende solo de la exposición. Sin `!git` en la guía ni en los apuntes.
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

## Despliegue — `programacion-cientifica` (2026-10-28)

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | Solo PC; sin cambios de esquema; lint sin errores |
| D1 · Lecciones nuevas cerradas por adelantado | ⚠️ | No fue posible: producción respondió 404 para la guía nueva (el catálogo sale del código desplegado). El usuario decidió abrirla igualmente |
| D2 · Merge a `main` y deploy en Vercel | ✅ | `a01e532` (`deploy/semana-15-pc`, borrada); deployment `dpl_FVAePzuW2zPtuxUWmPjVsxpiYds9` READY |
| D3 · Banco de preguntas replicado a producción | ✅ | 3 keywords (`visualizacion`, `matplotlib`, `seaborn`) y 6 preguntas, publicadas y montadas |
| D4 · Lecciones abiertas a los estudiantes | ✅ | `matplotlib-y-seaborn` abierta; `proyecto-integrador-analisis-de-datos` abierta; no hay lecciones futuras cerradas pendientes |
| D5 · Verificación end-to-end en producción | ◐ | 6 imágenes responden 200 en `www.nod0.dev`; la página exige sesión (no se probó el render logueado en producción) |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | Rama local borrada (no se subió al remoto) |

- [x] Verificado que no quedan lecciones futuras cerradas por error (el curso no tiene más lecciones después del proyecto).

## Pendientes

- AA (`fundamentos-de-programacion-dinamica`, `estrategia-voraz`): el 2026-10-28 se recrearon en producción sus 10 preguntas (y las keywords `programacion-dinamica`, `memoizacion`, `tabulacion`, `algoritmos-voraces`) y se abrieron las dos lecciones; el 12 de nov (PC) y el 9 de nov (AA) quedan solo los D7.
- Tras la clase del 12 de nov: D7, marcar `matplotlib-y-seaborn` como vista por grupo.
- Revisar en producción, con sesión, el render de la lección y de la guía.

---

## Ronda — `estructuras-de-datos` (2026-11-03)

**Rama:** `feat/semana-15-estructuras-de-datos`
**Estado:** ✅ Material y cuestionario listos en desarrollo / ✅ Revisada por `@reviewer` / ✅ Mergeada a `development` (local; push pendiente) / ⬜ Desplegada y abierta

**Alcance confirmado por el usuario:** Sesión T1 (martes 10 de noviembre), solo
la lección `bst-busqueda-e-insercion`: la regla del BST y los métodos `buscar`
e `insertar` recursivos sobre enteros, con análisis de comparaciones. **Excluidos:**
la T2 (eliminación en BST), el laboratorio P del viernes 13 de noviembre y la
clase `BST<T>` completa; la lección no los menciona.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T1 | mar. 10 nov | BST: propiedad de ordenamiento; `buscar` e `insertar` recursivos; análisis de complejidad y efecto de un árbol degenerado | |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E1 · Diagnóstico | Sin choque entre cronograma y registro | ✅ |
| E2 · Plan de lección | Aprobado: juego del 1 al 100, `NodoArbol<T>` reutilizado, duplicados ignorados con `false`, mismos siete datos para el degenerado, in-orden ordenado incluido, sin cuarto topic | ✅ |
| E3 · Lección `.mdx` + registro TS | `bst-busqueda-e-insercion`; el usuario pidió quitar `compareTo` (ver decisiones) | ✅ |
| E4 · Apuntes del docente | **No producidos:** la lección es el guion de la clase en vivo | ✅ Preguntado y confirmado en E1 |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → 6 aprobadas (opción (b) de P1 reemplazada) | ✅ |
| E6 · Guía del estudiante | No aplica — sesión en vivo | ✅ Preguntado y confirmado en E1 |
| E6 · Quiz A/B/C | No aplica — sin ★ en esta sesión | ✅ Preguntado y confirmado en E1 |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica (guion de clase en vivo) | `content/cursos/estructuras-de-datos/bst-busqueda-e-insercion.mdx` | ⬜ |
| Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 33`; solo se añadió `summary`) | — |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `bst-busqueda-e-insercion` | desarrollo | `87dba13e-acd0-4825-9c56-097232551d4c`, `fb0f24c4-ff2a-4b16-a395-e51906f82c77`, `2035e278-6a73-4996-91ff-4f2130331ca9`, `ca552414-5a1f-4b54-8040-75c81c36dad1`, `ab7ef586-1814-4f51-9518-9efb70d4b4e7`, `d772752d-0ae0-4a97-8ed2-5daffc480c97` (P1–P6, en ese orden) | ✅ | ✅ 6/6 |
| `bst-busqueda-e-insercion` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3. No
> hay keywords nuevas en esta ronda; en D3 hay que comprobar con
> `list_keywords` de producción que existan `arboles`, `estructuras-de-datos`,
> `java`, `recursion` y `complejidad` (`arboles` es nueva de una ronda
> anterior). El cuestionario se responde después de la clase en vivo, no repite
> la votación (`buscar(r, 60)` = `false 2`) ni la tabla de la clase, y usa
> árboles y cifras nuevos.

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- Se quitó `compareTo` y `Comparable` a pedido del usuario: `buscar` e `insertar` trabajan sobre `NodoArbol<Integer>` con `int dato` y comparan con `==` y `<`. Se eliminó la sección «Comparar datos» (la lección pasó de 11 a 10 secciones `##` y de 350 a 343 líneas), y el `summary` pasó de "con `compareTo`" a "sobre enteros", en el frontmatter y en el registro — **motivo:** el `summary` no podía seguir prometiendo `compareTo`; es el único cambio al registro que el usuario no pidió explícitamente.
- El contador `comparaciones` suma una por nodo visitado, no por el árbol vacío — **motivo:** definición única y verificable; con ella las sumas de las siete búsquedas son 17 (equilibrado) y 28 (degenerado).
- `NodoArbol<T>` se reutiliza sin modificarlo; `insertar` necesita un árbol con raíz y el `IllegalStateException` de la lección Inserción y recorridos nunca salta — **motivo:** no tocar la lección Inserción y recorridos.
- Duplicados: `insertar` los ignora y devuelve `false` — **motivo:** un BST de este curso es un conjunto de claves; aprobado por el usuario.
- Votación movida a no revelar nada antes: se quitó la frase "sin pasar por ninguna regla" de su sección, que adelantaba que el árbol podía no cumplir la regla — **motivo:** detectado al revisar la lección.
- Se retiró la fila «In-orden (lección anterior) — O(n)» del Resumen operativo, que el agente añadió fuera del plan — **motivo:** no estaba en lo aprobado.
- «La lección anterior» sin título se reemplazó por «la lección Inserción y recorridos» en dos líneas — **motivo:** hallazgo del checklist E7, defecto señalado en revisiones anteriores.
- E4 y E6 se preguntaron y confirmaron al inicio de la ronda.
- Tras la primera revisión se corrigió la frase de las mil claves («desde la mediana hacia afuera» daba altura 500, no 9; ahora «primero la mediana y luego la mediana de cada mitad, como en el juego»), el «deja menos números» del 50 (el 51 empata), la frase sobre el 60 que sugería llegar al 30, una frase mal construida y las aristas del degenerado, que ahora dicen «mayor» como en el primer diagrama — **motivo:** hallazgos de la revisión; el bloqueante afirmaba una cifra falsa sobre el orden de inserción.
- Las salidas y cifras se verificaron con Java 17 (el entorno no tiene Java 21): los 10 bloques `java` se reconstruyeron desde la lección y las 7 comprobaciones coinciden byte a byte con los 6 bloques `text`.

### Verificación (E7)

- [x] `npm run build` en verde (código de salida 0)
- [x] `npm run lint` en verde (0 errores; 7 warnings preexistentes en archivos ajenos)
- [x] Checklist de `lesson-authoring` §8 recorrido
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada lección ↔ cuestionario (salidas, contadores y alturas calculados con Java 17)
- [x] `@reviewer`: primera revisión CAMBIOS REQUERIDOS (1 bloqueante, 4 menores, 4 sugerencias); corregidos en un commit posterior; segunda revisión APROBADO, sin hallazgos bloqueantes, mayores ni menores
- [ ] Render en navegador (los dos diagramas del árbol): pendiente, lo comprueba el docente

### Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | |
| D3 · Banco de preguntas replicado a producción | ⬜ | 6 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | estructuras-de-datos → `bst-busqueda-e-insercion` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

### Pendientes

- Comprobar en el navegador que los dos diagramas del árbol (equilibrado y degenerado) se renderizan (la sintaxis ya está validada).
- Actualizar `info.md` para que coincida con el registro, o autorizar a Claude a hacerlo: las líneas 501 y 507 (de las sesiones S14 T1 y S14 T2) y, en la S15 T1, el bullet «Efecto de un árbol degenerado sobre la complejidad» (línea 521), que no tiene topic porque se decidió no crear un cuarto.
- Fuera de esta ronda: `notacion-big-o-y-analisis-de-complejidad.mdx:242` aún marca la fila del BST como «pendiente — semana 15»; conviene actualizarla en una ronda futura.
- La Semana 13 (recursión sobre listas; riesgos, límites y backtracking) sigue sin lecciones registradas.
- Decidir aparte los laboratorios P pendientes, incluido el del viernes 13 de noviembre.
- D7: marcar la lección como vista en clase del grupo que la dicte, después de la sesión.


---

## Ronda 2 — `estructuras-de-datos`, T2 (2026-11-03)

**Rama:** `feat/semana-15-t2-estructuras-de-datos`
**Estado:** ✅ Material y cuestionario listos en desarrollo / ✅ Revisada por `@reviewer` / ✅ Mergeada a `development` (local; push pendiente) / ⬜ Desplegada y abierta

**Alcance confirmado por el usuario:** solo la sesión T2 (jueves 12 de noviembre):
eliminación en BST. **Excluidos:** aplicaciones de los BST y síntesis del curso
(T1 de la Semana 16, 17 nov), que se quitaron de los `topics` del registro; el
laboratorio P del 13 de noviembre. El slug sigue siendo
`eliminacion-en-bst-y-sintesis-del-curso` (no cambia ninguna URL) aunque el título
pasó a «Eliminación en BST».

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E1 · Diagnóstico | El registro (order 34) juntaba dos sesiones; se acotó a T2 | ✅ |
| E2 · Plan de lección | Aprobado: setters en `NodoArbol`, `Eliminacion.java` nuevo, `minimo` sin contador, topics de S16 quitados, un solo diagrama | ✅ |
| E3 · Lección `.mdx` + registro TS | `eliminacion-en-bst-y-sintesis-del-curso` (312 líneas, 10 `##`, 1 Mermaid) | ✅ |
| E4 · Apuntes del docente | No: la lección es el guion de la clase en vivo | ✅ (patrón de la serie) |
| E5 · Cuestionario de cierre | Propuestas 6 preguntas → 6 aprobadas tal cual | ✅ |
| E6 · Guía / Quiz A/B/C | No aplica (sesión en vivo, semana sin ★) | ✅ (patrón de la serie) |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica (guion de clase en vivo) | `content/cursos/estructuras-de-datos/eliminacion-en-bst-y-sintesis-del-curso.mdx` | ⬜ |
| Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 34`; título, `summary` y `topics` reformulados) | — |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `eliminacion-en-bst-y-sintesis-del-curso` | desarrollo | P1 `176efa7d-61fe-4be5-a6d3-2a8200be2095` · P2 `0bd3d34d-39ae-4831-961c-96e5061caf7a` · P3 `8a125945-14ec-4d9c-bb19-49876ed1faed` · P4 `72c26aff-5a39-473d-a484-807673cf49d6` · P5 `c94cda8b-e3ad-4859-9d19-2896bf485485` · P6 `50835d7f-8727-40eb-aeaa-de79094c2ccd` | ✅ | ✅ 6/6 (orden P1–P6) |
| `eliminacion-en-bst-y-sintesis-del-curso` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3. No hay
> keywords nuevas; comprobar en producción que existan `arboles`, `estructuras-de-datos`,
> `java`, `recursion`, `complejidad` y `nodos`. Correctas: P1=b, P2=d, P3=a, P4=c, P5=a
> (`50 4`, verificada con Java 17), P6=d. Las explicaciones no se guardan (sin campo de feedback).

### Decisiones tomadas por Claude en nombre del docente

- `NodoArbol` se amplía con `setDato`, `setIzquierdo` y `setDerecho`: eliminar es la primera operación que reemplaza. La lección avisa que `NodoArbol.java` sí se modifica aquí (la lección Inserción y recorridos decía «sin setters»).
- Título del registro «Eliminación en BST»; el slug conserva «y-sintesis-del-curso» y ya no coincide con el título.
- Las eliminaciones de la clase son acumulativas sobre el mismo `raiz` (T0: 50, 30, 70, 20, 40, 60, 80, 65): eliminar 20, 60 y 50 da 3 comparaciones cada una.
- Antes de la votación se dice que el predecesor también serviría pero el curso usa siempre el sucesor, para que la opción (d) se decida por convención.
- La rama de dos hijos queda como `return nodo;` («pendiente») en el estado intermedio para que cada bloque compile.
- Las salidas se verificaron con Java 17 (el entorno no tiene Java 21).
- El subagente de evaluación se negó a ejecutar la creación porque no veía la aprobación del usuario (la dio con AskUserQuestion); la creación, publicación y montaje los hice yo.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` sin errores (7 warnings preexistentes)
- [x] Sin `# H1`, `###`, `---` en el cuerpo ni `$`; Mermaid validado; `tsc` sin errores
- [x] `summary` idéntico en frontmatter y registro TS
- [x] Salidas citadas reproducidas byte a byte con Java 17
- [x] `@reviewer`: primera revisión CAMBIOS REQUERIDOS (1 bloqueante, 1 mayor, 3 menores, 1 sugerencia); corregidos en `eef9de4`; segunda revisión APROBADO, sin hallazgos bloqueantes, mayores ni menores
- [ ] Render en navegador del diagrama del árbol (lo comprueba el docente)

### Pendientes

- Push de `development` (del usuario).
- Despliegue D0–D7 con confirmación en cada paso.
- Las líneas de `info.md` de S15 T2 (523–525) también difieren del registro; no se tocaron.

---

## Despliegue — `estructuras-de-datos` (2026-11-04)

Alcance: las 6 lecciones de la serie de recursión y árboles (`order` 29 a 34).
Sin cambios de esquema.

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | 24 commits, 11 archivos; sin migraciones; build y lint en verde |
| D1 · Lecciones nuevas cerradas por adelantado | ✅ (no hizo falta) | Las 6 ya estaban cerradas en producción desde 2026-08-03 |
| D2 · Merge a `main` y deploy en Vercel | ✅ | `616e176` (`deploy/semana-15-ed`, borrada); deployment `dpl_4LaqTwA7AMnoVZuZk58zLhb5gyT8` READY |
| D3 · Banco de preguntas replicado a producción | ✅ | 3 keywords (`arboles`, `excepciones`, `pila-de-llamadas`) y 36 preguntas, publicadas y montadas en orden P1–P6 |
| D4 · Lecciones abiertas a los estudiantes | ✅ | Las 6 abiertas; `list_course_lessons`: 0 lecciones cerradas, ninguna futura abierta por error |
| D5 · Verificación end-to-end en producción | ⬜ | Pendiente: render de la lección y de los diagramas Mermaid, autoevaluación al final (lo comprueba el docente) |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | Rama local borrada (no se subió al remoto) |

### Preguntas en producción (P1 a P6, en ese orden)

| Lección | IDs |
|---|---|
| `fundamentos-de-recursividad` | `42f70736-3d9e-4142-a416-495464fc2896` · `f7f2ef6d-851b-4ac9-8037-b6ea33a914f0` · `e5225ee0-723f-420d-b18b-1f79acc5df3e` · `286769b9-3ea1-46e0-a6c2-f3475bb2dd8a` · `622a92c1-1bad-4fdb-89fe-9a06ebc82b68` · `24dc979f-4225-49ea-930c-a05695581a44` |
| `algoritmos-recursivos-clasicos` | `81277f71-019d-4bf4-a61a-d51ce0662401` · `1a6be449-53fa-4384-9e71-bd31fe71a152` · `0f07c173-59fa-48e0-8216-bcc9a2fdf9a4` · `e7e1dc70-1e85-4207-8ded-db4000cdaed1` · `4e9fc2b1-fab4-44ee-9b74-9600096cd387` · `afcd4793-4fc9-431f-92dd-07b191653dab` |
| `conceptos-y-tad-arbol-binario` | `2ea98ead-d92f-4146-961b-29c52aeb41b7` · `8031d164-afa3-4fcf-9703-bd73861a6004` · `7f4c06c8-72e1-44a1-ba02-0359465207e3` · `ca8d841b-1447-4f6d-982a-86b2234ea107` · `739c64ac-c8c0-42dc-8ed0-7fb776950bd7` · `903785b4-e87e-4edf-9bab-d3874c16debf` |
| `insercion-y-recorridos` | `96a3775c-9d12-4a09-ab18-fe10acc46716` · `fdfddd29-e23a-4774-a286-e5caf2e4ed99` · `e5273d5e-cf7a-45df-afb4-91678ac65841` · `0b4b52f2-decc-45cf-ae51-3e1acff3b0b9` · `7e3824c5-6ee3-464e-b455-66aeeba927cc` · `8eda8542-ac43-4e68-8d29-f8e96c579d4b` |
| `bst-busqueda-e-insercion` | `54e67db3-b55f-4941-8d13-4440fe3bd95f` · `5e9d9151-8fc1-47ae-8203-13b36a8c4c2f` · `7ed92ec4-9d4b-403d-916f-0852c1036478` · `248b7d24-20b5-4c62-a7dd-9fbab723037e` · `f5f66c1c-5c17-40c1-b440-ace548de3f10` · `4fa8424e-7747-4205-afed-76d1e0838711` |
| `eliminacion-en-bst-y-sintesis-del-curso` | `1b7201d7-4bee-479c-ae2f-eb3911301988` · `b7018cb9-ba5d-403e-9146-079092ac3c40` · `0f9a6fab-e232-4c7a-afb1-b79dd4b1fb9d` · `77a2bad0-bb8b-43a6-a7ef-cb5b9d109405` · `1bbe1fd5-9f2f-4ec0-aa0d-b1fff33d2b1f` · `0a15cab0-e79b-4595-b559-2104d4523963` |

> No se hizo una lectura de control con `list_lesson_questions` en producción: cada `mount_question_in_lesson` devolvió los índices 0 a 5 en orden, y las lecciones estaban en 0 preguntas antes.
> El subagente `assessment-builder` se negó a ejecutar la creación en la ronda T2 porque no veía la aprobación; la ejecuté yo con la aprobación del usuario.

### Pendientes

- D5: el docente verifica en producción, con sesión, el render de las lecciones y de los diagramas Mermaid, y que la autoevaluación aparezca al final.
- D7: marcar cada lección como vista en clase del grupo que la dicte, después de la sesión.
- `info.md` (líneas 501, 507, 521 y 523–525) sigue sin alinear con el registro.
- Semana 13 (recursión sobre listas; riesgos, límites y backtracking): sin lecciones registradas.
- La sesión del 17 nov (aplicaciones de BST y síntesis del curso) quedó sin lección propia por decisión del usuario.

---

## Ronda 3 — `programacion-cientifica`, lección dividida en dos clases en vivo (2026-11-04)

**Rama:** `feat/semana-15-pc-graficas`
**Estado:** ✅ Material y cuestionarios listos en desarrollo / ✅ Revisada por `@reviewer` / ✅ Mergeada a `development` (local; push pendiente) / ⬜ Desplegada (la lección B nace abierta: cerrarla en D1)

**Alcance confirmado por el usuario:** convertir `matplotlib-y-seaborn` en una clase autocontenida en vivo, como las de `estructuras-de-datos`, dividida en dos clases: gráficas univariables y gráficas multivariables. Los apuntes del docente se eliminaron. **No se tocó el cronograma:** la fecha de la segunda clase la decide el docente.

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E1 · Diagnóstico | Una sola sesión en el cronograma (jue 12 nov); el usuario pidió dividir en dos clases | ✅ |
| E2 · Plan de lección | Aprobado: slug largo para B, mover 4 imágenes, votación de proporción en A, gancho de estatura/zapato en B | ✅ |
| E3 · Lecciones `.mdx` + registro TS | A `matplotlib-y-seaborn` (290 líneas, 11 `##`) y B `graficas-multivariables-con-matplotlib-y-seaborn` (306 líneas, 13 `##`) | ✅ |
| E4 · Apuntes del docente | **Eliminados** (`apuntes/matplotlib-y-seaborn.md`) a pedido del usuario | ✅ |
| E5 · Cuestionario | 6 por lección: Q4 reformulada, Q2/Q3/Q5/Q6 pasadas a B, 6 nuevas | ✅ aprobado tal cual |
| E6 · Guía / Quiz A/B/C | No aplica | — |

### Artefactos

| Artefacto | Ruta |
|---|---|
| Lección A (univariables) | `content/cursos/programacion-cientifica/matplotlib-y-seaborn.mdx` (order 11, slug sin cambio) |
| Lección B (multivariables) | `content/cursos/programacion-cientifica/graficas-multivariables-con-matplotlib-y-seaborn.mdx` (order 11.2) |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (título, `summary` y `topics` de A; entrada nueva de B) |
| Imágenes | A conserva `histograma-masa` y `nube-metodos-exoplanetas`; B recibió (git mv) `boxplot-masa-especie`, `mapa-calor-correlacion`, `dispersion-pico-especie` y `burbujas-pico-masa` |

### Cuestionario en desarrollo (orden A1–A6 y B1–B6)

| Lección | IDs |
|---|---|
| `matplotlib-y-seaborn` | A1 `f7e68922-ba5d-4aa0-b0d1-bf76a7206611` (Q1) · A2 `5933ca23-d0a0-4567-80bc-ceeceea21198` · A3 `55fbed47-aad0-465a-8064-f3558db202f0` · A4 `5a2f11e8-5724-42b9-b1b1-cd16f974087b` · A5 `2f13d949-e23c-4d2b-ab35-24c2a658362d` (Q4 reformulada) · A6 `035b7aa5-505f-48dd-8f03-88fe780da087` |
| `graficas-multivariables-con-matplotlib-y-seaborn` | B1 `6363c629-605e-4006-a525-02e30c3008d6` (Q2) · B2 `98e67585-cc49-4d5f-a6da-6f3a7db9497d` · B3 `16648dce-6057-40e3-a44c-634910078fcd` (Q3) · B4 `55258601-c9e8-47af-a7a6-2e3ef04fa9da` · B5 `5d1c876e-37e8-41dc-b410-986845310443` (Q5) · B6 `6a1bec38-7b26-4d15-ae42-f0161ed1a696` (Q6) |

**Producción (pendiente en el despliegue):** replicar con los IDs de producción de las 6 preguntas actuales — Q1 `0905d8f0-d259-4cca-a1c2-7c0bcc23b38a`, Q2 `9b32c1bf-fd7f-4257-bc1e-cc7dbd806290`, Q3 `26cc01a8-0e52-4121-bc42-7f151addaa5d`, Q4 `560056d1-ec19-4269-9943-478c14d35840`, Q5 `9343b44e-6ccd-44c7-9a2d-7e4ee82b39b1`, Q6 `c0abcb08-f12b-4f64-ab33-939278b97136` —: `update_question` de Q4, desmontar Q2/Q3/Q5/Q6 de A y montarlas en B, crear las 6 nuevas, publicarlas, montarlas y reordenar. Las keywords ya existen en producción.

> Tras la revisión se corrigieron en desarrollo A2 (opción C: «con 20 se ve un pico cerca de 3700 g y una cola larga hacia los más pesados») y A4 (opción C: «La distribución es simétrica…»); ambas se replican igual en producción.
> Q6 trae las cifras de la paradoja de Simpson: el cuestionario se responde **después** de la clase B (decisión del usuario).

### Decisiones tomadas por Claude en nombre del docente

- **Corrección (revisión):** la masa de los pingüinos NO es bimodal. Con 20 columnas los conteos son 3, 12, 13, 30, 32, 39, 35, 18, 25, 17, 19, 22, 16, 12, 10, 17, 11, 5, 5, 1: un solo pico en 3600–3960 g y una cola larga hacia los más pesados; media 4202 g, mediana 4050 g. La versión original de la lección, ya en producción, decía «dos jorobas»; la lección A se reescribió con el razonamiento correcto y B no repite la afirmación (la cola jala la media y la ventana de 400 g es angosta frente a una desviación estándar de ~802 g).
- Cifra corregida del eje cortado en 100: la barra de Gentoo (124) mide el 82 % de la de Adelie (152), no «una sexta parte».
- El `summary` y los `topics` de B no nombran Simpson ni «por especie», para no delatar la votación.
- En B, antes de la votación solo aparecen datos inventados y la correlación global -0.24; ni `hue`, ni boxplot por especie, ni la dispersión aleta–masa.
- Sin «Dónde se rompe la analogía» en A ni B.
- Tiempos estimados: A ≈ 59 min y B ≈ 60–65 min; juntas suman ≈ 120–125 min, así que no caben cómodamente en una sola sesión de 120 min.
- Las 6 imágenes no se abrieron ni regeneraron: el render lo comprueba el docente.

### Verificación (E7)

- [x] `npm run build` en verde; `npm run lint` sin errores (7 warnings preexistentes); `tsc` sin errores
- [x] Todo el código de ambas lecciones se ejecutó en un venv; salidas y cifras coinciden
- [x] Primera revisión `@reviewer`: CAMBIOS REQUERIDOS (1 bloqueante por la bimodalidad falsa, 1 mayor por «Simpson en la pendiente», menores); corregido en esta ronda
- [x] `summary` idéntico en frontmatter y registro (A y B)
- [x] Nada antes de cada votación revela su respuesta
- [x] `@reviewer`: segunda revisión APROBADO, sin hallazgos bloqueantes ni mayores
- [ ] Render en navegador de las lecciones e imágenes

### Pendientes

- Push de `development` (del usuario).
- Despliegue: D1 cerrar la lección B antes del push; D3 replicar el cuestionario en producción; D4 abrir B; D7 marcar cada clase como vista.
- Fecha de la segunda clase: sin decidir; no se modificó el cronograma ni `info.md`.
