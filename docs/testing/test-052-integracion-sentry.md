# test-052 — Integración de Sentry: reporte remoto de errores en producción

> Pruebas manuales de `docs/specs/spec-052-integracion-sentry.md`.
> Cada caso `TC-052-NNN` corresponde 1:1 al criterio de aceptación del mismo
> número en el spec.

## Datos de prueba

> Esta ronda **no crea recursos de dominio** (ni estudiantes, ni sesiones de
> asistencia, ni preguntas). Lo único que genera son *issues* en el proyecto de
> Sentry, más la sesión del docente que ya existe.

| Recurso | Endpoint / origen de creación | Identificador | Eliminado |
|---|---|---|---|
| Issue "Sentry server-side check" | Botón de `/admin/diagnostico-sentry` (producción) | `{{issue-id}}` | ⬜ / ✅ |
| Issue "Sentry client-side check" | Botón de `/admin/diagnostico-sentry` (producción) | `{{issue-id}}` | ⬜ / ✅ |
| Issue del `ErrorBoundary` (TC-052-006) | Fallo provocado en el panel de asistencia | `{{issue-id}}` | ⬜ / ✅ |
| Issue de `global-error` (TC-052-007) | Fallo provocado en `app/layout.tsx` | `{{issue-id}}` | ⬜ / ✅ |
| Sesión docente de producción | Cuenta real del docente principal | `{{correo}}` | n/a |

> "Eliminado" para un issue de Sentry significa **resuelto o descartado** en el
> panel (`Issues → seleccionar → Delete & Discard`), para no dejar ruido que se
> confunda con un fallo real de clase.

**Entorno de pruebas:**
- `TC-052-003`, `TC-052-004`, `TC-052-005`, `TC-052-008`, `TC-052-010`,
  `TC-052-011` → **desarrollo** (local contra `mirp-lab`, `npm run dev` en el
  puerto `3002`) o CLI.
- `TC-052-001`, `TC-052-002`, `TC-052-006`, `TC-052-007`, `TC-052-009`,
  `TC-052-012` → **producción** (`https://www.nod0.dev`). Es la única forma de
  verificarlos: el SDK está apagado en desarrollo **por diseño** (D1 del spec).
  Requieren confirmación explícita del usuario en la misma sesión antes de
  ejecutarse, y deben correrse **fuera de horario de clase** — generan errores
  reales.

**Precondición común de los casos de producción:** el DSN está cargado en Vercel
(*Settings → Environment Variables*, alcance `Production`) y el deployment que se
prueba es **posterior** a esa configuración (una variable nueva no se aplica a
deployments ya construidos: hay que redesplegar).

**Fecha de la ronda:** {{fecha}}

---

## Casos de prueba

### TC-052-001 — Un error server-side se reporta a Sentry en producción
**Criterio de aceptación:** 1
**Entorno:** producción
**Precondición:** sesión iniciada como docente/admin en `https://www.nod0.dev`;
panel de Sentry abierto en el proyecto `nodo-edu` (organización
`instituto-tecnologico-metropol`), vista `Issues`, con el filtro de tiempo en
"Last hour".
**Datos de prueba usados:** cuenta del docente principal.
**Pasos:**
1. Navegar a `https://www.nod0.dev/admin/diagnostico-sentry`.
2. Anotar la hora exacta.
3. Pulsar **"Probar error de servidor"**.
4. Esperar hasta 60 segundos y refrescar la vista `Issues` de Sentry.
**Resultado esperado:**
- Aparece un issue nuevo cuyo título/mensaje contiene `Sentry server-side check`.
- Al abrirlo muestra **stack trace del servidor** (frames de Node, no del
  navegador) y la ruta `/admin/diagnostico-sentry` en el contexto de la request.
- El evento está etiquetado como entorno `production`.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-002 — Un error client-side (React) se reporta a Sentry en producción
**Criterio de aceptación:** 2
**Entorno:** producción
**Precondición:** la misma de TC-052-001, con las DevTools del navegador
abiertas en la pestaña **Network** y el filtro escrito en `sentry`.
**Datos de prueba usados:** cuenta del docente principal.
**Pasos:**
1. En `https://www.nod0.dev/admin/diagnostico-sentry`, pulsar **"Probar error de
   cliente"**.
2. Observar la pestaña Network: debe salir al menos una petición hacia
   `*.ingest.us.sentry.io`.
3. Observar la pantalla: el recuadro del diagnóstico se degrada al `ErrorState`;
   **el resto de la página sigue en pie**.
4. Refrescar `Issues` en Sentry.
**Resultado esperado:**
- Issue nuevo con `Sentry client-side check`.
- Su stack trace es **del navegador** (frames de JS de cliente), distinguible
  del issue de TC-052-001.
- El stack aparece **minificado** (`chunk-abc123.js:1:45678` o similar): D4
  quedó descartada en este spec, no se suben source maps. No es un fallo del
  caso — es el comportamiento esperado.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-003 — En desarrollo NO se reporta nada a Sentry
