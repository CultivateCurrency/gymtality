"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useApi, useMutation } from "@/hooks/use-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  ShieldBan,
  AlertTriangle,
  Send,
  X,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";

const contentTypes = ["POST", "USER", "COMMENT", "CONTENT"] as const;

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface BlockItem {
  id: string;
  blockedId: string;
  blocked: { id: string; fullName: string; email: string };
  createdAt: string;
}

interface ReportsData {
  reports: ReportItem[];
  blocks: BlockItem[];
}

export default function CoachReportsPage() {
  const { data: session } = useSession();
  const {
    data: reportsData,
    loading,
    error,
    refetch,
  } = useApi<ReportsData>(
    session?.user ? "/api/coach/reports" : null
  );
  const { mutate: submitReport, loading: submitting, error: submitError } =
    useMutation<ReportItem>("/api/coach/reports", "POST");

  const [targetType, setTargetType] = useState<string>("POST");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [blockUserId, setBlockUserId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reports = reportsData?.reports ?? [];
  const blocks = reportsData?.blocks ?? [];

  const handleSubmitReport = async () => {
    if (!reason.trim() || !targetId.trim()) return;
    const result = await submitReport({
      action: "report",
      targetType,
      targetId,
      reason,
    });
    if (result) {
      setTargetId("");
      setReason("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      refetch();
    }
  };

  const handleBlockUser = async () => {
    if (!blockUserId.trim()) return;
    const result = await submitReport({
      action: "block",
      blockedId: blockUserId,
    });
    if (result) {
      setBlockUserId("");
      refetch();
    }
  };

  const handleUnblock = async (blockedId: string) => {
    await fetch("/api/coach/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unblock", blockedId }),
    });
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports & Blocks</h1>
        <p className="text-zinc-400 mt-1">
          Report inappropriate content or block suspicious users.
        </p>
      </div>

      {/* Report Content */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-500" />
            Report Content
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Flag inappropriate or irrelevant content for review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300">Content Type</label>
            <div className="flex gap-2 flex-wrap">
              {contentTypes.map((type) => (
                <Button
                  key={type}
                  variant={targetType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTargetType(type)}
                  className={
                    targetType === type
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300">Content / User ID</label>
            <Input
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Enter the ID of the content or user"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
            />
          </div>

          {submitted && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Report submitted successfully.
            </div>
          )}
          {submitError && (
            <p className="text-sm text-red-400">{submitError}</p>
          )}

          <Button
            onClick={handleSubmitReport}
            disabled={submitting || !reason.trim() || !targetId.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Block User */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldBan className="h-5 w-5 text-red-500" />
            Block a User
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Block suspicious user profiles from interacting with your content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={blockUserId}
              onChange={(e) => setBlockUserId(e.target.value)}
              placeholder="Enter user ID to block"
              className="bg-zinc-800 border-zinc-700 text-white flex-1"
            />
            <Button
              onClick={handleBlockUser}
              disabled={!blockUserId.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <ShieldBan className="h-4 w-4 mr-2" />
              Block
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldBan className="h-5 w-5 text-red-500" />
            Blocked Profiles
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Users you have blocked. They cannot interact with your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blocks.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              No blocked users.
            </p>
          ) : (
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-zinc-700">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {block.blocked.fullName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {block.blocked.email} — Blocked{" "}
                        {new Date(block.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(block.blockedId)}
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-red-400"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Reports */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            My Reports
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Reports you have submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-6">
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                className="mt-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Retry
              </Button>
            </div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              No reports submitted yet.
            </p>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-zinc-700 text-zinc-300 border-zinc-600 text-[10px]">
                        {report.targetType}
                      </Badge>
                      <p className="text-sm text-white">{report.reason}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      report.status === "RESOLVED"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : report.status === "REVIEWED"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }
                  >
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
