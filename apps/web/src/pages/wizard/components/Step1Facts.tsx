import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizardStore } from '@/stores/wizard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { casesApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';

const step1Schema = z.object({
    clientName: z.string().min(2, 'Nome do cliente deve ter no mínimo 2 caracteres'),
    caseType: z.string().min(1, 'Tipo do caso é obrigatório'),
    factsDescription: z.string().min(50, 'Descrição deve ter no mínimo 50 caracteres'),
});

type Step1Input = z.infer<typeof step1Schema>;

export function Step1Facts() {
    const { toast } = useToast();
    const { clientName, caseType, factsDescription, documentType, setCaseInfo, nextStep } =
        useWizardStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Step1Input>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            clientName,
            caseType: caseType || documentType,
            factsDescription,
        },
    });

    const createCaseMutation = useMutation({
        mutationFn: (data: Step1Input) =>
            casesApi.create({
                clientName: data.clientName,
                caseType: data.caseType,
                factsDescription: data.factsDescription,
            }),
        onSuccess: (caseData) => {
            setCaseInfo({
                caseId: caseData.id,
                clientName: caseData.clientName,
                caseType: caseData.caseType,
                factsDescription: caseData.factsDescription,
            });
            nextStep();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro ao criar caso',
                description: error.response?.data?.message || 'Erro ao salvar os dados.',
            });
        },
    });

    const onSubmit = (data: Step1Input) => {
        // Save to store and create case
        setCaseInfo({
            clientName: data.clientName,
            caseType: data.caseType,
            factsDescription: data.factsDescription,
        });
        createCaseMutation.mutate(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Descreva os fatos do caso</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Nome do Cliente</Label>
                            <Input
                                id="clientName"
                                placeholder="Ex: João da Silva"
                                {...register('clientName')}
                            />
                            {errors.clientName && (
                                <p className="text-sm text-destructive">{errors.clientName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="caseType">Tipo do Caso</Label>
                            <Input
                                id="caseType"
                                placeholder="Ex: Indenização por danos morais"
                                {...register('caseType')}
                            />
                            {errors.caseType && (
                                <p className="text-sm text-destructive">{errors.caseType.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="factsDescription">Descrição dos Fatos</Label>
                        <Textarea
                            id="factsDescription"
                            placeholder="Descreva detalhadamente os fatos do caso. Inclua datas, partes envolvidas, eventos relevantes e todas as informações que possam ser úteis para a elaboração da peça jurídica..."
                            className="min-h-[300px]"
                            {...register('factsDescription')}
                        />
                        {errors.factsDescription && (
                            <p className="text-sm text-destructive">{errors.factsDescription.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Quanto mais detalhes você fornecer, melhor será a qualidade da peça gerada.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={createCaseMutation.isPending}>
                            {createCaseMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Próximo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