**Criterio de aceptación:** 3
**Entorno:** desarrollo (`npm run dev`, puerto `3002`, túnel a `mirp-lab` activo)
**Precondición:** `.env.local` **no** contiene `NEXT_PUBLIC_SENTRY_DSN`.
Verificarlo antes de empezar: `grep -c SENTRY .env.local` debe dar `0`.
**Datos de prueba usados:** docente de desarrollo `dev@nodo.local`.
**Pasos:**
1. Con `npm run dev` corriendo, abrir `http://localhost:3002/admin/diagnostico-sentry`.
2. Abrir DevTools → **Network**, filtrar por `sentry`.
3. Pulsar **"Probar error de servidor"** y luego **"Probar error de cliente"**.
4. Revisar la consola del navegador y la terminal de `npm run dev`.
5. Refrescar `Issues` en el panel de Sentry (filtro "Last hour").
**Resultado esperado:**
- **Cero** peticiones a `*.ingest.us.sentry.io` en la pestaña Network.
- **Ningún issue nuevo** en Sentry.
- Los `console.error` de los boundaries **sí** aparecen (consola del navegador
  y/o terminal): en desarrollo siguen siendo la única señal, tal como decidió
  spec-037.
- Ningún aviso del SDK de Sentry en el arranque de `npm run dev`.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-004 — El DSN no está hardcodeado en ningún archivo rastreado
**Criterio de aceptación:** 4
**Entorno:** CLI (repositorio local)
**Pasos:**
1. Ejecutar `git grep -n "ingest.us.sentry.io"`.
2. Ejecutar `git grep -n "NEXT_PUBLIC_SENTRY_DSN"`.
3. Abrir `.env.example` y localizar la entrada de Sentry.
**Resultado esperado:**
- El paso 1 solo devuelve coincidencias en `docs/specs/spec-052-*.md` y
  `docs/testing/test-052-*.md`; **ninguna** en `app/`, `lib/`, `components/`,
  `*.config.ts`, `instrumentation*.ts` ni `.env.example`.
- El paso 2 sí devuelve coincidencias (código y `.env.example`), pero **siempre**
  como referencia a `process.env`, nunca con un valor a la derecha del `=`.
- En `.env.example`, la línea es `NEXT_PUBLIC_SENTRY_DSN=` **sin valor**, con el
  comentario que explica dónde se obtiene y que solo se carga en Vercel.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-005 — El DSN real vive solo en Vercel, alcance Production
**Criterio de aceptación:** 5
**Entorno:** panel de Vercel + repositorio local
**Pasos:**
1. Abrir `https://vercel.com/santiago-suarez-cortes-projects/nodo-edu` →
   *Settings → Environment Variables*.
2. Localizar `NEXT_PUBLIC_SENTRY_DSN` y revisar sus entornos marcados.
3. En local, ejecutar `grep -i sentry .env.local` y `grep -i sentry .env.prod`.
**Resultado esperado:**
- `NEXT_PUBLIC_SENTRY_DSN` existe con alcance **`Production` únicamente**
  (no `Preview`, no `Development`).
- No existe `SENTRY_AUTH_TOKEN` en ningún entorno de Vercel (D4 descartada).
- `grep` sobre `.env.local` no devuelve nada: la máquina de desarrollo no tiene
  el DSN.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-006 — El `ErrorBoundary` reporta sin desmontar la página
**Criterio de aceptación:** 6 (y no regresión de spec-037, criterios 1-4)
**Entorno:** producción
**Precondición:** sesión de docente, dentro de una lección con panel de
asistencia visible. Para provocar el fallo, la vía menos invasiva es cortar la
conectividad del navegador (DevTools → Network → *Offline*) justo antes de
accionar el panel; documentar el método usado.
**Pasos:**
1. Abrir una lección con el panel de asistencia del docente visible.
2. Anotar qué se ve en pantalla: artículo, navegación lateral, panel.
3. Provocar el fallo del panel (método anotado en la precondición).
4. Observar la pantalla completa.
5. Restaurar la conectividad y refrescar `Issues` en Sentry.
**Resultado esperado:**
- **El artículo de la lección y la navegación siguen visibles**; solo el recuadro
  del panel muestra el `ErrorState`. Sin pantalla genérica de Next, sin overlay.
- En Sentry aparece un issue con el *component stack* de React y la etiqueta de
  origen `boundary: component`.
- El botón "Reintentar" del `ErrorState` recupera el panel cuando la causa
  desaparece.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-007 — `global-error.tsx` sigue renderizando bien con Sentry integrado
**Criterio de aceptación:** 7 (no regresión del criterio 6 de spec-037)
**Entorno:** producción o build local de producción (`npm run build && npm run start`)
**Precondición:** hay que forzar una excepción en `app/layout.tsx`. Es el único
caso que requiere una rama y un deployment desechables — **no** se ejecuta contra
el deployment estable de producción. Acordar con el usuario si se hace en un
*preview deployment* con el DSN cargado temporalmente, o en un build local con el
DSN inyectado por línea de comandos.
**Pasos:**
1. Forzar una excepción en `app/layout.tsx` (rama desechable).
2. Cargar cualquier página de la app.
3. Observar la pantalla en **modo claro** y en **modo oscuro** del sistema.
4. Revisar `Issues` en Sentry.
**Resultado esperado:**
- Se ve la pantalla de `global-error`: `<html lang="es">` propio, copy en español,
  botón "Reintentar", **sin flash blanco cegador en modo oscuro** (D2 de
  spec-037).
