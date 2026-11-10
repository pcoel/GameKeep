"use client";

import React from "react";

interface ProgressiveRatingInputProps {
  scores: {
    tempo_1: number | string;
    tempo_2: number | string;
    tempo_3: number | string;
    tempo_4: number | string;
    tempo_5: number | string;
  };
  onChange: (tempoKey: "tempo_1" | "tempo_2" | "tempo_3" | "tempo_4" | "tempo_5", value: number) => void;
  disabled?: boolean;
}

const temposConfig = [
  { key: "tempo_1" as const, label: "Tempo 1", subtitle: "Primeira etapa" },
  { key: "tempo_2" as const, label: "Tempo 2", subtitle: "Segunda etapa" },
  { key: "tempo_3" as const, label: "Tempo 3", subtitle: "Ponto médio" },
  { key: "tempo_4" as const, label: "Tempo 4", subtitle: "Reta final" },
  { key: "tempo_5" as const, label: "Tempo 5", subtitle: "Conclusão" },
];

export function ProgressiveRatingInput({
  scores,
  onChange,
  disabled = false,
}: ProgressiveRatingInputProps) {
  const getNum = (v: number | string) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const currentAverage = (
    (getNum(scores.tempo_1) +
      getNum(scores.tempo_2) +
      getNum(scores.tempo_3) +
      getNum(scores.tempo_4) +
      getNum(scores.tempo_5)) /
    5
  ).toFixed(1);

  return (
    <div className="space-y-4 rounded-xl border border-surface-border bg-surface/50 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-surface-border/60 pb-3">
        <div>
          <h4 className="font-bold text-sm text-white">Notas dos 5 Tempos de Gameplay</h4>
          <p className="text-xs text-gray-400">
            Atribua de 0.0 a 10.0 para cada etapa da sua experiência (aceita decimais livres).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-muted px-3 py-1.5 rounded-lg border border-surface-border">
          <span className="text-xs font-semibold text-gray-400">Média Calculada:</span>
          <span className="text-base font-black text-primary">{currentAverage}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {temposConfig.map((tempo) => {
          const val = scores[tempo.key];
          return (
            <div
              key={tempo.key}
              className="flex flex-col p-3 rounded-lg bg-surface-muted/60 border border-surface-border space-y-1.5 focus-within:border-primary/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200">{tempo.label}</span>
                <span className="text-[10px] text-gray-500">{tempo.subtitle}</span>
              </div>

              <input
                type="number"
                min="0"
                max="10"
                step="any"
                value={val}
                disabled={disabled}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChange(tempo.key, isNaN(val) ? 0 : val);
                }}
                className="w-full px-2.5 py-1.5 bg-background border border-surface-border rounded-md text-white font-bold text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="0.0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

