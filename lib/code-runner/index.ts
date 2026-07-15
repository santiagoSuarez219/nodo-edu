export interface CodeRunResult {
  status: "disabled" | "success" | "timeout" | "error";
  output?: string;
  error?: string;
}

export async function runCode(
  _language: string,
  _code: string,
  _input?: string
): Promise<CodeRunResult> {
  return { status: "disabled" };
}