- **El propio boundary no se rompe**: no aparece la pantalla genérica de Next
  detrás. Esta es la regresión concreta que este caso vigila — TC-037-006 ya
  falló una vez por añadirle algo a este archivo.
- En Sentry aparece el issue con etiqueta de origen `boundary: global`.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-008 — La UI de error no cambió
**Criterio de aceptación:** 8
**Entorno:** desarrollo
**Pasos:**
1. Provocar los errores de `/admin/diagnostico-sentry` en local.
2. Comparar el `ErrorState` resultante con lo descrito en
   `docs/testing/test-037-manejo-de-errores.md`: título, descripción, botón
   "Reintentar", código `digest` discreto.
3. Verificar que en ningún punto de la UI aparece el `message` de la excepción.
**Resultado esperado:**
- Copy, colores y disposición idénticos a antes del spec.
- El `digest` se ve como código de referencia discreto; el `message` **nunca**.
- Contraste correcto en modo claro y oscuro.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-009 — Ningún evento lleva cookies, `Authorization` ni claves de servicio
**Criterio de aceptación:** 9
**Entorno:** producción
**Precondición:** existe al menos un issue de TC-052-001 (server-side, que es el
que sí acarrea contexto de request).
**Pasos:**
1. Abrir ese issue en Sentry.
2. Desplegar la sección **Request** del evento y revisar `headers` y `cookies`.
3. Usar `Event JSON` (enlace al pie del evento) y buscar en el JSON crudo:
   `sb-`, `Authorization`, `api-key`, `service_role`.
4. Buscar también el correo del docente y cualquier dato personal.
**Resultado esperado:**
- No hay cookies de sesión de Supabase (`sb-*-auth-token`).
- No hay cabecera `Authorization` ni ninguna cabecera con `api-key`.
- No aparece ninguna de las tres claves de servicio
  (`QUESTION_BANK_API_KEY`, `STUDENTS_ADMIN_API_KEY`, `COURSES_ADMIN_API_KEY`)
  ni `SUPABASE_SERVICE_ROLE_KEY`.
- No hay direcciones de correo de estudiantes (`sendDefaultPii: false`).
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-010 — El bundle de cliente no incluye Replay ni Tracing
**Criterio de aceptación:** 10
**Entorno:** CLI + navegador
**Pasos:**
1. Ejecutar `npm run build` y anotar el tamaño del *First Load JS* compartido,
   comparándolo con el valor previo a este spec (registrado al cerrar la Fase 3).
2. Ejecutar `git grep -n "replayIntegration\|browserTracingIntegration"`.
3. En producción, con DevTools → Network, comprobar que no se descarga ningún
   chunk cuyo nombre contenga `replay`.
**Resultado esperado:**
- El paso 2 no devuelve **ninguna** coincidencia en código.
- No se carga ningún chunk de Replay.
- El aumento del *First Load JS* es el del SDK base, no el de Replay
  (Replay añade ~40-50 kB adicionales; si el salto es de ese orden, revisar).
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-011 — Build y lint pasan, con y sin `SENTRY_AUTH_TOKEN`
**Criterio de aceptación:** 11
**Entorno:** CLI
**Pasos:**
1. Ejecutar `npm run build` y `npm run lint`.
2. Ejecutar `git grep -n ": any" -- "*.ts" "*.tsx"` sobre los archivos creados o
   modificados por este spec.
**Resultado esperado:**
- El build termina **sin errores**.
- `npm run lint` sin errores.
- Ningún `any` nuevo introducido por el spec.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

### TC-052-012 — `/admin/diagnostico-sentry` es inaccesible para un estudiante
**Criterio de aceptación:** 12
**Entorno:** producción
**Precondición:** una cuenta de estudiante real con sesión iniciada (o una
ventana de incógnito con una cuenta de estudiante). **No crear un estudiante de
prueba en producción**: usar una cuenta ya existente y no modificarla.
**Pasos:**
1. Con sesión de estudiante, navegar a
   `https://www.nod0.dev/admin/diagnostico-sentry`.
2. Observar el resultado.
3. Repetir sin sesión iniciada (incógnito).
**Resultado esperado:**
- Con sesión de estudiante: redirige a `/` (gate de rol de `middleware.ts`).
  **En ningún momento se ven los botones de diagnóstico.**
- Sin sesión: redirige a `/login?redirectTo=/admin/diagnostico-sentry`.
- No se genera ningún issue en Sentry por estos intentos.
**Estado:** ⬜ Pendiente / ✅ Aprobado / ❌ Fallido
**Hallazgos:** {{observaciones}}

---

## Resumen de la ronda

- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 12
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
  - Issues de diagnóstico resueltos o descartados en Sentry: ⬜ / ✅
  - Rama/deployment desechable de TC-052-007 eliminado: ⬜ / ✅
- Sin datos de dominio creados en producción (no aplica limpieza vía API).
