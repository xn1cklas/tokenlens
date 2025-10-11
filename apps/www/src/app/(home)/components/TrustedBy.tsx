import { VercelWordmark } from "@/components/ui/svgs/vercelWordmark";
import { Mastra } from "@/components/ui/svgs/mastra";
import { Midday } from "@/components/ui/svgs/midday";

export function TrustedBy() {
  return (
    <section className="border-y border-border/40 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by builders at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
          <div className="flex items-center gap-2">
            <VercelWordmark className="h-6 w-auto text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Midday className="h-6 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <Mastra className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
