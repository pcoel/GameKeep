"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/catalog/search-bar";
import { GameCard } from "@/components/catalog/game-card";
import { searchGames, type IGDBGameSearchResult } from "@/services/igdb-service";
import { Alert } from "@/components/ui/alert";

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<IGDBGameSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const performSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setError(null);

    // Atualiza a URL com o parâmetro de busca sem recarregar a página
    const params = new URLSearchParams(window.location.search);
    params.set("q", searchTerm);
    router.replace(`/catalog?${params.toString()}`);

    startTransition(async () => {
      const response = await searchGames(searchTerm);
      setHasSearched(true);

      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.error);
        setResults([]);
      }
    });
  };

  useEffect(() => {
    if (initialQuery.trim().length >= 2) {
      performSearch(initialQuery);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabeçalho da Página */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Catálogo de <span className="text-primary">Jogos</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
          Pesquise títulos na base de dados da IGDB e adicione jogos à sua biblioteca pessoal para
          organizar seu histórico e sua lista de desejos.
        </p>
      </div>

      {/* Barra de Pesquisa */}
      <div className="max-w-3xl">
        <SearchBar
          initialQuery={query}
          onSearch={performSearch}
          isLoading={isPending}
        />
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="error" className="max-w-3xl">
          {error}
        </Alert>
      )}

      {/* Estado de Carregamento */}
      {isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-surface-border bg-surface overflow-hidden animate-pulse"
            >
              <div className="aspect-[3/4] bg-surface-muted" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-surface-muted rounded w-3/4" />
                <div className="h-3 bg-surface-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resultados da Busca */}
      {!isPending && hasSearched && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-400 border-b border-surface-border pb-3">
            <span>
              Encontrados <strong className="text-white">{results.length}</strong> jogos para &quot;
              <strong className="text-primary">{query}</strong>&quot;
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Busca sem Resultados */}
      {!isPending && hasSearched && results.length === 0 && !error && (
        <div className="text-center py-16 px-4 rounded-2xl border border-surface-border bg-surface/40 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum jogo encontrado</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Não encontramos nenhum resultado para &quot;{query}&quot;. Tente pesquisar por outro nome
            ou verifique a ortografia do título.
          </p>
        </div>
      )}

      {/* Estado Inicial (Antes de pesquisar) */}
      {!hasSearched && !isPending && (
        <div className="text-center py-20 px-4 rounded-2xl border border-surface-border/60 bg-surface/20 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-primary/20 to-accent-cyan/20 border border-primary/30 flex items-center justify-center text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Comece explorando o catálogo</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Utilize a barra de pesquisa acima para encontrar jogos clássicos e lançamentos.
            Digite pelo menos 2 caracteres e pressione &quot;Buscar&quot;.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">
          Carregando catálogo...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
