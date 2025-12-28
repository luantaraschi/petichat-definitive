import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { casesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { caseStatusLabels, formatDateBR } from '@petichat/shared';
import { Plus, Search, FolderOpen, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function CasesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['cases', searchQuery],
        queryFn: () => casesApi.list({ search: searchQuery || undefined }),
    });

    const cases = data?.data || [];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Casos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os casos do seu escritório
                    </p>
                </div>
                <Link to="/templates">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Caso
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar casos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Cases List */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : cases.length > 0 ? (
                <div className="grid gap-4">
                    {cases.map((caseItem: any) => (
                        <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <FolderOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{caseItem.clientName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {caseItem.caseType}
                                        </p>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>Criado em {formatDateBR(caseItem.createdAt)}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {caseItem._count?.legalDocuments || 0} documentos
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                            caseItem.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : caseItem.status === 'archived'
                                                    ? 'bg-gray-100 text-gray-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                        )}
                                    >
                                        {caseStatusLabels[caseItem.status]}
                                    </span>
                                    <Link to={`/wizard/petition-civil?caseId=${caseItem.id}`}>
                                        <Button variant="outline" size="sm">
                                            Abrir
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex h-64 flex-col items-center justify-center">
                        <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Nenhum caso encontrado</h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? 'Tente ajustar sua busca'
                                : 'Crie seu primeiro caso para começar'}
                        </p>
                        {!searchQuery && (
                            <Link to="/templates" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Caso
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Pagination info */}
            {data && data.total > 0 && (
                <p className="text-sm text-muted-foreground">
                    Mostrando {cases.length} de {data.total} casos
                </p>
            )}
        </div>
    );
}
