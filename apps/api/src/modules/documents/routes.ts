// ================================
// Documents Routes
// ================================

import type { FastifyInstance, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import {
    createDocumentSchema,
    updateDocumentSchema,
    exportDocumentSchema,
    paginationSchema,
} from '@petichat/shared';

export async function documentsRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', (fastify as any).authenticate);

    // ================================
    // POST /api/documents - Create document
    // ================================
    fastify.post('/', async (request: any, reply: FastifyReply) => {
        const body = createDocumentSchema.parse(request.body);
        const userId = request.user.id;
        const lawFirmId = request.user.lawFirmId;

        // Verify case belongs to law firm
        const caseData = await fastify.prisma.case.findFirst({
            where: { id: body.caseId, lawFirmId },
        });

        if (!caseData) {
            return reply.status(404).send({
                error: 'Case not found',
                message: 'Caso não encontrado',
            });
        }

        const document = await fastify.prisma.legalDocument.create({
            data: {
                id: uuidv4(),
                caseId: body.caseId,
                title: body.title,
                documentType: body.documentType,
                status: 'draft',
                contentHtml: '',
                sections: [],
            },
        });

        // Track event
        await fastify.prisma.metricsEvent.create({
            data: {
                id: uuidv4(),
                lawFirmId,
                userId,
                eventType: 'document_created',
                metadata: { documentId: document.id, documentType: body.documentType },
            },
        });

        return reply.status(201).send(document);
    });

    // ================================
    // GET /api/documents - List documents
    // ================================
    fastify.get('/', async (request: any, reply: FastifyReply) => {
        const lawFirmId = request.user.lawFirmId;
        const query = paginationSchema.parse(request.query);
        const { page, limit, sortBy, sortOrder } = query;

        const caseId = (request.query as any).caseId;
        const status = (request.query as any).status;

        const where: any = {
            case: { lawFirmId },
        };

        if (caseId) {
            where.caseId = caseId;
        }

        if (status) {
            where.status = status;
        }

        const [documents, total] = await Promise.all([
            fastify.prisma.legalDocument.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy || 'createdAt']: sortOrder },
                include: {
                    case: {
                        select: { id: true, clientName: true, caseType: true },
                    },
                    _count: {
                        select: { versions: true },
                    },
                },
            }),
            fastify.prisma.legalDocument.count({ where }),
        ]);

        return {
            data: documents,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    });

    // ================================
    // GET /api/documents/:id - Get single document
    // ================================
    fastify.get('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;

        const document = await fastify.prisma.legalDocument.findFirst({
            where: {
                id,
                case: { lawFirmId },
            },
            include: {
                case: true,
                versions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!document) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Documento não encontrado',
            });
        }

        return document;
    });

    // ================================
    // PATCH /api/documents/:id - Update document
    // ================================
    fastify.patch('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;
        const userId = request.user.id;
        const body = updateDocumentSchema.parse(request.body);

        // Verify document belongs to law firm
        const existingDoc = await fastify.prisma.legalDocument.findFirst({
            where: {
                id,
                case: { lawFirmId },
            },
        });

        if (!existingDoc) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Documento não encontrado',
            });
        }

        // If updating content, create a version snapshot first
        if (body.contentHtml && existingDoc.contentHtml) {
            await fastify.prisma.documentVersion.create({
                data: {
                    id: uuidv4(),
                    documentId: id,
                    contentHtml: existingDoc.contentHtml,
                    createdBy: userId,
                },
            });
        }

        const updatedDoc = await fastify.prisma.legalDocument.update({
            where: { id },
            data: body,
        });

        return updatedDoc;
    });

    // ================================
    // POST /api/documents/:id/versions - Create version snapshot
    // ================================
    fastify.post('/:id/versions', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;
        const userId = request.user.id;

        const document = await fastify.prisma.legalDocument.findFirst({
            where: {
                id,
                case: { lawFirmId },
            },
        });

        if (!document) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Documento não encontrado',
            });
        }

        const version = await fastify.prisma.documentVersion.create({
            data: {
                id: uuidv4(),
                documentId: id,
                contentHtml: document.contentHtml,
                createdBy: userId,
            },
        });

        return reply.status(201).send(version);
    });

    // ================================
    // GET /api/documents/:id/versions - List versions
    // ================================
    fastify.get('/:id/versions', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;
        const query = paginationSchema.parse(request.query);

        // Verify document belongs to law firm
        const document = await fastify.prisma.legalDocument.findFirst({
            where: {
                id,
                case: { lawFirmId },
            },
        });

        if (!document) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Documento não encontrado',
            });
        }

        const [versions, total] = await Promise.all([
            fastify.prisma.documentVersion.findMany({
                where: { documentId: id },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            }),
            fastify.prisma.documentVersion.count({ where: { documentId: id } }),
        ]);

        return {
            data: versions,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    });

    // ================================
    // POST /api/documents/export - Export document
    // ================================
    fastify.post('/export', async (request: any, reply: FastifyReply) => {
        const body = exportDocumentSchema.parse(request.body);
        const lawFirmId = request.user.lawFirmId;
        const userId = request.user.id;

        const document = await fastify.prisma.legalDocument.findFirst({
            where: {
                id: body.documentId,
                case: { lawFirmId },
            },
            include: {
                case: true,
            },
        });

        if (!document) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Documento não encontrado',
            });
        }

        // Track export event
        await fastify.prisma.metricsEvent.create({
            data: {
                id: uuidv4(),
                lawFirmId,
                userId,
                eventType: 'document_exported',
                metadata: {
                    documentId: document.id,
                    format: body.format,
                },
            },
        });

        // TODO: Implement actual export logic
        // For now, return a placeholder response
        // In production, this would:
        // 1. Convert HTML to PDF/DOCX using appropriate library
        // 2. Upload to storage (Supabase Storage/S3)
        // 3. Return signed download URL

        const fileName = `${document.title.replace(/\s+/g, '_')}_${Date.now()}.${body.format}`;

        return {
            downloadUrl: `https://storage.example.com/documents/${fileName}`,
            fileName,
            message: 'Exportação em desenvolvimento. Configure STORAGE_BUCKET_URL para habilitar.',
        };
    });

    // ================================
    // DELETE /api/documents/:id - Delete document
    // ================================
    fastify.delete('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;

        const document = await fastify.prisma.legalDocument.findFirst({
            where: {
                id,
                case: { lawFirmId },
            },
        });

        if (!document) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Documento não encontrado',
            });
        }

        await fastify.prisma.legalDocument.delete({
            where: { id },
        });

        return { message: 'Documento excluído com sucesso' };
    });
}
