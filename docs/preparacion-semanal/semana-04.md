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
| `estructuras-de-datos` | Lección teórica — T1 | `content/cursos/estructuras-de-datos/asociacion-agregacion-y-composicion.mdx` | ✅ |
| `estructuras-de-datos` | Lección teórica — T2 | `content/cursos/estructuras-de-datos/diseno-con-tad-y-orientacion-a-objetos.mdx` | ✅ |
| `estructuras-de-datos` | Registro TS (T1, T2) | `lib/courses/data/estructuras-de-datos.ts` (`order: 11`, `order: 12`) | ✅ |

> Sin apuntes de clase ni guía de laboratorio nuevos: T1 y T2 son sesiones
> teóricas puras, sin código en vivo ni sesión práctica propia. El
> laboratorio de la semana (viernes) ya existía antes de esta ronda.

## Evaluaciones creadas

### Cuestionarios de cierre

| Lección | IDs de preguntas | Publicadas | Montadas (verificado con `list_lesson_questions`) |
|---|---|---|---|
| `asociacion-agregacion-y-composicion` | **Pendiente** — servidor no disponible en esta ronda | ⬜ | ⬜ |
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
- **Correcciones tras la primera pasada de `@reviewer` (CAMBIOS REQUERIDOS),
  aplicadas con aprobación del usuario:**
  - Referencia cruzada rota en T2 (`diseno-con-tad-y-orientacion-a-objetos.mdx`)
    al título viejo de T1, corregida al nuevo título.
  - Referencia rota en `guias/lab-m1-diseno-oo-completo.md` (Recursos): citaba
    el título viejo de T1; se actualizó a los dos títulos vigentes (T1 y T2),
    ya que ambos son prerrequisito real del laboratorio.
  - **Slug/archivo/id de T1 renombrado** de `composicion-agregacion-y-diagramas-de-paquetes`
    a `asociacion-agregacion-y-composicion`, alineado con el título ya
    aprobado — se hizo ahora porque es gratis (sin preguntas creadas ni
    lección abierta a estudiantes).
  - Topic sin respaldo de T2 reformulado: "Puente entre el diseño OO y la
    implementación de estructuras de datos" → "Del diagrama de clases al
    código Java por capas"; y el topic 2 ajustado de "Modelar el TAD de una
    estructura de datos..." a "Modelar un TAD de diseño OO..." para no
    prometer contenido de estructuras de datos que esta lección no cubre.
  - T1: se quitó el primer diagrama Mermaid genérico (`ClaseA`...`ClaseF`,
    redundante con la tabla de resumen), se corrigió "estas seis piezas" a
    "estas cinco piezas" en la síntesis (error aritmético), y se agregó el
    `<Callout>` de repositorio de referencia que sí llevan el resto de
    lecciones del curso.
  - **`lesson-authoring/SKILL.md` y `mermaid_guia_completa.md` corregidos**:
    ambos afirmaban que `end` en minúscula rompe el parser y que había que
    escribir `End`/`END` — es falso para el cierre de `subgraph`/bloques (que
    exige `end` en minúscula exacta) y solo aplica a un **nodo** llamado
    `end`. Esta documentación errónea fue la causa original del bug
    corregido en F4.
- **Correcciones tras la segunda pasada de `@reviewer` (CAMBIOS REQUERIDOS de
  nuevo), aplicadas con aprobación del usuario:**
  - **Bloqueante conceptual en T1:** la sección de agregación usaba
    `Equipo o-- Jugador`, contradiciendo al laboratorio M1 ya desplegado, que
    define ese mismo par como **composición** (`Equipo "1" *-- "1..*"
    Jugador`, "un Jugador no existe fuera de un Equipo"). Se cambió el
    ejemplo de agregación a `Banco o-- Cliente` (mismo dominio bancario, sin
    colisionar con el lab) y se dejó `Equipo`/`Jugador` exclusivamente como
    composición en la sección de multiplicidades, alineado con el lab.
  - **Mayor en T2:** `Banco "1" *-- "0..*" CuentaAhorros` estaba rotulado
    composición, pero el código (`agregarCuenta` recibe la cuenta ya
    construida) es el patrón de agregación según el propio criterio de T1.
    Se cambió la notación a `o--` y se ajustó la prosa (agregación: la
    cuenta podría trasladarse a otro banco en una fusión, sin dejar de
    existir).
  - Topic solapado de T2 reformulado de nuevo: "Del diagrama de clases al
    código Java por capas" (que duplicaba el topic 1) → "El Service programa
    contra la interfaz, no contra la implementación" (cubre la sección más
    valiosa de la lección, que no tenía topic propio).
  - Precisión adicional en `lesson-authoring/SKILL.md` y
    `mermaid_guia_completa.md`: la regla de `end` en minúscula aplica al
    cierre de `subgraph` en un `flowchart` (no a todo bloque — un `loop`/`alt`
    de `sequenceDiagram` sí acepta `End`); y la solución para un nodo llamado
    `end` depende de si es su *id* (hay que renombrarlo) o solo su *texto*
    visible (ahí sí bastan las comillas).
  - **Anotada nota histórica** en `semana-03.md` (sin modificar su contenido
    sustantivo) señalando el rename del slug de T1.
- **Riesgo operativo detectado, sin ejecutar (pendiente de servidor):** el
  renombrado del slug de T1 (`composicion-agregacion-y-diagramas-de-paquetes`
  → `asociacion-agregacion-y-composicion`) deja huérfana la fila de
  `disabled_lessons` que mantenía esa lección cerrada en producción (creada
  el 2026-08-17, ver `semana-03.md`). Si se despliega sin corregir esto, la
  lección se abriría a los estudiantes automáticamente al no tener fila con
  el slug nuevo — saltándose F7. **Antes o durante el despliegue** hay que,
  vía `courses-mcp-prod`: (a) crear la fila deshabilitada para
  `estructuras-de-datos/asociacion-agregacion-y-composicion`, y (b) eliminar
  la fila huérfana del slug viejo. Ver sección "Despliegue y apertura".

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
- [ ] `@reviewer`: 1.ª pasada CAMBIOS REQUERIDOS (referencias rotas + menores,
  corregidos) · 2.ª pasada CAMBIOS REQUERIDOS (bloqueante conceptual T1/T2 +
  riesgo operativo, corregidos) · 3.ª pasada pendiente de invocar

## Despliegue y apertura

- **Merge a `development`:** pendiente
- **Deploy a producción:** pendiente
- **Lecciones abiertas:** pendiente (fase F7, requiere confirmación explícita)
- [ ] **Compensación de `disabled_lessons` por el rename de slug** (ver
  "Riesgo operativo" arriba) — ejecutar vía `courses-mcp-prod` antes o junto
  con la apertura de F7, no dejarlo para después del deploy:
  - [ ] Crear fila deshabilitada para
    `estructuras-de-datos/asociacion-agregacion-y-composicion`
  - [ ] Eliminar la fila huérfana de
    `estructuras-de-datos/composicion-agregacion-y-diagramas-de-paquetes`
- [ ] Verificado que las lecciones de semanas futuras siguen cerradas

## Pendientes para la semana siguiente

- Crear los cuestionarios de cierre de T1 y T2 con `@assessment-builder`
  (`question-bank-mcp`) en cuanto el túnel SSH a `mirp-lab` y `npm run dev`
  estén disponibles — el usuario indicó que los levanta él mismo.
- Invocar `@reviewer` sobre el diff contra `development` (F6) antes de
  solicitar el merge.
