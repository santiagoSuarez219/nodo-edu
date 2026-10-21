# test-059 — Ponderación de notas, cortes institucionales y nota a la fecha

## Datos de prueba
> Se parte de los datos de `npm run seed:dev` en `nodo-dev`. Los ítems de
> calificación, cortes y notas **no tienen endpoint de API** (no existe
> `/api/grades/*` ni herramienta MCP que los cree): se crean desde la UI de la
> planilla **como parte de los propios casos**, que son justamente lo que se
> prueba. Los retiros/reactivaciones se hacen vía `students-mcp`.
> Todo se registra abajo para limpiarlo al cerrar la ronda.

**Recursos base (de `seed:dev`, no se crean ni se eliminan):**

| Recurso | Identificador | Uso en esta ronda |
|---------|---------------|-------------------|
| Docente de desarrollo | `dev@nodo.local` / `TEACHER_PASSWORD` de `.env.local` | Dueño de los tres cursos DEV. |
| Curso "DEV — Estructuras de Datos" | código `DEVEDD2026` | Curso ponderado principal. |
| Curso "DEV — Análisis de Algoritmos" | código `DEVADA2026` | Retirado (TC-059-13) y choque de nombre (TC-059-16). |
| Curso "DEV — Programación Científica" | código `DEVPC2026` | Curso **sin** ponderar (TC-059-12). |
| Estudiante "Estudiante Dev Uno" | `dev-estudiante1@nodo.local` / `DevStudent2026!` | Activo en DEVEDD2026 y DEVADA2026. |
| Estudiante "Estudiante Dev Dos" | `dev-estudiante2@nodo.local` / `DevStudent2026!` | Activo en DEVEDD2026. |
| Estudiante "Estudiante Dev Tres" | `dev-estudiante3@nodo.local` / `DevStudent2026!` | Activo en DEVPC2026. |

**Recursos creados durante la ronda:**

| Recurso | Creación | Identificador | Eliminado |
|---------|----------|---------------|-----------|
| Cortes "Nota 1", "Nota 2", "Nota 3" (objetivo 0.20 c/u) en DEVEDD2026 | UI planilla (TC-059-04) | {{ids}} | ⬜ |
| Ítems "Quiz 1" (0.1, Nota 1), "Taller 1" (0.1, Nota 1), "Quiz 2" (0.2, Nota 2), "Parcial 1" (0.2, Nota 3), "Final" (0.4 → 0.3), "Bonus" (sin peso) en DEVEDD2026 | UI planilla (TC-059-01 a -04, -15) | {{ids}} | ⬜ |
| Ítem "Autoevaluaciones" (`kind='self_assessment'`) en DEVEDD2026 | Botón "Crear ítem de autoevaluaciones" (TC-059-15) | {{id}} | ❌ No eliminable por diseño (spec-040 D5): queda como dato permanente de desarrollo |
| Notas de Dev Uno y Dev Dos en DEVEDD2026 | UI planilla (TC-059-07, -09) | — | ⬜ |
| Ítem manual "Autoevaluaciones" en DEVADA2026 | UI planilla (TC-059-16) | {{id}} | ⬜ (se elimina en el mismo caso) |
| Ítem "Taller ADA" (0.5) + nota 4.0 de Dev Uno en DEVADA2026 | UI planilla (TC-059-13) | {{id}} | ⬜ |
| Ítems "Taller PC" y "Quiz PC" (sin peso) + notas 3.0 y 4.0 de Dev Tres en DEVPC2026 | UI planilla (TC-059-12) | {{ids}} | ⬜ |
| Retiro de Dev Uno de DEVADA2026 | `students-mcp unenroll_student` (TC-059-13) | {{enrollment_id}} | ⬜ (revertir con `enroll_student`, que reactiva — spec-056) |

**Limpieza (orden inverso):** reactivar a Dev Uno en DEVADA2026 →
vaciar las notas registradas (dejar cada celda vacía; `deleteGradeItem`
rechaza ítems con notas) → eliminar ítems (excepto "Autoevaluaciones"
automático) → eliminar cortes.

**Entorno de pruebas:** desarrollo (`nodo-dev`, `npm run dev` en el puerto 3002)
**Fecha de la ronda:** 2026-10-21 (servidor de la rama en el puerto 3003; DEV-EDD id `9f423f49-dbe5-4d73-89f8-9f27ac5fe068`)

