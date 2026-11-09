import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { updateProfileSchema } from "../../schemas/profile";

describe("Security & Database Integrity Audit Tests (SEC-001, SEC-002, SEC-003)", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261107000000_create_profiles.sql"
  );
  const migrationContent = fs.readFileSync(migrationPath, "utf-8");

  it("SEC-001: Função handle_new_user deve conter SECURITY DEFINER e search_path fixado", () => {
    assert.ok(
      migrationContent.includes("SECURITY DEFINER"),
      "handle_new_user deve ser SECURITY DEFINER"
    );
    assert.ok(
      migrationContent.includes("SET search_path = public, pg_temp"),
      "handle_new_user deve fixar search_path para public, pg_temp"
    );
    assert.ok(
      migrationContent.includes("REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC"),
      "handle_new_user deve revogar execução pública"
    );
  });

  it("SEC-002: Deve conter índice único case-insensitive LOWER(username)", () => {
    assert.ok(
      migrationContent.includes("CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower"),
      "Deve criar idx_profiles_username_lower"
    );
    assert.ok(
      migrationContent.includes("LOWER(username)"),
      "Índice deve usar LOWER(username)"
    );
  });

  it("SEC-003: Deve conter trigger protect_username_immutability impedindo update de username", () => {
    assert.ok(
      migrationContent.includes("protect_username_immutability"),
      "Deve declarar função protect_username_immutability"
    );
    assert.ok(
      migrationContent.includes("NEW.username <> OLD.username"),
      "Trigger deve verificar discrepância de username"
    );
    assert.ok(
      migrationContent.includes("BEFORE UPDATE ON public.profiles"),
      "Trigger deve ser BEFORE UPDATE"
    );
  });

  it("SEC-003: Esquema Zod updateProfileSchema deve omitir o campo username", () => {
    const parsed = updateProfileSchema.safeParse({
      display_name: "Novo Nome",
      username: "hacked_username",
    });

    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal("username" in parsed.data, false, "username não pode estar no payload de update");
    }
  });

  it("Constituição §4.4: Flags de visibilidade devem ter default false (Privado)", () => {
    assert.ok(
      migrationContent.includes("is_profile_public BOOLEAN NOT NULL DEFAULT false"),
      "is_profile_public deve ter DEFAULT false"
    );
    assert.ok(
      migrationContent.includes("is_library_public BOOLEAN NOT NULL DEFAULT false"),
      "is_library_public deve ter DEFAULT false"
    );
  });

  it("Constituição §6: Row Level Security (RLS) deve estar habilitado", () => {
    assert.ok(
      migrationContent.includes("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;"),
      "RLS deve ser habilitado na tabela profiles"
    );
  });
});

