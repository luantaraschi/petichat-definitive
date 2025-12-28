import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
}

const steps = [
    { number: 1, title: 'Fatos do Caso', description: 'Descreva os fatos' },
    { number: 2, title: 'Teses e Jurisprudência', description: 'Selecione as teses' },
    { number: 3, title: 'Edição do Documento', description: 'Revise e exporte' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors',
                                    currentStep > step.number
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : currentStep === step.number
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-muted-foreground/30 text-muted-foreground'
                                )}
                            >
                                {currentStep > step.number ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground hidden sm:block">
                                    {step.description}
                                </p>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-4 h-0.5 w-16 sm:w-24',
                                    currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/30'
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
