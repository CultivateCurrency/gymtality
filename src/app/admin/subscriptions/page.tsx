"use client";

import { useState, useMemo } from "react";
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
import {
  Crown,
  DollarSign,
  Users,
  Plus,
  Tag,
  CheckCircle2,
  Star,
  Clock,
  Percent,
  Loader2,
  Edit3,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

// ── Types ────────────────────────────────────────────────────────────────────

interface Subscription {
  id: string;
  plan: "BASIC" | "PREMIUM" | "ELITE";
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING";
  currentPeriodEnd: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    profilePhoto: string | null;
    role: string;
  };
}

interface SubscriptionsResponse {
  success: boolean;
  data: {
    subscriptions: Subscription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ── Static config ─────────────────────────────────────────────────────────────

const PLAN_TIER_CONFIG = [
  {
    name: "Basic",
    plan: "BASIC" as const,
    price: "$9.99/mo",
    priceValue: 9.99,
    color: "text-zinc-400",
    bg: "bg-zinc-500/20",
    borderColor: "border-zinc-700",
    popular: false,
    features: [
      "Access to workout library",
      "Community forums",
      "Basic progress tracking",
      "Limited streaming access",
    ],
  },
  {
    name: "Premium",
    plan: "PREMIUM" as const,
    price: "$19.99/mo",
    priceValue: 19.99,
    color: "text-orange-500",
    bg: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
    popular: true,
    features: [
      "Everything in Basic",
      "1:1 coach sessions (2/mo)",
      "Full streaming access",
      "Nutrition plans",
      "Music library",
      "Priority support",
    ],
  },
  {
    name: "Elite",
    plan: "ELITE" as const,
    price: "$39.99/mo",
    priceValue: 39.99,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
    popular: false,
    features: [
      "Everything in Premium",
      "Unlimited 1:1 sessions",
      "Custom workout plans",
      "Private coaching chat",
      "Exclusive content",
      "Merch discounts (20%)",
      "Early event access",
    ],
  },
];


// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionsPage() {
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);

  // All active subscribers (for total count)
  const {
    data: allActiveData,
    loading: allActiveLoading,
    error: allActiveError,
  } = useApi<SubscriptionsResponse>("/api/admin/subscriptions?status=ACTIVE");

  // Per-plan counts
  const { data: basicData, loading: basicLoading } =
    useApi<SubscriptionsResponse>("/api/admin/subscriptions?plan=BASIC&status=ACTIVE");
  const { data: premiumData, loading: premiumLoading } =
    useApi<SubscriptionsResponse>("/api/admin/subscriptions?plan=PREMIUM&status=ACTIVE");
  const { data: eliteData, loading: eliteLoading } =
    useApi<SubscriptionsResponse>("/api/admin/subscriptions?plan=ELITE&status=ACTIVE");

  const tiersLoading = allActiveLoading || basicLoading || premiumLoading || eliteLoading;

  const totalSubscribers = allActiveData?.data?.pagination?.total ?? 0;

  const basicCount = basicData?.data?.pagination?.total ?? 0;
  const premiumCount = premiumData?.data?.pagination?.total ?? 0;
  const eliteCount = eliteData?.data?.pagination?.total ?? 0;

  const monthlyRecurring = useMemo(() => {
    const value = basicCount * 9.99 + premiumCount * 19.99 + eliteCount * 39.99;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }, [basicCount, premiumCount, eliteCount]);

  // Merge static config with live counts
  const planTiers = useMemo(() => {
    const counts: Record<string, number> = {
      BASIC: basicCount,
      PREMIUM: premiumCount,
      ELITE: eliteCount,
    };
    return PLAN_TIER_CONFIG.map((tier) => ({
      ...tier,
      subscribers: counts[tier.plan] ?? 0,
    }));
  }, [basicCount, premiumCount, eliteCount]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage plans, tiers, coupons, and subscriber analytics.
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePlan(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Error banner */}
      {allActiveError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          Failed to load subscription data. Please refresh.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                {allActiveLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {totalSubscribers.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-zinc-400">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                {tiersLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                ) : (
                  <p className="text-2xl font-bold text-white">{monthlyRecurring}</p>
                )}
                <p className="text-sm text-zinc-400">Monthly Recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Tag className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">N/A</p>
                <p className="text-sm text-zinc-400">Active Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">7 days</p>
                <p className="text-sm text-zinc-400">Trial Period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Tiers */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Plan Tiers</h2>
        {tiersLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`bg-zinc-900 ${tier.borderColor} relative ${
                  tier.popular ? "ring-1 ring-orange-500/50" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white border-orange-600">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`p-3 rounded-full ${tier.bg} w-12 h-12 mx-auto flex items-center justify-center mb-2`}>
                    <Crown className={`h-6 w-6 ${tier.color}`} />
                  </div>
                  <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                  <p className={`text-2xl font-bold ${tier.color}`}>{tier.price}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-2 bg-zinc-800 rounded-lg">
                    <p className="text-lg font-bold text-white">
                      {tier.subscribers.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-400">active subscribers</p>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trial Period Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Trial Period Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <label className="text-sm text-zinc-300">Trial Duration (days)</label>
              <Input
                type="number"
                defaultValue={7}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <p className="text-sm text-zinc-400">
                New users get a free trial before being charged.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupons */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-500" />
                Coupon Management
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Create and manage discount codes. (Sample data — coupons API coming soon.)
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateCoupon(!showCreateCoupon)}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Coupon
            </Button>
          </div>
        </CardHeader>
        {showCreateCoupon && (
          <CardContent className="border-t border-zinc-800 pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Coupon Code</label>
                <Input placeholder="e.g., SUMMER30" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Discount Type</label>
                <select className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm">
                  <option>Percentage</option>
                  <option>Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Discount Value</label>
                <Input placeholder="e.g., 25" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Max Uses (optional)</label>
                <Input type="number" placeholder="Unlimited" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Expires (optional)</label>
                <Input type="date" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Create Coupon
            </Button>
          </CardContent>
        )}
        <CardContent className={showCreateCoupon ? "pt-4" : ""}>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Percent className="h-10 w-10 text-zinc-600 mb-3" />
            <p className="text-zinc-400 text-sm font-medium">No coupons yet</p>
            <p className="text-zinc-600 text-xs mt-1">Create your first discount code using the button above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
