"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  addGameToLibrarySchema,
  updateLibraryStatusSchema,
  removeGameFromLibrarySchema,
  type AddGameToLibraryInput,
  type UpdateLibraryStatusInput,
  type RemoveGameFromLibraryInput,
} from "@/schemas/catalog";
import type { LibraryEntry, LibraryGameStatus, Game } from "@/types/catalog";
import type { ActionResponse } from "@/types/profile";

/**
 * Adiciona um jogo do catálogo à biblioteca do usuário autenticado.
 * Garante idempotência e persistência sob demanda na tabela `games` (US2).
 */
export async function addGameToLibrary(
  rawInput: AddGameToLibraryInput
): Promise<ActionResponse<{ entry_id: string }>> {
  const parsed = addGameToLibrarySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Dados inválidos para inclusão na biblioteca.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { igdb_id, name, slug, cover_url, summary, first_release_date, status } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Você precisa estar conectado para adicionar jogos à sua biblioteca.",
    };
  }

  // 1. Armazenamento sob demanda do jogo no catálogo local (games)
  let gameId: string;

  const { data: existingGame } = await supabase
    .from("games")
    .select("id")
    .eq("igdb_id", igdb_id)
    .maybeSingle();

  if (existingGame?.id) {
    gameId = existingGame.id;
  } else {
    // Insere o jogo novo no banco de dados local
    const { data: newGame, error: insertGameError } = await supabase
      .from("games")
      .insert({
        igdb_id,
        name,
        slug: slug || null,
        cover_url: cover_url || null,
        summary: summary || null,
        first_release_date: first_release_date || null,
      })
      .select("id")
      .single();

    if (insertGameError) {
      // Caso haja concorrência de inserção do mesmo jogo simultaneamente
      const { data: retryGame } = await supabase
        .from("games")
        .select("id")
        .eq("igdb_id", igdb_id)
        .maybeSingle();

      if (retryGame?.id) {
        gameId = retryGame.id;
      } else {
        console.error("Erro ao persistir jogo no catálogo local:", insertGameError);
        return {
          success: false,
          error: "Erro ao registrar o jogo no sistema. Tente novamente.",
        };
      }
    } else {
      gameId = newGame.id;
    }
  }

  // 2. Inserção na biblioteca do usuário com integridade relacional
  const { data: entry, error: entryError } = await supabase
    .from("library_entries")
    .insert({
      user_id: user.id,
      game_id: gameId,
      status,
    })
    .select("id")
    .single();

  if (entryError) {
    // Tratamento de unicidade: PostgreSQL 23505 (uq_library_user_game)
    const errorMsg = entryError.message.toLowerCase();
    if (
      entryError.code === "23505" ||
      errorMsg.includes("uq_library_user_game") ||
      errorMsg.includes("duplicate") ||
      errorMsg.includes("unique")
    ) {
      return {
        success: false,
        error: "Este jogo já está na sua biblioteca.",
      };
    }

    console.error("Erro ao adicionar jogo na biblioteca:", entryError);
    return {
      success: false,
      error: "Não foi possível adicionar o jogo à biblioteca.",
    };
  }

  revalidatePath("/library");
  revalidatePath(`/catalog/${igdb_id}`);

  return {
    success: true,
    data: {
      entry_id: entry.id,
    },
    message: "Jogo adicionado à biblioteca com sucesso!",
  };
}

/**
 * Altera o status de um jogo pertencente à biblioteca do usuário logado (US4).
 */
export async function updateLibraryGameStatus(
  rawInput: UpdateLibraryStatusInput
): Promise<ActionResponse<void>> {
  const parsed = updateLibraryStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Status inválido.",
    };
  }

  const { entry_id, status } = parsed.data;

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

  // Atualização protegida por RLS e verificação de user_id
  const { error } = await supabase
    .from("library_entries")
    .update({ status })
    .eq("id", entry_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao atualizar status do jogo:", error);
    return {
      success: false,
      error: "Erro ao atualizar status do jogo.",
    };
  }

  revalidatePath("/library");

  return {
    success: true,
    data: undefined,
    message: "Status atualizado com sucesso!",
  };
}

/**
 * Remove um jogo da biblioteca do usuário logado (US4).
 */
