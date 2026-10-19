// spec-058 (D6) — `questions.code_language` es texto libre; se normaliza y se
// mapea a los ids del proveedor. Ids verificados contra GET /languages de
// Judge0 CE el 2026-10-19 (D1-bis): confirmar de nuevo si se cambia de host.

export type RunnerLanguage = "python" | "java";

const ALIASES: Record<string, RunnerLanguage> = {
  python: "python",
  python3: "python",
  py: "python",
  java: "java",
};

export const PROVIDER_LANGUAGE_IDS: Record<RunnerLanguage, number> = {
  python: 100, // Python 3.12.5
  java: 91, // Java JDK 17.0.6
};

export function resolveRunnerLanguage(
  codeLanguage: string | null | undefined
): RunnerLanguage | null {
  if (!codeLanguage) return null;
  return ALIASES[codeLanguage.trim().toLowerCase()] ?? null;
}
