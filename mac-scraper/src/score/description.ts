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
};

export function scoreDescription(text: string): DescriptionScore {
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
    return { score: 5, length, sections_hit: hits, sections_missing: missing };
  }
  if (length >= 800 && hits.length >= 5) {
    return { score: 95, length, sections_hit: hits, sections_missing: missing };
  }
  if (length >= 400 || hits.length >= 3) {
    return { score: 75, length, sections_hit: hits, sections_missing: missing };
  }

  return { score: 45, length, sections_hit: hits, sections_missing: missing };
}
