import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SDKsSection() {
  return (
    <section className="py-24 sm:py-32 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Works with All Major AI SDKs
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Drop-in compatibility with your favorite AI libraries. No
            configuration needed.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-4 max-w-6xl mx-auto">
          <Card className="md:col-span-7 p-8 bg-gradient-to-br from-accent/5 via-background to-background border-border hover:border-accent/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 -full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 -xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                  >
                    <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.5l8.892 5.139v10.722L12 23.5l-8.892-5.139V7.639L12 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Vercel AI SDK</h3>
                  <p className="text-sm text-muted-foreground">
                    Official integration partner
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Built to work seamlessly with the Vercel AI SDK. Count tokens
                before streaming, estimate costs in real-time, and optimize your
                AI applications.
              </p>
              <div className="bg-muted/50 -lg p-4 font-mono text-sm border border-border">
                <div className="text-muted-foreground mb-2">
                  {"// Perfect for streaming responses"}
                </div>
                <div>
                  <span className="text-purple-400">import</span> {"{ "}
                  <span className="text-blue-400">generateText</span>
                  {" }"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'ai'</span>
                </div>
                <div>
                  <span className="text-purple-400">import</span> {"{ "}
                  <span className="text-blue-400">countTokens</span>
                  {" }"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'tokenlens'</span>
                </div>
                <div className="mt-3 text-muted-foreground">
                  <span className="text-blue-400">countTokens</span>(prompt,{" "}
                  <span className="text-green-400">'gpt-4'</span>)
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Streaming
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Server Actions
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Edge Runtime
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-5 p-6 bg-background border-border hover:border-accent/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 -lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="font-bold text-lg text-green-500">O</span>
              </div>
              <h3 className="text-xl font-bold">OpenAI</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Native support for all GPT models including GPT-4, GPT-4 Turbo,
              and GPT-3.5.
            </p>
            <div className="bg-muted/50 -lg p-3 font-mono text-xs border border-border">
              <div>
                <span className="text-blue-400">countTokens</span>(
              </div>
              <div className="pl-4">messages,</div>
              <div className="pl-4">
                <span className="text-green-400">'gpt-4-turbo'</span>
              </div>
              <div>)</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                GPT-4
              </Badge>
              <Badge variant="secondary" className="text-xs">
                GPT-3.5
              </Badge>
            </div>
          </Card>

          <Card className="md:col-span-5 p-6 bg-background border-border hover:border-accent/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 -lg bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="font-bold text-lg text-orange-500">A</span>
              </div>
              <h3 className="text-xl font-bold">Anthropic</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Accurate counting for Claude 3.5 Sonnet, Opus, Haiku, and all
              Claude models.
            </p>
            <div className="bg-muted/50 -lg p-3 font-mono text-xs border border-border">
              <div>
                <span className="text-blue-400">countTokens</span>(
              </div>
              <div className="pl-4">prompt,</div>
              <div className="pl-4">
                <span className="text-green-400">'claude-3-5-sonnet'</span>
              </div>
              <div>)</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                Claude 3.5
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Claude 3
              </Badge>
            </div>
          </Card>

          <Card className="md:col-span-7 p-6 bg-background border-border hover:border-accent/50 transition-all group">
            <h3 className="text-lg font-bold mb-4">And Many More</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 -lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold">G</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Google AI</div>
                  <div className="text-xs text-muted-foreground">
                    Gemini models
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 -lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold">M</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Meta</div>
                  <div className="text-xs text-muted-foreground">
                    Llama models
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 -lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold">C</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Cohere</div>
                  <div className="text-xs text-muted-foreground">
                    Command models
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 -lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold">M</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Mistral</div>
                  <div className="text-xs text-muted-foreground">
                    Mistral models
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Works with any AI SDK that uses standard model identifiers
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
