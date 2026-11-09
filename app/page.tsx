import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    isAuthenticated = false;
  }

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[128px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary mb-2">
          <span>✨ Feature 001 Ativa: Autenticação & Perfis de Usuário</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Sua Coleção de Jogos. <br />
          <span className="bg-gradient-to-r from-violet-400 via-primary to-accent-cyan bg-clip-text text-transparent">
            Suas Experiências Reais.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed">
          O GameKeep é sua biblioteca digital personalizada de videogames. Organize seus jogos, construa seu histórico de jogatina e proteja sua privacidade por padrão.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link href="/profile">
              <Button size="lg" className="w-full sm:w-auto text-base font-bold">
                Acessar Meu Perfil
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base font-bold">
                  Criar Conta Gratuita
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Fazer Login
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Três Pilares da Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="p-6 rounded-xl border border-surface-border bg-surface/60 backdrop-blur-sm space-y-2.5">
            <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
              👤
            </div>
            <h3 className="text-lg font-bold text-white">Perfis & Privacidade</h3>
            <p className="text-sm text-gray-400">
              Controle independente de privacidade. Seu perfil e sua biblioteca permanecem privados por padrão até você decidir compartilhar.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-surface-border bg-surface/60 backdrop-blur-sm space-y-2.5">
            <div className="h-10 w-10 rounded-lg bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold">
              🎮
            </div>
            <h3 className="text-lg font-bold text-white">Catálogo & Biblioteca</h3>
            <p className="text-sm text-gray-400">
              Em breve na Feature 002: Organização completa dos seus jogos entre &apos;Quero Jogar&apos;, &apos;Jogando&apos; e &apos;Concluído&apos;.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-surface-border bg-surface/60 backdrop-blur-sm space-y-2.5">
            <div className="h-10 w-10 rounded-lg bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald font-bold">
              ⭐
            </div>
            <h3 className="text-lg font-bold text-white">Reviews em 5 Momentos</h3>
            <p className="text-sm text-gray-400">
              Em breve na Feature 003: Avaliações baseadas nos 5 momentos da experiência do jogador com gráficos interativos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

