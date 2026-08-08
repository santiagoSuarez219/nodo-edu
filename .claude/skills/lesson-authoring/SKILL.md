---
name: lesson-authoring
description: Formato exacto de los artefactos de una lección en Nodo — lección MDX publicable, registro en lib/courses/data, guía de laboratorio docente (privada) y de estudiante (publicada), y creación de preguntas/quices vía MCP. Leer completo antes de escribir cualquier lección o guía.
---

# Lesson Authoring — formato de los artefactos de una lección

Fuente de verdad del **formato**. El **contenido pedagógico** de cada curso se
decide leyendo su `microdiseno/info.md` y `microdiseno/cronograma-dia-a-dia.md`.

Todo lo de este documento fue verificado contra el código. Cuando algo aquí
contradiga una suposición, gana este documento; cuando contradiga el código,
gana el código y hay que actualizar este archivo.

---

## 1. Los cinco artefactos de una lección

| # | Artefacto | Ubicación | ¿Se publica? |
|---|-----------|-----------|--------------|
| 1 | Lección teórica | `content/cursos/<curso>/<slug>.mdx` | Sí |
| 1b | Registro de la lección | `lib/courses/data/<curso>.ts` | Requisito para publicar |
| 2 | Cuestionario de cierre | Banco de preguntas (Supabase, vía `question-bank-mcp`) | Sí, al publicar cada pregunta |
| 3 | Guía de laboratorio — docente | `content/cursos/<curso>/microdiseno/labs/<slug>-docente.md` | **No** |
| 4 | Guía de laboratorio — estudiante | `content/cursos/<curso>/guias/<slug>.md` | Sí (`kind: "guide"`) |
| 5 | Quiz calificable A/B/C | Assignments (Supabase, vía `assignment-mcp`) | Solo a demanda |

Cursos válidos (slugs exactos): `estructuras-de-datos`, `programacion-cientifica`,
`analisis-de-algoritmos`.

Convención de nombres: `id === slug === articleSlug === nombre de archivo`, en
`kebab-case` y sin acentos.

---

## 2. Lección teórica — `.mdx`

### 2.1 Frontmatter

El sistema solo parsea **cuatro** campos (`lib/courses/content.ts:11-16`, `:50-62`);
cualquier otra clave se descarta en silencio. Ninguno es técnicamente obligatorio.

| Campo | Efecto real |
|-------|-------------|
| `updatedAt` | **El único con efecto visible.** Formato `YYYY-MM-DD`. Renderiza "Actualizado el …" |
| `title` | Parseado pero **nunca consumido** — el `<h1>` sale de `lesson.title` del TS |
| `summary` | Parseado pero **nunca consumido** — el subtítulo sale de `lesson.summary` del TS |
| `cover` | Parseado, sin ningún consumidor en el repo |

Los demás campos que aparecen en las lecciones existentes (`course`, `course_code`,
`level`, `type`, `language`, `difficulty`, `estimated_time`, `presentation`,
`slides_hint`, `date`, `author`) son **metadatos de autoría ignorados por el
runtime**. Mantenerlos es útil para el docente y para generar presentaciones.

Frontmatter a usar:

```yaml
---
title: "Título de la lección"
course: "Estructura de Datos"
course_code: "ED"
level: "Primeros semestres"
type: "Apuntes teóricos"
language: "Java 21"
difficulty: "Básico"
estimated_time: "50 minutos de clase (sesión T1, Semana 8)"
presentation: true
slides_hint: "Cada sección ## es una diapositiva. Presentación sincrona."
date: "2026-07-30"
author: "Asistente de Docencia"
summary: ""
updatedAt: "2026-07-30"
---
```

`course_code`: `ED` (Estructura de Datos), `PC` (Programación Científica),
`AA` (Análisis de Algoritmos).

### 2.2 Estructura del cuerpo

**No escribir `# H1`.** `LessonArticle.tsx:28-30` ya renderiza el `<h1>` desde
`lesson.title`; un `#` en el cuerpo produce un segundo h1 duplicado. Empezar
directo en `##`.

Esqueleto pragmático (problema → teoría → práctica), 8–10 secciones `##`:

