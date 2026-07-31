import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { tools, handleToolCall } from "./tools.js";
function validateEnv() {
    const required = ["QUESTION_BANK_API_BASE_URL", "QUESTION_BANK_API_KEY"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`❌ Faltan variables de entorno: ${missing.join(", ")}`);
        process.exit(1);
    }
    console.error(`✓ MCP iniciado. API: ${process.env.QUESTION_BANK_API_BASE_URL}`);
}
const server = new Server({
    name: "question-bank-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools,
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const toolInput = request.params.arguments;
    try {
        const result = await handleToolCall(toolName, toolInput);
        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${message}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    validateEnv();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
