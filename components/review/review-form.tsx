"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ProgressiveRatingInput } from "@/components/review/progressive-rating-input";
import { saveReview } from "@/services/review-service";
import type { GameReview } from "@/types/review";

interface ReviewFormProps {
  gameId: string;
  initialReview?: GameReview | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  gameId,
  initialReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();

  const [scores, setScores] = useState({
    tempo_1: initialReview ? initialReview.rating_tempo_1 : 8.0,
    tempo_2: initialReview ? initialReview.rating_tempo_2 : 8.0,
    tempo_3: initialReview ? initialReview.rating_tempo_3 : 8.0,
    tempo_4: initialReview ? initialReview.rating_tempo_4 : 8.0,
    tempo_5: initialReview ? initialReview.rating_tempo_5 : 8.0,
  });

  const [content, setContent] = useState(initialReview?.content || "");
  const [isPrivate, setIsPrivate] = useState(initialReview ? !initialReview.is_public : false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScoreChange = (
    key: "tempo_1" | "tempo_2" | "tempo_3" | "tempo_4" | "tempo_5",
    value: number
  ) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Validações básicas de limites no cliente
    const values = Object.values(scores).map(Number);
    if (values.some((v) => isNaN(v) || v < 0 || v > 10)) {
      setErrorMessage("Todas as notas dos 5 Tempos devem estar entre 0.0 e 10.0.");
      setIsLoading(false);
      return;
    }

    if (content.length > 2500) {
      setErrorMessage("O texto da review não pode ultrapassar 2.500 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await saveReview({
        game_id: gameId,
        review_id: initialReview?.id,
        rating_tempo_1: Number(scores.tempo_1),
        rating_tempo_2: Number(scores.tempo_2),
        rating_tempo_3: Number(scores.tempo_3),
        rating_tempo_4: Number(scores.tempo_4),
        rating_tempo_5: Number(scores.tempo_5),
        content: content.trim() ? content.trim() : null,
        is_public: !isPrivate,
      });

      if (!response.success) {
        setErrorMessage(response.error);
      } else {
        router.refresh();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch {
      setErrorMessage("Erro inesperado ao salvar a avaliação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-surface-border bg-surface p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
        <h3 className="font-bold text-white text-base sm:text-lg">
          {initialReview ? "Editar Avaliação & Review" : "Avaliar Jogo em 5 Tempos"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-white"
          >
            ✕ Fechar
          </button>
        )}
      </div>

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      {/* Input dos 5 Tempos */}
      <ProgressiveRatingInput
        scores={scores}
        onChange={handleScoreChange}
        disabled={isLoading}
      />

      {/* Texto dissertativo opcional */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-gray-200">
            Análise textual <span className="text-gray-500 font-normal">(opcional)</span>:
          </label>
          <span className={`text-[11px] ${content.length > 2500 ? "text-accent-rose font-bold" : "text-gray-500"}`}>
            {content.length} / 2.500 caracteres
          </span>
        </div>

        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          maxLength={2600}
          placeholder="Compartilhe sua experiência detalhada sobre o jogo, evolução do ritmo, pontos altos e baixos..."
          className="w-full px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      {/* Switch de Privacidade */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted/50 border border-surface-border/80">
        <input
          type="checkbox"
          id="is_private"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 rounded text-primary focus:ring-primary bg-background border-surface-border cursor-pointer"
        />
        <label htmlFor="is_private" className="text-xs text-gray-300 cursor-pointer select-none">
          <strong className="text-white">Marcar como avaliação privada</strong> — Visível apenas no seu diário pessoal, sem compor a média pública da comunidade.
        </label>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          size="sm"
          isLoading={isLoading}
          className="font-bold shadow-lg shadow-primary/25 px-5"
        >
          {initialReview ? "Atualizar Avaliação" : "Publicar Avaliação"}
        </Button>
      </div>
    </form>
  );
}

