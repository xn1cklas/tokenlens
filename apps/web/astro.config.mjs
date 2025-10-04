// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://tokenlens.dev",
  integrations: [
    starlight({
      title: "TokenLens",
      customCss: ["./src/styles/docs.css"],
      components: {
        ContentPanel: "./src/components/DocsContentPanel.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/xn1cklas/tokenlens",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "guides/overview" },
            { label: "Installation", slug: "guides/getting-started" },
            { label: "Quick Start", slug: "guides/quick-start" },
            { label: "Sources & Caching", slug: "guides/sources-caching" },
          ],
        },
        {
          label: "Integrations",
          items: [
            { label: "Vercel AI SDK", slug: "integrations/vercel-ai-sdk" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "API Reference", slug: "reference/example" },
            { label: "Glossary", slug: "reference/glossary" },
          ],
        },
      ],
      expressiveCode: {
        themes: ["github-dark", "github-light"],
      },
    }),
  ],
});
