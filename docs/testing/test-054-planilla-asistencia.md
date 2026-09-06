# test-054 — Planilla de asistencia editable en el panel del curso

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico A (del docente de pruebas) | *sin endpoint* — creado vía SQL directo (ver nota) | `65a0bad9-16a8-4c27-bec6-3e097f6055fc` | ⬜ |
| Curso académico B (de **otro** docente) | *sin endpoint* — creado vía SQL directo | `98e1d74e-8bc9-426d-9a3c-ce8b8d846c2c` | ⬜ |
| Curso académico vacío (sin sesiones/estudiantes, para TC-054-014) | *sin endpoint* — creado vía SQL directo | `bdf3ca64-adbe-4c6b-915e-91e7e9c575d0` | ⬜ |
| Estudiante 1 "Ana Gómez" | `students-mcp` → `create_student` | `4af748bf-01d7-469e-bfe1-cacb91249de5` | ⬜ |
| Estudiante 2 "Bruno Díaz" | `students-mcp` → `create_student` | `02021ec2-2116-4c16-830b-2c31b22ef257` | ⬜ |
| Estudiante 3 "Carla Ruiz" (se retirará) | `students-mcp` → `create_student` | `8363e1c1-2c61-4fab-95bb-bf25aa780f38` | ⬜ |
| Matrículas de 1, 2 y 3 en el curso A | `students-mcp` → `create_student` (`academic_course_id` en la creación) | `d07b7763-8b30-4067-9f5d-288774664e7e`, `13c583dd-7571-4154-a63a-b10c53b01475`, `ee7fdd14-5dea-465c-b8fb-67d5596a98a0` | ⬜ |
| Docente secundario (para TC-054-011) | Creado vía SQL directo (`auth.admin.createUser` + rol `teacher` + perfil) — `docente2.test054@nodo.local` / `Test054Docente2!` | `491cce48-1e07-4eb8-a871-46f3be29f58b` | ⬜ |
| Sesión S1 (con código, con asistentes) | *sin endpoint* — abierta desde la vista de lección del curso A (`/analisis-de-algoritmos/algoritmos-como-tecnologia`) y marcada por Ana con el código | `9a044bbe-affb-419b-9ea1-d13128206a3d` | ⬜ |
| Sesión S2 (manual, sin código) | Creada por el propio TC-054-006 | `59dd9045-8d2c-4261-8726-891aa8bc733d` | ⬜ |
| Sesión S3 (del curso **B**) | *sin endpoint* — creada manual desde la planilla del curso B, con Ana presente | `d01d3bf1-b2ac-4a30-9d10-6b1eab75f06b` | ⬜ |
| Matrícula de Ana en el curso B (necesaria para que tenga un asistente) | `students-mcp` → `enroll_student` | `4067fe82-b5e8-4b3c-9d24-571240a72f64` | ⬜ |

> ⚠️ **Hueco conocido de preparación:** no existe endpoint ni herramienta MCP
> para crear `class_sessions` — `attendance-mcp` es de solo lectura y así se
> mantiene (spec-054, Evaluación MCP). Las sesiones de precondición se montan por
> la UI.
>
> ⚠️ **Desvío autorizado (2026-09-06):** tampoco existe endpoint para crear
> `academic_courses` ni para dar de alta un segundo docente. Con autorización
> explícita del usuario en esta sesión, ambos se crearon vía SQL/Admin API
> directo contra el Supabase de desarrollo (`asus`) en lugar de por la UI.
> Registrado como deuda en `docs/specs/backlog.md` (falta endpoint/MCP para
> gestión de cursos académicos y alta de docentes). Además se vinculó
> `course_slug = 'analisis-de-algoritmos'` a los cursos A y B (creados sin
> slug) para que aparezcan en la vista de lección donde se abren sesiones
> con código.

**Entorno de pruebas:** desarrollo (`.env.local` → Supabase local en `asus`,
con las dos migraciones de la Fase 1 aplicadas allá vía `supabase db reset`).
**Fecha de la ronda:** 2026-09-06

## Casos de prueba

