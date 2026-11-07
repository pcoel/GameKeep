# Feature Specification: Authentication & User Profiles

**Feature Branch**: `001-auth-user-profiles`  
**Created**: 2026-11-07  
**Status**: Draft  
**Input**: User description: "Feature 001 — Authentication & User Profiles: Cadastro, Login e logout, Sessões, Perfil, Configurações básicas de privacidade"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro de Novo Usuário e Inicialização Automática de Perfil (Priority: P1)

Como um novo jogador visitante, quero me cadastrar na plataforma informando e-mail, senha e nome de usuário único, para que eu tenha uma conta individual com um perfil criado automaticamente para organizar meus jogos e avaliações.

**Why this priority**: O cadastro é a porta de entrada indispensável para a plataforma. Sem uma conta e um perfil associado, nenhuma experiência personalizada, biblioteca ou avaliação pode existir.

**Independent Test**: Pode ser testado de ponta a ponta criando uma nova conta na página `/register` e verificando se o registro é concluído, o usuário é autenticado e um registro correspondente na tabela de perfis é inicializado com configurações privadas por padrão.

**Acceptance Scenarios**:

1. **Given** um visitante não autenticado na página `/register`, **When** preenche um e-mail válido, senha segura e username único e clica em cadastrar, **Then** a conta é criada no serviço de autenticação, o perfil é gerado automaticamente no banco de dados com privacidade padrão privada, e o usuário é autenticado ou orientado com mensagem de boas-vindas.
2. **Given** um visitante na página `/register`, **When** tenta submeter um e-mail já cadastrado ou um username que já pertence a outro usuário, **Then** o sistema rejeita o cadastro e exibe uma mensagem de erro clara indicando a indisponibilidade do dado.
3. **Given** um visitante na página `/register`, **When** insere dados inválidos (como formato de e-mail incorreto, senha abaixo do comprimento mínimo ou username com caracteres inválidos), **Then** mensagens de validação em linha orientam a correção antes do envio.

---

### User Story 2 - Autenticação (Login), Persistência de Sessão e Logout (Priority: P1)

Como um usuário cadastrado, quero realizar login com meu e-mail e senha, manter minha sessão segura enquanto utilizo o sistema e realizar logout quando desejar, garantindo a proteção dos meus dados pessoais.

**Why this priority**: Permite que usuários retornem à sua biblioteca e histórico, mantendo a sessão protegida em conformidade com as regras de segurança e separação de usuários.

**Independent Test**: Pode ser testado acessando `/login` com credenciais válidas, confirmando o redirecionamento para o perfil/dashboard com sessão persistida ao recarregar a página, e acionando o logout para garantir a invalidação imediata da sessão.

**Acceptance Scenarios**:

1. **Given** um usuário cadastrado na página `/login`, **When** informa e-mail e senha corretos e confirma, **Then** o sistema autentica o usuário, estabelece a sessão persistente e redireciona para a página `/profile`.
2. **Given** um usuário na página `/login`, **When** submete credenciais incorretas (e-mail inexistente ou senha incorreta), **Then** o sistema exibe mensagem de erro amigável sem revelar detalhes de segurança excessivos.
3. **Given** um usuário autenticado navegando na plataforma, **When** recarrega a página ou navega entre rotas protegidas, **Then** a sessão permanece ativa de forma contínua sem exigir novo login.
4. **Given** um usuário autenticado em qualquer página, **When** seleciona a ação de logout, **Then** a sessão é imediatamente invalidada no cliente e no servidor, os dados de autenticação locais são removidos e o usuário é redirecionado para a página pública.

---

### User Story 3 - Visualização e Edição do Perfil de Usuário (Priority: P2)

Como um usuário autenticado, quero visualizar meus dados de perfil e editá-los (nome de exibição, foto/avatar e biografia), para personalizar minha identidade na plataforma.

**Why this priority**: A personalização consolida a identidade do jogador na comunidade e prepara o perfil para futuras interações com a biblioteca e avaliações.

