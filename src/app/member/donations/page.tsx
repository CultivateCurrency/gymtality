"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  DollarSign,
  Loader2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";

const PRESET_AMOUNTS = [5, 10, 25, 50];

interface DonationRecord {
  id: string;
  amount: number;
  message: string | null;
  createdAt: string;
}

interface DonationsResponse {
  donations: DonationRecord[];
  total: number;
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>}>
      <DonationsContent />
    </Suspense>
  );
}

function DonationsContent() {
  const searchParams = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi<DonationsResponse>("/api/donations");

  // Check for success redirect from Stripe
  useEffect(() => {
    if (searchParams.get("status") === "success") {
      setSuccess(true);
      refetch();
    }
  }, [searchParams]);
  const donations = data?.donations ?? [];
  const totalDonated = data?.total ?? 0;

  const donationAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0);

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetch<{ url: string }>("/api/payments/donate", {
        method: "POST",
        body: JSON.stringify({
          amount: donationAmount,
          message: message || null,
        }),
      });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (e: any) {
      setSubmitError(e.message || "Failed to process donation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Heart className="h-8 w-8 text-orange-500" />
          Donations
        </h1>
        <p className="text-zinc-400 mt-1">
          Support the Gymtality mission and help us build a physical gym
        </p>
      </div>

      {/* Total Donated */}
      <Card className="bg-gradient-to-br from-orange-500/20 to-zinc-900 border-orange-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <DollarSign className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                ${loading ? "--" : totalDonated.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-400">Your Total Donations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Make a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Thank You!</h3>
              <p className="text-zinc-400 text-sm">Your donation has been recorded.</p>
              <Button
                variant="outline"
                className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setSuccess(false)}
              >
                Donate Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preset Amounts */}
              <div>
                <p className="text-sm text-zinc-400 mb-3">Select an amount</p>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      className={`py-3 rounded-lg border text-center font-semibold transition ${
                        selectedAmount === amount
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <p className="text-sm text-zinc-400 mb-2">Or enter a custom amount</p>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    min="1"
                    step="0.01"
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-zinc-400 mb-2">Leave a message (optional)</p>
                <Textarea
                  placeholder="Thank you for building Gymtality..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {submitError && (
                <p className="text-red-400 text-sm">{submitError}</p>
              )}

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleDonate}
                disabled={submitting || donationAmount <= 0}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Heart className="h-4 w-4 mr-2" />
                )}
                {submitting
                  ? "Processing..."
                  : donationAmount > 0
                    ? `Donate $${donationAmount.toFixed(2)}`
                    : "Select an amount"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donation History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Donation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center py-4">
              Failed to load donation history.
            </p>
          )}

          {!loading && !error && donations.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-8">
              No donations yet. Make your first contribution above!
            </p>
          )}

          {!loading && donations.length > 0 && (
            <div className="space-y-2">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800 transition"
                >
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      ${d.amount.toFixed(2)}
                    </p>
                    {d.message && (
                      <p className="text-xs text-zinc-500 truncate">{d.message}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
