import { create } from 'zustand';
import type { Thesis, Jurisprudence } from '@petichat/shared';

// Wizard state for the petition creation flow
interface WizardState {
    // Current step (1, 2, or 3)
    currentStep: number;

    // Step 1: Case Information
    caseId: string | null;
    clientName: string;
    caseType: string;
    factsDescription: string;

    // Step 2: Theses and Jurisprudence
    theses: Thesis[];
    selectedThesisIds: string[];
    jurisprudences: Jurisprudence[];
    selectedJurisprudenceIds: string[];
    isLoadingTheses: boolean;
    isLoadingJurisprudences: boolean;

    // Step 3: Document
    documentId: string | null;
    documentContent: string;
    isGenerating: boolean;

    // Document type from template
    documentType: string;
    templateName: string;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Step 1 actions
    setCaseInfo: (info: {
        caseId?: string;
        clientName?: string;
        caseType?: string;
        factsDescription?: string;
    }) => void;

    // Step 2 actions
    setTheses: (theses: Thesis[]) => void;
    toggleThesis: (thesisId: string) => void;
    setJurisprudences: (jurisprudences: Jurisprudence[]) => void;
    toggleJurisprudence: (jurisprudenceId: string) => void;
    setLoadingTheses: (loading: boolean) => void;
    setLoadingJurisprudences: (loading: boolean) => void;

    // Step 3 actions
    setDocument: (documentId: string, content: string) => void;
    setDocumentContent: (content: string) => void;
    setGenerating: (generating: boolean) => void;

    // Template actions
    setTemplate: (documentType: string, templateName: string) => void;

    // Reset wizard
    reset: () => void;
}

const initialState = {
    currentStep: 1,
    caseId: null,
    clientName: '',
    caseType: '',
    factsDescription: '',
    theses: [],
    selectedThesisIds: [],
    jurisprudences: [],
    selectedJurisprudenceIds: [],
    isLoadingTheses: false,
    isLoadingJurisprudences: false,
    documentId: null,
    documentContent: '',
    isGenerating: false,
    documentType: 'petition',
    templateName: '',
};

export const useWizardStore = create<WizardState>((set, get) => ({
    ...initialState,

    setStep: (step) => set({ currentStep: step }),

    nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 3) {
            set({ currentStep: currentStep + 1 });
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
        }
    },

    setCaseInfo: (info) =>
        set((state) => ({
            ...state,
            ...info,
        })),

    setTheses: (theses) => set({ theses, isLoadingTheses: false }),

    toggleThesis: (thesisId) =>
        set((state) => {
            const isSelected = state.selectedThesisIds.includes(thesisId);
            return {
                selectedThesisIds: isSelected
                    ? state.selectedThesisIds.filter((id) => id !== thesisId)
                    : [...state.selectedThesisIds, thesisId],
            };
        }),

    setJurisprudences: (jurisprudences) =>
        set({ jurisprudences, isLoadingJurisprudences: false }),

    toggleJurisprudence: (jurisprudenceId) =>
        set((state) => {
            const isSelected = state.selectedJurisprudenceIds.includes(jurisprudenceId);
            return {
                selectedJurisprudenceIds: isSelected
                    ? state.selectedJurisprudenceIds.filter((id) => id !== jurisprudenceId)
                    : [...state.selectedJurisprudenceIds, jurisprudenceId],
            };
        }),

    setLoadingTheses: (loading) => set({ isLoadingTheses: loading }),

    setLoadingJurisprudences: (loading) => set({ isLoadingJurisprudences: loading }),

    setDocument: (documentId, content) =>
        set({ documentId, documentContent: content, isGenerating: false }),

    setDocumentContent: (content) => set({ documentContent: content }),

    setGenerating: (generating) => set({ isGenerating: generating }),

    setTemplate: (documentType, templateName) => set({ documentType, templateName }),

    reset: () => set(initialState),
}));
