import React from "react";
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar Conta | GameKeep",
  description: "Crie sua conta individual no GameKeep para catalogar seus jogos e registrar avaliações.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}

