// spec-058 (D11) — contrato del resultado que recibe el cliente.
// Nunca incluye ids de casos, conteo de casos ocultos ni datos `is_hidden = true`.

export type CaseVerdict =
  | "passed"
  | "wrong_answer"
  | "runtime_error"
  | "timeout"
  | "memory_exceeded"
  | "compile_error"
  | "internal_error"
  // Pregunta sin casos visibles: se muestra solo la salida, sin pasa/falla.
  | "executed";

export interface VisibleCaseResult {
  index: number;
  input: string;
  // null cuando la pregunta no tiene casos de ejemplo.
  expectedOutput: string | null;
  actualOutput: string;
  stderr?: string;
  verdict: CaseVerdict;
  outputTruncated: boolean;
}

export type RejectionReason =
  | "not_in_progress"
  | "window_closed"
  | "not_owner"
  | "question_not_in_variant"
  | "not_coding_challenge"
  | "unsupported_language"
  | "code_too_large"
  | "rate_limited"
  | "empty_code";

export type ChallengeRunResult =
  | { status: "disabled" }
  | {
      status: "rejected";
      reason: RejectionReason;
      message: string;
      runsRemaining?: number;
      retryAfterSeconds?: number;
    }
  | { status: "unavailable"; message: string }
  | {
      status: "completed";
      compileError?: string;
      cases: VisibleCaseResult[];
      noExamples: boolean;
      truncatedCases: boolean;
      runsRemaining: number;
    };

export interface VisibleTestCase {
  input: string;
  expectedOutput: string;
}
