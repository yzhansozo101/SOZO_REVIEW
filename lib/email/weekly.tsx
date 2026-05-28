import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from "@react-email/components";

type Listing = { title: string; grade: string; score: number; mainIssue: string };

type Props = {
  weekOf: string;
  totalDiagnosed: number;
  distribution: { A: number; B: number; C: number; D: number };
  top3Worst: Listing[];
};

const ink = "#0E1116";
const muted = "#595E66";

export function F7WeeklyEmail({ weekOf, totalDiagnosed, distribution, top3Worst }: Props) {
  return (
    <Html lang="ja">
      <Head />
      <Body style={{ fontFamily: "Noto Sans JP, sans-serif", color: ink, backgroundColor: "#FAF8F4" }}>
        <Container style={{ maxWidth: 600, padding: 24, backgroundColor: "#fff", borderRadius: 8 }}>
          <Heading style={{ margin: 0 }}>SOZO 物件ヘルス週次サマリー</Heading>
          <Text style={{ color: muted, marginTop: 4 }}>{weekOf} 週</Text>

          <Section style={{ marginTop: 16 }}>
            <Text style={{ margin: 0 }}>
              本週診断物件数: <strong>{totalDiagnosed}</strong> 件
            </Text>
            <Text style={{ margin: "4px 0" }}>
              評価分布: A {distribution.A} · B {distribution.B} · C {distribution.C} · D{" "}
              {distribution.D}
            </Text>
          </Section>

          <Hr style={{ margin: "20px 0" }} />

          <Heading as="h2" style={{ fontSize: 16 }}>
            要注意 Top 3
          </Heading>
          {top3Worst.map((l, i) => (
            <Section key={i} style={{ marginTop: 8 }}>
              <Text style={{ margin: 0, fontWeight: 700 }}>
                {i + 1}. {l.title}
              </Text>
              <Text style={{ margin: "2px 0", fontSize: 13 }}>
                {l.grade} 級 · {l.score} 点
              </Text>
              <Text style={{ margin: 0, fontSize: 12, color: muted }}>{l.mainIssue}</Text>
            </Section>
          ))}

          <Text style={{ marginTop: 20, fontSize: 11, color: muted }}>
            ※ demo 段階:定時送信は v1 で実装します。本メールは手動「テスト送信」によるものです。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
