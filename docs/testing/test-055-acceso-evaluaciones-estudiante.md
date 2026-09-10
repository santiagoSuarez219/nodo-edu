# test-055 — Acceso a las evaluaciones desde el detalle de matrícula del estudiante

> Pruebas manuales de `docs/specs/spec-055-acceso-evaluaciones-estudiante.md`
> (resuelve **DEBT-084**). Escritas junto con el spec, antes de la
> implementación: **hoy los casos que esperan ver la tarjeta fallan** — ese es
> el estado esperado hasta que la implementación los ponga en verde.
>
> Los casos que esperan que la tarjeta **no** aparezca (TC-055-003, 004, 006 y
> 007) pasan trivialmente hoy, porque la tarjeta no existe. Su valor está en
> ejecutarlos **después** de implementar: son los que confirman que la regla de
> visibilidad no muestra de más.

## Datos de prueba

> Creados el 2026-09-10 vía `question-bank-mcp` / `assignment-mcp` /
> `students-mcp` contra desarrollo. Deben eliminarse al cerrar la ronda, salvo
> los fixtures permanentes marcados "n/a".

### Desvíos respecto al plan original

- **Curso B sustituido por "DEV — Análisis de Algoritmos"** (`caa8d264-fd0e-4d78-ad9a-612e5530c500`,
  docente `dev@nodo.local`). Curso B pertenece al docente secundario
  (`docente2.test054@nodo.local`), y `assignment-mcp` está fijado a un único
  actor vía `QUESTION_BANK_AGENT_TEACHER_ID` (`dev@nodo.local`) — no puede
  crear grupos ahí. "DEV — Análisis de Algoritmos" comparte el mismo
  `course_slug` (`analisis-de-algoritmos`) que "Test-054 Curso A", así que
  sigue cubriendo el aislamiento por grupo académico que TC-055-008 necesita.
- **Estudiantes de los cursos `DEV —`** (`dev-estudiante1/2/3@nodo.local`,
  `DevStudent2026!`) se usan junto con Ana/Bruno/Carla para repartir los
  casos entre cursos sin que un mismo curso acumule condiciones contradictorias
  (p. ej. "cero grupos abiertos" y "dos grupos abiertos" a la vez).
- **Orden de ejecución ajustado** respecto a la numeración de los casos — ver
  "Orden de esta ronda" más abajo. TC-055-008 corre **después** de TC-055-006
  a propósito: reutiliza el cierre de esa ventana para que Curso A quede sin
  grupos abiertos, que es la precondición que TC-055-008 necesita.
- Toda pregunta y grupo de esta ronda lleva el prefijo **"spec-055"** en el
  título y la keyword `spec-055-prueba` (pregunta), para distinguirlos de
  contenido real a simple vista.

