// spec-054 — fábrica única del `fetch` con presupuesto de tiempo, para que el
// middleware y los clientes Supabase de datos compartan una sola
// implementación en vez de tres copias del mismo timeout manual (el estado
// previo a este spec: solo `lib/auth/middleware.ts` tenía uno).

// Arma un `AbortController` propio en vez de usar `AbortSignal.timeout()`.
// TC-054-005 (ronda de pruebas, 2026-08-29) encontró que esa diferencia
// importa de verdad: `AbortSignal.timeout(ms)` produce un `DOMException` con
// `name: "TimeoutError"`, mientras que `controller.abort()` produce
// `name: "AbortError"` — y `@supabase/postgrest-js` solo trata como
// "no reintentable" el segundo (`PostgrestBuilder.ts`:
// `if (fetchError?.name === 'AbortError' ...) throw fetchError`, comentado
// "Never retry aborted requests"). Con `AbortSignal.timeout()`, postgrest-js
// no reconocía el timeout como un abort deliberado y lo trataba como un
// fallo de red reintentable — activando su propio backoff interno
// (`DEFAULT_MAX_RETRIES`) hasta ~30s antes de rendirse, muy por encima del
// presupuesto real que se le pasaba (verificado: 6s prometidos, ~31s reales).
// `@supabase/auth-js` no distingue por nombre (envuelve cualquier fallo de
// fetch igual, reintentable o no, según su propia lógica — ver
// `lib/auth/middleware.ts`), así que el gate del middleware no sufría este
// bug — pero los clientes de datos (server.ts/actions.ts/service.ts), que sí
// pasan por postgrest-js, lo sufrían todos.
function createArmedController(budgetMs: number, externalSignals: AbortSignal[]): AbortController {
  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), budgetMs);
  // `unref()` no existe en el Edge Runtime (solo en Node.js) — no debe
  // impedir que el proceso termine esperando este timer en un entorno
  // Node.js de larga vida (como `next dev`/`next start`), pero es un no-op
  // seguro donde no exista.
  if (typeof (timer as unknown as { unref?: () => void }).unref === "function") {
    (timer as unknown as { unref: () => void }).unref();
  }

  for (const signal of externalSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }

  return controller;
}

// Uso simple: cada llamada obtiene su propio presupuesto. Suficiente para
// los clientes de datos (server.ts, actions.ts, service.ts): no encadenan
// reintentos internos del SDK que necesiten un presupuesto compartido entre
// llamadas — ver DEBT-070.
export function createTimeoutFetch(budgetMs: number): typeof fetch {
  return (input, init) => {
    const controller = createArmedController(budgetMs, init?.signal ? [init.signal] : []);
    return fetch(input, { ...init, signal: controller.signal });
  };
}

// Uso con presupuesto GLOBAL compartido (DEBT-071): además del cap por
// intento (`perCallMs`), cada llamada respeta una señal externa común a toda
// la request. Es lo que corta el bucle de reintentos interno de
// `@supabase/auth-js` (`_refreshAccessToken`, ver el comentario de
// `lib/auth/middleware.ts`): pasado el presupuesto global, cada intento
// nuevo del SDK recibe una señal ya abortada y su fetch rechaza de
// inmediato, en vez de esperar los `perCallMs` completos una vez más.
export function createBudgetedFetch(perCallMs: number, sharedSignal: AbortSignal): typeof fetch {
  return (input, init) => {
    const externalSignals = init?.signal ? [sharedSignal, init.signal] : [sharedSignal];
    const controller = createArmedController(perCallMs, externalSignals);
    return fetch(input, { ...init, signal: controller.signal });
  };
}
