import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Scale,
    ShoppingCart,
    Briefcase,
    Shield,
    Users,
    Receipt,
    Building,
    Search,
    FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { documentTemplates, legalAreas } from '@petichat/shared';

const areaIcons: Record<string, React.ElementType> = {
    civil: Scale,
    consumer: ShoppingCart,
    labor: Briefcase,
    criminal: Shield,
    family: Users,
    tax: Receipt,
    administrative: Building,
};

export function TemplatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArea, setSelectedArea] = useState<string>('all');

    const filteredTemplates = documentTemplates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArea = selectedArea === 'all' || template.area === selectedArea;
        return matchesSearch && matchesArea;
    });

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Modelos de Peças</h1>
                <p className="text-muted-foreground">
                    Escolha um modelo para começar a criar sua peça jurídica com IA
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar modelos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Area Tabs */}
            <Tabs value={selectedArea} onValueChange={setSelectedArea}>
                <TabsList className="flex-wrap">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    {legalAreas.map((area) => {
                        const Icon = areaIcons[area.id];
                        return (
                            <TabsTrigger key={area.id} value={area.id} className="gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                {area.name}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <TabsContent value={selectedArea} className="mt-6">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredTemplates.map((template) => {
                                const AreaIcon = areaIcons[template.area] || FileText;
                                const area = legalAreas.find((a) => a.id === template.area);

                                return (
                                    <Card key={template.id} className="group hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                    <AreaIcon className="h-6 w-6 text-primary" />
                                                </div>
                                                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                                                    {area?.name}
                                                </span>
                                            </div>
                                            <CardTitle className="mt-4">{template.name}</CardTitle>
                                            <CardDescription>{template.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Link to={`/wizard/${template.id}`}>
                                                <Button className="w-full">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Iniciar
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center text-center">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">Nenhum modelo encontrado</h3>
                            <p className="text-muted-foreground">
                                Tente ajustar os filtros ou a busca
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
