import { describe, it, expect } from "vitest";
import { createCaseSchema, updateCaseSchema, triageSchema } from "@/schemas/case";

describe("Case Schemas", () => {
  describe("createCaseSchema", () => {
    it("should validate a valid case creation", () => {
      const validData = {
        title: "Ação de Cobrança",
        clientName: "João Silva",
        tribunal: "TJSP",
        foro: "Foro Central",
      };

      const result = createCaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require a title with at least 3 characters", () => {
      const invalidData = {
        title: "AB",
      };

      const result = createCaseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate with only required fields", () => {
      const minimalData = {
        title: "Petição Inicial",
      };

      const result = createCaseSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it("should validate templateId as UUID when provided", () => {
      const dataWithTemplate = {
        title: "Test Case",
        templateId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createCaseSchema.safeParse(dataWithTemplate);
      expect(result.success).toBe(true);
    });

    it("should reject invalid templateId format", () => {
      const dataWithInvalidTemplate = {
        title: "Test Case",
        templateId: "not-a-uuid",
      };

      const result = createCaseSchema.safeParse(dataWithInvalidTemplate);
      expect(result.success).toBe(false);
    });
  });

  describe("updateCaseSchema", () => {
    it("should validate partial updates", () => {
      const partialUpdate = {
        facts: "Updated facts about the case",
      };

      const result = updateCaseSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should validate tom enum values", () => {
      const validTom = { tom: "formal" };
      const result = updateCaseSchema.safeParse(validTom);
      expect(result.success).toBe(true);

      const invalidTom = { tom: "invalid" };
      const result2 = updateCaseSchema.safeParse(invalidTom);
      expect(result2.success).toBe(false);
    });

    it("should validate currentStep within range", () => {
      const validStep = { currentStep: 3 };
      const result = updateCaseSchema.safeParse(validStep);
      expect(result.success).toBe(true);

      const invalidStep = { currentStep: 10 };
      const result2 = updateCaseSchema.safeParse(invalidStep);
      expect(result2.success).toBe(false);
    });
  });

  describe("triageSchema", () => {
    it("should validate triage responses", () => {
      const validTriage = {
        responses: {
          question1: "Answer to question 1",
          question2: true,
          question3: 42,
        },
      };

      const result = triageSchema.safeParse(validTriage);
      expect(result.success).toBe(true);
    });

    it("should accept empty responses object", () => {
      const emptyTriage = {
        responses: {},
      };

      const result = triageSchema.safeParse(emptyTriage);
      expect(result.success).toBe(true);
    });
  });
});
