"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

export function StripePaymentForm({
  clientSecret,
  onSuccess,
  onError,
  isProcessing,
}: StripePaymentFormProps) {
  const elementsRef = useRef<any>(null);
  const paymentElementRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStripe = async () => {
      try {
        if (!clientSecret) {
          onError("No payment intent provided");
          return;
        }

        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
        if (!stripeKey) {
          onError("Stripe configuration missing");
          return;
        }

        // Load Stripe JS
        if (!window.Stripe) {
          const script = document.createElement("script");
          script.src = "https://js.stripe.com/v3/";
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const stripe = window.Stripe(stripeKey);
        const elements = stripe.elements({
          clientSecret,
          appearance: {
            theme: "dark",
            variables: {
              colorPrimary: "#f97316",
              colorDanger: "#ef4444",
            },
          },
        });

        elementsRef.current = elements;

        // Mount Payment Element
        if (paymentElementRef.current) {
          const paymentElement = elements.create("payment");
          paymentElement.mount(paymentElementRef.current);
          setReady(true);
        }
      } catch (err: any) {
        console.error("Stripe setup error:", err);
        onError(err.message || "Failed to load payment form");
      }
    };

    loadStripe();
  }, [clientSecret, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!elementsRef.current || !window.Stripe) {
      onError("Payment form not ready");
      return;
    }

    try {
      setLoading(true);
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
      if (!stripeKey) throw new Error("Stripe not configured");

      const stripe = window.Stripe(stripeKey);

      const { error } = await stripe.confirmPayment({
        elements: elementsRef.current,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/member/landing-audio?payment=success`,
        },
      });

      if (error) {
        onError(error.message || "Payment failed");
      } else {
        // Note: Will redirect on success
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-orange-500 mr-2" />
        <span className="text-sm text-zinc-400">Loading payment form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        ref={paymentElementRef}
        className="rounded-lg border border-zinc-700 p-4"
      />

      <button
        type="submit"
        disabled={loading || isProcessing}
        className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading || isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Complete Payment"
        )}
      </button>

      <p className="text-xs text-zinc-500 text-center">
        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </p>
    </form>
  );
}
