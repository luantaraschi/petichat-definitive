import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCaseSchema } from "@/schemas/case";
import { handleApiError } from "@/lib/api/error";
import type { Prisma } from "@/generated/prisma";

// GET /api/cases/:id - Get a specific case
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;

    const caseData = await prisma.case.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        template: true,
        theses: true,
        citations: {
          include: {
            chunk: {
              include: {
                jurisprudence: true,
              },
            },
          },
        },
        documents: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!caseData) {
      throw new Error("NOT_FOUND");
    }

    return NextResponse.json(caseData);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/cases/:id - Update a case
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateCaseSchema.parse(body);

    // Verify case belongs to user's organization
    const existingCase = await prisma.case.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingCase) {
      throw new Error("NOT_FOUND");
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: validated as Prisma.CaseUpdateInput,
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    return handleApiError(error);
  }
}
