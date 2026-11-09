---
description: "Plano de tarefas detalhado para implementação da Feature 002 — Game Catalog & Personal Library"
---

# Tasks: Feature 002 — Game Catalog & Personal Library

**Input**: Documentos de design de `/specs/002-game-catalog-personal-library/`  
**Prerequisites**: [constitution.md](../../.specify/memory/constitution.md), [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/catalog-contracts.md](contracts/catalog-contracts.md), [quickstart.md](quickstart.md)  
**Organization**: Estruturado em 8 fases sequenciais mapeando as histórias de usuário (`[US1]`, `[US2]`, `[US3]`, `[US4]`).

## Convenções de Formato
- `- [X] [TaskID] [P?] [Story?] Descrição objetiva com caminho exato de arquivo`
- **[P]**: Tarefa paralelizável (arquivos independentes, sem bloqueios de tarefas incompletas)
- **[Story]**: Mapeamento para as histórias de usuário da especificação (`[US1]` a `[US4]`)

---

## Fase 1: Configuração e Variáveis de Ambiente do Catálogo

**Propósito**: Configurar o suporte a credenciais da Twitch/IGDB no servidor de forma segura e documentar em `.env.example`.

- [X] T001 Adicionar `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` ao arquivo `.env.example` com comentários explicativos sobre segurança estrita no servidor em .env.example  
  *Critério de Conclusão*: `.env.example` atualizado sem conter chaves reais, alertando que as variáveis nunca devem possuir o prefixo `NEXT_PUBLIC_`.
- [X] T002 [P] Atualizar as definições de tipos em types/catalog.ts com as interfaces `Game`, `LibraryEntry` e o union type `LibraryGameStatus` ('want_to_play' | 'playing' | 'completed') em types/catalog.ts  
  *Critério de Conclusão*: Tipos TypeScript fortemente tipados exportados e alinhados ao `data-model.md`.

---

## Fase 2: Banco de Dados, Migrações e Políticas RLS

**Propósito**: Criar as tabelas `games` e `library_entries` no PostgreSQL com integridade referencial, chave única contra duplicidade e RLS conectado ao perfil do usuário.

- [X] T003 Criar o arquivo de migração SQL com a tabela `public.games` contendo campos essenciais (`id`, `igdb_id UNIQUE`, `name`, `slug`, `cover_url`, `summary`, `first_release_date`), índices e trigger de `updated_at` em supabase/migrations/20261108000000_create_games_and_library.sql  
  *Critério de Conclusão*: DDL da tabela `games` pronta para execução com integridade e índices de busca.
- [X] T004 Criar na mesma migração a tabela `public.library_entries` com chave estrangeira `user_id REFERENCES auth.users(id) ON DELETE CASCADE`, `game_id REFERENCES public.games(id) ON DELETE CASCADE`, constraint `uq_library_user_game UNIQUE (user_id, game_id)`, constraint `chk_library_status CHECK (status IN ('want_to_play', 'playing', 'completed'))` e trigger de `updated_at` em supabase/migrations/20261108000000_create_games_and_library.sql  
  *Critério de Conclusão*: Tabela `library_entries` impedindo duplicidade de jogos por usuário no nível de banco e restringindo os três status permitidos.
- [X] T005 Implementar políticas de Row Level Security (RLS) habilitando leitura pública para `games`, inserção por usuários autenticados, e controle de acesso estrito em `library_entries` (proprietário gerencia tudo; leitura pública de terceiros permitida apenas se `profiles.is_library_public = true`) em supabase/migrations/20261108000000_create_games_and_library.sql  
  *Critério de Conclusão*: Políticas RLS garantindo que usuários nunca alterem bibliotecas de terceiros e que bibliotecas privadas fiquem blindadas.
- [X] T006 [P] Atualizar a definição global de tipos do banco de dados em types/database.ts para incluir os esquemas `games` e `library_entries` em types/database.ts  
  *Critério de Conclusão*: Interface `Database` do Supabase reconhecendo as novas tabelas sem erros de TypeScript.

---

