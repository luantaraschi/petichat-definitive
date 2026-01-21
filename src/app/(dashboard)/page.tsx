"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FileText,
  Search,
  MessageSquare,
  Mic,
  Scale,
  Edit,
  Clock,
  FileCheck,
  Bot,
  BarChart,
  Plus,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const actionCards = [
  {
    icon: FileText,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    title: "Crie uma Peça Jurídica",
    description: "Peça pronta, estruturada e fundamentada",
    cta: "Criar Peça",
    href: "/templates",
  },
  {
    icon: BarChart,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    title: "Analise um Processo",
    description: "Pontos-chave, riscos e estratégia",
    cta: "Iniciar Análise",
    href: "/cases",
  },
  {
    icon: MessageSquare,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    title: "Interaja com Agentes de IA",
    description: "IA treinada por área do Direito",
    cta: "Ver Agentes",
    href: "/agents",
  },
];

const shortcuts = [
  {
    icon: Mic,
    title: "Transcrição de Mídia",
    description: "Extraia texto de áudios e vídeos",
  },
  {
    icon: Search,
    title: "Busca por Jurisprudências",
    description: "+9M Jurisprudências reais",
  },
  {
    icon: Edit,
    title: "Reescrita",
    description: "Reescreva com ajuda da IA",
  },
];

const stats = [
  { label: "Horas Poupadas", value: "72h", icon: Clock },
  { label: "Peças Criadas com IA", value: "3", icon: FileCheck },
  { label: "Interações com a IA", value: "0", icon: Bot },
  { label: "Processos Analisados", value: "0", icon: BarChart },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(" ")[0] ?? "Usuário";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Bem-vindo(a) de volta, {firstName}!
            </h1>
            <p className="text-muted-foreground">
              O que você quer fazer agora?
            </p>
          </div>
        </div>
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="O que você quer fazer agora?"
            className="pl-9 pr-16"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
            <span>Ctrl</span>K
          </kbd>
        </div>
      </div>

      {/* Faça Agora */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Faça Agora</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {actionCards.map((card) => (
            <Card
              key={card.title}
              className="group cursor-pointer transition-all hover:shadow-md"
            >
              <Link href={card.href}>
                <CardHeader>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-lg ${card.iconBg}`}
                  >
                    <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 text-lg">{card.title}</CardTitle>
                  <CardDescription className="mb-4">
                    {card.description}
                  </CardDescription>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    <Plus className="h-4 w-4" />
                    {card.cta}
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Atalhos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Atalhos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Card key={shortcut.title} className="cursor-pointer hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <shortcut.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{shortcut.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Abrir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">A IA já trabalhou por você</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <stat.icon className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Floating Chat Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
