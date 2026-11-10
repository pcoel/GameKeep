# Contracts: 003 — Progressive Game Reviews & Ratings

**Feature**: Feature 003 — Progressive Game Reviews & Ratings  
**Date**: 10/11/2026  
**Status**: Especificação Formal de Contratos

---

## 1. Schemas de Validação Zod (`schemas/review.ts`)

```ts
import { z } from "zod";

/** Validador para nota de cada Tempo (0.0 a 10.0 aceitando decimais arbitrários) */
export const tempoScoreSchema = z.coerce
  .number({ required_error: "A nota é obrigatória." })
  .min(0, "A nota mínima permitida é 0.0.")
  .max(10, "A nota máxima permitida é 10.0.");

/** Schema de criação de avaliação */
export const createReviewSchema = z.object({
  game_id: z.string().uuid("Identificador do jogo inválido."),
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
    .optional(),
  is_public: z.boolean().default(true),
});

/** Schema de atualização de avaliação */
export const updateReviewSchema = z.object({
  review_id: z.string().uuid("Identificador da avaliação inválido."),
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
    .optional(),
  is_public: z.boolean().default(true),
});

/** Schema de exclusão de avaliação */
export const deleteReviewSchema = z.object({
  review_id: z.string().uuid("Identificador da avaliação inválido."),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
```

---

## 2. Contratos de Serviço e Server Actions (`services/review-service.ts`)

```ts
import { ActionResponse } from "@/types/profile";
import { GameReview, GameRatingSummary } from "@/types/review";
import { CreateReviewInput, UpdateReviewInput, DeleteReviewInput } from "@/schemas/review";

/**
 * Cria ou atualiza a avaliação de um jogo pelo usuário logado.
 * Calcula automaticamente a média geral dos 5 Tempos e valida a unicidade.
 */
export async function saveReview(
  input: CreateReviewInput | UpdateReviewInput
): Promise<ActionResponse<{ review_id: string; overall_rating: number }>>;

/**
 * Exclui a avaliação do usuário logado e atualiza as médias do jogo.
 */
export async function deleteReview(
  input: DeleteReviewInput
): Promise<ActionResponse<void>>;

/**
 * Obtém o resumo estatístico das avaliações públicas de um jogo (médias dos 5 Tempos e contagem).
 */
export async function getGameRatingSummary(
  gameId: string
): Promise<ActionResponse<GameRatingSummary>>;

/**
 * Obtém a lista de avaliações públicas registradas para um jogo, com dados do autor.
 */
export async function getGameReviews(
  gameId: string
): Promise<ActionResponse<GameReview[]>>;

/**
 * Obtém a avaliação do usuário autenticado atual para determinado jogo (se existir).
 */
export async function getUserReviewForGame(
  gameId: string
): Promise<ActionResponse<GameReview | null>>;

/**
 * Obtém o histórico de avaliações de um usuário para exibição em seu perfil.
 */
export async function getUserReviews(
  userId: string,
  isOwner: boolean
): Promise<ActionResponse<GameReview[]>>;
```

