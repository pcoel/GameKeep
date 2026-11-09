import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  libraryStatusSchema,
  searchGameSchema,
  addGameToLibrarySchema,
  updateLibraryStatusSchema,
  removeGameFromLibrarySchema,
} from "../../schemas/catalog";

describe("catalogSchema Validation Tests (Feature 002)", () => {
  describe("libraryStatusSchema (Constituição §4.2)", () => {
    it("deve aceitar os três status constitucionais", () => {
      assert.equal(libraryStatusSchema.safeParse("want_to_play").success, true);
      assert.equal(libraryStatusSchema.safeParse("playing").success, true);
      assert.equal(libraryStatusSchema.safeParse("completed").success, true);
    });

    it("deve rejeitar qualquer status fora dos três permitidos", () => {
      assert.equal(libraryStatusSchema.safeParse("dropped").success, false);
      assert.equal(libraryStatusSchema.safeParse("paused").success, false);
      assert.equal(libraryStatusSchema.safeParse("wishlist").success, false);
      assert.equal(libraryStatusSchema.safeParse("").success, false);
    });
  });

  describe("searchGameSchema (T007)", () => {
    it("deve aceitar termos de busca válidos e aplicar trim", () => {
      const res = searchGameSchema.safeParse({ query: "  The Witcher  " });
      assert.equal(res.success, true);
      if (res.success) {
        assert.equal(res.data.query, "The Witcher");
      }
    });

    it("deve rejeitar buscas com menos de 2 caracteres", () => {
      assert.equal(searchGameSchema.safeParse({ query: "a" }).success, false);
      assert.equal(searchGameSchema.safeParse({ query: "  a  " }).success, false);
      assert.equal(searchGameSchema.safeParse({ query: "" }).success, false);
    });

    it("deve rejeitar buscas com mais de 100 caracteres", () => {
      const longQuery = "a".repeat(101);
      assert.equal(searchGameSchema.safeParse({ query: longQuery }).success, false);
    });
  });

  describe("addGameToLibrarySchema (T010)", () => {
    it("deve aceitar entrada válida para adicionar jogo", () => {
      const valid = {
        igdb_id: 1024,
        name: "Elden Ring",
        slug: "elden-ring",
        cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
        summary: "Um grande RPG de ação em mundo aberto.",
        first_release_date: "2022-02-25T00:00:00.000Z",
        status: "want_to_play",
      };

      const res = addGameToLibrarySchema.safeParse(valid);
      assert.equal(res.success, true);
    });

    it("deve rejeitar igdb_id negativo, zero ou não-inteiro", () => {
      assert.equal(
        addGameToLibrarySchema.safeParse({
          igdb_id: -1,
          name: "Game",
          status: "playing",
        }).success,
        false
      );

      assert.equal(
        addGameToLibrarySchema.safeParse({
          igdb_id: 0,
          name: "Game",
          status: "playing",
        }).success,
        false
      );

      assert.equal(
        addGameToLibrarySchema.safeParse({
          igdb_id: 12.34,
          name: "Game",
          status: "playing",
        }).success,
        false
      );
    });

    it("deve rejeitar nome em branco ou ausente", () => {
      assert.equal(
        addGameToLibrarySchema.safeParse({
          igdb_id: 100,
          name: "   ",
          status: "completed",
        }).success,
        false
      );
    });

    it("deve rejeitar cover_url com formato inválido de URL", () => {
      assert.equal(
        addGameToLibrarySchema.safeParse({
          igdb_id: 100,
          name: "Game",
          cover_url: "not-a-valid-url",
          status: "want_to_play",
        }).success,
        false
      );
    });

    it("deve rejeitar status inválido", () => {
      assert.equal(
        addGameToLibrarySchema.safeParse({
          igdb_id: 100,
          name: "Game",
          status: "invalid_status",
        }).success,
        false
      );
    });
  });

  describe("updateLibraryStatusSchema (T010)", () => {
    it("deve aceitar UUID e status válidos", () => {
      const res = updateLibraryStatusSchema.safeParse({
        entry_id: "550e8400-e29b-41d4-a716-446655440000",
        status: "completed",
      });
      assert.equal(res.success, true);
    });

    it("deve rejeitar UUID inválido", () => {
      assert.equal(
        updateLibraryStatusSchema.safeParse({
          entry_id: "not-a-uuid",
          status: "completed",
        }).success,
        false
      );
    });

    it("deve rejeitar status inválido", () => {
      assert.equal(
        updateLibraryStatusSchema.safeParse({
          entry_id: "550e8400-e29b-41d4-a716-446655440000",
          status: "archived",
        }).success,
        false
      );
    });
  });

  describe("removeGameFromLibrarySchema (T010)", () => {
    it("deve aceitar UUID válido", () => {
      const res = removeGameFromLibrarySchema.safeParse({
        entry_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      assert.equal(res.success, true);
    });

    it("deve rejeitar UUID inválido", () => {
      assert.equal(
        removeGameFromLibrarySchema.safeParse({
          entry_id: "12345",
        }).success,
        false
      );
    });
  });
});

