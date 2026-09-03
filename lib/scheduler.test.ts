import { describe, expect, it } from "vitest";
import { schedule } from "./scheduler";
const now = new Date("2026-09-03T12:00:00Z");
const base = { now, stepIndex: 0, intervalDays: 0, easeFactor: 2.5, lapseCount: 0, correctStreak: 0 };
describe("scheduler", () => {
  it("moves new cards through learning and graduation", () => {
    expect(schedule({ ...base, state: "NEW", rating: "AGAIN" }).dueAt).toBe("2026-09-03T12:01:00.000Z");
    expect(schedule({ ...base, state: "NEW", rating: "GOOD" }).stepIndex).toBe(1);
    expect(schedule({ ...base, state: "LEARNING", stepIndex: 1, rating: "GOOD" }).intervalDays).toBe(1);
    expect(schedule({ ...base, state: "NEW", rating: "EASY" }).intervalDays).toBe(4);
  });
  it("applies review intervals and lapse rules", () => {
    expect(schedule({ ...base, state: "REVIEW", intervalDays: 10, rating: "AGAIN" })).toMatchObject({ state: "RELEARNING", intervalDays: 2, lapseCount: 1, easeFactor: 2.3 });
    expect(schedule({ ...base, state: "REVIEW", intervalDays: 10, rating: "HARD" }).intervalDays).toBe(12);
    expect(schedule({ ...base, state: "REVIEW", intervalDays: 10, rating: "GOOD" }).intervalDays).toBe(25);
    expect(schedule({ ...base, state: "REVIEW", intervalDays: 10, rating: "EASY" }).intervalDays).toBe(33);
  });
  it("clamps ease and resolves relearning", () => {
    expect(schedule({ ...base, state: "REVIEW", intervalDays: 1, easeFactor: 1.3, rating: "AGAIN" }).easeFactor).toBe(1.3);
    expect(schedule({ ...base, state: "RELEARNING", intervalDays: 2, rating: "EASY" })).toMatchObject({ state: "REVIEW", intervalDays: 4 });
  });
});
