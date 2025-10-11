import { Code2 } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-accent" />
            <span className="font-mono font-semibold">tokenlens</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/tokenlens/tokenlens"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://www.npmjs.com/package/tokenlens"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              npm
            </Link>
            <Link
              href="#docs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              License
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Built with ❤️ for the AI developer community</p>
        </div>
      </div>
    </footer>
  );
}
