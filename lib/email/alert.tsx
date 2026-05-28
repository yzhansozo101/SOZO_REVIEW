import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from "@react-email/components";

type Top3Item = { issue: string; action: string; impact: string };

type Props = {
  listingTitle: string;
  score: number;
  grade: string;
  reportUrl: string;
  top3: Top3Item[];
};

const ink = "#0E1116";
const muted = "#595E66";

export function F1AlertEmail({ listingTitle, score, grade, reportUrl, top3 }: Props) {
  return (
    <Html lang="ja">
      <Head />
      <Body style={{ fontFamily: "Noto Sans JP, sans-serif", color: ink, backgroundColor: "#FAF8F4" }}>
        <Container style={{ maxWidth: 600, padding: 24, backgroundColor: "#fff", borderRadius: 8 }}>
          <Heading style={{ margin: 0, color: "#C7382B" }}>⚠️ 物件アラート</Heading>
          <Text style={{ color: muted, marginTop: 4 }}>{listingTitle}</Text>
          <Section style={{ backgroundColor: "#F7E1DE", padding: 16, borderRadius: 6, marginTop: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: 700, color: "#842318", margin: 0 }}>
              {`${grade} 級 · ${score} 点`}
            </Text>
            <Text style={{ margin: 0, fontSize: 12 }}>
              閾値 60 点を下回りました。早急な対応をご検討ください。
            </Text>
          </Section>

          <Heading as="h2" style={{ fontSize: 16, marginTop: 20 }}>
            Top 3 改善優先度
          </Heading>
          {top3.map((it, i) => (
            <Section key={i} style={{ marginTop: 8 }}>
              <Text style={{ margin: 0, fontWeight: 700 }}>
                {i + 1}. {it.issue}
              </Text>
              <Text style={{ margin: "2px 0", fontSize: 13, color: muted }}>{it.action}</Text>
              <Text style={{ margin: 0, fontSize: 12, color: "#1F5C3D" }}>→ {it.impact}</Text>
            </Section>
          ))}

          <Hr style={{ margin: "20px 0" }} />
          <Button href={reportUrl} style={{ backgroundColor: "#024280", color: "#fff", padding: "10px 16px", borderRadius: 6 }}>
            レポートを開く →
          </Button>

          <Text style={{ marginTop: 20, fontSize: 11, color: muted }}>
            このメールは SOZO Review が自動送信したものです。同一診断で再送はされません。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
