# Semana 10 — 9–13 oct (ED) · 8 oct (PC)

**Rama (ronda 1, ED):** `feat/semana-10-estructuras-de-datos`
**Estado (ronda 1, ED):** ✅ Contenido listo · ✅ `@reviewer` · ✅ Mergeada a `development` (2026-10-14, `e1a5d0c`; rama borrada) · ✅ Desplegada en producción (2026-10-14, `c95785b`) · ⬜ Abierta a estudiantes (decisión del usuario: se deja **cerrada**)

> Una ronda cubre **un curso**. Esta semana tiene rondas de `estructuras-de-datos` (rondas 1 y 2) y de `programacion-cientifica` (ronda 3, al final del archivo).

---

## Ronda — `estructuras-de-datos` (2026-10-13)

**Alcance confirmado por el usuario:** completar lo que faltaba de la lección
«Fundamentos de archivos» (T1 del viernes 9 oct, ya dictada): apuntes del docente
con las cuatro dinámicas y cuestionario de cierre. La lección y su registro TS
**ya existían y no se tocaron**. Excluida: T2 «Lectura, escritura y modificación»
(martes 13 oct), cuyo `.mdx` sigue siendo un stub de 5 líneas.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T1 | vie. 9 oct (ya dictada) | Fundamentos de archivos: texto vs. binario, flujos, `File`, `FileReader`, `FileWriter` | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | No aplica — la lección ya existía (commit `5f6f379`) | — |
| E3 · Lección `.mdx` + registro TS | No se modificó: `fundamentos-de-archivos`, `order: 23` | — |
| E4 · Apuntes del docente | Pedidos por el usuario, con las cuatro dinámicas | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No — sesión con demo en vivo (supuesto de los apuntes, **por confirmar**) | ⬜ |
| E6 · Quiz A/B/C | No aplica — semana sin ★ | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/estructuras-de-datos/fundamentos-de-archivos.mdx` (previa) | ✅ ya en producción |
| Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 23`, previo) | — |
| Apunte de clase | `content/cursos/estructuras-de-datos/apuntes/fundamentos-de-archivos.md` | Solo owner/admin (en rama) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `fundamentos-de-archivos` | desarrollo | `50406de2-94a2-4615-933b-603a06bca23c`, `b6f29fc5-8dc3-444a-b9e0-bdc797282755`, `56a2a0a3-1a42-4446-b879-ef13cc66b749`, `62e70694-1956-421f-ab1c-a9f9629b268c`, `013fbf5f-d036-44ec-9bc8-43eef3d7affc`, `86dc7a7a-f225-4f63-bf30-dedbe2e83e9a` | ✅ | ✅ (orden 0-5, dificultades 1, 2, 2, 3, 3, 4) |
| `fundamentos-de-archivos` | **producción** | `01fd9e91-369a-463e-868b-4cadc4f137a1`, `feae03fd-64e7-4908-8d14-2e8e7c22fb94`, `5ad3c8aa-f20b-4593-b3af-5dbeb68db9fb`, `296d31a5-4a18-4bd6-a237-fa5f54708432`, `f69625b4-a981-473a-b435-51416d48d7ae`, `ffb7d3be-e812-446d-96e4-c4f4e1a99ca0` | ✅ | ✅ (orden 0-5, 2026-10-14) |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Mientras la fila de producción esté vacía, la autoevaluación no existe para
> el estudiante aunque la lección esté abierta.
> Keywords nuevas creadas en desarrollo (catálogo vacío tras la migración a
> `nodo-dev`): `archivos`, `persistencia`, `flujos`, `texto-binario`,
> `arquitectura`, `file`, `filewriter` (kind `tema`), `java` (`lenguaje`),
> `cierre` (`momento`). En producción hay que verificar cuáles ya existen antes
> de crearlas.

### Quiz calificable A/B/C

No aplica — semana sin ★.

### Decisiones tomadas por Claude en nombre del docente