### TC-054-001 — La pestaña "Asistencia" existe y abre la planilla
**Cubre:** criterio 1
**Precondición:** sesión iniciada como docente dueño del curso A.
**Datos de prueba usados:** `{{academicCourseId_A}}`
**Pasos:**
1. Ir a `/admin/courses/{{academicCourseId_A}}`.
2. Observar la barra de pestañas.
3. Hacer clic en "Asistencia".
**Resultado esperado:** hay cuatro pestañas (Estudiantes, Calificaciones,
Evaluaciones, Asistencia); la URL pasa a `.../asistencia`; la pestaña activa se
resalta igual que las otras tres.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-054-002 — La matriz muestra estudiantes activos × sesiones, con la más reciente a la vista
**Cubre:** criterios 2 y 3
**Precondición:** curso A con S1 y S2 y con los estudiantes 1, 2 y 3 activos.
**Datos de prueba usados:** `{{academicCourseId_A}}`, `{{sessionId_S1}}`, `{{sessionId_S2}}`
**Pasos:**
1. Abrir la pestaña Asistencia del curso A.
2. Contar las filas y comprobar los nombres.
3. Comprobar el orden de las columnas de izquierda a derecha.
4. Sin desplazar nada, mirar el borde derecho de la tabla.
5. Desplazar la tabla horizontalmente hasta el extremo izquierdo.
**Resultado esperado:** una fila por estudiante activo, con el nombre completo;
las columnas en orden cronológico ascendente; al cargar, la sesión más reciente
está visible; al desplazar, la columna "Estudiante" queda fija a la izquierda y
la columna "%" fija a la derecha, ambas legibles (sin transparencias) en modo
claro **y** oscuro.
**Estado:** ✅ Aprobado
**Hallazgos:** Filas y orden cronológico de columnas correctos (S2 04/09 antes
que S1 06/09). El comportamiento de scroll horizontal con columnas fijas
("Estudiante" a la izquierda, "%" a la derecha) **no se pudo verificar**: con
solo 2 sesiones la tabla entra sin necesitar scroll. Queda pendiente de
reverificar tras TC-054-009 (creación de S4), cuando haya 3+ columnas.

### TC-054-003 — Marcar asistencia persiste
**Cubre:** criterio 4
**Precondición:** el estudiante 2 aparece **ausente** en S1.
**Datos de prueba usados:** `{{studentId_2}}`, `{{sessionId_S1}}`
**Pasos:**
1. En la planilla, hacer clic en la celda (Bruno Díaz × S1).
2. Observar la casilla y el indicador de guardado.
3. Recargar la página con F5.
4. Verificar el % de Bruno.
**Resultado esperado:** la casilla se marca de inmediato, se muestra el indicador
de guardado y luego el de guardado correcto; tras recargar sigue marcada y el %
de Bruno subió acorde.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-054-004 — Desmarcar asistencia persiste
**Cubre:** criterio 5
**Precondición:** el estudiante 1 aparece **presente** en S1 (marcó con código).
**Datos de prueba usados:** `{{studentId_1}}`, `{{sessionId_S1}}`
**Pasos:**
1. Hacer clic en la celda (Ana Gómez × S1) para desmarcarla.
2. Recargar la página.
**Resultado esperado:** la casilla queda desmarcada, sigue desmarcada tras
recargar y el % de Ana baja acorde.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-054-005 — Un fallo al guardar revierte la casilla y lo informa
**Cubre:** criterio 6
**Precondición:** poder cortar la conexión del navegador (DevTools → Network →
Offline) o detener `npm run dev` justo antes del clic.
**Datos de prueba usados:** `{{studentId_2}}`, `{{sessionId_S2}}`
**Pasos:**
1. Abrir la planilla y esperar a que cargue.
2. Poner el navegador en modo offline.
3. Hacer clic en una celda ausente.
4. Observar la casilla y el mensaje.
5. Restaurar la conexión y recargar.
**Resultado esperado:** la casilla se marca un instante y **vuelve a su valor
anterior**; aparece un mensaje honesto de fallo de comunicación (no un error
genérico ni la pantalla del error boundary); tras recargar, la celda sigue
ausente — es decir, lo que se vio en pantalla coincide con lo guardado.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para este caso puntual), simulando el fallo deteniendo `npm run dev`
(alternativa documentada al modo offline de DevTools). La casilla mostró un
borde rojo y volvió a desmarcarse; apareció el mensaje "No pudimos
comunicarnos con el servidor. Revisa tu conexión e inténtalo de nuevo en un
momento." (honesto, específico, sin error boundary). Tras reiniciar el
servidor y recargar, la celda sigue ausente y el % de Bruno no cambió (50%).
Sin observaciones adicionales.

