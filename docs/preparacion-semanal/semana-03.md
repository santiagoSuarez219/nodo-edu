# Semana 03 — 17 al 23 de agosto (AA) · 18–21 ago (ED) · 20 ago (PC)

**Preparada el:** 2026-08-16 (actualizada el 2026-08-17)
**Rama:** `feat/semana-03-material`
**Estado:** ✅ En preparación (contenido y los 6 cuestionarios de cierre listos; pasada de `@reviewer` completa, hallazgos corregidos) · ✅ Mergeada a `development` · ✅ Desplegada y abierta

> Esta rama excede el nombre "Semana 3": también agrega dos sesiones nuevas
> a la Semana 2 de Estructuras de Datos (`metodos-avanzados-y-clases-de-utilidad`
> T4, `introduccion-al-uml` T5) y un ajuste de redacción al
> `Laboratorio 02` de Análisis de Algoritmos. Se documenta aquí, no en una
> bitácora aparte, porque surgió como trabajo derivado de la preparación de
> la Semana 3 (ver "Decisiones").

## Sesiones cubiertas

| Curso | Sesión | Tema | ★/◇ |
|---|---|---|---|
| `analisis-de-algoritmos` | T | Algoritmos como tecnología; insertion sort y su invariante de ciclo | — |
| `analisis-de-algoritmos` | P | Insertion sort en Python (conteo de operaciones, mejor/peor caso) — **dictada en vivo por el docente**, no trabajo independiente | — |
| `estructuras-de-datos` | T1 | Herencia: `extends`, `super`, sobreescritura (`@Override`) | — |
| `estructuras-de-datos` | T2 | Polimorfismo: binding dinámico, clases abstractas, interfaces | — |
| `estructuras-de-datos` | P | Jerarquía de clases de tres niveles y polimorfismo (Sprint 1) | — |
| `programacion-cientifica` | — (jueves) | Condicionales y bucles | — |

Ninguna sesión de la semana está marcada `★`.

## Artefactos producidos

