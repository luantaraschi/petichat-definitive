import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/auth";
import type { PrismaClient } from "@/generated/prisma";

type TransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Dados inválidos", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { code: "USER_EXISTS", message: "Este email já está em uso" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user and default organization
    const user = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: `${name}'s Organization`,
          slug: `${email.split("@")[0]}-${Date.now()}`,
          plan: "FREE",
        },
      });

      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      });

      // Create membership
      await tx.membership.create({
        data: {
          userId: newUser.id,
          organizationId: org.id,
          role: "OWNER",
        },
      });

      return newUser;
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}
