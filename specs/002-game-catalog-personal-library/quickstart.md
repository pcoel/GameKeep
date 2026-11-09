# Quickstart Validation Guide: 002 — Game Catalog & Personal Library

**Feature**: Feature 002 — Game Catalog & Personal Library  
**Date**: 08/11/2026

Este documento orienta a validação manual e funcional de ponta a ponta da Feature 002 após sua implementação.

---

## Pré-requisitos

1. Usuário cadastrado e autenticado na plataforma (conforme Feature 001).
2. Variáveis de ambiente configuradas no `.env.local`:
   ```env
   TWITCH_CLIENT_ID=seu_client_id_da_twitch
   TWITCH_CLIENT_SECRET=seu_client_secret_da_twitch
   ```
3. Migração SQL `supabase/migrations/20261108000000_create_games_and_library.sql` executada no banco.

---

## Cenário 1: Pesquisa no Catálogo de Jogos

1. Acesse `http://localhost:3000/catalog`.
2. No campo de busca, digite `"Witcher"` e pressione Enter ou aguarde o debounce.
3. **Resultado Esperado**:
   - A grade de resultados exibe jogos da franquia The Witcher.
   - Cada jogo exibe imagem de capa nítida, título e ano de lançamento.
   - Se pesquisar `"termo_sem_sentido_9999"`, exibe mensagem amigável de nenhum jogo encontrado.

---

## Cenário 2: Adição de Jogo à Biblioteca

1. Clique em um jogo nos resultados de busca para abrir sua página de detalhes (`/catalog/[id]`).
2. Selecione o status `"Quero jogar"`.
3. Clique em `"Adicionar à Biblioteca"`.
4. **Resultado Esperado**:
   - Notificação de sucesso: `"Jogo adicionado à sua biblioteca com sucesso!"`.
   - O botão muda para indicar que o jogo já está na coleção (`"Na sua biblioteca"`).

---

## Cenário 3: Proteção Contra Duplicidade

1. Na mesma página do jogo já adicionado (ou em outra aba), tente acionar novamente o botão de inclusão.
2. **Resultado Esperado**:
   - A interface bloqueia o botão de inclusão redundante.
   - Mesmo via requisição direta, o banco rejeita via constraint `uq_library_user_game` com mensagem amigável.

---

## Cenário 4: Alteração de Status do Jogo

1. Acesse `http://localhost:3000/library`.
2. Localize o jogo adicionado na aba `"Quero jogar"`.
3. Altere o status para `"Jogando"`.
4. **Resultado Esperado**:
   - O badge atualiza imediatamente para o tom violeta/amarelo de `"Jogando"`.
   - O jogo passa a aparecer sob o filtro `"Jogando"`.
   - Repita alterando para `"Concluído"`.

---

## Cenário 5: Remoção de Jogo da Biblioteca

1. Na página da biblioteca (`/library`), clique na opção `"Remover da biblioteca"`.
2. Confirme o diálogo de confirmação.
3. **Resultado Esperado**:
   - O jogo é removido da lista instantaneamente.
   - O registro é excluído da tabela `library_entries` no PostgreSQL.
   - A biblioteca de outros usuários não sofre qualquer alteração.

---

## Cenário 6: Isolamento de Privacidade da Biblioteca

1. Em uma janela anônima (sem estar logado ou logado com outro usuário), tente acessar a biblioteca de um usuário com `is_library_public = false`.
2. **Resultado Esperado**:
   - A biblioteca não exibe as entradas do usuário e indica que a coleção é privada.