export async function removeGameFromLibrary(
  rawInput: RemoveGameFromLibraryInput
): Promise<ActionResponse<void>> {
  const parsed = removeGameFromLibrarySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Identificador de jogo inválido.",
    };
  }

  const { entry_id } = parsed.data;

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

  // 1. Obter game_id para também remover a review associada se existir
  const { data: existingEntry } = await supabase
    .from("library_entries")
    .select("game_id")
    .eq("id", entry_id)
    .eq("user_id", user.id)
    .maybeSingle();

  // 2. Excluir a entrada da biblioteca
  const { error } = await supabase
    .from("library_entries")
    .delete()
    .eq("id", entry_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao remover jogo da biblioteca:", error);
    return {
      success: false,
      error: "Erro ao remover o jogo da biblioteca.",
    };
  }

  // 3. Excluir avaliação do usuário para este jogo, se houver
  if (existingEntry?.game_id) {
    await supabase
      .from("reviews")
      .delete()
      .eq("game_id", existingEntry.game_id)
      .eq("user_id", user.id);
  }

  revalidatePath("/library");
  revalidatePath("/profile");

  return {
    success: true,
    data: undefined,
    message: "Jogo removido da biblioteca.",
  };
}

/**
 * Recupera todas as entradas da biblioteca do usuário autenticado atual (US3).
 */
export async function getUserLibrary(
  filterStatus?: LibraryGameStatus
): Promise<ActionResponse<LibraryEntry[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Você precisa estar autenticado para visualizar sua biblioteca.",
    };
  }

  let query = supabase
    .from("library_entries")
    .select(`
      id,
      user_id,
      game_id,
      status,
      created_at,
      updated_at,
      games (
        id,
        igdb_id,
        name,
        slug,
        cover_url,
        summary,
        first_release_date,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar biblioteca do usuário:", error);
    return {
      success: false,
      error: "Não foi possível carregar sua biblioteca.",
    };
  }

  // Buscar avaliações do usuário para os jogos de sua biblioteca (Feature 003)
  const gameIds = (data || []).map((i) => i.game_id);
  const { data: userReviews } = gameIds.length > 0
    ? await supabase
        .from("reviews")
        .select("game_id, overall_rating")
        .eq("user_id", user.id)
        .in("game_id", gameIds)
    : { data: [] };

  const ratingsMap = new Map<string, number>();
  (userReviews || []).forEach((r) => {
    ratingsMap.set(r.game_id, Number(r.overall_rating));
  });

  // Normalização das entradas
  const entries: LibraryEntry[] = (data || []).map((item) => {
    const rawGame = Array.isArray(item.games) ? item.games[0] : item.games;
    return {
      id: item.id,
      user_id: item.user_id,
      game_id: item.game_id,
      status: item.status as LibraryGameStatus,
      created_at: item.created_at,
      updated_at: item.updated_at,
      game: rawGame as Game | undefined,
      user_rating: ratingsMap.get(item.game_id) ?? null,
    };
  });

  return {
    success: true,
    data: entries,
  };
}

/**
 * Recupera a biblioteca pública de um usuário específico (a partir do username).
 * Respeita RLS e retorna erro caso a biblioteca seja privada (US3 & Constituição §4.4).
 */
export async function getPublicUserLibrary(
  username: string,
  filterStatus?: LibraryGameStatus
): Promise<ActionResponse<LibraryEntry[]>> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_library_public")
    .ilike("username", username.trim())
    .maybeSingle();

  if (profileError || !profile) {
    return {
      success: false,
      error: "Perfil não encontrado.",
    };
  }

  if (!profile.is_library_public) {
    return {
      success: false,
      error: "A biblioteca deste usuário é privada.",
    };
  }

  let query = supabase
    .from("library_entries")
    .select(`
      id,
      user_id,
      game_id,
      status,
      created_at,
      updated_at,
      games (
        id,
        igdb_id,
        name,
        slug,
        cover_url,
        summary,
        first_release_date,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar biblioteca pública:", error);
    return {
      success: false,
      error: "Erro ao carregar os jogos deste usuário.",
    };
  }

  const entries: LibraryEntry[] = (data || []).map((item) => {
    const rawGame = Array.isArray(item.games) ? item.games[0] : item.games;
    return {
      id: item.id,
      user_id: item.user_id,
      game_id: item.game_id,
      status: item.status as LibraryGameStatus,
      created_at: item.created_at,
      updated_at: item.updated_at,
      game: rawGame as Game | undefined,
    };
  });

  return {
    success: true,
    data: entries,
  };
}

/**
 * Verifica se um jogo já está presente na biblioteca do usuário autenticado.
 */
export async function getGameLibraryStatus(
  igdbId: number
): Promise<{ inLibrary: boolean; entry?: LibraryEntry }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { inLibrary: false };
  }

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("igdb_id", igdbId)
    .maybeSingle();

  if (!game) {
    return { inLibrary: false };
  }

  const { data: entry } = await supabase
    .from("library_entries")
    .select("id, user_id, game_id, status, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("game_id", game.id)
    .maybeSingle();

  if (!entry) {
    return { inLibrary: false };
  }

  return {
    inLibrary: true,
    entry: {
      id: entry.id,
      user_id: entry.user_id,
      game_id: entry.game_id,
      status: entry.status as LibraryGameStatus,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    },
  };
}

