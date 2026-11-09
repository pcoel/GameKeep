# Technical Research & Decisions: 002 — Game Catalog & Personal Library

**Feature**: Feature 002 — Game Catalog & Personal Library  
**Date**: 08/11/2026  
**Status**: Concluído / Decisões Ratificadas

---

## 1. Integração com a API IGDB (Twitch OAuth2)

### Contexto
A Constituição (§4.5) estabelece que a IGDB é a fonte de dados do catálogo externo, com requisições acontecendo exclusivamente pelo servidor, sem exposição de credenciais ao navegador e sem cache ou sincronização complexa desnecessária.

### Decisão
Implementar um serviço simples no servidor (`services/igdb-service.ts`) que consome a API oficial IGDB v4 (`https://api.igdb.com/v4/games`).
- **Autenticação:** Obtenção de App Access Token via Twitch OAuth (`https://id.twitch.tv/oauth2/token?client_id=...&client_secret=...&grant_type=client_credentials`).
- **Cache de Token simples em memória:** O token gerado pela Twitch tem validade de dezenas de dias. O serviço manterá uma variável simples em memória no módulo com o token e timestamp de expiração para não requisitar um novo token a cada busca.
- **Consultas Apicalypse:** Utilizar o formato textual simples da IGDB via POST body (ex: `fields name, summary, cover.url, first_release_date, slug; search "Zelda"; limit 20;`).
- **Formatação de Imagens:** A IGDB retorna capas como `//images.igdb.com/igdb/image/upload/t_thumb/...jpg`. O serviço converterá `t_thumb` para `t_cover_big` (`https://images.igdb.com/igdb/image/upload/t_cover_big/...jpg`) para garantir capas de alta qualidade no layout escuro gamer.
- **Variáveis de Ambiente:** `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` (definidas apenas no servidor, nunca prefixadas com `NEXT_PUBLIC_`).

### Alternativas Consideradas
- *Bibliotecas externas de wrapper IGDB (ex: node-igdb):* Rejeitado para evitar novas dependências no `package.json`. A API IGDB é baseada em `fetch` HTTP direto padrão com body textual, facilmente consumida nativamente.
- *Redis ou banco de dados para cache de token:* Rejeitado por violar a diretriz de simplicidade. Variável em memória do processo Node.js é suficiente e auto-recuperável em reinicializações.

---

## 2. Estratégia de Armazenamento Sob Demanda (`games` e `library_entries`)

### Contexto
O usuário precisa adicionar jogos à sua biblioteca e o sistema precisa listar a biblioteca mesmo sem consultar a IGDB a cada página visitada.

### Decisão
Adotar persistência relacional sob demanda no PostgreSQL do Supabase:
- **Tabela `public.games`:**
  - Armazena os dados essenciais do jogo (`id` UUID interno, `igdb_id` BIGINT UNIQUE, `name`, `slug`, `cover_url`, `summary`, `first_release_date`).
  - Quando um usuário adiciona um jogo à sua biblioteca pela primeira vez, o sistema executa um `upsert` simples na tabela `games` baseado no `igdb_id`. Se o jogo já existir (adicionado anteriormente por outro usuário), reaproveita o registro existente.
- **Tabela `public.library_entries`:**
  - Associa o usuário (`user_id REFERENCES auth.users(id) ON DELETE CASCADE`) ao jogo (`game_id REFERENCES public.games(id) ON DELETE CASCADE`).
  - Possui a restrição de unicidade: `UNIQUE (user_id, game_id)`, garantindo no nível de banco que nenhum jogo pode ser duplicado na mesma biblioteca.
  - Armazena o status do jogo: `status TEXT CHECK (status IN ('want_to_play', 'playing', 'completed'))`.

### Alternativas Consideradas
- *Baixar todo o catálogo da IGDB previamente:* Rejeitado. Catálogo gigantesco, inviável e desnecessário para o MVP.
- *Não ter tabela `games` e guardar dados desnormalizados em `library_entries`:* Rejeitado. Duplica dados de capas, títulos e sinopses para cada usuário que adicionar o mesmo jogo e impede estatísticas e avaliações futuras (Feature 003).

---

## 3. Segurança e Privacidade das Bibliotecas (RLS & Constituição §4.4)

### Contexto
A Constituição (§4.4) exige privacidade por padrão: a biblioteca de um usuário só deve ser visível para outros usuários se o proprietário tiver configurado `is_library_public = true` em seu perfil.

### Decisão
Configurar Row Level Security (RLS) rigoroso na tabela `public.library_entries`:
- **SELECT:**
  ```sql
  CREATE POLICY "Leitura de biblioteca pelo dono ou se pública" ON public.library_entries
    FOR SELECT USING (
      auth.uid() = user_id
      OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = library_entries.user_id
          AND profiles.is_library_public = true
      )
    );
  ```
- **INSERT, UPDATE, DELETE:**
  Restritos estritamente ao proprietário (`auth.uid() = user_id`), impedindo qualquer modificação em bibliotecas alheias.
- **Tabela `public.games`:**
  Leitura pública liberada para todos os usuários (`true`), já que jogos do catálogo não contêm dados pessoais. Inserção/atualização liberada para usuários autenticados (`auth.role() = 'authenticated'`).

---

## 4. Padronização dos Três Status da Biblioteca

### Contexto
A Constituição (§4.2) fixa rigorosamente três status:
1. Quero jogar
2. Jogando
3. Concluído

### Decisão
- No banco de dados: valores literais em snake_case com constraint `CHECK (status IN ('want_to_play', 'playing', 'completed'))`.
- No TypeScript: union type `export type LibraryGameStatus = 'want_to_play' | 'playing' | 'completed';`.
- No Zod: `z.enum(['want_to_play', 'playing', 'completed'])`.
- Na interface: mapeamento amigável em português com badges de cores semânticas:
  - `want_to_play`: "Quero jogar" (Badge azul/ciano)
  - `playing`: "Jogando" (Badge violeta/amarelo)
  - `completed`: "Concluído" (Badge esmeralda/verde)

---

## 5. Experiência de Busca e Navegação

### Contexto
A busca precisa ser rápida e intuitiva, sem sobrecarregar a API da IGDB e sem criar componentes complexos de autocomplete.

### Decisão
- Página `/catalog` com barra de pesquisa destacada e submissão via formulário ou debounced search (mínimo 2 caracteres).
- Rota de detalhes `/catalog/[id]` (onde id é o `igdb_id`) exibindo capa grande, detalhes, sinopse completa e um seletor de status para inclusão direta na biblioteca.
- Página `/library` exibindo a prateleira do usuário, com abas de filtro ("Todos", "Quero jogar", "Jogando", "Concluído") e ações rápidas para alterar status ou remover título.

