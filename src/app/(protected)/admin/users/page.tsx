"use client";

import { useState } from "react";
import {
  useUsers,
  type UserAccountItem,
} from "@/features/user/hooks/use-users";
import {
  Search,
  Users,
  PlusCircle,
  Edit2,
  UserX,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserFormDialog } from "@/features/user/components/user-form-dialog";
import { DeactivateUserDialog } from "@/features/user/components/deactivate-user-dialog";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [page, setPage] = useState(1);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccountItem | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserAccountItem | null>(null);

  const { data, isLoading } = useUsers({
    search,
    status: statusFilter,
    page,
    limit: 10,
  });

  const users = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserAccountItem) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Staff &amp; User Administration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage user credentials, grant operational access, and deactivate inactive staff accounts.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto h-9"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Staff Account
        </Button>
      </div>

      {/* Filter & Search Bar Strip */}
      <div className="space-y-3 bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ACTIVE");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${statusFilter === "ACTIVE"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              Active Staff Accounts
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("INACTIVE");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${statusFilter === "INACTIVE"
                  ? "bg-destructive/15 text-destructive font-semibold border border-destructive/30"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              Deactivated Accounts
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by username (min 2 chars)..."
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

      {/* Responsive Table Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[650px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">User Handle</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading staff accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No {statusFilter.toLowerCase()} accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    {/* Username */}
                    <td className="p-3.5 font-mono font-semibold text-foreground whitespace-nowrap">
                      @{u.userName}
                    </td>

                    {/* Full Name */}
                    <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                      {u.name || "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(u)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        title="Edit User Details"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>

                      {u.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeactivatingUser(u)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          title="Deactivate User (Soft Delete)"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing Page {meta.page || 1} of {meta.totalPages || 1} ({meta.total || 0} users)
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

      {/* Modals */}
      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={editingUser}
      />

      <DeactivateUserDialog
        isOpen={!!deactivatingUser}
        onClose={() => setDeactivatingUser(null)}
        user={deactivatingUser}
      />
    </div>
  );
}
