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
| `estructuras-de-datos` | T2 (27 ago) | Diseño con TAD y orientación a objetos — laboratorio guiado en clase sobre el Sistema Bancario | — |
| `estructuras-de-datos` | P (28 ago) | Lab evaluativo M1 — ya escrito y desplegado, no tocado en esta ronda | **★ M1** |

## Artefactos producidos

| Curso | Artefacto | Ruta | Publicado |
|---|---|---|---|
| `estructuras-de-datos` | Lección teórica — T1 | `content/cursos/estructuras-de-datos/asociacion-agregacion-y-composicion.mdx` | ✅ |
| `estructuras-de-datos` | Laboratorio guiado en clase — T2 | `content/cursos/estructuras-de-datos/diseno-con-tad-y-orientacion-a-objetos.mdx` | ✅ |
| `estructuras-de-datos` | Registro TS (T1, T2) | `lib/courses/data/estructuras-de-datos.ts` (`order: 11`, `order: 12`) | ✅ |

> Sin guía de laboratorio nueva en `guias/`: T1 es una sesión teórica y T2 se
> reconvirtió en laboratorio guiado publicado como lección (ver "Refactor de
> arquitectura y reconversión de T2"), con su paso a paso de código dentro de
> la propia lección. El apunte docente
> `apuntes/lab-m1-diseno-oo-completo.md` se recortó en esa reconversión. El
> laboratorio evaluativo de la semana (viernes) ya existía antes de esta
> ronda.

## Evaluaciones creadas

### Cuestionarios de cierre

| Lección | IDs de preguntas | Publicadas | Montadas (verificado con `list_lesson_questions`) |
|---|---|---|---|
| `asociacion-agregacion-y-composicion` | `817516a4-f95f-4d9b-b78a-3417b4553318`, `c4ebd71c-cb88-4267-9b37-00d86bf2b132`, `2280e46c-6bdb-42a5-a3e1-93650e11bd25`, `1e108051-46c5-4d1a-8c11-5621324572d7`, `4afe3975-3c3c-44b4-a220-4d0717cdd06e` | ✅ (5/5) | ✅ (5/5, orden 0–4) |
| `diseno-con-tad-y-orientacion-a-objetos` | — | **No aplica** | **No aplica** |

> **T1:** creadas, publicadas y montadas el 2026-08-21 en el entorno de
> **desarrollo**, con el contenido aprobado por el usuario. Verificado con
> `list_questions` filtrando por lección. **Falta replicarlas a producción**
> antes o durante F7, como se hizo en la Semana 3.
>
> **T2 no lleva cuestionario de cierre** — decisión explícita del usuario.
> Las 5 preguntas que se habían redactado como borrador se eliminaron del
> banco y se verificó su borrado (404). La keyword `paquetes-java` quedó en
> el catálogo compartido, que es vocabulario reutilizable.

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
  multiplicidades) que el lab M1 del viernes ya exige leer, con
  `Equipo`/`Jugador` como composición pura, alineado con el lab; T2 es el
  **ejemplo trabajado** de ese mismo lab sobre el Sistema Bancario (UML →
  TAD → clase abstracta → subtipos polimórficos → composición
  `Cliente`/`Cuenta` → `PruebaCreacionObjetos`), arranca con el diagrama de
  paquetes de las tres capas que el lab también asume instaladas, retoma la
  composición `Cliente`/`Cuenta` precisando que la define la propiedad
  exclusiva y no quién ejecuta el `new`, y cierra con una tabla de
  correspondencia paso a paso con lo que el lab le pide al estudiante
- [x] `@reviewer`: 1.ª pasada CAMBIOS REQUERIDOS (referencias rotas + menores,
  corregidos) · 2.ª pasada CAMBIOS REQUERIDOS (bloqueante conceptual T1/T2 +
  riesgo operativo, corregidos) · 3.ª pasada CAMBIOS REQUERIDOS (residuo
  `*--` + menores, corregidos) · 4.ª pasada **✅ APROBADO** · **5.ª pasada
  pendiente** tras ajustes de contenido pedidos por el usuario (ver abajo)

## Ajustes de contenido pedidos por el usuario (post-aprobación, 2026-08-21)

> El usuario pidió estos cambios **después** de que `@reviewer` aprobara en
> su 4.ª pasada, antes de dar la aprobación de merge. Requieren una 5.ª
> pasada de `@reviewer` antes de proceder.

- **Ejemplo de agregación de T1 cambiado dos veces**, a pedido del usuario:
  primero de `Banco`/`Cliente` a `Universidad`/`Profesor` (para no usar la
  entidad `Banco`), y luego a **`Sucursal`/`Cliente`** (para mantener el
  ejemplo dentro del dominio del Sistema Bancario, coherente con el resto
  del curso, sin usar `Banco` directamente). Actualizada la situación,
  código, diagrama, tabla resumen y síntesis.
