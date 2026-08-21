"use client";

import { useState, useEffect } from "react";
import type { SyntheticEvent } from "react";
import {
  useCreateRole,
  useUpdateRole,
  useRoles,
  useModulesWithPermissions,
  type RoleItem,
} from "@/features/role/hooks/use-roles";
import {
  ShieldAlert,
  X,
  Loader2,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RoleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: RoleItem | null;
}

export function RoleFormDialog({ isOpen, onClose, role }: RoleFormDialogProps) {
  const isEditing = !!role;

  const [name, setName] = useState("");
  const [guardName, setGuardName] = useState("web");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [cloneFromRoleId, setCloneFromRoleId] = useState<string>("");

  const { data: rolesData } = useRoles({ limit: 50 });
  const { data: modules = [], isLoading: isLoadingModules } = useModulesWithPermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const existingRolesList = rolesData?.data || [];

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name || "");
        setGuardName(role.guardName || "web");
        setSelectedPermissionIds(role.permissions?.map((p) => p.id) || []);
      } else {
        setName("");
        setGuardName("web");
        setSelectedPermissionIds([]);
        setCloneFromRoleId("");
      }
    }
  }, [role, isOpen]);

  if (!isOpen) return null;

  // Handle cloning permissions from an existing role baseline
  const handleCloneFromRole = (sourceRoleId: string) => {
    setCloneFromRoleId(sourceRoleId);
    if (!sourceRoleId) return;

    const sourceRole = existingRolesList.find((r) => r.id === sourceRoleId);
    if (sourceRole?.permissions) {
      const sourcePermIds = sourceRole.permissions.map((p) => p.id);
      setSelectedPermissionIds(sourcePermIds);
      toast.info(`Imported ${sourcePermIds.length} permissions from role "${sourceRole.name}"`);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const toggleModulePermissions = (modulePermIds: string[]) => {
    const allSelected = modulePermIds.every((id) => selectedPermissionIds.includes(id));
    if (allSelected) {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !modulePermIds.includes(id))
      );
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    }
  };

  const selectAllPermissions = () => {
    const allIds = modules.flatMap((m) => m.permissions.map((p) => p.id));
    setSelectedPermissionIds(allIds);
  };

  const clearAllPermissions = () => {
    setSelectedPermissionIds([]);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Role name must be at least 2 characters long.");
      return;
    }

    try {
      if (isEditing && role) {
        await updateRole.mutateAsync({
          id: role.id,
          name: name.trim().toUpperCase(),
          guardName: guardName.trim() || "web",
          permissions: selectedPermissionIds,
        });
        toast.success(`Role "${name.toUpperCase()}" updated successfully`);
      } else {
        await createRole.mutateAsync({
          name: name.trim().toUpperCase(),
          guardName: guardName.trim() || "web",
          permissions: selectedPermissionIds,
        });
        toast.success(`Role "${name.toUpperCase()}" created successfully`);
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save role.");
    }
  };

  const isSaving = createRole.isPending || updateRole.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? `Edit Role: ${role.name}` : "Create System Access Role"}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Baseline Inheritance / Copy Permissions Bar (on Create) */}
          {!isEditing && existingRolesList.length > 0 && (
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-foreground block">
                    Copy Baseline from Pre-existing Role
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Quickly populate permissions from a template role.
                  </span>
                </div>
              </div>

              <select
                value={cloneFromRoleId}
                onChange={(e) => handleCloneFromRole(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              >
                <option value="">Select baseline role...</option>
                {existingRolesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.permissions?.length || 0} perms)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role Name & Guard Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">
                Role Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. INVENTORY_AUDITOR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs font-mono uppercase bg-background"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Guard Name</label>
              <Input
                type="text"
                value={guardName}
                onChange={(e) => setGuardName(e.target.value)}
                className="h-9 text-xs font-mono bg-background"
                required
              />
            </div>
          </div>

          {/* Module-Grouped Permission Matrix */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Granted Permissions ({selectedPermissionIds.length} Selected)
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Select which capabilities this role is authorized to perform.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">&bull;</span>
                <button
                  type="button"
                  onClick={clearAllPermissions}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Checklist */}
            {isLoadingModules ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                Loading permissions matrix...
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {modules.map((mod) => {
                  const modPermIds = mod.permissions.map((p) => p.id);
                  const isAllModSelected =
                    modPermIds.length > 0 &&
                    modPermIds.every((id) => selectedPermissionIds.includes(id));

                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-xl border border-border bg-background space-y-2.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          <span className="font-semibold text-foreground text-xs">
                            {mod.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleModulePermissions(modPermIds)}
                          className="text-[11px] text-muted-foreground hover:text-primary font-medium flex items-center gap-1"
                        >
                          {isAllModSelected ? (
                            <>
                              <CheckSquare className="w-3 h-3 text-primary" /> Deselect Module
                            </>
                          ) : (
                            <>
                              <Square className="w-3 h-3" /> Select All ({mod.permissions.length})
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.permissions.map((perm) => {
                          const isChecked = selectedPermissionIds.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isChecked
                                  ? "border-primary bg-primary/10 text-foreground font-semibold"
                                  : "border-border/60 bg-card text-muted-foreground hover:bg-muted/60"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                              />
                              <span className="font-mono text-[11px] truncate">
                                {perm.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-2 border-t border-border">
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
                "Save Role Changes"
              ) : (
                "Create Role"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
