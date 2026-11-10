import React from "react";
import Link from "next/link";
import { ProgressiveRatingDisplay } from "@/components/review/progressive-rating-display";
import type { GameReview } from "@/types/review";

interface UserReviewsListProps {
  reviews: GameReview[];
}

export function UserReviewsList({ reviews }: UserReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border/60 bg-surface/30 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-surface-muted flex items-center justify-center text-xl text-gray-500">
          ⭐
        </div>
        <h4 className="text-base font-bold text-white">Nenhuma avaliação realizada</h4>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Você ainda não avaliou nenhum jogo. Explore o catálogo para registrar suas experiências nos 5 Tempos!
        </p>
        <div className="pt-2">
          <Link
            href="/catalog"
            className="inline-flex items-center text-xs text-primary font-bold hover:underline"
          >
            Explorar Catálogo →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const game = review.game;
        const dateFormatted = new Date(review.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return (
          <div
            key={review.id}
            className="rounded-xl border border-surface-border bg-surface p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:border-surface-border/90 transition-colors"
          >
            {/* Capa do Jogo */}
            <div className="w-16 h-22 sm:w-20 sm:h-28 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden bg-surface-muted border border-surface-border relative">
              {game?.cover_url ? (
                <img
                  src={game.cover_url}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 text-center p-1">
                  Sem capa
                </div>
              )}
            </div>

            {/* Informações da Review */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {game?.igdb_id ? (
                    <Link
                      href={`/catalog/${game.igdb_id}`}
                      className="font-bold text-base text-white hover:text-primary transition-colors line-clamp-1"
                    >
                      {game.name}
                    </Link>
                  ) : (
                    <h4 className="font-bold text-base text-white line-clamp-1">
                      {game?.name || "Jogo"}
                    </h4>
                  )}
                  <span className="text-[11px] text-gray-500">Avaliado em {dateFormatted}</span>
                </div>

                {!review.is_public && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Privada
                  </span>
                )}
              </div>

              {/* Notas dos 5 Tempos e Média */}
              <ProgressiveRatingDisplay
                ratings={{
                  tempo_1: review.rating_tempo_1,
                  tempo_2: review.rating_tempo_2,
                  tempo_3: review.rating_tempo_3,
                  tempo_4: review.rating_tempo_4,
                  tempo_5: review.rating_tempo_5,
                  overall: review.overall_rating,
                }}
                size="sm"
              />

              {/* Texto dissertativo */}
              {review.content && (
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line pt-1">
                  {review.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

