"use client";

import React, { useState } from "react";
import { updatePrivacy } from "@/services/profile-service";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface PrivacySettingsFormProps {
  initialIsProfilePublic: boolean;
  initialIsLibraryPublic: boolean;
}

export function PrivacySettingsForm({
  initialIsProfilePublic,
  initialIsLibraryPublic,
}: PrivacySettingsFormProps) {
  const [isProfilePublic, setIsProfilePublic] = useState(initialIsProfilePublic);
  const [isLibraryPublic, setIsLibraryPublic] = useState(initialIsLibraryPublic);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await updatePrivacy({
        is_profile_public: isProfilePublic,
        is_library_public: isLibraryPublic,
      });

      if (!res.success) {
        setGeneralError(res.error);
      } else {
        setSuccessMsg("Preferências de privacidade atualizadas com sucesso!");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setGeneralError(error?.message || "Erro ao salvar preferências de privacidade.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Preferências de Privacidade</CardTitle>
        <CardDescription>
          Controle individualmente o que é visível publicamente na plataforma.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {generalError && <Alert variant="error">{generalError}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <div className="space-y-4">
            <Toggle
              label="Perfil Público"
              description="Quando ativado, outros jogadores podem visualizar seu nome de exibição, foto e biografia. Se desativado, seu perfil permanece estritamente privado."
              checked={isProfilePublic}
              onChange={setIsProfilePublic}
              disabled={isLoading}
            />

            <Toggle
              label="Biblioteca Pública"
              description="Quando ativado, sua lista de jogos e status de jogatina poderão ser visualizados por outros usuários. Funciona de forma independente do perfil e das avaliações."
              checked={isLibraryPublic}
              onChange={setIsLibraryPublic}
              disabled={isLoading}
            />
          </div>

          <div className="bg-surface-muted/40 p-3 rounded-lg border border-surface-border text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">
              🔒 Princípio de Privacidade por Padrão (Constituição §4.4):
            </p>
            <p>
              Tornar seu perfil público não torna sua biblioteca pública automaticamente. Cada preferência é independente e isolada no banco de dados com Row Level Security.
            </p>
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Salvar Privacidade
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}

