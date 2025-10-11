import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
            Start counting tokens in seconds
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance leading-relaxed">
            Minimal API. Zero dependencies. Maximum accuracy. Join thousands of
            developers using tokenlens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-base">
              <Link href="https://www.npmjs.com/package/tokenlens">
                View on npm
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base bg-transparent"
            >
              <Link href="https://github.com/tokenlens/tokenlens">
                Star on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
