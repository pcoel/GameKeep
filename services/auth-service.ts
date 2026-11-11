"use server";

import { createClient } from "@/lib/supabase/server";
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from "@/schemas/auth";
import { ActionResponse } from "@/types/profile";
import { sanitizeRedirectUrl } from "@/lib/redirect";

/**
 * Verifica a disponibilidade do nome de usuário no banco de dados (SEC-002).
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const supabase = await createClient();
  const normalized = username.toLowerCase().trim();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalized)
    .limit(1);

  if (error) {
    console.error("Erro ao verificar disponibilidade de username:", error);
    // Em caso de falha de consulta, permite seguir para a validação no banco (RLS/trigger)
    return true;
  }

  return !data || data.length === 0;
}

/**
 * Realiza o cadastro de uma nova conta com criação atômica de perfil (US1).
 * Implementa defesa em profundidade (SEC-002) com pré-checagem e captura de corrida.
 */
export async function signUp(
  rawInput: RegisterInput
): Promise<ActionResponse<{ user_id: string; requiresEmailConfirmation?: boolean }>> {
  const parsed = registerSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados de cadastro inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password, username } = parsed.data;

  // 1. Pré-checagem de disponibilidade de username (SEC-002)
  const isAvailable = await checkUsernameAvailability(username);
  if (!isAvailable) {
    return {
      success: false,
      error: "Este nome de usuário já está em uso.",
      fieldErrors: { username: ["Nome de usuário já cadastrado."] },
    };
  }

  const supabase = await createClient();

  // 2. Criação do usuário no Supabase Auth com metadados para o trigger do PostgreSQL
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    // 3. Captura de colisão em condição de corrida (Race condition - SEC-002)
    const errorMsg = error.message.toLowerCase();
    if (
      error.status === 400 &&
      (errorMsg.includes("already registered") || errorMsg.includes("user already exists"))
    ) {
      return {
        success: false,
        error: "Este e-mail já está registrado na plataforma.",
        fieldErrors: { email: ["E-mail já cadastrado."] },
      };
    }

    if (errorMsg.includes("23505") || errorMsg.includes("username") || errorMsg.includes("duplicate")) {
      return {
        success: false,
        error: "Este nome de usuário já está em uso.",
        fieldErrors: { username: ["Nome de usuário já cadastrado."] },
      };
    }

    return {
      success: false,
      error: error.message || "Erro ao realizar cadastro. Tente novamente.",
    };
  }

  const requiresEmailConfirmation = !data.session;

  return {
    success: true,
    data: {
      user_id: data.user?.id || "",
      requiresEmailConfirmation,
    },
    message: requiresEmailConfirmation
      ? "Cadastro realizado! Enviamos um link de confirmação para o seu e-mail."
      : "Cadastro realizado com sucesso!",
  };
}

/**
 * Autentica o usuário com e-mail e senha e retorna a rota de redirecionamento (US2).
 */
export async function signIn(
  rawInput: LoginInput,
  returnTo?: string
): Promise<ActionResponse<{ user_id: string; redirectTo: string }>> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Preencha o e-mail e a senha corretamente.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: "Credenciais inválidas. Verifique seu e-mail e sua senha.",
    };
  }

  const sanitizedUrl = sanitizeRedirectUrl(returnTo);

  return {
    success: true,
    data: {
      user_id: data.user.id,
      redirectTo: sanitizedUrl,
    },
    message: "Login realizado com sucesso!",
  };
}

/**
 * Encerra a sessão ativa do usuário e limpa cookies (US2).
 */
export async function signOut(): Promise<ActionResponse<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao encerrar sessão.",
    };
  }

  return {
    success: true,
    data: undefined,
  };
}

/**
 * Obtém o usuário atualmente autenticado a partir dos cookies de sessão.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

