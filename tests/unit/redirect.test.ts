import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeRedirectUrl } from "../../lib/redirect";

describe("sanitizeRedirectUrl Open Redirect Prevention Tests", () => {
  it("deve permitir rotas relativas internas seguras", () => {
    assert.equal(sanitizeRedirectUrl("/profile"), "/profile");
    assert.equal(sanitizeRedirectUrl("/settings/profile"), "/settings/profile");
    assert.equal(sanitizeRedirectUrl("/profile?tab=recent"), "/profile?tab=recent");
  });

  it("deve bloquear URLs absolutas com esquemas externos e reverter para /profile", () => {
    assert.equal(sanitizeRedirectUrl("https://evil.com"), "/profile");
    assert.equal(sanitizeRedirectUrl("http://evil.com"), "/profile");
    assert.equal(sanitizeRedirectUrl("javascript:alert(1)"), "/profile");
  });

  it("deve bloquear ataques schema-relative com barras duplas (//)", () => {
    assert.equal(sanitizeRedirectUrl("//evil.com"), "/profile");
    assert.equal(sanitizeRedirectUrl("//evil.com/path"), "/profile");
  });

  it("deve bloquear tentativas com barra invertida (/\\)", () => {
    assert.equal(sanitizeRedirectUrl("/\\evil.com"), "/profile");
  });

  it("deve lidar com valores nulos ou vazios de forma segura", () => {
    assert.equal(sanitizeRedirectUrl(null), "/profile");
    assert.equal(sanitizeRedirectUrl(undefined), "/profile");
    assert.equal(sanitizeRedirectUrl(""), "/profile");
  });
});

