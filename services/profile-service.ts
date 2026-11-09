"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  updateProfileSchema,
  updatePrivacySchema,
  type UpdateProfileInput,
  type UpdatePrivacyInput,
} from "@/schemas/profile";
import { UserProfile, PublicUserProfile, ActionResponse } from "@/types/profile";

/**
 * Obtém o perfil completo do usuário autenticado atual (US3).
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

/**
 * Atualiza as informações cadastrais do perfil do usuário autenticado (US3).
 * Garantia de Segurança (SEC-003): O username é imutável e omitido da atualização.
 */
export async function updateProfile(
  rawInput: UpdateProfileInput
): Promise<ActionResponse<UserProfile>> {
  const parsed = updateProfileSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados de perfil inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Usuário não autenticado.",
    };
  }

  const { display_name, avatar_url, bio } = parsed.data;

  const updatePayload: import("@/types/database").Database["public"]["Tables"]["profiles"]["Update"] = {
    display_name,
    avatar_url: avatar_url || null,
    bio: bio || null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.id)
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Não foi possível atualizar o perfil.",
    };
  }

  revalidatePath("/profile");
  revalidatePath("/settings/profile");

  return {
    success: true,
    data: data as UserProfile,
    message: "Perfil atualizado com sucesso!",
  };
}

/**
 * Atualiza as preferências de visibilidade do perfil e da biblioteca de forma independente (US4).
 */
export async function updatePrivacy(
  rawInput: UpdatePrivacyInput
): Promise<ActionResponse<void>> {
  const parsed = updatePrivacySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Configurações de privacidade inválidas.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Usuário não autenticado.",
    };
  }

  const { is_profile_public, is_library_public } = parsed.data;

  const privacyPayload: import("@/types/database").Database["public"]["Tables"]["profiles"]["Update"] = {
    is_profile_public,
    is_library_public,
  };

  const { error } = await supabase
    .from("profiles")
    .update(privacyPayload)
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao salvar preferências de privacidade.",
    };
  }

  revalidatePath("/profile");
  revalidatePath("/settings/profile");

  return {
    success: true,
    data: undefined,
    message: "Preferências de privacidade salvas com sucesso!",
  };
}

/**
 * Obtém os dados públicos sanitizados de um perfil a partir do username (US3).
 * Respeita automaticamente as políticas de RLS no PostgreSQL.
 */
export async function getPublicProfileByUsername(
  username: string
): Promise<PublicUserProfile | null> {
  const supabase = await createClient();
  const normalized = username.toLowerCase().trim();

  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, created_at")
    .ilike("username", normalized)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicUserProfile;
}

