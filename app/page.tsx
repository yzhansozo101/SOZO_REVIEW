import { DiagnosticForm } from "@/components/DiagnosticForm";
import { AboutSozonext } from "@/components/marketing/AboutSozonext";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MultilingualBrandSnippets } from "@/components/marketing/MultilingualBrandSnippets";
import { StructuredData } from "@/components/marketing/StructuredData";
import { homepageGraph } from "@/lib/schema";

/**
 * Homepage. Combines:
 *  - JSON-LD (Organization + WebSite + WebApplication) for AI/search
 *  - Hero (brand + niche keywords)
 *  - DiagnosticForm (existing client component, untouched)
 *  - HowItWorks / AboutSozonext / MultilingualBrandSnippets (marketing surface)
 *
 * Design: docs/system-design-geo.md §4.8
 */
export default function Home() {
  return (
    <>
      <StructuredData graph={homepageGraph()} />
      <main>
        <section className="brand-halo">
          <Hero />
          <DiagnosticForm />
        </section>
        <HowItWorks />
        <AboutSozonext />
        <MultilingualBrandSnippets />
      </main>
    </>
  );
}
