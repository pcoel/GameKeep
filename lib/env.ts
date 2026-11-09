import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      required_error: "NEXT_PUBLIC_SUPABASE_URL não configurada.",
    })
    .url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({
      required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada.",
    })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY não pode estar vazia."),
});

// Validação segura em tempo de execução
export function getEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    // Em tempo de compilação ou execução inicial, fornece aviso se ausente
    console.warn("Aviso de configuração de variáveis de ambiente:", parsed.error.format());
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    };
  }

  return parsed.data;
}

export const env = getEnv();

