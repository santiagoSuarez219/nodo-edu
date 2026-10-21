# Semana 12 — 19–25 de octubre

**Rama:** `feat/semana-12-analisis-de-algoritmos`
**Estado:** ⬜ En preparación / ⬜ Material y cuestionario listos en desarrollo / ⬜ Mergeada a `development` / ✅ Desplegada y abierta (2026-10-04)

---

## Ronda — `analisis-de-algoritmos` (2026-10-04)

**Alcance confirmado por el usuario:** Sesión 1 (T) del lunes 19 de octubre,
solo la lección (más sus apuntes y cuestionario). **Excluida:** la Sesión 2 (P);
el docente decidió dictar esa clase **sin sesión P**.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | lun 19 oct | Pilas, colas y listas enlazadas *(reajuste 2026-10-14: se retiran medianas y selección; lección renombrada de `medianas-seleccion-y-estructuras-elementales`)* | |
| P | lun 19 oct | Laboratorio — Estructuras elementales (**sin sesión**, decisión del docente) | |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado con dos decisiones: árboles enraizados solo como mención y partición con tres listas | ✅ |
| E3 · Lección `.mdx` + registro TS | `medianas-seleccion-y-estructuras-elementales` (order 12); un párrafo de la sección 4 reescrito a pedido | ✅ |
| E4 · Apuntes del docente | Sí; se agregó un puente entre los pasos 1 y 2 y una tabla comparativa en el paso 5 | ✅ |
| E5 · Cuestionario de cierre | Propuestas 5 preguntas → aprobadas 5 | ✅ |
| E6 · Guía del estudiante | No — la sesión P no se dicta | ✅ |
| E6 · Quiz A/B/C | No aplica — semana sin ★ | ✅ |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/pilas-colas-y-listas.mdx` | ⬜ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 12`) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/pilas-colas-y-listas.md` | Solo owner/admin |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `medianas-seleccion-y-estructuras-elementales` | desarrollo | `737396be-ee51-468b-b7a6-7afc40f2d34f`, `d5775d18-b586-4b72-9bc6-a596f2779033`, `4cd62ac7-9ee8-495d-9ce9-192c67f8557c`, `3d7e4732-3d93-457e-9176-ef6b34eb8247`, `0359aa7d-23ed-4951-ab64-f9526f38ca88` | ✅ | ✅ (5) |
| `medianas-seleccion-y-estructuras-elementales` | **producción** | `680dce63-a2d2-4c44-a7a3-c4d9bcb93c15`, `8b53d196-00d5-4820-889b-55d3af8c09c1`, `a025501c-a1a3-4a39-8708-964d83aa8f29`, `a649e776-2724-4bd6-a12f-19566ffdee2d`, `53640acd-d404-42b5-ad55-0e62769c3d62` | ✅ | ✅ (5) |
| `pilas-colas-y-listas` | desarrollo | `479d6679-96cc-4485-8a69-a73969bb05a0`, `054828d4-aab0-47ca-817b-b969cb7fe548`, `932228f8-d36a-4269-99a5-d0d1ec784c72`, `895fe615-dbf4-4dd0-8db8-2cdc0a78381e`, `03fcd459-9d4c-4058-8905-87b92b0b0f0c` | ✅ | ✅ (5) — reajuste 2026-10-14 |
| `pilas-colas-y-listas` | **producción** | `a9e6298e-96b0-4256-b6f0-a51884950eb1`, `0642b03a-f040-47bf-8279-79e1b292389d`, `09ae73b3-6e05-4c26-b042-71384ba0721a`, `524f04a1-9ca0-4c38-9688-7c8a011a818f`, `53640acd-d404-42b5-ad55-0e62769c3d62` (reutilizada, lista doble) | ✅ | ✅ (5), montadas en el slug nuevo; **pendiente**: desmontar las 4 viejas de selección (`680dce63…`, `8b53d196…`, `a025501c…`, `a649e776…`) del slug viejo y la quinta, al desplegar |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Mientras la fila de producción esté vacía, la autoevaluación no existe para
> el estudiante aunque la lección esté abierta.

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- La lección usa "tú" — **motivo:** es el tono de la lección de referencia del curso, aunque el encargo decía "usted".
- Las fórmulas del caso de telemedición van en Unicode y no en KaTeX — **motivo:** evitar llaves dentro de MDX.
- La cola circular quedó solo en prosa en la lección — **motivo:** recorte para acercarse a la longitud de lectura previa; la lección igual salió en 245 líneas (objetivo 100–130) y el usuario la aprobó así.
- La cifra de la sección 8 se suavizó de "unas 10 veces menos" a "un techo en papel; al medirla baja a unas pocas veces" — **motivo:** coincidir con lo que medirán en clase (entre 3 y 8 veces).
- Los apuntes añaden un paso de partición de tres zonas sobre el mismo arreglo que el microdiseño no pedía — **motivo:** la partición de Cormen 9.2 se vuelve cuadrática con valores repetidos.
- Los apuntes se dejaron completos (8 pasos, más de 1.000 líneas) aunque ya no hay sesión P — **decisión del usuario.**

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores)
- [x] Checklist de `lesson-authoring` §8 recorrido
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada teoría ↔ apuntes ↔ cuestionario (las preguntas evitan las dos votaciones de los apuntes)
- [x] `@reviewer`: CAMBIOS REQUERIDOS → corregidos (cifra de la Síntesis alineada a «unas 10 veces en papel; medido, unas pocas»; promesa «la medirás tú» y etiqueta «Sesión P» de los apuntes retiradas; erratas menores). Pendiente de revisión: imports a mitad de archivo en el paso 8 de los apuntes (E402), que se pegan en un solo archivo

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | 2026-10-04 — sin cambios de esquema ni de variables de entorno; incluyó el cambio `ColaEnlazada`→`Cola` de Estructuras de Datos |
| D1 · Lecciones nuevas cerradas por adelantado | ✅ | 2026-10-04 — el catálogo no acepta cerrar un slug no desplegado (404); `arboles-de-busqueda-binarios` se cerró justo tras el deploy |
| D2 · Merge a `main` y deploy en Vercel | ✅ | 2026-10-04 — rama `deploy/semana-12-13`, `main` en `8eee0c9`, despliegue `READY` |
| D3 · Banco de preguntas replicado a producción | ✅ | 2026-10-04 — keywords `tablas-hash` y `arboles-de-busqueda` + 14 preguntas publicadas y montadas |
| D4 · Lecciones abiertas a los estudiantes | ✅ | 2026-10-04 — `medianas-seleccion-y-estructuras-elementales` abierta |
| D5 · Verificación end-to-end en producción | ⬜ | Pendiente: el docente comprueba en el navegador que cada lección carga, los diagramas Mermaid renderizan y la autoevaluación aparece al final |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | 2026-10-04 — rama `deploy/semana-12-13` solo existía en local y se borró |

- [x] Verificado que las lecciones de semanas futuras siguen **cerradas** (programación dinámica, voraces y síntesis del semestre)

## Pendientes

- Abrir en el navegador los enlaces de LeetCode de los apuntes antes de compartirlos (dan 403 a herramientas automáticas).


## Reajuste 2026-10-14 — retiro de medianas y selección (renombre del slug)

La lección `medianas-seleccion-y-estructuras-elementales` pasó a `pilas-colas-y-listas`. Estado de los datos en producción al 2026-10-14 (consulta de solo lectura):

| Tabla | Filas con slug viejo | Decisión |
|---|---|---|
| `lesson_progress` | 56 (56 estudiantes, 23 completadas) | **Migrar** al slug nuevo al desplegar |
| `self_assessment_attempts` | 24 (24 estudiantes) | **Dejar** bajo el slug viejo: la restricción `UNIQUE (user_id, course_slug, lesson_slug)` los bloquearía para responder las preguntas nuevas |
| `disabled_lessons` | 0 | Nada que migrar (la lección no está cerrada) |
| `lesson_questions` | 5 | Las 5 preguntas nuevas ya están montadas en el slug nuevo |
| `self_assessment_attempts_discarded`, `questions` | 0 | Nada que migrar |

Desarrollo (`nodo-dev`): sin progreso ni intentos; solo las 5 preguntas montadas en el slug nuevo.

**Procedimiento de despliegue (confirmación explícita del usuario en cada paso de escritura):**

1. Desplegar el código (merge a `main` → Vercel), sin cambios de esquema: no se ejecuta ningún comando de migración de base de datos.
2. Justo después de que el despliegue esté en vivo, migrar el progreso (verificar antes que el slug nuevo siga con 0 filas y mostrar el conteo):
   `update lesson_progress set lesson_slug = 'pilas-colas-y-listas' where course_slug = 'analisis-de-algoritmos' and lesson_slug = 'medianas-seleccion-y-estructuras-elementales';` → esperado: 56 filas.
3. Verificar: slug viejo con 0 filas y slug nuevo con 56 en `lesson_progress`; `list_lesson_questions` del slug nuevo con 5 preguntas.
4. Limpieza opcional: desmontar del slug viejo las 4 preguntas de selección (`680dce63…`, `8b53d196…`, `a025501c…`, `a649e776…`) y la lista doble (`53640acd…`). Tras el despliegue ese slug ya no existe en el sitio.

### Cierre del despliegue — 2026-10-14

- `main` en `f436849` (`deploy: release semana 12 AA`); Vercel `READY`, dominio `www.nod0.dev` asignado. Sin cambios de esquema: no se ejecutó ningún comando de base de datos.
- Lección abierta en producción: `pilas-colas-y-listas` (sin fila en `disabled_lessons`, abierta por defecto). Las 4 lecciones de PD y síntesis siguen cerradas.
- `lesson_progress` migrado: 56 filas (23 completadas) de `medianas-seleccion-y-estructuras-elementales` a `pilas-colas-y-listas`. Verificado: 0 en el slug viejo, 56 en el nuevo.
- `self_assessment_attempts`: 24 intentos conservados bajo el slug viejo (historial); 0 en el slug nuevo, así que los estudiantes pueden responder las preguntas nuevas.
- Preguntas de cierre en producción: 5 montadas en `pilas-colas-y-listas`, en orden.
- Limpieza hecha (2026-10-14): las 4 preguntas de selección (`680dce63…`, `8b53d196…`, `a025501c…`, `a649e776…`) y la lista doble (`53640acd…`) se desmontaron del slug viejo con `unmount_question_from_lesson`. Verificado: 0 montajes en `medianas-seleccion-y-estructuras-elementales` y 5 en `pilas-colas-y-listas`. Las 4 preguntas de selección siguen publicadas en el banco, sin montar; la lista doble sigue montada en el slug nuevo.
- **Pendientes:** ninguno de datos. Falta solo que el docente confirme visualmente en `www.nod0.dev` que la lección carga y que la autoevaluación aparece al final.

---

## Ronda — `programacion-cientifica` (2026-10-21)

**Rama:** `feat/semana-12-programacion-cientifica`
**Estado:** ✅ Material y cuestionario listos en desarrollo / ⬜ Mergeada a `development` / ⬜ Desplegada y abierta

**Alcance confirmado por el usuario:** sesión única del jueves 22 de octubre
(Pandas: carga e inspección). **Excluida:** la semana 13 (`filtrado-agregacion-y-limpieza-de-datos`).
La sesión es una **demo en vivo del docente**; el proyecto integrador y sus datasets se definen
en la clase de la semana siguiente, así que esta ronda no los toca.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Única | jue 22 oct | Pandas: carga e inspección (el cronograma agrega "arranque del proyecto", pospuesto por decisión del docente) | ◇ |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado con 6 decisiones (CSV por Drive, sin lista curada, penguins y `sample_data`, Flujo B solo en clase, nulos solo detectados, sección 8 solo con criterios) | ✅ |
| E3 · Lección `.mdx` + registro TS | `carga-e-inspeccion-de-datos-y-seleccion-del-proyecto` (order 9) | ✅ (se pidió continuar con los apuntes) |
| E4 · Apuntes del docente | Sí, a pedido; alcance: solo pandas con `estaciones.csv`, sin proyecto ni Git | ✅ (se pidió continuar con el cuestionario) |
| E5 · Cuestionario de cierre | Propuestas 5 preguntas → aprobadas 5 | ✅ |
| E6 · Guía del estudiante | No — sesión en vivo | ✅ |
| E6 · Quiz A/B/C | No aplica — semana sin ★ | ✅ |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/carga-e-inspeccion-de-datos-y-seleccion-del-proyecto.mdx` | ⬜ |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 9`, solo se agregó `summary`) | — |
| Apunte de clase | `content/cursos/programacion-cientifica/apuntes/carga-e-inspeccion-de-datos-y-seleccion-del-proyecto.md` | Solo owner/admin |
| Dataset de la demo | `estaciones.csv` (36 filas; fuera del repo; el docente lo genera y lo comparte por Drive) | — |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `carga-e-inspeccion-de-datos-y-seleccion-del-proyecto` | desarrollo | `8b1efdf4-f58a-4a9a-a451-6508fe02e814`, `5e86f98c-366c-4ad2-934b-241283ead252`, `0b0c4fa6-f764-4485-8ff4-2e9ff6bfe791`, `12423990-858f-4130-bfab-b7a5222c1a14`, `69b362b8-dc7e-4272-816f-05443abd3432` | ✅ | ✅ (5) |
| `carga-e-inspeccion-de-datos-y-seleccion-del-proyecto` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Keywords nuevas creadas en desarrollo (hay que crearlas también en producción): `pandas`, `dataframe` (kind `tema`).

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- Municipios de `estaciones.csv` (Medellín, Barranquilla, Rionegro, Valledupar) — **motivo:** el microdiseño no los fijaba; se eligieron para que el clima cuadre con cada estación.
- `describe(include="object")` reemplazado por `value_counts` en la lección — **motivo:** emite advertencia de deprecación en pandas 3.
- Los apuntes cuentan el `-999` con una comparación booleana — **motivo:** no hay otra forma de contarlo; no filtra ni limpia, y se aclara que eso es la semana 13.
- P3 del cuestionario muestra `str` y `pandas.DataFrame` — **motivo:** coincide con la lección (pandas 3); en Colab con pandas 2 saldría `object` y `pandas.core.frame.DataFrame`. Sin resolver.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 7 advertencias previas en archivos ajenos a esta ronda)
- [x] Checklist de `lesson-authoring` §8 recorrido (sin H1/`###`/`$`/diagramas; apuntes sin entrada TS)
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada teoría ↔ apuntes ↔ cuestionario (las preguntas evitan los ejemplos de los apuntes)
- [x] `@reviewer`: APROBADO (sin bloqueantes; 3 correcciones menores aplicadas)

### Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | la lección ya existía como stub; revisar si hay fila en `disabled_lessons` |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | |
| D3 · Banco de preguntas replicado a producción | ⬜ | crear keywords `pandas` y `dataframe` primero |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

### Pendientes

- Ejecutar en Colab, antes de la clase: `california_housing_train.csv` (Paso 5 de los apuntes, sin salida pegada) y las diferencias pandas 2 frente a pandas 3 (`object` vs `str`, nombre de clase en `info()`).
- El docente genera `estaciones.csv` (36 filas, columnas `estacion`, `municipio`, `fecha`, `temperatura_c`, `humedad_pct`, `sensor`; un `-999` y una celda vacía en `humedad_pct`) y lo comparte por Drive. Las salidas de la lección y los apuntes dependen de ese archivo exacto.
- Revisión (`@reviewer`, APROBADO): aplicadas 3 correcciones menores (`memory usage` igualado a 2.9 KB, nota `str`/`object` y primera línea de `info()`, sin nombrar la lección futura). La semana 13 debe partir sabiendo que `isna().sum()` ya se mostró.
- Resolver la P3 del cuestionario si se prefiere mostrar la salida de pandas 2.
- Hay una lección más de pandas pendiente (`filtrado-agregacion-y-limpieza-de-datos`, semana 13), hoy stub.
