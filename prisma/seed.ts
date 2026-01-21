import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const templates = [
  // Administrativo
  {
    name: "Abertura de Processo Administrativo",
    description:
      "Requeira a instauração de procedimento para apuração de irregularidades",
    category: "Administrativo",
    area: "Direito Administrativo",
    isPopular: true,
    structure: { sections: ["qualificacao", "fatos", "direito", "pedidos"] },
  },
  {
    name: "Pedido de Informações",
    description:
      "Solicite dados oficiais, resguardando o direito de acesso à informação",
    category: "Administrativo",
    area: "Direito Administrativo",
    structure: { sections: ["qualificacao", "objeto", "fundamentacao", "pedido"] },
  },
  {
    name: "Pedido de Reconsideração",
    description: "Solicite nova análise de decisão administrativa desfavorável",
    category: "Administrativo",
    area: "Direito Administrativo",
    structure: { sections: ["qualificacao", "decisao_recorrida", "razoes", "pedido"] },
  },
  // Cível
  {
    name: "Ação de Cobrança",
    description: "Cobre valores devidos por inadimplemento contratual",
    category: "Civel",
    area: "Direito Civil",
    isPopular: true,
    structure: { sections: ["qualificacao", "fatos", "direito", "valor", "pedidos"] },
  },
  {
    name: "Ação de Alimentos",
    description: "Requeira prestação alimentícia para dependentes",
    category: "Civel",
    area: "Direito de Família",
    isPopular: true,
    structure: { sections: ["qualificacao", "relacao_familiar", "necessidade", "possibilidade", "pedidos"] },
  },
  {
    name: "Ação de Divórcio",
    description: "Dissolva o vínculo matrimonial de forma consensual ou litigiosa",
    category: "Civel",
    area: "Direito de Família",
    structure: { sections: ["qualificacao", "casamento", "bens", "filhos", "pedidos"] },
  },
  {
    name: "Ação de Indenização",
    description: "Busque reparação por danos materiais e/ou morais sofridos",
    category: "Civel",
    area: "Responsabilidade Civil",
    isPopular: true,
    structure: { sections: ["qualificacao", "fatos", "danos", "nexo", "quantum", "pedidos"] },
  },
  {
    name: "Ação Revisional de Contrato",
    description: "Revise cláusulas contratuais abusivas ou desequilibradas",
    category: "Civel",
    area: "Direito Contratual",
    structure: { sections: ["qualificacao", "contrato", "clausulas_abusivas", "revisao", "pedidos"] },
  },
  {
    name: "Apelação Cível",
    description: "Recorra de sentença de primeiro grau ao tribunal",
    category: "Civel",
    area: "Direito Processual Civil",
    isPopular: true,
    structure: { sections: ["cabimento", "tempestividade", "razoes", "pedido"] },
  },
  // Consumidor
  {
    name: "Ação de Reparação de Danos (CDC)",
    description: "Busque reparação por vícios ou defeitos em produtos/serviços",
    category: "Consumidor",
    area: "Direito do Consumidor",
    isPopular: true,
    structure: { sections: ["qualificacao", "relacao_consumo", "vicio_defeito", "danos", "pedidos"] },
  },
  {
    name: "Ação de Negativação Indevida",
    description: "Requeira exclusão de registro indevido e indenização",
    category: "Consumidor",
    area: "Direito do Consumidor",
    structure: { sections: ["qualificacao", "negativacao", "irregularidade", "danos", "pedidos"] },
  },
  // Trabalhista
  {
    name: "Reclamação Trabalhista",
    description: "Pleiteie direitos trabalhistas violados pelo empregador",
    category: "Trabalhista",
    area: "Direito do Trabalho",
    isPopular: true,
    structure: { sections: ["qualificacao", "contrato", "verbas", "pedidos"] },
  },
  {
    name: "Recurso Ordinário Trabalhista",
    description: "Recorra de sentença da Vara do Trabalho",
    category: "Trabalhista",
    area: "Direito Processual do Trabalho",
    structure: { sections: ["cabimento", "razoes", "pedido"] },
  },
  // Penal
  {
    name: "Habeas Corpus",
    description: "Proteja a liberdade de locomoção contra ilegalidade ou abuso",
    category: "Penal",
    area: "Direito Penal",
    isPopular: true,
    structure: { sections: ["autoridade_coatora", "paciente", "constrangimento", "pedido"] },
  },
  {
    name: "Resposta à Acusação",
    description: "Apresente defesa preliminar após recebimento da denúncia",
    category: "Penal",
    area: "Direito Processual Penal",
    structure: { sections: ["qualificacao", "preliminares", "merito", "provas", "pedidos"] },
  },
  {
    name: "Apelação Criminal",
    description: "Recorra de sentença penal condenatória ou absolutória",
    category: "Penal",
    area: "Direito Processual Penal",
    isPopular: true,
    structure: { sections: ["cabimento", "razoes", "pedido"] },
  },
  // Tributário
  {
    name: "Mandado de Segurança (Tributário)",
    description: "Impugne ato de autoridade tributária que viole direito líquido e certo",
    category: "Tributario",
    area: "Direito Tributário",
    structure: { sections: ["autoridade", "ato_coator", "direito_liquido", "pedido_liminar", "pedidos"] },
  },
  {
    name: "Ação Anulatória de Débito Fiscal",
    description: "Anule lançamento tributário indevido ou ilegal",
    category: "Tributario",
    area: "Direito Tributário",
    structure: { sections: ["qualificacao", "lancamento", "nulidades", "pedidos"] },
  },
];

async function main() {
  console.log("Seeding database...");

  // Create templates if none exist
  const existingTemplates = await prisma.template.count();
  if (existingTemplates === 0) {
    await prisma.template.createMany({
      data: templates.map((t) => ({
        name: t.name,
        description: t.description,
        category: t.category,
        area: t.area,
        isPopular: t.isPopular ?? false,
        structure: t.structure,
      })),
    });
    console.log(`Created ${templates.length} templates`);
  } else {
    console.log(`Templates already exist (${existingTemplates}), skipping...`);
  }

  // Create a demo organization and user for development
  const existingOrg = await prisma.organization.findFirst({
    where: { slug: "demo" },
  });

  if (!existingOrg) {
    const org = await prisma.organization.create({
      data: {
        name: "Escritório Demo",
        slug: "demo",
        plan: "PRO",
      },
    });

    const passwordHash = await hash("password123", 12);

    const user = await prisma.user.create({
      data: {
        email: "admin@petichat.com",
        name: "Administrador Demo",
        passwordHash,
      },
    });

    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: "OWNER",
      },
    });

    console.log("Created demo organization and admin user");
    console.log("  Email: admin@petichat.com");
    console.log("  Password: password123");
  } else {
    console.log("Demo organization already exists, skipping...");
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