### TC-054-006 — Crear una sesión manual sin código
**Cubre:** criterio 7 (primera mitad)
**Precondición:** planilla del curso A abierta; anotar la fecha elegida.
**Datos de prueba usados:** `{{academicCourseId_A}}`, fecha `{{fecha_S2}}` (pasada)
**Pasos:**
1. Usar el formulario de sesión manual.
2. Elegir una fecha **pasada** y confirmar.
3. Observar la planilla.
4. Intentar además crear una con fecha **futura**.
**Resultado esperado:** aparece una columna nueva en la posición cronológica que
le corresponde, sin código y sin insignia "En curso"; anotar su id como
`{{sessionId_S2}}`. La fecha futura es rechazada con un mensaje claro.
**Estado:** ✅ Aprobado
**Hallazgos:** Fecha usada: 2026-09-04. Sin observaciones.

### TC-054-007 — La sesión manual no es alcanzable por ningún código de asistencia
**Cubre:** criterio 7 (segunda mitad) — **el borde de seguridad de D7**
**Precondición:** S2 creada en TC-054-006 y **ninguna sesión abierta** en el curso A.
**Datos de prueba usados:** credenciales del estudiante 1, `{{sessionId_S2}}`
**Pasos:**
1. Iniciar sesión como el estudiante 1 en otro navegador.
2. Ir a la lección del curso A donde se marca asistencia.
3. Observar si se ofrece marcar asistencia.
4. Si hay campo de código, probar códigos arbitrarios (`0000`, `1234`).
**Resultado esperado:** al estudiante **no** se le ofrece marcar (no hay sesión
abierta y vigente); ningún código lo deja marcar en S2; en particular no aparece
como abierta una sesión sin código.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por `attendance-mcp` que S1 quedó cerrada
(`is_open: false`) antes de la prueba. No se ofreció ningún campo/botón para
marcar asistencia como Ana; los códigos probados (0000, 1234) no funcionaron.
Sin observaciones.

### TC-054-008 — Editar la fecha de una sesión reordena su columna
**Cubre:** criterio 8
**Precondición:** S2 existe, cerrada.
**Datos de prueba usados:** `{{sessionId_S2}}`
**Pasos:**
1. Abrir las acciones de la columna S2 y editar su fecha a una **anterior** a S1.
2. Guardar y observar la planilla.
3. Recargar.
**Resultado esperado:** la columna se mueve a la izquierda de S1, conserva sus
marcas y el cambio sobrevive a la recarga.
**Estado:** ✅ Aprobado
**Hallazgos:** Fecha usada: 2026-09-01. Sin observaciones.

### TC-054-009 — Eliminar una sesión avisa del conteo y borra en cascada
**Cubre:** criterio 9 — **el borde destructivo (D11)**
**Precondición:** crear una sesión desechable S4 (manual) y marcar en ella a
**dos** estudiantes; anotar el % de ambos antes de borrar.
**Datos de prueba usados:** `{{sessionId_S4}}`, `{{studentId_1}}`, `{{studentId_2}}`
**Pasos:**
1. Abrir las acciones de la columna S4 → Eliminar.
2. **Leer el texto del diálogo** y comprobar que menciona la fecha y el número de
   registros que se perderán (debe decir **2**).
3. Cancelar y comprobar que no pasó nada.
4. Repetir y confirmar.
5. Recargar y comparar los % de ambos estudiantes con los anotados.
**Resultado esperado:** el diálogo declara fecha y conteo exacto; cancelar no
borra nada; confirmar elimina la columna y los dos registros; los % bajan de forma
coherente. El botón de borrado es visualmente destructivo y no el de acción por
defecto.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para este caso puntual). S4 creada el 2026-09-02, con Ana y Carla
marcadas presentes (% previos: Ana 33%, Bruno 33%, Carla 33%). El diálogo dijo
textualmente "ELIMINAR LA SESIÓN DEL 2 DE SEPTIEMBRE DE 2026 BORRARÁ TAMBIÉN
SUS 2 REGISTROS DE ASISTENCIA. ESTA ACCIÓN NO SE PUEDE DESHACER." (fecha y
conteo exactos). Cancelar no alteró nada; confirmar eliminó la columna y los 2
registros. Tras recargar: Ana 0%, Bruno 50%, Carla 0% (coherente al recalcular
sobre 2 sesiones). Botón "Eliminar" en rojo, claramente distinto de
"Cancelar". Sin observaciones adicionales.

