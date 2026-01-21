import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDocumentSchema } from "@/schemas/document";
import { handleApiError } from "@/lib/api/error";
import { randomUUID } from "crypto";
import type { Prisma } from "@/generated/prisma";

// POST /api/documents/generate - Queue document generation job
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await req.json();
    const validated = generateDocumentSchema.parse(body);

    // Verify case belongs to user's organization
    const existingCase = await prisma.case.findFirst({
      where: {
        id: validated.caseId,
        organizationId: session.user.organizationId,
      },
      include: {
        template: true,
        theses: true,
      },
    });

    if (!existingCase) {
      throw new Error("NOT_FOUND");
    }

    // In production, this would queue a BullMQ job
    // For now, create a mock document directly
    const jobId = randomUUID();
    const documentVersion =
      (await prisma.document.count({
        where: { caseId: validated.caseId },
      })) + 1;

    // Create document record
    const documentContent: Prisma.InputJsonValue = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `${existingCase.clientName || "AUTOR"}, qualificação completa, vem respeitosamente à presença de Vossa Excelência propor a presente`,
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: existingCase.template?.name || "PETIÇÃO INICIAL" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "em face de RÉU, pelos fatos e fundamentos a seguir expostos.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "I - DOS FATOS" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: existingCase.facts || "[Descreva os fatos do caso]",
            },
          ],
        },
      ],
    };

    const document = await prisma.document.create({
      data: {
        caseId: validated.caseId,
        organizationId: session.user.organizationId,
        userId: session.user.id,
        title: existingCase.template?.name || "Petição Inicial",
        version: documentVersion,
        content: documentContent,
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: validated.caseId },
      data: {
        status: "EDITING",
        currentStep: 6,
        completedSteps: { push: 5 },
      },
    });

    // Log document generation
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "document.generate",
        entityType: "Document",
        entityId: document.id,
        metadata: {
          caseId: validated.caseId,
          format: validated.format,
          version: documentVersion,
        },
        aiModel: "mock",
        tokensInput: 1000,
        tokensOutput: 2000,
        estimatedCost: 0.05,
      },
    });

    return NextResponse.json({
      jobId,
      status: "completed", // In production: "queued"
      document: {
        id: document.id,
        version: document.version,
        createdAt: document.createdAt,
      },
      message: "Documento gerado com sucesso",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
