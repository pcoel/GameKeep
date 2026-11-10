# Quickstart Validation Guide: 003 — Progressive Game Reviews & Ratings

**Feature**: Feature 003 — Progressive Game Reviews & Ratings  
**Date**: 10/11/2026

---

## Cenários de Validação Ponta a Ponta

### Cenário 1: Avaliação Progressiva em 5 Tempos
1. Acessar `/catalog` e clicar em um jogo (ex: The Witcher 3).
2. Na página do jogo `/catalog/[id]`, localizar a seção "Avaliar este Jogo".
3. Preencher notas com decimais arbitrários para os 5 Tempos:
   - Tempo 1: 8.5
   - Tempo 2: 9.0
   - Tempo 3: 7.25
   - Tempo 4: 8.0
   - Tempo 5: 9.5
4. Deixar o texto opcional em branco e submeter.
5. **Resultado esperado:** A avaliação é salva, a média geral individual (8.5) é calculada e a nota aparece na seção de reviews do jogo.

### Cenário 2: Adição e Edição de Review Textual
1. Na mesma página do jogo, clicar em "Editar minha avaliação".
2. Adicionar uma análise dissertativa de até 2.500 caracteres no campo de texto.
3. Ajustar a nota do Tempo 3 de 7.25 para 8.0.
4. Salvar as alterações.
5. **Resultado esperado:** As notas e o texto são atualizados sem duplicação de registro no banco.

### Cenário 3: Avaliação Privada vs Média Pública
1. Criar uma avaliação marcando a opção "Avaliação Privada".
2. Em uma aba anônima, acessar a página do mesmo jogo.
3. **Resultado esperado:** A avaliação privada não aparece na listagem pública e suas notas não são somadas na média geral da comunidade.

### Cenário 4: Indicação de Jogo Avaliado na Biblioteca
1. Adicionar o jogo avaliado à biblioteca pessoal com status "Concluído".
2. Acessar a rota `/library`.
3. **Resultado esperado:** O cartão do jogo exibe um selo com a nota atribuída pelo usuário e link para a review.

### Cenário 5: Histórico de Avaliações no Perfil
1. Acessar `/profile`.
2. Navegar até a seção "Minhas Avaliações".
3. **Resultado esperado:** Todos os jogos avaliados pelo usuário são listados com suas respectivas notas dos 5 Tempos e texto da análise.

### Cenário 6: Exclusão e Recálculo da Média
1. Na página do jogo avaliado, clicar em "Excluir avaliação" e confirmar no diálogo.
2. **Resultado esperado:** A review é removida do banco, o botão de avaliar volta ao estado inicial e a média pública do jogo é recalculada imediatamente.

