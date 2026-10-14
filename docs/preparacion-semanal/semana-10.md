# Semana 10 — 9–13 oct (ED)

**Rama:** `feat/semana-10-estructuras-de-datos`
**Estado:** ✅ Contenido listo · ✅ `@reviewer` · ✅ Mergeada a `development` (2026-10-14, `e1a5d0c`; rama borrada) · ⬜ Desplegada y abierta

> Una ronda cubre **un curso**. Esta semana solo tiene ronda de `estructuras-de-datos`.

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
| `fundamentos-de-archivos` | **producción** | — | ⬜ | ⬜ |

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
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | no hay lecciones nuevas: solo apuntes (owner/admin) |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-10` |
| D3 · Banco de preguntas replicado a producción | ⬜ | keywords + 6 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `fundamentos-de-archivos` ya está en producción: comprobar su estado con `list_course_lessons` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- Confirmar si la sesión T1 requiere guía del estudiante (se asumió demo en vivo).
- La lección mide 159 líneas, sobre la meta de 100–130; decidir si se recorta.
- `lectura-escritura-y-modificacion.mdx` (T2, `order: 24`) sigue siendo un stub de 5 líneas.
- Comprobar en producción si la lección ya tiene preguntas montadas antes de recrearlas (D3).
- Opcional: añadir a los apuntes el aviso de JDK 18+ para la demo de bytes del Paso 3.
- El push de `development` a `origin` queda a cargo del usuario.
