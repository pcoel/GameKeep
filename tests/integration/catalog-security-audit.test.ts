import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Catalog & Library Security and Integrity Audit (Feature 002)", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261108000000_create_games_and_library.sql"
  );

  it("O arquivo de migração da Feature 002 deve existir", () => {
    assert.equal(
      fs.existsSync(migrationPath),
      true,
      "Arquivo 20261108000000_create_games_and_library.sql não encontrado."
    );
  });

  it("A tabela library_entries deve conter a constraint UNIQUE (user_id, game_id) contra duplicidade (§4.2)", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /uq_library_user_game\s+UNIQUE\s*\(\s*user_id\s*,\s*game_id\s*\)/i,
      "Constraint uq_library_user_game UNIQUE não encontrada no SQL."
    );
  });

  it("A tabela library_entries deve conter a constraint CHECK de status estrita (§4.2)", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /chk_library_status\s+CHECK\s*\(\s*status\s+IN\s*\(\s*'want_to_play'\s*,\s*'playing'\s*,\s*'completed'\s*\)\s*\)/i,
      "Constraint chk_library_status CHECK com os 3 status não encontrada no SQL."
    );
  });

  it("Row Level Security (RLS) deve estar habilitado para games e library_entries", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /ALTER\s+TABLE\s+public\.games\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
      "RLS não habilitado para games."
    );
    assert.match(
      sql,
      /ALTER\s+TABLE\s+public\.library_entries\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
      "RLS não habilitado para library_entries."
    );
  });

  it("Políticas RLS de library_entries devem condicionar leitura de terceiros a is_library_public = true (§4.4)", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.ok(
      sql.includes("auth.uid() = user_id"),
      "Política deve permitir que o proprietário acesse seus próprios jogos"
    );
    assert.ok(
      sql.includes("profiles.is_library_public = true"),
      "Política deve exigir is_library_public = true para acesso de terceiros"
    );
  });

  it("Operações de mutação (INSERT, UPDATE, DELETE) em library_entries devem ser restritas ao dono", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    assert.match(
      sql,
      /CREATE\s+POLICY\s+"Usuário só pode adicionar jogos à própria biblioteca"/i,
      "Política de inserção restrita não encontrada."
    );
    assert.match(
      sql,
      /CREATE\s+POLICY\s+"Usuário só pode alterar entradas da própria biblioteca"/i,
      "Política de alteração restrita não encontrada."
    );
    assert.match(
      sql,
      /CREATE\s+POLICY\s+"Usuário só pode remover jogos da própria biblioteca"/i,
      "Política de remoção restrita não encontrada."
    );
  });

  it("Credenciais da Twitch/IGDB NUNCA devem ter prefixo NEXT_PUBLIC_ (§4.5)", () => {
    const envExample = fs.readFileSync(path.resolve(process.cwd(), ".env.example"), "utf-8");
    assert.ok(
      !envExample.includes("NEXT_PUBLIC_TWITCH"),
      "Variável TWITCH não pode conter NEXT_PUBLIC_ em .env.example"
    );
    assert.ok(
      envExample.includes("TWITCH_CLIENT_ID="),
      "TWITCH_CLIENT_ID deve estar documentado em .env.example"
    );
    assert.ok(
      envExample.includes("TWITCH_CLIENT_SECRET="),
      "TWITCH_CLIENT_SECRET deve estar documentado em .env.example"
    );
  });
});

