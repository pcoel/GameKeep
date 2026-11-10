import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/services/profile-service";
import { getUserReviews } from "@/services/review-service";
import { ProfileCard } from "@/components/profile/profile-card";
import { UserReviewsList } from "@/components/profile/user-reviews-list";

export const metadata: Metadata = {
  title: "Meu Perfil | GameKeep",
  description: "Visualize suas informações de perfil e preferências no GameKeep.",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?returnTo=%2Fprofile");
  }

  const reviewsResponse = await getUserReviews(profile.id, true);
  const reviews = reviewsResponse.success ? reviewsResponse.data : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-3xl font-black text-white">Perfil do Jogador</h1>
        <p className="text-sm text-gray-400">
          Visualize sua identidade digital e preferências no GameKeep.
        </p>
      </div>

      <ProfileCard profile={profile} />

      {/* Seção de Avaliações do Usuário (Feature 003) */}
      <section className="space-y-4">
        <div className="border-b border-surface-border pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-4 w-1 bg-primary rounded-full" />
              Minhas Avaliações
            </h2>
            <p className="text-xs text-gray-400">
              Histórico de jogos que você avaliou através do sistema de 5 Tempos.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-surface-muted text-gray-300 font-bold border border-surface-border">
            {reviews.length} {reviews.length === 1 ? "jogo" : "jogos"}
          </span>
        </div>

        <UserReviewsList reviews={reviews} />
      </section>
    </div>
  );
}
