# test-059 — Ponderación de notas, cortes institucionales y nota a la fecha

## Datos de prueba
> Se parte de los datos de `npm run seed:dev` en `nodo-dev`. Los ítems de
> calificación, cortes y notas **no tienen endpoint de API** (no existe
> `/api/grades/*` ni herramienta MCP que los cree): se crean desde la UI de la
> planilla **como parte de los propios casos**, que son justamente lo que se
> prueba. Se registran abajo para poder limpiarlos al cerrar la ronda.

**Recursos base (de `seed:dev`, no se crean ni se eliminan):**

| Recurso | Identificador | Uso en esta ronda |
|---------|---------------|-------------------|
| Docente de desarrollo | `dev@nodo.local` / `TEACHER_PASSWORD` de `.env.local` | Dueño de los tres cursos DEV. |
| Curso "DEV — Estructuras de Datos" | código `DEVEDD2026` | Curso ponderado principal (TC-059-01 a -10, -12 a -14). |
| Curso "DEV — Análisis de Algoritmos" | código `DEVADA2026` | Caso de estudiante retirado (TC-059-11). |
| Curso "DEV — Programación Científica" | código `DEVPC2026` | Curso **sin** ponderar: modo promedio simple (TC-059-10). |
| Estudiante "Estudiante Dev Uno" | `dev-estudiante1@nodo.local` / `DevStudent2026!` | Activo en DEVEDD2026 y DEVADA2026. |
| Estudiante "Estudiante Dev Dos" | `dev-estudiante2@nodo.local` / `DevStudent2026!` | Activo en DEVEDD2026. |
| Estudiante "Estudiante Dev Tres" | `dev-estudiante3@nodo.local` / `DevStudent2026!` | Activo en DEVPC2026. |

**Recursos creados durante la ronda:**

| Recurso | Creación | Identificador | Eliminado |
|---------|----------|---------------|-----------|
| Cortes "Nota 1", "Nota 2", "Nota 3" en DEVEDD2026 | UI planilla (TC-059-04) | {{ids}} | ⬜ |
| Ítems "Quiz 1" (0.1, Nota 1), "Taller 1" (0.1, Nota 1), "Quiz 2" (0.2, Nota 2), "Parcial 1" (0.2, Nota 3) en DEVEDD2026 | UI planilla (TC-059-01, -04) | {{ids}} | ⬜ |
| Ítem "Final" (0.4) en DEVEDD2026 | UI planilla (TC-059-02) | {{id}} | ⬜ |
| Ítem "Bonus" (sin ponderar) en DEVEDD2026 | UI planilla (TC-059-03) | {{id}} | ⬜ |
| Notas de dev-estudiante1 y dev-estudiante2 en DEVEDD2026 | UI planilla (TC-059-05) | — | ⬜ |
| Ítem "Taller ADA" (0.5) + nota 4.0 de dev-estudiante1 en DEVADA2026 | UI planilla (TC-059-11) | {{id}} | ⬜ |
| Ítems "Taller PC" y "Quiz PC" (sin ponderar) + notas 3.0 y 4.0 de dev-estudiante3 en DEVPC2026 | UI planilla (TC-059-10) | {{ids}} | ⬜ |
| Retiro de dev-estudiante1 de DEVADA2026 | `students-mcp unenroll_student` (TC-059-11) | {{enrollment_id}} | ⬜ (revertir con `students-mcp enroll_student`, que reactiva — spec-056) |

**Limpieza (orden inverso):** reactivar a dev-estudiante1 en DEVADA2026 →
vaciar las notas registradas (dejar cada celda vacía; `deleteGradeItem`
rechaza ítems con notas) → eliminar ítems → eliminar cortes. Si el ítem de
autoevaluaciones (TC-059-13) llegó a crearse, **no se puede eliminar**
(spec-040 D5): dejarlo y anotarlo aquí con su id.

**Entorno de pruebas:** desarrollo (`nodo-dev`, `npm run dev` en el puerto 3002)
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-059-01 — Definir pesos y ver el resumen de ponderación
**Precondición:** DEVEDD2026 sin ítems de calificación.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Iniciar sesión como docente y abrir la pestaña "Calificaciones" de
   "DEV — Estructuras de Datos".
2. Crear "Quiz 1" con peso `0.1`, "Taller 1" con `0.1`, "Quiz 2" con `0.2` y
   "Parcial 1" con `0.2`.
**Resultado esperado:** cada ítem muestra su peso como fracción y porcentaje
(p. ej. "0.10 · 10 %"). El resumen dice "Ponderación definida 0.60 / 1.00 —
disponible 0.40". No hay aviso de ítems sin ponderar.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-02 — Rechazo al superar 1.00
**Precondición:** TC-059-01 aprobado (suma 0.60).
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Intentar crear "Final" con peso `0.5`.
2. Crear "Final" con peso `0.4`.
3. Editar "Quiz 1" y cambiar su peso a `0.2`.
4. Intentar crear un ítem con peso `1.5` y otro con peso `0`.
**Resultado esperado:**
1. Se rechaza con un mensaje que indica que la suma superaría 1.00 y que el
   disponible es 0.40; el ítem no se crea.