## Casos de prueba

### TC-059-01 — Definir pesos y ver el resumen de ponderación
**Precondición:** DEVEDD2026 sin ítems de calificación.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Iniciar sesión como docente y abrir "Calificaciones" de "DEV — Estructuras de Datos".
2. Crear "Quiz 1" (`0.1`), "Taller 1" (`0.1`), "Quiz 2" (`0.2`) y "Parcial 1" (`0.2`).
**Resultado esperado:** cada ítem muestra su peso como fracción y porcentaje
("0.10 · 10 %"). El resumen dice "Ponderación definida 0.60 / 1.00 —
disponible 0.40". Sin aviso de ítems sin ponderar.
**Estado:** ✅ Aprobado
**Hallazgos:** Aprobado por el usuario (2026-10-21). Observación: el botón "Eliminar" de cada fila se ve recortado en el borde derecho del panel.

### TC-059-02 — Rechazo cuando los pesos de ítems superan 1.00
**Precondición:** TC-059-01 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Intentar crear "Final" con `0.5`.
2. Crear "Final" con `0.4`.
3. Editar "Quiz 1" a `0.2`.
4. Intentar crear ítems con peso `1.5` y `0`.
**Resultado esperado:**
1. Rechazo: "la suma superaría 1.00 — disponible 0.40"; no se crea.
2. Se crea; resumen "1.00 / 1.00 — disponible 0.00".
3. Rechazo (disponible 0.00); "Quiz 1" conserva `0.1`.
4. Ambos rechazados por rango (mayor que 0, máximo 1).
**Estado:** ✅ Aprobado
**Hallazgos:** Aprobado por el usuario (2026-10-21). Paso 3: el mensaje dice "Disponible: 0.10" (descuenta el peso propio del ítem) en vez de 0.00; el rechazo es correcto y Quiz 1 conserva 0.1.

### TC-059-03 — Ítem sin ponderar advertido
**Precondición:** TC-059-02 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Crear "Bonus" con el peso vacío.
**Resultado esperado:** insignia "Sin ponderar" y aviso "Hay 1 ítem sin
ponderar: no cuenta en la nota a la fecha". La suma sigue en 1.00.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-04 — Crear cortes con peso objetivo y asignar ítems
**Precondición:** TC-059-03 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. En "Cortes", crear "Nota 1", "Nota 2" y "Nota 3", cada uno con peso objetivo `0.2`.
2. Asignar "Quiz 1" y "Taller 1" a "Nota 1", "Quiz 2" a "Nota 2", "Parcial 1" a "Nota 3". "Final" y "Bonus" sin corte.
3. Intentar crear otro corte "Nota 1".
**Resultado esperado:**
1–2. Cada corte muestra "objetivo 0.20 · ítems 0.20" sin aviso. En la vista
   "Por ítem" los encabezados se agrupan por corte, con "Final" y "Bonus" al
   final. Resumen de cortes "0.60 / 1.00".
3. Rechazo por nombre duplicado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-05 — Rechazo cuando los pesos objetivo de los cortes superan 1.00
**Precondición:** TC-059-04 aprobado (cortes suman 0.60).
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Intentar crear "Nota 4" con objetivo `0.5`.
2. Editar "Nota 1" a objetivo `0.7`.
**Resultado esperado:** ambos se rechazan con "la suma de pesos de cortes
superaría 1.00 — disponible 0.40"; nada cambia.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-06 — Aviso de desajuste entre ítems y objetivo del corte
**Precondición:** TC-059-04 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Quitar "Taller 1" de "Nota 1".
2. Volver a asignarlo; luego asignar "Final" a "Nota 3".
3. Quitar "Final" de "Nota 3".
**Resultado esperado:**
1. "Nota 1" muestra el aviso "los ítems suman 0.10 de 0.20" (advertencia, no error).
2. "Nota 1" sin aviso; "Nota 3" muestra "los ítems suman 0.60 de 0.20".
3. Sin avisos. En ningún paso se bloquea el guardado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-07 — Acumulado y promedio en la planilla
**Precondición:** TC-059-06 aprobado; Dev Uno y Dev Dos activos en DEVEDD2026.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Dev Uno: Quiz 1 = `4.0`, Taller 1 = `3.5`, Quiz 2 = `4.5`; resto vacío.
2. Dev Dos: Quiz 1 = `2.0`, Quiz 2 = `3.74`; Taller 1 y resto vacíos.
3. Dev Uno: Bonus = `5.0`.
**Resultado esperado:**
1. Dev Uno: **Acumulado 1.65**, **Promedio 4.13** (1.65 / 0.40 = 4.125 →
   mitad hacia arriba). Se actualiza al guardar cada celda, sin recargar.
