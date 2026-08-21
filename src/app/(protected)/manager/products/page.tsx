"use client";

import { useState } from "react";
import {
  useProducts,
  type ProductItem,
} from "@/features/product/hooks/use-products";
import { useCategories } from "@/features/category/hooks/use-categories";
import {
  Search,
  Package,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductFormDialog } from "@/features/product/components/product-form-dialog";
import { DeleteProductDialog } from "@/features/product/components/delete-product-dialog";

export default function ManagerProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Queries
  const { data: categories = [] } = useCategories();
  const { data: productsData, isLoading } = useProducts(search, selectedCategory, page);

  const products = productsData?.data || [];
  const meta = productsData?.meta || { totalPages: 1, total: 0, page: 1 };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Hardware Products &amp; Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage product models, unique SKU registrations, and VAT tax classifications.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto h-9"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add New Product
        </Button>
      </div>

      {/* Search & Category Filter Strip */}
      <div className="space-y-3 bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === "ALL"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              All Categories ({meta.total})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      {/* Main Responsive Table Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">SKU / Code</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Warranty</th>
                <th className="p-3.5">VAT Status</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock =
                    product.stocks?.reduce((acc, s) => acc + s.quantity, 0) ?? 0;
                  const sampleStock = product.stocks?.[0];
                  const price = sampleStock?.sellingPrice ?? 0;

                  // Read product-level withVat directly with fallback to stock
                  const isVat = product.withVat ?? sampleStock?.withVat ?? true;

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      {/* SKU */}
                      <td className="p-3.5 font-mono font-semibold text-foreground whitespace-nowrap">
                        {product.sku}
                      </td>

                      {/* Name */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-medium text-foreground line-clamp-1">{product.name}</div>
                        {product.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        {product.category?.name || "Unassigned"}
                      </td>

                      {/* Warranty */}
                      <td className="p-3.5 whitespace-nowrap">
                        {product.warrantyDays && product.warrantyDays > 0 ? (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {product.warrantyDays} Days
                          </span>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>

                      {/* Green vs Red VAT Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isVat ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            VAT (15%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            Non-VAT
                          </span>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="p-3.5 whitespace-nowrap">
                        {totalStock > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                            <Boxes className="w-3.5 h-3.5" />
                            {totalStock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                            <Boxes className="w-3.5 h-3.5" />
                            0 (Out of stock)
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-bold text-foreground whitespace-nowrap"> ETB {price.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(product)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingProduct(product)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing Page {meta.page || 1} of {meta.totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* CRUD Modals */}
      <ProductFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
      />

      <DeleteProductDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        product={deletingProduct}
      />
    </div>
  );
}
