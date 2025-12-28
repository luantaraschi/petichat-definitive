import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    FileText,
    Clock,
    TrendingUp,
    ArrowRight,
    FileCheck2,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { metricsApi } from '@/services/api';
import { documentTypeLabels, formatDateTimeBR } from '@petichat/shared';

export function DashboardPage() {
    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => metricsApi.getDashboard(),
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Acompanhe suas métricas e acesse suas peças jurídicas
                    </p>
                </div>
                <Link to="/templates">
                    <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        Nova Peça
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total de Casos
                        </CardTitle>
                        <FileCheck2 className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{dashboard?.overview?.totalCases || 0}</p>
                        <p className="text-xs text-muted-foreground">casos ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Documentos Gerados
                        </CardTitle>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{dashboard?.overview?.totalDocuments || 0}</p>
                        <p className="text-xs text-muted-foreground">
                            +{dashboard?.overview?.documentsLast30Days || 0} nos últimos 30 dias
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tempo Economizado
                        </CardTitle>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {dashboard?.overview?.timeSavedFormatted || '0h'}
                        </p>
                        <p className="text-xs text-muted-foreground">estimativa total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Uso de IA
                        </CardTitle>
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {dashboard?.aiUsage?.callsLast7Days || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">chamadas nos últimos 7 dias</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Documentos Recentes</CardTitle>
                        <Link to="/cases">
                            <Button variant="ghost" size="sm">
                                Ver todos
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {dashboard?.recentDocuments?.length > 0 ? (
                        <div className="space-y-4">
                            {dashboard.recentDocuments.map((doc: any) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{doc.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {doc.clientName} •{' '}
                                                {documentTypeLabels[doc.documentType] || doc.documentType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDateTimeBR(doc.createdAt)}
                                        </span>
                                        <Link to={`/document/${doc.id}`}>
                                            <Button variant="outline" size="sm">
                                                Abrir
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-32 flex-col items-center justify-center text-center">
                            <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">Nenhum documento ainda</p>
                            <Link to="/templates" className="mt-2">
                                <Button variant="link" size="sm">
                                    Criar seu primeiro documento
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
