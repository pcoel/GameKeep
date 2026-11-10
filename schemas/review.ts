import { z } from "zod";

/**
 * Validador para nota de cada Tempo progressivo (0.0 a 10.0).
 * Suporta decimais arbitrários como 8.7, 9.3, 5.5 e 7.25.
 */
export const tempoScoreSchema = z.coerce
  .number({ required_error: "A nota é obrigatória." })
  .min(0, "A nota mínima permitida é 0.0.")
  .max(10, "A nota máxima permitida é 10.0.");

/** Schema de criação de avaliação */
export const createReviewSchema = z.object({
  game_id: z.string({ required_error: "Identificador do jogo obrigatório." }).uuid("Identificador do jogo inválido."),
  rating_tempo_1: tempoScoreSchema,
  rating_tempo_2: tempoScoreSchema,
  rating_tempo_3: tempoScoreSchema,
  rating_tempo_4: tempoScoreSchema,
  rating_tempo_5: tempoScoreSchema,
  content: z
    .string()
    .trim()
    .max(2500, "A review textual não pode exceder 2.500 caracteres.")
    .nullable()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  is_public: z.boolean().default(true),
});

/** Schema de atualização de avaliação existente */
export const updateReviewSchema = z.object({
  review_id: z.string({ required_error: "Identificador da avaliação obrigatório." }).uuid("Identificador da avaliação inválido."),
  rating_tempo_1: tempoScoreSchema,
  rating_tempo_2: tempoScoreSchema,
  rating_tempo_3: tempoScoreSchema,
  rating_tempo_4: tempoScoreSchema,
  rating_tempo_5: tempoScoreSchema,
  content: z
    .string()
    .trim()
    .max(2500, "A review textual não pode exceder 2.500 caracteres.")
    .nullable()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  is_public: z.boolean().default(true),
});

/** Schema de exclusão de avaliação */
export const deleteReviewSchema = z.object({
  review_id: z.string({ required_error: "Identificador da avaliação obrigatório." }).uuid("Identificador da avaliação inválido."),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;

