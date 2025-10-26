import { fetchModelsDev, fetchOpenrouter, fetchVercel } from "@tokenlens/fetch";
import { CtaSection } from "./components/CtaSection";
import { Hero } from "./components/Hero";
import { ModelsSection } from "./components/ModelsSection";
import { SiteFooter } from "./components/SiteFooter";
import { TrustedBy } from "./components/TrustedBy";

export const revalidate = 86400; // 1 day

export default async function HomePage() {
  // No local transformation here; we pass the catalogs directly to the component

  const [openrouterCatalog, modelsdevCatalog, vercelCatalog] =
    await Promise.all([fetchOpenrouter(), fetchModelsDev(), fetchVercel()]);

  const modelsdevFinal =
    Object.keys(modelsdevCatalog).length > 0
      ? modelsdevCatalog
      : openrouterCatalog;
  const modelsdevUsedFallback = Object.keys(modelsdevCatalog).length === 0;

  const vercelFinal =
    Object.keys(vercelCatalog).length > 0 ? vercelCatalog : openrouterCatalog;
  const vercelUsedFallback = Object.keys(vercelCatalog).length === 0;

  const lastUpdated = Date.now();

  return (
    <div className="p-5 bg-background border-border hover:border-accent/50 transition-all group hover:shadow-lg">
      <Hero />
      <TrustedBy />
      <ModelsSection
        openrouter={openrouterCatalog}
        modelsdev={modelsdevFinal}
        vercel={vercelFinal}
        lastUpdated={lastUpdated}
        modelsdevFallback={modelsdevUsedFallback}
        vercelFallback={vercelUsedFallback}
      />
      <CtaSection />
      <SiteFooter />
    </div>
  );
}
