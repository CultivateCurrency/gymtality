"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gift,
  Copy,
  Check,
  Users,
  TrendingUp,
  Award,
  Link as LinkIcon,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";

interface ReferralStats {
  totalInvites: number;
  accepted: number;
  rewardsEarned: number;
}

interface AffiliateLink {
  id: string;
  code: string;
  campaignName: string | null;
  clicks: number;
  conversions: number;
  createdAt: string;
}

interface ReferralsResponse {
  stats: ReferralStats;
  links: AffiliateLink[];
}

export default function ReferralsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");

  const { data, loading, error, refetch } = useApi<ReferralsResponse>("/api/referrals");

  const stats = data?.stats ?? { totalInvites: 0, accepted: 0, rewardsEarned: 0 };
  const links = data?.links ?? [];

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateLink = async () => {
    try {
      await apiFetch("/api/referrals", {
        method: "POST",
        body: JSON.stringify({ campaignName: campaignName || null }),
      });
      setCampaignName("");
      setDialogOpen(false);
      refetch();
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gift className="h-8 w-8 text-orange-500" />
            Invite & Referrals
          </h1>
          <p className="text-zinc-400 mt-1">Share Gymtality and earn rewards</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create Referral Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Campaign name (optional)"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleGenerateLink}
              >
                Generate Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                  {loading ? "--" : stats.totalInvites}
                </p>
                <p className="text-sm text-zinc-400">Total Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                  {loading ? "--" : stats.accepted}
                </p>
                <p className="text-sm text-zinc-400">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Award className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                  {loading ? "--" : stats.rewardsEarned}
                </p>
                <p className="text-sm text-zinc-400">Rewards Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load referral data. Please try again.</p>
        </div>
      )}

      {/* Referral Links / Affiliate Section */}
      {!loading && !error && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-orange-500" />
              Your Referral Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400">No referral links yet. Generate one above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition"
                  >
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <ExternalLink className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {link.campaignName || "General Referral"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/signup?ref=${link.code}`
                          : link.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span>{link.clicks} clicks</span>
                      <span>{link.conversions} signups</span>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        {new Date(link.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                      onClick={() => handleCopy(link.code)}
                    >
                      {copied === link.code ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
