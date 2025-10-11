import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";

type NpmDownloads = {
  downloads: number;
  start: string;
  end: string;
  package: string;
};

const formatDownloads = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

async function getNpmStats() {
  try {
    const res = await fetch(
      "https://api.npmjs.org/downloads/point/last-month/tokenlens",
      { next: { revalidate: 3600 }, cache: "force-cache" },
    );
    if (!res.ok) throw new Error("Failed to fetch npm stats");
    const data: NpmDownloads = await res.json();
    return {
      downloads: data.downloads,
      formatted: formatDownloads(data.downloads),
      period: "last month" as const,
    };
  } catch {
    return { downloads: 0, formatted: "10K+", period: "last month" as const };
  }
}

export async function Hero() {
  const npmStats = await getNpmStats();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden"></div>
      <div className="absolute inset-0 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-secondary/30 text-sm text-secondary mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 font-mono">
            <span className="text-secondary">✦</span>
            <span>
              {npmStats.formatted} npm downloads {npmStats.period}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Does it fit? <span className="text-accent">What will it cost?</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Typed model metadata and cost helpers for LLM applications. Simple,
            minimal, and accurate token counting for 50+ AI models.
          </p>

          <div className="flex flex-col items-start gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="inline-flex items-center gap-3 bg-card border border-accent/30 px-5 py-4 font-mono text-sm w-full max-w-md">
              <span className="text-accent">$</span>
              <span className="text-base flex-1">npm i tokenlens</span>
              <CopyButton text="npm i tokenlens" className="ml-2" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                size="lg"
                asChild
                className="text-base group bg-accent text-accent-foreground hover:bg-accent/90 font-mono"
              >
                <Link href="#docs">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base bg-transparent border-accent/30 hover:border-accent hover:bg-accent/10 font-mono"
              >
                <Link href="https://github.com/xn1cklas/tokenlens">
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
