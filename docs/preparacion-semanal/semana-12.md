# Semana 12 — 19–25 de octubre

**Rama:** `feat/semana-12-analisis-de-algoritmos`
**Estado:** ⬜ En preparación / ⬜ Material y cuestionario listos en desarrollo / ✅ Mergeada a `development` / ⬜ Desplegada y abierta

---

## Ronda — `analisis-de-algoritmos` (2026-10-04)

**Alcance confirmado por el usuario:** Sesión 1 (T) del lunes 19 de octubre,
solo la lección (más sus apuntes y cuestionario). **Excluida:** la Sesión 2 (P);
el docente decidió dictar esa clase **sin sesión P**.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | lun 19 oct | Medianas, selección y estructuras elementales | |
| P | lun 19 oct | Laboratorio — Selección y estructuras elementales (**sin sesión**, decisión del docente) | |

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
| Lección teórica | `content/cursos/analisis-de-algoritmos/medianas-seleccion-y-estructuras-elementales.mdx` | ⬜ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 12`) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/medianas-seleccion-y-estructuras-elementales.md` | Solo owner/admin |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `medianas-seleccion-y-estructuras-elementales` | desarrollo | `737396be-ee51-468b-b7a6-7afc40f2d34f`, `d5775d18-b586-4b72-9bc6-a596f2779033`, `4cd62ac7-9ee8-495d-9ce9-192c67f8557c`, `3d7e4732-3d93-457e-9176-ef6b34eb8247`, `0359aa7d-23ed-4951-ab64-f9526f38ca88` | ✅ | ✅ (5) |
| `medianas-seleccion-y-estructuras-elementales` | **producción** | — | ⬜ | ⬜ |

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
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | `medianas-seleccion-y-estructuras-elementales` ya existía como stub |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-12` |
| D3 · Banco de preguntas replicado a producción | ⬜ | 5 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `medianas-seleccion-y-estructuras-elementales` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- La lección debe estar abierta en producción **antes del lunes 19 oct** (lectura previa).
- Abrir en el navegador los enlaces de LeetCode de los apuntes antes de compartirlos (dan 403 a herramientas automáticas).
