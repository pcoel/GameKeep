import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar | GameKeep",
  description: "Acesse sua conta no GameKeep para visualizar sua coleção de jogos e histórico.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}

