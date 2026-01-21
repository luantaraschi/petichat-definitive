import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCaseSchema } from "@/schemas/case";
import { handleApiError, apiError } from "@/lib/api/error";

// POST /api/cases - Create a new case
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await req.json();
    const validated = createCaseSchema.parse(body);

    const newCase = await prisma.case.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        templateId: validated.templateId,
        title: validated.title,
        clientName: validated.clientName,
        tribunal: validated.tribunal,
        foro: validated.foro,
        status: "DRAFT",
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "case.create",
        entityType: "Case",
        entityId: newCase.id,
        metadata: { templateId: validated.templateId },
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/cases - List user's cases
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const cases = await prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    return handleApiError(error);
  }
}
