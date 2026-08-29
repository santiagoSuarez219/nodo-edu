# test-053 — Degradado honesto de Server Actions cuando el gate de Auth responde 503

> Pruebas manuales de `docs/specs/spec-053-degradado-server-actions-auth.md`
> (cierra el issue **NODO-EDU-4** de Sentry). Escritas junto con el spec, antes
> de la implementación: **hoy todos los casos con Auth caído fallan** — ese es el
> estado esperado hasta que la implementación los ponga en verde.
>
> Cada caso con Auth caído reproduce hoy, deliberadamente, el bug de producción:
> la página entera se sustituye por "Ocurrió un error inesperado". Ese es el
> resultado **fallido**; el resultado esperado es el que describe cada caso.

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Curso académico de prueba | por definir al abrir la ronda (ver **[[DEBT-060]]** — no hay endpoint/MCP para crear `academic_courses`) | `{{id}}` | ⬜ |
| Estudiante de prueba matriculado | `create_student` (`students-mcp`) | `{{id}}` | ⬜ |
| Lección con autoevaluación montada y **sin intento previo** para ese estudiante | `mount_question_in_lesson` (`question-bank-mcp`) | `{{lección}}` / `{{ids de preguntas}}` | ⬜ |

> ⚠️ La autoevaluación es de **intento único** (`spec-040`) y cuenta para la
> nota. `TC-053-001` y `TC-053-002` consumen el intento del estudiante de
> prueba: si hay que repetirlos, se necesita un estudiante nuevo o borrar el
> intento. Anotarlo antes de empezar.

**Entorno de pruebas:** desarrollo — instancia Supabase local en `mirp-lab` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). **Nunca ejecutar esta ronda contra
producción:** los casos consisten en tumbar el servicio de autenticación.

**Fecha de la ronda:** {{pendiente}}

### Cómo simular la caída de Auth y cómo restaurarla

Mismo procedimiento ya verificado en `test-046`. Con `npm run dev` corriendo,
**cortar** el túnel:

```bash
pkill -f "ssh.*-L 54321.*mirp-lab"
```

**Restaurar** (no hace falta reiniciar `npm run dev`):

```bash
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
  -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab
```

Verificar el estado del túnel en cualquier momento:

```bash
pgrep -f "ssh.*-L 54321.*mirp-lab"   # sin salida = túnel caído
```

> **Orden recomendado:** `TC-053-001` … `TC-053-007` con el túnel **caído**;
> `TC-053-008` … `TC-053-011` con el túnel **restaurado**. Así se corta y
> restaura una sola vez. Ojo: hay que **iniciar sesión antes** de cortar el
> túnel en los casos que lo requieren (la precondición de cada caso lo indica).

### Nota sobre los casos de telemetría

`TC-053-004` y `TC-053-005` verifican que los eventos llegan a Sentry. El SDK
está **apagado en desarrollo por diseño** (`spec-052`, D1), así que en esta
ronda solo pueden cubrirse por **revisión de código**. Su verificación real
requiere un despliegue a producción y provocar allí la condición, lo cual **no
es aceptable** (implicaría tumbar Auth en producción). Alternativa propuesta al
abrir la ronda: verificarlos en un deployment de **preview** de Vercel con el
DSN configurado y apuntando a la base de desarrollo. Decisión pendiente del
usuario.

---

## Casos de prueba

## Bloque A — Con Supabase Auth caído (túnel cortado)

### TC-053-001 — Estudiante envía la autoevaluación y la lección sobrevive
> Reproduce los eventos 3 y 4 de NODO-EDU-4 (28-ago 10:37 y 10:38).
> **Es el caso más importante de la ronda.**

**Precondición:** sesión iniciada como el estudiante de prueba, navegando en la
lección con autoevaluación, **sin intento previo**. Cortar el túnel **después**
de que la página haya cargado por completo.
**Datos de prueba usados:** estudiante de prueba / lección con autoevaluación
**Pasos:**
1. Responder todas las preguntas de la autoevaluación.
2. Cortar el túnel SSH.
3. Pulsar "Enviar".
**Resultado esperado:**
- Aparece un mensaje de error **dentro de la sección de autoevaluación**.
- El artículo de la lección, el sidebar de navegación y el resto de la página
  **siguen visibles**.
- **No** aparece la pantalla "No pudimos cargar esta lección".
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-002 — Las respuestas se conservan y el reintento funciona
**Precondición:** continuación directa de `TC-053-001`, sin recargar la página.
**Datos de prueba usados:** los mismos
**Pasos:**
1. Comprobar visualmente que las opciones marcadas **siguen marcadas**.
2. Restaurar el túnel SSH.
3. Pulsar "Enviar" otra vez, **sin recargar la página**.
**Resultado esperado:** el envío se completa, la autoevaluación queda registrada
con un único intento y la página muestra la revisión del intento.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-003 — Login degrada dentro del formulario
> Reproduce los eventos 1 y 2 de NODO-EDU-4 (27-ago 12:55 y 28-ago 10:20).

**Precondición:** sin sesión, con `/login` ya cargado en el navegador. Cortar el
túnel **después** de que la página haya cargado.
**Datos de prueba usados:** estudiante de prueba
**Pasos:**
1. Escribir correo y contraseña correctos.
2. Cortar el túnel SSH.
3. Pulsar "Iniciar sesión".
**Resultado esperado:** aparece un mensaje de error **en el formulario**, con el
correo escrito aún visible. **No** se sustituye la página por el `ErrorState`
genérico ni por una pantalla en blanco.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-004 — El gate 503 reporta a Sentry *(solo revisión de código en esta ronda — ver nota arriba)*
**Precondición:** implementación de la Fase 2 completa.
**Pasos:**
1. Revisar `middleware.ts:44-55`: junto al `console.error` existente hay una
   llamada de reporte a Sentry.
