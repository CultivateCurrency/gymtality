"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Edit,
  Dumbbell,
  BookOpen,
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const PROFILE = {
  fullName: "Jordan Hayes",
  username: "forge_jordan",
  bio: "Fitness enthusiast | Powerlifting | Trying to be 1% better every day. Forge member since 2025.",
  stats: {
    posts: 24,
    followers: 312,
    following: 148,
    plans: 5,
    workouts: 186,
  },
};

const SAMPLE_POSTS = [
  {
    id: "1",
    title: "New PR: 225lb Bench!",
    caption: "Months of consistent work finally paid off. Next stop — 250.",
    mediaType: "IMAGE",
    likes: 34,
    comments: 6,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "5AM grind",
    caption: "Nobody said it was going to be easy. They said it would be worth it.",
    mediaType: "IMAGE",
    likes: 52,
    comments: 11,
    createdAt: "5 days ago",
  },
  {
    id: "3",
    title: "Leg day recap",
    caption: "Squats, lunges, and leg press. Walking is going to be interesting tomorrow.",
    mediaType: "VIDEO",
    likes: 28,
    comments: 4,
    createdAt: "1 week ago",
  },
];

const SAMPLE_PLANS = [
  { id: "1", name: "12-Week Strength Builder", coach: "Coach Mike", progress: 67 },
  { id: "2", name: "Cut & Lean Program", coach: "Coach Sarah", progress: 30 },
];

const SAMPLE_WORKOUTS = [
  { id: "1", name: "Push Day A", date: "Mar 14, 2026", duration: "52 min", exercises: 6 },
  { id: "2", name: "Pull Day A", date: "Mar 12, 2026", duration: "48 min", exercises: 5 },
  { id: "3", name: "Leg Day", date: "Mar 10, 2026", duration: "55 min", exercises: 7 },
];

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-orange-500/20 text-orange-500 text-3xl font-bold">
                {PROFILE.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{PROFILE.fullName}</h1>
                  <p className="text-zinc-400 text-sm">@{PROFILE.username}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{PROFILE.bio}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-zinc-800">
            {[
              { label: "Posts", value: PROFILE.stats.posts },
              { label: "Followers", value: PROFILE.stats.followers },
              { label: "Following", value: PROFILE.stats.following },
              { label: "Plans", value: PROFILE.stats.plans },
              { label: "Workouts", value: PROFILE.stats.workouts },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 w-full">
          <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Posts
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Plans Accepted
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Workouts Done
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-4 space-y-4">
          {SAMPLE_POSTS.map((post) => (
            <Card key={post.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold text-white">{post.title}</h3>
                <p className="text-sm text-zinc-300">{post.caption}</p>
                <div className="h-40 bg-zinc-800 rounded-lg flex items-center justify-center">
                  {post.mediaType === "IMAGE" ? (
                    <ImageIcon className="h-8 w-8 text-zinc-600" />
                  ) : (
                    <Video className="h-8 w-8 text-zinc-600" />
                  )}
                </div>
                <div className="flex items-center gap-6 pt-2 border-t border-zinc-800 text-sm">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Heart className="h-4 w-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                  </span>
                  <span className="text-zinc-500 ml-auto text-xs">{post.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-4 space-y-4">
          {SAMPLE_PLANS.map((plan) => (
            <Card key={plan.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/20">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-zinc-400">{plan.coach}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-500">{plan.progress}%</p>
                    <p className="text-xs text-zinc-500">Complete</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Workouts Tab */}
        <TabsContent value="workouts" className="mt-4 space-y-4">
          {SAMPLE_WORKOUTS.map((workout) => (
            <Card key={workout.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Dumbbell className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{workout.name}</h3>
                    <p className="text-sm text-zinc-400">
                      {workout.exercises} exercises &middot; {workout.duration}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">{workout.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
