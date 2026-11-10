# Feature Specification: 003 — Progressive Game Reviews & Ratings

**Feature Branch**: `003-game-reviews-ratings`  
**Created**: 10/11/2026  
**Status**: Aprovada para Planejamento  
**Input**: Especificação formal do sistema de avaliações progressivas em 5 Tempos, texto complementar e integração com catálogo, biblioteca e perfil de usuário.

---

## 1. Visão Geral e Conceito Fundamental

O **Sistema de Avaliações e Reviews** do GameKeep é a terceira funcionalidade central da plataforma, complementando a Autenticação (Feature 001) e o Catálogo com Biblioteca Pessoal (Feature 002).

Diferente de sistemas tradicionais baseados em categorias técnicas (gráficos, som, etc.), o GameKeep adota uma abordagem autoral e progressiva baseada na **jornada do jogador**:

### O Sistema dos 5 Tempos de Gameplay
Cada avaliação é composta por **cinco etapas progressivas da experiência de gameplay**:
- **Tempo 1**: Início da jornada / primeira parte da experiência.
- **Tempo 2**: Segunda etapa da progressão.
- **Tempo 3**: Ponto médio / desenvolvimento da campanha.
- **Tempo 4**: Reta final / quarta etapa.
- **Tempo 5**: Conclusão e desfecho da experiência total.

**Regras da Divisão Subjetiva:**
- Cada etapa representa aproximadamente uma fração (1/5) da experiência total do jogo, dividida **subjetivamente pelo próprio jogador**.
- **Não** são exigidos números fixos de horas, capítulos, fases ou divisões exatas (ex: em um jogo de 20 fases, o jogador pode considerar 4 fases por Tempo; em um jogo livre, divide mentalmente por suas etapas de campanha).
- Cada Tempo recebe uma nota numérica independente de **0.0 a 10.0**, aceitando números decimais arbitrários.
- A **média geral** é calculada automaticamente como a média aritmética simples das cinco notas.

---

## 2. Histórias de Usuário e Cenários de Aceitação

### User Story 1 — Avaliação Progressiva em 5 Tempos com Média Automática (Prioridade: P1)

Como jogador autenticado, quero avaliar um jogo atribuindo notas de 0 a 10 (com decimais livres) para cada um dos cinco Tempos progressivos da minha experiência de gameplay, para que o sistema calcule automaticamente a minha nota final para o título.

**Por que esta prioridade**: É o núcleo funcional da avaliação no GameKeep. Sem a atribuição dos cinco Tempos e o cálculo da média, nenhuma review pode existir.

**Teste Independente**: Um usuário autenticado abre a página de um jogo, preenche notas decimais válidas (ex: Tempo 1: 8.5, Tempo 2: 9.0, Tempo 3: 7.25, Tempo 4: 6.0, Tempo 5: 9.5), submete a avaliação e verifica se a média (8.05 → exibida como 8.1 ou 8.0) é calculada e persistida corretamente.

**Cenários de Aceitação**:
1. **Dado** que o usuário está autenticado na página de um jogo e ainda não o avaliou,  
   **Quando** atribui notas entre 0.0 e 10.0 para cada um dos cinco Tempos obrigatórios (Tempo 1 a Tempo 5),  
   **Então** o sistema calcula a média aritmética exata `(T1 + T2 + T3 + T4 + T5) / 5` e exibe o resultado formatado com 1 casa decimal.
2. **Dado** que o usuário está no formulário de avaliação,  
   **Quando** tenta submeter qualquer nota menor que 0.0, maior que 10.0 ou deixa algum dos 5 Tempos sem preenchimento,  
   **Então** o sistema bloqueia o envio e destaca exatamente quais campos violam o intervalo permitido.
3. **Dado** que o usuário já avaliou determinado jogo,  
   **Quando** acessa a página do jogo ou tenta criar uma nova avaliação,  
   **Então** o sistema impede a duplicação, oferecendo a opção de editar a avaliação existente.