**Independent Test**: Pode ser testado acessando `/profile` para validar a exibição dos dados e navegando para `/settings/profile` para alterar display name, avatar e biografia, verificando a persistência e exibição imediata dos novos dados.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado acessando `/profile`, **When** a página é carregada, **Then** visualiza seu username único, display name, biografia, foto/avatar e data de criação da conta.
2. **Given** um usuário autenticado na página `/settings/profile`, **When** altera seu display name, bio ou avatar URL e salva as alterações, **Then** o sistema valida os dados, persiste as atualizações no banco de dados e exibe notificação de sucesso.
3. **Given** um usuário na edição de perfil, **When** insere dados que violam limites (por exemplo, bio excedendo o tamanho máximo permitido), **Then** o sistema exibe feedback de erro e impede a gravação de dados inválidos.

---

### User Story 4 - Gerenciamento de Privacidade do Perfil e da Biblioteca (Priority: P2)

Como um usuário, quero configurar de forma independente se meu perfil e minha biblioteca são públicos ou privados, mantendo como padrão o modo privado para resguardar minhas informações.

**Why this priority**: A Constituição do projeto define a privacidade por padrão e a independência de visibilidade como princípios inegociáveis de arquitetura e modelo de dados.

**Independent Test**: Pode ser testado alterando as opções de visibilidade em `/settings/profile`, verificando se as preferências de perfil e biblioteca são salvas independentemente e se outro usuário ou visitante não autenticado só acessa o perfil quando configurado como público.

**Acceptance Scenarios**:

1. **Given** um novo perfil recém-criado, **When** suas configurações são verificadas, **Then** tanto a visibilidade do perfil quanto a da biblioteca estão configuradas como "Privado" por padrão.
2. **Given** um usuário com perfil definido como Privado, **When** um visitante anônimo ou outro usuário tenta acessar a rota pública desse perfil, **Then** as informações pessoais são ocultadas e uma indicação de perfil privado é apresentada.
3. **Given** um usuário na página `/settings/profile`, **When** altera a visibilidade do perfil para Público mantendo a biblioteca como Privada e salva, **Then** apenas as informações gerais do perfil tornam-se públicas, enquanto a visibilidade da biblioteca permanece estritamente privada.

---

### User Story 5 - Proteção de Rotas e Isolamento Seguro no Servidor (Priority: P1)

Como mantenedor do sistema e usuário, quero que as rotas e dados privados sejam rigorosamente protegidos no servidor e no banco de dados, para que visitantes anônimos ou usuários maliciosos não acessem nem alterem dados alheios.

**Why this priority**: Garante conformidade com o princípio de segurança e RLS da Constituição, impedindo que a segurança dependa apenas de checagens na interface web.

**Independent Test**: Pode ser testado tentando acessar diretamente URLs privadas (`/profile`, `/settings/profile`) sem sessão ativa e tentando enviar requisições de atualização de perfil com um identificador de outro usuário, comprovando o bloqueio por RLS e middleware.

**Acceptance Scenarios**:

1. **Given** um visitante não autenticado, **When** tenta acessar `/profile` ou `/settings/profile`, **Then** o servidor/middleware intercepta a requisição e o redireciona para `/login` preservando o fluxo de retorno.
2. **Given** um usuário autenticado, **When** tenta enviar uma operação de alteração (update) direcionada ao registro de perfil de outro usuário, **Then** as políticas de Row Level Security (RLS) do banco de dados rejeitam a operação sumariamente com erro de autorização.
3. **Given** uma requisição para ler perfis alheios, **When** o perfil consultado estiver com visibilidade privada, **Then** as políticas de segurança do banco e da API não retornam dados confidenciais do usuário para requisitantes não autorizados.

---

### Edge Cases