| Recurso | Identificador | Eliminado |
|---|---|---|
| Docente de desarrollo (fixture permanente, **no** crear ni borrar) | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Curso "Test-054 Curso A" (`course_slug: analisis-de-algoritmos`, fixture permanente) | `65a0bad9-16a8-4c27-bec6-3e097f6055fc` | n/a |
| Curso "DEV — Análisis de Algoritmos" (mismo `course_slug`, fixture permanente) | `caa8d264-fd0e-4d78-ad9a-612e5530c500` | n/a |
| Curso "DEV — Programación Científica" (fixture permanente) | `10ecb0c4-4540-4b4b-9e46-de21d2de9398` | n/a |
| Curso "Test-054 Curso Vacío" (**sin** `course_slug`, fixture permanente) | `bdf3ca64-adbe-4c6b-915e-91e7e9c575d0` | n/a |
| Estudiante Ana Gómez (activa en Curso A) | `ana.gomez.test054@nodo.local` / `Test054Ana!` | n/a |
| Estudiante Carla Ruiz (**retirada** de Curso A) | `carla.ruiz.test054@nodo.local` / `Test054Carla!` | n/a |
| Estudiante `dev-estudiante1` (activo en DEV-ADA; matriculado además en Curso A para esta ronda) | `dev-estudiante1@nodo.local` / `DevStudent2026!` | Matrícula en Curso A: ⬜ (`unenroll_student`) |
| Estudiante `dev-estudiante2` (sin cambios, no usado en esta ronda) | `dev-estudiante2@nodo.local` / `DevStudent2026!` | n/a |
| Estudiante `dev-estudiante3` (matriculado además en Curso Vacío para esta ronda) | `dev-estudiante3@nodo.local` / `DevStudent2026!` | Matrícula en Curso Vacío: ⬜ (`unenroll_student`) |
| Keyword `spec-055-prueba` (catálogo del banco) | `spec-055-prueba` | ⬜ (`delete` manual — sin herramienta MCP; ver nota) |
| Pregunta de prueba compartida (reutilizada en las 12 variantes de abajo) | `4e38d3ac-51bc-4d93-98ca-44e31d83f370` | ⬜ (`delete_question`, 409 si algún grupo con envíos la sigue usando) |
| Grupo "spec-055 — Grupo abierto 1" — DEV-ADA, publicado, abierto | `9a2680d8-cc73-4a27-9817-94990692d546` | ⬜ |
| Grupo "spec-055 — Grupo abierto 2" — DEV-ADA, publicado, abierto | `3daec2b8-2f23-4179-a832-14b207eec366` | ⬜ |
| Grupo "spec-055 — Grupo borrador" — DEV-ADA, **sin publicar** | `ad30c389-bf3a-4fdd-876f-1098b1a0bc3d` | ⬜ |
| Grupo "spec-055 — Apertura futura" — DEV-PC, publicado, `opens_at` 2026-09-10 22:10 UTC | `b639d144-5311-46b0-850b-feaeda942d5a` | ⬜ |
| Grupo "spec-055 — Curso sin course_slug" — Curso Vacío, publicado, abierto | `d1b874e8-f18d-433b-a160-e4272ccdf1db` | ⬜ |
| Grupo "spec-055 — Grupo para envío" — Curso A, publicado, abierto (TC-055-005/006/007/008) | `4d47ea5a-4e3e-4190-a27a-6ad246f05731` | ⬜ (409 tras el envío de TC-055-005 — ver nota) |

> ⚠️ **Los envíos no se pueden borrar vía API:** `delete_assignment_group`
> devuelve 409 si el grupo tiene entregas. El grupo "spec-055 — Grupo para
> envío" quedará en desarrollo al cierre de la ronda si TC-055-005 se
> completa; se documentará aquí el resultado real.

> ⚠️ **`delete_question` también da 409** si alguna pregunta sigue montada en
> un grupo con envíos, por la misma razón. Si la pregunta compartida no se
> puede borrar al cerrar la ronda, queda como dato de prueba residual, sin
> impacto en el banco real (nunca se monta en ninguna lección).

> ⚠️ **La keyword `spec-055-prueba` no tiene herramienta de borrado en
> `question-bank-mcp`** (solo `create_keyword`/`list_keywords`). Si hace falta
> eliminarla al cerrar la ronda, requiere un `DELETE` directo en la base de
> desarrollo — pedir confirmación explícita antes de ejecutarlo.

**Entorno de pruebas:** desarrollo — instancia Supabase local en `asus` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). Túnel y stack verificados
arriba antes de crear estos datos. **Nunca contra producción.**

**Fecha de la ronda:** 2026-09-10

### Orden de esta ronda

1. TC-055-001
2. TC-055-002
3. TC-055-003
4. TC-055-004 (esperar a que `opens_at` del grupo de DEV-PC pase — 2026-09-10 22:10 UTC)
5. TC-055-005
6. TC-055-007 (con la ventana del Grupo para envío todavía abierta)
7. TC-055-006 (cierra esa ventana)
8. TC-055-008 (ahora sí, Curso A sin grupos abiertos)
9. TC-055-009
10. TC-055-010 (requiere tu autorización explícita en el momento)
11. TC-055-011
12. TC-055-012

## Casos de prueba

