// spec-058 — configuración y límites del ejecutor de código.
//
// Los límites son constantes (no variables de entorno) a propósito: cambiar uno
// es un cambio de código revisado, no un ajuste de despliegue (D5).

export const MAX_CODE_LENGTH = 20_000;
export const MAX_VISIBLE_CASES = 10;
export const MAX_DISPLAY_OUTPUT_CHARS = 4_096;
export const ACTION_BUDGET_MS = 25_000;
export const POLL_INTERVAL_MS = 700;

export const MAX_RUNS_PER_QUESTION = 20;
export const MIN_RUN_INTERVAL_SECONDS = 5;

// Memoria en KB, tiempos en segundos: son las unidades de Judge0.
export interface LanguageLimits {
  cpuTimeLimit: number;
  wallTimeLimit: number;
  memoryLimitKb: number;
}

export const LANGUAGE_LIMITS = {
  python: { cpuTimeLimit: 2, wallTimeLimit: 5, memoryLimitKb: 128_000 },
  java: { cpuTimeLimit: 3, wallTimeLimit: 6, memoryLimitKb: 256_000 },
} as const satisfies Record<string, LanguageLimits>;

export interface CodeRunnerConfig {
  apiUrl: string;
  apiKey: string;
  // Solo RapidAPI lo exige (`x-rapidapi-host`); un Judge0 propio no.
  apiHost: string | null;
}

export function getCodeRunnerConfig(): CodeRunnerConfig | null {
  const apiUrl = process.env.CODE_RUNNER_API_URL?.trim();
  const apiKey = process.env.CODE_RUNNER_API_KEY?.trim();
  if (!apiUrl || !apiKey) return null;
  return {
    apiUrl: apiUrl.replace(/\/+$/, ""),
    apiKey,
    apiHost: process.env.CODE_RUNNER_API_HOST?.trim() || null,
  };
}

// La ausencia de configuración es un estado de producto legítimo ("ejecución no
// disponible"), no un error de despliegue (D13).
export function isCodeRunnerConfigured(): boolean {
  return getCodeRunnerConfig() !== null;
}
