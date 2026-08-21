"use client";

import { useState } from "react";
import {
  useCategories,
  type CategoryItem,
} from "@/features/category/hooks/use-categories";
import {
  Search,
  Tags,
  PlusCircle,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFormDialog } from "@/features/category/components/category-form-dialog";
import { DeleteCategoryDialog } from "@/features/category/components/delete-category-dialog";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  const { data: categories = [], isLoading } = useCategories();

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Product Category Classifications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize hardware items into departments, manage taxonomies, and filter catalog entries.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto h-9"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Category
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Hardware Categories</span>
            <Tags className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {categories.length}
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Configured store departments
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Filtered Results</span>
            <Search className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {filteredCategories.length}
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Matching current query
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm flex justify-between items-center">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search category name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>
      </div>

      {/* Responsive Categories Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[650px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    <Tags className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No categories found matching "{search}".
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    {/* Name */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Tags className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-foreground text-xs">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-3.5 text-muted-foreground max-w-sm">
                      {cat.description || "—"}
                    </td>

                    {/* Created Date */}
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>
                          {cat.createdAt
                            ? new Date(cat.createdAt).toLocaleDateString()
                            : "Pre-seeded"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(cat)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCategory(cat)}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modals */}
      <CategoryFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
      />

      <DeleteCategoryDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
      />
    </div>
  );
}
