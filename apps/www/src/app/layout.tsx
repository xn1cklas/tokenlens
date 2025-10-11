import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "tokenlens - Accurate Token Counting & Cost Estimation for AI Models | GPT-4, Claude, Gemini",
  description:
    "Calculate token counts and estimate costs for all major AI models including GPT-4, Claude, Gemini, and Llama. Fast, accurate token counting library used by Vercel and Midday. Works with OpenAI, Anthropic, and Vercel AI SDK.",
  keywords: [
    "token counter",
    "token counting",
    "AI token calculator",
    "GPT-4 tokens",
    "Claude tokens",
    "OpenAI token cost",
    "AI cost estimation",
    "LLM token counter",
    "token pricing",
    "AI API costs",
    "Vercel AI SDK",
    "Anthropic tokens",
    "token calculator",
  ],
  openGraph: {
    title: "tokenlens - Token Counting for AI Applications",
    description:
      "Accurate, fast token counting for GPT-5, Claude, Gemini, and all major AI models. Calculate costs before making API calls.",
    type: "website",
    url: "https://tokenlens.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "tokenlens - Token Counting for AI Applications",
    description:
      "Calculate token counts and costs for all major AI models. Used by Vercel and Midday.",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
