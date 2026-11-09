import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { updateProfileSchema, updatePrivacySchema } from "../../schemas/profile";

describe("updateProfileSchema & updatePrivacySchema Validation Tests (US3 & US4)", () => {
  it("deve aceitar dados válidos de perfil com sanitização de bio", () => {
    const validData = {
      display_name: "  Mestre dos Games  ",
      avatar_url: "https://example.com/avatar.png",
      bio: "  Apaixonado por RPGs e jogos de aventura.  ",
    };

    const result = updateProfileSchema.safeParse(validData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.display_name, "Mestre dos Games");
      assert.equal(result.data.bio, "Apaixonado por RPGs e jogos de aventura."); // Sanitizado com trim
      assert.equal(result.data.avatar_url, "https://example.com/avatar.png");
    }
  });

  it("deve rejeitar display_name menor que 2 ou maior que 50 caracteres", () => {
    const tooShort = {
      display_name: "A",
      avatar_url: "",
      bio: "",
    };
    const tooLong = {
      display_name: "A".repeat(51),
      avatar_url: "",
      bio: "",
    };

    assert.equal(updateProfileSchema.safeParse(tooShort).success, false);
    assert.equal(updateProfileSchema.safeParse(tooLong).success, false);
  });

  it("deve rejeitar biografia com mais de 300 caracteres", () => {
    const longBio = {
      display_name: "Jogador",
      avatar_url: "",
      bio: "X".repeat(301),
    };

    const result = updateProfileSchema.safeParse(longBio);
    assert.equal(result.success, false);
  });

  it("deve rejeitar URL de avatar malformada", () => {
    const badUrl = {
      display_name: "Jogador",
      avatar_url: "nao-eh-uma-url",
      bio: "",
    };

    const result = updateProfileSchema.safeParse(badUrl);
    assert.equal(result.success, false);
  });

  it("deve validar preferências de privacidade com booleanos estritos", () => {
    const validPrivacy = {
      is_profile_public: true,
      is_library_public: false,
    };

    const result = updatePrivacySchema.safeParse(validPrivacy);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.is_profile_public, true);
      assert.equal(result.data.is_library_public, false);
    }
  });

  it("deve rejeitar valores não booleanos na privacidade", () => {
    const invalidPrivacy = {
      is_profile_public: "sim",
      is_library_public: 1,
    };

    const result = updatePrivacySchema.safeParse(invalidPrivacy);
    assert.equal(result.success, false);
  });
});

