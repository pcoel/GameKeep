# Implementation Plan: 002 — Game Catalog & Personal Library

**Branch**: `002-game-catalog-personal-library` | **Date**: 08/11/2026 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification de `/specs/002-game-catalog-personal-library/spec.md`

---

## 1. Summary

A Feature 002 implementa a pesquisa de jogos por nome integrada à API IGDB e o gerenciamento da biblioteca pessoal do usuário com três status estritos (`Quero jogar`, `Jogando`, `Concluído`). A integração externa ocorre estritamente no servidor via Twitch OAuth2 credentials com cache de token em memória. Os jogos adicionados são persistidos sob demanda na tabela `public.games` e relacionados na tabela `public.library_entries`, garantindo ausência de duplicidade (`UNIQUE (user_id, game_id)`) e isolamento de privacidade regido por Row Level Security em conformidade com as preferências de visibilidade da Constituição (§4.4).

---

## 2. Technical Context

- **Language/Version**: TypeScript 5.6+ (Strict Mode)
- **Primary Framework**: Next.js 14+ (App Router, Server Actions, Server Components)
- **Styling**: Tailwind CSS (Tema Dark Gaming)
- **Database**: PostgreSQL (Supabase) com RLS ativado
- **External Catalog**: IGDB API v4 via Twitch Client Credentials Flow
- **Validation**: Zod 3.23+
- **Testing**: Node.js Test Runner com `npx tsx --test`

---

## 3. Constitution Check

*GATES DE CONFORMIDADE CONSTITUCIONAL:*

1. **Gate 1 - Desenvolvimento Orientado a Especificações (§2.1):** PASS  
   *Avaliação:* Especificação formal, modelo de dados, contratos, cenários quickstart e tarefas produzidos antes da escrita de qualquer código de produção.
2. **Gate 2 - Simplicidade e Manutenção (§2.4):** PASS  
   *Avaliação:* Sem dependências de wrappers externos, sem cache avançado em Redis, sem sistemas complexos de sincronização em massa. Apenas `fetch` nativo no servidor com persistência relacional direta sob demanda.
3. **Gate 3 - Privacidade por Padrão (§4.4):** PASS  
   *Avaliação:* As entradas da tabela `library_entries` são privadas por padrão. Terceiros só conseguem consultar a biblioteca de um usuário se o perfil correspondente possuir explicitamente `is_library_public = true`.
4. **Gate 4 - Três Status Estritos da Biblioteca (§4.2):** PASS  
   *Avaliação:* Status limitados via constraint de banco `CHECK (status IN ('want_to_play', 'playing', 'completed'))`, Zod schema e tipos TypeScript.
5. **Gate 5 - Segurança de Credenciais (§4.5 & §6):** PASS  
   *Avaliação:* `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` mantidos estritamente no servidor. Nenhuma chave administrativa ou token da Twitch exposto ao navegador.

---

## 4. Project Structure

### Documentation (`specs/002-game-catalog-personal-library/`)

```text
specs/002-game-catalog-personal-library/
├── spec.md                          # Especificação de requisitos e histórias de usuário
├── checklists/
│   └── requirements.md              # Validação de qualidade da especificação
├── research.md                      # Decisões de arquitetura (IGDB, persistência sob demanda, RLS)
├── data-model.md                    # DDL relacional de games e library_entries
├── contracts/
│   └── catalog-contracts.md         # Schemas Zod e interfaces TypeScript
├── quickstart.md                    # Roteiro de validação ponta a ponta
├── plan.md                          # Este plano técnico de execução
└── tasks.md                         # Fases e tarefas ordenadas de implementação
```

### Arquivos de Código Planejados

```text
types/
├── catalog.ts                       # Tipos Game, LibraryEntry, LibraryGameStatus
lib/
├── igdb.ts                          # Cliente nativo fetch da IGDB com token caching
schemas/
├── catalog.ts                       # Schemas Zod de busca, adição, status e remoção
services/
├── igdb-service.ts                  # Server Actions e funções de busca e detalhes
├── library-service.ts               # Server Actions de adição, alteração de status, remoção e listagem
components/
├── catalog/
│   ├── search-bar.tsx               # Barra de pesquisa com debouncing/submit
│   ├── game-card.tsx                # Cartão de jogo na grade de busca
│   └── game-details.tsx             # Visualização ampliada com botão de adicionar
├── library/
│   ├── library-grid.tsx             # Prateleira de jogos com abas de status
│   ├── library-entry-card.tsx       # Cartão do jogo na coleção com seletor de status
│   └── status-badge.tsx             # Badge colorida semântica do status
app/
├── (dashboard)/
│   ├── catalog/
│   │   ├── page.tsx                 # Página de pesquisa do catálogo
│   │   └── [id]/page.tsx            # Detalhes do jogo no catálogo
│   └── library/
│       └── page.tsx                 # Página da biblioteca pessoal do usuário
supabase/
└── migrations/
    └── 20261108000000_create_games_and_library.sql # Migração DDL e RLS
tests/
├── unit/
│   └── catalog-schema.test.ts       # Testes unitários dos schemas Zod
└── integration/
    └── catalog-security-audit.test.ts # Teste estático de segurança e integridade SQL
```

---

## 5. Estratégia de Testes e Validação

1. **Testes Unitários:** Validação estrita dos esquemas Zod (tamanhos de pesquisa, valores de status válidos/inválidos, payload de inclusão).
2. **Testes Estáticos de Segurança e SQL:** Auditoria do script SQL para garantir constraints de unicidade (`user_id, game_id`), RLS ativo e checagem de visibilidade pública.
3. **Validação E2E (Quickstart):** Roteiro com 5 cenários descritos em `quickstart.md`.

