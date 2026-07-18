export async function callAssignmentApi(method, path, body) {
    const baseUrl = process.env.ASSIGNMENT_API_BASE_URL;
    const apiKey = process.env.ASSIGNMENT_API_KEY;
    if (!baseUrl || !apiKey) {
        throw new Error("ASSIGNMENT_API_BASE_URL y ASSIGNMENT_API_KEY deben estar configuradas");
    }
    const url = `${baseUrl}${path}`;
    const headers = {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
    };
    const options = {
        method,
        headers,
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        let errorData = null;
        try {
            errorData = await response.json();
        }
        catch {
            // JSON parsing failed
        }
        const apiError = errorData;
        const errorMessage = apiError?.error && typeof apiError.error === "object"
            ? apiError.error.message || "Error unknown"
            : "API error";
        if (response.status >= 400 && response.status < 500) {
            throw new ToolError(String(errorMessage));
        }
        else {
            throw new Error(`API no disponible (${response.status})`);
        }
    }
    catch (err) {
        if (err instanceof ToolError) {
            throw err;
        }
        throw new Error("API no disponible");
    }
}
class ToolError extends Error {
    constructor(message) {
        super(message);
        this.name = "ToolError";
    }
}
