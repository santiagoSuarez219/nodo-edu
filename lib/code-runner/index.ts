import * as Sentry from "@sentry/nextjs";
import { createServiceSupabaseClient } from "@/lib/auth/service";
import { isSentryEnabled } from "@/lib/observability/sentry-enabled";
import { outputsMatch } from "./compare";
import {
  MAX_CODE_LENGTH,
  MAX_DISPLAY_OUTPUT_CHARS,
  MAX_RUNS_PER_QUESTION,
  MIN_RUN_INTERVAL_SECONDS,
  isCodeRunnerConfigured,
} from "./config";
import { checkChallengeAccess, rejectionMessage } from "./gate";
import type { RunnerLanguage } from "./languages";
import { CodeRunnerProviderError, mapVerdict, runBatch, type ProviderRun } from "./provider";
import type {
  CaseVerdict,
  ChallengeRunResult,
  RejectionReason,
  VisibleCaseResult,
  VisibleTestCase,
} from "./types";

export type { ChallengeRunResult, VisibleCaseResult } from "./types";

export const UNAVAILABLE_MESSAGE =
  "No pudimos ejecutar tu código en este momento. Tu respuesta sigue guardada; puedes intentarlo de nuevo o enviar la evaluación.";
const TRUNCATION_MARKER = "\n… (salida truncada)";
const JAVA_MAIN_HINT = "\n\nEn Java, la clase pública debe llamarse Main.";
const PYTHON_SYNTAX_ERROR = /\b(SyntaxError|IndentationError|TabError)\b/;

function truncateForDisplay(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_DISPLAY_OUTPUT_CHARS) return { text, truncated: false };
  return { text: text.slice(0, MAX_DISPLAY_OUTPUT_CHARS) + TRUNCATION_MARKER, truncated: true };
}

function reject(
  reason: RejectionReason,
  extra: { runsRemaining?: number; retryAfterSeconds?: number; message?: string } = {}
): ChallengeRunResult {
  const { message, ...rest } = extra;
  return { status: "rejected", reason, message: message ?? rejectionMessage(reason), ...rest };
}

// D15: se reporta solo la fase, el estado HTTP y el lenguaje. Nunca el código,
// los stdin, las salidas ni el cuerpo de la respuesta del proveedor.
function reportProviderFailure(error: CodeRunnerProviderError, language: RunnerLanguage) {
  if (!isSentryEnabled) return;
  Sentry.captureException(new Error("code runner unavailable"), {
    level: "warning",
    tags: {
      "code_runner.provider": "judge0",
      "code_runner.language": language,
      "code_runner.http_status": String(error.httpStatus ?? "none"),
      "code_runner.phase": error.phase,
    },
  });
}

interface VisibleRunOutcome {
  compileError?: string;
  cases: VisibleCaseResult[];
  noExamples: boolean;
  truncatedCases: boolean;
}

function buildOutcome(
  language: RunnerLanguage,
  code: string,
  tests: VisibleTestCase[],
  testsTruncated: boolean,
  runs: ProviderRun[]
): VisibleRunOutcome {
  const noExamples = tests.length === 0;

  // Un error de compilación es idéntico en todos los casos (la compilación no
  // depende del stdin): basta con inspeccionar el primero y se muestra una vez.
  const first = runs[0];
  const isJavaCompile = first !== undefined && mapVerdict(first) === "compile_error";
  const isPythonSyntax =
    language === "python" &&
    runs.every((run) => mapVerdict(run) === "runtime_error" && PYTHON_SYNTAX_ERROR.test(run.stderr));

  if (isJavaCompile || isPythonSyntax) {
    let raw = isJavaCompile ? first.compileOutput || first.message : first.stderr;
    const { text } = truncateForDisplay(raw.trim());
    raw = text;
    if (language === "java" && !/\bclass\s+Main\b/.test(code)) raw += JAVA_MAIN_HINT;
    return { compileError: raw, cases: [], noExamples, truncatedCases: testsTruncated };
  }

  const cases = runs.map((run, i): VisibleCaseResult => {
    const test: VisibleTestCase | undefined = tests[i];
    const verdict: CaseVerdict = mapVerdict(run);
    const final: CaseVerdict =
      verdict === "passed"
        ? test
          ? outputsMatch(run.stdout, test.expectedOutput)
            ? "passed"
            : "wrong_answer"
          : "executed"
        : verdict;

    const shownOut = truncateForDisplay(run.stdout);
    const shownErr = truncateForDisplay(run.stderr);
    return {
      index: i + 1,
      input: test?.input ?? "",
      expectedOutput: test ? test.expectedOutput : null,
      actualOutput: shownOut.text,
      stderr: run.stderr ? shownErr.text : undefined,
      verdict: final,
      outputTruncated: shownOut.truncated || shownErr.truncated,
    };
  });

  return { cases, noExamples, truncatedCases: testsTruncated };
}