---

### User Story 2 — Registro, Edição e Exclusão de Review Textual (Prioridade: P2)

Como jogador, quero ter a opção de redigir um texto dissertativo detalhando minha opinião sobre o jogo (até 2.500 caracteres), com total liberdade para atualizar ou excluir minha análise a qualquer momento.

**Por que esta prioridade**: Permite enriquecer a nota numérica com argumentos qualitativos, mantendo o controle total do autor sobre seu conteúdo.

**Teste Independente**: O usuário adiciona um texto de review junto à sua nota, salva, edita o texto posteriormente e verifica que tanto a nota quanto o texto foram atualizados sem duplicar registros; em seguida, exclui a review e confirma que a média do jogo é recalculada.

**Cenários de Aceitação**:
1. **Dado** que o usuário está preenchendo sua avaliação,  
   **Quando** opta por deixar o campo de texto vazio e submete as cinco notas,  
   **Então** a avaliação é salva com sucesso contendo apenas os dados numéricos.
2. **Dado** que o usuário redige um texto de até 2.500 caracteres,  
   **Quando** submete a avaliação,  
   **Então** o texto é exibido junto com suas notas, média calculada e identificação do autor.
3. **Dado** que o usuário tenta ultrapassar 2.500 caracteres,  
   **Quando** digita ou cola conteúdo excessivo,  
   **Então** o sistema sinaliza visualmente a ultrapassagem e bloqueia o salvamento até o ajuste.
4. **Dado** que o autor de uma avaliação deseja excluí-la,  
   **Quando** aciona a ação de remoção e confirma a operação,  
   **Então** a avaliação (notas e texto) é removida definitivamente e a média geral do jogo é recalculada imediatamente.

---

### User Story 3 — Visualização Coletiva no Catálogo e Detalhes do Jogo (Prioridade: P1)

Como visitante ou jogador, quero consultar a página de detalhes de um jogo para visualizar a nota média da comunidade, as médias de cada um dos cinco Tempos e as análises públicas escritas pelos usuários.

**Por que esta prioridade**: Permite que a comunidade consulte a evolução da recepção do jogo ao longo de sua duração (ex: se o início foi fraco mas o final foi excelente).

**Teste Independente**: Acessar a página de um jogo com avaliações públicas e verificar a exibição da média geral, da contagem de reviews, do painel com as médias de cada um dos cinco Tempos (Tempo 1 a Tempo 5) e da lista de reviews públicas com dados dos autores.

**Cenários de Aceitação**:
1. **Dado** que um jogo possui avaliações públicas cadastradas,  
   **Quando** qualquer usuário (autenticado ou anônimo) visita a página do jogo,  
   **Então** o sistema exibe a média geral consolidada, o total de avaliações, a média específica de cada um dos 5 Tempos e a listagem cronológica das reviews públicas.
2. **Dado** que um jogo não possui avaliações registradas,  
   **Quando** a página do jogo é acessada,  
   **Então** o sistema exibe um estado informativo convidativo ("Nenhuma avaliação registrada ainda. Seja o primeiro a avaliar!") sem quebras de layout.
3. **Dado** que um usuário não autenticado tenta avaliar um jogo,  
   **Quando** clica no botão de avaliação,  
   **Então** o sistema redireciona o usuário para o fluxo de login/cadastro, preservando o redirecionamento de retorno para o jogo.

---

### User Story 4 — Integração com Biblioteca Pessoal e Perfil de Usuário (Prioridade: P3)

Como jogador cadastrado, quero identificar rapidamente na minha biblioteca pessoal quais jogos já avaliei e poder consultar meu histórico de reviews no meu perfil, respeitando as preferências de privacidade.

**Por que esta prioridade**: Conecta o sistema de avaliações à biblioteca e ao perfil do usuário, incentivando o uso contínuo da plataforma como diário pessoal.

