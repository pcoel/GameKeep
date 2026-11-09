"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  initialQuery = "",
  onSearch,
  isLoading = false,
  placeholder = "Pesquisar jogos pelo título (ex: The Witcher, Zelda, Elden Ring)...",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      onSearch(trimmed);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full pl-12 pr-28 py-3.5 bg-surface border border-surface-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base shadow-inner disabled:opacity-60"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-surface-muted transition-colors text-xs"
              title="Limpar busca"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            disabled={query.trim().length < 2 || isLoading}
            className="h-9 px-4 font-semibold text-xs tracking-wide"
          >
            Buscar
          </Button>
        </div>
      </div>
      {query.length > 0 && query.trim().length < 2 && (
        <p className="mt-1.5 text-xs text-accent-rose pl-2">
          Digite pelo menos 2 caracteres para pesquisar.
        </p>
      )}
    </form>
  );
}

