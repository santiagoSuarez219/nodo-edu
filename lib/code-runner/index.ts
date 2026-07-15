export interface CodeRunResult {
  status: "disabled" | "success" | "timeout" | "error";
  output?: string;
  error?: string;
}

export async function runCode(
  language: string,
  code: string,
  input?: string
): Promise<CodeRunResult> {
  return { status: "disabled" };
}
