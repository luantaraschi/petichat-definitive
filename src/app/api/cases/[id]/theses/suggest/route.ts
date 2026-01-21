import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api/error";

// POST /api/cases/:id/theses/suggest - Get AI-suggested theses
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;

    // Verify case belongs to user's organization
    const existingCase = await prisma.case.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        template: true,
      },
    });

    if (!existingCase) {
      throw new Error("NOT_FOUND");
    }

    // In production, this would call AI to generate theses based on facts
    // For now, return mock suggestions
    const mockSuggestions = [
      {
        id: "thesis-1",
        title: "Da Responsabilidade Civil do Réu",
        content:
          "O réu agiu com culpa ao descumprir suas obrigações contratuais, configurando inadimplemento que enseja a reparação dos danos causados, nos termos dos artigos 186 e 927 do Código Civil.",
        type: "THESIS",
        aiGenerated: true,
      },
      {
        id: "thesis-2",
        title: "Dos Danos Materiais",
        content:
          "Os danos materiais restam comprovados pelos documentos acostados aos autos, totalizando o valor de R$ [valor], que deve ser ressarcido integralmente pelo réu.",
        type: "THESIS",
        aiGenerated: true,
      },
      {
        id: "thesis-3",
        title: "Dos Danos Morais",
        content:
          "A conduta do réu causou abalo à honra e à imagem do autor, configurando dano moral passível de indenização, conforme entendimento consolidado na jurisprudência.",
        type: "THESIS",
        aiGenerated: true,
      },
      {
        id: "claim-1",
        title: "Condenação em Danos Materiais",
        content:
          "Seja o réu condenado ao pagamento de R$ [valor] a título de danos materiais, devidamente corrigido e acrescido de juros legais.",
        type: "CLAIM",
        aiGenerated: true,
      },
      {
        id: "claim-2",
        title: "Condenação em Danos Morais",
        content:
          "Seja o réu condenado ao pagamento de indenização por danos morais em valor a ser arbitrado por Vossa Excelência.",
        type: "CLAIM",
        aiGenerated: true,
      },
    ];

    // Log AI usage
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "ai.suggest_theses",
        entityType: "Case",
        entityId: id,
        aiModel: "mock",
        tokensInput: 500,
        tokensOutput: 1000,
        estimatedCost: 0.01,
      },
    });

    return NextResponse.json({
      suggestions: mockSuggestions,
      caseId: id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
