"use client";

import { FileText, BookOpen, List, X, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

const STATUS_COLORS = {
  PENDING: "bg-yellow-500/20 text-yellow-600",
  APPROVED: "bg-green-500/20 text-green-600",
  REJECTED: "bg-red-500/20 text-red-600",
  NEEDS_REVISION: "bg-orange-500/20 text-orange-600",
};

const STATUS_LABELS = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  NEEDS_REVISION: "Revisão",
};

export function EditorSidebar() {
  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarTab,
    setSidebarTab,
    theses,
    selectedCitations,
    removeCitation,
    editor,
  } = useEditorStore();

  const [openTheses, setOpenTheses] = useState<string[]>([]);

  if (!isSidebarOpen) return null;

  const toggleThesis = (id: string) => {
    setOpenTheses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const insertCitation = (citation: typeof selectedCitations[0]) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [{ type: "highlight" }],
            text: `"${citation.excerpt}" (${citation.tribunal}, ${citation.numero}, j. ${citation.dataJulgamento}, ${citation.fonte})`,
          },
        ],
      })
      .run();
  };

  const insertThesis = (thesis: typeof theses[0]) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: thesis.title }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: thesis.content }],
        },
      ])
      .run();
  };

  // Generate document outline from editor
  const getOutline = () => {
    if (!editor) return [];

    const outline: { level: number; text: string; pos: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        outline.push({
          level: node.attrs.level as number,
          text: node.textContent,
          pos,
        });
      }
    });
    return outline;
  };

  const outline = getOutline();

  return (
    <div className="fixed right-0 top-[60px] bottom-0 w-80 border-l bg-background flex flex-col z-30">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Painel</h3>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as typeof sidebarTab)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 px-4">
          <TabsTrigger value="theses" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Teses
          </TabsTrigger>
          <TabsTrigger value="citations" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            Citações
          </TabsTrigger>
          <TabsTrigger value="outline" className="text-xs">
            <List className="h-3 w-3 mr-1" />
            Sumário
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="theses" className="m-0 p-4 space-y-2">
            {theses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tese selecionada</p>
              </div>
            ) : (
              theses.map((thesis) => (
                <Collapsible
                  key={thesis.id}
                  open={openTheses.includes(thesis.id)}
                  onOpenChange={() => toggleThesis(thesis.id)}
                >
                  <div className="rounded-md border bg-card">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {openTheses.includes(thesis.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{thesis.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {thesis.type === "THESIS" ? "Tese" : thesis.type === "CLAIM" ? "Pedido" : "Preliminar"}
                            </Badge>
                            <Badge className={cn("text-xs", STATUS_COLORS[thesis.status])}>
                              {STATUS_LABELS[thesis.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-3 pb-3 space-y-2">
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {thesis.content}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => insertThesis(thesis)}
                        >
                          Inserir no documento
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </TabsContent>

          <TabsContent value="citations" className="m-0 p-4 space-y-2">
            {selectedCitations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma citação selecionada</p>
                <p className="text-xs mt-1">Busque jurisprudência para adicionar citações</p>
              </div>
            ) : (
              selectedCitations.map((citation) => (
                <div key={citation.id} className="rounded-md border bg-card p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{citation.tribunal} - {citation.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {citation.dataJulgamento} | {citation.fonte}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeCitation(citation.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 italic">
                    &ldquo;{citation.excerpt}&rdquo;
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => insertCitation(citation)}
                  >
                    Inserir no documento
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="outline" className="m-0 p-4">
            {outline.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum título encontrado</p>
                <p className="text-xs mt-1">Adicione títulos (H1, H2, H3) ao documento</p>
              </div>
            ) : (
              <div className="space-y-1">
                {outline.map((item, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-full text-left text-sm hover:bg-muted rounded px-2 py-1 transition-colors",
                      item.level === 1 && "font-semibold",
                      item.level === 2 && "pl-4",
                      item.level === 3 && "pl-6 text-muted-foreground"
                    )}
                    onClick={() => {
                      editor?.chain().focus().setTextSelection(item.pos).run();
                    }}
                  >
                    {item.text || `(Título ${item.level} vazio)`}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
