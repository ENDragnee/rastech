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
  UserCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserFormDialog } from "@/features/user/components/user-form-dialog";
import { DeactivateUserDialog } from "@/features/user/components/deactivate-user-dialog";
import { ReactivateUserDialog } from "@/features/user/components/reactivate-user-dialog";
import { UserRoleAssignDialog } from "@/features/user/components/user-role-assign-dialog";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [page, setPage] = useState(1);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccountItem | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserAccountItem | null>(null);
  const [reactivatingUser, setReactivatingUser] = useState<UserAccountItem | null>(null);
  const [roleAssignUser, setRoleAssignUser] = useState<UserAccountItem | null>(null);

  const { data, isLoading } = useUsers({
    search,
    status: statusFilter,
    page,
    limit: 10,
  });

  const users = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Staff &amp; User Administration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage user credentials, grant operational access, and assign multi-role permissions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}
          className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto h-9"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Staff Account
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
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

          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by username..."
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

      {/* Table Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[760px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">User Handle</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Assigned Roles</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading staff accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No {statusFilter.toLowerCase()} accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-foreground whitespace-nowrap">
                      @{u.userName}
                    </td>

                    <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                      {u.name || "—"}
                    </td>

                    {/* Assigned Role Badges */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <span
                              key={r.id}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.name === "ADMIN"
                                  ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
                                  : r.name === "MANAGER"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                }`}
                            >
                              {r.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">No roles</span>
                        )}
                      </div>
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

                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      {/* Active Account Actions */}
                      {u.isActive ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRoleAssignUser(u)}
                            className="h-7 px-2 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1"
                            title="Update Assigned Roles & Permissions"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Roles
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(u);
                              setIsFormOpen(true);
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeactivatingUser(u)}
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                            title="Deactivate User"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        /* Inactive Account Actions -> Reactivate */
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReactivatingUser(u)}
                          className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-semibold"
                          title="Reactivate User Account"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Reactivate
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

      <ReactivateUserDialog
        isOpen={!!reactivatingUser}
        onClose={() => setReactivatingUser(null)}
        user={reactivatingUser}
      />

      <UserRoleAssignDialog
        isOpen={!!roleAssignUser}
        onClose={() => setRoleAssignUser(null)}
        user={roleAssignUser}
      />
    </div>
  );
}
