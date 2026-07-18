# test-021 — Guías de laboratorio como nodo de contenido del curso

> Casos manuales de UI/navegación para spec-021. Ejecutar con una sesión de
> estudiante matriculado salvo que el caso indique otro rol.
>
> **Curso de prueba:** `estructuras-de-datos`
> **Guía fixture:** `lab-01-listas-enlazadas` (declarada con `kind: "guide"`,
> archivo `content/cursos/estructuras-de-datos/guias/lab-01-listas-enlazadas.md`),
> intercalada entre dos lecciones existentes según su `order`.
> **Lección de control:** cualquier lección normal del mismo curso, usada para
> verificar que su comportamiento no cambió.

---

## Casos de prueba

### TC-001 — La guía aparece en el sidebar en su posición de orden
**Precondición:** Sesión de estudiante con matrícula activa en `estructuras-de-datos`.
**Pasos:**
1. Abrir cualquier lección del curso.
2. Observar el sidebar de escritorio.
**Resultado esperado:** La guía `lab-01-listas-enlazadas` aparece como un ítem
más del índice, **intercalada en la secuencia** según su `order` (entre las
lecciones que la rodean), no agrupada al final ni en una sección aparte.
**Estado:** ✅ Aprobado

### TC-002 — La guía se distingue visualmente de una lección
**Precondición:** La misma de TC-001.
**Pasos:**
1. Comparar el ítem de la guía con el de una lección normal en el sidebar.
**Resultado esperado:** El ítem de la guía es reconocible a simple vista como un
tipo distinto (icono/etiqueta propia en lugar del badge numérico de clase). La
diferencia no depende solo del color: sigue siendo perceptible en escala de
grises y el ítem expone su naturaleza al lector de pantalla (texto accesible
tipo "Guía de laboratorio").
**Estado:** ✅ Aprobado

### TC-003 — Abrir la guía renderiza el contenido del `.md`
**Precondición:** La misma de TC-001.
**Pasos:**
1. Hacer clic en la guía desde el sidebar.
**Resultado esperado:** La página carga y muestra el contenido del archivo
`.md`: títulos, listas, tablas y bloques de código con resaltado de sintaxis, con
el mismo tratamiento tipográfico que un artículo de lección.
**Estado:** ✅ Aprobado

### TC-004 — El header de la guía no la llama "Clase"
**Precondición:** Estar en la página de la guía.
**Pasos:**
1. Observar la línea superior del header, encima del título.
**Resultado esperado:** El eyebrow del header identifica la pieza como guía
(p. ej. "Estructuras de datos · Guía de laboratorio"), **no** como
"Estructuras de datos · Clase NN".
**Estado:** ✅ Aprobado

### TC-005 — La guía no muestra sección de asistencia
**Precondición:** Estudiante matriculado, **con una sesión de asistencia abierta**
en el curso (para que en una lección normal la sección sí aparezca).
**Pasos:**
1. Abrir una lección normal y confirmar que aparece el formulario de asistencia.
2. Abrir la guía.
**Resultado esperado:** En la guía **no** aparece ningún bloque de asistencia:
ni el formulario de código, ni el mensaje "sesión no abierta", ni "ya
registraste asistencia".
**Estado:** ✅ Aprobado

### TC-006 — La guía no muestra autoevaluación
**Precondición:** Estudiante matriculado.
**Pasos:**
1. Abrir una lección que tenga preguntas de autoevaluación publicadas y
   confirmar que la sección aparece.
2. Abrir la guía.
**Resultado esperado:** En la guía **no** aparece la sección de autoevaluación
ni ningún formulario de preguntas.
**Estado:** ✅ Aprobado

### TC-007 — La guía no muestra el cierre ni el botón "completar"
**Precondición:** Estudiante matriculado.
**Pasos:**
1. Desplazarse hasta el final de la página de la guía.
**Resultado esperado:** No hay bloque de cierre de lección ni botón "Marcar como
completada" / "Completar lección". El contenido termina en la paginación.
**Estado:** ✅ Aprobado

### TC-008 — La guía no altera la barra de progreso
**Precondición:** Estudiante matriculado. Anotar el porcentaje y el
"X de N" que muestra la barra de progreso del curso **antes** de la prueba.
**Pasos:**
1. Abrir la guía y leerla completa.
2. Volver a una lección y observar la barra de progreso del sidebar.
**Resultado esperado:** El denominador `N` **no** incluye la guía y el
porcentaje no cambió por haberla visitado. El conteo es idéntico al anotado
antes de la prueba.
**Estado:** ✅ Aprobado

### TC-009 — La guía nunca es destino del redirect de reanudación
**Precondición:** Estudiante matriculado cuyo punto de reanudación natural
(primera lección sin completar) sea **la lección inmediatamente posterior a la
guía**; es decir, completar todas las lecciones anteriores a la guía.
**Pasos:**
1. Navegar a `/estructuras-de-datos`.
**Resultado esperado:** El redirect cae en una **lección**, saltándose la guía.
La URL final nunca es la de la guía.
**Estado:** ✅ Aprobado

