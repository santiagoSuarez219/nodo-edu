# Guía Completa de Mermaid.js

> Documentación de referencia sobre todos los tipos de diagramas soportados por Mermaid (v11.x), sus componentes de sintaxis y las opciones de diseño (theming, colores, formas, layout) que se pueden personalizar en cada uno.
>
> Fuente base: [mermaid.js.org](https://mermaid.js.org)

---

## Tabla de contenidos

1. [Fundamentos de Mermaid](#1-fundamentos-de-mermaid)
2. [Flowchart (Diagrama de flujo)](#2-flowchart-diagrama-de-flujo)
3. [Sequence Diagram (Diagrama de secuencia)](#3-sequence-diagram-diagrama-de-secuencia)
4. [Class Diagram (Diagrama de clases)](#4-class-diagram-diagrama-de-clases)
5. [State Diagram (Diagrama de estados)](#5-state-diagram-diagrama-de-estados)
6. [Entity Relationship Diagram (ER)](#6-entity-relationship-diagram-er)
7. [User Journey](#7-user-journey)
8. [Gantt](#8-gantt)
9. [Pie Chart](#9-pie-chart)
10. [Quadrant Chart](#10-quadrant-chart)
11. [Requirement Diagram](#11-requirement-diagram)
12. [GitGraph](#12-gitgraph)
13. [Mindmap](#13-mindmap)
14. [Timeline](#14-timeline)
15. [Sankey](#15-sankey)
16. [XY Chart](#16-xy-chart)
17. [Block Diagram](#17-block-diagram)
18. [Packet Diagram](#18-packet-diagram)
19. [Kanban](#19-kanban)
20. [Architecture](#20-architecture)
21. [Radar](#21-radar)
22. [Treemap](#22-treemap)
23. [Otros diagramas (C4, ZenUML, Swimlanes, y experimentales)](#23-otros-diagramas)
24. [Sistema de Temas (Theming) — guía global](#24-sistema-de-temas-theming--guía-global)
25. [Configuración global y despliegue](#25-configuración-global-y-despliegue)

---

## 1. Fundamentos de Mermaid

Mermaid es una herramienta de diagramación basada en JavaScript que renderiza definiciones de texto (sintaxis inspirada en Markdown) para crear diagramas SVG dinámicamente.

### 1.1 Estructura de toda definición

Toda definición de diagrama comienza con una **declaración del tipo de diagrama** (`flowchart`, `sequenceDiagram`, `classDiagram`, etc.), seguida del contenido. La única excepción es el bloque de **Frontmatter**.

```
---
title: Mi Diagrama
---
flowchart TD
    A --> B
```

### 1.2 Frontmatter (metadatos YAML)

Permite pasar configuración antes de la definición del diagrama. Debe abrirse y cerrarse con `---` como único contenido de la línea. Usa sintaxis YAML (sensible a mayúsculas, indentación consistente).

```yaml
---
title: Título del diagrama
config:
  theme: base
  themeVariables:
    primaryColor: "#00ff00"
  layout: elk
  look: handDrawn
---
```

### 1.3 Directivas

Reconfiguración limitada aplicada justo antes de renderizar, incluida junto a la definición dentro de `%%{ }%%`:

```
%%{init: {'theme':'forest'}}%%
flowchart LR
```

### 1.4 Comentarios

Cualquier línea que empiece con `%%` es ignorada por el parser. Deben ir en su propia línea. Evitar `{}` dentro de comentarios porque se confunde con una directiva.

```
%% Esto es un comentario
flowchart TD
    A --> B
```

### 1.5 Look & Layout (aplicable actualmente a flowchart y state diagram)

- **look**: `classic` (clásico) o `handDrawn` (estilo dibujado a mano).
- **layout**: `dagre` (por defecto) o `elk` (para diagramas grandes/complejos; requiere carga adicional).
  - Con `elk`: `mergeEdges: true|false`, `nodePlacementStrategy`: `SIMPLE`, `NETWORK_SIMPLEX`, `LINEAR_SEGMENTS`, `BRANDES_KOEPF` (por defecto).

```
---
config:
  layout: elk
  look: handDrawn
  theme: forest
---
flowchart LR
  A[Start] --> B{Elegir camino}
```

### 1.6 Palabras/símbolos que rompen la sintaxis

| Elemento | Problema | Solución |
|---|---|---|
| Cierre de `subgraph` en un `flowchart` escrito en mayúscula (`End`/`END`) | Rompe el parser — el cierre exige `end` exacto en minúscula | Escribir siempre `end` en minúscula |
| Un **nodo** con *id* `end` (en minúscula) | Se confunde con la palabra reservada de cierre | Renombrar el id del nodo |
| Un nodo cuyo *texto* visible es `end` (id distinto) | No rompe, pero puede confundir a quien lea el fuente | Encerrar el texto en comillas, ej. `B["end"]` |
| `o`/`x` como primera letra tras `---` | Se interpreta como edge circular/cruzado | Agregar espacio o usar mayúscula |
| `%%{ }%%` dentro de comentarios | Se confunde con directiva | Evitar llaves `{}` en comentarios |
| Caracteres especiales en texto | Rompen el parser | Encerrar en comillas `" "` |

---

## 2. Flowchart (Diagrama de flujo)

**Declaración:** `flowchart` (o el alias legado `graph`)

### 2.1 Componentes

- **Nodos (nodes):** unidades geométricas identificadas por un `id`. El texto mostrado puede diferir del id: `A[Texto del nodo]`.
- **Enlaces/Edges:** flechas o líneas que conectan nodos, con texto opcional.
- **Subgrafos (`subgraph ... end`):** agrupan nodos, pueden tener dirección e id propios.
- **Dirección del diagrama:** `TB`/`TD` (arriba-abajo), `BT` (abajo-arriba), `LR` (izq-der), `RL` (der-izq).

### 2.2 Formas de nodo (shapes)

**Formas clásicas:**

| Sintaxis | Forma |
|---|---|
| `A(Texto)` | Bordes redondeados |
| `A([Texto])` | Estadio (stadium) |
| `A[[Texto]]` | Subrutina |
| `A[(Texto)]` | Cilindro (base de datos) |
| `A((Texto))` | Círculo |
| `A>Texto]` | Asimétrico |
| `A{Texto}` | Rombo (decisión) |
| `A{{Texto}}` | Hexágono |
| `A[/Texto/]` | Paralelogramo |
| `A[\Texto\]` | Paralelogramo alterno |
| `A[/Texto\]` | Trapezoide |
| `A[\Texto/]` | Trapezoide alterno |
| `A(((Texto)))` | Círculo doble |

**Sintaxis unificada de formas (v11.3+):** `A@{ shape: nombre }` — soporta más de 30 formas nuevas (proceso, evento, terminal, base de datos, documento, nube, rayo, hourglass, bandera, triángulo, hexágono, etc.), agrupadas en categorías semánticas: proceso, decisión, entrada/salida, almacenamiento, documento, evento, conector, resumen, etiquetado, entre otras. Cada forma tiene un nombre semántico, un nombre corto y alias.

**Formas especiales:**
- `icon`: inserta un ícono de un paquete registrado. Parámetros: `icon`, `form` (`square`/`circle`/`rounded`), `label`, `pos` (`t`/`b`), `h`.
- `image`: inserta una imagen. Parámetros: `img` (URL), `label`, `pos`, `w`, `h`, `constraint` (`on`/`off` para mantener aspect ratio).

### 2.3 Tipos de enlaces (edges)

| Sintaxis | Tipo |
|---|---|
| `A --- B` | Línea abierta (sin flecha) |
| `A --> B` | Flecha |
| `A -- texto --> B` / `A -->|texto| B` | Flecha con texto |
| `A -.-> B` | Línea punteada |
| `A ==> B` | Línea gruesa |
| `A ~~~ B` | Enlace invisible |
| `A --o B` | Edge terminado en círculo |
| `A --x B` | Edge terminado en cruz |
| `A <--> B` | Flecha multidireccional |

**Longitud del enlace:** agregar guiones/puntos/signos igual extra (`----`, `-..-`, `====`) para forzar que un enlace abarque más "rangos" en el layout.

**IDs de edges y animación (v11.10+):** `A e1@--> B` asigna un id al edge; luego se puede animar con `e1@{ animate: true }` o abreviado con `e1@--> B` + `animation: fast|slow`. También se puede reconfigurar la curva del edge individualmente.

### 2.4 Aspectos de diseño personalizables

- **Estilo de línea/curva** (`curve`): `basis`, `bumpX`, `bumpY`, `cardinal`, `catmullRom`, `linear`, `monotoneX`, `monotoneY`, `natural`, `step`, `stepAfter`, `stepBefore` — a nivel de diagrama (`config.flowchart.curve`) o por edge individual (v11.10+).
- **Estilo de un nodo puntual:**
  ```
  style A fill:#f9f,stroke:#333,stroke-width:4px;
  ```
- **Estilo de un enlace puntual** (por índice de orden de aparición):
  ```
  linkStyle 3 stroke:#ff3,stroke-width:4px,color:red;
  linkStyle 1,2,7 color:blue;
  ```
- **Clases reutilizables (`classDef`):**
  ```
  classDef className fill:#f9f,stroke:#333,stroke-width:4px;
  class nodeId1,nodeId2 className;
  A:::className --> B
  ```
- **Clase por defecto:** una clase llamada `default` se aplica a todos los nodos sin clase asignada.
- **Iconos:** FontAwesome (`fa:fa-nombre`), con soporte de prefijos `fa`, `fab`, `fas`, `far`, `fal`, `fad`, `fak` (custom, de pago).
- **Texto en formato Markdown:** negrita `**texto**`, itálica `*texto*`, salto de línea automático (auto-wrap). Se puede desactivar con `config.markdownAutoWrap: false`.
- **Renderer/layout:** `dagre` (por defecto) o `elk` (experimental, mejor para diagramas grandes).
- **Ancho del diagrama:** configurable vía `mermaid.flowchartConfig` o CLI.
- **Interactividad:** `click nodeId callback/url "tooltip"`, con `_self`/`_blank`/`_parent`/`_top` como target (requiere `securityLevel: 'loose'`).

---

## 3. Sequence Diagram (Diagrama de secuencia)

**Declaración:** `sequenceDiagram`

### 3.1 Componentes

- **Actores/Participantes:** `participant Alice`, `actor Bob` (se dibuja como figura humana en vez de caja).
- **Mensajes/flechas:** `Alice->>Bob: Mensaje` (varios estilos de flecha: sólida, punteada, con/sin cabeza abierta).
- **Activaciones:** `activate`/`deactivate`, o el shorthand `+`/`-` al final del mensaje.
- **Notas:** `Note left of/right of/over Actor: texto`.
- **Bloques lógicos:** `loop`, `alt/else`, `opt`, `par/and`, `critical/option`, `break`, `rect` (fondo coloreado de una sección), todos cerrados con `end`.
- **Autonumeración:** `autonumber` numera los mensajes automáticamente.
- **Creación/destrucción de participantes:** `create participant X`, `destroy X`.
- **Fondos y agrupación:** `box Nombre ... end` agrupa varios participantes en un contenedor visual.

### 3.2 Aspectos de diseño personalizables (themeVariables específicos)

| Variable | Descripción |
|---|---|
| `actorBkg` | Color de fondo del actor |
| `actorBorder` | Color de borde del actor |
| `actorTextColor` | Color del texto del actor |
| `actorLineColor` | Color de la línea de vida del actor |
| `signalColor` | Color de las flechas de mensaje |
| `signalTextColor` | Color del texto de los mensajes |
| `labelBoxBkgColor` / `labelBoxBorderColor` | Color de fondo/borde de cajas de etiqueta (loops, alt, etc.) |
| `labelTextColor` | Color del texto de las etiquetas |
| `loopTextColor` | Color del texto dentro de bloques loop |
| `activationBkgColor` / `activationBorderColor` | Color de las barras de activación |
| `sequenceNumberColor` | Color de los números de autonumeración |

Además: ancho de mensajes (`config.sequence.width`), márgenes, altura de actores, si se muestra el número de secuencia (`showSequenceNumbers`), y el modo de "mirror actors" (mostrar actores repetidos al final del diagrama).

---

## 4. Class Diagram (Diagrama de clases)

**Declaración:** `classDiagram`

### 4.1 Componentes

- **Clases:** `class Animal`, con atributos y métodos: `Animal : +String name` / `Animal : +makeSound()`.
- **Visibilidad:** `+` público, `-` privado, `#` protegido, `~` paquete.
- **Relaciones:**

| Sintaxis | Relación |
|---|---|
| `<|--` | Herencia |
| `*--` | Composición |
| `o--` | Agregación |
| `-->` | Asociación |
| `--` | Enlace (sólido) |
| `..>` | Dependencia |
| `..\|>` | Realización |
| `..` | Enlace (punteado) |

- **Cardinalidad:** `"1" -- "many"`.
- **Anotaciones de clase:** `<<interface>>`, `<<abstract>>`, `<<service>>`, `<<enumeration>>`.
- **Namespaces:** agrupan clases relacionadas: `namespace NombreEspacio { class A class B }`.
- **Notas:** `note for ClassName "texto"`.
- **Genéricos:** `class Square~Shape~`.

### 4.2 Aspectos de diseño personalizables

- `classText` (color del texto dentro de las clases).
- `classDef` + `class` (igual que en flowchart) para colorear cajas de clase específicas.
- Dirección del diagrama (`direction TB/LR/BT/RL`).
- Soporta `look`/`style` heredado del tema base para bordes y fondo de las cajas de clase (`mainBkg`, `nodeBorder`, `nodeTextColor`).

---

## 5. State Diagram (Diagrama de estados)

**Declaración:** `stateDiagram` o `stateDiagram-v2`

### 5.1 Componentes

- **Estados:** declarados implícitamente al usar su nombre, o explícitamente `state "Texto largo" as s1`.
- **Estado inicial/final:** `[*] --> Estado` / `Estado --> [*]`.
- **Transiciones:** `Estado1 --> Estado2 : Evento/condición`.
- **Estados compuestos (anidados):** `state Estado { ... }`.
- **Elecciones (choice):** `state if_state <<choice>>`.
- **Fork/Join:** `state fork_state <<fork>>` / `<<join>>` para procesos paralelos/concurrentes.
- **Notas:** `note right of Estado : texto`.
- **Concurrencia:** separar transiciones simultáneas con `--`.

### 5.2 Aspectos de diseño personalizables

| Variable | Descripción |
|---|---|
| `labelColor` | Color de etiquetas |
| `altBackground` | Fondo de estados compuestos anidados |

- Soporta `look: handDrawn/classic` y `layout: dagre/elk` (igual que flowchart, ya que comparten motor de renderizado).
- `classDef`/`class` también aplicable a estados individuales.
- Dirección configurable (`direction TB/LR`).

---

## 6. Entity Relationship Diagram (ER)

**Declaración:** `erDiagram`

### 6.1 Componentes

- **Entidades:** `CLIENTE`, `PEDIDO`, etc.
- **Atributos:** dentro de bloques `{ }`, con tipo, nombre, y claves opcionales (`PK`, `FK`, `UK`) y comentarios:
  ```
  CLIENTE {
      string nombre
      string id PK
      string email UK
  }
  ```
- **Relaciones y cardinalidad:**

| Símbolo izquierdo | Cardinalidad |
|---|---|
| `\|o` | Cero o uno |
| `\|\|` | Exactamente uno |
| `}o` | Cero o muchos |
| `}\|` | Uno o muchos |

  Ejemplo: `CLIENTE ||--o{ PEDIDO : realiza`
- **Tipo de línea:** `--` identificante (sólida), `..` no identificante (punteada).
- **Etiqueta de relación:** texto después de `:`.

### 6.2 Aspectos de diseño personalizables

- Colores heredados del tema base (`mainBkg`, `nodeBorder`, `nodeTextColor` para las cajas de entidad).
- `classDef`/`class` para estilizar entidades específicas.
- Marcado como "❗ experimental" en la documentación oficial — su set de opciones de estilo es más limitado que flowchart.

---

## 7. User Journey

**Declaración:** `journey`

### 7.1 Componentes

- **Título:** `title Mi experiencia de compra`.
- **Secciones:** `section Nombre de sección`.
- **Tareas y puntuación de satisfacción (1-5):** `Tarea: 5: Actor1, Actor2`.

```
journey
    title Mi día
    section Trabajo
      Hacer café: 5: Yo
      Reunión: 3: Yo, Equipo
    section Casa
      Cocinar: 4: Yo
```

### 7.2 Aspectos de diseño personalizables

| Variable | Descripción |
|---|---|
| `fillType0` – `fillType7` | Colores rotativos de fondo por sección (hasta 8 colores distintos) |

---

## 8. Gantt

**Declaración:** `gantt`

### 8.1 Componentes

- **Formato de fecha de entrada/salida:** `dateFormat YYYY-MM-DD`, `axisFormat %d/%m`.
- **Título:** `title Nombre del proyecto`.
- **Secciones:** `section Nombre`.
- **Tareas:**
  ```
  Nombre de tarea :id, estado, fecha_inicio, duración
  ```
  - **Estados:** `done`, `active`, `crit` (crítico), o ninguno (por defecto/pendiente).
  - **Dependencias:** `after id_tarea` en lugar de una fecha fija.
  - **Hitos (milestones):** `Hito :milestone, id, fecha, 0d`.
- **Exclusiones:** `excludes weekends`, `excludes 2024-01-01` (para no contar días festivos/fines de semana).
- **Ticks del eje:** `tickInterval 1week`.

### 8.2 Aspectos de diseño personalizables

- Colores por **estado de tarea** (usualmente vía CSS/theme: tareas `done`, `active`, `crit` y por defecto tienen colores distintos derivados del tema — variables internas como `taskBkgColor`, `taskTextColor`, `activeTaskBkgColor`, `critBkgColor`, `doneTaskBkgColor`, `gridColor`, `todayLineColor`, entre otras del esquema de configuración de Gantt).
- `numberSectionStyles`: cuántos estilos de color distintos rotan entre secciones.
- Formato del eje de tiempo (`axisFormat`), altura de barra, padding entre tareas — configurables vía `config.gantt`.
- Línea de "hoy" (`todayMarker`), se puede desactivar con `todayMarker off`.

---

## 9. Pie Chart

**Declaración:** `pie` (con `showData` opcional para mostrar los valores numéricos)

### 9.1 Componentes

```
pie showData
    title Distribución
    "Categoría A" : 42.5
    "Categoría B" : 30.1
    "Categoría C" : 27.4
```

### 9.2 Aspectos de diseño personalizables

| Variable | Descripción |
|---|---|
| `pie1` – `pie12` | Colores de relleno de cada sección (hasta 12 rotativos) |
| `pieTitleTextSize` / `pieTitleTextColor` | Tamaño/color del título |
| `pieSectionTextSize` / `pieSectionTextColor` | Tamaño/color de etiquetas de sección |
| `pieLegendTextSize` / `pieLegendTextColor` | Tamaño/color de la leyenda |
| `pieStrokeColor` / `pieStrokeWidth` | Borde de cada sección |
| `pieOuterStrokeWidth` / `pieOuterStrokeColor` | Borde del círculo externo |
| `pieOpacity` | Opacidad de las secciones (por defecto 0.7) |

---

## 10. Quadrant Chart

**Declaración:** `quadrantChart`

### 10.1 Componentes

- **Título:** `title Análisis`.
- **Ejes:** `x-axis Bajo --> Alto`, `y-axis Bajo --> Alto`.
- **Nombres de cuadrantes:** `quadrant-1 Nombre`, `quadrant-2 Nombre`, `quadrant-3 Nombre`, `quadrant-4 Nombre`.
- **Puntos:** `Punto A: [0.3, 0.6]` (coordenadas normalizadas entre 0 y 1).

### 10.2 Aspectos de diseño personalizables

- Colores de cada cuadrante (fondo alterno), color y tamaño del texto de ejes, color/tamaño/forma de los puntos — configurables vía `config.quadrantChart` (p. ej. `quadrant1Fill`, `quadrant2Fill`, `pointRadius`, `pointTextPadding`, etc.).
- Etiquetas de puntos pueden personalizarse con `radius`, `color`, `stroke-color`, `stroke-width` por punto individual:
  ```
  Punto A: [0.3, 0.6] radius: 12, color: #ff0000
  ```

---

## 11. Requirement Diagram

**Declaración:** `requirementDiagram`

### 11.1 Componentes

- **Requisitos:**
  ```
  requirement req_nombre {
      id: 1
      text: descripción
      risk: high
      verifymethod: test
  }
  ```
  - Tipos: `requirement`, `functionalRequirement`, `interfaceRequirement`, `performanceRequirement`, `physicalRequirement`, `designConstraint`.
- **Elementos:** `element nombre_elemento { type: simulation }`.
- **Relaciones:** `satisfies`, `derives`, `contains`, `copies`, `refines`, `traces`, con dirección `-` o flecha.
  ```
  elemento - satisfies -> req_nombre
  ```

### 11.2 Aspectos de diseño personalizables

- Color de fondo/borde de cajas de requisito y elemento heredados del tema base.
- `classDef`/`class` aplicable a nodos de requisitos.

---

## 12. GitGraph

**Declaración:** `gitGraph`

### 12.1 Componentes

- **Commits:** `commit`, `commit id: "texto"`, `commit tag: "v1.0"`.
- **Ramas:** `branch nombre_rama`, `checkout nombre_rama`.
- **Merge:** `merge nombre_rama`.
- **Cherry-pick:** `cherry-pick id: "hash_commit"`.
- **Orden/orientación:** `gitGraph LR:` (horizontal) o `gitGraph TB:` (vertical).

### 12.2 Aspectos de diseño personalizables

- Colores de rama rotativos (`git0`–`git7` en la paleta de tema), color de línea de commit (`commitLabelColor`, `commitLabelBackground`), tipo de conexión de merge, y `mainBranchName`/`showCommitLabel`/`showBranches` vía `config.gitGraph`.

---

## 13. Mindmap

**Declaración:** `mindmap`

### 13.1 Componentes

- **Jerarquía por indentación:** cada nivel de indentación crea un nodo hijo.
- **Formas de nodo:** iguales convenciones que flowchart: `id(texto)` redondeado, `id((texto))` círculo, `id))texto((` nube, `id{{texto}}` hexágono, `id[texto]` cuadrado.
- **Iconos:** `::icon(fa fa-nombre)`.
- **Clases:** `:::claseCSS`.

```
mindmap
  root((Proyecto))
    Investigación
      Encuestas
      Entrevistas
    Desarrollo
      Frontend
      Backend
```

### 13.2 Aspectos de diseño personalizables

- Colores por nivel de profundidad (rotativos, derivados de la paleta del tema).
- Texto Markdown compatible (negrita/itálica, auto-wrap), igual que flowchart.
- `classDef` para colorear ramas específicas.

---

## 14. Timeline

**Declaración:** `timeline`

### 14.1 Componentes

```
timeline
    title Historia del proyecto
    2023 : Inicio del proyecto : Investigación inicial
    2024 : Lanzamiento beta
    2025 : Versión 1.0 : Expansión internacional
```

- **Secciones opcionales:** `section Nombre` para agrupar períodos.
- Múltiples eventos por período separados por `:`.

### 14.2 Aspectos de diseño personalizables

- Colores rotativos por sección (similares a `fillType` de user journey), color y tamaño de texto de título/período/evento vía `themeVariables` y `config.timeline`.
- Disposición: alternancia automática de eventos arriba/abajo de la línea temporal.

---

## 15. Sankey

**Declaración:** `sankey-beta`

### 15.1 Componentes

Formato CSV-like: `origen,destino,valor`

```
sankey-beta
Energía Solar,Electricidad,50
Electricidad,Hogares,30
Electricidad,Industria,20
```

### 15.2 Aspectos de diseño personalizables

- `config.sankey`: `width`, `height`, `linkColor` (`source`, `target`, `gradient`, o un color fijo), `nodeAlignment` (`left`, `right`, `center`, `justify`), `useMaxWidth`.
- Colores de nodos heredados de la paleta del tema (rotativos).

---

## 16. XY Chart

**Declaración:** `xychart-beta`

### 16.1 Componentes

```
xychart-beta
    title "Ventas mensuales"
    x-axis [ene, feb, mar, abr]
    y-axis "Ingresos (COP)" 0 --> 10000
    bar [5000, 6000, 7500, 8200]
    line [4800, 6200, 7000, 8000]
```

- Soporta gráfico de **barras** (`bar`) y **líneas** (`line`), combinables en el mismo gráfico.
- Eje X categórico o numérico; eje Y con rango explícito.

### 16.2 Aspectos de diseño personalizables

- `config.xyChart`: color de fondo del gráfico (`backgroundColor`), colores de series de barras/líneas (`plotColorPalette`), estilo y color de eje y grillas (`xAxisLabelColor`, `xAxisTitleColor`, `xAxisTickColor`, `xAxisLineColor`, equivalentes para `yAxis`), tamaño de fuente, orientación del gráfico (`chartOrientation: vertical/horizontal`).

---

## 17. Block Diagram

**Declaración:** `block-beta`

### 17.1 Componentes

- **Bloques:** definidos en una cuadrícula, con control de `columns`.
- **Fusión de bloques (span):** `block:group:3` para que un bloque ocupe varias columnas.
- **Formas:** admite las mismas formas que flowchart (rombo, círculo, etc.).
- **Flechas entre bloques:** igual sintaxis que flowchart (`-->`).
- **Bloques anidados/compuestos:** `block:idGrupo ... end`.

### 17.2 Aspectos de diseño personalizables

- `style`/`classDef` igual que en flowchart, aplicado a bloques individuales o grupos.
- Colores heredados del tema base para relleno y bordes.

---

## 18. Packet Diagram

**Declaración:** `packet-beta`

### 18.1 Componentes

Describe el diseño de paquetes de datos/protocolos byte a byte:

```
packet-beta
title Paquete TCP
0-15: "Puerto origen"
16-31: "Puerto destino"
32-63: "Número de secuencia"
```

Cada línea define un rango de bits/bytes y su etiqueta.

### 18.2 Aspectos de diseño personalizables

- `config.packet`: `rowHeight`, `bitWidth`, `bitsPerRow`, `showBits`, colores de fondo/borde de cada campo heredados del tema.

---

## 19. Kanban

**Declaración:** `kanban`

### 19.1 Componentes

```
kanban
  Por hacer
    tarea1[Diseñar interfaz]
    tarea2[Definir alcance]
  En progreso
    tarea3[Desarrollar API]
  Hecho
    tarea4[Configurar repo]
```

- **Columnas:** definidas por indentación de primer nivel.
- **Tarjetas:** por indentación de segundo nivel, con id opcional.
- **Metadatos por tarjeta** (v11.3+): `@{ assigned: 'Persona', ticket: 'ID-123', priority: 'Very High' }`.

### 19.2 Aspectos de diseño personalizables

- Color por prioridad de tarjeta (`priority: Very High/High/Low/Very Low` mapea a colores predefinidos).
- `classDef`/`class` aplicable a tarjetas.
- Ancho de columna y espaciados vía `config.kanban`.

---

## 20. Architecture

**Declaración:** `architecture-beta`

### 20.1 Componentes

- **Grupos (agrupaciones/regiones, p. ej. nubes o VPCs):** `group nombre(icono)[Etiqueta]`.
- **Servicios (nodos):** `service nombre(icono)[Etiqueta] in grupo`.
- **Conexiones (edges) con puertos direccionales:** `servicioA:R -- L:servicioB` (R=derecha, L=izquierda, T=arriba, B=abajo).
- **Bases de datos y otros íconos:** usa el sistema de íconos registrados (por ejemplo `logos:aws-lambda`, `logos:mysql`, etc., vía paquetes de íconos como Iconify).

### 20.2 Aspectos de diseño personalizables

- Colores de grupo/servicio heredados del tema base.
- Íconos personalizables mediante registro de packs de íconos (`config.icons`, igual mecanismo que en flowchart).

---

## 21. Radar

**Declaración:** `radar-beta`

### 21.1 Componentes

```
radar-beta
  title Evaluación de habilidades
  axis Comunicación, Liderazgo, Técnico, Creatividad
  curve Persona1{80, 70, 90, 60}
  curve Persona2{60, 85, 70, 75}
```

- **Ejes:** lista de categorías evaluadas.
- **Curvas:** una por serie de datos, con valores numéricos por eje.

### 21.2 Aspectos de diseño personalizables

- `config.radar`: color y grosor de línea por curva, opacidad de relleno, colores de la grilla y de los ejes, escala mínima/máxima, número de anillos de la grilla (`ticks`).

---

## 22. Treemap

**Declaración:** `treemap-beta`

### 22.1 Componentes

Jerarquía por indentación, similar a mindmap, con valores numéricos que determinan el tamaño del rectángulo:

```
treemap-beta
"Presupuesto"
    "Marketing": 30
    "Desarrollo": 50
    "Operaciones": 20
```

### 22.2 Aspectos de diseño personalizables

- Colores rotativos por rama/categoría (paleta del tema), tamaño de fuente de etiquetas, `config.treemap` para `padding`, `valueFormat`, `showValues`.

---

## 23. Otros diagramas

Estos diagramas están documentados oficialmente pero son más recientes, experimentales (marcados 🔥) o de alcance limitado. Comparten en general el mismo mecanismo de `classDef`/`style`/`themeVariables` que los diagramas principales:

| Diagrama | Declaración | Notas |
|---|---|---|
| **C4 Diagram** | `C4Context`, `C4Container`, `C4Component`, `C4Dynamic` | Marcado ⚠️ como no completamente soportado en todas las funciones; modela arquitecturas de software (Contexto, Contenedores, Componentes, Dinámico) al estilo del modelo C4. |
| **ZenUML** | `zenuml` | Sintaxis alternativa para diagramas de secuencia, con estilo más cercano a código. |
| **Swimlanes Diagram** | `swimlane` (extensión de flujo) | Organiza pasos de un proceso en "carriles" (lanes) por responsable/rol. |
| **Event Modeling** | `eventmodeling` | Modela sistemas basados en eventos (comandos, eventos, vistas). |
| **Venn** | `venn` | Diagramas de conjuntos con áreas superpuestas. |
| **Ishikawa (espina de pescado)** | `ishikawa` | Diagrama de causa-efecto. |
| **Wardley Map** | `wardley` | Mapea la evolución de componentes de una cadena de valor. |
| **Cynefin** | `cynefin` | Marco de toma de decisiones (simple, complicado, complejo, caótico). |
| **TreeView** | `treeView` | Vista de árbol jerárquico tipo explorador de archivos. |

Para la sintaxis detallada de estos (aún en evolución), conviene revisar la página oficial correspondiente en `https://mermaid.js.org/syntax/<nombre>.html`, ya que cambian con frecuencia entre versiones.

---

## 24. Sistema de Temas (Theming) — guía global

Introducido desde Mermaid v8.7.0. Permite personalizar la apariencia **a nivel de sitio completo** (con `mermaid.initialize()`) o **por diagrama individual** (con frontmatter).

### 24.1 Temas disponibles

| Tema | Uso recomendado |
|---|---|
| `default` | Tema por defecto para todos los diagramas |
| `neutral` | Ideal para documentos en blanco y negro / impresión |
| `dark` | Para modo oscuro (combinar con `darkMode: true` en la config para ajustar el fondo) |
| `forest` | Tonos de verde |
| `base` | **Único tema modificable** — punto de partida para crear temas personalizados |

> ⚠️ Solo el tema `base` admite personalización real a través de `themeVariables`. Los demás temas son fijos.

### 24.2 Aplicar un tema por sitio completo

```javascript
mermaid.initialize({
  securityLevel: 'loose',
  theme: 'base',
});
```

### 24.3 Aplicar un tema por diagrama (frontmatter)

```
---
config:
  theme: forest
---
flowchart LR
```

### 24.4 Personalizar colores con `themeVariables`

```
---
config:
  theme: base
  themeVariables:
    primaryColor: "#00ff00"
    primaryTextColor: "#000000"
    lineColor: "#ff6600"
---
flowchart LR
    A --> B
```

> El motor de temas **solo reconoce colores en formato hexadecimal** (`#ff0000`), no nombres de color como `red`.

### 24.5 Variables de tema globales (aplican a todos los diagramas)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `darkMode` | `false` | Afecta cómo se calculan los colores derivados |
| `background` | `#f4f4f4` | Color base para fondo/contraste |
| `fontFamily` | `trebuchet ms, verdana, arial` | Tipografía del diagrama |
| `fontSize` | `16px` | Tamaño de fuente |
| `primaryColor` | `#fff4dd` | Color de fondo de nodos; base para colores derivados |
| `primaryTextColor` | calculado según `darkMode` | Color de texto sobre `primaryColor` |
| `secondaryColor` | calculado de `primaryColor` | Color secundario |
| `primaryBorderColor` | calculado de `primaryColor` | Borde de nodos con `primaryColor` |
| `secondaryBorderColor` | calculado de `secondaryColor` | Borde de nodos con `secondaryColor` |
| `secondaryTextColor` | calculado de `secondaryColor` | Texto sobre `secondaryColor` |
| `tertiaryColor` | calculado de `primaryColor` | Color terciario |
| `tertiaryBorderColor` / `tertiaryTextColor` | calculados de `tertiaryColor` | Borde/texto terciario |
| `noteBkgColor` | `#fff5ad` | Fondo de notas |
| `noteTextColor` | `#333` | Texto de notas |
| `noteBorderColor` | calculado de `noteBkgColor` | Borde de notas |
| `lineColor` | calculado de `background` | Color de líneas |
| `textColor` | calculado de `primaryTextColor` | Texto general (etiquetas, títulos) |
| `mainBkg` | calculado de `primaryColor` | Fondo de rectángulos/círculos/clases |
| `errorBkgColor` / `errorTextColor` | `tertiaryColor` / `tertiaryTextColor` | Colores de mensajes de error de sintaxis |

> **Cálculo de color:** muchas variables se derivan automáticamente de otras (p. ej. `primaryBorderColor` de `primaryColor`) mediante ajustes de tono, inversión o aclarado/oscurecido del 10%, para mantener la legibilidad. Al personalizar `primaryColor`, Mermaid recalcula automáticamente los derivados.

### 24.6 Variables específicas por tipo de diagrama

Ya detalladas en cada sección anterior (Flowchart §2.4, Sequence §3.2, Pie §9.2, State §5.2, Class §4.2, User Journey §7.2, etc.). En general siguen el patrón `<diagrama><Elemento><Propiedad>`.

### 24.7 Estilo puntual vs. clase vs. tema — ¿cuándo usar cada uno?

| Mecanismo | Alcance | Cuándo usarlo |
|---|---|---|
| `style nodoId prop:valor` | Un solo nodo/elemento | Ajuste puntual y rápido |
| `classDef` + `class` | Grupo de nodos reutilizable | Aplicar el mismo estilo a varios elementos de forma consistente |
| `linkStyle` | Enlaces por índice | Resaltar conexiones específicas |
| `themeVariables` (frontmatter) | Todo el diagrama | Cambiar la paleta completa de un diagrama puntual |
| `theme` + `initialize()` | Todos los diagramas del sitio | Branding consistente en toda una aplicación/documentación |

### 24.8 Look (apariencia) y Layout (algoritmo de disposición)

- **`look`**: `classic` (por defecto) o `handDrawn` (estilo boceto). Actualmente soportado en Flowchart y State Diagram.
- **`layout`**: `dagre` (por defecto, balance entre simplicidad y claridad) o `elk` (mejor para diagramas grandes/complejos, requiere carga adicional del motor ELK).

---

## 25. Configuración global y despliegue

### 25.1 Formas de configurar Mermaid

1. **Panel de configuración del Live Editor** (mermaid.live) — edición visual.
2. **Llamada `mermaid.initialize()`** — para integraciones vía script/API, afecta a todo el sitio.
3. **Frontmatter YAML** — afecta solo al diagrama individual, sobrescribe la config global.
4. **Directivas `%%{init: {...}}%%`** — reconfiguración limitada embebida en el propio código del diagrama.

### 25.2 Opciones de configuración generales (no visuales)

- `securityLevel`: `strict` (por defecto, sin JS embebido), `loose` (permite `click` callbacks/links), `antiscript`, `sandbox` (iframe aislado).
- `startOnLoad`: si Mermaid se auto-inicializa al cargar la página.
- `htmlLabels`: si las etiquetas de texto usan HTML (mejor renderizado) o SVG puro.
- `maxTextSize` / `maxEdges`: límites de seguridad/rendimiento.
- `fontSize`, `wrap`, `markdownAutoWrap`: control de texto.
- `suppressErrorRendering`: evita insertar el diagrama de "Syntax error" en el DOM.

### 25.3 Instalación / despliegue

```bash
# CDN (sin bundler)
https://cdn.jsdelivr.net/npm/mermaid@<version>/dist/

# Node
npm i mermaid
yarn add mermaid
pnpm add mermaid
```

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>
```

Mermaid busca elementos `<div>`/`<pre class="mermaid">` en el DOM y los reemplaza por el SVG renderizado.

### 25.4 Seguridad

Dado que el contenido puede provenir de usuarios, Mermaid sanea el texto de entrada, pero recomienda el **modo `sandbox`** (iframe aislado) para sitios públicos con contenido generado por terceros, ya que bloquea la ejecución de JavaScript embebido a costa de perder algo de interactividad (tooltips, links con callback).

### 25.5 Registro de íconos personalizados

Para usar `icon` (flowchart), `service` (architecture) o íconos de packs externos (Iconify, FontAwesome), es necesario registrar el pack vía la API de configuración de íconos (`config/icons.html`) antes de referenciarlos por nombre en el diagrama.

---

## Referencias

- Documentación oficial: <https://mermaid.js.org>
- Editor en vivo: <https://mermaid.live>
- Repositorio: <https://github.com/mermaid-js/mermaid>
- Theming: <https://mermaid.js.org/config/theming.html>
- Sintaxis general: <https://mermaid.js.org/intro/syntax-reference.html>
