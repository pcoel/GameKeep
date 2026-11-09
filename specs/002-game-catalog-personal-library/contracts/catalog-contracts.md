# Contracts: 002 — Game Catalog & Personal Library

**Feature**: Feature 002 — Game Catalog & Personal Library  
**Date**: 08/11/2026  
**Status**: Especificação Formal de Contratos

---

## 1. Schemas de Validação Zod

```ts
import { z } from "zod";

export const libraryStatusSchema = z.enum(["want_to_play", "playing", "completed"], {
  errorMap: () => ({ message: "O status deve ser 'Quero jogar', 'Jogando' ou 'Concluído'." }),
});

export const searchGameSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "A pesquisa deve conter pelo menos 2 caracteres.")
    .max(100, "O termo de pesquisa não pode exceder 100 caracteres."),
});

export const addGameToLibrarySchema = z.object({
  igdb_id: z.number().int().positive("Identificador de jogo inválido."),
  name: z.string().trim().min(1, "O nome do jogo é obrigatório."),
  slug: z.string().nullable().optional(),
  cover_url: z.string().url("URL de capa inválida.").nullable().optional(),
  summary: z.string().nullable().optional(),
  first_release_date: z.string().nullable().optional(),
  status: libraryStatusSchema,
});

export const updateLibraryStatusSchema = z.object({
  entry_id: z.string().uuid("Identificador de entrada inválido."),
  status: libraryStatusSchema,
});

export const removeGameFromLibrarySchema = z.object({
  entry_id: z.string().uuid("Identificador de entrada inválido."),
});

export type SearchGameInput = z.infer<typeof searchGameSchema>;
export type AddGameToLibraryInput = z.infer<typeof addGameToLibrarySchema>;
export type UpdateLibraryStatusInput = z.infer<typeof updateLibraryStatusSchema>;
export type RemoveGameFromLibraryInput = z.infer<typeof removeGameFromLibrarySchema>;
```

---

## 2. Contratos de Serviço e Server Actions

### Serviço IGDB (`services/igdb-service.ts`)

```ts
export interface IGDBGameSearchResult {
  id: number; // IGDB ID
  name: string;
  slug?: string;
  cover_url?: string | null;
  summary?: string | null;
  first_release_date?: string | null; // Data ISO ou ano formatado
}

/**
 * Busca jogos no catálogo externo da IGDB pelo nome.
 * Executa exclusivamente no servidor sem expor chaves Twitch.
 */
export async function searchGames(query: string): Promise<ActionResponse<IGDBGameSearchResult[]>>;

/**
 * Obtém os detalhes completos de um jogo a partir do seu IGDB ID.
 */
export async function getGameDetails(igdbId: number): Promise<ActionResponse<IGDBGameSearchResult | null>>;
```

### Serviço de Biblioteca Pessoal (`services/library-service.ts`)

```ts
/**
 * Adiciona um jogo do catálogo à biblioteca do usuário autenticado.
 * Garante idempotência e persistência sob demanda na tabela `games`.
 */
export async function addGameToLibrary(
  input: AddGameToLibraryInput
): Promise<ActionResponse<{ entry_id: string }>>;

/**
 * Altera o status de um jogo pertencente à biblioteca do usuário logado.
 */
export async function updateLibraryGameStatus(
  input: UpdateLibraryStatusInput
): Promise<ActionResponse<void>>;

/**
 * Remove um jogo da biblioteca do usuário logado.
 */
export async function removeGameFromLibrary(
  input: RemoveGameFromLibraryInput
): Promise<ActionResponse<void>>;

/**
 * Recupera todas as entradas da biblioteca do usuário autenticado atual.
 */
export async function getUserLibrary(
  filterStatus?: LibraryGameStatus
): Promise<ActionResponse<LibraryEntry[]>>;

/**
 * Recupera a biblioteca pública de um usuário específico (a partir do username).
 * Respeita RLS e retorna vazio caso a biblioteca seja privada.
 */
export async function getPublicUserLibrary(
  username: string,
  filterStatus?: LibraryGameStatus
): Promise<ActionResponse<LibraryEntry[]>>;
```

