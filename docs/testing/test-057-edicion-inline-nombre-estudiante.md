# test-057 — Edición inline del nombre del estudiante

## Datos de prueba
> Se reutilizan los fixtures de spec-054 documentados en CLAUDE.md
> ("Datos de prueba reutilizables en desarrollo"), ya montados en el
> entorno de desarrollo (`asus`). **Los nombres originales deben
> restaurarse al cerrar la ronda** — son fixtures a propósito, no datos
> huérfanos.

| Recurso | Identificador | Notas |
|---------|---------------|-------|
| Curso "Test-054 Curso A" | `65a0bad9-16a8-4c27-bec6-3e097f6055fc` | Docente `dev@nodo.local`. |
| Curso "Test-054 Curso B" | `98e1d74e-8bc9-426d-9a3c-ce8b8d846c2c` | Docente `docente2.test054@nodo.local`. |
| Estudiante "Ana Gómez" | `4af748bf-01d7-469e-bfe1-cacb91249de5` | Activa en Curso A y B. Objetivo de edición en los casos felices. |
| Estudiante "Bruno Díaz" | `02021ec2-2116-4c16-830b-2c31b22ef257` | Activo solo en Curso A. |
| Estudiante "Carla Ruiz" | `8363e1c1-2c61-4fab-95bb-bf25aa780f38` | **Retirada** del Curso A — precondición exacta para TC-057-007. |
| Docente secundario | `docente2.test054@nodo.local` / `Test054Docente2!` | Dueño del Curso B — usado para TC-057-006 (intentar editar un estudiante de un curso ajeno). |

**Entorno de pruebas:** desarrollo (`asus`, instancia local vía túnel SSH)
**Fecha de la ronda:** 2026-09-22

## Casos de prueba

### TC-057-001 — Control visible solo en Activos
**Precondición:** Curso A con Ana y Bruno activos, Carla retirada.
**Pasos:**
1. Iniciar sesión como `dev@nodo.local`.
2. Entrar al detalle del Curso A, pestaña "Estudiantes".
**Resultado esperado:** cada fila de la tabla "Activos" muestra el nombre
junto a un botón de lápiz (editar); la tabla "Retirados" muestra el
nombre de Carla como texto plano, sin control de edición.
**Estado:** ✅ Aprobado
**Hallazgos:** Ana Gómez y Bruno Díaz (Activos) muestran el ícono de
lápiz con `aria-label="Editar nombre de {nombre}"`; Carla Ruiz y
"Estudiante Dev Uno" (Retirados) se muestran como texto plano, sin
control — confirma también D4 y sirve de evidencia visual para
TC-057-007.

### TC-057-002 — Editar y guardar con Enter
**Precondición:** TC-057-001.
**Datos de prueba usados:** Ana Gómez.
**Pasos:**
1. Clic en el lápiz junto al nombre de Ana.
2. Verificar que el input aparece con el texto actual seleccionado.
3. Escribir un nombre corregido (ej. "Ana María Gómez") y presionar Enter.
**Resultado esperado:** la celda muestra el nombre nuevo tras un breve
estado de guardado (spinner/check); no hay salto de layout en la tabla.
**Estado:** ✅ Aprobado
**Hallazgos:** "Ana Gómez" → "Ana María Gómez", guardado correctamente
(verificado con zoom que la tilde de "María" se persistió bien, no es
artefacto de renderizado). Sin salto de layout gracias al `min-width` de
la celda.

### TC-057-003 — Cancelar con Escape
**Precondición:** TC-057-001.
**Datos de prueba usados:** Bruno Díaz.
**Pasos:**
1. Clic en el lápiz junto al nombre de Bruno.
2. Escribir cualquier texto distinto.
3. Presionar Escape.
**Resultado esperado:** la celda vuelve al modo lectura con el nombre
original sin cambios; no se dispara ninguna petición de guardado.
**Estado:** ✅ Aprobado
**Hallazgos:** Bruno Díaz mantuvo su nombre original tras escribir
"Texto que no debe guardarse" y presionar Escape.

### TC-057-004 — Validación: nombre vacío o muy corto
**Precondición:** TC-057-001.
**Datos de prueba usados:** Bruno Díaz.
**Pasos:**
1. Clic en el lápiz junto al nombre de Bruno.
2. Borrar todo el contenido (o dejar solo espacios, o un solo carácter).
3. Intentar guardar (Enter o ✓).
**Resultado esperado:** se rechaza con un mensaje de error en español
(`role="alert"`); la edición permanece abierta con lo tecleado; el nombre
en la tabla no cambia.
**Estado:** ✅ Aprobado
**Hallazgos:** Al borrar todo el contenido y presionar Enter, se mostró
"El nombre debe tener al menos 2 caracteres" en rojo bajo el input; la
edición quedó abierta (no volvió a modo lectura); el nombre de Bruno no
cambió (confirmado al volver a la tabla).

