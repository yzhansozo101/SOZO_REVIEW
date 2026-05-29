import { ja } from "@/lib/i18n/ja";
import { DimensionCard } from "./DimensionCard";

type Dim = { score: number; [key: string]: unknown };

type Props = {
  dimensions: {
    photos: Dim & { total?: number; b3_coverage?: string };
    title: Dim & { placeholder?: boolean };
    description: Dim & { length?: number; sections_hit?: string[] };
    amenities: Dim & { match_ratio?: string };
    reviews: Dim & { rating?: number; count?: number };
  };
};

export function DimensionGrid({ dimensions }: Props) {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-5)",
        display: "grid",
        gap: "var(--s-4)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-3)",
        }}
      >
        <span
          className="t-small"
          style={{ color: "var(--ink-600)", fontSize: 13 }}
        >
          写真・タイトル・説明文・設備・レビューを個別に採点
        </span>
        <span className="t-mono" style={{ color: "var(--ink-400)", fontSize: 11 }}>
          5 / 5
        </span>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "var(--s-3)",
        }}
      >
        <DimensionCard
          label={ja.result.dimensions.photos.label}
          score={dimensions.photos.score}
          primaryStat={`${dimensions.photos.total ?? "?"} 枚`}
          note={dimensions.photos.b3_coverage ? `カバー率 ${dimensions.photos.b3_coverage}` : undefined}
        />
        <DimensionCard
          label={ja.result.dimensions.title.label}
          score={dimensions.title.score}
          primaryStat="—"
          note={ja.result.dimensions.title.placeholder}
          placeholder
        />
        <DimensionCard
          label={ja.result.dimensions.description.label}
          score={dimensions.description.score}
          primaryStat={`${dimensions.description.length ?? 0} 文字`}
          note={
            dimensions.description.sections_hit?.length
              ? `主要章節✓ ${dimensions.description.sections_hit.length}/6`
              : "章節カバレッジ不足"
          }
        />
        <DimensionCard
          label={ja.result.dimensions.amenities.label}
          score={dimensions.amenities.score}
          primaryStat={dimensions.amenities.match_ratio ?? "?"}
          note="設備と説明文の一致度"
        />
        <DimensionCard
          label={ja.result.dimensions.reviews.label}
          score={dimensions.reviews.score}
          primaryStat={dimensions.reviews.rating ? `★ ${dimensions.reviews.rating.toFixed(2)}` : "—"}
          note={dimensions.reviews.count ? `${dimensions.reviews.count} 件のレビュー` : "レビューなし"}
        />
      </div>
    </section>
  );
}
