"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { signIn } from "@/services/auth-service";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || undefined;
  const isVerified = searchParams.get("verified") === "true";
  const authErrorParam = searchParams.get("error");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [generalError, setGeneralError] = useState<string | null>(
    authErrorParam === "email_verification_failed"
      ? "Não foi possível confirmar seu e-mail ou o link expirou. Tente novamente."
      : null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
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
    setIsLoading(true);

    try {
      const res = await signIn(
        {
          email: formData.email,
          password: formData.password,
        },
        returnTo
      );

      if (!res.success) {
        setGeneralError(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        router.push(res.data.redirectTo || "/profile");
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setGeneralError(error?.message || "Ocorreu um erro ao realizar login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center bg-gradient-to-r from-violet-400 to-primary bg-clip-text text-transparent">
          Entrar na Conta
        </CardTitle>
        <CardDescription className="text-center">
          Informe seu e-mail e senha para acessar sua biblioteca de jogos.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isVerified && (
            <Alert variant="success">
              <span className="font-semibold block">E-mail confirmado com sucesso!</span>
              Sua conta está ativada e pronta para uso. Faça login para continuar.
            </Alert>
          )}

          {generalError && <Alert variant="error">{generalError}</Alert>}

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
            disabled={isLoading}
            required
          />

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Entrar
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-xs text-gray-400">
          <span>Ainda não tem uma conta?</span>
          <Link
            href="/register"
            className="ml-1 text-primary hover:text-primary-hover font-semibold underline underline-offset-4"
          >
            Cadastre-se gratuitamente
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400">Carregando formulário...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