### TC-057-005 — Propagación a otras vistas del curso
**Precondición:** TC-057-002 aprobado (Ana ya renombrada).
**Pasos:**
1. Sin recargar manualmente, entrar a la pestaña "Asistencia" del Curso A.
2. Entrar a la pestaña "Calificaciones" del Curso A.
**Resultado esperado:** ambas vistas muestran el nombre nuevo de Ana, sin
necesidad de recargar el navegador.
**Estado:** ✅ Aprobado
**Hallazgos:** La pestaña "Calificaciones" no tiene ítems configurados,
así que no lista nombres (no aporta evidencia). La pestaña "Asistencia"
sí mostró "Ana María Gómez" en la planilla, confirmando que
`revalidatePath(..., "layout")` alcanza las rutas hermanas (D9).

### TC-057-006 — Autorización: curso ajeno
**Precondición:** el docente secundario no es dueño del Curso A.
**Datos de prueba usados:** `docente2.test054@nodo.local` / `Test054Docente2!`.
**Pasos:**
1. Iniciar sesión como el docente secundario.
2. Intentar invocar `updateStudentNameAction` para un estudiante del
   Curso A (no accesible desde su UI — verificar que ni siquiera se
   ofrece esa fila; si se dispone de acceso directo a la acción para
   pruebas, documentarlo aquí).
**Resultado esperado:** la acción falla y `profiles.full_name` no
cambia. Desde la UI, el docente secundario ni siquiera puede llegar a
esa fila (no ve el Curso A en su panel).
**Estado:** ✅ Aprobado
**Hallazgos:** "Mis cursos" del docente secundario solo lista "Test-054
Curso B" — el Curso A no aparece. Acceso directo por URL a
`/admin/courses/65a0bad9-…` devuelve **404** (el gate de la página
bloquea antes de exponer cualquier fila o control). No fue necesario
invocar la Server Action directamente: la UI ya cierra el camino por
completo.

### TC-057-007 — Autorización: estudiante retirado
**Precondición:** Carla Ruiz retirada del Curso A.
**Datos de prueba usados:** Carla Ruiz.
**Pasos:**
1. Como `dev@nodo.local`, verificar que Carla (en "Retirados") no tiene
   control de edición.
2. (Si se dispone de acceso directo a la Server Action para pruebas)
   invocar `updateStudentNameAction` con el `studentId` de Carla y el
   Curso A.
**Resultado esperado:** la UI no ofrece el control; la acción invocada
directamente falla en el servidor (gate con `requireActive: true`).
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado visualmente en TC-057-001: Carla (retirada) se
muestra como texto plano en la tabla "Retirados", sin lápiz de edición.
No se probó la invocación directa de la Server Action (no hay acceso de
pruebas expuesto para eso); la cobertura de UI es suficiente para el
criterio de aceptación 1. La garantía del servidor (`requireActive:
true` en el gate) queda respaldada por lectura de código, no ejecución.

### TC-057-008 — Solo teclado
**Precondición:** TC-057-001.
**Datos de prueba usados:** Bruno Díaz.
**Pasos:**
1. Navegar la tabla usando únicamente Tab/Shift+Tab.
2. Llegar al botón de lápiz de la fila de Bruno con foco visible y
   activarlo con Enter/Space.
3. Editar el nombre y guardar, todo sin usar el mouse.
**Resultado esperado:** el flujo completo es operable solo con teclado,
con foco visible en cada control.
**Estado:** ✅ Aprobado
**Hallazgos:** Al activar la edición, el input recibió foco automático
con el texto seleccionado. Tab movió el foco al botón ✓ con anillo de
foco visible; Enter guardó correctamente ("Bruno Díaz" →
"Bruno Andrés Díaz"). Flujo completo sin mouse.

### TC-057-009 — `resetStudentPasswordAction` sigue funcionando igual
**Precondición:** ninguna especial.
**Datos de prueba usados:** cualquier estudiante activo del Curso A.
**Pasos:**
1. Usar el botón "Restablecer contraseña" de un estudiante activo.
**Resultado esperado:** funciona exactamente igual que antes de este spec
(la extracción del helper de autorización no cambia su comportamiento).
**Estado:** ✅ Aprobado
**Hallazgos:** El diálogo de confirmación se abrió correctamente sobre
Bruno Andrés Díaz (nombre ya editado, confirma que `ResetPasswordButton`
recibe el nombre actualizado), mostrando
"¿Restablecer la contraseña de Bruno Andrés Díaz?". Se canceló sin
completar el restablecimiento real (no hacía falta generar una
contraseña nueva para validar este caso).

## Resumen de la ronda
- Aprobados: 9 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno (no se encontraron
  defectos). TC-057-006 y TC-057-007 se validaron por vía indirecta —
  bloqueo de UI (404 / ausencia de control) — en vez de invocar la Server
  Action directamente; queda anotado en cada caso.
- Nombres de prueba restaurados a los originales: ✅ Completada (Ana Gómez
  y Bruno Díaz vueltos a su nombre original vía `students-mcp
  update_student`).
- Estado de Carla Ruiz: ✅ Restaurada a **retirada** del Curso A (quedó
  activa por accidente tras la ronda de spec-056; se retiró de nuevo al
  preparar los datos de esta ronda para que el fixture documentado en
  CLAUDE.md vuelva a ser exacto).
- Limpieza de datos de prueba: ✅ Completada — no se crearon recursos
  nuevos, solo se editaron y restauraron nombres de fixtures existentes.
