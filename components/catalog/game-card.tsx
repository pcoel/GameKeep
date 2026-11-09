import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { IGDBGameSearchResult } from "@/services/igdb-service";

interface GameCardProps {
  game: IGDBGameSearchResult;
}

export function GameCard({ game }: GameCardProps) {
  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date).getFullYear()
    : null;

  return (
    <Link
      href={`/catalog/${game.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-surface-border bg-surface hover:border-primary/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Container de Capa em Proporção 3:4 */}
      <div className="relative aspect-[3/4] w-full bg-surface-muted overflow-hidden flex items-center justify-center">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={`Capa do jogo ${game.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
            <svg
              className="w-12 h-12 mb-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium">Sem imagem</span>
          </div>
        )}

        {/* Gradiente sutil na base da capa */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Badge de Ano de Lançamento */}
        {releaseYear && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-black/70 text-gray-300 backdrop-blur-md border border-white/10">
            {releaseYear}
          </span>
        )}
      </div>

      {/* Detalhes do Jogo */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h4
            className="font-bold text-sm text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
            title={game.name}
          >
            {game.name}
          </h4>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-surface-border/50 pt-2">
          <span className="text-[11px] text-primary font-medium group-hover:underline">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}

