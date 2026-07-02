import { DEFAULT_CATALOG_LIMIT, loadCatalogView } from "@/lib/model-catalog";
import { CtaSection } from "./components/CtaSection";
import { Hero } from "./components/Hero";
import { ModelsSection } from "./components/ModelsSection";
import { SiteFooter } from "./components/SiteFooter";
import { TrustedBy } from "./components/TrustedBy";

export const revalidate = 86400; // 1 day

export default async function HomePage() {
  const initialCatalog = await loadCatalogView(
    "openrouter",
    {
      limit: DEFAULT_CATALOG_LIMIT,
    },
    { throwOnError: true },
  );

  return (
    <div className="p-5 bg-background border-border hover:border-accent/50 transition-all group hover:shadow-lg">
      <Hero />
      <TrustedBy />
      <ModelsSection initialCatalog={initialCatalog} />
      <CtaSection />
      <SiteFooter />
    </div>
  );
}
