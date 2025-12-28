import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { documentsApi, aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { documentTypeLabels } from '@petichat/shared';
import {
    ArrowLeft,
    Save,
    Download,
    Loader2,
    Sparkles,
    History,
    X,
} from 'lucide-react';

export function DocumentEditorPage() {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [content, setContent] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [rewriteInstruction, setRewriteInstruction] = useState('improve');

    // Fetch document
    const { data: document, isLoading } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentsApi.get(documentId!),
        enabled: !!documentId,
    });

    // Update content when document loads
    if (document && !content && document.contentHtml) {
        setContent(document.contentHtml);
    }

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: () =>
            documentsApi.update(documentId!, {
                contentHtml: content,
            }),
        onSuccess: () => {
            toast({
                title: 'Documento salvo!',
                description: 'As alterações foram salvas com sucesso.',
            });
        },
        onError: () => {
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: 'Não foi possível salvar o documento.',
            });
        },
    });

    // Rewrite mutation
    const rewriteMutation = useMutation({
        mutationFn: (text: string) =>
            aiApi.rewriteParagraph({
                originalText: text,
                instruction: rewriteInstruction,
                documentId,
            }),
        onSuccess: (data) => {
            // Replace selected text with rewritten version
            const newContent = content.replace(selectedText, data.rewrittenText);
            setContent(newContent);
            setShowAIPanel(false);
            setSelectedText('');
            toast({
                title: 'Texto reescrito!',
                description: 'O trecho foi atualizado com sucesso.',
            });
        },
        onError: () => {
            toast({
                variant: 'destructive',
                title: 'Erro ao reescrever',
                description: 'Não foi possível processar o texto.',
            });
        },
    });

    // Export
    const handleExport = async (format: 'pdf' | 'docx') => {
        try {
            const result = await documentsApi.export(documentId!, format);
            toast({
                title: 'Exportação iniciada',
                description: result.message || `Arquivo ${format.toUpperCase()} será baixado.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro na exportação',
                description: 'Não foi possível exportar o documento.',
            });
        }
    };

    // Handle text selection
    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 10) {
            setSelectedText(selection.toString());
            setShowAIPanel(true);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!document) {
        return (
            <div className="flex h-64 flex-col items-center justify-center">
                <p className="text-muted-foreground">Documento não encontrado</p>
                <Button variant="link" onClick={() => navigate(-1)}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{document.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {documentTypeLabels[document.documentType]} • Caso: {document.case?.clientName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <History className="mr-2 h-4 w-4" />
                        Versões
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('docx')}>
                        <Download className="mr-2 h-4 w-4" />
                        DOCX
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Document Editor */}
                <Card className="flex-1">
                    <CardContent className="p-0">
                        <div
                            className="prose prose-sm max-w-none min-h-[600px] p-8"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setContent(e.currentTarget.innerHTML)}
                            onMouseUp={handleTextSelection}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </CardContent>
                </Card>

                {/* AI Panel */}
                {showAIPanel && selectedText && (
                    <Card className="w-80 shrink-0">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Reescrever com IA
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setShowAIPanel(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-muted p-3 text-sm line-clamp-4">
                                {selectedText}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'improve', label: 'Melhorar' },
                                    { value: 'simplify', label: 'Simplificar' },
                                    { value: 'expand', label: 'Expandir' },
                                    { value: 'formal', label: 'Formalizar' },
                                ].map((option) => (
                                    <Button
                                        key={option.value}
                                        variant={rewriteInstruction === option.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setRewriteInstruction(option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => rewriteMutation.mutate(selectedText)}
                                disabled={rewriteMutation.isPending}
                            >
                                {rewriteMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Reescrever
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <p className="text-sm text-muted-foreground">
                💡 Dica: Selecione um trecho de texto para reescrever com IA
            </p>
        </div>
    );
}
