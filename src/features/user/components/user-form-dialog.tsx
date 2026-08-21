"use client";

import { useState, useEffect } from "react";
import type { SyntheticEvent } from "react";
import {
  useCreateUser,
  useUpdateUser,
  type UserAccountItem,
} from "@/features/user/hooks/use-users";
import {
  Users,
  X,
  Loader2,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserAccountItem | null;
}

export function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
  const isEditing = !!user;

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name || "");
        setUserName(user.userName || "");
        setPassword("");
        setIsActive(user.isActive);
      } else {
        setName("");
        setUserName("");
        setPassword("");
        setIsActive(true);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userName.trim().length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }

    if (!isEditing && (!password || password.length < 3)) {
      toast.error("Password is required to create a new user.");
      return;
    }

    try {
      if (isEditing && user) {
        await updateUser.mutateAsync({
          id: user.id,
          name: name.trim() || undefined,
          userName: userName.trim(),
          passowrd: password.trim() ? password.trim() : undefined,
        });
        toast.success(`User @${userName} updated successfully`);
      } else {
        await createUser.mutateAsync({
          name: name.trim() || undefined,
          userName: userName.trim(),
          passowrd: password.trim(),
          isActive,
        });
        toast.success(`User @${userName} created successfully`);
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save user account.");
    }
  };

  const isSaving = createUser.isPending || updateUser.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? "Edit Staff Account" : "Create New Staff User"}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Full Name (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs bg-background"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-primary" />
              Username / Login Handle <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. jdoe (min 3 chars)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="h-9 text-xs font-mono bg-background"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                {isEditing ? "Change Password (Optional)" : "Password *"}
              </span>
              {isEditing && (
                <span className="text-[10px] text-muted-foreground font-normal">
                  Leave blank to retain current
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={isEditing ? "••••••••" : "Enter password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs pr-9 bg-background"
                required={!isEditing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Initial Active Status Toggle on Create */}
          {!isEditing && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div>
                <span className="font-semibold text-foreground block">Active Account Status</span>
                <span className="text-[10px] text-muted-foreground">
                  User can immediately log in and access authorized features.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
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
                "Save Changes"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