```
## El problema: <escenario cotidiano y concreto>
## Más problemas que resuelve <el concepto>
## La solución: <nombre del concepto>       ← + diagrama + definición formal
## <Concepto 1>                             ← Situación → En la práctica → código → diagrama → definición
## <Concepto 2>
## <Concepto 3>
## <Concepto 4>
## <Resumen operativo>                      ← tabla de comandos / operaciones / complejidades
## Síntesis                                 ← bullets, uno por sección anterior
```

Cada `##` es una diapositiva (por `slides_hint`), así que se mantiene corta:
5–15 líneas, 1–4 párrafos. **Cero `###`** — si necesitas un nivel más, la
sección debería partirse en dos. Sin separadores `---`.

Micro-patrón que se repite en las secciones de concepto:

````markdown
## De "guardar el archivo" a "guardar un cambio": el staging area

**Situación:** modificaste tres archivos, pero solo dos cambios pertenecen a la
misma idea. ¿Cómo le dices a Git "guarda solo estos dos, juntos"?

**En la práctica**, Git separa el proceso en dos pasos:

```bash
git add Cliente.java Cuenta.java   # 1. Preparar (staging)
git commit -m "Agrega validacion de edad"   # 2. Guardar en la historia
```

```mermaid
flowchart LR
  A["Directorio de trabajo"] -->|"git add"| B["Staging area"]
  B -->|"git commit"| C["Repositorio"]
```

> **Staging area:** zona intermedia donde eliges _exactamente qué cambios_
> entrarán en el próximo commit.
````

Medidas de referencia de una lección completa: ~170 líneas, 9 secciones `##`,
4 diagramas Mermaid, 6 bloques de código, 1 tabla, 6 blockquotes de definición.

### 2.3 Tono

