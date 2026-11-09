"use client";

import React, { useState } from "react";
import { UserProfile } from "@/types/profile";
import { updateProfile } from "@/services/profile-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface ProfileEditFormProps {
  initialProfile: UserProfile;
}

export function ProfileEditForm({ initialProfile }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    display_name: initialProfile.display_name,
    avatar_url: initialProfile.avatar_url || "",
    bio: initialProfile.bio || "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await updateProfile({
        display_name: formData.display_name,
        avatar_url: formData.avatar_url,
        bio: formData.bio,
      });

      if (!res.success) {
        setGeneralError(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccessMsg("Perfil atualizado com sucesso!");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setGeneralError(error?.message || "Erro ao salvar alterações do perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Dados Cadastrais</CardTitle>
        <CardDescription>
          Personalize como você é apresentado na comunidade do GameKeep.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {generalError && <Alert variant="error">{generalError}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          {/* Username exibido como somente leitura (SEC-003) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Nome de Usuário (Identificador)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`@${initialProfile.username}`}
                disabled
                className="w-full rounded-lg bg-surface-muted/60 border border-surface-border px-3.5 py-2.5 text-sm text-gray-400 cursor-not-allowed select-none"
              />
              <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap px-2.5 py-1 rounded bg-surface-muted border border-surface-border">
                Imutável
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              O nome de usuário é único e não pode ser alterado após o cadastro (SEC-003).
            </p>
          </div>

          <Input
            label="Nome de Exibição (Display Name)"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            error={fieldErrors.display_name?.[0]}
            helperText="2 a 50 caracteres."
            disabled={isLoading}
            required
          />

          <Input
            label="URL da Foto de Perfil (Avatar)"
            name="avatar_url"
            type="url"
            placeholder="https://exemplo.com/avatar.jpg"
            value={formData.avatar_url}
            onChange={handleChange}
            error={fieldErrors.avatar_url?.[0]}
            helperText="Link direto para imagem (opcional)."
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Biografia
              </label>
              <span className="text-xs text-gray-500">
                {formData.bio.length} / 300
              </span>
            </div>
            <textarea
              name="bio"
              rows={3}
              maxLength={300}
              placeholder="Conte um pouco sobre sua trajetória gamer, seus consoles favoritos..."
              value={formData.bio}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-lg bg-surface border border-surface-border px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {fieldErrors.bio?.[0] && (
              <p className="text-xs text-accent-rose">{fieldErrors.bio[0]}</p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Salvar Alterações
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}

