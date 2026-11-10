---
description: "Plano de tarefas detalhado para implementação da Feature 003 — Progressive Game Reviews & Ratings"
---

# Tasks: Feature 003 — Progressive Game Reviews & Ratings

**Input**: Documentos de design de `/specs/003-game-reviews-ratings/`  
**Prerequisites**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/reviews-contracts.md](contracts/reviews-contracts.md), [quickstart.md](quickstart.md)  
**Organization**: Estruturado em 5 fases sequenciais mapeando as histórias de usuário (`[US1]`, `[US2]`, `[US3]`, `[US4]`).

## Convenções de Formato
- `- [X] [TaskID] [P?] [Story?] Descrição objetiva com caminho exato de arquivo`
- **[P]**: Tarefa paralelizável (arquivos independentes, sem bloqueios de tarefas incompletas)
- **[Story]**: Mapeamento para as histórias de usuário da especificação (`[US1]` a `[US4]`)

---

## Phase 1: Setup & Data Modeling (Shared Foundation)

**Propósito**: Definição de tipos TypeScript, schemas Zod e migração SQL com integridade relacional, constraints numéricas e políticas RLS.

- [X] T001 [P] Criar definições de tipos TypeScript em types/review.ts contendo as interfaces `GameReview`, `GameRatingSummary`, `ReviewAuthor`  
  *Critério de Conclusão*: Tipos TypeScript fortemente tipados exportados e alinhados ao `data-model.md`.
- [X] T002 [P] Atualizar a interface Database em types/database.ts para incluir a tabela `reviews`  
  *Critério de Conclusão*: Tabela `reviews` registrada com Row, Insert e Update tipados no Supabase Database schema.
- [X] T003 Criar o arquivo de migração SQL supabase/migrations/20261110000000_create_reviews.sql com a tabela `public.reviews`, restrições CHECK de 0.0 a 10.0 para os 5 Tempos, constraint `uq_reviews_user_game UNIQUE (user_id, game_id)`, limite de 2.500 caracteres, triggers de `updated_at` e políticas RLS de privacidade  
  *Critério de Conclusão*: DDL executável com garantias de integridade no banco e blindagem de avaliações privadas.
- [X] T004 [P] Criar schemas Zod em schemas/review.ts para validação de `tempoScoreSchema` (0 a 10, decimais livres), `createReviewSchema`, `updateReviewSchema` e `deleteReviewSchema`  
  *Critério de Conclusão*: Schemas Zod testáveis garantindo limites estritos e sanitização de texto.

---

## Phase 2: Service Layer & Business Logic (US1, US2, US3)

**Propósito**: Implementar as Server Actions e consultas de agregação de médias no servidor com isolamento de avaliações privadas.

- [X] T005 [US1] [US2] Implementar as Server Actions `saveReview`, `deleteReview`, `getGameRatingSummary`, `getGameReviews`, `getUserReviewForGame` e `getUserReviews` em services/review-service.ts  
  *Critério de Conclusão*: Operações atômicas com cálculo da média no servidor, verificação de propriedade do autor, invalidação de cache via `revalidatePath` e agregação correta das médias públicas.

---

## Phase 3: Review UI Components (US1 & US2)

**Propósito**: Desenvolver os componentes de formulário, exibição dos 5 Tempos e listagem de reviews com design dark gaming.

- [X] T006 [P] [US1] Criar o componente de input interativo dos 5 Tempos em components/review/progressive-rating-input.tsx com cálculo em tempo real da média e validação de 0 a 10  
  *Critério de Conclusão*: Componente responsivo exibindo os campos de Tempo 1 a Tempo 5 com feedback visual da nota final.
- [X] T007 [P] [US1] Criar o componente visual de exibição progressiva dos 5 Tempos em components/review/progressive-rating-display.tsx  
  *Critério de Conclusão*: Barras/painéis progressivos dos 5 Tempos com cores semânticas e média destacada.
- [X] T008 [US2] Criar o formulário completo de avaliação em components/review/review-form.tsx integrando notas dos 5 Tempos, campo de texto dissertativo (até 2.500 caracteres), switch de avaliação privada e ações de salvar/cancelar  
  *Critério de Conclusão*: Formulário intuitivo com suporte a criação e edição sem duplicação.
- [X] T009 [US2] Criar o componente de cartão de review em components/review/review-card.tsx com dados do autor, data, notas dos 5 Tempos, texto da análise e botões de editar/excluir para o autor  
  *Critério de Conclusão*: Cartão estilizado com badge de autor e confirmação de exclusão.
- [X] T010 [US3] Criar a seção consolidada de reviews do jogo em components/review/game-reviews-section.tsx com sumário de médias comunitárias, formulário de avaliação e listagem de reviews públicas  
  *Critério de Conclusão*: Seção completa integrando estatísticas públicas e interações do usuário.

---

## Phase 4: Integration with Catalog, Library & Profile (US3 & US4)

**Propósito**: Integrar as avaliações na página de detalhes do jogo, nos cartões da biblioteca pessoal e na página de perfil.

- [X] T011 [US3] Atualizar a página de detalhes do jogo em app/(dashboard)/catalog/[id]/page.tsx para integrar `GameReviewsSection`  
  *Critério de Conclusão*: Página do jogo exibindo a média geral comunitária, o painel dos 5 Tempos e as reviews públicas.
- [X] T012 [US4] Atualizar os cartões da biblioteca pessoal em components/library/library-entry-card.tsx para exibir a nota do usuário quando o jogo já tiver sido avaliado  
  *Critério de Conclusão*: Indicação visual imediata na prateleira da biblioteca com link direto para a review.
- [X] T013 [US4] Atualizar a página de perfil em app/(dashboard)/profile/page.tsx para exibir a lista das avaliações realizadas pelo usuário  
  *Critério de Conclusão*: Perfil exibindo o histórico de jogos avaliados pelo usuário com respeito a privacidade.

---

## Phase 5: Tests & Quality Validation

**Propósito**: Garantir conformidade com schemas, integridade de RLS, compilação TypeScript e execução dos testes automatizados.

- [X] T014 [P] Criar suíte de testes unitários para schemas de review em tests/unit/review-schema.test.ts  
  *Critério de Conclusão*: 100% dos testes de schema Zod aprovados (rejeição de notas fora de 0-10, validação de decimais e limites de 2.500 caracteres).
- [X] T015 [P] Criar teste estático de segurança e integridade SQL em tests/integration/review-security-audit.test.ts  
  *Critério de Conclusão*: Validação da constraint de unicidade `uq_reviews_user_game`, limites numéricos e políticas RLS de privacidade.
- [X] T016 Executar verificação completa dos comandos de qualidade (`npm run typecheck`, `npm test` e `npm run build`)  
  *Critério de Conclusão*: 0 erros de compilação, 100% dos testes aprovados e build do Next.js bem-sucedido.
