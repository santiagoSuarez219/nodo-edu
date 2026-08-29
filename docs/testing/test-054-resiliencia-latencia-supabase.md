# test-054 — Resiliencia del camino de request ante latencia de Supabase

> Pruebas manuales de `docs/specs/spec-054-resiliencia-latencia-supabase.md`
> (cierra DEBT-069, DEBT-070 y DEBT-071). Escritas junto con el spec, **antes**
> de la implementación: hoy los casos con latencia inyectada **fallan** — ese es
> el estado esperado hasta que la implementación los ponga en verde.
>
> A diferencia de `test-046` y `test-053`, que simulaban una caída **cortando**
> el túnel, esta ronda simula **lentitud**, que es la causa real del incidente y
> un modo de fallo distinto: el servicio responde, pero tarde. Cortar el túnel no
> reproduce DEBT-071; hace falta el proxy de la Fase 0.

## Datos de prueba

> Esta ronda **no crea recursos de dominio**: no hay estudiantes, cursos ni
> evaluaciones nuevas. Lo único que se "monta" es infraestructura local
> reversible, registrada abajo para poder revertirla.

| Recurso | Cómo se monta | Identificador | Revertido |
|---|---|---|---|
| Docente de desarrollo (ya sembrado, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Estudiante de prueba matriculado (reutilizado de `test-053`, sigue vivo en `mirp-lab` por decisión del usuario) | ya existente | `test-spec053@nodo.local` / `TestSpec053New!` | n/a |
| Proxy de latencia local | `node scripts/latency-proxy.mjs --port=54331 …` | proceso local, puerto 54331 | ⬜ |
| `NEXT_PUBLIC_SUPABASE_URL` de `.env.local` apuntando al proxy | edición manual (valor original: `http://localhost:54321`) | — | ⬜ |
| `jwt_expiry` en `supabase/config.toml` de `mirp-lab` bajado de `3600` a `60` | edición + reinicio del stack en `mirp-lab` | — | ⬜ |

**Entorno de pruebas:** desarrollo — instancia Supabase local en `mirp-lab` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). **Nunca ejecutar esta ronda contra
producción:** los casos consisten en degradar deliberadamente el servicio.

**Fecha de la ronda:** ⬜ pendiente (la ronda se ejecuta tras la implementación)

### Montaje del escenario

```bash
# 1. Túnel SSH a mirp-lab (si no está activo)
pgrep -f "ssh.*-L 54321.*mirp-lab" || \
  ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
    -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab

# 2. Proxy de latencia (Fase 0 del spec) — ejemplo: 8 s solo en /auth/v1/token
node scripts/latency-proxy.mjs --port=54331 --target=http://localhost:54321 \
  --path='^/auth/v1/token' --delay=8000

# 3. .env.local → NEXT_PUBLIC_SUPABASE_URL=http://localhost:54331
# 4. Reiniciar npm run dev para que recargue .env.local
```

**Restaurar:** apagar el proxy, devolver `NEXT_PUBLIC_SUPABASE_URL` a
`http://localhost:54321`, revertir `jwt_expiry` a `3600` en `mirp-lab`, y
reiniciar `npm run dev`.

> ⚠️ **Cómo medir.** Varios casos exigen medir el tiempo de respuesta. Usar el
> panel Network del navegador (columna *Time* de la petición del documento) o
> `curl -o /dev/null -w "%{http_code} %{time_total}\n"`. El dato que importa es
> el **de extremo a extremo**, no lo que diga un log interno.

---

## Casos de prueba

