import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useWizardStore } from '@/stores/wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { aiApi, jurisprudenceApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { thesisCategoryLabels } from '@petichat/shared';
import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    Sparkles,
    Check,
    Search,
    Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function Step2Theses() {
    const { toast } = useToast();
    const [searchKeywords, setSearchKeywords] = useState('');
    const {
        caseId,
        theses,
        selectedThesisIds,
        jurisprudences,
        selectedJurisprudenceIds,
        isLoadingTheses,
        setTheses,
        toggleThesis,
        setJurisprudences,
        toggleJurisprudence,
        setLoadingTheses,
        setLoadingJurisprudences,
        prevStep,
        nextStep,
    } = useWizardStore();

    // Suggest theses mutation
    const suggestThesesMutation = useMutation({
        mutationFn: () => aiApi.suggestTheses(caseId!),
        onSuccess: (data) => {
            setTheses(data.theses);
            toast({
                title: 'Teses sugeridas!',
                description: `${data.theses.length} teses foram sugeridas pela IA.`,
            });
        },
        onError: (error: any) => {
            setLoadingTheses(false);
            toast({
                variant: 'destructive',
                title: 'Erro ao sugerir teses',
                description: error.response?.data?.message || 'Erro ao processar.',
            });
        },
    });

    // Search jurisprudence mutation
    const searchJurisprudenceMutation = useMutation({
        mutationFn: (keywords: string) =>
            jurisprudenceApi.search({ keywords, limit: 10 }),
        onSuccess: (data) => {
            setJurisprudences(data.results);
            if (data.results.length === 0) {
                toast({
                    title: 'Nenhuma jurisprudência encontrada',
                    description: 'Tente outros termos de busca.',
                });
            }
        },
        onError: (error: any) => {
            setLoadingJurisprudences(false);
            toast({
                variant: 'destructive',
                title: 'Erro na busca',
                description: error.response?.data?.message || 'Erro ao buscar.',
            });
        },
    });

    // Auto-suggest theses on mount if not already done
    useEffect(() => {
        if (caseId && theses.length === 0 && !isLoadingTheses) {
            setLoadingTheses(true);
            suggestThesesMutation.mutate();
        }
    }, [caseId]);

    const handleSearchJurisprudence = () => {
        if (searchKeywords.trim()) {
            setLoadingJurisprudences(true);
            searchJurisprudenceMutation.mutate(searchKeywords);
        }
    };

    const canProceed = selectedThesisIds.length > 0;

    return (
        <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Theses Column */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Teses Jurídicas
                                </CardTitle>
                                <CardDescription>
                                    Selecione as teses que deseja incluir na peça
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setLoadingTheses(true);
                                    suggestThesesMutation.mutate();
                                }}
                                disabled={suggestThesesMutation.isPending}
                            >
                                {suggestThesesMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Gerar Novas
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {suggestThesesMutation.isPending || isLoadingTheses ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Gerando sugestões com IA...
                                    </p>
                                </div>
                            </div>
                        ) : theses.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {theses.map((thesis) => {
                                    const isSelected = selectedThesisIds.includes(thesis.id);
                                    return (
                                        <div
                                            key={thesis.id}
                                            onClick={() => toggleThesis(thesis.id)}
                                            className={cn(
                                                'cursor-pointer rounded-lg border p-4 transition-all',
                                                isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:border-muted-foreground/50'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={cn(
                                                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-muted-foreground/30'
                                                    )}
                                                >
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                                                            {thesisCategoryLabels[thesis.category]}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 font-medium">{thesis.title}</p>
                                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                        {thesis.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-48 items-center justify-center text-center">
                                <div>
                                    <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">
                                        Clique em "Gerar Novas" para sugerir teses
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Jurisprudence Column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-primary" />
                            Jurisprudências
                        </CardTitle>
                        <CardDescription>
                            Busque e selecione jurisprudências relevantes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar por palavras-chave..."
                                value={searchKeywords}
                                onChange={(e) => setSearchKeywords(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchJurisprudence()}
                            />
                            <Button
                                onClick={handleSearchJurisprudence}
                                disabled={searchJurisprudenceMutation.isPending}
                            >
                                {searchJurisprudenceMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {searchJurisprudenceMutation.isPending ? (
                            <div className="flex h-48 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : jurisprudences.length > 0 ? (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {jurisprudences.map((juris) => {
                                    const isSelected = selectedJurisprudenceIds.includes(juris.id);
                                    return (
                                        <div
                                            key={juris.id}
                                            onClick={() => toggleJurisprudence(juris.id)}
                                            className={cn(
                                                'cursor-pointer rounded-lg border p-4 transition-all',
                                                isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:border-muted-foreground/50'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={cn(
                                                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-muted-foreground/30'
                                                    )}
                                                >
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        {juris.tribunal} • {juris.processNumber}
                                                    </p>
                                                    <p className="mt-1 text-sm line-clamp-3">{juris.summary}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-48 items-center justify-center text-center">
                                <div>
                                    <Scale className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">
                                        Busque jurisprudências por palavras-chave
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <Button onClick={nextStep} disabled={!canProceed}>
                    Gerar Documento
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {!canProceed && (
                <p className="text-center text-sm text-muted-foreground">
                    Selecione pelo menos uma tese para continuar
                </p>
            )}
        </div>
    );
}
