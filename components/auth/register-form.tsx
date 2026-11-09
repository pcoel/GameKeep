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
        setSuccessMsg("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          router.push("/profile");
          router.refresh();
        }, 1200);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setGeneralError(error?.message || "Ocorreu um erro inesperado ao cadastrar.");
    } finally {
      setIsLoading(false);
    }
  };

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

