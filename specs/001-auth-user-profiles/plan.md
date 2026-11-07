# Implementation Plan: Authentication & User Profiles

**Branch**: `001-auth-user-profiles` | **Date**: 2026-11-07 | **Spec**: [specs/001-auth-user-profiles/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-auth-user-profiles/spec.md`

## Summary

Implementar a camada fundacional de autenticação e gerenciamento de perfis de usuário para a plataforma Game Library & Reviews. O sistema utiliza Next.js (App Router) com TypeScript e Tailwind CSS, integrado ao Supabase Auth via pacote `@supabase/ssr` para sessões persistentes e seguras baseadas em cookies `httpOnly`. A persistência de dados de perfil é realizada no PostgreSQL (tabela `public.profiles`) com criação atômica via trigger de banco de dados (`on_auth_user_created`), validação estrita com Zod, e isolamento total entre contas garantido por políticas de Row Level Security (RLS), com privacidade configurada como privada por padrão para perfis e bibliotecas.

---

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20+  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, `@supabase/ssr`, `@supabase/supabase-js`, Zod, Tailwind CSS  
**Storage**: PostgreSQL (Supabase), schema `public.profiles` relacionado com chave estrangeira a `auth.users(id)`  
**Testing**: Vitest / React Testing Library para testes de unidade e componentes; scripts de verificação para políticas RLS e autenticação  
**Target Platform**: Web responsiva (desktop e mobile modernos), hospedagem na Vercel  
**Project Type**: Web Application centralizada cliente-servidor (Next.js full-stack com Server Components e Server Actions)  
**Performance Goals**: Login e carregamento de perfil em < 2s; mutações de perfil em < 1,5s; logout em < 1s  
**Constraints**: Zero exposição de credenciais administrativas (`service_role`) no cliente; 100% de validação via Zod no backend; RLS ativo em todas as tabelas públicas  
**Scale/Scope**: Suporte ao escopo de usuários do MVP, preparando a base relacional para Feature 002 (Game Catalog & Library) e Feature 003 (Reviews) sem acoplamento prematuro  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio da Constituição | Status | Justificativa / Mecanismo de Conformidade |
|---|:---:|---|
| **2.1. Desenvolvimento Orientado a Especificações (SDD)** | **PASS** | Especificação completa em `spec.md` aprovada, seguida por `plan.md`, `research.md`, `data-model.md` e `contracts/` antes da geração de tarefas e código. |
| **2.2. Arquitetura Cliente-Servidor** | **PASS** | PostgreSQL central no Supabase armazena perfis e credenciais; Next.js atua como servidor centralizado. Nenhum dado crítico reside exclusivamente no navegador. |
| **2.3. Modularidade e Separação de Responsabilidades** | **PASS** | Camadas claramente divididas entre rotas (`app/`), componentes (`components/`), regras de negócio (`services/`), validação (`schemas/`), infraestrutura (`lib/supabase/`) e banco (`supabase/migrations/`). |
| **2.4. Simplicidade e Manutenção** | **PASS** | Sem excesso de bibliotecas; uso dos utilitários nativos do Next.js e Supabase sem abstrações desnecessárias. |
| **3. Tecnologias Obrigatórias** | **PASS** | Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Supabase, Supabase Auth, Zod e Vercel estritamente respeitados. |
| **4.1. Usuários e Autenticação** | **PASS** | Gerenciamento exclusivo pelo Supabase Auth; sem armazenamento manual de senhas; sessões persistentes e encerramento seguro. |
| **4.4. Privacidade por Padrão** | **PASS** | `is_profile_public` e `is_library_public` inicializados obrigatoriamente como `false` (Privado); visibilidades independentes. |
| **5. Banco de Dados e Integridade** | **PASS** | Chaves estrangeiras, `ON DELETE CASCADE`, índice único case-insensitive para `username` e trigger atômico. |
| **6. Segurança e RLS** | **PASS** | Row Level Security ativo com políticas granulares no PostgreSQL; proteção de rotas via middleware no servidor; chaves de serviço vedadas no frontend. |
| **7. Identidade Visual e Interface** | **PASS** | Tema escuro como padrão inicial, layout responsivo e design focado no universo dos videogames. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-user-profiles/
├── plan.md              # Este arquivo (plano técnico detalhado)
├── research.md          # Fase 0: Decisões arquiteturais, padrões e justificativas
├── data-model.md        # Fase 1: Esquema relacional, triggers e políticas RLS
├── quickstart.md        # Fase 1: Guia prático de execução e validação
├── contracts/           # Fase 1: Contratos Zod, TypeScript e serviços
│   └── auth-contracts.md
├── checklists/          # Checklist de qualidade de requisitos
│   └── requirements.md
└── spec.md              # Especificação de requisitos da Feature
```

### Source Code (repository root)

```text
c:\Users\ADM\OneDrive\Desktop\GameKeep\
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Rota pública de login
│   │   └── register/
│   │       └── page.tsx              # Rota pública de cadastro
│   ├── (dashboard)/
│   │   ├── profile/
│   │   │   └── page.tsx              # Rota protegida: visualização de perfil
│   │   └── settings/
│   │       └── profile/
│   │           └── page.tsx          # Rota protegida: edição de perfil e privacidade
│   ├── globals.css                   # Configurações globais e tema escuro
│   ├── layout.tsx                    # Root layout com tema e navegação global
│   └── page.tsx                      # Landing page pública da aplicação
├── components/
│   ├── auth/
│   │   ├── login-form.tsx            # Formulário interativo de autenticação
│   │   └── register-form.tsx         # Formulário interativo de cadastro
│   ├── profile/
│   │   ├── profile-card.tsx          # Exibição visual do perfil do usuário
│   │   ├── profile-edit-form.tsx     # Formulário de edição de dados cadastrais
│   │   └── privacy-settings-form.tsx # Controles de visibilidade (perfil/biblioteca)
│   └── ui/
│       ├── button.tsx                # Botão com variantes temáticas
│       ├── card.tsx                  # Contêiner de conteúdo estilizado
│       ├── input.tsx                 # Campo de entrada com suporte a erros
│       └── toggle.tsx                # Switch para opções de privacidade
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Cliente Supabase para Client Components (browser)
│   │   ├── server.ts                 # Cliente Supabase para Server Components / Actions
│   │   └── middleware.ts             # Cliente de atualização de sessão para o middleware
│   └── utils.ts                      # Funções utilitárias (ex: cn para classes Tailwind)
├── middleware.ts                     # Middleware do Next.js para proteção de rotas
├── schemas/
│   ├── auth.ts                       # Esquemas Zod de login e cadastro
│   └── profile.ts                    # Esquemas Zod de edição e privacidade
├── services/
│   ├── auth-service.ts               # Lógica de negócio de autenticação
│   └── profile-service.ts            # Lógica de negócio e mutações de perfil
├── types/
│   ├── database.ts                   # Tipos TypeScript do esquema Supabase
│   └── profile.ts                    # Interfaces de domínio (UserProfile, etc.)
└── supabase/
    └── migrations/
        └── 20261107000000_create_profiles.sql # Script SQL da tabela, triggers e RLS
```

**Structure Decision**:
- **`app/` com Route Groups**: Separação clara entre o grupo de autenticação `(auth)` (layouts focados em formulários limpos) e o grupo `(dashboard)` (layout com barra de navegação completa para áreas autenticadas).
- **`lib/supabase/` segregado**: Garante conformidade com o padrão oficial do `@supabase/ssr`, evitando misturar contextos de execução com cookies mutáveis e imutáveis.
- **`services/` desacoplado dos componentes**: Centraliza as operações no banco e no Supabase Auth, permitindo fácil testabilidade e reutilização por Server Components e Server Actions.
- **`schemas/` com Zod**: Única fonte da verdade para regras de negócio de entrada, compartilhado de forma transparente entre formulários de UI e validações no servidor.

---

## Complexity Tracking

> Nenhuma violação das regras constitucionais identificada. A arquitetura adota a solução padrão e recomendada para Next.js App Router com Supabase, mantendo a simplicidade e a manutenibilidade.

| Item Avaliado | Complexidade Justificada | Alternativa Rejeitada |
|---|---|---|
| Trigger de Banco de Dados para Perfil | Garante atomicidade e integridade no PostgreSQL | Criação em 2 passos pelo frontend (rejeitada por risco de órfãos) |
| `@supabase/ssr` com Cookies | Previne exposição de tokens em `localStorage` e ataques XSS | Tokens no cliente (rejeitada por violar requisitos de segurança) |
| RLS no PostgreSQL | Segurança obrigatória a nível de persistência | Filtragem manual em código (rejeitada pela Constituição) |

---

## Estratégia de Testes e Validação

1. **Testes Unitários**:
   - Validação dos schemas Zod (`registerSchema`, `loginSchema`, `updateProfileSchema`, `updatePrivacySchema`) com casos válidos, limites de caracteres e entradas malformadas.
2. **Testes de Integração de Serviços**:
   - `authService`: Mock de chamadas do Supabase Auth para verificar tratamento de erros (credenciais inválidas, usuário já cadastrado).
   - `profileService`: Teste de montagem de queries e tratamento de retornos nulos sob RLS.
3. **Testes de Componentes**:
   - Renderização dos formulários em tema escuro, acessibilidade de inputs, exibição de mensagens de erro inline e desabilitação de botões durante submissão.
4. **Testes End-to-End e de Rota**:
   - Validação do middleware garantindo que requisições não autenticadas a `/profile` e `/settings/profile` recebam redirecionamento para `/login`.
   - Validação do trigger de banco de dados e das políticas de RLS garantindo que perfis privados não sejam retornados para usuários deslogados.

---

## Preparação para as Próximas Features

- A tabela `public.profiles` exporta seu identificador único `id` (UUID), que servirá como chave estrangeira direta para a futura tabela `library_entries` na **Feature 002 — Game Catalog & Personal Library** e para a tabela `reviews` na **Feature 003 — Progressive Game Reviews**.
- O campo `is_library_public` já foi concebido e isolado na tabela `profiles`, permitindo que a Feature 002 consulte a preferência de privacidade da biblioteca sem necessidade de reestruturação do banco.
- O isolamento arquitetural em `services/` permite plugar novos módulos de catálogo e avaliações sem interferir no núcleo de identidade e segurança dos usuários.
