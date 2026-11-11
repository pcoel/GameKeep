"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/services/auth-service";

export interface UserNavProps {
  user: {
    id: string;
    email?: string;
    username?: string;
    display_name?: string;
  } | null;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center font-black text-white text-lg shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              G
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              Game<span className="text-primary">Keep</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-300">
            <Link href="/catalog" className="hover:text-white transition-colors">
              Catálogo
            </Link>
            <Link href="/users" className="hover:text-white transition-colors">
              Jogadores
            </Link>
            {user && (
              <>
                <Link href="/library" className="hover:text-white transition-colors">
                  Minha Biblioteca
                </Link>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Meu Perfil
                </Link>
                <Link href="/settings/profile" className="hover:text-white transition-colors">
                  Configurações
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-surface-muted border border-surface-border flex items-center justify-center text-xs font-bold text-primary group-hover:border-primary transition-colors">
                  {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-primary transition-colors">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-[10px] text-gray-400">@{user.username || "jogador"}</p>
                </div>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="text-xs border-surface-border hover:bg-accent-rose/15 hover:border-accent-rose hover:text-accent-rose"
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

