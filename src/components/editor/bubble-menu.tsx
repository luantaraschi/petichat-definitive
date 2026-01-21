"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  RefreshCw,
  Expand,
  Shrink,
  GraduationCap,
  BookOpen,
  FileText,
  ListChecks,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";

interface EditorBubbleMenuProps {
  editor: Editor;
}

type AIAction = "rewrite" | "expand" | "shorten" | "formalize" | "cite" | "create_topic" | "create_claims";

const AI_ACTIONS: { action: AIAction; icon: React.ReactNode; label: string; description: string }[] = [
  { action: "rewrite", icon: <RefreshCw className="h-4 w-4" />, label: "Reescrever", description: "Reescreve o texto de forma mais clara" },
  { action: "expand", icon: <Expand className="h-4 w-4" />, label: "Expandir", description: "Adiciona mais detalhes e fundamentação" },
  { action: "shorten", icon: <Shrink className="h-4 w-4" />, label: "Reduzir", description: "Resume o texto mantendo a essência" },
  { action: "formalize", icon: <GraduationCap className="h-4 w-4" />, label: "Formalizar", description: "Torna o texto mais formal e jurídico" },
  { action: "cite", icon: <BookOpen className="h-4 w-4" />, label: "Fundamentar", description: "Adiciona citação de jurisprudência" },
  { action: "create_topic", icon: <FileText className="h-4 w-4" />, label: "Criar Tópico", description: "Transforma em tópico estruturado" },
  { action: "create_claims", icon: <ListChecks className="h-4 w-4" />, label: "Criar Pedidos", description: "Gera pedidos baseados no texto" },
];

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const {
    selectedText,
    selectionRange,
    isProcessingAction,
    setIsProcessingAction,
    pendingAction,
    setPendingAction,
    caseId,
  } = useEditorStore();

  const [showPreview, setShowPreview] = useState(false);

  const handleAction = async (action: AIAction) => {
    if (!selectedText || !selectionRange || isProcessingAction) return;

    setIsProcessingAction(true);

    try {
      const response = await fetch("/api/editor/inline-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selectedText,
          context: { caseId },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process action");
      }

      const result = await response.json();
      setPendingAction(result);
      setShowPreview(true);
    } catch (error) {
      console.error("AI action error:", error);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const applyAction = () => {
    if (!pendingAction || !selectionRange) return;

    editor
      .chain()
      .focus()
      .setTextSelection(selectionRange)
      .deleteSelection()
      .insertContent(pendingAction.result)
      .run();

    setPendingAction(null);
    setShowPreview(false);
  };

  const discardAction = () => {
    setPendingAction(null);
    setShowPreview(false);
  };

  return (
    <>
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-lg"
      >
        <TooltipProvider>
          {AI_ACTIONS.map(({ action, icon, label, description }) => (
            <Tooltip key={action}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(action)}
                  disabled={isProcessingAction || !selectedText}
                  className={cn("h-8 px-2", isProcessingAction && "opacity-50")}
                >
                  {isProcessingAction ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    icon
                  )}
                  <span className="ml-1 text-xs">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </BubbleMenu>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização</DialogTitle>
            <DialogDescription>
              Revise o resultado antes de aplicar a alteração.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Original:</p>
              <div className="rounded-md border bg-muted p-3 text-sm">
                {pendingAction?.original}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Resultado:</p>
              <div className="rounded-md border bg-background p-3 text-sm whitespace-pre-wrap">
                {pendingAction?.result}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={discardAction}>
              Descartar
            </Button>
            <Button onClick={applyAction}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
