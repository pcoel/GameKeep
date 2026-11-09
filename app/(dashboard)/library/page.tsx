import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserLibrary } from "@/services/library-service";
import { LibraryGrid } from "@/components/library/library-grid";
import { Button } from "@/components/ui/button";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/library");
  }

  const response = await getUserLibrary();
  const entries = response.success ? response.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabeçalho da Biblioteca */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Minha <span className="text-primary">Biblioteca</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Organize sua coleção de videogames, gerencie o status de cada título e acompanhe sua jornada.
          </p>
        </div>

        <div>
          <Link href="/catalog">
            <Button variant="outline" className="text-xs sm:text-sm">
              + Buscar Novos Jogos
            </Button>
          </Link>
        </div>
      </div>

      {/* Grade com Abas de Filtro */}
      <LibraryGrid initialEntries={entries} />
    </div>
  );
}

