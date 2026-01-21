# PetiChat | Claude Agent Brief (claude.md)

## 1) Objetivo do projeto
PetiChat é uma plataforma SaaS para advogados criarem Petições Iniciais com apoio de IA, com foco em:
- Jurisprudência real com rastreabilidade e metadados obrigatórios
- Editor de documento forte com IA inline (por seleção de texto)
- Wizard guiado para coletar dados do caso, sugerir teses, selecionar jurisprudência e gerar o documento final
- Deploy em VPS Hostinger usando Coolify, com serviços Docker

## 2) Princípios do produto
- Nunca inserir jurisprudência sem fonte e metadados mínimos
- Reduzir fricção no wizard, priorizando perguntas objetivas e validações
- Editor com experiência de produto “pronto”, com states completos (loading, empty, error)
- Multi-tenant por organização desde o início
- Auditoria por geração (quem gerou, quando, fontes usadas, custo estimado)

## 3) Fluxo do usuário (wizard)
Fluxo recomendado para o MVP:

0. Template e contexto: escolher modelo, área, rito, tribunal/foro
1. Fatos do caso: texto + opcional anexos (PDF/DOCX/TXT)
2. Triagem: perguntas da IA para preencher lacunas obrigatórias
3. Preliminares e parâmetros: gratuidade, competência, valor da causa, tom
4. Teses e pedidos: sugestões da IA + edição manual, em blocos com status
5. Jurisprudência: busca e seleção com recortes relevantes e metadados
6. Editor final: geração e edição com IA inline e inserção de citações estruturadas
7. Export e checklist final: DOCX e PDF (PDF pode entrar na fase 2)

## 4) Diferenciais obrigatórios do PetiChat
- Jurisprudência como objeto citável: tribunal, órgão, data, relator (se existir), número, fonte, trecho, link (quando disponível)
- Modo Evidência no editor: card de citação com metadados, colapsável para nota
- Checklist pré geração: campos faltantes, inconsistências, pedidos sem fundamento
- IA inline no editor: reescrever, expandir, reduzir, formalizar, fundamentar com jurisprudência selecionada, criar tópico, criar pedidos

## 5) Stack tecnológica (MVP)
Frontend:
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- React Hook Form + Zod
- TanStack Query

Editor:
- TipTap (ProseMirror) com nodes custom (ThesisBlock, CitationCard, HeadingAnchor, ChecklistItem)

Backend:
- Next.js Route Handlers (REST simples no início)
- Workers Node.js para tarefas longas

Dados e busca:
- PostgreSQL + Prisma (v7)
- pgvector para embeddings
- Busca híbrida: Postgres FTS + pgvector

Fila e cache:
- Redis + BullMQ

Arquivos:
- S3 compatível (recomendado) ou MinIO no Coolify
- Upload via presigned URL

Observabilidade:
- Sentry (frontend e backend)
- Logs estruturados

Testes:
- Vitest (unit e integração)
- Playwright (E2E do wizard e export)

Infra:
- Docker + Coolify
- Serviços: web, worker, postgres (pgvector), redis, minio (opcional)

## 6) Jurisprudência real (MVP)
Fonte inicial sugerida:
- STJ Portal de Dados Abertos (datasets de acórdãos e espelhos)

Pipeline:
1. Ingestão: baixar dataset, armazenar bruto
2. Normalização: padronizar campos, deduplicar
3. Chunking: ementa e trechos relevantes
4. Embeddings: gerar vetores por chunk
5. Index: salvar em Postgres (pgvector) com metadados
6. Busca: híbrida (FTS + vetor) e rerank simples

Regra de ouro:
- Nenhuma citação entra no documento sem metadados mínimos e fonte registrada

## 7) Modelos de dados (alvo do Prisma)
Entidades principais:
- User
- Organization
- Membership (user x org)
- Template (modelo de petição)
- Case (caso do cliente)
- CaseAttachment (anexos)
- Thesis (blocos de tese e pedidos)
- Jurisprudence (registro normalizado)
- JurisprudenceChunk (trechos com embedding)
- Citation (ligação de chunk com tese e com documento)
- Document (draft e versões)
- AuditLog (eventos e custos)

