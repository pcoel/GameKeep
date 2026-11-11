import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Redireciona para o login com parâmetro verified=true
        return NextResponse.redirect(`${origin}/login?verified=true`);
      } else {
        console.error("Erro ao validar código de e-mail:", error);
      }
    } catch (err) {
      console.error("Exceção na confirmação de e-mail:", err);
    }
  }

  // Em caso de erro ou código ausente, redireciona para login com aviso
  return NextResponse.redirect(`${origin}/login?error=email_verification_failed`);
}

