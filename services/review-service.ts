"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  tempoScoreSchema,
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
} from "@/schemas/review";
import type { GameReview, GameRatingSummary, ReviewAuthor } from "@/types/review";
import type { ActionResponse } from "@/types/profile";

export interface SaveReviewInput {
  game_id: string;
  review_id?: string;
  rating_tempo_1: number;
  rating_tempo_2: number;
  rating_tempo_3: number;
  rating_tempo_4: number;
  rating_tempo_5: number;
  content?: string | null;
  is_public?: boolean;
}

/**
 * Garante que o jogo exista na base local (public.games) sob demanda para associar reviews.
 */
export async function ensureLocalGame(game: {
  igdb_id: number;
  name: string;
  slug?: string | null;
  cover_url?: string | null;
  summary?: string | null;
  first_release_date?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("games")
    .select("id")
    .eq("igdb_id", game.igdb_id)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created } = await supabase
    .from("games")
    .insert({
      igdb_id: game.igdb_id,
      name: game.name,
      slug: game.slug || null,
      cover_url: game.cover_url || null,
      summary: game.summary || null,
      first_release_date: game.first_release_date || null,
    })
    .select("id")
    .maybeSingle();

  if (created?.id) {
    return created.id;
  }

  const { data: retry } = await supabase
    .from("games")
    .select("id")
    .eq("igdb_id", game.igdb_id)
    .maybeSingle();

  return retry?.id || "";
}

/**
 * Cria ou atualiza a avaliação progressiva do usuário para um jogo (US1 & US2).
 * Calcula automaticamente a média geral a partir dos 5 Tempos e valida a unicidade.
 */
export async function saveReview(
  input: SaveReviewInput
): Promise<ActionResponse<{ review_id: string; overall_rating: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Você precisa estar conectado para avaliar um jogo.",
    };
  }

  // 1. Validação dos scores dos 5 Tempos
  try {
    tempoScoreSchema.parse(input.rating_tempo_1);
    tempoScoreSchema.parse(input.rating_tempo_2);
    tempoScoreSchema.parse(input.rating_tempo_3);
    tempoScoreSchema.parse(input.rating_tempo_4);
    tempoScoreSchema.parse(input.rating_tempo_5);
  } catch {
    return {
      success: false,
      error: "Todas as notas dos cinco Tempos devem estar entre 0.0 e 10.0.",
    };
  }

  // Sanitização do conteúdo
  let cleanContent: string | null = null;
  if (input.content && input.content.trim().length > 0) {
    const trimmed = input.content.trim();
    if (trimmed.length > 2500) {
      return {
        success: false,
        error: "A análise textual não pode exceder 2.500 caracteres.",
      };
    }
    cleanContent = trimmed;
  }

  const isPublic = input.is_public !== undefined ? Boolean(input.is_public) : true;

  // 2. Cálculo aritmético da média dos 5 Tempos
  const sum =
    Number(input.rating_tempo_1) +
    Number(input.rating_tempo_2) +
    Number(input.rating_tempo_3) +
    Number(input.rating_tempo_4) +
    Number(input.rating_tempo_5);
  const rawAverage = sum / 5.0;
  const overallRating = Math.round(rawAverage * 100) / 100;

  // 3. Edição de avaliação existente
  if (input.review_id) {
    const parsedUpdate = updateReviewSchema.safeParse({
      review_id: input.review_id,
      rating_tempo_1: input.rating_tempo_1,
      rating_tempo_2: input.rating_tempo_2,
      rating_tempo_3: input.rating_tempo_3,
      rating_tempo_4: input.rating_tempo_4,
      rating_tempo_5: input.rating_tempo_5,
      content: cleanContent,
      is_public: isPublic,
    });

    if (!parsedUpdate.success) {
      return {
        success: false,
        error: parsedUpdate.error.errors[0]?.message || "Dados de avaliação inválidos.",
      };
    }

    const { data: updatedReview, error: updateError } = await supabase
      .from("reviews")
      .update({
        rating_tempo_1: input.rating_tempo_1,
        rating_tempo_2: input.rating_tempo_2,
        rating_tempo_3: input.rating_tempo_3,
        rating_tempo_4: input.rating_tempo_4,
        rating_tempo_5: input.rating_tempo_5,
        overall_rating: overallRating,
        content: cleanContent,
        is_public: isPublic,
      })
      .eq("id", input.review_id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (updateError || !updatedReview) {
      console.error("Erro ao atualizar avaliação:", updateError);
      return {
        success: false,
        error: "Não foi possível atualizar a avaliação.",
      };
    }

    revalidatePath(`/catalog`);
    revalidatePath(`/library`);
    revalidatePath(`/profile`);

    return {
      success: true,
      data: {
        review_id: updatedReview.id,
        overall_rating: overallRating,
      },
      message: "Avaliação atualizada com sucesso!",
    };
  }

  // 4. Criação de nova avaliação
  const parsedCreate = createReviewSchema.safeParse({
    game_id: input.game_id,
    rating_tempo_1: input.rating_tempo_1,
    rating_tempo_2: input.rating_tempo_2,
    rating_tempo_3: input.rating_tempo_3,
    rating_tempo_4: input.rating_tempo_4,
    rating_tempo_5: input.rating_tempo_5,
    content: cleanContent,
    is_public: isPublic,
  });

  if (!parsedCreate.success) {
    return {
      success: false,
      error: parsedCreate.error.errors[0]?.message || "Dados de avaliação inválidos.",
    };
  }

  const { data: newReview, error: insertError } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      game_id: input.game_id,
      rating_tempo_1: input.rating_tempo_1,
      rating_tempo_2: input.rating_tempo_2,
      rating_tempo_3: input.rating_tempo_3,
      rating_tempo_4: input.rating_tempo_4,
      rating_tempo_5: input.rating_tempo_5,
      overall_rating: overallRating,
      content: cleanContent,
      is_public: isPublic,
    })
    .select("id")
    .single();

  if (insertError) {
    const errorMsg = insertError.message.toLowerCase();
    if (
      insertError.code === "23505" ||
      errorMsg.includes("uq_reviews_user_game") ||
      errorMsg.includes("duplicate") ||
      errorMsg.includes("unique")
    ) {
      return {
        success: false,
        error: "Você já avaliou este jogo. Edite sua avaliação existente.",
      };
    }

    console.error("Erro ao cadastrar avaliação:", insertError);
    return {
      success: false,
      error: "Erro ao registrar a avaliação. Tente novamente.",
    };
  }

  revalidatePath(`/catalog`);
  revalidatePath(`/library`);
  revalidatePath(`/profile`);

  return {
    success: true,
    data: {
      review_id: newReview.id,
      overall_rating: overallRating,
    },
    message: "Avaliação registrada com sucesso!",
  };
}

