"use client";

import { useState } from "react";
import { use } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  User,
  Loader2,
  UserPlus,
  UserCheck,
  Dumbbell,
  FileText,
  Heart,
  MapPin,
  Send,
  Home,
  TreePine,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";

interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  profilePhoto: string | null;
  role: string;
  profile: {
    bio: string | null;
    height: string | null;
    weight: string | null;
  } | null;
  _count: {
    posts: number;
    followers: number;
    following: number;
    workoutPlans: number;
    workoutSessions: number;
  };
}

interface ProfileResponse {
  user: UserProfile;
  isFollowing: boolean;
}

export default function ViewProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const { data, loading, refetch } = useApi<ProfileResponse>(
    `/api/users/${id}/profile`
  );

  const [followLoading, setFollowLoading] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState<"indoor" | "outdoor">("indoor");
  const [workoutLocation, setWorkoutLocation] = useState("");
  const [requestSending, setRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const profileUser = data?.user;
  const isFollowing = data?.isFollowing ?? false;
  const isOwnProfile = currentUserId === id;

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await apiFetch(`/api/users/${id}/follow`, { method: "POST" });
      refetch();
    } catch {
    } finally {
      setFollowLoading(false);
    }
  };

  const handleWorkoutRequest = async () => {
    if (!workoutLocation.trim() && workoutType === "outdoor") return;
    setRequestSending(true);
    try {
      await apiFetch("/api/community/workout-request", {
        method: "POST",
        body: JSON.stringify({
          receiverId: id,
          type: workoutType,
          location: workoutLocation || null,
        }),
      });
      setRequestSent(true);
      setWorkoutDialogOpen(false);
    } catch {
    } finally {
      setRequestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <User className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              {profileUser.profilePhoto ? (
                <img
                  src={profileUser.profilePhoto}
                  alt={profileUser.fullName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-orange-500/20 text-orange-500 text-2xl">
                  {profileUser.fullName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

            <h1 className="text-2xl font-bold text-white">{profileUser.fullName}</h1>
            <p className="text-zinc-400 text-sm">@{profileUser.username}</p>

            {profileUser.profile?.bio && (
              <p className="text-zinc-300 text-sm mt-3 max-w-md">
                {profileUser.profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-5 gap-6 mt-6">
              {[
                { label: "Posts", value: profileUser._count.posts },
                { label: "Followers", value: profileUser._count.followers },
                { label: "Following", value: profileUser._count.following },
                { label: "Plans", value: profileUser._count.workoutPlans },
                { label: "Workouts", value: profileUser._count.workoutSessions },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={
                    isFollowing
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : isFollowing ? (
                    <UserCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {isFollowing ? "Following" : "Follow"}
                </Button>

                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                  onClick={() => setWorkoutDialogOpen(true)}
                  disabled={requestSent}
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  {requestSent ? "Request Sent" : "Workout Together"}
                </Button>

                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-white font-medium">{profileUser._count.posts}</p>
              <p className="text-xs text-zinc-500">Posts Posted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 flex items-center gap-3">
            <Dumbbell className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-white font-medium">{profileUser._count.workoutPlans}</p>
              <p className="text-xs text-zinc-500">Plans Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-white font-medium">{profileUser._count.workoutSessions}</p>
              <p className="text-xs text-zinc-500">Workouts Done</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout Together Dialog */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Workout Together with {profileUser.fullName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400 mb-2">Workout Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWorkoutType("indoor")}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition ${
                    workoutType === "indoor"
                      ? "border-orange-500 bg-orange-500/10 text-orange-500"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <Home className="h-5 w-5" />
                  Indoor
                </button>
                <button
                  onClick={() => setWorkoutType("outdoor")}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition ${
                    workoutType === "outdoor"
                      ? "border-orange-500 bg-orange-500/10 text-orange-500"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <TreePine className="h-5 w-5" />
                  Outdoor
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                <MapPin className="h-3 w-3 inline mr-1" />
                Location to Meet
              </label>
              <Input
                placeholder="e.g., Central Park, Local gym..."
                value={workoutLocation}
                onChange={(e) => setWorkoutLocation(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <Button
              onClick={handleWorkoutRequest}
              disabled={requestSending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {requestSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