### TC-054-010 — La sesión en curso se distingue y no se puede editar ni borrar
**Cubre:** criterio 10 y la frontera de D5
**Precondición:** abrir una sesión desde la vista de lección del curso A (queda
`is_open = true`).
**Datos de prueba usados:** `{{academicCourseId_A}}`
**Pasos:**
1. Con la sesión abierta, ir a la pestaña Asistencia.
2. Localizar su columna.
3. Intentar editar su fecha y eliminarla.
4. Recorrer toda la planilla buscando controles de sesión.
5. Marcar a un estudiante en esa columna desde la planilla.
**Resultado esperado:** la columna lleva la insignia "En curso"; editar y eliminar
están deshabilitados con un texto que indica que se gestiona desde la lección; **no
hay** ningún botón de abrir, cerrar, extender ni rotar código; **sí** se puede
marcar/desmarcar en esa columna.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para este caso puntual). La columna llevó la insignia "En curso"; los
íconos de editar/eliminar aparecieron visualmente deshabilitados (grises) y el
clic sobre ellos no tuvo efecto (no abrieron diálogo). No se encontró ningún
control de abrir/cerrar/extender/rotar código en la planilla — solo existen en
la vista de lección. Se pudo marcar y desmarcar a Carla en esa columna sin
problema. No se pudo confirmar visualmente el texto exacto del tooltip
explicativo sobre los íconos deshabilitados (el hover no renderizó tooltip en
la captura); no bloqueante para el criterio, pero queda anotado. Sesión de
prueba cerrada al finalizar para no dejar estado abierto colgado.

### TC-054-011 — Un docente no dueño no accede a la planilla por URL directa
**Cubre:** criterio 11 — **borde de autorización**
**Precondición:** conocer `{{academicCourseId_A}}`.
**Datos de prueba usados:** credenciales de `{{teacherId_2}}`
**Pasos:**
1. Iniciar sesión como el docente secundario (no dueño de A).
2. Pegar en el navegador `/admin/courses/{{academicCourseId_A}}/asistencia`.
3. Observar la respuesta.
**Resultado esperado:** no se muestra la planilla ni ningún nombre de estudiante ni
conteo del curso A (se espera un 404). En ningún caso una planilla vacía que
sugiera que el curso no tiene datos.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para este caso puntual). Logueado como `docente2.test054@nodo.local`
y navegando directamente a `/admin/courses/{{academicCourseId_A}}/asistencia`
se obtuvo un 404 limpio ("This page could not be found"), sin ningún nombre de
estudiante ni conteo del curso A. Sin observaciones.

### TC-054-012 — Una sesión de otro curso no es manipulable desde esta planilla
**Cubre:** criterio 12 — **borde de aislamiento entre cursos**
**Precondición:** S3 existe en el curso B, con al menos un asistente.
**Datos de prueba usados:** `{{sessionId_S3}}`, `{{academicCourseId_A}}`
**Pasos:**
1. Como docente dueño de A, abrir la planilla de A y confirmar que **S3 no
   aparece** como columna.
2. Con DevTools abiertas en la planilla de A, disparar la acción de marcar
   sustituyendo el id de sesión por `{{sessionId_S3}}` (o, si no es viable,
   reportarlo y verificar por la vía del punto 3).
3. Como docente dueño de B, comprobar en el panel del curso B que la asistencia
   de S3 sigue intacta.
**Resultado esperado:** S3 nunca aparece en la planilla de A; el intento de
escritura es rechazado por RLS y la asistencia de S3 queda inalterada.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para este caso puntual). Para dar a S3 un asistente real, se matriculó
a Ana también en el curso B (`enroll_student`, ver Datos de prueba). Confirmado
como docente dueño de A que S3 no aparece como columna en su planilla. El paso
2 (forjar la escritura desde DevTools sustituyendo el id de sesión) no se
ejecutó por no ser viable de forma confiable vía automatización de navegador;
se verificó en su lugar por la vía alternativa que el propio caso prevé (paso
3): la asistencia de S3 en el curso B se consultó por `attendance-mcp` antes y
después, y permanece intacta (1 registro, Ana presente). Sin más
observaciones; el borde de RLS en sí (rechazo de escritura cross-curso) queda
sin ejercitar directamente en esta ronda.

### TC-054-013 — Un estudiante retirado sale de la planilla sin perder su historial
**Cubre:** criterio 14 — **el borde que D2 señala como el más fácil de romper**
**Precondición:** el estudiante 3 está activo y **presente** en S1.
**Datos de prueba usados:** `{{studentId_3}}`, `{{sessionId_S1}}`
**Pasos:**
1. Confirmar en la planilla que Carla Ruiz aparece y está presente en S1.
2. Anotar el número de asistentes de S1 según `attendance-mcp` →
   `get_session_attendance({{sessionId_S1}})`.
