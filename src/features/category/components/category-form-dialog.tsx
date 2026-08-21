"use client";

import { useState, useEffect } from "react";
import type { SyntheticEvent } from "react";
import {
  useCreateCategory,
  useUpdateCategory,
  type CategoryItem,
} from "@/features/category/hooks/use-categories";
import { Tags, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryItem | null;
}

export function CategoryFormDialog({
  isOpen,
  onClose,
  category,
}: CategoryFormDialogProps) {
  const isEditing = !!category;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setDescription(category.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Category name must be at least 2 characters.");
      return;
    }

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success(`Category "${name}" updated successfully`);
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success(`Category "${name}" created successfully`);
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save category.");
    }
  };

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? "Edit Category Details" : "Create Product Category"}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* 1. Category Name */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">
              Category Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Laptops & Computers, Security Cameras..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs bg-background"
              required
              autoFocus
            />
          </div>

          {/* 2. Description */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Business and gaming laptops, desktop PCs, and workstations..."
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
              disabled={isSaving}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