**Teste Independente**: Avaliar um jogo da própria biblioteca, acessar `/library` e confirmar a presença da nota no cartão; depois acessar `/profile` e confirmar a listagem da review com respeito à privacidade pública/privada.

**Cenários de Aceitação**:
1. **Dado** que o usuário possui jogos na biblioteca pessoal (`/library`),  
   **Quando** visualiza seus cartões na prateleira,  
   **Então** os jogos que já foram avaliados exibem uma insígnia/badge com a nota média atribuída pelo usuário e um link rápido para a review.
2. **Dado** que o usuário acessa seu próprio perfil (`/profile`),  
   **Quando** visualiza a aba ou seção de avaliações,  
   **Então** encontra todas as suas avaliações realizadas, incluindo as notas dos 5 Tempos, média e texto.
3. **Dado** que outro usuário visualiza um perfil público (`is_profile_public = true`),  
   **Quando** acessa as avaliações deste usuário,  
   **Então** apenas as avaliações com visibilidade pública são exibidas. Se a avaliação individual for marcada como "Privada", ela permanece visível exclusivamente para o seu autor.

---

## 3. Casos de Borda (Edge Cases)

- **Notas Decimais Arbitrárias:** Aceitar números como 8.7, 9.3, 5.5 e 7.25. Persistir com precisão decimal adequada no banco e exibir a média arredondada para uma casa decimal (ex: 8.1).
- **Valores Extremos (0.0 e 10.0):** Devem ser aceitos normalmente. Valores inferiores a 0 ou superiores a 10 devem ser estritamente bloqueados tanto no frontend (Zod) quanto no banco (CHECK constraint).
- **Jogo do Catálogo Ainda Não Salvo Localmente:** Se o usuário tentar avaliar um jogo retornado pela busca IGDB que ainda não existe na tabela `games`, o sistema deve persistir os dados essenciais do jogo sob demanda antes de gravar a avaliação (mesmo padrão utilizado na biblioteca da Feature 002).
- **Exclusão da Conta do Usuário:** A exclusão em cascata (`ON DELETE CASCADE`) remove as avaliações do usuário e atualiza as médias dos jogos correspondentes.
- **Tentativa de Avaliação Concorrente:** A constraint de unicidade `(user_id, game_id)` no banco de dados garante que nenhuma colisão de requisições gere duplicidades.

---

## 4. Requisitos Funcionais

- **FR-001**: O sistema DEVE estruturar cada avaliação em exatamente cinco etapas progressivas da experiência de gameplay: **Tempo 1, Tempo 2, Tempo 3, Tempo 4 e Tempo 5**.
- **FR-002**: Cada Tempo DEVE receber obrigatoriamente uma nota numérica decimal entre 0.0 e 10.0 inclusive, sem intervalos ou passos fixos.
- **FR-003**: O sistema NÃO DEVE exigir que o usuário informe quantidade de horas, capítulos, fases ou divisões rígidas para os Tempos.
- **FR-004**: O sistema DEVE calcular automaticamente a média geral da avaliação como a média aritmética simples das notas dos cinco Tempos: `(tempo_1 + tempo_2 + tempo_3 + tempo_4 + tempo_5) / 5`.
- **FR-005**: A nota média individual e a nota média coletiva DEVEM ser apresentadas na interface formatadas com exatamente uma casa decimal.
- **FR-006**: O sistema DEVE permitir a inclusão de um texto dissertativo opcional de até 2.500 caracteres como review complementar.
- **FR-007**: A avaliação numérica DEVE ser considerada válida e completa mesmo quando o texto complementar for omitido.
- **FR-008**: Cada usuário DEVE poder possuir no máximo UMA avaliação por jogo, garantido por restrição de unicidade no banco de dados.
- **FR-009**: O usuário autor DEVE poder editar as notas dos cinco Tempos, o texto e a visibilidade de sua avaliação a qualquer momento.
- **FR-010**: O usuário autor DEVE poder excluir sua avaliação a qualquer momento, exigindo confirmação prévia.
- **FR-011**: O sistema DEVE impedir que qualquer usuário edite ou exclua avaliações pertencentes a outros usuários.
- **FR-012**: A criação, alteração ou exclusão de uma avaliação DEVE atualizar de forma consistente a média geral, as médias dos cinco Tempos e a contagem de avaliações do jogo.
- **FR-013**: As avaliações DEVEM ser públicas por padrão, permitindo que o autor marque a opção "Avaliação Privada" caso deseje usá-la exclusivamente como diário pessoal.
- **FR-014**: Usuários não autenticados NÃO DEVEM poder criar, editar ou excluir avaliações, sendo permitida apenas a leitura pública.
- **FR-015**: A página de detalhes do jogo DEVE exibir a média geral da comunidade, a quantidade de avaliações, as médias individuais dos cinco Tempos e a lista de reviews públicas com identificação do autor.
- **FR-016**: Os cartões de jogos na biblioteca pessoal DEVEM exibir um indicador visual quando o usuário já tiver avaliado o título.
- **FR-017**: A exibição de avaliações no perfil do usuário DEVE respeitar a visibilidade do perfil e a visibilidade individual de cada review.

