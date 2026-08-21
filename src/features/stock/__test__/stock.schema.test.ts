import { describe, it, expect } from "vitest";
import {
  CreateStockSchema,
  UpdateStockSchema,
  FetchStockSchema,
} from "../schemas/stock.schema";

describe("stock.schema", () => {
  describe("CreateStockSchema", () => {
    it("should validate a valid input", () => {
      const valid = { quantity: 10, costPrice: 5, sellingPrice: 10, productId: "p1" };
      expect(CreateStockSchema.parse(valid)).toEqual({
        ...valid,
        withVat: true,
      });
    });

    it("should reject negative quantity", () => {
      const result = CreateStockSchema.safeParse({ quantity: -1, costPrice: 5, sellingPrice: 10, productId: "p1" });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateStockSchema", () => {
    it("should validate partial input", () => {
      expect(UpdateStockSchema.parse({ quantity: 5 })).toEqual({ quantity: 5 });
    });
  });

  describe("FetchStockSchema", () => {
    it("should provide default pagination", () => {
      expect(FetchStockSchema.parse({})).toEqual({
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
      });
    });
  });
});
