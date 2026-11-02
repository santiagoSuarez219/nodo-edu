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

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | cerrar `manejo-de-datos-faltantes` antes del push si no debe abrirse |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | |
| D3 · Banco de preguntas replicado a producción | ⬜ | keyword `datos-faltantes` + 6 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `programacion-cientifica` → `manejo-de-datos-faltantes` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes

- Revisión de `@reviewer` y aprobación del merge a `development`.
- Volver a correr `npm run build` tras las últimas ediciones de texto del `.mdx`.
- La lección nueva queda **abierta apenas se despliegue** si no se crea antes su fila de cierre (D1).
- El `estimated_time` de `filtrado-agregacion-y-limpieza-de-datos` dice "Semana 13" mientras su `order` es 10: es una inconsistencia previa, fuera del alcance de esta ronda.
