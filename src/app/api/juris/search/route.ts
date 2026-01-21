import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jurisSearchSchema } from "@/schemas/jurisprudence";
import { handleApiError } from "@/lib/api/error";

// POST /api/juris/search - Search jurisprudence (mock hybrid search)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await req.json();
    const validated = jurisSearchSchema.parse(body);

    // In production, this would perform hybrid search (FTS + vector)
    // For now, return mock results
    const mockResults = [
      {
        id: "juris-1",
        tribunal: "STJ",
        numero: "REsp 1.234.567/SP",
        dataJulgamento: "2023-05-15",
        relator: "Min. Fulano de Tal",
        orgaoJulgador: "3a Turma",
        ementa:
          "CIVIL. RESPONSABILIDADE CIVIL. DANOS MORAIS. QUANTUM INDENIZATÓRIO. O valor da indenização por danos morais deve ser fixado com moderação, considerando as circunstâncias do caso concreto.",
        fonte: "DJe 20/05/2023",
        linkOriginal: "https://www.stj.jus.br/",
        relevanceScore: 0.95,
        chunks: [
          {
            id: "chunk-1",
            content:
              "O quantum indenizatório deve observar os princípios da razoabilidade e proporcionalidade, evitando-se o enriquecimento sem causa.",
            position: 1,
          },
        ],
      },
      {
        id: "juris-2",
        tribunal: "STJ",
        numero: "REsp 987.654/RJ",
        dataJulgamento: "2023-03-10",
        relator: "Min. Ciclano de Tal",
        orgaoJulgador: "4a Turma",
        ementa:
          "PROCESSUAL CIVIL. RECURSO ESPECIAL. DANOS MATERIAIS. COMPROVAÇÃO. A indenização por danos materiais exige prova inequívoca do prejuízo sofrido.",
        fonte: "DJe 15/03/2023",
        linkOriginal: "https://www.stj.jus.br/",
        relevanceScore: 0.87,
        chunks: [
          {
            id: "chunk-2",
            content:
              "Os danos materiais devem ser comprovados por documentos idôneos, não se admitindo presunções.",
            position: 1,
          },
        ],
      },
      {
        id: "juris-3",
        tribunal: "TJSP",
        numero: "AC 1000001-00.2023.8.26.0100",
        dataJulgamento: "2023-08-22",
        relator: "Des. Beltrano Silva",
        orgaoJulgador: "10a Câmara de Direito Privado",
        ementa:
          "CONTRATO. INADIMPLEMENTO. RESOLUÇÃO CONTRATUAL. Verificado o inadimplemento substancial, impõe-se a resolução do contrato com a devolução dos valores pagos.",
        fonte: "DJe 25/08/2023",
        relevanceScore: 0.82,
        chunks: [
          {
            id: "chunk-3",
            content:
              "O inadimplemento substancial autoriza a parte prejudicada a pleitear a resolução do contrato.",
            position: 1,
          },
        ],
      },
    ];

    // Log search for audit
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: "juris.search",
        entityType: "Jurisprudence",
        metadata: {
          query: validated.query,
          tribunal: validated.tribunal,
          resultsCount: mockResults.length,
        },
      },
    });

    return NextResponse.json({
      results: mockResults,
      total: mockResults.length,
      query: validated.query,
      filters: {
        tribunal: validated.tribunal,
        area: validated.area,
        dataInicio: validated.dataInicio,
        dataFim: validated.dataFim,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