- **Sesión tratada como demo en vivo, sin guía del estudiante** — **motivo:** los apuntes de las sesiones de pilas y colas siguen ese patrón; no se preguntó de forma explícita. Por confirmar.
- **Hilo de los apuntes: `Cliente` del Sistema Bancario** (`Service` con `guardar` y `leerTodo`, `View` con `ConsoleUtils`) — **motivo:** enganche al proyecto de aula; cada equipo lo aplica a su entidad principal.
- **Sin `BufferedReader/Writer`, `try-with-resources` ni binarios** en apuntes y cuestionario — **motivo:** son de T2 y de la Semana 11; los métodos declaran `throws IOException`.
- **Votación 2 de los apuntes (`read()` sobre `Hi`) y cuestionario sin solapamiento** — **motivo:** el cuestionario es lectura previa y no puede anticipar lo que la clase descubre.
- **Enlace de HackerRank corregido a «Java Stdin and Stdout II»** — **motivo:** el enlace del apunte abría el problema II, no el I. Los dos de LeetCode (434 y 58) se comprobaron por su API pública el 2026-10-13.
- **Dos correcciones menores del `@reviewer` aplicadas sin consultar** (`ce259a1`) — **motivo:** eran errores claros (una frase lógicamente incorrecta y una etiqueta sin verificar).
- **Las explicaciones de cada pregunta no quedaron en el banco** — **motivo:** `create_question` no tiene campo para ellas.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores; 10 avisos preexistentes en archivos no tocados)
- [x] Checklist de `lesson-authoring` §8 recorrido
- [x] `summary` presente en frontmatter **y** en registro TS (lección previa)
- [x] Coherencia cruzada teoría ↔ apuntes ↔ cuestionario
- [x] Código de los apuntes compilado y ejecutado con `javac` 17 (el curso usa Java 21; no hay nada específico de 21)
- [x] `@reviewer`: **APROBADO** (sin bloqueantes ni mayores). Dos menores aplicados en `ce259a1`: la respuesta de la pregunta socrática sobre `(char)` (`c != -1` es siempre verdadera, no «nunca se cumple») y la etiqueta «Fácil» de HackerRank, retirada por no estar confirmada. Sugerencia no aplicada: avisar al docente de que la demo de «José» = 5 bytes exige JDK 18+ (UTF-8 por defecto).

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | 4 commits (3 archivos, solo contenido y docs), sin cambios de esquema. La lección ya estaba en producción pero **deshabilitada** desde 2026-08-03 («Contenido aún en stub…») |
| D1 · Lecciones nuevas cerradas por adelantado | ✅ No aplica | no hay lección nueva y ya existe la fila de cierre; los apuntes son solo owner/admin |
| D2 · Merge a `main` y deploy en Vercel | ✅ | rama `deploy/semana-10`, merge `c95785b`, push a `main`; deploy `dpl_416mc3RQxAeVvYaBS2nvKjoQFFgb` en `READY` |
| D3 · Banco de preguntas replicado a producción | ✅ | 8 keywords creadas (`archivos`, `persistencia`, `flujos`, `texto-binario`, `arquitectura`, `file`, `filewriter`, `cierre`); `java` ya existía (sin `kind`) y se reutilizó. 6 preguntas creadas, publicadas y montadas; sin duplicados previos |
| D4 · Lecciones abiertas a los estudiantes | ⏸ Omitido | decisión del usuario: `fundamentos-de-archivos` **sigue cerrada** (`is_disabled: true`, comprobado tras el deploy). Para abrirla: `set_lesson_availability` con `enabled: true` en `courses-mcp-prod` |
| D5 · Verificación end-to-end en producción | ⬜ Parcial | verificado por API: deploy `READY`, preguntas montadas, lección cerrada. No se abrió el navegador; la revisión visual de los apuntes y de la autoevaluación queda al usuario |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | `deploy/semana-10` borrada en local (nunca se subió a `origin`) |

- [x] Verificado que `fundamentos-de-archivos` sigue **cerrada**. Las lecciones de semanas futuras no se tocaron (D4 omitido); `lectura-escritura-y-modificacion` (stub) sigue cerrada.

## Pendientes

- Confirmar si la sesión T1 requiere guía del estudiante (se asumió demo en vivo).
- La lección mide 159 líneas, sobre la meta de 100–130; decidir si se recorta.
- `lectura-escritura-y-modificacion.mdx` (T2, `order: 24`) sigue siendo un stub de 5 líneas.
- Decidir cuándo abrir `fundamentos-de-archivos` a los estudiantes (D4): la autoevaluación ya está montada en producción y quedará visible en cuanto se abra.
- Opcional: añadir a los apuntes el aviso de JDK 18+ para la demo de bytes del Paso 3.
- El push de `development` a `origin` queda a cargo del usuario.

