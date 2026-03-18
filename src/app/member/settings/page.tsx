"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Camera,
  Dumbbell,
  Music,
  CreditCard,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Crown,
} from "lucide-react";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("Jordan Hayes");
  const [username, setUsername] = useState("forge_jordan");
  const [email, setEmail] = useState("jordan@example.com");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account and preferences.</p>
      </div>

      {/* My Profile */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            My Profile
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-orange-500/20 text-orange-500 text-2xl font-bold">
                  J
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1.5 bg-orange-500 rounded-full hover:bg-orange-600 transition">
                <Camera className="h-3 w-3 text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm text-zinc-300">Profile Picture</p>
              <p className="text-xs text-zinc-500">JPG, PNG, or GIF. Max 5MB.</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              prefix="@"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-500" />
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Change Password */}
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <Lock className="h-4 w-4 text-zinc-500" />
              Password
            </label>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Change Password
            </Button>
          </div>

          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 divide-y divide-zinc-800">
          <Link
            href="/member/workouts"
            className="flex items-center justify-between py-3 group"
          >
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-blue-400" />
              <span className="text-zinc-300 group-hover:text-white transition">My Workout Plans</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </Link>
          <Link
            href="/member/music"
            className="flex items-center justify-between py-3 group"
          >
            <div className="flex items-center gap-3">
              <Music className="h-5 w-5 text-purple-400" />
              <span className="text-zinc-300 group-hover:text-white transition">My Playlist</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </Link>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            My Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-amber-400" />
              <div>
                <p className="font-semibold text-white">Free Plan</p>
                <p className="text-xs text-zinc-400">Basic access to workouts and community</p>
              </div>
            </div>
            <Badge className="bg-zinc-700 text-zinc-300 border-zinc-600">Current</Badge>
          </div>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>

      {/* Support & Legal */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 divide-y divide-zinc-800">
          <button className="flex items-center justify-between py-3 w-full group">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-green-400" />
              <span className="text-zinc-300 group-hover:text-white transition">Help & Support</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
          <button className="flex items-center justify-between py-3 w-full group">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="text-zinc-300 group-hover:text-white transition">Privacy Policy</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
          <button className="flex items-center justify-between py-3 w-full group">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-zinc-400" />
              <span className="text-zinc-300 group-hover:text-white transition">Terms & Conditions</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
