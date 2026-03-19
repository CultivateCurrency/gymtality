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
import { Textarea } from "@/components/ui/textarea";
import {
  HelpCircle,
  Mail,
  Phone,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/hooks/use-api";

const FAQ_ITEMS = [
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can manage your subscription from Settings > Subscription Management. Click 'Cancel Subscription' and follow the prompts. Your access will continue until the end of your billing period.",
  },
  {
    question: "How do I book a personal training session?",
    answer:
      "Browse available coaches in the Explore section, visit their profile, and select an available time slot. You can also book through Events > Appointments.",
  },
  {
    question: "Can I sync my wearable device?",
    answer:
      "Yes! Go to Settings > Connected Devices to link Apple Health or Google Fit. Your activity data will automatically sync with your Forge Fitness dashboard.",
  },
  {
    question: "How does the referral program work?",
    answer:
      "Go to the Referrals page to generate a unique referral link. Share it with friends — when they sign up and subscribe, you both earn rewards. Track your referral stats from the same page.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "On the login screen, tap 'Forgot Password'. Enter your email address, verify with the OTP sent to your inbox, and set a new password.",
  },
  {
    question: "How can I contact my coach?",
    answer:
      "Use the Messages section to send a direct message to your coach. You can also initiate audio or video calls from the chat screen.",
  },
  {
    question: "What is the Forge Score?",
    answer:
      "The Forge Score is a performance metric calculated based on your workout completion, consistency, and intensity. It helps you track your overall fitness progress over time.",
  },
];

export default function HelpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch("/api/help", {
        method: "POST",
        body: JSON.stringify({ name, email, subject, message }),
      });
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (e: any) {
      setSubmitError(e.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-orange-500" />
          Help & Support
        </h1>
        <p className="text-zinc-400 mt-1">Get help with your account, workouts, or billing</p>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-white">Email Support</p>
              <p className="text-sm text-zinc-400">support@forgefitness.com</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Phone className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-white">Phone Support</p>
              <p className="text-sm text-zinc-400">1-800-FORGE-FIT (Mon-Fri 9am-6pm)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Send className="h-5 w-5 text-orange-500" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Message Sent!</h3>
              <p className="text-zinc-400 text-sm">
                We&apos;ll get back to you within 24 hours.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  placeholder="Your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Textarea
                placeholder="Describe your issue or question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {submitError && (
                <p className="text-red-400 text-sm">{submitError}</p>
              )}
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-500" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800 transition"
              >
                <span className="font-medium text-white text-sm">{item.question}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