## Fase 3: Integração com a API IGDB (Catálogo Externo)

**Propósito**: Implementar o cliente de comunicação com a Twitch/IGDB no servidor com cache de token em memória e Server Actions de pesquisa.

- [X] T007 [P] Implementar schemas Zod para validação de busca de jogos (`searchGameSchema`) em schemas/catalog.ts  
  *Critério de Conclusão*: Validações para mínimo de 2 caracteres, sanitização com `.trim()` e limite máximo de 100 caracteres.
- [X] T008 Implementar utilitário nativo de autenticação e consulta IGDB com cache simples de App Access Token em memória e conversão de capas para `t_cover_big` em lib/igdb.ts  
  *Critério de Conclusão*: Função `getIGDBAccessToken()` com reuso do token válido e função `queryIGDB(endpoint, query)` executando exclusivamente no Node.js.
- [X] T009 [US1] Implementar as Server Actions `searchGames(query)` e `getGameDetails(igdbId)` consumindo a IGDB com tratamento gracioso de falhas e retorno padronizado `ActionResponse` em services/igdb-service.ts  
  *Critério de Conclusão*: Busca funcional retornando lista formatada de jogos e página de detalhes sem quebras em caso de instabilidade externa.

---

## Fase 4: Implementação da Biblioteca Pessoal (Regras de Negócio)

**Propósito**: Desenvolver as operações de adição com upsert sob demanda em `games`, alteração de status e remoção de títulos da biblioteca.

- [X] T010 [P] Implementar schemas Zod para inclusão (`addGameToLibrarySchema`), alteração de status (`updateLibraryStatusSchema`) e remoção (`removeGameFromLibrarySchema`) em schemas/catalog.ts  
  *Critério de Conclusão*: Schemas cobrindo payload completo e validando os três status constitucionais.
- [X] T011 [US2] Implementar a Server Action `addGameToLibrary` com upsert sob demanda na tabela `games` (por `igdb_id`) e inserção em `library_entries`, tratando colisão de duplicidade (`PostgreSQL 23505`) em services/library-service.ts  
  *Critério de Conclusão*: Inclusão atômica de jogo na biblioteca do usuário logado, impedindo duplicações e persistindo o jogo localmente.
- [X] T012 [US4] Implementar a Server Action `updateLibraryGameStatus` para alteração de status entre 'want_to_play', 'playing' e 'completed' com verificação de propriedade (`user_id`) em services/library-service.ts  
  *Critério de Conclusão*: Status atualizado com sucesso e invalidação de cache via `revalidatePath('/library')`.
- [X] T013 [US4] Implementar a Server Action `removeGameFromLibrary` para exclusão de jogo da biblioteca com verificação de propriedade em services/library-service.ts  
  *Critério de Conclusão*: Remoção da entrada correspondente e atualização imediata da listagem.
- [X] T014 [US3] Implementar funções `getUserLibrary(filterStatus)` e `getPublicUserLibrary(username, filterStatus)` com join em `games` e respeito às políticas RLS em services/library-service.ts  
  *Critério de Conclusão*: Listagem completa das entradas da biblioteca do usuário autenticado e exibição pública condicionada a `is_library_public`.

---

## Fase 5: Interfaces do Catálogo de Jogos (US1)

**Propósito**: Desenvolver a barra de busca, os cartões de resultado com capas em destaque e a página de detalhes de jogo.

- [X] T015 [P] [US1] Criar componente de barra de pesquisa com estados de carregamento e botão de limpar em components/catalog/search-bar.tsx  
  *Critério de Conclusão*: Campo responsivo integrado ao tema escuro permitindo buscar jogos pelo nome.
- [X] T016 [P] [US1] Criar componente de cartão de jogo na grade de catálogo com poster em proporção 3:4, título, ano e fallback visual para jogos sem capa em components/catalog/game-card.tsx  
  *Critério de Conclusão*: Cartão estilizado com efeito hover gamer e link para a visualização detalhada.
