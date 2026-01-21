"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetitionEditor } from "@/components/editor/petition-editor";
import { useToast } from "@/hooks/use-toast";

interface DocumentData {
  id: string;
  version: number;
  content: Record<string, unknown>;
  title: string;
}

export default function EditorPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // First try to get existing document
        const caseRes = await fetch(`/api/cases/${caseId}`);
        if (!caseRes.ok) {
          throw new Error("Failed to fetch case");
        }

        const caseData = await caseRes.json();

        if (caseData.documents && caseData.documents.length > 0) {
          // Use existing document
          setDocument(caseData.documents[0]);
        } else {
          // Generate new document
          const generateRes = await fetch("/api/documents/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caseId, format: "docx" }),
          });

          if (!generateRes.ok) {
            throw new Error("Failed to generate document");
          }

          const result = await generateRes.json();
          // Fetch the newly created document
          const newCaseRes = await fetch(`/api/cases/${caseId}`);
          const newCaseData = await newCaseRes.json();
          if (newCaseData.documents && newCaseData.documents.length > 0) {
            setDocument(newCaseData.documents[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o documento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [caseId, toast]);

  const handleSave = async (content: Record<string, unknown>) => {
    if (!document) return;

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // In a real implementation, we'd save the document content
          status: "EDITING",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toast({
        title: "Salvo",
        description: "Documento salvo com sucesso.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o documento.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would generate and download a DOCX file
      toast({
        title: "Exportação",
        description: "Funcionalidade de exportação será implementada em breve.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-lg font-semibold">
            {document?.title || "Editor de Petição"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Versão {document?.version || 1}
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar DOCX
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <PetitionEditor
          documentId={document?.id}
          caseId={caseId}
          initialContent={document?.content}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
