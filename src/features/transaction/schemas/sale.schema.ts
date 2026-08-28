import { z } from "zod";

export const CartItemSchema = z.object({
  stockId: z.string().min(1, "Stock ID is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
});

export const CreateSaleSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart must contain at least one item"),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "CREDIT"]).default("CASH"),
  bankId: z.string().optional().nullable(), // <-- Added
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
