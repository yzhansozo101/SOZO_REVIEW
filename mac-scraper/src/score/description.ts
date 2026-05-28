const SECTIONS: Array<{ key: string; re: RegExp }> = [
  { key: "寝室", re: /寝室|ベッドルーム/ },
  { key: "リビング", re: /リビング/ },
  { key: "キッチン", re: /キッチン/ },
  { key: "バスルーム", re: /バスルーム|浴室|風呂/ },
  { key: "アクセス", re: /駅|アクセス|交通/ },
  { key: "周辺", re: /周辺|観光|スポット/ },
];

export type DescriptionScore = {
  score: number;
  length: number;
  sections_hit: string[];
  sections_missing: string[];
  locales: string[];
  b8_status: "ok" | "missing_critical";
};

type DescriptionScoreBase = Omit<DescriptionScore, "locales" | "b8_status">;

function withLocaleStatus(result: DescriptionScoreBase, locales: string[]): DescriptionScore {
  const hasJa = locales.includes("ja");
  const hasEn = locales.includes("en");
  const b8_status: DescriptionScore["b8_status"] = hasJa && hasEn ? "ok" : "missing_critical";

  return { ...result, locales, b8_status };
}

export function scoreDescription(text: string, locales: string[] = ["ja"]): DescriptionScore {
  const length = text.length;
  const hits: string[] = [];
  const missing: string[] = [];

  for (const section of SECTIONS) {
    if (section.re.test(text)) {
      hits.push(section.key);
    } else {
      missing.push(section.key);
    }
  }

  if (length === 0) {
    return withLocaleStatus({ score: 5, length, sections_hit: hits, sections_missing: missing }, locales);
  }
  if (length >= 800 && hits.length >= 5) {
    return withLocaleStatus({ score: 95, length, sections_hit: hits, sections_missing: missing }, locales);
  }
  if (length >= 400 || hits.length >= 3) {
    return withLocaleStatus({ score: 75, length, sections_hit: hits, sections_missing: missing }, locales);
  }

  return withLocaleStatus({ score: 45, length, sections_hit: hits, sections_missing: missing }, locales);
}
