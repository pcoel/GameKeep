import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameDetails } from "@/services/igdb-service";
import { getGameLibraryStatus } from "@/services/library-service";
import {
  ensureLocalGame,
  getGameRatingSummary,
  getGameReviews,
  getUserReviewForGame,
} from "@/services/review-service";
import { AddToLibraryAction } from "@/components/catalog/add-to-library-action";
import { GameReviewsSection } from "@/components/review/game-reviews-section";
import { Button } from "@/components/ui/button";

interface GameDetailPageProps {
  params: {
    id: string;
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const numericId = parseInt(params.id, 10);

  if (isNaN(numericId) || numericId <= 0) {
    notFound();
  }

  const [gameResult, libraryStatus] = await Promise.all([
    getGameDetails(numericId),
    getGameLibraryStatus(numericId),
  ]);

  if (!gameResult.success || !gameResult.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-accent-rose">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Jogo não encontrado</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Não foi possível encontrar as informações deste jogo no catálogo da IGDB.
        </p>
        <div className="pt-4">
          <Link href="/catalog">
            <Button variant="outline">← Voltar para o Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const game = gameResult.data;
  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Garante que o jogo exista na base local e carrega dados de reviews
  const localGameId = await ensureLocalGame({
    igdb_id: game.id,
    name: game.name,
    slug: game.slug,
    cover_url: game.cover_url,
    summary: game.summary,
    first_release_date: game.first_release_date,
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [summaryRes, reviewsRes, userReviewRes] = await Promise.all([
    getGameRatingSummary(localGameId),
    getGameReviews(localGameId),
    user ? getUserReviewForGame(localGameId) : Promise.resolve({ success: true, data: null }),
  ]);

  const summary = summaryRes.success
    ? summaryRes.data
    : {
        total_reviews: 0,
        overall_average: null,
        tempo_1_average: null,
        tempo_2_average: null,
        tempo_3_average: null,
        tempo_4_average: null,
        tempo_5_average: null,
      };

  const reviews = reviewsRes.success ? reviewsRes.data : [];
  const userReview = userReviewRes.success ? userReviewRes.data : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navegação de Retorno */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          ← Voltar para a pesquisa
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Coluna da Capa e Ação de Biblioteca */}
        <div className="space-y-6">
          <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-surface-border bg-surface-muted shadow-2xl relative">
            {game.cover_url ? (
              <img
                src={game.cover_url}
                alt={`Capa de ${game.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                <svg className="w-16 h-16 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Sem capa disponível</span>
              </div>
            )}
          </div>

          {/* Ação de Inclusão na Biblioteca */}
          <AddToLibraryAction
            game={game}
            initialInLibrary={libraryStatus.inLibrary}
            initialEntry={libraryStatus.entry}
          />
        </div>

        {/* Coluna de Informações e Sinopse */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <div className="space-y-2 border-b border-surface-border pb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              {game.name}
            </h1>
            {releaseYear && (
              <p className="text-sm font-medium text-gray-400">
                Lançamento: <span className="text-gray-200">{releaseYear}</span>
              </p>
            )}
          </div>

          {/* Sinopse */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-4 w-1 bg-primary rounded-full" />
              Sinopse
            </h2>
            {game.summary ? (
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {game.summary}
              </p>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Nenhuma sinopse disponível para este jogo no momento.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seção Completa de Avaliações & Reviews (Feature 003) */}
      <GameReviewsSection
        gameId={localGameId}
        summary={summary}
        reviews={reviews}
        userReview={userReview}
        currentUserId={user?.id}
      />
    </div>
  );
}
