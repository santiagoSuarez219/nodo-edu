# test-051 — Restablecer y cambiar contraseña

> Ronda asociada a `docs/specs/spec-051-restablecer-y-cambiar-contrasena.md`.
> **Estado: en curso** — arrancada el 2026-08-16, empezando por TC-051-010.

## Datos de prueba

| Recurso | Endpoint / MCP de creación | Identificador | Eliminado |
|---------|---------------------------|---------------|-----------|
| Curso académico 1 (`TEST051`, docente dev@nodo.local) | *(sin endpoint — [[DEBT-060]]; insertado vía `psql` en `mirp-lab`, confirmado por el usuario)* | `53c1a445-cf85-43ec-8167-8eeefa1f7902` | ⬜ |
| Estudiante A — `tc051010@test.nodo.local` | `POST /api/students` (matriculado directo en el curso 1) | `19f5e6cd-fc8d-4ad5-87c8-c39b6315048a` | ⬜ |
| Matrícula de A en curso 1 | (incluida en el alta anterior) | `513851fa-421f-4b9f-91f5-6ef14178e0ae` | ⬜ |
| Estudiante B (curso 2, docente distinto) | *(pendiente — se crea al llegar a TC-051-005)* | `{{id}}` | ⬜ |
| Curso académico 2 (otro docente) + matrícula de B | *(pendiente)* | `{{id}}` | ⬜ |
| Docente de desarrollo | ya sembrado (`dev@nodo.local` / `DevLocal2026!`) | `7207c852-dd6c-4df4-ac33-99985c36e26c` | n/a |

**Contraseñas usadas en la ronda** (anotarlas para poder revertir):

| Momento | Valor |
|---------|-------|
| Inicial de A (`create_student`) | `TempInicial2026!` |
| Genérica tras el restablecimiento | `{{pendiente — se registra al ejecutar TC-051-010}}` |
| Definitiva que elige A | `{{valor}}` |

**Entorno de pruebas:** desarrollo — `npm run dev` en el puerto **3002**
(`.env.local` ya apunta ahí), Supabase en `mirp-lab` vía túnel SSH (confirmado
activo).
**Fecha de la ronda:** 2026-08-16

> Se necesitan **dos navegadores** (o uno normal + uno de incógnito) para
> TC-051-010, que comprueba el cierre de las otras sesiones.
> TC-051-005 necesita un **segundo docente**: si no existe, crearlo o
> ejecutarlo con la cuenta admin sobre un curso que no sea suyo.

## Casos de prueba — Cambio voluntario

### TC-051-001 — Cambio exitoso desde `/cuenta`
**Cubre:** criterios 1 y 3
**Precondición:** sesión iniciada como el estudiante A.
**Pasos:**
1. Ir a `/cuenta` y localizar la tarjeta de cambio de contraseña.
2. Escribir la contraseña actual, una nueva válida y su confirmación. Enviar.
3. Cerrar sesión, intentar entrar con la **anterior**, y luego con la **nueva**.
**Resultado esperado:** mensaje de éxito y campos limpios; la sesión actual
sigue activa. En el paso 3, la anterior es rechazada y la nueva entra.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-002 — Contraseña actual incorrecta
**Cubre:** criterio 2 y D4
**Pasos:**
1. Escribir una contraseña actual **equivocada** y una nueva válida. Enviar.
2. Cerrar sesión y entrar con la contraseña que ya se tenía.
**Resultado esperado:** rechazo con mensaje específico en el campo de
contraseña actual, no un error genérico. El paso 2 confirma que no cambió.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-003 — Validaciones del formulario
**Cubre:** criterio 7 y D5/D6. Un subcaso por paso, verificando el mensaje:
1. Nueva de 7 caracteres.
2. Nueva y confirmación distintas.
3. Nueva **igual** a la actual.
4. Campos vacíos.
**Resultado esperado:** cada subcaso se rechaza con el error en su campo. El
subcaso 3 es el que sostiene todo el circuito (D6): sin él, el cambio forzado
se puede "cumplir" reescribiendo la genérica del docente.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-004 — La sesión no se desplaza al verificar la contraseña actual
**Cubre:** el riesgo de implementación de D4
**Precondición:** DevTools abiertas en la pestaña de cookies.
**Pasos:**
1. Anotar las cookies de sesión de Supabase.
2. Enviar el formulario con una contraseña actual **incorrecta**.
3. Comparar cookies y seguir navegando.
**Resultado esperado:** la sesión sigue siendo la misma y no hay expulsión. Si
`signInWithPassword` reescribió las cookies, este caso lo delata.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

## Casos de prueba — Restablecimiento por el docente

### TC-051-005 — Un docente no puede restablecer en un curso ajeno
**Cubre:** criterio 5 — *el caso de seguridad de la ronda*
**Precondición:** sesión como docente del curso 1.
**Pasos:**
1. Intentar restablecer la contraseña del estudiante **B** (curso 2, otro
   docente), por UI si es alcanzable y, si no, invocando la Server Action
   directamente con su `student_id`.
