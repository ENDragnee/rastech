"use client";

import { useReactivateUser, type UserAccountItem } from "../hooks/use-users";
import { Button } from "@/components/ui/button";
import { UserCheck, Loader2, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ReactivateUserDialogProps {
  user: UserAccountItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReactivateUserDialog({
  user,
  isOpen,
  onClose,
}: ReactivateUserDialogProps) {
  const reactivateUser = useReactivateUser();

  if (!isOpen || !user) return null;

  const handleReactivate = async () => {
    try {
      await reactivateUser.mutateAsync(user.id);
      toast.success(`Account @${user.userName} has been reactivated`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to reactivate user");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Reactivate Staff Account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* User Info Card */}
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-foreground text-sm">
                  {user.name || "Staff Member"}
                </p>
                <span className="font-mono text-primary text-[11px]">
                  @{user.userName}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                Currently Deactivated
              </span>
            </div>

            {user.roles && user.roles.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-border/50 flex-wrap">
                <span className="text-muted-foreground text-[10px]">
                  Configured Roles:
                </span>
                {user.roles.map((r) => (
                  <span
                    key={r.id}
                    className="text-[9px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Restoring System Access
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Once reactivated, this user will immediately be able to sign in and execute operations tied to their assigned roles.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={reactivateUser.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleReactivate}
              disabled={reactivateUser.isPending}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {reactivateUser.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reactivating...
                </span>
              ) : (
                "Confirm Reactivation"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
