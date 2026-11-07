# Quickstart Validation Guide: Authentication & User Profiles

**Feature**: `001-auth-user-profiles`  
**Date**: 2026-11-07  
**Purpose**: Guia de execução de cenários de validação de ponta a ponta para comprovação da conformidade da funcionalidade e validação dos controles de segurança (SEC-001, SEC-002 e SEC-003).

---

## 1. Pré-Requisitos

1. **Ambiente Node.js**: Versão 20+ instalada.
2. **Instância Supabase**: Projeto Supabase configurado (local via Supabase CLI ou remoto no Supabase Cloud).
3. **Variáveis de Ambiente**: Arquivo `.env.local` configurado com:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
   ```
   > [!IMPORTANT]
   > NUNCA adicione a chave `SUPABASE_SERVICE_ROLE_KEY` no ambiente frontend ou acessível ao cliente.

---

## 2. Inicialização do Banco de Dados

1. Aplicar a migração que cria a tabela `public.profiles`, os triggers com `SET search_path = public, pg_temp` (SEC-001), a proteção de imutabilidade (SEC-003) e as políticas de Row Level Security (RLS) conforme detalhado no [data-model.md](file:///c:/Users/ADM/OneDrive/Desktop/GameKeep/specs/001-auth-user-profiles/data-model.md).
2. Verificar se a extensão e o schema `public` possuem as permissões e RLS ativos:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';
   -- rowsecurity deve retornar TRUE
   ```

---

## 3. Roteiro de Validação dos Cenários de Aceitação

### Cenário 1: Cadastro de Usuário e Criação Atômica de Perfil
- **Ação**:
  1. Acessar `http://localhost:3000/register`.
  2. Preencher o formulário com:
     - E-mail: `jogador_teste@example.com`
     - Username: `progamer_2026`
     - Senha: `Password123`
  3. Clicar em "Criar Conta".
- **Resultado Esperado**:
  - Usuário é autenticado e redirecionado para `/profile`.
  - No banco de dados, a tabela `profiles` possui um registro com `username = 'progamer_2026'`, `is_profile_public = false` e `is_library_public = false`.

### Cenário 2: Validação de Username Duplicado (Defesa em Profundidade - SEC-002)
- **Ação**:
  1. Abrir janela anônima e acessar `http://localhost:3000/register`.
  2. Tentar cadastrar com e-mail diferente (`outro@example.com`), mas mesmo username: `PROGAMER_2026` (com variação de maiúsculas).
- **Resultado Esperado**:
  - A pré-checagem em `authService.signUp` detecta o nome em uso antes do envio e exibe a mensagem de erro específica: "Este nome de usuário já está em uso."
  - Se duas requisições simultâneas colidirem no commit, a restrição de unicidade no banco de dados desfaz a transação e o erro PostgreSQL `23505` é capturado e mapeado amigavelmente.

### Cenário 3: Login, Persistência e Logout
- **Ação**:
  1. Efetuar logout no botão da barra de navegação.
  2. Verificar que a sessão foi encerrada e a aplicação redirecionou para `/login`.
  3. Informar as credenciais cadastradas e efetuar login.
  4. Recarregar a página (F5) repetidamente e navegar entre abas.
- **Resultado Esperado**:
  - A sessão permanece ativa sem deslogar o usuário ou apresentar telas em branco.

### Cenário 4: Edição de Perfil e Atualização de Privacidade
- **Ação**:
  1. Acessar `http://localhost:3000/settings/profile`.
  2. Atualizar o Display Name para `Mestre dos Jogos`, adicionar uma bio e alterar a visibilidade do perfil para **Público**, mantendo a biblioteca como **Privada**.
  3. Clicar em "Salvar Alterações".
- **Resultado Esperado**:
  - Notificação de sucesso exibida em menos de 1,5 segundos.
  - O perfil reflete os novos dados imediatamente.
  - No banco de dados, `is_profile_public = true` e `is_library_public = false`.

### Cenário 5: Verificação de RLS e Proteção de Rotas
- **Ação**:
  1. Em janela anônima (sem login), tentar acessar diretamente `http://localhost:3000/profile` e `http://localhost:3000/settings/profile`.
  2. Tentar simular uma chamada de mutação de perfil com o ID de outro usuário.
- **Resultado Esperado**:
  - O middleware do Next.js intercepta o acesso não autenticado e redireciona imediatamente para `/login?returnTo=%2Fprofile` (com codificação segura).
  - Qualquer tentativa de mutação contra outro ID é sumariamente rejeitada pelo RLS do PostgreSQL com erro `42501` (violates row-level security policy).

### Cenário 6: Imutabilidade do Username no Banco de Dados (SEC-003)
- **Ação**:
  1. Estando autenticado, tentar executar via console/API ou query direta:
     ```typescript
     await supabase.from('profiles').update({ username: 'novo_hacked_user' }).eq('id', user.id);
     ```
- **Resultado Esperado**:
  - A operação falha imediatamente com a exceção disparada pelo trigger `protect_username_immutability`: *"O nome de usuário não pode ser alterado após o cadastro."* (código `23514`).
  - O `username` original permanece inalterado no PostgreSQL.

---

## 4. Comandos de Verificação e Testes

```bash
# Validação de tipos TypeScript
pnpm tsc --noEmit

# Validação de formatação e linting
pnpm lint

# Execução dos testes automatizados de unidade e integração de autenticação
pnpm test
```