---

## Ronda 2 — `estructuras-de-datos`, T2 (2026-10-14)

**Rama:** `feat/semana-10-estructuras-de-datos` (nueva, desde `development`)
**Estado:** ✅ Contenido listo · ✅ `@reviewer` (aprobado, correcciones aplicadas) · ✅ Mergeada a `development` (2026-10-14, `efcb6cc`; rama borrada) · ⬜ Desplegada en producción

**Alcance confirmado por el usuario:** lección de la sesión T2 de la Semana 10
(martes 13 oct, **ya dictada**; la ronda empezó el 14 oct): `BufferedReader` y
`BufferedWriter`, `IOException` y `try-with-resources`, formato CSV-like, con el
ejercicio de guardar la lista enlazada en un `.txt` y reconstruirla. Excluidas:
modificación de registros (T2 Sem. 11, 16 oct) y binarios (T1 Sem. 11, 15 oct).

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T2 + práctica incorporada | mar. 13 oct (ya dictada) | Lectura y escritura eficiente, excepciones y CSV-like | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | 9 secciones, sin Mermaid, ~125–135 líneas previstas | ✅ (las 4 preguntas abiertas del plan no se respondieron; ver decisiones) |
| E3 · Lección `.mdx` + registro TS | `lectura-escritura-y-modificacion`, `order: 24`, `summary` agregado, 183 líneas | ✅ (avance implícito a E4; sin respuesta sobre longitud, `getHead()` ni título) |
| E4 · Apuntes del docente | Pedidos por el usuario, con las cuatro dinámicas | ✅ (avance implícito a E5) |
| E5 · Cuestionario de cierre | Propuesto: 5 preguntas → aprobadas 5 | ✅ («Apruebo» sin elegir keywords ni Q4; ver decisiones) |
| E6 · Guía del estudiante | No — sesión con demo en vivo (supuesto, **por confirmar**) | ⬜ |
| E6 · Quiz A/B/C | No aplica — semana sin ★ | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/estructuras-de-datos/lectura-escritura-y-modificacion.mdx` | ⬜ (en rama; el slug ya está en producción como stub, **cerrado**) |
| Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 24`, solo se agregó `summary`) | — |
| Apunte de clase | `content/cursos/estructuras-de-datos/apuntes/lectura-escritura-y-modificacion.md` | Solo owner/admin (en rama) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `lectura-escritura-y-modificacion` | desarrollo | `7926ad4b-3385-44cc-ad87-2e93943c5f21`, `ad503176-c922-4316-a3eb-f7ef1d238605`, `214630fe-c8f9-4681-a532-37f2959ef54e`, `0e3decee-a6f7-46a0-aeb5-a7be3c5a4066`, `3dd63226-f8d2-4356-9d66-7c9c75ac64c5` | ✅ | ✅ (orden 0-4, dificultades 1, 2, 2, 3, 3) |
| `lectura-escritura-y-modificacion` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Keywords nuevas creadas en desarrollo: `buffer`, `try-with-resources`,
> `excepciones`, `csv` (kind `tema`). En producción ya existen `archivos`,
> `persistencia`, `flujos`, `texto-binario`, `arquitectura`, `file`,
> `filewriter`, `cierre` y `java` (ronda 1); faltan las cuatro nuevas.

### Quiz calificable A/B/C

No aplica — semana sin ★.

### Decisiones tomadas por Claude en nombre del docente

