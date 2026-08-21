"use client";

import { useDeleteCategory, type CategoryItem } from "@/features/category/hooks/use-categories";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteCategoryDialogProps {
  category: CategoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteCategoryDialog({
  category,
  isOpen,
  onClose,
}: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory();

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success(`Category "${category.name}" removed successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Cannot delete category with associated products.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Delete Category</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete the category{" "}
            <strong className="text-foreground">"{category.name}"</strong>?
          </p>
          <div className="p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground border border-border">
            Note: All products belonging to this category must be reassigned or deleted first.
          </div>
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteCategory.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {deleteCategory.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
              </span>
            ) : (
              "Delete Category"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
