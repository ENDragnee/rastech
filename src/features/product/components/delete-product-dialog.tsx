"use client";

import { useDeleteProduct, type ProductItem } from "@/features/product/hooks/use-products";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteProductDialogProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteProductDialog({
  product,
  isOpen,
  onClose,
}: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct();

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(`Product "${product.name}" deleted successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Cannot delete product with existing transaction history.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Delete Product</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-foreground">{product.name}</strong> (SKU: {product.sku})?
          </p>
          <div className="p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground border border-border">
            Note: If this product has linked sales transactions or stock history, deletion will be blocked to protect accounting audits.
          </div>
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteProduct.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {deleteProduct.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
              </span>
            ) : (
              "Delete Product"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
