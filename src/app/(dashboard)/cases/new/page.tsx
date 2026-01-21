"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const steps = [
  { id: 0, name: "Template", description: "Escolha o modelo" },
  { id: 1, name: "Fatos", description: "Descreva o caso" },
  { id: 2, name: "Triagem", description: "Responda perguntas" },
  { id: 3, name: "Preliminares", description: "Configure parâmetros" },
  { id: 4, name: "Teses", description: "Defina argumentos" },
  { id: 5, name: "Jurisprudência", description: "Selecione fontes" },
  { id: 6, name: "Editor", description: "Finalize o documento" },
];

export default function NewCasePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template");

  const [currentStep, setCurrentStep] = useState(templateId ? 1 : 0);
  const [formData, setFormData] = useState({
    templateId: templateId || "",
    title: "",
    clientName: "",
    facts: "",
    tribunal: "",
    foro: "",
    gratuidadeJustica: false,
    tom: "formal",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 5) {
        // Go to editor
        router.push(`/cases/${formData.templateId || "new"}/editor`);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-between overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  index < currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step.id + 1}</span>
                )}
              </button>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
                <p className="hidden text-xs text-muted-foreground md:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-0.5 w-12 flex-shrink-0",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo de Petição</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, templateId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ação de Cobrança</SelectItem>
                    <SelectItem value="2">Ação de Alimentos</SelectItem>
                    <SelectItem value="3">Ação de Indenização</SelectItem>
                    <SelectItem value="4">Habeas Corpus</SelectItem>
                    <SelectItem value="5">Reclamação Trabalhista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tribunal</Label>
                <Select
                  value={formData.tribunal}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tribunal: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tribunal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tjsp">TJSP</SelectItem>
                    <SelectItem value="tjrj">TJRJ</SelectItem>
                    <SelectItem value="tjmg">TJMG</SelectItem>
                    <SelectItem value="stj">STJ</SelectItem>
                    <SelectItem value="stf">STF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Foro</Label>
                <Input
                  placeholder="Ex: Foro Central Cível"
                  value={formData.foro}
                  onChange={(e) =>
                    setFormData({ ...formData, foro: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título do Caso</Label>
                <Input
                  placeholder="Ex: Cobrança de honorários - João Silva"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input
                  placeholder="Nome completo do cliente"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fatos do Caso</Label>
                <Textarea
                  placeholder="Descreva os fatos relevantes do caso..."
                  className="min-h-[200px]"
                  value={formData.facts}
                  onChange={(e) =>
                    setFormData({ ...formData, facts: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                A IA vai analisar os fatos e fazer perguntas para completar as
                informações necessárias.
              </p>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Na versão final, a IA fará
                  perguntas dinâmicas baseadas nos fatos informados.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gratuidade"
                  checked={formData.gratuidadeJustica}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gratuidadeJustica: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="gratuidade">
                  Solicitar Gratuidade de Justiça
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Tom da Petição</Label>
                <Select
                  value={formData.tom}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tom: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="assertivo">Assertivo</SelectItem>
                    <SelectItem value="conciliador">Conciliador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Defina as teses e pedidos para sua petição.
              </p>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Na versão final, a IA vai
                  sugerir teses baseadas nos fatos e você poderá editá-las.
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecione jurisprudências para fundamentar suas teses.
              </p>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Na versão final, você
                  poderá buscar e selecionar jurisprudências reais.
                </p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Finalize e edite seu documento.
              </p>
              <Button onClick={() => router.push("/cases/new/editor")}>
                Abrir Editor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            "Finalizar"
          ) : (
            <>
              Próximo
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
