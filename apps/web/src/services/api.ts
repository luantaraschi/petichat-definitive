import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';

// Base API URL - uses Vite proxy in development
const API_BASE_URL = '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    useAuthStore.getState().setTokens(accessToken, newRefreshToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout user
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// ================================
// API Service Functions
// ================================

import type {
    AuthResponse,
    RegisterRequest,
    LoginRequest,
    Case,
    CreateCaseRequest,
    UpdateCaseRequest,
    LegalDocument,
    CreateDocumentRequest,
    UpdateDocumentRequest,
    GenerateDocumentRequest,
    ExportDocumentResponse,
    SuggestThesesResponse,
    SearchJurisprudenceRequest,
    SearchJurisprudenceResponse,
    PaginatedResponse,
    TrackEventRequest,
} from '@petichat/shared';

// Auth
export const authApi = {
    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

    refresh: (refreshToken: string) =>
        api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

    logout: () => api.post('/auth/logout').then((r) => r.data),

    getMe: () => api.get('/me').then((r) => r.data),
};

// Cases
export const casesApi = {
    list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
        api.get<PaginatedResponse<Case>>('/cases', { params }).then((r) => r.data),

    get: (id: string) => api.get<Case>(`/cases/${id}`).then((r) => r.data),

    create: (data: CreateCaseRequest) =>
        api.post<Case>('/cases', data).then((r) => r.data),

    update: (id: string, data: UpdateCaseRequest) =>
        api.patch<Case>(`/cases/${id}`, data).then((r) => r.data),

    delete: (id: string) => api.delete(`/cases/${id}`).then((r) => r.data),
};

// Documents
export const documentsApi = {
    list: (params?: { page?: number; limit?: number; caseId?: string; status?: string }) =>
        api.get<PaginatedResponse<LegalDocument>>('/documents', { params }).then((r) => r.data),

    get: (id: string) => api.get<LegalDocument>(`/documents/${id}`).then((r) => r.data),

    create: (data: CreateDocumentRequest) =>
        api.post<LegalDocument>('/documents', data).then((r) => r.data),

    update: (id: string, data: UpdateDocumentRequest) =>
        api.patch<LegalDocument>(`/documents/${id}`, data).then((r) => r.data),

    delete: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),

    createVersion: (id: string) =>
        api.post(`/documents/${id}/versions`).then((r) => r.data),

    getVersions: (id: string, params?: { page?: number; limit?: number }) =>
        api.get(`/documents/${id}/versions`, { params }).then((r) => r.data),

    export: (documentId: string, format: 'pdf' | 'docx' | 'txt') =>
        api.post<ExportDocumentResponse>('/documents/export', { documentId, format }).then((r) => r.data),
};

// AI
export const aiApi = {
    suggestTheses: (caseId: string) =>
        api.post<SuggestThesesResponse>('/ai/suggest-theses', { caseId }).then((r) => r.data),

    generateDocument: (data: GenerateDocumentRequest) =>
        api.post<{ document: LegalDocument }>('/ai/generate-document', data).then((r) => r.data),

    rewriteParagraph: (data: {
        originalText: string;
        instruction: string;
        documentId?: string;
        paragraphId?: string;
        customInstruction?: string;
    }) => api.post<{ rewrittenText: string }>('/ai/rewrite-paragraph', data).then((r) => r.data),
};

// Jurisprudence
export const jurisprudenceApi = {
    search: (data: SearchJurisprudenceRequest) =>
        api.post<SearchJurisprudenceResponse>('/jurisprudence/search', data).then((r) => r.data),

    get: (id: string) => api.get(`/jurisprudence/${id}`).then((r) => r.data),

    getTribunals: () =>
        api.get<{ tribunals: string[] }>('/jurisprudence/tribunals/list').then((r) => r.data),
};

// Metrics
export const metricsApi = {
    track: (data: TrackEventRequest) =>
        api.post('/metrics/track', data).then((r) => r.data),

    getDashboard: () => api.get('/metrics/dashboard').then((r) => r.data),

    getUsage: () => api.get('/metrics/usage').then((r) => r.data),
};
