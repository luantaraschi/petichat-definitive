import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWizardStore } from '@/stores/wizard';
import { documentTemplates, documentTypeLabels } from '@petichat/shared';
import { StepIndicator } from './components/StepIndicator';
import { Step1Facts } from './components/Step1Facts';
import { Step2Theses } from './components/Step2Theses';
import { Step3Editor } from './components/Step3Editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function WizardPage() {
    const { templateId } = useParams<{ templateId: string }>();
    const navigate = useNavigate();
    const { currentStep, setTemplate, reset } = useWizardStore();

    // Find template and set it
    useEffect(() => {
        const template = documentTemplates.find((t) => t.id === templateId);
        if (template) {
            setTemplate(template.type, template.name);
        } else {
            navigate('/templates');
        }

        // Cleanup on unmount
        return () => {
            // Could reset here if needed
        };
    }, [templateId, setTemplate, navigate]);

    const template = documentTemplates.find((t) => t.id === templateId);

    if (!template) {
        return null;
    }

    const handleCancel = () => {
        reset();
        navigate('/templates');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{template.name}</h1>
                    <p className="text-muted-foreground">
                        {documentTypeLabels[template.type]} • {template.description}
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} />

            {/* Step Content */}
            <div className="mt-8">
                {currentStep === 1 && <Step1Facts />}
                {currentStep === 2 && <Step2Theses />}
                {currentStep === 3 && <Step3Editor />}
            </div>
        </div>
    );
}
