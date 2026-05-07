"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";

interface MindsetData {
  affirmation: string;
  motivationalMessage: string;
  actionStep: string;
  focus: string;
}

export function MindsetCard() {
  const [mindset, setMindset] = useState<MindsetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/mindset")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res?.data) setMindset(res.data as MindsetData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!mindset) return null;

  return (
    <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Brain className="h-4 w-4 text-primary" />
            Today&apos;s Mindset
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wide">
            {mindset.focus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold italic leading-snug text-foreground">
          &ldquo;{mindset.affirmation}&rdquo;
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {mindset.motivationalMessage}
        </p>
        <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
            Do this now
          </p>
          <p className="text-sm text-foreground">{mindset.actionStep}</p>
        </div>
      </CardContent>
    </Card>
  );
}
