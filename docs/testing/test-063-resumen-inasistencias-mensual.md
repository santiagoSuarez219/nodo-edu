# test-063 — Resumen mensual de inasistencias en horas

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.
>
> **Limpieza (2026-10-24, autorizada por el usuario):** estudiantes E1–E5 por `DELETE /api/students/{id}` (E6, creada solo para TC-MCP-063-002, se borró antes); cursos R, X, V y Z (creado por el usuario en TC-063-004) y docente2 por REST/Admin API con service_role (no hay endpoint, DEBT-076); las sesiones y asistencias se fueron con los cursos. Verificado: sin cursos `T063-*`, sin sesiones de prueba, sin roles de docente2. Los cursos sembrados siguen en 2 h.
>
> **Preparación real (Claude, 2026-10-24, autorizado):** cursos R/X/V, docente2 (Admin API + rol), `enrolled_at`, sesiones, asistencias y el retiro de E4 se crearon por REST con service_role (no por la UI); estudiantes por `/api/students`. Se añadió E5 "Fabián Ortiz" (`77f838f7-9ea1-4690-95ea-92f8b283ca5b`) en el curso X y una sesión manual en X. Contraseña de los estudiantes y de docente2: ver el script de preparación, no se repite aquí. El **docente2 y el curso X quedaron con 1,5 h por sesión** tras TC-063-003.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico R (del docente `dev@nodo.local`, con `course_slug` para poder abrir sesión desde la lección) | *sin endpoint* ([[DEBT-076]]) — por la UI (`/admin/courses/new`), que además ejercita TC-063-004 | `115e5fd5-c6f3-4064-9523-81fc4bd95f26` | ✅ |
| Curso académico X (de **otro** docente, para TC-063-014) | *sin endpoint* — por la UI, con la sesión del docente secundario | `9ee52951-680a-4061-b4de-2260f94dda24` | ✅ |
| Curso académico V (vacío: sin estudiantes, para TC-063-013) | *sin endpoint* — por la UI | `da5fe4e3-4999-4ee7-9eac-6769bb013e96` | ✅ |
| Docente secundario | *sin endpoint* ([[DEBT-076]]) — Admin API directo, con autorización del usuario (ver nota) | `27f96e84-d49b-449a-a7d8-49d04412052f (`docente2.test063@nodo.local`)` | ✅ |
| Estudiante E1 "Beatriz Arango" (asiste a todo) | `students-mcp` → `create_student` (con `academic_course_id` = R) | `5060f71d-5638-418f-896d-3fe71e79d079` | ✅ |
| Estudiante E2 "Carlos Zuluaga" (falta 3 veces) | `students-mcp` → `create_student` (con `academic_course_id` = R) | `38e951eb-62c4-4593-a1c4-332b1d4dae62` | ✅ |
| Estudiante E3 "Daniela Mejía" (matrícula tardía) | `students-mcp` → `create_student` (con `academic_course_id` = R) | `4d331e17-18fc-48ce-b14a-2f715701446d` | ✅ |
| Estudiante E4 "Esteban Pérez" (se retirará) | `students-mcp` → `create_student` (con `academic_course_id` = R) | `9317b2e9-1f1d-413b-9580-e4cfbb59b660` | ✅ |
| `enrolled_at` retrofechado de E1, E2, E4 (`2026-09-01T12:00:00Z`) y de E3 (`2026-10-08T03:00:00Z` = 7 oct, 22:00 en Bogotá) | *sin endpoint* — SQL directo en `nodo-dev`, con autorización del usuario (ver nota) | — | ✅ |
| Sesiones manuales de R: 8, 15 y 22 sep 2026; 6, 7 y 14 oct 2026 | Planilla de R → "Registrar sesión manual" (UI, spec-054) | — | ✅ |
| Asistencias de R (ver tabla de escenario) | Planilla de R → marcar celdas (UI, spec-054) | — | ✅ |
| Retiro de E4 | Pestaña Estudiantes de R → "Retirar" (UI) | — | ✅ |
| Sesión abierta de R (para TC-063-011) | Vista de lección del curso de contenido vinculado → abrir sesión (UI) | — | ✅ |

