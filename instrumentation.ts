import * as Sentry from "@sentry/nextjs";

// Hook nativo de Next (App Router). register() carga el init del runtime
// correspondiente; onRequestError engancha excepciones de Server Components,
// Server Actions y las rutas de app/api/** sin tocar ninguna de ellas.
// Ver spec-052.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
