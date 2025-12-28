// ================================
// Core Domain Types
// ================================

// User & Authentication
export interface User {
    id: string;
    email: string;
    name: string;
    lawFirmId: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export type UserRole = 'owner' | 'member' | 'admin';

export interface LawFirm {
    id: string;
    name: string;
    cnpj: string | null;
    subscriptionPlan: SubscriptionPlan;
    createdAt: Date;
    updatedAt: Date;
}

export type SubscriptionPlan = 'trial' | 'basic' | 'pro' | 'enterprise';

// Cases
export interface Case {
    id: string;
    lawFirmId: string;
    userId: string;
    clientName: string;
    caseType: string;
    status: CaseStatus;
    factsDescription: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export type CaseStatus = 'draft' | 'active' | 'archived';

// Legal Documents
export interface LegalDocument {
    id: string;
    caseId: string;
    title: string;
    documentType: DocumentType;
    status: DocumentStatus;
    contentHtml: string;
    sections: DocumentSection[];
    createdAt: Date;
    updatedAt: Date;
}

export type DocumentType =
    | 'petition'
    | 'contestation'
    | 'appeal'
    | 'motion'
    | 'brief'
    | 'contract'
    | 'other';

export type DocumentStatus = 'draft' | 'completed';

export interface DocumentSection {
    id: string;
    type: string;
    title: string;
    content: string;
    order: number;
}

export interface DocumentVersion {
    id: string;
    documentId: string;
    contentHtml: string;
    createdAt: Date;
    createdBy: string;
}

// Theses
export interface Thesis {
    id: string;
    caseId: string;
    category: ThesisCategory;
    title: string;
    content: string;
    selected: boolean;
    orderIndex: number;
    createdAt: Date;
}

export type ThesisCategory = 'preliminares' | 'merito';

// Jurisprudence
export interface Jurisprudence {
    id: string;
    tribunal: string;
    processNumber: string;
    decisionDate: Date;
    summary: string;
    fullText: string;
    externalLink: string;
    createdAt: Date;
}

// AI Logs
export interface AILog {
    id: string;
    userId: string;
    actionType: AIActionType;
    model: string;
    promptTokens: number;
    completionTokens: number;
    createdAt: Date;
}

export type AIActionType =
    | 'suggest_theses'
    | 'generate_document'
    | 'rewrite_paragraph'
    | 'search_jurisprudence';

// Metrics
export interface MetricsEvent {
    id: string;
    lawFirmId: string;
    userId: string;
    eventType: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
}

// ================================
// API Request/Response Types
// ================================

// Auth
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    lawFirmName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RefreshRequest {
    refreshToken: string;
}

// Cases
export interface CreateCaseRequest {
    clientName: string;
    caseType: string;
    factsDescription: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateCaseRequest {
    clientName?: string;
    caseType?: string;
    factsDescription?: string;
    status?: CaseStatus;
    metadata?: Record<string, unknown>;
}

// Documents
export interface CreateDocumentRequest {
    caseId: string;
    title: string;
    documentType: DocumentType;
}

export interface UpdateDocumentRequest {
    title?: string;
    contentHtml?: string;
    sections?: DocumentSection[];
    status?: DocumentStatus;
}

export interface GenerateDocumentRequest {
    caseId: string;
    documentType: DocumentType;
    thesisIds: string[];
    jurisprudenceIds: string[];
}

export interface ExportDocumentRequest {
    documentId: string;
    format: 'pdf' | 'docx' | 'txt';
}

export interface ExportDocumentResponse {
    downloadUrl: string;
    fileName: string;
}

// AI
export interface SuggestThesesRequest {
    caseId: string;
}

export interface SuggestThesesResponse {
    theses: Thesis[];
}

export interface RewriteParagraphRequest {
    documentId?: string;
    paragraphId?: string;
    originalText: string;
    instruction: 'improve' | 'simplify' | 'expand' | 'formal' | 'custom';
    customInstruction?: string;
}

export interface RewriteParagraphResponse {
    rewrittenText: string;
}

// Jurisprudence
export interface SearchJurisprudenceRequest {
    caseId?: string;
    keywords: string;
    tribunal?: string;
    year?: number;
    page?: number;
    limit?: number;
}

export interface SearchJurisprudenceResponse {
    results: Jurisprudence[];
    total: number;
    page: number;
    totalPages: number;
}

// Metrics
export interface TrackEventRequest {
    eventType: string;
    metadata?: Record<string, unknown>;
}

// ================================
// Pagination
// ================================

export interface PaginatedRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ================================
// API Error Response
// ================================

export interface APIError {
    error: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
}