- **Título sin cambios** («Lectura, escritura y modificación») — **motivo:** ya está desplegado y el usuario no respondió la pregunta del plan. El plan recomendaba «Lectura y escritura de archivos de texto» (slug y `order` no cambian). La *modificación* es la T2 del 16 oct.
- **Línea mal formada en `cargar()`: ignora líneas en blanco y lanza `IOException` con el número de línea** — **motivo:** propuesta del plan, sin respuesta del usuario.
- **`guardar(Cliente)` de ayer pasa a `agregar(Cliente)`; `guardar(ListaSimple<Cliente>)` reescribe todo** — **motivo:** propuesta del plan, sin respuesta del usuario.
- **La lección usa `clientes.getHead()` sin definirlo** — **motivo:** el `ListaSimple` publicado solo tiene `estaVacia()` y `getTamano()`; los apuntes añaden `getHead()` en el Paso 4. Un estudiante que no asistió a clase no lo tiene.
- **Keywords: 4 nuevas en lugar de las 7 propuestas** — **motivo:** recomendación mía, para no inflar el catálogo (que también se replica en producción). El usuario respondió «Apruebo» sin elegir.
- **Q1 reescrita** («Ayer usaste `FileWriter` y `FileReader`») y **Q4 mantenida** — **motivo:** el enunciado original decía «ayer copiaste la agenda letra a letra», que la lección de ayer no hacía; Q4 se parece a una predicción del Paso 3 de los apuntes, pero la lección también la cubre.
- **Las explicaciones de cada pregunta no quedaron en el banco** — **motivo:** `create_question` no tiene campo para ellas.
- **Sesión tratada como demo en vivo, sin guía del estudiante** — **motivo:** igual que la T1 y los apuntes de pilas y colas; no se preguntó de forma explícita. Por confirmar.
- **Práctica externa:** LeetCode 468 y 206 comprobados por su API pública; HackerRank *Java String Tokens* existe con ese título, su dificultad no se confirmó. Ninguno se resolvió.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores; 10 avisos preexistentes en archivos no tocados)
- [x] Checklist de `lesson-authoring` §8 recorrido (`.mdx` sin H1, sin `###`, sin `---`, sin `$`; `updatedAt` 2026-10-14)
- [x] `summary` presente en frontmatter **y** en registro TS, idénticos
- [x] Código de la lección compilado y ejecutado con `javac` 17 (el curso usa Java 21; nada es específico de 21): `copiar`, `mostrar`, `mostrarSeguro`, `split(";", -1)`, y `guardar`/`cargar` armados en un `ClienteService` (archivo inexistente → lista vacía; teléfono vacío conservado; guardar dos veces no duplica; renglón mal formado → `Línea 6 inválida: 2;mal`)
- [x] Código de los apuntes compilado y ejecutado por el agente que los escribió (proyecto completo, errores planeados, votaciones y reto)
- [x] Coherencia cruzada teoría ↔ apuntes ↔ cuestionario: revisada por mí y por `@reviewer` (el cuestionario, solo por mí: el reviewer no tiene acceso al MCP)
- [x] `@reviewer`: **APROBADO** (sin bloqueantes). Dos Mayores y tres Menores, aplicados por orden del usuario:
  - **Mayor 1:** la lección daba por conocidos `ClienteService`, `ARCHIVO` y `guardar(Cliente)`, que solo existen en los apuntes privados de la T1. Se reescribió la frase de la sección 8 («el `ClienteService` que armamos en clase…»).
  - **Mayor 2:** el Paso 5 renombra `guardar(Cliente)` a `agregar(Cliente)`, pero la `ClienteView` de la T1 seguía llamando `guardar`, y el proyecto no compilaba hasta el Paso 7. Se añadió la instrucción de cambiar la llamada a `agregar`, y se corrigió el comentario «la View todavía no existe».
  - **Menores:** instrucción de borrar `data/clientes.txt` antes de la prueba del Paso 5 y `data/` antes de la «primera ejecución»; precisar «primer renglón (el de Ana)» en el archivo dañado; nota para ejecutar el `try` de la votación 1 dentro de un `main`.
  - **No aplicado (sugerencias):** recortar `cargar()` de la lección; la tabla atribuye `FileNotFoundException` a `BufferedReader` cuando en rigor la lanza el `FileReader` interno (aceptable para el nivel).

### Despliegue

Pendiente. Cuando se despliegue: el slug `lectura-escritura-y-modificacion` ya existe en producción **cerrado** desde 2026-08-03 («Contenido aún en stub…»); recrear las 4 keywords nuevas y las 5 preguntas (D3); decidir si se abre (D4).

### Pendientes

