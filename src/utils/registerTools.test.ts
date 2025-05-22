// tests/registerTools.test.ts

import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { isTool, registerTools, type Tool } from "./registerTools";
import { z } from "zod";


describe("isTool()", () => {
  it("returns true for a fully valid Tool object", () => {
    const valid: unknown = {
      name: "foo",
      schema: {},
      handler: async () => ({
        content: [{ type: "text", text: "ok" }],
      }),
      description: "desc",
    };
    expect(isTool(valid)).toBe(true);
  });

  it("returns false if name is missing or not a string", () => {
    expect(
      isTool({ schema: {}, handler: async () => ({ content: [] }) })
    ).toBe(false);
    expect(
      isTool({ name: 123, schema: {}, handler: async () => ({ content: [] }) })
    ).toBe(false);
  });

  it("returns false if schema is missing", () => {
    expect(isTool({ name: "foo", handler: async () => ({ content: [] }) })).toBe(false);
  });

  it("returns false if handler is missing or not a function", () => {
    expect(isTool({ name: "foo", schema: {} })).toBe(false);
    expect(
      isTool({ name: "foo", schema: {}, handler: "notAFunction" })
    ).toBe(false);
  });
});

describe("registerTools()", () => {
  let server: McpServer;
  let toolMock: ReturnType<typeof mock>;
  let logSpy: ReturnType<typeof spyOn>;
  let warnSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Mock server.tool(...)
    toolMock = mock<(name: string, schema: unknown, handler: any) => void>();
    server = { tool: toolMock } as unknown as McpServer;

    // Spy on console.log / console.warn
    logSpy = spyOn(console, "log");
    warnSpy = spyOn(console, "warn");
  });

  it("registers only valid tools and logs each registration", () => {
    const validTool: Tool = {
      name: "t1",
      schema: { foo: z.any() },
      handler: async () => ({ content: [{ type: "text", text: "hi" }] }),
      description: "my tool",
    };

    const count = registerTools(server, { a: validTool });

    expect(count).toBe(1);
    expect(toolMock).toHaveBeenCalledTimes(1);
    expect(toolMock).toHaveBeenCalledWith(
      "t1",
      validTool.schema,
      validTool.handler
    );

    expect(logSpy).toHaveBeenCalledWith(
      `[MCP] Registered tool: t1 - my tool`
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("skips invalid exports and warns about them", () => {
    const validTool: Tool = {
      name: "ok",
      schema: {},
      handler: async () => ({ content: [{ type: "text", text: "x" }] }),
    };

    const tools = {
      good: validTool,
      bad1: {},
      bad2: { name: "nope", handler: async () => ({ content: [] }) },
    };

    const count = registerTools(server, tools);

    expect(count).toBe(1);
    expect(toolMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      `[MCP] Skipped invalid tool exports: bad1, bad2`
    );
  });

  it("when no valid tools: warns about zero registration and skipped exports", () => {
    const tools = {
      foo: {},
      bar: { name: "x", schema: {} },
    };

    const count = registerTools(server, tools);

    expect(count).toBe(0);
    expect(toolMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "[MCP] No tools registered. Add tools to src/tools and export them in src/tools/index.ts."
    );
    expect(warnSpy).toHaveBeenCalledWith(
      `[MCP] Skipped invalid tool exports: foo, bar`
    );
  });
});
