import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/services/profile-service";
import { ProfileCard } from "@/components/profile/profile-card";

export const metadata: Metadata = {
  title: "Meu Perfil | GameKeep",
  description: "Visualize suas informações de perfil e preferências no GameKeep.",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?returnTo=%2Fprofile");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-3xl font-black text-white">Perfil do Jogador</h1>
        <p className="text-sm text-gray-400">
          Visualize sua identidade digital e preferências no GameKeep.
        </p>
      </div>

      <ProfileCard profile={profile} />
    </div>
  );
}

