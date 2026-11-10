import React from "react";

interface ProgressiveRatingDisplayProps {
  ratings: {
    tempo_1: number;
    tempo_2: number;
    tempo_3: number;
    tempo_4: number;
    tempo_5: number;
    overall: number;
  };
  size?: "sm" | "md";
  showOverall?: boolean;
}

export function ProgressiveRatingDisplay({
  ratings,
  size = "md",
  showOverall = true,
}: ProgressiveRatingDisplayProps) {
  const tempos = [
    { label: "T1", value: ratings.tempo_1 },
    { label: "T2", value: ratings.tempo_2 },
    { label: "T3", value: ratings.tempo_3 },
    { label: "T4", value: ratings.tempo_4 },
    { label: "T5", value: ratings.tempo_5 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 7.0) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (score >= 5.0) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 5 Tempos em Linha Progressiva */}
      <div className="flex items-center gap-1.5">
        {tempos.map((t, idx) => (
          <div
            key={t.label}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono ${getScoreColor(
              t.value
            )} ${size === "sm" ? "text-[10px]" : "text-xs"}`}
            title={`Tempo ${idx + 1}: ${t.value.toFixed(1)}`}
          >
            <span className="opacity-70 font-semibold">{t.label}:</span>
            <span className="font-bold">{t.value.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Média Final Destacada */}
      {showOverall && (
        <div
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/20 border border-primary/40 text-primary font-black ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          <span className="text-[10px] font-semibold text-gray-300">Média:</span>
          <span>{ratings.overall.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

