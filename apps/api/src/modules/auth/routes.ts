// ================================
// Authentication Routes
// ================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, refreshTokenSchema } from '@petichat/shared';

export async function authRoutes(fastify: FastifyInstance) {
    // ================================
    // POST /api/auth/register
    // ================================
    fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = registerSchema.parse(request.body);
        const { email, password, name, lawFirmName } = body;

        // Check if user already exists
        const existingUser = await fastify.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return reply.status(400).send({
                error: 'User exists',
                message: 'Este email já está cadastrado',
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create law firm and user in transaction
        const result = await fastify.prisma.$transaction(async (tx: any) => {
            // Create law firm
            const lawFirm = await tx.lawFirm.create({
                data: {
                    id: uuidv4(),
                    name: lawFirmName,
                    subscriptionPlan: 'trial',
                },
            });

            // Create user
            const user = await tx.user.create({
                data: {
                    id: uuidv4(),
                    email,
                    passwordHash,
                    name,
                    role: 'owner',
                },
            });

            // Link user to law firm
            await tx.userLawFirm.create({
                data: {
                    id: uuidv4(),
                    userId: user.id,
                    lawFirmId: lawFirm.id,
                    role: 'owner',
                },
            });

            return { user, lawFirm };
        });

        // Generate tokens
        const accessToken = fastify.jwt.sign({
            id: result.user.id,
            email: result.user.email,
            lawFirmId: result.lawFirm.id,
        });

        const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const refreshToken = jwt.sign(
            { id: result.user.id, type: 'refresh' },
            fastify.jwtRefreshSecret,
            { expiresIn: refreshTokenExpiresIn as any }
        );

        // Store refresh token in Redis (with TTL of 7 days)
        await fastify.redis.setex(
            `refresh:${result.user.id}:${refreshToken.slice(-16)}`,
            7 * 24 * 60 * 60,
            refreshToken
        );

        return reply.status(201).send({
            accessToken,
            refreshToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                lawFirmId: result.lawFirm.id,
            },
        });
    });

    // ================================
    // POST /api/auth/login
    // ================================
    fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = loginSchema.parse(request.body);
        const { email, password } = body;

        // Find user
        const user = await fastify.prisma.user.findUnique({
            where: { email },
            include: {
                userLawFirms: {
                    include: { lawFirm: true },
                },
            },
        });

        if (!user) {
            return reply.status(401).send({
                error: 'Invalid credentials',
                message: 'Email ou senha incorretos',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return reply.status(401).send({
                error: 'Invalid credentials',
                message: 'Email ou senha incorretos',
            });
        }

        const lawFirm = user.userLawFirms[0]?.lawFirm;

        // Generate tokens
        const accessToken = fastify.jwt.sign({
            id: user.id,
            email: user.email,
            lawFirmId: lawFirm?.id,
        });

        const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            fastify.jwtRefreshSecret,
            { expiresIn: refreshTokenExpiresIn as any }
        );

        // Store refresh token in Redis
        await fastify.redis.setex(
            `refresh:${user.id}:${refreshToken.slice(-16)}`,
            7 * 24 * 60 * 60,
            refreshToken
        );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                lawFirmId: lawFirm?.id,
            },
        };
    });

    // ================================
    // POST /api/auth/refresh
    // ================================
    fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = refreshTokenSchema.parse(request.body);
        const { refreshToken } = body;

        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, fastify.jwtRefreshSecret) as {
                id: string;
                type: string;
            };

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            // Check if token exists in Redis
            const storedToken = await fastify.redis.get(
                `refresh:${decoded.id}:${refreshToken.slice(-16)}`
            );

            if (!storedToken || storedToken !== refreshToken) {
                return reply.status(401).send({
                    error: 'Invalid token',
                    message: 'Refresh token inválido ou expirado',
                });
            }

            // Get user
            const user = await fastify.prisma.user.findUnique({
                where: { id: decoded.id },
                include: {
                    userLawFirms: {
                        include: { lawFirm: true },
                    },
                },
            });

            if (!user) {
                return reply.status(401).send({
                    error: 'User not found',
                    message: 'Usuário não encontrado',
                });
            }

            const lawFirm = user.userLawFirms[0]?.lawFirm;

            // Generate new access token
            const accessToken = fastify.jwt.sign({
                id: user.id,
                email: user.email,
                lawFirmId: lawFirm?.id,
            });

            return {
                accessToken,
                refreshToken, // Return same refresh token
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    lawFirmId: lawFirm?.id,
                },
            };
        } catch (error) {
            return reply.status(401).send({
                error: 'Invalid token',
                message: 'Refresh token inválido ou expirado',
            });
        }
    });

    // ================================
    // POST /api/auth/logout
    // ================================
    fastify.post('/logout', {
        onRequest: [(fastify as any).authenticate],
        handler: async (request: any, _reply: FastifyReply) => {
            const userId = request.user.id;

            // Delete all refresh tokens for this user
            const keys = await fastify.redis.keys(`refresh:${userId}:*`);
            if (keys.length > 0) {
                await fastify.redis.del(...keys);
            }

            return { message: 'Logout realizado com sucesso' };
        },
    });
}
