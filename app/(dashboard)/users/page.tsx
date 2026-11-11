import React, { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/services/auth-service";
import { searchProfiles, getSavedProfiles } from "@/services/profile-discovery-service";
import { UserSearchBar } from "@/components/users/user-search-bar";
import { UserCard } from "@/components/users/user-card";
import { PublicUserProfile } from "@/types/profile";

interface UsersPageProps {
  searchParams: {
    q?: string;
    tab?: "all" | "saved";
  };
}

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const currentUser = await getCurrentUser();
  const activeTab = searchParams.tab === "saved" ? "saved" : "all";
  const query = searchParams.q?.trim() || "";

  let users: PublicUserProfile[] = [];
  let error: string | null = null;

  if (activeTab === "saved") {
    if (!currentUser) {
      error = "Você precisa estar conectado para visualizar seus perfis salvos.";
    } else {
      const res = await getSavedProfiles();
      if (res.success) {
        users = res.data;
      } else {
        error = res.error;
      }
    }
  } else {
    const res = await searchProfiles(query);
    if (res.success) {
      users = res.data;
    } else {
      error = res.error;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Descobrir Jogadores
        </h1>
        <p className="mt-2 text-base text-gray-400">
          Encontre outros membros da comunidade do GameKeep, explore bibliotecas públicas e salve perfis favoritos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border gap-6">
        <Link
          href={`/users${query ? `?q=${encodeURIComponent(query)}` : ""}`}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Todos os Jogadores
        </Link>
        {currentUser && (
          <Link
            href="/users?tab=saved"
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === "saved"
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>Perfis Salvos</span>
          </Link>
        )}
      </div>

      {/* Search Bar (visible on all tab) */}
      {activeTab === "all" && (
        <div className="space-y-2">
          <Suspense fallback={<div className="h-10 bg-surface-card rounded animate-pulse" />}>
            <UserSearchBar placeholder="Buscar jogador por @username ou nome..." />
          </Suspense>
          {query && (
            <p className="text-xs text-gray-400">
              Resultados para: <span className="text-gray-200 font-medium">"{query}"</span>
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-accent-rose/30 bg-accent-rose/10 p-6 text-center text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Results grid */}
      {!error && (
        <>
          {users.length === 0 ? (
            <div className="rounded-xl border border-surface-border bg-surface-card/50 p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-500 mb-3 flex items-center justify-center rounded-full bg-surface-muted">
                👤
              </div>
              <h3 className="text-base font-semibold text-gray-200">
                {activeTab === "saved"
                  ? "Nenhum perfil salvo ainda"
                  : query
                  ? "Nenhum jogador encontrado"
                  : "Nenhum jogador disponível no momento"}
              </h3>
              <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                {activeTab === "saved"
                  ? "Salve perfis interessantes clicando no ícone de marcador para acessá-los rapidamente aqui."
                  : query
                  ? "Tente buscar com outro nome de usuário ou termo."
                  : "Conforme novos usuários se cadastrarem no GameKeep, eles aparecerão aqui."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUser?.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
