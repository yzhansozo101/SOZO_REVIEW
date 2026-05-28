export type Grade = "A" | "B" | "C" | "D";

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

export type GradeColors = { fill: string; ink: string; base: string };

export function gradeColors(grade: Grade): GradeColors {
  const map: Record<Grade, GradeColors> = {
    A: { fill: "var(--grade-a-fill)", ink: "var(--grade-a-ink)", base: "var(--grade-a)" },
    B: { fill: "var(--grade-b-fill)", ink: "var(--grade-b-ink)", base: "var(--grade-b)" },
    C: { fill: "var(--grade-c-fill)", ink: "var(--grade-c-ink)", base: "var(--grade-c)" },
    D: { fill: "var(--grade-d-fill)", ink: "var(--grade-d-ink)", base: "var(--grade-d)" },
  };
  return map[grade];
}

export type NextGrade =
  | { atMax: true; points: 0; target: "A" }
  | { atMax: false; points: number; target: Exclude<Grade, "D"> };

export function pointsToNextGrade(score: number): NextGrade {
  if (score >= 90) return { atMax: true, points: 0, target: "A" };
  if (score >= 75) return { atMax: false, points: 90 - score, target: "A" };
  if (score >= 60) return { atMax: false, points: 75 - score, target: "B" };
  return { atMax: false, points: 60 - score, target: "C" };
}
