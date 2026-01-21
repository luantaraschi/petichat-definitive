import { z } from "zod";

export const createCaseSchema = z.object({
  templateId: z.string().uuid().optional(),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  clientName: z.string().optional(),
  tribunal: z.string().optional(),
  foro: z.string().optional(),
});

export const updateCaseSchema = z.object({
  title: z.string().min(3).optional(),
  clientName: z.string().optional(),
  facts: z.string().optional(),
  tribunal: z.string().optional(),
  foro: z.string().optional(),
  valorCausa: z.number().positive().optional(),
  gratuidadeJustica: z.boolean().optional(),
  tom: z.enum(["formal", "assertivo", "conciliador"]).optional(),
  triageResponses: z.record(z.string(), z.unknown()).optional(),
  currentStep: z.number().int().min(0).max(6).optional(),
});

export const triageSchema = z.object({
  responses: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type TriageInput = z.infer<typeof triageSchema>;
