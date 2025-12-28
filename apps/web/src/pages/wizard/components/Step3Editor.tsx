import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useWizardStore } from '@/stores/wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiApi, documentsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Loader2,
    Download,
    Save,
    FileText,
    Sparkles,
} from 'lucide-react';

export function Step3Editor() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        caseId,
        documentType,
        selectedThesisIds,
        selectedJurisprudenceIds,
        documentId,
        documentContent,
        isGenerating,
        setDocument,
        setDocumentContent,
        setGenerating,
        prevStep,
        reset,
    } = useWizardStore();

    const [isSaving, setIsSaving] = useState(false);

    // Generate document mutation
    const generateMutation = useMutation({
        mutationFn: () =>
            aiApi.generateDocument({
                caseId: caseId!,
                documentType: documentType as any,
                thesisIds: selectedThesisIds,
                jurisprudenceIds: selectedJurisprudenceIds,
            }),
        onSuccess: (data) => {
            setDocument(data.document.id, data.document.contentHtml);
            toast({
                title: 'Documento gerado!',
                description: 'Revise o conteúdo e faça ajustes se necessário.',
            });
        },
        onError: (error: any) => {
            setGenerating(false);
            toast({
                variant: 'destructive',
                title: 'Erro ao gerar documento',
                description: error.response?.data?.message || 'Erro ao processar.',
            });
        },
    });

    // Auto-generate on mount
    useEffect(() => {
        if (caseId && !documentId && !isGenerating) {
            setGenerating(true);
            generateMutation.mutate();
        }
    }, [caseId]);

    // Save document
    const handleSave = async () => {
        if (!documentId) return;
        setIsSaving(true);
        try {
            await documentsApi.update(documentId, {
                contentHtml: documentContent,
                status: 'completed',
            });
            toast({
                title: 'Documento salvo!',
                description: 'As alterações foram salvas com sucesso.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: error.response?.data?.message || 'Erro ao salvar.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Export document
    const handleExport = async (format: 'pdf' | 'docx') => {
        if (!documentId) return;
        try {
            const result = await documentsApi.export(documentId, format);
            toast({
                title: 'Exportação iniciada',
                description: result.message || `Arquivo ${format.toUpperCase()} será baixado em breve.`,
            });
            // In production, this would trigger a download
            // window.open(result.downloadUrl, '_blank');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro na exportação',
                description: error.response?.data?.message || 'Erro ao exportar.',
            });
        }
    };

    // Finish and go to document editor
    const handleFinish = () => {
        if (documentId) {
            reset();
            navigate(`/document/${documentId}`);
        }
    };

    if (generateMutation.isPending || isGenerating) {
        return (
            <Card>
                <CardContent className="flex h-96 flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium">Gerando documento com IA...</p>
                    <p className="text-sm text-muted-foreground">
                        Isso pode levar alguns segundos
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Salvar
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('docx')}>
                        <Download className="mr-2 h-4 w-4" />
                        DOCX
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                    <Button onClick={handleFinish}>
                        <FileText className="mr-2 h-4 w-4" />
                        Abrir no Editor
                    </Button>
                </div>
            </div>

            {/* Document Preview/Editor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Documento Gerado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="prose prose-sm max-w-none min-h-[500px] rounded-lg border bg-white p-8"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setDocumentContent(e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: documentContent }}
                    />
                    <p className="mt-4 text-sm text-muted-foreground">
                        ✏️ Clique no documento acima para editar diretamente. Use os botões para salvar ou exportar.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
