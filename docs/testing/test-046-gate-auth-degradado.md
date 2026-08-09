# test-046 — Gate de autenticación honesto ante una caída de Supabase Auth

> Pruebas manuales de `docs/specs/spec-046-gate-auth-degradado.md` (cierra
> **[[DEBT-042]]**). Escritas junto con el spec, antes de la implementación:
> **hoy todos los casos con Auth caído fallan** — ese es el estado esperado
> hasta que la implementación los ponga en verde.

## Datos de prueba

> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Estudiante de prueba | `create_student` (`students-mcp`) | `{{id}}` | ⬜ |
| Matrícula del estudiante en un curso con contenido | `enroll_student` (`students-mcp`) | `{{enrollment_id}}` | ⬜ |

**Entorno de pruebas:** desarrollo — instancia Supabase local en `mirp-lab` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). **Nunca ejecutar esta ronda contra
producción:** los casos consisten en tumbar el servicio de autenticación.

**Fecha de la ronda:** {{fecha}}

### Cómo simular la caída y cómo restaurarla

Con `npm run dev` corriendo, **cortar** el túnel:

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

> Los casos `TC-046-001` … `TC-046-010` se ejecutan con el túnel **caído**;
> `TC-046-011` … `TC-046-016`, con el túnel **restaurado**. Conviene ejecutarlos
> en ese orden para cortar y restaurar una sola vez.

---

## Casos de prueba

### Bloque A — Con Supabase Auth caído

### TC-046-001 — Docente autenticado recarga `/admin`
**Precondición:** sesión iniciada como `dev@nodo.local`, navegando en `/admin`.
Cortar el túnel **después** de haber cargado la página.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Con sesión activa en `/admin`, ejecutar `pkill -f "ssh.*-L 54321.*mirp-lab"`.
2. Recargar la página (F5).
**Resultado esperado:** aparece la pantalla "No pudimos verificar tu sesión",
con el texto que indica que **la sesión sigue activa** y que no es un problema
de usuario ni contraseña. **No** se redirige a `/login`. Es la inversión exacta
del síntoma de `TC-037-004`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-002 — Estudiante autenticado recarga `/cuenta/cursos`
**Precondición:** sesión iniciada con el estudiante de prueba, túnel caído.
**Datos de prueba usados:** estudiante `{{id}}`
**Pasos:**
1. Con sesión activa, navegar a `/cuenta/cursos` y recargar.
**Resultado esperado:** misma pantalla 503. Verifica que el fix cubre la
**Capa 2** (`requireUser` en `app/cuenta/cursos/page.tsx:14`), no solo el
middleware.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-003 — Visitante sin sesión entra a `/`
**Precondición:** ventana de incógnito, sin cookies de sesión. Túnel caído.
**Pasos:**
1. Abrir `http://localhost:3000/` en incógnito.
**Resultado esperado:** pantalla 503, **no** `/login`. El gate no puede decidir
y falla cerrado (decisión D4 del spec).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-004 — `/login` durante la caída
**Precondición:** incógnito, túnel caído.
**Pasos:**
1. Navegar directamente a `http://localhost:3000/login`.
**Resultado esperado:** pantalla 503, **no** el formulario de login. Verifica que
no se ofrece un login que no puede funcionar — el bucle "no puedo entrar porque
no puedo verificar" que motivó la deuda.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-005 — "Reintentar" con el servicio aún caído
**Precondición:** estar en la pantalla 503, túnel todavía caído.
**Pasos:**
1. Abrir DevTools → pestaña Network, marcar "Preserve log".
2. Pulsar "Reintentar".
**Resultado esperado:** vuelve a la misma pantalla 503. **Sin** cadena de
redirects 307, **sin** pantalla en blanco y **sin** overlay de error de Next.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-006 — Status y cabeceras de la respuesta
**Precondición:** túnel caído, DevTools → Network abierto.
**Pasos:**
1. Recargar cualquier ruta protegida.
2. Inspeccionar el documento principal en Network.
**Resultado esperado:** status **503** (no 200, no 307).
Cabeceras presentes: `Cache-Control: no-store, must-revalidate`,
`Retry-After`, `X-Robots-Tag: noindex`,
`Content-Type: text/html; charset=utf-8`.
3. Recargar de nuevo **sin** forzar caché: no se sirve una copia cacheada.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-007 — Navegación de cliente (no recarga) durante la caída
**Precondición:** sesión activa, app cargada, túnel **aún levantado**.
**Pasos:**
1. Con la app abierta, cortar el túnel.
2. Sin recargar, hacer clic en un enlace de la navbar (navegación RSC del router).
**Resultado esperado:** se acaba en la pantalla 503. El router degrada a
navegación dura. **No** aparece el overlay de error de Next ni el mensaje
genérico "Algo salió mal" de `app/error.tsx`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-008 — Las rutas `/api/*` siguen devolviendo JSON (protege a los 5 MCPs)
**Precondición:** túnel caído. Tener a mano `QUESTION_BANK_API_KEY` de `.env.local`.
**Pasos:**
1. Ejecutar una petición autenticada por API key, p. ej.:
   ```bash
   curl -i -H "x-api-key: $QUESTION_BANK_API_KEY" \
     http://localhost:3000/api/questions
   ```
