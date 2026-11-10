# Implementation Plan: 003 — Progressive Game Reviews & Ratings

**Branch**: `003-game-reviews-ratings` | **Date**: 10/11/2026 | **Spec**: [spec.md](spec.md)  
**Input**: Especificação formal de `/specs/003-game-reviews-ratings/spec.md`

---

## 1. Summary

A Feature 003 implementa o sistema de avaliações progressivas do GameKeep baseado nos **5 Tempos de Gameplay**, além de análises textuais opcionais de até 2.500 caracteres. A funcionalidade inclui o cálculo automático da média aritmética das cinco notas, suporte a números decimais arbitrários (0.0 a 10.0), persistência relacional na tabela `public.reviews`, garantia de uma avaliação única por usuário por jogo (`UNIQUE (user_id, game_id)`), proteção por Row Level Security (RLS) para isolamento de avaliações privadas, recálculo imediato de médias públicas e integração direta na página de detalhes do jogo (`/catalog/[id]`), na biblioteca pessoal (`/library`) e no perfil do jogador (`/profile`).

---

## 2. Technical Context

- **Language/Version**: TypeScript 5.6+ (Strict Mode)
- **Primary Framework**: Next.js 14+ (App Router, Server Actions, Server Components)
- **Styling**: Tailwind CSS (Tema Dark Gaming)
- **Database**: PostgreSQL (Supabase) com RLS ativado
- **Validation**: Zod 3.23+
- **Testing**: Node.js Test Runner com `npx tsx --test`

---

## 3. Constitution Check

*GATES DE CONFORMIDADE CONSTITUCIONAL:*

1. **Gate 1 - Desenvolvimento Orientado a Especificações (§2.1):** PASS  
   *Avaliação:* Especificação completa, modelo de dados, contratos, cenários quickstart e tarefas produzidos com as decisões ratificadas pelo usuário.
2. **Gate 2 - Simplicidade e Manutenção (§2.4):** PASS  
   *Avaliação:* Sem dependências de bibliotecas complexas de gráficos ou reviews externas. Utilização de Tailwind CSS e Server Actions diretas do Next.js 14.
3. **Gate 3 - Privacidade por Padrão e Individual (§4.4):** PASS  
   *Avaliação:* Avaliações privadas permanecem estritamente visíveis apenas para o próprio autor via políticas RLS, sem compor a média pública do catálogo.
4. **Gate 4 - Sistema dos 5 Tempos (§4.3):** PASS  
   *Avaliação:* Exatamente cinco notas obrigatórias (Tempo 1 a 5), aceitando decimais arbitrários de 0.0 a 10.0 e média calculada com precisão.
5. **Gate 5 - Isolamento e Segurança do Banco (§5 e §6):** PASS  
   *Avaliação:* RLS em `public.reviews`, restrição de unicidade `uq_reviews_user_game`, validação de limites no banco (CHECK constraints) e no servidor (Zod).

---

## 4. Project Structure

### Documentation (`specs/003-game-reviews-ratings/`)

```text
specs/003-game-reviews-ratings/
├── spec.md                          # Especificação de requisitos e histórias de usuário
├── checklists/
│   └── requirements.md              # Validação de qualidade da especificação
├── research.md                      # Decisões de arquitetura (5 Tempos, médias, RLS)
├── data-model.md                    # DDL relacional de reviews e RLS
├── contracts/
│   └── reviews-contracts.md         # Schemas Zod e interfaces TypeScript
├── quickstart.md                    # Roteiro de validação ponta a ponta
├── plan.md                          # Este plano técnico de execução
└── tasks.md                         # Fases e tarefas ordenadas de implementação
```

### Arquivos de Código Planejados

```text
types/
├── review.ts                        # Interfaces GameReview, GameRatingSummary, ReviewAuthor
lib/
└── database.ts                      # Atualização do schema Database com a tabela reviews
schemas/
└── review.ts                        # Schemas Zod (createReview, updateReview, deleteReview)
services/
└── review-service.ts                # Server Actions para reviews e agregação de médias
components/
└── review/
    ├── progressive-rating-input.tsx # Input interativo dos 5 Tempos com cálculo de média
    ├── progressive-rating-display.tsx # Exibição visual das notas dos 5 Tempos
    ├── review-form.tsx              # Formulário completo (notas, texto 2.500 char, switch privado)
    ├── review-card.tsx              # Cartão de exibição da review pública com autor
    └── review-list.tsx              # Lista de reviews com agregação do jogo
app/
├── (dashboard)/
│   ├── catalog/
│   │   └── [id]/page.tsx            # Integração do bloco de avaliações na página do jogo
│   ├── library/page.tsx             # Exibição de badge com nota pessoal nos jogos
│   └── profile/page.tsx             # Listagem das avaliações do usuário no perfil
supabase/
└── migrations/
    └── 20261110000000_create_reviews.sql # Migração DDL e RLS da tabela reviews
tests/
├── unit/
│   └── review-schema.test.ts        # Testes unitários dos schemas Zod de review
└── integration/
    └── review-security-audit.test.ts # Teste estático de segurança, constraints e RLS
```