### TC-055-001 — Tarjeta visible con una evaluación abierta
**Precondición:** `dev-estudiante2` activo en "DEV — Estructuras de Datos"; 1 grupo publicado y dentro de ventana (el quiz de preview `40dc40c2…`, abierto hasta 2026-09-10 23:59 UTC). Sin intentos previos.
**Datos de prueba usados:** `dev-estudiante2@nodo.local` / `DevStudent2026!` / DEV — Estructuras de Datos / grupo `40dc40c2-6fe8-498a-8418-b593fd8cc5d5`
**Pasos:**
1. Iniciar sesión como `dev-estudiante2`.
2. Ir a **Mis cursos** y abrir "DEV — Estructuras de Datos".
3. Observar la parte superior de la página, entre el título y "Información del curso".
4. Hacer clic en la tarjeta "Evaluaciones".
**Resultado esperado:** Aparece la tarjeta "Evaluaciones" **arriba** de "Información del curso", con el texto "Tienes 1 evaluación abierta" (singular) y un badge con `1`. El clic lleva a `/cuenta/cursos/<enrollmentId>/evaluaciones`, que lista ese único grupo con estado "Sin intentos".
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-002 — Plural, y coherencia exacta con el listado
**Precondición:** `dev-estudiante1` activo en "DEV — Análisis de Algoritmos", con 2 grupos publicados y abiertos (`9a2680d8…`, `3daec2b8…`) y 1 en borrador (`ad30c389…`, sin publicar).
**Datos de prueba usados:** `dev-estudiante1@nodo.local` / `DevStudent2026!` / DEV — Análisis de Algoritmos
**Pasos:**
1. Como `dev-estudiante1`, abrir el detalle de "DEV — Análisis de Algoritmos".
2. Leer el conteo de la tarjeta.
3. Entrar al listado y contar los ítems.
**Resultado esperado:** La tarjeta dice "Tienes 2 evaluaciones abiertas" (plural). El listado muestra **exactamente** esos 2 grupos ("spec-055 — Grupo abierto 1" y "spec-055 — Grupo abierto 2"); el borrador ("spec-055 — Grupo borrador") no aparece en ninguno de los dos lugares. El número de la tarjeta y el del listado coinciden.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-003 — Sin evaluaciones abiertas, sin tarjeta
**Precondición:** `dev-estudiante3` activo en "DEV — Programación Científica", que a esta hora **no** tiene ningún grupo publicado dentro de ventana (el único grupo del curso, "spec-055 — Apertura futura", todavía no abrió — `opens_at` 2026-09-10 22:10 UTC). Ejecutar **antes** de esa hora.
**Datos de prueba usados:** `dev-estudiante3@nodo.local` / `DevStudent2026!` / DEV — Programación Científica
**Pasos:**
1. Iniciar sesión como `dev-estudiante3`.
2. Abrir el detalle de "DEV — Programación Científica".
**Resultado esperado:** La tarjeta "Evaluaciones" **no aparece**. "Información del curso", "Calificaciones" y el resumen de autoevaluaciones se ven exactamente igual que antes del cambio, sin huecos ni espacios vacíos.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-004 — Solo una evaluación con apertura futura
**Precondición:** Mismo curso y estudiante de TC-055-003, ejecutado **después** de que pase `opens_at` (2026-09-10 22:10 UTC) del grupo "spec-055 — Apertura futura" (`b639d144…`).
**Datos de prueba usados:** `dev-estudiante3@nodo.local` / `DevStudent2026!` / DEV — Programación Científica / grupo `b639d144-5311-46b0-850b-feaeda942d5a`
**Pasos:**
1. (Si TC-055-003 ya se ejecutó, ya estás logueado y en la página correcta — solo hace falta esperar y recargar.) Si no, iniciar sesión como `dev-estudiante3` y abrir el detalle de "DEV — Programación Científica" antes de las 22:10 UTC.
2. Esperar a que sean las 22:10 UTC (hora Colombia: 17:10) y recargar la página.
**Resultado esperado:** Antes de `opens_at`, la tarjeta **no aparece** (confirmado en TC-055-003). Después de `opens_at`, al recargar, **aparece** con "Tienes 1 evaluación abierta". (Es el mismo comportamiento que tendrá el quiz real de Estructuras de Datos al abrir mañana.)
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-005 — Evaluación enviada con la ventana todavía abierta
**Precondición:** Ana activa en "Test-054 Curso A"; grupo "spec-055 — Grupo para envío" (`4d47ea5a…`) publicado y dentro de ventana.
**Datos de prueba usados:** `ana.gomez.test054@nodo.local` / `Test054Ana!` / Test-054 Curso A / grupo `4d47ea5a-4e3e-4190-a27a-6ad246f05731`
**Pasos:**
1. Como Ana, resolver y **enviar** el intento del grupo "spec-055 — Grupo para envío" (una sola pregunta trivial: "¿Cuánto es 2 + 2?").
2. Volver al detalle del curso.
3. Entrar por la tarjeta al listado y abrir ese grupo.
**Resultado esperado:** La tarjeta **sigue visible** (el grupo sigue abierto). En el listado el grupo muestra "Calificado" (es `multiple_choice`, se autocalifica) o "Enviado — pendiente de revisión". Al abrirlo, lleva a la página de resultados.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-007 — Matrícula retirada
> Ejecutar **antes** de TC-055-006: necesita que el grupo siga dentro de ventana.