### TC-010 — Paginación anterior/siguiente atraviesa la guía
**Precondición:** Estar en la lección inmediatamente anterior a la guía.
**Pasos:**
1. Pulsar "Siguiente".
2. En la guía, pulsar "Siguiente" de nuevo.
3. Pulsar "Anterior" dos veces para volver.
**Resultado esperado:** La navegación recorre la secuencia completa incluyendo
la guía, en el orden declarado, sin enlaces rotos ni saltos. Las tarjetas de
prev/next hacia la guía muestran su título correctamente y son enlaces activos
(no aparecen deshabilitadas/"Próximamente").
**Estado:** ✅ Aprobado

### TC-011 — La guía es visible en el sidebar móvil
**Precondición:** Viewport móvil (< 1024 px), estudiante matriculado.
**Pasos:**
1. Abrir una lección y pulsar "Índice del curso".
2. Localizar la guía en el drawer y abrirla.
**Resultado esperado:** La guía aparece en el drawer con la misma
diferenciación visual que en escritorio, en su posición de orden, y al pulsarla
navega a la guía y el drawer se cierra.
**Estado:** ✅ Aprobado

### TC-012 — La guía es privada: sin matrícula no se accede
**Precondición:** Sesión de un usuario **sin matrícula** en `estructuras-de-datos`
(y que no sea docente dueño ni admin).
**Pasos:**
1. Navegar por URL directa a la ruta de la guía.
**Resultado esperado:** El acceso se deniega con el **mismo** comportamiento que
una lección del curso (redirect al mismo destino que produce una lección
protegida). No se filtra el contenido de la guía.
**Estado:** ✅ Aprobado

### TC-013 — Visitante anónimo no accede a la guía
**Precondición:** Sesión cerrada (usuario anónimo).
**Pasos:**
1. Navegar por URL directa a la ruta de la guía.
**Resultado esperado:** Redirect al login, igual que con una lección.
**Estado:** ✅ Aprobado

### TC-014 — Docente/admin ve la guía sin bloques de estudiante
**Precondición:** Sesión de docente dueño del curso (o admin), **sin** matrícula.
**Pasos:**
1. Abrir la guía.
**Resultado esperado:** El contenido de la guía se muestra completo. Igual que
hoy ocurre con las lecciones para este rol, no aparecen asistencia,
autoevaluación ni cierre.
**Estado:** ✅ Aprobado

### TC-015 — Guía declarada sin archivo `.md` no rompe el curso
**Precondición:** Declarar temporalmente en los datos del curso una guía cuyo
archivo `.md` **no** exista.
**Pasos:**
1. Ejecutar `npm run build` (o arrancar `npm run dev`).
**Resultado esperado:** El fallo es **explícito y temprano**, con un mensaje que
nombra la guía y la ruta esperada del `.md` — el mismo trato que hoy recibe una
lección con `articleSlug` sin artículo. No se sirve una página en blanco ni un
error genérico en runtime.
**Estado:** ✅ Aprobado

### TC-016 — Las lecciones normales no sufrieron regresión
**Precondición:** Estudiante matriculado, sesión de asistencia abierta y lección
con autoevaluación publicada.
**Pasos:**
1. Abrir una lección normal.
2. Verificar asistencia, autoevaluación, cierre y botón de completar.
3. Marcar la lección como completada.
**Resultado esperado:** Todo el flujo de cierre de lección funciona exactamente
igual que antes de spec-021: la sección de asistencia aparece, la autoevaluación
bloquea el cierre si es obligatoria, el botón completa la lección y la barra de
progreso avanza.
**Estado:** ✅ Aprobado

### TC-017 — El check de completada no aparece en la guía
**Precondición:** Estudiante matriculado con varias lecciones completadas.
**Pasos:**
1. Observar el ítem de la guía en el sidebar.
**Resultado esperado:** La guía nunca muestra el indicador de "completada"
(check verde), independientemente del progreso del curso.
**Estado:** ✅ Aprobado

### TC-018 — La guía no renumera las clases
**Precondición:** Estudiante matriculado. La guía está intercalada entre dos
lecciones (no al principio ni al final del curso).
**Pasos:**
1. Recorrer el sidebar de arriba abajo anotando el número visible de cada
   lección.
2. Abrir la lección inmediatamente **posterior** a la guía y leer el eyebrow del
   header ("… · Clase NN").
**Resultado esperado:** La numeración de clases es **contigua** (01, 02, 03…)
saltando la guía, que no consume número. El número que muestra el header de una
lección coincide exactamente con el que muestra su ítem en el sidebar. Insertar
la guía no desplazó la numeración de las lecciones posteriores.
**Estado:** ✅ Aprobado

---

## Notas de ejecución

- Los casos TC-005 y TC-006 requieren que la lección de control tenga
  efectivamente asistencia abierta y preguntas publicadas; de lo contrario el
  paso 1 no demuestra nada y el caso debe repetirse con datos válidos.
- TC-015 es destructivo sobre los datos del curso: revertir la declaración
  temporal al terminar.