2. Confirmar que incluye los tags `reason`, `path` e `is_server_action` (D3).
3. Confirmar que `console.error` **se conserva** (única señal en desarrollo).
4. Con el túnel caído, comprobar en la terminal de `npm run dev` que el
   `console.error` sigue apareciendo con el `reason` correcto.
**Resultado esperado:** el código cumple los cuatro puntos.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-005 — El fallo capturado se sigue reportando *(solo revisión de código en esta ronda)*
> Verifica que el spec no convierte el bug en un fallo silencioso (D4).

**Precondición:** implementación de las Fases 1 y 3 completas.
**Pasos:**
1. Revisar que cada `catch` nuevo llama al reporte de
   `lib/observability/report-transport-error.ts`.
2. Confirmar `level: "warning"` y el tag `transport: "server_action"`.
3. Confirmar que `LessonClosure.tsx` y `AttendanceSection.tsx` —que ya
   capturaban— también reportan ahora.
**Resultado esperado:** ningún `catch` de fallo de transporte queda sin reporte.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-006 — Cerrar sesión no rompe la página
**Precondición:** sesión iniciada como estudiante de prueba, en cualquier página.
Cortar el túnel después de cargar.
**Pasos:**
1. Abrir el menú de usuario del navbar.
2. Pulsar "Cerrar sesión".
**Resultado esperado:** o bien la sesión se cierra, o bien se muestra un error
legible; en ningún caso se sustituye la página por el `ErrorState` genérico.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-007 — Docente calificando: el panel de revisión degrada solo
**Precondición:** sesión iniciada como `dev@nodo.local`, en la pantalla de
revisión de un envío. Cortar el túnel después de cargar.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Escribir una nota en una respuesta.
2. Pulsar el botón de guardar/calificar.
**Resultado esperado:** mensaje de error legible en el panel; la pantalla de
revisión sigue en pie y no se pierde lo escrito en los demás campos.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

## Bloque B — Con Supabase Auth sano (túnel restaurado)

> Estos casos verifican que el spec **no rompe nada**. Son tan importantes como
> los del bloque A: el riesgo real de este cambio es tragarse errores que hoy sí
> deben verse.

### TC-053-008 — La página 503 sigue apareciendo en una navegación normal
> Confirma que no se alteró la política de `spec-046` (D1).

**Precondición:** cortar el túnel SSH. Sin sesión.
**Pasos:**
1. Navegar directamente a `https://localhost:{{puerto}}/` escribiendo la URL
   (navegación completa, **no** una interacción dentro de la app).
2. Restaurar el túnel al terminar.
**Resultado esperado:** se muestra la página de servicio no disponible de
`spec-046`, con `503`. Sin regresión de `TC-046-001` … `TC-046-010`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-009 — Los mensajes de negocio no cambian
**Precondición:** túnel restaurado. Estudiante de prueba con la autoevaluación
**ya enviada** (resultado de `TC-053-002`).
**Pasos:**
1. Abrir la misma lección en una pestaña nueva.
2. Intentar enviar la autoevaluación otra vez (si el formulario sigue visible
   por estado desactualizado).
3. Repetir el patrón con un caso de `not_enrolled`: abrir una lección de un
   curso en el que el estudiante **no** está matriculado y pulsar "Marcar como
   completada".
**Resultado esperado:** se muestran los mensajes de negocio existentes ("Ya
enviaste esta autoevaluación…", "No estás matriculado en este curso"), **no**
el copy genérico de fallo de transporte. Los dos tipos de error siguen siendo
distinguibles para el usuario.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-010 — Un error que no es de transporte sigue escalando al boundary
> El caso que protege contra el riesgo de la **D2**: que el `catch` nuevo se
> trague algo que debía verse.

**Precondición:** túnel restaurado, sesión de docente.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Navegar a `/admin/diagnostico-sentry` (página de `spec-052`).
2. Pulsar "Probar error de servidor".
3. Pulsar "Probar error de cliente".
**Resultado esperado:** ambos errores siguen escalando exactamente como en
`spec-052`/`spec-037` — el de servidor a su boundary, el de cliente al
`ErrorBoundary` de componente sin desmontar la página. Ninguno se convierte en
el mensaje genérico de fallo de transporte.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

### TC-053-011 — Camino feliz de los cuatro formularios envueltos
> Cubre el riesgo señalado en la **D5**: que envolver la acción interfiera con
> el `redirect()` de `signIn`.

**Precondición:** túnel restaurado.
**Pasos:**
1. Iniciar sesión como estudiante de prueba desde `/login` → debe redirigir a
   `/cuenta/cursos` (comportamiento de `lib/auth/actions.ts:63`).
2. Iniciar sesión desde una lección protegida (con `redirectTo`) → debe volver a
   esa lección.
3. Cambiar la contraseña desde `/cuenta` → éxito y sesión conservada.
4. Editar el perfil desde `/cuenta` → éxito.
**Resultado esperado:** los cuatro flujos se comportan igual que antes del spec.
Ninguna redirección se pierde ni se queda a medias.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 11
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
- Túnel SSH restaurado al cerrar la ronda: ⬜ Pendiente
