"use client";

import { useDeactivateUser, type UserAccountItem } from "@/features/user/hooks/use-users";
import { AlertTriangle, Loader2, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeactivateUserDialogProps {
  user: UserAccountItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeactivateUserDialog({
  user,
  isOpen,
  onClose,
}: DeactivateUserDialogProps) {
  const deactivateUser = useDeactivateUser();

  if (!isOpen || !user) return null;

  const handleDeactivate = async () => {
    try {
      await deactivateUser.mutateAsync(user.id);
      toast.success(`User @${user.userName} has been deactivated.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to deactivate user.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Deactivate Staff Account</h2>
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
            Are you sure you want to deactivate the login for{" "}
            <strong className="text-foreground">@{user.userName}</strong>
            {user.name ? ` (${user.name})` : ""}?
          </p>

          <div className="p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground border border-border">
            <strong>Accountability Protected:</strong> This account will not be purged from the database. All sales and inventory audit logs created by @{user.userName} remain permanently intact.
          </div>
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deactivateUser.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDeactivate}
            disabled={deactivateUser.isPending}
            className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {deactivateUser.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deactivating...
              </span>
            ) : (
              "Deactivate Account"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