2. Se crea; el resumen muestra "1.00 / 1.00 — disponible 0.00".
3. Se rechaza (disponible 0.00); "Quiz 1" conserva `0.1`.
4. Ambos se rechazan con un mensaje de validación del rango (mayor que 0,
   máximo 1).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-03 — Ítem sin ponderar advertido
**Precondición:** TC-059-02 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Crear "Bonus" dejando el peso vacío.
**Resultado esperado:** "Bonus" se crea con la insignia "Sin ponderar" y el
panel muestra un aviso del tipo "Hay 1 ítem sin ponderar: no cuenta en la
nota a la fecha". La suma sigue en 1.00.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-04 — Crear cortes y asignar ítems
**Precondición:** TC-059-03 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. En la sección "Cortes", crear "Nota 1", "Nota 2" y "Nota 3".
2. Asignar "Quiz 1" y "Taller 1" a "Nota 1", "Quiz 2" a "Nota 2" y
   "Parcial 1" a "Nota 3". Dejar "Final" y "Bonus" sin corte.
3. Intentar crear otro corte llamado "Nota 1".
**Resultado esperado:**
1–2. Cada corte muestra su peso derivado: Nota 1 = 0.20 (20 %), Nota 2 =
   0.20, Nota 3 = 0.20. En la vista "Por ítem" de la planilla los encabezados
   aparecen agrupados por corte, con "Final" y "Bonus" al final, sin corte.
3. Se rechaza por nombre duplicado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-05 — Acumulado y promedio en la planilla
**Precondición:** TC-059-04 aprobado; dev-estudiante1 y dev-estudiante2
activos en DEVEDD2026.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Para "Estudiante Dev Uno", registrar Quiz 1 = `4.0`, Taller 1 = `3.0`,
   Quiz 2 = `4.5`. Dejar vacíos Parcial 1, Final y Bonus.
2. Para "Estudiante Dev Dos", registrar Quiz 1 = `2.0`, Quiz 2 = `0`. Dejar
   vacío Taller 1 y el resto.
3. Para "Estudiante Dev Uno", registrar Bonus = `5.0`.
**Resultado esperado:**
1. Dev Uno: **Acumulado 1.60**, **Promedio 4.00** (0.4 + 0.3 + 0.9 = 1.6;
   1.6 / 0.4). Las cifras se actualizan al guardar cada celda, sin recargar.
2. Dev Dos: **Acumulado 0.20**, **Promedio 0.67** (0.2 / 0.3, redondeado
   hacia arriba).
3. Las cifras de Dev Uno **no cambian** (Bonus sin ponderar).
Junto a la tabla se lee la ayuda "Celda vacía: sin calificar… Si el
estudiante no entregó, registra 0". La columna "Total" ya no existe.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-06 — Vista "Por corte" y copia para la plataforma institucional
**Precondición:** TC-059-05 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Cambiar la planilla a la vista "Por corte".
2. Pulsar "Copiar columna" en "Nota 1" y pegar el portapapeles en un editor
   de texto.
**Resultado esperado:**
1. Una fila por estudiante, ordenada por nombre. Dev Uno: Nota 1 = **3.50**,
   Nota 2 = **4.50**, Nota 3 = "—". Dev Dos: Nota 1 = **2.00** con marca
   "incompleto" (falta Taller 1), Nota 2 = **0.00**, Nota 3 = "—". Columnas
   Acumulado y Promedio iguales a TC-059-05. Aviso de que "Final" y "Bonus"
   no pertenecen a ningún corte. La vista no permite editar notas.
2. Se pegan dos líneas, en el orden de la tabla, con las notas de "Nota 1"
   (`3.50` y `2.00`).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-07 — Celda vacía vs. 0 explícito
**Precondición:** TC-059-05 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Para Dev Dos, registrar Taller 1 = `0`.
2. Volver a dejar vacía la celda Taller 1 de Dev Dos.
**Resultado esperado:**
1. Dev Dos: Acumulado sigue en 0.20, Promedio baja a **0.50** (0.2 / 0.4);
   en "Por corte", Nota 1 = **1.00** sin marca "incompleto".
2. Vuelve a Promedio 0.67 y Nota 1 = 2.00 "incompleto".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-08 — Eliminar un corte no borra pesos ni notas
**Precondición:** TC-059-05 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Eliminar el corte "Nota 3" (confirmar el diálogo).
2. Crear de nuevo "Nota 3" y reasignarle "Parcial 1".
**Resultado esperado:**
1. Se pide confirmación. "Parcial 1" queda sin corte, conserva su peso 0.2;
   la suma sigue en 1.00 y las cifras de los estudiantes no cambian.
