// src/tools/registerTools.ts

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";

/**
 * Contract for a valid MCP tool.
 */
export interface Tool {
  name: string;
  schema: ZodRawShape;
  /**
   * Tool handler function.
   * @param args - Tool input arguments.
   * @param extra - Additional context or metadata.
   * @returns Promise resolving to tool output.
   */
  handler: (
    args: { [key: string]: any },
    extra: any
  ) => Promise<{
    [key: string]: unknown;
    content: Array<
      | { type: "text"; text: string }
      | { type: "image"; data: string; mimeType: string }
    >;
    _meta?: { [key: string]: any };
    isError?: boolean;
  }>;
  description?: string;
}

/**
 * Type guard to validate if an object conforms to the Tool interface.
 */
export function isTool(obj: unknown): obj is Tool {
  return (
    typeof obj === "object" &&
    obj !== null &&
    // name must be a string
    typeof (obj as any).name === "string" &&
    // schema must be an object (ZodRawShape is a record of Zod schemas)
    typeof (obj as any).schema === "object" &&
    (obj as any).schema !== null &&
    // handler must be a function
    typeof (obj as any).handler === "function"
  );
}

/**
 * Registers all valid tools with the MCP server and logs results.
 */
export function registerTools(
  server: McpServer,
  tools: Record<string, unknown>
): number {
  const invalid: string[] = [];
  let count = 0;

  for (const key in tools) {
    const maybeTool = tools[key];
    if (isTool(maybeTool)) {
      // call with name, schema, handler only
      server.tool(maybeTool.name, maybeTool.description ?? "", maybeTool.schema, maybeTool.handler);
      console.log(
        `[MCP] Registered tool: ${maybeTool.name}` +
        (maybeTool.description ? ` - ${maybeTool.description}` : "")
      );
      count++;
    } else {
      invalid.push(key);
    }
  }

  if (count === 0) {
    console.warn(
      "[MCP] No tools registered. Add tools to src/tools and export them in src/tools/index.ts."
    );
  }

  if (invalid.length > 0) {
    console.warn(`[MCP] Skipped invalid tool exports: ${invalid.join(", ")}`);
  }

  return count;
}
