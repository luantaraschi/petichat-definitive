// ================================
// Metrics Routes
// ================================

import type { FastifyInstance, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { trackEventSchema } from '@petichat/shared';

export async function metricsRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', (fastify as any).authenticate);

    // ================================
    // POST /api/metrics/track
    // ================================
    fastify.post('/track', async (request: any, reply: FastifyReply) => {
        const body = trackEventSchema.parse(request.body);
        const userId = request.user.id;
        const lawFirmId = request.user.lawFirmId;

        if (!lawFirmId) {
            return reply.status(400).send({
                error: 'No law firm',
                message: 'Usuário não está associado a um escritório',
            });
        }

        await fastify.prisma.metricsEvent.create({
            data: {
                id: uuidv4(),
                lawFirmId,
                userId,
                eventType: body.eventType,
                metadata: body.metadata || {},
            },
        });

        return { success: true };
    });

    // ================================
    // GET /api/metrics/dashboard
    // ================================
    fastify.get('/dashboard', async (request: any, reply: FastifyReply) => {
        const lawFirmId = request.user.lawFirmId;

        if (!lawFirmId) {
            return reply.status(400).send({
                error: 'No law firm',
                message: 'Usuário não está associado a um escritório',
            });
        }

        // Get date ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Aggregate metrics
        const [
            totalCases,
            totalDocuments,
            documentsLast30Days,
            documentsByType,
            aiUsage,
            recentDocuments,
        ] = await Promise.all([
            // Total cases
            fastify.prisma.case.count({
                where: { lawFirmId },
            }),

            // Total documents
            fastify.prisma.legalDocument.count({
                where: { case: { lawFirmId } },
            }),

            // Documents created last 30 days
            fastify.prisma.legalDocument.count({
                where: {
                    case: { lawFirmId },
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),

            // Documents by type
            fastify.prisma.legalDocument.groupBy({
                by: ['documentType'],
                where: { case: { lawFirmId } },
                _count: { id: true },
            }),

            // AI usage last 7 days
            fastify.prisma.aILog.aggregate({
                where: {
                    user: { userLawFirms: { some: { lawFirmId } } },
                    createdAt: { gte: sevenDaysAgo },
                },
                _sum: {
                    promptTokens: true,
                    completionTokens: true,
                },
                _count: { id: true },
            }),

            // Recent documents
            fastify.prisma.legalDocument.findMany({
                where: { case: { lawFirmId } },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    case: {
                        select: { clientName: true },
                    },
                },
            }),
        ]);

        // Estimate time saved (rough calculation: 2 hours per document)
        const timeSavedMinutes = totalDocuments * 120;

        return {
            overview: {
                totalCases,
                totalDocuments,
                documentsLast30Days,
                timeSavedMinutes,
                timeSavedFormatted: `${Math.floor(timeSavedMinutes / 60)}h ${timeSavedMinutes % 60}min`,
            },
            documentsByType: documentsByType.map((d) => ({
                type: d.documentType,
                count: d._count.id,
            })),
            aiUsage: {
                callsLast7Days: aiUsage._count.id,
                tokensUsed: (aiUsage._sum.promptTokens || 0) + (aiUsage._sum.completionTokens || 0),
            },
            recentDocuments: recentDocuments.map((d) => ({
                id: d.id,
                title: d.title,
                documentType: d.documentType,
                status: d.status,
                clientName: d.case.clientName,
                createdAt: d.createdAt,
            })),
        };
    });

    // ================================
    // GET /api/metrics/usage
    // ================================
    fastify.get('/usage', async (request: any, reply: FastifyReply) => {
        const lawFirmId = request.user.lawFirmId;

        if (!lawFirmId) {
            return reply.status(400).send({
                error: 'No law firm',
                message: 'Usuário não está associado a um escritório',
            });
        }

        // Get current subscription
        const lawFirm = await fastify.prisma.lawFirm.findUnique({
            where: { id: lawFirmId },
        });

        if (!lawFirm) {
            return reply.status(404).send({
                error: 'Not found',
                message: 'Escritório não encontrado',
            });
        }

        // Define limits based on plan
        const planLimits: Record<string, { documents: number; aiCalls: number }> = {
            trial: { documents: 5, aiCalls: 50 },
            basic: { documents: 50, aiCalls: 500 },
            pro: { documents: 500, aiCalls: 5000 },
            enterprise: { documents: -1, aiCalls: -1 }, // Unlimited
        };

        const limits = planLimits[lawFirm.subscriptionPlan] || planLimits.trial;

        // Get current usage this month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const now = new Date();

        const [documentsThisMonth, aiCallsThisMonth] = await Promise.all([
            fastify.prisma.legalDocument.count({
                where: {
                    case: { lawFirmId },
                    createdAt: { gte: firstDayOfMonth },
                },
            }),
            fastify.prisma.aILog.count({
                where: {
                    user: { userLawFirms: { some: { lawFirmId } } },
                    createdAt: { gte: firstDayOfMonth },
                },
            }),
        ]);

        return {
            plan: lawFirm.subscriptionPlan,
            usage: {
                documents: documentsThisMonth,
                aiCalls: aiCallsThisMonth,
            },
            limits: {
                documents: limits.documents,
                aiCalls: limits.aiCalls,
            },
            isUnlimited: lawFirm.subscriptionPlan === 'enterprise',
        };
    });
}
