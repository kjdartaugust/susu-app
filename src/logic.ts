import { Circle, Currency, Frequency, Goal } from "./types";

export const FREQ_DAYS: Record<Frequency, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export const FREQ_LABEL: Record<Frequency, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

/** How many full cycles have elapsed since the circle started (0-based index
 *  of the *current* cycle). */
export function currentCycleIndex(circle: Circle): number {
  const start = new Date(circle.startDate).getTime();
  const now = Date.now();
  const days = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
  const per = FREQ_DAYS[circle.frequency];
  return Math.floor(days / per);
}

/** Whose turn it is to receive the pot this cycle. */
export function recipientForCycle(circle: Circle, cycleIndex: number) {
  if (circle.members.length === 0) return undefined;
  return circle.members[cycleIndex % circle.members.length];
}

export function potSize(circle: Circle): number {
  return circle.contribution * circle.members.length;
}

/** Total number of cycles until every member has received once. */
export function totalCycles(circle: Circle): number {
  return circle.members.length;
}

export function paidKey(cycleIndex: number, memberId: string): string {
  return `${cycleIndex}:${memberId}`;
}

export function membersPaidThisCycle(
  circle: Circle,
  cycleIndex: number
): number {
  return circle.members.filter((m) => circle.paid[paidKey(cycleIndex, m.id)])
    .length;
}

export function nextCycleDate(circle: Circle, cycleIndex: number): Date {
  const start = new Date(circle.startDate).getTime();
  const per = FREQ_DAYS[circle.frequency];
  return new Date(start + (cycleIndex + 1) * per * 24 * 60 * 60 * 1000);
}

export function goalSaved(goal: Goal): number {
  return goal.txns.reduce((s, t) => s + t.amount, 0);
}

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  GHS: "GH₵",
  USD: "$",
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  GHS: "Ghana Cedis",
  USD: "US Dollars",
};

/** Convert a base (GHS) amount into the chosen display currency. */
export function convert(
  amountGhs: number,
  display: Currency,
  usdRate: number
): number {
  return display === "USD" ? amountGhs / usdRate : amountGhs;
}

/** Convert an amount typed in the display currency back to base GHS. */
export function toBaseGhs(
  amount: number,
  display: Currency,
  usdRate: number
): number {
  return display === "USD" ? amount * usdRate : amount;
}

/** Format a base (GHS) amount in the chosen display currency. */
export function formatMoney(
  amountGhs: number,
  display: Currency = "GHS",
  usdRate = 1
): string {
  const v = convert(amountGhs, display, usdRate);
  const rounded = Math.round(v * 100) / 100;
  return `${CURRENCY_SYMBOL[display]}${rounded.toLocaleString(undefined, {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function relativeDue(date: Date): string {
  const d = daysUntil(date);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d}d`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
