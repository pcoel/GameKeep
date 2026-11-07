# Interface Contracts: Authentication & User Profiles

**Feature**: `001-auth-user-profiles`  
**Date**: 2026-11-07  
**Module**: Auth, Profiles, Privacy  
**Security Status**: Hardened (SEC-001, SEC-002, SEC-003 e melhorias adicionais incorporadas)

---

## 1. Contratos de Validação (Zod Schemas)

### 1.1. Esquema de Cadastro (`registerSchema`)
```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório." })
    .email("Formato de e-mail inválido.")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string({ required_error: "Senha é obrigatória." })
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número."),
  username: z
    .string({ required_error: "Nome de usuário é obrigatório." })
    .min(3, "O username deve ter no mínimo 3 caracteres.")
    .max(20, "O username deve ter no máximo 20 caracteres.")
    .regex(/^[a-zA-Z0-9_-]+$/, "O username deve conter apenas letras, números, hífens ou sublinhados.")
    .transform((val) => val.toLowerCase().trim()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

### 1.2. Esquema de Autenticação (`loginSchema`)
```typescript
export const loginSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório." })
    .email("Informe um e-mail válido.")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string({ required_error: "Senha é obrigatória." })
    .min(1, "A senha não pode estar em branco."),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 1.3. Esquema de Atualização de Perfil (`updateProfileSchema`)
> **Nota de Imutabilidade (SEC-003):** O campo `username` é estritamente omitido do esquema de atualização de perfil. O username é imutável após o cadastro. A biografia possui sanitização e normalização com `.trim()`.

```typescript
export const updateProfileSchema = z.object({
  display_name: z
    .string({ required_error: "Nome de exibição é obrigatório." })
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres.")
    .max(50, "Nome de exibição não pode ultrapassar 50 caracteres.")
    .trim(),
  avatar_url: z
    .string()
    .url("A URL do avatar deve ser válida.")
    .nullable()
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(300, "A biografia não pode ultrapassar 300 caracteres.")
    .transform((val) => val.trim())
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

### 1.4. Esquema de Atualização de Privacidade (`updatePrivacySchema`)
```typescript
export const updatePrivacySchema = z.object({
  is_profile_public: z.boolean({
    required_error: "A visibilidade do perfil é obrigatória.",
  }),
  is_library_public: z.boolean({
    required_error: "A visibilidade da biblioteca é obrigatória.",
  }),
});

export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
```

---

## 2. Configurações de Segurança e Cookies

### 2.1. Política de Cookies de Sessão (`cookieSecurityOptions`)
Configuração padrão obrigatória para manipulação de tokens nos clientes Supabase Server e Middleware:
```typescript
export const cookieSecurityOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
};
```

### 2.2. Prevenção de Open Redirect (`sanitizeRedirectUrl`)
Validação estrita de parâmetros de redirecionamento `returnTo` para impedir ataques de redirecionamento arbitrário para domínios externos:
```typescript
export function sanitizeRedirectUrl(returnTo: string | null | undefined): string {
  if (!returnTo) return "/profile";
  
  // Decodificar parâmetro
  const decoded = decodeURIComponent(returnTo).trim();

  // Deve iniciar com "/" e NÃO conter "//", "/\", ou ":" (evita URLs com protocolo absoluto ou schema-relative)
  if (
    decoded.startsWith("/") &&
    !decoded.startsWith("//") &&
    !decoded.startsWith("/\\") &&
    !decoded.includes(":")
  ) {
    return decoded;
  }

  return "/profile";
}
```

---

## 3. Tipagens de Dados (TypeScript Interfaces)

### 3.1. Modelo Completo de Perfil (`UserProfile`)
```typescript
export interface UserProfile {
  id: string; // UUID v4 vinculado ao auth.users(id)
  username: string; // Identificador exclusivo do usuário (imutável)
  display_name: string; // Nome público de exibição
  avatar_url: string | null; // URL da imagem do avatar
  bio: string | null; // Biografia do usuário
  is_profile_public: boolean; // Privacidade do perfil (default: false)
  is_library_public: boolean; // Privacidade da biblioteca (default: false)
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}
```

### 3.2. Modelo Público Sanitizado de Perfil (`PublicUserProfile`)
```typescript
export interface PublicUserProfile {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}
```

### 3.3. Resposta Padrão de Ações (`ActionResponse`)
```typescript
export type ActionResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## 4. Contratos de Serviços e Server Actions