- **Sección de multiplicidades cambiada de dominio**: de `Equipo`/`Jugador`
  (fútbol) a `Cuenta "1" *-- "0..*" Movimiento` (bancario), a pedido del
  usuario para mantener todo el ejemplo concreto dentro del Sistema
  Bancario. Se quitó la referencia colgante a `Equipo`/`Jugador` que quedó
  en la síntesis tras el cambio.
- **Sección "Roles y navegación" eliminada por completo**, a pedido
  explícito del usuario — junto con su fila en la tabla resumen y su bullet
  en la síntesis (ajustado el conteo final de "cinco piezas" a "cuatro
  piezas"). **Se detectó y confirmó con el usuario** que el caso 5 (Liga de
  Fútbol) del laboratorio M1 ya desplegado dependía exactamente de esta
  notación (`Partido --> Equipo : equipoLocal/equipoVisitante`). Con
  aprobación explícita del usuario ("Elimina y ajusta lab M1"), se modificó
  `guias/lab-m1-diseno-oo-completo.md`: el diagrama del caso 5 ahora usa una
  relación genérica sin roles nombrados (`Partido "1" --> "2" Equipo`), y la
  distinción local/visitante se explica en la prosa de "Requisitos de
  implementación" en vez de en la notación del diagrama.
- **Referencias colgantes a "roles" corregidas** en el `summary` del
  frontmatter de T1 y en el `summary`/`topics` de su entrada TS (`order:
  11`), que todavía mencionaban roles nombrados tras quitar la sección.

## Refactor de arquitectura y reconversión de T2 (2026-08-21, posterior)

> Dos decisiones de fondo del docente, tomadas después de cerrar el material
> de la semana. Ver el commit `113786a` y siguientes.

- **Arquitectura simplificada de cuatro capas a tres** (`View → Service →
  Model`; desaparece `controller/`). Aplicada retroactivamente a 20 archivos
  del curso: microdiseño (autorizado expresamente pese a ser entrada del
  flujo), guías publicadas, lecciones, apuntes, los 6 casos de proyecto y
  las instrucciones a agentes/skills. Sin avisos de transición al estudiante
  — el docente lo anuncia en clase.
- **T2 reconvertida de lección teórica a laboratorio práctico guiado en
  clase**, publicado, sobre el Sistema Bancario. Sirve de ejemplo trabajado
  para el laboratorio evaluativo M1 del viernes 28: implementa exactamente
  lo que M1 le pide al estudiante (UML → TAD → clase abstracta → subtipos
  polimórficos → composición → `PruebaCreacionObjetos`), y cierra con una
  tabla de correspondencia paso a paso. **Slug conservado** para no dejar
  huérfana la fila de `disabled_lessons`.
- **`apuntes/lab-m1-diseno-oo-completo.md` recortado, no eliminado**: los
  pasos 1-7 pasaron a la lección publicada; el apunte conserva solo lo que
  no entra ahí (capas `service`/`view` completas, revisión entre pares y las
  5 preguntas socráticas). De 612 a 257 líneas, sin pérdida de contenido.
- **Matiz de composición agregado a T2**: `Cliente.agregarCuenta()` recibe
  una `Cuenta` ya construida, lo que por la regla de T1 se leería como
  agregación. T2 explica ahora que lo que define la composición es la
  propiedad exclusiva y el ciclo de vida, no quién ejecuta el `new`. Sin
  esto, la lección contradecía la pregunta 5 del cuestionario de T1, **ya
  publicada y montada**.

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

---

## Ronda — `programacion-cientifica` (2026-08-25)

**Rama:** `feat/semana-04-programacion-cientifica` (mergeada a `development` y borrada)
**Estado:** ✅ Mergeada a `development` — pendiente despliegue a producción

> Ronda independiente de la de `estructuras-de-datos` de arriba, en el mismo
> archivo por compartir semana calendario. No se tocó ninguna sesión de
> `estructuras-de-datos` ni `analisis-de-algoritmos`.

**Alcance confirmado por el usuario:** Semana 4 del cronograma de
`programacion-cientifica` (jueves 27 de agosto de 2026) — una sola sesión.
Durante E0 el usuario cambió la estructura del curso: originalmente la
Semana 4 era el Momento evaluativo 1 sin tema nuevo y "Estructuras de datos
nativas" estaba en la Semana 5; se intercambiaron (ver "Reordenamiento del
cronograma" abajo). El Momento evaluativo 1 (ahora Semana 5) queda **fuera
de esta ronda** — no se preparó taller ni rúbrica para esa sesión.

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Única sesión semanal | jue. 27 ago | Estructuras de datos nativas | — |

### Reordenamiento del cronograma (previo a E1, a pedido del usuario)