---

## 5. Entidades de Dados (Visão Conceitual)

### Entidade: Avaliação / Review (`reviews`)
- **id**: Identificador único (UUID).
- **user_id**: Chave estrangeira para o usuário autor (`auth.users`).
- **game_id**: Chave estrangeira para o jogo (`public.games`).
- **rating_tempo_1**: Nota decimal (0.0 a 10.0) da primeira etapa.
- **rating_tempo_2**: Nota decimal (0.0 a 10.0) da segunda etapa.
- **rating_tempo_3**: Nota decimal (0.0 a 10.0) da terceira etapa.
- **rating_tempo_4**: Nota decimal (0.0 a 10.0) da quarta etapa.
- **rating_tempo_5**: Nota decimal (0.0 a 10.0) da quinta etapa.
- **overall_rating**: Média aritmética calculada das cinco notas.
- **content**: Texto dissertativo da review (opcional, até 2.500 caracteres).
- **is_public**: Booleano indicando se a avaliação é pública (padrão: `true`).
- **created_at / updated_at**: Timestamps de auditoria.

### Relação com Outras Entidades:
- `profiles` 1:N `reviews` (um perfil possui várias avaliações).
- `games` 1:N `reviews` (um jogo possui várias avaliações de diferentes usuários).
- Restrição: `UNIQUE (user_id, game_id)`.

---

## 6. Critérios de Sucesso

- **SC-001**: 100% das avaliações cadastradas contêm as cinco notas de Tempo no intervalo de 0.0 a 10.0 e a média calculada com precisão.
- **SC-002**: Zero duplicidades de avaliação por usuário para o mesmo jogo garantidas pelo banco de dados.
- **SC-003**: Recálculo imediato das médias da comunidade após inclusão, edição ou exclusão de avaliação.
- **SC-004**: 100% das avaliações marcadas como privadas permanecem inacessíveis para terceiros em qualquer consulta pública ou na página do jogo.
- **SC-005**: Usuários conseguem avaliar os 5 Tempos e registrar sua nota em menos de 30 segundos com interface intuitiva no tema escuro.

---

## 7. Premissas e Limites de Escopo

### Premissas
- O salvamento de jogos sob demanda na tabela `games` funciona exatamente como na Feature 002, garantindo que o catálogo local cresça conforme os usuários interagem com novos títulos.
- As notas dos cinco Tempos são representadas visualmente de forma clara na interface, permitindo acompanhar o ritmo da experiência (progressão).

### Fora de Escopo
- Fóruns, tópicos ou comentários aninhados em reviews.
- Curtidas, reações, upvotes ou sistema de denúncia.
- Sistema de seguidores ou feed social de atividades.
- Gamificação, pontuação ou badges por quantidade de reviews escritas.
- Importação automática de avaliações de sites externos (Metacritic, Steam, etc.).