export async function runChallenge(
  userId: string,
  submissionId: string,
  questionId: string,
  code: string
): Promise<ChallengeRunResult> {
  if (code.trim().length === 0) return reject("empty_code");
  if (code.length > MAX_CODE_LENGTH) return reject("code_too_large");

  const access = await checkChallengeAccess(userId, submissionId, questionId);
  if (!access.ok) return reject(access.reason);

  // Sin configuración no se cuenta ni se llama al proveedor (D13).
  if (!isCodeRunnerConfigured()) return { status: "disabled" };

  const service = createServiceSupabaseClient();
  const inputs = access.tests.length > 0 ? access.tests.map((t) => t.input) : [""];

  // Conteo, intervalo e inserción en una sola transacción serializada por
  // intento (claim_code_run): evita saltarse los límites con llamadas en paralelo.
  const { data: claim, error: claimError } = await service.rpc("claim_code_run", {
    p_submission_id: submissionId,
    p_question_id: questionId,
    p_language: access.language,
    p_cases_count: inputs.length,
    p_max_runs: MAX_RUNS_PER_QUESTION,
    p_min_interval_seconds: MIN_RUN_INTERVAL_SECONDS,
  });
  if (claimError) throw claimError;

  const claimed = claim as {
    status: "ok" | "limit" | "interval";
    count: number;
    run_id?: string;
    retry_after?: number;
  };
  if (claimed.status === "limit") return reject("rate_limited", { runsRemaining: 0 });
  if (claimed.status === "interval") {
    return reject("rate_limited", {
      message: "Ejecutaste hace muy poco.",
      runsRemaining: MAX_RUNS_PER_QUESTION - claimed.count,
      retryAfterSeconds: claimed.retry_after,
    });
  }
  const runId = claimed.run_id as string;

  const startedAt = Date.now();
  const finish = async (outcome: "completed" | "compile_error" | "provider_error") => {
    const { error } = await service
      .from("code_runs")
      .update({ outcome, duration_ms: Date.now() - startedAt })
      .eq("id", runId);
    // El contador ya cuenta la fila; solo se pierde la métrica de resultado.
    if (error && isSentryEnabled) {
      Sentry.captureMessage("code runner outcome update failed", {
        level: "warning",
        tags: { "code_runner.phase": "finish" },
      });
    }
  };

  let runs: ProviderRun[];
  try {
    runs = await runBatch(access.language, code, inputs);
  } catch (error) {
    if (!(error instanceof CodeRunnerProviderError)) throw error;
    await finish("provider_error");
    reportProviderFailure(error, access.language);
    return { status: "unavailable", message: UNAVAILABLE_MESSAGE };
  }

  const outcome = buildOutcome(access.language, code, access.tests, access.testsTruncated, runs);
  await finish(outcome.compileError !== undefined ? "compile_error" : "completed");

  return {
    status: "completed",
    ...outcome,
    runsRemaining: MAX_RUNS_PER_QUESTION - claimed.count,
  };
}
