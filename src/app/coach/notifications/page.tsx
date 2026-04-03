"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useApi, apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Circle,
  Filter,
  Loader2,
  CreditCard,
  Heart,
  MessageSquare,
  Users,
  Zap,
  Calendar,
  Shield,
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

const typeFilters = [
  "ALL",
  "ACCOUNT_APPROVED",
  "PAYMENT_SUCCESS",
  "SUBSCRIPTION_RENEWAL",
  "LIKE",
  "COMMENT",
  "NEW_POST",
  "EVENT_REMINDER",
  "SYSTEM",
] as const;

function getNotificationIcon(type: string) {
  switch (type) {
    case "PAYMENT_SUCCESS":
    case "SUBSCRIPTION_RENEWAL":
      return <CreditCard className="h-5 w-5 text-green-400" />;
    case "LIKE":
      return <Heart className="h-5 w-5 text-pink-400" />;
    case "COMMENT":
    case "COACH_MESSAGE":
      return <MessageSquare className="h-5 w-5 text-blue-400" />;
    case "ACCOUNT_APPROVED":
      return <Shield className="h-5 w-5 text-green-400" />;
    case "EVENT_REMINDER":
      return <Calendar className="h-5 w-5 text-orange-400" />;
    case "NEW_POST":
      return <Users className="h-5 w-5 text-purple-400" />;
    default:
      return <Zap className="h-5 w-5 text-orange-400" />;
  }
}

export default function CoachNotificationsPage() {
  const { user } = useAuthStore();
  const { data: notifications, loading, error, refetch } =
    useApi<NotificationItem[]>(user ? "/api/notifications" : null);
  const [filter, setFilter] = useState<string>("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const items = notifications ?? [];
  const filtered =
    filter === "ALL" ? items : items.filter((n) => n.type === filter);
  const unreadCount = items.filter((n) => !n.read).length;

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return; // already read, no action needed
    setTogglingId(id);
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update notification");
    } finally {
      setTogglingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch(`/api/notifications/read-all`, { method: "PATCH" });
      refetch();
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark all as read");
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-zinc-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
        {typeFilters.map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
            className={
              filter === type
                ? "bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0"
            }
          >
            {type === "ALL" ? "All" : type.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          {error ? (
            <div className="text-center py-8">
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">No notifications to show.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition cursor-pointer ${
                    notif.read
                      ? "hover:bg-zinc-800/50"
                      : "bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10"
                  }`}
                  onClick={() => handleToggleRead(notif.id, notif.read)}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          notif.read ? "text-zinc-300" : "text-white"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="shrink-0 mt-1">
                    {togglingId === notif.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                    ) : notif.read ? (
                      <Circle className="h-4 w-4 text-zinc-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
