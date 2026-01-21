"use client";

import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useEditorStore } from "@/stores/editor-store";
import { EditorToolbar } from "./toolbar";
import { EditorBubbleMenu } from "./bubble-menu";
import { EditorSidebar } from "./sidebar-panel";
import { cn } from "@/lib/utils";

interface PetitionEditorProps {
  documentId?: string;
  caseId?: string;
  initialContent?: Record<string, unknown>;
  onSave?: (content: Record<string, unknown>) => Promise<void>;
  readOnly?: boolean;
}

export function PetitionEditor({
  documentId,
  caseId,
  initialContent,
  onSave,
  readOnly = false,
}: PetitionEditorProps) {
  const {
    setEditor,
    setDocument,
    setIsSaving,
    setLastSaved,
    setSelectedText,
    setSelectionRange,
    isSidebarOpen,
  } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Comece a escrever sua petição...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: initialContent || {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO" }],
        },
        {
          type: "paragraph",
          content: [],
        },
      ],
    },
    editable: !readOnly,
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      setSelectedText(text);
      setSelectionRange(from !== to ? { from, to } : null);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none max-w-none min-h-[500px] p-8",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      setEditor(editor);
    }
    return () => setEditor(null);
  }, [editor, setEditor]);

  useEffect(() => {
    if (documentId && caseId) {
      setDocument(documentId, caseId);
    }
  }, [documentId, caseId, setDocument]);

  const handleSave = useCallback(async () => {
    if (!editor || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(editor.getJSON());
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, setIsSaving, setLastSaved]);

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className={cn("flex-1 flex flex-col", isSidebarOpen && "mr-80")}>
        <EditorToolbar editor={editor} onSave={handleSave} />
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-4xl mx-auto">
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      <EditorSidebar />
    </div>
  );
}
