import { fetchModelsDev, fetchOpenrouter, fetchVercel } from "@tokenlens/fetch";
import { CtaSection } from "./components/CtaSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { Hero } from "./components/Hero";
import { ModelsSection } from "./components/ModelsSection";
import { SDKsSection } from "./components/SDKsSection";
import { SiteFooter } from "./components/SiteFooter";
import { TrustedBy } from "./components/TrustedBy";

export const revalidate = 86400; // 1 day

export default async function HomePage() {
  // No local transformation here; we pass the catalogs directly to the component

  const results = await Promise.allSettled([
    fetchOpenrouter(),
    fetchModelsDev(),
    fetchVercel(),
  ]);

  const openrouterCatalog =
    results[0].status === "fulfilled" ? results[0].value : {};
  const modelsdevCatalog =
    results[1].status === "fulfilled" ? results[1].value : {};
  const vercelCatalog =
    results[2].status === "fulfilled" ? results[2].value : {};

  const modelsdevFinal =
    Object.keys(modelsdevCatalog).length > 0
      ? modelsdevCatalog
      : openrouterCatalog;
  const vercelFinal =
    Object.keys(vercelCatalog).length > 0 ? vercelCatalog : openrouterCatalog;
  const lastUpdated = Date.now();

  return (
    <div className="p-5 bg-background border-border hover:border-accent/50 transition-all group hover:shadow-lg">
      <Hero />
      <TrustedBy />
      {/* <SDKsSection /> */}
      {/* <FeaturesSection /> */}
      <ModelsSection
        openrouter={openrouterCatalog}
        modelsdev={modelsdevFinal}
        vercel={vercelFinal}
        lastUpdated={lastUpdated}
      />
      <CtaSection />
      <SiteFooter />
    </div>
  );
}
