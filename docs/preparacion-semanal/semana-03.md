# Semana 03 — 17 al 23 de agosto (AA) · 18–21 ago (ED) · 20 ago (PC)

**Preparada el:** 2026-08-16
**Rama:** `feat/semana-03-material`
**Estado:** ⬜ En preparación (contenido y cuestionario de AA listos; ED y PC con cuestionario de cierre pendiente) · ⬜ Mergeada a `development` · ⬜ Desplegada y abierta

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
| `estructuras-de-datos` | Lección teórica — Herencia | `content/cursos/estructuras-de-datos/herencia.mdx` | ✅ |
| `estructuras-de-datos` | Lección teórica — Polimorfismo | `content/cursos/estructuras-de-datos/polimorfismo.mdx` | ✅ |
| `estructuras-de-datos` | Registro TS | `lib/courses/data/estructuras-de-datos.ts` (`order: 8`, `order: 9`, `order: 9.5`) | ✅ |
| `estructuras-de-datos` | Guía docente (modelo previo a esta restructuración) | `content/cursos/estructuras-de-datos/microdiseno/labs/lab-poo-jerarquia-de-clases-docente.md` | No, nunca |
| `estructuras-de-datos` | Guía estudiante | `content/cursos/estructuras-de-datos/guias/lab-poo-jerarquia-de-clases.md` | ✅ |
| `estructuras-de-datos` | Apunte de clase | `content/cursos/estructuras-de-datos/apuntes/lab-poo-jerarquia-de-clases.md` | Solo owner/admin |
| `programacion-cientifica` | Lección teórica | `content/cursos/programacion-cientifica/condicionales-y-bucles.mdx` | ✅ |
| `programacion-cientifica` | Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 3`) | ✅ |

> El laboratorio de Estructuras de Datos de esta semana se produjo con el
> modelo de artefactos **anterior** a la restructuración aplicada durante
> esta misma preparación (guía docente con minutado + apuntes, dos
> documentos). No se tocó retroactivamente: la restructuración aplica desde
> ahora en adelante, no reescribe lo ya producido de semanas previas salvo
> que se pida explícitamente.

## Evaluaciones creadas

### Cuestionarios de cierre

| Lección | IDs de preguntas | Publicadas | Montadas (verificado con `list_lesson_questions`) |
|---|---|---|---|
| `analisis-de-algoritmos` / `algoritmos-como-tecnologia` | `0729bf42-3178-4113-b351-0996ec6eeac4`, `0b23603d-7c56-45df-a296-c64fd6a53ab1`, `7c1976b6-23b3-4c5b-8cc2-748ea98f1fb0`, `b6222779-8ed2-4f72-875f-43e56296e7a2`, `c35e4cec-464f-42c1-a001-0355c5a42508`, `a20be389-9854-455f-9fbf-3562531d0a48` | ✅ (6/6) | ✅ (6/6, orden 0–5) |
| `estructuras-de-datos` / `herencia` | — | ⬜ | ⬜ **Pendiente** |
| `estructuras-de-datos` / `polimorfismo` | — | ⬜ | ⬜ **Pendiente** |
| `programacion-cientifica` / `condicionales-y-bucles` | — | ⬜ | ⬜ **Pendiente** |

Keywords nuevas creadas en el catálogo compartido (para AA):
`modelado-de-problemas`, `algoritmos`, `ordenamiento`, `insertion-sort`,
`invariante-de-ciclo`, `impacto-social`.

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

## Verificación

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 8 advertencias preexistentes sin relación)
- [x] Checklist de `lesson-authoring` §8 recorrido para los artefactos tocados en esta sesión (AA)
- [x] Coherencia cruzada AA: la lección instala insertion sort e invariante de ciclo; los apuntes los materializan en código; el cuestionario evalúa exactamente esas seis piezas
- [ ] `@reviewer`: **pendiente** — no se ha invocado todavía

## Despliegue y apertura

- **Merge a `development`:** pendiente
- **Deploy a producción:** pendiente
- **Lecciones abiertas:** ninguna todavía (no se ha llegado a F7)
- [ ] Verificado que las lecciones de semanas futuras siguen cerradas — no aplica aún

## Pendientes para la semana siguiente

- Crear los cuestionarios de cierre de `herencia`, `polimorfismo` y
  `condicionales-y-bucles` (Estructuras de Datos y Programación Científica) —
  quedaron sin cubrir en esta ronda.
- Confirmar con el usuario si el modelo antiguo de guía docente con minutado
  del laboratorio de Estructuras de Datos (`lab-poo-jerarquia-de-clases-docente.md`)
  se deja como está (ya se dictó/dicta con ese formato) o se migra al nuevo
  modelo de apuntes.
- Resultado de la reunión institucional del 19 de agosto de 2026 sobre el
  caso de evaluación de resultados de aprendizaje — de ahí dependen posibles
  ajustes a `info.md`/`cronograma-dia-a-dia.md` de Análisis de Algoritmos (no
  tocar sin aprobación explícita).
- Invocar `@reviewer` sobre el diff de `feat/semana-03-material` contra
  `development` antes de solicitar el merge.