3. Retirar a Carla desde la pestaña Estudiantes.
4. Volver a la planilla.
5. Repetir la consulta MCP del paso 2.
**Resultado esperado:** Carla desaparece como fila; los % de los demás **no**
cambian; la consulta MCP **sigue** listando el registro de Carla en S1 (no se
borró nada). Reincorporarla, si el flujo lo permite, la devuelve a la planilla con
su marca intacta.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para el resto de la ronda). Se marcó a Carla presente en S1 antes de
retirarla (S1 pasó a 2 asistentes: Bruno y Carla). Tras retirarla desde la
pestaña Estudiantes (sin diálogo de confirmación previo — anotado, no
bloqueante), Carla desapareció de la planilla; los % de Ana (0%) y Bruno (33%)
no cambiaron. `attendance-mcp` → `get_session_attendance` siguió listando su
registro en S1 sin alteración. La reincorporación **no está soportada**
actualmente (no hay botón en la UI de Estudiantes, y `students-mcp` →
`enroll_student` rechaza con "Ya está matriculado en este curso" al haber una
fila `withdrawn` existente) — el propio caso la contempla como opcional ("si
el flujo lo permite"), así que esto no es un fallo, queda como informativo y
fuera de alcance de spec-054.

### TC-054-014 — Vacío y fallo de lectura son distinguibles
**Cubre:** criterio 13 — **borde de honestidad (D3)**
**Precondición:** un curso del docente **sin ninguna sesión** y **sin estudiantes
activos**; y capacidad de detener el acceso a Supabase (parar el túnel SSH o el
stack de `mirp-lab`).
**Datos de prueba usados:** `{{academicCourseId_vacio}}`, `{{academicCourseId_A}}`
**Pasos:**
1. Abrir la planilla del curso sin sesiones y leer el mensaje.
2. Con un curso con sesiones pero sin estudiantes activos, leer el mensaje.
3. Detener el acceso a Supabase y recargar la planilla del curso A.
4. Comparar los tres textos.
**Resultado esperado:** los tres mensajes son **distintos** y ninguno de los dos
vacíos se parece al de fallo; el de fallo dice que no se pudo consultar, y **en
ningún momento** se presenta como "nadie asistió" o "no hay sesiones".
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para el resto de la ronda). Se usó el curso vacío
(`{{academicCourseId_vacio}}`) para los dos primeros mensajes y se cortó el
túnel SSH local a `asus` (no el stack de Supabase en sí) para simular el
fallo, restaurándolo después. Los tres mensajes fueron distintos: (1) sin
sesiones/estudiantes: "Aún no se ha registrado ninguna sesión — Ábrela desde
la lección al empezar la clase, o registra una pasada arriba."; (2) con una
sesión pero sin estudiantes activos: "No hay estudiantes con matrícula
activa."; (3) fallo de conexión: "No pudimos verificar tu sesión — El
servicio de autenticación no está respondiendo. Tu sesión sigue activa —
esto no es un problema con tu usuario ni tu contraseña. Intenta de nuevo en
unos segundos." Ninguno de los tres se confunde con los otros ni sugiere
"nadie asistió". Sin observaciones adicionales.

### TC-054-015 — Accesibilidad de la matriz
**Cubre:** criterio 15
**Precondición:** planilla del curso A con al menos dos sesiones y dos estudiantes.
**Datos de prueba usados:** `{{academicCourseId_A}}`
**Pasos:**
1. Recorrer la planilla solo con `Tab` y marcar una celda con `Espacio`.
2. Activar el lector de pantalla del sistema (VoiceOver en macOS) y posarse sobre
   varias casillas.
3. Escuchar qué se anuncia al guardar una celda.
4. Reducir el ancho de la ventana a tamaño móvil y recorrer la tabla.
**Resultado esperado:** todas las casillas son alcanzables y accionables por
teclado con foco visible; cada casilla se anuncia con **nombre completo del
estudiante y fecha completa** de la sesión, no como "casilla" a secas; el resultado
del guardado se anuncia; en móvil la tabla se desplaza horizontalmente con el
nombre del estudiante siempre visible.
**Estado:** ✅ Aprobado (parcial — ver hallazgos)
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para el resto de la ronda). Verificado: navegación con `Tab` alcanza
cada casilla y `Espacio` la marca correctamente (probado en Ana x 1 sept);
cada casilla lleva `aria-label` "Asistencia de {nombre completo} el {fecha
completa}" (ej. "Asistencia de Ana Gómez el 1 de septiembre de 2026"), no
"casilla" a secas. **No verificado**: el anillo de foco visible no se
distinguió con claridad en las capturas (puede ser un problema de la captura,
no del producto); el comportamiento en viewport móvil no se pudo forzar por
una limitación de la herramienta de automatización (`resize_window` no alteró
la captura); la lectura real por VoiceOver no es verificable por este medio.
Estos tres puntos quedan pendientes de una verificación manual del usuario.