- `microdiseno/cronograma-dia-a-dia.md` y `microdiseno/info.md` actualizados:
  Semana 4 pasa de "Momento evaluativo 1" (sin tema) a **"Estructuras de
  datos nativas"**; Semana 5 pasa de "Estructuras de datos nativas" a
  **"Momento evaluativo 1"**, ampliado para incluir variables/tipos,
  condicionales/bucles **y** estructuras de datos nativas.
- **Momento evaluativo 2** (Semana 8) redefinido de "Estructuras de datos +
  POO" a **solo "POO"**, ya que estructuras de datos queda evaluada en el
  Momento 1 — confirmado explícitamente con el usuario.
- Excepción documentada a la regla general de no tocar `microdiseno/`: aquí
  el cambio lo pidió el usuario explícitamente, no fue una decisión de
  Claude ni un efecto secundario del flujo.

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | Aprobado sin ajustes | ✅ |
| E3 · Lección `.mdx` + registro TS | `estructuras-de-datos-nativas` (`order: 4`) — aprobado sin ajustes | ✅ |
| E4 · Apuntes del docente | Sí, pedidos — aprobados sin ajustes | ✅ |
| E5 · Cuestionario de cierre | Propuestas 7 preguntas → aprobadas 7 (con corrección de `&gt;`/`&lt;` a `>`/`<` literales en P5 y P7) | ✅ |
| E6 · Guía del estudiante | No aplica — sesión confirmada como demo en vivo del docente | ✅ |
| E6 · Quiz A/B/C | No aplica — semana ya no es evaluativa (el ★ se movió a la Semana 5, fuera de esta ronda) | ✅ |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Lección teórica | `content/cursos/programacion-cientifica/estructuras-de-datos-nativas.mdx` | ✅ |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 4`, stub preexistente completado) | ✅ |
| Apunte de clase | `content/cursos/programacion-cientifica/apuntes/estructuras-de-datos-nativas.md` | Solo owner/admin |
| Guía del estudiante | No aplica (sesión en vivo) | — |

### Cuestionario de cierre

| Lección | Entorno | IDs de preguntas | Publicadas | Montadas (`list_lesson_questions`) |
|---|---|---|---|---|
| `estructuras-de-datos-nativas` | desarrollo | `6eaa462b-7967-4913-b8db-e8092c37db23`, `2900ee86-8e7b-4df2-9d85-8f8f6d73c4c5`, `9e7fc8f6-f932-408c-990e-1975ed714882`, `c8e00101-3c00-4619-8252-e30e9be2ffc0`, `318f9f3c-6434-4c77-8a1a-d897248a92ef`, `ea4f77e1-a084-4682-b139-0d3df9b50dad`, `898ffeeb-9139-4c96-874b-e131fabafd9d` | ✅ (7/7) | ✅ (7/7, orden 0–6) |
| `estructuras-de-datos-nativas` | **producción** | — | ⬜ | ⬜ |

Keywords nuevas creadas en el catálogo de desarrollo: `listas`, `tuplas`,
`diccionarios`, `conjuntos` (faltan replicarse en producción en D3, junto
con las preguntas).

### Quiz calificable A/B/C

No aplica — la Semana 4 ya no está marcada `★` tras el reordenamiento.

### Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió sin preguntar y el usuario debería poder revertir.

- Ninguna: el reordenamiento del cronograma, el tipo de sesión (demo en
  vivo), la producción de apuntes y el contenido exacto del cuestionario
  (incluida la corrección de `&gt;`/`&lt;`) se confirmaron explícitamente
  con el usuario en esta sesión antes de ejecutarse.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 8 advertencias preexistentes sin relación con esta ronda)
- [x] Checklist de `lesson-authoring` §8 recorrido: sin `# H1`/`###` sueltos, `updatedAt` de hoy, 5 diagramas Mermaid (etiquetas entre comillas, cierres `end` correctos), `$`/`{`/`<` siempre dentro de código o backticks, sin JSX no autorizado, apuntes sin entrada TS ni guía creada
- [x] `summary` presente en frontmatter **y** en registro TS
- [x] Coherencia cruzada: la lección retoma el gancho de `condicionales-y-bucles-lab` (listas paralelas de la ferretería), los apuntes siguen el mismo dominio y orden que la lección, y el cuestionario cubre las 4 estructuras + comprensión de listas con una pregunta de aplicación combinada (P7) alineada con el nuevo Momento evaluativo 1
- [x] `@reviewer` (1.ª pasada): CAMBIOS REQUERIDOS (2 🟠, varios 🟡/🔵) — corregidos:
  - 🟠 Afirmación falsa de que el taller de la Semana 3 usó `append` (no aparece
    en ningún artefacto previo del curso) — reformulada en la lección y en los
    apuntes para referenciar la sección "La lista a fondo" de esta misma
    lección, no el taller.
  - 🟠 `info.md` (Práctica de la Semana 6) seguía diciendo "la estructura de
    datos de ejemplo de la semana anterior", que tras el intercambio ya no
    apunta a la lección correcta — corregido a "Semana 4 (estructuras de datos
    nativas)" explícito.
  - 🟡 El gancho de apertura no coincidía con los valores reales del
    Ejercicio 10 de `condicionales-y-bucles-lab.md` y presentaba
    `"Llave inglesa"` como herramienta nueva cuando ya estaba en el taller —
    corregido en lección y apuntes: mismos 6 valores del taller
    (`["Martillo", "Taladro", "Sierra", "Destornillador", "Nivel", "Llave inglesa"]` /
    `[5, 0, 2, 8, 0, 1]`), con `"Alicate"` como la herramienta genuinamente
    nueva que llega.
  - Hallazgos 🟡/🔵 restantes (6 diagramas Mermaid, salida partida en dos
    bloques, referencia a "el taller" en vez de a la lección, valores de
    `precios` distintos entre secciones, sugerencias de traceback/tildes/orden
    de `set`) — **no corregidos en esta ronda**, a decisión explícita del
    usuario; quedan como deuda menor documentada aquí.
  - [x] `@reviewer` (2.ª pasada): CAMBIOS REQUERIDOS — 2 🟠 nuevos, ambos
    causados por el propio fix de la 1.ª pasada — corregidos:
    - El fix del gancho cambió las cantidades de Martillo/Destornillador/Taladro
      pero el remate del cierre (construcción de la lista de diccionarios en
      la lección y en los apuntes) seguía con las cantidades viejas
      (`12/30/4`) — sincronizadas a `5/8/0`, coherentes con el gancho.
    - Referencia obsoleta fuera del diff original en
      `microdiseno/labs/variables-tipos-de-datos-y-operadores-docente.md:334`
      ("Momento evaluativo 1 (Semana 4)") — actualizada a "(Semana 5)" +
      mención de estructuras de datos nativas, coherente con el reordenamiento.
  - [x] `@reviewer` (3.ª pasada): CAMBIOS REQUERIDOS — 2 🟠 nuevos, residuos
    de la misma reescritura del gancho que las pasadas 1 y 2 no alcanzaron a
    detectar (el hilo de números del inventario se corrigió tramo por tramo,
    arrastrando el desajuste al siguiente) — corregidos con un barrido
    completo de todos los números del hilo en ambos archivos:
    - Pregunta socrática de cierre de los apuntes citaba `append(8)` (valor
      anterior al fix del gancho) en vez de `append(15)`.
    - El ejemplo de diccionario de la sección "Acceder por nombre" (un solo
      producto "Taladro") seguía con `cantidad: 4`, mientras el gancho y el
      remate de la misma sección ya decían `0` para Taladro — sincronizado a
      `0` en lección y apuntes (mutación posterior a `3` sin cambios,
      sigue siendo una demostración válida de mutabilidad).
    - De paso, alineado el orden de productos del inventario de cierre entre
      lección y apuntes (Martillo → Taladro → Destornillador en ambos),
      hallazgo 🔵 de la misma pasada.
  - [x] `@reviewer` (4.ª pasada): **✅ APROBADO** — barrido exhaustivo confirmó
    que el hilo del inventario quedó completamente consistente entre lección
    y apuntes, sin más residuos. La deuda 🟡 previa de "precios distintos
    entre secciones" se reevaluó y se cierra: son subconjuntos del mismo
    catálogo, sin contradicción real.
  - Nota del reviewer, verificada por Claude tras el veredicto: ninguna de
    las 7 preguntas del cuestionario reclama ser "el inventario de la
    lección" (son ejemplos de código autocontenidos, algunos reutilizando
    nombres de la Sección 2 sin cantidades) — no requieren ajuste.

**Nota operativa:** el túnel SSH a `mirp-lab` (base de datos de desarrollo)
estaba caído al llegar a E5; se reconectó siguiendo el procedimiento de
`CLAUDE.md` — el stack de Supabase en `mirp-lab` ya estaba corriendo, solo
faltaba el túnel.

---

## Despliegue — `programacion-cientifica`

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ⬜ | |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-04` (compartida si coincide con el deploy de ED) |
| D3 · Banco de preguntas replicado a producción | ⬜ | keywords `listas`/`tuplas`/`diccionarios`/`conjuntos` + 7 preguntas |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `programacion-cientifica` → `estructuras-de-datos-nativas` |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas**

## Pendientes — `programacion-cientifica`

- Invocar `@reviewer` sobre el diff contra `development` (E9) antes de
  solicitar el merge.
- Replicar keywords y preguntas del cuestionario a producción (D3) cuando se
  autorice el despliegue.
