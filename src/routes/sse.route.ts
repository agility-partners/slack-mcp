import { Elysia } from "elysia";
import { server } from "../index";
import { transports } from "../index";
import { SSEElysiaTransport } from "../transport/SSEElysiaTransport";

export const SSERoute = new Elysia().get("/sse", async (context) => {
  console.log("SSE connection requested");

  try {
    context.set.headers['content-type'] = 'text/event-stream';
    context.set.headers['cache-control'] = 'no-cache';
    context.set.headers['connection'] = 'keep-alive';

    console.log("Headers set for SSE connection");

    try {
      // Create the transport
      console.log("Creating transport");
      const transport = new SSEElysiaTransport("/messages", context);
      console.log(`Transport created with sessionId: ${transport.sessionId}`);

      transport.onmessage = async (msg) => {
        try {
          console.log(`[SSE] Processing message:`, msg);
          const result = await server.handle(msg);
          console.log(`[SSE] Tool execution result:`, result);
          await transport.send({
            jsonrpc: "2.0",
            result,
            id: msg.id
          });
        } catch (err) {
          console.error(`[SSE] Tool execution error:`, err);
          await transport.send({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Internal error" },
            id: msg.id
          });
        }
      };

      // Store the transport
      console.log("Storing transport in map");
      transports.set(transport.sessionId, transport);
      console.log(`Transports map size: ${transports.size}`);

      // Connect to MCP server
      console.log("Connecting to MCP server");
      await server.connect(transport);
      console.log("Connected to MCP server");

      console.log("SSE connection successful");
      // Return the response set by the transport
      return context.response;
    } catch (error) {
      const transportError = error as Error;
      console.error("Transport/connection error:", transportError);
      console.error(transportError.stack);

      // Try to send a proper error response
      return new Response(JSON.stringify({
        error: "Transport error",
        message: transportError.message,
        stack: transportError.stack
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  } catch (error) {
    const outerError = error as Error;
    console.error("Outer error in SSE handler:", outerError);
    console.error(outerError.stack);

    // Last resort error handler
    return new Response(JSON.stringify({
      error: "Server error",
      message: outerError.message,
      stack: outerError.stack
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
});
