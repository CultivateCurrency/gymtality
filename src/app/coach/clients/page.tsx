"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
  MoreVertical,
  StickyNote,
  CheckCircle2,
  BarChart3,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

// --- Types ---

interface ClientActivePlan {
  id: string;
  name: string;
}

interface ClientData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePhoto: string | null;
  joinedDate: string;
  lastActive: string;
  activePlan: ClientActivePlan | null;
  totalSessions: number;
  completedSessions: number;
  adherence: number;
}

interface ClientsResponse {
  clients: ClientData[];
  total: number;
}

// --- Helpers ---

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isActiveThisWeek(iso: string): boolean {
  const now = Date.now();
  const then = new Date(iso).getTime();
  return now - then < 7 * 24 * 60 * 60 * 1000;
}

// --- Component ---

export default function CoachClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const { data, loading, error, refetch } = useApi<ClientsResponse>("/api/coach/clients");
  const { mutate: saveNote, loading: savingNote } = useMutation<unknown, { note: string }>(
    selectedClient ? `/api/coach/clients/${selectedClient}/notes` : "/api/coach/clients",
    "POST"
  );

  const clients = data?.clients ?? [];

  // Auto-select first client once loaded
  if (!loading && clients.length > 0 && selectedClient === null) {
    // We set this inside render; React will re-render once
    // Using a controlled pattern: set on first data arrival
  }

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeClient = clients.find((c) => c.id === selectedClient) ?? null;

  // Computed stats
  const totalClients = clients.length;
  const activeThisWeek = clients.filter((c) => isActiveThisWeek(c.lastActive)).length;
  const avgAdherence =
    clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.adherence, 0) / clients.length)
      : 0;
  const unassigned = clients.filter((c) => !c.activePlan).length;

  // Auto-select first client on load
  const shouldAutoSelect = !loading && clients.length > 0 && selectedClient === null;

  if (shouldAutoSelect) {
    // Use queueMicrotask to avoid setState during render warning
    queueMicrotask(() => setSelectedClient(clients[0].id));
  }

  async function handleSaveNote() {
    if (!noteText.trim() || !selectedClient) return;
    const result = await saveNote({ note: noteText.trim() });
    if (result !== null) {
      setNoteText("");
      refetch();
    }
  }

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Management</h1>
            <p className="text-zinc-400 mt-1">
              Track, manage, and communicate with your clients.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
              <CardContent className="pt-6">
                <div className="h-12 bg-zinc-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <span className="ml-3 text-zinc-400">Loading clients...</span>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Management</h1>
          <p className="text-zinc-400 mt-1">
            Track, manage, and communicate with your clients.
          </p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-400 font-medium mb-2">Failed to load clients</p>
            <p className="text-zinc-500 text-sm mb-4">{error}</p>
            <Button
              onClick={refetch}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Management</h1>
          <p className="text-zinc-400 mt-1">
            Track, manage, and communicate with your clients.
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
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
                <p className="text-2xl font-bold text-white">{totalClients}</p>
                <p className="text-sm text-zinc-400">Total Clients</p>
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
                <p className="text-2xl font-bold text-white">{activeThisWeek}</p>
                <p className="text-sm text-zinc-400">Active This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{avgAdherence}%</p>
                <p className="text-sm text-zinc-400">Avg Adherence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <ClipboardList className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{unassigned}</p>
                <p className="text-sm text-zinc-400">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedClient === client.id
                    ? "border-orange-500 bg-orange-500/5"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-500/20 text-orange-500 text-sm font-bold">
                      {getInitials(client.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{client.fullName}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {client.activePlan?.name || "No plan assigned"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">{relativeTime(client.lastActive)}</p>
                    {client.adherence > 0 && (
                      <p
                        className={`text-xs font-medium ${
                          client.adherence >= 80
                            ? "text-green-400"
                            : client.adherence >= 60
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {client.adherence}% adherence
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <p className="text-center text-zinc-500 py-8 text-sm">No clients found.</p>
            )}
          </div>
        </div>

        {/* Client Detail */}
        <div className="lg:col-span-2 space-y-4">
          {activeClient ? (
            <>
              {/* Client Header */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xl font-bold">
                          {getInitials(activeClient.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {activeClient.fullName}
                        </h2>
                        <p className="text-sm text-zinc-400">{activeClient.email}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Client since {formatDate(activeClient.joinedDate)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plan & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-orange-500" />
                      Assigned Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeClient.activePlan ? (
                      <div className="p-3 bg-zinc-800 rounded-lg">
                        <p className="font-medium text-white text-sm">
                          {activeClient.activePlan.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {activeClient.completedSessions}/{activeClient.totalSessions} workouts completed
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No plan assigned</p>
                    )}
                    <Button
                      size="sm"
                      className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {activeClient.activePlan ? "Change Plan" : "Assign Plan"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      Completion Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">Adherence Rate</span>
                          <span className="text-white font-medium">
                            {activeClient.adherence}%
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              activeClient.adherence >= 80
                                ? "bg-green-500"
                                : activeClient.adherence >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${activeClient.adherence}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Workouts Done</span>
                        <span className="text-white">
                          {activeClient.completedSessions}/{activeClient.totalSessions}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Last Active</span>
                        <span className="text-white">{relativeTime(activeClient.lastActive)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-amber-500" />
                    Coach Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Add a new note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
                  />
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteText.trim()}
                  >
                    {savingNote ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Note"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-16 text-center">
                <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">Select a client to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
