import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/services/profile-service";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { PrivacySettingsForm } from "@/components/profile/privacy-settings-form";

export const metadata: Metadata = {
  title: "Configurações de Perfil | GameKeep",
  description: "Atualize seus dados de exibição e controle as preferências de privacidade.",
};

export default async function SettingsProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?returnTo=%2Fsettings%2Fprofile");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Configurações de Conta</h1>
        <p className="text-sm text-gray-400">
          Gerencie suas informações de perfil e preferências individuais de privacidade.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Formulário de Edição de Dados Cadastrais (SEC-003) */}
        <ProfileEditForm initialProfile={profile} />

        {/* Formulário de Preferências de Privacidade (Constituição §4.4) */}
        <PrivacySettingsForm
          initialIsProfilePublic={profile.is_profile_public}
          initialIsLibraryPublic={profile.is_library_public}
        />
      </div>
    </div>
  );
}

