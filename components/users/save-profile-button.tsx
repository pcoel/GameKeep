"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleSaveProfile } from "@/services/profile-discovery-service";

interface SaveProfileButtonProps {
  targetProfileId: string;
  initialIsSaved?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function SaveProfileButton({
  targetProfileId,
  initialIsSaved = false,
  size = "sm",
  className,
  showText = true,
}: SaveProfileButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const res = await toggleSaveProfile(targetProfileId);
      if (res.success && res.data) {
        setIsSaved(res.data.isSaved);
        router.refresh();
      } else if (!res.success && res.error?.includes("autenticado")) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={isSaved ? "primary" : "outline"}
      onClick={handleToggle}
      disabled={isLoading}
      className={className}
      title={isSaved ? "Remover dos perfis salvos" : "Salvar perfil"}
    >
      <svg
        className={`w-4 h-4 ${showText ? "mr-1.5" : ""} ${
          isSaved ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-400"
        } transition-colors`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {showText && (
        <span>{isLoading ? "Salvando..." : isSaved ? "Salvo" : "Salvar"}</span>
      )}
    </Button>
  );
}
