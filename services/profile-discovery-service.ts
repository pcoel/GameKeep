"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PublicUserProfile, ActionResponse } from "@/types/profile";

/**
 * Pesquisa perfis de usuários pelo username ou nome de exibição.
 */
export async function searchProfiles(
  query: string
): Promise<ActionResponse<PublicUserProfile[]>> {
  const cleanQuery = query.trim().toLowerCase();

  if (cleanQuery.length < 2) {
    return {
      success: false,
      error: "Digite pelo menos 2 caracteres para pesquisar.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Busca perfis que contenham o termo de busca no username ou display_name
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, is_profile_public, is_library_public, created_at")
    .or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`)
    .limit(20);

  if (error) {
    console.error("Erro ao pesquisar perfis:", error);
    return {
      success: false,
      error: "Erro ao realizar busca de jogadores.",
    };
  }

  // Verifica se algum dos perfis encontrados está salvo pelo usuário atual
  let savedSet = new Set<string>();
  if (currentUser) {
    const { data: savedList } = await supabase
      .from("saved_profiles")
      .select("saved_profile_id")
      .eq("user_id", currentUser.id);

    if (savedList) {
      savedSet = new Set(savedList.map((s) => s.saved_profile_id));
    }
  }

  const results: PublicUserProfile[] = (profiles || []).map((p) => {
    // Se o perfil for privado e não for o próprio usuário, oculta a biografia
    const isSelf = currentUser?.id === p.id;
    return {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      bio: p.is_profile_public || isSelf ? p.bio : null,
      is_profile_public: p.is_profile_public,
      is_library_public: p.is_library_public,
      created_at: p.created_at,
      is_saved: savedSet.has(p.id),
    };
  });

  return {
    success: true,
    data: results,
  };
}

/**
 * Obtém os dados de um perfil público pelo username, com respeito às regras de RLS e privacidade.
 */
export async function getPublicProfile(username: string): Promise<
  ActionResponse<{
    profile: PublicUserProfile;
    isSaved: boolean;
    isOwner: boolean;
  }>
> {
  const cleanUsername = username.trim().toLowerCase();
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, is_profile_public, is_library_public, created_at")
    .ilike("username", cleanUsername)
    .maybeSingle();

  if (error || !profile) {
    return {
      success: false,
      error: "Jogador não encontrado.",
    };
  }

  const isOwner = currentUser?.id === profile.id;

  // Verifica se o perfil está salvo pelo usuário autenticado
  let isSaved = false;
  if (currentUser && !isOwner) {
    const { data: saved } = await supabase
      .from("saved_profiles")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("saved_profile_id", profile.id)
      .maybeSingle();

    isSaved = !!saved;
  }

  // Se o perfil for privado e quem acessa não for o dono, não revela dados sensíveis como bio
  const publicData: PublicUserProfile = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.is_profile_public || isOwner ? profile.bio : null,
    is_profile_public: profile.is_profile_public,
    is_library_public: profile.is_library_public,
    created_at: profile.created_at,
    is_saved: isSaved,
  };

  return {
    success: true,
    data: {
      profile: publicData,
      isSaved,
      isOwner,
    },
  };
}

/**
 * Salva ou remove um perfil da lista de favoritos do usuário logado.
 */
export async function toggleSaveProfile(
  targetProfileId: string
): Promise<ActionResponse<{ isSaved: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Você precisa estar conectado para salvar perfis.",
    };
  }

  if (user.id === targetProfileId) {
    return {
      success: false,
      error: "Você não pode salvar seu próprio perfil.",
    };
  }

  // Verifica se já está salvo
  const { data: existing } = await supabase
    .from("saved_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("saved_profile_id", targetProfileId)
    .maybeSingle();

  if (existing) {
    // Remove dos salvos
    const { error: deleteError } = await supabase
      .from("saved_profiles")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error("Erro ao remover perfil salvo:", deleteError);
      return {
        success: false,
        error: "Erro ao remover perfil dos favoritos.",
      };
    }

    revalidatePath("/users");
    return {
      success: true,
      data: { isSaved: false },
      message: "Perfil removido dos seus favoritos.",
    };
  } else {
    // Adiciona aos salvos
    const { error: insertError } = await supabase
      .from("saved_profiles")
      .insert({
        user_id: user.id,
        saved_profile_id: targetProfileId,
      });

    if (insertError) {
      console.error("Erro ao salvar perfil:", insertError);
      return {
        success: false,
        error: "Não foi possível salvar o perfil.",
      };
    }

    revalidatePath("/users");
    return {
      success: true,
      data: { isSaved: true },
      message: "Perfil adicionado aos seus favoritos!",
    };
  }
}

/**
 * Recupera todos os perfis salvos pelo usuário logado.
 */
export async function getSavedProfiles(): Promise<ActionResponse<PublicUserProfile[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Você precisa estar conectado para acessar seus perfis salvos.",
    };
  }

  const { data, error } = await supabase
    .from("saved_profiles")
    .select(`
      id,
      saved_profile_id,
      created_at,
      profiles:saved_profile_id (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        is_profile_public,
        is_library_public,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar perfis salvos:", error);
    return {
      success: false,
      error: "Erro ao carregar sua lista de perfis salvos.",
    };
  }

  const results: PublicUserProfile[] = (data || [])
    .filter((item) => !!item.profiles)
    .map((item) => {
      const p = item.profiles as unknown as {
        id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
        bio: string | null;
        is_profile_public: boolean;
        is_library_public: boolean;
        created_at: string;
      };

      return {
        id: p.id,
        username: p.username,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.is_profile_public ? p.bio : null,
        is_profile_public: p.is_profile_public,
        is_library_public: p.is_library_public,
        created_at: p.created_at,
        is_saved: true,
      };
    });

  return {
    success: true,
    data: results,
  };
}