/**
 * Remove definitivamente a avaliação do usuário autenticado (US2).
 */
export async function deleteReview(
  input: { review_id: string }
): Promise<ActionResponse<void>> {
  const parsed = deleteReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Identificador de avaliação inválido.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sessão expirada. Faça login novamente.",
    };
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", parsed.data.review_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao excluir avaliação:", error);
    return {
      success: false,
      error: "Não foi possível excluir a avaliação.",
    };
  }

  revalidatePath(`/catalog`);
  revalidatePath(`/library`);
  revalidatePath(`/profile`);

  return {
    success: true,
    data: undefined,
    message: "Avaliação excluída com sucesso.",
  };
}

/**
 * Obtém o resumo de notas da comunidade para um jogo (apenas avaliações públicas).
 */
export async function getGameRatingSummary(
  gameId: string
): Promise<ActionResponse<GameRatingSummary>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating_tempo_1, rating_tempo_2, rating_tempo_3, rating_tempo_4, rating_tempo_5, overall_rating")
    .eq("game_id", gameId)
    .eq("is_public", true);

  if (error) {
    console.error("Erro ao calcular resumo de avaliações do jogo:", error);
    return {
      success: false,
      error: "Não foi possível carregar as notas da comunidade.",
    };
  }

  const total = data ? data.length : 0;

  if (total === 0) {
    return {
      success: true,
      data: {
        total_reviews: 0,
        overall_average: null,
        tempo_1_average: null,
        tempo_2_average: null,
        tempo_3_average: null,
        tempo_4_average: null,
        tempo_5_average: null,
      },
    };
  }

  const sumOverall = data.reduce((acc, r) => acc + Number(r.overall_rating), 0);
  const sumT1 = data.reduce((acc, r) => acc + Number(r.rating_tempo_1), 0);
  const sumT2 = data.reduce((acc, r) => acc + Number(r.rating_tempo_2), 0);
  const sumT3 = data.reduce((acc, r) => acc + Number(r.rating_tempo_3), 0);
  const sumT4 = data.reduce((acc, r) => acc + Number(r.rating_tempo_4), 0);
  const sumT5 = data.reduce((acc, r) => acc + Number(r.rating_tempo_5), 0);

  const round1 = (val: number) => Math.round((val / total) * 10) / 10;

  return {
    success: true,
    data: {
      total_reviews: total,
      overall_average: round1(sumOverall),
      tempo_1_average: round1(sumT1),
      tempo_2_average: round1(sumT2),
      tempo_3_average: round1(sumT3),
      tempo_4_average: round1(sumT4),
      tempo_5_average: round1(sumT5),
    },
  };
}

/**
 * Obtém as reviews públicas cadastradas para um jogo com identificação dos autores (US3).
 */
