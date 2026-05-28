import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import path from "node:path";

Font.register({
  family: "NotoSansJP",
  src: path.resolve(process.cwd(), "public/fonts/NotoSansJP-Regular.ttf"),
});

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansJP",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#0E1116",
  },
  h1: { fontSize: 22, marginBottom: 8 },
  meta: { fontSize: 9, color: "#777C84", marginBottom: 24 },
  scoreRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    alignItems: "baseline",
  },
  grade: { fontSize: 48, fontWeight: 700 },
  scoreNum: { fontSize: 14, color: "#41464D" },
  h2: { fontSize: 14, marginTop: 16, marginBottom: 6 },
  h3: { fontSize: 11, marginTop: 12, marginBottom: 4, fontWeight: 700 },
  body: { marginBottom: 6 },
  topItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#F2F3F5",
    borderRadius: 4,
  },
  topLabel: { fontSize: 8, color: "#777C84", marginTop: 4 },
});

type Top3Item = { issue: string; action: string; impact: string };
type Dim = { score: number; [k: string]: unknown };

type Props = {
  listingId: string;
  listingTitle: string | null;
  url: string | null;
  diagnosedAt: Date;
  overallScore: number;
  grade: string;
  qualityStatus: string;
  dimensions: {
    photos: Dim;
    title: Dim;
    description: Dim;
    amenities: Dim;
    reviews: Dim;
  };
  reportMd: string | null;
  top3: Top3Item[];
};

export function DiagnosisReport(p: Props) {
  return (
    <Document title={`SOZO Review ${p.listingId}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>SOZO Review · 物件ヘルスチェック</Text>
        <Text style={s.meta}>
          {p.listingTitle ?? p.listingId} · {p.url ?? ""} · 診断日{" "}
          {p.diagnosedAt.toLocaleDateString("ja-JP")}
        </Text>

        <View style={s.scoreRow}>
          <Text style={s.grade}>{p.grade}</Text>
          <Text style={s.scoreNum}>
            {p.overallScore} / 100 · {p.qualityStatus}
          </Text>
        </View>

        <Text style={s.h2}>5 次元スコア</Text>
        {(
          ["photos", "title", "description", "amenities", "reviews"] as const
        ).map((key) => (
          <Text key={key} style={s.body}>
            ・ {key}: {p.dimensions[key].score}
          </Text>
        ))}

        {p.reportMd && (
          <>
            <Text style={s.h2}>AI レポート</Text>
            {p.reportMd.split(/\n+/).map((para, i) => (
              <Text key={i} style={s.body}>
                {para.replace(/^#+\s*/, "")}
              </Text>
            ))}
          </>
        )}

        {p.top3.length > 0 && (
          <>
            <Text style={s.h2}>Top 3 改善優先度</Text>
            {p.top3.map((it, i) => (
              <View key={i} style={s.topItem}>
                <Text style={s.h3}>
                  {i + 1}. {it.issue}
                </Text>
                <Text style={s.topLabel}>アクション</Text>
                <Text style={s.body}>{it.action}</Text>
                <Text style={s.topLabel}>期待効果</Text>
                <Text style={s.body}>{it.impact}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
