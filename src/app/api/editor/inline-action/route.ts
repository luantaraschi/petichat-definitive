import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inlineActionSchema } from "@/schemas/editor";
import { handleApiError } from "@/lib/api/error";
import { randomUUID } from "crypto";

// Mock AI responses for each action type
const mockResponses: Record<string, (text: string) => string> = {
  rewrite: (text) =>
    `[Reescrito] ${text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}. Esta versão apresenta a mesma ideia de forma mais clara e objetiva.`,
  expand: (text) =>
    `${text} Ademais, cumpre destacar que tal entendimento encontra respaldo na doutrina majoritária e na jurisprudência consolidada dos tribunais superiores, sendo certo que a interpretação sistemática do ordenamento jurídico corrobora a tese aqui defendida.`,
  shorten: (text) => {
    const words = text.split(" ");
    return words.slice(0, Math.ceil(words.length / 2)).join(" ") + ".";
  },
  formalize: (text) =>
    `Destarte, ${text.toLowerCase().replace(/\./g, "")}. Neste diapasão, impende salientar que tal assertiva encontra amparo legal e jurisprudencial.`,
  cite: (text) =>
    `${text} (STJ, REsp nº 1.234.567/SP, Rel. Min. Fulano de Tal, 3ª Turma, j. 15/05/2023, DJe 20/05/2023).`,
  create_topic: (text) =>
    `**DO DIREITO APLICÁVEL**\n\n${text}\n\nAssim sendo, resta demonstrado o direito que assiste à parte autora.`,
  create_claims: (text) =>
    `**DOS PEDIDOS**\n\nAnte o exposto, requer:\n\na) ${text};\n\nb) A condenação da parte ré ao pagamento das custas processuais e honorários advocatícios;\n\nc) A produção de todas as provas em direito admitidas.`,
};

// POST /api/editor/inline-action - Execute AI inline action
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await req.json();
    const validated = inlineActionSchema.parse(body);

    // Generate mock AI response
    const responseGenerator = mockResponses[validated.action];
    if (!responseGenerator) {
      throw new Error("NOT_FOUND");
    }

    const actionId = randomUUID();
    const result = responseGenerator(validated.text);

    // Log AI action
    await prisma.auditLog.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        action: `editor.${validated.action}`,
        entityType: "Document",
        entityId: validated.context?.caseId,
        metadata: {
          action: validated.action,
          inputLength: validated.text.length,
          outputLength: result.length,
        },
        aiModel: "mock",
        tokensInput: Math.ceil(validated.text.length / 4),
        tokensOutput: Math.ceil(result.length / 4),
        estimatedCost: 0.001,
      },
    });

    return NextResponse.json({
      actionId,
      action: validated.action,
      original: validated.text,
      result,
      preview: true, // Always preview first, never auto-apply
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
    });
  } catch (error) {
    return handleApiError(error);
  }
}
