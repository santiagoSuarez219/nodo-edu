# test-054 — Planilla de asistencia editable en el panel del curso

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico A (del docente de pruebas) | *sin endpoint* — crear en la UI (`/admin/courses/new`) o reutilizar uno de `mirp-lab` | `{{academicCourseId_A}}` | ⬜ |
| Curso académico B (de **otro** docente) | *sin endpoint* — crear en la UI con el segundo docente | `{{academicCourseId_B}}` | ⬜ |
| Estudiante 1 "Ana Gómez" | `POST /api/students` (`students-mcp` → `create_student`) | `{{studentId_1}}` | ⬜ |
| Estudiante 2 "Bruno Díaz" | `POST /api/students` | `{{studentId_2}}` | ⬜ |
| Estudiante 3 "Carla Ruiz" (se retirará) | `POST /api/students` | `{{studentId_3}}` | ⬜ |
| Matrículas de 1, 2 y 3 en el curso A | `students-mcp` → `enroll_student` | `{{enrollmentId_1..3}}` | ⬜ |
| Docente secundario (para TC-054-011) | `POST /api/students` + rol `teacher` a mano | `{{teacherId_2}}` | ⬜ |
| Sesión S1 (con código, con asistentes) | *sin endpoint* — abrir desde la vista de lección del curso A y marcar con el código | `{{sessionId_S1}}` | ⬜ |
| Sesión S2 (manual, sin código) | Creada por el propio TC-054-006 | `{{sessionId_S2}}` | ⬜ |
| Sesión S3 (del curso **B**) | *sin endpoint* — abrir desde la lección del curso B | `{{sessionId_S3}}` | ⬜ |

> ⚠️ **Hueco conocido de preparación:** no existe endpoint ni herramienta MCP
> para crear `class_sessions` — `attendance-mcp` es de solo lectura y así se
> mantiene (spec-054, Evaluación MCP). Las sesiones de precondición se montan por
> la UI. Si esto vuelve a doler en rondas futuras, registrarlo en el backlog en
> vez de improvisar SQL directo.

**Entorno de pruebas:** desarrollo (`.env.local` → Supabase local en `mirp-lab`,
con las dos migraciones de la Fase 1 aplicadas allá vía `supabase db reset`).
**Fecha de la ronda:** {{pendiente}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-054-004 — Desmarcar asistencia persiste
**Cubre:** criterio 5
**Precondición:** el estudiante 1 aparece **presente** en S1 (marcó con código).
**Datos de prueba usados:** `{{studentId_1}}`, `{{sessionId_S1}}`
**Pasos:**
1. Hacer clic en la celda (Ana Gómez × S1) para desmarcarla.
2. Recargar la página.
**Resultado esperado:** la casilla queda desmarcada, sigue desmarcada tras
recargar y el % de Ana baja acorde.
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda

- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 17
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