### TC-054-001 — Sesión caducada con `/auth/v1/token` lento: 503 diseñado, nunca 504
**Cubre:** CA 1 (DEBT-071) — el caso que produjo la pantalla de error que vio el usuario.
**Precondición:** `jwt_expiry=60` en `mirp-lab`; proxy con `--path='^/auth/v1/token' --delay=8000`; sesión iniciada como `dev@nodo.local` y **esperar >60 s** para que el access token caduque.
**Pasos:**
1. Con la sesión ya caducada, navegar a `/cuenta/cursos`.
2. Cronometrar la respuesta de extremo a extremo.
**Resultado esperado:** la página de servicio no disponible de `spec-046` (503), en **≤ el presupuesto de D-A**. **Nunca** la pantalla `504: GATEWAY_TIMEOUT / MIDDLEWARE_INVOCATION_TIMEOUT` de Vercel ni un error de invocación.
**Estado hoy (pre-implementación):** ❌ se espera que el bucle de `_refreshAccessToken` consuma ~26,6 s (ver Hallazgo 1 del spec) y produzca el 504.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-002 — Auth colgado por completo: el gate responde dentro del presupuesto
**Cubre:** CA 2 (DEBT-071).
**Precondición:** proxy con `--path='^/auth/v1' --hang`.
**Pasos:**
1. En una ventana anónima, navegar a `/`.
2. Cronometrar.
**Resultado esperado:** 503 con la página de `spec-046` en ≤ presupuesto de D-A.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-003 — Sin regresión con Supabase sano
**Cubre:** CA 4 — que el fix no cueste rendimiento en el caso normal.
**Precondición:** proxy **sin** retardo (`--delay=0`), o `.env.local` apuntando directo a 54321.
**Pasos:**
1. Navegar como anónimo a `/login`.
2. Iniciar sesión como `dev@nodo.local` y navegar a `/cuenta/cursos`, a una lección y a `/admin`.
3. Comparar tiempos con los de la misma navegación antes de la implementación.
**Resultado esperado:** sin diferencia perceptible; ninguna ruta se vuelve más lenta.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-004 — El ping de salud no puede exceder el deadline global
**Cubre:** CA 2 y el paso de la Fase 1 sobre `HEALTH_TIMEOUT_MS`.
**Precondición:** proxy con `--path='^/auth/v1/health' --delay=20000` (health lento, resto sano) — la asimetría exacta del incidente del 2026-08-29.
**Pasos:**
1. En ventana anónima (sin cookie de sesión, que es el único camino que llega al ping), navegar a `/`.
2. Cronometrar.
**Resultado esperado:** respuesta dentro del presupuesto de D-A. El peor caso viejo (`2 × 5 s + 250 ms`) ya no aplica: el ping está subordinado al deadline global.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-005 — Página de curso con Supabase colgado: acotada, no 300 s
**Cubre:** CA 5 (DEBT-070) — los 10 cuelgues de 300 s en `/[courseSlug]`.
**Precondición:** sesión iniciada; proxy con `--hang` en `^/rest/v1`.
**Pasos:**
1. Navegar a `/estructuras-de-datos`.
2. Cronometrar hasta que la página resuelva (de una forma u otra).
**Resultado esperado:** resuelve en ≤ presupuesto de D-C. **No** queda colgada minutos.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-006 — Ninguna ruta con Server Components supera el presupuesto
**Cubre:** CA 6 (DEBT-070).
**Precondición:** igual que TC-054-005.
**Pasos:** repetir la medición en `/`, `/[courseSlug]`, `/[courseSlug]/[lessonSlug]`, `/cuenta/cursos` y `/admin`.
**Resultado esperado:** las cinco resuelven en ≤ presupuesto de D-C.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-007 — Mensaje honesto al abortar una consulta de datos
**Cubre:** CA 7 (DEBT-070) y la decisión D-D.
**Precondición:** igual que TC-054-005.
**Pasos:**
1. Navegar a una lección.
2. Leer el mensaje mostrado.
**Resultado esperado:** el copy de infraestructura decidido en D-D ("no pudimos contactar el servidor, tu sesión sigue abierta" o equivalente). **No** "Ocurrió un error inesperado", **no** un 500 crudo, **no** página en blanco.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-008 — Un estudiante matriculado no recibe "sin acceso" por un timeout
**Cubre:** CA 8 (DEBT-070) — evita repetir la mentira que `spec-046` eliminó.
**Precondición:** sesión del estudiante de prueba, **matriculado**; proxy con `--hang` en `^/rest/v1`.
**Pasos:**
1. Navegar a una lección de su curso.
**Resultado esperado:** mensaje de servicio no disponible. **Nunca** el redirect a `/cuenta/cursos?sinAcceso=…`, que afirmaría en falso que no está matriculado.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-009 — El root layout no rompe el documento entero
**Cubre:** Fase 3 y la decisión D-F.
**Precondición:** proxy con `--hang` en `^/rest/v1` (afecta `getCurrentProfile`/`getCurrentRoles` del root layout).
**Pasos:**
1. Navegar a cualquier ruta.
2. Observar si aparece el `global-error` (documento reemplazado, sin estilos ni navbar) o un degradado dentro del layout normal.
**Resultado esperado:** el layout **nunca** lanza; se ve navbar degradada + aviso (D-F), no la pantalla de `global-error.tsx`.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-010 — Un usuario con sesión no cree que lo desconectaron
**Cubre:** D-F — la deuda DEBT-042 que `spec-046` cerró y que E1 podría reabrir.
**Precondición:** sesión válida como `dev@nodo.local`; proxy en modo degradado (`--path='^/auth/v1' --hang`).
**Pasos:**
1. Navegar por el sitio en modo degradado.
2. Observar la navbar y cualquier aviso.
**Resultado esperado:** si la navbar muestra estado anónimo, hay un banner explícito indicando que la sesión **no** se ha cerrado.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-011 — Rutas abiertas siguen en pie ante fallo transitorio *(solo si D-E = E1)*
**Cubre:** CA 10 (DEBT-069).
**Precondición:** proxy con `--path='^/auth/v1' --hang` (produce `reason` transitorio); ventana anónima.
**Pasos:**
1. Navegar a `/`.
2. Navegar a `/grupo-investigacion`.
**Resultado esperado:** ambas cargan en modo degradado, con `Cache-Control: no-store`. **Si D-E se resolvió por E2, este caso se marca N/A y no se ejecuta.**
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-012 — El contenido restringido sigue cerrado *(el caso de seguridad)*
**Cubre:** CA 11 (DEBT-069) — que la excepción sea de navegación y no de autorización.
**Precondición:** igual que TC-054-011, ventana anónima.
**Pasos:**
1. Intentar cargar `/estructuras-de-datos/polimorfismo` directamente por URL.
**Resultado esperado:** 503 o el redirect de acceso. **Bajo ninguna circunstancia** se muestra contenido de la lección.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-013 — D4 de spec-046 intacto ante `misconfigured`
**Cubre:** CA 12 (DEBT-069).
**Precondición:** vaciar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` y reiniciar `npm run dev` (reproduce `reason: "misconfigured"`).
**Pasos:**
1. Navegar a `/`, a `/grupo-investigacion` y a una lección, en ventana anónima.
**Resultado esperado:** **las tres** responden 503. La excepción de E1 **no** aplica a un fallo permanente.
**Restaurar:** devolver la clave a `.env.local` y reiniciar.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-054-014 — Navegación normal tras restaurar el servicio
**Cubre:** recuperación — que el degradado no deje estado pegado (la caché `healthyUntil` es por instancia).
**Precondición:** venir de cualquier caso con proxy degradado.
**Pasos:**
1. Apagar el retardo del proxy.
2. Recargar la página inmediatamente y volver a navegar.
**Resultado esperado:** el sitio vuelve a la normalidad sin esperar a que expire ningún TTL, y sin necesidad de reiniciar `npm run dev`.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

---

### TC-MCP-054-001 — Los MCPs siguen intactos con Supabase sano
**Herramienta probada:** `list_course_lessons` (`courses-mcp`) y `list_questions` (`question-bank-mcp`)
**Cubre:** CA 13 — que `/api` siga exento del gate (D3 de `spec-046`) tras tocar `service.ts`.
**Precondición:** proxy sin retardo; `npm run dev` corriendo.
**Input de prueba:** `list_course_lessons(course_slug: "estructuras-de-datos")`
**Output esperado:** el catálogo completo, sin error.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-MCP-054-002 — Los MCPs fallan acotado, no colgados
**Herramienta probada:** la misma de TC-MCP-054-001
**Cubre:** CA 9 (DEBT-070) — el efecto del presupuesto de `service.ts` sobre los MCPs, que es el radio de acción más amplio de la Fase 2.
**Precondición:** proxy con `--hang` en `^/rest/v1`.
**Input de prueba:** `list_course_lessons(course_slug: "estructuras-de-datos")`
**Output esperado:** error acotado en ≤ presupuesto de `service.ts` (D-C). **No** una espera indefinida ni un cuelgue del cliente MCP.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

---

## Verificación en producción (ventana de observación)

> Tres criterios del spec **no son reproducibles en local** porque dependen de
> que el proveedor vuelva a fallar. No se ejecutan como caso puntual: se
> verifican observando los runtime logs de Vercel durante **7 días** tras el
> despliegue. El paso `[TESTING] → [DONE]` **no** queda condicionado a que
> Supabase falle en ese periodo; lo que se exige es la ausencia de regresión.

| Señal a observar | Herramienta | Criterio |
|---|---|---|
| `MIDDLEWARE_INVOCATION_TIMEOUT` / kills a 25 s | runtime logs de Vercel, proyecto `nodo-edu` | Cero ocurrencias nuevas |
| `Task timed out after 300 seconds` | ídem | Cero ocurrencias nuevas |
| Duración máxima del gate y motivo | tags de Sentry (`nodo-edu`) | El máximo observado ≤ presupuesto de D-A |
| Proporción de 503 evitados *(solo si D-E = E1)* | tags de Sentry de la Fase 4 | Dato informativo, sin umbral |

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 16
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno todavía
- Limpieza / reversión del entorno (proxy, `.env.local`, `jwt_expiry`): ⬜ Pendiente
