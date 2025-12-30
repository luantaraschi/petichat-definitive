// ================================
// AI Routes
// ================================

import type { FastifyInstance, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import {
    suggestThesesSchema,
    generateDocumentSchema,
    rewriteParagraphSchema,
} from '@petichat/shared';
import { aiService } from '../../services/ai.service.js';

export async function aiRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', (fastify as any).authenticate);

    // ================================
    // POST /api/ai/suggest-theses
    // ================================
    fastify.post('/suggest-theses', async (request: any, reply: FastifyReply) => {
        const body = suggestThesesSchema.parse(request.body);
        const userId = request.user.id;
        const lawFirmId = request.user.lawFirmId;

        // Get case facts
        const caseData = await fastify.prisma.case.findFirst({
            where: { id: body.caseId, lawFirmId },
        });

        if (!caseData) {
            return reply.status(404).send({
                error: 'Case not found',
                message: 'Caso não encontrado',
            });
        }

        try {
            // Call AI service
            const thesesResults = await aiService.suggestTheses(caseData.factsDescription, {
                documentType: caseData.caseType,
                provider: body.provider,
            });

            // Delete existing theses for this case
            await fastify.prisma.thesis.deleteMany({
                where: { caseId: body.caseId },
            });

            // Save new theses
            const theses = await Promise.all(
                thesesResults.map((thesis, index) =>
                    fastify.prisma.thesis.create({
                        data: {
                            id: uuidv4(),
                            caseId: body.caseId,
                            category: thesis.category,
                            title: thesis.title,
                            content: thesis.content,
                            selected: false,
                            orderIndex: index,
                        },
                    })
                )
            );

            // Log AI usage
            await fastify.prisma.aILog.create({
                data: {
                    id: uuidv4(),
                    userId,
                    actionType: 'suggest_theses',
                    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                    promptTokens: 500, // Estimate
                    completionTokens: 800, // Estimate
                },
            });

            return { theses };
        } catch (error: any) {
            fastify.log.error('AI suggest theses error:', error);
            return reply.status(500).send({
                error: 'AI Error',
                message: error.message || 'Erro ao gerar sugestões de teses',
            });
        }
    });

    // ================================
    // POST /api/ai/generate-document (also at /api/documents/generate)
    // ================================
    fastify.post('/generate-document', async (request: any, reply: FastifyReply) => {
        const body = generateDocumentSchema.parse(request.body);
        const userId = request.user.id;
        const lawFirmId = request.user.lawFirmId;

        // Get case with theses
        const caseData = await fastify.prisma.case.findFirst({
            where: { id: body.caseId, lawFirmId },
            include: {
                theses: {
                    where: { id: { in: body.thesisIds } },
                },
            },
        });

        if (!caseData) {
            return reply.status(404).send({
                error: 'Case not found',
                message: 'Caso não encontrado',
            });
        }

        // Get jurisprudences
        const jurisprudences = await fastify.prisma.jurisprudence.findMany({
            where: { id: { in: body.jurisprudenceIds } },
        });

        try {
            // Call AI service
            const generatedDoc = await aiService.generateDocument({
                facts: caseData.factsDescription,
                documentType: body.documentType,
                theses: caseData.theses.map((t: { category: string; title: string; content: string }) => ({
                    category: t.category as 'preliminares' | 'merito',
                    title: t.title,
                    content: t.content,
                })),
                jurisprudences: jurisprudences.map((j: { tribunal: string; processNumber: string; summary: string }) => ({
                    tribunal: j.tribunal,
                    processNumber: j.processNumber,
                    summary: j.summary,
                })),
                clientName: caseData.clientName,
                caseType: caseData.caseType,
                provider: body.provider,
            });

            // Create document
            const document = await fastify.prisma.legalDocument.create({
                data: {
                    id: uuidv4(),
                    caseId: body.caseId,
                    title: generatedDoc.title,
                    documentType: body.documentType,
                    status: 'draft',
                    contentHtml: generatedDoc.contentHtml,
                    sections: generatedDoc.sections as any,
                },
            });

            // Create initial version
            await fastify.prisma.documentVersion.create({
                data: {
                    id: uuidv4(),
                    documentId: document.id,
                    contentHtml: generatedDoc.contentHtml,
                    createdBy: userId,
                },
            });

            // Mark selected theses
            await fastify.prisma.thesis.updateMany({
                where: { id: { in: body.thesisIds } },
                data: { selected: true },
            });

            // Log AI usage
            await fastify.prisma.aILog.create({
                data: {
                    id: uuidv4(),
                    userId,
                    actionType: 'generate_document',
                    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                    promptTokens: 1500, // Estimate
                    completionTokens: 3000, // Estimate
                },
            });

            // Track metric
            await fastify.prisma.metricsEvent.create({
                data: {
                    id: uuidv4(),
                    lawFirmId,
                    userId,
                    eventType: 'document_generated',
                    metadata: {
                        documentId: document.id,
                        documentType: body.documentType,
                    },
                },
            });

            return { document };
        } catch (error: any) {
            fastify.log.error('AI generate document error:', error);
            return reply.status(500).send({
                error: 'AI Error',
                message: error.message || 'Erro ao gerar documento',
            });
        }
    });

    // ================================
    // POST /api/ai/rewrite-paragraph
    // ================================
    fastify.post('/rewrite-paragraph', async (request: any, reply: FastifyReply) => {
        const body = rewriteParagraphSchema.parse(request.body);
        const userId = request.user.id;

        try {
            const instruction = body.instruction === 'custom' && body.customInstruction
                ? body.customInstruction
                : body.instruction;

            // Call AI service
            const rewrittenText = await aiService.rewriteParagraph(
                body.originalText,
                instruction,
                undefined, // context
                body.provider
            );

            // Optionally update document
            if (body.documentId && body.paragraphId) {
                // TODO: Implement paragraph-level updates
                // This would require parsing the document sections and updating specific paragraphs
            }

            // Log AI usage
            await fastify.prisma.aILog.create({
                data: {
                    id: uuidv4(),
                    userId,
                    actionType: 'rewrite_paragraph',
                    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                    promptTokens: 200, // Estimate
                    completionTokens: 300, // Estimate
                },
            });

            return { rewrittenText };
        } catch (error: any) {
            fastify.log.error('AI rewrite error:', error);
            return reply.status(500).send({
                error: 'AI Error',
                message: error.message || 'Erro ao reescrever texto',
            });
        }
    });
}
