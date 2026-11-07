# Technical Research: Authentication & User Profiles

**Feature**: `001-auth-user-profiles`  
**Date**: 2026-11-07  
**Status**: Concluído  
**Security Hardening**: SEC-001, SEC-002, SEC-003 e melhorias adicionais incorporadas

---

## 1. Arquitetura de Autenticação com Next.js App Router e Supabase

### Decisão 1: Utilização de `@supabase/ssr` com Sessões baseadas em Cookies
- **Decisão**: Utilizar o pacote oficial `@supabase/ssr` em conjunto com `@supabase/supabase-js` para gerenciar a autenticação em todo o ciclo de vida do Next.js App Router (Server Components, Client Components, Server Actions e Middleware).
- **Racional**:
  - A Constituição exige arquitetura cliente-servidor centralizada e proteção de credenciais. O uso de cookies `httpOnly` seguros garante que os tokens de acesso e renovação (JWT) nunca fiquem expostos a ataques XSS no armazenamento local do navegador (`localStorage`).
  - Permite renderização segura no lado do servidor (SSR) sem *flash of unauthenticated content* (FOUC).
  - O `@supabase/ssr` padroniza os clientes para quatro contextos:
    1. `createClient` para **Browser** (Client Components).
    2. `createClient` para **Server Components** (leitura autenticada com cookies readonly).
    3. `createClient` para **Server Actions / Route Handlers** (mutação e atualização de cookies).
    4. `createClient` para **Middleware** (verificação e renovação de tokens antes de despachar a rota).
  - **Atributos de Cookies Padronizados**: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'` e expiração de 7 dias.
- **Alternativas consideradas**:
  - `@supabase/auth-helpers-nextjs`: Descontinuado/legado pela equipe do Supabase em favor do `@supabase/ssr`.
  - Autenticação própria com JWT manual no Next.js: Descartada por violar o princípio de manutenção, demandar gerenciamento manual de senhas e complexidade desnecessária contraposta ao Supabase Auth especificado na Constituição.

---

## 2. Inicialização Automática e Atômica de Perfis (Hardening SEC-001)

### Decisão 2: Trigger Nativo no PostgreSQL (`SECURITY DEFINER` com `search_path` restrito)
- **Decisão**: Criar a função de banco de dados `handle_new_user()` associada ao trigger `AFTER INSERT ON auth.users`, explicitamente configurada com `SECURITY DEFINER` e `SET search_path = public, pg_temp`.
- **Racional**:
  - Garante **atomicidade e consistência transacional**: assim que um usuário é cadastrado no `auth.users`, a tabela pública `profiles` recebe o registro vinculado com seus campos obrigatórios.
  - Elimina o risco de falhas de rede ou interrupções no cliente deixarem usuários órfãos (cadastrados no Auth mas sem registro na tabela de perfil).
  - **Mitigação SEC-001 (Search Path Hijacking):** A diretiva `SET search_path = public, pg_temp` impede que a função execute sob esquemas manipulados por usuários não confiáveis.
  - **Princípio do Menor Privilégio:** `REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;` e concessão exclusiva para os papéis de serviço `postgres` e `supabase_auth_admin`.
  - Inicializa obrigatoriamente as preferências com `is_profile_public = false` e `is_library_public = false`, respeitando a exigência de "privacidade por padrão" da Seção 4.4 da Constituição.
- **Alternativas consideradas**:
  - Inserção via frontend após o método `supabase.auth.signUp()`: Insegura e frágil a falhas de rede, recargas acidentais ou cancelamento pelo usuário antes da segunda requisição.
  - Webhook de Auth para um Route Handler: Adiciona latência e dependência de infraestrutura externa e porta pública durante desenvolvimento local.

---

## 3. Gestão de Unicidade de Username e Condições de Corrida (Hardening SEC-002)

### Decisão 3: Defesa em Profundidade com Verificação Prévia e Restrição Única no Banco
- **Decisão**: Combinar uma verificação assíncrona na camada de aplicação (`checkUsernameAvailability`) com a restrição única no PostgreSQL (`idx_profiles_username_lower`).
- **Racional**:
  - **Camada de Aplicação:** Permite que a Server Action `signUp` verifique se o username já está em uso antes de invocar a criação do usuário no Supabase Auth. Isso evita que erros 500 genéricos da API de autenticação sejam exibidos ao usuário.
  - **Camada de Persistência:** A consulta prévia não previne 100% das condições de corrida em acessos concorrentes simultâneos no mesmo milissegundo. Por isso, o índice único `CREATE UNIQUE INDEX idx_profiles_username_lower ON public.profiles (LOWER(username))` é a garantia final e inegociável. Caso ocorra colisão no commit da transação, o Supabase Auth reverte a inserção em `auth.users` e o serviço traduz o erro do banco em mensagem amigável no formulário.
