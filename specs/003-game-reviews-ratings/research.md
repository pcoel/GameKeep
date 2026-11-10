# Technical Research & Decisions: 003 — Progressive Game Reviews & Ratings

**Feature**: Feature 003 — Progressive Game Reviews & Ratings  
**Date**: 10/11/2026  
**Status**: Decisões Técnicas Ratificadas

---

## 1. Modelagem dos 5 Tempos de Gameplay e Cálculo da Média

### Contexto
O GameKeep adota um sistema autoral de avaliação baseado em cinco etapas progressivas da experiência de gameplay (Tempo 1 a Tempo 5). Cada Tempo recebe uma nota de 0 a 10 com valores decimais arbitrários (ex: 8.7, 9.25), e a média deve ser calculada de maneira confiável sem depender de dados manipuláveis pelo cliente.

### Decisão
- Na tabela `public.reviews`, armazenar cada nota como `NUMERIC(4,2)` ou `DECIMAL(4,2)` com restrição `CHECK (rating_tempo_X >= 0.0 AND rating_tempo_X <= 10.0)`. Isso permite notas com até duas casas decimais arbitrárias com precisão aritmética exata.
- A nota geral (`overall_rating`) será armazenada ou calculada como `NUMERIC(4,2)` no banco de dados e sempre validada no servidor através de `(rating_tempo_1 + rating_tempo_2 + rating_tempo_3 + rating_tempo_4 + rating_tempo_5) / 5.0`.
- Na interface, a média é apresentada arredondada para uma casa decimal (ex: `8.1`).

### Alternativas Consideradas
- *Inteiros de 0 a 100:* Rejeitado por complicar a representação decimal direta exigida pela especificação.
- *Cálculo exclusivo no frontend:* Rejeitado pela Constituição (§4.3 e §5), que exige integridade e validação pelo servidor/banco.

---

## 2. Agregação e Média Pública da Comunidade

### Contexto
A página de detalhes do jogo precisa exibir a média geral da comunidade, as médias de cada um dos 5 Tempos e a quantidade de avaliações públicas, recalculadas imediatamente após criação, edição ou exclusão de qualquer avaliação, sem computar avaliações privadas.

### Decisão
- Realizar o cálculo das médias públicas diretamente via consulta agregada SQL no PostgreSQL filtrando estritamente `is_public = true`:
  - `COUNT(*)` para o total de avaliações públicas.
  - `ROUND(AVG(overall_rating), 1)` para a média geral.
  - `ROUND(AVG(rating_tempo_1), 1)` até `ROUND(AVG(rating_tempo_5), 1)` para as médias de cada Tempo.
- As Server Actions de inclusão, alteração e exclusão invalidarão os caminhos (`revalidatePath`) da página do jogo correspondente (`/catalog/[id]`), garantindo recálculo e renderização imediata com consistência total e sem necessidade de tabelas de cache intermediárias desnecessárias.

### Alternativas Consideradas
- *Trigger com tabela agregadora `game_stats`:* Rejeitado pela diretriz de simplicidade. Em um projeto pessoal/acadêmico, agregações via query direta no PostgreSQL do Supabase têm latência inferior a 10ms e garantem consistência sem risco de dessincronização de dados.

---

## 3. Segurança, Privacidade e Row Level Security (RLS)

### Contexto
Avaliações podem ser públicas ou privadas. Avaliações privadas são pessoais (diário de jogos) e **nunca** podem ser expostas para terceiros nem consideradas nas estatísticas públicas. Além disso, cada usuário só pode avaliar cada jogo uma única vez e só pode editar ou excluir sua própria review.

### Decisão
1. **Unicidade Estrita:** Constraint `CONSTRAINT uq_reviews_user_game UNIQUE (user_id, game_id)`.
2. **Políticas de RLS na tabela `public.reviews`:**
   - **SELECT:**
     ```sql
     CREATE POLICY "Leitura de avaliações públicas ou próprias"
       ON public.reviews
       FOR SELECT
       USING (
         is_public = true
         OR
         auth.uid() = user_id
       );
     ```
   - **INSERT:**
     ```sql
     CREATE POLICY "Usuários autenticados criam suas próprias avaliações"
       ON public.reviews
       FOR INSERT
       TO authenticated
       WITH CHECK (auth.uid() = user_id);
     ```
   - **UPDATE:**
     ```sql
     CREATE POLICY "Usuários editam apenas suas próprias avaliações"
       ON public.reviews
       FOR UPDATE
       TO authenticated
       USING (auth.uid() = user_id)
       WITH CHECK (auth.uid() = user_id);
     ```
   - **DELETE:**
     ```sql
     CREATE POLICY "Usuários excluem apenas suas próprias avaliações"
       ON public.reviews
       FOR DELETE
       TO authenticated
       USING (auth.uid() = user_id);
     ```

---

## 4. Integração Visual e Experiência do Usuário (UI/UX)

### Contexto
A visualização dos cinco Tempos deve ser clara e direta, mostrando a progressão temporal da nota ao longo do jogo, integrada com o catálogo, a biblioteca e o perfil.

### Decisão
- Criar o componente `ProgressiveRatingDisplay`: exibição em barras ou timeline progressiva para os 5 Tempos (`T1` a `T5`) com indicador de ritmo e média final destacada.
- Criar o componente `ReviewForm`: formulário intuitivo com sliders ou inputs numéricos para os 5 Tempos, campo de texto com contador até 2.500 caracteres e switch para "Avaliação Privada".
- Atualizar a página de detalhes `/catalog/[id]` para incluir a seção de Reviews e o formulário de avaliação.
- Atualizar os cartões da biblioteca (`/library`) para exibir a nota média pessoal do usuário quando o jogo já tiver sido avaliado.
- Adicionar no `/profile` a seção com a listagem das avaliações do usuário.

