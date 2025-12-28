// ================================
// AI Service - Provider Interface & Implementations
// ================================
// This module provides a pluggable AI provider system.
// Configure AI_PROVIDER env var to switch between providers.
// API keys are read from environment variables.

import OpenAI from 'openai';
import { z } from 'zod';
import { aiThesisResponseSchema, aiDocumentResponseSchema } from '@petichat/shared';

// ================================
// Types & Interfaces
// ================================

export interface ThesisOptions {
    documentType?: string;
    area?: string;
    maxTheses?: number;
}

export interface ThesisResult {
    category: 'preliminares' | 'merito';
    title: string;
    content: string;
}

export interface GenerateContext {
    facts: string;
    documentType: string;
    theses: ThesisResult[];
    jurisprudences: JurisprudenceContext[];
    clientName?: string;
    caseType?: string;
}

export interface JurisprudenceContext {
    tribunal: string;
    processNumber: string;
    summary: string;
}

export interface GeneratedDocument {
    title: string;
    contentHtml: string;
    sections: DocumentSection[];
}

export interface DocumentSection {
    type: string;
    title: string;
    content: string;
}

export interface AIProvider {
    suggestTheses(facts: string, options?: ThesisOptions): Promise<ThesisResult[]>;
    generateDocument(context: GenerateContext): Promise<GeneratedDocument>;
    rewriteParagraph(text: string, instruction: string, context?: string): Promise<string>;
}

// ================================
// OpenAI Provider Implementation
// ================================

class OpenAIProvider implements AIProvider {
    private client: OpenAI;
    private model: string;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.warn('⚠️ OPENAI_API_KEY not configured. AI features will not work.');
        }

        this.client = new OpenAI({
            apiKey: apiKey || 'sk-placeholder-configure-your-key',
        });

        this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    }

    async suggestTheses(facts: string, options?: ThesisOptions): Promise<ThesisResult[]> {
        const maxTheses = options?.maxTheses || 6;

        const prompt = `Você é um advogado brasileiro experiente. Analise os fatos abaixo e sugira teses jurídicas.

FATOS DO CASO:
${facts}

${options?.documentType ? `TIPO DE DOCUMENTO: ${options.documentType}` : ''}
${options?.area ? `ÁREA DO DIREITO: ${options.area}` : ''}

Forneça até ${maxTheses} teses jurídicas, divididas entre:
- PRELIMINARES: questões processuais, prescrição, decadência, ilegitimidade, etc.
- MÉRITO: argumentos de direito material

Responda APENAS em formato JSON válido:
{
  "theses": [
    {
      "category": "preliminares" | "merito",
      "title": "Título curto da tese",
      "content": "Desenvolvimento da tese com fundamentos legais (artigos, leis, princípios)"
    }
  ]
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um assistente jurídico especializado em direito brasileiro. Responda sempre em português e em formato JSON válido.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content || '{"theses": []}';
            const parsed = JSON.parse(content);
            const validated = aiThesisResponseSchema.parse(parsed);

            return validated.theses;
        } catch (error) {
            console.error('Error suggesting theses:', error);
            throw new Error('Falha ao gerar sugestões de teses. Verifique a configuração da API.');
        }
    }

    async generateDocument(context: GenerateContext): Promise<GeneratedDocument> {
        const { facts, documentType, theses, jurisprudences, clientName, caseType } = context;

        const thesesText = theses
            .map((t, i) => `${i + 1}. [${t.category.toUpperCase()}] ${t.title}\n${t.content}`)
            .join('\n\n');

        const jurisprudenceText = jurisprudences
            .map((j) => `- ${j.tribunal} - ${j.processNumber}: ${j.summary}`)
            .join('\n');

        const documentTypeLabels: Record<string, string> = {
            petition: 'Petição Inicial',
            contestation: 'Contestação',
            appeal: 'Recurso de Apelação',
            motion: 'Requerimento',
            brief: 'Parecer',
        };

        const docLabel = documentTypeLabels[documentType] || 'Peça Jurídica';

        const prompt = `Você é um advogado brasileiro experiente. Gere uma ${docLabel} completa com base nas informações abaixo.

FATOS DO CASO:
${facts}

${clientName ? `CLIENTE: ${clientName}` : ''}
${caseType ? `TIPO DE AÇÃO: ${caseType}` : ''}

TESES A UTILIZAR:
${thesesText}

${jurisprudenceText ? `JURISPRUDÊNCIAS PARA CITAR:\n${jurisprudenceText}` : ''}

Gere uma ${docLabel} profissional e bem estruturada, incluindo:
1. Endereçamento ao juízo
2. Qualificação das partes
3. Exposição dos fatos
4. Fundamentação jurídica (usando as teses fornecidas)
5. Pedidos
6. Valor da causa (se aplicável)
7. Encerramento

Responda em formato JSON:
{
  "title": "Título do documento",
  "sections": [
    {
      "type": "header|facts|legal_basis|requests|closing",
      "title": "Título da seção",
      "content": "Conteúdo em HTML (use <p>, <strong>, <ul>, <li>)"
    }
  ]
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um assistente jurídico especializado em direito brasileiro. Gere documentos jurídicos profissionais. Responda em JSON válido.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.5,
                max_tokens: 4000,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content || '{"title": "", "sections": []}';
            const parsed = JSON.parse(content);
            const validated = aiDocumentResponseSchema.parse(parsed);

            // Combine sections into HTML
            const contentHtml = validated.sections
                .map((s) => `<section><h2>${s.title}</h2>${s.content}</section>`)
                .join('');

            return {
                title: validated.title,
                contentHtml,
                sections: validated.sections.map((s, i) => ({ ...s, order: i })),
            };
        } catch (error) {
            console.error('Error generating document:', error);
            throw new Error('Falha ao gerar documento. Verifique a configuração da API.');
        }
    }

    async rewriteParagraph(text: string, instruction: string, context?: string): Promise<string> {
        const instructionLabels: Record<string, string> = {
            improve: 'Melhore a redação mantendo o sentido original',
            simplify: 'Simplifique o texto, tornando-o mais direto e claro',
            expand: 'Expanda o texto com mais detalhes e fundamentação',
            formal: 'Torne o texto mais formal e técnico juridicamente',
            custom: instruction,
        };

        const finalInstruction = instructionLabels[instruction] || instruction;

        const prompt = `${finalInstruction}

TEXTO ORIGINAL:
${text}

${context ? `CONTEXTO:\n${context}` : ''}

Reescreva o texto conforme a instrução. Mantenha a essência jurídica e retorne APENAS o texto reescrito, sem explicações.`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um assistente de redação jurídica. Reescreva textos conforme solicitado, mantendo a qualidade profissional.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.6,
                max_tokens: 1000,
            });

            return response.choices[0]?.message?.content || text;
        } catch (error) {
            console.error('Error rewriting paragraph:', error);
            throw new Error('Falha ao reescrever texto. Verifique a configuração da API.');
        }
    }
}