2. "Nota 3" vuelve a pesar 0.20.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-09 — Vista del estudiante: "Mis notas" y detalle de matrícula
**Precondición:** TC-059-05 y TC-059-08 aprobados.
**Datos de prueba usados:** `dev-estudiante1@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Iniciar sesión como Dev Uno y abrir "Mis notas" (`/cuenta/notas`).
2. Abrir el detalle de la matrícula de "DEV — Estructuras de Datos" desde
   `/cuenta/cursos`.
3. Observar la lista `/cuenta/cursos`.
**Resultado esperado:**
1. La tarjeta del curso agrupa los ítems por corte; cada ítem muestra su peso
   (p. ej. "10 %"); cada corte muestra su nota (Nota 1 = 3.50, Nota 2 = 4.50,
   Nota 3 = "—"); "Bonus" aparece marcado "sin ponderar — no cuenta". El
   bloque de nota a la fecha muestra "Llevas **1.60** de 5.00" y "Promedio en
   lo evaluado **4.00**", cada una con una explicación breve (lo calificado
   equivale al 40 % del curso). El promedio aparece en verde; el acumulado en
   color neutro.
2. El detalle muestra el mismo bloque y las mismas cifras.
3. La fila del curso muestra el promedio 4.00 como cifra principal y el
   acumulado 1.60 como secundaria.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-10 — Curso sin ponderar: promedio simple rotulado
**Precondición:** DEVPC2026 con "Taller PC" y "Quiz PC" **sin peso**, creados
por el docente desde la planilla; dev-estudiante3 con 3.0 y 4.0.
**Datos de prueba usados:** `dev@nodo.local`; `dev-estudiante3@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Como docente, ver la planilla de "DEV — Programación Científica".
2. Como Dev Tres, abrir "Mis notas".
**Resultado esperado:**
1. El panel indica que el curso no tiene ponderaciones definidas; la planilla
   muestra promedio simple **3.50** rotulado como tal.
2. El estudiante ve "Promedio simple **3.50**" con el texto "tu docente aún
   no ha definido el peso de cada nota"; no aparece "Llevas X de 5".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-11 — Estudiante retirado ve su nota ponderada
**Precondición:** en DEVADA2026, ítem "Taller ADA" con peso 0.5 y nota 4.0
para dev-estudiante1. Luego, retirar a dev-estudiante1 de DEVADA2026 con
`students-mcp unenroll_student`.
**Datos de prueba usados:** `dev-estudiante1@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Iniciar sesión como Dev Uno y abrir "Mis notas".
**Resultado esperado:** "DEV — Análisis de Algoritmos" aparece en "Cursos
retirados" con Acumulado **2.00** y Promedio **4.00**, sin desglose de
ítems. "DEV — Estructuras de Datos" sigue en "Cursos activos" sin cambios.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-12 — Panel de matrícula del docente
**Precondición:** TC-059-05 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la página principal del curso "DEV — Estructuras de Datos" en el
   panel docente (tabla de estudiantes matriculados).
**Resultado esperado:** cada estudiante muestra acumulado y promedio (Dev
Uno 1.60 · 4.00; Dev Dos 0.20 · 0.67), coherentes con la planilla.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-13 — Ponderar el ítem de autoevaluaciones
**Precondición:** existe el ítem "Autoevaluaciones" en DEVEDD2026 (se crea
cuando un estudiante responde la autoevaluación de una lección habilitada con
preguntas publicadas). Si el curso DEV no tiene lecciones con autoevaluación
disponibles en `nodo-dev`, marcar el caso como bloqueado y anotarlo.
Liberar peso antes: cambiar "Final" a `0.3` (suma 0.90).
**Datos de prueba usados:** `dev@nodo.local`; `dev-estudiante1@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Como Dev Uno, responder una autoevaluación en Estructuras de Datos.
2. Como docente, en la planilla, asignar peso `0.1` y corte "Nota 3" al ítem
   "Autoevaluaciones".
3. Intentar eliminar el ítem "Autoevaluaciones".
**Resultado esperado:**
2. Se guarda; la suma queda en 1.00; Nota 3 pasa a pesar 0.30 y el acumulado
   y promedio de Dev Uno incluyen la nota de autoevaluaciones. La celda sigue
   siendo de solo lectura (spec-040).
3. Se rechaza con el mensaje actual de spec-040.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-14 — Modo claro/oscuro y ancho móvil
**Precondición:** TC-059-06 y TC-059-09 aprobados.
**Datos de prueba usados:** `dev@nodo.local`; `dev-estudiante1@nodo.local`
**Pasos:**
1. Revisar la planilla (ambas vistas), el panel de ítems y "Mis notas" en modo
   claro y oscuro del sistema operativo.
2. Revisar "Mis notas" y la vista "Por corte" a ancho de móvil.
**Resultado esperado:** colores según la tabla de `DESIGN.md` (insignias de
advertencia para "Sin ponderar" e "incompleto", verde/rojo solo en el
promedio). En móvil, la tabla se desplaza horizontalmente sin desbordar la
página y la columna del estudiante queda fija.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: 0 — Fallidos: 0 — Pendientes: 14
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
