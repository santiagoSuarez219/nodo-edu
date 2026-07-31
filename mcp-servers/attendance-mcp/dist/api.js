export async function callAttendanceApi(method, path, params) {
    const baseUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_KEY;
    if (!baseUrl || !apiKey) {
        throw new Error("API_BASE_URL y API_KEY deben estar configuradas");
    }
    let url = `${baseUrl}${path}`;
    if (params) {
        const queryString = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                queryString.append(key, String(value));
            }
        }
        if (queryString.toString()) {
            url += `?${queryString.toString()}`;
        }
    }
    const headers = {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
    };
    const options = {
        method,
        headers,
    };
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
            ? apiError.error.message || "Error desconocido"
            : "Error de API";
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
