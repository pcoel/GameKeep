import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loginSchema } from "../../schemas/auth";

describe("loginSchema Validation Tests (US2)", () => {
  it("deve aceitar credenciais válidas", () => {
    const validData = {
      email: "USUARIO@EXAMPLE.COM",
      password: "MinhaSenha123",
    };

    const result = loginSchema.safeParse(validData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "usuario@example.com");
      assert.equal(result.data.password, "MinhaSenha123");
    }
  });

  it("deve rejeitar e-mail inválido", () => {
    const invalidData = {
      email: "invalido",
      password: "MinhaSenha123",
    };

    const result = loginSchema.safeParse(invalidData);
    assert.equal(result.success, false);
  });

  it("deve rejeitar senha em branco", () => {
    const emptyPassword = {
      email: "usuario@example.com",
      password: "",
    };

    const result = loginSchema.safeParse(emptyPassword);
    assert.equal(result.success, false);
  });
});