- **Colisão de Username com Variação de Caixa**: Um usuário tenta cadastrar `PlayerOne` quando já existe `playerone`. O sistema deve considerar a unicidade de forma case-insensitive e rejeitar a criação duplicada.
- **Queda de Conexão durante o Cadastro**: Se a chamada ao serviço de autenticação for concluída mas a criação do perfil falhar, o sistema deve garantir atomicidade (via trigger de banco de dados ou compensação) para evitar contas órfãs sem perfil associado.
- **Tentativas Repetidas de Login com Senha Incorreta**: O sistema deve apresentar mensagens genéricas ("E-mail ou senha inválidos") para evitar enumeração de usuários, respeitando as políticas de rate limit do Supabase Auth.
- **Sessão Expirada durante Edição de Perfil**: Se o token de sessão expirar enquanto o usuário edita `/settings/profile`, ao clicar em salvar o sistema deve identificar a falta de autorização, evitar perda de conteúdo e solicitar re-autenticação.
- **Logout em Múltiplas Abas**: Ao efetuar logout em uma aba do navegador, qualquer requisição ou transição de tela em abas abertas subsequentes deve reconhecer a ausência de sessão e redirecionar para a tela pública.
- **Caracteres Especiais no Username**: O username deve aceitar apenas caracteres alfanuméricos e sublinhados/hífens (ex: `^[a-zA-Z0-9_-]{3,20}$`) para evitar problemas de roteamento em URLs futuras.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir o cadastro de novos usuários informando e-mail, senha e nome de usuário (username).
- **FR-002**: O sistema DEVE validar todos os dados de cadastro e edição utilizando esquemas Zod (validação de formato de e-mail, força e tamanho de senha, e padrão de username).
- **FR-003**: O sistema DEVE utilizar o Supabase Auth para gerenciar autenticação, tokens de sessão e hashes de senha, nunca armazenando senhas manualmente na aplicação.
- **FR-004**: O sistema DEVE criar automaticamente um registro correspondente na tabela `profiles` imediatamente após a criação do usuário no Supabase Auth (`auth.users`), utilizando uma função/trigger com privilégios de segurança de banco de dados.
- **FR-005**: O sistema DEVE permitir autenticação de usuários registrados mediante e-mail e senha com tratamento seguro de erros e mensagens amigáveis.
- **FR-006**: O sistema DEVE manter a sessão do usuário autenticado de forma persistente e segura via cookies httpOnly e tokens gerenciados.
- **FR-007**: O sistema DEVE disponibilizar ação de logout em todas as páginas para usuários autenticados, invalidando a sessão no servidor e cliente e redirecionando para a página pública.
- **FR-008**: O sistema DEVE fornecer a página `/profile` exibindo as informações do usuário autenticado: username único, display name, biografia, avatar e data de criação da conta.
- **FR-009**: O sistema DEVE fornecer a página `/settings/profile` permitindo ao usuário editar seu display name, avatar URL, biografia e preferências de visibilidade.
- **FR-010**: O sistema DEVE fornecer opções independentes de visibilidade para o perfil (Público/Privado) e para a biblioteca (Pública/Privada), inicializando ambas obrigatoriamente como Privadas por padrão.
- **FR-011**: O sistema DEVE assegurar que as configurações de privacidade do perfil e da biblioteca sejam independentes entre si e da futura visibilidade de avaliações.
- **FR-012**: O sistema DEVE proteger rotas privadas (`/profile`, `/settings/profile`) via verificação de sessão no servidor/middleware, redirecionando requisições não autenticadas para `/login`.
- **FR-013**: O sistema DEVE aplicar Row Level Security (RLS) na tabela `profiles`, garantindo que:
  - O usuário autenticado possa ler seu próprio perfil completo independentemente da privacidade.
  - O usuário autenticado só possa atualizar ou modificar o registro cujo `id` coincida com o seu `auth.uid()`.
  - Usuários anônimos e outros usuários só consigam ler perfis marcados como públicos (`is_profile_public = true`).
