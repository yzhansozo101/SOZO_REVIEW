/**
 * JSON-LD injector — emits a <script type="application/ld+json"> tag
 * containing a Schema.org @graph for AI/search engines.
 *
 * Server component. The `graph` array (Organization/WebSite/WebApplication)
 * is built in `lib/schema.ts`.
 *
 * Design: docs/system-design-geo.md §4.6
 */
export function StructuredData({ graph }: { graph: readonly object[] }) {
  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
