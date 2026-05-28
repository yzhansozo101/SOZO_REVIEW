import { z } from "zod";

export const aiOutputSchema = z.object({
  report_md: z.string().min(50).describe("日本語マークダウン本文(総評・5次元・Top3・リスクを含む)"),
  negative_keywords: z
    .array(
      z.object({
        keyword: z.string().min(1).max(40),
        count: z.number().int().min(1),
        quote: z.string().min(1).max(400),
      }),
    )
    .max(5),
  top3: z
    .array(
      z.object({
        issue: z.string().min(3).max(200),
        action: z.string().min(3).max(300),
        impact: z.string().min(3).max(200),
      }),
    )
    .min(1)
    .max(3),
});

export type AIOutput = z.infer<typeof aiOutputSchema>;

/** JSON-Schema form for the SDK tool definition */
export const submitDiagnosisReportSchema = {
  type: "object",
  properties: {
    report_md: {
      type: "string",
      description: "日本語マークダウン本文。総評→5次元→Top3→リスクの順。",
    },
    negative_keywords: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        required: ["keyword", "count", "quote"],
        properties: {
          keyword: { type: "string", description: "日本語短語(2-6字)" },
          count: { type: "integer", description: "言及回数" },
          quote: { type: "string", description: "原文引用(言語そのまま)" },
        },
      },
    },
    top3: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        required: ["issue", "action", "impact"],
        properties: {
          issue: { type: "string", description: "現状の問題(1文)" },
          action: { type: "string", description: "具体的なアクション" },
          impact: { type: "string", description: "期待効果" },
        },
      },
    },
  },
  required: ["report_md", "negative_keywords", "top3"],
} as const;

export const TOOL_NAME = "submit_diagnosis_report" as const;
