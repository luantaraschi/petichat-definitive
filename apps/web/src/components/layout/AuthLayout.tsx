import { Scale } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Branding */}
            <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 lg:flex">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                        <Scale className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">PetiChat</span>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-white">
                        IA Jurídica para
                        <br />
                        Advogados Brasileiros
                    </h1>
                    <p className="text-lg text-white/80">
                        Crie petições, contestações e recursos com auxílio de inteligência
                        artificial. Economize tempo e aumente a qualidade das suas peças
                        jurídicas.
                    </p>
                    <div className="flex gap-8">
                        <div>
                            <p className="text-3xl font-bold text-white">70%</p>
                            <p className="text-sm text-white/70">Redução de tempo</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">1000+</p>
                            <p className="text-sm text-white/70">Advogados ativos</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">50k+</p>
                            <p className="text-sm text-white/70">Peças geradas</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-white/60">
                    © 2024 PetiChat. Todos os direitos reservados.
                </p>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
