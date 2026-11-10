import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Review & Ratings Security and Integrity Audit (Feature 003)", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261110000000_create_reviews.sql"
  );

  it("O arquivo de migração da Feature 003 deve existir", () => {
    assert.equal(
      fs.existsSync(migrationPath),
      true,
      "Arquivo 20261110000000_create_reviews.sql não encontrado."
    );
  });

  it("A tabela reviews deve conter a constraint UNIQUE (user_id, game_id) para impedir avaliações duplicadas (§4.3)", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /uq_reviews_user_game\s+UNIQUE\s*\(\s*user_id\s*,\s*game_id\s*\)/i,
      "Constraint uq_reviews_user_game UNIQUE não encontrada no SQL."
    );
  });

  it("A tabela reviews deve validar os limites numéricos de 0.0 a 10.0 para os 5 Tempos e para a média geral", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /chk_review_rating_tempo_1\s+CHECK\s*\(\s*rating_tempo_1\s*>=\s*0\.0\s+AND\s+rating_tempo_1\s*<=\s*10\.0\s*\)/i,
      "Constraint de limite numérico para Tempo 1 não encontrada."
    );
    assert.match(
      sql,
      /chk_review_rating_tempo_5\s+CHECK\s*\(\s*rating_tempo_5\s*>=\s*0\.0\s+AND\s+rating_tempo_5\s*<=\s*10\.0\s*\)/i,
      "Constraint de limite numérico para Tempo 5 não encontrada."
    );
    assert.match(
      sql,
      /chk_review_overall_rating\s+CHECK\s*\(\s*overall_rating\s*>=\s*0\.0\s+AND\s+overall_rating\s*<=\s*10\.0\s*\)/i,
      "Constraint de limite numérico para overall_rating não encontrada."
    );
  });

  it("A tabela reviews deve conter restrição de tamanho máximo de texto de até 2.500 caracteres", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /chk_review_content_length\s+CHECK\s*\(\s*content\s+IS\s+NULL\s+OR\s+char_length\s*\(\s*content\s*\)\s*<=\s*2500\s*\)/i,
      "Constraint chk_review_content_length com limite 2500 não encontrada no SQL."
    );
  });

  it("Row Level Security (RLS) deve estar habilitado para reviews", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /ALTER\s+TABLE\s+public\.reviews\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
      "RLS não habilitado para a tabela reviews."
    );
  });

  it("Políticas RLS devem isolar avaliações privadas impedindo leitura pública (§4.4)", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.ok(
      sql.includes("is_public = true"),
      "Política deve permitir leitura pública de reviews públicas"
    );
    assert.ok(
      sql.includes("auth.uid() = user_id"),
      "Política deve permitir que o proprietário acesse suas próprias avaliações privadas"
    );
  });

  it("Operações de mutação (INSERT, UPDATE, DELETE) em reviews devem ser restritas ao autor", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /CREATE\s+POLICY\s+"Usuários autenticados criam suas próprias avaliações"/i,
      "Política de inserção restrita ao autor não encontrada."
    );
    assert.match(
      sql,
      /CREATE\s+POLICY\s+"Usuários editam apenas suas próprias avaliações"/i,
      "Política de alteração restrita ao autor não encontrada."
    );
    assert.match(
      sql,
      /CREATE\s+POLICY\s+"Usuários excluem apenas suas próprias avaliações"/i,
      "Política de exclusão restrita ao autor não encontrada."
    );
  });
});

