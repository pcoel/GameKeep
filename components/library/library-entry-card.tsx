"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/library/status-badge";
import { Button } from "@/components/ui/button";
import { updateLibraryGameStatus, removeGameFromLibrary } from "@/services/library-service";
import type { LibraryEntry, LibraryGameStatus } from "@/types/catalog";

interface LibraryEntryCardProps {
  entry: LibraryEntry;
  onRemoved?: (entryId: string) => void;
  onStatusChanged?: (entryId: string, newStatus: LibraryGameStatus) => void;
}

const statusOptions: { value: LibraryGameStatus; label: string }[] = [
  { value: "want_to_play", label: "Quero jogar" },
  { value: "playing", label: "Jogando" },
  { value: "completed", label: "Concluído" },
];

export function LibraryEntryCard({
  entry,
  onRemoved,
  onStatusChanged,
}: LibraryEntryCardProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<LibraryGameStatus>(entry.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const game = entry.game;

  const handleStatusChange = async (newStatus: LibraryGameStatus) => {
    if (newStatus === currentStatus) return;

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const res = await updateLibraryGameStatus({
        entry_id: entry.id,
        status: newStatus,
      });

      if (!res.success) {
        setCurrentStatus(previousStatus);
        setErrorMessage(res.error);
      } else {
        if (onStatusChanged) {
          onStatusChanged(entry.id, newStatus);
        }
        router.refresh();
      }
    } catch {
      setCurrentStatus(previousStatus);
      setErrorMessage("Erro ao atualizar status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await removeGameFromLibrary({ entry_id: entry.id });

      if (!res.success) {
        setErrorMessage(res.error);
        setIsDeleting(false);
        setShowConfirmDelete(false);
      } else {
        if (onRemoved) {
          onRemoved(entry.id);
        }
        router.refresh();
      }
    } catch {
      setErrorMessage("Erro ao remover jogo.");
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-surface-border bg-surface hover:border-surface-border/90 transition-all duration-200">
      {/* Capa do Jogo */}
      <div className="relative aspect-[3/4] w-full bg-surface-muted overflow-hidden">
        {game?.cover_url ? (
          <img
            src={game.cover_url}
            alt={`Capa de ${game.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
            <svg className="w-10 h-10 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">Sem capa</span>
          </div>
        )}

        {/* Badge de Status Atual no Topo */}
        <div className="absolute top-2 left-2 z-10">
          <StatusBadge status={currentStatus} size="sm" />
        </div>

        {/* Badge de Avaliação do Usuário (Feature 003) */}
        {entry.user_rating !== undefined && entry.user_rating !== null && (
          <div
            className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-primary/50 text-primary font-black text-[11px] flex items-center gap-1 shadow-md"
            title={`Sua nota média: ${entry.user_rating.toFixed(1)}`}
          >
            <span className="text-amber-400">★</span>
            <span>{entry.user_rating.toFixed(1)}</span>
          </div>
        )}

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Conteúdo e Ações */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {game?.igdb_id ? (
            <Link
              href={`/catalog/${game.igdb_id}`}
              className="font-bold text-sm text-gray-100 hover:text-primary transition-colors line-clamp-2 leading-tight"
              title={game.name}
            >
              {game.name}
            </Link>
          ) : (
            <h4 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight">
              {game?.name || "Jogo"}
            </h4>
          )}

          <div className="mt-1">
            {entry.user_rating !== undefined && entry.user_rating !== null ? (
              <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                <span className="text-amber-400">★</span> Nota pessoal: {entry.user_rating.toFixed(1)}
              </span>
            ) : game?.igdb_id ? (
              <Link
                href={`/catalog/${game.igdb_id}`}
                className="text-[10px] text-gray-500 hover:text-primary transition-colors"
              >
                + Avaliar este jogo
              </Link>
            ) : null}
          </div>
        </div>

        {/* Mensagem de Erro Inline */}
        {errorMessage && (
          <p className="text-[11px] text-accent-rose font-medium leading-none">
            {errorMessage}
          </p>
        )}

        {/* Controles de Status e Exclusão */}
        <div className="space-y-2 pt-2 border-t border-surface-border/60">
          <div className="flex items-center justify-between gap-1">
            <label className="text-[11px] text-gray-400 font-medium">Status:</label>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as LibraryGameStatus)}
              disabled={isUpdating || isDeleting}
              className="px-2 py-1 bg-surface-muted border border-surface-border rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de Remover / Modal de Confirmação */}
          {!showConfirmDelete ? (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="w-full text-center text-[11px] text-gray-500 hover:text-accent-rose py-1 transition-colors"
            >
              Remover da biblioteca
            </button>
          ) : (
            <div className="p-2 rounded bg-surface-muted border border-accent-rose/30 space-y-1.5 animate-fadeIn">
              <p className="text-[10px] text-rose-300 font-medium text-center">
                Remover este jogo?
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="danger"
                  className="w-1/2 py-1 text-[10px] h-7"
                  onClick={handleRemove}
                  isLoading={isDeleting}
                >
                  Sim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-1/2 py-1 text-[10px] h-7"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Não
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

