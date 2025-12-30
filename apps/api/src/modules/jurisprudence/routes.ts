// ================================
// Jurisprudence Routes
// ================================

import type { FastifyInstance, FastifyReply } from 'fastify';
import { searchJurisprudenceSchema } from '@petichat/shared';

export async function jurisprudenceRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', (fastify as any).authenticate);

    // ================================
    // POST /api/jurisprudence/search
    // ================================
    fastify.post('/search', async (request: any, _reply: FastifyReply) => {
        const body = searchJurisprudenceSchema.parse(request.body);
        const { keywords, tribunal, year, page, limit } = body;

        // Build where clause
        const where: any = {};

        // Full-text search on summary and fullText
        // Note: For production, consider using PostgreSQL full-text search or pgvector
        if (keywords) {
            where.OR = [
                { summary: { contains: keywords, mode: 'insensitive' } },
                { fullText: { contains: keywords, mode: 'insensitive' } },
            ];
        }

        if (tribunal) {
            where.tribunal = { contains: tribunal, mode: 'insensitive' };
        }

        if (year) {
            where.decisionDate = {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            };
        }

        const [results, total] = await Promise.all([
            fastify.prisma.jurisprudence.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { decisionDate: 'desc' },
                select: {
                    id: true,
                    tribunal: true,
                    processNumber: true,
                    decisionDate: true,
                    summary: true,
                    externalLink: true,
                    createdAt: true,
                },
            }),
            fastify.prisma.jurisprudence.count({ where }),
        ]);

        return {
            results,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    });

    // ================================
    // GET /api/jurisprudence/:id
    // ================================
    fastify.get('/:id', async (request: any, reply: FastifyReply) => {
        const { id } = request.params as { id: string };

        const jurisprudence = await fastify.prisma.jurisprudence.findUnique({
            where: { id },
        });

        if (!jurisprudence) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Jurisprudência não encontrada',
            });
        }

        return jurisprudence;
    });

    // ================================
    // GET /api/jurisprudence/tribunals - List available tribunals
    // ================================
    fastify.get('/tribunals/list', async (_request: any, _reply: FastifyReply) => {
        const tribunals = await fastify.prisma.jurisprudence.findMany({
            select: { tribunal: true },
            distinct: ['tribunal'],
            orderBy: { tribunal: 'asc' },
        });

        return {
            tribunals: tribunals.map((t: { tribunal: string }) => t.tribunal),
        };
    });
}
