"use client";

import { useState, useEffect } from "react";
import {
  useUpdateUser,
  useAvailableRoles,
  type UserAccountItem,
  type RoleReference,
} from "@/features/user/hooks/use-users";
import {
  ShieldCheck,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  Layers,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserRoleAssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccountItem | null;
}

export function UserRoleAssignDialog({
  isOpen,
  onClose,
  user,
}: UserRoleAssignDialogProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { data: availableRoles = [], isLoading: isLoadingRoles } = useAvailableRoles();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoleIds(user.roles?.map((r: RoleReference) => r.id) || []);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  // Find all active role objects
  const selectedRoleObjects: RoleReference[] = availableRoles.filter(
    (r: RoleReference) => selectedRoleIds.includes(r.id)
  );

  const handleSaveRoles = async () => {
    if (selectedRoleIds.length === 0) {
      toast.error("User must have at least one assigned role.");
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: user.id,
        roleIds: selectedRoleIds,
      });

      toast.success(`Access roles updated for @${user.userName}`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update user roles.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Manage Access Roles for @{user.userName}
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

        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* User Info Bar */}
          <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs border border-primary/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.name || user.userName}</p>
              <span className="text-[10px] text-muted-foreground font-mono">
                @{user.userName} &bull; Currently has {user.roles?.length || 0} role(s)
              </span>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-2">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Assigned Roles
            </label>
            <p className="text-[11px] text-muted-foreground">
              Select all roles this staff member should possess. Permissions merge automatically.
            </p>

            {isLoadingRoles ? (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {availableRoles.map((role: RoleReference) => {
                  const isSelected = selectedRoleIds.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${isSelected
                          ? "border-primary bg-primary/10 text-foreground font-bold shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                        }`}
                    >
                      <div>
                        <span className="font-mono text-xs block">{role.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {role.name === "ADMIN"
                            ? "Full system control"
                            : role.name === "MANAGER"
                              ? "Inventory, POS & reports"
                              : "Point of Sale cashier"}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Summary */}
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Effective Access Summary
              </span>
              <span className="font-mono font-bold text-primary text-[11px]">
                {selectedRoleObjects.length} Role(s) Active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedRoleObjects.length === 0 ? (
                <span className="text-[10px] text-destructive">No roles selected (User will be locked out)</span>
              ) : (
                selectedRoleObjects.map((r: RoleReference) => (
                  <span
                    key={r.id}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30"
                  >
                    {r.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 border-t border-border bg-muted/20 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={updateUser.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveRoles}
            disabled={updateUser.isPending || selectedRoleIds.length === 0}
            className="text-xs bg-primary text-primary-foreground font-semibold"
          >
            {updateUser.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
              </span>
            ) : (
              "Save Role Assignments"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
