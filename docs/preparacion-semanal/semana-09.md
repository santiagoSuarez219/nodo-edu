# Semana 09 — 28 sep – 4 oct (PC)

**Rama:** `feat/semana-09-programacion-cientifica`
**Estado:** ✅ Contenido listo · ⬜ `@reviewer` · ⬜ Mergeada a `development` · ⬜ Desplegada y abierta

---

## Ronda — `programacion-cientifica` (2026-10-07)

**Alcance confirmado por el usuario:** Semana 9, sesión única "NumPy: arreglos y
dimensiones" (cronograma: jue. 1 oct; la clase se corrió y aún no se dicta).
Lección, apuntes del docente y cuestionario de cierre. Aplicación con dataset de
juguete del docente.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Única (S9) | jue. 1 oct (corrida, fecha real por definir) | NumPy: arreglos y dimensiones | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado | ✅ |
| E3 · Lección `.mdx` + registro TS | `arreglos-y-dimensiones-numpy`, `order: 7`, `summary` agregado; se eliminaron "Dónde se rompe la analogía" y "¿Dónde aparece en tu trabajo con datos?" a pedido | ✅ |
| E4 · Apuntes del docente | Pedidos por el usuario | ✅ (avance implícito a E5; sin aprobación explícita) |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No — sesión en vivo (supuesto, **por confirmar**) | ⬜ |
| E6 · Quiz A/B/C | No aplica — semana sin ★ | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/arreglos-y-dimensiones-numpy.mdx` | ⬜ (en rama) |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 7` con `summary`) | — |
| Apunte de clase | `content/cursos/programacion-cientifica/apuntes/arreglos-y-dimensiones-numpy.md` | Solo owner/admin (en rama) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `arreglos-y-dimensiones-numpy` | desarrollo | `a173b6cf-f65d-4b8f-8500-a090c5e43955`, `bcd843b3-51f8-4e83-8c31-7aebaf4fcb3e`, `d1bd6231-01eb-4b62-b366-23553af2ace9`, `4922a441-77da-4e1a-8b82-c74c01cd0d83`, `0510c95a-a775-410d-9040-793104f7b159`, `ab865cb0-4510-4b24-8364-7f8c0f962e3f` | ✅ | ✅ (orden 0-5) |
| `arreglos-y-dimensiones-numpy` | **producción** | — | ⬜ | ⬜ (0 preguntas al 2026-10-07) |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Keywords nuevas creadas en desarrollo: `numpy`, `slicing`, `mascaras-booleanas`.
> **Confirmado el 2026-10-07 que no existen en producción**: crearlas primero.

### Quiz calificable A/B/C

No aplica — semana sin ★.

### Decisiones tomadas por Claude en nombre del docente

- **Tabla de juguete `temps` (4 estaciones × 7 días)** como hilo de la lección y los apuntes — **motivo:** dataset de juguete del docente; el proyecto empieza en la semana 12.
- **Sin diagrama Mermaid** en la lección — **motivo:** la analogía de la hoja de cálculo y las tablas del código cubren las dimensiones.
- **Lección de ~181 líneas**, sobre la meta de 100–130 — **motivo:** 7 secciones con código ejecutable; pendiente decidir si se recorta.
- **Apuntes: dtype-truncation movido a una pregunta socrática final** (no está en la lección previa), marcada como fuera de la lectura previa.
- **Metodología de estructuras/análisis aplicada a PC** por instrucción explícita, aunque las skills (`lesson-authoring`, `class-material-prep`, `lesson-designer`) describen PC con esqueleto pragmático; las skills no se actualizaron.
- **Ejecución del cuestionario por mí, no por el subagente** — el subagente se negó a ejecutar con una aprobación relayada; se usó el "Sí, apruebo" directo del usuario.

### Verificación (E7)

- [x] `npm run build` en verde (2026-10-07)
- [x] `npm run lint` en verde (0 errores, 10 advertencias preexistentes sin relación)
- [x] `.mdx` sin `# H1` y sin `###`; `updatedAt: 2026-10-07`
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Apuntes sin entrada TS; sin guía del estudiante (sesión en vivo)
- [x] Preguntas publicadas y montadas en desarrollo (`list_lesson_questions`)
- [x] Cambios de esquema: ninguno (`git diff --stat origin/main..HEAD -- supabase/` vacío)
- [x] `@reviewer`: APROBADO (1 mayor + menores, corregidos en el 2.º commit)

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ (preparativo en solo lectura; pendiente de merge) | Solo código, sin migraciones; build y lint en verde; catálogo de PC en producción listado: 15 entradas, 5 cerradas, sin huérfanas |
| D1 · Lecciones nuevas cerradas por adelantado | ✅ (no aplica) | `arreglos-y-dimensiones-numpy` ya tiene fila de cierre en producción (4 ago, "Cierre solicitado por el docente") |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-09-programacion-cientifica` |
| D3 · Banco de preguntas replicado a producción | ⬜ | crear keywords `numpy`, `slicing`, `mascaras-booleanas` + 6 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | programacion-cientifica → `arreglos-y-dimensiones-numpy` (cuando el docente lo indique) |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas** (hoy: `operaciones-vectorizadas…`, `carga-e-inspeccion…`, `filtrado-agregacion…`, `matplotlib-y-seaborn` cerradas)

## Pendientes

- Confirmar la fecha real de la clase para planificar el margen de despliegue.
- Confirmar que la sesión es en vivo (sin guía del estudiante).
- Decidir si se recorta la lección (181 líneas).
- Decidir si se actualizan las skills por la excepción metodológica de PC.
- Revisión de `@reviewer` y aprobación de merge.
