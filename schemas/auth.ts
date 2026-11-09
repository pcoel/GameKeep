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
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "O username deve conter apenas letras, números, hífens ou sublinhados."
    )
    .transform((val) => val.toLowerCase().trim()),
});

export type RegisterInput = z.infer<typeof registerSchema>;

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