2. Dev Dos: **Acumulado 0.95**, **Promedio 3.16**.
3. Dev Uno sin cambios (Bonus sin ponderar).
Se ve la ayuda "Celda vacía: sin calificar… Si el estudiante no entregó,
registra 0". La columna "Total" ya no existe.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-08 — Vista "Por corte": orden, 1 decimal con coma y copia
**Precondición:** TC-059-07 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Cambiar a la vista "Por corte".
2. "Copiar columna" en "Nota 1" y pegar en un editor de texto.
3. "Copiar columna" en "Nota 3" y pegar.
**Resultado esperado:**
1. Filas en el orden de spec-062 D16: si spec-062 está desplegado, por
   apellido con "Apellidos, Nombres" ("Dev Dos, Estudiante" antes que "Dev Uno,
   Estudiante"); si no, por nombre completo ("Estudiante Dev Dos" antes que
   "Estudiante Dev Uno") con el aviso "Orden por nombre completo…". En ambos
   casos Dev Dos va primero. Dev Dos: Nota 1 = **2,0** "incompleto", Nota 2 =
   **3,7** (3.74 → 3,7). Dev Uno: Nota 1 = **3,8** (3.75 → 3,8), Nota 2 = **4,5**,
   Nota 3 = vacío. Acumulado y Promedio en 2 decimales con punto, iguales a
   TC-059-07. Avisos: "Final" y "Bonus" sin corte; posible diferencia de
   centésimas con la definitiva institucional. No se puede editar.
2. Dos líneas: `2,0` y `3,8`, en ese orden. Junto al botón: "1 fila incompleta".
3. Dos líneas vacías (ninguno tiene nota en Nota 3), sin desalinear.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-09 — Celda vacía vs. 0 explícito
**Precondición:** TC-059-07 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Dev Dos: Taller 1 = `0`.
2. Volver a dejar vacía esa celda.
**Resultado esperado:**
1. Dev Dos: Acumulado **0.95**, Promedio **2.37**; en "Por corte", Nota 1 = **1,0** sin "incompleto".
2. Vuelve a Promedio 3.16 y Nota 1 = 2,0 "incompleto".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-10 — Eliminar un corte no borra pesos ni notas
**Precondición:** TC-059-07 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Eliminar "Nota 3" (confirmar).
2. Crear de nuevo "Nota 3" (objetivo `0.2`) y reasignar "Parcial 1".
**Resultado esperado:**
1. Pide confirmación. "Parcial 1" queda sin corte con peso 0.2; suma de
   ítems 1.00; cortes 0.40; cifras de estudiantes sin cambios.
2. "Nota 3" vuelve con "objetivo 0.20 · ítems 0.20".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-11 — Vista del estudiante: cifras, pesos y corte incompleto visible
**Precondición:** TC-059-10 aprobado.
**Datos de prueba usados:** `dev-estudiante1@nodo.local` y `dev-estudiante2@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Como Dev Uno, abrir "Mis notas" (`/cuenta/notas`), luego el detalle de la
   matrícula de Estructuras de Datos y la lista `/cuenta/cursos`.
2. Como Dev Dos, abrir "Mis notas".
**Resultado esperado:**
1. Ítems agrupados por corte con su peso ("10 %") y nota de ítem con 2
   decimales; nota de corte en formato institucional: Nota 1 = **3,8**, Nota 2 =
   **4,5**, Nota 3 = "—"; "Bonus" marcado "sin ponderar — no cuenta". Bloque de
   nota a la fecha: "Llevas **1.65** de 5.00" y "Promedio en lo evaluado
   **4.13**", cada una con su explicación (lo calificado equivale al 40 % del
   curso). Promedio en verde, acumulado neutro. El detalle muestra lo mismo;
   la lista muestra 4.13 como cifra principal y 1.65 secundaria.
2. Nota 1 = **2,0** con la marca "incompleto" y "faltan notas en este
   corte"; Nota 2 = **3,7**; Promedio **3.16** en verde; Acumulado 0.95 neutro
   (nota total con 2 decimales y punto, D11).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-12 — Curso sin ponderar: promedio simple rotulado
**Precondición:** DEVPC2026 con "Taller PC" y "Quiz PC" **sin peso** (creados por el docente) y notas 3.0 y 4.0 de Dev Tres.
**Datos de prueba usados:** `dev@nodo.local`; `dev-estudiante3@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Como docente, ver la planilla de "DEV — Programación Científica".
2. Como Dev Tres, abrir "Mis notas".
**Resultado esperado:**
1. Aviso de curso sin ponderaciones; promedio **3.50** rotulado "Promedio simple (sin ponderar)".
2. "Promedio simple (sin ponderar) **3.50**" con "tu docente aún no ha
   definido el peso de cada nota"; no aparece "Llevas X de 5".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-13 — Estudiante retirado ve su nota ponderada