- Confirmar si T2 lleva guía del estudiante (se asumió demo en vivo).
- La lección mide 183 líneas, sobre la meta de 100–130; el recorte que falta es `cargar()`.
- La lección usa `clientes.getHead()` sin definirlo (los apuntes lo añaden en el Paso 4). Añadir una frase que diga que se agrega ese método, o reescribir `guardar` sin él. El Mayor 1 del reviewer se resolvió con `ClienteService`/`ARCHIVO`; `getHead()` sigue abierto.
- Decidir el título («Lectura y escritura de archivos de texto» recomendado) antes de crear la lección de modificación de registros (T2 Sem. 11, 16 oct), que no tiene entrada en el registro TS. El `order` 25 está libre.
- `cargar()` es O(n²) por `insertarFinal`; está como gancho en los apuntes y no se menciona en la lección.
- Los apuntes asumen el `Cliente` de 3 campos de ayer; los apuntes de eliminación en lista simple usan uno de 4.
- La T2 ya se dictó: la lección y su cuestionario no pudieron abrirse antes de la clase.

---

## Ronda 3 — `programacion-cientifica` (2026-10-14)

**Rama:** `feat/semana-10-programacion-cientifica` (nueva, desde `development`)
**Estado:** ✅ Contenido listo · ✅ `@reviewer` (aprobado, correcciones aplicadas) · ✅ Mergeada a `development` (2026-10-14, `efb2574`; rama borrada) · ✅ Desplegada en producción y abierta (2026-10-14, `ed4b8d1`)

**Alcance confirmado por el usuario:** sesión del jueves 8 oct (**ya dictada**; la
ronda empezó el 14 oct): operaciones vectorizadas y álgebra lineal básica,
completando el stub existente. Sin corrimientos de calendario. El Momento
evaluativo 3 (NumPy, 15 %) es el jue. 15 oct (Semana 11); el usuario pidió seguir
el flujo normal, sin priorizar el despliegue.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Única (jueves) | jue. 8 oct (ya dictada) | NumPy: operaciones vectorizadas y álgebra lineal | — (◇ de seguimiento en `info.md`) |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | 9 secciones, sin Mermaid, sin KaTeX, `keepdims` incluido, sin `.T`/`np.linalg` | ✅ (aprobado tal cual) |
| E3 · Lección `.mdx` + registro TS | `operaciones-vectorizadas-y-algebra-lineal-basica`, `order: 8`, `summary` agregado, 280 líneas | ✅ (sin pedir recorte) |
| E4 · Apuntes del docente | Pedidos por el usuario; sin las cuatro dinámicas de ED/AA (PC no las exige) | ✅ (avance implícito a E5) |
| E5 · Cuestionario de cierre | Propuesto: 5 preguntas → aprobadas 5; 6 keywords nuevas aprobadas | ✅ |
| E6 · Guía del estudiante | No — sesión en vivo (confirmado por el usuario) | ✅ |
| E6 · Quiz A/B/C | No aplica — semana sin ★ (confirmado por el usuario) | ✅ |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/operaciones-vectorizadas-y-algebra-lineal-basica.mdx` | ✅ producción, abierta (2026-10-14) |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 8`, solo se agregó `summary`) | — |
| Apunte de clase | `content/cursos/programacion-cientifica/apuntes/operaciones-vectorizadas-y-algebra-lineal-basica.md` (542 líneas) | Solo owner/admin (producción) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `operaciones-vectorizadas-y-algebra-lineal-basica` | desarrollo | `4168bb5c-00f6-4275-b9a9-b29a9cb596a8`, `b601d6d1-0bc1-41d3-b953-626628e4eb11`, `edad303c-83e4-408f-9c8a-2529cdd1b5b9`, `9b74fff8-657e-4988-9d2e-8793a1737276`, `37178be2-cef9-4f47-bdac-d5023d5db8ed` | ✅ | ✅ (orden 0-4, dificultades 1, 2, 3, 3, 4) |
| `operaciones-vectorizadas-y-algebra-lineal-basica` | **producción** | `3ca82d20-0c99-4d40-b14b-e380eb99d17e`, `d11e734c-2550-4616-ae5f-6257177d46ae`, `563d6b7a-a34f-4549-a466-8e95bacf2f3a`, `afb1c401-6329-45b2-adc3-f14355a0d074`, `b45125ea-53ee-4f7b-bdbe-64fe3ba7646d` | ✅ | ✅ (orden 0-4) |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Keywords nuevas creadas en desarrollo: `python` (`lenguaje`), `numpy`,
> `vectorizacion`, `broadcasting`, `estadistica-descriptiva`, `algebra-lineal`
> (`tema`). `cierre` ya existía. En producción hay que verificar cuáles existen
> antes de crearlas (`python` puede existir ya con otro `kind`).

