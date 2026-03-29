"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Users,
  Search,
  Eye,
  Ban,
  ShieldAlert,
  UserCheck,
  Crown,
  Filter,
  Loader2,
  Trash2,
  ShieldOff,
  Shield,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";

interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePhoto: string | null;
  role: "MEMBER" | "COACH" | "ADMIN";
  emailVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  points: number;
  profile: Record<string, unknown>;
  _count: {
    posts: number;
    workoutSessions: number;
    followers: number;
    following: number;
  };
}

interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const roleFilters = ["All", "Member", "Coach", "Admin"];

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [blockConfirm, setBlockConfirm] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (roleFilter !== "All") params.set("role", roleFilter.toUpperCase());
    return `/api/admin/users?${params}`;
  }, [searchQuery, roleFilter]);

  const { data, loading, error, refetch } = useApi<UsersResponse>(url);

  const users = data?.users ?? [];
  const totalUsers = data?.pagination.total ?? 0;
  const totalVerified = users.filter((u) => u.emailVerified).length;
  const totalBlocked = users.filter((u) => u.isBlocked).length;

  async function handleDelete(user: AdminUser) {
    setActionLoading(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    } finally {
      setDeleteConfirm(null);
      setActionLoading(null);
      refetch();
    }
  }

  async function handleBlockToggle(user: AdminUser) {
    setActionLoading(user.id);
    try {
      await apiFetch(`/api/admin/users/${user.id}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked: !user.isBlocked }),
      });
    } finally {
      setBlockConfirm(null);
      setActionLoading(null);
      refetch();
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-zinc-400 mt-1">
          View, search, and manage all platform users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalUsers}</p>
                <p className="text-sm text-zinc-400">Total Users</p>
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
                <p className="text-2xl font-bold text-white">{totalVerified}</p>
                <p className="text-sm text-zinc-400">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <ShieldAlert className="h-6 w-6 text-amber-500" />
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
              <div className="p-2 rounded-lg bg-red-500/20">
                <Ban className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalBlocked}</p>
                <p className="text-sm text-zinc-400">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-500" />
              {roleFilters.map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                  className={
                    roleFilter === role
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
              <span className="text-zinc-400">Loading users...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-red-400">Failed to load users. Please try again.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Joined</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Points</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const initials = getInitials(user.fullName);
                    const status = user.isBlocked ? "Blocked" : user.emailVerified ? "Active" : "Unverified";
                    const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();

                    return (
                      <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{user.fullName}</p>
                              <p className="text-xs text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              user.role === "ADMIN"
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                : user.role === "COACH"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-zinc-700 text-zinc-300 border-zinc-600"
                            }
                          >
                            {user.role === "ADMIN" && <Crown className="h-3 w-3 mr-1" />}
                            {roleLabel}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              status === "Active"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : status === "Blocked"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            }
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-400">{formatDate(user.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-zinc-300">{user.points.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBlockConfirm(user)}
                              disabled={actionLoading === user.id}
                              className={user.isBlocked
                                ? "border-zinc-700 text-green-400 hover:bg-green-500/10 hover:border-green-500/30"
                                : "border-zinc-700 text-zinc-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30"
                              }
                              title={user.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {user.isBlocked ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(user)}
                              disabled={actionLoading === user.id}
                              className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {users.length === 0 && (
                <p className="text-center text-zinc-500 py-8">No users found matching your criteria.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block/Unblock Confirm */}
      <Dialog open={!!blockConfirm} onOpenChange={() => setBlockConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{blockConfirm?.isBlocked ? 'Unblock User' : 'Block User'}</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            {blockConfirm?.isBlocked
              ? `Unblock ${blockConfirm?.fullName}? They will regain access to the platform.`
              : `Block ${blockConfirm?.fullName}? They will not be able to log in or access any content.`}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBlockConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button
              onClick={() => blockConfirm && handleBlockToggle(blockConfirm)}
              className={blockConfirm?.isBlocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
            >
              {blockConfirm?.isBlocked ? 'Unblock' : 'Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Permanently delete <span className="text-white font-medium">{deleteConfirm?.fullName}</span>?
            This will remove all their data and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