**Precondición:** en DEVADA2026, "Taller ADA" (0.5) con 4.0 para Dev Uno; luego retirar a Dev Uno con `students-mcp unenroll_student`.
**Datos de prueba usados:** `dev-estudiante1@nodo.local` / `DevStudent2026!`
**Pasos:**
1. Como Dev Uno, abrir "Mis notas".
**Resultado esperado:** "DEV — Análisis de Algoritmos" en "Cursos retirados"
con Acumulado **2.00** y Promedio **4.00**, sin desglose. Estructuras de
Datos sigue en "Cursos activos" sin cambios.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-14 — Panel de matrícula del docente
**Precondición:** TC-059-07 aprobado.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Abrir la página principal del curso "DEV — Estructuras de Datos" en el panel docente.
**Resultado esperado:** Dev Uno "1.65 · 4.13"; Dev Dos "0.95 · 3.16", coherentes con la planilla.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-15 — Botón "Crear ítem de autoevaluaciones"
**Precondición:** DEVEDD2026 **sin** ítem de autoevaluaciones (si ya existe, el
botón no debe verse: anotarlo y saltar a los pasos 4–5). Cambiar "Final" a
`0.3` (suma 0.90).
**Datos de prueba usados:** `dev@nodo.local`; `dev-estudiante1@nodo.local`
**Pasos:**
1. Pulsar "Crear ítem de autoevaluaciones" dos veces seguidas, rápido.
2. Recargar la planilla.
3. Asignar al ítem peso `0.1` y corte "Nota 3".
4. Intentar eliminar el ítem "Autoevaluaciones".
5. (Si hay una lección de Estructuras de Datos con autoevaluación publicada en
   `nodo-dev`) Como Dev Uno, responderla; como docente, recargar la planilla.
**Resultado esperado:**
1–2. Existe **un solo** ítem "Autoevaluaciones", con celda de solo lectura;
   el botón desaparece.
3. Se guarda; suma de ítems 1.00; "Nota 3" muestra "ítems 0.30 de 0.20"
   (aviso de desajuste).
4. Rechazo con el mensaje de spec-040.
5. La nota de Dev Uno aparece en **ese** ítem (no se crea un segundo
   "Autoevaluaciones") y entra en su acumulado y promedio.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-16 — Ítem manual con el nombre "Autoevaluaciones"
**Precondición:** DEVADA2026 sin ítem automático de autoevaluaciones.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. En DEVADA2026 crear un ítem manual llamado "Autoevaluaciones".
2. Pulsar "Crear ítem de autoevaluaciones".
3. Eliminar el ítem manual.
**Resultado esperado:** 2. Mensaje "Ya existe un ítem manual llamado
'Autoevaluaciones'; renómbralo para crear el automático." y no se crea nada.
3. Se elimina sin problema.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-059-17 — Modo claro/oscuro y ancho móvil
**Precondición:** TC-059-08 y TC-059-11 aprobados.
**Datos de prueba usados:** `dev@nodo.local`; `dev-estudiante1@nodo.local`
**Pasos:**
1. Revisar la planilla (ambas vistas), el panel de ítems y cortes y "Mis notas"
   en modo claro y oscuro.
2. Revisar "Mis notas" y "Por corte" a ancho de móvil.
**Resultado esperado:** colores según `DESIGN.md` (insignias de advertencia
para "Sin ponderar", "incompleto" y desajuste; verde/rojo solo en
el promedio). En móvil la tabla se desplaza horizontalmente sin desbordar la
página y la columna del estudiante queda fija.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: 0 — Fallidos: 0 — Pendientes: 17
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
