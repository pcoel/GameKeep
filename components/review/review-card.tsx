"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgressiveRatingDisplay } from "@/components/review/progressive-rating-display";
import { deleteReview } from "@/services/review-service";
import type { GameReview } from "@/types/review";

interface ReviewCardProps {
  review: GameReview;
  isOwner?: boolean;
  onEdit?: () => void;
  onDeleted?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  isOwner = false,
  onEdit,
  onDeleted,
}: ReviewCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formattedDate = new Date(review.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteReview({ review_id: review.id });
      if (res.success) {
        if (onDeleted) {
          onDeleted(review.id);
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao excluir review:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-4 sm:p-5 space-y-4 hover:border-surface-border/90 transition-colors">
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-muted border border-surface-border flex items-center justify-center text-xs font-bold text-primary">
            {review.author?.avatar_url ? (
              <img
                src={review.author.avatar_url}
                alt={review.author.display_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (review.author?.display_name || "J").charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                {review.author?.display_name || review.author?.username || "Jogador"}
              </span>
              {!review.is_public && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Privada
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {/* Ações do Autor */}
        {isOwner && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Editar
              </button>
            )}

            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs text-gray-500 hover:text-accent-rose transition-colors"
              >
                Excluir
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-surface-muted px-2 py-1 rounded-md border border-accent-rose/30">
                <span className="text-[10px] text-rose-300">Excluir?</span>
                <Button
                  size="sm"
                  variant="danger"
                  className="h-6 px-2 text-[10px]"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  Sim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Não
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exibição dos 5 Tempos e Média */}
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

      {/* Conteúdo Dissertativo (se houver) */}
      {review.content && (
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line pt-1">
          {review.content}
        </p>
      )}
    </div>
  );
}