| Curso | Artefacto | Ruta | Publicado |
|---|---|---|---|
| `analisis-de-algoritmos` | Lección teórica | `content/cursos/analisis-de-algoritmos/algoritmos-como-tecnologia.mdx` | ✅ |
| `analisis-de-algoritmos` | Registro TS | `lib/courses/data/analisis-de-algoritmos.ts` (`order: 3`) | ✅ |
| `analisis-de-algoritmos` | Apuntes de clase (sesión práctica completa, sin guía de estudiante — ver decisiones) | `content/cursos/analisis-de-algoritmos/apuntes/lab-03-insertion-sort.md` | Solo owner/admin |
| `analisis-de-algoritmos` | Guía de laboratorio — estudiante | — | **No se creó** (sesión en vivo, ver decisiones) |
| `analisis-de-algoritmos` | Ajuste de redacción, Laboratorio 02 (fuera de Semana 3) | `content/cursos/analisis-de-algoritmos/guias/lab-02-configuracion-del-entorno.md` | ✅ |
| `analisis-de-algoritmos` | Fix de definición, "Buenas prácticas..." (fuera de Semana 3) | `content/cursos/analisis-de-algoritmos/buenas-practicas-y-entornos-python.mdx` | ✅ |
| `estructuras-de-datos` | Lección teórica — Herencia (dominio `Tarjeta`/`TarjetaDebito`/`TarjetaCredito`) | `content/cursos/estructuras-de-datos/herencia.mdx` | ✅ |
| `estructuras-de-datos` | Lección teórica — Polimorfismo (mismo dominio) | `content/cursos/estructuras-de-datos/polimorfismo.mdx` | ✅ |
| `estructuras-de-datos` | Registro TS (Herencia, Polimorfismo, lab) | `lib/courses/data/estructuras-de-datos.ts` (`order: 8`, `order: 9`, `order: 9.5`) | ✅ |
| `estructuras-de-datos` | Guía estudiante — lab de jerarquía de clases | `content/cursos/estructuras-de-datos/guias/lab-poo-jerarquia-de-clases.md` | ✅ |
| `estructuras-de-datos` | Apuntes de clase — Herencia | `content/cursos/estructuras-de-datos/apuntes/herencia.md` | Solo owner/admin |
| `estructuras-de-datos` | Apuntes de clase — Polimorfismo | `content/cursos/estructuras-de-datos/apuntes/polimorfismo.md` | Solo owner/admin |
| `estructuras-de-datos` | Apuntes de clase — lab de jerarquía de clases (migrado, ver decisiones) | `content/cursos/estructuras-de-datos/apuntes/lab-poo-jerarquia-de-clases.md` | Solo owner/admin |
| `estructuras-de-datos` | Lección teórica — Métodos avanzados y clases de utilidad, T4 (Semana 2, fuera de Semana 3) | `content/cursos/estructuras-de-datos/metodos-avanzados-y-clases-de-utilidad.mdx` | ✅ |
| `estructuras-de-datos` | Lección teórica — Introducción al UML, T5 (Semana 2, fuera de Semana 3) | `content/cursos/estructuras-de-datos/introduccion-al-uml.mdx` | ✅ |
| `estructuras-de-datos` | Registro TS (T4, T5) | `lib/courses/data/estructuras-de-datos.ts` (`order: 6`, `order: 7`) | ✅ |
| `estructuras-de-datos` | Apuntes de clase — T4 | `content/cursos/estructuras-de-datos/apuntes/metodos-avanzados-y-clases-de-utilidad.md` | Solo owner/admin |
| `estructuras-de-datos` | Apuntes de clase — T5 | `content/cursos/estructuras-de-datos/apuntes/introduccion-al-uml.md` | Solo owner/admin |
| `estructuras-de-datos` | Cronograma e info.md (T4/T5 agregadas, fecha por definir) | `content/cursos/estructuras-de-datos/microdiseno/{cronograma-dia-a-dia.md,info.md}` | No, nunca |
| `programacion-cientifica` | Lección teórica | `content/cursos/programacion-cientifica/condicionales-y-bucles.mdx` | ✅ |
| `programacion-cientifica` | Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 3`) | ✅ |
| `programacion-cientifica` | Taller — trabajo independiente (Seguimiento) | `content/cursos/programacion-cientifica/guias/condicionales-y-bucles-lab.md` | ✅ |
| `programacion-cientifica` | Registro TS del taller | `lib/courses/data/programacion-cientifica.ts` (`order: 3.5`) | ✅ |

> **Por qué Programación Científica no tiene apuntes de clase esta semana:**
> el taller es trabajo 100% independiente (Flujo A, sin sesión de laboratorio
> presencial dedicada) — no hay un momento de clase en el que el docente
> proyecte y desarrolle el código en vivo, que es lo que los apuntes
> documentan. Decisión explícita, no un artefacto olvidado.

> **`microdiseno/labs/lab-poo-jerarquia-de-clases-docente.md` fue eliminado**
> (existía con el modelo de artefactos anterior a la restructuración de esta
> misma rama) y su contenido útil se migró a los apuntes de clase — ver
> "Decisiones".

## Evaluaciones creadas

### Cuestionarios de cierre

| Lección | IDs de preguntas | Publicadas | Montadas (verificado con `list_lesson_questions`) |
|---|---|---|---|
| `analisis-de-algoritmos` / `algoritmos-como-tecnologia` | `0729bf42-3178-4113-b351-0996ec6eeac4`, `0b23603d-7c56-45df-a296-c64fd6a53ab1`, `7c1976b6-23b3-4c5b-8cc2-748ea98f1fb0`, `b6222779-8ed2-4f72-875f-43e56296e7a2`, `c35e4cec-464f-42c1-a001-0355c5a42508`, `a20be389-9854-455f-9fbf-3562531d0a48` | ✅ (6/6) | ✅ (6/6, orden 0–5) |
| `estructuras-de-datos` / `herencia` | `e4d84594-5ea5-4f4b-9e29-c9fd2344b75d`, `6869aad7-425e-4298-9b19-2ab284516395`, `f37374f6-1707-454e-b305-f6288d539a06`, `0b9b63b9-dba2-4b93-b2ec-5f7843db5cb0` | ✅ (4/4) | ✅ (4/4, orden 0–3) |
| `estructuras-de-datos` / `polimorfismo` | `6aa23dd7-438d-4906-8b42-d0aa303cb873`, `4a9dc0c8-dfed-48ff-a999-8a5b0ef0cd74`, `2d4857e4-a7dc-421e-8164-4573f91ecd3d` | ✅ (3/3) | ✅ (3/3, orden 0–2) |
| `estructuras-de-datos` / `metodos-avanzados-y-clases-de-utilidad` (T4, Semana 2) | `f2b19c6d-2128-412f-8f75-66eeca24850e`, `b48fe61b-c7bd-4029-9938-c4d2f4717361`, `f8759a40-e8e0-45cf-ae11-288cf026b1eb`, `24f6ac79-83f1-45df-b6b4-7730ef10f6b5`, `5787b3a0-931c-46d8-aba2-506d01cec024` | ✅ (5/5) | ✅ (5/5, orden 0–4) |
| `estructuras-de-datos` / `introduccion-al-uml` (T5, Semana 2) | `20265115-6ef4-4766-bda2-d4de6de0d311`, `e8e74ad5-2f6c-4eba-9df0-0f34a028f015`, `006de567-8fec-4701-9649-11586ae891a6`, `a5149d91-15f3-4e90-83c8-eba73d0ccd41`, `beaf7bf5-2b0b-45be-9ed6-99c2c80572e0` | ✅ (5/5) | ✅ (5/5, orden 0–4) |
| `programacion-cientifica` / `condicionales-y-bucles` | `c15d252e-be9b-4101-998a-7108bb3ad1ef`, `42e0a509-a14d-42f0-98ab-e6ccc8982138`, `60135610-8468-4dde-88c4-ae0ec021d0bb` | ✅ (3/3) | ✅ (3/3, orden 0–2) |

**Las 6 lecciones teóricas de la semana (incluidas T4/T5 de Semana 2) ya tienen su cuestionario de cierre completo.**

> **Replicadas a producción (2026-08-17)**, vía `question-bank-mcp-prod`: las
> 26 preguntas se crearon con el mismo contenido, se publicaron y se montaron
> en el mismo orden que en desarrollo, verificado con `list_lesson_questions`
> contra producción. Las 12 keywords nuevas del catálogo (`modelado-de-problemas`,
> `algoritmos`, `insertion-sort`, `invariante-de-ciclo`, `impacto-social`, `uml`,
> `diagrama-de-clases`, `miembros-estaticos-static`, `constructores`,
> `clases-abstractas`, `atributos`, `clases`) también se crearon en producción
> antes de crear las preguntas. `herencia`, `polimorfismo` y
> `condicionales-y-bucles` tenían preguntas preexistentes sin publicar
> (ejercicios de código del banco anterior a esta semana) — quedaron
> mezcladas en `list_lesson_questions` pero no afectan la autoevaluación del
> estudiante porque `is_published: false`.

Keywords nuevas creadas en el catálogo compartido:
`modelado-de-problemas`, `algoritmos`, `ordenamiento`, `insertion-sort`,
`invariante-de-ciclo`, `impacto-social` (AA); `uml`, `diagrama-de-clases`
(T5); `miembros-estaticos-static` (T4); `herencia` (Herencia/Polimorfismo).

### Quiz calificable A/B/C

No aplica — ninguna sesión de la semana está marcada `★`.

## Decisiones tomadas por Claude en nombre del docente

> Todo lo que se resolvió durante esta preparación y el usuario debería
> poder revertir.

- **Restructuración del modelo de artefactos de sesión práctica** (aplicada
  a petición explícita del usuario, no unilateral): se eliminó la guía de
  laboratorio del docente con minutado (`microdiseno/labs/<slug>-docente.md`)
  como artefacto independiente. Los **apuntes de clase** (`apuntes/`) pasan a
  ser el único artefacto docente: paso a paso de código documentado con
  soluciones completas, más preguntas socráticas opcionales — sin minutado,
  ficha de sesión, puntos de control ni diferenciación. La guía de
  laboratorio del estudiante ahora solo se crea si se confirma explícitamente
  que la sesión es trabajo independiente, nunca por defecto. Se actualizaron
  `.claude/skills/lesson-authoring/SKILL.md`, `.claude/agents/lab-designer.md`,
  `.claude/agents/lesson-designer.md` y `.claude/skills/weekly-class-prep/SKILL.md`.
  **Motivo:** el usuario señaló que crear guía docente y apuntes por separado
  era redundante (los apuntes ya reemplazaban esa función) y que no toda
  sesión práctica es trabajo independiente del estudiante.
- **Laboratorio 3 de Análisis de Algoritmos reclasificado como sesión en
  vivo**, no trabajo independiente: se fusionó el contenido de la antigua
  guía de estudiante (`guias/lab-03-insertion-sort.md`, eliminada) y de la
  guía docente (`microdiseno/labs/lab-03-insertion-sort-docente.md`,
  eliminada) en los apuntes de clase, y se quitó la entrada `kind: "guide"`
  correspondiente de `lib/courses/data/analisis-de-algoritmos.ts`. **Motivo:**
  el docente la va a desarrollar en clase para explicar el flujo de trabajo
  del curso (entorno, commits, carpeta `ejercicios-clase/`).
- **Pregunta Q3 del cuestionario de cierre de AA reformulada** sin notación
  asintótica (`n²` / `n log n`), con el ejemplo concreto de "duplicar
  velocidad vs. duplicar entrada" ya presente en la lección. **Motivo:** esa
  notación aún no se ha enseñado formalmente en el curso (llega en la Semana
  5, Cormen Cap. 3).
- **Los dos ejemplos transversales (programación de horarios y ruteo de
  ambulancias)** se incorporaron a `algoritmos-como-tecnologia.mdx` dentro de
  un `<Callout>`, presentados explícitamente como ilustración —no como
  trabajo de aula— a la espera de la reunión institucional del 19 de agosto
  de 2026. Ver `microdiseno/projects/caso-evaluacion-ra-2026-2.md` para el
  contexto completo.
- **Migrada la guía docente del laboratorio de POO/jerarquía de clases
  (Estructuras de Datos)** al nuevo modelo: se fusionó el diagrama UML de
  lectura guiada y las preguntas socráticas de
  `microdiseno/labs/lab-poo-jerarquia-de-clases-docente.md` (eliminado) en
  `apuntes/lab-poo-jerarquia-de-clases.md`, descartando ficha de sesión,
  minutado, puntos de control y diferenciación. **Motivo:** hallazgo de
  `@reviewer` en la revisión previa al merge — la rama producía el mismo
  artefacto que la restructuración de skills/agentes acababa de prohibir,
  y convivía con apuntes redundantes para la misma sesión.
- **`metodos-avanzados-y-clases-de-utilidad` (T4) recortada a su alcance
  real**: se quitó el topic `"Clase String y wrapper classes"` de
  `lib/courses/data/estructuras-de-datos.ts` y la mención a `==`/`equals` en
  el `summary` del frontmatter — la lección solo cubre sobrecarga y `static`.
  **Motivo:** hallazgo de `@reviewer` (la lección prometía un tema que no
  estaba escrito, sin ninguna nota visible para el estudiante). No se agregó
  el contenido faltante: se redujo la promesa a lo que existe.
- **Correcciones de la pasada de `@reviewer`** aplicadas una por una con el
  usuario, sobre contenido ya publicado: apertura de `polimorfismo.mdx`
  corregida (ya no afirma que Herencia dejó `liquidarMes()` — ese método es
  nuevo de esta lección); `guias/lab-02-configuracion-del-entorno.md`
  recuperó la descripción del `README.md` que la rúbrica sigue evaluando y
  perdió la referencia a un plazo de entrega que ya no existe; definición de
  `if __name__ == "__main__":` en `buenas-practicas-y-entornos-python.mdx`
  con la cita mal cerrada corregida; notación UML de atributos
  (`nombre : Tipo`) unificada entre `herencia.mdx`, `polimorfismo.mdx` y
  `metodos-avanzados-y-clases-de-utilidad.mdx`; títulos del laboratorio de
  jerarquía de clases alineados entre frontmatter, H1 y TS; `summary` de
  frontmatter completado en las lecciones que lo tenían vacío pese a tener
  `summary` en TS; `summary` agregado en TS a las dos guías nuevas que no lo
  tenían.

## Verificación

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 8 advertencias preexistentes sin relación)
- [x] `npx tsc --noEmit` en verde
- [x] Checklist de `lesson-authoring` §8 recorrido para los artefactos tocados en esta sesión
- [x] Coherencia cruzada AA: la lección instala insertion sort e invariante de ciclo; los apuntes los materializan en código; el cuestionario evalúa exactamente esas seis piezas
- [x] `@reviewer`: **CAMBIOS REQUERIDOS** en la primera pasada (5 hallazgos mayores) — los 5 corregidos uno por uno con el usuario, más los hallazgos menores relevantes (bitácora, notación UML, títulos duplicados, `summary` faltantes/vacíos). Pendiente una segunda pasada de `@reviewer` antes de mergear.

## Despliegue y apertura

- **Merge a `development`:** ✅ completo (todos los commits de esta rama ya
  estaban en `development` antes de este cierre)
- **Deploy a producción:** ✅ `deploy/2026-08-17` → `main` (commit `8b3cdf9`),
  push a `origin/main` el 2026-08-17. Conflicto de merge en
  `practica-clases-y-objetos-proyecto-de-aula.mdx` (un commit `70997f5` había
  llegado a `main` sin pasar por `development`) resuelto tomando la versión
  de `development` — superset sin pérdida de contenido, confirmado con
  usuario.
- **Preguntas del banco replicadas a producción:** ✅ 2026-08-17, ver nota en
  "Evaluaciones creadas" arriba.
- **Lecciones abiertas (2026-08-17, vía `courses-mcp-prod`):**
  `analisis-de-algoritmos/algoritmos-como-tecnologia`,
  `estructuras-de-datos/metodos-avanzados-y-clases-de-utilidad`,
  `estructuras-de-datos/introduccion-al-uml`, `estructuras-de-datos/herencia`,
  `estructuras-de-datos/polimorfismo`,
  `programacion-cientifica/condicionales-y-bucles`. Las guías
  `lab-poo-jerarquia-de-clases` y `condicionales-y-bucles-lab` ya estaban
  abiertas de antes.
- [x] Verificado que las lecciones de semanas futuras siguen cerradas
  (`analisis-de-algoritmos-y-divide-y-venceras`,
  `composicion-agregacion-y-diagramas-de-paquetes`,
  `estructuras-de-datos-nativas`, etc. — no se tocaron)

## Pendientes para la semana siguiente

- Segunda pasada de `@reviewer` sobre el diff final, ya con los 5 hallazgos
  mayores y los menores relevantes corregidos, antes de solicitar el merge.
- Traer `development` a la rama antes de mergear (46 commits de diferencia;
  sin colisión detectada en `lib/courses/data/estructuras-de-datos.ts`, pero
  conviene rebuildear el conjunto combinado).
- Resultado de la reunión institucional del 19 de agosto de 2026 sobre el
  caso de evaluación de resultados de aprendizaje — de ahí dependen posibles
  ajustes a `info.md`/`cronograma-dia-a-dia.md` de Análisis de Algoritmos (no
  tocar sin aprobación explícita).
