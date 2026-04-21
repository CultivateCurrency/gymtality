"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Wallet,
  Percent,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import dynamic from "next/dynamic";

const EarningsBarChart = dynamic(() => import("@/components/charts").then((m) => m.EarningsBarChart), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-zinc-500">Loading...</div> });

interface EarningsTransaction {
  id: string;
  description: string;
  gross: number;
  net: number;
  date: string;
  status: "Completed" | "Pending";
}

interface EarningsData {
  summary: {
    totalGross: number;
    totalNet: number;
    monthlyGross: number;
    monthlyNet: number;
    commissionRate: number;
    totalTransactions: number;
  };
  monthlyEarnings: { month: string; sessions: number; classes: number; total: number }[];
  transactions: EarningsTransaction[];
  pagination: Record<string, unknown>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted?: boolean;
}

export default function CoachEarningsPage() {
  // Use donations endpoint as earnings source (donations = revenue)
  const { data: donationsData, loading, error, refetch } = useApi<any>("/api/coach/donations");
  const { data: connectStatus } = useApi<ConnectStatus>("/api/payments/connect");
  const [connectingStripe, setConnectingStripe] = useState(false);

  // Transform donations data into earnings format
  const data: EarningsData | undefined = donationsData ? {
    summary: {
      totalGross: donationsData.totalDonations || 0,
      totalNet: (donationsData.totalDonations || 0) * 0.9, // 10% platform fee
      monthlyGross: donationsData.thisMonthDonations || 0,
      monthlyNet: (donationsData.thisMonthDonations || 0) * 0.9,
      commissionRate: 0.1, // 10% platform fee
      totalTransactions: donationsData.transactionCount || 0,
    },
    monthlyEarnings: donationsData.monthlyBreakdown || [],
    transactions: (donationsData.donations || []).map((d: any) => ({
      id: d.id,
      description: `Donation from ${d.user?.fullName || 'Anonymous'}`,
      gross: d.amount,
      net: d.amount * 0.9,
      date: d.createdAt,
      status: d.processed ? "Completed" : "Pending",
    })),
    pagination: {},
  } : undefined;

  const pendingPayout = data
    ? data.transactions
        .filter((tx) => tx.status === "Pending")
        .reduce((sum, tx) => sum + tx.net, 0)
    : 0;

  const commissionPercent = data
    ? Math.round((1 - data.summary.commissionRate) * 100)
    : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Earnings</h1>
        <p className="text-zinc-400 mt-1">
          Track your revenue, payouts, and transaction history.
        </p>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-zinc-900 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {data ? formatCurrency(data.summary.totalNet) : "$0.00"}
                </p>
                <p className="text-sm text-zinc-400">Total Earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {data ? formatCurrency(data.summary.monthlyNet) : "$0.00"}
                </p>
                <p className="text-sm text-zinc-400">This Month</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12% vs last month</span>
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
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(pendingPayout)}
                </p>
                <p className="text-sm text-zinc-400">Pending Payout</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Next payout: March 20, 2026
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Percent className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{commissionPercent}%</p>
                <p className="text-sm text-zinc-400">Commission Rate</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Platform fee on all transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revenue Over Time
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Monthly earnings breakdown by source.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <EarningsBarChart data={data?.monthlyEarnings ?? []} />
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-500" />
            Transaction History
          </CardTitle>
          <CardDescription className="text-zinc-400">
            All your earnings and payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                    Gross
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                    Net
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {tx.status === "Pending" ? (
                          <ArrowDownRight className="h-4 w-4 text-amber-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm text-white">{tx.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-400">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-white text-right">
                      {formatCurrency(tx.gross)}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-400 text-right font-medium">
                      {formatCurrency(tx.net)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        className={
                          tx.status === "Completed"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {data?.transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-sm">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            Payout Settings
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Manage how you receive your earnings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-zinc-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${connectStatus?.connected ? "bg-green-500/10" : "bg-purple-500/10"}`}>
                <CreditCard className={`h-5 w-5 ${connectStatus?.connected ? "text-green-500" : "text-purple-500"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Stripe Connect</p>
                <p className="text-xs text-zinc-400">
                  {connectStatus?.connected && connectStatus?.payoutsEnabled
                    ? "Connected — payouts enabled"
                    : connectStatus?.connected
                      ? "Connected — complete onboarding to enable payouts"
                      : "Connect your Stripe account to receive payouts"}
                </p>
              </div>
            </div>
            {connectStatus?.connected && connectStatus?.payoutsEnabled ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            ) : (
              <Button
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                disabled={connectingStripe}
                onClick={async () => {
                  setConnectingStripe(true);
                  try {
                    const res = await apiFetch<{ url: string }>("/api/payments/connect", {
                      method: "POST",
                      body: JSON.stringify({}),
                    });
                    if (res.url) window.location.href = res.url;
                  } catch (err: any) {
                    alert(err.message || "Failed to start Stripe Connect");
                  } finally {
                    setConnectingStripe(false);
                  }
                }}
              >
                {connectingStripe ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                {connectStatus?.connected ? "Complete Setup" : "Connect Stripe"}
              </Button>
            )}
          </div>

          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Payout Schedule</p>
                <p className="text-xs text-zinc-400">Weekly payouts every Monday</p>
              </div>
              <Badge className="bg-zinc-700 text-zinc-300 border-zinc-600">
                Weekly
              </Badge>
            </div>
          </div>

          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Commission Rate</p>
                <p className="text-xs text-zinc-400">
                  Platform retains {commissionPercent}% of gross earnings
                </p>
              </div>
              <span className="text-lg font-bold text-orange-500">{commissionPercent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
