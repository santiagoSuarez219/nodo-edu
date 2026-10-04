# Semana 13 — 26 de octubre – 1 de noviembre

**Rama:** `feat/semana-13-analisis-de-algoritmos`
**Estado:** ⬜ En preparación / ✅ Material y cuestionarios listos en desarrollo, pendiente de merge / ⬜ Mergeada a `development` / ⬜ Desplegada y abierta

---

## Ronda — `analisis-de-algoritmos` (2026-10-04)

**Alcance confirmado por el usuario:** Sesión 1 (T) del lunes 26 de octubre,
ampliada a tablas hash **y** árboles de búsqueda binarios (dos lecciones).
**Excluida:** la Sesión 2 (P ★), que es el Laboratorio evaluativo 3 — su guía
con rúbrica es una etapa aparte, aún no producida.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| T | lun 26 oct | Tablas hash · Árboles de búsqueda binarios | |
| P | lun 26 oct | Laboratorio evaluativo 3 — Estructuras de datos (**no cubierta en esta ronda**) | ★ |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado con tres decisiones: dos lecciones (no una), BST plenamente evaluable en el Lab 3, ejemplo del archivador y del tablero de carpetas, sin borrado | ✅ |
| E3 · Lección `.mdx` + registro TS | `tablas-hash` (order 13) y `arboles-de-busqueda-binarios` (order 13.5, entrada nueva) | ✅ |
| E4 · Apuntes del docente | Sí, uno por lección | ✅ |
| E5 · Cuestionario de cierre | Propuestos 5 + 4 → aprobados 9, con ajuste de longitud de opciones | ✅ |
| E6 · Guía del estudiante | **Pendiente** — es la guía del Lab 3, etapa aparte | ⬜ |
| E6 · Quiz A/B/C | No aplica — el Momento evaluativo 3 es solo laboratorio | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/analisis-de-algoritmos/tablas-hash.mdx` | ⬜ |
| Lección teórica | `content/cursos/analisis-de-algoritmos/arboles-de-busqueda-binarios.mdx` | ⬜ |
| Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 13` y `order: 13.5`) | — |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/tablas-hash.md` | Solo owner/admin |
| Apunte de clase | `content/cursos/analisis-de-algoritmos/apuntes/arboles-de-busqueda-binarios.md` | Solo owner/admin |
| Microdiseño | `microdiseno/info.md` y `cronograma-dia-a-dia.md` (BST en la Semana 13, 19 oct sin sesión P) | — |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `tablas-hash` | desarrollo | `44d157ce-0d02-42a8-b0b0-f5ead288bd42`, `6adbe40a-f60e-44fa-bf4d-340a480758a1`, `52bbc4b8-59c7-40fa-b028-4afba2b7ece4`, `a02badf8-568f-47eb-9903-f345ec0ac724`, `f91df846-9c7f-42fc-bc76-721e27639baf` | ✅ | ✅ (5) |
| `arboles-de-busqueda-binarios` | desarrollo | `bb179a51-4e32-4817-b032-dd89febf0d1f`, `173459cb-cb9f-4130-ba9c-c43798f206ca`, `2436c9e3-7902-42eb-aabd-f80bf08332a8`, `6fc4ab07-6e7a-46a9-a58c-6f78a24d2723` | ✅ | ✅ (4) |
| `tablas-hash` · `arboles-de-busqueda-binarios` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3,
> junto con las keywords nuevas `tablas-hash` y `arboles-de-busqueda`, que hoy
> solo existen en desarrollo. Mientras la fila de producción esté vacía, la
> autoevaluación no existe para el estudiante.

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- `arboles-de-busqueda-binarios` con `order: 13.5` — **motivo:** no renumerar `fundamentos-de-programacion-dinamica` (order 14); ya hay precedentes con decimales (2.5, 6.5).
- `tablas-hash` ganó un cuarto `topic` (factor de carga y costo esperado) y su `summary`; `title` y `order` no cambiaron.
- En `insertar` del BST, dos ramas `if` en lugar de `getattr`/`setattr` — **motivo:** transparencia para quien nunca vio un árbol.
- Se quitó de la lección del árbol la frase que decía que el caso de telemedición está "en estado de propuesta" — **motivo:** no debe llegar al estudiante.
- Las lecciones superan el objetivo de longitud (186 y 161 líneas frente a 125–135 y 105–115) — **motivo:** el código con docstring completo; el usuario las aprobó así.
- Se igualó la longitud de las opciones del cuestionario y se reformuló la correcta de la P4 de hash para ceñirse a la lección.
- Se actualizaron `info.md` y el cronograma (BST evaluable en el Lab 3) con aprobación del usuario.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores)
- [x] Checklist de `lesson-authoring` §8 recorrido
- [x] `summary` presente en frontmatter **y** en registro TS
- [ ] Coherencia cruzada teoría ↔ práctica ↔ cuestionario ↔ rúbrica (la rúbrica del Lab 3 aún no existe)
- [x] `@reviewer`: APROBADO con un hallazgo Mayor (constante del método de la multiplicación) y menores — corregidos: `A = 0,618` exacta en el ejemplo, clave compuesta del rango, mención del `en_orden` recursivo, «primo cercano al doble» al redimensionar, longitud de la bitácora. Sin corregir: frontmatter `level`/`type` distinto entre las dos lecciones (sin efecto en ejecución)

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | `tablas-hash` ya existía como stub; `arboles-de-busqueda-binarios` es nueva |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-13` |
| D3 · Banco de preguntas replicado a producción | ⬜ | keywords `tablas-hash` y `arboles-de-busqueda` + 9 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `tablas-hash`, `arboles-de-busqueda-binarios` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- Guía del Laboratorio evaluativo 3 con rúbrica (BST evaluable).
- Las lecciones deben estar abiertas en producción **antes del lunes 26 oct** (lectura previa).
- Abrir en el navegador los enlaces de LeetCode de los apuntes antes de compartirlos (dan 403 a herramientas automáticas).
- Textos para estudiantes que aún dicen "cinco laboratorios".
