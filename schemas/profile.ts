import { z } from "zod";

/**
 * Esquema de atualização de perfil.
 * Observação de Segurança (SEC-003): O campo username é estritamente omitido,
 * sendo imutável após a criação da conta.
 */
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

export const updatePrivacySchema = z.object({
  is_profile_public: z.boolean({
    required_error: "A visibilidade do perfil é obrigatória.",
  }),
  is_library_public: z.boolean({
    required_error: "A visibilidade da biblioteca é obrigatória.",
  }),
});

export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;

