import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublicProfile } from "@/services/profile-discovery-service";
import { getPublicUserLibrary } from "@/services/library-service";
import { getUserReviews } from "@/services/review-service";
import { SaveProfileButton } from "@/components/users/save-profile-button";
import { UserReviewsList } from "@/components/profile/user-reviews-list";
import { StatusBadge } from "@/components/library/status-badge";
import { Button } from "@/components/ui/button";

interface PublicUserProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({
  params,
}: PublicUserProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  return {
    title: `@${username} | GameKeep`,
    description: `Perfil público do jogador @${username} no GameKeep.`,
  };
}

export const dynamic = "force-dynamic";

export default async function PublicUserProfilePage({
  params,
}: PublicUserProfilePageProps) {
  const username = decodeURIComponent(params.username);
  const profileRes = await getPublicProfile(username);

  if (!profileRes.success || !profileRes.data) {
    notFound();
  }

  const { profile, isSaved, isOwner } = profileRes.data;

  // Carregar biblioteca pública se permitido
  let libraryEntries: any[] = [];
  let libraryError: string | null = null;
  if (profile.is_library_public || isOwner) {
    const libRes = await getPublicUserLibrary(username);
    if (libRes.success) {
      libraryEntries = libRes.data ?? [];
    } else {
      libraryError = "Não foi possível carregar a biblioteca.";
    }
  }

  // Carregar avaliações públicas (ou todas se for o próprio dono)
  const reviewsRes = await getUserReviews(profile.id, isOwner);
  const reviews = reviewsRes.success && reviewsRes.data ? reviewsRes.data : [];

  const initial = (profile.display_name || profile.username || "U").charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Header do Perfil */}
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-surface-border bg-surface-muted flex items-center justify-center font-black text-3xl text-primary shadow-xl">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-sm font-medium text-gray-400">@{profile.username}</p>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
                {isOwner ? (
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm">
                      Editar Perfil
                    </Button>
                  </Link>
                ) : (
                  <SaveProfileButton
                    targetProfileId={profile.id}
                    initialIsSaved={isSaved}
                    size="md"
                  />
                )}
              </div>
            </div>

            {/* Badges de Privacidade */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.is_profile_public
                    ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30"
                    : "bg-surface-muted text-gray-400 border border-surface-border"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    profile.is_profile_public ? "bg-accent-emerald" : "bg-gray-500"
                  }`}
                />
                {profile.is_profile_public ? "Perfil Público" : "Perfil Privado"}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.is_library_public
                    ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                    : "bg-surface-muted text-gray-400 border border-surface-border"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    profile.is_library_public ? "bg-accent-cyan" : "bg-gray-500"
                  }`}
                />
                {profile.is_library_public ? "Biblioteca Pública" : "Biblioteca Privada"}
              </span>
            </div>

            {/* Bio (se perfil público ou se for o dono) */}
            {(profile.is_profile_public || isOwner) && (
              <div className="pt-2">
                {profile.bio ? (
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Nenhuma biografia informada.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Se o perfil for privado e quem visualiza não for o dono */}
      {!profile.is_profile_public && !isOwner ? (
        <div className="rounded-2xl border border-surface-border bg-surface-card/40 p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-xl text-gray-400">
            🔒
          </div>
          <h3 className="text-lg font-bold text-white">Este perfil é privado</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            O jogador optou por manter suas informações, biografia, biblioteca e avaliações em modo privado.
          </p>
        </div>
      ) : (
        <>
          {/* Seção Biblioteca Pública */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="h-4 w-1 bg-accent-cyan rounded-full" />
                  Biblioteca de Jogos
                </h2>
                <p className="text-xs text-gray-400">
                  Jogos na coleção de @{profile.username}
                </p>
              </div>
              {profile.is_library_public || isOwner ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface-muted text-gray-300 font-bold border border-surface-border">
                  {libraryEntries.length} {libraryEntries.length === 1 ? "jogo" : "jogos"}
                </span>
              ) : null}
            </div>

            {!profile.is_library_public && !isOwner ? (
              <div className="rounded-xl border border-surface-border/60 bg-surface-card/40 p-6 text-center text-xs text-gray-400">
                🔒 A biblioteca deste jogador é privada.
              </div>
            ) : libraryEntries.length === 0 ? (
              <div className="rounded-xl border border-surface-border/60 bg-surface-card/40 p-6 text-center text-xs text-gray-400">
                Nenhum jogo na biblioteca no momento.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {libraryEntries.map((entry) => {
                  const game = entry.game;
                  return (
                    <div
                      key={entry.id}
                      className="group rounded-xl border border-surface-border bg-surface-card p-3 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-muted relative border border-surface-border">
                          {game?.cover_url ? (
                            <img
                              src={game.cover_url}
                              alt={game.name || "Capa do jogo"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                              Sem capa
                            </div>
                          )}
                        </div>

                        {game?.igdb_id ? (
                          <Link
                            href={`/catalog/${game.igdb_id}`}
                            className="font-bold text-xs text-white group-hover:text-primary transition-colors line-clamp-1 block"
                          >
                            {game.name}
                          </Link>
                        ) : (
                          <p className="font-bold text-xs text-white line-clamp-1">
                            {game?.name}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <StatusBadge status={entry.status} />
                        {entry.user_rating !== null && (
                          <span className="text-[11px] font-bold text-accent-cyan">
                            ★ {Number(entry.user_rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Seção Avaliações Públicas */}
          <section className="space-y-4">
            <div className="border-b border-surface-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="h-4 w-1 bg-primary rounded-full" />
                  Avaliações {isOwner ? "do Jogador" : "Públicas"}
                </h2>
                <p className="text-xs text-gray-400">
                  Avaliações registradas nos 5 Tempos
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-muted text-gray-300 font-bold border border-surface-border">
                {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>

            <UserReviewsList reviews={reviews} />
          </section>
        </>
      )}
    </div>
  );
}