### Quiz calificable A/B/C

No aplica — semana sin ★.

### Decisiones tomadas por Claude en nombre del docente

- **Lección de 280 líneas, sin recorte** — **motivo:** las 100–130 líneas son la medida de ED/AA (aula invertida); PC usa el esqueleto pragmático y sus lecciones previas miden entre 183 y 401 líneas, así que 280 está dentro de lo habitual del curso. Los bloques con su salida real y las trazas a mano ocupan casi todo. El usuario aprobó sin pedir recorte.
- **Formato de lectura previa (aula invertida) en PC** — **motivo:** la lección de la Semana 9 ya lo usa; la skill dice que PC no lo exige, pero se siguió el precedente por continuidad.
- **Salidas redondeadas con `np.round`/`.round(2)`** — **motivo:** sin ello el producto punto imprime `24.759999999999998`.
- **Datos ilustrativos inventados:** `ajuste_dia`, `ajuste_est`, `pesos` (0.4, 0.3, 0.2, 0.1) y `zonas` (norte/sur 0.5 cada una) — **motivo:** hacen falta para ilustrar broadcasting y producto matricial.
- **Errores deliberados de los apuntes dentro de `try/except`** — **motivo:** para que el cuaderno de Colab no se detenga en vivo.
- **Reto de extensión de los apuntes mide la fórmula de Fahrenheit con `%timeit`** (1.000.000 de valores; ~23 ms lista y ~0,5 ms arreglo en una ejecución local, no en Colab) — **motivo:** los apuntes de la S9 solo anotan que las operaciones vectorizadas son de la Semana 10, no que se medirían tiempos; es un reto opcional de este apunte. Los tiempos son orden de magnitud.
- **Preguntas del cuestionario con ejemplos distintos a los de la lección** (`[10, 20]`, tabla (3,5), vectores `[1,2,3]` y `[4,5,6]`, matrices (3,4) y (4,2)) — **motivo:** el cuestionario es verificación de lectura y no debe repetir lo ya resuelto.
- **Ufuncs y `keepdims` sin pregunta de cierre** — **motivo:** se propusieron 5 preguntas, una por concepto de peso; el usuario las aprobó así.
- **Las explicaciones de cada pregunta no quedaron en el banco** — **motivo:** `create_question` no tiene campo para ellas.
- **Avance implícito a E5 sin aprobación explícita de los apuntes** — **motivo:** el usuario escribió «Pasa a E5»; lo tomé como visto bueno.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores; 10 avisos preexistentes en archivos no tocados)
- [x] Checklist de `lesson-authoring` §8 recorrido (`.mdx` sin H1, sin `###`, sin `---` en el cuerpo, sin `$`, sin Mermaid; `updatedAt` 2026-10-14)
- [x] `summary` presente en frontmatter **y** en registro TS, idénticos
- [x] Lección y apuntes compilados como MDX (`next-mdx-remote` con `remark-math` y `remark-gfm`): ambos OK
- [x] Código de la lección y de los apuntes ejecutado con NumPy por los agentes que los escribieron; respuestas del cuestionario verificadas con NumPy
- [x] Preguntas publicadas **y montadas**, verificado con `list_lesson_questions`
- [x] Apuntes sin entrada TS; no existe guía del estudiante
- [x] Coherencia cruzada teoría ↔ apuntes ↔ cuestionario: revisada por `@reviewer` (el banco no es accesible para él; el texto exacto de las preguntas lo comprobé yo al crearlas)
- [x] `@reviewer`: **APROBADO** (sin bloqueantes; 39 salidas de código coinciden con la ejecución real). Hallazgos aplicados en un segundo commit:
  - **Mayor:** la P1 usa `lista + lista`, que la lección no enseñaba; se agregó a la sección 1 que `[1, 2] + [3, 4]` une las listas y que `np.array(...) + np.array(...)` suma celda por celda (el banco no se tocó).
  - **Menores:** comentario sobre `mean()` en ufuncs, `pesos @ temps` explicado como 7 promedios ponderados, explicación de `.copy()`, y lección previa citada por su título.
  - **Bitácora:** corregida la «meta» de líneas, la «promesa» de la S9 y el encabezado Rama/Estado.
  - **No aplicado (sugerencias):** nota inicial de los apuntes y tensión del «reto de extensión» con §3 de `lesson-authoring`.

