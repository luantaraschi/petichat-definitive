import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@petichat/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/services/api';
import { Loader2 } from 'lucide-react';

export function RegisterPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);
            setAuth(response.user as any, response.accessToken, response.refreshToken);
            toast({
                title: 'Conta criada!',
                description: 'Bem-vindo ao PetiChat.',
            });
            navigate('/');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro no cadastro',
                description: error.response?.data?.message || 'Erro ao criar conta.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Criar conta</CardTitle>
                <CardDescription>
                    Preencha os dados abaixo para começar a usar o PetiChat
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                            id="name"
                            placeholder="João Silva"
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lawFirmName">Nome do Escritório</Label>
                        <Input
                            id="lawFirmName"
                            placeholder="Advocacia Silva & Associados"
                            {...register('lawFirmName')}
                        />
                        {errors.lawFirmName && (
                            <p className="text-sm text-destructive">{errors.lawFirmName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar conta
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Entrar
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
