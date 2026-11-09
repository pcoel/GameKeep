"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LibraryEntryCard } from "@/components/library/library-entry-card";
import { Button } from "@/components/ui/button";
import type { LibraryEntry, LibraryGameStatus } from "@/types/catalog";

interface LibraryGridProps {
  initialEntries: LibraryEntry[];
}

type TabKey = "all" | LibraryGameStatus;

interface TabConfig {
  key: TabKey;
  label: string;
}

const tabs: TabConfig[] = [
  { key: "all", label: "Todos" },
  { key: "want_to_play", label: "Quero jogar" },
  { key: "playing", label: "Jogando" },
  { key: "completed", label: "Concluído" },
];

export function LibraryGrid({ initialEntries }: LibraryGridProps) {
  const [entries, setEntries] = useState<LibraryEntry[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const counts: Record<TabKey, number> = {
    all: entries.length,
    want_to_play: entries.filter((e) => e.status === "want_to_play").length,
    playing: entries.filter((e) => e.status === "playing").length,
    completed: entries.filter((e) => e.status === "completed").length,
  };

  const filteredEntries =
    activeTab === "all"
      ? entries
      : entries.filter((entry) => entry.status === activeTab);

  const handleRemoved = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleStatusChanged = (entryId: string, newStatus: LibraryGameStatus) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status: newStatus } : e))
    );
  };

  return (
    <div className="space-y-6">
      {/* Abas de Filtro */}
      <div className="flex items-center gap-2 border-b border-surface-border overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key];

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-white bg-surface-muted/60"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-surface/30"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-surface-border text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grade de Jogos */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredEntries.map((entry) => (
            <LibraryEntryCard
              key={entry.id}
              entry={entry}
              onRemoved={handleRemoved}
              onStatusChanged={handleStatusChanged}
            />
          ))}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="text-center py-20 px-4 rounded-2xl border border-surface-border/60 bg-surface/20 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-muted flex items-center justify-center text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              {activeTab === "all"
                ? "Sua biblioteca está vazia"
                : `Nenhum jogo com status "${tabs.find((t) => t.key === activeTab)?.label}"`}
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Explore o catálogo de jogos para adicionar títulos e acompanhar seu progresso!
            </p>
          </div>
          <div className="pt-2">
            <Link href="/catalog">
              <Button variant="primary" className="shadow-lg shadow-primary/20">
                Explorar Catálogo →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

