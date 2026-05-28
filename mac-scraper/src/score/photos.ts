export type PhotosInput = {
  count: number;
  categories: Record<string, number>;
  cover_category: string | undefined;
};

export type PhotosScore = {
  score: number;
  total: number;
  b1_status: "insufficient" | "good" | "adequate" | "rich";
  b2_cover_ok: boolean;
  b3_coverage: string;
  b3_missing: string[];
};

const GOOD_COVERS = ["リビング", "寝室", "ベッドルーム", "外景", "外観", "全体"];
const REQUIRED_ROOMS = ["寝室", "リビング", "キッチン", "バスルーム", "外景"];

export function scorePhotos(input: PhotosInput): PhotosScore {
  const c = input.count;
  const b1_status: PhotosScore["b1_status"] =
    c < 5 ? "insufficient" : c < 10 ? "good" : c < 20 ? "adequate" : "rich";

  const cover = input.cover_category ?? "";
  const b2_cover_ok = GOOD_COVERS.some((k) => cover.includes(k));

  let hits = 0;
  const missing: string[] = [];
  for (const room of REQUIRED_ROOMS) {
    const categoryKey = Object.keys(input.categories).find((k) => k.includes(room.slice(0, 2)));
    if (categoryKey !== undefined && input.categories[categoryKey] > 0) {
      hits++;
    } else {
      missing.push(room);
    }
  }
  const b3_coverage = `${hits}/${REQUIRED_ROOMS.length}`;

  const b1 = c < 5 ? 30 : c < 10 ? 70 : c < 20 ? 90 : 100;
  const b2 = b2_cover_ok ? 100 : 60;
  const b3 = (hits / REQUIRED_ROOMS.length) * 100;
  const score = Math.round(b1 * 0.4 + b2 * 0.2 + b3 * 0.4);

  return { score, total: c, b1_status, b2_cover_ok, b3_coverage, b3_missing: missing };
}
