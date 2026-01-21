import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triageSchema } from "@/schemas/case";
import { handleApiError } from "@/lib/api/error";

// POST /api/cases/:id/triage - Submit triage responses
export async function POST(
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
    const validated = triageSchema.parse(body);

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

    // Update case with triage responses
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        triageResponses: validated.responses,
        status: "THESES",
        currentStep: 4,
        completedSteps: { push: 2 },
      },
    });

    // In production, this would trigger AI to generate follow-up questions
    // For now, return mock next questions
    const mockNextQuestions = [
      {
        id: "q1",
        question: "O contrato foi celebrado por escrito?",
        type: "boolean",
      },
      {
        id: "q2",
        question: "Qual o valor aproximado do débito?",
        type: "number",
      },
    ];

    return NextResponse.json({
      case: updatedCase,
      nextQuestions: mockNextQuestions,
      completed: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
