# Semana 14 — 2–8 de noviembre de 2026

**Rama:** `feat/manejo-datos-faltantes-pc`
**Estado:** ✅ Mergeada a `development` y desplegada y abierta en producción (2026-11-02)

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
- [x] `@reviewer`: APROBADO (revisión conjunta con la ronda 2; observaciones menores corregidas)
- [x] `npm run lint` completo (0 errores; 7 warnings previos en otros archivos)

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
- [x] `@reviewer` (ronda 2): APROBADO, sin bloqueantes; 1 hallazgo mayor y varios menores, corregidos en un commit posterior (ver abajo)

### Correcciones tras la revisión

- Caso: advertencia explícita de que, en el proyecto, las dos imputaciones deben usar estrategias distintas (el caso usa medianas con reglas diferentes porque sus datos no ofrecen otra opción).
- Caso: matizado "no aplica" (los métodos "casi nunca" miden la masa, no "nunca"); añadida la justificación de los 97 extremos de *Radial Velocity*; plantilla del README copiada de la guía del proyecto; frase de las gráficas aclarada; salidas de `unstack` regeneradas con la ejecución real.
- `manejo-de-datos-faltantes`: precisado que el fallo de `inplace=True` es el de la forma encadenada; `fillna` con una Series alinea por etiqueta del índice (no por posición); aclaración de `loc[[3, 339]]`.
- Decisión del docente: se mantiene la narración en primera persona del plural del caso (el estándar del curso pide segunda persona del singular).
- `npm run build` en verde tras las correcciones.

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | 2026-11-02. Solo código y contenido (sin cambios en `supabase/`); 4 commits de `development` sobre `main`; 17 lecciones abiertas y ninguna cerrada en producción antes del deploy |
| D1 · Lecciones nuevas cerradas por adelantado | ✅ (no aplica) | Decisión del docente: abiertas desde el deploy, sin filas de cierre |
| D2 · Merge a `main` y deploy en Vercel | ✅ | Rama `deploy/semana-14` → `main` con `--no-ff`, commit `82121dc`, push autorizado por el docente. Deployment `dpl_2uGG8Ff9B6QpQDNTnUkg1REvi6ZL` en estado READY |
| D3 · Banco de preguntas replicado a producción | ✅ | Keyword `datos-faltantes` creada en producción. 6 preguntas creadas, publicadas y montadas en `manejo-de-datos-faltantes` (ver IDs abajo) |
| D4 · Lecciones abiertas a los estudiantes | ✅ | Abiertas por no existir fila de cierre: `manejo-de-datos-faltantes` (10.5) y `caso-pipeline-analisis-de-datos-con-pandas` (10.6). `list_course_lessons`: 19 lecciones, 0 cerradas, 0 huérfanas |
| D5 · Verificación end-to-end en producción | ⬜ | Pendiente: lo verifica el docente en `https://www.nod0.dev` (diagrama Mermaid, videos, autoevaluación al final). No se abrió el navegador |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ✅ | Rama `deploy/semana-14` borrada en local (nunca se publicó en remoto) |

### IDs de las preguntas en producción (`manejo-de-datos-faltantes`)

1. `1d35c2ad-4b6d-4e19-9c5f-eec33f3807c1`
2. `5cfff3a1-2c69-462d-8088-e259faa50752`
3. `11107243-508a-4388-8d72-dab46c3408b0`
4. `61ce32e7-e48a-488a-b6af-a9f8f16f451e`
5. `b7a3fa83-04b2-4b94-9f75-711913321c44`
6. `b3a04c41-98a2-4d9a-b4d9-655f40c69767`

Verificado con `list_lesson_questions` en producción: 6 preguntas, publicadas, montadas y en este orden.

- [x] Verificado que no hay lecciones de semanas futuras en el catálogo ni cerradas indebidamente (el catálogo de producción coincide con `lib/courses/data/`).

## Pendientes

- Verificación visual en producción por el docente (D5).
- `git push origin development` (lo ejecuta el docente): `origin/development` aún no tiene los commits de esta ronda; `main` ya está desplegado.
- Marcar las lecciones como vistas en clase de cada grupo (D7) **después** de dictarlas o asignarlas; no se marcó nada, y no corresponde antes de la sesión.
- Confirmar las unidades (días, masas de Júpiter, parsecs) del dataset `planets` contra su documentación.
