-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'member', 'admin');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('trial', 'basic', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "UserLawFirmRole" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('petition', 'contestation', 'appeal', 'motion', 'brief', 'contract', 'other');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'completed');

-- CreateEnum
CREATE TYPE "ThesisCategory" AS ENUM ('preliminares', 'merito');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "law_firms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'trial',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "law_firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_law_firms" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "law_firm_id" TEXT NOT NULL,
    "role" "UserLawFirmRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_law_firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "law_firm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "case_type" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'draft',
    "facts_description" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
    "content_html" TEXT NOT NULL,
    "sections" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "content_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theses" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "category" "ThesisCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisprudences" (
    "id" TEXT NOT NULL,
    "tribunal" TEXT NOT NULL,
    "process_number" TEXT NOT NULL,
    "decision_date" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "full_text" TEXT NOT NULL,
    "external_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jurisprudences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_events" (
    "id" TEXT NOT NULL,
    "law_firm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_law_firms_user_id_law_firm_id_key" ON "user_law_firms"("user_id", "law_firm_id");

-- CreateIndex
CREATE INDEX "cases_law_firm_id_idx" ON "cases"("law_firm_id");

-- CreateIndex
CREATE INDEX "cases_user_id_idx" ON "cases"("user_id");

-- CreateIndex
CREATE INDEX "legal_documents_case_id_idx" ON "legal_documents"("case_id");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "document_versions"("document_id");

-- CreateIndex
CREATE INDEX "theses_case_id_idx" ON "theses"("case_id");

-- CreateIndex
CREATE INDEX "jurisprudences_tribunal_idx" ON "jurisprudences"("tribunal");

-- CreateIndex
CREATE INDEX "jurisprudences_decision_date_idx" ON "jurisprudences"("decision_date");

-- CreateIndex
CREATE INDEX "ai_logs_user_id_idx" ON "ai_logs"("user_id");

-- CreateIndex
CREATE INDEX "ai_logs_created_at_idx" ON "ai_logs"("created_at");

-- CreateIndex
CREATE INDEX "metrics_events_law_firm_id_idx" ON "metrics_events"("law_firm_id");

-- CreateIndex
CREATE INDEX "metrics_events_user_id_idx" ON "metrics_events"("user_id");

-- CreateIndex
CREATE INDEX "metrics_events_event_type_idx" ON "metrics_events"("event_type");

-- CreateIndex
CREATE INDEX "metrics_events_created_at_idx" ON "metrics_events"("created_at");

-- AddForeignKey
ALTER TABLE "user_law_firms" ADD CONSTRAINT "user_law_firms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_law_firms" ADD CONSTRAINT "user_law_firms_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theses" ADD CONSTRAINT "theses_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_events" ADD CONSTRAINT "metrics_events_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_events" ADD CONSTRAINT "metrics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
