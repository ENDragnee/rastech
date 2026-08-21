"use client";

import { useState } from "react";
import { Plus, Shield, ShieldCheck, MoreHorizontal, UserCheck, UserX } from "lucide-react";

const MOCK_USERS = [
  { id: "1", name: "John Doe", username: "admin_john", role: "ADMIN", active: true },
  { id: "2", name: "Jane Smith", username: "mgr_jane", role: "MANAGER", active: true },
  { id: "3", name: "Bob Wilson", username: "cashier_bob", role: "CASHIER", active: true },
  { id: "4", name: "Alice Brown", username: "cashier_alice", role: "CASHIER", active: false },
];

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff & Roles</h1>
          <p className="text-muted-foreground mt-1">Manage system access, roles, and employee accounts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles Summary */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-foreground mb-2">Available Roles</h2>
          
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-primary">ADMIN</h3>
            </div>
            <p className="text-sm text-muted-foreground">Full system access. Can manage users, edit catalog, and view all reports.</p>
          </div>
          
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-emerald-500">MANAGER</h3>
            </div>
            <p className="text-sm text-muted-foreground">Can view analytics, generate reports, and manage stock levels.</p>
          </div>
          
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-bold text-foreground">CASHIER</h3>
            </div>
            <p className="text-sm text-muted-foreground">Restricted to Point of Sale, processing transactions, and returns.</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="col-span-1 md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider ${
                        user.role === "ADMIN" ? "border-primary text-primary bg-primary/10" :
                        user.role === "MANAGER" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" :
                        "border-border text-foreground bg-muted"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.active ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-medium text-xs">
                          <UserCheck className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-destructive font-medium text-xs">
                          <UserX className="h-4 w-4" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Add New User</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <input type="text" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Username</label>
                <input type="text" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Assign Role</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none text-foreground">
                  <option>ADMIN</option>
                  <option>MANAGER</option>
                  <option>CASHIER</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Temporary Password</label>
                <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90">Save User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
