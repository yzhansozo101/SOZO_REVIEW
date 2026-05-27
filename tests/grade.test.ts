import { describe, it, expect } from "vitest";
import {
  scoreToGrade,
  gradeColors,
  pointsToNextGrade,
} from "@/lib/util/grade";

describe("scoreToGrade", () => {
  it("maps 90-100 to A", () => {
    expect(scoreToGrade(100)).toBe("A");
    expect(scoreToGrade(90)).toBe("A");
  });
  it("maps 75-89 to B", () => {
    expect(scoreToGrade(89)).toBe("B");
    expect(scoreToGrade(75)).toBe("B");
  });
  it("maps 60-74 to C", () => {
    expect(scoreToGrade(74)).toBe("C");
    expect(scoreToGrade(60)).toBe("C");
  });
  it("maps 0-59 to D", () => {
    expect(scoreToGrade(59)).toBe("D");
    expect(scoreToGrade(0)).toBe("D");
  });
});

describe("gradeColors", () => {
  it("returns CSS variable refs for each grade", () => {
    expect(gradeColors("A")).toEqual({
      fill: "var(--grade-a-fill)",
      ink: "var(--grade-a-ink)",
      base: "var(--grade-a)",
    });
    expect(gradeColors("D").base).toBe("var(--grade-d)");
  });
});

describe("pointsToNextGrade", () => {
  it("computes delta to next threshold", () => {
    expect(pointsToNextGrade(78)).toEqual({ atMax: false, points: 12, target: "A" });
    expect(pointsToNextGrade(72)).toEqual({ atMax: false, points: 3, target: "B" });
    expect(pointsToNextGrade(55)).toEqual({ atMax: false, points: 5, target: "C" });
  });
  it("returns atMax when already A", () => {
    expect(pointsToNextGrade(95)).toEqual({ atMax: true, points: 0, target: "A" });
  });
});