- **Alternativas consideradas**:
  - Depender apenas da consulta prévia no frontend: Insegura contra acessos simultâneos e scripts automatizados.
  - Depender apenas do erro retornado pelo trigger do banco: Apresenta mensagens de erro opacas ao usuário final.

---

## 4. Imutabilidade do Username no PostgreSQL (Hardening SEC-003)

### Decisão 4: Bloqueio no Banco de Dados via Trigger `BEFORE UPDATE`
- **Decisão**: Implementar a função e trigger `protect_username_immutability()` disparada em qualquer `BEFORE UPDATE ON public.profiles`.
- **Racional**:
  - O username é a identidade canônica e pública do jogador nesta versão do projeto e não pode ser alterado pós-cadastro.
  - Embora o formulário da interface e o schema Zod `updateProfileSchema` não exponham o campo `username`, um usuário com conhecimento técnico poderia tentar emitir um comando `supabase.from('profiles').update({ username: 'novo' })` usando seu JWT válido.
  - A política RLS `USING (auth.uid() = id)` autorizaria a alteração na linha do próprio usuário. O trigger `BEFORE UPDATE` intercepta a operação, compara `NEW.username <> OLD.username` e dispara uma exceção SQL caso haja discrepância, blindando o banco de dados mesmo contra acessos diretos via SDK.
- **Alternativas consideradas**:
  - Confiar apenas na omissão do campo no frontend e no Zod: Inseguro contra requisições manuais via Postman ou SDK.

---

## 5. Estratégia de Proteção de Rotas e Prevenção de Open Redirect

### Decisão 5: Middleware no Servidor com `supabase.auth.getUser()` e Sanitização de URLs
- **Decisão**: Implementar `middleware.ts` no Next.js com validação de token via `supabase.auth.getUser()`, codificação segura dos parâmetros de rota e função de sanitização `sanitizeRedirectUrl()`.
- **Racional**:
  - O método `supabase.auth.getUser()` valida a autenticidade do JWT diretamente com os servidores do Supabase ou valida a assinatura criptográfica, ao contrário de `getSession()`, que apenas lê o payload do cookie sem garantia de não ter sido revogado.
  - Garante redirecionamento instantâneo no servidor (HTTP 307) para `/login?returnTo=...` quando não autenticado, sem renderizar qualquer fragmento do componente privado.
  - **Prevenção de Open Redirect:** Parâmetros `returnTo` são sanitizados para garantir que apontem exclusivamente para rotas relativas internas seguras (começando com `/` simples, sem barras duplas `//` ou esquemas externos com `:`). Parâmetros são codificados com `encodeURIComponent`.
- **Alternativas consideradas**:
  - Proteção exclusiva com `useEffect` em Client Components: Rejeitada categoricamente pela Seção 6 da Constituição.

---

## 6. Validação e Sanitização com Zod e TypeScript

### Decisão 6: Schemas Unificados com Sanitização e Normalização
- **Decisão**: Centralizar todos os esquemas de validação em `schemas/auth.ts` e `schemas/profile.ts` utilizando Zod com transformações explícitas.
- **Racional**:
  - Proporciona feedback imediato ao usuário no formulário do frontend e revalidação estrita e inviolável no backend (Server Actions/APIs).
  - Regras endurecidas:
    - `email`: Formato válido e normalizado com `.toLowerCase().trim()`.
    - `password`: Mínimo de 8 caracteres, exigência de letras e números.
    - `username`: 3 a 20 caracteres, formato `^[a-zA-Z0-9_-]+$`, normalizado com `.toLowerCase().trim()`.
    - `display_name`: 2 a 50 caracteres com `.trim()`.
    - `bio`: Máximo de 300 caracteres com `.trim()`, impedindo biografias formadas apenas por espaços em branco.
    - `is_profile_public` e `is_library_public`: Booleanos estritos.
- **Alternativas consideradas**:
  - Validação manual com regex disperso: Propenso a inconsistências entre camadas e duplicação de regras.

---

## 7. Isolamento e Row Level Security (RLS)

### Decisão 7: Políticas Granulares no PostgreSQL
- **Decisão**: Habilitar `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;` com quatro políticas explícitas:
  1. `profiles_read_policy`: Leitura permitida se `auth.uid() = id` OU `is_profile_public = true`.
  2. `profiles_insert_policy`: Inserção permitida para o próprio usuário (`auth.uid() = id`) ou via função de sistema.
  3. `profiles_update_policy`: Atualização restrita a `auth.uid() = id` com cláusula `WITH CHECK (auth.uid() = id)`.
  4. `profiles_delete_policy`: Exclusão permitida apenas se `auth.uid() = id`.
- **Racional**:
  - O banco de dados é a fonte final de integridade. Mesmo que haja qualquer falha na camada de apresentação, o isolamento entre contas de usuários é garantido pelo PostgreSQL.
