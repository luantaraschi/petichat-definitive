// ================================
// Cases Routes
// ================================

import type { FastifyInstance, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { createCaseSchema, updateCaseSchema, paginationSchema } from '@petichat/shared';

export async function casesRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', (fastify as any).authenticate);

    // ================================
    // POST /api/cases - Create case
    // ================================
    fastify.post('/', async (request: any, reply: FastifyReply) => {
        const body = createCaseSchema.parse(request.body);
        const userId = request.user.id;
        const lawFirmId = request.user.lawFirmId;

        if (!lawFirmId) {
            return reply.status(400).send({
                error: 'No law firm',
                message: 'Usuário não está associado a um escritório',
            });
        }

        const newCase = await fastify.prisma.case.create({
            data: {
                id: uuidv4(),
                lawFirmId,
                userId,
                clientName: body.clientName,
                caseType: body.caseType,
                factsDescription: body.factsDescription,
                metadata: (body.metadata || {}) as any,
                status: 'draft',
            },
        });

        // Track event
        await fastify.prisma.metricsEvent.create({
            data: {
                id: uuidv4(),
                lawFirmId,
                userId,
                eventType: 'case_created',
                metadata: { caseId: newCase.id, caseType: body.caseType },
            },
        });

        return reply.status(201).send(newCase);
    });

    // ================================
    // GET /api/cases - List cases
    // ================================
    fastify.get('/', async (request: any, _reply: FastifyReply) => {
        const lawFirmId = request.user.lawFirmId;
        const query = paginationSchema.parse(request.query);
        const { page, limit, sortBy, sortOrder } = query;

        // Parse filters from query
        const status = (request.query as any).status;
        const search = (request.query as any).search;

        const where: any = { lawFirmId };

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { clientName: { contains: search, mode: 'insensitive' } },
                { caseType: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [cases, total] = await Promise.all([
            fastify.prisma.case.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy || 'createdAt']: sortOrder },
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                    _count: {
                        select: { legalDocuments: true },
                    },
                },
            }),
            fastify.prisma.case.count({ where }),
        ]);

        return {
            data: cases,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    });

    // ================================
    // GET /api/cases/:id - Get single case
    // ================================
    fastify.get('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;

        const caseData = await fastify.prisma.case.findFirst({
            where: { id, lawFirmId },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                legalDocuments: {
                    orderBy: { createdAt: 'desc' },
                },
                theses: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });

        if (!caseData) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Caso não encontrado',
            });
        }

        return caseData;
    });

    // ================================
    // PATCH /api/cases/:id - Update case
    // ================================
    fastify.patch('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;
        const body = updateCaseSchema.parse(request.body);

        // Verify case belongs to law firm
        const existingCase = await fastify.prisma.case.findFirst({
            where: { id, lawFirmId },
        });

        if (!existingCase) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Caso não encontrado',
            });
        }

        const updatedCase = await fastify.prisma.case.update({
            where: { id },
            data: body as any,
        });

        return updatedCase;
    });

    // ================================
    // DELETE /api/cases/:id - Delete case
    // ================================
    fastify.delete('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const lawFirmId = request.user.lawFirmId;

        // Verify case belongs to law firm
        const existingCase = await fastify.prisma.case.findFirst({
            where: { id, lawFirmId },
        });

        if (!existingCase) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Caso não encontrado',
            });
        }

        await fastify.prisma.case.delete({
            where: { id },
        });

        return { message: 'Caso excluído com sucesso' };
    });
}
