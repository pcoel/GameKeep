import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/auth/user-nav";

export const metadata: Metadata = {
  title: "GameKeep — Biblioteca & Avaliações de Jogos",
  description:
    "Plataforma para organizar sua biblioteca de videogames e registrar suas experiências com avaliações progressivas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userNavData = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .single();

      const profile = profileData as { username: string; display_name: string } | null;

      userNavData = {
        id: user.id,
        email: user.email,
        username: profile?.username,
        display_name: profile?.display_name,
      };
    }
  } catch (err) {
    // Silencia em caso de credenciais não configuradas durante build estático inicial
    console.warn("Aviso ao carregar usuário no layout:", err);
  }

  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-gray-100 flex flex-col min-h-screen antialiased">
        <UserNav user={userNavData} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-surface-border bg-surface/50 py-6 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>GameKeep © {new Date().getFullYear()} — Plataforma de Coleção e Avaliações de Jogos.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