**Resultado esperado:** la respuesta **no** es el HTML del 503. Puede fallar por
la base de datos caída, pero debe seguir siendo **JSON** con el error propio del
endpoint. Cubre la decisión D3 del spec: si `/api` recibiera HTML, los cinco
MCPs del proyecto se romperían.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-009 — Recuperación con la sesión intacta ⭐
**Precondición:** estar en la pantalla 503 con sesión previamente activa
(continúa desde `TC-046-001`).
**Pasos:**
1. Restaurar el túnel con el comando `ssh -f -N -L 54321:…` de arriba.
2. Pulsar "Reintentar" en la pantalla 503.
**Resultado esperado:** se vuelve a la app **sin tener que iniciar sesión de
nuevo**. Es el criterio de aceptación central del spec: la caída no cerró la
sesión de nadie.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-010 — Legibilidad en modo claro y oscuro
**Precondición:** túnel caído, pantalla 503 visible.
**Pasos:**
1. Cambiar la preferencia del sistema operativo a modo oscuro y recargar.
2. Cambiar a modo claro y recargar.
**Resultado esperado:** la pantalla es legible en ambos (contraste suficiente,
sin texto invisible ni flash blanco cegador). Nota: esta pantalla **no** carga
`globals.css` ni JetBrains Mono por diseño (decisión D1 del spec, mismo
precedente que `app/global-error.tsx`), así que la tipografía será la del
sistema — eso es esperado, no un hallazgo. Verificar solo legibilidad y que el
tema respeta `prefers-color-scheme`, como se validó en `TC-037-006`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### Bloque B — Regresión, con Supabase Auth sano

> **Restaurar el túnel antes de este bloque.** Confirmar con
> `pgrep -f "ssh.*-L 54321.*mirp-lab"` que hay salida.

### TC-046-011 — El gate real sigue vivo: visitante sin sesión
**Precondición:** incógnito, túnel restaurado.
**Pasos:**
1. Navegar a `http://localhost:3000/cuenta/cursos`.
**Resultado esperado:** redirige a `/login?redirectTo=/cuenta/cursos`. **El fix
no debe haber aflojado el gate**: sin sesión se sigue exigiendo login, con el
`redirectTo` correcto.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-012 — Estudiante autenticado entra a `/admin`
**Precondición:** sesión iniciada con el estudiante de prueba.
**Datos de prueba usados:** estudiante `{{id}}`
**Pasos:**
1. Navegar a `http://localhost:3000/admin`.
**Resultado esperado:** redirige a `/`. La comprobación de rol vía `user_roles`
sigue igual que antes (queda fuera del alcance del spec, ver "No incluye").
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-013 — Sin regresión de spec-045
**Precondición:** sesión iniciada (cualquier rol).
**Pasos:**
1. Navegar a `http://localhost:3000/login`.
**Resultado esperado:** redirige a `/`, como estableció spec-045.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-014 — Ciclo completo de login / logout
**Precondición:** sin sesión, túnel restaurado.
**Pasos:**
1. Iniciar sesión con el estudiante de prueba.
2. Navegar a `/cuenta`; debe cargar.
3. Cerrar sesión.
4. Navegar a `/cuenta`.
**Resultado esperado:** paso 2 carga con normalidad; paso 4 redirige a `/login`.
Verifica que el caso `anonymous` no quedó contaminado con `unavailable`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-015 — Cookie de sesión corrupta → `/login`, no 503 ⭐
**Precondición:** sesión iniciada, túnel restaurado.
**Pasos:**
1. DevTools → Application → Cookies → editar a mano el valor de la cookie
   `sb-…-auth-token`, alterando algunos caracteres del JWT.
2. Recargar `/cuenta`.
3. Iniciar sesión de nuevo con las credenciales correctas.
**Resultado esperado:** el paso 2 lleva a **`/login`** (no al 503) y el paso 3
funciona con normalidad. Es el caso de falso positivo del spec: un JWT inválido
produce `AuthApiError` 401/403, que **no** debe clasificarse como
`unavailable`. Sin esto, un usuario con cookies corruptas quedaría atrapado en
un 503 permanente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-046-016 — Variable de entorno de Supabase ausente
**Precondición:** `npm run dev` detenido. Túnel indiferente.
**Pasos:**
1. Comentar `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`.
2. Arrancar `npm run dev` y abrir cualquier ruta.
3. Revisar la consola del servidor.
4. **Restaurar la variable** y reiniciar `npm run dev`.
**Resultado esperado:** se muestra la pantalla 503 y el log del servidor
registra `configuration_error`. **No** aparece una excepción cruda ni la
pantalla genérica de error de Next. Cubre el tratamiento de las non-null
assertions de `lib/auth/middleware.ts:8-9`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 16
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
- ⚠️ Verificar antes de cerrar: túnel SSH restaurado y `.env.local` con
  `NEXT_PUBLIC_SUPABASE_URL` sin comentar (`TC-046-016`).
