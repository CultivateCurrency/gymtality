"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useUpload } from "@/hooks/use-upload";
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
  Award,
  Upload,
  ShieldBan,
  Tag,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const coachCategories = [
  "Workout Trainer",
  "Meditation",
  "Yoga",
  "Nutritionist",
  "Mindset",
  "Strength Coach",
  "Cardio Specialist",
];

interface UserProfile {
  id: string;
  fullName: string;
  username: string | null;
  email: string;
  profilePhoto: string | null;
  role: string;
  coachProfile?: { category?: string };
}

interface BlockedUser {
  id: string;
  fullName: string;
}

export default function CoachSettingsPage() {
  const router = useRouter();
  const { user: storeUser, logout } = useAuthStore();
  const { data: profile, loading: profileLoading } = useApi<UserProfile>("/api/users/me");
  const { data: certsData } = useApi<{ url: string; name: string; status: string; uploadedAt: string }[]>("/api/coach/certifications");
  const { data: blockedData } = useApi<BlockedUser[]>("/api/users/me/blocked");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Workout Trainer");
  const [certifications, setCertifications] = useState<
    { url: string; name: string; status: string; uploadedAt: string }[]
  >([]);
  const [blockedAccounts, setBlockedAccounts] = useState<BlockedUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const { upload, uploading } = useUpload();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Populate state from API profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setProfilePhoto(profile.profilePhoto || null);
      if (profile.coachProfile?.category) {
        setSelectedCategory(profile.coachProfile.category);
      }
    } else if (storeUser) {
      setFullName(storeUser.fullName || "");
      setEmail(storeUser.email || "");
    }
  }, [profile, storeUser]);

  // Load certifications on mount
  useEffect(() => {
    if (certsData) setCertifications(certsData);
  }, [certsData]);

  // Load blocked accounts on mount
  useEffect(() => {
    if (blockedData) setBlockedAccounts(blockedData);
  }, [blockedData]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const result = await upload(file, "profile-photos", "image");
      setProfilePhoto(result.url);
      // Auto-save to backend immediately
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ profilePhoto: result.url }),
      });
      toast.success("Profile photo updated");
    } catch (err: any) {
      setProfilePhoto(null);
      toast.error(err.message || "Failed to update profile photo");
    }
  };

  const handleCertUpload = async (file: File) => {
    try {
      const result = await upload(file, "certifications", "document");
      const newCert = { url: result.url, name: result.filename, status: "Pending Review", uploadedAt: new Date().toLocaleDateString() };
      setCertifications([...certifications, newCert]);
      // Save certification URL to backend
      try {
        await apiFetch("/api/coach/certifications", {
          method: "POST",
          body: JSON.stringify({ url: result.url, filename: result.filename }),
        });
        toast.success("Certification uploaded and saved");
      } catch (err: any) {
        toast.error(err.message || "Failed to save certification");
      }
    } catch {
      // error handled by hook
    }
  };

  const handleSaveChanges = async () => {
    const userId = profile?.id || storeUser?.id;
    if (!userId) return;
    setSaving(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ fullName, category: selectedCategory }),
      });
      toast.success("Profile saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await apiFetch(`/api/users/${userId}/block`, { method: "DELETE" });
      setBlockedAccounts((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Coach Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your profile, certifications, and preferences.</p>
      </div>

      {/* Profile Section */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            Profile
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Update your coach profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-orange-500/20 text-orange-500 text-2xl font-bold">
                    {getInitials(fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="absolute bottom-0 right-0 p-1.5 bg-orange-500 rounded-full hover:bg-orange-600 transition cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                ) : (
                  <Camera className="h-3 w-3 text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
              </label>
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
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => { setPasswordDialogOpen(true); setPasswordError(""); setPasswordSuccess(false); }}
            >
              Change Password
            </Button>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {passwordError && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">Password changed successfully!</p>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-300">Current Password</label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-300">New Password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-300">Confirm New Password</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={changingPassword}
                    onClick={async () => {
                      setPasswordError("");
                      setPasswordSuccess(false);
                      if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return; }
                      if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
                      setChangingPassword(true);
                      try {
                        await apiFetch("/api/users/settings/password", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) });
                        setPasswordSuccess(true);
                        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
                      } catch (err: any) {
                        setPasswordError(err.message || "Failed to change password");
                      } finally { setChangingPassword(false); }
                    }}
                  >
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Change Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" />
            Fitness Certifications
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Upload or update your professional certifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {certifications.length > 0 ? (
            certifications.map((cert, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Award
                    className={`h-5 w-5 ${
                      cert.status === "Verified" ? "text-green-500" : "text-amber-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{cert.name}</p>
                    <p className="text-xs text-zinc-500">
                      Uploaded {cert.uploadedAt}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    cert.status === "Verified"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }
                >
                  {cert.status === "Verified" && (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  )}
                  {cert.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">
              No certifications uploaded yet.
            </p>
          )}

          <label className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-orange-500/50 transition cursor-pointer block">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-orange-500 mx-auto mb-2 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
            )}
            <p className="text-sm text-zinc-400">{uploading ? "Uploading..." : "Upload new certification"}</p>
            <p className="text-xs text-zinc-600 mt-1">PDF up to 20MB</p>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCertUpload(file);
              }}
            />
          </label>
        </CardContent>
      </Card>

      {/* Coach Category */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-orange-500" />
            Coach Category
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Choose your primary coaching category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {coachCategories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Accounts */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldBan className="h-5 w-5 text-red-500" />
            Blocked Accounts
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Users you have blocked from your content and sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blockedAccounts.length > 0 ? (
            <div className="space-y-2">
              {blockedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{account.fullName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-red-400"
                    onClick={() => handleUnblock(account.id)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">
              No blocked accounts.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Support & Legal */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 divide-y divide-zinc-800">
          <button
            onClick={() => router.push("/coach/help")}
            className="flex items-center justify-between py-3 w-full group"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-green-400" />
              <span className="text-zinc-300 group-hover:text-white transition">
                Help & Support
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="flex items-center justify-between py-3 w-full group"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="text-zinc-300 group-hover:text-white transition">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
          <button
            onClick={() => router.push("/terms")}
            className="flex items-center justify-between py-3 w-full group"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-zinc-400" />
              <span className="text-zinc-300 group-hover:text-white transition">
                Terms & Conditions
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        onClick={() => { logout(); router.push("/login"); }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