// ================================
// Mock Provider (for development/testing)
// ================================

class MockAIProvider implements AIProvider {
    async suggestTheses(facts: string, options?: ThesisOptions): Promise<ThesisResult[]> {
        // Simulate delay
        await new Promise((r) => setTimeout(r, 1000));

        return [
            {
                category: 'preliminares',
                title: 'Ilegitimidade Passiva',
                content: 'A parte ré não possui legitimidade para figurar no polo passivo da demanda, conforme art. 485, VI do CPC.',
            },
            {
                category: 'preliminares',
                title: 'Prescrição',
                content: 'O direito de ação encontra-se prescrito, nos termos do art. 206, §3º do Código Civil.',
            },
            {
                category: 'merito',
                title: 'Responsabilidade Civil Objetiva',
                content: 'Aplica-se ao caso a responsabilidade civil objetiva, nos termos do art. 14 do CDC.',
            },
            {
                category: 'merito',
                title: 'Dano Moral Configurado',
                content: 'Os fatos narrados configuram dano moral passível de indenização, conforme jurisprudência consolidada.',
            },
        ];
    }

    async generateDocument(context: GenerateContext): Promise<GeneratedDocument> {
        await new Promise((r) => setTimeout(r, 2000));

        const title = `Petição Inicial - ${context.clientName || 'Cliente'}`;

        return {
            title,
            contentHtml: `
        <section>
          <h2>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO</h2>
          <p><strong>${context.clientName || 'CLIENTE'}</strong>, vem, respeitosamente, perante Vossa Excelência, propor a presente AÇÃO...</p>
        </section>
        <section>
          <h2>DOS FATOS</h2>
          <p>${context.facts}</p>
        </section>
        <section>
          <h2>DO DIREITO</h2>
          ${context.theses.map((t) => `<p><strong>${t.title}:</strong> ${t.content}</p>`).join('')}
        </section>
        <section>
          <h2>DOS PEDIDOS</h2>
          <p>Ante o exposto, requer:</p>
          <ul>
            <li>A procedência total dos pedidos;</li>
            <li>A condenação da ré ao pagamento de indenização;</li>
            <li>A condenação em custas e honorários.</li>
          </ul>
        </section>
      `,
            sections: [
                { type: 'header', title: 'Endereçamento', content: '<p>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO</p>' },
                { type: 'facts', title: 'Dos Fatos', content: `<p>${context.facts}</p>` },
                { type: 'legal_basis', title: 'Do Direito', content: '<p>Fundamentação jurídica...</p>' },
                { type: 'requests', title: 'Dos Pedidos', content: '<p>Pedidos...</p>' },
            ],
        };
    }

    async rewriteParagraph(text: string, instruction: string): Promise<string> {
        await new Promise((r) => setTimeout(r, 500));
        return `[Texto reescrito - ${instruction}] ${text}`;
    }
}

// ================================
// AI Service Factory
// ================================

let aiProviderInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
    if (aiProviderInstance) {
        return aiProviderInstance;
    }

    const provider = process.env.AI_PROVIDER || 'openai';

    switch (provider) {
        case 'openai':
            aiProviderInstance = new OpenAIProvider();
            break;
        case 'mock':
            aiProviderInstance = new MockAIProvider();
            break;
        // TODO: Add Anthropic and Google AI providers
        // case 'anthropic':
        //   aiProviderInstance = new AnthropicProvider();
        //   break;
        // case 'google':
        //   aiProviderInstance = new GoogleAIProvider();
        //   break;
        default:
            console.warn(`Unknown AI provider: ${provider}. Using mock provider.`);
            aiProviderInstance = new MockAIProvider();
    }

    return aiProviderInstance;
}

export const aiService = {
    suggestTheses: (facts: string, options?: ThesisOptions) =>
        getAIProvider().suggestTheses(facts, options),
    generateDocument: (context: GenerateContext) =>
        getAIProvider().generateDocument(context),
    rewriteParagraph: (text: string, instruction: string, context?: string) =>
        getAIProvider().rewriteParagraph(text, instruction, context),
};
