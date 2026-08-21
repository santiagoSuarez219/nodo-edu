# Semana 04 — 25–28 de agosto (ED)

**Preparada el:** 2026-08-21
**Rama:** `feat/semana-04-material`
**Estado:** ⬜ En preparación (contenido listo, cuestionarios de cierre pendientes de servidor)

> Esta ronda cubrió solo `estructuras-de-datos`, a pedido explícito del
> usuario: las dos lecciones teóricas pendientes de la Semana 4 (T1 y T2). El
> laboratorio evaluativo M1 (viernes 28, ★) ya estaba escrito y desplegado
> desde el 18 de agosto (commit `deploy: release 2026-08-18 — M1 evaluative
> lab`), fuera de este flujo. No se tocó ninguna sesión de
> `analisis-de-algoritmos` ni `programacion-cientifica` en esta ronda.

## Sesiones cubiertas

| Curso | Sesión | Tema | ★/◇ |
|---|---|---|---|
| `estructuras-de-datos` | T1 (25 ago) | Asociación, agregación y composición (UML de relaciones) | — |
| `estructuras-de-datos` | T2 (27 ago) | Diseño con TAD y orientación a objetos + diagramas de paquetes | — |
| `estructuras-de-datos` | P (28 ago) | Lab evaluativo M1 — ya escrito y desplegado, no tocado en esta ronda | **★ M1** |

## Artefactos producidos

| Curso | Artefacto | Ruta | Publicado |
|---|---|---|---|
| `estructuras-de-datos` | Lección teórica — T1 | `content/cursos/estructuras-de-datos/composicion-agregacion-y-diagramas-de-paquetes.mdx` | ✅ |
| `estructuras-de-datos` | Lección teórica — T2 | `content/cursos/estructuras-de-datos/diseno-con-tad-y-orientacion-a-objetos.mdx` | ✅ |
| `estructuras-de-datos` | Registro TS (T1, T2) | `lib/courses/data/estructuras-de-datos.ts` (`order: 11`, `order: 12`) | ✅ |

> Sin apuntes de clase ni guía de laboratorio nuevos: T1 y T2 son sesiones
> teóricas puras, sin código en vivo ni sesión práctica propia. El
> laboratorio de la semana (viernes) ya existía antes de esta ronda.

## Evaluaciones creadas

### Cuestionarios de cierre

| Lección | IDs de preguntas | Publicadas | Montadas (verificado con `list_lesson_questions`) |
|---|---|---|---|
| `composicion-agregacion-y-diagramas-de-paquetes` | **Pendiente** — servidor no disponible en esta ronda | ⬜ | ⬜ |
| `diseno-con-tad-y-orientacion-a-objetos` | **Pendiente** — servidor no disponible en esta ronda | ⬜ | ⬜ |

### Quiz calificable A/B/C

No aplica — ninguna de las dos sesiones preparadas está marcada `★` (el ★ M1
de la semana lo cierra el laboratorio del viernes, ya con su propia rúbrica
de codificación, preparado fuera de esta ronda).

## Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- **Recorte de alcance de T1 y cambio de título/topics de `order: 11`**
  (aprobado explícitamente por el usuario antes de delegar): el stub
  preexistente de la entrada `order: 11` incluía el topic "Diagramas de
  paquetes" en su `title`/`topics`, pero ese contenido corresponde a T2 según
  el cronograma. Se cambió el `title` de "Composición, agregación y
  diagramas de paquetes" a **"Asociación, agregación y composición"**, se
  quitó el topic de paquetes de `order: 11` y se agregó a `order: 12`
  ("Diagramas de paquetes: organización de clases en Java"). **Motivo:**
  evitar sobrecargar T1 con contenido que no le corresponde y dejarle a T2 su
  propio material, según propuso `@lesson-designer` y aprobó el usuario.
- **`summary` vacío en el frontmatter de T1 corregido a mano** tras F4: el
  `@lesson-writer` completó el `summary` en el registro TS pero dejó
  `summary: ""` en el frontmatter del `.mdx` — mismo tipo de hallazgo que
  `@reviewer` marcó la semana pasada (semana-03). Se copió el mismo texto del
  TS al frontmatter.
- **Cierres de `subgraph` corregidos de `End` a `end` en el diagrama Mermaid
  `flowchart` de T2** tras F4: Mermaid exige el keyword en minúscula; con
  mayúscula el diagrama no habría renderizado. El propio `@lesson-writer`
  reportó haber hecho ese cambio pero lo aplicó con mayúscula por error.

## Verificación

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 8 advertencias preexistentes sin relación)
- [x] `npx tsc --noEmit` en verde
- [x] Checklist de `lesson-authoring` §8 recorrido: sin `# H1`, sin `###`, sin
  placeholders, `updatedAt` de hoy en ambas, `title`/`summary`/`topics` de TS
  coherentes con el `.mdx`
- [x] Coherencia cruzada: T1 instala las notaciones UML (`-->`, `o--`, `*--`,
  multiplicidades, roles) que el lab M1 del viernes ya exige leer; T2 retoma
  esa misma relación de composición y la traduce a Java, y cierra con
  paquetes/carpetas que el lab también asume instalados
- [ ] `@reviewer`: pendiente (F6, aún no invocado)

## Despliegue y apertura

- **Merge a `development`:** pendiente
- **Deploy a producción:** pendiente
- **Lecciones abiertas:** pendiente (fase F7, requiere confirmación explícita)
- [ ] Verificado que las lecciones de semanas futuras siguen cerradas

## Pendientes para la semana siguiente

- Crear los cuestionarios de cierre de T1 y T2 con `@assessment-builder`
  (`question-bank-mcp`) en cuanto el túnel SSH a `mirp-lab` y `npm run dev`
  estén disponibles — el usuario indicó que los levanta él mismo.
- Invocar `@reviewer` sobre el diff contra `development` (F6) antes de
  solicitar el merge.
