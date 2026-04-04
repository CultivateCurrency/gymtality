"use client";

import { useState } from "react";
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
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Eye,
  Search,
  UserCheck,
  ShieldAlert,
  FileText,
  Star,
  Users,
  Loader2,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useApi, useMutation, apiFetch } from "@/hooks/use-api";

interface CoachUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePhoto: string | null;
  role: string;
  createdAt: string;
}

interface CoachProfile {
  id: string;
  userId: string;
  bio: string | null;
  category: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "DENIED";
  approvedAt: string | null;
  createdAt: string;
  user: CoachUser;
}

const CATEGORY_LABELS: Record<string, string> = {
  WORKOUT_TRAINER: "Workout Trainer",
  MEDITATION: "Meditation",
  YOGA: "Yoga",
  HEALTHY_FOODS: "Healthy Foods",
  BOOKS: "Books",
  PSYCHIATRIST: "Mindset",
  MINDSET: "Mindset",
};

function formatCategory(cat: string | null): string {
  if (!cat) return "Uncategorized";
  return CATEGORY_LABELS[cat] ?? cat;
}

interface CoachesResponse {
  coaches: CoachProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  return new Date(iso).toISOString().split("T")[0];
}

export default function AdminCoachesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<CoachProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingCoach, setViewingCoach] = useState<CoachProfile | null>(null);

  const {
    data: pendingData,
    loading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useApi<CoachesResponse>("/api/admin/coaches?status=PENDING");

  const {
    data: approvedData,
    loading: approvedLoading,
    error: approvedError,
    refetch: refetchApproved,
  } = useApi<CoachesResponse>("/api/admin/coaches?status=APPROVED");

  const { mutate, loading: mutating } = useMutation<
    { success: boolean },
    { userId: string; approvalStatus: "APPROVED" | "DENIED" }
  >("/api/admin/coaches", "PUT");

  const pendingCoaches = pendingData?.coaches ?? [];
  const approvedCoaches = approvedData?.coaches ?? [];

  const filteredCoaches = approvedCoaches.filter(
    (c) =>
      c.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleApprove(coach: CoachProfile) {
    await mutate({ userId: coach.userId, approvalStatus: "APPROVED" });
    refetchPending();
    refetchApproved();
  }

  async function handleDeny(coach: CoachProfile) {
    await mutate({ userId: coach.userId, approvalStatus: "DENIED" });
    refetchPending();
    refetchApproved();
  }

  async function handleDelete(coach: CoachProfile) {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/admin/users/${coach.userId}`, { method: 'DELETE' });
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
      refetchApproved();
      refetchPending();
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Coach Management</h1>
        <p className="text-zinc-400 mt-1">
          Review applications, manage approvals, and oversee coaches.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {pendingData?.pagination.total ?? 0}
                </p>
                <p className="text-sm text-zinc-400">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {approvedData?.pagination.total ?? 0}
                </p>
                <p className="text-sm text-zinc-400">Approved Coaches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-zinc-400">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-zinc-400">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-zinc-900 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Approvals
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Review coach applications and certifications before approving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading pending approvals...</span>
            </div>
          )}

          {pendingError && !pendingLoading && (
            <p className="text-center text-red-400 py-8">
              Failed to load pending approvals.
            </p>
          )}

          {!pendingLoading && !pendingError && pendingCoaches.map((coach) => (
            <div
              key={coach.id}
              className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-amber-500/20 text-amber-500 font-bold">
                      {getInitials(coach.user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-white">{coach.user.fullName}</h4>
                    <p className="text-xs text-zinc-400">{coach.user.email}</p>
                    <Badge className="mt-1 bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                      {formatCategory(coach.category)}
                    </Badge>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">
                  Applied {formatDate(coach.createdAt)}
                </span>
              </div>

              {coach.bio && (
                <p className="text-sm text-zinc-300">{coach.bio}</p>
              )}

              {/* Certifications */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-md border border-zinc-700">
                    <Award className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-zinc-300">N/A</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={mutating}
                  onClick={() => handleApprove(coach)}
                >
                  {mutating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  disabled={mutating}
                  onClick={() => handleDeny(coach)}
                >
                  {mutating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  Deny
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setViewingCoach(coach)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Full Application
                </Button>
              </div>
            </div>
          ))}

          {!pendingLoading && !pendingError && pendingCoaches.length === 0 && (
            <p className="text-center text-zinc-500 py-8">
              No pending approvals at this time.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Approved Coaches */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Approved Coaches
              </CardTitle>
              <CardDescription className="text-zinc-400">
                All verified coaches on the platform.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {approvedLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading approved coaches...</span>
            </div>
          )}

          {approvedError && !approvedLoading && (
            <p className="text-center text-red-400 py-8">
              Failed to load approved coaches.
            </p>
          )}

          {!approvedLoading && !approvedError && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Coach</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Rating</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Clients</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Certifications</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.map((coach) => (
                    <tr key={coach.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs font-bold">
                              {getInitials(coach.user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">{coach.user.fullName}</p>
                            <p className="text-xs text-zinc-500">{coach.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
                          {formatCategory(coach.category)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-white flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          N/A
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300">N/A</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Verified
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700">
                          N/A
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-400 hover:bg-amber-500/10 hover:text-amber-400"
                          >
                            <ShieldAlert className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(coach)}
                            className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                            title="Delete Account"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCoaches.length === 0 && (
                <p className="text-center text-zinc-500 py-8">
                  {searchQuery ? "No coaches match your search." : "No approved coaches yet."}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Coach Account</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Permanently delete <span className="text-white font-medium">{deleteConfirm?.user.fullName}</span>?
            This will remove all their data and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Full Application Modal */}
      <Dialog open={!!viewingCoach} onOpenChange={() => setViewingCoach(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Coach Application</DialogTitle>
          </DialogHeader>
          {viewingCoach && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg font-bold text-amber-400">
                  {getInitials(viewingCoach.user.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-white">{viewingCoach.user.fullName}</p>
                  <p className="text-sm text-zinc-400">{viewingCoach.user.email}</p>
                  <p className="text-xs text-zinc-500">@{viewingCoach.user.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Category</p>
                  <p className="text-white font-medium">{formatCategory(viewingCoach.category)}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Applied</p>
                  <p className="text-white font-medium">{formatDate(viewingCoach.createdAt)}</p>
                </div>
              </div>
              {viewingCoach.bio && (
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Bio</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{viewingCoach.bio}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={mutating}
                  onClick={() => { handleApprove(viewingCoach); setViewingCoach(null); }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10"
                  disabled={mutating}
                  onClick={() => { handleDeny(viewingCoach); setViewingCoach(null); }}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Deny
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
