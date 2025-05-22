import { Elysia } from "elysia";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as tools from "./tools";
import { registerTools } from "./utils/registerTools";
import { RootRoute } from "./routes/root.route";
import { SSERoute } from "./routes/sse.route";
import { MessagesRoute } from "./routes/messages.route";
import { apiKeyGuard } from "./auth/apiKey.auth";

// Store active transports by session ID (type-safe)
export const transports = new Map<string, unknown>();

// Create MCP server
export const server = new McpServer({
  name: "slack-mcp",
  version: "1.0.0"
});

// Register all tools from the barrel
registerTools(server, tools);

const app = new Elysia()
  .guard(apiKeyGuard)
  .use(RootRoute)
  .use(SSERoute)
  .use(MessagesRoute)

const port = process.env.PORT || 3001;

app.listen(Number(port), () => {
  console.log(`MCP server running at http://localhost:${port}`);
  console.log(`- GET /sse for SSE connection`);
  console.log(`- POST /messages?sessionId=<ID> for messages`);
});