### 4.1. Autenticação e Sessões (`authService`)
- **`checkUsernameAvailability(username: string): Promise<boolean>` (SEC-002)**
  - Executa consulta case-insensitive: `SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(:username) LIMIT 1`.
  - Retorna `true` se disponível, `false` se já em uso.
- **`signUp(input: RegisterInput): Promise<ActionResponse<{ user_id: string }>>` (SEC-002)**
  - **Passo 1 (Pré-checagem):** Executa `checkUsernameAvailability`. Se indisponível, retorna imediatamente `{ success: false, error: "Este nome de usuário já está em uso.", fieldErrors: { username: ["Nome de usuário já cadastrado."] } }`.
  - **Passo 2 (Execução Supabase Auth):** Chama `supabase.auth.signUp()`, enviando `username` e `display_name` nos metadados.
  - **Passo 3 (Tratamento de Corrida / Race Condition):** Caso uma tentativa simultânea colida no trigger `handle_new_user`, captura o erro do banco de dados (código `23505` ou mensagem de trigger) e mapeia para a mensagem amigável de duplicidade de username, desfazendo a criação.
- **`signIn(input: LoginInput, returnTo?: string): Promise<ActionResponse<{ user_id: string; redirectTo: string }>>`**
  - Autentica usuário com e-mail e senha via `supabase.auth.signInWithPassword()`.
  - Retorna a rota de redirecionamento sanitizada via `sanitizeRedirectUrl(returnTo)`.
- **`signOut(): Promise<ActionResponse<void>>`**
  - Invalida a sessão corrente via `supabase.auth.signOut()`.
  - Limpa cookies de sessão no servidor e redireciona para a home/login.

### 4.2. Operações de Perfil (`profileService`)
- **`getCurrentProfile(): Promise<UserProfile | null>`**
  - Recupera a sessão atual e busca o perfil do usuário logado.
  - Executado no servidor via Server Component ou Server Action.
- **`updateProfile(input: UpdateProfileInput): Promise<ActionResponse<UserProfile>>` (SEC-003)**
  - Valida o payload com `updateProfileSchema`.
  - Garante que apenas `display_name`, `avatar_url` e `bio` sejam passados para atualização.
  - Executa mutação no PostgreSQL restrita a `auth.uid() = id`.
  - Protegido no banco contra alteração de `username` pelo trigger `protect_username_immutability`.
  - Executa `revalidatePath('/profile')` e `revalidatePath('/settings/profile')`.
- **`updatePrivacy(input: UpdatePrivacyInput): Promise<ActionResponse<void>>`**
  - Valida o payload com `updatePrivacySchema`.
  - Atualiza as flags `is_profile_public` e `is_library_public` de forma independente.
  - Executa revalidação de caminhos no cache do Next.js.
- **`getPublicProfileByUsername(username: string): Promise<PublicUserProfile | null>`**
  - Busca o perfil de um usuário pelo `username` (case-insensitive).
  - Respeita o RLS: se o perfil for privado e quem consulta não for o dono, o banco retorna nulo/vazio.

---

## 5. Contrato do Middleware de Proteção de Rotas

O middleware intercepta todas as requisições excluindo arquivos estáticos e imagens (`_next/static`, `_next/image`, `favicon.ico`).

| Rota Requisitada | Condição de Sessão | Ação Executada | Parâmetro de Redirecionamento |
|---|---|---|---|
| `/profile`, `/settings/*` | Sessão Ausente / Inválida | Redirecionamento HTTP 307 para `/login` | `?returnTo=${encodeURIComponent(request.nextUrl.pathname)}` |
| `/profile`, `/settings/*` | Sessão Válida | Prossegue normalmente para o Server Component | — |
| `/login`, `/register` | Sessão Válida | Redirecionamento HTTP 307 para `/profile` | — |
| `/login`, `/register` | Sessão Ausente | Prossegue normalmente para o formulário público | — |
