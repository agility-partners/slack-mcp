import { Elysia } from 'elysia';

export const RootRoute = new Elysia()
  .get('/', () => ({
    name: "Tracker MCP Server",
    version: "1.0.0",
    description: "Model Context Protocol server for Tracker RMS",
    endpoints: {
      "/": "This info",
      "/sse": "SSE endpoint for MCP connections",
      "/messages": "Message endpoint for MCP clients"
    }
  }));
