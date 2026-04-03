"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Gift, Copy, Check, Users, TrendingUp, DollarSign, Link as LinkIcon,
  Plus, Loader2, ExternalLink, ShoppingBag, Clock, ChevronRight,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";
import Link from "next/link";

interface AffiliateLink {
  id: string;
  code: string;
  type: string;
  campaignName: string | null;
  clicks: number;
  conversions: number;
  createdAt: string;
}

interface Commission {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface ReferralStats {
  totalInvites: number;
  membershipLinks: number;
  storeLinks: number;
  membershipEarnings: number;
  storeEarnings: number;
  totalEarnings: number;
  pendingPayout: number;
}

interface ReferralsResponse {
  stats: ReferralStats;
  links: AffiliateLink[];
  commissions: Commission[];
}

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://www.gymtality.fit";

export default function ReferralsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<"membership" | "store">("membership");
  const [campaignName, setCampaignName] = useState("");
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"membership" | "store">("membership");

  const { data, loading, error, refetch } = useApi<ReferralsResponse>("/api/referrals");

  const stats = data?.stats ?? {
    totalInvites: 0, membershipLinks: 0, storeLinks: 0,
    membershipEarnings: 0, storeEarnings: 0, totalEarnings: 0, pendingPayout: 0,
  };
  const membershipLinks = (data?.links ?? []).filter((l) => l.type === "membership");
  const storeLinks = (data?.links ?? []).filter((l) => l.type === "store");
  const commissions = data?.commissions ?? [];

  const handleCopy = (code: string, type: string) => {
    const url = type === "store"
      ? `${BASE_URL}/member/shop?ref=${code}`
      : `${BASE_URL}/signup?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Link copied to clipboard");
  };

  const handleGenerate = async () => {
    setCreating(true);
    try {
      await apiFetch("/api/referrals", {
        method: "POST",
        body: JSON.stringify({ type: linkType, campaignName: campaignName || null }),
      });
      setCampaignName("");
      setDialogOpen(false);
      setActiveTab(linkType);
      refetch();
      toast.success(`${linkType === "store" ? "Store" : "Membership"} referral link created`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const displayLinks = activeTab === "membership" ? membershipLinks : storeLinks;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gift className="h-8 w-8 text-orange-500" />
            Referrals & Affiliate
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Earn 5% for every subscriber you bring in — recurring monthly — and 5% on every store sale.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
              <Plus className="h-4 w-4 mr-2" /> New Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create Referral Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                {(["membership", "store"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLinkType(t)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      linkType === t
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {t === "membership" ? <Users className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                    <span className="text-sm font-medium capitalize">{t}</span>
                    <span className="text-[11px] text-center leading-tight opacity-70">
                      {t === "membership" ? "5% recurring per sub" : "5% per store order"}
                    </span>
                  </button>
                ))}
              </div>
              <Input
                placeholder="Label / campaign name (optional)"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleGenerate}
                disabled={creating}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", highlight: true },
          { label: "Pending Payout", value: `$${stats.pendingPayout.toFixed(2)}`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Membership Earnings", value: `$${stats.membershipEarnings.toFixed(2)}`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Store Earnings", value: `$${stats.storeEarnings.toFixed(2)}`, icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((s) => (
          <Card key={s.label} className={`border-zinc-800 ${s.highlight ? "bg-gradient-to-br from-green-500/10 to-zinc-900" : "bg-zinc-900"}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg} shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold text-white ${loading ? "opacity-30 animate-pulse" : ""}`}>
                    {loading ? "—" : s.value}
                  </p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it works banner */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">How commissions work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 shrink-0 h-fit">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Membership — 5% recurring</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Share your signup link. After the referred member stays 14 days, you earn 5% of every subscription payment they make — for as long as they stay.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 shrink-0 h-fit">
              <ShoppingBag className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Store — 5% per order</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Share your store link. Anyone who shops using your link earns you 5% of their order total, credited immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links — tabbed */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-orange-500" />
              Your Links
            </CardTitle>
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              {(["membership", "store"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === t ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t === "membership" ? <Users className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                  {t === "membership" ? `Membership (${membershipLinks.length})` : `Store (${storeLinks.length})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : displayLinks.length === 0 ? (
            <div className="text-center py-10">
              <LinkIcon className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No {activeTab} links yet.</p>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white mt-3"
                onClick={() => { setLinkType(activeTab); setDialogOpen(true); }}
              >
                <Plus className="h-3 w-3 mr-1" /> Create one
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayLinks.map((link) => {
                const url = link.type === "store"
                  ? `${BASE_URL}/member/shop?ref=${link.code}`
                  : `${BASE_URL}/signup?ref=${link.code}`;
                return (
                  <div key={link.id} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition group">
                    <div className={`p-2 rounded-lg shrink-0 ${link.type === "store" ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
                      {link.type === "store"
                        ? <ShoppingBag className="h-4 w-4 text-purple-400" />
                        : <Users className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{link.campaignName || (link.type === "store" ? "Store Link" : "Membership Link")}</p>
                      <p className="text-xs text-zinc-500 truncate">{url}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500 shrink-0">
                      <span><span className="text-white font-medium">{link.clicks}</span> clicks</span>
                      <span><span className="text-white font-medium">{link.conversions}</span> conversions</span>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">
                        {new Date(link.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 shrink-0"
                      onClick={() => handleCopy(link.code, link.type)}
                    >
                      {copied === link.code ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission History */}
      {commissions.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Commission History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commissions.slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${c.type === "store" ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
                      {c.type === "store"
                        ? <ShoppingBag className="h-3.5 w-3.5 text-purple-400" />
                        : <Users className="h-3.5 w-3.5 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-white capitalize">{c.type} commission</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-green-400">+${c.amount.toFixed(2)}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        c.status === "paid"
                          ? "border-green-700 text-green-400"
                          : c.status === "cancelled"
                          ? "border-red-700 text-red-400"
                          : "border-amber-700 text-amber-400"
                      }`}
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
