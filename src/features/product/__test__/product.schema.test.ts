import { describe, it, expect } from "vitest";
import {
  CreateProductSchema,
  UpdateProductSchema,
  FetchProductsSchema,
} from "../schemas/product.schema";

describe("product.schema", () => {
  describe("CreateProductSchema", () => {
    it("should validate a valid input", () => {
      const valid = { name: "Product A", sku: "SKU123", categoryId: "cat1" };
      expect(CreateProductSchema.parse(valid)).toEqual({
        ...valid,
        warrantyDays: 0,
        withVat: true,
      });
    });

    it("should reject missing required fields", () => {
      const result = CreateProductSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject short sku", () => {
      const result = CreateProductSchema.safeParse({ name: "A", sku: "12", categoryId: "c1" });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateProductSchema", () => {
    it("should validate empty object (all optional)", () => {
      expect(UpdateProductSchema.parse({})).toEqual({});
    });

    it("should reject invalid sku", () => {
      const result = UpdateProductSchema.safeParse({ sku: "12" });
      expect(result.success).toBe(false);
    });
  });

  describe("FetchProductsSchema", () => {
    it("should set default values", () => {
      expect(FetchProductsSchema.parse({})).toEqual({
        page: 1,
        limit: 10,
        order: "desc",
        sort: "createdAt",
      });
    });

    it("should reject invalid limit", () => {
      const result = FetchProductsSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });
});
