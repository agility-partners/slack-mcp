import { Elysia } from "elysia";
import { transports } from "../index";
import { SSEElysiaTransport } from "../transport/SSEElysiaTransport";

/**
 * POST /messages
 * Handles incoming JSON-RPC messages for a specific session.
 * Expects a valid sessionId as a query parameter.
 * Delegates message handling to the corresponding transport.
 */
export const MessagesRoute = new Elysia().post("/messages", async (context) => {
  // Parse sessionId from the request URL query string
  let sessionId: string | null = null;
  try {
    const url = new URL(context.request.url);
    sessionId = url.searchParams.get("sessionId");
  } catch (err) {
    // Malformed URL or missing context
    console.error("[/messages] Failed to parse request URL:", err);
    return new Response(
      JSON.stringify({ error: "Malformed request URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate sessionId presence and existence in the transport map
  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: "Missing sessionId query parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!transports.has(sessionId)) {
    return new Response(
      JSON.stringify({ error: "Unknown or expired sessionId" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Retrieve the transport and ensure it is the correct type
  const transport = transports.get(sessionId);
  if (!(transport instanceof SSEElysiaTransport)) {
    console.error(`[/messages] Transport for sessionId ${sessionId} is not a SSEElysiaTransport`);
    return new Response(
      JSON.stringify({ error: "Transport type mismatch or invalid session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Delegate message handling to the transport
  try {
    return await transport.handlePostMessage(context);
  } catch (error) {
    // Log and return a generic error response
    console.error(`[/messages] Error in transport.handlePostMessage:`, error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
