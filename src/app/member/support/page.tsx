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
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Phone,
  MapPin,
} from "lucide-react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setSending(true);
    // Simulate sending — will wire to SES later
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-orange-500" />
          Help & Support
        </h1>
        <p className="text-zinc-400 mt-1">
          Need help? Contact us via email or use the form below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-white font-medium">Email</h3>
            <p className="text-zinc-400 text-sm mt-1">support@gymtality.fit</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center">
            <Phone className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-white font-medium">Phone</h3>
            <p className="text-zinc-400 text-sm mt-1">+1 (555) 123-4567</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-white font-medium">Location</h3>
            <p className="text-zinc-400 text-sm mt-1">Available nationwide</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg">Message Sent!</h3>
              <p className="text-zinc-400 mt-1">
                We&apos;ll get back to you as soon as possible.
              </p>
              <Button
                onClick={() => setSent(false)}
                className="mt-4 bg-orange-500 hover:bg-orange-600"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  rows={5}
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              q: "How do I change my subscription plan?",
              a: "Go to Settings > Subscription to view and change your plan.",
            },
            {
              q: "How do I contact my coach?",
              a: "Use the Messages section to send a direct message to any coach.",
            },
            {
              q: "Can I cancel my subscription?",
              a: "Yes, you can cancel anytime from Settings > Subscription. You'll retain access until the end of your billing period.",
            },
            {
              q: "How do I track my workouts?",
              a: "Go to Workouts, select a plan, and log your session. Your progress is tracked automatically.",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-zinc-800 pb-3 last:border-0">
              <p className="text-white font-medium text-sm">{faq.q}</p>
              <p className="text-zinc-400 text-sm mt-1">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