- [X] T017 [US1] Montar a página pública de exploração do catálogo com formulário de busca, grade responsiva e estados para pesquisa vazia ou sem resultados em app/(dashboard)/catalog/page.tsx  
  *Critério de Conclusão*: Rota `/catalog` acessível e permitindo pesquisar qualquer título com visualização em grade.
- [X] T018 [US1] [US2] Montar a página de detalhes do jogo exibindo capa ampliada, sinopse completa, ano de lançamento e componente de seleção de status com botão "Adicionar à Biblioteca" em app/(dashboard)/catalog/[id]/page.tsx  
  *Critério de Conclusão*: Rota `/catalog/[id]` funcional exibindo dados completos e permitindo inclusão na biblioteca com feedback interativo.

---

## Fase 6: Interfaces da Biblioteca Pessoal (US3 & US4)

**Propósito**: Criar a prateleira da biblioteca do usuário, badges de status, filtros por categoria e controles de status/remoção.

- [X] T019 [P] [US3] Criar componente de badge de status (`StatusBadge`) com cores semânticas para "Quero jogar" (azul/ciano), "Jogando" (violeta/amarelo) e "Concluído" (esmeralda/verde) em components/library/status-badge.tsx  
  *Critério de Conclusão*: Identificação visual imediata do status de cada jogo na prateleira.
- [X] T020 [US3] [US4] Criar componente de cartão de entrada da biblioteca com seletor interativo de status e menu/botão de remoção em components/library/library-entry-card.tsx  
  *Critério de Conclusão*: Cartão permitindo alternar status diretamente e excluir o jogo com confirmação.
- [X] T021 [US3] Criar componente de grade da biblioteca com abas de navegação/filtro ("Todos", "Quero jogar", "Jogando", "Concluído") e estado vazio amigável em components/library/library-grid.tsx  
  *Critério de Conclusão*: Interface de prateleira digital organizada e responsiva.
- [X] T022 [US3] Montar a página protegida da biblioteca pessoal consumindo `getUserLibrary` como Server Component em app/(dashboard)/library/page.tsx  
  *Critério de Conclusão*: Rota `/library` protegida por autenticação, listando todos os jogos do usuário com filtros funcionais.

---

## Fase 7: Navegação e Integração Global

**Propósito**: Integrar os links do Catálogo e da Biblioteca na barra superior de navegação (`UserNav`).

- [X] T023 Atualizar o componente de navegação `UserNav` para incluir links visíveis para "Catálogo" e "Minha Biblioteca" em components/auth/user-nav.tsx  
  *Critério de Conclusão*: Links acessíveis tanto no desktop quanto no menu mobile com estados ativos condizentes com o usuário autenticado.

---

## Fase 8: Testes, Auditoria de Segurança e Validação

**Propósito**: Garantir 100% de conformidade com schemas Zod, integridade de políticas RLS no banco e execução do roteiro quickstart.

- [X] T024 [P] Criar suíte de testes unitários para os schemas de busca, adição, atualização e remoção de jogos em tests/unit/catalog-schema.test.ts  
  *Critério de Conclusão*: 100% dos testes de schema Zod aprovados (rejeição de status fora dos 3 permitidos, validação de IDs e queries vazias).
- [X] T025 [P] Criar teste estático de segurança e integridade SQL para validar a chave única `uq_library_user_game`, as constraints de status e as políticas RLS de privacidade da biblioteca em tests/integration/catalog-security-audit.test.ts  
  *Critério de Conclusão*: Auditoria automatizada garantindo ausência de brechas de duplicidade e privacidade por padrão.
- [X] T026 Executar verificação completa dos comandos de compilação e qualidade (`npx tsc --noEmit`, `npm run typecheck`, `npm test` e `npm run build`)  
  *Critério de Conclusão*: 0 erros de compilação e 0 erros no build do Next.js.
- [X] T027 Executar a validação manual dos Cenários 1 a 6 descritos no guia quickstart em specs/002-game-catalog-personal-library/quickstart.md  
  *Critério de Conclusão*: Todos os fluxos de busca, adição, bloqueio de duplicidade, troca de status, remoção e isolamento de privacidade validados com sucesso.