---

### Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | build 0, lint 0 errores; sin cambios de `supabase/`; el despliegue incluyó también ED T2 (cerrada) |
| D1 · Lecciones nuevas cerradas por adelantado | ✅ | el slug ya estaba cerrado en producción (fila del 2026-08-04); no hizo falta crear nada |
| D2 · Merge a `main` y deploy en Vercel | ✅ | `ed4b8d1` (`deploy/semana-10-pc`); `dpl_AAuxLdBBxFHDD2SaVukEPSahcjEb` READY; push ejecutado por el usuario (el clasificador de permisos bloqueó el comando) |
| D3 · Banco de preguntas replicado a producción | ✅ | keywords creadas: `vectorizacion`, `broadcasting`, `estadistica-descriptiva`, `algebra-lineal` (`python`, `numpy`, `cierre` ya existían); 5 preguntas publicadas y montadas |
| D4 · Lecciones abiertas a los estudiantes | ✅ | `programacion-cientifica` → `operaciones-vectorizadas-y-algebra-lineal-basica` abierta (2026-10-14) |
| D5 · Verificación end-to-end en producción | ⬜ | pendiente: el docente comprueba en el navegador que la lección carga y la autoevaluación muestra las 5 preguntas |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | rama `deploy/semana-10-pc` borrada local (nunca se subió al remoto) |

- [x] Verificado que las lecciones de semanas futuras siguen **cerradas** (órdenes 9, 10 y 11 de PC cerradas tras la apertura)

### Pendientes

- **Calendario:** resuelto: lección y cuestionario abiertos el 2026-10-14, antes del Momento evaluativo 3 (15 oct).
- El taller del Momento evaluativo 3 no existe: el registro no tiene una guía equivalente a `taller-evaluativo-02` (`order: 6.5`). Es de la Semana 11, fuera de esta ronda.
- Opcional: añadir ufuncs y `keepdims` al cuestionario.
- El push de `development` a `origin` queda a cargo del usuario.

---

## Ronda 4 — `estructuras-de-datos`, lista doblemente enlazada y circular (2026-10-21)

**Rama:** `feat/semana-10-estructuras-de-datos` (nueva, desde `development`, `a76a86b`)
**Estado:** ✅ Contenido listo · ⬜ `@reviewer` · ⬜ Mergeada a `development` · ⬜ Desplegada en producción

**Alcance confirmado por el usuario:** solo la lección «Lista doblemente enlazada y lista circular» (`order: 20`) del módulo diferido de listas (T del mar. 6 oct según el cronograma; **se dicta el 21 oct**, sin laboratorio). Excluidas: ordenamiento sobre listas (`order: 21`), síntesis del módulo (`order: 22`) y el laboratorio combinado del 8 oct.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T (módulo diferido) | mié. 21 oct (el cronograma decía mar. 6 oct) | Lista doblemente enlazada y lista circular, sin laboratorio | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | 9 secciones planeadas; el usuario eliminó «Dónde se rompe la analogía» y «¿Dónde aparece en tu proyecto?» → 7 secciones | ✅ (ajustado una vez; 4 de las 5 preguntas abiertas no se respondieron) |
| E3 · Lección `.mdx` + registro TS | `lista-doblemente-enlazada-y-lista-circular`, `order: 20`, `summary` agregado, 206 líneas | ✅ (avance implícito a E4) |
| E4 · Apuntes del docente | Pedidos por el usuario, con las cuatro dinámicas | ✅ |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No — la sesión no tiene laboratorio | — |
| E6 · Quiz A/B/C | No aplica — semana sin ★ | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/estructuras-de-datos/lista-doblemente-enlazada-y-lista-circular.mdx` | ⬜ (en rama; el slug ya está en producción como stub) |
| Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 20`, solo se agregó `summary`) | — |
| Apunte de clase | `content/cursos/estructuras-de-datos/apuntes/lista-doblemente-enlazada-y-lista-circular.md` | Solo owner/admin (en rama) |
| Ajuste | `apuntes/operaciones-sobre-la-lista-simple.md`: la frase que decía que `ListaDoble<T>`/`ListaCircular<T>` eran «una práctica distinta» ahora los remite a la sesión siguiente | Solo owner/admin |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `lista-doblemente-enlazada-y-lista-circular` | desarrollo | `d9a555b2-6894-4c86-977c-c8c76992164e`, `918f1be0-a611-412a-99de-e7873363ee3c`, `5217dd4c-a87f-4fe8-83b8-b3d1b2e32182`, `989bf4f4-e6ab-47be-b6eb-541b929e9046`, `f8993174-a539-409b-87ff-7361be8507fb`, `78b76d2c-b6d6-469c-813b-75ff58c0581e` | ✅ | ✅ (orden 0-5, dificultades 1, 2, 2, 3, 3, 4) |
| `lista-doblemente-enlazada-y-lista-circular` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> No se crearon keywords nuevas: todas las preguntas usan `listas-enlazadas`, `nodos`, `complejidad`, `estructuras-de-datos`, `java` y `cierre`, que ya existen en desarrollo (verificar en producción antes de D3).

