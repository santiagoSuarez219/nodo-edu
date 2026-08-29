#!/usr/bin/env node
// spec-054, Fase 0 — proxy de reenvío que inyecta latencia hacia la instancia
// Supabase de mirp-lab, para reproducir a voluntad la causa raíz del incidente
// del 2026-08-27→29: el gateway de Supabase respondiendo minutos tarde
// mientras GoTrue/Postgres, ya dentro del proyecto, seguían en milisegundos.
// Sin este proxy ningún criterio de aceptación del spec es verificable — la
// latencia real no se puede convocar a demanda.
//
// Sin dependencias nuevas: solo node:http/https + fetch nativo.
//
// Uso:
//   node scripts/latency-proxy.mjs --port=54331 --target=http://localhost:54321 \
//     [--delay=<ms>] [--hang] [--path=<regex>] [--fail-rate=<0..1>]
//
// Procedimiento completo (ver docs/testing/test-054-*.md):
//   1. Túnel SSH a mirp-lab activo (ver CLAUDE.md → "Base de datos").
//   2. Levantar este proxy con el escenario deseado.
//   3. En .env.local, apuntar NEXT_PUBLIC_SUPABASE_URL a http://localhost:<port>.
//   4. Reiniciar `npm run dev` para que recargue .env.local.
//   5. Al terminar: restaurar NEXT_PUBLIC_SUPABASE_URL a http://localhost:54321
//      y reiniciar `npm run dev` de nuevo.
//
// Ejemplos de escenarios (los mismos que test-054 usa por caso):
//   Sesión caducada con /token lento (TC-054-001):
//     --path='^/auth/v1/token' --delay=8000
//   Auth colgado por completo (TC-054-002):
//     --path='^/auth/v1' --hang
//   Health lento, resto sano — la asimetría real del incidente (TC-054-004):
//     --path='^/auth/v1/health' --delay=20000
//   Datos colgados, Auth sano (TC-054-005/006):
//     --path='^/rest/v1' --hang
//   Intermitencia (patrón 503/200 alternado):
//     --path='^/auth/v1' --delay=3000 --fail-rate=0.5

import http from "node:http";

function parseArgs(argv) {
  const args = { port: 54331, target: "http://localhost:54321" };
  for (const raw of argv) {
    const [key, value] = raw.replace(/^--/, "").split(/=(.*)/s);
    if (key === "hang") {
      args.hang = true;
      continue;
    }
    if (value === undefined) continue;
    if (key === "port") args.port = Number(value);
    else if (key === "delay") args.delay = Number(value);
    else if (key === "path") args.pathPattern = new RegExp(value);
    else if (key === "fail-rate") args.failRate = Number(value);
    else if (key === "target") args.target = value;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

function shouldInject(path) {
  // Sin --path, el retardo aplica a todo — útil para --hang total (TC-054-002).
  // Con --path, solo a las rutas que casen — indispensable para reproducir la
  // asimetría real: /auth/v1/token lento mientras /auth/v1/health respondía
  // sano (ver Hallazgo 1 del spec).
  if (!args.pathPattern) return true;
  return args.pathPattern.test(path);
}

const server = http.createServer(async (req, res) => {
  const inject = shouldInject(req.url ?? "/");
  const dropThisRequest =
    inject && args.failRate !== undefined && Math.random() < args.failRate;

  if (inject && args.hang) {
    // No responde nunca: reproduce el cuelgue de 300s de DEBT-070. El cliente
    // (fetch de nuestro código, o el navegador) es quien debe abortar, no este
    // proxy — eso es exactamente lo que el spec necesita probar.
    console.log(`[latency-proxy] HANG  ${req.method} ${req.url}`);
    return;
  }

  if (dropThisRequest) {
    // Cuelga igual que --hang, pero solo una fracción de las requests — el
    // patrón 503/200 alternado del incidente real.
    console.log(`[latency-proxy] DROP  ${req.method} ${req.url}`);
    return;
  }

  if (inject && args.delay) {
    console.log(`[latency-proxy] DELAY ${args.delay}ms  ${req.method} ${req.url}`);
    await new Promise((resolve) => setTimeout(resolve, args.delay));
  } else {
    console.log(`[latency-proxy] PASS  ${req.method} ${req.url}`);
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  try {
    const upstream = await fetch(new URL(req.url ?? "/", args.target), {
      method: req.method,
      // host/connection son cabeceras salto-a-salto — no se reenvían.
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(
          ([name]) => !["host", "connection"].includes(name.toLowerCase())
        )
      ),
      body,
    });

    res.writeHead(upstream.status, Object.fromEntries(upstream.headers));
    const responseBody = upstream.body
      ? Buffer.from(await upstream.arrayBuffer())
      : undefined;
    res.end(responseBody);
  } catch (error) {
    console.error(`[latency-proxy] ERROR reenviando ${req.url}:`, error);
    res.writeHead(502, { "content-type": "text/plain" });
    res.end("latency-proxy: fallo al reenviar al target");
  }
});

server.listen(args.port, () => {
  console.log(
    `[latency-proxy] escuchando en http://localhost:${args.port} → ${args.target}`
  );
  console.log(
    `[latency-proxy] escenario: ${JSON.stringify({
      pathPattern: args.pathPattern?.source ?? "(todas las rutas)",
      delay: args.delay ?? null,
      hang: args.hang ?? false,
      failRate: args.failRate ?? null,
    })}`
  );
});
