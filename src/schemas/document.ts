import { z } from "zod";

export const generateDocumentSchema = z.object({
  caseId: z.string().uuid("ID do caso inválido"),
  format: z.enum(["docx", "pdf"]).default("docx"),
  includeJurisprudence: z.boolean().default(true),
  includeChecklist: z.boolean().default(false),
});

export const documentContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()),
});

export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;
export type DocumentContent = z.infer<typeof documentContentSchema>;
