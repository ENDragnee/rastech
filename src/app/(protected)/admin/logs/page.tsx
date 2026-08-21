"use client";

import { useState } from "react";
import { Search, History, AlertCircle, Info, ShieldAlert } from "lucide-react";

const MOCK_LOGS = [
  { id: "1", type: "ROLE_CREATED", severity: "INFO", message: "Created new role 'CASHIER'", user: "admin_john", date: "2023-10-25 14:32:11", ip: "192.168.1.5" },
  { id: "2", type: "STOCK_UPDATED", severity: "WARNING", message: "Stock for DL-XPS-15 manually adjusted (-2)", user: "mgr_jane", date: "2023-10-25 12:15:00", ip: "192.168.1.10" },
  { id: "3", type: "USER_DELETED", severity: "ERROR", message: "Deleted user 'cashier_old'", user: "admin_john", date: "2023-10-24 09:45:22", ip: "192.168.1.5" },
  { id: "4", type: "LOGIN_FAILED", severity: "WARNING", message: "Failed login attempt for 'admin'", user: "System", date: "2023-10-24 03:12:00", ip: "45.22.11.90" },
  { id: "5", type: "TRANSACTION_CREATED", severity: "INFO", message: "Processed SALE invoice #INV-8892", user: "cashier_bob", date: "2023-10-23 16:20:10", ip: "192.168.1.20" },
];

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "INFO": return <Info className="h-5 w-5 text-blue-500" />;
      case "WARNING": return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "ERROR": return <ShieldAlert className="h-5 w-5 text-destructive" />;
      default: return <History className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Immutable record of all system activities and security events.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search logs by action, user, or IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium w-12"></th>
                <th className="px-6 py-4 font-medium">Message / Action</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="bg-background hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-center">
                    {getSeverityIcon(log.severity)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{log.message}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded inline-block">
                      {log.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    @{log.user}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                    {log.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
          <div>Showing 5 latest logs</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-border disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded border border-border bg-background hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
