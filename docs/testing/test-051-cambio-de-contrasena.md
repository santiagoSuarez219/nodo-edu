# test-051 — Cambio de contraseña con sesión activa

> Ronda asociada a `docs/specs/spec-051-cambio-de-contrasena.md`.
> **Estado: pendiente de implementación** — los casos nacen con el spec y se
> ejecutan cuando el usuario apruebe e implemente el paquete.

## Datos de prueba

| Recurso | Endpoint / MCP de creación | Identificador | Eliminado |
|---------|---------------------------|---------------|-----------|
| Estudiante de prueba | `students-mcp.create_student` | `{{id}}` | ⬜ |
| Curso académico + matrícula | `students-mcp.enroll_student` | `{{id}}` | ⬜ |
| Docente de desarrollo | ya sembrado (`dev@nodo.local`) | — | n/a |

**Contraseñas usadas en la ronda** (anotarlas aquí para poder revertir):

| Momento | Valor |
|---------|-------|
| Temporal inicial (la que genera `create_student`) | `{{valor}}` |
| Primera contraseña nueva | `{{valor}}` |
| Segunda (TC-051-008) | `{{valor}}` |

**Entorno de pruebas:** desarrollo (`mirp-lab`)
**Fecha de la ronda:** {{pendiente}}

> Se necesitan **dos navegadores distintos** (o uno normal + uno de incógnito)
> para TC-051-005: el caso comprueba qué pasa con las **otras** sesiones.

## Casos de prueba

### TC-051-001 — Cambio exitoso
**Cubre:** criterios 1 y 3
**Precondición:** sesión iniciada como el estudiante de prueba con su
contraseña temporal.
**Pasos:**
1. Ir a `/cuenta`.
2. Localizar la tarjeta de cambio de contraseña bajo el formulario de perfil.
3. Escribir la contraseña actual, una nueva válida (≥ 8 caracteres) y su
   confirmación.
4. Enviar.
**Resultado esperado:** mensaje de éxito visible, campos limpios, y aviso de
que se cerraron las demás sesiones. La sesión actual **sigue activa** — no
redirige a `/login`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-002 — La contraseña nueva es la que sirve
**Cubre:** criterio 3 — *el que confirma que el cambio fue real*
**Precondición:** justo después de TC-051-001.
**Pasos:**
1. Cerrar sesión.
2. Intentar entrar con la contraseña **anterior**.
3. Entrar con la contraseña **nueva**.
**Resultado esperado:** la anterior es rechazada; la nueva entra. Sin este
caso, TC-051-001 solo prueba que la UI dice "éxito".
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-003 — Contraseña actual incorrecta
**Cubre:** criterio 2 y D2
**Precondición:** sesión iniciada.
**Pasos:**
1. En la tarjeta, escribir una contraseña actual **equivocada** y una nueva
   válida.
2. Enviar.
3. Cerrar sesión y volver a entrar con la contraseña que ya tenías.
**Resultado esperado:** rechazo con mensaje específico ("la contraseña actual
no es correcta" o equivalente) en el campo de contraseña actual, **no** un
error genérico. El paso 3 confirma que la contraseña **no** cambió.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-004 — Validaciones del formulario
**Cubre:** criterios 5 y 6
**Precondición:** sesión iniciada.
**Pasos (uno por subcaso, verificando el mensaje en cada uno):**
1. Nueva contraseña de 7 caracteres.
2. Nueva contraseña y confirmación distintas.
3. Nueva contraseña **igual** a la actual.
4. Campos vacíos.
**Resultado esperado:** cada subcaso se rechaza con el error en el campo que
corresponde. El subcaso 3 es el que más importa: sin él, el formulario acepta
un "cambio" que no cambia nada y reporta éxito (D5).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-005 — Las otras sesiones se cierran, la propia no
**Cubre:** criterio 4 y D3 — *requiere dos navegadores*
**Precondición:** el mismo usuario con sesión iniciada en **dos** navegadores
(A y B).
**Pasos:**
1. En el navegador A, cambiar la contraseña con éxito.
2. En A, navegar a otra página (p. ej. `/cuenta/cursos`).
3. En B, recargar cualquier página protegida.
**Resultado esperado:** A sigue navegando con normalidad; **B queda fuera** y
se le redirige a `/login`. Es el comportamiento que da sentido a cambiar la
contraseña porque alguien más la conoce.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-006 — Fallo de infraestructura no se disfraza de contraseña incorrecta
**Cubre:** criterio 7 y D6
**Precondición:** sesión iniciada; formulario relleno con datos **correctos**.
**Pasos:**
1. Cortar el túnel SSH a `mirp-lab`:
   `pkill -f "ssh.*-L 54321.*mirp-lab"`
2. Enviar el formulario.
3. Restaurar el túnel y verificar por API que la contraseña no cambió.
**Resultado esperado:** mensaje de **servicio no disponible**, claramente
distinto de "contraseña actual incorrecta", y ningún reporte de éxito.
> ⚠️ Cortar el túnel también tumba Auth, así que spec-046 puede responder 503
> antes de llegar al formulario. Si ocurre, ese 503 **cuenta como resultado
> válido** para este caso (es señalización honesta); anotarlo en Hallazgos y,
> si se quiere probar la rama concreta de la acción, degradar solo la consulta
> como describe test-047/test-050.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-007 — La sesión no se desplaza al verificar la contraseña actual
**Cubre:** el riesgo de implementación señalado en D2
**Precondición:** sesión iniciada; DevTools abiertas en la pestaña Aplicación
(cookies).
**Pasos:**
1. Anotar las cookies de sesión de Supabase antes de enviar.
2. Enviar el formulario con una contraseña actual **incorrecta** (el caso que
   verifica credenciales pero no debería cambiar nada).
3. Comparar las cookies y confirmar que se sigue navegando con normalidad.
**Resultado esperado:** la sesión sigue siendo la misma y el usuario no es
expulsado. Si `signInWithPassword` reescribió las cookies, este caso lo delata.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-008 — Funciona igual para docente y admin
**Cubre:** criterio 8
**Precondición:** sesión como el docente de desarrollo (`dev@nodo.local`).
**Pasos:**
1. Repetir TC-051-001 y TC-051-002 con la cuenta docente.
2. **Restaurar la contraseña original al terminar** (`DevLocal2026!`), o dejar
   anotado el valor nuevo en la tabla de arriba.
**Resultado esperado:** comportamiento idéntico al del estudiante. El acceso al
panel de administración sigue funcionando tras el cambio.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-051-009 — Accesibilidad del formulario
**Cubre:** consistencia con el patrón de `AccountForm`
**Precondición:** sesión iniciada.
**Pasos:**
1. Recorrer los tres campos y el botón solo con el teclado (Tab / Shift+Tab).
2. Provocar un error de validación y comprobar que el mensaje queda asociado a
   su campo (`aria-describedby`).
3. Verificar que el gestor de contraseñas del navegador ofrece guardar la nueva
   (`autoComplete="new-password"`).
**Resultado esperado:** navegación por teclado completa, foco visible, errores
anunciables. Mismo estándar que el formulario de perfil ya existente.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 9
- Contraseña del docente de desarrollo restaurada: ⬜ Pendiente
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
