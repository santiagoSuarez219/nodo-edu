// spec-054 — fábrica única del `fetch` con presupuesto de tiempo, para que el
// middleware y los clientes Supabase de datos compartan una sola
// implementación en vez de tres copias del mismo `AbortSignal.timeout`
// (el estado previo a este spec: solo `lib/auth/middleware.ts` tenía uno).

// Combina varias señales en una sola, sin `AbortSignal.any()`: verificado en
// la ronda de pruebas de TC-054-001 que el Edge Runtime de Next.js (donde
// corre `lib/auth/middleware.ts` — no es Node.js, es un sandbox V8 propio,
// `node_modules/next/dist/compiled/edge-runtime/`) NO implementa `.any()`
// pese a que el Node.js del resto del proyecto (v24) sí — producía un
// `TypeError: AbortSignal.any is not a function` en cada fetch del gate,
// silenciado solo porque el `Promise.race` de respaldo (D-B) igual devolvía
// a tiempo. Esta combinación manual funciona en ambos entornos.
function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}

// Uso simple: cada llamada obtiene su propio `AbortSignal.timeout(budgetMs)`.
// Suficiente para los clientes de datos (server.ts, actions.ts, service.ts):
// no encadenan reintentos internos del SDK que necesiten un presupuesto
// compartido entre llamadas — ver DEBT-070.
export function createTimeoutFetch(budgetMs: number): typeof fetch {
  return (input, init) => {
    const ownSignal = AbortSignal.timeout(budgetMs);
    const signal = init?.signal ? combineSignals([init.signal, ownSignal]) : ownSignal;
    return fetch(input, { ...init, signal });
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
    const perCallSignal = AbortSignal.timeout(perCallMs);
    const signals = init?.signal
      ? [perCallSignal, sharedSignal, init.signal]
      : [perCallSignal, sharedSignal];
    return fetch(input, { ...init, signal: combineSignals(signals) });
  };
}