**Precondición:** Carla retirada de "Test-054 Curso A"; el grupo "spec-055 — Grupo para envío" (`4d47ea5a…`) sigue publicado y dentro de ventana.
**Datos de prueba usados:** `carla.ruiz.test054@nodo.local` / `Test054Carla!` / Test-054 Curso A
**Pasos:**
1. Iniciar sesión como Carla.
2. Entrar por URL directa al detalle de su matrícula en el Curso A.
3. Abrir a mano `/cuenta/cursos/<enrollmentId>/evaluaciones`.
**Resultado esperado:** El detalle muestra el estado "Retirado" y **no** muestra la tarjeta "Evaluaciones", aunque el curso tenga una evaluación abierta. La URL directa del listado da **404**.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-006 — Evaluación enviada con la ventana ya cerrada
**Precondición:** El grupo "spec-055 — Grupo para envío" (`4d47ea5a…`) con `closes_at` movido al pasado; ningún otro grupo abierto en "Test-054 Curso A".
**Datos de prueba usados:** Ana / Test-054 Curso A / grupo `4d47ea5a-4e3e-4190-a27a-6ad246f05731`
**Pasos:**
1. Avisar antes de ejecutar: se mueve `closes_at` de este grupo al pasado vía `update_assignment_group`.
2. Como Ana, abrir el detalle del curso.
3. Abrir a mano la URL de resultados de ese grupo.
**Resultado esperado:** La tarjeta **no aparece**. La URL directa de resultados da **404**.
**⚠️ Esto último es una limitación conocida, no un fallo de este spec:** los resultados son inaccesibles tras el cierre desde antes de spec-055 (**DEBT-085**). Marcar el caso como aprobado si la tarjeta no aparece, y anotar el 404 como observación.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-008 — Aislamiento entre grupos académicos con el mismo `course_slug`
> Ejecutar **después** de TC-055-006: reutiliza que "Test-054 Curso A" quede sin
> grupos abiertos al cerrarse esa ventana.

