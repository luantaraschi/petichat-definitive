import { create } from "zustand";
import type { Editor } from "@tiptap/react";

interface Citation {
  id: string;
  chunkId: string;
  tribunal: string;
  numero: string;
  dataJulgamento: string;
  relator?: string;
  orgaoJulgador?: string;
  excerpt: string;
  fonte: string;
  linkOriginal?: string;
}

interface Thesis {
  id: string;
  title: string;
  content: string;
  type: "THESIS" | "CLAIM" | "PRELIMINARY";
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";
}

interface AIAction {
  id: string;
  action: string;
  original: string;
  result: string;
  preview: boolean;
  expiresAt: string;
}

interface EditorState {
  // Editor instance
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;

  // Document state
  documentId: string | null;
  caseId: string | null;
  setDocument: (documentId: string, caseId: string) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  lastSaved: Date | null;
  setLastSaved: (date: Date | null) => void;

  // Selected citations
  selectedCitations: Citation[];
  addCitation: (citation: Citation) => void;
  removeCitation: (id: string) => void;
  clearCitations: () => void;

  // Theses
  theses: Thesis[];
  setTheses: (theses: Thesis[]) => void;
  updateThesis: (id: string, updates: Partial<Thesis>) => void;

  // AI actions
  pendingAction: AIAction | null;
  setPendingAction: (action: AIAction | null) => void;
  isProcessingAction: boolean;
  setIsProcessingAction: (processing: boolean) => void;

  // UI state
  sidebarTab: "theses" | "citations" | "outline";
  setSidebarTab: (tab: "theses" | "citations" | "outline") => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Selection state for AI actions
  selectedText: string;
  setSelectedText: (text: string) => void;
  selectionRange: { from: number; to: number } | null;
  setSelectionRange: (range: { from: number; to: number } | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Editor instance
  editor: null,
  setEditor: (editor) => set({ editor }),

  // Document state
  documentId: null,
  caseId: null,
  setDocument: (documentId, caseId) => set({ documentId, caseId }),
  isSaving: false,
  setIsSaving: (isSaving) => set({ isSaving }),
  lastSaved: null,
  setLastSaved: (lastSaved) => set({ lastSaved }),

  // Selected citations
  selectedCitations: [],
  addCitation: (citation) =>
    set((state) => ({
      selectedCitations: [...state.selectedCitations, citation],
    })),
  removeCitation: (id) =>
    set((state) => ({
      selectedCitations: state.selectedCitations.filter((c) => c.id !== id),
    })),
  clearCitations: () => set({ selectedCitations: [] }),

  // Theses
  theses: [],
  setTheses: (theses) => set({ theses }),
  updateThesis: (id, updates) =>
    set((state) => ({
      theses: state.theses.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  // AI actions
  pendingAction: null,
  setPendingAction: (pendingAction) => set({ pendingAction }),
  isProcessingAction: false,
  setIsProcessingAction: (isProcessingAction) => set({ isProcessingAction }),

  // UI state
  sidebarTab: "theses",
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Selection state
  selectedText: "",
  setSelectedText: (selectedText) => set({ selectedText }),
  selectionRange: null,
  setSelectionRange: (selectionRange) => set({ selectionRange }),
}));
