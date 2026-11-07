<!--
SYNC IMPACT REPORT
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- Ratification Date: 2026-11-07
- Last Amended Date: 2026-11-07
- Principles defined:
  1. Desenvolvimento orientado a especificações (SDD)
  2. Arquitetura cliente-servidor
  3. Modularidade e separação de responsabilidades
  4. Simplicidade e manutenção
- Added sections:
  - 1. Objetivo e escopo
  - 2. Princípios fundamentais
  - 3. Tecnologias obrigatórias
  - 4. Regras de negócio
  - 5. Banco de dados e integridade
  - 6. Segurança
  - 7. Interface e experiência do usuário
  - 8. Qualidade e testes
  - 9. Organização do desenvolvimento
  - 10. Critério de evolução
- Removed sections: N/A (substituição dos placeholders do template inicial)
- Follow-up TODOs: Nenhum
-->

# Constituição do Projeto — Game Library & Reviews

**Versão:** 1.0.0  
**Status:** Ratificada como base inicial  
**Data:** 07/11/2026

## 1. Objetivo e escopo

O projeto consiste no desenvolvimento de uma plataforma web de biblioteca pessoal e avaliações de videogames, permitindo que usuários de diferentes localidades criem contas, organizem suas coleções e registrem suas experiências com jogos.

A plataforma terá como referência de experiência e organização o GameSHLF, mas contará com um sistema próprio de avaliações baseado em cinco momentos da experiência do jogador.

O objetivo principal é oferecer uma biblioteca digital personalizada, na qual cada usuário possa organizar seus jogos e construir um histórico de avaliações.

### Escopo do MVP

O produto inicial deverá contemplar:

- Cadastro, autenticação e gerenciamento de sessões.
- Perfis individuais de usuários.
- Pesquisa de jogos através de um catálogo externo.
- Adição e remoção de jogos da biblioteca pessoal.
- Organização dos jogos por três status.
- Sistema de avaliações com cinco pontos.
- Cálculo automático da média.
- Publicação pública ou privada das avaliações.
- Visualização de avaliações públicas de outros usuários.
- Interface web responsiva.

Fóruns, mensagens privadas, seguidores, integração automática com bibliotecas Steam e funcionalidades sociais avançadas estão fora do escopo inicial.

## 2. Princípios fundamentais

### 2.1. Desenvolvimento orientado a especificações (SDD)

O desenvolvimento deverá seguir a metodologia Specification-Driven Development.

Cada funcionalidade relevante deverá possuir especificações, critérios de aceitação e tarefas definidas antes de sua implementação.

As especificações deverão permanecer como referência para implementação, testes e futuras alterações.

### 2.2. Arquitetura cliente-servidor

A aplicação deverá utilizar uma arquitetura web centralizada.

Informações de usuários, bibliotecas e avaliações deverão ser armazenadas em um banco de dados compartilhado, permitindo acesso por diferentes dispositivos e localidades.

O armazenamento local do navegador não deverá ser utilizado como fonte principal dos dados.

### 2.3. Modularidade e separação de responsabilidades

O código deverá ser organizado em módulos com responsabilidades bem definidas.

Interface, regras de negócio, validação, autenticação e acesso ao banco de dados deverão possuir separação lógica.

Novas funcionalidades deverão poder ser adicionadas sem exigir alterações desnecessárias em módulos independentes.

### 2.4. Simplicidade e manutenção

A arquitetura deverá evitar complexidade desnecessária.

Bibliotecas e dependências externas somente deverão ser adicionadas quando apresentarem benefícios claros.

O código deverá ser legível, reutilizável e organizado para facilitar futuras manutenções.

## 3. Tecnologias obrigatórias

A stack tecnológica inicial será:

- **Linguagem:** TypeScript.
- **Framework:** Next.js.
- **Interface:** React.
- **Estilização:** Tailwind CSS.
- **Banco de dados:** PostgreSQL.
- **Infraestrutura de banco e autenticação:** Supabase.
- **Autenticação:** Supabase Auth.
- **Validação:** Zod.
- **Catálogo de jogos:** IGDB API.
- **Hospedagem:** Vercel.
- **Versionamento:** Git e GitHub.
- **Desenvolvimento assistido:** Antigravity e Spec Kit.

Alterações relevantes nessa stack deverão ser justificadas e documentadas antes de sua adoção.

## 4. Regras de negócio

### 4.1. Usuários e autenticação

- Cada usuário deverá possuir uma conta individual.
- A autenticação deverá ser gerenciada pelo Supabase Auth.
- Senhas não deverão ser armazenadas manualmente pela aplicação.
- Cada usuário deverá possuir um perfil associado à sua conta.
- Usuários não autenticados não poderão acessar funcionalidades privadas da biblioteca.
- O sistema deverá permitir encerramento de sessão.

### 4.2. Biblioteca pessoal

Cada usuário poderá adicionar jogos existentes no catálogo à sua própria biblioteca.

Os jogos deverão possuir um dos seguintes status:

1. Quero jogar.
2. Jogando.
3. Concluído.

Regras:

- Um mesmo usuário não poderá adicionar o mesmo jogo duas vezes.
- O usuário poderá alterar o status de seus jogos.
- O usuário poderá remover jogos da própria biblioteca.
- Cada entrada deverá estar associada a um usuário e a um jogo.
- A biblioteca deverá ser independente para cada conta.

### 4.3. Sistema de avaliações

Cada avaliação deverá possuir exatamente cinco pontos numéricos, representando cinco momentos da experiência do jogador.