**Resultado esperado:** rechazo. La contraseña de B **no** cambia y B sigue
entrando con la suya.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-006 — Restablecimiento desde la lista de estudiantes
**Cubre:** criterio 4
**Precondición:** sesión como docente dueño del curso 1.
**Pasos:**
1. Ir a `/admin/courses/{{id}}` y localizar al estudiante A en la lista.
2. Pulsar "Restablecer contraseña" y confirmar en el diálogo.
3. Anotar la contraseña genérica mostrada.
4. Recargar la página.
**Resultado esperado:** la contraseña se muestra **una sola vez**, legible para
dictarla en voz alta (sin caracteres ambiguos). Tras recargar ya no aparece por
ningún lado (D7).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-007 — La contraseña genérica no queda registrada en ningún sitio
**Cubre:** D7
**Pasos:**
1. Tras TC-051-006, revisar la consola del navegador y los logs del servidor.
2. Consultar por API el registro del estudiante.
**Resultado esperado:** la contraseña no aparece en logs, ni en la respuesta de
ninguna consulta posterior, ni en `profiles`. Solo existió en la respuesta
directa del restablecimiento.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

## Casos de prueba — Cambio forzado

### TC-051-008 — El estudiante queda confinado hasta cambiarla
**Cubre:** criterio 6 — *el caso central del spec*
**Precondición:** estudiante A recién restablecido; contraseña genérica de
TC-051-006.
**Pasos:**
1. Entrar como A con la contraseña genérica.
2. Intentar navegar a `/cuenta`, a una lección y a `/cuenta/cursos`,
   escribiendo las URL directamente.
**Resultado esperado:** toda navegación redirige a `/cambiar-contrasena`, con
un texto que explica por qué. No se alcanza ninguna otra página.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-009 — Cambiarla libera la navegación sin volver a entrar
**Cubre:** criterio 8
**Pasos:**
1. Desde `/cambiar-contrasena`, escribir la genérica como actual y una nueva
   propia. Enviar.
2. Navegar a una lección y a `/cuenta`.
**Resultado esperado:** el cambio se acepta y la navegación se normaliza de
inmediato, **sin** pedir volver a iniciar sesión.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-010 — Restablecer cierra las sesiones abiertas
**Cubre:** criterio 10 y D8 — *requiere dos navegadores*
**Precondición:** el estudiante A con sesión abierta en el navegador B.
**Pasos:**
1. Como docente, restablecer la contraseña de A.
2. En el navegador B, recargar una página protegida.
**Resultado esperado:** B queda fuera y se le redirige a `/login`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-011 — Un usuario marcado siempre puede cerrar sesión
**Cubre:** criterio 9
**Precondición:** estudiante marcado, confinado en `/cambiar-contrasena`.
**Pasos:**
1. Pulsar cerrar sesión sin cambiar la contraseña.
**Resultado esperado:** la sesión se cierra y se llega a `/login`. Sin esta
exención, un usuario marcado que no recuerde la genérica queda atrapado sin
salida.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-012 — El gate no añade consultas a base de datos
**Cubre:** criterio 13 y D2 — relacionado con [[DEBT-059]]
**Pasos:**
1. Navegar por varias páginas con un usuario **no** marcado.
2. Revisar los logs de consultas de Supabase para esos requests.
**Resultado esperado:** el gate no genera ninguna consulta adicional: la marca
se lee de `app_metadata`, que el middleware ya recibe en `getUser()`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-013 — Fallo de infraestructura no se disfraza
**Cubre:** criterio 11 y D9
**Pasos:**
1. Con el formulario relleno correctamente, cortar el túnel:
   `pkill -f "ssh.*-L 54321.*mirp-lab"`
2. Enviar. Restaurar el túnel y verificar que la contraseña no cambió.
**Resultado esperado:** mensaje de servicio no disponible, distinto de
"contraseña incorrecta", sin reportar éxito.
> ⚠️ Cortar el túnel también tumba Auth, así que spec-046 puede responder 503
> antes de llegar al formulario. Ese 503 **cuenta como resultado válido**
> (es señalización honesta); anotarlo en Hallazgos.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

## Casos de prueba — MCP

### TC-MCP-051-001 — `reset_student_password`
**Herramienta probada:** `reset_student_password` en `students-mcp`
**Cubre:** criterio 12
**Input de prueba:** `student_id` del estudiante A, sin `password` (generada).
**Output esperado:** la contraseña aplicada, devuelta una sola vez. El
estudiante entra con ella y queda confinado en `/cambiar-contrasena`
(reverificar con TC-051-008).
**Comprobación adicional:** invocar con un `student_id` inexistente devuelve un
error claro, no un éxito silencioso.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 14
- Diagnóstico de cuentas duplicadas (Fase 7): {{pendiente}}
- Contraseña del docente de desarrollo restaurada: ⬜ Pendiente
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
