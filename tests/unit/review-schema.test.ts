import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  tempoScoreSchema,
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
} from "../../schemas/review";

describe("Review Schema Validation Tests (Feature 003)", () => {
  describe("tempoScoreSchema", () => {
    it("deve aceitar valores inteiros e decimais arbitrários de 0.0 a 10.0", () => {
      assert.equal(tempoScoreSchema.safeParse(0).success, true);
      assert.equal(tempoScoreSchema.safeParse(10).success, true);
      assert.equal(tempoScoreSchema.safeParse(8.7).success, true);
      assert.equal(tempoScoreSchema.safeParse(9.25).success, true);
      assert.equal(tempoScoreSchema.safeParse(5.5).success, true);
      assert.equal(tempoScoreSchema.safeParse("7.3").success, true);
    });

    it("deve rejeitar notas menores que 0 ou maiores que 10", () => {
      assert.equal(tempoScoreSchema.safeParse(-0.1).success, false);
      assert.equal(tempoScoreSchema.safeParse(10.1).success, false);
      assert.equal(tempoScoreSchema.safeParse(99).success, false);
      assert.equal(tempoScoreSchema.safeParse("abc").success, false);
    });
  });

  describe("createReviewSchema", () => {
    const validData = {
      game_id: "550e8400-e29b-41d4-a716-446655440000",
      rating_tempo_1: 8.5,
      rating_tempo_2: 9.0,
      rating_tempo_3: 7.25,
      rating_tempo_4: 8.0,
      rating_tempo_5: 9.5,
      content: "Uma excelente experiência do início ao fim.",
      is_public: true,
    };

    it("deve aceitar payload válido com texto e 5 Tempos", () => {
      const res = createReviewSchema.safeParse(validData);
      assert.equal(res.success, true);
      if (res.success) {
        assert.equal(res.data.is_public, true);
        assert.equal(res.data.content, "Uma excelente experiência do início ao fim.");
      }
    });

    it("deve aceitar avaliação válida sem texto dissertativo (opcional)", () => {
      const withoutContent = {
        ...validData,
        content: null,
      };
      const res = createReviewSchema.safeParse(withoutContent);
      assert.equal(res.success, true);
    });

    it("deve rejeitar game_id inválido (não UUID)", () => {
      const invalid = {
        ...validData,
        game_id: "invalid-id",
      };
      assert.equal(createReviewSchema.safeParse(invalid).success, false);
    });

    it("deve rejeitar texto dissertativo com mais de 2.500 caracteres", () => {
      const longContent = "a".repeat(2501);
      const invalid = {
        ...validData,
        content: longContent,
      };
      assert.equal(createReviewSchema.safeParse(invalid).success, false);
    });

    it("deve rejeitar se faltar qualquer um dos 5 Tempos", () => {
      const missingTempo = {
        game_id: "550e8400-e29b-41d4-a716-446655440000",
        rating_tempo_1: 8.5,
        rating_tempo_2: 9.0,
        // rating_tempo_3 ausente
        rating_tempo_4: 8.0,
        rating_tempo_5: 9.5,
      };
      assert.equal(createReviewSchema.safeParse(missingTempo).success, false);
    });
  });

  describe("updateReviewSchema", () => {
    it("deve validar payload de edição com review_id válido", () => {
      const valid = {
        review_id: "550e8400-e29b-41d4-a716-446655440000",
        rating_tempo_1: 9.0,
        rating_tempo_2: 8.5,
        rating_tempo_3: 8.0,
        rating_tempo_4: 8.5,
        rating_tempo_5: 9.0,
        content: "Atualizando minha review após concluir.",
        is_public: false,
      };
      const res = updateReviewSchema.safeParse(valid);
      assert.equal(res.success, true);
      if (res.success) {
        assert.equal(res.data.is_public, false);
      }
    });

    it("deve rejeitar review_id inválido", () => {
      const invalid = {
        review_id: "123",
        rating_tempo_1: 8.0,
        rating_tempo_2: 8.0,
        rating_tempo_3: 8.0,
        rating_tempo_4: 8.0,
        rating_tempo_5: 8.0,
      };
      assert.equal(updateReviewSchema.safeParse(invalid).success, false);
    });
  });

  describe("deleteReviewSchema", () => {
    it("deve aceitar UUID válido para exclusão", () => {
      const res = deleteReviewSchema.safeParse({
        review_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      assert.equal(res.success, true);
    });

    it("deve rejeitar identificador inválido", () => {
      const res = deleteReviewSchema.safeParse({
        review_id: "not-a-uuid",
      });
      assert.equal(res.success, false);
    });
  });
});

