"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { addGameToLibrary } from "@/services/library-service";
import type { IGDBGameSearchResult } from "@/services/igdb-service";
import type { LibraryGameStatus, LibraryEntry } from "@/types/catalog";

interface AddToLibraryActionProps {
  game: IGDBGameSearchResult;
  initialInLibrary: boolean;
  initialEntry?: LibraryEntry;
}

const statusOptions: { value: LibraryGameStatus; label: string }[] = [
  { value: "want_to_play", label: "Quero jogar" },
  { value: "playing", label: "Jogando" },
  { value: "completed", label: "Concluído" },
];

export function AddToLibraryAction({
  game,
  initialInLibrary,
  initialEntry,
}: AddToLibraryActionProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<LibraryGameStatus>(
    initialEntry?.status || "want_to_play"
  );
  const [inLibrary, setInLibrary] = useState(initialInLibrary);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAdd = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await addGameToLibrary({
        igdb_id: game.id,
        name: game.name,
        slug: game.slug || null,
        cover_url: game.cover_url || null,
        summary: game.summary || null,
        first_release_date: game.first_release_date || null,
        status: selectedStatus,
      });

      if (response.success) {
        setInLibrary(true);
        setFeedback({
          type: "success",
          message: "Jogo adicionado à sua biblioteca com sucesso!",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: response.error,
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Ocorreu um erro ao adicionar o jogo. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-surface-border bg-surface/70 p-5 backdrop-blur-sm">
      <h3 className="font-bold text-white text-base">Minha Biblioteca</h3>

      {feedback && (
        <Alert variant={feedback.type}>
          {feedback.message}
        </Alert>
      )}

      {inLibrary ? (
        <div className="space-y-3">
          <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/30 rounded-lg text-sm text-emerald-300 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Este jogo já faz parte da sua coleção!</span>
          </div>

          <Link href="/library">
            <Button variant="outline" className="w-full text-xs">
              Ver na Minha Biblioteca →
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              Selecione o status inicial:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as LibraryGameStatus)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-surface-muted border border-surface-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAdd}
            isLoading={isLoading}
            className="w-full font-bold shadow-lg shadow-primary/20"
          >
            + Adicionar à Biblioteca
          </Button>
        </div>
      )}
    </div>
  );
}

