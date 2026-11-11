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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-primary/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary mb-2 shadow-sm">
          <span>🎮 Catálogo IGDB • Biblioteca Pessoal • Avaliações em 5 Tempos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Sua Coleção de Jogos. <br />
          <span className="bg-gradient-to-r from-violet-400 via-primary to-accent-cyan bg-clip-text text-transparent">
            Suas Experiências Reais.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 leading-relaxed">
          O GameKeep é sua biblioteca digital personalizada de videogames. Organize seus jogos, registre análises profundas pelos 5 Tempos da experiência e conecte-se com outros jogadores.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
              <Link href="/catalog">
                <Button size="lg" className="text-base font-bold">
                  Explorar Catálogo
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" size="lg" className="text-base font-semibold">
                  Minha Biblioteca
                </Button>
              </Link>
              <Link href="/users">
                <Button variant="outline" size="lg" className="text-base">
                  Descobrir Jogadores
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Criar Conta Gratuita
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Explorar Catálogo
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
          <Link
            href={isAuthenticated ? "/users" : "/login"}
            className="group p-6 rounded-2xl border border-surface-border bg-surface-card/60 backdrop-blur-sm space-y-3 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
              Comunidade & Perfis
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Descubra outros jogadores pelo nome de usuário, salve perfis favoritos e compartilhe suas avaliações com total controle de privacidade.
            </p>
          </Link>

          <Link
            href="/catalog"
            className="group p-6 rounded-2xl border border-surface-border bg-surface-card/60 backdrop-blur-sm space-y-3 hover:border-accent-cyan/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-cyan/5"
          >
            <div className="h-10 w-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent-cyan transition-colors">
              Catálogo & Biblioteca
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pesquise milhares de jogos integrados com o catálogo oficial IGDB. Organize sua estante pessoal entre &apos;Quero Jogar&apos;, &apos;Jogando&apos; e &apos;Concluído&apos;.
            </p>
          </Link>

          <Link
            href={isAuthenticated ? "/library" : "/catalog"}
            className="group p-6 rounded-2xl border border-surface-border bg-surface-card/60 backdrop-blur-sm space-y-3 hover:border-accent-emerald/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-emerald/5"
          >
            <div className="h-10 w-10 rounded-xl bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald font-bold group-hover:scale-110 transition-transform">
              ⭐
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent-emerald transition-colors">
              Avaliações em 5 Tempos
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Avalie cada momento da experiência (Tempo 1 a 5) com notas decimais livres de 0 a 10, gerando médias aritméticas e análises aprofundadas.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
