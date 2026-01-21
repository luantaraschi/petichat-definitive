import { z } from "zod";

export const inlineActionSchema = z.object({
  action: z.enum([
    "rewrite",
    "expand",
    "shorten",
    "formalize",
    "cite",
    "create_topic",
    "create_claims",
  ]),
  text: z.string().min(1, "Texto selecionado é obrigatório"),
  context: z
    .object({
      caseId: z.string().uuid().optional(),
      thesisId: z.string().uuid().optional(),
      jurisprudenceIds: z.array(z.string().uuid()).optional(),
    })
    .optional(),
});

export const applyActionSchema = z.object({
  actionId: z.string().uuid(),
  documentId: z.string().uuid(),
  position: z.object({
    from: z.number().int().min(0),
    to: z.number().int().min(0),
  }),
});

export type InlineActionInput = z.infer<typeof inlineActionSchema>;
export type ApplyActionInput = z.infer<typeof applyActionSchema>;
