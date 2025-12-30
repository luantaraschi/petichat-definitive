// ================================
// PetiChat API Server Entry Point
// ================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Import routes
import { authRoutes } from './modules/auth/routes';
import { casesRoutes } from './modules/cases/routes';
import { documentsRoutes } from './modules/documents/routes';
import { aiRoutes } from './modules/ai/routes';
import { jurisprudenceRoutes } from './modules/jurisprudence/routes';
import { metricsRoutes } from './modules/metrics/routes';

// Environment variables
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const HOST = process.env.API_HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ================================
// Initialize Services
// ================================

// Prisma Client
export const prisma = new PrismaClient({
    log: LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Redis Client
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

// ================================
// Create Fastify Instance
// ================================

const fastify = Fastify({
    logger: {
        level: LOG_LEVEL,
        transport:
            process.env.NODE_ENV !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: { colorize: true },
                }
                : undefined,
    },
});

// ================================
// Register Plugins
// ================================

async function registerPlugins() {
    // Security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: false,
    });

    // CORS
    await fastify.register(cors, {
        origin: CORS_ORIGIN,
        credentials: true,
    });

    // JWT Authentication
    await fastify.register(jwt, {
        secret: JWT_SECRET,
        sign: {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        },
    });

    // Rate limiting (using Redis for distributed systems)
    await fastify.register(rateLimit, {
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        redis,
    });
}

// ================================
// Decorate Fastify with Services
// ================================

fastify.decorate('prisma', prisma);
fastify.decorate('redis', redis);
fastify.decorate('jwtRefreshSecret', JWT_REFRESH_SECRET);

// ================================
// Authentication Hook
// ================================

fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ error: 'Unauthorized', message: 'Token inválido ou expirado' });
    }
});

// ================================
// Register Routes
// ================================

async function registerRoutes() {
    // Health check
    fastify.get('/api/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // API Routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(casesRoutes, { prefix: '/api/cases' });
    await fastify.register(documentsRoutes, { prefix: '/api/documents' });
    await fastify.register(aiRoutes, { prefix: '/api/ai' });
    await fastify.register(jurisprudenceRoutes, { prefix: '/api/jurisprudence' });
    await fastify.register(metricsRoutes, { prefix: '/api/metrics' });

    // User profile endpoint
    fastify.get('/api/me', {
        onRequest: [(fastify as any).authenticate],
        handler: async (request: any) => {
            const userId = request.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    userLawFirms: {
                        include: {
                            lawFirm: true,
                        },
                    },
                },
            });

            if (!user) {
                return { error: 'User not found' };
            }

            return {
                ...user,
                lawFirm: user.userLawFirms[0]?.lawFirm || null,
            };
        },
    });
}

// ================================
// Error Handler
// ================================

fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    // Zod validation errors
    if (error.name === 'ZodError') {
        return reply.status(400).send({
            error: 'Validation Error',
            message: 'Dados inválidos',
            details: error,
        });
    }

    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        return reply.status(400).send({
            error: 'Database Error',
            message: 'Erro ao processar requisição no banco de dados',
        });
    }

    // Default error
    return reply.status(error.statusCode || 500).send({
        error: error.name || 'Internal Server Error',
        message: error.message || 'Erro interno do servidor',
    });
});

// ================================
// Graceful Shutdown
// ================================

const gracefulShutdown = async () => {
    fastify.log.info('Shutting down gracefully...');

    await fastify.close();
    await prisma.$disconnect();
    await redis.quit();

    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ================================
// Start Server
// ================================

async function start() {
    try {
        // Validate critical environment variables
        const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'];
        const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

        if (missingVars.length > 0) {
            fastify.log.error(`Missing critical environment variables: ${missingVars.join(', ')}`);
            process.exit(1);
        }

        // Connect to Redis
        await redis.connect();
        fastify.log.info('Connected to Redis');

        // Connect to Database
        await prisma.$connect();
        fastify.log.info('Connected to PostgreSQL');

        // Register plugins and routes
        await registerPlugins();
        await registerRoutes();

        // Start listening
        await fastify.listen({ port: PORT, host: HOST });
        fastify.log.info(`Server running at http://${HOST}:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();

// ================================
// Type Declarations
// ================================

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        redis: Redis;
        jwtRefreshSecret: string;
        authenticate: any;
    }
}
