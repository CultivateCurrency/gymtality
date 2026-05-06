"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  Image,
  Ban,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Eye,
  Filter,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reporter {
  id: string;
  fullName: string;
  username: string;
  profilePhoto: string | null;
}

interface Report {
  id: string;
  targetType: "POST" | "USER" | "COMMENT" | "CONTENT";
  targetId: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  reporter: Reporter;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const blockedKeywords = [
  "cheap supplements",
  "buy now",
  "discount code",
  "steroids",
  "weight loss pills",
  "DM me for",
  "free trial",
  "crypto",
];

const statusFilters = ["All", "Pending", "Under Review", "Auto-Flagged", "Resolved"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatusToApi(
  uiStatus: string
): "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED" | null {
  switch (uiStatus) {
    case "Pending":
      return "PENDING";
    case "Under Review":
      return "REVIEWED";
    case "Auto-Flagged":
      return "PENDING"; // no direct equivalent — treat as PENDING
    case "Resolved":
      return "RESOLVED";
    default:
      return null;
  }
}

function mapStatusToUi(apiStatus: Report["status"]): string {
  switch (apiStatus) {
    case "PENDING":
      return "Pending";
    case "REVIEWED":
      return "Under Review";
    case "RESOLVED":
      return "Resolved";
    case "DISMISSED":
      return "Dismissed";
  }
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminModerationPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [newKeyword, setNewKeyword] = useState("");

  const [mutating, setMutating] = useState(false);

  // Filtered list URL (drives the reports queue)
  const filteredUrl = useMemo(() => {
    const p = new URLSearchParams();
    const apiStatus = mapStatusToApi(statusFilter);
    if (statusFilter !== "All" && apiStatus) p.set("status", apiStatus);
    return `/api/admin/reports?${p}`;
  }, [statusFilter]);

  // All-reports URL for stats (no status filter)
  const statsUrl = "/api/admin/reports";

  const {
    data: filteredResult,
    loading: filteredLoading,
    error: filteredError,
    refetch: refetchFiltered,
  } = useApi<Report[]>(filteredUrl);

  const {
    data: statsResult,
    loading: statsLoading,
  } = useApi<Report[]>(statsUrl);

  const handleAction = useCallback(
    async (
      reportId: string,
      status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED"
    ) => {
      setMutating(true);
      try {
        await apiFetch(`/api/admin/reports/${reportId}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        refetchFiltered();
      } catch {} finally {
        setMutating(false);
      }
    },
    [refetchFiltered]
  );

  // Derived stats from the unfiltered fetch
  const allReports: Report[] = statsResult ?? [];
  const statPending = allReports.filter((r) => r.status === "PENDING").length;
  const statReviewed = allReports.filter((r) => r.status === "REVIEWED").length;
  const statResolved = allReports.filter((r) => r.status === "RESOLVED").length;

  const reports: Report[] = filteredResult ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Community Moderation</h1>
        <p className="text-zinc-400 mt-1">
          Review reports, manage content, and maintain community standards.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Flag className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                  ) : (
                    statPending
                  )}
                </p>
                <p className="text-sm text-zinc-400">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Eye className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                  ) : (
                    statReviewed
                  )}
                </p>
                <p className="text-sm text-zinc-400">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ShieldAlert className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-zinc-400">Auto-Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                  ) : (
                    statResolved
                  )}
                </p>
                <p className="text-sm text-zinc-400">Resolved This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        {statusFilters.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={
              statusFilter === status
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            }
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Reports Queue */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Reports Queue
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Review and take action on reported content and users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          )}

          {filteredError && !filteredLoading && (
            <p className="text-center text-red-400 py-8">
              Failed to load reports. Please try again.
            </p>
          )}

          {!filteredLoading &&
            !filteredError &&
            reports.map((report) => {
              const reporterName = report.reporter.fullName;
              const reporterInitials = getInitials(reporterName);
              const targetDisplay = report.targetId ?? "Reported Content";
              const targetInitials =
                report.targetId?.charAt(0).toUpperCase() ?? "?";
              const uiStatus = mapStatusToUi(report.status);
              const formattedDate = formatDate(report.createdAt);

              return (
                <div
                  key={report.id}
                  className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 space-y-3"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          report.targetType === "POST"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : report.targetType === "COMMENT"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {report.targetType === "POST" ? (
                          <Image className="h-3 w-3 mr-1" />
                        ) : report.targetType === "COMMENT" ? (
                          <MessageSquare className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {report.targetType}
                      </Badge>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {report.reason}
                      </Badge>
                      <Badge
                        className={
                          report.status === "PENDING"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : report.status === "REVIEWED"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {uiStatus}
                      </Badge>
                    </div>
                    <span className="text-xs text-zinc-500">{formattedDate}</span>
                  </div>

                  {/* Reporter & Target */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-500/20 text-green-400 text-[10px] font-bold">
                          {reporterInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-zinc-500">Reporter</p>
                        <p className="text-sm text-zinc-300">{reporterName}</p>
                      </div>
                    </div>
                    <div className="text-zinc-600">→</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-red-500/20 text-red-400 text-[10px] font-bold">
                          {targetInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-zinc-500">Reported</p>
                        <p className="text-sm text-zinc-300">{targetDisplay}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-1">Reason:</p>
                    <p className="text-sm text-zinc-300 italic">
                      &quot;{report.reason}&quot;
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutating}
                      onClick={() => handleAction(report.id, "DISMISSED")}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      {mutating ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutating}
                      onClick={() => handleAction(report.id, "RESOLVED")}
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      {mutating ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      Warn User
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutating}
                      onClick={() => handleAction(report.id, "RESOLVED")}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {mutating ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Remove Content
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutating}
                      onClick={() => handleAction(report.id, "RESOLVED")}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {mutating ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Ban className="h-3 w-3 mr-1" />
                      )}
                      Ban User
                    </Button>
                  </div>
                </div>
              );
            })}

          {!filteredLoading && !filteredError && reports.length === 0 && (
            <p className="text-center text-zinc-500 py-8">
              No reports matching this filter.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Blocked Keywords */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Blocked Keywords
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Posts and comments containing these words will be auto-flagged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {blockedKeywords.map((keyword) => (
              <Badge
                key={keyword}
                className="bg-red-500/10 text-red-400 border-red-500/20 gap-1"
              >
                {keyword}
                <button className="hover:text-red-300 transition">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add blocked keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white flex-1"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
