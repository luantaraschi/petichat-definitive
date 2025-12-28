import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { metricsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subscriptionPlanLabels } from '@petichat/shared';
import { User, Building, CreditCard, Bell, Loader2 } from 'lucide-react';

export function SettingsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: usage, isLoading } = useQuery({
        queryKey: ['usage'],
        queryFn: () => metricsApi.getUsage(),
    });

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">
                    Gerencie sua conta e configurações do escritório
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="office" className="gap-2">
                        <Building className="h-4 w-4" />
                        Escritório
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Plano
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notificações
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                            <CardDescription>
                                Atualize seus dados de perfil
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome completo</Label>
                                    <Input id="name" defaultValue={user?.name || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                                </div>
                            </div>
                            <Button>Salvar Alterações</Button>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Alterar Senha</CardTitle>
                            <CardDescription>
                                Defina uma nova senha para sua conta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Senha atual</Label>
                                    <Input id="currentPassword" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova senha</Label>
                                    <Input id="newPassword" type="password" />
                                </div>
                            </div>
                            <Button variant="outline">Alterar Senha</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Office Tab */}
                <TabsContent value="office">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Escritório</CardTitle>
                            <CardDescription>
                                Informações do seu escritório de advocacia
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="officeName">Nome do Escritório</Label>
                                    <Input id="officeName" placeholder="Advocacia Silva & Associados" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                                    <Input id="cnpj" placeholder="00.000.000/0000-00" />
                                </div>
                            </div>
                            <Button>Salvar</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seu Plano</CardTitle>
                            <CardDescription>
                                Gerencie sua assinatura e uso
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex h-32 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold">
                                                Plano {subscriptionPlanLabels[usage?.plan] || usage?.plan}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {usage?.isUnlimited
                                                    ? 'Uso ilimitado'
                                                    : `${usage?.usage?.documents || 0} de ${usage?.limits?.documents || 0} documentos`}
                                            </p>
                                        </div>
                                        <Button>Fazer Upgrade</Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Documentos este mês</p>
                                            <p className="text-2xl font-bold">
                                                {usage?.usage?.documents || 0}
                                                {!usage?.isUnlimited && (
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        {' '}/ {usage?.limits?.documents}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Chamadas de IA</p>
                                            <p className="text-2xl font-bold">
                                                {usage?.usage?.aiCalls || 0}
                                                {!usage?.isUnlimited && (
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        {' '}/ {usage?.limits?.aiCalls}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências de Notificação</CardTitle>
                            <CardDescription>
                                Configure como você deseja receber notificações
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Configurações de notificação em breve...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
