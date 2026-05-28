import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSdkMcpServer, query, tool, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { buildUserPrompt, type Dimensions } from "./prompts/build.js";
import { aiOutputSchema, TOOL_NAME, type AIOutput } from "./prompts/tools.js";
import type { Snapshot } from "../airbnb/extract.js";
import type { Review } from "../airbnb/fetch-reviews.js";
import { log } from "../log.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = readFileSync(resolve(__dirname, "prompts/system.ja.md"), "utf8");
const MCP_SERVER_NAME = "diagnosis_report";
const SDK_TOOL_NAME = `mcp__${MCP_SERVER_NAME}__${TOOL_NAME}`;

type ToolUseBlock = { type: "tool_use"; name: string; input: unknown };

export type GenerateResult =
  | { status: "ok"; data: AIOutput }
  | { status: "fallback"; reason: string };

export type SdkInjector = {
  callSdk: (params: { systemPrompt: string; userPrompt: string }) => Promise<unknown>;
};

/**
 * Inner core. Accepts an injector so tests can mock the SDK boundary.
 */
export async function generateReportWith(
  snapshot: Snapshot,
  dimensions: Dimensions,
  reviews: Review[],
  injector: SdkInjector,
): Promise<GenerateResult> {
  const userPrompt = buildUserPrompt(snapshot, dimensions, reviews);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await injector.callSdk({ systemPrompt: SYSTEM_PROMPT, userPrompt });
      const parsed = aiOutputSchema.safeParse(raw);
      if (parsed.success) {
        return { status: "ok", data: parsed.data };
      }
      log.warn({ issues: parsed.error.issues, attempt }, "AI output failed zod validation");
    } catch (e) {
      log.warn({ err: String(e), attempt }, "Claude Agent SDK call threw");
    }
  }

  return { status: "fallback", reason: "Claude Agent SDK 出力検証に失敗しました" };
}

function extractToolInput(message: SDKMessage): unknown {
  if (message.type !== "assistant") {
    return undefined;
  }

  const content = message.message.content as Array<ToolUseBlock | { type: string }>;
  const toolUse = content.find(
    (block): block is ToolUseBlock => block.type === "tool_use" && "name" in block && block.name === SDK_TOOL_NAME,
  );
  return toolUse?.input;
}

/**
 * Real SDK injector. Registers a single in-process MCP tool and returns the
 * tool input once Claude emits/calls submit_diagnosis_report.
 */
export const realSdkInjector: SdkInjector = {
  async callSdk({ systemPrompt, userPrompt }) {
    let capturedInput: unknown;
    const mcpServer = createSdkMcpServer({
      name: MCP_SERVER_NAME,
      version: "0.1.0",
      tools: [
        tool(
          TOOL_NAME,
          "診断レポートを提出する",
          aiOutputSchema.shape,
          async (args) => {
            capturedInput = args;
            return { content: [{ type: "text", text: "ok" }] };
          },
          { alwaysLoad: true },
        ),
      ],
      alwaysLoad: true,
    });

    const result = query({
      prompt: userPrompt,
      options: {
        systemPrompt,
        mcpServers: { [MCP_SERVER_NAME]: mcpServer },
        allowedTools: [SDK_TOOL_NAME],
        tools: [],
        maxTurns: 1,
        persistSession: false,
      },
    });

    for await (const message of result) {
      capturedInput ??= extractToolInput(message);
      if (capturedInput !== undefined) {
        return capturedInput;
      }
    }

    throw new Error("no_tool_use_in_stream");
  },
};

/** Default factory: real SDK. */
export async function generateReport(
  snapshot: Snapshot,
  dimensions: Dimensions,
  reviews: Review[],
): Promise<GenerateResult> {
  return generateReportWith(snapshot, dimensions, reviews, realSdkInjector);
}
