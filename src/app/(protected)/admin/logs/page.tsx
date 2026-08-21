"use client";

import { useState } from "react";
import {
  useLogs,
  type LogItem,
} from "@/features/log/hooks/use-logs";
import { type LogSeverity } from "@/features/log/schemas/log.schema";
import { useUsers } from "@/features/user/hooks/use-users";
import {
  Search,
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  AlertTriangle,
  Info,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  Layers,
  X,
  User,
  FilterX,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogDetailsDialog } from "@/features/log/components/log-details-dialog";
import { toast } from "sonner";

type SortField = "createdAt" | "type" | "severity";
type SortOrder = "asc" | "desc";

export default function AdminLogsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  // Queries
  const { data: usersData } = useUsers({ limit: 50 });
  const staffUsers = usersData?.data || [];

  const { data, isLoading, refetch, isFetching } = useLogs({
    search,
    page,
    limit,
    sort: sortField,
    order: sortOrder,
    severity: severityFilter,
    userId: selectedUserId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const logs = data?.data || [];
  const stats = data?.stats || { total: 0, info: 0, warning: 0, error: 0, fatal: 0 };
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  // Sort Column Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 ml-1 inline transition-colors group-hover:text-foreground" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary ml-1 inline" />
    );
  };

  // Quick Date Preset Setter
  const applyDatePreset = (preset: "TODAY" | "7DAYS" | "30DAYS") => {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    let startStr = endStr;

    if (preset === "7DAYS") {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      startStr = d.toISOString().split("T")[0];
    } else if (preset === "30DAYS") {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      startStr = d.toISOString().split("T")[0];
    }

    setStartDate(startStr);
    setEndDate(endStr);
    setPage(1);
  };

  // Clear All Filters
  const handleResetFilters = () => {
    setSearch("");
    setSeverityFilter(undefined);
    setSelectedUserId("");
    setStartDate("");
    setEndDate("");
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
    toast.info("All audit filters reset");
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(severityFilter) ||
    Boolean(selectedUserId) ||
    Boolean(startDate) ||
    Boolean(endDate);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("No log entries available to export.");
      return;
    }

    const headers = [
      "ID",
      "Timestamp",
      "Severity",
      "Event Type",
      "Message",
      "Staff User",
      "IP Address",
      "Target Name",
      "Target ID",
    ];

    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.severity}"`,
      `"${l.type}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${l.user?.userName || "System"}"`,
      `"${l.ipAddress || "Local"}"`,
      `"${l.targetName || "N/A"}"`,
      `"${l.targetId || "N/A"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rastech_Audit_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit trail exported to CSV");
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            System Audit &amp; Security Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable activity trails of user authentications, stock intakes, sales, and role changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 border-border hover:bg-muted h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 border-border hover:bg-muted h-9"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export</span> CSV
          </Button>
        </div>
      </div>

      {/* Critical Security Alert Banner (If Errors/Fatal are Present) */}
      {stats.error + stats.fatal > 0 && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Security Notice: {stats.error + stats.fatal} error/fatal audit event(s) detected in database.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSeverityFilter("ERROR");
              setPage(1);
            }}
            className="h-7 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0"
          >
            Inspect Errors
          </Button>
        </div>
      )}

      {/* Real-time Database Severity Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Database Events</span>
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground font-mono">
            {stats.total}
          </div>
          <span className="text-[10px] text-muted-foreground block">Total matching query</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Info Operations</span>
            <Info className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-500 font-mono">
            {stats.info}
          </div>
          <span className="text-[10px] text-muted-foreground block">Routine tasks</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Warnings &amp; Deletions</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-500 font-mono">
            {stats.warning}
          </div>
          <span className="text-[10px] text-muted-foreground block">Audit overrides</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Errors &amp; Fatal</span>
            <XCircle className="w-3.5 h-3.5 text-destructive" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-destructive font-mono">
            {stats.error + stats.fatal}
          </div>
          <span className="text-[10px] text-muted-foreground block">Critical events</span>
        </div>
      </div>

      {/* Multi-Filter Strip with Interactive Calendar Picker */}
      <div className="space-y-3.5 bg-card p-3.5 sm:p-4 rounded-2xl border border-border shadow-sm">
        {/* Row 1: Severity Pills + Search Input */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Severity Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-none">
            {(["ALL", "INFO", "WARNING", "ERROR", "FATAL"] as const).map((sev) => {
              const isActive = sev === "ALL" ? !severityFilter : severityFilter === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => {
                    setSeverityFilter(sev === "ALL" ? undefined : (sev as LogSeverity));
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${isActive
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {sev === "ALL" ? "All Severities" : sev}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search message, event, IP, @user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 h-9 text-xs bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Calendar Range Picker + Actor Filter + Presets */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs">
          {/* Date Picker Range */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-xl">
              <span className="text-[11px] text-muted-foreground">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyDatePreset("TODAY")}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-muted/60 text-muted-foreground hover:text-foreground"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset("7DAYS")}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-muted/60 text-muted-foreground hover:text-foreground"
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset("30DAYS")}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-muted/60 text-muted-foreground hover:text-foreground"
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Actor / Staff Filter + Page Limit + Reset */}
          <div className="flex items-center gap-2 justify-between lg:justify-end">
            {/* User Dropdown */}
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px]"
              >
                <option value="">All Staff Users</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    @{u.userName} ({u.name || "Staff"})
                  </option>
                ))}
              </select>
            </div>

            {/* Limit Selector */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                title="Reset all filters"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Table Container with Sort Headers */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                {/* Sortable: Timestamp */}
                <th className="p-3.5">
                  <button
                    type="button"
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1 uppercase font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <span>Timestamp</span>
                    {renderSortIcon("createdAt")}
                  </button>
                </th>

                {/* Sortable: Severity */}
                <th className="p-3.5">
                  <button
                    type="button"
                    onClick={() => handleSort("severity")}
                    className="flex items-center gap-1 uppercase font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <span>Severity</span>
                    {renderSortIcon("severity")}
                  </button>
                </th>

                {/* Sortable: Event Type */}
                <th className="p-3.5">
                  <button
                    type="button"
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1 uppercase font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                  >
                    <span>Event Type</span>
                    {renderSortIcon("type")}
                  </button>
                </th>

                <th className="p-3.5">Activity Message</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Querying audit records from database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleDateString()}{" "}
                      <span className="text-[10px] opacity-70">
                        {new Date(l.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Severity Badge */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${l.severity === "INFO"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                            : l.severity === "WARNING"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : l.severity === "ERROR"
                                ? "bg-destructive/10 text-destructive border-destructive/30"
                                : "bg-purple-500/15 text-purple-500 border-purple-500/40"
                          }`}
                      >
                        {l.severity}
                      </span>
                    </td>

                    {/* Event Type */}
                    <td className="p-3.5 font-mono text-foreground font-semibold whitespace-nowrap text-[11px]">
                      {l.type}
                    </td>

                    {/* Message */}
                    <td className="p-3.5 max-w-xs sm:max-w-md">
                      <p className="text-foreground line-clamp-1">{l.message}</p>
                    </td>

                    {/* Actor */}
                    <td className="p-3.5 whitespace-nowrap font-mono">
                      {l.user ? (
                        <span className="text-primary font-medium">@{l.user.userName}</span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">System</span>
                      )}
                    </td>

                    {/* Target */}
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap max-w-[140px] truncate">
                      {l.targetName || l.targetId || "—"}
                    </td>

                    {/* Inspect Payload Button */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(l)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                        title="Inspect Event Payload"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
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
            Showing Page {meta.page || 1} of {meta.totalPages || 1} ({meta.total || 0} events)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Details & JSON Payload Modal */}
      <LogDetailsDialog
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
