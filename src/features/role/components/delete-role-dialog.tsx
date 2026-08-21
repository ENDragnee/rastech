"use client";

import { useDeleteRole, type RoleItem } from "@/features/role/hooks/use-roles";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteRoleDialogProps {
  role: RoleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteRoleDialog({ role, isOpen, onClose }: DeleteRoleDialogProps) {
  const deleteRole = useDeleteRole();

  if (!isOpen || !role) return null;

  const isProtectedRole = ["ADMIN", "MANAGER", "CASHIER"].includes(role.name);

  const handleDelete = async () => {
    if (isProtectedRole) {
      toast.error(`System role "${role.name}" is protected and cannot be deleted.`);
      return;
    }

    try {
      await deleteRole.mutateAsync(role.id);
      toast.success(`Role "${role.name}" deleted successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete role.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Delete Access Role</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete the role{" "}
            <strong className="text-foreground font-mono">"{role.name}"</strong>?
          </p>

          {isProtectedRole ? (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-semibold text-[11px]">
              Protected System Role: This core role is required for system functionality and cannot be deleted.
            </div>
          ) : role._count?.users ? (
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px]">
              Warning: {role._count.users} active staff user(s) currently have this role assigned.
            </div>
          ) : null}
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteRole.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={deleteRole.isPending || isProtectedRole}
            className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {deleteRole.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
              </span>
            ) : (
              "Delete Role"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
