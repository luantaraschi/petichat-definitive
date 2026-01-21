"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, History, FileText, Heart, Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categories = [
  "Todos",
  "Administrativo",
  "Civel",
  "Consumidor",
  "Penal",
  "Trabalhista",
  "Tributario",
];

const templates = [
  {
    id: "1",
    name: "Abertura de Processo Administrativo",
    description: "Requeira a instauração de procedimento para apuração",
    category: "Administrativo",
    isPopular: true,
  },
  {
    id: "2",
    name: "Pedido de Informações",
    description: "Solicite dados oficiais, resguardando o direito de acesso",
    category: "Administrativo",
    isPopular: false,
  },
  {
    id: "3",
    name: "Ação de Cobrança",
    description: "Cobre valores devidos por inadimplemento contratual",
    category: "Civel",
    isPopular: true,
  },
  {
    id: "4",
    name: "Ação de Alimentos",
    description: "Requeira prestação alimentícia para dependentes",
    category: "Civel",
    isPopular: true,
  },
  {
    id: "5",
    name: "Ação de Indenização",
    description: "Busque reparação por danos materiais e/ou morais",
    category: "Civel",
    isPopular: true,
  },
  {
    id: "6",
    name: "Apelação Cível",
    description: "Recorra de sentença de primeiro grau ao tribunal",
    category: "Civel",
    isPopular: true,
  },
  {
    id: "7",
    name: "Ação de Reparação de Danos (CDC)",
    description: "Reparação por vícios ou defeitos em produtos/serviços",
    category: "Consumidor",
    isPopular: true,
  },
  {
    id: "8",
    name: "Ação de Negativação Indevida",
    description: "Exclusão de registro indevido e indenização",
    category: "Consumidor",
    isPopular: false,
  },
  {
    id: "9",
    name: "Habeas Corpus",
    description: "Proteja a liberdade contra ilegalidade ou abuso",
    category: "Penal",
    isPopular: true,
  },
  {
    id: "10",
    name: "Apelação Criminal",
    description: "Recorra de sentença penal condenatória",
    category: "Penal",
    isPopular: true,
  },
  {
    id: "11",
    name: "Reclamação Trabalhista",
    description: "Pleiteie direitos trabalhistas violados",
    category: "Trabalhista",
    isPopular: true,
  },
  {
    id: "12",
    name: "Mandado de Segurança (Tributário)",
    description: "Impugne ato que viole direito líquido e certo",
    category: "Tributario",
    isPopular: false,
  },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "Todos" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedTemplates = filteredTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, typeof templates>
  );

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Peças Jurídicas</h1>
        <p className="text-muted-foreground">
          Modelos jurídicos estruturados conforme exigências legais
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Procure aqui a peça"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="create">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          <Button variant="link" className="text-primary">
            Não encontrou a peça desejada? Clique aqui e sugira!
          </Button>
        </div>

        <TabsContent value="create" className="space-y-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates by Category */}
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-semibold">
                {category}{" "}
                <span className="text-muted-foreground">
                  ({categoryTemplates.length} templates)
                </span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="group cursor-pointer transition-all hover:shadow-md"
                  >
                    <Link href={`/cases/new?template=${template.id}`}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {template.name}
                            </CardTitle>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(template.id);
                          }}
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              favorites.includes(template.id)
                                ? "fill-orange-500 text-orange-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                        {template.isPopular && (
                          <Badge variant="warning" className="mt-3">
                            <Star className="mr-1 h-3 w-3" />
                            Popular
                          </Badge>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </TabsContent>

        <TabsContent value="history">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">Nenhuma peça criada ainda</h3>
            <p className="text-muted-foreground">
              Suas peças criadas aparecerão aqui
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
