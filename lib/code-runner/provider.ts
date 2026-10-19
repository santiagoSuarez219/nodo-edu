import {
  ACTION_BUDGET_MS,
  LANGUAGE_LIMITS,
  POLL_INTERVAL_MS,
  getCodeRunnerConfig,
  type CodeRunnerConfig,
} from "./config";
import { PROVIDER_LANGUAGE_IDS, type RunnerLanguage } from "./languages";
import type { CaseVerdict } from "./types";

// spec-058 (D1-bis) — cliente `fetch` de Judge0 CE. El host oficial no habilita
// `wait=true`, así que se envía un lote y se sondea hasta que todo termine, todo
// dentro del presupuesto único de la acción.
//
// D15: el error que sale de aquí NUNCA lleva el cuerpo de la respuesta, el
// código ni la entrada: solo la fase y el estado HTTP.

export type ProviderFailurePhase = "request" | "timeout" | "parse";

export class CodeRunnerProviderError extends Error {
  constructor(
    readonly phase: ProviderFailurePhase,
    readonly httpStatus: number | null
  ) {
    super(`code runner provider failure (${phase})`);
    this.name = "CodeRunnerProviderError";
  }
}

export interface ProviderRun {
  statusId: number;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
}

// Ids de estado de Judge0 CE: 1 en cola, 2 procesando, 3 aceptado, 5 tiempo
// límite, 6 compilación, 7-12 y 14 errores de ejecución, 13 error interno.
const STATUS_IN_QUEUE = 1;
const STATUS_PROCESSING = 2;
const STATUS_TIME_LIMIT = 5;
const STATUS_COMPILATION_ERROR = 6;
const STATUS_INTERNAL_ERROR = 13;

const MEMORY_ERROR_PATTERN = /OutOfMemoryError|MemoryError|Cannot allocate memory/i;

export function mapVerdict(run: ProviderRun): CaseVerdict {
  const { statusId } = run;
  if (statusId === 3) return "passed";
  if (statusId === STATUS_TIME_LIMIT) return "timeout";
  if (statusId === STATUS_COMPILATION_ERROR) return "compile_error";
  if (statusId === STATUS_INTERNAL_ERROR) return "internal_error";
  if (MEMORY_ERROR_PATTERN.test(`${run.stderr}\n${run.message}`)) return "memory_exceeded";
  return "runtime_error";
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function decode(value: unknown): string {
  return typeof value === "string" ? Buffer.from(value, "base64").toString("utf8") : "";
}

function buildHeaders(config: CodeRunnerConfig, json: boolean): HeadersInit {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    "x-rapidapi-key": config.apiKey,
    ...(config.apiHost ? { "x-rapidapi-host": config.apiHost } : {}),
  };
}

async function request(
  config: CodeRunnerConfig,
  path: string,
  init: RequestInit,
  signal: AbortSignal
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, { ...init, signal });
  } catch {
    throw new CodeRunnerProviderError(signal.aborted ? "timeout" : "request", null);
  }
  if (!response.ok) throw new CodeRunnerProviderError("request", response.status);
  try {
    return await response.json();
  } catch {
    throw new CodeRunnerProviderError(signal.aborted ? "timeout" : "parse", response.status);
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
}

interface RawSubmission {
  token?: unknown;
  status?: { id?: unknown };
  stdout?: unknown;
  stderr?: unknown;
  compile_output?: unknown;
  message?: unknown;
}

// Ejecuta `code` una vez por cada entrada de `inputs` y devuelve los resultados
// en el mismo orden. Máximo 20 entradas (límite del lote del proveedor).
export async function runBatch(
  language: RunnerLanguage,
  code: string,
  inputs: string[]
): Promise<ProviderRun[]> {
  const config = getCodeRunnerConfig();
  if (!config) throw new CodeRunnerProviderError("request", null);

  const limits = LANGUAGE_LIMITS[language];
  const controller = new AbortController();
  const budget = setTimeout(() => controller.abort(), ACTION_BUDGET_MS);
  const { signal } = controller;

  try {
    const created = await request(
      config,
      "/submissions/batch?base64_encoded=true",
      {
        method: "POST",
        headers: buildHeaders(config, true),
        body: JSON.stringify({
          submissions: inputs.map((input) => ({
            language_id: PROVIDER_LANGUAGE_IDS[language],
            source_code: encode(code),
            stdin: encode(input),
            cpu_time_limit: limits.cpuTimeLimit,
            wall_time_limit: limits.wallTimeLimit,
            memory_limit: limits.memoryLimitKb,
          })),
        }),
      },
      signal
    );

    const tokens = Array.isArray(created)
      ? (created as RawSubmission[]).map((item) => item?.token)
      : [];
    if (tokens.length !== inputs.length || tokens.some((t) => typeof t !== "string")) {
      throw new CodeRunnerProviderError("parse", null);
    }

    const query = new URLSearchParams({
      tokens: (tokens as string[]).join(","),
      base64_encoded: "true",
      fields: "token,status,stdout,stderr,compile_output,message",
    });

    for (;;) {
      const polled = (await request(
        config,
        `/submissions/batch?${query.toString()}`,
        { method: "GET", headers: buildHeaders(config, false) },
        signal
      )) as { submissions?: RawSubmission[] } | null;

      const byToken = new Map<string, RawSubmission>();
      for (const item of polled?.submissions ?? []) {
        if (typeof item?.token === "string") byToken.set(item.token, item);
      }

      const ordered = (tokens as string[]).map((t) => byToken.get(t));
      if (ordered.some((item) => item === undefined)) {
        throw new CodeRunnerProviderError("parse", null);
      }

      const pending = ordered.some((item) => {
        const id = item?.status?.id;
        return typeof id !== "number" || id === STATUS_IN_QUEUE || id === STATUS_PROCESSING;
      });

      if (!pending) {
        return ordered.map((item) => ({
          statusId: item!.status!.id as number,
          stdout: decode(item!.stdout),
          stderr: decode(item!.stderr),
          compileOutput: decode(item!.compile_output),
          message: decode(item!.message),
        }));
      }

      await sleep(POLL_INTERVAL_MS, signal);
      if (signal.aborted) throw new CodeRunnerProviderError("timeout", null);
    }
  } finally {
    clearTimeout(budget);
  }
}
