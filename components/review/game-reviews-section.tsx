"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewCard } from "@/components/review/review-card";
import { ProgressiveRatingDisplay } from "@/components/review/progressive-rating-display";
import type { GameReview, GameRatingSummary } from "@/types/review";

interface GameReviewsSectionProps {
  gameId: string;
  summary: GameRatingSummary;
  reviews: GameReview[];
  userReview: GameReview | null;
  currentUserId?: string;
}

export function GameReviewsSection({
  gameId,
  summary,
  reviews,
  userReview: initialUserReview,
  currentUserId,
}: GameReviewsSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userReview, setUserReview] = useState<GameReview | null>(initialUserReview);
  const [reviewList, setReviewList] = useState<GameReview[]>(reviews);

  const handleReviewDeleted = (deletedId: string) => {
    if (userReview?.id === deletedId) {
      setUserReview(null);
    }
    setReviewList((prev) => prev.filter((r) => r.id !== deletedId));
  };

  return (
    <section className="space-y-6 pt-6 border-t border-surface-border">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="h-5 w-1.5 bg-primary rounded-full" />
            Avaliações da Comunidade
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Baseadas nos 5 Tempos progressivos de gameplay dos jogadores.
          </p>
        </div>

        {/* Botão de Avaliar */}
        {!isFormOpen && (
          <div>
            {currentUserId ? (
              !userReview ? (
                <Button
                  size="sm"
                  onClick={() => setIsFormOpen(true)}
                  className="font-bold shadow-lg shadow-primary/20 text-xs sm:text-sm"
                >
                  + Avaliar este Jogo
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFormOpen(true)}
                  className="text-xs sm:text-sm"
                >
                  Editar Minha Avaliação
                </Button>
              )
            ) : (
              <Link href={`/login?returnTo=/catalog`}>
                <Button variant="outline" size="sm" className="text-xs">
                  Entrar para Avaliar
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Formulário de Criação / Edição (quando aberto) */}
      {isFormOpen && (
        <ReviewForm
          gameId={gameId}
          initialReview={userReview}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {/* Resumo Estatístico das Notas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-surface-border bg-surface/50 p-5 backdrop-blur-sm">
        {/* Média Geral */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-surface-border/60 text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Média Geral
          </span>
          <div className="text-4xl sm:text-5xl font-black text-primary">
            {summary.overall_average !== null ? summary.overall_average.toFixed(1) : "—"}
          </div>
          <span className="text-xs text-gray-500">
            {summary.total_reviews === 1
              ? "1 avaliação pública"
              : `${summary.total_reviews} avaliações públicas`}
          </span>
        </div>

        {/* Breakdown dos 5 Tempos */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2.5 p-2">
          <span className="text-xs font-bold text-gray-300">
            Progressão das Médias nos 5 Tempos:
          </span>

          {summary.total_reviews > 0 ? (
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: "Tempo 1", val: summary.tempo_1_average },
                { label: "Tempo 2", val: summary.tempo_2_average },
                { label: "Tempo 3", val: summary.tempo_3_average },
                { label: "Tempo 4", val: summary.tempo_4_average },
                { label: "Tempo 5", val: summary.tempo_5_average },
              ].map((tempo, i) => (
                <div
                  key={tempo.label}
                  className="p-2 rounded-lg bg-surface-muted/60 border border-surface-border"
                >
                  <span className="text-[10px] text-gray-400 block font-medium">
                    T{i + 1}
                  </span>
                  <span className="text-sm font-black text-white">
                    {tempo.val !== null ? tempo.val.toFixed(1) : "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Nenhuma avaliação pública registrada ainda. Seja o primeiro a avaliar este título!
            </p>
          )}
        </div>
      </div>

      {/* Avaliação do próprio usuário (se existir e não estiver editando) */}
      {userReview && !isFormOpen && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-cyan" />
            Sua Avaliação
          </span>
          <ReviewCard
            review={userReview}
            isOwner={true}
            onEdit={() => setIsFormOpen(true)}
            onDeleted={handleReviewDeleted}
          />
        </div>
      )}

      {/* Listagem de Reviews de outros jogadores */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-gray-200">
          Reviews dos Jogadores ({reviewList.filter((r) => r.id !== userReview?.id).length})
        </h3>

        {reviewList.filter((r) => r.id !== userReview?.id).length > 0 ? (
          <div className="space-y-3">
            {reviewList
              .filter((r) => r.id !== userReview?.id)
              .map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwner={review.user_id === currentUserId}
                  onDeleted={handleReviewDeleted}
                />
              ))}
          </div>
        ) : (
          !userReview && (
            <div className="text-center py-10 rounded-xl border border-dashed border-surface-border text-gray-500 text-xs">
              Nenhuma análise dissertativa escrita por outros jogadores ainda.
            </div>
          )
        )}
      </div>
    </section>
  );
}