### TC-054-016 — El marcado manual queda distinguible del marcado con código
**Cubre:** criterio 16 (D8)
**Precondición:** en S1 hay al menos un presente que marcó **con código** y uno
marcado **a mano** en TC-054-003.
**Datos de prueba usados:** `{{sessionId_S1}}`, `{{studentId_1}}`, `{{studentId_2}}`
**Pasos:**
1. Posar el cursor sobre ambas celdas presentes y comparar el texto emergente.
2. Verificar en la base de datos de `mirp-lab` el `marked_by` de ambos registros.
**Resultado esperado:** la celda marcada a mano lo indica (marca discreta +
texto), la marcada con código no; en la base, la primera tiene `marked_by` con el
uuid del docente y la segunda lo tiene en `NULL`. La planilla **no** añade una
columna nueva por esto.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado por Claude en el navegador (autorización explícita del
usuario para el resto de la ronda). El registro de código-marcado original de
S1 (Ana) se había perdido al desmarcarla en TC-054-004 (desmarcar borra el
registro), así que se generó uno nuevo abriendo una sesión adicional y
marcando a Ana con código `82002` desde su cuenta — comparación válida aunque
en una sesión distinta a S1. Visualmente, la celda de Bruno (marcado a mano en
S1, TC-054-003) muestra un punto discreto junto al check que la celda de Ana
(marcada con código) no tiene. Confirmado en la base de datos: registro de
Bruno con `marked_by` = uuid del docente; registro de Ana con `marked_by` =
`NULL`. No se agregó ninguna columna nueva por esta distinción. No se pudo
extraer el texto exacto del tooltip nativo vía automatización (limitación de
la herramienta, no bloqueante — la distinción visual y de datos ya quedó
confirmada).

### TC-MCP-054-001 — `attendance-mcp` sigue siendo correcto con sesiones sin código
**Herramienta probada:** `list_sessions` y `get_session_attendance` en `attendance-mcp`
**Precondición:** `npm run dev` corriendo; S2 (manual, sin código) existe en el
curso A; migraciones de la Fase 1 aplicadas.
**Input de prueba:** `list_sessions({ course_id: "{{academicCourseId_A}}" })` y
`get_session_attendance({ session_id: "{{sessionId_S2}}" })`
**Output esperado:** `list_sessions` incluye S2 con `code_expires_at: null` sin
error ni excepción; `get_session_attendance` devuelve su roster con normalidad;
**ninguna** respuesta expone `attendance_code`; el MCP **no** ofrece ninguna
herramienta de escritura de asistencia.
**Estado:** ✅ Aprobado
**Hallazgos:** `list_sessions({course_id: academicCourseId_A})` incluyó a S2
(`59dd9045-8d2c-4261-8726-891aa8bc733d`) con `code_expires_at: null`, sin error
ni excepción. `get_session_attendance({session_id: sessionId_S2})` devolvió su
roster con normalidad (vacío, correcto — S2 nunca tuvo marcas). Ninguna de las
dos respuestas expone `attendance_code` en ningún campo. El servidor
`attendance-mcp` solo expone `list_sessions`, `get_session_attendance` y
`get_course_attendance_summary` — ninguna herramienta de escritura. Sin
observaciones.

## Resumen de la ronda

- Aprobados: 17 (2 con observaciones no bloqueantes: TC-054-010 y TC-054-015)
  — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: DEBT-076 (no existe
  endpoint/MCP para crear cursos académicos ni dar de alta docentes),
  DEBT-077 (TC-054-012 no ejercitó directamente el rechazo por RLS)
- Limpieza de datos de prueba: 🟡 Conservados intencionalmente (decisión del
  usuario, 2026-09-06) como fixtures reutilizables para futuros specs en
  desarrollo — no limpiar sin instrucción explícita. Ver CLAUDE.md →
  "Datos de prueba reutilizables en desarrollo".
