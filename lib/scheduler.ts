import type { CardState, Rating, Scheduling } from "./domain";

export type ScheduleInput = Pick<Scheduling, "state" | "stepIndex" | "intervalDays" | "easeFactor" | "lapseCount" | "correctStreak"> & { now: Date; rating: Rating };
export type ScheduleResult = Pick<Scheduling, "state" | "dueAt" | "stepIndex" | "intervalDays" | "easeFactor" | "lapseCount" | "correctStreak">;

const minutes = (now: Date, amount: number) => new Date(now.getTime() + amount * 60_000).toISOString();
const days = (now: Date, amount: number) => new Date(now.getTime() + amount * 86_400_000).toISOString();
const clampEase = (n: number) => Math.max(1.3, Math.round(n * 100) / 100);
const success = (rating: Rating, streak: number) => rating === "AGAIN" ? 0 : streak + 1;

export function schedule(input: ScheduleInput): ScheduleResult {
  const { now, rating } = input;
  const base = { easeFactor: clampEase(input.easeFactor), lapseCount: input.lapseCount, correctStreak: success(rating, input.correctStreak) };
  if (input.state === "NEW" || input.state === "LEARNING") {
    if (rating === "AGAIN") return { ...base, state: "LEARNING", dueAt: minutes(now, 1), intervalDays: 0, stepIndex: 0, correctStreak: 0 };
    if (rating === "HARD") return { ...base, state: "LEARNING", dueAt: minutes(now, 6), intervalDays: 0, stepIndex: input.stepIndex };
    if (rating === "EASY") return { ...base, state: "REVIEW", dueAt: days(now, 4), intervalDays: 4, stepIndex: 0, easeFactor: clampEase(input.easeFactor + .15) };
    if (input.stepIndex === 0) return { ...base, state: "LEARNING", dueAt: minutes(now, 10), intervalDays: 0, stepIndex: 1 };
    return { ...base, state: "REVIEW", dueAt: days(now, 1), intervalDays: 1, stepIndex: 0 };
  }
  if (input.state === "REVIEW") {
    const old = Math.max(1, input.intervalDays);
    if (rating === "AGAIN") return { ...base, state: "RELEARNING", dueAt: minutes(now, 10), intervalDays: Math.max(1, Math.round(old * .2)), stepIndex: 0, easeFactor: clampEase(input.easeFactor - .2), lapseCount: input.lapseCount + 1, correctStreak: 0 };
    if (rating === "HARD") { const intervalDays = Math.max(old + 1, Math.round(old * 1.2)); return { ...base, state: "REVIEW", dueAt: days(now, intervalDays), intervalDays, stepIndex: 0, easeFactor: clampEase(input.easeFactor - .15) }; }
    const intervalDays = Math.max(old + 1, Math.round(old * input.easeFactor * (rating === "EASY" ? 1.3 : 1)));
    return { ...base, state: "REVIEW", dueAt: days(now, intervalDays), intervalDays, stepIndex: 0, easeFactor: rating === "EASY" ? clampEase(input.easeFactor + .15) : base.easeFactor };
  }
  if (rating === "AGAIN") return { ...base, state: "RELEARNING", dueAt: minutes(now, 10), intervalDays: input.intervalDays, stepIndex: 0, correctStreak: 0 };
  if (rating === "HARD") return { ...base, state: "RELEARNING", dueAt: minutes(now, 15), intervalDays: input.intervalDays, stepIndex: 0 };
  const intervalDays = rating === "EASY" ? Math.max(2, input.intervalDays * 2) : input.intervalDays;
  return { ...base, state: "REVIEW", dueAt: days(now, intervalDays), intervalDays, stepIndex: 0 };
}
