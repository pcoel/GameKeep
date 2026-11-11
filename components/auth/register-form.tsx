"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { signUp } from "@/services/auth-service";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({
        confirmPassword: ["As senhas não coincidem."],
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (!res.success) {
        setGeneralError(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        if (res.data?.requiresEmailConfirmation) {
          setIsRegistered(true);
        } else {
          setSuccessMsg("Conta criada com sucesso! Redirecionando...");
          setTimeout(() => {
            router.push("/profile");
            router.refresh();
          }, 1200);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setGeneralError(error?.message || "Ocorreu um erro inesperado ao cadastrar.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="w-12 h-12 mx-auto rounded-full bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan text-xl mb-2">
            ✉️
          </div>
          <CardTitle className="text-2xl text-center text-white">
            Confirme seu E-mail
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Sua conta no GameKeep foi pré-cadastrada com sucesso!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-4 rounded-xl bg-surface-muted border border-surface-border text-sm text-gray-300 space-y-2">
            <p>
              Enviamos um link de confirmação para o endereço:
            </p>
            <p className="font-bold text-white text-base">
              {formData.email}
            </p>
            <p className="text-xs text-gray-400">
              Acesse sua caixa de entrada e clique no link de ativação para liberar o acesso à sua conta antes de fazer login.
            </p>
          </div>

          <Link href="/login" className="block pt-2">
            <Button className="w-full font-bold">
              Ir para a Página de Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center bg-gradient-to-r from-violet-400 to-primary bg-clip-text text-transparent">
          Criar Conta
        </CardTitle>
        <CardDescription className="text-center">
          Junte-se ao GameKeep para organizar seus jogos e registrar suas experiências.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {generalError && <Alert variant="error">{generalError}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Input
            label="Nome de Usuário (Username)"
            name="username"
            placeholder="ex: player_one"
            value={formData.username}
            onChange={handleChange}
            error={fieldErrors.username?.[0]}
            helperText="3 a 20 caracteres (letras, números, _ ou -). Imutável após o cadastro."
            disabled={isLoading}
            required
          />

          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email?.[0]}
            disabled={isLoading}
            required
          />

          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password?.[0]}
            helperText="Mínimo 8 caracteres, com letras e números."
            disabled={isLoading}
            required
          />

          <Input
            label="Confirmar Senha"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword?.[0]}
            disabled={isLoading}
            required
          />

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Criar Conta
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-xs text-gray-400">
          <span>Já possui uma conta?</span>
          <Link
            href="/login"
            className="ml-1 text-primary hover:text-primary-hover font-semibold underline underline-offset-4"
          >
            Fazer Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

