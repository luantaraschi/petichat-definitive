# PetiChat

<p align="center">
  <strong>🏛️ Plataforma de IA Jurídica para Advogados Brasileiros</strong>
</p>

<p align="center">
  Crie petições, contestações e recursos com auxílio de inteligência artificial.
</p>

---

## 📋 Sobre o Projeto

**PetiChat** é um SaaS B2B para advogados e pequenos escritórios brasileiros, focado em:

- 📝 **Criação guiada de peças jurídicas** via IA (petição inicial, contestação, recursos, etc.)
- 💡 **Sugestão de teses jurídicas** (preliminares e mérito)
- 📚 **Busca de jurisprudências** com RAG sobre base própria
- ✏️ **Editor de textos com IA** (reescrita, melhoria, expansão)
- 📄 **Exportação em DOCX/PDF**
- 📊 **Métricas de uso** para escritório

## 🛠️ Stack Tecnológica

### Frontend (`apps/web`)
- **React 18** + **TypeScript**
- **Vite** para build
- **TailwindCSS** + **Shadcn/ui** para UI
- **Zustand** para estado global
- **React Query (TanStack Query)** para data fetching
- **React Hook Form** + **Zod** para formulários
- **Lucide** para ícones

### Backend (`apps/api`)
- **Node.js** + **TypeScript**
- **Fastify** para HTTP
- **Prisma** como ORM
- **PostgreSQL** para banco de dados
- **Redis** para cache e rate limiting
- **OpenAI** (preparado para Anthropic/Gemini)

### DevOps
- **pnpm workspaces** (monorepo)
- **Docker** + **docker-compose**
- Pronto para deploy em Vercel/Railway/Fly.io

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- PostgreSQL (ou use Docker)
- Redis (ou use Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/petichat.git
cd petichat
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas configurações
# (veja seção de Variáveis de Ambiente abaixo)
```

### 4. Inicie o banco de dados (opcional - com Docker)

```bash
docker-compose up -d db redis
```

### 5. Execute as migrations

```bash
pnpm db:migrate
```

### 6. Inicie o projeto em desenvolvimento

```bash
pnpm dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

---

## 🐳 Usando Docker (Completo)

Para rodar toda a stack com Docker:

```bash
# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas API keys

# Suba todos os serviços
docker-compose up --build

# Acesse
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/petichat` |
| `REDIS_URL` | URL de conexão Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Chave secreta para JWT | `gerar-chave-aleatória-aqui` |
| `JWT_REFRESH_SECRET` | Chave para refresh tokens | `outra-chave-aleatória` |
| `OPENAI_API_KEY` | Chave da API OpenAI | `sk-...` |

### Opcionais

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `AI_PROVIDER` | Provider de IA (`openai`, `anthropic`, `google`, `mock`) | `openai` |
| `OPENAI_MODEL` | Modelo OpenAI a usar | `gpt-4-turbo-preview` |
| `ANTHROPIC_API_KEY` | Chave API Anthropic (opcional) | - |
| `GOOGLE_AI_API_KEY` | Chave Google AI (opcional) | - |
| `API_PORT` | Porta do servidor API | `3001` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:5173` |
| `LOG_LEVEL` | Nível de log | `info` |

---

## 📂 Estrutura do Projeto

```
PetiChat/
├── apps/
│   ├── web/                    # Frontend React
│   │   ├── src/
│   │   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── pages/          # Páginas da aplicação
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── services/       # Cliente API
│   │   │   └── lib/            # Utilitários
│   │   └── ...
│   │
│   └── api/                    # Backend Fastify
│       ├── src/
│       │   ├── modules/        # Módulos de features
│       │   │   ├── auth/       # Autenticação
│       │   │   ├── cases/      # Casos jurídicos
│       │   │   ├── documents/  # Documentos
│       │   │   ├── ai/         # Integração IA
│       │   │   └── ...
│       │   └── services/       # Serviços de negócio
│       └── prisma/             # Schema e migrations
│
├── packages/
│   └── shared/                 # Tipos e utilitários compartilhados
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/me` - Dados do usuário logado

### Casos
- `GET /api/cases` - Listar casos
- `POST /api/cases` - Criar caso
- `GET /api/cases/:id` - Detalhes do caso
- `PATCH /api/cases/:id` - Atualizar caso

### Documentos
- `GET /api/documents` - Listar documentos
- `POST /api/documents` - Criar documento
- `PATCH /api/documents/:id` - Atualizar documento
- `POST /api/documents/export` - Exportar PDF/DOCX

### IA
- `POST /api/ai/suggest-theses` - Sugerir teses
- `POST /api/ai/generate-document` - Gerar documento
- `POST /api/ai/rewrite-paragraph` - Reescrever trecho

### Jurisprudência
- `POST /api/jurisprudence/search` - Buscar jurisprudências

### Métricas
- `POST /api/metrics/track` - Registrar evento
- `GET /api/metrics/dashboard` - Dados do dashboard

---

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Testes com cobertura
pnpm test:coverage

# Apenas backend
cd apps/api && pnpm test

# Apenas frontend
cd apps/web && pnpm test
```

---

## 🚢 Deploy

### Frontend (Vercel/Netlify)

1. Conecte o repositório
2. Configure:
   - **Build Command**: `pnpm build`
   - **Output Directory**: `apps/web/dist`
   - **Root Directory**: `.`

### Backend (Railway/Render/Fly.io)

1. Use o `Dockerfile.api`
2. Configure variáveis de ambiente
3. Aponte para PostgreSQL e Redis externos

### Banco de Dados

Recomendados:
- **PostgreSQL**: Supabase, Neon, Railway
- **Redis**: Upstash, Redis Cloud

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato.
