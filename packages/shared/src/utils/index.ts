// ================================
// Shared Utilities
// ================================

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
export function formatDateBR(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
}

/**
 * Format date and time to Brazilian format (DD/MM/YYYY HH:mm)
 */
export function formatDateTimeBR(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Slugify text (remove accents, lowercase, replace spaces with dashes)
 */
export function slugify(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Generate a random ID (for client-side use only)
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Document type labels in Portuguese
 */
export const documentTypeLabels: Record<string, string> = {
    petition: 'Petição Inicial',
    contestation: 'Contestação',
    appeal: 'Recurso',
    motion: 'Requerimento',
    brief: 'Parecer',
    contract: 'Contrato',
    other: 'Outro',
};

/**
 * Case status labels in Portuguese
 */
export const caseStatusLabels: Record<string, string> = {
    draft: 'Rascunho',
    active: 'Ativo',
    archived: 'Arquivado',
};

/**
 * Document status labels in Portuguese
 */
export const documentStatusLabels: Record<string, string> = {
    draft: 'Rascunho',
    completed: 'Concluído',
};

/**
 * Subscription plan labels in Portuguese
 */
export const subscriptionPlanLabels: Record<string, string> = {
    trial: 'Teste',
    basic: 'Básico',
    pro: 'Profissional',
    enterprise: 'Empresarial',
};

/**
 * Thesis category labels in Portuguese
 */
export const thesisCategoryLabels: Record<string, string> = {
    preliminares: 'Preliminares',
    merito: 'Mérito',
};

/**
 * Legal areas for templates
 */
export const legalAreas = [
    { id: 'civil', name: 'Cível', icon: 'scale' },
    { id: 'consumer', name: 'Consumidor', icon: 'shopping-cart' },
    { id: 'labor', name: 'Trabalhista', icon: 'briefcase' },
    { id: 'criminal', name: 'Criminal', icon: 'shield' },
    { id: 'family', name: 'Família', icon: 'users' },
    { id: 'tax', name: 'Tributário', icon: 'receipt' },
    { id: 'administrative', name: 'Administrativo', icon: 'building' },
] as const;

/**
 * Document templates
 */
export const documentTemplates = [
    {
        id: 'petition-civil',
        type: 'petition',
        area: 'civil',
        name: 'Petição Inicial Cível',
        description: 'Modelo padrão para ações cíveis ordinárias',
    },
    {
        id: 'petition-consumer',
        type: 'petition',
        area: 'consumer',
        name: 'Petição Inicial - Direito do Consumidor',
        description: 'Petição inicial para ações consumeristas',
    },
    {
        id: 'contestation-civil',
        type: 'contestation',
        area: 'civil',
        name: 'Contestação Cível',
        description: 'Modelo de contestação para ações ordinárias',
    },
    {
        id: 'appeal-civil',
        type: 'appeal',
        area: 'civil',
        name: 'Recurso de Apelação',
        description: 'Modelo de apelação para segunda instância',
    },
    {
        id: 'petition-labor',
        type: 'petition',
        area: 'labor',
        name: 'Reclamação Trabalhista',
        description: 'Petição inicial trabalhista',
    },
    {
        id: 'petition-family',
        type: 'petition',
        area: 'family',
        name: 'Petição de Divórcio',
        description: 'Modelo para divórcio consensual ou litigioso',
    },
] as const;