### Quiz calificable A/B/C

No aplica — semana sin ★.

### Decisiones tomadas por Claude en nombre del docente

- **Rama creada desde `development`** — **motivo:** el usuario no respondió la pregunta. El primer intento salió por error de `feat/taught-lessons-self-assessment` y se rehízo; los cambios sin commitear del usuario se guardaron en stash y se restauraron intactos.
- **Diagrama del anillo mantenido, atributos `siguiente`/`anterior`, sin `LinkedList<E>`** — **motivo:** valores por defecto del plan; el usuario no respondió esas preguntas.
- **Sin keywords nuevas (`lista-doblemente-enlazada`, `lista-circular`)** — **motivo:** el usuario aprobó las preguntas sin pronunciarse sobre ellas; las preguntas funcionan con las existentes.
- **Posición de la correcta barajada (C, B, D, A, C, B)** — **motivo:** propuesta mía en E5, aprobada con las preguntas.
- **P6 reescrita** (opción A y enunciado) respecto a la redacción del agente — **motivo:** la frase original era torpe.
- **Sin guía del estudiante** — **motivo:** el usuario indicó que la sesión no tiene laboratorio.
- **Práctica externa de los apuntes (LeetCode 707, 146 y 1823) marcada «por confirmar»** — **motivo:** el agente las tomó de memoria y no pudo verificar los enlaces.
- **Ajuste a `operaciones-sobre-la-lista-simple.md`** — **motivo:** el usuario pidió «actualizar los archivos necesarios» tras señalar la frase desactualizada.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores; 7 avisos preexistentes en archivos no tocados)
- [x] Checklist de `lesson-authoring` §8 recorrido (`.mdx` sin H1 ni `###`; `updatedAt` 2026-10-21)
- [x] `summary` presente en frontmatter **y** en registro TS, idénticos
- [x] Código de los apuntes compilado y ejecutado con Java 17 (el curso usa 21; nada es específico de 21); la salida impresa coincide con la documentada
- [x] Coherencia cruzada teoría ↔ apuntes ↔ cuestionario: revisada por mí; la votación de los apuntes no repite ninguna pregunta
- [ ] Diagramas Mermaid renderizados: **no verificado** (no se abrió el navegador)
- [ ] `@reviewer`: pendiente

### Despliegue

Pendiente. El slug `lista-doblemente-enlazada-y-lista-circular` ya existe en producción como stub (verificar con `list_course_lessons` si está cerrado). Recrear las 6 preguntas (D3) y decidir la apertura (D4). La sesión se dicta el 21 oct: la lección y su cuestionario deberían estar abiertos antes de la clase.

### Pendientes

- Confirmar los enlaces de práctica externa de los apuntes (LeetCode 707, 146, 1823).
- Las lecciones `order: 21` y `22` siguen sin escribir; el cronograma del módulo diferido incluye ordenamiento y síntesis.
- Verificar el renderizado de los 3 diagramas Mermaid en el navegador.
