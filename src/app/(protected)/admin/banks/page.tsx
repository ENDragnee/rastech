"use client";

import { useState } from "react";
import {
  useBanks,
  useCreateBank,
  useUpdateBank,
  useDeleteBank,
  type BankItem,
} from "@/features/bank/hooks/use-banks";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  CreditCard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminBanksPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankItem | null>(null);
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const { data: banks = [], isLoading } = useBanks(search);
  const createBank = useCreateBank();
  const updateBank = useUpdateBank();
  const deleteBank = useDeleteBank();

  const handleOpenCreate = () => {
    setEditingBank(null);
    setName("");
    setAccountNumber("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (bank: BankItem) => {
    setEditingBank(bank);
    setName(bank.name);
    setAccountNumber(bank.accountNumber || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await updateBank.mutateAsync({
          id: editingBank.id,
          name,
          accountNumber: accountNumber.trim() || null,
        });
        toast.success("Bank channel updated");
      } else {
        await createBank.mutateAsync({
          name,
          accountNumber: accountNumber.trim() || null,
        });
        toast.success("Bank channel created");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to save bank");
    }
  };

  const handleDelete = async (bank: BankItem) => {
    const transactionCount = bank._count?.transactions || 0;
    const confirmMessage =
      transactionCount > 0
        ? `"${bank.name}" has ${transactionCount} recorded transaction(s). Deleting it will detach the bank reference from past invoices without deleting the sales. Proceed?`
        : `Are you sure you want to delete "${bank.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      await deleteBank.mutateAsync(bank.id);
      toast.success("Bank deleted successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || err?.message || "Failed to delete bank"
      );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Bank Accounts &amp; Payment Channels
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage commercial bank accounts, Telebirr merchant IDs, and transfer channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search bank name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-card"
            />
          </div>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
          >
            <Plus className="w-3.5 h-3.5" /> Add Bank
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5">Bank / Channel Name</th>
              <th className="p-3.5">Account / Merchant #</th>
              <th className="p-3.5">Transactions Linked</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading bank channels...
                </td>
              </tr>
            ) : banks.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No bank accounts configured.
                </td>
              </tr>
            ) : (
              banks.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    {b.name}
                  </td>
                  <td className="p-3.5 font-mono text-foreground font-medium">
                    {b.accountNumber || (
                      <span className="text-muted-foreground text-[10px]">No Account #</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      <CreditCard className="w-3 h-3" />
                      {b._count?.transactions || 0} Transactions
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(b)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(b)}
                      disabled={deleteBank.isPending}
                      className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
              <h2 className="text-sm font-semibold text-foreground">
                {editingBank ? "Edit Bank Channel" : "Add Bank Channel"}
              </h2>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Bank Name / Provider</label>
                <Input
                  type="text"
                  placeholder="e.g. Commercial Bank of Ethiopia (CBE)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Account Number / Merchant Code</label>
                <Input
                  type="text"
                  placeholder="e.g. 1000123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-8 text-xs bg-background font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createBank.isPending || updateBank.isPending}
                  className="text-xs bg-primary text-primary-foreground font-semibold"
                >
                  {createBank.isPending || updateBank.isPending ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Save Bank"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
