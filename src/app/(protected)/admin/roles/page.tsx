"use client";

import { useState } from "react";
import { useRoles, type RoleItem } from "@/features/role/hooks/use-roles";
import {
  Search,
  ShieldAlert,
  PlusCircle,
  Edit2,
  Trash2,
  Loader2,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleFormDialog } from "@/features/role/components/role-form-dialog";
import { DeleteRoleDialog } from "@/features/role/components/delete-role-dialog";

export default function AdminRolesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);

  const { data, isLoading } = useRoles({
    search,
    page,
    limit: 10,
  });

  const roles = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Roles &amp; Access Control (RBAC)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system authorization profiles, assign granular module permissions, and inspect staff allocation.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto h-9"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create New Role
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Configured Security Roles</span>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{meta.total}</div>
          <span className="text-[10px] text-muted-foreground block">System authorization templates</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Filtered Results</span>
            <Search className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{roles.length}</div>
          <span className="text-[10px] text-muted-foreground block">Matching search criteria</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm flex justify-between items-center">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search role by name (min 2 chars)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Role Name</th>
                <th className="p-3.5">Guard</th>
                <th className="p-3.5">Granted Permissions</th>
                <th className="p-3.5">Assigned Staff</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading roles &amp; permissions...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No roles found matching "{search}".
                  </td>
                </tr>
              ) : (
                roles.map((r) => {
                  const isCore = ["ADMIN", "MANAGER", "CASHIER"].includes(r.name);

                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground text-xs">
                            {r.name}
                          </span>
                          {isCore && (
                            <span className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Core Role
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Guard */}
                      <td className="p-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        {r.guardName || "web"}
                      </td>

                      {/* Granted Permissions count badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-mono">
                          {r.permissions?.length || 0} Permissions
                        </span>
                      </td>

                      {/* Assigned Staff Count */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-muted-foreground font-medium">
                          <Users className="w-3.5 h-3.5" />
                          {r._count?.users || 0} User(s)
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(r)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="Edit Role & Permissions Matrix"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Configure
                        </Button>

                        {!isCore && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingRole(r)}
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                            title="Delete Role"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        )}
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
            Showing Page {meta.page || 1} of {meta.totalPages || 1} ({meta.total || 0} roles)
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
      <RoleFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        role={editingRole}
      />

      <DeleteRoleDialog
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        role={deletingRole}
      />
    </div>
  );
}