Regras multi-tenant:
- Toda tabela com dados do usuário deve ter organizationId
- Acesso sempre filtrado por organizationId e permissões do membership

## 8) API (REST) e contratos
Rotas iniciais:
- POST /api/auth/* (Auth.js)
- GET /api/templates
- POST /api/cases
- GET /api/cases/:id
- POST /api/cases/:id/triage
- POST /api/cases/:id/theses/suggest
- POST /api/juris/search
- POST /api/documents/generate
- POST /api/editor/inline-action

Contratos:
- Validar entradas com Zod em todas as rotas
- Retornar erros com shape consistente { code, message, details }

## 9) Editor e IA inline (requisitos mínimos)
Editor TipTap deve suportar:
- Sumário automático baseado em headings
- Inserção de CitationCard como node com metadados
- Toolbar: headings, bold, italic, listas, alinhamento, estilos básicos
- Bubble menu: ações de IA por seleção (rewrite, expand, shorten, formalize, cite)
- Sidebar: teses e jurisprudências selecionadas, com drag and drop opcional

Ações IA inline:
- As ações nunca substituem silenciosamente. Sempre mostrar preview e aplicar por confirmação
- Registrar AuditLog por ação

## 10) UI e design (tokens)
Tema dark e light por CSS variables, seguindo os tokens do guia.
Componentes base obrigatórios:
- AppShell (Header + Sidebar)
- ActionCard
- TemplateCard
- FilterPill
- StatsCard
- LearnCarouselCard
- WizardStepper
- ThesisBlock
- JurisCard
- CitationCard

States obrigatórios:
- loading, empty, error, disabled

## 11) Padrões de desenvolvimento
Convensões:
- TypeScript strict
- Nada de any
- Funções pequenas e nomeadas
- Separar server e client components corretamente
- Não colocar segredos no repo
- Logar eventos relevantes no backend com requestId

Qualidade:
- PR só passa com lint, typecheck e testes
- Playwright rodando no CI para o fluxo wizard básico

## 12) Deploy no Coolify
Serviços:
- web: Next.js
- worker: BullMQ
- postgres: com extensão pgvector habilitada
- redis
- minio (opcional)

Regras:
- Variáveis de ambiente no Coolify
- Volumes persistentes para Postgres e MinIO
- Backups automáticos do Postgres

## 13) Integração com AntiGravity e Validators
Workflow recomendado:
1. Claude define arquitetura, schemas, rotas, contratos, store e wiring
2. AntiGravity gera UI conforme ui_contract e tokens do design
3. Claude integra UI com API, implementa editor e actions
4. Validators rodam: lint, typecheck, vitest, playwright, build

Arquivos de contexto compartilhado (criar no repo):
- /ai/specs.json
- /ai/ui_contract.json
- /ai/status.json

## 14) Primeira sprint (tarefas objetivas)
T1. Bootstrap repo Next.js + Tailwind + shadcn/ui + Auth.js
T2. Prisma schema inicial + migração + seed de templates
T3. AppShell + Home + Templates page (UI completa com states)
T4. Wizard Stepper com store e validações Zod
T5. Juris search endpoint mock + UI JurisCard + seleção
T6. TipTap editor base + CitationCard node + bubble menu IA (mock)
T7. Worker BullMQ + filas básicas (generateDocument, ingestJuris)
T8. Playwright E2E: wizard completo até editor e export DOCX (mock)

## 15) Regras importantes para decisões técnicas
- Priorizar simplicidade no MVP, mas com base sólida para evoluir
- Não bloquear o MVP em features de colaboração
- Garantir rastreabilidade da jurisprudência desde o primeiro release
- Editor precisa ser robusto e previsível, sem UI instável

