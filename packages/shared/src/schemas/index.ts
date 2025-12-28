import { z } from 'zod';

// ================================
// Authentication Schemas
// ================================

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z
        .string()
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'A senha deve conter letras maiúsculas, minúsculas e números'
        ),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    lawFirmName: z.string().min(2, 'Nome do escritório deve ter no mínimo 2 caracteres'),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

// ================================
// Case Schemas
// ================================

export const caseStatusSchema = z.enum(['draft', 'active', 'archived']);

export const createCaseSchema = z.object({
    clientName: z.string().min(2, 'Nome do cliente deve ter no mínimo 2 caracteres'),
    caseType: z.string().min(1, 'Tipo do caso é obrigatório'),
    factsDescription: z.string().min(10, 'Descrição dos fatos deve ter no mínimo 10 caracteres'),
    metadata: z.record(z.unknown()).optional(),
});

export const updateCaseSchema = z.object({
    clientName: z.string().min(2).optional(),
    caseType: z.string().min(1).optional(),
    factsDescription: z.string().min(10).optional(),
    status: caseStatusSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
});

// ================================
// Document Schemas
// ================================

export const documentTypeSchema = z.enum([
    'petition',
    'contestation',
    'appeal',
    'motion',
    'brief',
    'contract',
    'other',
]);

export const documentStatusSchema = z.enum(['draft', 'completed']);

export const documentSectionSchema = z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
});

export const createDocumentSchema = z.object({
    caseId: z.string().uuid('ID do caso inválido'),
    title: z.string().min(1, 'Título é obrigatório'),
    documentType: documentTypeSchema,
});

export const updateDocumentSchema = z.object({
    title: z.string().min(1).optional(),
    contentHtml: z.string().optional(),
    sections: z.array(documentSectionSchema).optional(),
    status: documentStatusSchema.optional(),
});

export const generateDocumentSchema = z.object({
    caseId: z.string().uuid('ID do caso inválido'),
    documentType: documentTypeSchema,
    thesisIds: z.array(z.string().uuid()),
    jurisprudenceIds: z.array(z.string().uuid()),
});

export const exportDocumentSchema = z.object({
    documentId: z.string().uuid('ID do documento inválido'),
    format: z.enum(['pdf', 'docx', 'txt']),
});

// ================================
// AI Schemas
// ================================

export const suggestThesesSchema = z.object({
    caseId: z.string().uuid('ID do caso inválido'),
});

export const rewriteInstructionSchema = z.enum([
    'improve',
    'simplify',
    'expand',
    'formal',
    'custom',
]);

export const rewriteParagraphSchema = z.object({
    documentId: z.string().uuid().optional(),
    paragraphId: z.string().optional(),
    originalText: z.string().min(10, 'Texto deve ter no mínimo 10 caracteres'),
    instruction: rewriteInstructionSchema,
    customInstruction: z.string().optional(),
});

// ================================
// Jurisprudence Schemas
// ================================

export const searchJurisprudenceSchema = z.object({
    caseId: z.string().uuid().optional(),
    keywords: z.string().min(1, 'Palavras-chave são obrigatórias'),
    tribunal: z.string().optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});

// ================================
// Metrics Schemas
// ================================

export const trackEventSchema = z.object({
    eventType: z.string().min(1, 'Tipo do evento é obrigatório'),
    metadata: z.record(z.unknown()).optional(),
});

// ================================
// Pagination Schema
// ================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ================================
// AI Response Validation Schemas
// ================================

export const aiThesisResponseSchema = z.object({
    theses: z.array(
        z.object({
            category: z.enum(['preliminares', 'merito']),
            title: z.string(),
            content: z.string(),
        })
    ),
});

export const aiDocumentResponseSchema = z.object({
    title: z.string(),
    sections: z.array(
        z.object({
            type: z.string(),
            title: z.string(),
            content: z.string(),
        })
    ),
});

// ================================
// Type Exports
// ================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;
export type ExportDocumentInput = z.infer<typeof exportDocumentSchema>;
export type SuggestThesesInput = z.infer<typeof suggestThesesSchema>;
export type RewriteParagraphInput = z.infer<typeof rewriteParagraphSchema>;
export type SearchJurisprudenceInput = z.infer<typeof searchJurisprudenceSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
