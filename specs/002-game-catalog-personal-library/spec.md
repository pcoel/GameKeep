# Feature Specification: 002 — Game Catalog & Personal Library

**Feature Branch**: `002-game-catalog-personal-library`  
**Created**: 08/11/2026  
**Status**: Draft / Aprovado para Planejamento  
**Input**: User description: "Permitir que usuários pesquisem jogos em um catálogo externo (IGDB) e adicionem esses jogos às suas bibliotecas pessoais com organização por status (Quero jogar, Jogando, Concluído)."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pesquisa e Exploração de Jogos no Catálogo (Priority: P1)

Como um jogador registrado ou visitante no GameKeep, quero pesquisar jogos pelo nome para encontrar títulos do meu interesse, ver suas capas e acessar seus detalhes essenciais.

**Why this priority**: A busca no catálogo é a porta de entrada para a coleção; sem encontrar jogos, o usuário não consegue montar sua biblioteca.

**Independent Test**: Pode ser testado de forma autônoma realizando uma busca textual por um nome de jogo (ex: "The Witcher 3" ou "Chrono Trigger"), confirmando o retorno da capa, título e ano de lançamento, além do tratamento amigável de pesquisas sem resultados ou de instabilidades na fonte de dados.

**Acceptance Scenarios**:

1. **Given** que o usuário está na página do catálogo, **When** ele digita pelo menos 2 caracteres no campo de busca e pesquisa, **Then** o sistema exibe uma lista de jogos correspondentes com capa em destaque, título e ano de lançamento.
2. **Given** que o usuário pesquisa um termo inexistente ou sem correspondência (ex: "xyz_jogo_inexistente_99"), **When** a busca é concluída, **Then** o sistema exibe uma mensagem clara de que nenhum jogo foi encontrado, sugerindo nova tentativa.
3. **Given** que o serviço externo de catálogo apresente falha temporária ou indisponibilidade, **When** o usuário tenta buscar, **Then** o sistema exibe um aviso claro de instabilidade com botão para tentar novamente, sem travar a interface.
4. **Given** que o usuário clica sobre um jogo nos resultados de busca, **When** a visualização de detalhes é aberta, **Then** são exibidos título, capa em alta resolução, sinopse/resumo e dados de lançamento.

---

### User Story 2 - Adição de Jogos à Biblioteca Pessoal com Status (Priority: P2)

Como um usuário autenticado, quero adicionar um jogo do catálogo à minha biblioteca pessoal selecionando um status inicial ("Quero jogar", "Jogando" ou "Concluído"), para manter o registro das minhas intenções e atividades de jogo.

**Why this priority**: É o núcleo do valor do GameKeep como organizador de coleção pessoal.

**Independent Test**: Um usuário autenticado pode abrir a página de um jogo, selecionar o status "Quero jogar" e clicar em "Adicionar à Biblioteca", confirmando que o jogo agora consta na sua coleção pessoal.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado visualizando um jogo que ainda não está em sua biblioteca, **When** ele escolhe um dos três status permitidos ("Quero jogar", "Jogando" ou "Concluído") e confirma a inclusão, **Then** o jogo é adicionado à sua biblioteca pessoal com o status escolhido e um feedback de sucesso é exibido.
2. **Given** um usuário que já adicionou determinado jogo à sua biblioteca, **When** ele visualiza novamente a página desse jogo, **Then** a interface indica que o jogo já pertence à sua coleção e impede uma nova adição duplicada.
3. **Given** um visitante não autenticado, **When** ele tenta adicionar um jogo à biblioteca, **Then** o sistema solicita que faça login ou cadastro para organizar sua coleção.

---

### User Story 3 - Visualização e Organização da Biblioteca Pessoal (Priority: P3)

Como um usuário autenticado, quero acessar a visualização da minha biblioteca pessoal para ver todos os meus jogos cadastrados, agrupados ou filtrados por status, permitindo acompanhar minha coleção de forma agradável.

**Why this priority**: Proporciona a experiência de prateleira digital e visão holística do acervo pessoal do jogador.

**Independent Test**: Pode ser testado adicionando jogos com status distintos e verificando se a tela da biblioteca os exibe corretamente nas respectivas abas ou filtros ("Todos", "Quero jogar", "Jogando", "Concluído").

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com jogos em sua biblioteca, **When** ele acessa sua página de biblioteca, **Then** todos os seus jogos são listados em formato de cartões visuais com capa, título e badge indicando o status atual.
2. **Given** um usuário navegando em sua biblioteca, **When** ele filtra por "Jogando", **Then** somente os jogos marcados com o status "Jogando" permanecem visíveis.
3. **Given** um usuário recém-cadastrado sem jogos adicionados, **When** ele visita sua biblioteca, **Then** o sistema apresenta um estado vazio acolhedor com atalho para buscar jogos no catálogo.

---

### User Story 4 - Atualização de Status e Remoção de Jogos (Priority: P4)

Como um usuário autenticado, quero alterar o status de um jogo que já está na minha biblioteca ou removê-lo completamente da minha coleção caso mude de ideia ou tenha adicionado por engano.

**Why this priority**: Garante que a biblioteca permaneça dinâmica, refletindo o progresso real do jogador ao longo do tempo.

**Independent Test**: Pode ser testado alterando o status de um jogo de "Quero jogar" para "Jogando" e, em seguida, executando a remoção do jogo da biblioteca, comprovando a saída imediata da listagem.

**Acceptance Scenarios**:

1. **Given** um jogo com status "Quero jogar" na biblioteca do usuário, **When** o usuário altera seu status para "Concluído", **Then** a alteração é gravada imediatamente e o jogo passa a ser classificado sob a nova categoria.
2. **Given** um jogo presente na biblioteca do usuário, **When** o usuário aciona a opção de remoção e confirma a ação, **Then** a entrada é excluída da biblioteca e a interface é atualizada.
3. **Given** a remoção de um jogo da biblioteca, **When** a exclusão é confirmada, **Then** nenhuma informação ou biblioteca de outro usuário é afetada.

---

### Edge Cases

- **Título sem imagem de capa:** Quando a base externa de jogos não disponibiliza imagem de capa para um título, o sistema deve renderizar um placeholder elegante com o nome do jogo e gradiente padronizado, preservando o layout da grade.
- **Tentativas concorrentes de inclusão do mesmo jogo:** Caso o usuário acione repetidamente o botão de adicionar em rápida sucessão, o sistema deve ignorar chamadas redundantes e garantir uma única entrada por jogo/usuário no banco.
- **Caracteres especiais na busca:** Buscas contendo símbolos, acentos ou pontuações (ex: "Pokémon", "NieR:Automata", "Half-Life 2") devem retornar resultados coerentes sem falhas de formatação de consulta.
- **Falha de rede na comunicação com catálogo externo:** Se o serviço de catálogo demorar a responder (timeout), o sistema deve interromper a espera graciosamente com uma mensagem informativa, sem deixar a página em carregamento perpétuo.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir a pesquisa de jogos por nome a partir de uma entrada de texto do usuário.
- **FR-002**: O sistema DEVE consultar o catálogo de jogos exclusivamente a partir do servidor, garantindo que credenciais de API permaneçam ocultas do navegador.
- **FR-003**: O sistema DEVE exibir os resultados de busca com capa, título do jogo e ano de lançamento, formatados em grade responsiva.
- **FR-004**: O sistema DEVE disponibilizar uma visualização detalhada para cada jogo selecionado contendo título, capa ampliada, sinopse/resumo e dados de lançamento.
- **FR-005**: O sistema DEVE permitir que usuários autenticados adicionem qualquer jogo do catálogo à sua biblioteca pessoal.
- **FR-006**: O sistema DEVE associar cada jogo adicionado a exatamente um dos três status permitidos: `Quero jogar`, `Jogando` ou `Concluído`.
- **FR-007**: O sistema DEVE impedir estritamente que um mesmo usuário adicione o mesmo jogo mais de uma vez em sua biblioteca pessoal.
- **FR-008**: O sistema DEVE permitir que o usuário proprietário altere o status de qualquer jogo presente em sua biblioteca.
- **FR-009**: O sistema DEVE permitir que o usuário proprietário remova qualquer jogo de sua biblioteca pessoal.
- **FR-010**: O sistema DEVE persistir no banco de dados local os dados essenciais dos jogos adicionados às bibliotecas para evitar dependência contínua de requisições externas para exibição de acervo.
- **FR-011**: O sistema DEVE exibir a biblioteca pessoal do usuário autenticado permitindo filtrar ou organizar por status.
- **FR-012**: O sistema DEVE respeitar a visibilidade da biblioteca definida nas configurações de privacidade do usuário (Constituição §4.4), isolando as bibliotecas privadas de acessos não autorizados.

---

### Key Entities

- **Game (Jogo)**: Representa o título no catálogo. Atributos: identificador único interno, identificador de referência no catálogo externo (IGDB), título, slug amigável, URL da imagem de capa, sinopse textual e data/ano de lançamento original.
- **LibraryEntry (Entrada na Biblioteca)**: Representa o vínculo exclusivo entre um usuário e um jogo. Atributos: identificador único, referência ao usuário proprietário, referência ao jogo, status atual (`want_to_play`, `playing`, `completed`), data de inclusão e data de última atualização.
- **Profile (Perfil do Usuário - existente)**: Relacionado às entradas da biblioteca para determinação de propriedade e conformidade com as regras de privacidade pública/privada (`is_library_public`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue realizar uma pesquisa no catálogo e visualizar os primeiros resultados em menos de 2 segundos sob condições normais de rede.
- **SC-002**: A adição de um jogo à biblioteca pessoal ou a alteração de status é concluída com atualização visual de feedback em menos de 1 segundo.
- **SC-003**: 100% das tentativas de inclusão duplicada do mesmo jogo pelo mesmo usuário são impedidas sem corrupção de estado.
- **SC-004**: A listagem da biblioteca pessoal carrega e renderiza o acervo do usuário com capas formatadas de forma fluida e sem quebra visual em telas mobile, tablet e desktop.
- **SC-005**: 0 credenciais, chaves ou tokens de comunicação com a API de catálogo externa vazam para o código ou tráfego do cliente no navegador.

---

## Assumptions

- **Fonte de catálogo externo**: O catálogo externo adotado é a API IGDB da Twitch, cujas credenciais de aplicação (`TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET`) serão configuradas via variáveis de ambiente protegidas no servidor.
- **Armazenamento sob demanda de jogos**: Para manter a simplicidade arquitetural e evitar sincronizações em massa desnecessárias, apenas os jogos que os usuários adicionarem às bibliotecas (ou acessarem detalhes) serão persistidos na tabela `games` do banco de dados local.
- **Reaproveitamento de sessão**: A verificação de usuário autenticado utiliza a infraestrutura de autenticação via Supabase Auth já validada na Feature 001.
- **Privacidade por padrão**: As bibliotecas são criadas privadas por padrão, tornando-se visíveis publicamente apenas se o usuário tiver marcado `is_library_public = true` nas configurações de perfil.