**Escenario de asistencia del curso R** (horas por sesión = 2):

| Estudiante | 8 sep | 15 sep | 22 sep | 6 oct | 7 oct | 14 oct | Esperado sep | Esperado oct | Esperado Total |
|---|---|---|---|---|---|---|---|---|---|
| Arango, Beatriz (E1) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | `0 h` | `0 h` | `0 h` |
| Mejía, Daniela (E3, matriculada el 7 oct hora Bogotá) | — | — | — | — | ✘ | ✔ | `—` | `2 h (1)` | `2 h (1)` |
| Zuluaga, Carlos (E2) | ✘ | ✘ | ✔ | ✔ | ✔ | ✘ | `4 h (2)` | `2 h (1)` | `6 h (3)` |
| Pérez, Esteban (E4, retirado) | ✘ | ✔ | ✘ | — | — | — | *no aparece* | *no aparece* | *no aparece* |

✔ = presente, ✘ = ausente, — = no se marca nada. El retrofechado de E3 a las
22:00 de Bogotá (03:00 UTC del 8 de oct) es a propósito: si la
implementación compara la fecha en UTC, excluiría la sesión del 7 de oct y la
celda de octubre saldría `0 h` en vez de `2 h (1)`.

> ⚠️ **Hueco de preparación — fechas de matrícula.** `enrolled_at` toma
> `now()` al matricular y **no existe endpoint para modificarlo**. Como las
> sesiones manuales no admiten fechas futuras (spec-054 D13), sin retrofechar
> la matrícula todas las sesiones de septiembre y octubre serían "anteriores a
> la matrícula" y el resumen saldría vacío. Retrofechar exige un `UPDATE` SQL
> directo sobre `enrollments` en `nodo-dev`, **solo con autorización explícita
> del usuario en la sesión de pruebas** (CLAUDE.md → "Pruebas manuales
> asistidas por Claude"). El retrofechado debe hacerse **antes** de marcar
> asistencias: la policy de inserción de spec-054 exige matrícula activa, no
> fecha.
>
> ⚠️ **Hueco de preparación — cursos y docente secundario.** Igual que en
> test-054: no hay endpoint para crear `academic_courses` ni para dar de alta
> docentes ([[DEBT-076]]). Los fixtures de spec-054 **no existen en
> `nodo-dev`** (CLAUDE.md → "Datos de prueba reutilizables").

**Entorno de pruebas:** desarrollo (`.env.local` → Supabase cloud `nodo-dev`,
con la migración de la Fase 1 aplicada vía `--db-url`).
**Fecha de la ronda:** 2026-10-24 (en curso; casos sin aprobar hasta tu confirmación)

## Casos de prueba

### TC-063-001 — El selector de vista existe y la planilla no cambia
**Cubre:** criterios 1 y 17
**Precondición:** sesión iniciada como `dev@nodo.local`; curso R con el
escenario montado.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. Ir a `/admin/courses/{{academicCourseId_R}}/asistencia`.
2. Observar el selector sobre la tabla.
3. Comparar la planilla con la de antes del spec: columnas, casillas, columna
   "%", botón de sesión manual y menú de cada sesión.
4. Anotar el % de Daniela Mejía.
**Resultado esperado:** hay un selector con "Planilla" (activa) y "Resumen
mensual"; la URL no lleva `?vista`; la planilla se ve y funciona igual que
antes. El % de Daniela se calcula sobre las 6 sesiones (1 de 6 → 17 %), es
decir, **sigue penalizando** la matrícula tardía (D6).
**Estado:** ✅ Aprobado
**Hallazgos:** Claude (navegador, 2026-10-24): selector presente, Planilla activa, URL sin `?vista`, planilla intacta; Daniela 17 %. Aprobado por el usuario (2026-10-24).

### TC-063-002 — La vista elegida sobrevive a recargar y a "Atrás"
**Cubre:** criterio 2
**Precondición:** la de TC-063-001.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. Hacer clic en "Resumen mensual".
2. Observar la URL.
3. Recargar con F5.
4. Pulsar "Atrás" del navegador; luego "Adelante".
**Resultado esperado:** la URL pasa a `...asistencia?vista=resumen`; tras
recargar sigue el resumen; "Atrás" vuelve a la planilla y "Adelante" al
resumen; en todo momento la pestaña "Asistencia" del panel sigue resaltada.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude (2026-10-24): clic → `?vista=resumen`; recarga F5 mantiene el resumen; Atrás → planilla (sin `?vista`); Adelante → resumen; pestaña Asistencia resaltada. Hallazgo menor: tras iniciar sesión se pierde `?vista=resumen` (el login redirige solo con `redirectTo=…/asistencia`).

### TC-063-003 — "Horas por sesión" en la edición del curso
**Cubre:** criterio 3
**Precondición:** curso existente creado **antes** de aplicar la migración
(p. ej. uno de los sembrados por `npm run seed:dev`).
**Datos de prueba usados:** curso sembrado `DEVEDD2026`
**Pasos:**
1. Ir a `/admin/courses/{{id_DEVEDD2026}}/edit`.
2. Localizar el campo "Horas por sesión" y leer su texto de ayuda.
3. Cambiarlo a `1.5` y guardar.
4. Recargar la página.
5. Devolverlo a `2` y guardar.
**Resultado esperado:** el campo existe junto a las horas de clase y muestra
`2`; el texto de ayuda avisa que cambiarlo recalcula todos los meses; tras
guardar y recargar muestra `1.5` (o `1,5`); vuelve a `2` sin problema.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: probado en el curso X y en R (no en DEVEDD2026 literal; el seed quedó en `2` verificado por REST). Campo con valor 2 y ayuda visible; 1.5 guardado y mostrado tras recargar; vuelve a 2 sin problema.

### TC-063-004 — Validación del campo y valor por defecto al crear
**Cubre:** criterios 3 y 4
**Precondición:** sesión de docente.
**Datos de prueba usados:** creación del curso R
**Pasos:**
1. Ir a `/admin/courses/new` y observar el valor inicial de "Horas por sesión".
2. Completar el resto del formulario y probar, uno a uno, `0`, `-1`, `12.5`,
   `1.333` y el campo vacío, intentando guardar cada vez.
3. Poner `2` y guardar (este es el curso R).
**Resultado esperado:** el valor inicial es `2`; cada valor inválido muestra
un mensaje en el propio campo y **no** crea el curso; con `2` el curso se crea.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: valor inicial `2` en /admin/courses/new; `0`, `-1` → "Debe ser mayor que 0"; `12.5` → "Máximo 12 horas"; `1.333` → "Máximo 2 decimales"; vacío → "Indica las horas por sesión". **No ejecutado:** crear un curso con `2` desde el formulario (los cursos R/X/V se crearon por REST). Creación de un curso con `2` desde el formulario ejecutada y aprobada por el usuario (2026-10-24).

### TC-063-005 — Filas: estudiantes activos por apellido
**Cubre:** criterios 5 y 12
**Precondición:** escenario montado, E4 retirado.
**Datos de prueba usados:** `{{academicCourseId_R}}`, E1–E4
**Pasos:**
1. Abrir `...asistencia?vista=resumen`.
2. Leer la columna de estudiantes de arriba abajo.
**Resultado esperado:** tres filas, en este orden: "Arango, Beatriz",
"Mejía, Daniela", "Zuluaga, Carlos". Esteban Pérez **no** aparece.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: orden Arango, Mejía, Zuluaga; Pérez (retirado) no aparece. Aprobado por el usuario (2026-10-24).

### TC-063-006 — Columnas: meses con clases y Total
**Cubre:** criterio 6
**Precondición:** escenario montado, **sin** sesión abierta.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. Abrir el resumen.
2. Leer las cabeceras de izquierda a derecha.
3. Pasar el cursor sobre la cabecera de septiembre.
**Resultado esperado:** columnas "sep 2026", "oct 2026" y "Total", en ese
orden; no hay columna para agosto ni noviembre; la cabecera de septiembre
indica el mes completo y "3 clases" (octubre: 3 clases).
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: columnas "sept 2026", "oct 2026", Total; `title` de cabecera "septiembre de 2026, 3 clases" y "octubre de 2026, 3 clases" (leído del atributo, no con el cursor).

### TC-063-007 — Celdas en horas y clases, y recálculo al cambiar las horas
**Cubre:** criterio 7
**Precondición:** escenario montado, horas por sesión = 2.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. En el resumen, leer la fila de Carlos Zuluaga y la cabecera ("Horas por
   sesión").
2. Hacer clic en el enlace "Cambiar" de la cabecera; cambiar a `1.5` y guardar.
3. Volver a `...asistencia?vista=resumen` y leer la misma fila.
4. Devolver las horas a `2`.
**Resultado esperado:** con 2 h: `4 h (2)` · `2 h (1)` · `6 h (3)` y la
cabecera dice "2 h". El enlace lleva a la edición del curso. Con 1,5 h:
`3 h (2)` · `1,5 h (1)` · `4,5 h (3)` (coma decimal, sin ceros sobrantes) y la
cabecera dice "1,5 h".
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: con 2 h `4 h (2)` · `2 h (1)` · `6 h (3)`; con 1,5 h en R `3 h (2)` · `1,5 h (1)` · `4,5 h (3)` y cabecera "1,5 h"; devuelto a 2 (verificado por REST).

### TC-063-008 — Cero, con fallas y "no aplica" se distinguen
**Cubre:** criterio 8
**Precondición:** escenario montado.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. Comparar la fila de Beatriz Arango (`0 h`), la celda de septiembre de
   Daniela Mejía (`—`) y las celdas de Carlos Zuluaga.
2. Repetir en modo oscuro (cambiar la preferencia del sistema operativo).
3. Si es posible, ver la página en escala de grises (filtro de accesibilidad
   del sistema o de DevTools).
**Resultado esperado:** las tres situaciones se distinguen a simple vista y
también sin color: `0 h` atenuado y sin paréntesis; `—` como guion; las fallas
en negrita con el número de clases entre paréntesis. Ninguna celda está en
rojo. Legible en claro y oscuro.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: `0 h` atenuado, `—`, y fallas en negrita con paréntesis, sin rojo (captura modo oscuro). **Pendiente de ti:** modo claro y escala de grises. Modo claro y escala de grises revisados y aprobados por el usuario (2026-10-24).

### TC-063-009 — Matrícula tardía y zona horaria
**Cubre:** criterio 9
**Precondición:** E3 con `enrolled_at = 2026-10-08T03:00:00Z` (7 oct, 22:00 en
Bogotá).
**Datos de prueba usados:** E3, sesiones del 6 y 7 oct
**Pasos:**
1. En el resumen, leer la fila de Daniela Mejía.
2. Leer la frase descriptiva sobre la tabla.
3. Cambiar a la planilla y comparar las celdas del 6 y 7 oct de Daniela.
**Resultado esperado:** septiembre `—`; octubre `2 h (1)` (cuenta la del 7
oct, día de su matrícula; no cuenta la del 6); Total `2 h (1)`. La frase dice
que no se cuentan las clases anteriores a la matrícula. En la planilla ambas
celdas aparecen ausentes (la planilla no cambia, D6).
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: Daniela = `—` · `2 h (1)` · `2 h (1)` (cuenta el 7 oct matriculada 22:00 Bogotá); frase sobre matrícula visible. Planilla: 17 %. Aprobado por el usuario (2026-10-24).

### TC-063-010 — El resumen es de solo lectura
**Cubre:** criterio 15
**Precondición:** escenario montado.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. En el resumen, intentar hacer clic en cualquier celda.
2. Buscar botones de sesión manual, editar fecha o eliminar.
**Resultado esperado:** las celdas no son interactivas; no hay casillas ni
acciones de gestión de sesiones; los únicos controles son el selector de
vista, el filtro de mes y el enlace "Cambiar" de las horas.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: 0 elementos interactivos dentro de la tabla; los únicos controles en la página son Planilla, Resumen mensual, Cambiar, Todos los meses, sept 2026 y oct 2026.

### TC-063-011 — La sesión en curso no cuenta y se avisa
**Cubre:** criterio 10
**Precondición:** escenario montado; abrir una sesión del curso R hoy desde la
vista de lección; **ningún** estudiante marca.
**Datos de prueba usados:** sesión abierta de R
**Pasos:**
1. Abrir el resumen.
2. Leer el aviso sobre la tabla y las cabeceras de columna.
3. Leer la fila de Beatriz Arango.
4. Cerrar la sesión desde la lección y recargar el resumen.
**Resultado esperado:** con la sesión abierta, aparece el aviso "La clase del
{{fecha de hoy}} está en curso y no se cuenta hasta que se cierre"; Beatriz
sigue en `0 h` en todas las columnas; no aparece una columna nueva solo por
la sesión abierta (si hoy cae en un mes sin otras sesiones). Tras cerrarla,
el aviso desaparece y la sesión cuenta como falla para los tres (p. ej.
Beatriz pasa a `2 h (1)` en el mes de hoy).
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: sesión abierta de hoy en R insertada por REST (no desde la lección). Con ella: aviso "La clase del 24 de octubre de 2026 está en curso…", Beatriz `0 h` y sin cambios en columnas. Al cerrar: aviso fuera y Beatriz `2 h (1)` en octubre. La sesión se borró al terminar.

### TC-063-012 — Filtro por mes
**Cubre:** criterio 11
**Precondición:** escenario montado, sin sesión abierta.
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. En el resumen, hacer clic en el filtro "sep 2026".
2. Observar la URL, las columnas y el orden de filas.
3. Recargar.
4. Hacer clic en "Todos los meses".
5. Escribir a mano en la URL `?vista=resumen&mes=2026-13` y luego
   `?vista=resumen&mes=2026-08`.
**Resultado esperado:** la URL pasa a `?vista=resumen&mes=2026-09`; solo se
ven "Estudiante" y "sep 2026", **sin** Total, con las filas en el mismo orden
por apellido; el filtro "sep 2026" se ve activo y se mantiene tras recargar.
"Todos los meses" restaura meses + Total. Con `2026-13` y con `2026-08` se
ven todos los meses, con "Todos los meses" activo, sin error.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: clic en "sept 2026" → `&mes=2026-09`, solo sept sin Total, activo; F5 lo conserva; "Todos los meses" restaura todo; `mes=2026-13` y `2026-08` → todos los meses con "Todos" activo.

### TC-063-013 — Estados vacío y de error
**Cubre:** criterio 13
**Precondición:** curso V sin estudiantes; un curso con estudiantes pero sin
sesiones (p. ej. un curso sembrado sin sesiones, con su matrícula de
`seed:dev`).
**Datos de prueba usados:** `{{academicCourseId_V}}`, curso sembrado
**Pasos:**
1. Abrir el resumen del curso V.
2. Abrir el resumen del curso sembrado sin sesiones.
3. Provocar un fallo de lectura: detener `npm run dev`, cambiar temporalmente
   `NEXT_PUBLIC_SUPABASE_URL` de `.env.local` a una URL inválida, volver a
   levantar y abrir el resumen de R. **Restaurar `.env.local`** y reiniciar al
   terminar.
**Resultado esperado:** (1) mensaje de "sin estudiantes con matrícula activa";
(2) mensaje de "aún no hay clases cerradas para resumir"; (3) bloque rojo "No
se pudo cargar el resumen". Los tres textos son distintos y ninguno muestra
una tabla de ceros.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: curso V → "Este curso no tiene estudiantes con matrícula activa."; curso sembrado → "Aún no hay clases cerradas para resumir." **Pendiente:** el estado de error (3). El procedimiento del caso (URL de Supabase inválida) no sirve tal cual: la misma URL se usa para la sesión y la página redirige al login antes de pintar el bloque rojo; hace falta otra forma de provocar el fallo. Aprobado por el usuario (2026-10-24) sin haber provocado el estado de error rojo: ese tramo no se ejecutó.

### TC-063-014 — Un docente no ve el resumen de un curso ajeno
**Cubre:** criterio 14
**Precondición:** curso X del docente secundario, con al menos una sesión y un
estudiante.
**Datos de prueba usados:** `{{academicCourseId_X}}`, `dev@nodo.local`
**Pasos:**
1. Con la sesión de `dev@nodo.local`, ir a
   `/admin/courses/{{academicCourseId_X}}/asistencia?vista=resumen`.
**Resultado esperado:** no se muestra ningún dato del curso X (ni nombres ni
horas); se ve la página "no encontrado" (el layout del curso ya responde
`notFound()` cuando RLS no deja leer el curso), igual que con la planilla de
un curso ajeno; nunca una tabla.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: `dev@nodo.local` es admin y ve el curso X, así que se probó al revés: docente2 (solo teacher) abre el resumen del curso R → 404, sin datos. Aprobado por el usuario (2026-10-24).

### TC-063-015 — Teclado, lector de pantalla y móvil
**Cubre:** criterio 16
**Precondición:** escenario montado; un lector de pantalla (VoiceOver en macOS).
**Datos de prueba usados:** `{{academicCourseId_R}}`
**Pasos:**
1. Desde la barra de direcciones, recorrer la página solo con Tab hasta el
   selector y el filtro; activar "Resumen mensual" y "oct 2026" con Enter.
2. Con VoiceOver, navegar la tabla celda a celda (VO + flechas) en la fila de
   Carlos Zuluaga.
3. Reducir la ventana a ancho de móvil (~375 px) o usar el modo dispositivo
   de DevTools.
**Resultado esperado:** todos los controles reciben foco visible y se activan
con Enter; VoiceOver anuncia que el control activo es el actual, la
descripción de la tabla, y por celda el estudiante, el mes y "4 horas, 2
clases faltadas" (no "4 h paréntesis 2"); en `0 h` anuncia "sin
inasistencias" y en `—` "no aplica". En móvil no hay scroll horizontal de la
página: la tabla se desplaza dentro de su contenedor con la columna de nombre
fija, y los filtros pasan a varias líneas.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por el usuario (teclado, VoiceOver y móvil): aprobado, sin observaciones.

### TC-MCP-063-001 — Contrato y paridad con la UI
**Herramienta probada:** `get_monthly_absence_summary` en `attendance-mcp`
**Precondición:** escenario de "Datos de prueba" montado; `npm run dev` en 3002; vista "Resumen mensual" abierta en el panel para el mismo curso.
**Input de prueba:** `{ "course_id": "<curso de prueba>" }`
**Output esperado:** `hours_per_session` igual al del curso; `months` en orden ascendente, iguales a las columnas del panel; para cada estudiante, `absent_hours = absent_classes × hours_per_session` y las cifras coinciden celda a celda con el panel (incluido `total`). Estudiantes ordenados por apellido.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude (curl al endpoint que consume la herramienta, no la herramienta MCP): cifras idénticas a la UI (Arango 0, Mejía 0/1/1, Zuluaga 2/1/3 clases; 2 h por clase), meses y orden iguales. Aprobado por el usuario (2026-10-24).

### TC-MCP-063-002 — Matrícula tardía, retirado y estudiante sin asistencias
**Herramienta probada:** `get_monthly_absence_summary` en `attendance-mcp`
**Precondición:** el mismo escenario (E3 matriculado tarde a las 22:00 de Bogotá; un estudiante retirado con registros; un estudiante activo con 0 asistencias).
**Input de prueba:** `{ "course_id": "<curso de prueba>" }`
**Output esperado:** las sesiones anteriores a la fecha de matrícula de E3 (en hora Bogotá) no cuentan, y la del mismo día sí; un mes sin sesiones aplicables trae `sessions_counted: 0`. El retirado no aparece. El estudiante con 0 asistencias aparece con todas sus sesiones aplicables como faltas.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: Mejía sept `sessions_counted: 0`; Pérez (retirado) no aparece; Gabriela Ríos (activa, 0 asistencias; añadida y borrada) aparece con 6 faltas = 12 h. Mismo-día cuenta (comprobado en X).

### TC-MCP-063-003 — Filtro por mes y validación
**Herramienta probada:** `get_monthly_absence_summary` en `attendance-mcp`
**Precondición:** el mismo escenario, con sesiones en al menos dos meses.
**Input de prueba:** `{ "course_id": "<curso>", "month": "<un mes con sesiones>" }`; luego `"month": "2026-13"` y `"month": "septiembre"`.
**Output esperado:** con un mes válido, solo ese mes en `months` y en `by_month` de cada estudiante, y **sin `total`** (con `month` el agente no recibe el total del curso para no confundirlo con el del mes). Con `2026-13` y `septiembre`, error de validación (`422`) reportado por el agente sin inventar datos.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: `month=2026-09` → solo ese mes. Caso reescrito (2026-10-24) para esperar la respuesta sin `total` (cambio por revisión de @reviewer). Resultado: `month=2026-09` → solo ese mes y sin `total`; `2026-13` y `septiembre` → 422. Aprobado por el usuario (2026-10-24).

### TC-MCP-063-004 — Sesión en curso y sesión manual
**Herramienta probada:** `get_monthly_absence_summary` en `attendance-mcp`
**Precondición:** una sesión abierta (`is_open`) y una sesión manual sin código en el curso.
**Input de prueba:** `{ "course_id": "<curso de prueba>" }`
**Output esperado:** la sesión abierta no cuenta en ningún mes ni en `total` (igual que en el panel, D7); la sesión manual cuenta como cualquier otra cerrada.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: con una sesión abierta en R el endpoint no la cuenta en ningún mes ni en total (meses y cifras sin cambio); las sesiones manuales sin código de R cuentan; al cerrarla suma como falta.

### TC-MCP-063-005 — Errores y sin regresión del resumen existente
**Herramienta probada:** `get_monthly_absence_summary` y `get_course_attendance_summary` en `attendance-mcp`
**Precondición:** guardada la salida de `get_course_attendance_summary` del curso **antes** de implementar el spec.
**Input de prueba:** `course_id` de un UUID inexistente; curso sin sesiones; luego `get_course_attendance_summary` sobre el curso de prueba.
**Output esperado:** UUID inexistente → `404`, sin datos inventados; curso sin sesiones → `months: []` y estudiantes sin faltas, sin error. `get_course_attendance_summary` devuelve exactamente lo mismo que antes del spec.
**Estado:** ✅ Aprobado
**Hallazgos:** Claude: UUID inexistente → 404; curso sin sesiones → `months: []`, total 0, sin error. `get_course_attendance_summary` responde (6 sesiones, % coherentes) pero no había salida guardada de antes del spec; su código no cambió. Aprobado por el usuario (2026-10-24) sin línea base previa al spec: la única línea eliminada de `lib/attendance/service.ts` es el import de tipos; `getServiceCourseAttendanceSummary` no cambió.

## Resumen de la ronda
- Aprobados: 20 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ✅ Completada
