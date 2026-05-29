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
    <div style={{ margin: "var(--s-6) 0 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--s-3)",
          marginBottom: "14px",
        }}
      >
        <h2 className="t-h2" style={{ margin: 0, fontSize: "var(--t-md)" }}>
          5項目スコア分析
        </h2>
        <span className="t-mono" style={{ color: "var(--ink-500)", fontSize: "11px" }}>
          5次元
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    </div>
  );
}
