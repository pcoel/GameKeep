import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { registerSchema } from "../../schemas/auth";

describe("registerSchema Validation Tests (US1)", () => {
  it("deve aceitar dados válidos de cadastro", () => {
    const validData = {
      email: "JOGADOR@EXAMPLE.COM",
      password: "Password123",
      username: "Gamer_2026",
    };

    const result = registerSchema.safeParse(validData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "jogador@example.com"); // Normalizado para minúsculas
      assert.equal(result.data.username, "gamer_2026"); // Normalizado para minúsculas
      assert.equal(result.data.password, "Password123");
    }
  });

  it("deve rejeitar e-mail em formato inválido", () => {
    const invalidData = {
      email: "email-invalido",
      password: "Password123",
      username: "gamer_2026",
    };

    const result = registerSchema.safeParse(invalidData);
    assert.equal(result.success, false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      assert.ok(fieldErrors.email);
    }
  });

  it("deve rejeitar senha com menos de 8 caracteres", () => {
    const invalidData = {
      email: "jogador@example.com",
      password: "Pass1",
      username: "gamer_2026",
    };

    const result = registerSchema.safeParse(invalidData);
    assert.equal(result.success, false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      assert.ok(fieldErrors.password);
    }
  });

  it("deve rejeitar senha sem números", () => {
    const invalidData = {
      email: "jogador@example.com",
      password: "PasswordSemNumero",
      username: "gamer_2026",
    };

    const result = registerSchema.safeParse(invalidData);
    assert.equal(result.success, false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      assert.ok(fieldErrors.password);
    }
  });

  it("deve rejeitar username com menos de 3 ou mais de 20 caracteres", () => {
    const tooShort = {
      email: "jogador@example.com",
      password: "Password123",
      username: "ab",
    };
    const tooLong = {
      email: "jogador@example.com",
      password: "Password123",
      username: "nome_de_usuario_com_mais_de_vinte_caracteres",
    };

    assert.equal(registerSchema.safeParse(tooShort).success, false);
    assert.equal(registerSchema.safeParse(tooLong).success, false);
  });

  it("deve rejeitar username com caracteres especiais inválidos", () => {
    const invalidChars = {
      email: "jogador@example.com",
      password: "Password123",
      username: "gamer@gamer!",
    };

    const result = registerSchema.safeParse(invalidChars);
    assert.equal(result.success, false);
  });
});

