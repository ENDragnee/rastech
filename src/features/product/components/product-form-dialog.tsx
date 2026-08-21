"use client";

import { useState, useEffect } from "react";
import type { SyntheticEvent } from "react";
import {
  useCreateProduct,
  useUpdateProduct,
  useCheckSku,
  type ProductItem,
} from "@/features/product/hooks/use-products";
import { useCategories } from "@/features/category/hooks/use-categories";
import { useDebounce } from "@/lib/use-debounce";
import {
  Package,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Barcode,
  ShieldCheck,
  Tag,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductItem | null;
}

export function ProductFormDialog({
  isOpen,
  onClose,
  product,
}: ProductFormDialogProps) {
  const isEditing = !!product;

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [warrantyDays, setWarrantyDays] = useState<number>(0);
  const [withVat, setWithVat] = useState<boolean>(true);

  const debouncedSku = useDebounce(sku, 400);

  // Queries & Mutations
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Only check SKU if changed from original
  const shouldCheckSku = !isEditing || debouncedSku !== product?.sku;
  const { data: skuCheck, isFetching: isCheckingSku } = useCheckSku(
    debouncedSku,
    shouldCheckSku && isOpen
  );

  // Populate form fields
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name || "");
        setSku(product.sku || "");

        const currentCatId = product.categoryId || product.category?.id;
        const isValidCat = categories.some((c) => c.id === currentCatId);
        setCategoryId(isValidCat ? currentCatId! : categories[0]?.id || "");

        setDescription(product.description || "");
        setWarrantyDays(product.warrantyDays || 0);

        // Derive VAT status from first stock or default to true
        const initialVat = product.stocks?.[0]?.withVat ?? true;
        setWithVat(initialVat);
      } else {
        setName("");
        setSku("");
        setCategoryId(categories.length > 0 ? categories[0].id : "");
        setDescription("");
        setWarrantyDays(0);
        setWithVat(true);
      }
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const isSkuAvailable = skuCheck?.available ?? true;

  // Uses non-deprecated SyntheticEvent for React 19 compatibility
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error("Please select a valid Category.");
      return;
    }

    if (!sku.trim() || sku.trim().length < 3) {
      toast.error("SKU must be at least 3 characters long.");
      return;
    }

    if (!isEditing && !isSkuAvailable) {
      toast.error("The specified SKU is already in use.");
      return;
    }

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({
          id: product.id,
          name: name.trim(),
          sku: sku.trim(),
          categoryId,
          description: description.trim() || undefined,
          warrantyDays,
          withVat,
        });
        toast.success(`Product "${name}" updated successfully`);
      } else {
        await createProduct.mutateAsync({
          name: name.trim(),
          sku: sku.trim(),
          categoryId,
          description: description.trim() || undefined,
          warrantyDays,
          withVat,
        });
        toast.success(`Product "${name}" created successfully`);
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save product.");
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? "Edit Product Details" : "Create New Hardware Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1. Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Product Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Dell XPS 15 (i7, 16GB, RTX 4050)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs bg-background"
              required
            />
          </div>

          {/* 2. SKU Barcode with Live Validation */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-primary" />
                SKU / Barcode <span className="text-destructive">*</span>
              </label>

              {sku.trim().length >= 2 && shouldCheckSku && (
                <div className="text-[11px] flex items-center gap-1">
                  {isCheckingSku ? (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                    </span>
                  ) : isSkuAvailable ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Available
                    </span>
                  ) : (
                    <span className="text-destructive font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Taken
                    </span>
                  )}
                </div>
              )}
            </div>

            <Input
              type="text"
              placeholder="e.g. LAP-DELL-XPS15"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={`h-9 text-xs font-mono uppercase bg-background ${!isSkuAvailable && shouldCheckSku
                ? "border-destructive focus-visible:ring-destructive"
                : ""
                }`}
              required
            />
          </div>

          {/* 3. Category & Warranty (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" />
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={isLoadingCategories}
              >
                {isLoadingCategories ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  <>
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Warranty (Days)
              </label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 365"
                value={warrantyDays}
                onChange={(e) =>
                  setWarrantyDays(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="h-9 text-xs bg-background"
              />
            </div>
          </div>

          {/* 4. Tax / VAT Status Selector (Green vs. Red Distinction) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-primary" />
              Tax Classification (VAT Status)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWithVat(true)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${withVat
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  VAT Product (15%)
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                  Standard tax applies at checkout.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWithVat(false)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${!withVat
                  ? "border-rose-500 bg-rose-500/10 text-rose-500 font-semibold shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Non-VAT / Exempt
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                  No VAT calculated for this item.
                </div>
              </button>
            </div>
          </div>

          {/* 5. Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Technical Description / Specs (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 15.6 inch OLED Display, 13th Gen Intel Core i7, 512GB NVMe SSD..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || (!isEditing && !isSkuAvailable)}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
