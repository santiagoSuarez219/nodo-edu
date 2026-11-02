# Semana 14 — 2–8 de noviembre de 2026

**Rama:** `feat/manejo-datos-faltantes-pc`
**Estado:** ⬛ En preparación (commit hecho; sin merge, sin desplegar)

> Material fuera del cronograma: el docente pidió una sección nueva de trabajo
> independiente, posterior a `filtrado-agregacion-y-limpieza-de-datos`. No
> corresponde a una sesión del `cronograma-dia-a-dia.md`; se registra en la
> semana en que se preparó.

---

## Ronda — `programacion-cientifica` (2026-11-02)

**Alcance confirmado por el usuario:** una lección nueva, autocontenida, sobre
manejo de datos faltantes con el dataset de pingüinos. Trabajo independiente:
**sin** demo en vivo, **sin** apuntes del docente, **sin** guía del estudiante,
**sin** quiz A/B/C.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Ninguna (material de trabajo independiente) | — | Manejo de datos faltantes | — |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado con 1 ajuste: re-explicar con más detalle `isna().sum()`, `dropna` y `fillna` | ✅ |
| E3 · Lección `.mdx` + registro TS | `manejo-de-datos-faltantes` (order 10.5). Ajustes posteriores: video al inicio, lección autocontenida (sin referencias a la anterior), aclaración de por qué `==` convierte el `NaN` en `False` | ✅ |
| E4 · Apuntes del docente | **No pedidos por el usuario** (trabajo independiente) | — |
| E5 · Cuestionario de cierre | Propuesto: 6 preguntas → aprobadas 6 | ✅ |
| E6 · Guía del estudiante | No aplica (la lección es el material de trabajo independiente) | — |
| E6 · Quiz A/B/C | No aplica | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/manejo-de-datos-faltantes.mdx` | ⬜ (aún no desplegada) |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 10.5`) | — |
| Cambio en lección existente | `content/cursos/programacion-cientifica/filtrado-agregacion-y-limpieza-de-datos.mdx` (video de loc/iloc) | ⬜ (aún no desplegado) |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `manejo-de-datos-faltantes` | desarrollo | `805ec817-3f88-4b9b-ba3a-8a15a08e99b8`, `196b7233-5611-44dc-b9c9-7565a58e9292`, `d631626f-af2b-4ebf-923c-414b8576c9b2`, `1a6c8073-1b4b-4dc5-90bf-7d809782eb20`, `f9e16029-e2b9-4afd-8606-c68b70be2447`, `41b20392-66b6-4e4a-b50a-9ceca7bdd78d` | ✅ | ✅ (6, en ese orden) |
| `manejo-de-datos-faltantes` | **producción** | — | ⬜ | ⬜ |

> Las preguntas **no viajan con el deploy**: se recrean en producción en D3.
> Hay que crear antes la keyword `datos-faltantes` (tipo `tema`), que hoy
> existe solo en desarrollo.

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- `order: 10.5`, entre `filtrado-agregacion-y-limpieza-de-datos` (10) y `matplotlib-y-seaborn` (11) — **motivo:** sigue el patrón de decimales del curso y no altera ningún `order` existente.
- Lección normal (`kind` por defecto), no guía — **motivo:** el docente la pidió como "lección"; así cuenta en progreso y autoevaluación.
- `presentation: false` en el frontmatter — **motivo:** es de lectura independiente, no se proyecta.
- Título de los dos videos genérico ("Video de apoyo…") — **motivo:** no se puede ver el contenido de los videos para titularlos con precisión.
- En la bitácora de ejemplo de la lección, `sex` se rellena con `"Desconocido"` — **motivo:** elección didáctica propia.
- Creada la keyword `datos-faltantes` en el banco de desarrollo — **motivo:** no existía ninguna keyword del tema; propuesta al docente antes de crearla.
- Esta bitácora se archivó como Semana 14 — **motivo:** es la semana calendario en que se preparó el material (2 nov, lunes de la semana 14); no hay sesión del cronograma asociada.

### Verificación (E7)

- [x] `npm run build` en verde (antes de las dos últimas ediciones de texto)
- [x] `npx tsc --noEmit` y eslint del registro TS en verde
- [x] Sin `#` H1, sin `###`, sin `---` en el cuerpo, sin `<`/`{`/`$` sueltos en prosa
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Salidas de todo el código de la lección ejecutadas con pandas 3.0.2 y el dataset real
- [x] Coherencia cruzada lección ↔ cuestionario (cifras verificadas con código)
- [x] `npm run lint` completo (0 errores; 7 warnings previos en otros archivos)
- [ ] `@reviewer`: pendiente

