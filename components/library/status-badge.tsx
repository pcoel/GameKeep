import React from "react";
import { cn } from "@/lib/utils";
import type { LibraryGameStatus } from "@/types/catalog";

interface StatusBadgeProps {
  status: LibraryGameStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = {
    want_to_play: {
      label: "Quero jogar",
      styles: "bg-accent-cyan/15 text-cyan-300 border-accent-cyan/30",
      dot: "bg-accent-cyan",
    },
    playing: {
      label: "Jogando",
      styles: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      dot: "bg-purple-400 animate-pulse",
    },
    completed: {
      label: "Concluído",
      styles: "bg-accent-emerald/15 text-emerald-300 border-accent-emerald/30",
      dot: "bg-accent-emerald",
    },
  };

  const current = config[status] || {
    label: status,
    styles: "bg-gray-500/15 text-gray-300 border-gray-500/30",
    dot: "bg-gray-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-sm select-none",
        current.styles,
        sizeStyles[size],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      {current.label}
    </span>
  );
}