- **FR-014**: O sistema DEVE fornecer interface responsiva em tema escuro com identidade visual associada ao universo dos videogames nas páginas `/login`, `/register`, `/profile` e `/settings/profile`, incluindo estados de carregamento, validações inline e feedback visual de erros e sucesso.
- **FR-015**: O sistema NUNCA DEVE expor chaves de serviço ou credenciais administrativas (`service_role`) no frontend ou em pacotes do cliente.

### Key Entities *(include if feature involves data)*

- **`profiles` (Tabela de Perfis)**:
  - `id`: `UUID` — Chave primária, chave estrangeira vinculada a `auth.users(id)` com integridade referencial (`ON DELETE CASCADE`).
  - `username`: `TEXT` — Nome de usuário único na plataforma (índice único case-insensitive), obrigatório, entre 3 e 20 caracteres alfanuméricos e sublinhados/hífens.
  - `display_name`: `TEXT` — Nome de exibição público ou amigável, obrigatório, até 50 caracteres.
  - `avatar_url`: `TEXT` — URL para imagem/avatar do usuário, opcional.
  - `bio`: `TEXT` — Texto descritivo/biografia do usuário, opcional, até 300 caracteres.
  - `is_profile_public`: `BOOLEAN` — Controle de visibilidade do perfil, padrão `false` (Privado).
  - `is_library_public`: `BOOLEAN` — Controle de visibilidade da biblioteca, padrão `false` (Privado).
  - `created_at`: `TIMESTAMPTZ` — Data e hora de criação da conta/perfil, padrão `now()`.
  - `updated_at`: `TIMESTAMPTZ` — Data e hora da última modificação do perfil, padrão `now()`.

- **`User Session` (Sessão do Usuário)**:
  - Entidade de controle de autenticação gerenciada pelo Supabase Auth. Contém `user_id`, `email`, token JWT de acesso, refresh token e tempo de expiração.

- **`Privacy Preferences` (Preferências de Privacidade)**:
  - Estrutura de configuração que reflete o estado de visibilidade (`is_profile_public` e `is_library_public`), garantindo isolamento total entre perfil e biblioteca.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem concluir o fluxo de cadastro e acessar a conta com perfil criado em menos de 60 segundos.
- **SC-002**: 100% dos novos perfis são criados automaticamente com `is_profile_public = false` e `is_library_public = false`.
- **SC-003**: O login com credenciais válidas autentica e redireciona o usuário para seu perfil em menos de 2 segundos sob condições normais de rede.
- **SC-004**: 100% das tentativas de acesso de usuários não autenticados a `/profile` e `/settings/profile` são bloqueadas e redirecionadas para `/login`.
- **SC-005**: 100% das tentativas de alteração de perfis de terceiros via API ou cliente são bloqueadas pelas políticas RLS do PostgreSQL.
- **SC-006**: Alterações em `/settings/profile` persistem e refletem visualmente na interface em menos de 1,5 segundos após a confirmação.
- **SC-007**: A ação de logout encerra a sessão e revoga o acesso imediatamente em menos de 1 segundo.
- **SC-008**: Todas as páginas (`/login`, `/register`, `/profile`, `/settings/profile`) são totalmente funcionais e legíveis em dispositivos móveis (telas a partir de 320px) e desktops em tema escuro.

## Assumptions

- O Supabase Auth é o provedor exclusivo de autenticação para este MVP, utilizando e-mail e senha.
- A aplicação é construída com Next.js (App Router), React, Tailwind CSS e TypeScript, conforme a Seção 3 da Constituição.
- A validação de formulários e APIs é realizada de ponta a ponta com Zod.
- A criação automática do perfil é efetuada através de trigger nativo no PostgreSQL acionado após a inserção em `auth.users`, garantindo consistência transacional.
- As regras de privacidade da biblioteca são estruturadas nesta tabela para consumo direto na Feature 002 (Game Catalog & Personal Library).
- Integração externa com catálogo IGDB, busca de jogos, coleções e avaliações estão estritamente fora do escopo desta Feature 001.
