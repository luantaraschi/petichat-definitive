import { z } from "zod";

export const jurisSearchSchema = z.object({
  query: z.string().min(3, "Busca deve ter no mínimo 3 caracteres"),
  tribunal: z.string().optional(),
  area: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10),
  offset: z.number().int().min(0).default(0),
});

export const jurisprudenceMetadataSchema = z.object({
  tribunal: z.string().min(1, "Tribunal é obrigatório"),
  numero: z.string().min(1, "Número do processo é obrigatório"),
  dataJulgamento: z.string().min(1, "Data do julgamento é obrigatória"),
  fonte: z.string().min(1, "Fonte é obrigatória"),
  relator: z.string().optional(),
  orgaoJulgador: z.string().optional(),
  ementa: z.string().optional(),
  linkOriginal: z.string().url().optional(),
});

export type JurisSearchInput = z.infer<typeof jurisSearchSchema>;
export type JurisprudenceMetadata = z.infer<typeof jurisprudenceMetadataSchema>;
