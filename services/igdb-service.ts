"use server";

import { searchGameSchema } from "@/schemas/catalog";
import { queryIGDB, formatIGDBCover } from "@/lib/igdb";
import { ActionResponse } from "@/types/profile";

export interface IGDBGameSearchResult {
  id: number;
  name: string;
  slug?: string;
  cover_url?: string | null;
  summary?: string | null;
  first_release_date?: string | null;
}

interface RawIGDBGame {
  id: number;
  name: string;
  slug?: string;
  summary?: string;
  first_release_date?: number;
  cover?: {
    id?: number;
    image_id?: string;
    url?: string;
  };
}

/**
 * Busca jogos no catálogo externo da IGDB pelo nome.
 * Executa exclusivamente no servidor sem expor chaves da Twitch (Constituição §4.5).
 */
export async function searchGames(
  query: string
): Promise<ActionResponse<IGDBGameSearchResult[]>> {
  const parsed = searchGameSchema.safeParse({ query });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Termo de pesquisa inválido.",
    };
  }

  const cleanQuery = parsed.data.query.replace(/"/g, '\\"');

  const apicalypseBody = `search "${cleanQuery}"; fields id, name, slug, summary, first_release_date, cover.image_id, cover.url; limit 20;`;

  try {
    const rawGames = await queryIGDB<RawIGDBGame[]>("games", apicalypseBody);

    const formatted: IGDBGameSearchResult[] = (rawGames || []).map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_url: formatIGDBCover(game.cover),
      summary: game.summary || null,
      first_release_date: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString()
        : null,
    }));

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    console.error("Erro ao buscar jogos na IGDB:", error);
    const message =
      error instanceof Error && error.message.includes("não configuradas")
        ? "Serviço de catálogo temporariamente indisponível. Credenciais não configuradas."
        : "Erro ao consultar o catálogo de jogos. Tente novamente mais tarde.";

    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Obtém os detalhes completos de um jogo a partir do seu IGDB ID.
 */
export async function getGameDetails(
  igdbId: number
): Promise<ActionResponse<IGDBGameSearchResult | null>> {
  if (!igdbId || typeof igdbId !== "number" || igdbId <= 0) {
    return {
      success: false,
      error: "Identificador de jogo inválido.",
    };
  }

  const cleanId = Math.floor(igdbId);
  const apicalypseBody = `fields id, name, slug, summary, first_release_date, cover.image_id, cover.url; where id = ${cleanId}; limit 1;`;

  try {
    const rawGames = await queryIGDB<RawIGDBGame[]>("games", apicalypseBody);

    if (!rawGames || rawGames.length === 0) {
      return {
        success: true,
        data: null,
      };
    }

    const game = rawGames[0];
    const formatted: IGDBGameSearchResult = {
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_url: formatIGDBCover(game.cover),
      summary: game.summary || null,
      first_release_date: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString()
        : null,
    };

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    console.error(`Erro ao obter detalhes do jogo ${igdbId}:`, error);
    return {
      success: false,
      error: "Não foi possível carregar os detalhes do jogo.",
    };
  }
}

