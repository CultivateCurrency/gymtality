"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "@/hooks/use-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Loader2,
} from "lucide-react";

interface DonationItem {
  id: string;
  userId: string;
  amount: number;
  message: string | null;
  createdAt: string;
  user: { fullName: string; email: string };
}

interface DonationsData {
  donations: DonationItem[];
  total: number;
}

export default function CoachDonationsPage() {
  const { data: session } = useSession();
  const { data, loading, error, refetch } = useApi<DonationsData>(
    session?.user ? "/api/coach/donations" : null
  );

  const donations = data?.donations ?? [];

  const totalAmount = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations]
  );

  const monthlyAmount = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return donations
      .filter((d) => new Date(d.createdAt) >= startOfMonth)
      .reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Donations</h1>
        <p className="text-zinc-400 mt-1">
          View donations received from your members and supporters.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-zinc-400">Total Donations</p>
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
                <p className="text-2xl font-bold text-white">
                  ${monthlyAmount.toFixed(2)}
                </p>
                <p className="text-sm text-zinc-400">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {donations.length}
                </p>
                <p className="text-sm text-zinc-400">Total Supporters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Donation History
          </CardTitle>
          <CardDescription className="text-zinc-400">
            All donations received from members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
              <span className="ml-2 text-zinc-400">Loading donations...</span>
            </div>
          ) : error ? (
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
          ) : donations.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">
              No donations received yet. Keep creating great content!
            </p>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-pink-500/10">
                      <User className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {donation.user.fullName}
                      </p>
                      {donation.message && (
                        <p className="text-sm text-zinc-400 mt-0.5">
                          &ldquo;{donation.message}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(donation.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      ${donation.amount.toFixed(2)}
                    </p>
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