---

## Ronda 2 — `programacion-cientifica`: caso completo del pipeline (2026-11-02)

**Alcance confirmado por el usuario:** una segunda lección de trabajo independiente que muestra, con un caso resuelto, todo el pipeline de análisis con pandas (sin gráficas): problema y preguntas, carga e inspección, diagnóstico, limpieza justificada, preguntas de análisis y conclusiones. Toma como guía el Entregable 1 del proyecto integrador. **Sin** apuntes, guía, quiz ni cuestionario de cierre (el usuario respondió que no lleva cuestionario).

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado tal cual (dataset de exoplanetas, 5 preguntas, tabla de decisiones) | ✅ |
| E3 · Lección `.mdx` + registro TS | `caso-pipeline-analisis-de-datos-con-pandas` (order 10.6). Ajuste posterior: explicación de `unstack` y `fill_value` en la pregunta 2 | ✅ |
| E4 · Apuntes del docente | **No pedidos por el usuario** | — |
| E5 · Cuestionario de cierre | **No** (decisión del usuario) | — |
| E6 · Guía / quiz A/B/C | No aplica | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/caso-pipeline-analisis-de-datos-con-pandas.mdx` | ⬜ (aún no desplegada) |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 10.6`) | — |

### Decisiones tomadas por Claude en nombre del docente

- Dataset `planets` de Seaborn (exoplanetas, datos reales hasta 2014) en lugar de pingüinos — **motivo:** pingüinos solo tiene 11 vacíos y no permite ilustrar las decisiones del Entregable 1; el docente aprobó la propuesta.
- `order: 10.6` — **motivo:** entre `manejo-de-datos-faltantes` (10.5) y `matplotlib-y-seaborn` (11), sin cambiar ningún `order` existente.
- La lección menciona explícitamente el Entregable 1 y advierte que cada pareja debe hacer su propio análisis — **motivo:** el docente lo pidió así.
- Referencia por título a las lecciones anteriores — **motivo:** el docente lo pidió así (a diferencia de `manejo-de-datos-faltantes`, que es autocontenida).
- Unidades (días, masas de Júpiter, parsecs) escritas "según la documentación del conjunto" — **motivo:** conocimiento del dataset de Seaborn, **no verificado contra una fuente** durante la sesión.
- Imputación de `distance` con la mediana por método aunque ninguna pregunta la usa — **motivo:** mostrar el procedimiento; la lección lo declara y excluye lo imputado en la pregunta 5.
- Filas repetidas y filas sin medidas conservadas — **motivo:** sin identificador del planeta no se puede asegurar que sean errores, y cuentan como descubrimientos.
- Título de la lección y de las tablas redactado por Claude.

### Verificación (E7)

- [x] `npm run build` en verde (después de la última edición)
- [x] eslint del registro TS en verde
- [x] Todos los bloques de código ejecutados con pandas 3.0.2 y el dataset real; las salidas del texto se compararon con la ejecución (4 bloques corregidos)
- [x] Sin `#` H1, sin `###`, sin `<`/`{`/`$` sueltos en prosa
- [x] `summary` presente en frontmatter **y** en registro TS
- [ ] `@reviewer`: pendiente

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | cerrar `manejo-de-datos-faltantes` y `caso-pipeline-analisis-de-datos-con-pandas` antes del push si no deben abrirse |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | |
| D3 · Banco de preguntas replicado a producción | ⬜ | keyword `datos-faltantes` + 6 preguntas (solo de `manejo-de-datos-faltantes`; el caso no tiene cuestionario) |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `programacion-cientifica` → `manejo-de-datos-faltantes` y `caso-pipeline-analisis-de-datos-con-pandas` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- Revisión de `@reviewer` y aprobación del merge a `development`.
- Volver a correr `npm run build` tras las últimas ediciones de texto del `.mdx`.
- El Entregable 1 del proyecto integrador vence el **jueves 5 de noviembre**: el caso completo solo ayuda si está desplegado y abierto antes.
- Confirmar las unidades (días, masas de Júpiter, parsecs) del dataset `planets` contra su documentación.
- Las lecciones nuevas quedan **abiertas apenas se despliegan** si no se crea antes su fila de cierre (D1).
- El `estimated_time` de `filtrado-agregacion-y-limpieza-de-datos` dice "Semana 13" mientras su `order` es 10: es una inconsistencia previa, fuera del alcance de esta ronda.