export async function getGameReviews(
  gameId: string
): Promise<ActionResponse<GameReview[]>> {
  const supabase = await createClient();

  const { data: reviewsData, error } = await supabase
    .from("reviews")
    .select(`
      id,
      user_id,
      game_id,
      rating_tempo_1,
      rating_tempo_2,
      rating_tempo_3,
      rating_tempo_4,
      rating_tempo_5,
      overall_rating,
      content,
      is_public,
      created_at,
      updated_at
    `)
    .eq("game_id", gameId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar reviews do jogo:", error);
    return {
      success: false,
      error: "Não foi possível carregar as avaliações deste jogo.",
    };
  }

  if (!reviewsData || reviewsData.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  // Buscar autores dos perfis
  const userIds = Array.from(new Set(reviewsData.map((r) => r.user_id)));
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);

  const authorMap = new Map<string, ReviewAuthor>();
  (profilesData || []).forEach((p) => {
    authorMap.set(p.id, {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
    });
  });

  const reviews: GameReview[] = reviewsData.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    game_id: item.game_id,
    rating_tempo_1: Number(item.rating_tempo_1),
    rating_tempo_2: Number(item.rating_tempo_2),
    rating_tempo_3: Number(item.rating_tempo_3),
    rating_tempo_4: Number(item.rating_tempo_4),
    rating_tempo_5: Number(item.rating_tempo_5),
    overall_rating: Number(item.overall_rating),
    content: item.content,
    is_public: item.is_public,
    created_at: item.created_at,
    updated_at: item.updated_at,
    author: authorMap.get(item.user_id),
  }));

  return {
    success: true,
    data: reviews,
  };
}

/**
 * Obtém a avaliação do usuário atual para determinado jogo (se existir).
 */
export async function getUserReviewForGame(
  gameId: string
): Promise<ActionResponse<GameReview | null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: true,
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("game_id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar avaliação do usuário:", error);
    return {
      success: false,
      error: "Erro ao consultar sua avaliação.",
    };
  }

  if (!data) {
    return {
      success: true,
      data: null,
    };
  }

  return {
    success: true,
    data: {
      id: data.id,
      user_id: data.user_id,
      game_id: data.game_id,
      rating_tempo_1: Number(data.rating_tempo_1),
      rating_tempo_2: Number(data.rating_tempo_2),
      rating_tempo_3: Number(data.rating_tempo_3),
      rating_tempo_4: Number(data.rating_tempo_4),
      rating_tempo_5: Number(data.rating_tempo_5),
      overall_rating: Number(data.overall_rating),
      content: data.content,
      is_public: data.is_public,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  };
}

/**
 * Obtém a avaliação do usuário para um jogo a partir do seu IGDB ID (se o jogo já tiver sido salvo).
 */
export async function getUserReviewByIgdbId(
  igdbId: number
): Promise<{ hasReviewed: boolean; review?: GameReview; gameId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { hasReviewed: false };
  }

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("igdb_id", igdbId)
    .maybeSingle();

  if (!game) {
    return { hasReviewed: false };
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("game_id", game.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!review) {
    return { hasReviewed: false, gameId: game.id };
  }

  return {
    hasReviewed: true,
    gameId: game.id,
    review: {
      id: review.id,
      user_id: review.user_id,
      game_id: review.game_id,
      rating_tempo_1: Number(review.rating_tempo_1),
      rating_tempo_2: Number(review.rating_tempo_2),
      rating_tempo_3: Number(review.rating_tempo_3),
      rating_tempo_4: Number(review.rating_tempo_4),
      rating_tempo_5: Number(review.rating_tempo_5),
      overall_rating: Number(review.overall_rating),
      content: review.content,
      is_public: review.is_public,
      created_at: review.created_at,
      updated_at: review.updated_at,
    },
  };
}

/**
 * Obtém a lista de avaliações feitas por um usuário para exibição no perfil (US4).
 */
export async function getUserReviews(
  userId: string,
  isOwner: boolean
): Promise<ActionResponse<GameReview[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select(`
      id,
      user_id,
      game_id,
      rating_tempo_1,
      rating_tempo_2,
      rating_tempo_3,
      rating_tempo_4,
      rating_tempo_5,
      overall_rating,
      content,
      is_public,
      created_at,
      updated_at,
      games (
        id,
        igdb_id,
        name,
        cover_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!isOwner) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar avaliações do usuário:", error);
    return {
      success: false,
      error: "Não foi possível carregar as avaliações.",
    };
  }

  const reviews: GameReview[] = (data || []).map((item) => {
    const rawGame = Array.isArray(item.games) ? item.games[0] : item.games;
    return {
      id: item.id,
      user_id: item.user_id,
      game_id: item.game_id,
      rating_tempo_1: Number(item.rating_tempo_1),
      rating_tempo_2: Number(item.rating_tempo_2),
      rating_tempo_3: Number(item.rating_tempo_3),
      rating_tempo_4: Number(item.rating_tempo_4),
      rating_tempo_5: Number(item.rating_tempo_5),
      overall_rating: Number(item.overall_rating),
      content: item.content,
      is_public: item.is_public,
      created_at: item.created_at,
      updated_at: item.updated_at,
      game: rawGame
        ? {
            id: rawGame.id,
            igdb_id: rawGame.igdb_id,
            name: rawGame.name,
            cover_url: rawGame.cover_url,
          }
        : undefined,
    };
  });

  return {
    success: true,
    data: reviews,
  };
}
