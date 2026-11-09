import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Atualiza e renova a sessão via cookies httpOnly
  const { supabaseResponse, user } = await updateSession(request);

  // 1. Verificação de rotas protegidas (privadas)
  const isProtectedRoute =
    pathname === "/profile" ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile/");

  if (isProtectedRoute && !user) {
    const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
    const redirectUrl = new URL(`/login?returnTo=${returnUrl}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Redirecionamento de usuários já autenticados tentando acessar telas de auth pública
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute && user) {
    const redirectUrl = new URL("/profile", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas de requisição, excluindo:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     * - arquivos com extensão de imagem (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

