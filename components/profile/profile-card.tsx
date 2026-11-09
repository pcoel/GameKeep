import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types/profile";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const memberSince = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden relative border-surface-border">
      {/* Banner decorativo gamer */}
      <div className="h-28 w-full bg-gradient-to-r from-violet-900 via-primary/40 to-surface-muted border-b border-surface-border" />

      <CardHeader className="relative pt-0 pb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-14 gap-4">
          <div className="flex items-end gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-24 w-24 rounded-2xl border-4 border-background bg-surface object-cover shadow-2xl"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl border-4 border-background bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-left mb-1">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                {profile.display_name}
              </h2>
              <p className="text-sm font-semibold text-primary">@{profile.username}</p>
            </div>
          </div>

          <Link href="/settings/profile">
            <Button variant="outline" size="sm">
              Editar Perfil
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Biografia */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Sobre o Jogador
          </h4>
          <p className="text-sm text-gray-200 leading-relaxed bg-surface-muted/40 p-3.5 rounded-lg border border-surface-border/50">
            {profile.bio || "Nenhuma biografia adicionada ainda. Clique em 'Editar Perfil' para compartilhar sua história nos jogos!"}
          </p>
        </div>

        {/* Status de Privacidade e Metadados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-lg border border-surface-border bg-surface-muted/30">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
              Visibilidade do Perfil
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile.is_profile_public
                  ? "bg-accent-emerald/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-surface-border text-gray-300 border border-gray-600/40"
              }`}
            >
              {profile.is_profile_public ? "● Perfil Público" : "🔒 Perfil Privado"}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-surface-border bg-surface-muted/30">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
              Visibilidade da Biblioteca
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile.is_library_public
                  ? "bg-accent-emerald/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-surface-border text-gray-300 border border-gray-600/40"
              }`}
            >
              {profile.is_library_public ? "● Biblioteca Pública" : "🔒 Biblioteca Privada"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between text-xs text-gray-400 border-t border-surface-border">
        <span>Membro desde {memberSince}</span>
        <span className="text-[11px] text-gray-500">ID: {profile.id.substring(0, 8)}...</span>
      </CardFooter>
    </Card>
  );
}