- Segunda persona del singular ("imagina que estás escribiendo", "¿cómo la recuperas?").
- Preguntas retóricas para abrir cada problema.
- Contexto local y concreto: "tu proyecto de aula", "el profesor", "por correo o USB o por WhatsApp".
- **Negrita** al introducir un término; `_cursiva_` para énfasis y anglicismos (`_staged_`).
- Backticks para todo comando, archivo, clase o método.
- Guion largo `—` para aclaraciones.
- Referencias cruzadas a otras **lecciones** por su título ("como viste en
  Sintaxis de Java"). Nunca a laboratorios ni a sesiones futuras (ver abajo).
- Español con acentuación completa. Nada de jerga sin definir antes.

> Las guías de laboratorio usan **usted** ("Implemente", "Verifique"); las
> lecciones usan **tú**. No mezclar.

> **Las lecciones no anuncian laboratorios.** Nada de "esto lo implementas en el
> laboratorio", "en la práctica del viernes" o "el sprint N te pedirá". No todas
> las lecciones tienen laboratorio y eso se decide sobre la marcha: prometer una
> práctica que quizá no exista confunde al estudiante. El puente teoría→práctica
> lo tiende la **guía de laboratorio**, que referencia a la lección cuando se
> crea — la dirección es siempre guía → lección, nunca lección → guía.

### 2.4 Diagramas Mermaid

**No es un componente JSX**: es un bloque de código con lenguaje `mermaid`, que
`lib/mdx/rehype-mermaid-block.ts` intercepta antes de Shiki.

````markdown
```mermaid
flowchart LR
  A["Etiqueta con\nsalto de linea"] -->|"texto de arista"| B["Otra etiqueta"]
```
````

Reglas verificadas:
- Indentación de 2 espacios.
- **Etiquetas siempre entre comillas dobles** — evita que los caracteres especiales rompan el parser.
- `\n` literal dentro de las comillas para salto de línea.
- Emojis y flechas Unicode (`←`, `✅`, `❌`) permitidos dentro de las comillas.
- `securityLevel: "strict"` (`MermaidDiagram.tsx:36-44`): sin HTML crudo ni `click` handlers.
- `fontFamily` fijado a JetBrains Mono; el tema sigue claro/oscuro automáticamente.
- Si el diagrama no parsea, se muestra una tarjeta de error con el fuente — no rompe la página, pero **es un defecto**: valida la sintaxis mentalmente antes de escribir.
- `end` en minúscula rompe el parser: escribir `End`.

Cualquier tipo de diagrama de Mermaid v11 sirve. Referencia completa en
`content/cursos/mermaid_guia_completa.md`. Los tipos que más rinden aquí:

| Objetivo pedagógico | Diagrama |
|---|---|
| Flujo de datos, pipeline, pasos de un comando | `flowchart LR` |
| Estructura de carpetas, jerarquía, contenedores | `flowchart TB` + `subgraph` |
| Modelo de clases, herencia, composición (POO/UML) | `classDiagram` |
| Ciclo de vida, estados de un objeto o proceso | `stateDiagram-v2` |
| Interacción entre capas (View→Controller→Service) | `sequenceDiagram` |
| Comparar crecimiento asintótico, benchmarks | `xychart-beta` |
| Mapa conceptual de cierre de módulo | `mindmap` |
| Cronograma de sprints del proyecto | `gantt` |
| Modelo de datos / entidades | `erDiagram` |

Apuntar a **3–5 diagramas por lección**, cada uno ganándose su lugar: un
diagrama que solo repite el texto es ruido.

### 2.5 Código, matemáticas y tablas

**Código** — Shiki con `defaultLang: "plaintext"`. Lenguajes en uso: `java`,
`python`, `bash`, `text`. El patrón es comentar los pasos dentro del bloque.
Código inline con backticks simples.

**KaTeX** — `remark-math` + `rehype-katex` están activos: `$...$` inline,
`$$...$$` en bloque.

> ⚠️ Ningún archivo de `content/` usa `$` hoy. Como `remark-math` está activo,
> **un `$` suelto en prosa rompe el parseo** (precios, variables de shell):
> escaparlo como `\$`. Para complejidad, las lecciones existentes usan negrita
> (`**O(1)**`) en vez de matemáticas. En Análisis de Algoritmos, donde las
> recurrencias lo justifican, sí usar KaTeX: `$T(n) = 2T(n/2) + \Theta(n)$`.

**Callouts** — el contenido real usa **blockquote de Markdown**, no `<Callout>`.
Una línea `>` por término, negrita en el término, emoji para advertencias:

```markdown
> **Repositorio (repo):** carpeta cuyo contenido es rastreado por Git.
> ⚠️ Si borras la carpeta `.git/`, pierdes todo el historial.
```

**Tablas** — GFM, con scroll horizontal automático. Alineación con guiones.

### 2.6 Componentes MDX disponibles

Registrados en `lib/mdx/components.tsx:159-162`. Son **exactamente cuatro**;
cualquier otro nombre JSX **rompe el render de la página**:

```mdx
<Callout tipo="advertencia">Texto.</Callout>
```
`tipo`: `"nota" | "advertencia" | "peligro" | "exito"` (default `"nota"`,
**`exito` sin acento**). No acepta `title`: la etiqueta se autogenera.

```mdx
<Tabs>
  <Tab label="Java">

```java
public class Pila<T> { }
```

  </Tab>
  <Tab label="Python">

```python
class Pila: pass
```

  </Tab>
</Tabs>
```
`label` es **obligatorio** en cada `<Tab>` (sin él la pestaña se filtra y
desaparece) y debe ser único. Las líneas en blanco alrededor del bloque de
código son necesarias para que MDX lo trate como Markdown y no como JSX.
Útil para el mismo algoritmo en pseudocódigo y en lenguaje real.

```mdx
<YouTubeEmbed id="dQw4w9WgXcQ" title="Introducción a Git" />
```
`id` (11 caracteres) **o** `url`; `title` y `start` (segundos) opcionales.

> Ninguna lección usa todavía estos tres componentes — no hay precedente de
> contenido, solo de código. Úsalos cuando aporten; el blockquote sigue siendo
> el patrón por defecto para definiciones.

### 2.7 Registro obligatorio en `lib/courses/data/<curso>.ts`

**Sin esta entrada la lección no existe para el sitio**: la página renderiza
`PreparationPlaceholder` y el `.mdx` se ignora (`page.tsx:62-64`, `:90-94`).

```ts
{
  id: "fundamentos-de-recursividad",
  slug: "fundamentos-de-recursividad",
  articleSlug: "fundamentos-de-recursividad",
  order: 14,
  title: "Fundamentos de recursividad",
  summary: "Casos base, casos recursivos y la pila de llamadas, con factorial y Fibonacci en Java.",
  topics: [
    { title: "Caso base y caso recursivo" },
    { title: "La pila de llamadas" },
  ],
},
```

`title` y `summary` de **esta** entrada son los que el estudiante ve en el
encabezado. Escribirlos con cuidado: el `summary` es la promesa de la lección.

Un validador IIFE (`lib/courses/index.ts:28-85`) **lanza en build y en dev** si:
- hay `id`, `slug` u `order` duplicado dentro del curso;
- el slug es reservado: `recursos`, `evaluaciones`, `notebooks`, `presentacion`, `guias`;
- el archivo referenciado por `articleSlug` **no existe** en disco.

Por eso: escribir primero el archivo, después la entrada. Y verificar con
`npm run build` (o `npx tsc --noEmit`) tras editar el TS.

---

## 3. Guía de laboratorio del docente (privada)

`content/cursos/<curso>/microdiseno/labs/<slug>-docente.md`. `microdiseno/` no
se publica (`CLAUDE.md`), así que este archivo es solo para consulta del docente.
No lleva frontmatter ni entrada en TS.

Es el **guion de la sesión**, no una copia de la guía del estudiante. Secciones:

```
# Lab NN — <tema> · Guía del docente

## Ficha de la sesión
  Curso · Semana/sesión · Duración · Momento evaluativo (o Seguimiento) ·
  Lección teórica de la que depende · Sprint del proyecto (si aplica)

## Objetivo de la sesión
  Qué debe poder hacer el estudiante al salir del aula. 2-4 bullets verificables.

## Conexión con la teoría
  Qué concepto de la lección se materializa aquí y con qué pregunta se abre la sesión.

## Minutado
  | Tiempo | Bloque | Qué hace el docente | Qué hace el estudiante |
  Debe sumar la duración real de la sesión.

## Desarrollo paso a paso
  ### Paso N — <nombre>
  Enunciado, código de partida (esqueleto), y la solución de referencia
  completa en bloque de código. Es material del docente: aquí SÍ va la solución.

## Puntos de control
  Qué revisar en pantalla del estudiante y en qué minuto. Señal de que va bien.

## Errores frecuentes y cómo intervenir
  | Síntoma observable | Causa probable | Intervención sugerida |

## Preguntas socráticas
  Preguntas para lanzar al grupo cuando se estanca, con la respuesta esperada.

## Diferenciación
  Qué darle a quien termina temprano (extensión) y a quien se queda atrás
  (andamiaje mínimo aceptable). Crítico en Programación Científica, cuyo grupo
  es explícitamente heterogéneo.

## Cierre de la sesión
  Cómo se conecta con la siguiente sesión y qué queda como trabajo independiente.

## Materiales y preparación previa
  Qué debe tener listo el docente antes de entrar (datasets, repos, ramas).
```

---

## 4. Guía de laboratorio del estudiante (publicada)

`content/cursos/<curso>/guias/<slug>.md` — **`.md`, no `.mdx`**, en la
subcarpeta `guias/` (`lib/courses/content.ts:24-26`).

Requiere entrada en `lib/courses/data/<curso>.ts` con **`kind: "guide"`**:

```ts
{
  id: "lab-01-listas-enlazadas",
  slug: "lab-01-listas-enlazadas",
  articleSlug: "lab-01-listas-enlazadas",
  kind: "guide",
  order: 9,
  title: "Laboratorio 01 — Listas Enlazadas",
  topics: [],
},
```

Diferencias de comportamiento frente a una lección: el header dice "Guía" en vez
de "Clase NN", y la guía queda **fuera del progreso, del resume, de la asistencia,
de la autoevaluación de cierre y del sitemap**.

> ⚠️ **Trampa principal:** el `.md` **se compila como MDX**. Un `<`, `{` o `}`
> suelto rompe el build igual que en un `.mdx`. En Java y Python esto aparece
> constantemente: `List<T>`, `Map<K,V>`, f-strings con `{}`. Dentro de bloques
> de código con backticks es seguro; **en prosa hay que usar backticks o
> escapar**. Nunca escribir `List<T>` sin backticks en un párrafo.

Frontmatter: la guía existente no lleva ninguno (no muestra fecha). Añadir
`title` + `updatedAt` es válido y preferible, para que se vea la fecha.

Estructura (secciones `##` separadas por `---`, `###` para subpartes):

```
# Laboratorio NN — <tema>

## Objetivo
  Un párrafo + "Competencias esperadas:" en bullets.

## Requisitos Previos
  Bullets de lo que debe dominar. Referenciar lecciones por su TÍTULO
  ("Clase 08 — Encapsulamiento"), nunca por spec interno: la guía existente
  filtra "(spec-009)" al estudiante, y eso es un defecto a no repetir.

## Desarrollo del Laboratorio
  ### Parte 1 — <nombre>
  Párrafo + esqueleto de código (SIN la solución) + bullets
  **Requisitos:** / **Operaciones obligatorias:** / **Restricciones:**
  ### Parte N — <nombre> (Opcional / Avanzado)

## Entregable
  Árbol de archivos ASCII en bloque de código sin lenguaje, formato de entrega
  (repo con rama y estructura, o .zip), y un ejemplo de archivo de prueba.

## Criterios de Evaluación
  Rúbrica detallada: ver sección 4.1.

## Dificultades Comunes
  ### "<pregunta entre comillas>"  + bullets de respuesta.

## Extensiones Sugeridas (Bonus)

## Recursos
  Bullets con **Etiqueta:** — apuntes del curso, capítulo del libro, herramienta.

**Plazo de entrega:** <plazo>.
```

Tono: **usted**, imperativo ("Implemente", "Verifique", "Empaquete"). Cero
diagramas Mermaid, cero componentes JSX, cero `$`.

### 4.1 Rúbrica

Tabla `| Criterio | Puntos | Descripción |` con separador compacto `|---|---|---|`,
criterio en negrita, y fila final `| **TOTAL** | **100** | |`. Debe sumar 100.

La descripción de cada criterio tiene que ser **verificable**, no una etiqueta
de calidad: "Todos los atributos son `private` y el acceso es por métodos" en
vez de "buen encapsulamiento". Cubrir siempre corrección funcional, calidad del
código, validación de casos límite, pruebas y documentación.

Análisis de Algoritmos tiene rúbrica común de 5 criterios definida en su
microdiseño (corrección conceptual, calidad de la explicación teórica,
corrección de la implementación, calidad del análisis de gráficas,
documentación y organización del informe): **respetarla**, no inventar otra.

---

## 5. Cuestionario de cierre de lección (formativo, sin nota)

Es la sección de autoevaluación al final de la lección (spec-011). **No se
"crea" ningún objeto**: aparece sola cuando existen preguntas publicadas
**montadas** en la lección (spec-042 — el montaje sustituyó a
`course_slug`/`lesson_slug` como campos de la pregunta).

Procedimiento con `question-bank-mcp` — **tres pasos, en orden**:

1. `create_question` por cada pregunta, con `keywords: string[]` (deben existir
   en el catálogo — confirmar con `list_keywords` antes; nunca inventar un
   slug de keyword, y si falta una proponerle al usuario crearla con
   `create_keyword` antes de seguir).
2. Revisar el contenido con el usuario, luego `publish_question` en cada una.
   **No existe `unpublish_question`** — publicar es prácticamente irreversible
   desde el MCP.
3. `mount_question_in_lesson` por cada una, con el `course_slug`/`lesson_slug`
   exactos de la lección. **Publicar NO monta**: una pregunta publicada y
   nunca montada es invisible en cualquier autoevaluación, sin ningún error.
   Verificar con `list_lesson_questions` que las preguntas quedaron
   realmente visibles y en el orden esperado.

Restricciones que determinan el diseño:

- **Solo `multiple_choice` se muestra.** Los otros cuatro tipos montados en la
  misma lección se **ignoran en silencio** — no los crees para el cierre.
- `choices` necesita **mínimo 2** opciones y **al menos una** `is_correct: true`.
  Varias correctas ⇒ la UI pasa de radios a checkboxes automáticamente.
- `course_slug`/`lesson_slug` del montaje son **texto libre sin foreign key**
  hacia el catálogo de lecciones (vive en git, no en Postgres). Un slug mal
  escrito **no falla**: deja la pregunta huérfana e invisible para siempre.
  **Nunca inventar slugs** — copiarlos del nombre del archivo `.mdx`.
- `difficulty` es 1–5. `keywords` es un array de slugs del catálogo
  controlado (ya no hay `tags` libres).
- Es formativo y **no persiste nada**: sin nota, sin intentos, feedback efímero.
- Solo lo ven estudiantes matriculados.

Diseño recomendado: **4–6 preguntas** por lección, una por sección `##` de peso,
escalonadas en dificultad, con distractores que correspondan a errores
conceptuales reales (no opciones absurdas de relleno). `keywords` con el
módulo y el concepto (ej. `recursion`, `python`) — confirmadas en el catálogo,
nunca inventadas al vuelo.

---

## 6. Quiz calificable A/B/C (solo a demanda)

Con `assignment-mcp`. Un grupo de variantes = 1 config compartida + N variantes
con **preguntas distintas**. No hay generación automática: las tres se componen
explícitamente eligiendo del banco.

1. `list_academic_courses` → obtener `academic_course_id` (obligatorio).
2. Tener las preguntas ya creadas y publicadas en el banco.
3. `create_assignment_group` con `variants: [A, B, C]` en **una sola llamada**.
4. `publish_assignment_group`.
5. `get_variant_allocations` para monitorear el reparto (devuelve lista plana de
   `enrollment_id`; los conteos por variante hay que calcularlos).

Invariantes validadas al publicar — cada fallo es un 422:
- **≥ 2 variantes** (usar 3).
- **Ninguna variante vacía.**
- **Puntaje total idéntico en las tres variantes.** La comparación es `===` sobre
  suma de floats: usar puntajes que sumen exacto (0.5, 1, 2…) y **evitar
  decimales como 0.1 + 0.2**, que fallan por representación binaria.
- `closes_at` no puede estar en el pasado.

`points` por pregunta: **mínimo 0.01, máximo 5.00**. `type`: `practice`, `quiz`,
`exam`, `homework`. `show_feedback_on`: `submit`, `close`, `never`.

No valida que las preguntas estén publicadas, ni duplicados dentro de una
variante, ni que el número de preguntas coincida entre variantes. **Eso es
responsabilidad del autor**: las tres variantes deben ser equivalentes en
número de preguntas, dificultad y temas cubiertos, no solo en puntaje.

`replace_variant_questions` **borra y reinserta** todas las preguntas de una
variante. `delete_assignment_group` da 409 si ya hay entregas.

---

## 7. Requisitos de ejecución de los MCP

Ambos MCP son clientes HTTP: **requieren `npm run dev` corriendo** y fallan con
"API no disponible" **sin reintentos** (deliberado, para no duplicar creaciones).

Están registrados en `.mcp.json` y arrancan vía `mcp-servers/run-local-mcp.sh`,
que carga `.env.local` y deriva el origen de la app desde
`QUESTION_BANK_API_BASE_URL` (ojo: el puerto puede no ser 3000).

Si las herramientas MCP no aparecen: verificar que `npm run dev` está arriba,
que `.env.local` tiene `QUESTION_BANK_API_KEY` y `QUESTION_BANK_AGENT_TEACHER_ID`,
y que `mcp-servers/<nombre>/dist/` está compilado.

---

## 8. Checklist de cierre

- [ ] `.mdx` sin `# H1`, empieza en `##`, sin `###`, sin `---`.
- [ ] `updatedAt` con la fecha de hoy.
- [ ] 3–5 diagramas Mermaid, etiquetas entre comillas dobles, sin `end` minúscula.
- [ ] Ningún `$` sin escapar; ningún `<`/`{` suelto en prosa (crítico en `.md` de guías).
- [ ] Solo `Callout`, `Tabs`, `Tab`, `YouTubeEmbed` como JSX.
- [ ] Entrada en `lib/courses/data/<curso>.ts` con `articleSlug`, `order` único y `summary` escrito.
- [ ] Guía del estudiante con `kind: "guide"`; guía del docente en `microdiseno/labs/` y **sin** entrada TS.
- [ ] Rúbrica suma 100 y cada criterio es verificable.
- [ ] Preguntas de cierre: solo `multiple_choice`, publicadas y **montadas** en la lección (`mount_question_in_lesson`), verificado con `list_lesson_questions`.
- [ ] `npm run build` pasa (el validador de cursos corre ahí).
