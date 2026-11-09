import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Static Security Audit (T046 - Vedação de Chaves service_role no Frontend)", () => {
  const scannedDirs = ["app", "components", "lib", "schemas", "types"];

  function getFilesRecursively(dir: string): string[] {
    const fullDir = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) return [];

    let results: string[] = [];
    const list = fs.readdirSync(fullDir);

    for (const file of list) {
      const fullPath = path.join(fullDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getFilesRecursively(path.relative(process.cwd(), fullPath)));
      } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js")) {
        results.push(fullPath);
      }
    }

    return results;
  }

  it("Nenhum arquivo client-side ou público deve referenciar SUPABASE_SERVICE_ROLE_KEY ou chaves administrativas", () => {
    const files = scannedDirs.flatMap((dir) => getFilesRecursively(dir));
    assert.ok(files.length > 0, "Deve haver arquivos para analisar");

    const forbiddenPatterns = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "service_role",
      "NEXT_PUBLIC_SERVICE_ROLE",
      "secret_key",
    ];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");

      for (const pattern of forbiddenPatterns) {
        if (content.includes(pattern)) {
          // Permite apenas comentários de aviso que alertam para NUNCA usar
          const lines = content.split("\n");
          for (const line of lines) {
            if (line.includes(pattern)) {
              assert.ok(
                line.includes("//") || line.includes("*") || line.includes("bloqueio explícito"),
                `Chave ou padrão proibido '${pattern}' encontrado na linha executável em ${file}: ${line}`
              );
            }
          }
        }
      }
    }
  });
});