**Precondición:** `dev-estudiante1` activo en "Test-054 Curso A" **y** en "DEV — Análisis de Algoritmos" (ambos `analisis-de-algoritmos`); grupos abiertos **solo** en DEV — Análisis de Algoritmos (`9a2680d8…`, `3daec2b8…`); Curso A ya sin grupos abiertos (tras TC-055-006).
**Datos de prueba usados:** `dev-estudiante1@nodo.local` / `DevStudent2026!` / Test-054 Curso A / DEV — Análisis de Algoritmos
**Pasos:**
1. Como `dev-estudiante1`, abrir el detalle de "DEV — Análisis de Algoritmos".
2. Abrir el detalle de "Test-054 Curso A".
**Resultado esperado:** La tarjeta aparece en el detalle de **DEV — Análisis de Algoritmos** ("Tienes 2 evaluaciones abiertas") y **no** en el de **Test-054 Curso A**, aunque ambos cursos compartan `course_slug`. El listado de Curso A no muestra los grupos de DEV — Análisis de Algoritmos.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-009 — Grupo académico sin `course_slug`
**Precondición:** `dev-estudiante3` matriculado en "Test-054 Curso Vacío" (sin `course_slug`) y el grupo "spec-055 — Curso sin course_slug" (`d1b874e8…`) publicado y abierto en ese curso.
**Datos de prueba usados:** `dev-estudiante3@nodo.local` / `DevStudent2026!` / Test-054 Curso Vacío / grupo `d1b874e8-f18d-433b-a160-e4272ccdf1db`
**Pasos:**
1. Iniciar sesión con `dev-estudiante3`.
2. Abrir el detalle de "Test-054 Curso Vacío".
**Resultado esperado:** La tarjeta **aparece** con "Tienes 1 evaluación abierta", aunque la página no muestre contador de lecciones (el curso no tiene contenido asociado).
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-010 — Fallo de la consulta de evaluaciones
**Precondición:** TC-055-001 montado. **Requiere autorización explícita del usuario en la sesión de pruebas:** consiste en manipular permisos directamente en la base de desarrollo.
**Datos de prueba usados:** Ana / Curso A / grupo abierto 1
**Pasos:**
1. En la base de `asus`, revocar la lectura de la tabla solo para usuarios autenticados: `REVOKE SELECT ON assignment_variant_groups FROM authenticated;`
2. Como `dev-estudiante2`, abrir el detalle de "DEV — Estructuras de Datos".
3. Entrar por la tarjeta al listado.
4. Restaurar el permiso: `GRANT SELECT ON assignment_variant_groups TO authenticated;`
5. Recargar ambas páginas.
**Resultado esperado:**
- Paso 2: la página de detalle se renderiza **completa** (información, calificaciones, autoevaluaciones) con la tarjeta en versión **genérica**: "Consulta las evaluaciones de este curso", **sin** badge de conteo. No aparece la página de error general.
- Paso 3: el listado muestra el `ErrorState` de infraestructura ("No pudimos contactar el servidor…"), **no** "No hay evaluaciones disponibles por ahora".
- Paso 5: todo vuelve a la normalidad, con el conteo correcto.
**Si no se autoriza la manipulación de la base:** validar el criterio 7 por revisión de código y dejarlo anotado en "Hallazgos".
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-011 — Teclado y lector de pantalla
**Precondición:** TC-055-001 montado.
**Datos de prueba usados:** `dev-estudiante2@nodo.local` / `DevStudent2026!` / DEV — Estructuras de Datos / grupo `40dc40c2-6fe8-498a-8418-b593fd8cc5d5`
**Pasos:**
1. En el detalle del curso, navegar solo con Tab hasta la tarjeta.
2. Observar el indicador de foco.
3. Presionar Enter.
4. (Opcional) Con VoiceOver activo, enfocar la tarjeta.
**Resultado esperado:** La tarjeta se alcanza con Tab, muestra un anillo de foco visible, y Enter navega al listado. El lector de pantalla la anuncia como **enlace** con el texto visible ("Evaluaciones… Tienes 1 evaluación abierta"). El chevron decorativo no se anuncia.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-012 — Modo claro, modo oscuro y móvil
**Precondición:** TC-055-001 montado.
**Datos de prueba usados:** `dev-estudiante2@nodo.local` / `DevStudent2026!` / DEV — Estructuras de Datos / grupo `40dc40c2-6fe8-498a-8418-b593fd8cc5d5`
**Pasos:**
1. Ver el detalle del curso con el sistema en modo claro.
2. Cambiar el sistema a modo oscuro (el tema sigue la preferencia del SO).
3. Reducir el ancho de la ventana a unos 375 px.
**Resultado esperado:** En ambos modos la tarjeta tiene el mismo fondo, borde y radio que "Información del curso", con texto legible y el badge con contraste correcto. En 375 px no hay desbordes horizontales y el badge no se superpone al texto. El anillo de foco se ve en ambos modos.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

## Resumen de la ronda
- Aprobados: 0 — Fallidos: 0 — Pendientes: 12
- Hallazgos escalados a `docs/specs/backlog.md`: _por definir_
- Limpieza de datos de prueba: ⬜ Pendiente