Cada ponto deverá:

- Possuir um valor entre 0 e 10.
- Aceitar valores decimais sem intervalos predefinidos.
- Ser independente dos demais pontos.
- Ser representado visualmente no gráfico de avaliação.

A média deverá ser calculada automaticamente pela soma dos cinco pontos dividida por cinco.

O resultado deverá ser armazenado ou calculado de maneira consistente, sem depender exclusivamente de valores enviados pelo frontend.

Regras adicionais:

- Cada usuário poderá possuir uma avaliação por jogo.
- O proprietário poderá editar sua avaliação.
- O proprietário poderá excluir sua avaliação.
- Uma avaliação poderá possuir um texto complementar.
- Uma avaliação deverá poder ser pública ou privada.
- Avaliações privadas deverão ser acessíveis somente ao proprietário.
- Avaliações públicas poderão ser visualizadas por outros usuários.
- Avaliações incompletas poderão ser mantidas como rascunhos, mas não deverão ser publicadas.

### 4.4. Privacidade

A privacidade deverá ser considerada desde a concepção do banco de dados.

O sistema deverá distinguir:

- Visibilidade do perfil.
- Visibilidade da biblioteca.
- Visibilidade individual das avaliações.

A publicação de uma avaliação não deverá tornar automaticamente pública toda a biblioteca do usuário.

As configurações de privacidade deverão ser independentes.

Como padrão, informações pessoais e bibliotecas deverão permanecer privadas até que o usuário escolha compartilhá-las.

### 4.5. Catálogo externo

A IGDB será utilizada como fonte inicial de informações sobre jogos.

O sistema deverá:

- Permitir pesquisas por nome.
- Recuperar informações relevantes do catálogo.
- Armazenar localmente os dados necessários dos jogos utilizados.
- Evitar consultas externas desnecessárias.
- Proteger credenciais e tokens de autenticação.
- Realizar requisições externas exclusivamente pelo servidor.

A aplicação não deverá solicitar credenciais pessoais da Steam.

## 5. Banco de dados e integridade

O PostgreSQL deverá ser utilizado como fonte central de persistência.

A estrutura inicial deverá contemplar:

- profiles
- games
- library_entries
- reviews

As relações entre tabelas deverão utilizar chaves estrangeiras e restrições de integridade.

Deverão ser implementadas restrições de unicidade quando necessário, especialmente para impedir entradas duplicadas de jogos e avaliações de um mesmo usuário para o mesmo jogo.

Informações pertencentes a usuários diferentes deverão permanecer devidamente isoladas.

## 6. Segurança

A segurança deverá ser aplicada tanto na interface quanto na camada de persistência.

Requisitos obrigatórios:

- Row Level Security (RLS) nas tabelas expostas.
- Políticas de acesso específicas para cada operação.
- Validação de dados utilizando Zod.
- Proteção de rotas privadas.
- Verificação de propriedade antes de alterações.
- Proteção de credenciais e variáveis de ambiente.
- Proibição de exposição de chaves administrativas no frontend.
- Controle de acesso a avaliações privadas.

Nenhuma restrição de segurança deverá depender exclusivamente de verificações visuais ou condições implementadas no frontend.

## 7. Interface e experiência do usuário

A interface deverá possuir identidade visual relacionada ao universo dos videogames.

Diretrizes:

- Tema escuro como padrão inicial.
- Interface limpa e organizada.
- Capas de jogos como elementos visuais importantes.
- Biblioteca apresentada em formato de coleção.
- Gráfico de avaliações interativo.
- Navegação simples e intuitiva.
- Responsividade para computadores e dispositivos móveis.
- Estados de carregamento, erro e ausência de resultados.

A experiência deverá priorizar a biblioteca e as avaliações, evitando elementos sociais que não façam parte do MVP.

## 8. Qualidade e testes

As funcionalidades deverão possuir critérios de aceitação verificáveis.

Deverão ser testados:

- Cadastro e autenticação.
- Separação de dados entre usuários.
- Adição e remoção de jogos.
- Alteração de status.
- Validação dos cinco pontos.
- Cálculo correto da média.
- Edição e exclusão de avaliações.
- Privacidade de avaliações.
- Visualização pública de conteúdo.
- Comportamento da aplicação em diferentes dispositivos.

A implementação deverá respeitar os requisitos definidos nas especificações.

## 9. Organização do desenvolvimento

O projeto será desenvolvido em módulos independentes, mantendo uma única aplicação e uma única estrutura central de dados.

A sequência inicial será:

**Feature 001 — Authentication & User Profiles**
- Cadastro.
- Login e logout.
- Sessões.
- Perfil.
- Configurações básicas de privacidade.

**Feature 002 — Game Catalog & Personal Library**
- Integração com IGDB.
- Pesquisa de jogos.
- Catálogo local.
- Biblioteca individual.
- Gerenciamento de status.

**Feature 003 — Progressive Game Reviews**
- Sistema de cinco pontos.
- Gráfico interativo.
- Cálculo de médias.
- Texto complementar.
- Publicação pública e privada.
- Exibição de avaliações.

Cada módulo deverá possuir especificação, plano, tarefas e critérios de aceitação próprios.

## 10. Critério de evolução

Novas funcionalidades deverão respeitar os princípios estabelecidos nesta Constituição.

Funcionalidades que ampliem significativamente o escopo deverão ser especificadas separadamente.

O desenvolvimento deverá priorizar a estabilidade, segurança e integridade das funcionalidades existentes antes de adicionar novos recursos.

---

**Version**: 1.0.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-07
